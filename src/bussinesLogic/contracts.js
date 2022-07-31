
const {ContractAccess} = require('../dataLayer/contractAccess')

async function getContractBelogsToProfile(clientOrContractorId, profileId) {
  return await ContractAccess.getContractBelogsToProfile(clientOrContractorId, profileId);
}

module.exports = {getContractBelogsToProfile}