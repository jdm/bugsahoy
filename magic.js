var bugzilla = bz.createClient();

var categoryMapping = {};
var resultOperation = {
  'union': [],
  'intersect': []
};

function addSearchMapping(cat, searchParams) {
  if (!(cat in categoryMapping))
    categoryMapping[cat] = [];
  categoryMapping[cat].push(searchParams);
}

function addSimpleMapping(cat, prod, components) {
  var params = {product: prod};
  if (components) {
    if (typeof(components) == "string")
      components = [components];
    params.component = components;
  }
  addSearchMapping(cat, params);
  resultOperation['union'].push(cat);
}

function timeFromModified(lastChangeTime) {
	var lastModified = new Date(lastChangeTime);
	today = new Date();
	var one_day = 1000*60*60*24;
	return(Math.ceil((today.getTime() - lastModified.getTime()) / (one_day)));
}

function addLanguageMapping(cat, language) {
  addSearchMapping(cat, {status_whiteboard: 'lang=' + language});
  resultOperation['intersect'].push(cat);
}

addSimpleMapping('a11y', 'Core', 'Disability Access APIs');
addSimpleMapping('gfx', 'Core', ['Graphics', 'GFX: Color Management', 'Canvas: WebGL', 'Canvas', 'Imagelib']);
addSimpleMapping('net', 'Core', ['Networking', 'Networking: HTTP', 'Networking: Cookies', 'Networking: File',
                                 'Networking: JAR', 'Networking: WebSockets']);
addSimpleMapping('mobile', 'Fennec');
addSimpleMapping('mobile', 'Fennec Native');
addSimpleMapping('mobile', 'Core', 'Widget: Android');
addSimpleMapping('jseng', 'Core', ['Javascript Engine', 'js-ctypes']);
addSimpleMapping('media', 'Core', 'Video/Audio');
addSimpleMapping('ff', 'Firefox');
addSimpleMapping('ff', 'Toolkit');

addLanguageMapping('py', 'python');
addLanguageMapping('sh', 'shell');
addSimpleMapping('java', 'Core', 'Widget: Android');
addLanguageMapping('java', 'java');
addLanguageMapping('js', 'js');
addLanguageMapping('cpp', 'c++');
addLanguageMapping('html', 'html');
addLanguageMapping('html', 'css');

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
  var intersector = [];
  for (var idx in interestingComponents) {
    var cat = interestingComponents[idx];
    if (!(cat in resultsCache))
      continue;
    if (resultOperation['union'].indexOf(cat) != -1) {
      orderedBugList = orderedBugList.concat(resultsCache[cat]);
      orderedBugList = unique_list(orderedBugList, function(bug) { return bug.id; });
    } else if (resultOperation['intersect'].indexOf(cat) != -1) {
      intersector = intersector.concat(resultsCache[cat]);
      intersector = unique_list(intersector, function(bug) { return bug.id; });
    }
  }
  if (intersector.length > 0) {    
    if (orderedBugList.length > 0) {
      var intersect_ids = intersector.map(function(bug) { return bug.id; });
      orderedBugList = orderedBugList.filter(function(bug) {
                                               return intersect_ids.indexOf(bug.id) != -1;
                                             });
    } else {
      orderedBugList = intersector;
    }
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
          jQuery(this).qtip({
              show: {
                event: 'focus mouseover'
              },
              content: jQuery(this).attr('alt'),
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

