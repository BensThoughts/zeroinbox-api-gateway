const amqp = require('amqplib/callback_api');


const createClient = async function() {
    // let channel; 
    let connection = await amqp.connect('amqp://some-rabbit', function(err, conn) {    
        return conn;
    });
    return connection;

}

module.exports = createClient;