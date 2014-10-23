var program = require('commander');
var Req = require('./lib/req');
var fs = require('fs');
var path = require('path');

program.version(require('./package').version)
  .option('-i, --identity [path]', 'Auth token (See: https://github.com/settings/tokens/new)')
  .option('-v, --verbose', 'More')
  .option('-l, --label [label]', 'Toggle a label')
  .option('--add-label [label-to-add]', 'Add a label')
  .option('--remove-label [label-to-remove]', 'Remove a label')
  .parse(process.argv);

var ticketNumber = process.argv.pop();

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
var config = getRepoInfo();
config.token = token || process.env.GITHUB_TOKEN;

/*
 * Initialize the request processor.
 */
var req = Req(config);


if (ticketNumber) {
  if (program.label || program.addLabel || program.removeLabel) {
    req("GET", "/issues/" + ticketNumber, function(err, ticket) {
      var labelName = program.label || program.addLabel || program.removeLabel;
      var has = hasLabel(ticket, labelName);
      if (program.removeLabel &! has) {
        console.log('Label "' + labelName + '" doesn\'t exists.');
      } else if ((program.label && has) || program.removeLabel) {
        var labels = ticket.labels
          .map(function(label) { return label.name; })
          .filter(function(label) { return label !== labelName; });
        req("PATCH", "/issues/" + ticketNumber, {
          labels: labels
        }, function(err, ticket) {
          console.log("Removed label " + labelName);
        });
      } else if (has && program.addLabel) {
        console.log('Label "' + labelName + '" already exists.');
      } else if (program.addLabel || (!has && program.label)) {
        // Add
        var labels = ticket.labels
          .map(function(label) { return label.name; });
        labels.push(labelName);
        req("PATCH", "/issues/" + ticketNumber, {
          labels: labels
        }, function(err, ticket) {
          console.log("Added label " + labelName);
        });
      }
    });
  } else {
    describeTicket(ticketNumber);
  }
} else {
  req("GET", "/issues", function(err, val) {
    console.log(val);
  });
}

/*
 * Retrieve repo information
 */
function getRepoInfo() {
  var wd = process.cwd();
  var gitdir = false;
  var ct = 0;
  while(!gitdir && ct < 20) {
    var files = fs.readdirSync(wd);
    if(files.indexOf('.git') > -1) {
      gitdir = wd + '/.git';
    } else {
      wd = path.join(wd, '..');
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
