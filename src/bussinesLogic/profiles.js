
const {ProfileAccess} = require('../dataLayer/profileAccess')

async function depositMoneyToClient(cliendId, amount) {
  await ProfileAccess.depositMoneyToClient(cliendId, amount);
}

function isAmountUnderTheThreshold(amount, jobSum) {
  return parseFloat(amount) <= jobSum * 0.25
}

function calculateNewBalance(amount, balance) {
return (parseFloat(amount) + parseFloat(balance)).toFixed(2);
}

module.exports = {depositMoneyToClient, isAmountUnderTheThreshold, calculateNewBalance}