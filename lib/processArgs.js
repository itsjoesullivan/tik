module.exports = function processArgs() {
  var args = process.argv.join(' ') + ' ';
  var processedArgs = {};
  var identityExp = /(?:-i |--identity )(\S+)(?:\s)/;
  if (identityExp.test(args)) {
    processedArgs.identity = identityExp.exec(args)[1];
  }

  var hostExp = /(?:-h |--host )(\S+)(?:\s)/;
  if (hostExp.test(args)) {
    processedArgs.host = hostExp.exec(args)[1];
  }

  var allExp = /-a |--all/;
  if (allExp.test(args)) {
    processedArgs.all = true;
  }
  var helpExp = /--help/;
  if (helpExp.test(args)) {
    processedArgs.help = true;
  }
  return processedArgs;
}
