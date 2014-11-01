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
  tickets.forEach(function(ticket) {
    process.stdout.write('#' + ticket.number + ': ' + ticket.title + ' - ' + ticket.user.login);
    ticket.labels.forEach(function(label) {
      var labelColor = hex2rgb(label.color).map(function(val) { return val * 0.2; });
      process.stdout.write(' ');
      charm.foreground(labelColor[0], labelColor[1], labelColor[2]).write(label.name);
      charm.foreground(255, 255, 255);
    });
    process.stdout.write('\n');
  });
}
