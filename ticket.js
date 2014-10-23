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
      .option('--comments', 'Include comments')
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

    /*
     * Initialize the request processor.
     */
    var req = Req(config);


    var ticketNumber = getTicketNumber(process.argv);
    var statusChange = getStatusChange(process.argv);

    if (ticketNumber) {
      if (statusChange) {
        var newState = statusChange === 'close' ? "closed" : "opened";
        req("GET", "/issues/" + ticketNumber, function(err, ticket) {
          if (err) return handleError(err);
          if (ticket.state.match(statusChange)) {
            console.log("Ticket #" + ticketNumber + " is already " + newState);
          } else {
          req("PATCH", "/issues/" + ticketNumber, {
            state: statusChange
          }, function(err, val) {
            if (err) return handleError(err);
            console.log("Ticket #" + ticketNumber + " " + newState);
          });
          }
        });
      } else if (program.label || program.addLabel || program.removeLabel) {
        req("GET", "/issues/" + ticketNumber, function(err, ticket) {
          if (err) return handleError(err);
          var labelName = program.label || program.addLabel || program.removeLabel;
          var has = hasLabel(ticket, labelName);
          if (program.removeLabel && !has) {
            console.log('#' + ticketNumber + ' does not have label "' + labelName + '".');
          } else if ((program.label && has) || program.removeLabel) {
            var labels = ticket.labels
              .map(function(label) { return label.name; })
              .filter(function(label) { return label !== labelName; });
            req("PATCH", "/issues/" + ticketNumber, {
              labels: labels
            }, function(err, ticket) {
              if (err) return handleError(err);
              console.log("Removed label " + labelName + " from #" + ticketNumber);
            });
          } else if (has && program.addLabel) {
            console.log('#' + ticketNumber + ' already has label "' + labelName + '".');
          } else if (program.addLabel || (!has && program.label)) {
            // Add
            var labels = ticket.labels
              .map(function(label) { return label.name; });
            labels.push(labelName);
            req("PATCH", "/issues/" + ticketNumber, {
              labels: labels
            }, function(err, ticket) {
              if (err) return handleError(err);
              console.log("Added label " + labelName + " to #" + ticketNumber);
            });
          }
        });
      } else {
        getFullTicket(ticketNumber, function(err, ticket) {
          if (!program.comments) {
            ticket.comments = [];
          }
          if (err) return handleError(err);
          describeTicket(ticket);
        });
      }
    }

    function getFullTicket(ticketNumber, cb) {
      req("GET", "/issues/" + ticketNumber, function(err, ticket) {
        if (err) return handleError(err);
        req("GET", "/issues/" + ticketNumber + "/comments", function(err, comments) {
          if (err) return handleError(err);
          ticket.comments = comments;
          cb(null, ticket);
        });
      });
    }
}

