'use strict';

require('dotenv').load();

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

sqs.getQueueAttributes(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});