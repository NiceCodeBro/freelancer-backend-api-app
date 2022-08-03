class Exceptions {
   static InsufficentBalanceException = 'Insufficent balance';
   static BestProfessionCouldNotFoundException = 'Best profession could not found';
   static BestClientCouldNotFoundException = 'Best client could not found';
   static ClientDoesNotExistException = 'Client does not exist';
   static StartDateEndDateMismatchException = 'Start date must be earlier than end';
   static StartOrEndDateIsNotValidException = 'Start or enddate is not valid';
   static ThresholdExceedException = 'Threshold problem';
}
module.exports = {Exceptions}