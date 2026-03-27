// proxy.js - Rode com: node proxy.js (instale ws: npm i ws)
const WebSocket = require('ws');

const PORT = 9595;
const TOKEN = 'f4b47820719f4797a6d3e847a7e39e51d8918665397d4a76802c644f9aec6432'; // <<< Token do iTick
const ITICK_URL = 'wss://api.itick.org/forex';
const DEBUG = true;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (clientWs, req) => {
  console.log('[Proxy] Cliente conectado de:', req.socket.remoteAddress);

  const upstream = new WebSocket(ITICK_URL, { headers: { token: TOKEN } });

  upstream.on('open', () => {
    console.log('[Proxy] Conectado ao iTick');
    const authMsg = JSON.stringify({ ac: 'auth', params: TOKEN });
    upstream.send(authMsg);
    if (DEBUG) console.log('[Proxy] -> iTick auth:', authMsg);
  });

  upstream.on('message', (data) => {
    const msgStr = data.toString();
    if (DEBUG) console.log('[Proxy] <- iTick:', msgStr);
    if (clientWs.readyState === WebSocket.OPEN) clientWs.send(data);
  });

  clientWs.on('message', (data) => {
    const msgStr = data.toString();
    if (DEBUG) console.log('[Proxy] <- Cliente (-> iTick):', msgStr);
    if (upstream.readyState === WebSocket.OPEN) upstream.send(data);
  });

  upstream.on('close', (code, reasonBuf) => {
    const reason = reasonBuf ? reasonBuf.toString() : '';
    console.log('[Proxy] Upstream fechado:', code, reason);
    if (clientWs.readyState !== WebSocket.CLOSING && clientWs.readyState !== WebSocket.CLOSED) {
      clientWs.close(typeof code === 'number' ? code : 1000, reason || 'Upstream closed');
    }
  });

  clientWs.on('close', (code, reasonBuf) => {
    const reason = reasonBuf ? reasonBuf.toString() : '';
    console.log('[Proxy] Cliente fechado:', code, reason);
    if (upstream.readyState !== WebSocket.CLOSING && upstream.readyState !== WebSocket.CLOSED) {
      upstream.close(typeof code === 'number' ? code : 1000, reason || 'Client closed');
    }
  });

  upstream.on('error', (err) => {
    console.error('[Proxy] Erro upstream:', err);
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close(1011, 'Upstream error');
  });

  clientWs.on('error', (err) => {
    console.error('[Proxy] Erro cliente:', err);
    if (upstream.readyState === WebSocket.OPEN) upstream.close(1011, 'Client error');
  });
});

console.log(`[Proxy] WS rodando em ws://localhost:${PORT}`);
