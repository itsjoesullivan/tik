var program = require('commander');
var Req = require('./lib/req');
var fs = require('fs');
var path = require('path');
var charm = require('charm')(process.stdout);
var moment = require('moment');

var handleError = require('./lib/handleError');

var args = process.argv.filter(function(arg) { return arg !== 'plumbing'; });

program.version(require('./package').version)
  .option('-i, --identity [path]', 'Auth token (See: https://github.com/settings/tokens/new)')
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

/*
 * Initialize the request processor.
 */
var req = Req(config);

if (args.indexOf('ticket-numbers') > -1) {
  var issuesPath = '/issues?';
  if (program.all) issuesPath += 'state=all&';
  req("GET", issuesPath, function(err, tickets) {
    if (err) return handleError(err);
    tickets.forEach(function(ticket) {
      process.stdout.write('' + ticket.number);
      process.stdout.write('\n');
    });
  });
}

