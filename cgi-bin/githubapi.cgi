#!/usr/bin/env python2

# enable debugging
import cgitb
import cgi
import urllib2
from StringIO import StringIO
import gzip
import ConfigParser
import base64
import urllib
import logging
import sys
cgitb.enable()

print "Content-Type: text/html;charset=utf-8"
print

form = cgi.FieldStorage()
name = form.getfirst('name', '')
user = form.getfirst('user', '')
labels = urllib2.unquote(form.getfirst('labels', ''))
url = 'https://api.github.com/repos/%s/%s/issues?labels=%s' % (user, name, urllib2.quote(labels))

config = ConfigParser.RawConfigParser()
config.read('./config')
try:
    user = config.get('github', 'username')
    passw = config.get('github', 'password')
except ConfigParser.NoSectionError:
    user = None
    passw = None

token = form.getfirst('access_token', None)
data = form.getfirst('data', None)
method = form.getfirst('method', 'GET')

opener = urllib2.build_opener(urllib2.HTTPHandler)
#print "Fetching " + url
req = urllib2.Request(url, data, {'Accept': 'application/vnd.github.raw',
                                  'Accept-Encoding': 'gzip',
                                  'Content-Type': 'application/x-www-form-urlencoded'})
req.get_method = lambda: method
if token:
    req.add_header("Authorization", "token %s" % token)
elif user and passw:
    base64string = base64.standard_b64encode('%s:%s' % (user, passw)).replace('\n', '')
    req.add_header("Authorization", "Basic %s" % base64string)

f = opener.open(req)
if f.info().get('Content-Encoding') == 'gzip':
    buf = StringIO(f.read())
    f = gzip.GzipFile(fileobj=buf)
print f.read()
