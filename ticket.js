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

function argAfterTicket(args) {
  var ticketIndex;
  args.some(function(arg, i) {
    if ('' + parseInt(arg) === arg) {
      ticketIndex = i;
      return true;
    }
  });
  return args[ticketIndex+1];
}

switch (argAfterTicket(process.argv)) {
  case "comment":
    require('./comment');
    break;
  default: 
    program.version(require('./package').version)
      .option('-i, --identity [path]', 'Auth token (See: https://github.com/settings/tokens/new)')
      .option('-v, --verbose', 'More')
      .option('-l, --label [label]', 'Toggle a label')
      .option('--add-label [label-to-add]', 'Add a label')
      .option('--remove-label [label-to-remove]', 'Remove a label')
      .option('-c, --comments', 'Include comments')
      .option('-h, --host [host]', 'Host')
      .parse(process.argv);

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


    var getFullTicket = function *(ticketNumber) {
      // Get the ticket
      try {
        var ticket = yield req("GET", "/issues/" + ticketNumber);
      } catch(err) {
        return handleError(err);
      }
      // Get the comments
      try {
        ticket.comments = yield req("GET", "/issues/" + ticketNumber + "/comments")
      } catch(err) {
        return handleError(err);
      }
      return ticket;
    };

    var ticketNumber = getTicketNumber(process.argv);
    var statusChange = getStatusChange(process.argv);
    var labelChange = program.label || program.addLabel || program.removeLabel;

    if (ticketNumber && statusChange) { // We want to change the status of a specific ticket.
      co(function *() {
        var newState = statusChange === 'close' ? "closed" : "opened";
        try {
          ticket = yield req("GET", "/issues/" + ticketNumber);
        } catch(err) {
          return handleError(err);
        }

        // If the ticket state is what we're looking for, were done.
        if (ticket.state.match(statusChange)) return console.log("Ticket #" + ticketNumber + " is already " + newState);

        // Perform patch
        try {
          res = yield req("PATCH", "/issues/" + ticketNumber, { state: statusChange });
        } catch(err) {
          return handleError(err);
        }
        console.log("Ticket #" + ticketNumber + " " + newState);
      })();
    }

    if (ticketNumber && labelChange) {
      co(function *() {
        var restPath = "/issues/" + ticketNumber;
        var ticket = yield req("GET", restPath);
        var labelName = program.label || program.addLabel || program.removeLabel;
        var has = hasLabel(ticket, labelName);

        if (program.removeLabel && !has) return console.log('#' + ticketNumber + ' does not have label "' + labelName + '".');
        if (program.addLabel && has) return console.log('#' + ticketNumber + ' already has label "' + labelName + '".');

        // Remove the label
        if (program.label && has || program.removeLabel) {
          var labels = ticket.labels
            .map(function(label) { return label.name; })
            .filter(function(label) { return label !== labelName; });
          try {
            yield req("PATCH", restPath, { labels: labels });
          } catch(err) {
            return handleError(err);
          }
          return console.log("Removed label " + labelName + " from #" + ticketNumber);
        }

        // Add the label
        if (program.label && !has || program.addLabel) {
          var labels = ticket.labels
            .map(function(label) { return label.name; });
          labels.push(labelName);
          try {
            yield req("PATCH", restPath, { labels: labels });
          } catch(err) {
            return handleError(err);
          }
          return console.log("Added label " + labelName + " to #" + ticketNumber);
        }
      })();
    }

    if (ticketNumber && !statusChange && !labelChange) {
      co(function *() {
        try {
          var ticket = yield getFullTicket(ticketNumber);
        } catch(err) {
          return handleError(err);
        }
        if (!program.comments) {
          ticket.comments = [];
        }
        describeTicket(ticket);
      })();
    }

}

