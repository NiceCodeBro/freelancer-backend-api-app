
function isStartDateEarlierThanEndDate(startedDate, endDate) {
  return new Date(startedDate) <= new Date(endDate);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}


module.exports = { isStartDateEarlierThanEndDate, isValidDate }