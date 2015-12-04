'use strict';

process.env.DEMO_AUTHENTIC_URL = process.env.DEMO_AUTHENTIC_URL || 'http://authentic-api.leisurelink.ka';
process.env.DEMO_JWT_ISSUER = process.env.DEMO_JWT_ISSUER || 'test';
process.env.DEMO_JWT_AUDIENCE = process.env.DEMO_JWT_AUDIENCE || 'test';
process.env.DEMO_JWT_ISSUER_KEY = process.env.DEMO_JWT_ISSUER_KEY || '../authentic-api/test/test-key.pub';
process.env.DEMO_TRUSTED_ENDPOINT_KEY_ID = process.env.DEMO_TRUSTED_ENDPOINT_KEY_ID || 'demo/self';
process.env.DEMO_TRUSTED_ENDPOINT_KEY_FILE = process.env.DEMO_TRUSTED_ENDPOINT_KEY_FILE || './demo.pem';
