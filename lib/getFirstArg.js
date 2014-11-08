/* Determine the first argument after `tik`, or
 * `node index`, which will indicate the sub-command
 * to execute.
 *
 * @param {string} args
 * @returns {string}
 */
module.exports = function getFirstArg(args) {
  var index;
  var found = false;
  args.some(function(arg, i) {
    if (!found && arg.match(/tik|index/)) {
      found = true;
      index = i;
    }
  });
  return args[index+1];
}
