'use strict'

var assert = require('assert')
var expect = require('expect')
var QDog = require('../../main.js')
var sinon = require('sinon')
var Promise = require('es6-promise').Promise

var testConfig =
  { accessKeyId : 'testAccessID'
  , secretAccessKey : 'testSecretKey'
  , queueUrl : 'testQueueURL'
  }

var qDog = new QDog(testConfig)

var promiseTest = function(method, stub, inputData, resolveData, errorData) {

  it('should return a promise', function() {
    assert(qDog[method]({good: "object"}) instanceof Promise)
  })

  it('should resolve the promise after success', function(done) {

    stub.callsArgWith(1, null, inputData)

    qDog[method]({some: 'message'})
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

    qDog[method]({some: 'message'})
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

describe('qDog', function() {

  describe('constructor', function() {

    it('throws if config is incomplete', function() {
      Object.keys(testConfig).forEach(function(key) {
        var oldVal = testConfig[key]
        delete testConfig[key]
        assert.throws(function() {
          new QDog(testConfig)
        })
        // restore old value to testConfig
        testConfig[key] = oldVal
      })
    })

    it('does not throw if all config keys are provided', function() {
      assert.doesNotThrow(function() {
        new QDog(testConfig)
      })
    })
  })

  // ---------------------------------------------------------------------------

  // stub out AWS SQS SDK
  var stub = sinon.stub(qDog.sqs, 'sendMessage')

  describe('#toss()', function() {
    it('should throw if JSON serializable things are not supplied', function() {
      [ undefined
      , function() {}
      ].forEach(function(badvalue) {
          assert.throws(function() {
            qDog.toss(badvalue)
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
            qDog.toss(goodvalue)
          })
        })
    })

    var resolveData = {success: 'data'}

    promiseTest('toss', stub, resolveData, resolveData, {error: 'data'})

    after(function() {
      qDog.sqs.sendMessage.restore()
    })

  })

  // ---------------------------------------------------------------------------

  describe('#fetch()', function() {

    var stub = sinon.stub(qDog.sqs, 'receiveMessage')

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

    promiseTest('fetch', stub, inputData, resolveData, {error: 'data'})

    it('should reject for malformed message data', function(done) {

      inputData.Messages[0].Body = 'bad {JSON'
      stub.callsArgWith(1, null, inputData)

      qDog.fetch()
        .then(function() {
          done("Expected reject, Got resolve")
        })
        .catch(function(data) {
          assert.equal(data, "Malformed JSON in response message")
          done()
        })

    })

    after(function() {
      qDog.sqs.receiveMessage.restore()
    })

  })

  describe('#drop()', function() {

    var stub = sinon.stub(qDog.sqs, 'deleteMessage')

    promiseTest('drop', stub, 'abc1234', undefined, {error: 'data'})

    after(function() {
      qDog.sqs.deleteMessage.restore()
    })

  })


})
