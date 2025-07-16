// ws-server.js
// Минимальный WebSocket relay-сервер для глобальной рисовалки

const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    // Рассылаем всем кроме отправителя
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

console.log('WebSocket relay server started on port', PORT); 
