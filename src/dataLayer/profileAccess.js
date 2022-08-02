
const { Profile } = require('../model');
const { Op } = require('sequelize');
const {sequelize} = require('../model')

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
    const where = { id: profileId,type: 'client'};
    return await Profile.findOne({where}, {lock: true, transaction: transactionObject});
  }

  static async updateClientBalance(client, amount, transactionObject) {
    const { calculateNewBalance } = require('../bussinesLogic/profiles'); 
    client.balance = calculateNewBalance(amount, client.balance);
    await client.save({ transaction: transactionObject});
  } 

  static async depositMoneyToClient(cliendId, amount) {
    const {JobAccess} = require('./jobAccess')
    const { isAmountUnderTheThreshold } = require('../bussinesLogic/profiles'); 

    await sequelize.transaction(async(t) => {
      const client = await ProfileAccess.getClientById(cliendId, t);
      if (!client ) throw Error('Client does not exist');

      const jobSum = await JobAccess.getTotalPriceForUnpaidJobs(cliendId,t);
      if (!jobSum || !isAmountUnderTheThreshold(amount, jobSum)) throw Error('Threshold problem');
      else await ProfileAccess.updateClientBalance(client, amount, t);
    })
  }
}

module.exports = {ProfileAccess}