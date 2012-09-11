/**
 * Service Discovery
 * A method to "discover" a city's Open311 endpoint URL
 * The list of discovery endpoints is available here:
 * http://wiki.open311.org/GeoReport_v2/Servers
 */
 
var Open311 = require('../open311');
// Normally you'd just write require('open311') if installed through NPM
 
// Configure out settings manually (for now). Let's look at Baltimore!
var options = {
  discovery: 'http://311.baltimorecity.gov/open311/discovery.json'
};

// Create a new Open311 object.
var baltimore = new Open311(options);

// Call serviceDiscovery to get details of the Open311 implementation.
baltimore.serviceDiscovery(function(err, data) {
  if (err) { console.log('\n-- ERROR --\n', err); return; } // handle those errors!
  
  console.log('\n-- SERVICE DISCOVERY FOR BALTIMORE --');
  console.log(data);
});

// That was fun; now let's save that data into our Open311 object
// by passing the option {cache: true} to serviceDiscovery
// so that we can then use the endpoint data to make subsequent queries
baltimore.serviceDiscovery({ cache: true }, function(err, data) {
  if (err) { console.log('\n-- ERROR --\n', err); return; } // handle those errors!
  
  console.log('\n-- UPDATED OPEN311 OBJECT --');
  console.log(baltimore);
  // See, now the baltimore object has it's endpoint/format data set
  // 
  // BEWARE: Service Discovery does NOT return the jurisdiction_id,
  //         so you may have to retrieve/set that manually if you are 
  //         setting up an endpoint manually.
});