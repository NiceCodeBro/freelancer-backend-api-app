
const { Profile, Job, Contract, profileTypes, sequelize } = require('../model');
const { Op } = require('sequelize');
const { Exceptions } = require('../exceptions');

class ProfileAccess {
  static async decrementBalance(amount, clientId, transactionObject) {
    const where = { id: clientId, balance: { [Op.gte]: amount}};
    const decResult = await Profile.decrement('balance', { by: amount, where, transaction: transactionObject });
    if (decResult && decResult[0][1] === 1) return true;
    return false;
  }

  static async incrementBalance(amount, contractorId, transactionObject) {
    const where = { id: contractorId};
    const incResult = await Profile.increment('balance', { by: amount, where, transaction: transactionObject });
    if (incResult && incResult[0][1] === 1) return true;
    return false;
  }

  static async getClientById(profileId, transactionObject) {
    const where = { id: profileId, type: 'client'};
    return await Profile.findOne({where}, {lock: true, transaction: transactionObject});
  }

  static async updateClientBalance(client, amount, transactionObject) {
    const { calculateNewBalance } = require('../bussinesLogic/profiles'); 
    client.balance = calculateNewBalance(amount, client.balance);
    await client.save({ transaction: transactionObject});
  } 

  static async depositMoneyToClient(cliendId, amount) {
    const { JobAccess } = require('./jobAccess')
    const { isAmountUnderTheThreshold } = require('../bussinesLogic/profiles'); 

    await sequelize.transaction(async(t) => {
      const client = await ProfileAccess.getClientById(cliendId, t);
      if (!client) throw Error(Exceptions.ClientDoesNotExistException);

      const jobSum = await JobAccess.getTotalPriceForUnpaidJobs(cliendId,t);
      if (!jobSum || !isAmountUnderTheThreshold(amount, jobSum)) throw Error(Exceptions.ThresholdExceedException);
      else await ProfileAccess.updateClientBalance(client, amount, t);
    })
  }

  static async getBestProfession(startedDate, endDate) {
    const group =  "Contract.Contractor.profession";
    const attributes = [[sequelize.fn('sum', sequelize.col('price')), 'total'], 'paymentDate'];
    const where = { paid: true, paymentDate: { [Op.between] : [startedDate , endDate ]} };
    const order = [[sequelize.literal('total'), 'DESC']];
    const includeContract = [{ model: Profile, as: profileTypes.CONTRACTOR, required: true}]
    const include = [{model: Contract, required: true, where: {}, include: includeContract}];

    const bestProfessions = await Job.findAll({ group, attributes, order, where, include });
    if (bestProfessions && bestProfessions.length > 0) return bestProfessions[0].Contract.Contractor.profession;
    throw Error(Exceptions.BestProfessionCouldNotFoundException)
  }

  static async getBestClients(startedDate, endDate, limit) {
    const group = "Contract.Client.id";
    const attributes =  [[sequelize.fn('sum', sequelize.col('price')), 'total']];
    const order = [[sequelize.literal('total'), 'DESC']];
    const where = { paid: true, paymentDate: { [Op.between] : [startedDate , endDate]} }; 
    const contractInclude = [{ model: Profile, as: profileTypes.CLIENT, required: true}];
    const include = [{ model: Contract, required: true, include: contractInclude}]
    const bestClients =  await Job.findAll({ group, limit: limit | 2, attributes, order, where, include });

    if (!bestClients) throw Error(Exceptions.BestClientCouldNotFoundException);
    return bestClients.map((client) => ({
      id: client.Contract.Client.id,
      fullName: client.Contract.Client.firstName + ' ' + client.Contract.Client.lastName,
      paid: client.dataValues.total
    }))
  }
}

module.exports = {ProfileAccess}