
const {JobAccess} = require('../dataLayer/jobAccess')

async function getUnpaidActiveJobs(clientOrContractorId) {
  return await JobAccess.getUnpaidActiveJobs(clientOrContractorId);
}


module.exports = {getUnpaidActiveJobs}