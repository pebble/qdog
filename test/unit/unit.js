'use strict';

var assert = require('assert');
var expect = require('expect');
var PushQueue = require('../../main.js');
var sinon = require('sinon');
var Promise = require('es6-promise').Promise;


var promiseTest = function(method, stub, inputData, resolveData, errorData) {

  it('should return a promise', function(){
    assert(PushQueue[method]({good: "object"}) instanceof Promise);
  });

  it('should resolve the promise after success', function(done){

    stub.callsArgWith(1, null, inputData);

    PushQueue[method]({some: 'message'})
      .then(function(data){
        assert.deepEqual(data, resolveData);
        done();
      })
      .catch(function(){
        done("Expected resolve, Got reject");
      });
  });

  it('should reject the promise after failure', function(done){

    stub.callsArgWith(1, errorData, null);

    PushQueue[method]({some: 'message'})
      .then(function(){
        done("Expected reject, Got resolve");
      })
      .catch(function(data){
        assert.deepEqual(data, errorData);
        done();
      });
  });

}

// -----------------------------------------------------------------------------

describe('PushQueue', function(){
  var stub = sinon.stub(PushQueue.sqs, 'sendMessage');
  // stub out AWS SQS SDK

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

    var resolveData = {success: 'data'};

    promiseTest('post', stub, resolveData, resolveData, {error: 'data'});

    after(function(){
      PushQueue.sqs.sendMessage.restore();
    })

  });

  // ---------------------------------------------------------------------------

  describe('#receive()', function(){

    var stub = sinon.stub(PushQueue.sqs, 'receiveMessage');

    var inputData =
    { Messages:
      [
        { ReceiptHandle : 'abc1234'
        , Body: '{"test": "data"}'
        }
      ]
    }

    var resolveData =
    { id: 'abc1234'
    , body: {test: 'data'}
    }

    promiseTest('receive', stub, inputData, resolveData, {error: 'data'});

    // not sure why thios is not working
    //it('should throw for malformed message data', function(done){
    //
    //  inputData.Messages[0].Body = 'bad {JSON';
    //  stub.callsArgWith(1, null, inputData);
    //
    //  assert.throws(function(){
    //    PushQueue.receive()
    //      .then(function(){
    //      });
    //  });
    //
    //})

    after(function(){
      PushQueue.sqs.receiveMessage.restore();
    })

  });

  describe('#delete()', function(){

    var stub = sinon.stub(PushQueue.sqs, 'deleteMessage');

    promiseTest('delete', stub, 'abc1234', undefined, {error: 'data'});

    after(function(){
      PushQueue.sqs.deleteMessage.restore();
    })

  });




});
