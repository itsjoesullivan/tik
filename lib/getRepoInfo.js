var fs = require('fs');
var path = require('path');
/*
 * Retrieve repo information
 *
 * @param {String} dir
 * @returns {Object}
 *
 */
module.exports = function getRepoInfo(dir) {
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
    throw "Not a git repository.";
  }
  var config = fs.readFileSync(gitdir + '/config', 'binary');
  var pathLine = config.split('\n').filter(function(line) {
    return /url = https:\/\/github.com/.test(line);
  });
  if (!pathLine) {
    throw "No github remote.";
  } else {
    var res = /\/([\w\-]+?)\/([\w\-]+?)\.git/.exec(pathLine);
    return {
      owner: res[1],
      repo: res[2]
    };
  }
}
