# push-queue

Module used for being a generic abstraction for various Queue backends.
Currently only supports SQS but intended to support more in the future.

## Examples

### Include / Configure


```bash
npm install git+https://git@github.com/pebble/push-queue.git
```

```js

var PushQueue = require('push-queue')

pushQueue = new PushQueue(
  { accessKeyId: process.env.ACCESS_KEY_ID
  , secretAccessKey: process.env.SECRET_ACCESS_KEY
  , region: process.env.REGION
  , queueUrl: process.env.SQS_QUEUE_URL
  }
)
```

### Post to Queue

```js
pushQueue.post({'some':'data'})
```

### Delete from Queue

```js
pushQueue.delete(message.id)
```

### Receive single message from Queue

```js
pushQueue.receive().then(function(message){
  console.log('Got:',message.body) 
  pushQueue.delete(message.id)
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
  pushQueue.delete(message.id)
  pushQueue.receive().then(processMessage,processError)
}

pushQueue.receive().then(processMessage,processError)

```

## Run Tests

```bash
npm test
```

## Sponsored by

[Pebble Technology!](https://getpebble.com)

## License

[MIT](https://github.com/pebble/push-queue/blob/master/LICENSE)
