import { GameState, GameStatus, GameResult, GameType } from '../types';
import { UnoGame } from '../games/uno/UnoGame';
import { MonopolyGame } from '../games/monopoly/MonopolyGame';
import { MahjongGame } from '../games/mahjong/MahjongGame';

export interface Game {
  getState(): GameState;
  getStatus(): GameStatus;
  getCurrentPlayerId(): string | null;
  getPlayers(): string[];
  getAvailableActions(playerId: string): string[];
  handleAction(playerId: string, action: string, data?: unknown): { success: boolean; error?: string };
  getPublicState(): Record<string, unknown>;
  getPlayerState(playerId: string): Record<string, unknown>;
  getResult(): GameResult | null;
  setNicknames?(nicknameMap: Record<string, string>): void;
}

export class GameManager {
  private games: Map<string, Game> = new Map();

  createGame(roomId: string, gameType: GameType, playerIds: string[]): Game {
    let game: Game;

    switch (gameType) {
      case GameType.UNO:
        game = new UnoGame(playerIds);
        break;
      case GameType.MONOPOLY:
        game = new MonopolyGame(playerIds);
        break;
      case GameType.MAHJONG:
        game = new MahjongGame(playerIds);
        break;
      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }

    this.games.set(roomId, game);
    return game;
  }

  getGame(roomId: string): Game | undefined {
    return this.games.get(roomId);
  }

  removeGame(roomId: string): void {
    this.games.delete(roomId);
  }

  handleGameAction(roomId: string, playerId: string, action: string, data?: unknown): { success: boolean; error?: string } {
    const game = this.games.get(roomId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }
    return game.handleAction(playerId, action, data);
  }

  getGameState(roomId: string): GameState | undefined {
    return this.games.get(roomId)?.getState();
  }

  getPublicGameState(roomId: string): Record<string, unknown> | undefined {
    return this.games.get(roomId)?.getPublicState();
  }

  getPlayerGameState(roomId: string, playerId: string): Record<string, unknown> | undefined {
    return this.games.get(roomId)?.getPlayerState(playerId);
  }
}
