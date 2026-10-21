# ManwaReader 📖

A modern, high-performance offline Webtoon & Manga reader with a crimson dark RoliaScan aesthetic, local SQLite reading progress tracking, and low-memory rendering optimized for desktop and mobile (iOS Safari / WebKit safe).

![ManwaReader Hero](src/assets/hero.png)

---

## ✨ Features

- 🎨 **RoliaScan Dark Aesthetic:** Sleek, immersive dark theme with crimson accents and fluid transitions.
- 📱 **Low-Memory Rendering Engine:** Strict on-demand 6-page rendering buffer. Does not crash mobile Safari/Jetsam on heavy 200+ page webtoons.
- 💾 **Local SQLite Persistence:** Automatically saves:
  - Reading progress (current chapter, page % read, history checkmarks)
  - Favorites & reading status (*Reading*, *Completed*, *On Hold*, *Plan to Read*)
  - Custom reading width (640px to 1200px)
- ⚡ **Live Performance Telemetry:** Built-in network & decoding telemetry HUD.
- ⌨️ **Intuitive Controls:**
  - `A` / `D` or `←` / `→` for fast chapter navigation
  - Quick chapter drawer drawer overlay
  - Fullscreen mode toggle

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone git@github-random:mochinotesak-hub/ManwaReader.git
cd ManwaReader
npm install
```

### 3. Launching
Double click `start.bat` on Windows, or run manually:

```bash
# Terminal 1: Backend Express Server (port 3001)
node server.js

# Terminal 2: Frontend Vite Server (port 7890)
npm run dev
```

Open your browser at: **[http://localhost:7890](http://localhost:7890)**

To stop both background services at any time, simply double click `stop.bat`.

---

## 📂 Library Structure

Place your manga/manhwa folders inside the `library/` folder like this:

```text
ManwaReader/
├── library/
│   └── Your-Manga-Title/
│       ├── chapter-001/
│       │   ├── 001.jpg
│       │   ├── 002.jpg
│       │   └── ...
│       └── chapter-002/
│           ├── 001.jpg
│           └── ...
```

The reader will automatically scan, organize chapters, and extract covers!

---

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, Lucide Icons, Vanilla CSS
- **Backend:** Node.js, Express, Better-SQLite3
- **Database:** SQLite (`reader.db`)
