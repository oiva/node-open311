/**
 * Retrieve Service Requests
 * Some helpful methods to retrieve existing service requests
 */
 
var Open311 = require('../open311');
// Normally you'd just write require('open311') if installed through NPM

// We'll use Baltimore and have the endpoint URLs set automagically (well, it's all in the cities.json file)

// Create a new Open311 object.
var baltimore = new Open311('baltimore');

// Use this to store a requestId we're looking up
var requestId;

// First lets retreive a whole mess of open service requests. 
// We'll pass a (non-standard!!) page_size query that Baltimore's endpoint
// supports to only receive the latest 5 requests
baltimore.serviceRequests({ 'status': 'open', 'page_size': 5 }, function(err, data) {
  if (err) { console.log('\n-- ERROR --\n', err); return; } // handle those errors!

  
  console.log('\n-- LAST 5 SERVICE REQUESTS IN BALTIMORE --');
  console.log(data);
  
  // Store the service_request_id of the first one we received
  requestId = data[0]['service_request_id'];
  
  // Then fetch just that single service request by its ID#
  baltimore.serviceRequests(requestId, function(err, data) {
    if (err) { console.log('\n-- ERROR --\n', err); return; } // handle those errors!
    
    console.log('\n-- SERVICE REQUEST WITH ID: %s --', requestId);
    console.log(data);
  });
});