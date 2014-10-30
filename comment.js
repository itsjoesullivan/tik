var program = require('commander');
var fs = require('fs');
var path = require('path');
var charm = require('charm')(process.stdout);
var moment = require('moment');
var co = require('co');

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
var req = require('./lib/req')(config);

var tmp = require('tmp');

if (argsAfterComment[0]) {
  var comment = argsAfterComment[0];
  co(function *(){
    try {
      yield req("POST", "/issues/" + ticketNumber + "/comments", {
        body: comment
      });
    } catch(err) {
      return handleError(err);
    }
    console.log("Comment added to #" + ticketNumber);
  })();
} else {
  tmp.tmpName({ template: '/tmp/tmp-XXXXXX' }, function(err, fpath) {
    var editor = require('child_process').spawn('vi', [ fpath ], { stdio: 'inherit' });
    editor.on('exit', function(code) {
      comment = fs.readFileSync(fpath, 'binary');
      co(function *(){
        try {
          yield req("POST", "/issues/" + ticketNumber + "/comments", {
            body: comment
          });
        } catch(err) {
          return handleError(err);
        }
        console.log("Comment added to #" + ticketNumber);
      })();
    });
  });
}
