# qdog

A tiny abstraction for working with [SQS](https://aws.amazon.com/sqs/).

The name qDog may be a bit dog biased but lets be honest, qCat.fetch() just
seems doomed to failure, and "CueCat" ended pretty badly for RadioShack already.

[![Build Status](https://travis-ci.org/pebble/qdog.svg?branch=master)](https://travis-ci.org/pebble/qdog)
[![Coverage Status](https://coveralls.io/repos/pebble/qdog/badge.svg)](https://coveralls.io/r/pebble/qdog)
[![npm](http://img.shields.io/npm/v/qdog.svg)](https://www.npmjs.org/package/qdog)

## Examples

### Include / Configure


```bash
npm install qdog
```

```js
const QDog = require('qdog');

const qDog = new QDog({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  queueUrl: process.env.SQS_QUEUE_URL,
  maxMessages: 10 // number of messages to read from SQS, default is 1
});
```

### Toss a message into the Queue

```js
qDog.toss({'some':'data'});
```

#### With a delay

```js
qDog.toss({'some':'data'}, {delaySeconds: 120});
```

### Fetch messages from the queue

```js
qDog.fetch().then(function(messages) {
  assert(Array.isArray(messages)); // true

  console.log('Got:', messages[0].body);
  qDog.drop(message[0].id);

},function(err) {
  if (err) throw err;
});
```

### Drop a message no one cares about anymore.

```js
qDog.drop(message.id);
```

### Continually poll for new messages

SQS is a pull based queue. A common usage pattern to process
new incoming messages is to use a retry loop. For example:

```js
var processError = function(err) {
  if (err) throw err;
}

var processMessages = function(messages) {
  console.log('Got:',messages);
  qDog.drop(messages[0].id);
  qDog.fetch().then(processMessage, processError);
}

qDog.fetch().then(processMessages, processError);
```

## Run Tests

Unit:

```bash
npm test
```

End-To-End:

```bash
cp .env.sample .env
vim .env
mocha tests/e2e/*
```

## Sponsored by

[Pebble Technology!](https://www.pebble.com)

## License

[MIT](/LICENSE)
