'use strict';

var assert = require('assert');
var expect = require('expect');
var PushQueue = require('../../main.js');
var sinon = require('sinon');
var Promise = require('es6-promise').Promise;

// stub out AWS SQS SDK
var sqsSendMessageStub = sinon.stub(PushQueue.sqs, 'sendMessage');

describe('PushQueue', function(){
  describe('#post()', function(){
    it('should throw if JSON serializable things are not supplied', function(){
      [ 1234
      , 'some string'
      , null
      , function(){}
      ].forEach(function(badvalue){
        assert.throws(function(){
          PushQueue.post(badvalue);

        });
      });
    });

    it('should not throw if JSON serializable things are supplied', function(){
      ['{ "good": "strings" }'
      , {good: "object"}
      , ["strings", "in array"]
      , '["string", "array"]'
      ].forEach(function(goodvalue){
        assert.doesNotThrow(function(){
          PushQueue.post(goodvalue);
        });

      });
    });

    it('should return a promise', function(){
      assert(PushQueue.post({good: "object"}) instanceof Promise);
    });


    it('should resolve the promise after success', function(done){
      var successData = {success: 'data'};

      sqsSendMessageStub.callsArgWith(1, null, successData);

      PushQueue.post({some: 'message'})
        .then(function(data){
          assert.equal(data, successData);
          done();
        })
        .catch(function(){
          done("Expected resolve, Got reject");
        });
    });

    it('should reject the promise after failure', function(done){
      var errorData = {error: 'data'};

      sqsSendMessageStub.callsArgWith(1, errorData, null);

      PushQueue.post({some: 'message'})
        .then(function(){
          done("Expected reject, Got resolve");
        })
        .catch(function(data){
          assert.equal(data, errorData);
          done();
        });
    });

    after(function(){
      PushQueue.sqs.sendMessage.restore();
    })

  });
});
