'use strict';

var AWS = require('aws-sdk');
var Promise = require('es6-promise').Promise;
var toJSONString = require('./to-json-string');

module.exports = QDog;

function QDog(config) {
  if (!(config && config.queueUrl)) {
    throw new Error('no queue url');
  }

  this.config = config;

  this.sqs = new AWS.SQS({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.queueUrl.split('.')[1],
    apiVersions: { sqs: '2012-11-05' }
  });
}

/**
 * Add a message to the queue.
 *
 * @param {Object} message
 * @param {Object} [options]
 * @param {number} [options.delaySeconds] - delay
 *   processing of the message for this number of seconds;
 *   max 900 for SQS queues
 */
QDog.prototype.toss = function(message, options) {
  if (!options) options = {};

  var delaySeconds = options.delaySeconds || 0;
  if (delaySeconds < 0) throw new Error('invalid delaySeconds');

  var self = this;

  var params = {
    MessageBody: toJSONString(message),
    QueueUrl: self.config.queueUrl,
    DelaySeconds: delaySeconds
  };

  return new Promise(function postPromise(resolve, reject) {
    self.sqs.sendMessage(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

var promiseCallback = function(resolve, reject) {
  var self = this;

  var params = {
    QueueUrl: self.config.queueUrl, /* required */
    AttributeNames: ['All'],
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 20
  };

  self.sqs.receiveMessage(params, function receiveMessageCallback(err, data) {
    if (err) {
      reject(err);
      return;
    }

    if (!data.Messages) {
      resolve(null);
      return;
    }

    try {
      resolve({
        id: data.Messages[0].ReceiptHandle,
        body: JSON.parse(data.Messages[0].Body)
      });
    } catch (e) {
      reject('Malformed JSON in response message');
    }
  });
};

QDog.prototype.fetch = function() {
  return new Promise(promiseCallback.bind(this));
};

QDog.prototype.drop = function(id) {
  var self = this;

  return new Promise(function(resolve, reject) {
    var params = {
      QueueUrl: self.config.queueUrl,
      ReceiptHandle: id
    };

    self.sqs.deleteMessage(params, function deleteCallback(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
