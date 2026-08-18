# 🧠 KernMind

> **The Open-Source, Privacy-First AI Second Brain.**  
> *Remember everything, organize nothing. 100% self-hosted & Bring Your Own Key (BYOK).*  
> A complete, modern, open-source alternative to [mymind.com](https://mymind.com).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fclemensjl%2Fkernmind&root-directory=apps%2Fweb&env=TURSO_DATABASE_URL,TURSO_AUTH_TOKEN&envDescription=Create%20a%20free%20cloud%20database%20at%20turso.tech%20and%20paste%20the%20URL%20and%20Auth%20Token)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node: 22+](https://img.shields.io/badge/Node-22%2B-green.svg)](https://nodejs.org)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org)
[![Turso Ready](https://img.shields.io/badge/Database-Turso%20%2F%20LibSQL-blue.svg)](https://turso.tech)
[![Docker Ready](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com)
[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

## ✨ Features

- 💸 **100% Free & Open Source (MIT License)**: No $144/year subscriptions.
- ☁️ **Permanent Cloud Hosting on Vercel + Turso**: Deploy in 2 clicks with a free, serverless SQLite cloud database.
- 🔒 **100% Local-First & Private**: Data stored locally or in your private cloud database.
- 🔑 **Bring Your Own Key (BYOK)**: Connect Google Gemini, OpenAI, Claude 3.5, Groq, OpenRouter, or run **100% offline with local Ollama models**.
- 📖 **Distraction-Free Deep Reader Mode**: Clean typography, archive reader view, and highlights.
- 🎨 **Color & Palette Harmonies**: Interactive HEX/RGB/HSL swatches with auto-generated color harmonies.
- 💬 **"Ask your Mind" AI Chat**: Natural language RAG assistant querying your saved items with exact citations.
- 🎲 **Serendipity & Time Machine**: Surface forgotten ideas and daily inspiration.
- 🔌 **Everywhere Capture**: Web App, Chrome/Chromium Browser Extension (MV3), and native Windows Desktop App with global hotkey (`Ctrl+Shift+M`).

---

## 📊 Feature Comparison (KernMind vs. mymind.com)

| Feature | mymind.com | KernMind (This Project) |
| :--- | :--- | :--- |
| **Annual Price** | $144 / year ($12/mo) | **$0 / Free Forever (MIT)** |
| **Source Code** | Proprietary / Closed | **100% Open Source** |
| **Data Ownership** | Cloud vendor lock-in | **100% Local SQLite / Private Cloud Database** |
| **AI Models** | Closed blackbox | **BYOK (Gemini, GPT-4o, Claude, Groq, Ollama)** |
| **Smart Card Types** | Notes, Images, Quotes, Colors | **All 10 Card Types + OCR + Harmonies** |
| **Reading Mode** | Mastermind tier only | **Built-in Distraction-Free Reader** |
| **Color Engine** | Basic color swatch | **Dominant Palette, HSL, Complementary & Analogous** |
| **Data Export** | Restricted | **1-Click JSON & Markdown ZIP with YAML** |
| **Offline Privacy** | Requires cloud | **100% Offline with Ollama or Heuristics** |

---

## 🚀 1-Click Cloud Deployment (Vercel + Turso)

You can host KernMind permanently on Vercel for free with a persistent cloud database:

### Step 1: Create a Free Turso Database (30 seconds)
1. Go to **[turso.tech](https://turso.tech)** and sign up (Free tier includes 9GB storage & 500 databases).
2. Create a new database:
   - Via Web Dashboard: Click **Create Database** -> Name it `kernmind`.
   - Or via CLI: `turso db create kernmind`
3. Copy your database connection URL (e.g. `libsql://kernmind-[username].turso.io`) and create an Auth Token (`turso db tokens create kernmind` or from Web Dashboard).

### Step 2: Deploy to Vercel
1. Click the button below:  
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fclemensjl%2Fkernmind&root-directory=apps%2Fweb&env=TURSO_DATABASE_URL,TURSO_AUTH_TOKEN&envDescription=Create%20a%20free%20cloud%20database%20at%20turso.tech%20and%20paste%20the%20URL%20and%20Auth%20Token)
2. In Vercel Project Settings:
   - **Root Directory**: `apps/web`
   - **Environment Variables**:
     - `TURSO_DATABASE_URL`: `libsql://kernmind-[username].turso.io`
     - `TURSO_AUTH_TOKEN`: `your-turso-auth-token`
3. Click **Deploy** — your personal KernMind second brain is now live at `https://your-app.vercel.app`!

---

## 💻 Local Development (Zero Config)

When running locally without environment variables, KernMind automatically stores data in `./data/kernmind.db`.

```bash
# 1. Clone repository
git clone https://github.com/clemensjl/kernmind.git
cd kernmind

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)**.

---

## 🧩 Installing the Chrome Extension (Manifest V3)

1. Open Chrome / Brave / Edge and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the `apps/extension` folder inside this repository.
4. Open the extension Options page and enter your deployed URL (e.g. `https://your-app.vercel.app` or `http://localhost:3000`).
5. Use **`Ctrl+Shift+M`** or right-click any image, link, or highlighted quote to save it to your Mind!

---

## 🖥️ Running the Windows Desktop App

```bash
pnpm desktop
```
- Press **`Ctrl+Shift+M`** anywhere in Windows to bring up the floating quick-capture window.
- Right-click the system tray icon to capture clipboard content or access your Mind.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
