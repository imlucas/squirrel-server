var express = require('express'),
  app = module.exports = express(),
  semver = require('semver'),
  fs = require('fs'),
  path = require('path'),
  nconf = require('nconf'),
  untildify = require('untildify');

nconf.argv().env().use('memory').defaults({
  port: 8080,
  releases: '~/squirrel-releases.json'
});

app.get('/releases/latest', function(req, res, next){
  fs.readFile(path.resolve(untildify(nconf.get('releases'))), 'utf-8', function(err, data){
    if(err) return next(err);

    var releases = JSON.parse(data), latest;
    releases.sort(function(a, b){
      return semver.compare(a.version, b.version);
    });

    latest = releases[0];

    if(semver.lt(req.param('version'), latest.version)) return res.send(200, latest);

    res.send(204);
  });
});
