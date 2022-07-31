
const {ContractAccess} = require('../dataLayer/contractAccess')

async function getContractBelogsToProfile(clientOrContractorId, contractId) {
  return await ContractAccess.getContractBelogsToProfile(clientOrContractorId, contractId);
}


async function getAllContractsBelongsToProfile(clientOrContractorId) {
  return await ContractAccess.getAllContractsBelongsToProfile(clientOrContractorId);
}
module.exports = {getContractBelogsToProfile, getAllContractsBelongsToProfile}