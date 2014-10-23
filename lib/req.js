/* This is really aped from https://github.com/michael/github, which is a library I really admire. */
XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
module.exports = function Req(options) {
  if (!options) {
    throw "Req requires an option arg";
  }
  return function request(method, pathname, data, cb) {
    // We can skip GET
    if (typeof pathname !== "string") {
      cb = data;
      data = pathname;
      pathname = method;
      method = "GET";
    }
    // We can skip data obj
    if (typeof data === 'function') {
      cb = data;
      data = null;
    }
    var url = 'https://api.github.com/repos/' + options.owner + '/' + options.repo + pathname;
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status >= 200 && this.status < 300 || this.status === 304) {
          cb(null, JSON.parse(this.responseText));
        } else {
          cb(this);
        }
      }
    };
    xhr.setRequestHeader('Accept','application/vnd.github.v3.raw+json');
    xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8');
    xhr.setRequestHeader('Authorization', 'token ' + options.token);
    xhr.send(data? JSON.stringify(data) : null);
  };
};
