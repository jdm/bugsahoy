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
  clientID = location.hostname == "localhost" ? "73fd92744901e18828bb" : "7b9eaa72a4f18972fea5";
  window.location = "https://github.com/login/oauth/authorize?scope=public_repo&client_id=" + clientID + "&redirect_uri=" + redirect;
}

window.onload = function() {
  githubToken = check_query('access_token');
};

function _request(method, url, data, success, error) {
  data['access_token'] = githubToken;
  $.ajax({type: method,
          url: url,
          data: data,
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "token " + githubToken);
            xhr.setRequestHeader("Accept", 'application/vnd.github.raw');
          },
          success: function(response) { callback(JSON.parse(response)); },
          error: error(),
          /*contentType: 'application/json',*/
          contentType: 'application/x-www-form-urlencoded',
          dataType: 'json'
  });
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
  _request('POST', 'https://api.github.com/repos/' + config['owner'] + '/' + config['repo'] + '/issues',
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
  _request('PATCH', 'https://api.github.com/repos/' + config['owner'] + '/' + config['repo'] + '/issues/' + id,
           data, success, error || function() { console.log('Error editing task'); });
}
