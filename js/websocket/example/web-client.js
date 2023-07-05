class WebSocketClient {

    constructor(url, protocol) {
        let websocket = window['MozWebSocket'] ? MozWebSocket : WebSocket;
        this.socket = new websocket(url, protocol)

        this.socket.open = this.open;
        this.socket.onmessage = this.message;
        this.socket.onclose = this.close;
    }

    open() {
        console.log('WebSocket open.')
    }

    message(message) {
        try {
            let data = JSON.parse(message.data)
            console.log(data)
        } catch (error) {
            console.error(error)
        }
    }

    close() {
        console.log('WebSocket Connection Closed.')
    }

    send (message) {
        this.socket.send(message)
    }

}
const socket = new WebSocketClient('ws://localhost:8080/', 'echo-protocol')
const btn = document.getElementById('btn')
btn.addEventListener('click', () => {
    console.log('btn send message.')
    socket.send(JSON.stringify({
        name: "lee",
        age: 23,
        sex: 1
    }))
})
