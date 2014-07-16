var express = require('express'),
  app = module.exports = express(),
  semver = require('semver'),
  nconf = require('nconf'),
  App = require('./models'),
  request = require('request');

nconf.argv().env().use('memory').defaults({
  port: 8080
});

var apps = {
  'mongoscope-ci': {
    repo: 'imlucas/mongoscope-ci',
    filename: function(req){
      var platform = req.param('os', 'osx');
      if(platform === 'darwin'){
        platform = 'osx';
      }
      else {
        platform = 'linux';
      }

      return new RegExp('mongoscope-ci_' + platform);
    }
  },
  'mongoscope': {
    repo: '10gen/mongoscope',
    filename: function(req){
      var platform = req.param('os', 'osx');
      if(platform === 'darwin'){
        platform = 'osx';
      }
      else {
        platform = 'linux';
      }

      return new RegExp('mongoscope(-server)?_' + platform);
    }
  }
};

app.set('views', __dirname + '/views');
app.set('view engine', require('jade').__express);

app.param('app', function(req, res, next, name){
  req.locals = {
    app: App.get(name, apps[name].repo),
    filename: apps[name].filename
  };
  next();
});

app.param('v', function(req, res, next, v){
  req.locals.app.version(v, function(err, release){
    if(err) return next(err);

    req.locals.release = release;
    next();
  });
});

app.get('/:app/install', function(req, res, next){
  app.render('install.jade', {
    app: req.locals.app,
    url: 'http://' + req.headers.host
  }, function(err, text){
    if(err) return next(err);
    res.set('Content-Type', 'text/plain');
    res.send(text);
  });
});

app.get('/:app/releases/:v', function(req, res){
  res.send(req.locals.release);
});

app.get('/:app/releases/:v/download', function(req, res){
  var wanted = req.locals.filename(req);
  var asset = req.locals.release.assets.filter(function(asset){
    return wanted.test(asset.name);
  })[0];

  if(!asset){
    console.log('No asset named ', wanted, 'in the release');
    return res.send(404);
  }
  console.log('Proxying to asset', asset.browser_download_url);
  // @todo: doesnt work for private repos. :(
  request(asset.browser_download_url, {headers: {
      'User-Agent': '@imlucas/github-release uploader'
    }}).pipe(res);
});

app.get('/:app/releases/latest', function(req, res, next){
  req.locals.app.latest(function(err, latest){
    if(err) return next(err);

    if(semver.lt(req.param('version'), latest.version)){
      return res.send(200, latest);
    }

    res.send(204);
  });
});
