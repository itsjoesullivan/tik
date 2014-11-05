var handleError = require('./lib/handleError');

module.exports = function *(obj) { 
  var options = obj.options;
  var req = obj.req;
  var charm = require('charm')(process.stdout);

  var hex2rgb = require('./lib/hex2rgb');

  var issuesPath = '/issues?';
  if (options.all) issuesPath += 'state=all&';

  issuesPath += 'per_page=100&';

  try {
    tickets = yield req("GET", issuesPath);
  } catch(err) {
    handleError(err);
    yield err;
  }

  // Just write to stdout.
  function write(message) {
    process.stdout.write(message);
  }
  
  // Log out a ticket
  function renderTicket(ticket) {
    write('#' + ticket.number + ' ' + '"' + ticket.title + '" ');
    if (ticket.assignee) {
      write('@' + ticket.assignee.login);
    }
    ticket.labels.forEach(renderLabel);
    process.stdout.write('\n');
  }

  // Log out a label
  function renderLabel(label) {
    var labelColor = hex2rgb(label.color).map(function(val) { return val; });
    write(' ');
    charm.background(labelColor[0], labelColor[1], labelColor[2]);
    write('  ');
    charm.background(0, 0, 0);
    write(' ' + label.name);
  }
  tickets.forEach(renderTicket);
};
