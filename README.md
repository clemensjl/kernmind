# 🧠 OpenMind

> **The Open-Source, Privacy-First AI Second Brain.**  
> *Remember everything, organize nothing. 100% self-hosted & Bring Your Own Key (BYOK).*  
> A complete, modern, open-source alternative to [mymind.com](https://mymind.com).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node: 22+](https://img.shields.io/badge/Node-22%2B-green.svg)](https://nodejs.org)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org)
[![Docker Ready](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com)
[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

## ✨ Why OpenMind?

Proprietary tools like mymind charge **$144/year**, lock your personal memories inside closed clouds, and force you into a single proprietary AI pipeline.

**OpenMind** is built on the same core principle of **"Zero-Effort Associative Memory"**, but liberates your data with:
- 💸 **100% Free & Open Source (MIT License)**
- 🔒 **100% Local-First & Private**: Data stored locally in SQLite with vector embeddings.
- 🔑 **Bring Your Own Key (BYOK)**: Connect Google Gemini, OpenAI, Claude 3.5, Groq, OpenRouter, or run **100% offline with local Ollama models**.
- 📖 **Distraction-Free Deep Reader Mode**: Clean typography, archive reader view, and highlights.
- 🎨 **Color & Palette Harmonies**: Interactive HEX/RGB/HSL swatches with auto-generated color harmonies.
- 💬 **"Ask your Mind" AI Chat**: Natural language RAG assistant querying your saved items with exact citations.
- 🎲 **Serendipity & Time Machine**: Surface forgotten ideas and daily inspiration.
- 🔌 **Everywhere Capture**: Web App, Chrome/Chromium Browser Extension (MV3), and native Windows Desktop App with global hotkey (`Ctrl+Shift+M`).

---

## 📊 Feature Comparison (OpenMind vs. mymind.com)

| Feature | mymind.com | OpenMind (This Project) |
| :--- | :--- | :--- |
| **Annual Price** | $144 / year ($12/mo) | **$0 / Free Forever (MIT)** |
| **Source Code** | Proprietary / Closed | **100% Open Source** |
| **Data Ownership** | Cloud vendor lock-in | **100% Local SQLite Database** |
| **AI Models** | Closed blackbox | **BYOK (Gemini, GPT-4o, Claude, Groq, Ollama)** |
| **Smart Card Types** | Notes, Images, Quotes, Colors | **All 10 Card Types + OCR + Harmonies** |
| **Reading Mode** | Mastermind tier only | **Built-in Distraction-Free Reader** |
| **Color Engine** | Basic color swatch | **Dominant Palette, HSL, Complementary & Analogous** |
| **Data Export** | Restricted | **1-Click JSON & Markdown ZIP with YAML** |
| **Offline Privacy** | Requires cloud | **100% Offline with Ollama or Heuristics** |

---

## 🏛️ Monorepo Architecture

```
openmind/
├── apps/
│   ├── web/                        # Next.js 15+ Full-Stack Web App & Landing Page
│   │   ├── src/app/                # App Router (Dashboard, Reader, Spaces, Serendipity, Settings, Landing)
│   │   ├── src/app/api/            # REST API (Cards, Capture, AI Chat, Scraper, Spaces, Export, Import)
│   │   ├── src/components/         # Smart Cards, Omnibar, Reader, AI Chat, Modals
│   │   └── src/lib/                # SQLite DB (better-sqlite3), BYOK AI Engine, Colors, Readability Scraper
│   ├── extension/                  # Manifest V3 Chrome Extension (1-click clip, context menus, eyedropper)
│   └── desktop/                    # Windows Desktop App (Global hotkey Ctrl+Shift+M, System tray)
├── data/                           # Local SQLite database (`openmind.db`)
├── docker-compose.yml              # 1-Click Docker deployment
├── Dockerfile                      # Production container
├── LICENSE                         # MIT License
└── README.md
```

---

## 🚀 Quickstart Guide

### Option 1: Docker (1-Click)

```bash
git clone https://github.com/clemensjl/openmind.git
cd openmind
docker compose up -d
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Option 2: Local Development (Node.js & pnpm)

```bash
# 1. Clone repository
git clone https://github.com/clemensjl/openmind.git
cd openmind

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)**.

---

## 🧩 Installing the Chrome Extension (Manifest V3)

1. Open Chrome / Brave / Edge and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the `apps/extension` folder inside this repository.
4. Pin the 🧠 **OpenMind** icon to your toolbar.
5. Use **Ctrl+Shift+M** or right-click any image, link, or highlighted quote to save it to your Mind!

---

## 💻 Running the Windows Desktop App

```bash
# In the repository root
pnpm desktop
```
- Press **`Ctrl+Shift+M`** anywhere in Windows to bring up the floating acrylic quick-capture window.
- Right-click the system tray icon to access your Mind or capture clipboard items.

---

## 🔑 Bring Your Own Key (BYOK) Configuration

Open **Settings** (`http://localhost:3000/settings`) to configure your preferred AI provider:

- **Google Gemini**: Fast & high quality (`gemini-1.5-flash`, `gemini-1.5-pro`)
- **OpenAI**: `gpt-4o`, `gpt-4o-mini`
- **Anthropic Claude**: `claude-3-5-sonnet`, `claude-3-5-haiku`
- **Groq**: Ultra-fast open models (`llama-3.3-70b-versatile`)
- **Ollama**: 100% offline local inference (`http://localhost:11434` with `llama3.2`)
- **Local Heuristics**: Works with 0 API keys using built-in rule classifiers.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
Built with ❤️ for privacy, free thought, and open-source craftsmanship.
