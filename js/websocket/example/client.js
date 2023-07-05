var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

// listen connectFailed
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

// listen connect
client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    // listen error
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });

    // close
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });

    // listen message
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    
    // send to server
    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendUTF(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();
});

// build connect
client.connect('ws://localhost:8080/', 'echo-protocol');