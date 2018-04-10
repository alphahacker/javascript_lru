var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var JSON = require('JSON');

console.log("kafka 1");

var log4js = require('log4js');
log4js.configure('./configure/log4js.json');
var operation_log = log4js.getLogger("operation");
var error_log = log4js.getLogger("error");
var interim_log = log4js.getLogger("interim");

var app = express();
console.log("kafka 2");

var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.Client(),
    producer = new Producer(client),
    km = new KeyedMessage('key', 'message'),
    payloads = [
        { topic: 'test1', messages: 'hi', partition: 0 },
        { topic: 'topic2', messages: ['hello', 'world', km] }
    ];

console.log("kafka 3");

router.get('/simpleTest', function(req, res, next) {
  // var message = 'a message from node';
  // var keyedMessage = new KeyedMessage('keyed', 'a keyed message');

  producer.send(payloads, function (err, data) {
      console.log(data);
  });

});

module.exports = router;
