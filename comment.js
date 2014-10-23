var program = require('commander');
var Req = require('./lib/req');
var fs = require('fs');
var path = require('path');
var charm = require('charm')(process.stdout);
var moment = require('moment');

var handleError = require('./lib/handleError');
var getTicketNumber = require('./lib/getTicketNumber');
var getStatusChange = require('./lib/getStatusChange');
var describeTicket = require('./lib/describeTicket');
var hasLabel = require('./lib/hasLabel');

var argsAfterComment = (function() {
  var commentIndex = process.argv.indexOf("comment");
  return process.argv.slice(commentIndex + 1);
}());

program.version(require('./package').version)
  .option('-i, --identity [path]', 'Auth token (See: https://github.com/settings/tokens/new)')
  .option('-v, --verbose', 'More')
  .parse(argsAfterComment);


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

var ticketNumber = getTicketNumber(process.argv);

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

if (argsAfterComment[0]) {
  var comment = argsAfterComment[0];
  var postComment = function(message) {
    req("POST", "/issues/" + ticketNumber + "/comments", {
      body: message
    }, function(err, val) {
      if (err) return handleError(err);
      console.log("Comment added to #" + ticketNumber);
    });
  };
  postComment(comment);
}
