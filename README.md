# Overview

A Node.js module for interacting with the Open311 API ([GeoReport v2](http://wiki.open311.org/GeoReport_v2)). This module is more than a simple wrapper; it attempts to normalize the response from different Open311 endpoints' _interpretation_ of the Open311 specification to return consistent results, regardless of implementation or format:

- All responses are returned as native javascript objects/arrays
- XML-only endpoints are parsed into native javascript objects/arrays that are consistent with JSON results
- Invalid responses (e.g. malformed JSON that some endpoints may return), are cleaned up and returned as native javascript objects/arrays

## Installation

`npm install open311`

## Brief Example

```
var Open311 = require('open311');
	
// Example Open311 Server: City of Baltimore 
// More options here: http://wiki.open311.org/GeoReport_v2/Servers
var options = {
  endpoint     : "http://311.baltimorecity.gov/open311/v2/",
  jurisdiction : "baltimorecity.gov"
};
	
// Create a new Open311 object.
var baltimore = new Open311(options);
	
// Call serviceRequest with service_request_id
// to get the status of a specific service request.
baltimore.serviceRequest('12-00677322', function(err, data){ 
  console.log(data); // do something with the data!
});
```

## Usage

### new Open311(options)

To use this library, you must instantiate a new Open311 object: `var open311 = new Open311(options)`. Available `options` include:

- `endpoint`: the URL of the Open311 server; required for all methods except `Open311.serviceDiscovery()`
- `jurisdiction`: (optional) the `jurisdiction_id` for a given city, if required
- `discovery`: the URL Service Discovery; required if using `Open311.serviceDiscovery()` method
- `format`: the format data should be requested in; only required for XML-only Open311 servers (default: `json`)
- `apiKey`: your API key; required if using `Open311.submitServiceRequest()` method

All methods use the standard `callback(err, data)` format.

### serviceDiscovery([options], callback)

Fetches a city's Service Discovery listing that has URLs of Open311 servers. (Standard: [Service Discovery](http://wiki.open311.org/Service_Discovery))

Optional options:

- `cache`: if `true` the fetched endpoints will set/overwrite the endpoint URL of the Open311 object (default: `false`)
- `type`: when caching, sets the `test` or `production` endpoint server (default: `production`)
- `specification`: when caching, sets the matching API specification of the endpoint server (default `http://wiki.open311.org/GeoReport_v2`);
- `index`: (optional) when caching, if the Service Discovery list multiple servers with identical production/specification settings, this is the index of the resulting matched servers (default: `0`)

```
var baltimore = new Open311({
  discovery: "http://311.baltimorecity.gov/open311/discovery.json"
});

// Make the API call
baltimore.serviceDiscovery({
  cache: true,
  type: "production"
}, function(err, data) {
  // `data` contains the content of the Service Discovery
  // `baltimore.endpoint` should now be set because 
  //  we set `cache: true`
});
```


### serviceList(callback)

Fetches a list of acceptable 311 service request types and their associated service codes. (Standard: [GET Service List](http://wiki.open311.org/GeoReport_v2#GET_Service_List))

```
// an example with Washington, DC, which is an XML-only endpoint
var dc = new Open311({
  "endpoint": "http://app.311.dc.gov/CWI/Open311/v2/",
  "format": "xml",
  "jurisdiction": "dc.gov"
});

// Make the API call
dc.serviceDiscovery(function(err, data) {
  // `data` contains a javascript array of javascript objects
});
```

### serviceDefinition(service_code, callback)

Fetches attributes associated with a service code. Those attributes may be required when submitting a new Service Request (Standard: [GET Service Definition
](http://wiki.open311.org/GeoReport_v2#GET_Service_Definition))

`service_code` is the string/number returned from an entry in `Open311.serviceList()`

### submitRequest(data, callback)

Submit a service request. (Standard: [POST Service Request](http://wiki.open311.org/GeoReport_v2#POST_Service_Request))

According to the Open311 specification, `data` must include:

- `service_code`
- `lat` & `long` _OR_ `address_string` _OR_ `address_id`: the specification is wiggly here, but `lat`/`long` is near universally required (despite the "OR")
- attributes (see `Open311.serviceDefinition`) set with the key `attribute[<code>]`

### token(token, callback)

Fetches the service_request_id from a temporary token that was received when submitting a Service Request. This is unnecessary if the response from creating a service request does not contain a token. 
(Standard: [GET service_request_id from a token](http://wiki.open311.org/GeoReport_v2#GET_service_request_id_from_a_token))

`token` should either be a string or number.

### serviceRequests([params], callback) 
Fetch a list of existing service requests based on query parameters (Standard: [GET Service Requests](http://wiki.open311.org/GeoReport_v2#GET_Service_Requests))

Optional params might include those on the existing standard, such as:

- `service_code`: filter the by the service request's service_code
- `start_date` / `end_date`: filter by the earliest/latest requested_datetime (when the request was submitted).
- `status`: filter by the status (`open`/`closed`)

Or params might include those not on the standard but widely supported, such as:

- `page` and `page_size`: for paging through results


### serviceRequest(service_request_id, callback)

Fetches an individual request by its `service_request_id`. (Standard: [GET Service Request](http://wiki.open311.org/GeoReport_v2#GET_Service_Request))
