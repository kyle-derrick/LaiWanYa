# 🎮 LaiWanYa（来玩吖）

一个开源的多人在线桌游平台，支持 UNO、大富翁、麻将等经典游戏。

## ✨ 特性

- **多人实时对战** — 基于 Socket.IO 实时通信
- **房间系统** — 创建房间，分享链接邀请好友
- **无需注册** — 输入昵称即可开始游戏
- **多游戏支持** — UNO、大富翁、麻将全部完成
- **响应式 UI** — 支持桌面和移动端

## 🛠️ 技术栈

- **前端**: React + Vite + TypeScript + TailwindCSS
- **后端**: Node.js + Express + Socket.IO
- **数据库**: 内存存储（可扩展 Redis/PostgreSQL）

## 🚀 快速开始

### 安装依赖

```bash
# 后端
cd server && npm install

# 前端
cd client && npm install
```

### 启动开发服务器

```bash
# 终端 1: 启动后端 (端口 3001)
cd server && npm run dev

# 终端 2: 启动前端 (端口 5173)
cd client && npx vite --port 5173 --host 0.0.0.0
```

访问 `http://localhost:5173` 开始游戏！

## 📁 项目结构

```
game-platform/
├── client/              # React 前端
│   ├── src/
│   │   ├── pages/       # 首页、大厅、游戏页
│   │   ├── components/  # UNO 卡牌、聊天、玩家列表
│   │   └── hooks/       # Socket.IO 单例
│   └── vite.config.ts
├── server/              # Node.js 后端
│   └── src/
│       ├── managers/    # 房间管理、游戏管理
│       ├── games/       # UNO、大富翁、麻将引擎
│       └── socket/      # Socket.IO 事件处理
└── README.md
```

## 🎯 支持的游戏

| 游戏 | 状态 |
|------|------|
| UNO | ✅ 完成 |
| 大富翁 | ✅ 完成 |
| 麻将 | ✅ 完成 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

本项目基于 [MIT 协议](./LICENSE) 开源。