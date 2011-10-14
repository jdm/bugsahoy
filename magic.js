var bugzilla = bz.createClient();

var categoryMapping = {
  a11y: ['Core!Disability Access APIs'],
  gfx: ['Core!Graphics', 'Core!GFX: Color Management', 'Core!Canvas: WebGL', 'Core!Canvas'],
  net: ['Core!Networking', 'Core!Networking: HTTP', 'Core!Networking: FTP',
        'Core!Networking: Cache', 'Core!Networking: Cookies', 'Core!Networking: File',
        'Core!Networking: JAR', 'Core!Networking: WebSockets'],
  mobile: ['Fennec', 'Core!Widget: Android'],
  js: ['Core!JavaScript Engine'],
  ff: ['Firefox', 'Toolkit'],
  py: ['Testing', 'Core!Build Config'],
  sh: ['Core!Build Config'],
  java: ['Core!Widget: Android']
};

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
    elem.setAttribute('class', ["even", "odd"][idx % 2]);
    content.appendChild(elem);
  }
  t.appendChild(content);
}

function retrieveResults(category) {
  if (category in resultsCache) {
    rebuildTableContents();
    return;
  }

  var mapping = categoryMapping[category];
  var expectedResults = mapping.length;
  for (var idx in mapping) {
    var params = mapping[idx].split('!');
    var searchParams = {whiteboard: 'mentor=',
                        whiteboard_type: 'contains',
                        product: params[0],
                        bug_status: ["NEW","ASSIGNED,REOPENED"]};
    if (params.length != 1) {
      searchParams.component = params[1];
    }
    bugzilla.searchBugs(searchParams,
      function(msg, results) {
        if (!(category in unfinishedResults))
          unfinishedResults[category] = [];
        unfinishedResults[category].push.apply(unfinishedResults[category],
                                               results);
        expectedResults--;
        if (expectedResults == 0) {
          resultsCache[category] = unfinishedResults[category];
          delete unfinishedResults[category];
          rebuildTableContents();
        }
      });
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
  var id = e.target.getAttribute('for');
  var box = document.getElementById("help");
  box.innerHTML = helpText[id];
  box.style.display = "table";
}