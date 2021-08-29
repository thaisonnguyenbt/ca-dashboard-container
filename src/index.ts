import express, { Application, Request, Response } from 'express';
import WebSocket from 'ws';
import http, { Server } from 'http';

const app: Application = express();
const server: Server = http.createServer(app);
const wss: WebSocket.Server = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.send('Welcome New Client!');
  ws.on('message', (message) => {
    console.log('received: %s', message);

    wss.clients.forEach((client: WebSocket) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

app.get('/', (_req: Request, res: Response) => res.send('Hello World!'));

server.listen(3000, () => console.log(`Lisening on port :3000`));
