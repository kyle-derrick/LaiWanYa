import { Game } from '../../managers/GameManager';
import { GameStatus, GameState, GameResult } from '../../types';
import {
  Tile,
  TileSuit,
  WindDirection,
  Meld,
  MeldType,
  MahjongPlayerState,
  MahjongGameState,
  PendingAction
} from './types';
import { createTileSet, shuffleTiles, sortTiles, tilesEqual } from './Tile';
import {
  isWinningHand,
  findPossibleChi,
  canPong,
  canKong,
  findConcealedKongs,
  findSupplementKongs,
  calculateWin
} from './Hand';

const WINDS: WindDirection[] = [
  WindDirection.EAST,
  WindDirection.SOUTH,
  WindDirection.WEST,
  WindDirection.NORTH
];

export class MahjongGame implements Game {
  private players: MahjongPlayerState[] = [];
  private currentPlayerIndex: number = 0;
  private status: GameStatus = GameStatus.INIT;
  private wall: Tile[] = [];
  private deadWall: Tile[] = [];
  private lastDiscard: Tile | null = null;
  private lastDiscardPlayerId: string | null = null;
  private lastAction: string | null = null;
  private winnerId: string | null = null;
  private winType: string | null = null;
  private pendingActions: PendingAction[] = [];
  private roundWind: WindDirection = WindDirection.EAST;
  private playerOrder: string[] = [];
  private nicknameMap: Record<string, string> = {};

  // Track if the current player has drawn (for discard validation)
  private hasDrawn: boolean = false;
  // Track if a kong was just declared (for kong flower win)
  private lastActionWasKong: boolean = false;
  private kongDrawPlayerId: string | null = null;

  constructor(playerIds: string[]) {
    this.initializeGame(playerIds);
  }

  private initializeGame(playerIds: string[]): void {
    if (playerIds.length !== 4) {
      throw new Error('Mahjong requires exactly 4 players');
    }

    this.players = playerIds.map((id, index) => ({
      id,
      nickname: '',
      wind: WINDS[index],
      hand: [],
      melds: [],
      discards: [],
      flowers: [],
      score: 0,
      isReady: false
    }));

    this.playerOrder = [...playerIds];

    // Create and shuffle tile set (136 tiles)
    const allTiles = createTileSet();
    this.wall = shuffleTiles(allTiles);

    // Deal tiles
    this.dealTiles();

    this.currentPlayerIndex = 0; // East wind goes first
    this.status = GameStatus.PLAYING;
    this.hasDrawn = false;
  }

  private dealTiles(): void {
    // Each player gets 13 tiles, dealer gets 14
    for (let i = 0; i < 4; i++) {
      const hand: Tile[] = [];
      for (let j = 0; j < 13; j++) {
        hand.push(this.drawFromWall());
      }
      this.players[i].hand = sortTiles(hand);
    }

    // Dealer draws 14th tile
    const dealerHand = this.players[0].hand;
    dealerHand.push(this.drawFromWall());
    this.players[0].hand = sortTiles(dealerHand);
    this.hasDrawn = true; // Dealer starts with a draw
  }

  private drawFromWall(): Tile {
    if (this.wall.length === 0) {
      // No more tiles - will trigger draw game
      return { id: 'empty', suit: TileSuit.WAN, value: 0 };
    }
    const tile = this.wall.pop()!;

    // Check for flower tiles - auto replace
    if (tile.suit === TileSuit.HUA) {
      // This will be handled by the caller
    }

    return tile;
  }

  /**
   * Draw a tile and handle flower replacement
   */
  private drawTileForPlayer(playerIndex: number): Tile | null {
    if (this.wall.length === 0) return null;

    let tile = this.drawFromWall();
    if (!tile || tile.id === 'empty') return null;

    // Handle flower tiles - draw replacement
    while (tile.suit === TileSuit.HUA && this.wall.length > 0) {
      this.players[playerIndex].flowers.push(tile);
      tile = this.drawFromWall();
    }

    if (tile.suit === TileSuit.HUA) {
      this.players[playerIndex].flowers.push(tile);
      return null;
    }

    return tile;
  }

  // --- Game interface implementation ---

  getStatus(): GameStatus {
    return this.status;
  }

  getCurrentPlayerId(): string | null {
    if (this.status !== GameStatus.PLAYING) return null;
    return this.players[this.currentPlayerIndex]?.id || null;
  }

  getPlayers(): string[] {
    return this.players.map(p => p.id);
  }

  getState(): GameState {
    return {
      status: this.status,
      currentPlayerId: this.getCurrentPlayerId(),
      players: this.getPlayers(),
      data: this.getPublicState()
    };
  }

  getPublicState(): Record<string, unknown> {
    const state: MahjongGameState = {
      status: this.status === GameStatus.INIT ? 'WAITING' :
        this.status === GameStatus.PLAYING ? 'PLAYING' : 'FINISHED',
      currentPlayerId: this.getCurrentPlayerId(),
      players: this.players.map(p => ({
        id: p.id,
        nickname: this.nicknameMap[p.id] || p.id.substring(0, 8),
        wind: p.wind,
        hand: [], // Don't expose other players' hands
        handCount: p.hand.length,
        melds: p.melds,
        discards: p.discards,
        flowers: p.flowers,
        score: p.score,
        isReady: p.isReady
      })),
      wallCount: this.wall.length,
      lastDiscard: this.lastDiscard,
      lastDiscardPlayerId: this.lastDiscardPlayerId,
      lastAction: this.lastAction,
      winnerId: this.winnerId,
      winType: this.winType,
      pendingActions: this.pendingActions,
      roundWind: this.roundWind
    };
    return state as unknown as Record<string, unknown>;
  }

  getPlayerState(playerId: string): Record<string, unknown> {
    const publicState = this.getPublicState() as unknown as MahjongGameState;
    const player = this.players.find(p => p.id === playerId);
    if (!player) return publicState as unknown as Record<string, unknown>;

    return {
      ...publicState,
      playerHand: player.hand,
      playerMelds: player.melds,
      playerFlowers: player.flowers,
      availableActions: this.getAvailableActions(playerId),
      canDiscard: this.hasDrawn && this.getCurrentPlayerId() === playerId && this.pendingActions.length === 0
    };
  }

  getResult(): GameResult | null {
    if (!this.winnerId) return null;

    const winner = this.players.find(p => p.id === this.winnerId);
    if (!winner) return null;

    return {
      winnerId: this.winnerId,
      winnerNickname: this.nicknameMap[this.winnerId] || '',
      scores: Object.fromEntries(
        this.players.map(p => [p.id, p.score])
      )
    };
  }

  getAvailableActions(playerId: string): string[] {
    if (this.status !== GameStatus.PLAYING) return [];

    const actions: string[] = [];

    // Check if player has pending actions (from another player's discard)
    const pending = this.pendingActions.find(pa => pa.playerId === playerId);
    if (pending) {
      return pending.actions;
    }

    // If it's this player's turn
    if (this.getCurrentPlayerId() === playerId) {
      // Can declare concealed kong
      const player = this.players.find(p => p.id === playerId);
      if (player) {
        const concealedKongs = findConcealedKongs(player.hand);
        if (concealedKongs.length > 0) {
          actions.push('kong_an');
        }

        // Can declare supplement kong
        const supplementKongs = findSupplementKongs(player.hand, player.melds);
        if (supplementKongs.length > 0) {
          actions.push('kong_bu');
        }
      }

      // If has drawn, can discard or declare win (zimo)
      if (this.hasDrawn) {
        actions.push('discard');

        // Check for self-draw win (自摸)
        if (player && isWinningHand(player.hand, player.melds)) {
          actions.push('hu');
        }
      }
    }

    return actions;
  }

  handleAction(playerId: string, action: string, data?: unknown): { success: boolean; error?: string } {
    if (this.status !== GameStatus.PLAYING) {
      return { success: false, error: 'Game is not in progress' };
    }

    switch (action) {
      case 'discard':
        return this.handleDiscard(playerId, data as { tileId: string });
      case 'chi':
        return this.handleChi(playerId, data as { tileIds: string[] });
      case 'pong':
        return this.handlePong(playerId);
      case 'kong':
        return this.handleKong(playerId);
      case 'kong_an':
        return this.handleConcealedKong(playerId);
      case 'kong_bu':
        return this.handleSupplementKong(playerId);
      case 'hu':
        return this.handleWin(playerId);
      case 'pass':
        return this.handlePass(playerId);
      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  // --- Action Handlers ---

  private handleDiscard(playerId: string, data: { tileId: string }): { success: boolean; error?: string } {
    if (this.getCurrentPlayerId() !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (!this.hasDrawn) {
      return { success: false, error: 'Must draw a tile first' };
    }

    if (this.pendingActions.length > 0) {
      return { success: false, error: 'Must resolve pending actions first' };
    }

    const player = this.players[this.currentPlayerIndex];
    const tileIndex = player.hand.findIndex(t => t.id === data.tileId);

    if (tileIndex === -1) {
      return { success: false, error: 'Tile not in hand' };
    }

    const discardedTile = player.hand.splice(tileIndex, 1)[0];
    player.discards.push(discardedTile);
    player.hand = sortTiles(player.hand);

    this.lastDiscard = discardedTile;
    this.lastDiscardPlayerId = playerId;
    this.hasDrawn = false;
    this.lastActionWasKong = false;
    this.lastAction = `${this.nicknameMap[playerId] || playerId.substring(0, 8)} 打出 ${this.getTileDisplay(discardedTile)}`;

    // Check if other players can respond to this discard
    this.checkDiscardResponses(discardedTile, playerId);

    // If no one can respond, move to next player
    if (this.pendingActions.length === 0) {
      this.advanceTurn();
      this.drawForCurrentPlayer();
    }

    return { success: true };
  }

  private handleChi(playerId: string, data: { tileIds: string[] }): { success: boolean; error?: string } {
    const pending = this.pendingActions.find(pa => pa.playerId === playerId && pa.actions.includes('chi'));
    if (!pending) {
      return { success: false, error: 'Cannot chi right now' };
    }

    if (!this.lastDiscard) {
      return { success: false, error: 'No tile to chi' }
    }

    const player = this.players.find(p => p.id === playerId)!;
    const chiTiles: Tile[] = [];

    for (const tileId of data.tileIds) {
      const tile = player.hand.find(t => t.id === tileId);
      if (!tile) {
        return { success: false, error: 'Tile not in hand' };
      }
      chiTiles.push(tile);
    }

    if (chiTiles.length !== 2) {
      return { success: false, error: 'Chi requires 2 tiles from hand' };
    }

    // Remove tiles from hand
    for (const tile of chiTiles) {
      const idx = player.hand.findIndex(t => t.id === tile.id);
      player.hand.splice(idx, 1);
    }

    // Create meld
    const meld: Meld = {
      type: MeldType.CHI,
      tiles: sortTiles([...chiTiles, this.lastDiscard]),
      fromPlayerId: this.lastDiscardPlayerId || undefined
    };
    player.melds.push(meld);

    // Remove the discard from the discarding player's discard pile
    this.removeLastDiscard();

    // Clear pending actions
    this.pendingActions = [];
    this.lastDiscard = null;
    this.lastDiscardPlayerId = null;

    // Set current player to the chi player
    this.currentPlayerIndex = this.players.findIndex(p => p.id === playerId);
    this.hasDrawn = false; // Player must discard after chi

    this.lastAction = `${this.nicknameMap[playerId] || playerId.substring(0, 8)} 吃牌`;

    return { success: true };
  }

  private handlePong(playerId: string): { success: boolean; error?: string } {
    const pending = this.pendingActions.find(pa => pa.playerId === playerId && pa.actions.includes('pong'));
    if (!pending) {
      return { success: false, error: 'Cannot pong right now' };
    }

    if (!this.lastDiscard) {
      return { success: false, error: 'No tile to pong' };
    }

    const player = this.players.find(p => p.id === playerId)!;
    const matchingTiles = player.hand.filter(t => tilesEqual(t, this.lastDiscard!));

    if (matchingTiles.length < 2) {
      return { success: false, error: 'Not enough matching tiles' };
    }

    // Remove tiles from hand
    const pongTiles = matchingTiles.slice(0, 2);
    for (const tile of pongTiles) {
      const idx = player.hand.findIndex(t => t.id === tile.id);
      player.hand.splice(idx, 1);
    }

    // Create meld
    const meld: Meld = {
      type: MeldType.PONG,
      tiles: [...pongTiles, this.lastDiscard],
      fromPlayerId: this.lastDiscardPlayerId || undefined
    };
    player.melds.push(meld);

    // Remove the discard
    this.removeLastDiscard();

    // Clear pending actions
    this.pendingActions = [];
    this.lastDiscard = null;
    this.lastDiscardPlayerId = null;

    // Set current player to pong player
    this.currentPlayerIndex = this.players.findIndex(p => p.id === playerId);
    this.hasDrawn = false; // Player must discard after pong

    this.lastAction = `${this.nicknameMap[playerId] || playerId.substring(0, 8)} 碰牌`;

    return { success: true };
  }

  private handleKong(playerId: string): { success: boolean; error?: string } {
    const pending = this.pendingActions.find(pa => pa.playerId === playerId && pa.actions.includes('kong'));
    if (!pending) {
      return { success: false, error: 'Cannot kong right now' };
    }

    if (!this.lastDiscard) {
      return { success: false, error: 'No tile to kong' };
    }

    const player = this.players.find(p => p.id === playerId)!;
    const matchingTiles = player.hand.filter(t => tilesEqual(t, this.lastDiscard!));

    if (matchingTiles.length < 3) {
      return { success: false, error: 'Not enough matching tiles' };
    }

    // Remove tiles from hand
    const kongTiles = matchingTiles.slice(0, 3);
    for (const tile of kongTiles) {
      const idx = player.hand.findIndex(t => t.id === tile.id);
      player.hand.splice(idx, 1);
    }

    // Create meld
    const meld: Meld = {
      type: MeldType.KONG_MING,
      tiles: [...kongTiles, this.lastDiscard],
      fromPlayerId: this.lastDiscardPlayerId || undefined
    };
    player.melds.push(meld);

    // Remove the discard
    this.removeLastDiscard();

    // Clear pending actions
    this.pendingActions = [];
    this.lastDiscard = null;
    this.lastDiscardPlayerId = null;

    // Set current player to kong player, draw a replacement tile
    this.currentPlayerIndex = this.players.findIndex(p => p.id === playerId);
    this.lastActionWasKong = true;
    this.kongDrawPlayerId = playerId;
    this.drawForCurrentPlayer();

    this.lastAction = `${this.nicknameMap[playerId] || playerId.substring(0, 8)} 杠牌`;

    return { success: true };
  }

  private handleConcealedKong(playerId: string): { success: boolean; error?: string } {
    if (this.getCurrentPlayerId() !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    const player = this.players.find(p => p.id === playerId)!;
    const kongs = findConcealedKongs(player.hand);

    if (kongs.length === 0) {
      return { success: false, error: 'No concealed kong available' };
    }

    // Take the first available kong
    const kongTiles = kongs[0];
    const meldTile = kongTiles[0];

    // Remove tiles from hand
    for (const tile of kongTiles) {
      const idx = player.hand.findIndex(t => t.id === tile.id);
      player.hand.splice(idx, 1);
    }

    // Create meld
    const meld: Meld = {
      type: MeldType.KONG_AN,
      tiles: kongTiles
    };
    player.melds.push(meld);

    // Draw replacement tile
    this.lastActionWasKong = true;
    this.kongDrawPlayerId = playerId;
    this.drawForCurrentPlayer();

    this.lastAction = `${this.nicknameMap[playerId] || playerId.substring(0, 8)} 暗杠`;

    return { success: true };
  }

  private handleSupplementKong(playerId: string): { success: boolean; error?: string } {
    if (this.getCurrentPlayerId() !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    const player = this.players.find(p => p.id === playerId)!;
    const kongs = findSupplementKongs(player.hand, player.melds);

    if (kongs.length === 0) {
      return { success: false, error: 'No supplement kong available' };
    }

    // Take the first available
    const tile = kongs[0][0];
    const pongMeld = player.melds.find(m =>
      m.type === MeldType.PONG && tilesEqual(m.tiles[0], tile)
    );

    if (!pongMeld) {
      return { success: false, error: 'No matching pong found' };
    }

    // Remove tile from hand
    const idx = player.hand.findIndex(t => t.id === tile.id);
    player.hand.splice(idx, 1);

    // Upgrade pong to kong
    pongMeld.type = MeldType.KONG_BU;
    pongMeld.tiles.push(tile);

    // Draw replacement tile
    this.lastActionWasKong = true;
    this.kongDrawPlayerId = playerId;
    this.drawForCurrentPlayer();

    this.lastAction = `${this.nicknameMap[playerId] || playerId.substring(0, 8)} 补杠`;

    return { success: true };
  }

  private handleWin(playerId: string): { success: boolean; error?: string } {
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    // Check pending actions first
    const pending = this.pendingActions.find(pa => pa.playerId === playerId && pa.actions.includes('hu'));
    const isPendingWin = !!pending;

    // For self-draw win, must be current player
    if (!isPendingWin && this.getCurrentPlayerId() !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    // Verify winning hand
    const handTiles = isPendingWin && this.lastDiscard
      ? [...player.hand, this.lastDiscard]
      : player.hand;

    if (!isWinningHand(handTiles, player.melds)) {
      return { success: false, error: 'Not a winning hand' };
    }

    const winTile = isPendingWin && this.lastDiscard ? this.lastDiscard : player.hand[player.hand.length - 1];
    const isSelfDraw = !isPendingWin;

    // Calculate score
    const seatWindIndex = WINDS.indexOf(player.wind) + 1;
    const roundWindIndex = WINDS.indexOf(this.roundWind) + 1;

    const winResult = calculateWin(
      player.hand,
      player.melds,
      winTile,
      isSelfDraw,
      this.lastActionWasKong && this.kongDrawPlayerId === playerId,
      player.flowers,
      seatWindIndex,
      roundWindIndex
    );

    player.score = winResult.fan;

    // If someone discarded the winning tile, they pay
    if (isPendingWin && this.lastDiscardPlayerId) {
      // In simplified rules, the discarder pays for everyone
      // In full rules, it would be more nuanced
    }

    this.winnerId = playerId;
    this.winType = isSelfDraw ? '自摸' : '点炮';
    this.status = GameStatus.FINISHED;
    this.pendingActions = [];

    this.lastAction = `${this.nicknameMap[playerId] || playerId.substring(0, 8)} ${this.winType}！${winResult.description}`;

    return { success: true };
  }

  private handlePass(playerId: string): { success: boolean; error?: string } {
    const pendingIndex = this.pendingActions.findIndex(pa => pa.playerId === playerId);
    if (pendingIndex === -1) {
      return { success: false, error: 'No pending action to pass' };
    }

    this.pendingActions.splice(pendingIndex, 1);

    // If all players passed, advance turn
    if (this.pendingActions.length === 0) {
      if (this.lastDiscard) {
        // The discard stays on the table, advance to next player
        this.advanceTurn();
        this.drawForCurrentPlayer();
      }
    }

    return { success: true };
  }

  // --- Game Logic Helpers ---

  private checkDiscardResponses(discardedTile: Tile, discardedByPlayerId: string): void {
    this.pendingActions = [];

    // Check each other player for possible responses
    for (let i = 0; i < 4; i++) {
      const player = this.players[i];
      if (player.id === discardedByPlayerId) continue;

      const actions: string[] = [];

      // Check for win (点炮)
      const testHand = [...player.hand, discardedTile];
      if (isWinningHand(testHand, player.melds)) {
        actions.push('hu');
      }

      // Check for kong
      if (canKong(player.hand, discardedTile)) {
        actions.push('kong');
      }

      // Check for pong
      if (canPong(player.hand, discardedTile)) {
        actions.push('pong');
      }

      // Check for chi (only next player in order)
      const nextPlayerIndex = (this.players.findIndex(p => p.id === discardedByPlayerId) + 1) % 4;
      if (i === nextPlayerIndex) {
        const chiOptions = findPossibleChi(player.hand, discardedTile);
        if (chiOptions.length > 0) {
          actions.push('chi');
        }
      }

      if (actions.length > 0) {
        actions.push('pass');
        this.pendingActions.push({
          playerId: player.id,
          actions,
          discardedTile,
          discardedByPlayerId
        });
      }
    }
  }

  private removeLastDiscard(): void {
    if (!this.lastDiscard || !this.lastDiscardPlayerId) return;

    const discardingPlayer = this.players.find(p => p.id === this.lastDiscardPlayerId);
    if (discardingPlayer) {
      const lastIdx = discardingPlayer.discards.length - 1;
      if (lastIdx >= 0) {
        discardingPlayer.discards.splice(lastIdx, 1);
      }
    }
  }

  private advanceTurn(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 4;
    this.hasDrawn = false;
    this.lastActionWasKong = false;
    this.kongDrawPlayerId = null;
  }

  private drawForCurrentPlayer(): void {
    if (this.wall.length === 0) {
      // No more tiles - draw game (流局)
      this.status = GameStatus.FINISHED;
      this.lastAction = '流局！牌墙已摸完';
      return;
    }

    const tile = this.drawTileForPlayer(this.currentPlayerIndex);
    if (!tile) {
      // No more tiles after flower replacement
      this.status = GameStatus.FINISHED;
      this.lastAction = '流局！牌墙已摸完';
      return;
    }

    const player = this.players[this.currentPlayerIndex];
    player.hand.push(tile);
    player.hand = sortTiles(player.hand);
    this.hasDrawn = true;

    // Check for self-draw win
    if (isWinningHand(player.hand, player.melds)) {
      // Player can choose to win (self-draw)
      // We don't auto-win; let player declare
    }
  }

  private getTileDisplay(tile: Tile): string {
    switch (tile.suit) {
      case TileSuit.WAN: return `${tile.value}万`;
      case TileSuit.TIAO: return `${tile.value}条`;
      case TileSuit.TONG: return `${tile.value}筒`;
      case TileSuit.FENG: return ['', '东', '南', '西', '北'][tile.value] || '?';
      case TileSuit.JIAN: return ['', '中', '发', '白'][tile.value] || '?';
      case TileSuit.HUA: return ['', '春', '夏', '秋', '冬', '梅', '兰', '竹', '菊'][tile.value] || '?';
      default: return '?';
    }
  }

  setNicknames(nicknameMap: Record<string, string>): void {
    this.nicknameMap = nicknameMap;
  }
}
