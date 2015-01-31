'use strict'

var assert = require('assert')
var expect = require('expect')
var PushQueue = require('../../main.js')
var sinon = require('sinon')
var Promise = require('es6-promise').Promise

var testConfig =
  { accessKeyId : 'testAccessID'
  , secretAccessKey : 'testSecretKey'
  , region : 'testRegion'
  , queueUrl : 'testQueueURL'
  }

var pushQueue = new PushQueue(testConfig)

var promiseTest = function(method, stub, inputData, resolveData, errorData) {

  it('should return a promise', function() {
    assert(pushQueue[method]({good: "object"}) instanceof Promise)
  })

  it('should resolve the promise after success', function(done) {

    stub.callsArgWith(1, null, inputData)

    pushQueue[method]({some: 'message'})
      .then(function(data) {
        assert.deepEqual(data, resolveData)
        done()
      })
      .catch(function() {
        done("Expected resolve, Got reject")
      })
  })

  it('should reject the promise after failure', function(done) {

    stub.callsArgWith(1, errorData, null)

    pushQueue[method]({some: 'message'})
      .then(function() {
        done("Expected reject, Got resolve")
      })
      .catch(function(data) {
        assert.deepEqual(data, errorData)
        done()
      })
  })

}

// -----------------------------------------------------------------------------

describe('pushQueue', function() {

  describe('constructor', function() {

    it('throws if config is incomplete', function() {
      Object.keys(testConfig).forEach(function(key) {
        var oldVal = testConfig[key]
        delete testConfig[key]
        assert.throws(function() {
          new PushQueue(testConfig)
        })
        // restore old value to testConfig
        testConfig[key] = oldVal
      })
    })

    it('does not throw if all config keys are provided', function() {
      assert.doesNotThrow(function() {
        new PushQueue(testConfig)
      })
    })
  })

  // ---------------------------------------------------------------------------

  // stub out AWS SQS SDK
  var stub = sinon.stub(pushQueue.sqs, 'sendMessage')

  describe('#post()', function() {
    it('should throw if JSON serializable things are not supplied', function() {
      [ undefined
      , function() {}
      ].forEach(function(badvalue) {
          assert.throws(function() {
            pushQueue.post(badvalue)
          })
        })
    })

    it('should not throw if JSON serializable things are supplied', function() {
      [ 1234
      , 'some string'
      , null
      , '{ "good": "strings" }'
      , {good: "object"}
      , ["strings", "in array"]
      , '["string", "array"]'
      ].forEach(function(goodvalue) {
          assert.doesNotThrow(function() {
            pushQueue.post(goodvalue)
          })
        })
    })

    var resolveData = {success: 'data'}

    promiseTest('post', stub, resolveData, resolveData, {error: 'data'})

    after(function() {
      pushQueue.sqs.sendMessage.restore()
    })

  })

  // ---------------------------------------------------------------------------

  describe('#receive()', function() {

    var stub = sinon.stub(pushQueue.sqs, 'receiveMessage')

    var inputData =
      { Messages:
        [
          { ReceiptHandle: 'abc1234'
          , Body: '{"test": "data"}'
          }
        ]
      }

    var resolveData =
        { id: 'abc1234'
        , body: {test: 'data'}
        }

    promiseTest('receive', stub, inputData, resolveData, {error: 'data'})

    it('should reject for malformed message data', function(done) {

      inputData.Messages[0].Body = 'bad {JSON'
      stub.callsArgWith(1, null, inputData)

      pushQueue.receive()
        .then(function() {
          done("Expected reject, Got resolve")
        })
        .catch(function(data) {
          assert.equal(data, "Malformed JSON in response message")
          done()
        })

    })

    after(function() {
      pushQueue.sqs.receiveMessage.restore()
    })

  })

  describe('#delete()', function() {

    var stub = sinon.stub(pushQueue.sqs, 'deleteMessage')

    promiseTest('delete', stub, 'abc1234', undefined, {error: 'data'})

    after(function() {
      pushQueue.sqs.deleteMessage.restore()
    })

  })


})
