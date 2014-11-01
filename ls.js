var handleError = require('./lib/handleError');

module.exports = function *(obj) { 

  var program = obj.program;
  var req = obj.req;
  var charm = require('charm')(process.stdout);

  var hex2rgb = require('./lib/hex2rgb');

  var issuesPath = '/issues?';
  if (program.all) issuesPath += 'state=all&';

  try {
    tickets = yield req("GET", issuesPath);
  } catch(err) {
    handleError(err);
    yield err;
  }

  function write(message) {
    process.stdout.write(message);
  }
  tickets.forEach(function(ticket) {
    write('#' + ticket.number + ' ' + '"' + ticket.title + '" ');
    if (ticket.assignee) {
      write('@' + ticket.assignee.login);
    }
    ticket.labels.forEach(function(label) {
      var labelColor = hex2rgb(label.color).map(function(val) { return val; });
      write(' ');
      charm.background(labelColor[0], labelColor[1], labelColor[2]);
      write('  ');
      charm.background(0, 0, 0);
      write(' ' + label.name);
      
    });
    process.stdout.write('\n');
  });
}
