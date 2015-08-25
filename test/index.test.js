var path = require('path');

process.env.releases = path.resolve(__dirname, './releases.json');

var request = require('supertest');
var app = require('../');

describe('Squirrel', function() {
  it('should send an update', function(done) {
    request(app)
      .get('/mongoscope-ci/releases/latest')
      .query({
        version: '0.0.0'
      })
      .expect(200)
      .end(done);
  });
  it('should not send an update if we already have the latest', function(done) {
    request(app)
      .get('/mongoscope-ci/releases/latest')
      .query({
        version: '100.0.1'
      })
      .expect(204)
      .end(done);
  });
});
