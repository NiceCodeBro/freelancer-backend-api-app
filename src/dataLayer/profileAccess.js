
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
    const client =  await Profile.findOne({where}, {lock: true, transaction: transactionObject});
    if (!client) throw Error(Exceptions.ClientDoesNotExistException);
    return client;
  }

  static async updateClientBalance(client, amount, transactionObject) {
    client.balance = (parseFloat(amount) + parseFloat(client.balance)).toFixed(2);
    await client.save({ transaction: transactionObject});
  } 

  static async depositMoneyToClient(clientId, amount) {
    await sequelize.transaction(async(t) => {
      const client = await ProfileAccess.getClientById(clientId, t); // if does not exist, throws exception
      await ProfileAccess.checkIfJobSumUnderThreshold(clientId, amount, t); // if not throws exception
      await ProfileAccess.updateClientBalance(client, amount, t);
    })
  }

 static async checkIfJobSumUnderThreshold(cliendId,amount,  transactionObject) {
    const { JobAccess } = require('./jobAccess')
    const jobSum = await JobAccess.getTotalPriceForUnpaidJobs(cliendId, transactionObject);
    if (!jobSum || !ProfileAccess.isAmountUnderTheThreshold(amount, jobSum)) throw Error(Exceptions.ThresholdExceedException);
  } 

  static isAmountUnderTheThreshold(amount, jobSum) {
    const treshold = 0.25;
    return parseFloat(amount) <= jobSum * treshold;
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