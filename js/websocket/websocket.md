#### Websocket
WebSocket是一种在Web应用程序中实现双向通信的协议。它建立在HTTP协议之上，使用标准的HTTP握手过程进行初始连接，然后通过保持长期的连接实现双向通信。
[Websocket协议翻译](http://static.kancloud.cn/kancloud/websocket-protocol/56231)

以下是WebSocket协议的一些关键特点：

- 建立连接：WebSocket连接使用标准的HTTP握手过程进行初始连接。客户端通过发送HTTP请求到服务器来发起连接，并在请求头中包含特定的WebSocket标头。服务器收到请求后，如果同意升级为WebSocket连接，则返回一个HTTP 101状态码作为响应。

- 双向通信：一旦建立了WebSocket连接，客户端和服务器之间可以进行双向通信。客户端可以发送消息给服务器，服务器可以发送消息给客户端，而不需要客户端发起新的HTTP请求。

- 实时性：WebSocket连接保持长期活动状态，允许实时数据的传输和接收。相比传统的HTTP请求-响应模式，WebSocket提供更低的延迟和更高的实时性能。

- 支持多种数据类型：WebSocket可以传输文本数据和二进制数据。客户端和服务器可以交换各种类型的消息，包括JSON、XML、图像、音频和视频等。

- 心跳检测：WebSocket支持心跳检测机制，通过定期发送保持活动的消息来保持连接的存活状态。如果一段时间内没有数据传输，连接可能会被关闭。

WebSocket协议是一种全双工、低延迟、实时性强的协议，适用于需要实时数据传输和双向通信的应用场景，如聊天应用、实时游戏、股票行情等。它与HTTP协议兼容，并且可以在现代浏览器和服务器中广泛使用。

#### npm同名包websocket
WebSocket Client & Server Implementation for Node.
[API文档](https://github.com/theturtle32/WebSocket-Node/blob/HEAD/docs/index.md)

```bash
$ npm i websocket
```