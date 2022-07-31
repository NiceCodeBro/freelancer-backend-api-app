
const { profileFKs, Contract } = require('../model');
const { Op } = require('sequelize');

class ContractAccess {
  static async getContractBelogsToProfile(clientOrContractorId, contractId) {
    const where = {
      id: contractId,
      [Op.or]: [ { [profileFKs.CLIENT]: clientOrContractorId }, { [profileFKs.CONTRACTOR]: clientOrContractorId } ]
    };
    const attributes =  { exclude: ['createdAt', 'updatedAt']};

    const contract = await Contract.findOne({where, attributes})
    return contract.dataValues;
  }
}


module.exports = {ContractAccess}