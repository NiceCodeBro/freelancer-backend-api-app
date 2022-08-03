
const { ProfileAccess } = require('../dataLayer/profileAccess');
const { Exceptions } = require('../exceptions');

async function depositMoneyToClient(cliendId, amount) {
  await ProfileAccess.depositMoneyToClient(cliendId, amount);
}

async function getBestProfession(startedDate, endDate) {
  checkStartAndEndDate(startedDate, endDate);
  return await ProfileAccess.getBestProfession(startedDate, endDate);
}

function checkStartAndEndDate(startedDate, endDate) {
  if (!isValidDate(new Date(startedDate)) || !isValidDate(new Date(endDate))) 
    throw Error(Exceptions.StartOrEndDateIsNotValidException);
  if (!isStartDateEarlierThanEndDate(startedDate, endDate)) 
    throw Error(Exceptions.StartDateEndDateMismatchException);
}

async function getBestClients(startedDate, endDate, limit) {
  checkStartAndEndDate(startedDate, endDate);
  return await ProfileAccess.getBestClients(startedDate, endDate, limit);
}

function isStartDateEarlierThanEndDate(startedDate, endDate) {
  return new Date(startedDate) <= new Date(endDate);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function isAmountUnderTheThreshold(amount, jobSum) {
  return parseFloat(amount) <= jobSum * 0.25;
}

function calculateNewBalance(amount, balance) {
  return (parseFloat(amount) + parseFloat(balance)).toFixed(2);
}

module.exports = {depositMoneyToClient, isAmountUnderTheThreshold, 
  calculateNewBalance, getBestProfession, getBestClients}