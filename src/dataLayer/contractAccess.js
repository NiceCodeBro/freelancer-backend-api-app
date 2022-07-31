
const { profileFKs, Contract, contractStatus } = require('../model');
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

  static async getAllContractsBelongsToProfile(clientOrContractorId) {
    const where = {
      [Op.or]: [ { [profileFKs.CLIENT]: clientOrContractorId },{ [profileFKs.CONTRACTOR]: clientOrContractorId }],
      status: { [Op.ne]: contractStatus.TERMINATED },
    }
    const attributes =  { exclude: ['createdAt', 'updatedAt']};

    const contract = await Contract.findAll({where, attributes});
    return contract;
  }
}


module.exports = {ContractAccess}