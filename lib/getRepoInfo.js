var fs = require('fs');
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
