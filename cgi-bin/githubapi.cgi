#!/usr/bin/env python

# enable debugging
import cgitb
import cgi
import urllib2
from StringIO import StringIO
import gzip
import ConfigParser
import base64
cgitb.enable()

print "Content-Type: text/html;charset=utf-8"
print

form = cgi.FieldStorage()
url = urllib2.unquote(form.getfirst('url', ''))

#data = {}
#parts = url.split('?')
#if len(parts) > 1:
#    params = parts[1].split('&')
#    for param in params:
#        param_data = param.split('=')
#        data[param_data[0]] = param_data[1]

config = ConfigParser.RawConfigParser()
config.read('config')
try:
    user = config.get('github', 'username')
    passw = config.get('github', 'password')
except ConfigParser.NoSectionError:
    user = None
    passw = None

req = urllib2.Request('https://api.github.com/%s' % url, None, {'Accept': 'application/vnd.github.raw',
                                  'Accept-Encoding': 'gzip'})
if user and passw:
    base64string = base64.standard_b64encode('%s:%s' % (user, passw)).replace('\n', '')
    req.add_header("Authorization", "Basic %s" % base64string)

f = urllib2.urlopen(req)
if f.info().get('Content-Encoding') == 'gzip':
    buf = StringIO(f.read())
    f = gzip.GzipFile(fileobj=buf)
print f.read()
