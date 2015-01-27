'use strict';

require('dotenv').load();

// validate our environment variables
require('sanity').check([
  'ACCESS_KEY_ID'
, 'SECRET_ACCESS_KEY'
, 'REGION'
, 'SQS_QUEUE_URL'
]);

var Promise = require('es6-promise').Promise;
var AWS = require('aws-sdk');
var sqs;

// Load credentials from local json file
AWS.config = new AWS.Config(
  { accessKeyId: process.env.ACCESS_KEY_ID
  , secretAccessKey: process.env.SECRET_ACCESS_KEY
  , region: process.env.REGION
  , apiVersions: { sqs: '2012-11-05' }
  }
)


// Instantiate SQS client
sqs = new AWS.SQS();

var params =
  { QueueUrl: process.env.SQS_QUEUE_URL
  , AttributeNames: ['All']
  };


var _toJSONString = function(input) {
  var inputError = new Error('Error: Invalid Input. Please supply a JSON string or JSON serializable object');

  if(input === null) {
    throw inputError;
  }

  if (typeof input === 'string') {
    try {
      JSON.parse(input);
      return input;
    }
    catch(e) {
      throw inputError;
    }
  }

  if(typeof input === 'object') {
    try {
      return JSON.stringify(input);
    } catch(e){
     throw inputError;
    }
  }

  throw inputError;
}

exports.post = function(message) {

  var params =
    { MessageBody: _toJSONString(message)
    , QueueUrl: process.env.SQS_QUEUE_URL
    };

  return new Promise( function(resolve, reject) {
    sqs.sendMessage(params, function(err, data) {
      if (err) {
        reject(err)
        console.log(err, err.stack);
      }
      else {
        resolve(data)
      }
    });
  });
}

exports.receive = function() {
  return new Promise(function PromiseCallback(resolve, reject) {
    var params =
      { QueueUrl: process.env.SQS_QUEUE_URL /* required */
      , AttributeNames: ['All']
      , MaxNumberOfMessages: 1
      , WaitTimeSeconds: 20
      };

    sqs.receiveMessage(params, function receiveMessageCallback(err, data) {
      console.log(arguments);
      if (err || !data.Messages) {
        console.log(err);
        reject(err);
      }
      else { // success
        resolve(
          { id: data.Messages[0].ReceiptHandle
          , body: data.Messages[0].Body
          }
        );
      }
    });

  });
}


exports.delete = function(id) {
  return new Promise( function(resolve, reject) {
    var params =
      { QueueUrl: process.env.SQS_QUEUE_URL
      , ReceiptHandle: id
      };

    sqs.deleteMessage(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      }
      else {
        console.log(data);
        resolve();
      }
    });
  });
}

// Test stuff below

exports.sqs = sqs;

