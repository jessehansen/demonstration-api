'use strict';

require('./app_default_env');

var express = require('express');
var config = new (require('env-configurator'))();
var spec = require('./config/demonstration-spec');
var logger = new (require('@leisurelink/skinny-loggins'))();
var trusted_endpoint = require('trusted-endpoint');
logger.transports.console.level = 'debug';

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
  var localAuthority = trusted_endpoint.Modules.LocalAuthority(authScope, authenticClient, logger, config.get(spec.name, '#/trusted_endpoint/key_id'), 1000);
  var signatureParser = trusted_endpoint.Modules.SignatureParser(require('http-signature'), authenticClient, logger, false /* allow lax parsing */);
  var remoteEndpointAuthority = trusted_endpoint.Modules.RemoteEndpointAuthority(authScope, authenticClient, logger, 1000);

  var app = express();
  app.all('/', function (req, res, next) {
    localAuthority.create()
      .then(function(auth){
        req.localAuth = auth;
        next();
      })
      .catch(next);
  });

  var _sig;
  app.all('/', function (req, res, next) {
    logger.info('Parsing signature');
    signatureParser.parse(req).then(function(signature){
      if (signature) {
        _sig = signature;
        logger.debug('Signature:');
        logger.debug(signature);
      }
      else {
        logger.warn('No signature found');
      }
      next();
    })
    .catch(next);
  });

  app.all('/', function (req, res, next) {
    if (_sig){
      logger.info('Getting endpoint context');
      remoteEndpointAuthority.create(_sig).then(function(auth){
        req.endpointAuth = auth;
        logger.debug('Remote context:');
        logger.debug(auth);
        next();
      })
      .catch(next);
    } else {
      next();
    }
  });

  app.get('/', function (req, res) {
    res.send('Configured setting value: ' + (config.get(spec.name, '#/example') || 'unconfigured'));
  });

  var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    logger.info('Example app listening at http://%s:%s', host, port);
  });
});
