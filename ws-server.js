const { WebSocket, WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8070 });

wss.on('connection', function connection(ws) {

    ws.on('error', console.error);
  
    ws.on('message', function message(data) {
        console.log('received: %s', data);

        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(data, { binary: false });
            }
          });
    });
  });


console.log('====> Websocket server alive! <====');