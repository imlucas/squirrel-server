#!/usr/bin/env node
require(__dirname + '/../').listen(require('nconf').get('port'));
