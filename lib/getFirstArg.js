module.exports = function getFirstArg(args) {
  var lastIndexOfCommand;
  args.some(function(arg, i) {
    if (arg.match(/tik|index/)) {
      lastIndexOfCommand = i;
    }
  });
  return args[lastIndexOfCommand+1];
}
