import { v4 as uuidv4 } from 'uuid';
import {
  Room,
  Player,
  RoomStatus,
  GameType,
  DEFAULT_MAX_PLAYERS
} from '../types';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  private generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    if (this.rooms.has(result)) {
      return this.generateRoomId();
    }
    return result;
  }

  createRoom(hostId: string, nickname: string, gameType: GameType, maxPlayers?: number): Room {
    const roomId = this.generateRoomId();
    const player: Player = {
      id: hostId,
      nickname,
      isHost: true,
      isReady: true
    };

    const room: Room = {
      id: roomId,
      gameType,
      status: RoomStatus.WAITING,
      players: [player],
      maxPlayers: maxPlayers || DEFAULT_MAX_PLAYERS[gameType],
      createdAt: new Date()
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, playerId: string, nickname: string): { success: boolean; room?: Room; error?: string } {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.status !== RoomStatus.WAITING) {
      return { success: false, error: 'Game already in progress' };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    if (room.players.some(p => p.id === playerId)) {
      return { success: false, error: 'Already in room' };
    }

    const player: Player = {
      id: playerId,
      nickname,
      isHost: false,
      isReady: false
    };

    room.players.push(player);
    return { success: true, room };
  }

  leaveRoom(roomId: string, playerId: string): { success: boolean; room?: Room; deleted?: boolean } {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false };
    }

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return { success: false };
    }

    room.players.splice(playerIndex, 1);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return { success: true, deleted: true };
    }

    // If the host left, assign new host
    if (room.players.length > 0 && !room.players.some(p => p.isHost)) {
      room.players[0].isHost = true;
    }

    return { success: true, room };
  }

  toggleReady(roomId: string, playerId: string): { success: boolean; room?: Room } {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false };
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false };
    }

    player.isReady = !player.isReady;
    return { success: true, room };
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getPlayerRoom(playerId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.id === playerId)) {
        return room;
      }
    }
    return undefined;
  }

  setRoomStatus(roomId: string, status: RoomStatus): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = status;
    }
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  canStartGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (room.status !== RoomStatus.WAITING) return false;
    if (room.players.length < 2) return false;
    return room.players.every(p => p.isReady);
  }
}
