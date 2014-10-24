var assert = require('assert');
var exec = require('child_process').exec;

describe('tik', function() {
});

describe('Req', function() {
  var Req = require('./lib/req');
  it('returns a function when passed an object', function() {
    assert.equal(typeof Req({}), 'function');
  });
});

describe('tik', function() {
  it ('logs console info without args', function(done) {
    exec('./tik', function(err, stdout, stderr) {
      assert(stdout.match(/usage/));
      done();
    });
  });
});
