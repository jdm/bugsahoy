var bugzilla = bz.createClient();

var categoryMapping = {};
var groups = {};

function addSearchMapping(group, cat, searchParams) {
  if (!(cat in categoryMapping))
    categoryMapping[cat] = [];
  categoryMapping[cat].push(searchParams);

  if (!groups[group]) {
    groups[group] = [];
  }

  groups[group].push(cat);
}

function addSimpleMapping(group, cat, prod, components) {
  var params = {product: prod};
  if (components) {
    if (typeof(components) == "string")
      components = [components];
    params.component = components;
  }
  addSearchMapping(group, cat, params);
}

function timeFromModified(lastChangeTime) {
	var lastModified = new Date(lastChangeTime);
	var today = new Date();
	var one_day = 1000*60*60*24;
	return(Math.ceil((today.getTime() - lastModified.getTime()) / (one_day)));
}

function addComponentMapping(cat, prod, components) {
  addSimpleMapping('components', cat, prod, components);
}

function addLanguageMapping(cat, language) {
  addSearchMapping('langs', cat, {status_whiteboard: 'lang=' + language});
}

var githubMapping = {};
function addGithubMapping(group, cat, repos, tags) {
  if (!(cat in githubMapping))
    githubMapping[cat] = [];
  if (typeof repos == "string")
    repos = [repos];
  if (typeof tags == "string")
    tags = [tags];

  for (var i = 0; i < repos.length; i++)
    for (var j = 0; j < tags.length; j++)
    githubMapping[cat].push({
      repo: repos[i],
      tag: tags[j]
    });
  
  if (!groups[group])
    groups[group] = [];
  
  groups[group].push(cat);
}

function addGithubComponentMapping(cat, repos, tags) {
  addGithubMapping('components', cat, repos, tags);
}

addComponentMapping('a11y', 'Core', 'Disability Access APIs');
addComponentMapping('build', 'Core', ['Build Config']);
addComponentMapping('build', 'MailNews Core', ['Build Config']);
addComponentMapping('gfx', 'Core',
                    ['Graphics', 'GFX: Color Management',
                     'Canvas: WebGL', 'Canvas: 2D', 'ImageLib', 'Graphics',
                     'Graphics: Layers', 'Graphics: Text']);
addComponentMapping('net', 'Core',
                    ['Networking',
                     'Networking: HTTP',
                     'Networking: Cookies',
                     'Networking: File',
                     'Networking: JAR',
                     'Networking: WebSockets',
                     'Networking: DNS',
                     'WebRTC: Networking']);
addComponentMapping('layout', 'Core',
                    ['Layout',
                     'Layout: Block and Inline',
                     'Layout: Floats',
                     'Layout: Form Controls',
                     'Layout: HTML Frames',
                     'Layout: Images',
                     'Layout: Misc Code',
                     'Layout: R & A Pos',
                     'Layout: Tables',
                     'Layout: Text',
                     'Layout: View Rendering']);
addComponentMapping('dom', 'Core',
                    ['Style System (CSS)',
                     'SVG', 'DOM',
                     'DOM: Core & HTML',
                     'DOM: CSS Object Model',
                     'DOM: Device Interfaces',
                     'DOM: Events',
                     'DOM: IndexedDB',
                     'DOM: Mozilla Extensions',
                     'DOM: Other',
                     'DOM: Traversal-Range',
                     'DOM: Validation',
                     'DOM: Workers',
                     'Geolocation',
                     'HTML: Form Submission',
                     'Event Handling', 'HTML: Parser',
                     'MathML', 'XML', 'XSLT']);
addComponentMapping('editor', 'Core', ['Editor', 'Selection', 'Keyboard: Navigation',
                                       'Drag and Drop', 'Spelling Checker']);
addComponentMapping('internals', 'Core', ['General', 'Widget', 'Document Navigation', 'XPCOM',
                                          'Embedding: APIs', 'Embedding: GRE Core', 'Embedding: GTK Widget',
                                          'Embedding: Mac', 'Embedding: Packaging',
                                          'File Handling', 'Find Backend', 'Gecko Profiler',
                                          'History (Global)', 'Image Blocking', 'Installer', 'IPC',
                                          'MFBT', 'Plug-ins', 'Preferences: Backend', 'Print Preview',
                                          'Printing: Output', 'Printing: Setup', 'Profile: BackEnd',
                                          'Profile: Migration', 'Profile: Roaming', 'RDF',
                                          'Rewriting and Analysis', 'Security', 'Security: CAPS', 'Security: PSM',
                                          'Security: S/MIME', 'Security: UI',
                                          'Serializers', 'SQL', 'String', 'XBL', 'XTF', 'XUL',
                                          'Widget', 'Widget: Android', 'Widget: BeOS', 'Widget: Cocoa',
                                          'Widget: Gtk', 'Widget: OS/2', 'Widget: Photon', 'Widget: Qt',
                                          'Widget: Win32', 'XP Toolkit/Widgets: XUL', 'XP Toolkit/Widgets: Menus',
                                          'Identity', 'Localization']);
addComponentMapping('internals', 'NSPR');
addComponentMapping('internals', 'NSS');
addComponentMapping('mobile', 'Fennec');
addComponentMapping('mobile', 'Firefox for Android');
addComponentMapping('mobile', 'Core', ['Widget: Android', 'mozglue']);
addComponentMapping('jseng', 'Core',
                    ['Javascript Engine',
                     'js-ctypes',
                     'XPConnect',
                     'Nanojit']);
addComponentMapping('media', 'Core', ['Video/Audio', 'WebRTC', 'WebRTC: Audio/Video',
                                      'WebRTC: Signalling']);
addComponentMapping('ff', 'Firefox');
addComponentMapping('ff', 'Toolkit');
addComponentMapping('ff', 'Mozilla Services', 'Firefox Sync: UI');
addComponentMapping('ff', 'Input', ['Frontend', 'General']);
addComponentMapping('devtools', 'Firefox',
                    ['Developer Tools',
                     'Developer Tools: Console',
                     'Developer Tools: Debugger',
                     'Developer Tools: Inspector',
                     'Developer Tools: Scratchpad',
                     'Developer Tools: Style Editor']);
addComponentMapping('releng', 'mozilla.org', ['Release Engineering',
                                              'Release Engineering: Automation (General)',
                                              'Release Engineering: Developer Tools',
                                              'Hg: Customizations']);
addComponentMapping('automation', 'Testing');
addGithubComponentMapping('automation', ['automatedtester/automation-services-bot',
                                         'automatedtester/powerball-platform',
                                         'automatedtester/testdaybot',
                                         'automatedtester/unittest-zero',
                                         'davehunt/flynnid',
                                         'davehunt/pytest-mozwebqa',
                                         'mozilla/bidpom',
                                         'mozilla/memchaser',
                                         'mozilla/moz-grid-config',
                                         'mozilla/mozdownload',
                                         'mozilla/mozmill-ci',
                                         'mozilla/nightlytt',
                                         'whimboo/mozmill-automation',
                                         'whimboo/mozmill-crowd',
                                         'whimboo/mozmill-dashboard',
                                         'whimboo/mozmill-environment'], 'mentored');
addComponentMapping('sync', 'Mozilla Services', ['Firefox Sync: Backend',
                                                 'Firefox Sync: Build',
                                                 'Firefox Sync: Crypto',
                                                 'Firefox Sync: UI',
                                                 'Android Sync',
                                                 'Server: Sync']);
addComponentMapping('thunderbird', 'Thunderbird');
addComponentMapping('thunderbird', 'MailNews Core');
addComponentMapping('seamonkey', 'SeaMonkey');
addComponentMapping('calendar', 'Calendar');
addComponentMapping('b2g', 'Boot2Gecko');
addComponentMapping('b2g', 'Core', ['DOM: Device Interfaces', 'Hardware Abstraction Layer (HAL)']);
addGithubComponentMapping('b2g', 'mozilla-b2g/gaia', 'mentored');
addComponentMapping('metro', 'Firefox for Metro');

addLanguageMapping('py', 'py');
addLanguageMapping('sh', 'shell');
addSimpleMapping('langs', 'sh', 'Core', 'Build Config');
addSimpleMapping('langs', 'sh', 'MailNews Core', 'Build Config');
addSimpleMapping('langs', 'java', 'Core', 'Widget: Android');
addSimpleMapping('langs', 'java', 'Mozilla Services', 'Android Sync');
addLanguageMapping('java', 'java');
addLanguageMapping('js', 'js');
addSimpleMapping('langs', 'js', 'Mozilla Services', 'Firefox Sync: Backend');
addLanguageMapping('cpp', 'c');
addLanguageMapping('html', 'html');
addLanguageMapping('html', 'css');

addSearchMapping('ownership', 'unowned',
                 {assigned_to: ['nobody@mozilla.org', 'general@js.bugs']}
                );

var interestingComponents = [];

var resultsCache = {};
var unfinishedResults = {};

function rebuildTableContents() {
  var t = document.getElementById('bugs');
  t.removeChild(document.getElementById('bugs_content'));

  function unique_list(list, tr) {
    var uniq = {};
    for (var idx in list) {
      var elem = list[idx];
      uniq[tr(elem).toString()] = elem;
    }
    var new_list = [];
    for (var prop in uniq) {
      new_list.push(uniq[prop]);
    }
    return new_list;
  }
  
  var orderedBugList = [];
  var results = {};
  for (var group in groups) {
    results[group] = [];
  }

  for (var idx in interestingComponents) {
    var cat = interestingComponents[idx];
    if (!(cat in resultsCache))
      continue;

    // Take unions within groups
    for (var group in groups) {
      if (groups[group].indexOf(cat) != -1) {
        var tmp = results[group].concat(resultsCache[cat]);
        results[group] = unique_list(tmp, function(bug) { return bug.id; });
      }
    }
  }

  // And take intersections between groups

  // First get all the bugs
  for (var group in results) {
    var tmp = orderedBugList.concat(results[group]);
    orderedBugList = unique_list(tmp, function(bug) { return bug.id; });
  }

  // Then remove those not in a given group
  for (var group in results) {
    if (!results[group].length) {
      // gross. don't intersect if no components are selected, but do if there are no results from
      // the selected components (ie. searching Python vs. Python+RelEng).
      if ('components' != group ||
          interestingComponents.filter(
            function(cat) { return groups['components'].indexOf(cat) != -1; }
          ).length == 0)
        continue;
    }

    var intersect_ids = results[group].map(function(bug) { return bug.id; });
    orderedBugList = orderedBugList.filter(function(bug) {
                                             return intersect_ids.indexOf(bug.id) != -1;
                                           });
  }

  orderedBugList.sort(function(a, b) { return b.id - a.id; }); // sort by ID descending

  var content = document.createElement('div');
  content.id = "bugs_content";
  for (idx in orderedBugList) {
    var bug = orderedBugList[idx];
    var elem = document.createElement('div');
    var inner = document.createElement('span');
    var link = document.createElement('a');
    elem.setAttribute('tabindex', '0');
    var url = bug.html_url || "http://bugzil.la/" + bug.id;
    link.setAttribute('href', url);
    link.setAttribute('target', "_blank");
    var text = document.createTextNode(bug.id);
    var text2 = document.createTextNode(" - " + bug.summary);
    elem.appendChild(inner);
    link.appendChild(text);
    inner.appendChild(link);
    inner.appendChild(text2);

    var daysOld = timeFromModified(orderedBugList[idx].last_change_time);

    elem.setAttribute('class', "bug moreInfo");
    if (daysOld !== 1) {
        elem.setAttribute('alt', daysOld + " days since last update<br /> Assigned to : " + orderedBugList[idx].assigned_to.real_name);
    }else{
        elem.setAttribute('alt', daysOld + " day since last update<br /> Assigned to : " + orderedBugList[idx].assigned_to.real_name);
    }


    content.appendChild(elem);
  }
  if (orderedBugList.length == 0 || interestingComponents.length == 0) {
    var elem = document.createElement('div');
    var inner = document.createElement('span');
    var text = document.createTextNode(interestingComponents.length == 0 ?
                                       'No categories specified' :
                                       'No bugs found');
    inner.appendChild(text);
    elem.appendChild(inner);
    content.appendChild(elem);
    elem.setAttribute('class', 'bug');
  }
  t.appendChild(content);
  
  document.getElementById('total').textContent = '(' + orderedBugList.length + ')';

  document.getElementById('throbber').style.visibility = "hidden";
  
  jQuery('.moreInfo').each(function(count){
          var qt = jQuery(this).qtip({
              content: jQuery(this).attr('alt'),
              prerender: true,
              show: {
                event: 'focus mouseover'
              },
              position: {
                  my: 'center left',
                  at: 'center right',
                  target: jQuery('.moreInfo:eq('+count+')')
              },
              style: {
                  classes: 'ui-tooltip-light ui-tooltip-shadow'
              },
              hide: {
                  fixed: true,
                  event: 'blur mouseout',
                  delay: 50,
                  leave: true
              },
              events: {
                  show: function(ev) {
                    $(qt).qtip("api").elements.tooltip[0].setAttribute('role', 'tooltip');
                    return true;
                  }
              }
          });
  });
}

function retrieveResults(category) {
  if (category in resultsCache) {
    rebuildTableContents();
    return;
  }  

  document.getElementById('throbber').style.visibility = "visible";

  var mapping = categoryMapping[category];
  var ghMapping = githubMapping[category] || [];
  var expectedResults = mapping.length + ghMapping.length;

  function processResult(msg, results) {
    if (!(category in unfinishedResults))
      unfinishedResults[category] = [];
    unfinishedResults[category].push.apply(unfinishedResults[category],
                                           results);
    expectedResults--;
    if (expectedResults == 0) {
      unfinishedResults[category] =
        unfinishedResults[category].sort(function(a, b) { return b.id - a.id; });
      resultsCache[category] = [];
      if (unfinishedResults[category].length > 0)
        resultsCache[category].push(unfinishedResults[category][0]);
      for (var i = 1; i < unfinishedResults[category].length; i++) {
        if (unfinishedResults[category][i].id != unfinishedResults[category][i-1].id)
          resultsCache[category].push(unfinishedResults[category][i]);
      }
      delete unfinishedResults[category];
      rebuildTableContents();
    }
  }

  for (var i = 0; i < mapping.length; i++) {
    var searchParams = {status_whiteboard: 'mentor=',
                        whiteboard_type: 'contains_all',
                        bug_status: ["NEW","ASSIGNED","REOPENED", "UNCONFIRMED"],
                        /*component_type: 'equals',*/
                        product: ''};
    for (var param in mapping[i]) {
      if (!(param in searchParams))
        searchParams[param] = [];
      if (typeof(searchParams[param]) == "string")
        searchParams[param] += " " + mapping[i][param];
      else {
        for (var j = 0; j < mapping[i][param].length; j++)
          searchParams[param].push(mapping[i][param][j]);
      }
    }
    bugzilla.searchBugs(searchParams, processResult);
  }
  
  for (var i = 0; i < ghMapping.length; i++) {
    (function(i) {
       var curMap = ghMapping[i];
       var user = curMap.repo.split('/')[0];
       var name = curMap.repo.split('/')[1];
       var apiCall = 'repos/' + user + '/' + name + '/issues?labels=' + curMap.tag;
       $.getJSON('cgi-bin/githubapi.cgi?url=' + encodeURIComponent(apiCall),
                null, function(data) {
         for (var d in data) {
           data[d].id = data[d].number;
           data[d].assigned_to = data.assignee || {real_name: "nobody"};
           data[d].summary = user + '/' + name + ' - ' + data[d].title;
           data[d].last_change_time = data[d].updated_at;
         }
         processResult(null, data);
      });
     })(i);
  }
}

function toggleCategory(e)
{
  var id = e.target.getAttribute('id');
  var extra = document.getElementById(id + "-extra");
  if (e.target.checked) {    
    interestingComponents.push(id);
    if (extra)
      extra.style.display = "table";
    retrieveResults(id);
  } else {
    var idx = interestingComponents.indexOf(id);
    if (idx != -1)
      interestingComponents.splice(idx, 1);
    if (extra)
      extra.style.display = "none";
    rebuildTableContents();
  }
  
  var query = [];
  var checks = document.getElementsByTagName("input");
  for (var i = 0; i < checks.length; i++) {
    if (checks[i].type != "checkbox")
      continue;
    if (checks[i].checked) {
      query.push(checks[i].id + "=1");
    }
  }
  history.replaceState(null, '', window.location.pathname + '?' + query.join('&'));
}

