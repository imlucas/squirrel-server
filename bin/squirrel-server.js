#!/usr/bin/env node
var path = require('path');

require(path.resolve(__dirname, '../')).listen(require('nconf').get('PORT'));
