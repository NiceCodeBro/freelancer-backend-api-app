
const { Profile } = require('../model');
const { Op } = require('sequelize');

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
}


module.exports = {ProfileAccess}