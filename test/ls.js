var assert = require('assert');

var exec = require('child_process').exec;

describe('ls', function() {
  it('returns a list', function(done) {
    exec('./tik ls --host http://localhost:4040', function(err, output) {
      var log = output.split('\n');
      assert(log[0].match(/#1/));
      assert(log[1].match(/#2/));
      done();
    });
  });
});
