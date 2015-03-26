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

var QDog = module.exports = function(config) {
  // Instantiate SQS client
  var _this = this

  _this.config = config

  // validate Config
  ;['accessKeyId'
  , 'secretAccessKey'
  , 'queueUrl'
  ].forEach(function(key) {
    if( !_this.config[key]) {
      throw new Error('Missing config for: ' + key)
    }
  })

  _this.sqs = new AWS.SQS(
    { accessKeyId: _this.config.accessKeyId
    , secretAccessKey: _this.config.secretAccessKey
    , region: _this.config.queueUrl.split('.')[1]
    , apiVersions: {sqs: '2012-11-05'}
    })
}


QDog.prototype.toss = function(message) {
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

var promiseCallback = function(resolve, reject) {
  var _this = this

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
        resolve(null)
      } else { // success
        try {
          resolve(
            { id: data.Messages[0].ReceiptHandle
            , body: JSON.parse(data.Messages[0].Body)
            }
          )
        } catch (e) {
          reject("Malformed JSON in response message")
        }
      }
    })

  }

QDog.prototype.fetch = function() {
  return new Promise(promiseCallback.bind(this))
}


QDog.prototype.drop = function(id) {
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

