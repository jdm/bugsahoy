#!/usr/bin/env python2

# enable debugging
import cgitb
import cgi
import urllib2
import ConfigParser
import os
cgitb.enable()

form = cgi.FieldStorage()
url = urllib2.unquote(form.getfirst('url', ''))
code = form.getfirst('code', '')

config = ConfigParser.RawConfigParser()
config.read('./config')
id = config.get('github', 'app_id')
secret = config.get('github', 'app_secret')

data = {'client_id': id, 'redirect_uri': url, 'client_secret': secret, 'code': code}

req = urllib2.Request('https://github.com/login/oauth/access_token?' +
                      'client_id=%s&redirect_uri=%s&client_secret=%s&code=%s' %
                      (id, 'http://%s%s?url=%s' % (os.environ['SERVER_NAME'], os.environ['REQUEST_URI'], url), secret, code))
f = urllib2.urlopen(req)

results = f.read()

print 'Status: 303'
print 'Location: %s?%s' % (url, results)
print "Content-Type: text/html;charset=utf-8"
print
print "<html><body><a href=%s?%s>Click here if you're not redirected automatically</a></body></html>" % (url, results)
