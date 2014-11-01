var getFirstArg = require('./lib/getFirstArg');
var co = require('co');

var firstArg = getFirstArg(process.argv);

var program = require('commander');

if (firstArg === 'ls') { // List tickets

  var args = process.argv.filter(function(arg) { return arg !== 'ls'; });

  program.version(require('./package').version)
    .option('-a, --all', 'Include closed issues')
    .option('-i, --identity [path]', 'Auth token (See: https://github.com/settings/tokens/new)')
    .option('-h, --host [host]', 'Host')
    .option('-v, --verbose', 'More')
    .parse(args);
  /* 
   * Retrieve token if passed arg
   */
  var token;
  if (program.identity) {
    var identityContents = fs.readFileSync(program.identity, 'binary');
    if (identityContents) {
      token = identityContents;
    }
  }

  var getRepoInfo = require('./lib/getRepoInfo');
  /*
   * Create a config object
   */
  var config = getRepoInfo(process.cwd());
  config.token = token || process.env.GITHUB_TOKEN;
  config.host = program.host ? program.host : null;

  /*
   * Initialize the request processor.
   */
  var req = require('./lib/req')(config);

  co(require('./ls')({
    program: program,
    req: req
  }))();

} else if ('' + parseInt(firstArg) === firstArg) {
  require('./ticket');
} else if (firstArg === 'plumbing') {
  require('./plumbing');
} else if (process.argv.indexOf('--in') > -1) {
  var readline = require('readline');
  var rl = readline.createInterface({
    input: process.stdin,
    output: {}
  });
  rl.on('line', function(cmd) { console.log('' + cmd); });
} else {
  console.log("usage: tik ls [options]");
  console.log("       tik {ticket} [options]");
  console.log("       tik {ticket} comment {comment}");
}
