import WebSocket from 'ws';

export interface iWebSocketServerInfo {
  allConnections: number;
  openConnections: number;
}

export const getWebSocketServerInfo = (wss: WebSocket.Server): iWebSocketServerInfo => {
  return {
    allConnections: wss.clients.size,
    openConnections: [...wss.clients].filter((client: WebSocket) => client.readyState === WebSocket.OPEN).length,
  };
};
