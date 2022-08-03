
const { profileFKs, Job, Contract, contractStatus } = require('../model');
const { Op } = require('sequelize');
const {sequelize} = require('../model')
const {Exceptions} = require('../exceptions')
const {ProfileAccess} = require('./profileAccess')

class JobAccess {
  static async getUnpaidActiveJobs(clientOrContractorId) {
    const where = { paid: { [Op.not]: true } };
    const whereContract = {
      [Op.or]: [ {[profileFKs.CLIENT]: clientOrContractorId}, {[profileFKs.CONTRACTOR]: clientOrContractorId}],
      status: contractStatus.IN_PROGRESS,
    };
    const include = [{ model: Contract, required: true, attributes: [], where: whereContract}];
    const attributes =  { exclude: ['createdAt', 'updatedAt']};

    return await Job.findAll({where, include, attributes });
  }

  static async payForJob(jobId) {
    await sequelize.transaction(async(t) => {
      const job = await JobAccess.getUnpaidJob(jobId, t);
      const decResult = await ProfileAccess.decrementBalance(job.price, job.Contract.ClientId, t);
      if (decResult) { // it is ok, and increment can be done
        await ProfileAccess.incrementBalance(job.price, job.Contract.ContractorId, t)
      } else {
        throw Error(Exceptions.InsufficentBalanceException)
      }
    })
  }
  static async getTotalPriceForUnpaidJobs(clientId, transactionObject) {
    const where =  { paid: { [Op.not]: true } };
    const whereContract = {status: { [Op.not]: contractStatus.TERMINATED}, [profileFKs.CLIENT]: clientId};
    const include = [{ model: Contract, required: true, attributes: [], where: whereContract }];
    return await Job.sum('price', {where, include }, {lock: true, transaction: transactionObject});
  }

  static async getUnpaidJob(jobId, transactionObject) {
    const contractAttributes = [profileFKs.CONTRACTOR, profileFKs.CLIENT];
    const include = [{ model: Contract, required: true, attributes: contractAttributes}];
    const transaction = {lock: true, transaction: transactionObject};
    return await Job.findByPk(jobId, {include}, transaction)
  }
}


module.exports = {JobAccess}