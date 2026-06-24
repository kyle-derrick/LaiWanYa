# Online Game Platform (在线游戏平台)

## Tech Stack
- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS
- **Backend:** Node.js + Express + Socket.IO
- **State:** In-memory (no database for now)
- **Package Manager:** npm workspaces (monorepo)

## Architecture
- Monorepo: `client/` (React), `server/` (Node.js)
- Real-time via Socket.IO (WebSocket)
- Room-based multiplayer with game state sync

## Games
1. **UNO** - 2-10 players, standard rules
2. **Monopoly (大富翁)** - 2-6 players, simplified rules ✅ DONE
3. **Mahjong (麻将)** - 4 players, Chinese standard rules

## Auth
- Nickname only, no registration
- Store player info in session/localStorage

## Room System
- Room ID: 6-digit alphanumeric
- Share link: `http://localhost:PORT/join/ROOM_ID`
- Creator sets max players (platform defaults: UNO=4, Monopoly=4, Mahjong=4)

## Commands
- `cd server && npm run dev` - start backend
- `cd client && npm run dev` - start frontend
- `npm run dev` - start both (from root)

## Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Component-based React with hooks
- Socket events documented in server README

## Monopoly (大富翁) Game Documentation

### Socket Events

**Client → Server:**

| Event | Payload | Description |
|-------|---------|-------------|
| `monopoly:action` | `{ action: string, data?: unknown }` | All game actions go through this single event |

**Server → Client:**

| Event | Payload | Description |
|-------|---------|-------------|
| `gameStarted` | `{ roomId, gameState }` | Sent to each player on game start |
| `gameState` | `MonopolyGameState` | Updated state after each action (personalized per player) |
| `gameFinished` | `{ result }` | Sent when a winner is determined |
| `error` | `{ message: string }` | Action validation errors |

### Action Types (via `monopoly:action`)

| Action | Data | Description |
|--------|------|-------------|
| `rollDice` | - | Roll two dice, move player |
| `buyProperty` | - | Buy the property you landed on |
| `declineProperty` | - | Decline to buy unowned property |
| `payRent` | - | Pay rent to property owner |
| `payTax` | - | Pay tax (goes to Free Parking pot) |
| `drawCard` | - | Draw Chance/Community Chest card |
| `endTurn` | - | End your turn (resolves doubles) |
| `buildHouse:{index}` | - | Build house on owned property |
| `sellHouse:{index}` | - | Sell house from property |
| `mortgage:{index}` | - | Mortgage a property |
| `unmortgage:{index}` | - | Unmortgage a property (costs 110% of mortgage) |
| `payJailFine` | - | Pay $50 to leave jail |
| `rollForDoubles` | - | Try rolling doubles in jail |
| `useJailCard` | - | Use Get Out of Jail Free card |

### MonopolyGameState Structure

```typescript
interface MonopolyGameState {
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  currentPlayerId: string | null;
  players: MonopolyPlayerState[];
  properties: PropertyOwnership[];
  dice: [number, number] | null;
  doublesCount: number;
  lastAction: string | null;
  winnerId: string | null;
  currentCard: Card | null;
  pendingAction: PendingAction | null;
  freeParkingPot: number;
  // Per-player extras:
  playerMoney: number;
  playerProperties: number[];
  playerPosition: number;
  playerIsInJail: boolean;
  availableActions: string[];
}
```

### Game Rules (Simplified Monopoly)

- **Players:** 2-6
- **Starting Money:** $1500 per player
- **Board:** 40 squares (22 properties, 4 railroads, 2 utilities, 4 corners, 2 taxes, 2 chance, 2 community chest)
- **Property Colors:** Brown, Light Blue, Pink, Orange, Red, Yellow, Green, Dark Blue
- **Passing GO:** Collect $200
- **Jail:** Position 10. Leave by: paying $50 fine, rolling doubles, or using a card. 3 failed doubles = auto-pay $50
- **3 Doubles in a Row:** Go directly to jail
- **Houses/Hotels:** Max 4 houses → upgrade to hotel (5). Must own full color group. Even build rule applies
- **Mortgage:** Mortgage value listed per property. Unmortgage costs 110%
- **Free Parking:** Collects all tax payments. Landing on it collects the pot
- **Bankruptcy:** When money ≤ 0. Properties transfer to creditor (or bank)
- **Win Condition:** Last player standing (all others bankrupt)

### Key Source Files

```
server/src/games/monopoly/
├── MonopolyGame.ts   # Main game engine
├── Board.ts          # 40-square board definition
├── Card.ts           # Chance & Community Chest decks
├── Dice.ts           # Dice rolling logic
├── Property.ts       # Rent calculation, build/mortgage rules
├── types.ts          # All TypeScript interfaces/enums
└── index.ts          # Re-exports

client/src/components/monopoly/
├── BankPanel.tsx      # Property management UI
├── DiceRoller.tsx     # Dice rolling animation
├── PlayerToken.tsx    # Board piece
└── PropertyCard.tsx   # Property info display
```
