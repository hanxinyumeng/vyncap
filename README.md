<p align="center">
  <img src="src-tauri/icons/128x128.png" width="96" alt="Vyncap Logo">
</p>

<h1 align="center">Vyncap</h1>

<p align="center">
  <strong>AI-powered screenshot tool</strong><br>
  Capture → AI Analyze
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" alt="Platform">
  <img src="https://img.shields.io/badge/Tauri-2.x-ffc131?logo=tauri" alt="Tauri">
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

---

## Features

- **Screenshot Capture** — Full-screen capture with area selection
- **AI Analysis** — Send screenshots to any OpenAI-compatible API for instant analysis
- **Custom AI Buttons** — Create multiple AI buttons with different prompts (translate, explain, solve, etc.)
- **Configurable Toolbar** — Choose which action buttons to show (copy, save, pin, cancel)
- **Custom Shortcuts** — Set your own keyboard shortcuts (supports 2-key and 3-key combos)
- **System Tray** — Runs in the background, accessible from the system tray
- **Pin to Screen** — Pin screenshots on top of other windows for reference
- **Bilingual UI** — Chinese and English interface
- **Persistent Settings** — All configurations saved locally across sessions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Backend | Rust, Tauri 2.x |
| HTTP Client | reqwest (rustls) |
| Build | Vite 6 |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.70
- Tauri [system dependencies](https://v2.tauri.app/start/prerequisites/)

### Install

```bash
git clone https://github.com/yourname/vyncap.git
cd vyncap
npm install
```

### Development

```bash
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

Output binaries will be in `src-tauri/target/release/bundle/`.

## Configuration

### AI Provider

Vyncap works with any OpenAI-compatible API. In Settings → AI Config:

| Field | Example |
|-------|---------|
| API URL | `https://api.openai.com/v1` |
| API Key | `sk-...` |
| Model | `gpt-4o` |

### Custom AI Buttons

Create specialized AI buttons with custom prompts:

- **Translate** — "Translate the text in the screenshot to English"
- **Explain** — "Explain this code in detail"
- **Solve** — "Solve the math problem in this screenshot"

### Shortcuts

Default shortcut: `Ctrl+Alt+A`

Supports any combination of `Ctrl`, `Alt`, `Shift` + a regular key.

## Project Structure

```
vyncap/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # UI components
│   │   ├── ActionButtons   # Toolbar with configurable buttons
│   │   ├── SettingsPanel   # Settings (inline + modal modes)
│   │   └── ScreenshotCanvas # Screenshot capture & selection
│   ├── hooks/              # React hooks
│   │   ├── useAI           # AI API integration
│   │   ├── useSettings     # Settings persistence
│   │   ├── useShortcuts    # Keyboard shortcut handling
│   │   └── useScreenshot   # Screenshot capture logic
│   ├── i18n/               # Internationalization (zh/en)
│   └── types/              # TypeScript type definitions
├── src-tauri/              # Backend (Rust + Tauri)
│   ├── src/
│   │   ├── ai.rs           # HTTP proxy for AI API (avoids CORS)
│   │   ├── lib.rs          # App setup, tray, window management
│   │   └── screenshot.rs   # Native screenshot capture
│   └── icons/              # App icons
└── package.json
```

## How It Works

1. **Capture** — Press shortcut or click the button to capture your screen
2. **Select** — Draw a rectangle to select the area of interest
3. **Analyze** — Click an AI button to send the selection to your AI provider
4. **Get Answer** — The AI response appears below your selection

The AI request goes through the Rust backend (`src-tauri/src/ai.rs`) to avoid CORS restrictions that would occur with direct browser-to-API calls.

## License

MIT
