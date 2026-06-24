import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './managers/RoomManager';
import { GameManager } from './managers/GameManager';
import { setupSocketHandlers } from './socket/handlers';

const PORT = process.env.PORT || 3001;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// Initialize managers
const roomManager = new RoomManager();
const gameManager = new GameManager();

// Setup socket handlers
setupSocketHandlers(io, roomManager, gameManager);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get available rooms
app.get('/api/rooms', (req, res) => {
  const rooms = roomManager.getAllRooms();
  res.json({ rooms });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS origin: http://localhost:5173`);
});

export { app, httpServer, io };
