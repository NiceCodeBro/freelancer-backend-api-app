const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const { getContractBelogsToProfile, getAllContractsBelongsToProfile } = require('./bussinesLogic/contracts')
const { getUnpaidActiveJobs, payForJob } = require('./bussinesLogic/jobs')
const { depositMoneyToClient, getBestProfession, getBestClients } = require('./bussinesLogic/profiles')
const { Exceptions } = require('./exceptions')

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

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

/**
 * Pay for a job, a client can only pay if his balance >= the amount to pay. 
 * The amount should be moved from the client's balance to the contractor balance.
 */
app.post('/jobs/:job_id/pay', getProfile, async (req, res) =>{
    const {job_id} = req.params;
    // check for job id, if not exist return 404
    try {
        await payForJob(job_id);
        res.status(200).end();
      } catch (error) {
        if (error.message === Exceptions.InsufficentBalanceException) return res.status(422).end(); //Unprocessable Entity
        return res.status(500).end();
    }
})


/**
 *  Deposits money into the the the balance of a client, a client can't deposit 
 * more than 25% his total of jobs to pay. (at the deposit moment)
 */
app.post('/balances/deposit/:userId', getProfile, async (req, res) =>{
    const {userId} = req.params;
    const {amount} = req.body;
    try {
      await depositMoneyToClient(userId, amount);
      res.status(200).end();
    } catch (error) {
      if (error.message === Exceptions.ClientDoesNotExistException) return res.status(404).end();
      else if (error.message === Exceptions.ThresholdExceedException) return res.status(422).end();
      else return res.status(404).end();
    }
})

/**
 *  Returns the profession that earned the most money (sum of jobs paid) 
 *  for any contactor that worked in the query time range.
 */
app.get('/admin/best-profession', getProfile ,async (req, res) =>{
    const startedDate = req.query.start; 
    const endDate = req.query.end;
    try {
      const bestProfession = await getBestProfession(startedDate, endDate);
      res.json({'best-profession': bestProfession});
    }catch(error) {
      if (error.message === Exceptions.StartDateEndDateMismatchException || 
          error.message === Exceptions.StartOrEndDateIsNotValidException) 
          return res.status(400).end();
      return res.status(404).end()
    }
})


/**
 *  returns the clients the paid the most for jobs in the query time period. 
 *   limit query parameter should be applied, default limit is 2.
 */
app.get('/admin/best-clients', getProfile ,async (req, res) =>{
    const startedDate = req.query.start; 
    const endDate = req.query.end;
    const limit = req.query.limit || 2
    try {
        const bestClients = await getBestClients(startedDate, endDate, limit); 
        res.json(bestClients)
    }catch(error) {
      if (error.message === Exceptions.StartDateEndDateMismatchException || 
          error.message === Exceptions.StartOrEndDateIsNotValidException) 
          return res.status(400).end();
      return res.status(404).end()
    }
})

module.exports = app;
