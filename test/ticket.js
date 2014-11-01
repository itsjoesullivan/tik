var assert = require('assert');

var exec = require('child_process').exec;

describe('ticket', function() {
  it('logs error code to stderr', function(done) {
    exec('./tik 0 --host http://localhost:4040', function(err, output, stderr) {
      assert(/404/.test(stderr));
      done();
    });
  });
  it('describes a ticket', function(done) {
    exec('./tik 1 --host http://localhost:4040', function(err, output) {
      var lines = output.split('\n');
      assert(/#[0-9]/.test(lines[0]));
      assert(/title/i.test(lines[1]));
      assert(/author/i.test(lines[2]));
      assert(/assignee/i.test(lines[3]));
      done();
    });
  });
  describe('--comments', function() {
    it('includes comment count', function(done) {
      exec('./tik 1 --comments --host http://localhost:4040', function(err, output) {
        var lines = output.split('\n');
        assert(/Comments \([0-9]+\)/.test(output));
        done();
      });
    });
  });
});
