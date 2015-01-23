'use strict';

var PushQueue = require('main.js');

PushQueue.post(JSON.stringify({test: 'things', and: 'others'}))
  .then(function(result){

  })