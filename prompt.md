ROLE You are a Principal Software Architect + Senior UI/UX Designer + Lead Full-Stack Engineer. You are building a real product, not a demo, not a toy, not a portfolio project. Code quality, architecture, performance, offline reliability, privacy, and long-term maintainability are non-negotiable. Think like a startup CTO building a personal operating system.

PRODUCT Build Katha — Powered by Smriti A local-first, offline-first Progressive Web App (PWA) that acts as a Personal Story Operating System. Katha is not an entertainment tracker. It is a personal archive of life told through stories. It combines: • Entertainment tracking • Memory journaling • Emotional reflection • Knowledge extraction • Wisdom discovery • Personal legacy building

CRITICAL CONSTRAINTS (STRICT) • This is a LOCAL-ONLY APPLICATION • No backend • No cloud • No login/auth • No external APIs • No telemetry • No analytics • No tracking • No CDN dependency for core logic • All data must stay on device Must work: • 100% offline after first load • Installable as desktop & mobile app • Runs locally with npm run dev • Installable via PWA All storage: • IndexedDB (Dexie) • localStorage fallback • Optional AES encryption (user enabled)

PRODUCT PHILOSOPHY Katha should feel like: • A personal library • A memory journal • A wisdom archive • A life documentary Not: • A CRUD app • A dashboard • A spreadsheet The product must feel: • Calm • Deep • Premium • Emotional • Intelligent • Timeless

TECH STACK (MANDATORY) • Vite + React 18 + TypeScript • Tailwind CSS • Zustand (state) • React Router v6 • Dexie.js (IndexedDB) • React Virtuoso (virtual lists) • Recharts (charts) • docx + jsPDF + html2canvas (exports) • Lucide React (icons) • date-fns (dates) • browser-image-compression • blurhash • DOMPurify (sanitization) • crypto-js (optional encryption) • Vite PWA Plugin (Workbox) • Vitest + Testing Library

SYSTEM ARCHITECTURE Use clean layered architecture: UI Layer Feature Layer State Layer Data Layer Smriti Intelligence Layer Atlas Knowledge Layer System Layer

FOLDER STRUCTURE (MUST FOLLOW) src/ ├── app/ # App shell, providers, navigation ├── features/ # Product features │ ├── home/ │ ├── library/ │ ├── story/ │ ├── memory/ │ ├── discover/ │ ├── export/ │ └── settings/ ├── components/ # Shared UI components ├── store/ # Zustand stores ├── db/ # Dexie schema, migrations, seed ├── smriti/ # Intelligence engine ├── atlas/ # Offline discovery dataset ├── utils/ ├── types/ ├── styles/ ├── router.tsx ├── main.tsx └── App.tsx

CORE DATA MODELS Story id (UUID) title category (anime, series, movie, documentary, youtube) status (planning, watching, completed, paused) rating (0–10) genre[] platform releaseYear posterUrl (base64 <100KB) posterBlurhash watchTimeMinutes currentEpisode totalEpisodes currentSeason totalSeasons notes tags[] favorite impactIndex moods[] lifePhase createdAt updatedAt Moment (Memory) id storyId season episode timestamp quote character context thoughts mood lifePhase date isPrivate Session id storyId date duration mood notes Knowledge id storyId lesson principle reflection date Timeline Event id type (watch, moment, finish, rewatch, knowledge) refId date mood

CORE WORLDS (FEATURES)

Home — Personal Space • Greeting • Continue Watching • Moment of the Day • Smriti Timeline Preview • Tonight’s Watch (decision engine) • Emotional Snapshot • Smriti Atlas Preview
Stories — Digital Library • Bookshelf UI • Category shelves • Smart filters • Mood filters • Impact sorting • Continue watching • Quick actions
Story Page — Life Chapter Tabs: • Overview • Sessions • Moments • Knowledge • Stats
Memory World — Smriti’s Temple • Smriti Timeline • Moments Gallery • Emotional Map • Life Journal • On-this-day resurfacing • Private memories
Discover World — Smriti Atlas Offline dataset with: • Curated collections • Mood engine • Decision engine • Wisdom vault • Knowledge articles
Settings & Control — Vault • Appearance • Versioning • Storage awareness • Storybook export • Backup • Privacy & encryption • Offline status • Legacy mode
SIGNATURE INTELLIGENCE (Smriti Engine) Modules: • Impact Index • Emotional Mapping • Timeline Engine • Memory Resurfacer • Mood Analytics • Rewatch Intelligence • Story Impact Index • Knowledge Extraction • Decision Fatigue Killer

DESIGN SYSTEM Theme — Midnight Library Background: #0B1020 Surface: #141B2D Borders: #232B45 Accents: • Wisdom Violet #8B5CF6 • Memory Cyan #22D3EE • Emotion Rose #EC4899 • Growth Emerald #10B981 • Focus Amber #F59E0B Typography: • Primary: Inter / system-ui • Quotes: Playfair Display Spacing: • 8px grid system Motion: • Soft, calm, meaningful transitions

PWA REQUIREMENTS • Installable desktop & mobile • Offline shell cache • Offline dataset cache • Image cache • Update handling • Install prompt UI • Offline indicator

SECURITY • DOMPurify sanitization • Optional AES encryption • App lock • CSP meta • No external calls • No telemetry

PERFORMANCE • Virtual lists >50 items • Lazy routes • Chunk splitting • Background workers for export • Image compression <100KB • IndexedDB indexes

DELIVERABLES Generate:

Complete TypeScript codebase
package.json with scripts
README.md (local setup + PWA install)
SETUP.md (dev/build/test)
Seed dataset
Sample exports (Word, PDF, JSON)
CHANGELOG.md
DEV COMMANDS npm install npm run dev npm run build npm run preview npm run test

QUALITY STANDARDS • TypeScript strict • No console errors • Accessible UI (WCAG AA) • Error boundaries • Offline reliability • Clean code • JSDoc/TSDoc • No dead features

FINAL INSTRUCTION Build Katha as a real product. Do not generate demos. Do not generate shortcuts. Do not generate mock logic. Implement the architecture, UI, intelligence engine, offline system, and data layer as a production-grade application. This app runs locally only. No hosting required. All data belongs to the user.

OUTPUT FORMAT

Start by generating project structure
Then core architecture
Then database layer
Then UI shell
Then features one by one Do not summarize. Write real code.
	Things to do in Katha

A. Splash Screen UI for Katha B. Full UI Copy Rebrand for Katha C. Important Features a. Emotional Mapping b. Story Impact Index c. rewatch Intelligence d. Story Mood Engine e. Decision Fatigue Killer f. Personal Story Timeline g. Knowledge Extraction h. Personal Legacy Mode D. Additions in APP

Visual Consistency System • Unified spacing scale • Consistent border radius • Unified shadow system • Standard animation timing (200ms / 300ms) • Design tokens for colors & typography → Makes the app feel professionally designed instead of assembled.
Typography Hierarchy • Clear H1 / H2 / body / caption scale • Strong reading rhythm • Better scanability of lists & cards → Makes long sessions comfortable.
Motion Design Language • Page transitions • List reordering animation • Modal entrance/exit • Button micro-interactions • Skeleton loading shimmer → Gives premium, modern feel.
Accessibility & Inclusivity • Keyboard navigation everywhere • Focus indicators • Screen reader labels • Reduced motion mode • Color contrast audit → Makes Katha usable by everyone.
Performance Engineering • Virtualized lists everywhere • Memoized analytics • IndexedDB query optimization • Lazy loading heavy modules • Bundle size analysis → Keeps Katha fast even with 10,000 stories.
Error Handling & Recovery • User-friendly error messages • Retry buttons • Storage failure recovery • Corruption detection • Safe-mode boot → Prevents data loss nightmares.
Data Integrity & Migrations • Versioned schema • Migration engine • Backup before migration • Rollback support → Makes future updates safe.
Export Quality • Book-style layout • Typography in Word/PDF • Cover page branding • Page numbers • Watermark option → Makes exports feel like real books.
Offline Reliabil1) Smart Insights Engine
“You watch more anime on weekends”

“Your rating trend is improving”

“You binge more at night”

“You prefer short movies on weekdays”

Turns raw data into wisdom.

Personal Watch DNA
A profile page that shows:

Favorite genres

Preferred length

Mood pattern

Binge tendency

Completion rate

Your entertainment personality.

Story Resume
Generate a personal entertainment résumé:

Total hours

Top genres

Best year

Longest streak

Favorite show

Shareable as PDF.

📅 LIFE INTEGRATION 4) Smart Watch Planner

“Tonight’s watch”

Weekend binge planner

Free-time suggestion

Short-watch mode (under 30 min)

Turns Katha into a decision engine.

Calendar View
See what you watched each day

Visual monthly heatmap

Session timeline

Your story life at a glance.

🎮 DELIGHT & FUN 6) Interactive Timeline

Scroll through your journey like Instagram stories:

Posters

Notes

Ratings

Moments

Memory Moments
“On this day last year you watched Interstellar”

Nostalgia engine.

Achievements & Milestones
100 hours watched

First anime

First documentary

10 series completed

With animated badges.

🔒 TRUST & PEACE OF MIND 9) Smart Backup System

Auto backup reminder

Encrypted backup

Versioned backups

Restore preview

Safe Mode
Boot Katha with:

Minimal UI

Repair tools

Data recovery

Cache rebuild

For emergencies.

🎨 PERSONALIZATION 11) Custom App Personality

Rename Smriti

Choose tone (calm / fun / serious)

Choose greeting style

Make Katha truly yours.

Dynamic Home Screen
Let users choose:

Stats layout

Card order

What appears first

Personal dashboard.

📦 PRODUCT MATURITY 13) Plugin System (Future-Proofing)

Let Katha grow with:

Themes

Analytics packs

Export styles

Feature Flags
Enable/disable advanced features.

Developer Console (Hidden)
Power users can:

Inspect database

Run analytics queries

Export raw dataity • Cache versioning • Cache cleanup • Offline fallback UI • Update indicator → Makes offline behavior trustworthy.

Developer Experience • Modular architecture • Plugin system • Theme engine • Feature flags • Config-driven UI → Makes future development easy.
Documentation & Professionalism • Real README • Architecture diagram • Data flow diagram • Performance benchmarks • Design system docs → Makes Katha look like a startup product.
Product Personality • Thoughtful micro-copy • Friendly empty states • Emotional language • Subtle humor (optional) • Seasonal themes (optional) → Makes users emotionally attached.
E. Features to add

App Identity Polish
Versioning System
Build & Update Metadata
Welcome Screen
Onboarding Flow
First Story Wizard
Watch Goal Setup
Theme Selection
Smart Story Status Logic
Auto Status Detection
Completion Celebration
Completion Date Tracking
Smart Defaults System
Auto Duration Detection
Auto Watch-Time Calculation
Library Intelligence
Smart Filters
Quick Story Actions
Smriti Memory Timeline
Story Journal
Story Sessions Tracking
Daily Watch Graph
Mood Tracking
Mood vs Genre Analytics
Binge Detection
Offline Confidence Banner
Backup Reminder System
Storage Usage Meter
Image Cache Monitor
One-Click Storage Optimization
Storybook Export System
Memory Archive Backup System
  Features to add

Smart Insights Engine • “You watch more anime on weekends” • “Your rating trend is improving” • “You binge more at night” • “You prefer short movies on weekdays” Turns raw data into wisdom.
Personal Watch DNA A profile page that shows: • Favorite genres • Preferred length • Mood pattern • Binge tendency • Completion rate Your entertainment personality.
Story Resume Generate a personal entertainment résumé: • Total hours • Top genres • Best year • Longest streak • Favorite show Shareable as PDF.
📅 LIFE INTEGRATION 4) Smart Watch Planner • “Tonight’s watch” • Weekend binge planner • Free-time suggestion • Short-watch mode (under 30 min) Turns Katha into a decision engine.

Calendar View • See what you watched each day • Visual monthly heatmap • Session timeline Your story life at a glance.
🎮 DELIGHT & FUN 6) Interactive Timeline Scroll through your journey like Instagram stories: • Posters • Notes • Ratings • Moments

Memory Moments “On this day last year you watched Interstellar” Nostalgia engine.
Achievements & Milestones • 100 hours watched • First anime • First documentary • 10 series completed With animated badges.
🔒 TRUST & PEACE OF MIND 9) Smart Backup System • Auto backup reminder • Encrypted backup • Versioned backups • Restore preview

Safe Mode Boot Katha with: • Minima1) Smart Insights Engine • “You watch more anime on weekends” • “Your rating trend is improving” • “You binge more at night” • “You prefer short movies on weekdays” • Turns raw data into wisdom. • ________________________________________ • 2) Personal Watch DNA • A profile page that shows: • Favorite genres • Preferred length • Mood pattern • Binge tendency • Completion rate • Your entertainment personality. • ________________________________________ • 3) Story Resume • Generate a personal entertainment résumé: • Total hours • Top genres • Best year • Longest streak • Favorite show • Shareable as PDF. • ________________________________________ • 📅 LIFE INTEGRATION • 4) Smart Watch Planner • “Tonight’s watch” • Weekend binge planner • Free-time suggestion • Short-watch mode (under 30 min) • Turns Katha into a decision engine. • ________________________________________ • 5) Calendar View • See what you watched each day • Visual monthly heatmap • Session timeline • Your story life at a glance. • ________________________________________ • 🎮 DELIGHT & FUN • 6) Interactive Timeline • Scroll through your journey like Instagram stories: • Posters • Notes • Ratings • Moments • ________________________________________ • 7) Memory Moments • “On this day last year you watched Interstellar” • Nostalgia engine. • ________________________________________ • 8) Achievements & Milestones • 100 hours watched • First anime • First documentary • 10 series completed • With animated badges. • ________________________________________ • 🔒 TRUST & PEACE OF MIND • 9) Smart Backup System • Auto backup reminder • Encrypted backup • Versioned backups • Restore preview • ________________________________________ • 10) Safe Mode • Boot Katha with: • Minimal UI • Repair tools • Data recovery • Cache rebuild • For emergencies. • ________________________________________ • 🎨 PERSONALIZATION • 11) Custom App Personality • Rename Smriti • Choose tone (calm / fun / serious) • Choose greeting style • Make Katha truly yours. • ________________________________________ • 12) Dynamic Home Screen • Let users choose: • Stats layout • Card order • What appears first • Personal dashboard. • ________________________________________ • 📦 PRODUCT MATURITY • 13) Plugin System (Future-Proofing) • Let Katha grow with: • Themes • Analytics packs • Export styles • ________________________________________ • 14) Feature Flags • Enable/disable advanced features. • ________________________________________ • 15) Developer Console (Hidden) • Power users can: • Inspect database • Run analytics queries • Export raw data • l UI • Repair tools • Data recovery • Cache rebuild For emergencies.
🎨 PERSONALIZATION 11) Custom App Personality • Rename Smriti • Choose tone (calm / fun / serious) • Choose greeting style Make Katha truly yours.

Dynamic Home Screen Let users choose: • Stats layout • Card order • What appears first Personal dashboard.
📦 PRODUCT MATURITY 13) Plugin System (Future-Proofing) Let Katha grow with: • Themes • Analytics packs • Export styles

Feature Flags Enable/disable advanced features.
Developer Console (Hidden) Power users can: • Inspect database • Run analytics queries • Export raw data
  Splash Screen UI for Katha = ROLE: You are a senior frontend engineer and UI/UX designer.

TASK: Implement a premium splash screen and first-launch onboarding experience for the app:

"Katha — Powered by Smriti"

This splash screen should feel elegant, calm, and premium — similar to apps like Netflix, Linear, and Spotify.

OBJECTIVE: Create a first-launch experience that:

Shows the brand identity clearly
Feels premium and emotional
Loads fast
Works offline
Only appears on first launch
Can be skipped
DESIGN REQUIREMENTS:

Theme:

Midnight cyberpunk theme
Background: #0f172a
Accent: Violet (#8b5cf6) and Pink (#ec4899)
Soft glow highlights
Subtle gradient background
Typography:

App Name: Large, bold, elegant
Subtitle: Soft, minimal
Body text: Calm and readable
Animations:

Fade-in logo
Slide-up content
Subtle glow pulse on logo
Framer-motion transitions
SPLASH SCREEN CONTENT:

Title: Katha

Subtitle: Powered by Smriti

Tagline: Your personal library of stories.

Description: Track every movie, series, anime, documentary, and experience. All your stories. Remembered forever.

Primary Button: Enter Your Library

Secondary Button: Skip Intro

Footer Text: Privacy-first. Fully offline. Your data stays with you.

OPTIONAL 3-SCREEN ONBOARDING (Swipeable):

Screen 1 — Stories Title: Your Stories Text: Track movies, anime, series, documentaries, and more.

Screen 2 — Memory Title: Smriti Remembers Text: Your watch history, ratings, notes, and journey — always remembered.

Screen 3 — Control Title: Fully Yours Text: Offline. Private. Secure. Your data never leaves your device.

Final Button: Start My Journey

IMPLEMENTATION REQUIREMENTS:

Create a SplashScreen component

Show it only on first launch using localStorage flag: localStorage.setItem("katha_onboarded", "true")

Use framer-motion for:

Fade-in logo
Slide-up text
Button hover effects
Add skip option

Ensure accessibility (keyboard navigation)

Ensure splash loads before main app

INTEGRATION:

Splash screen must render before router loads
After completion, redirect to Dashboard
Never show again unless user resets app
OUTPUT REQUIRED:

SplashScreen.tsx component
Onboarding screens (optional)
Integration logic in App.tsx
Styling using Tailwind
Accessibility support   Full UI Copy Rebrand for Katha = ROLE: You are a senior product engineer and UX writer.
TASK: Rebrand all UI text, labels, headings, empty states, onboarding copy, and system messages to match the new product identity:

"Katha — Powered by Smriti"

This is a premium, personal entertainment tracker focused on stories and memory.

PRODUCT IDENTITY:

App Name: Katha
Engine: Smriti
Tagline: Your personal library of stories.

Tone:

Calm
Intelligent
Warm
Premium
Human
Respectful
Avoid:

Robotic language
Corporate jargon
Technical phrasing in user-facing UI
GLOBAL COPY RULES:

Always refer to content as "Stories"
Always refer to the system as "Smriti"
Use human, thoughtful language
Keep UI minimal and elegant
Avoid shouting (no ALL CAPS)
No slang
REBRANDING REQUIREMENTS:

Replace all occurrences of:

WatchVault → Katha
Tracker → Library
Entry → Story
Database → Memory
History → Journey
Stats → Insights
Export → Storybook
Import → Restore Memory
GLOBAL APP HEADER:

Old: WatchVault

New: Katha
Powered by Smriti

DASHBOARD PAGE:

Title: Your Stories

Subtitle: Remembered by Smriti

Stats Cards:

Total Stories
Watch Time
Currently Watching
Your Journey
Section Titles:

Continue Your Story
Recently Added Stories
Your Highlights
Empty State: Your library is empty. Start your journey by adding your first story.

CTA: Add Your First Story

LIBRARY PAGE:

Title: Story Library

Search Placeholder: Search your stories...

Filter Label: Refine your library

Empty State: No stories found. Try adding a new one or changing your filters.

CTA: Add a New Story

ADD / EDIT PAGE:

Title: Add a New Story

Subtitle: Every story matters. Smriti will remember it for you.

Form Labels:

Story Title
Category
Status
Priority
Genre
Platform
Rating
Notes
Tags
Save Button: Save Story

Cancel Button: Discard Changes

Success Toast: Story saved to your library.

STATISTICS PAGE:

Title: Your Journey

Subtitle: Insights from Smriti

Section Titles:

Your Watching Patterns
Genre Breakdown
Your Monthly Rhythm
Completion Journey
Empty State: Your journey will appear here once you start adding stories.

EXPORT PAGE:

Title: Create Your Storybook

Description: Turn your journey into a beautifully formatted storybook.

Export Options:

Download Storybook (Word)
Download Summary (PDF)
Download Memory Backup (JSON)
Create Shareable Card
Success Message: Your storybook is ready.

IMPORT PAGE:

Title: Restore Your Memory

Description: Bring back your stories from a previous backup.

CTA: Select Backup File

Success Message: Your library has been restored.

SETTINGS PAGE:

Title: Katha Settings

Sections:

Appearance
Story Preferences
Memory & Backup
Privacy & Security
About Katha
Privacy Section: Smriti stores everything locally on your device. No cloud. No tracking. No sharing.

ABOUT PAGE:

Title: About Katha

Description: Katha is a personal story tracker powered by Smriti — a memory engine for your entertainment life.

Every movie, every series, every experience. Stored locally. Protected forever.

Version Label: Katha v1.0

SYSTEM MESSAGES:

Loading: Preparing your library...

Offline: You're offline. Your stories are safe with Smriti.

Storage Full: Your memory is full. Please export your storybook or remove old stories.

Error: Something went wrong. Your stories are safe.

INSTALL PROMPT:

Title: Install Katha

Description: Install Katha on your device for a faster, offline experience.

Button: Install App

OUTPUT REQUIRED:

Replace all UI text across the app with the new branding
Ensure consistency across pages
Update placeholders, labels, toasts, modals, and empty states
Ensure accessibility labels reflect the new language
Keep UI minimal and premium
Katha Design System Identity: A personal story universe — calm, deep, premium.

Core Visual Philosophy Katha should feel like: • A midnight library • A quiet study room • A memory journal • A wisdom archive Not: • A gaming UI • A neon cyberpunk dashboard • A startup admin panel We want: Netflix calm Apple polish Notion clarity Spotify smoothness
Color System We use a Midnight + Warm Accent palette. Base Theme — Midnight Library These are your foundation colors: Background (Primary): #0B1020 → deep midnight blue Surface (Cards): #141B2D → soft slate Surface Hover: #1C2541 Borders: #232B45 Divider: #2A3356 This gives: • Depth • Calm • Eye comfort • Long-session usability
Text Colors Primary Text: #E5E7EB → soft white Secondary Text: #9CA3AF → muted gray Muted Text: #6B7280 Quote Text: #F3F4F6 → slightly warmer white

Accent System (Emotional Colors) Instead of random colors, we use meaning-based accents: Wisdom Violet: #8B5CF6 → knowledge, insight Memory Cyan: #22D3EE → calm, reflection Emotion Rose: #EC4899 → feelings, moments Growth Emerald: #10B981 → progress, success Focus Amber: #F59E0B → attention, highlights These are used sparingly: • Buttons • Highlights • Stats • Mood indicators • Progress Never for backgrounds.

Light Mode (Optional) Background: #F8FAFC Surface: #FFFFFF Surface Hover: #F1F5F9 Borders: #E2E8F0 Primary Text: #0F172A Secondary Text: #475569

Typography System Typography defines personality. Primary Font (Body & UI) Use a clean system font stack: Inter, system-ui, -apple-system, sans-serif Readable, modern, neutral.
Secondary Font (Quotes & Titles – Optional but powerful) For story quotes and moments: Playfair Display (serif) or Libre Baskerville This gives: • Literary feel • Book-like emotion • Memory journal vibe Use only for: • Quotes • Story titles • Storybook export

Font Scale H1: 32px (Story titles, Home greeting) H2: 24px (Section titles) H3: 20px (Card titles) Body: 16px Small: 14px Caption: 12px

Spacing System Consistency = premium feel. Use a strict 8px grid: 4px → micro spacing 8px → tight 16px → normal 24px → section 32px → major section 48px → page separation
Border Radius Soft, calm, friendly. Small elements: 8px Cards: 16px Modals: 20px Buttons: 12px Chips: 999px (pill)
Shadow System Subtle, not heavy. Card Shadow: 0 4px 20px rgba(0,0,0,0.25)
Hover Shadow: 0 8px 30px rgba(0,0,0,0.35)

Motion Design Motion should feel: • Soft • Calm • Natural Not flashy. Timing Fast: 150ms (buttons) Normal: 250ms (cards) Slow: 400ms (page transitions) Animations • Fade + slide • Scale on hover • Quote fade-in • Timeline scroll
Component Language Buttons Primary: • Violet gradient • Soft glow • Rounded Secondary: • Transparent • Border • Soft hover
Cards • Elevated surface • Soft shadow • Clear hierarchy • Poster + content

Chips Used for: • Filters • Tags • Moods • Life phases Color-coded by meaning.

Mood Color Mapping Each mood gets a color: Inspired → Emerald Emotional → Rose Calm → Cyan Thoughtful → Violet Intense → Amber Dark → Slate Used in: • Moments • Emotional map • Timeline • Analytics
The Katha Vibe When someone opens Katha, it should feel like: Opening a personal library Opening a journal Opening a memory box Calm. Deep. Personal.
Brutal Design Truth Most apps fail because: • Colors are random • Spacing is inconsistent • Typography is weak • Motion is chaotic This system avoids all of that.

Final Verdict This design system is: • Professional • Scalable • Timeless • Emotional • Developer-friendly It can grow with Katha for years.

  The Home Screen is not a dashboard. It is your personal story space. This is where users decide whether they love the app or forget it. We design it to feel like: • Opening a journal • Entering a personal library • Seeing your life in stories Calm. Beautiful. Emotional. Intelligent.

🏠 Katha Home Screen — Final UI Design Core Philosophy Home should feel like: “This is my space.” Not: “Here are your numbers.” It should: • Welcome you • Remind you of your journey • Help you continue • Inspire reflection • Reduce decision fatigue

Layout Structure The Home screen is a vertical storytelling experience. Scrollable, calm, spaced.

Greeting Section (Top Hero) At the very top: Good Evening, Aditya
Your story continues. Subtext: Smriti is keeping your memories safe. Design: • Soft gradient background (midnight → slate) • Large typography • Calm breathing space • No clutter Optional: • Small animated stars or dust particles (very subtle)
Continue Watching (Primary Action) This is the most important section. Title: Continue Your Story Horizontal scroll cards: Each card: • Poster • Title • Progress ring • Episode / runtime • “Continue” button Example: [ Poster ] Vinland Saga S1 • E18 Progress: 72% ▶ Continue Design: • Big cards • Soft shadow • Hover lift • Smooth scroll This should feel like Netflix — but calmer.
Moment of the Day (Emotional Anchor) This is Smriti’s soul. Card: Moment of the Day
“I have no enemies.” — Vinland Saga

Saved on: 12 Aug 2024
Mood: Thoughtful Design: • Quote in serif font • Soft glow border • Calm background • Fade-in animation This is the emotional hook.

Smriti Timeline Preview Title: Your Recent Journey Show last 3 timeline events: • Watched S1E18 of Vinland Saga • Saved a moment from Interstellar • Finished Attack on Titan Each item: • Icon • Story title • Time ago Button: View Full Timeline → Design: • Vertical list • Timeline dots • Soft separators
Tonight’s Watch (Decision Engine) This solves decision fatigue. Card: Tonight’s Watch
Interstellar
2h 49m • Sci-Fi

Because you love mind-bending stories. Buttons: • Watch Now • Pick Another Design: • Highlighted card • Accent border • Call-to-action focus This becomes addictive.

Emotional Snapshot Small grid: Your Story Mood Show: • Most common mood this month • Most impactful story • Current streak • Total watch time But keep it soft. Not a stats dashboard.
Discover Wisdom (Smriti Atlas Preview) Card: From Smriti Atlas
100 Life-Changing Movies A curated journey of stories that shape your life.

Explore Collection → Design: • Editorial card • Book-cover feel • Calm typography

Add Story / Add Moment Floating action button (bottom center):
Add Expands to: • Add Story • Add Moment • Add Session This keeps creation frictionless.
Visual Composition Spacing: • Large vertical gaps • Calm rhythm • No crowding Colors: • Midnight background • Soft slate cards • Violet accents • Cyan highlights Typography: • Serif for quotes • Sans-serif for UI Motion: • Fade-in on scroll • Hover lift on cards • Soft slide transitions

Empty State (First Launch) If no data: Hero message: Welcome to Katha
Your story begins here. Subtext: Track your stories. Save your moments. Build your legacy. Button: Add Your First Story

Emotional Goal When user opens Katha, they should feel: • Calm • Curious • Motivated • Nostalgic • Inspired Not overwhelmed.

Product Truth If Home is beautiful: • Users return • Users explore • Users reflect • Users trust Smriti If Home is boring: • They forget the app exists

Final Verdict This Home Screen: • Feels premium • Feels personal • Feels emotional • Feels intelligent • Feels calm It becomes the heart of Katha.

  .

📚 Katha Library UI — Digital Bookshelf Design Core Philosophy The Library should feel like: Walking through your own private library of stories. It should: • Be calm • Be structured • Be beautiful • Be fast • Be powerful Not: • Crowded • Data-heavy • Technical • Ugly

Layout Structure The Library has three layers:

Shelf View (default)
List View (power users)
Story Page (deep dive)
Library Header At the top: My Library
Your personal collection of stories. Below it: A horizontal filter bar (chips) All Anime Series Movies Docs YouTube
Watching Completed Rewatching Impactful These are one-tap smart filters.
Shelf View (Default) This is the heart of the library. Each category is a shelf.
Example Layout Anime Shelf ──────────────────────────── [Poster] [Poster] [Poster] → scroll

Series Shelf ──────────────────────────── [Poster] [Poster] [Poster] → scroll

Movies Shelf ──────────────────────────── [Poster] [Poster] [Poster] → scroll

Story Card Design Each card shows: Poster Title Year Impact Score Progress Ring Example: [ Poster Image ]

Vinland Saga 2023 Impact: ★★★★☆ Progress: 72% Hover: • Lift animation • Glow border • Quick actions overlay

Quick Actions (on hover / long-press) Icons: • ▶ Continue • ⭐ Favorite • 📌 Save Moment • ✏ Edit This avoids opening menus.

Smart Sorting Controls Top-right controls: Sort by: Recently Watched Impact Rating Completion Toggle: Shelf View | List View
Search Experience Search bar at top: Search your stories, moments, or lessons... This is global search. Results grouped by: • Stories • Moments • Knowledge
List View (Power Mode) For heavy users. Columns: • Poster • Title • Year • Category • Status • Rating • Impact • Progress Sortable headers. This is your control center.
Story Page Entry Clicking any story opens the Story Page. This is the deep memory space. We design it next.
Empty Shelf States If shelf empty: Your Anime Shelf is empty. Add your first anime story. Button: Add Anime
Smart Sections At the top of library, show: Continue Watching Horizontal strip for active stories. Then shelves.
Emotional Sorting (Unique Feature) Add filter: Mood: Inspired | Emotional | Thoughtful | Calm This connects with Smriti.
Visual Language Background: Midnight Cards: Soft slate Posters: Rounded Spacing: Large Shadows: Soft Motion: Gentle Feels like: • Netflix polish • Notion clarity • Apple calm
UX Principles • One tap to continue • One tap to save moment • One tap to edit • No buried menus • No clutter • No dense tables by default

Mobile Experience Shelf becomes vertical: Anime Shelf [Poster] [Poster] → swipe

Series Shelf [Poster] [Poster] → swipe Bottom nav always accessible. FAB for Add.

Why This Works This UI: • Feels personal • Feels premium • Feels calm • Feels powerful • Scales to 1000+ stories

Brutal Product Truth Most libraries look like spreadsheets. This looks like a personal universe of stories.

Final Verdict This Library UI: • Makes browsing enjoyable • Makes discovery easy • Makes tracking effortless • Makes memory visible It’s the backbone of Katha.

  📖 Katha Story Page UI — The Story Archive Core Philosophy Each story is treated like a chapter of your life. The Story Page should: • Be immersive • Be emotional • Be reflective • Be powerful • Be calm

Page Layout Structure The page is divided into five major sections:

Hero Header
Action Bar
Story Tabs
Timeline Integration
Personal Reflection
Hero Header (Story Identity) At the top: Large poster on the left Details on the right
Content • Title (large serif font) • Year • Category • Rating • Impact Index • Emotional Profile Example: Vinland Saga (2023) Anime • Drama • Philosophy

Rating: ★★★★☆ Impact Index: 92

Emotions: Thoughtful • Emotional • Inspiring

Visual • Poster with soft shadow • Gradient overlay • Parallax scroll (optional) • Soft fade-in

Action Bar (Primary Controls) Sticky bar under header: Buttons: • ▶ Continue Watching • o Add Session • o Save Moment • ✏ Edit Story • ⭐ Favorite This keeps actions one tap away.
Story Tabs (The Archive) Tabs below action bar: Overview | Sessions | Moments | Knowledge | Stats
Overview Tab (Story Essence) This is the heart. Sections: Description Story summary.

Why This Story Matters Your personal editorial note.

Your Rating & Review Personal reflection.

Emotional Impact Mood tags with color.

Life Phase Which phase of life it belongs to.

Notes Free-form personal notes.

Sessions Tab (Watch History) Timeline view: 12 Aug 2025 — 45 min Watched Episode 18

10 Aug 2025 — 90 min Watched Episode 17–18 With: • Duration • Mood • Notes

Moments Tab (Memory Snapshots) Pinterest-style grid of saved moments: Card: • Quote • Episode • Mood • Date Tap → Full moment view. Button:

Save New Moment
Knowledge Tab (Wisdom Layer) Sections: • Lessons learned • Ideas extracted • Principles • Favorite quotes Add knowledge manually.

Stats Tab (Insight Layer) Charts: • Watch time over time • Rewatch count • Completion % • Mood trend • Impact evolution

Smriti Timeline Integration At bottom: This Story in Your Life Timeline of: • First watched • Moments saved • Rewatches • Completion
Reflection Panel End of page: What did this story teach you? With journaling prompt.
Visual Language • Deep midnight background • Soft slate surfaces • Accent colors for emotions • Serif for quotes • Soft transitions • Calm scroll

Mobile Experience Poster becomes top hero Tabs become swipeable Action bar becomes bottom bar

Emotional Goal User should feel: • Connected • Reflective • Proud • Inspired

Product Truth No tracker gives this level of depth. This turns a show into: A life chapter.

Final Verdict This Story Page: • Feels like a personal book • Feels meaningful • Feels immersive • Feels premium It becomes the heart of Katha.

  🧠 Katha Memory World UI — Smriti’s Temple Core Philosophy Memory World should feel like: • Opening a personal diary • Walking through a museum of your life • Browsing your own story history It should: • Be calm • Be emotional • Be reflective • Be beautiful • Be timeless Not: • Technical • Analytical • Crowded • Cold

Structure — The Memory Universe Memory World has four main realms:

Smriti Timeline
Moments Gallery
Emotional Map
Life Journal
Smriti Timeline (The Spine) This is the backbone of Memory World.
Design Vertical infinite timeline. Grouped by year: 2026

— Watched Vinland Saga S1E18 (45 min) — Saved a moment from Interstellar — Finished Attack on Titan

2025

— Started Demon Slayer — Saved a moment from Your Name Each event: • Icon (watch, moment, finish, rewatch) • Story poster thumbnail • Title • Timestamp • Mood color Tap → opens story or moment.

Filters All | Watching | Moments | Finished | Rewatched | Knowledge

Memory Resurface Pinned at top: On this day — 1 year ago You finished Interstellar.

Moments Gallery (The Heart) A beautiful wall of memories.
Layout Masonry grid (Pinterest-style). Cards: • Quote (serif font) • Story • Episode • Mood badge • Date Tap → full-screen memory view.

Full Memory View Poster background Quote Character Scene context Your thoughts Mood Life phase Buttons: • Edit • Share • Lock (private)

Emotional Map (The Mirror) This is self-reflection.
Visual Bubble map by year. Each bubble: • Mood color • Count • Size by intensity Example: 2026 Inspired (12) Emotional (8) Thoughtful (15)

Insights Most emotional year: 2025 Most inspiring genre: Anime Most reflective phase: College

Life Journal (The Book) Your personal editorial layer.
Sections Life Phases Create phases: • College Era • Lockdown Phase • Growth Phase Attach stories and moments.

Story Essays Write reflections: • “What anime taught me” • “Stories that shaped my thinking”

Year in Stories Auto-generated yearly reflection.

Visual Language • Dark museum-like background • Spotlight cards • Soft glow accents • Calm animations • Gentle scrolling

Microcopy Instead of: No moments Use: Your memories will live here. Instead of: Timeline empty Use: Your story has just begun.

Emotional Goal User should feel: • Nostalgic • Calm • Reflective • Proud • Connected to their journey

Brutal Product Truth This is your killer feature. No entertainment tracker does this. This turns Katha into: A memory operating system.

Final Verdict Memory World becomes: • Smriti’s soul • Katha’s heart • Your legacy archive

  🌍 Katha Discover World — Smriti Atlas Core Philosophy Discover should feel like: • A curated library • An editorial magazine • A wisdom archive • A life guide Not: • A random recommendation list • A streaming catalog • A commercial feed It should: • Respect your intelligence • Reduce decision fatigue • Elevate taste • Teach through stories

Structure — The Atlas Discover World has four realms:

Curated Collections
Mood Engine
Decision Engine
Knowledge Vault
Curated Collections (Editorial Library) This is the front page.
Layout Grid of editorial cards: 100 Life-Changing Movies Best Philosophical Anime Must-Watch Series Before 30 Greatest Documentaries Ever Made Each card: • Book-cover design • Editorial summary • Estimated watch time • Difficulty level (Light / Deep / Heavy) Tap → opens collection.

Collection Page Header: • Title • Description • Why this collection matters List of stories: • Poster • Title • Year • Genre • Why it's included Button: Add to My Library This turns discovery into action.

Mood Engine (Emotional Discovery) This is your emotional navigator.
Prompt How are you feeling today? Buttons: • Lost • Unmotivated • Curious • Emotional • Calm • Overwhelmed • Inspired

Results Stories for when you feel Lost Curated list with: • Emotional reasoning • Mood tags • Expected impact This is therapy through stories.

Decision Engine (Fatigue Killer) This solves: "What should I watch?"
Prompts • I have 30 minutes • I want something meaningful • I want something light • I want something intense • I want something inspiring

Output One recommendation: Tonight’s Pick

Before Sunrise (1995) 1h 41m • Romance • Philosophy

Why: A quiet, thoughtful film about connection and time. Buttons: • Add to Library • Pick Another

Knowledge Vault (Wisdom Layer) Stories → Ideas.
Sections Life Lessons from Cinema Articles like: • “What Interstellar teaches about love and time” • “What Vinland Saga teaches about violence”

Principles Archive Principle: Compassion over Revenge Source: Vinland Saga

Wisdom Quotes Curated powerful quotes.

Visual Language • Editorial magazine style • Clean layouts • Book-like cards • Soft typography • Calm reading space

Offline Dataset Model Smriti Atlas ships with: • Preloaded curated database • JSON dataset embedded in app • Indexed for fast search • Expandable later

Emotional Goal User should feel: • Curious • Inspired • Guided • Educated

Brutal Product Truth Most recommendation engines are trash. This one is: • Thoughtful • Curated • Meaningful • Human

Final Verdict Smriti Atlas turns Katha into: • A story university • A wisdom engine • A life guide This is not entertainment. This is education through stories.

  ⚙️ Katha Settings & Control World The Engine Room of Smriti This is where users: • Trust the app • Control their data • Protect their memories • Manage their legacy

Core Philosophy Settings should feel like: Managing a personal vault. Not: Tweaking app options. This is where users feel: • Ownership • Security • Control • Confidence

Layout Structure Sidebar / sections: Appearance Account & Identity Data & Storage Backup & Export Privacy & Security PWA & Offline About Katha Advanced Each section is a clean, calm card.

Appearance Appearance ──────────── Theme: Light | Dark | Auto (system) Accent Color: Violet | Cyan | Emerald | Rose Font Mode: Normal | Reading | Focus Density: Comfortable | Compact Preview panel shows live changes.
Identity & Product Info This gives the app legitimacy. Katha — Powered by Smriti Version: v1.0.0 Build Date: 12 Jan 2026 Last Updated: 15 Jan 2026 Buttons: • View Changelog • View Roadmap
Data & Storage This builds trust. Storage Usage ──────────── Stories: 12 MB Images: 48 MB Moments: 2 MB Sessions: 1 MB
Total Used: 63 MB of available browser storage Buttons: • Optimize Images • Clear Cache • Export Backup

Backup & Export (Storybook) Rename everything for identity. Storybook Export ──────────── Create your personal storybook.
Formats:

PDF Book
Word Book
Memory Archive (JSON) Buttons: • Create Storybook • Create Memory Archive • Restore Archive
Privacy & Security This is critical. Privacy Mode ──────────── All data is stored locally on this device. No cloud. No tracking. No telemetry. Options: • Enable App Lock (PIN / Password) • Enable Encryption (AES) • Auto-lock after inactivity • Hide private moments Warning: "Forget your password and your data is lost forever."
PWA & Offline Offline Status: Active ✅ Buttons: • Install App • Check for Updates • Clear Offline Cache • Offline Guide Indicator: Green dot when offline-ready.
Backup Reminders Backup Health ──────────── Last Backup: 18 days ago
Recommendation: Create a Memory Archive every month. Button: • Backup Now

Legacy Mode (Personal Archive) This is powerful. Personal Legacy Mode ──────────── Prepare your life archive for the future.
Includes:

Your storybook
Your memories
Your reflections
Your knowledge Button: • Generate Legacy Archive This turns Katha into a life artifact.
About Katha Katha — Your Personal Story Archive Powered by Smriti
Built for memory, reflection, and wisdom. • Credits • License • Philosophy • Privacy Promise

Advanced Developer Mode ──────────── Export logs Reset app Debug storage
Visual Language • Dark vault-like UI • Structured cards • Calm typography • Strong hierarchy • No clutter

Microcopy Instead of: Clear Data Use: Erase My Story Archive Instead of: Export JSON Use: Create Memory Archive

Emotional Goal User should feel: • Safe • In control • Proud of their archive • Confident in Smriti

Brutal Product Truth Trust decides whether people store their life in your app. This screen builds that trust.

Final Verdict This Settings UI makes Katha feel: • Real • Serious • Premium • Long-term

  🏗 Katha App Architecture A Personal Story Operating System

Core Architecture Philosophy Katha must be: • Local-first • Offline-first • Privacy-first • Modular • Maintainable • Scalable • Testable Think of Katha like a mini operating system: • Stories = Files • Moments = Memories • Sessions = Activity logs • Smriti = Intelligence layer • Atlas = Knowledge base

System Layers We divide the app into six clean layers: UI Layer Feature Layer State Layer Data Layer Intelligence Layer System Layer Each layer has a single responsibility.
Folder Architecture Final structure: src/ ├── app/ # App shell, layout, providers │ ├── AppShell.tsx │ ├── Navigation.tsx │ ├── Providers.tsx │ └── ErrorBoundary.tsx
├── features/ # Product features (vertical slices) │ ├── home/ │ ├── library/ │ ├── story/ │ ├── memory/ │ ├── discover/ │ ├── export/ │ └── settings/

├── components/ # Shared UI components │ ├── ui/ │ ├── layout/ │ ├── charts/ │ └── feedback/

├── store/ # Zustand stores │ ├── storyStore.ts │ ├── memoryStore.ts │ ├── sessionStore.ts │ ├── uiStore.ts │ └── settingsStore.ts

├── db/ # IndexedDB (Dexie) │ ├── schema.ts │ ├── migrations.ts │ ├── seed.ts │ └── indexes.ts

├── smriti/ # Intelligence engine │ ├── timeline.ts │ ├── emotionalMap.ts │ ├── impactIndex.ts │ ├── resurfacer.ts │ └── analytics.ts

├── atlas/ # Offline discovery engine │ ├── dataset.json │ ├── collections.ts │ ├── moodEngine.ts │ ├── decisionEngine.ts │ └── knowledge.ts

├── utils/ │ ├── encryption.ts │ ├── compression.ts │ ├── validators.ts │ ├── exporters.ts │ └── formatters.ts

├── types/ │ ├── story.ts │ ├── moment.ts │ ├── session.ts │ └── index.ts

├── styles/ │ └── globals.css

├── router.tsx ├── main.tsx └── vite-env.d.ts This structure can scale for 5+ years.

Data Layer (Smriti Core) Dexie schema: Stories Table Moments Table Sessions Table Knowledge Table Timeline Table Settings Table Everything flows into Timeline Table. Timeline becomes the spine of Smriti.
Smriti Intelligence Engine This is your killer system. Modules • timeline.ts → merges all activity • emotionalMap.ts → mood analytics • impactIndex.ts → story impact score • resurfacer.ts → "On this day" system • analytics.ts → stats engine This layer has zero UI. Pure logic.
Atlas Discovery Engine Offline dataset: dataset.json Contains: • Curated stories • Collections • Wisdom articles • Principles • Recommendations Indexed into IndexedDB on first run. Used by: • Mood Engine • Decision Engine • Wisdom Vault
State Layer (Zustand) Stores: storyStore → stories CRUD memoryStore → moments + journal sessionStore → watch history uiStore → navigation, modals settingsStore → preferences No prop drilling. No messy context. Clean actions.
UI Architecture Each feature owns: pages/ components/ hooks/ services/ Example: features/library/ ├── LibraryPage.tsx ├── StoryShelf.tsx ├── StoryCard.tsx ├── useLibrary.ts └── library.service.ts
App Shell `<AppShell>`
`<Navigation />` `<MainContent />` `<NowPlaying />` `<GlobalToasts />` `</AppShell>` Everything runs inside AppShell. ________________________________________ 9) Offline Engine • Service Worker (Workbox) • App Shell cache • Image cache • Dataset cache • Export cache Offline banner always visible when offline. ________________________________________ 10) Security Layer • DOMPurify sanitization • Optional AES encryption • App lock • CSP meta • No external calls ________________________________________ 11) Performance Strategy • Virtual lists • Lazy routes • Chunk splitting • Image compression • Memoized analytics • Background workers for exports ________________________________________ 12) Product Versioning Katha v1.0 — Powered by Smriti Build: 2026.01.12 Versioned migrations. Backward compatibility. ________________________________________ 13) Testing Pyramid • Unit tests for Smriti engine • Integration for flows • E2E for install + offline ________________________________________ 14) Build System Vite: • PWA plugin • Chunk control • Compression • Visualizer ________________________________________ Final Product Architecture You are not building: An entertainment tracker. You are building: A personal story operating system. ________________________________________ Brutal Engineering Truth Most apps fail because: • No architecture • No separation • No intelligence layer • No memory spine Katha will not fail. ________________________________________ Final Verdict This architecture is: • Professional • Scalable • Clean • Powerful • Unique It is startup-grade.
Smriti Atlas — System Roadmap We build this in phases to control risk and complexity.

PHASE 1 — Core Dataset System Goal: Build a clean, offline, local dataset engine. Step 1 — Dataset Format Design a schema: AtlasEntry { id: string title: string category: movie | series | anime | documentary year: number genres: string[] description: string themes: string[] // philosophy, motivation, war, life, love impactTags: string[] // inspiring, emotional, mind-bending runtime?: number seasons?: number difficulty: easy | medium | heavy whyWatch: string // editorial reasoning }

Step 2 — Atlas Database • atlas.json (bundled with app) • Load into IndexedDB on first run • Versioned dataset • Migration support

Step 3 — Atlas Installer • “Install Smriti Atlas” • Shows dataset size • One-click import • Progress indicator • Storage check

PHASE 2 — Discovery Engine Goal: Make discovery meaningful. Step 4 — Atlas Browser • Categories • Themes • Difficulty • Impact tags • Search

Step 5 — Editorial Collections Prebuilt collections: • 100 Life-Changing Movies • Best Philosophical Anime • Must-Watch Series Before 30 • Greatest Documentaries Ever Each with intro text.

Step 6 — Why This Story Matters Every entry shows: • Why it’s important • What it teaches • Who should watch it • When to watch it in life This is where value lives.

PHASE 3 — Personal Intelligence Integration Goal: Connect Atlas with user’s life.

Step 7 — Match With User Profile Use: • Emotional mapping • Impact index • Mood engine • Story DNA To recommend: Stories that fit YOU.

Step 8 — Life Phase Suggestions Examples: • College phase → growth stories • Career phase → strategy stories • Burnout phase → healing stories

Step 9 — Decision Engine Integration “What should I watch tonight?” → Smriti Atlas answers.

PHASE 4 — Knowledge & Legacy Layer Goal: Turn entertainment into wisdom.

Step 10 — Knowledge Extraction Users add: • Lessons learned • Ideas • Principles From Atlas stories.

Step 11 — Legacy Archive Export: My Wisdom Through Stories A personal philosophy book.

PHASE 5 — Atlas Expansion Packs Goal: Grow safely.

Dataset packs: • Philosophy Pack • Anime Classics Pack • Documentary Masterpieces • Indian Cinema Legends • World Cinema Pack User chooses what to install.

Development Timeline (Realistic) Phase Time Phase 1 5–7 days Phase 2 5 days Phase 3 5 days Phase 4 4 days Phase 5 Ongoing

Final Product Vision When finished, Katha becomes: A personal memory engine + a curated wisdom atlas of stories. That’s unique. That’s rare. That’s powerful. 🧠 Smriti Atlas — Dataset Design (Final Architecture) This dataset is offline-first, bundled with the app, versioned, and expandable via packs.

Core Atlas Entry Schema This is the heart of Smriti Atlas. AtlasEntry { id: string // UUID title: string // "Interstellar" originalTitle?: string category: "movie" | "series" | "anime" | "documentary" year: number country?: string
genres: string[] // ["Sci-Fi", "Drama"] themes: string[] // ["time", "love", "sacrifice", "humanity"] impactTags: string[] // ["mind-bending", "emotional", "inspiring"]

difficulty: "easy" | "medium" | "heavy" emotionalTone: string[] // ["hopeful", "melancholic", "intense"]

runtime?: number // minutes (movies/docs) seasons?: number // series/anime episodes?: number

description: string // short summary whyWatch: string // editorial reason

lifeLessons: string[] // extracted wisdom reflectionPrompts: string[] // self-reflection questions

bestWatchedWhen: string[] // examples: // ["feeling lost", "seeking motivation", "questioning life", "burned out"]

recommendedAge?: string // "16+", "18+"

culturalImpact?: string // why it matters historically

createdBy: "Smriti Atlas Editorial" version: string // "atlas-core-v1" }

Editorial Collection Schema This powers: • 100 Life-Changing Movies • Best Philosophical Anime • Must-Watch Before 30 • Greatest Documentaries AtlasCollection { id: string title: string subtitle: string description: string
category: "movie" | "series" | "anime" | "documentary" | "mixed"

philosophy: string // what this collection stands for lifeStage: string[] // ["student", "career", "self-discovery"]

curatorNote: string // editorial introduction

entryIds: string[] // references AtlasEntry.id

difficulty: "easy" | "medium" | "heavy" emotionalProfile: string[] // dominant emotions

version: string }

Knowledge Layer Schema This turns entertainment into wisdom. AtlasKnowledge { id: string entryId: string
principles: string[] // lessons extracted ideas: string[] // philosophical ideas quotes: string[] // important dialogues concepts: string[] // leadership, ethics, psychology

reflectionExercises: string[] journalingPrompts: string[]

wisdomScore: number // 1–10 }

Life Phase Mapping Schema This enables life-based discovery. AtlasLifePhase { id: string phase: string // "College", "Career", "Midlife", "Rebuilding"
description: string

emotionalNeeds: string[] // motivation, healing, focus recommendedThemes: string[]

entryIds: string[] // best stories for this phase }

Mood Engine Mapping This powers mood-based discovery. AtlasMoodMap { mood: string // "sad", "lost", "burned out", "unmotivated"
description: string

emotionalGoal: string // what user wants to feel

recommendedEntryIds: string[] }

Dataset Packaging Structure Your bundled dataset looks like: /atlas/ atlas-core.json collections.json knowledge.json life-phases.json mood-map.json meta.json
Dataset Meta File AtlasMeta { name: "Smriti Atlas Core" version: "1.0.0" entries: number sizeMB: number createdAt: Date curator: "Katha Editorial" license: "Personal Use Only" }
What This Enables With this dataset, Katha can: • Recommend based on mood • Recommend based on life phase • Recommend based on emotional needs • Teach lessons from stories • Extract knowledge • Build a wisdom archive • Generate a life storybook • Act as a decision engine All offline. All private. All local.

Why This Architecture Is Powerful This is not a catalog. This is: • A philosophy engine • A growth system • A discovery engine • A legacy archive It supports: • Human emotion • Human growth • Human memory

Brutal Engineering Reality This is complex. But it’s cleanly modular. You can start with: • atlas-core.json • collections.json Then grow into: • knowledge layer • mood engine • life phases No rewrite needed.

🧠 MOMENTS SYSTEM — MASTER ROADMAP We build Moments in 5 structured phases. Each phase ships something usable. No half-baked features. No spaghetti.

PHASE 1 — Core Foundation (Data + Logic) Goal: Make Moments a real system, not just UI. Step 1: Data Model & Database • Create Moment TypeScript type • Create Dexie moments table • Add indexes: o storyId o dateSaved o mood o isPrivate Step 2: Relations • Link Moment → Entry (story) • Cascade delete when story is deleted • Add helper queries: o Get moments by story o Get moments by mood o Get recent moments o Get random moment Step 3: Validation • Quote required (max 500 chars) • Mood required • Sanitize text (DOMPurify) • Trim whitespace • Prevent empty moments

PHASE 2 — Creation UX (Save Moments Fast) Goal: Make saving moments effortless. Step 4: Add Moment UI • Modal or page: “Save Moment” • Fields: o Story (autocomplete) o Season / Episode o Quote o Mood selector (emoji grid) o Thoughts (optional) o Life phase (optional) o Private toggle Step 5: Quick Add • Floating Action Button → “+ Moment” • Minimal form (Story + Quote + Mood) Step 6: Entry Page Integration • Add “Moments” tab in each story • Show list of saved moments • “Add Moment” button inside story page

PHASE 3 — Memory Layer (Smriti Intelligence) Goal: Make Moments come back to life. Step 7: Smriti Timeline Integration • Timeline item: Saved a moment from Vinland Saga “I have no enemies.” Step 8: Moment of the Day • Dashboard widget • Random resurfacing engine • Filters by mood / story Step 9: “On This Day” System • Daily job: o Check past moments on same date o Show memory resurfacing banner

PHASE 4 — Moments Library Goal: Turn moments into a searchable archive. Step 10: Moments Page • Grid/List view • Filters: o Story o Mood o Year o Category • Search (quote, character, thoughts) Step 11: Scene Timeline • For each story: o Chronological list of moments o Bookmark-style UI

PHASE 5 — Analytics, Export & Privacy Goal: Make Moments meaningful and safe. Step 12: Emotional Analytics • Most saved moods • Most impactful story • Genre vs emotion chart • Most reflective year Step 13: Storybook Export • Include favorite moments section • Quotes + reflections • Chronological order Step 14: Privacy Layer • Lock moments • Hide moments • Exclude from export • Password-protected access

🎯 Milestone Plan Phase Output Phase 1 Moments stored & retrievable Phase 2 Users can save moments easily Phase 3 Smriti resurfaces memories Phase 4 Full moments archive Phase 5 Analytics + Storybook

🧠 WINDSURF MASTER PROMPT Rebuild “Add Entry” — Katha (Powered by Smriti)

ROLE You are acting as: • Principal Full-Stack Engineer • Senior Product Engineer • World-class Visual Designer • Brand Strategist • Design Systems Architect • UX Psychologist Treat this as a production rebuild, not an experiment. This is not a form redesign. This is a core emotional interaction in a personal product.

PRODUCT CONTEXT App Name: Katha — Powered by Smriti Type: Local-first, offline-first PWA Domain: Personal entertainment tracking + memory journaling Audience: Thoughtful users who value meaning, reflection, and calm UX Katha is not IMDb, AniList, or Netflix. It is a personal story archive.

PROBLEM STATEMENT The current “Add Entry” screen feels like: • A database form • Field-heavy • Emotionless • Cognitive-load heavy This causes: • Drop-offs • Shallow entries • Low emotional attachment

OBJECTIVE Rebuild the Add Entry section so that: • Adding a story feels intentional • The UI adapts to user intent • The page feels calm and premium • Data remains clean and structured • Emotional context is captured without pressure • The system scales into future Smriti features

HIGH-LEVEL DESIGN PRINCIPLES • Calm > Clever • Intent > Speed • Clarity > Density • Emotion > Metadata • Respect > Control No loud visuals. No gamification here. No judgmental language.

LAYOUT ARCHITECTURE (MANDATORY) SINGLE-PAGE SCROLL • No multi-step wizard • No nested modals • One column layout • Clear vertical rhythm • Sectioned like a book chapter

SECTION-BY-SECTION SPECIFICATION

SECTION 1 — STORY BASICS Mental model: “What is this story?” Fields:

Title o Required o Fuzzy duplicate detection o Soft warning (not blocking)
Category o Series o Anime o Movie o Documentary o YouTube
Platform o Dropdown suggestions:  Netflix  Prime Video  Disney+  Crunchyroll  YouTube  Apple TV  Hotstar o Option: Other  Selecting “Other” reveals a text input Behavior: • Category selection dynamically configures later sections • Platform “Other” is stored as clean custom text
SECTION 2 — STATUS & INTENT Mental model: “Where am I with this story?” Status options: • Planned • Watching • On Hold • Completed

CONDITIONAL LOGIC (CRITICAL) If Planned • Show Priority selector: o Low o Medium o High • Priority uses subtle colored dots • Hide all progress fields

If Watching • Show progress fields: Series / Anime • Total seasons • Episodes per season • Current episode • Auto-calculated progress % Movie • Duration (minutes) • Watched so far (optional) • Show Experience So Far: o Short reflective textarea o Prompt: “How is it going so far?” o Max 500 characters This is not a journal, just a checkpoint.

If Completed • Auto-set progress to 100% • Auto-set completion date • Trigger subtle confetti o No loud animation o No blocking modal

If On Hold • Optional reason selector: o Time o Lost interest o Too heavy o Will return later • No warnings • No guilt language

SECTION 3 — VISUAL IDENTITY Mental model: “How does it look in my library?” Poster handling: • Drag & drop • Paste • File picker • Auto-compression • Blurhash placeholder • Gradient fallback if empty Poster is optional but visually encouraged.

SECTION 4 — GENRE & TAGS Mental model: “What kind of story is this?” Genre • Multi-select • Predefined suggestions • Optional “Write your own” Tags • Autocomplete from existing tags • Suggested tags by category • Free-add allowed Avoid free-text chaos by default.

SECTION 5 — REFLECTION Mental model: “Why does this matter?” Fields: • Rating (0–10, optional) • Reflection textarea (temporary label) o Prompt: “Why does this story matter to you?” This feeds: • Smriti Timeline • Moments system (future)

SECTION 6 — ACTIONS Mental model: “What happens next?” Buttons (left → right):

Save
Save + Add Session
Save + Add Moment
Cancel (low emphasis) Primary action visually dominant.
COLOR & THEME SYSTEM (APPLY EXACTLY)

Base Surfaces • Page background: #0B1220 • Main form surface: #111B2E • Section containers: #16223A • Borders/dividers: #22304A No pure black or white.

Text Colors • Primary: #E6EBF3 • Secondary: #B3BDD1 • Muted: #7A859E • Disabled: #566079

Accent Colors • Smriti Violet (Primary): #8B5CF6 • Cyan Insight (Secondary): #22D3EE • Rose Memory (Emotional): #FB7185 Never combine all three in a single component.

Status Colors • Planned: #FBBF24 • Watching: #22D3EE • On Hold: #A78BFA • Completed: #34D399 Red is forbidden.

Inputs • Background: #0F172A • Border: #22304A • Focus: o Border: #8B5CF6 o Soft glow (10% opacity) o No harsh outlines

Buttons Primary • Gradient Violet → Indigo • White text • Hover: +2% lift • Active: 98% press Secondary • Transparent • Border #22304A Cancel • Text-only • Muted tone

UX RULES (STRICT) • One column layout • Large touch targets • Clear vertical spacing • Keyboard accessible • Autosave drafts every 30s • Restore draft on crash • Inline validation only • No shaking animations • No judgmental copy

TECHNICAL CONSTRAINTS • Do not change database schema • Do not introduce external APIs • Do not break existing entries • Use existing state management • Maintain offline-first behavior

SUCCESS CRITERIA This screen should feel: • Calm • Intentional • Respectful • Premium • Emotionally safe If opened at 2 AM, it should still feel right.

FINAL INSTRUCTION Implement this rebuild faithfully. Do not simplify. Do not skip conditional logic. Do not add extra features. This screen determines retention.

END OF PROMPT
