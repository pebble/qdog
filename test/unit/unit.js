'use strict';

var assert = require('assert');
var QDog = require('../../main.js');
var sinon = require('sinon');
var Promise = require('es6-promise').Promise;
var toJSONString = require('../../to-json-string');

var testConfig = {
  accessKeyId: 'testAccessID',
  secretAccessKey: 'testSecretKey',
  queueUrl: 'testQueueURL'
};

var qDog = new QDog(testConfig);

var promiseTest = function(arg) {
  var method = arg.method;
  var stub = arg.stub;
  var inputData = arg.inputData;
  var resolveData = arg.resolveData;
  var errorData = arg.errorData;

  it('should return a promise', function() {
    assert(qDog[method]({ good: 'object' }) instanceof Promise);
  });

  it('should resolve the promise after success', function(done) {
    stub.callsArgWith(1, null, inputData);

    qDog[method]({some: 'message'})
    .then(function(data) {
      assert.deepEqual(data, resolveData);
      done();
    })
    .catch(function() {
      done(new Error('Expected resolve, Got reject'));
    });
  });

  it('should reject the promise after failure', function(done) {
    stub.callsArgWith(1, errorData, null);

    qDog[method]({some: 'message'})
    .then(function() {
      done('Expected reject, Got resolve');
    })
    .catch(function(data) {
      assert.deepEqual(data, errorData);
      done();
    });
  });
};

describe('qDog', function() {
  describe('constructor', function() {
    it('throws if queueUrl is missing', function() {
      assert.throws(function() {
        new QDog({}); // eslint-disable-line no-new
      });
    });

    it('does not throw if no accessKeyId is provided', function() {
      assert.doesNotThrow(function() {
        new QDog({ // eslint-disable-line no-new
          queueUrl: testConfig.queueUrl
        });
      });
    });

    it('does not throw if all config keys are provided', function() {
      assert.doesNotThrow(function() {
        new QDog(testConfig); // eslint-disable-line no-new
      });
    });
  });

  // stub out AWS SQS SDK
  var stub = sinon.stub(qDog.sqs, 'sendMessage');

  describe('#toss()', function() {
    it('should throw if JSON serializable things are not supplied', function() {
      [ undefined,
        function() {}
      ].forEach(function(badvalue) {
        assert.throws(function() {
          qDog.toss(badvalue);
        });
      });
    });

    it('should not throw if JSON serializable things are supplied', function() {
      [ 1234,
        'some string',
        null,
        '{ "good": "strings" }',
        { good: 'object' },
        [ 'strings', 'in array' ],
        '["string", "array"]'
      ].forEach(function(goodvalue) {
        assert.doesNotThrow(function() {
          qDog.toss(goodvalue);
        });
      });
    });

    it('should throw if delaySeconds is negative', function() {
      assert.throws(function() {
        qDog.toss({}, { delaySeconds: -1 });
      });
    });

    var resolveData = { success: 'data' };

    promiseTest({
      method: 'toss',
      stub: stub,
      inputData: resolveData,
      resolveData: resolveData,
      errorData: { error: 'data' }
    });

    after(function() {
      qDog.sqs.sendMessage.restore();
    });
  });

  describe('#fetch()', function() {
    var stub = sinon.stub(qDog.sqs, 'receiveMessage');

    var inputData = {
      Messages: [{
        ReceiptHandle: 'abc1234',
        Body: '{"test": "data"}'
      }]
    };

    var inputDataEmpty = {};

    var resolveData = {
      id: 'abc1234',
      body: { test: 'data' }
    };

    promiseTest({
      method: 'fetch',
      stub: stub,
      inputData: inputData,
      resolveData: resolveData,
      errorData: { error: 'data' }
    });

    it('should reject for malformed message data', function(done) {
      inputData.Messages[0].Body = 'bad {JSON';
      stub.callsArgWith(1, null, inputData);

      qDog.fetch()
      .then(function() {
        done('Expected reject, Got resolve');
      })
      .catch(function(data) {
        assert.equal(data, 'Malformed JSON in response message');
        done();
      });
    });

    it('should resolve with null if no messages are available', function(done) {
      stub.callsArgWith(1, null, inputDataEmpty);

      qDog.fetch()
      .then(function(data) {
        assert.equal(data, null);
        done();
      })
      .catch(function(err) {
        done(new Error(err));
      });

    });

    after(function() {
      qDog.sqs.receiveMessage.restore();
    });
  });

  describe('#drop()', function() {
    var stub = sinon.stub(qDog.sqs, 'deleteMessage');

    promiseTest({
      method: 'drop',
      stub: stub,
      inputData: 'abc1234',
      resolveData: undefined,
      errorData: { error: 'data' }
    });

    after(function() {
      qDog.sqs.deleteMessage.restore();
    });
  });
});

describe('toJSONString', function() {
  describe('throws when', function() {
    it('an object is passed', function(done) {
      assert.throws(function() {
        var recursive = {};
        recursive.recursive = recursive;
        toJSONString(recursive);
      }, /Invalid Input/);
      done();
    });

    if (typeof Symbol === 'function') {
      it('a Symbol is passed', function(done) {
        assert.throws(function() {
          toJSONString(Symbol('hi'));
        }, /Invalid Input/);
        done();
      });
    }
  });
});
