var bugzilla = bz.createClient({url: 'https://bugzilla.mozilla.org/bzapi'});

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

function addGithubComponentMapping(cat, repos, tags, langs) {
  addGithubMapping('components', cat, repos, tags);
  for (var lang in langs) {
    addGithubMapping('langs', lang, repos, langs[lang]);
  }
}

addComponentMapping('a11y', 'Core', 'Disability Access APIs');
addComponentMapping('a11y', 'Firefox', 'Disability Access');
addSearchMapping('components', 'a11y', {keywords: ['access']});
addComponentMapping('bugzilla', 'Bugzilla',
                    ['Administration',
                     'Attachments & Requests',
                     'Bug Import/Export & Moving',
                     'Bugzilla-General',
                     'bugzilla.org',
                     'Creating/Changing Bugs',
                     'Documentation',
                     'Email Notifications',
                     'Extensions',
                     'QA Test Scripts',
                     'Query/Bug Lists',
                     'Testing Suite',
                     'User Accounts',
                     'User Interface',
                     'WebService',
                     'Whining']);
addComponentMapping('bugzilla', 'bugzilla.mozilla.org',
                    ['Administration',
                     'API',
                     'Bugzilla Tweaks',
                     'Developer Box',
                     'Extensions: AntiSpam',
                     'Extensions: BMO',
                     'Extensions: ComponentWatching',
                     'Extensions: MyDashboard',
                     'Extensions: Needinfo',
                     'Extensions: UserProfile',
                     'General',
                     'rbbz',
                     'Sandstone/Mozilla Skin',
                     'User Interface']);
addComponentMapping('build', 'Core', ['Build Config']);
addComponentMapping('build', 'MailNews Core', ['Build Config']);
addComponentMapping('gfx', 'Core',
                    ['Graphics', 'GFX: Color Management',
                     'Canvas: WebGL', 'Canvas: 2D', 'ImageLib', 'Graphics',
                     'Graphics: Layers', 'Graphics: Text', 'Panning and Zooming']);
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
                    ['CSS Parsing and Computation',
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
addComponentMapping('instantbird', 'Instantbird');
addComponentMapping('instantbird', 'Chat Core');
addComponentMapping('mobileandroid', 'Fennec');
addComponentMapping('mobileandroid', 'Firefox for Android');
addComponentMapping('mobileandroid', 'Core', ['Widget: Android', 'mozglue']);
addComponentMapping('mobileios', 'Firefox for iOS');
addComponentMapping('jseng', 'Core',
                    ['JavaScript Engine',
                     'JavaScript Engine: JIT',
                     'JavaScript: GC',
                     'JavaScript: Internationalization API',
                     'JavaScript: Standard Library',
                     'js-ctypes',
                     'XPConnect']);
addComponentMapping('media', 'Core', ['Video/Audio', 'WebRTC', 'WebRTC: Audio/Video',
                                      'WebRTC: Signalling']);
addComponentMapping('ff', 'Firefox');
addComponentMapping('ff', 'Toolkit');
addComponentMapping('ff', 'Mozilla Services', 'Firefox Sync: UI');
addComponentMapping('ff', 'Input', ['Frontend', 'General']);
addComponentMapping('ff', 'Loop', ['Client']);
addComponentMapping('devtools', 'Firefox',
                    ['Developer Tools',
                     'Developer Tools: 3D View',
                     'Developer Tools: App Manager',
                     'Developer Tools: Console',
                     'Developer Tools: Debugger',
                     'Developer Tools: Framework',
                     'Developer Tools: Graphic Commandline and Toolbar',
                     'Developer Tools: Inspector',
                     'Developer Tools: Netmonitor',
                     'Developer Tools: Object Inspector',
                     'Developer Tools: Profiler',
                     'Developer Tools: Responsive Mode',
                     'Developer Tools: Scratchpad',
                     'Developer Tools: Source Editor',
                     'Developer Tools: Style Editor']);
addComponentMapping('releng', 'mozilla.org', ['Hg: Customizations']);
addComponentMapping('releng', 'Release Engineering');
addComponentMapping('reporting', 'Tree Management');

// Mappings for various automation related tasks
addComponentMapping('automation', 'Firefox OS', 'Gaia::UI Tests');
addComponentMapping('automation', 'Mozilla QA', ['Firefox UI Tests',
                                                 'Infrastructure',
                                                 'Mozmill Tests']);
addComponentMapping('automation', 'Testing');
addGithubComponentMapping('automation', ['armenzg/mozilla_ci_tools',
					 'automatedtester/automation-services-bot',
                                         'automatedtester/powerball-platform',
                                         'automatedtester/testdaybot',
                                         'automatedtester/unittest-zero',
                                         'davehunt/flynnid',
                                         'davehunt/pytest-mozwebqa',
                                         'mozilla/bidpom',
                                         'mozilla/coversheet',
                                         'mozilla/memchaser',
                                         'mozilla/moz-grid-config',
                                         'mozilla/mozdownload',
                                         'mozilla/mozmill-ci',
                                         'mozilla/mozmill-automation',
                                         'mozilla/mozmill-dashboard',
                                         'mozilla/mozmill-environment',
                                         'mozilla/nightlytt',
                                         'whimboo/mozmill-crowd',], 'mentored',
                          {'css': 'css',
                           'html': 'html',
                           'js': 'javascript',
                           'py': 'python',
                           'sh': 'shell' });

addComponentMapping('oneanddone','Mozilla QA', 'One and Done');

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
addComponentMapping('b2g', 'Firefox OS');
addComponentMapping('b2g', 'Core', ['DOM: Device Interfaces', 'Hardware Abstraction Layer (HAL)']);
addGithubComponentMapping('b2g', 'mozilla-b2g/gaia', 'mentored');
addComponentMapping('metro', 'Firefox for Metro');
addComponentMapping('contentservices', 'Content Services', ['Interest Dashboard']);
addComponentMapping('webmaker', 'Webmaker', ['Badges',
                                             'Community',
                                             'DevOps',
                                             'Events',
                                             'General',
                                             'Login',
                                             'MakeAPI',
                                             'Marketing',
                                             'Popcorn Maker',
                                             'Projects',
                                             'Thimble',
                                             'popcorn.js',
                                             'webmaker.org']);
addGithubComponentMapping('webmaker', ['mozilla/butter',
                                       'mozilla/friendlycode',
                                       'mozilla/hackablegames',
                                       'mozilla/MakeAPI',
                                       'mozilla/openbadger',
                                       'mozilla/openbadges',
                                       'mozilla/openbadges-bakery',
                                       'mozilla/openbadges-validator',
                                       'mozilla/openbadges-validator-service',
                                       'mozilla/openbadges-verifier',
                                       'mozilla/popcorn-js',
                                       'benrito/popcorn-interim',
                                       'mozilla/popcorn-templates',
                                       'mozilla/popcorn_maker',
                                       'mozilla/popcorn-docs',
                                       'mozilla/popcornjs.org',
                                       'mozilla/webpagemaker',
                                       'mozilla/badges.mozilla.org',
                                       'mozilla/community.openbadges.org',
                                       'mozilla/content-2012.mozillafestival.org',
                                       'mozilla/events.webmaker.org',
                                       'mozilla/festival.mozilla.org',
                                       'mozilla/login.webmaker.org',
                                       'mozilla/make.mozilla.org',
                                       'mozilla/mofo-lighthouse-migration-test',
                                       'mozilla/openbadges.org',
                                       'mozilla/thimble.webmaker.org',
                                       'mozilla/webmaker.org',
                                       'mozilla/webmaker-nav',
                                       'mozilla/webmakers-tumblr',
                                       'mozilla/webmaker-firehose'],'mentored');

addComponentMapping('appsengineering', 'Developer Ecosystem', ['App Center', 'Apps', 'Dev Kit', 'Web Components']);
addSimpleMapping('langs', 'js', 'Developer Ecosystem');
addSimpleMapping('langs', 'html', 'Developer Ecosystem');

addGithubComponentMapping('servo', ['servo/servo'], 'E-easy');

addLanguageMapping('py', 'py');
addLanguageMapping('sh', 'shell');
addSimpleMapping('langs', 'sh', 'Core', 'Build Config');
addSimpleMapping('langs', 'sh', 'MailNews Core', 'Build Config');
addSimpleMapping('langs', 'java', 'Core', 'Widget: Android');
addSimpleMapping('langs', 'java', 'Mozilla Services', 'Android Sync');
addLanguageMapping('java', 'java]');
addLanguageMapping('js', 'js');
addSimpleMapping('langs', 'js', 'Mozilla Services', 'Firefox Sync: Backend');
addLanguageMapping('cpp', 'c++');
addSimpleMapping('langs', 'perl', 'Bugzilla');
addSimpleMapping('langs', 'perl', 'bugzilla.mozilla.org');
addLanguageMapping('html', 'html');
addLanguageMapping('html', 'css');
addLanguageMapping('xml', 'xul');
addLanguageMapping('xml', 'xml');

addSearchMapping('ownership', 'unowned',
                 {assigned_to: ['nobody@mozilla.org', 'general@js.bugs']}
                );
addSearchMapping('simple', 'simple', {status_whiteboard: 'good first bug'});

var interestingComponents = [];

var resultsCache = {};
var unfinishedResults = {};
var pendingRequests = 0;

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

  if (pendingRequests === 0) {
    document.getElementById('throbber').style.visibility = "hidden";
  }

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

  pendingRequests++;
  document.getElementById('throbber').style.visibility = "visible";

  var mapping = categoryMapping[category] || [];
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
      pendingRequests--;
      rebuildTableContents();
    }
  }

  for (var i = 0; i < mapping.length; i++) {
    var searchParams = {f1: 'bug_mentor',
                        o1: 'isnotempty',
                        whiteboard_type: 'contains_all',
                        bug_status: ["NEW","ASSIGNED","REOPENED", "UNCONFIRMED"],
                        include_fields: ["id","assigned_to","summary","last_change_time"],
                        /*component_type: 'equals',*/
                        product: ''};
    for (var param in mapping[i]) {
      if (typeof(mapping[i][param]) == "string") {
        if (!(param in searchParams))
          searchParams[param] = mapping[i][param];
        else
          searchParams[param] += " " + mapping[i][param];
      } else {
        if (!(param in searchParams))
          searchParams[param] = [];
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
      }).error(function() { processResult(null, []); });
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
