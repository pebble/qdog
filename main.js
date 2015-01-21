'use strict';

require('dotenv').load();

var AWS = require('aws-sdk');
var sqs;

// Load credentials from local json file
AWS.config(
  { accessKeyId: process.env.ACCESS_KEY_ID
  , secretAccessKey: process.env.SECRET_ACCESS_KEY
  , region: process.env.REGION
  }
)

// Instantiate SQS client
sqs = new AWS.SQS().client;