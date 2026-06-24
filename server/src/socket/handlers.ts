import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager';
import { GameManager } from '../managers/GameManager';
import { GameType, RoomStatus } from '../types';
import { UnoColor } from '../games/uno/types';

export function setupSocketHandlers(
  io: Server,
  roomManager: RoomManager,
  gameManager: GameManager
): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Create room
    socket.on('createRoom', (data: { nickname: string; gameType: GameType; maxPlayers?: number }) => {
      const room = roomManager.createRoom(socket.id, data.nickname, data.gameType, data.maxPlayers);
      socket.join(room.id);
      socket.emit('roomCreated', { roomId: room.id, room });
      console.log(`Room created: ${room.id} by ${data.nickname}`);
    });

    // Join room
    socket.on('joinRoom', (data: { roomId: string; nickname: string }) => {
      const result = roomManager.joinRoom(data.roomId.toUpperCase(), socket.id, data.nickname);

      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      socket.join(data.roomId.toUpperCase());
      socket.emit('roomJoined', { roomId: data.roomId.toUpperCase(), room: result.room });
      io.to(data.roomId.toUpperCase()).emit('playerJoined', {
        playerId: socket.id,
        nickname: data.nickname,
        room: result.room
      });
      console.log(`${data.nickname} joined room ${data.roomId.toUpperCase()}`);
    });

    // Leave room
    socket.on('leaveRoom', () => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room) return;

      const result = roomManager.leaveRoom(room.id, socket.id);
      socket.leave(room.id);

      if (!result.deleted && result.room) {
        io.to(room.id).emit('playerLeft', {
          playerId: socket.id,
          room: result.room
        });
      }

      socket.emit('leftRoom');
      console.log(`Player ${socket.id} left room ${room.id}`);
    });

    // Toggle ready
    socket.on('toggleReady', () => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room) return;

      const result = roomManager.toggleReady(room.id, socket.id);
      if (result.success && result.room) {
        io.to(room.id).emit('roomUpdated', { room: result.room });
      }
    });

    // Get room info (also joins the Socket.IO room for receiving updates)
    socket.on('getRoomInfo', (data: { roomId: string }) => {
      const room = roomManager.getRoom(data.roomId.toUpperCase());
      if (room) {
        socket.join(room.id);
        socket.emit('roomInfo', { room });
      } else {
        socket.emit('error', { message: 'Room not found' });
      }
    });

    // Get available rooms
    socket.on('getRooms', () => {
      const rooms = roomManager.getAllRooms().filter(r => r.status === RoomStatus.WAITING);
      socket.emit('roomsList', { rooms });
    });

    // Get game state (for reconnection / polling)
    socket.on('getGameState', (data: { roomId: string }) => {
      const room = roomManager.getRoom(data.roomId.toUpperCase());
      if (room) {
        socket.join(room.id);
        const playerState = gameManager.getPlayerGameState(room.id, socket.id);
        if (playerState) {
          socket.emit('gameState', playerState);
        }
      }
    });

    // Start game
    socket.on('startGame', () => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room) return;

      // Check if player is host
      const player = room.players.find(p => p.id === socket.id);
      if (!player?.isHost) {
        socket.emit('error', { message: 'Only the host can start the game' });
        return;
      }

      if (!roomManager.canStartGame(room.id)) {
        socket.emit('error', { message: 'Cannot start game: need at least 2 players and all must be ready' });
        return;
      }

      // Create game
      const game = gameManager.createGame(
        room.id,
        room.gameType,
        room.players.map(p => p.id)
      );

      // Set nicknames for games that support it
      if (game.setNicknames) {
        const nicknameMap: Record<string, string> = {};
        for (const p of room.players) {
          nicknameMap[p.id] = p.nickname;
        }
        game.setNicknames(nicknameMap);
      }

      roomManager.setRoomStatus(room.id, RoomStatus.PLAYING);

      // Send game state to each player (with their hand)
      for (const roomPlayer of room.players) {
        const playerState = game.getPlayerState(roomPlayer.id);
        io.to(roomPlayer.id).emit('gameStarted', {
          roomId: room.id,
          gameState: playerState
        });
      }

      console.log(`Game started in room ${room.id}`);
    });

    // UNO game actions
    socket.on('uno:playCard', (data: { cardIndex: number; color?: UnoColor }) => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room) return;

      const result = gameManager.handleGameAction(room.id, socket.id, 'playCard', data);
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      // Broadcast updated state
      broadcastGameState(io, roomManager, gameManager, room.id);
    });

    socket.on('uno:drawCard', () => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room) return;

      const result = gameManager.handleGameAction(room.id, socket.id, 'drawCard');
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      // Broadcast updated state
      broadcastGameState(io, roomManager, gameManager, room.id);
    });

    socket.on('uno:callUno', () => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room) return;

      const result = gameManager.handleGameAction(room.id, socket.id, 'callUno');
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      // Broadcast updated state
      broadcastGameState(io, roomManager, gameManager, room.id);
    });

    // Monopoly game actions
    socket.on('monopoly:action', (data: { action: string; data?: unknown }) => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room) return;

      const result = gameManager.handleGameAction(room.id, socket.id, data.action, data.data);
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      // Broadcast updated state
      broadcastGameState(io, roomManager, gameManager, room.id);
    });

    // Disconnect
    socket.on('disconnect', () => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (room) {
        const result = roomManager.leaveRoom(room.id, socket.id);
        if (!result.deleted && result.room) {
          io.to(room.id).emit('playerLeft', {
            playerId: socket.id,
            room: result.room
          });
        }
      }
      console.log(`Player disconnected: ${socket.id}`);
    });
  });
}

function broadcastGameState(
  io: Server,
  roomManager: RoomManager,
  gameManager: GameManager,
  roomId: string
): void {
  const room = roomManager.getRoom(roomId);
  const game = gameManager.getGame(roomId);
  if (!room || !game) return;

  // Check if game is finished
  if (game.getStatus() === 'FINISHED') {
    const result = game.getResult();
    io.to(roomId).emit('gameFinished', { result });
    roomManager.setRoomStatus(roomId, RoomStatus.FINISHED);
    return;
  }

  // Send personalized state to each player
  for (const player of room.players) {
    const playerState = game.getPlayerState(player.id);
    io.to(player.id).emit('gameState', playerState);
  }
}
