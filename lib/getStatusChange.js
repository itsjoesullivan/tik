/*
 * Retrieve a status change, if one is available
 *
 * @param {Array} args
 * @returns {String}
 *
 */
module.exports = function getStatusChange(args) {
  for(var i = 1; i < args.length; i++) {
    var arg = args[i];
    if ( (arg === 'open' || arg === 'close') && args[i-1].indexOf('-') !== 0) {
      return arg;
    }
  }
}
