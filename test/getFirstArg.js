var assert = require('assert');
var getFirstArg = require('../lib/getFirstArg')
describe('getFirstArg', function() {
  it('returns falsy with "node index"', function() {
    assert(!getFirstArg(["node","index"]));
  });
  it('returns falsy with "./tik"', function() {
    assert(!getFirstArg(["tik"]));
  });
  it('returns falsy with "tik"', function() {
    assert(!getFirstArg(["tik"]));
  });
  it('returns "ls" from "node index ls"', function() {
    assert.equal(getFirstArg(["node", "index", "ls"]), "ls");
  });
  it('returns "ls" from "./tik ls"', function() {
    assert.equal(getFirstArg(["./tik", "ls"]), "ls");
  });
  it('returns "ls" from "tik ls"', function() {
    assert.equal(getFirstArg(["tik", "ls"]), "ls");
  });
  it('returns "1" from "tik 1"', function() {
    assert.equal(getFirstArg(["tik", "1"]), "1");
  });
});
