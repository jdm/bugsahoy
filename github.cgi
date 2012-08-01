#!/usr/bin/env python

# enable debugging
import cgitb
import cgi
import urllib2
#import zlib
from StringIO import StringIO
import gzip
cgitb.enable()

print "Content-Type: text/json;charset=utf-8"
print

form = cgi.FieldStorage()
repo = urllib2.unquote(form.getfirst('repo'))
label = form.getfirst('label')
url = 'https://api.github.com/repos/'+repo+'/issues?labels='+label
req = urllib2.Request(url, None, {'Accept': 'application/vnd.github.raw',
                                  'Accept-Encoding': 'gzip'})
f = urllib2.urlopen(req)
if f.info().get('Content-Encoding') == 'gzip':
    buf = StringIO(f.read())
    f = gzip.GzipFile(fileobj=buf)
print f.read()
