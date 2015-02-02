'use strict'

var assert = require('assert')
var expect = require('expect')
var QDog = require('../../main.js')
var sinon = require('sinon')
var Promise = require('es6-promise').Promise

// bad config because all the SQS stuff gets stubbed out anyway
var qDog = new QDog(
  { accessKeyId: 'none'
  , secretAccessKey: 'none'
  , region: 'none'
  , queueUrl: 'none'
  })

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
  // stub out AWS SQS SDK
  var stub = sinon.stub(qDog.sqs, 'sendMessage')

  describe('#toss()', function() {
    it('should throw if JSON serializable things are not supplied', function() {
      [ 1234
      , 'some string'
      , null
      , function() {}
      ].forEach(function(badvalue) {
          assert.throws(function() {
            qDog.toss(badvalue)
          })
        })
    })

    it('should not throw if JSON serializable things are supplied', function() {
      [ '{ "good": "strings" }'
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
