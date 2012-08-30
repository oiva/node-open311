/**
 * Node-Open311: A Node.js module for interacting with the Open311 API.
 * 
 * @copyright 2011 Mark J. Headd (http://www.voiceingov.org)
 * @author Mark J. Headd
 * 
 */

// Include required Node.js modules.
var http = require('http');
var https = require('https');
var request = require('request');
var qs = require('querystring');
var __ = require('lodash');
var xmlParser = require('xml2json');

/**
 * Class constructor
 * @constructor
 * @param options Open311 settings.
 */
var Open311 = module.exports = function(options) {
  this.endpoint = options.endpoint;
  //this.service_path = options.service_path;
  if (options.jurisdiction) {
    this.jurisdiction = options.jurisdiction;
  }

  if(options.apiKey) {
    this.apiKey = options.apiKey;
  }

  this.format = options.format || 'json';
  //this.secure = options.secure || false;
  //this.port = options.port || 80;
  //this.responseBody = "";
};

/**
 * Service discovery.
 * @param format json|xml
 * @param callback Function to be executed on response from API.
 * @see http://wiki.open311.org/Service_Discovery
 */
Open311.prototype.serviceDiscovery = function(format, callback) {
  var path = this.service_path + 'discovery.' + format;
  this.makeAPICall('GET', path, callback);
};

/**
 * Get a list of service requests.
 * @param callback Function to be executed on response from API.
 * @see http://wiki.open311.org/GeoReport_v2#GET_Service_List
 */
Open311.prototype.serviceList = function(callback) {
  var self = this, data;
  this._get('services', function(err, body) {
    if (err) {
      callback (err, body);
      return;
    }

    if (self.format === 'xml') {
      data = xmlParser.toJson(body, {object: true}).services.service;
    }
    else {
      data = JSON.parse(body);
    }
    callback(null, data);
  });
};

/**
 * Get the attributes associated with a specific service code.
 * @param format json|xml
 * @param service_code The service code to be looked up.
 * @param callback Function to be executed on response from API.
 * @see http://wiki.open311.org/GeoReport_v2#GET_Service_Definition
 */
Open311.prototype.serviceDefinition = function(service_code, callback) {
  var self = this, data, i;
  this._get('services/' + service_code, function(err, body) {
    if (err) {
      callback (err, body);
      return;
    }

    if (self.format === 'xml') {
      data = xmlParser.toJson(body, {object: true}).service_definition;
      data.attributes = data.attributes.attribute;
      for (i = 0; i < data.attributes.length; i++) {
        if (data.attributes[i].values.value) {
          data.attributes[i].values = data.attributes[i].values.value;
        }
        else {
          data.attributes[i].values = null;
        }
      }
    }
    else {
      data = JSON.parse(body);
    }

    callback(null, data)
  });
};

/**
 * Submit a new service request.
 * @param data An object with keys/values used form post
 * @param callback Function to be executed on response from API.
 * @see http://wiki.open311.org/GeoReport_v2#POST_Service_Request
 */
Open311.prototype.submitRequest = function(data, callback) {
  var self = this, resData;
  if (typeof self.apiKey === 'undefined') {
    throw new Error('Submitting a Service Request requires an API Key');
  }
  else {
    data.api_key = self.apiKey;
  }

  this._post('requests', data, function(err, body) {
    if (err) {
      callback (err, body);
      return;
    }

    if (self.format === 'xml') {
      resData = xmlParser.toJson(body, {object: true}).service_requests.request;
      resData = [ resData ] // object needs to be wrapped in an array
    }
    else {
      resData = JSON.parse(body);
    }

    callback(null, resData);
  });
};

/**
 * Get a service request ID from a temporary token.
 * @param format json|xml
 * @param token The temporary token ID.
 * @param callback Function to be executed on response from API.
 * @see http://wiki.open311.org/GeoReport_v2#GET_request_id_from_a_token
 */
Open311.prototype.token = function(token, callback) {
  var self = this, data;
  this._get('tokens/' + token, function(err, body) {
    if (err) {
      callback (err, body);
      return;
    }

    if (self.format === 'xml') {
      data = xmlParser.toJson(body, {object: true}).service_requests.request;
    }
    else {
      data = JSON.parse(body);
    }
    callback(null, data);
  });
};

/**
 * Get the status of a single/multiple service requests.
 * @param service_request_id (optional) The ID (string/numeric) of a single service request you want to return
 * @param parameters (optional) url parameters
 * @param callback Function to be executed on response from API.
 * @see http://wiki.open311.org/GeoReport_v2#GET_Service_Request
 */
Open311.prototype.serviceRequests = function(serviceRequestId, params, callback) {
  var self = this, url, data;

  // check if there is a service_request_id
  if(__.isObject(serviceRequestId)) {
    params = serviceRequestId;
    serviceRequestId = false;
  }
  // check if there are params
  if (__.isFunction(params)) {
    callback = params;
    params = {};
  }

  if (serviceRequestId) {
    url = 'requests/' + serviceRequestId;
  }
  else {
    url = 'requests';
  }

  this._get(url, params, function(err, body) {
    if (err) {
      callback (err, body);
      return;
    }

    if (self.format === 'xml') {
      data = self._parseServiceRequestsXml(body);
    }
    else {
      data = JSON.parse(body);
    }
    callback(null, data);
  });
};

/**
 * Get the status of a single service request.
 * Alias of serviceRequests()
 */
Open311.prototype.serviceRequest = Open311.prototype.serviceRequests;

/**
 * Utility method for parsing Service Requests XML
 * @param xml 
 */

Open311.prototype._parseServiceRequestsXml = function(xml) {
  var data;
  data = xmlParser.toJson(xml, {object: true}).service_requests.request;
  return data;
}

/**
 * Utility method for making a GET request to the Open311 API. 
 * @param path e.g. 'services'
 * @param params (optional) url parameters
 * @param callback Function to be executed on response from API.
 */
Open311.prototype._get = function(path, params, callback) {
  var self = this;
  // make params optional
  if (__.isFunction(params)) {
    callback = params;
    params = {};
  }

  // make sure the jurisdiction_id is set
  if (this.jurisdiction) {
    params.jurisdiction_id = params.jurisdiction_id || this.jurisdiction;
  }

  // make our GET request
  request.get({
    url: this.endpoint + path + '.' + this.format, 
    qs: params
  }, function (err, res, body) {
    if (res.statusCode !== 200) {
      callback(true, 'There was an error connecting to the Open311 API: ' + res.statusCode);
      return;
    }
    callback(false, body);
  });
}

Open311.prototype._post = function(path, form, params, callback) {
  var self = this;
  // make params optional
  if (__.isFunction(params)) {
    callback = params;
    params = {};
  }

  // make sure the jurisdiction_id is set
  if (this.jurisdiction) {
    params.jurisdiction_id = params.jurisdiction_id || this.jurisdiction;
  }

 // make our GET request
  request.post({
    url: this.endpoint + path + '.' + this.format,
    qs: params,
    form: form
  }, function (err, res, body) {
    if (res.statusCode >= 300) {
      console.log(body);
      callback(res.statusCode, 'There was an error connecting to the Open311 API: ' + res.statusCode + '; ' + body);
      return;
    }
    callback(false, body);
  });
}

/**
 * Utility method for making an HTTP request to the Open311 API. 
 * @param format json|xml
 * @param path The URI to send the HTTP request to.
 * @param callback Function to be executed on response from API.
 */
Open311.prototype.makeAPICall = function(method, path, callback) {

  var self = this;

  var content_type = method == 'POST' ? 'application/x-www-form-urlencoded' : 'text/plain';
  var request_headers = {
    'Content-Type' : content_type
  };
  var options = {
    host : this.endpoint,
    port : this.port,
    path : path,
    method : method,
    headers : request_headers
  };
  
  // Determine if SSL is used.
  if (this.secure) {
    var open311 = https.request(options, function(response){
      getResponse(response);
    });
    open311.end();
  }

  else {
    var open311 = http.request(options, function(response){
      getResponse(response);
    });
    open311.end();
  }
  
  // Simple utilty function to get HTTP response.
  function getResponse(response) {
    if (response.statusCode == 404) {
      callback(response.statusCode, 'There was an error connecting to the Open311 API: ');
    }
    else {
      response.setEncoding('utf8');
      response.on('data', function(chunk) {
        self.responseBody += chunk;
      });
      response.on('end', function() {
        callback(false, self.responseBody);
      }); 
    }
  }

};