/**
 * Create a new service request.
 */
var Open311 = require('../open311');
// Normally you'd just write require('open311') if installed through NPM

// We'll use Baltimore and have the endpoint URLs set automagically (well, it's all in the cities.json file)

// Create a new Open311 object.
var baltimore = new Open311('baltimore');

// Because we're writing to Baltimore, we need an API Key.
// The API Key we have (it's ours, but you can use it just this once!)
// Only works with the Baltimore Test endpoint, so we have to update that too
baltimore.apiKey = 'a0516130b5888e5fbe0f3ee6fee64671';
baltimore.endpoint = 'http://311test.baltimorecity.gov/open311/v2/';


// First we should retrieve a list of submittal Service Request Types
baltimore.serviceList(function(err, services) {
  if (err) { console.log('\n-- ERROR --\n', err); return; } // handle those errors!
  
  console.log('\n-- SERVICE LIST FOR BALTIMORE --');
	console.log(services);
  
  // We'll need to pick a type of service to submit a request for
  // so let's choose this one:
  // 
  // { service_code: '4f2be7109dc2f10cac000001',
  //   service_name: 'Trash, High Grass, or Weeds',
  //   metadata: true,
  //   type: 'batch',
  //   group: 'Trash & Unsightliness' }
  //
  // This tells us a few things:
  //   1. "metadata:true" means that we have to retrieve a service definition 
  //       with additional (possibly required!) fields to be completed for submission
  //   2. "type:batch" means that after we submit, we'll receive 
  //      a token NOT a service_request_id, but we'll deal with that
  //    
  var serviceCode = '4f2be7109dc2f10cac000001';
  
  // Retrieve the Service Definition because 'metadata:true'
  baltimore.serviceDefinition(serviceCode, function(err, definition){
    if (err) { console.log('\n-- ERROR --\n', err); return; } // handle those errors!
    
    console.log('\n-- SERVICE DEFINITION FOR "Trash, High Grass, or Weeds" --');
    console.log(definition);
    
    // Looks like there are two required fields (attributes) and each attribute
    // has two potential values. So let's create our request:  
    var newRequest = {
      'service_code': serviceCode,
      lat: 39.2833,                 // you'll probably want to be more accurate than this
      long: -76.6167,
      address: 'baltimore, MD',
      description: "Get off my lawn! " + new Date().getTime(), // JUST FOR TESTING, otherwise they de-dupe the request
      attributes: {
        'kind': 'residence',       // NOTE : In the Open311 specification you would have to describe the attributes
        'occupied': 'occupied'    //        as attribute[code]=key... but we have a convenience helper for this 
      }
    };
    
    // ... and actually make the POST
    baltimore.submitRequest(newRequest, function(err, data) {
      if (err) { console.log('\n-- ERROR --\n', err); return; } // handle those errors!
      
      console.log('\n-- WHAT WE RECEIVED BACK AFTER SUBMISSION --');
      console.log(data);
      
      // Because the Service Definition says this is type:batch, that means we only get back a token    
      var token = data[0].token;
      
      // and a place to store our service_request_id
      var requestId;
      
      // So now we need to try to exchange the token for an actual Service Request ID
      // (that's the only thing we can use the token for)
      console.log('\n-- WAITING 5 SECONDS TO EXCHANGE TOKEN --');
      var tryIndex = 1;
      
      // We'll check for a service_request_id every 5 seconds
      var tryToken = setInterval(function(){
        baltimore.token(token, function(err, data) {
          if (err) { console.log('\n-- ERROR --\n', err); return; } // handle those errors!
          
          console.log('\n-- TRY TO EXCHANGE TOKEN (%d SECONDS)--', 5 * tryIndex++);
          console.log(data);
          
          // YEAH! we got a service_request_id
          if (data[0].service_request_id) {
            clearInterval(tryToken);
            requestId = data[0].service_request_id;
            
            // FINALLY! we'll fetch the single service request by its ID #
            baltimore.serviceRequests(requestId, function(err, data) {
              if (err) { console.log('\n-- ERROR --\n', err); return; } // handle those errors!
    
              console.log('\n-- SERVICE REQUEST WITH ID: %s --', requestId);
              console.log(data);
            });
          }
        })
      }, 5000); 
    });    
  });
});