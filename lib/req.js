/* This is really aped from https://github.com/michael/github, which is a library I really admire. */

/*
 * Copyright (c) 2012 Michael Aufreiter, Development Seed
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, this
 *   list of conditions and the following disclaimer in the documentation and/or
 *   other materials provided with the distribution.
 * - Neither the name "Development Seed" nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without
 *   specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 *  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var thunkify = require('thunkify');

module.exports = function Req(options) {
  if (!options) {
    throw "Req requires an option arg";
  }
  return thunkify(function request(method, pathname, data, cb) {
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
    var host = options.host || "https://api.github.com";
    var url = host + '/repos/' + options.owner + '/' + options.repo + pathname;
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
  });
};
