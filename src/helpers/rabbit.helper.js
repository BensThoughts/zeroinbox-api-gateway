const amqp = require('amqplib/callback_api');
const logger = require('../loggers/log4js');

var EventEmitter = require('events').EventEmitter;
var utils = require('util');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


class RabbitMQ {

  constructor() {
    this.rabbitConn;
    this.channels = new Map();
  }
  
  connect(opts, cb) {
    amqp.connect(opts.connection, (err, conn) => {
      let protocol = opts.connection.protocol;
      let hostname = opts.connection.hostname;
      let port = opts.connection.port;
      logger.info('Connected to RabbitMQ: ' + protocol + '://' + hostname + ':' + port);

      this.rabbitConn = conn;
      this.parseOpts(opts, cb).then(() => {
      logger.trace('Chanels opened: ' + this.channels.size);
        if (cb) {
          cb(err, conn);
        }
      }).catch((err) => logger.error(err));
    });
  };

  async parseOpts(opts, cb) {

    if (opts.exchanges) {
      await asyncForEach(opts.exchanges, async (exchange) => {
        await this.assertExchange(exchange.channel, exchange.name, exchange.type, exchange.options);
      });
    } 

    if (opts.queues) {
      await asyncForEach(opts.queues, async (queue) => {
        await this.assertQueue(queue.channel, queue.name, queue.options);
      });
    } 
    
    if (opts.bindings) {
      await asyncForEach(opts.bindings, async (binding) => {
        await this.bindQueue(binding.channel, binding.queue, binding.exchange, binding.key, binding.options);
      });
    }  
  
  }

  async assertExchange(channel, exName, type, options, cb) {
    await this.getChannel(channel, (err, ch) => {
      ch.assertExchange(exName, type, options, (err, ex) => {
        let exInfo = utils.inspect(ex);
        logger.info('assertExchange on channel ' + channel + ': ' + exInfo);
        if (cb) {
          cb(err, ex);
        }
      });
    });
  }

  async assertQueue(channel, qName, options, cb) {
    await this.getChannel(channel, (err, ch) => {
      ch.assertQueue(qName, options, (err, q) => {
        let qInfo = utils.inspect(q);
        logger.info('assertQueue on channel ' + channel + ': ' + qInfo);
        if (cb) {
          cb(err, q);
        }
      });
    });
  }

  async bindQueue(channel, qName, exName, key, options, cb) {
    await this.getChannel(channel, (err, ch) => {
      ch.bindQueue(qName, exName, key, options, (err, ok) => {
        logger.info('bind Queue ' + qName + ' to ' + exName + ' on channel ' + channel);
        if (cb) {
          cb(err, ok);
        }
      });
    });
  }

  createConfirmChannelPromise(channelName) {
    return new Promise((resolve, reject) => {
      this.rabbitConn.createConfirmChannel((err, ch) => {
        if (err) {
          reject(err);
        }
        this.setChannel(channelName, ch);
        logger.info('Created Confirm Channel: ' + channelName);
        resolve(ch);
      });
    });
  }

  setChannel(channelName, ch) {
    this.channels.set(channelName, ch);
  }

  async getChannel(channelName, cb) {
    let channel = this.channels.get(channelName);
    if (channel === undefined) {
      await this.createConfirmChannelPromise(channelName).then((ch) => {
        cb(undefined, ch); 
      }).catch(err => {
        logger.error('Error creating channel: ' + err);
        cb(err, undefined);
      });
    } else {
      cb(undefined, channel);
    }
  }

  async setChannelPrefetch(channel, prefetch) {
    await this.getChannel(channel, (err, ch) => {
      ch.prefetch(prefetch);
    });
  }

  async publish(channel, exName, msg, routingKey, options) {
    msg = JSON.stringify(msg);
    await this.getChannel(channel, (err, ch) => {
      ch.publish(exName, routingKey || '', new Buffer(msg));
    });
  }

  async consume(channel, qName, options) {
    await this.getChannel(channel, (err, ch) => {
      let optionsMsg = utils.inspect(options);
      logger.info('Listenting on channel ' + channel + ' to: ' + qName + ' with options: ' + optionsMsg);
      ch.consume(qName, (msg) => {
        let message = new RabbitMsg(msg);
        message.deserialize();
        this.emit('received ' + channel, message);          
      }, options)
    });
  }

  async ack(channel, msg) {
    msg = msg.getMsg();
    await this.getChannel(channel, (err, ch) => {
      ch.ack(msg);
    })
  }

}

class RabbitMsg {
  constructor(msg) {
    this.content;
    this.msg = msg;
  }

  deserialize() {
    this.content = JSON.parse(this.msg.content.toString());
  }

  getJsonMsg() {
    return this.content;
  }

  getMsg() {
    return this.msg;
  }
}

utils.inherits(RabbitMQ, EventEmitter);

const thisRabbit = new RabbitMQ();

exports.connect = function connect(opts, cb) {
  thisRabbit.connect(opts, cb);
}

exports.consume = function consume(channel, qName, options, cb) {
  thisRabbit.on('received ' + channel, cb);
  thisRabbit.consume(channel, qName, options);
};


exports.publish = function publish(channel, exName, msg, routingKey, options) {
  thisRabbit.publish(channel, exName, msg, routingKey, options);
}

exports.ack = function ack(channel, msg) {
  thisRabbit.ack(channel, msg);
}

exports.setChannelPrefetch = function setChannelPrefetch(channel, prefetch) {
  thisRabbit.setChannelPrefetch(channel, prefetch);
}