process.env.releases = __dirname + '/releases.json';

var request = require('supertest'),
  app = require('../');

describe('Squirrel', function(){
  it('should send an update', function(done){
    request(app)
      .get('/releases/latest')
      .query({version: '0.0.0'})
      .expect(200)
      .end(done);
  });
  it('should not send an update if we already have the latest', function(done){
    request(app)
      .get('/releases/latest')
      .query({version: '0.0.1'})
      .expect(204)
      .end(done);
  });
});
