var co = require('co');
var fs = require('fs');

var getFirstArg = require('./lib/getFirstArg');
var getRepoInfo = require('./lib/getRepoInfo');

var firstArg = getFirstArg(process.argv);
var args = process.argv.join(' ') + ' ';
var argsAfterFirst = args.substring(args.indexOf(firstArg));
var argObj = require('./lib/processArgs')();

/* 
 * Retrieve token if passed arg
 */
var token;
if (argObj.identity) {
  var identityContents = fs.readFileSync(argObj.identity, 'binary');
  if (identityContents) {
    token = identityContents;
  }
}

/*
 * Create a config object
 */
var repoExp = /([A-Za-z0-9\-]+\/[A-Za-z0-9\-]+)/;
if (repoExp.test(argsAfterFirst)) {
  var repoString = repoExp.exec(argsAfterFirst)[1];
  var repoArr = repoString.split('/');
  var config = {
    owner: repoArr[0],
    repo: repoArr[1]
  };
} else {
  try {
    var config = getRepoInfo(process.cwd());
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
config.token = token || process.env.GITHUB_TOKEN;
config.host = argObj.host ? argObj.host : null;

/*
 * Initialize the request processor.
 */
var req = require('./lib/req')(config);


if (firstArg === 'ls') { // List tickets
  if (argObj.help) {
    process.stdout.write(fs.readFileSync('./help/ls.txt','binary'));
    process.exit(0);
  } else {
    co(require('./ls')({
      req: req,
      options: {
        all: argObj.all
      }
    }))();
  }
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

// Exit if piping into a process that terminates.
process.stdout.on('error', function() {
  process.exit(1);
});
