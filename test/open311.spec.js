var expect = require('chai').expect;
var sinon = require('sinon');
var Open311 = require('../open311');
var request = require('request');
var fs    = require('fs');

describe('Open311()', function() {
  describe('new Open311()', function() {
    var open311;

    before(function(done) {
      open311 = new Open311({
        endpoint: 'http://app.311.dc.gov/CWI/Open311/v2/',
        format: 'xml',
        jurisdiction: 'dc.gov'
      });
      done();
    });

    it("should attach options to `this`", function(done) {
      expect(open311.endpoint).to.equal('http://app.311.dc.gov/CWI/Open311/v2/');
      expect(open311.format).to.equal('xml');
      expect(open311.jurisdiction).to.equal('dc.gov');
      done();
    });
  });

  describe('._get()', function() {
    var open311 = new Open311({
      endpoint: 'http://app.311.dc.gov/CWI/Open311/v2/',
      format: 'xml',
      jurisdiction: 'dc.gov'
    });

    beforeEach(function(done){
      sinon.stub(request, 'get');
      done();
    });

    afterEach(function(done){
      request.get.restore();
      done();
    });

    it('should should allow the `params` argument to be optional', function(done) {
      open311._get('services', function(err, body) {}) // shouldn't throw an exception
      done();      
    });

    it('should correctly format the URL', function(done) {
      open311._get('services', {}, function(err, body) {});
      expect(request.get.firstCall.args[0].url).to.equal('http://app.311.dc.gov/CWI/Open311/v2/services.xml');
      done();
    });

    it('should set the jurisdiction_id parameter', function(done) {
      open311._get('services', {}, function(err, body) {});
      expect(request.get.firstCall.args[0].qs.jurisdiction_id).to.equal('dc.gov');
      done();
    });

    it('should convert XML to json/object', function(done) {
      var xml = fs.readFileSync(__dirname + '/mocks/dc-services.xml', 'utf8');
      // Mock request.get to return the XML when called
      request.get.callsArgWith(1, true, {statusCode: 200}, xml);
      open311._get('services', function(err, body) {
        expect(body).to.be.an('object');
        done();
      });
    });
  });
});