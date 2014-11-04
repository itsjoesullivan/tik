var assert = require('assert');

var exec = require('child_process').exec;

describe('ls', function() {
  it('returns open tickets', function(done) {
    exec('./tik ls --host http://localhost:4040', function(err, output) {
      var log = output.split('\n');
      assert(log[0].match(/#1/));
      assert(log[1].match(/#2/));
      assert(!log[2].match(/#3/));
      done();
    });
  });
  describe('-a, --all', function() {
    describe('--all', function() {
      it('returns all tickets', function(done) {
        exec('./tik ls --host http://localhost:4040 --all', function(err, output) {
          var log = output.split('\n');
          assert(log[0].match(/#1/));
          assert(log[1].match(/#2/));
          assert(log[2].match(/#3/));
          done();
        });
      });
    });
    describe('-a', function() {
      it('-a returns all tickets', function(done) {
        exec('./tik ls --host http://localhost:4040 --all', function(err, output) {
          var log = output.split('\n');
          assert(log[0].match(/#1/));
          assert(log[1].match(/#2/));
          assert(log[2].match(/#3/));
          done();
        });
      });
    });
    describe('--help', function() {
      it('returns contents of help/ls.txt', function(done) {
        exec('./tik ls --host http://localhost:4040 --help', function(err, output) {
          var help = require('fs').readFileSync(__dirname + '/../help/ls.txt','binary');
          assert.equal(output, help);
          done();
        });
      });
    });
  })
});
