var program = require('commander');
var Req = require('./lib/req');
var fs = require('fs');
var path = require('path');
var charm = require('charm')(process.stdout);
var moment = require('moment');

var firstArg = getFirstArg(process.argv);

var handleError = require('./lib/handleError');

if (firstArg === 'ls') {
  require('./ls');
} else {

  program.version(require('./package').version)
    .option('-i, --identity [path]', 'Auth token (See: https://github.com/settings/tokens/new)')
    .option('-v, --verbose', 'More')
    .option('-l, --label [label]', 'Toggle a label')
    .option('--add-label [label-to-add]', 'Add a label')
    .option('--remove-label [label-to-remove]', 'Remove a label')
    .option('-C, --comment [comment]', 'Add a comment')
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
          console.log('#1 does not have label "' + labelName + '.');
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
          console.log('#1 already has label "' + labelName + '.');
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
    } else if (program.comment) {
      var postComment = function(message) {
        req("POST", "/issues/" + ticketNumber + "/comments", {
          body: message
        }, function(err, val) {
          if (err) return handleError(err);
          console.log("Comment added to #" + ticketNumber);
        });
      };
      if (typeof program.comment === 'string') {
        postComment(program.comment);
      }
    } else {
      getFullTicket(ticketNumber, function(err, ticket) {
        if (err) return handleError(err);
        describeTicket(ticket);
      });
    }
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


/* Print a description of the ticket.
 *
 * @param {Number} ticketNumber
 *
 */
function describeTicket(ticket) {
  console.log(ticket);
  console.log("Ticket #" + ticket.number);
  console.log("  Title    " + ticket.title);
  console.log("  State    " + ticket.state);
  console.log("  Owner    " + ticket.user.login);
  if (program.verbose) {
    console.log("  Body     " + ticket.body);
  }
  var comments = ticket.comments;
  if (comments.length) {
    console.log("  Comments");
    comments.forEach(function(comment) {
      console.log("    " + comment.user.login + " (" + moment(comment.updated_at).fromNow()+ ")");
      var body = comment.body.split('\n');
      body.forEach(function(line) {
        console.log("      " + line);
      });
    });
  }
}

/* Determine whether a ticket already has a label
 *
 * @param {Object} ticket
 * @param {String} labelName
 * @returns Boolean
 *
 */
function hasLabel(ticket, labelName) {
  return !!ticket.labels.filter(function(label) { return label.name === labelName; }).length;
}

/*
 * Retrieve a ticket number from an argv, if one is present
 *
 * @param {Array} args
 * @returns {String}
 *
 */
function getTicketNumber(args) {
  for(var i = 1; i < args.length; i++) {
    var arg = args[i];
    if ('' + parseInt(arg) === arg && args[i-1].indexOf('-') !== 0) {
      return arg;
    }
  }
}

/*
 * Retrieve a status change, if one is available
 *
 * @param {Array} args
 * @returns {String}
 *
 */
function getStatusChange(args) {
  for(var i = 1; i < args.length; i++) {
    var arg = args[i];
    if ( (arg === 'open' || arg === 'close') && args[i-1].indexOf('-') !== 0) {
      return arg;
    }
  }
}


function getFirstArg(args) {
  var indexOfCommand;
  args.some(function(arg, i) {
    if (arg.match(/tik|index/)) {
      indexOfCommand = i;
    }
  });
  return args[indexOfCommand+1];
}
