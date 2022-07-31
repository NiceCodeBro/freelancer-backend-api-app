const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const {getContractBelogsToProfile, getAllContractsBelongsToProfile} = require('./bussinesLogic/contracts')
const {getUnpaidActiveJobs} = require('./bussinesLogic/jobs')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const { Op } = require('sequelize');

/**
 * Returns the contract only if it belongs to the profile calling
 * @returns contract by id
 */
 app.get('/contracts/:id', getProfile, async (req, res) => {
    const {id} = req.params;
    const profileId = req.profile.id;
    try {
        const contract = await getContractBelogsToProfile(profileId, id);
        if(!contract) return res.status(404).end();
        res.json(contract)
    } catch(error) {
        return res.status(500).end();
    }
})

/**
 * Returns a list of contracts belonging to a user (client or contractor) &  only contain non terminated contracts
 * @returns contracts by profile id
 */
app.get('/contracts', getProfile, async (req, res) =>{
    const profileId = req.profile.id;
    try {
        const contracts = await getAllContractsBelongsToProfile(profileId);
        if(!contracts) return res.status(404).end()
        res.json(contracts)
    } catch(error) {
        return res.status(500).end();
    }
})

/**
 * Get all unpaid jobs for a user (either a client or contractor), for active contracts only 
 * @returns unpaid jobs by profile id
 */
app.get('/jobs/unpaid', getProfile, async (req, res) =>{
  const profileId = req.profile.id;
  try {
    const unpaidJobs = await getUnpaidActiveJobs(profileId);
    if(!unpaidJobs) return res.status(404).end()
    res.json(unpaidJobs)
  } catch(error) {
    return res.status(500).end();
  }     
})

app.post('/jobs/:job_id/pay', getProfile, async (req, res) =>{
    const {Job, Contract, Profile} = req.app.get('models')
    const {job_id} = req.params;

    try {
        const t = await sequelize.transaction(async(t) => {
            const job = await Job.findByPk(job_id,
                                        {include: [{ model: Contract, required: true, attributes: ['ContractorId', 'ClientId']}]}, 
                                        {lock: true, transaction: t})

                const decResult = await Profile.decrement('balance',
                                {
                                    by: job.price,
                                    where: {
                                        id: job.Contract.ClientId,
                                        balance: { [Op.gte]: job.price }
                                    },
                                    transaction: t,
                                });
                  if (decResult && decResult[0][1] === 0) { 
                    // it is ok, but unsufficent balance
                    console.log(' it is ok, but unsufficent balance');
                    return res.status(505).end()

                    throw Error('unsufficent balance')
                  }
                  if (decResult && decResult[0][1] === 1) {
                    // it is ok, and increment can be done
                    console.log('it is ok, and increment can be done')
                    const incResult = await Profile.increment('balance',
                                        {
                                            by: job.price,
                                            where: { id: job.Contract.ContractorId},
                                            transaction: t
                                        });
                  }
                  

        })
      } catch (error) {
        console.log('--->',error)
        return res.status(404).end()
    
      }
      res.json({message: 'money is transfered'})

})



app.post('/balances/deposit/:userId', getProfile, async (req, res) =>{
    const {Job, Contract, Profile} = req.app.get('models')
    const {userId} = req.params;
    const { amount } = req.body;

    // amount check if number/float
    try {

        const t = await sequelize.transaction(async(t) => {
            const client = await Profile.findOne({where: {
                id: userId,
                type: 'client'
              }}, {lock: true, transaction: t})
              
            if (!client ) {
                console.log('Client does not exist')
                return res.status(404).end()
            }  
            const jobSum =  await Job.sum('price', {
                where: {
                    paid: {
                        [Op.not]: true
                    }
                },
                include: [
                  {
                    model: Contract,
                    required: true,
                    attributes: [],
                    where: {
                        status: {
                            [Op.not]: 'terminated'
                        }, 
                      ClientId: userId,
                    },
                  },
                ],
              }, {lock: true, transaction: t});

              if (jobSum &&  parseFloat(amount) <= jobSum * 0.25 ) { //ok
                client.balance = (parseFloat(amount) + parseFloat(client.balance)).toFixed(2);
                await client.save ({ transaction: t})
              }
              else /* (!jobSum) */{
                //no
                console.log('Amount is too much')
                return res.status(404).end()
              }            
          })
          res.json({message: 'money is transfered'})
      } catch (error) {
        return res.status(404).end()
    
      }

})

app.get('/admin/best-profession', getProfile ,async (req, res) =>{
    const {Contract, Job, Profile} = req.app.get('models')
    const startedDate = req.query.start; //new Date("2020-08-15T19:12:26.737Z");
    const endDate = req.query.end; //  new Date("2020-08-30T23:11:26.737Z");

    try {
        const bestProfessions = await Job.findAll({
            group: "Contract.Contractor.profession",
            attributes: ['Contract.Contractor.profession', [sequelize.fn('sum', sequelize.col('price')), 'total'], 'paymentDate'],
            order: [[sequelize.literal('total'), 'DESC']],
            where: { paid: true, paymentDate: {
                [Op.between] : [startedDate , endDate ]
            } },
            include: [{
              model: Contract,
              required: true,
              where: {},
              attributes: { exclude: ['id', 'terms', 'status', 'createdAt', 'updatedAt', 'ClientId']},
              include: [{
                model: Profile,
                as: 'Contractor',
                required: true,
                attributes: ['profession']
              }]
            }]
          })
          console.log(JSON.stringify(bestProfessions, null, 2))
        if (bestProfessions && bestProfessions.length > 0) {
            res.json({'best-profession': bestProfessions[0].Contract.Contractor.profession})
        }
        return res.status(404).end()
    }catch(error) {
        console.log('Error', error)
        return res.status(404).end()
    }
})

app.get('/admin/best-clients', getProfile ,async (req, res) =>{
    const {Contract, Job, Profile} = req.app.get('models')
    const startedDate = req.query.start; //new Date("2020-08-15T19:12:26.737Z");
    const endDate = req.query.end; //  new Date("2020-08-30T23:11:26.737Z");
    const limit = req.query.limit || 2
    try {
        const bestClients = await Job.findAll({
            group: "Contract.Client.id",
            limit,
            attributes: [[sequelize.fn('sum', sequelize.col('price')), 'total']],
            order: [[sequelize.literal('total'), 'DESC']],
            where: { paid: true, paymentDate: {
                [Op.between] : [startedDate , endDate]
            } },
            include: [{
              model: Contract,
              required: true,
              where: {},
              attributes: { exclude: ['id', 'terms', 'status', 'createdAt', 'updatedAt', 'ClientId']},
              include: [{
                model: Profile,
                as: 'Client',
                required: true,
                attributes: ['firstName', 'lastName', 'id']
              }]
            }]
          })
          let result;
          if (bestClients && bestClients.length > 0) {
            result = bestClients.map((client) => {
                return {
                    id: client.Contract.Client.id,
                    fullName: client.Contract.Client.firstName + ' ' + client.Contract.Client.lastName,
                    paid: client.dataValues.total
                }
            })
          }
        if (bestClients && bestClients.length > 0) {
            res.json(result)
        }
        return res.status(404).end()
    }catch(error) {
        console.log('Error', error)
        return res.status(404).end()
    }
})

module.exports = app;
