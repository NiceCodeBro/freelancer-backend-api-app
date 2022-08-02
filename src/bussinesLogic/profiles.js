
const {ProfileAccess} = require('../dataLayer/profileAccess')

async function depositMoneyToClient(cliendId, amount) {
  await ProfileAccess.depositMoneyToClient(cliendId, amount);
}

function isAmountUnderTheThreshold(amount, jobSum) {
  return parseFloat(amount) <= jobSum * 0.25;
}

function calculateNewBalance(amount, balance) {
  return (parseFloat(amount) + parseFloat(balance)).toFixed(2);
}

async function getBestProfession(startedDate, endDate) {
  if (!isValidDate(new Date(startedDate)) || !isValidDate(new Date(endDate))) {
    throw Error('Start or enddate is not valid');
  }
  if (!isStartDateEarlierThanEndDate(startedDate, endDate)) {
    throw Error('Start date must be earlier than end');
  }
  return await ProfileAccess.getBestProfession(startedDate, endDate);
}

function isStartDateEarlierThanEndDate(startedDate, endDate) {
  return new Date(startedDate) <= new Date(endDate);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

module.exports = {depositMoneyToClient, isAmountUnderTheThreshold, calculateNewBalance, getBestProfession}