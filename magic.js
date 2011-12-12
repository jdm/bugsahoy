var bugzilla = bz.createClient();

var categoryMapping = {};

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
}

function timeFromModified(lastChangeTime) {
	var lastModified = new Date(lastChangeTime);
	today = new Date();
	var one_day = 1000*60*60*24;
	return(Math.ceil((today.getTime() - lastModified.getTime()) / (one_day)));
}

function addLanguageMapping(cat, language) {
  addSearchMapping(cat, {status_whiteboard: 'lang=' + language});
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

var helpText = {
  a11y: "In human-computer interaction, computer accessibility (also known as Accessible computing) refers to the accessibility of a computer system to all people, regardless of disability or severity of impairment. It is largely a software concern; when software, hardware, or a combination of hardware and software, is used to enable use of a computer by a person with a disability or impairment, this is known as Assistive Technology.",
  gfx: "Computer graphics are graphics created using computers and, more generally, the representation and manipulation of image data by a computer with help from specialized software and hardware.<br>The development of computer graphics has made computers easier to interact with, and better for understanding and interpreting many types of data. Developments in computer graphics have had a profound impact on many types of media and have revolutionized animation, movies and the video game industry."
};

var interestingComponents = [];

var resultsCache = {};
var unfinishedResults = {};
var orderedBugList = [];

function rebuildTableContents() {
  var t = document.getElementById('bugs');
  t.removeChild(document.getElementById('bugs_content'));

  orderedBugList = [];
  for (var idx in interestingComponents) {
    var cat = interestingComponents[idx];
    var uniqueIds = orderedBugList.map(function(bug) { return bug.id; });
    if (cat in resultsCache) {
      orderedBugList.push.apply(orderedBugList,
                                resultsCache[cat].filter(
                                  function(bug) { return uniqueIds.indexOf(bug.id) == -1; }));
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
    link.setAttribute('href', "http://bugzil.la/" + bug.id);
    var text = document.createTextNode(bug.id);
    var text2 = document.createTextNode(" - " + bug.summary);
    elem.appendChild(inner);
    link.appendChild(text);
    inner.appendChild(link);
    inner.appendChild(text2);
    //elem.setAttribute('class', ["even", "odd"][idx % 2] + " bug");

    var daysOld = timeFromModified(orderedBugList[idx].last_change_time);
	
   	elem.setAttribute('class', "bug moreInfo");
   	elem.setAttribute('alt', daysOld + " Days Since Last Comment<br /> Assigned to : " + orderedBugList[idx].assigned_to.name);

	
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
  jQuery('.moreInfo').qtip({
      content: {
          attr: 'alt'
      },
      position: {
          my: 'bottom left',
          target: 'mouse',
          viewport: $(window),
          // Keep it on-screen at all times if possible
          adjust: {
              x: 10,
              y: 10
          }
      },
      hide: {
          fixed: true
          // Helps to prevent the tooltip from hiding ocassionally when tracking!
      },
		   style: {
		      classes: 'ui-tooltip-dark ui-tooltip-cluetip'
		   }
  })
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

function switchHelp(e)
{
  /*var id = e.target.getAttribute('for');
  var box = document.getElementById("help");
  box.innerHTML = helpText[id];
  box.style.display = "table";*/
}


