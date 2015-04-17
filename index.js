var express = require('express'),
  app = module.exports = express(),
  semver = require('semver'),
  nconf = require('nconf'),
  App = require('./models');

nconf.argv().env().use('memory').defaults({
  port: 8080
});

app.use(function(req, res, next){
  var platform = req.param('os', 'osx');
  if(platform === 'darwin') platform = 'osx';
  req.platform = platform;
  next();
});

var apps = {
  'mongoscope-ci': {
    repo: 'imlucas/mongoscope-ci',
    filename: function(req){
      return new RegExp('mongoscope-ci_' + req.platform);
    }
  },
  'mongodb-bridge': {
    repo: 'imlucas/mongodb-bridge',
    filename: function(req){
      return new RegExp('mongodb-bridge_' + req.platform);
    }
  },
  'mongodb-dyno': {
    repo: 'imlucas/mongodb-dyno',
    filename: function(req){
      return new RegExp('mongodb-dyno_' + req.platform);
    }
  },
  'mongodb-dyno-runner': {
    repo: 'imlucas/mongodb-dyno',
    filename: function(req){
      return new RegExp('mongodb-dyno-runner_' + req.platform);
    }
  },
  'mongodb-runner': {
    repo: 'imlucas/mongodb-runner',
    filename: function(req){
      return new RegExp('mongodb-runner_' + req.platform);
    }
  },
  'mongoscope': {
    repo: '10gen/mongoscope',
    filename: function(req){
      return new RegExp('mongoscope(-server)?_' + req.platform);
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

function installScript(go){
  go = go || false;
  return function(req, res, next){
    var ctx = {
      app: req.locals.app,
      url: 'http://' + req.headers.host,
      go: go
    };
    app.render('install.jade', ctx, function(err, text){
      if(err) return next(err);
      res.set('Content-Type', 'text/plain');
      res.send(text);
    });
  };
}

app.get('/', function(req, res){
  res.set('Content-Type', 'text/plain');
  res.send([
    '                                _',
    '                          .-\'` `}',
    '                  _./)   /       }',
    '                .\'o   \ |       }',
    '                \'.___.\'`.\    {`',
    '                /`\_/  , `.    }',
    '                \=\' .-\'   _`\  {',
    '                 `\'`;/      `,  }',
    '                    _\       ;  }',
    '                   /__`;-...\'--\'',
    ].join('\n'));
});

app.get('/:app/install', installScript(false));
app.get('/:app/go', installScript(true));


app.get('/:app/releases', function(req, res, next){
  req.locals.app.list(function(err, releases){
    if(err) return next(err);
    res.send(releases);
  });
});

app.get('/:app/releases/:v', function(req, res){
  if(!req.locals.release){
    return res.status(404).send('No releases for this app.');
  }
  if(!req.param('version')) return res.send(req.locals.release);

  var want = req.param('version'),
    latest = req.locals.release,
    update = want === '0.0.0' || semver.lt(want, latest.version);

  return (update) ? res.send(200, latest) : res.send(204);
});

app.get('/:app/releases/:v/download', function(req, res){
  var wanted = req.locals.filename(req);
  var asset = req.locals.release.assets.filter(function(asset){
    return wanted.test(asset.name);
  })[0];

  if(!asset){
    console.log('No asset named ', wanted, 'in the release');
    return res.status(404).send('No asset named ' + wanted + 'in the release: ' + JSON.stringify(req.locals.release, null, 2));
  }
  res.redirect(asset.browser_download_url + '?access_token=' + process.env.GITHUB_TOKEN);
});
