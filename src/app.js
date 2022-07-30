const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const { Op } = require('sequelize');

/**
 * FIX ME!
 * @returns contract by id
 */
 app.get('/contracts/:id',getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    const {id} = req.params;
    const userId = req.profile.id;
    const contract = await Contract.findOne({where: {
        id,
        [Op.or]: [
          {
            ClientId: userId,
          },
          {
            ContractorId: userId,
          },
        ],
      }})
    if(!contract) return res.status(404).end()
    res.json(contract)
})

app.get('/contracts', getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    const userId = req.profile.id;
    const contract = await Contract.findAll({where: {
        [Op.or]: [
          {
            ClientId: userId,
          },
          {
            ContractorId: userId,
          },
        ],
        status: { [Op.ne]: 'terminated' },
      }});
    if(!contract) return res.status(404).end()
    res.json(contract)
})

app.get('/jobs/unpaid', getProfile ,async (req, res) =>{
    const {Job, Contract} = req.app.get('models')
    const userId = req.profile.id;

    const jobs = await Job.findAll({where: {
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
                [Op.or]: [
                    {ClientId: userId},
                    {ContractorId: userId}
                ],
                status: 'in_progress',
            },
        },
        ]});

    if(!jobs) return res.status(404).end()
    res.json(jobs)
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



module.exports = app;
