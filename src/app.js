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



module.exports = app;
