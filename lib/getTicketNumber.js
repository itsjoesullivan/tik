/*
 * Retrieve a ticket number from an argv, if one is present
 *
 * @param {Array} args
 * @returns {String}
 *
 */
module.exports = function getTicketNumber(args) {
  for(var i = 1; i < args.length; i++) {
    var arg = args[i];
    if ('' + parseInt(arg) === arg && args[i-1].indexOf('-') !== 0) {
      return arg;
    }
  }
}
