var getFirstArg = require('./lib/getFirstArg');

var firstArg = getFirstArg(process.argv);

if (firstArg === 'ls') {
  require('./ls');
} else if ('' + parseInt(firstArg) === firstArg) {
  require('./ticket');
} else {
  console.log("usage: tik ls [options]");
  console.log("       tik {ticket} [options]");
  console.log("       tik {ticket} comment {comment}");
}
