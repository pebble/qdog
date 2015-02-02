'use strict'

require('dotenv').load()

var assert = require('assert')
var expect = require('expect')
var QDog = require('../../main.js')

var qDog = new QDog(
  { accessKeyId: process.env.ACCESS_KEY_ID
  , secretAccessKey: process.env.SECRET_ACCESS_KEY
  , region: process.env.REGION
  , queueUrl: process.env.SQS_QUEUE_URL
  })

var testData = {test: "things"}
var messageId

describe('QDog', function() {
  describe('#toss()', function() {
    it('should toss an item into the SQS queue', function() {
      return qDog.toss(testData)
    })
  })

  describe('#fetch()', function() {
    it('should fetch the item from the SQS queue', function(done) {
      qDog.fetch()
        .then(function(data) {
          assert(data.id)
          assert.deepEqual(data.body, testData)
          messageId = data.id
          done()
        })
    })
  })

  describe('#drop()', function() {
    it('should drop an item from the SQS queue', function() {
      return qDog.drop(messageId)
    })
  })

})
