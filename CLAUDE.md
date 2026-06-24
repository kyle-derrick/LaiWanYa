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
2. **Monopoly (大富翁)** - 2-6 players, simplified rules
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
