
const {JobAccess} = require('../dataLayer/jobAccess')

async function getUnpaidActiveJobs(clientOrContractorId) {
  return await JobAccess.getUnpaidActiveJobs(clientOrContractorId);
}

async function payForJob(jobId) {
  return await JobAccess.payForJob(jobId);
}

module.exports = {getUnpaidActiveJobs, payForJob}