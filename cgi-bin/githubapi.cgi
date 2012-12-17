#!/usr/bin/env python

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
url = urllib2.unquote(form.getfirst('url', ''))

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
req = urllib2.Request('https://api.github.com/%s' % url, data, {'Accept': 'application/vnd.github.raw',
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
