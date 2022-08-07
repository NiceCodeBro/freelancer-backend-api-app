
const { ProfileAccess } = require('../dataLayer/profileAccess');
const { Exceptions } = require('../exceptions');
const { isValidDate, isStartDateEarlierThanEndDate} = require('../common/util');

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

module.exports = {depositMoneyToClient, getBestProfession, getBestClients}