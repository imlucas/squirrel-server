var gh = require('github-release');
var semver = require('semver');

function App(name, repo) {
  this.name = name;
  this.repo = repo;
  this._data = [];
}

App.prototype.list = function(fn) {
  return this.data(fn);
};

App.prototype.data = function(fn) {
  gh.list(process.env.GITHUB_TOKEN, this.repo, function(err, data) {
    if (err) return fn(err);
    this._data = data.map(function(release) {
      release.version = release.tag_name;
      return release;
    });
    this._data.sort(function(a, b) {
      return semver.rcompare(a.version, b.version);
    });
    fn(null, this._data);
  });
};

App.prototype.version = function(version, fn) {
  if (version === 'latest') return this.latest(fn);

  this.data(function(err) {
    if (err) return fn(err);
    var res = this._data.filter(function(r) {
      return r.version === version;
    });
    if (res.length !== 1) return fn(null, null);
    fn(null, res);
  });
};

App.prototype.latest = function(fn) {
  this.data(function(err, releases) {
    if (err) return fn(err);
    fn(null, releases[0]);
  });
};

var apps = {};
module.exports.get = function(name, repo) {
  if (!apps[name]) {
    apps[name] = new App(name, repo);
  }
  return apps[name];
};
