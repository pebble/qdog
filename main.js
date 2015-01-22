'use strict';

require('dotenv').load();
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


exports.post = function(message) {
  return new Promise( function(resolve, reject) {

    var params =
    { MessageBody: message
    , QueueUrl: process.env.SQS_QUEUE_URL
    };

    sqs.sendMessage(params, function(err, data) {
      if (err) {
        reject(err)
        console.log(err, err.stack);
      }
      else {
        resolve(data)
        console.log(data);
      }
    });
  });
}

exports.post(JSON.stringify({test: 'things', and: 'others'}));


exports.receive = function() {
  return new Promise( function(resolve, reject) {
    var params =
      { QueueUrl: process.env.SQS_QUEUE_URL /* required */
      , AttributeNames: ['All']
      , MaxNumberOfMessages: 1
      , WaitTimeSeconds: 20
      };

    sqs.receiveMessage(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      }
      else { // success
        console.log(data);

        resolve(
          { id: data[0].ReceiptHandle
          , body: data[0].Body
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
      if (err){
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


// OUTSIDE


exports.receiveMessage().then(function(data){
  // doo some stuff with message

});