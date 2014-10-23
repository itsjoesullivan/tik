module.exports = function getFirstArg(args) {
  var indexOfCommand;
  args.some(function(arg, i) {
    if (arg.match(/tik|index/)) {
      indexOfCommand = i;
    }
  });
  return args[indexOfCommand+1];
}
