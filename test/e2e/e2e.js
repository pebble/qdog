'use strict';

require('dotenv').load();

var assert = require('assert');
var expect = require('expect');
var PushQueue = require('../../main.js');

var pushQueue = new PushQueue(
  { accessKeyId: process.env.ACCESS_KEY_ID
  , secretAccessKey: process.env.SECRET_ACCESS_KEY
  , region: process.env.REGION
  , queueUrl: process.env.SQS_QUEUE_URL
  });

var testData = {test: "things"};
var messageId;

describe('PushQueue', function(){
  describe('#post()', function(){
    it('should publish an item to the SQS queue', function(){
      return pushQueue.post(testData);
    });
  });

  describe('#receive()', function(){
    it('should retrieve the item from the SQS queue', function(done){
      pushQueue.receive()
        .then(function(data){
          assert(data.id);
          assert.deepEqual(data.body, testData);
          messageId = data.id;
          done();
        });
    });
  });

  describe('#delete()', function(){
    it('should delete the item from the SQS queue', function(){
      return pushQueue.delete(messageId);
    });
  });

});
