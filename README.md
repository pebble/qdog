# qdog

Module used for being a generic abstraction for various Queue backends.
Currently only supports SQS but intended to support more in the future.

The name qDog may be a bit dog biased but lets be honest, qCat.fetch() just
seems doomed to failure, and "CueCat" ended pretty badly for RadioShack already.

## Examples

### Include / Configure


```bash
npm install git+https://git@github.com/pebble/qdog.git
```

```js

var QDog = require('qdog')

qDog = new QDog(
  { accessKeyId: process.env.ACCESS_KEY_ID
  , secretAccessKey: process.env.SECRET_ACCESS_KEY
  , region: process.env.REGION
  , queueUrl: process.env.SQS_QUEUE_URL
  }
)
```

### Toss a message into the Queue

```js
qDog.toss({'some':'data'})
```

### Drop a message no one cares about anymore.

```js
qDog.drop(message.id)
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

### Continually poll for new messages

Some queue backends (like SQS) only allow you to do longpolling
for a short period of time, say 30 seconds. Or to keep pulling new messages
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
