import express, { Application, Request, Response } from 'express';
import WebSocket from 'ws';
import http, { Server } from 'http';
import { authenticateSocketRequest } from './auth/Authenticator';
import LOG from './utils/Logger';
import { Socket } from 'net';
// import fs from 'fs';
import { getWebSocketServerInfo } from './utils/CommonUtils';

console.log(__dirname);

// const key = fs.readFileSync(__dirname + '/pem/key.pem');
// const cert = fs.readFileSync(__dirname + '/pem/cert.pem');
// const passphrase = process.env.PASSPHRASE;

const app: Application = express();
const server: Server = http.createServer(app);
const wss: WebSocket.Server = new WebSocket.Server({ noServer: true });

/**
 * when the connection is accepted
 */
wss.on('connection', (ws: WebSocket) => {
  LOG.info(`Connection opened! Current connections: ${wss.clients?.size}.`);

  ws.on('message', (message: WebSocket.MessageEvent) => {
    wss.clients.forEach((client: WebSocket) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    LOG.info(`Connection closed! Current connections: ${wss.clients?.size}.`);
  });
});

/**
 * handle handshake request or renew connection request
 */
server.on('upgrade', (request: Request, socket: Socket, head: Buffer) => {
  authenticateSocketRequest(request).then((isValid: boolean) => {
    if (isValid) {
      socket.setKeepAlive(true, 10000);
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });
});

app.use(express.json());

/**
 * Send status 200 for cluster healthcheck
 */
app.get('/', (_req: Request, res: Response) => res.sendStatus(200));

/**
 * get update request from lambda and broadcast event to all authenticated connections
 */
app.post('/', (req: Request, _res: Response) => {
  LOG.debug(`Express Request: `, req.body);
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(req.body));
    }
  });
  _res.send(getWebSocketServerInfo(wss));
});

const port = process.env.PORT || 80;
server.listen(port, () => LOG.info(`Lisening on port :${port}`));
