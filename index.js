var program = require('commander');
var Req = require('./lib/req');
var fs = require('fs');
var path = require('path');
var charm = require('charm')(process.stdout);

program.version(require('./package').version)
  .option('ls', 'List issues')
  .option('-i, --identity [path]', 'Auth token (See: https://github.com/settings/tokens/new)')
  .option('-v, --verbose', 'More')
  .option('-l, --label [label]', 'Toggle a label')
  .option('--add-label [label-to-add]', 'Add a label')
  .option('--remove-label [label-to-remove]', 'Remove a label')
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

/*
 * Create a config object
 */
var config = getRepoInfo(process.cwd());
config.token = token || process.env.GITHUB_TOKEN;

/*
 * Initialize the request processor.
 */
var req = Req(config);

if (process.argv.indexOf('ls') > -1) {
  req("GET", "/issues", function(err, tickets) {
    tickets.forEach(function(ticket) {
      process.stdout.write('#' + ticket.number + ': ' + ticket.title + ' - ' + ticket.user.login);
      ticket.labels.forEach(function(label) {
        var labelColor = hex2rgb(label.color).map(function(val) { return val * 0.2; });
        process.stdout.write(' ');
        charm.foreground(labelColor[0], labelColor[1], labelColor[2]).write(label.name);
        charm.foreground(255, 255, 255);
      });
    });
    process.stdout.write('\n');
  });
}

/** Return an array of rgb figures from a hex color
 *
 * @param {String} hexString
 * @returns [Array]
 */
function hex2rgb(hexString) {
  return [
    parseInt(hexString.substring(0,2),16),
    parseInt(hexString.substring(2,4),16),
    parseInt(hexString.substring(4,6),16)
  ]
}


var ticketNumber = getTicketNumber(process.argv);


if (ticketNumber) {
  if (program.label || program.addLabel || program.removeLabel) {
    req("GET", "/issues/" + ticketNumber, function(err, ticket) {
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
          console.log("Added label " + labelName + " to #" + ticketNumber);
        });
      }
    });
  } else {
    describeTicket(ticketNumber);
  }
}

/*
 * Retrieve repo information
 *
 * @param {String} dir
 * @returns {Object}
 *
 */
function getRepoInfo(dir) {
  dir = dir || process.cwd();
  var gitdir = false;
  var ct = 0;
  while(!gitdir && ct < 20) {
    var files = fs.readdirSync(dir);
    if(files.indexOf('.git') > -1) {
      gitdir = dir + '/.git';
    } else {
      dir = path.join(dir, '..');
    }
    ct++;
  }
  if (!gitdir) {
    console.log("Not a git repository");
    process.exit(1);
  }
  var config = fs.readFileSync(gitdir + '/config', 'binary');
  var pathLine = config.split('\n').filter(function(line) {
    return /url = https:\/\/github.com/.test(line);
  });
  if (!pathLine) {
    console.log("No github remote.");
    process.exit(1);
  } else {
    var res = /\/([\w\-]+?)\/([\w\-]+?)\.git/.exec(pathLine);
    return {
      owner: res[1],
      repo: res[2]
    };
  }
}

/* Print a description of the ticket.
 *
 * @param {Number} ticketNumber
 *
 */
function describeTicket(ticketNumber) {
  req("GET", "/issues/" + ticketNumber, function(err, val) {
    console.log("Ticket     " + val.number);
    console.log("  Title    " + val.title);
    console.log("  State    " + val.state);
    console.log("  Owner    " + val.user.login);
    if (program.verbose) {
      console.log("  Body     " + val.body);
    }
    console.log("  Comments " + val.comments);
  });
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
