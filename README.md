# 🎮 LaiWanYa（来玩吖）

一个开源的多人在线桌游平台，支持 UNO、大富翁、麻将、骗子酒馆等经典游戏。

## ✨ 特性

- **多人实时对战** — 基于 Socket.IO 实时通信
- **房间系统** — 创建房间、大厅浏览、链接直接加入
- **无需注册** — 输入昵称即可开始游戏，用户名本地持久化
- **多游戏支持** — UNO、大富翁、麻将、骗子酒馆
- **房间配置** — 房间名称、描述、人数限制、私密房间、密码保护
- **房主管理** — 踢人、房间自动清理
- **国际化** — 支持中/英文，自动检测浏览器语言
- **响应式 UI** — 支持桌面和移动端

## 🛠️ 技术栈

- **前端**: React 18 + Vite + TypeScript + TailwindCSS + i18next
- **后端**: Node.js + Express + Socket.IO
- **数据库**: 内存存储（可扩展 Redis/PostgreSQL）
- **CI/CD**: GitHub Actions

## 🚀 快速开始

### 安装依赖

```bash
npm run install:all
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 开始游戏！

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
LaiWanYa/
├── client/                    # React 前端
│   ├── src/
│   │   ├── pages/            # 首页、大厅、游戏页
│   │   ├── components/       # 游戏组件
│   │   │   ├── uno/         # UNO
│   │   │   ├── monopoly/    # 大富翁
│   │   │   ├── mahjong/     # 麻将
│   │   │   └── liars-bar/   # 骗子酒馆
│   │   ├── hooks/           # Socket.IO
│   │   ├── i18n/            # 国际化
│   │   └── utils/           # 工具函数
│   └── vite.config.ts
├── server/                    # Node.js 后端
│   └── src/
│       ├── managers/         # 房间管理、游戏管理
│       ├── games/            # 游戏引擎
│       │   ├── uno/         # UNO
│       │   ├── monopoly/    # 大富翁
│       │   ├── mahjong/     # 麻将
│       │   └── liars-bar/   # 骗子酒馆
│       └── socket/           # Socket.IO 事件处理
├── .github/workflows/         # CI/CD
└── README.md
```

## 🎯 支持的游戏

| 游戏 | 人数 | 状态 |
|------|------|------|
| UNO | 2-10 | ✅ 完成 |
| 大富翁 | 2-6 | ✅ 完成 |
| 麻将 | 4 | ✅ 完成 |
| 骗子酒馆 | 2-6 | ✅ 完成 |

## 🎮 游戏说明

### UNO
经典 UNO 卡牌游戏，出完手牌即获胜。

### 大富翁
简化版大富翁，买地建房收租，最后存活者获胜。

### 麻将
国标简化版麻将，支持吃碰杠胡。

### 骗子酒馆 (Liar's Bar)
 bluffing 游戏，出牌声明是目标牌，被质疑说谎就要"开枪"！

## 🌐 国际化

- 自动检测浏览器语言
- 支持中文 / English
- 可在右上角切换语言

## 📦 部署

### Docker (推荐)

```bash
docker build -t laiwanya .
docker run -p 3001:3001 laiwanya
```

### 手动部署

```bash
npm run build
npm start
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

本项目基于 [MIT 协议](./LICENSE) 开源。
