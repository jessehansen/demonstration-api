'use strict';
var fs = require('fs');
var logger = new (require('@leisurelink/skinny-loggins'))();
logger.transports.console.level = 'debug';

var TrustedClient = require('trusted-client').TrustedClient;

var client = new TrustedClient({
  keyId: 'authentic/self',
  key: fs.readFileSync('../authentic-api/test/test-key.pem'),
  log: logger
});


client.request('http://localhost:3000/', {method:'GET'}, function(err, response, body){
  if (err) {
    logger.error(err);
  } else {
    logger.info('response ' + response.statusCode);
    logger.debug(body);
    process.exit(0);
  }
});
