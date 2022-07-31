
const {ContractAccess} = require('../dataLayer/contractAccess')

async function getContractBelogsToProfile(clientOrContractorId, contractId) {
  return await ContractAccess.getContractBelogsToProfile(clientOrContractorId, contractId);
}

module.exports = {getContractBelogsToProfile}