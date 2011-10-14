var bz = (function() {var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}
var __require = require;

require.paths = [];
require.modules = {};
require.extensions = [".js",".coffee"];

require.resolve = (function () {
    var core = [ 'assert', 'events', 'fs', 'path', 'vm' ]
        .reduce(function (acc, x) {
            acc[x] = true;
            return acc;
        }, {})
    ;
    
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (core[x]) return x;
        var path = require.modules.path();
        var y = cwd || '.';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split(/\/+/);
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    Object.keys(require.modules)
        .forEach(function (x) {
            if (x.slice(0, basedir.length + 1) === basedir + '/') {
                var f = x.slice(basedir.length);
                require.modules[to + f] = require.modules[basedir + f];
            }
            else if (x === basedir) {
                require.modules[to] = require.modules[basedir];
            }
        })
    ;
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = function (fn) {
    setTimeout(fn, 0);
};

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

require.modules["path"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = ".";
    var __filename = "path";
    
    var require = function (file) {
        return __require(file, ".");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, ".");
    };
    
    require.modules = __require.modules;
    __require.modules["path"]._cached = module.exports;
    
    (function () {
        // resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(path.split('/').filter(function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(paths.filter(function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};
;
    }).call(module.exports);
    
    __require.modules["path"]._cached = module.exports;
    return module.exports;
};

require.modules["/bz.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/";
    var __filename = "/bz.js";
    
    var require = function (file) {
        return __require(file, "/");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/");
    };
    
    require.modules = __require.modules;
    __require.modules["/bz.js"]._cached = module.exports;
    
    (function () {
        var BugzillaClient = function(options) {
  options = options || {};
  this.username = options.username;
  this.password = options.password;
  this.apiUrl = options.url || 
    (options.test ? "https://api-dev.bugzilla.mozilla.org/test/0.9/"
                  : "https://api-dev.bugzilla.mozilla.org/0.9/");
}

BugzillaClient.prototype = {
  getBug : function(id, callback) {
    this.APIRequest('/bug/' + id, 'GET', callback);  
  },
  
  searchBugs : function(params, callback) {
    this.APIRequest('/bug', 'GET', callback, 'bugs', undefined, params);
  },

  countBugs : function(params, callback) {
    this.APIRequest('/count', 'GET', callback, 'data', undefined, params);
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
    this.APIRequest('/user', 'GET', callback, 'users', undefined, {match: match});
  },

  getUser : function(id, callback) {
    this.APIRequest('/user/' + id, 'GET', callback);
  },
  
  getConfiguration : function(params, callback) {
    this.APIRequest('/configuration', 'GET', callback, undefined, undefined, params);
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
   
   /*  
    try {
      XMLHttpRequest = require("xhr").XMLHttpRequest; // Addon SDK
    }
    catch(e) {}
   */

    var that = this;
    if(typeof XMLHttpRequest != "undefined") {
      // in a browser
      var req = new XMLHttpRequest();
      req.open(method, url, true);
      req.setRequestHeader("Accept", "application/json")
      req.setRequestHeader("Content-type", "application/json");
      req.onreadystatechange = function (event) {
        if (req.readyState == 4) {
          that.handleResponse(null, req, callback, field);
        } 
      };
      req.send(body);
    }
  /*  else {
      // node 'request' package
      require("request")({
          uri: url,
          method: method,
          body: body,
          headers: {'Content-type': 'application/json'}
        },
        function (err, resp, body) {
          that.handleResponse(err, {
              status: resp && resp.statusCode,
              responseText: body
            }, callback, field);
        }
      );
    } */
  },
  
  handleResponse : function(err, response, callback, field) {
    var error, json;
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
};
    }).call(module.exports);
    
    __require.modules["/bz.js"]._cached = module.exports;
    return module.exports;
};
 return require('/bz')})();