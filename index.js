var co = require('co');
var fs = require('fs');
var program = require('commander');

var getFirstArg = require('./lib/getFirstArg');
var getRepoInfo = require('./lib/getRepoInfo');

var firstArg = getFirstArg(process.argv);


var args = process.argv.join(' ') + ' ';

var identityExp = /(?:-i |--identity )(\S+)(?:\s)/;
if (identityExp.test(args)) {
  var identity = identityExp.exec(args)[1];
}

var hostExp = /(?:-h |--host )(\S+)(?:\s)/;
if (hostExp.test(args)) {
  var host = hostExp.exec(args)[1];
}

var allExp = /-a |--all/;
if (allExp.test(args)) {
  var all = true;
}

/* 
 * Retrieve token if passed arg
 */
var token;
if (identity) {
  var identityContents = fs.readFileSync(identity, 'binary');
  if (identityContents) {
    token = identityContents;
  }
}

/*
 * Create a config object
 */
var config = getRepoInfo(process.cwd());
config.token = token || process.env.GITHUB_TOKEN;
config.host = host ? host : null;

/*
 * Initialize the request processor.
 */
var req = require('./lib/req')(config);


if (firstArg === 'ls') { // List tickets
  co(require('./ls')({
    program: program,
    req: req,
    options: {
      all: all
    }
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
