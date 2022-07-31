
const { profileFKs, Contract } = require('../model');
const { Op } = require('sequelize');

class ContractAccess {
  static async getContractBelogsToProfile(clientOrContractorId, profileId) {
    const where = {
      id: profileId,
      [Op.or]: [ { [profileFKs.CLIENT]: clientOrContractorId }, { [profileFKs.CONTRACTOR]: clientOrContractorId } ]
    };
    const contract = await Contract.findOne({where})
    return contract;
  }
}


module.exports = {ContractAccess}