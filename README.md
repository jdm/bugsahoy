Bugs Ahoy! is an effort to help new Mozilla contributors make sense of the mass
of bugs that are recommended for newcomers. By performing searches for aggregated
components based on less granular areas of interest, smaller, more focused lists
of relevant bugs can be shown, making the experience more pleasant for everybody
involved.

To run a local copy:

* clone this repository
* add a `config` file in the root dir that contains the following:
<pre>
[github]
username = yourusername
password = yourpassword
</pre>

* run `python -m CGIHTTPServer` in the repository root and visit `localhost:8000`

Authors:

* Josh Matthews <josh@joshmatthews.net>
* Casey Becking <caseybecking on github>

Special thanks to Heather Arthur for bz.js (https://github.com/harthur/bz.js)
