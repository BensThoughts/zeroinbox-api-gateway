const amqp = require('amqplib/callback_api');
const logger = require('../loggers/log4js');

var EventEmitter = require('events').EventEmitter;
var utils = require('util');

function parseOpts(options, ) {

}

class RabbitMQ {

    constructor() {
      this.rabbitConn;
      this.rabbitConfirmChannel;
      this.rabbitChannel;
    }
  
    connect(opts, cb) {
      amqp.connect(opts.url, (err, conn) => {
        logger.info('Connected to RabbitMQ: ' + opts.url);
        this.rabbitConn = conn;
        conn.createConfirmChannel((err, ch) => {
          if (err) logger.error('Error creating channel: ' + err);
          logger.info('Create Confirm Channel!');
          this.rabbitConfirmChannel = ch;
          this.parseOpts(opts, cb);
          cb(err, ch);
        });
      });
    };

    parseOpts(opts, cb) {
      if (opts.queues) {
        opts.queues.forEach((queue) => {
          this.addQueue(queue.name);
        });
      }
      if (opts.exchanges) {
        opts.exchanges.forEach((exchange) => {
          this.addExchange(exchange.name, exchange.type);
        });
      }
      if (opts.bindings) {
        opts.bindings.forEach((binding) => {
          this.bindQueue(binding.queue, binding.exchange);
        });
      }
    }

    createConfirmChannel(cb) {
      logger.info('Created Confirm Channel');
      this.rabbitConn.createConfirmChannel((err, ch) => {
        this.rabbitConfirmChanel = ch;
        cb(err, ch);
      });
    };

    createChannel(cb) {
      this.rabbitConn.createChannel((err, ch) => {
        this.rabbitChannel = ch;
        cb(err, ch);
      })
    }

    getConfirmChannel() {
      return this.rabbitConfirmChannel;
    }

    getChannel() {
      return this.rabbitChannel;
    }

    addExchange(exName, type) {
      logger.trace('assertExchange: ' + exName);
      this.rabbitConfirmChannel.assertExchange(exName, type);
    }

    addQueue(qName) {
      logger.trace('assertQueue: ' + qName);
      this.rabbitConfirmChannel.assertQueue(qName);
    }

    bindQueue(qName, exName) {
      logger.trace('bindQueue: ' + qName + ' to ' + exName);
      this.rabbitConfirmChannel.bindQueue(qName, exName);
    }
  
    publish(exName, msg) {
      msg = JSON.stringify(msg);
      this.rabbitConfirmChannel.publish(exName,'', new Buffer(msg));
    }

    consume(qName) {
      logger.info('Listenting to queue: ' + qName)
      this.rabbitConfirmChannel.consume(qName, (msg) => {
        let content = msg.content.toString();
        logger.debug(content);
        content = JSON.parse(content);
        this.emit('received', content);
        this.rabbitConfirmChannel.ack(msg);
      });
    }
  }


utils.inherits(RabbitMQ, EventEmitter);

const thisRabbit = new RabbitMQ();

exports.connect = function connect(opts, cb) {
  thisRabbit.connect(opts, cb);
}

exports.consume = function consume(qName, cb) {
  thisRabbit.on('received', cb);
  thisRabbit.consume(qName);
}

exports.publish = function publish(exName, msg) {
  thisRabbit.publish(exName, msg);
}