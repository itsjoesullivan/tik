var program = require('commander');
var fs = require('fs');
var path = require('path');
var charm = require('charm')(process.stdout);
var moment = require('moment');
var co = require('co');
var thunkify = require('thunkify');

var handleError = require('./lib/handleError');

var args = process.argv.filter(function(arg) { return arg !== 'ls'; });

program.version(require('./package').version)
  .option('-a, --all', 'Include closed issues')
  .option('-i, --identity [path]', 'Auth token (See: https://github.com/settings/tokens/new)')
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

/*
 * Initialize the request processor.
 */
var req = require('./lib/req')(config);

var hex2rgb = require('./lib/hex2rgb');

var issuesPath = '/issues?';
if (program.all) issuesPath += 'state=all&';


co(function *(){
  try {
    tickets = yield req("GET", issuesPath);
  } catch(err) {
    handleError(err);
  }
  tickets.forEach(function(ticket) {
    process.stdout.write('#' + ticket.number + ': ' + ticket.title + ' - ' + ticket.user.login);
    ticket.labels.forEach(function(label) {
      var labelColor = hex2rgb(label.color).map(function(val) { return val * 0.2; });
      process.stdout.write(' ');
      charm.foreground(labelColor[0], labelColor[1], labelColor[2]).write(label.name);
      charm.foreground(255, 255, 255);
    });
    process.stdout.write('\n');
  });
})();
