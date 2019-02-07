module.exports = function() {
    return {
      url: 'amqp://rabbitmq',
      exchanges: [
        { name: 'firstRun.ex.1', type: 'direct' },
        { name: 'threads.ex.1', type: 'direct' }
      ],
      queues: [
        { name: 'firstRun.q.1' },
        { name: 'threads.q.1' }
      ],
      bindings: [
        { exchange: 'firstRun.ex.1', queue: 'firstRun.q.1' },
        { exchange: 'threads.ex.1', queue: 'threads.q.1' }
      ]
    }
  };