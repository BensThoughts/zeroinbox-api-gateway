exports.topology = function() {
    return {
    connection: {
        name: 'dev',
        host: 'rabbitmq',
        port: 5672,
        // delay before initial retry on lost connect?
        waitMin: 30000,
        // max delay between retries
        waitMax: 5000,
        // increase delay between each retry
        waitIncrement: 1000
    },
    exchanges:[
        // { name: "config-ex.1", type: "fanout", publishTimeout: 1000 },
        { name: "threads.ex.1", type: "direct", alternate: "alternate-ex.2", persistent: true },
        // { name: "dead-letter-ex.2", type: "fanout" }
        ],
    queues:[
        { name:"threads.q.1", limit: 100, queueLimit: 1000 },
        // { name:"config-q.2", subscribe: true, deadLetter: "dead-letter-ex.2" }
        ],
    bindings:[
        { exchange: "threads.ex.1", target: "threads.q.1", keys: [ "threads" ] },
        // { exchange: "config-ex.2", target: "config-q.2", keys: "test1" }
      ]
    }   
}