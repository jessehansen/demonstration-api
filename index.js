'use strict';

var express = require('express');
var config = new (require('env-configurator'))();
var spec = require('./config/demonstration-spec');
var logger = new (require('@leisurelink/skinny-loggins'))();

config.fulfill(spec, function(errs){
  if (errs) {
    for (var i = 0; i < errs.length; i++) {
      logger.error('Configuration error:', errs[i]);
    }
    process.exit(1);
  }
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
