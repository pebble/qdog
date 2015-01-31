'use strict'

var Promise = require('es6-promise').Promise
var AWS = require('aws-sdk')
var _toJSONStringInputError = new Error('Error: Invalid Input. Please supply a JSON string or JSON serializable object')

var _toJSONString = function(input) {

  if (input === undefined || typeof input === 'function' ) {
    throw _toJSONStringInputError
  }

  // test if valid JSON string
  if(typeof input === 'string') {
    try {
      // we have a valid JSON string already
      JSON.parse(input)
      return input
    }
    catch (e) {
      // must be a raw string value
    }
  }

  // if we got this far then we must be dealing with either an object or a number
  try {
    return JSON.stringify(input)
  } catch (e) {
    throw _toJSONStringInputError
  }

  throw _toJSONStringInputError
}

var PushQueue = module.exports = function(config) {
  // Instantiate SQS client
  this.config = config

  this.sqs = new AWS.SQS(
    { accessKeyId: this.config.accessKeyId
    , secretAccessKey: this.config.secretAccessKey
    , region: this.config.region
    , apiVersions: {sqs: '2012-11-05'}
    })
}


PushQueue.prototype.post = function(message) {
  var _this = this
  var params =
    { MessageBody: _toJSONString(message)
      , QueueUrl: _this.config.queueUrl
    }

  return new Promise(function postPromise(resolve, reject) {
    _this.sqs.sendMessage(params, function(err, data) {
      if (err) {
        reject(err)
      }
      else {
        resolve(data)
      }
    })
  })
}

PushQueue.prototype.receive = function() {
  var _this = this

  return new Promise(function PromiseCallback(resolve, reject) {
    var params =
      { QueueUrl: _this.config.queueUrl /* required */
      , AttributeNames: ['All']
      , MaxNumberOfMessages: 1
      , WaitTimeSeconds: 20
      }

    _this.sqs.receiveMessage(params, function receiveMessageCallback(err, data) {

      if (err) {
        reject(err)
      }
      else if (!data.Messages) {
        reject()
      }
      else { // success
        try {
          resolve(
            { id: data.Messages[0].ReceiptHandle
            , body: JSON.parse(data.Messages[0].Body)
            }
          )
        }
        catch (e) {
          reject("Malformed JSON in response message")
        }
      }
    })

  })
}


PushQueue.prototype.delete = function(id) {
  var _this = this

  return new Promise(function(resolve, reject) {
    var params =
      { QueueUrl: _this.config.queueUrl
      , ReceiptHandle: id
      }

    _this.sqs.deleteMessage(params, function deleteCallback(err) {
      if (err) {
        reject(err)
      }
      else {
        resolve()
      }
    })
  })
}

