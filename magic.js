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
	today = new Date();
	var one_day = 1000*60*60*24;
	return(Math.ceil((today.getTime() - lastModified.getTime()) / (one_day)));
}

function addComponentMapping(cat, prod, components) {
  addSimpleMapping('components', cat, prod, components);
}

function addLanguageMapping(cat, language) {
  addSearchMapping('langs', cat, {status_whiteboard: 'lang=' + language});
}

addComponentMapping('a11y', 'Core', 'Disability Access APIs');
addComponentMapping('gfx', 'Core',
                    ['Graphics',
                     'GFX: Color Management',
                     'Canvas: WebGL',
                     'Canvas: 2D',
                     'ImageLib']);
addComponentMapping('net', 'Core',
                    ['Networking',
                     'Networking: HTTP',
                     'Networking: Cookies',
                     'Networking: File',
                     'Networking: JAR',
                     'Networking: WebSockets',
                     'Networking: DNS']);
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
                     'DOM: Mozilla Extensions',
                     'DOM: Other',
                     'DOM: Traversal-Range',
                     'DOM: Validation',
                     'Geolocation',
                     'HTML: Form Submission']);
addComponentMapping('editor', 'Core', 'Editor');
addComponentMapping('mobile', 'Fennec');
addComponentMapping('mobile', 'Fennec Native');
addComponentMapping('mobile', 'Core', 'Widget: Android');
addComponentMapping('jseng', 'Core',
                    ['Javascript Engine',
                     'js-ctypes',
                     'XPConnect']);
addComponentMapping('media', 'Core', 'Video/Audio');
addComponentMapping('ff', 'Firefox');
addComponentMapping('ff', 'Toolkit');
addComponentMapping('ff', 'Mozilla Services', 'Firefox Sync: UI');
addComponentMapping('devtools', 'Firefox',
                    ['Developer Tools',
                     'Developer Tools: Console',
                     'Developer Tools: Debugger',
                     'Developer Tools: Inspector',
                     'Developer Tools: Scratchpad',
                     'Developer Tools: Style Editor']);
addComponentMapping('releng', 'mozilla.org', ['Release Engineering', 'Hg: Customizations']);
addComponentMapping('automation', 'Testing');
addComponentMapping('sync', 'Mozilla Services', ['Firefox Sync: Backend',
                                                 'Firefox Sync: Build',
                                                 'Firefox Sync: Crypto',
                                                 'Firefox Sync: UI',
                                                 'Android Sync',
                                                 'Server: Sync']);

addLanguageMapping('py', 'py');
addLanguageMapping('sh', 'shell');
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
    link.setAttribute('href', "http://bugzil.la/" + bug.id);
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
  var expectedResults = mapping.length;

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
                        bug_status: ["NEW","ASSIGNED","REOPENED"],
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
}

