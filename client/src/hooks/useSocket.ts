import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

declare global {
  interface Window {
    __gameSocket: Socket | undefined;
  }
}

// Create socket at module level - runs once on import
if (!window.__gameSocket) {
  window.__gameSocket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
}

export const socket: Socket = window.__gameSocket;
