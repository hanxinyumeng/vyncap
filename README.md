<p align="center">
  <img src="src-tauri/icons/128x128.png" width="96" alt="Vyncap Logo">
</p>

<h1 align="center">Vyncap</h1>

<p align="center">
  <strong>AI 驱动的截图工具</strong><br>
  截图 → AI 分析
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" alt="Platform">
  <img src="https://img.shields.io/badge/Tauri-2.x-ffc131?logo=tauri" alt="Tauri">
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

---

## 功能特性

- **截图** — 全屏截图 + 区域选择
- **AI 分析** — 将截图发送到任何兼容 OpenAI 的 API 进行即时分析
- **自定义 AI 按钮** — 创建多个 AI 按钮，支持不同提示词（翻译、解释、解题等）
- **可配置工具栏** — 选择显示哪些操作按钮（复制、保存、固定、取消）
- **自定义快捷键** — 设置自己的键盘快捷键（支持 2 键和 3 键组合）
- **系统托盘** — 后台运行，从系统托盘访问
- **固定到屏幕** — 将截图固定在其他窗口上方
- **中英文界面** — 支持中文和英文界面
- **持久化设置** — 所有配置本地保存，跨会话保持

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18, TypeScript, Tailwind CSS |
| 后端 | Rust, Tauri 2.x |
| HTTP 客户端 | reqwest (rustls) |
| 构建 | Vite 6 |

## 下载安装

### 方式一：直接下载安装包（推荐）

1. 访问 [GitHub Releases](https://github.com/hanxinyumeng/vyncap/releases)
2. 下载最新版本的 `Vyncap_x.x.x_x64-setup.exe`
3. 双击运行安装程序
4. 按照提示完成安装

### 方式二：从源码构建

#### 前置要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.70
- Tauri [系统依赖](https://v2.tauri.app/start/prerequisites/)

#### 构建步骤

```bash
# 克隆仓库
git clone https://github.com/hanxinyumeng/vyncap.git
cd vyncap

# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建安装包
npm run tauri build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/nsis/` 目录。

## 使用说明

### 基本使用

1. **启动应用** — 双击桌面图标或从开始菜单启动
2. **截图** — 点击主界面的"截图"按钮或使用快捷键 `Ctrl+Alt+A`
3. **选择区域** — 在截图上拖动鼠标选择需要的区域
4. **操作** — 使用工具栏按钮进行复制、保存、固定或 AI 分析

### AI 配置

Vyncap 支持任何兼容 OpenAI 的 API。在设置 → AI 配置中：

| 字段 | 示例 |
|------|------|
| API URL | `https://api.openai.com/v1` |
| API Key | `sk-...` |
| 模型 | `gpt-4o` |

### 自定义 AI 按钮

创建专门的 AI 按钮，带有自定义提示词：

- **翻译** — "将截图中的文字翻译成英文"
- **解释** — "详细解释这段代码"
- **解题** — "解决截图中的数学问题"

### 快捷键

默认快捷键：`Ctrl+Alt+A`

支持 `Ctrl`、`Alt`、`Shift` 与普通键的任意组合。

## 项目结构

```
vyncap/
├── src/                    # 前端 (React + TypeScript)
│   ├── components/         # UI 组件
│   │   ├── ActionButtons   # 工具栏按钮
│   │   ├── SettingsPanel   # 设置面板
│   │   └── ScreenshotCanvas # 截图画布
│   ├── hooks/              # React Hooks
│   │   ├── useAI           # AI API 集成
│   │   ├── useSettings     # 设置持久化
│   │   ├── useShortcuts    # 快捷键处理
│   │   └── useScreenshot   # 截图逻辑
│   ├── i18n/               # 国际化 (中/英)
│   └── types/              # TypeScript 类型定义
├── src-tauri/              # 后端 (Rust + Tauri)
│   ├── src/
│   │   ├── ai.rs           # AI API 代理（避免 CORS）
│   │   ├── lib.rs          # 应用设置、托盘、窗口管理
│   │   └── screenshot.rs   # 原生截图捕获
│   └── icons/              # 应用图标
└── package.json
```

## 工作原理

1. **截图** — 按快捷键或点击按钮截取屏幕
2. **选择** — 绘制矩形选择感兴趣区域
3. **分析** — 点击 AI 按钮将选择发送给 AI 提供商
4. **获取答案** — AI 响应显示在选择区域下方

AI 请求通过 Rust 后端 (`src-tauri/src/ai.rs`) 代理，避免浏览器直接调用 API 的 CORS 限制。

## 许可证

MIT
