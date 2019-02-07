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
        { name: "threads.ex.1", type: "direct", autoDelete: true , durable: false },
        // { name: "dead-letter-ex.2", type: "fanout" }
        ],
    }

}