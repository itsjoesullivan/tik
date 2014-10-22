var assert = require('assert');

describe('tik', function() {
});

describe('Req', function() {
  var Req = require('./lib/req');
  it('returns a function when passed an object', function() {
    assert.equal(typeof Req({}), 'function');
  });
});
