var githubToken;
var config = {
  owner: 'jdm',
  repo: 'moztasks',
  tag: 'task'
};

function check_query (name) {
  return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(name).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

if (!check_query('access_token')) {
  path = window.location.pathname;
  path = path.substr(0, path.lastIndexOf('/') + 1);
  path += 'cgi-bin/oauth_redirect.cgi?url=' + encodeURIComponent(window.location.protocol + '//' + window.location.host + window.location.pathname);
  redirect = window.location.protocol + '//' + window.location.host + path;
  clientID = location.hostname == "localhost" ? "73fd92744901e18828bb" : "014a8157d5f002c9a3f7";
  window.location = "https://github.com/login/oauth/authorize?scope=public_repo&client_id=" + clientID + "&redirect_uri=" + redirect;
}

window.onload = function() {
  githubToken = check_query('access_token');
};

function _request(method, url, data, success, error) {
  $.getJSON('cgi-bin/githubapi.cgi?url=' + encodeURIComponent(url) +
            '&access_token=' + githubToken +
            '&data=' + JSON.stringify(data) +
            '&method=' + method,
            success, error);
}

/* success is a function that is passed the API response data specified at
 * http://developer.github.com/v3/issues/#create-an-issue
 */
function submitTask(summary, body, success, error) {
  var data = {
    title: summary,
    body: body,
    labels: [config['tag']]
  };
  _request('POST', 'repos/' + config['owner'] + '/' + config['repo'] + '/issues',
           data, success, error || function() { console.log('Error creating task'); });
}

/* success is a function that is passed the API response data specified at
 * http://developer.github.com/v3/issues/#edit-an-issue
 */
function editTask(id, summary, body, success, error) {
  var data = {
    title: summary,
    body: body,
    labels: [config['tag']]
  };
  _request('PATCH', 'repos/' + config['owner'] + '/' + config['repo'] + '/issues/' + id,
           data, success, error || function() { console.log('Error editing task'); });
}
