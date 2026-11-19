<div align="center">

<img src="./public/images/hero-journey.png" width="100%" alt="Katha Hero Banner" style="border-radius: 12px; margin-bottom: 20px;" />

# 🌌 Katha

*Your personal memory engine for the stories that shape your life.*

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://katha.vercel.app)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.x-0055FF?style=for-the-badge&logo=framer&logoColor=white)]()
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)]()

---

**[🚀 Launch Live Application](https://katha.vercel.app)**  
*(Offline-first PWA: Loads instantly even without internet)*

</div>

<br/>

## ✨ What is Katha?

> Katha isn't just another entertainment tracker like Letterboxd or MyAnimeList. It is a **personal memory engine** that transforms your entertainment journey into wisdom, insights, and legacy. 

Every movie, series, anime, documentary, and book you experience becomes a permanent chapter of your life story. We believe that the stories you consume shape who you become. Katha helps you track not just *what* you watched, but *how it made you feel* and *what you learned* from it.

<br/>

<details>
<summary><b>🧠 The Katha Experience (Click to Expand)</b></summary>
<br/>

### Smriti Intelligence Engine
At the core of Katha is **Smriti** — an advanced intelligence engine powered by Google Gemini that analyzes your consumption patterns.
* 🎭 **Emotional Tracking:** Map how specific genres or media affect your mood over time.
* ⚡ **Impact Index:** A proprietary scoring system (1-100) that calculates how deeply a story resonated with your life.
* 💡 **Wisdom Extraction:** Save profound quotes, life lessons, and epiphanies directly tied to specific moments in a story.

### 📚 The Universal Library
A unified digital bookshelf for all your media.
* 🎬 **Cross-Media Tracking:** Movies (TMDB/OMDB), Anime (Jikan/MyAnimeList), TV Shows (Watchmode), and Books all live in one seamless interface.
* 🗂️ **Smart Shelving:** Automatically organizes your collection by life phase, emotional impact, and custom tags.

### 🧭 The Smriti Atlas (Discover)
A curated discovery engine designed to kill decision fatigue.
* 🌡️ **Mood-Based Routing:** Tell the Atlas how you feel (e.g., "Melancholic", "Need Inspiration", "Brain Dead"), and it finds the perfect story.
* ⏳ **Life Phase Recommendations:** Curated picks for when you're graduating, going through a breakup, or starting a new career.

### 🔮 Memory World
A visual representation of your media life.
* ⏱️ **The Timeline:** A chronological, scrollable journey of your media consumption history.
* 🖼️ **The Gallery:** A stunning visual mosaic of everything you've watched.
* 📖 **Life Journal:** A dedicated space for the wisdom and quotes you've extracted.

</details>

<details>
<summary><b>🎨 Editorial Archival Design System</b></summary>
<br/>

Katha pairs literary editorial typography (`Cormorant Garamond` display headings with `Outfit` UI text) with an atmospheric dark Obsidian Paper (`#121316`) and light Warm Alabaster (`#FAF9F6`) theme.

- 🕯️ **Canvas:** Obsidian Paper (`#121316` / `#1A1C20`) in dark mode, Warm Alabaster (`#FAF9F6` / `#F2EFE9`) in light mode.
- 🪩 **Motion Primitives:** Tactile spring transitions, layout animations, and accessible focus indicators.
- 🌈 **Accents:** Violet (Wisdom), Cyan (Memory), Rose (Emotion), Emerald (Growth), Amber (Reflection).

</details>

<details>
<summary><b>🔒 Local-First Privacy & Optional Sync</b></summary>
<br/>

We believe your personal stories and reflections belong to you. Katha runs **Local-First by default** and never forces an account sign-in gate.

* 🛡️ **Local Vault by Default:** Stories, moments, sessions, and insights are stored in your browser via Dexie (IndexedDB).
* ☁️ **Optional Cloud Backup:** Sign in with Google only if you want multi-device Firebase Firestore sync, Google Drive AppData backup, or authenticated AI analysis.
* 🔐 **Hardened Edge APIs:** All external API proxies (`tmdb`, `jikan`, `omdb`, `rawg`, `trakt`, `gemini`, etc.) validate relative paths, enforce rate limits, and verify Firebase ID tokens on AI routes.
* 📦 **True Portability:** Export your complete archive anytime to Word (`.docx`), PDF (`.pdf`), Markdown (`.md`), or JSON, and restore from local JSON backups.

</details>

<br/>

## 🏗️ Architecture & Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | React 19, TypeScript, Vite | Fast rendering, strict typing, rapid HMR. |
| **Styling** | Tailwind CSS v4 | Token-based dark & light editorial theming. |
| **Motion/Animation** | Framer Motion 12 | Spring physics and accessible reduced-motion transitions. |
| **State Management** | Zustand | Persistent preferences and reactive store caches. |
| **Local Database** | Dexie.js (IndexedDB) | Local-first offline storage with multi-user outbox isolation. |
| **Optional Cloud** | Firebase Auth & Firestore / Google Drive | User-initiated cross-device sync and AppData snapshots. |
| **AI Integration** | Google Gemini API (Edge Proxy) | Powers optional Smriti reflection & pattern analysis. |
| **Hosting & Deploy** | Vercel & Edge Functions | Global CDN and validated API proxy routes. |

<br/>

## 🚀 Quick Start (Local Development)

Ready to build your personal atlas? Follow these steps to run Katha locally.

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdityaPatil2549/Katha.git
   cd Katha
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Katha connects to various external APIs and AI services.
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your API keys:
   - `GEMINI_API_KEY`: Required for Smriti Intelligence and Discovery features.
   - `TMDB_API_KEY`: For Movies and TV Shows metadata.
   - `OMDB_API_KEY`: For backup movie data.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   *Visit `http://localhost:5173` to enter the Katha universe.*

<br/>

## 📱 Installing as an App (PWA)

Katha is designed to feel like a native application. You can install it on your devices directly from the Live URL:

* 🍎 **iOS / iPadOS:** Open Katha in Safari, tap the "Share" icon, and select "Add to Home Screen".
* 🤖 **Android:** Open Katha in Chrome, tap the three-dot menu, and select "Install app" or "Add to Home screen".
* 💻 **Desktop (Chrome/Edge):** Look for the install icon (monitor with a downward arrow) in the right side of your URL bar.

<br/>

## 🤝 Contributing

We welcome contributions! If you're passionate about storytelling, personal knowledge management, or just really beautiful UI, feel free to jump in.

<details>
<summary><b>View Contribution Guidelines</b></summary>
<br/>

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

</details>

<br/>

---
<div align="center">
  <sub>Built with passion for stories that matter.</sub>
</div>
