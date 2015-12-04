'use strict';

require('./app_default_env');

var express = require('express');
var config = new (require('env-configurator'))();
var spec = require('./config/demonstration-spec');
var logger = new (require('@leisurelink/skinny-loggins'))();

var fs = require('fs');

config.fulfill(spec, function(errs){
  if (errs) {
    for (var i = 0; i < errs.length; i++) {
      logger.error('Configuration error:', errs[i]);
    }
    process.exit(1);
  }

  var myKey = fs.readFileSync(config.get(spec.name, '#/trusted_endpoint/key_file'), 'utf8');
  var issuerKey = fs.readFileSync(config.get(spec.name, '#/jwt/issuer_key'), 'utf8');

  var authenticClient = new (require('authentic-client'))(
    config.get(spec.name, '#/authentic/url'),
    config.get(spec.name, '#/trusted_endpoint/key_id'),
    new Buffer(myKey),
    logger
  );
  var authScope = new (require('auth-context').AuthScope)({
    issuer: config.get(spec.name, '#/jwt/issuer'),
    audience: config.get(spec.name, '#/jwt/audience'),
    issuerKey: issuerKey,
    authority: authenticClient,
    log: logger
  });
  var localAuthority = require('trusted-endpoint').Modules.LocalAuthority(authScope, authenticClient, logger, config.get(spec.name, '#/trusted_endpoint/key_id'), 1000);

  var app = express();

  app.get('/', function (req, res) {
    res.send('Configured setting value: ' + (config.get(spec.name, '#/example') || 'unconfigured'));
  });

  var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    logger.info('Example app listening at http://%s:%s', host, port);
  });
});
