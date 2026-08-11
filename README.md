# Katha — Powered by Smriti

Local-first, offline-first Personal Story Operating System.

## 🌟 Overview

Katha is not just an entertainment tracker. It's a personal memory engine that transforms your entertainment journey into wisdom, insights, and legacy. Every movie, series, anime, documentary, and experience becomes a chapter of your life story.

### ✨ Key Features

- **📚 Personal Library** - Digital bookshelf UI with smart categorization
- **🧠 Smriti Intelligence** - AI-powered emotional insights and wisdom extraction
- **🏛️ Memory World** - Four realms: Timeline, Gallery, Emotional Map, Life Journal
- **🌍 Smriti Atlas** - Curated discovery engine with mood-based recommendations
- **📖 Storybook Export** - Create beautiful books from your journey
- **🔒 Privacy First** - 100% local, no cloud, no tracking
- **📱 PWA Ready** - Installable, works offline everywhere

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd katha

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view Katha in your browser.

### Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

## 📱 PWA Installation

Katha is a Progressive Web App that can be installed on any device:

1. Open Katha in your browser
2. Look for the "Install App" button or browser install prompt
3. Install to your device for offline access

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Midnight Library design system
- **State**: Zustand for clean state management
- **Storage**: IndexedDB (Dexie) for local-first data persistence
- **Animations**: Framer Motion for premium micro-interactions
- **PWA**: Workbox service worker for offline functionality
- **Icons**: Lucide React
- **Charts**: Recharts for analytics

### Architecture Layers

```
┌─────────────────┐
│   UI Layer      │ ← React components, pages
├─────────────────┤
│  Feature Layer  │ ← Business logic, hooks
├─────────────────┤
│   State Layer   │ ← Zustand stores
├─────────────────┤
│   Data Layer    │ ← IndexedDB, Dexie
├─────────────────┤
│Intelligence Layer│ ← Smriti engine
├─────────────────┤
│   System Layer  │ ← PWA, offline, utils
└─────────────────┘
```

## 🎨 Design System

### Midnight Library Theme

- **Background**: Deep midnight (#0B1020)
- **Surface**: Soft slate (#141B2D)
- **Accents**: Violet (wisdom), Cyan (memory), Rose (emotion), Emerald (growth)
- **Typography**: Inter (UI) + Playfair Display (quotes)
- **Spacing**: 8px grid system
- **Motion**: Calm, meaningful transitions

## 🧠 Smriti Intelligence Engine

The heart of Katha - transforms entertainment data into wisdom:

### Core Modules

- **Impact Index** - Quantifies how stories affect your life
- **Emotional Mapping** - Tracks mood patterns and growth
- **Timeline Engine** - Comprehensive activity timeline
- **Memory Resurfacer** - "On this day" nostalgia engine
- **Mood Analytics** - Deep emotional insights
- **Knowledge Extraction** - Life lessons and principles
- **Decision Engine** - Smart recommendations

## 📊 Features Deep Dive

### Home Screen
Personal story space with greeting, continue watching, moment of the day, and emotional snapshots.

### Library
Digital bookshelf with category shelves, smart filters, and quick actions.

### Story Pages
Deep archive with tabs for overview, sessions, moments, knowledge, and stats.

### Memory World
Smriti's Temple with timeline, gallery, emotional map, and life journal.

### Discover World
Smriti Atlas with curated collections, mood engine, and decision fatigue killer.

### Export System
Multiple formats including storybook PDF, Word documents, and complete backups.

## 🔒 Privacy & Security

- **100% Local**: All data stored on your device
- **No Cloud**: No servers, no data collection
- **Optional Encryption**: AES-256 for sensitive data
- **App Lock**: PIN/password protection
- **No Tracking**: Zero telemetry or analytics

## 📱 PWA Features

- **Offline First**: Works completely offline after first load
- **Installable**: Native app experience on all devices
- **Background Sync**: Smart data synchronization
- **Cache Management**: Intelligent resource caching

## 🛠️ Development

### Project Structure

```
src/
├── app/           # App shell, providers, navigation
├── features/      # Product features (vertical slices)
├── components/    # Shared UI components
├── store/         # Zustand stores
├── db/           # IndexedDB schema, migrations
├── smriti/       # Intelligence engine
├── atlas/        # Offline discovery dataset
├── utils/        # Utility functions
├── types/        # TypeScript definitions
└── styles/       # Global styles
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run test suite
- `npm run lint` - Run linting
- `npm run type-check` - TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with love for storytellers and memory keepers
- Inspired by the power of stories to shape our lives
- For everyone who believes entertainment can be meaningful

---

**Katha v1.0.0** - Your story, remembered forever.
