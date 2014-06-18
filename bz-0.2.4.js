var BugzillaClient = function(options) {
  options = options || {};
  this.username = options.username;
  this.password = options.password;
  this.timeout = options.timeout || 0;
  this.apiUrl = options.url ||
    (options.test ? "https://api-dev.bugzilla.mozilla.org/test/latest"
                  : "https://api-dev.bugzilla.mozilla.org/latest");
  this.apiUrl = this.apiUrl.replace(/\/$/, "");
}

BugzillaClient.prototype = {
  getBug : function(id, params, callback) {
    if (!callback) {
       callback = params;
       params = {};
    }
    this.APIRequest('/bug/' + id, 'GET', callback, null, null, params);
  },

  searchBugs : function(params, callback) {
    this.APIRequest('/bug', 'GET', callback, 'bugs', null, params);
  },

  countBugs : function(params, callback) {
    this.APIRequest('/count', 'GET', callback, 'data', null, params);
  },

  updateBug : function(id, bug, callback) {
    this.APIRequest('/bug/' + id, 'PUT', callback, 'ok', bug);
  },

  createBug : function(bug, callback) {
    this.APIRequest('/bug', 'POST', callback, 'ref', bug);
  },

  bugComments : function(id, callback) {
    this.APIRequest('/bug/' + id + '/comment', 'GET', callback, 'comments');
  },

  addComment : function(id, comment, callback) {
    this.APIRequest('/bug/' + id + '/comment', 'POST', callback, 'ref', comment);
  },

  bugHistory : function(id, callback) {
    this.APIRequest('/bug/' + id + '/history', 'GET', callback, 'history');
  },

  bugFlags : function(id, callback) {
    this.APIRequest('/bug/' + id + '/flag', 'GET', callback, 'flags');
  },

  bugAttachments : function(id, callback) {
    this.APIRequest('/bug/' + id + '/attachment', 'GET', callback, 'attachments');
  },

  createAttachment : function(id, attachment, callback) {
    this.APIRequest('/bug/' + id + '/attachment', 'POST', callback, 'ref', attachment);
  },

  getAttachment : function(id, callback) {
    this.APIRequest('/attachment/' + id, 'GET', callback);
  },

  updateAttachment : function(id, attachment, callback) {
    this.APIRequest('/attachment/' + id, 'PUT', callback, 'ok', attachment);
  },

  searchUsers : function(match, callback) {
    this.APIRequest('/user', 'GET', callback, 'users', null, {match: match});
  },

  getUser : function(id, callback) {
    this.APIRequest('/user/' + id, 'GET', callback);
  },

  getSuggestedReviewers: function(id, callback) {
    // BMO- specific extension to get suggested reviewers for a given bug
    // http://bzr.mozilla.org/bmo/4.2/view/head:/extensions/Review/lib/WebService.pm#L102
    this.APIRequest('/review/suggestions/' + id, 'GET', callback);
  },

  getConfiguration : function(params, callback) {
    if (!callback) {
       callback = params;
       params = {};
    }
    this.APIRequest('/configuration', 'GET', callback, null, null, params);
  },

  APIRequest : function(path, method, callback, field, body, params) {
    var url = this.apiUrl + path;
    if(this.username && this.password) {
      params = params || {};
      params.username = this.username;
      params.password = this.password;
    }
    if(params)
      url += "?" + this.urlEncode(params);

    body = JSON.stringify(body);

    try {
      XMLHttpRequest = require("xhr").XMLHttpRequest; // Addon SDK
    }
    catch(e) {}

    var that = this;
    if(typeof XMLHttpRequest != "undefined") {
      // in a browser
      var req = new XMLHttpRequest();
      req.open(method, url, true);
      req.setRequestHeader("Accept", "application/json");
      if (method.toUpperCase() !== "GET") {
        req.setRequestHeader("Content-type", "application/json");
      }
      req.onreadystatechange = function (event) {
        if (req.readyState == 4 && req.status != 0) {
          that.handleResponse(null, req, callback, field);
        }
      };
      req.timeout = this.timeout;
      req.ontimeout = function (event) {
        that.handleResponse('timeout', req, callback);
      };
      req.onerror = function (event) {
        that.handleResponse('error', req, callback);
      };
      req.send(body);
    }
    else {
      // node 'request' package
      var request = require("request");
      var requestParams = {
        uri: url,
        method: method,
        body: body,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };
      if (this.timeout > 0)
        requestParams.timeout = this.timeout;
      request(requestParams, function (err, resp, body) {
        that.handleResponse(err, {
            status: resp && resp.statusCode,
            responseText: body
          }, callback, field);
        }
      );
    }
  },

  handleResponse : function(err, response, callback, field) {
    var error, json;
    if (err && err.code && (err.code == 'ETIMEDOUT' || err.code == 'ESOCKETTIMEDOUT'))
      err = 'timeout';
    else if (err)
      err = err.toString();
    if(err)
      error = err;
    else if(response.status >= 300 || response.status < 200)
      error = "HTTP status " + response.status;
    else {
      try {
        json = JSON.parse(response.responseText);
      } catch(e) {
        error = "Response wasn't valid json: '" + response.responseText + "'";
      }
    }
    if(json && json.error)
      error = json.error.message;
    var ret;
    if(!error) {
      ret = field ? json[field] : json;
      if(field == 'ref') {// creation returns API ref url with id of created object at end
        var match = ret.match(/(\d+)$/);
        ret = match ? parseInt(match[0]) : true;
      }
    }
    callback(error, ret);
  },

  urlEncode : function(params) {
    var url = [];
    for(var param in params) {
      var values = params[param];
      if(!values.forEach)
        values = [values];
      // expand any arrays
      values.forEach(function(value) {
         url.push(encodeURIComponent(param) + "=" +
           encodeURIComponent(value));
      });
    }
    return url.join("&");
  }
}

exports.createClient = function(options) {
  return new BugzillaClient(options);
}
