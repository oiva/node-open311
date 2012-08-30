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
  });

  describe('._post()', function() {
    var open311 = new Open311({
      endpoint: 'http://app.311.dc.gov/CWI/Open311/v2/',
      format: 'xml',
      jurisdiction: 'dc.gov'
    });

    beforeEach(function(done){
      sinon.stub(request, 'post');
      done();
    });

    afterEach(function(done){
      request.post.restore();
      done();
    });

    it('should should allow the `params` argument to be optional', function(done) {
      open311._post('services', {}, function(err, body) {}) // shouldn't throw an exception
      done();      
    });

    it('should correctly format the URL', function(done) {
      open311._post('requests', {}, function(err, body) {});
      expect(request.post.firstCall.args[0].url).to.equal('http://app.311.dc.gov/CWI/Open311/v2/requests.xml');
      done();
    });

    it('should set the jurisdiction_id parameter', function(done) {
      open311._post('requests', {}, function(err, body) {});
      expect(request.post.firstCall.args[0].qs.jurisdiction_id).to.equal('dc.gov');
      done();
    });
  });

  describe('.serviceList()', function() {
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

    it('should correctly set the `/services` URL', function(done) {
      open311.serviceList(function(err, data) {});
      expect(request.get.firstCall.args[0].url).to.equal('http://app.311.dc.gov/CWI/Open311/v2/services.xml');
      done();
    });

    it('should convert XML to json/object', function(done) {
      var xml = fs.readFileSync(__dirname + '/mocks/dc-services.xml', 'utf8');
      // Mock request.get to return the XML when called
      request.get.callsArgWith(1, true, {statusCode: 200}, xml);
      open311.serviceList(function(err, data) {
        expect(data).to.not.be.a('string');
        done();
      });
    });

    it('should cleanup nested XML lists', function(done) {
      var xml = fs.readFileSync(__dirname + '/mocks/dc-services.xml', 'utf8');
      // Mock request.get to return the XML when called
      request.get.callsArgWith(1, false, {statusCode: 200}, xml);
      open311.serviceList(function(err, data) {
        expect(data).to.be.an('array');
        done();
      });
    });
  });

  describe('.serviceDefinition()', function() {
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

    it('should correctly set the `/services/:service_code` URL', function(done) {
      open311.serviceDefinition('S0301', function(err, data) {});
      expect(request.get.firstCall.args[0].url).to.equal('http://app.311.dc.gov/CWI/Open311/v2/services/S0301.xml');
      done();
    });

    it('should convert XML to json/object', function(done) {
      var xml = fs.readFileSync(__dirname + '/mocks/dc-services-S0301.xml', 'utf8');
      // Mock request.get to return the XML when called
      request.get.callsArgWith(1, true, {statusCode: 200}, xml);
      open311.serviceDefinition('S0301', function(err, data) {
        expect(data).to.not.be.a('string');
        done();
      });
    });

    it('should cleanup nested XML wrapper', function(done) {
      var xml = fs.readFileSync(__dirname + '/mocks/dc-services-S0301.xml', 'utf8');
      // Mock request.get to return the XML when called
      request.get.callsArgWith(1, false, {statusCode: 200}, xml);
      open311.serviceDefinition('S0301', function(err, data) {
        expect(data.service_code).to.exist;
        done();
      });
    });

    it('should cleanup nested XML `attributes array`', function(done) {
      var xml = fs.readFileSync(__dirname + '/mocks/dc-services-S0301.xml', 'utf8');
      // Mock request.get to return the XML when called
      request.get.callsArgWith(1, false, {statusCode: 200}, xml);
      open311.serviceDefinition('S0301', function(err, data) {
        expect(data.attributes).to.be.an('array');
        done();
      });
    });

    it('should cleanup nested XML `attributes[].values arrays`', function(done) {
      var xml = fs.readFileSync(__dirname + '/mocks/dc-services-S0301.xml', 'utf8');
      // Mock request.get to return the XML when called
      request.get.callsArgWith(1, false, {statusCode: 200}, xml);
      open311.serviceDefinition('S0301', function(err, data) {
        expect(data.attributes[1].values).to.be.an('array');
        done();
      });
    });

    it('should cleanup nested XML and set empty `attributes[].values` to null', function(done) {
      var xml = fs.readFileSync(__dirname + '/mocks/dc-services-S0301.xml', 'utf8');
      // Mock request.get to return the XML when called
      request.get.callsArgWith(1, false, {statusCode: 200}, xml);
      open311.serviceDefinition('S0301', function(err, data) {
        expect(data.attributes[0].values).to.be.a('null');
        done();
      });
    });
  });
});