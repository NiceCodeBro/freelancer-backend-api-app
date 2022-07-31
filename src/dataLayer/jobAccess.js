
const { profileFKs, Job, Contract, contractStatus } = require('../model');
const { Op } = require('sequelize');

class JobAccess {
  static async getUnpaidActiveJobs(clientOrContractorId) {
    const where = { paid: { [Op.not]: true } };
    const whereContract = {
      [Op.or]: [ {[profileFKs.CLIENT]: clientOrContractorId}, {[profileFKs.CONTRACTOR]: clientOrContractorId}],
      status: contractStatus.IN_PROGRESS,
    };
    const include = [{ model: Contract, required: true, attributes: [], where: whereContract}];
    return await Job.findAll({where, include });
  }
}


module.exports = {JobAccess}