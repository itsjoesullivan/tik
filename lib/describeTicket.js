var program = require('commander');
var moment = require('moment');
/* Print a description of the ticket.
 *
 * @param {Number} ticketNumber
 *
 */
module.exports = function describeTicket(ticket) {
  program.version(require('../package').version)
    .option('-v, --verbose', 'More')
    .parse(process.argv);
  console.log("Ticket #" + ticket.number + (ticket.state === "closed" ? " (closed)" : ""));
  console.log("\tTitle: " + ticket.title);
  console.log("\tAuthor: " + ticket.user.login);
  if (ticket.assignee) {
    console.log("\tAssignee: " + ticket.assignee.login);
  }
  if (program.verbose) {
    console.log("\tBody: " + ticket.body);
  }
  var comments = ticket.comments;
  if (comments.length) {
    console.log("\tComments (" + comments.length + "):");
    comments.forEach(function(comment) {
      console.log("\t\t" + comment.user.login + " (" + moment(comment.updated_at).fromNow()+ ")");
      var body = comment.body.split('\n');
      body.forEach(function(line) {
        console.log("\t\t\t" + line);
      });
    });
  }
}
