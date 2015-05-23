# qdog

A generic abstraction for various queue backends.
Currently only supports SQS but intended to support more in the future.

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
var QDog = require('qdog')

qDog = new QDog(
  { accessKeyId: process.env.ACCESS_KEY_ID
  , secretAccessKey: process.env.SECRET_ACCESS_KEY
  , queueUrl: process.env.SQS_QUEUE_URL
  }
)
```

### Toss a message into the Queue

```js
qDog.toss({'some':'data'})
```

#### With a delay

```js
qDog.toss({'some':'data'}, {delaySeconds: 120})
```

### Fetch a message from the Queue

```js
qDog.fetch().then(function(message){
  console.log('Got:',message.body) 
  qDog.drop(message.id)
},function(err){
  if (err) throw err
})
```

### Drop a message no one cares about anymore.

```js
qDog.drop(message.id)
```

### Continually poll for new messages

Some queue backends (like SQS) only allow you to do longpolling
for a short period of time, say 20 seconds. Or to keep pulling new messages
as they become available.

In either case you will probably want to have your polling to to keep retrying:

```js
var processError = function(err){
  if (err) throw err;
}

var processMessage = function(message){
  console.log('Got:',message) 
  qDog.drop(message.id)
  qDog.fetch().then(processMessage,processError)
}

qDog.fetch().then(processMessage,processError)

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

[Pebble Technology!](https://getpebble.com)

## License

[MIT](https://github.com/pebble/qdog/blob/master/LICENSE)
