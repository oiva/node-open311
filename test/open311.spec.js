var Open311 = require('../open311');

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
      open311.endpoint.should.equal('http://app.311.dc.gov/CWI/Open311/v2/');
      open311.format.should.equal('xml');
      open311.jurisdiction.should.equal('dc.gov');
      done();
    });
  });
});