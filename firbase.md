From the outset, Katha was conceived as more than just a media-tracking app. It is a **personal story archive** designed for intentional and thoughtful logging. My perspective has always been to build Katha as a user's "Exo-brain" for their journey through entertainment—a private, trustworthy digital space to remember and reflect upon the stories that shape their world.

The foundational principle is  **privacy-first and offline-capable** . By using Dexie.js to store all data directly in your browser's IndexedDB, we have ensured that nothing is ever sent to a server. Your data is yours alone. This is not just a technical choice; it's a philosophical one that builds trust and makes the application feel truly personal and secure.

The AI, "Smriti," is designed as an intelligent companion, not a data harvester. Its purpose is to provide insights, automate tedious tasks, and help you uncover patterns within your own data, without ever compromising your privacy.

phase 1:-

This phase established the foundation of the application: your personal library of stories.

* **Story Management:** Full CRUD (Create, Read, Update, Delete) functionality for stories.
* **Add Story Wizard:** A guided, multi-step process to add new stories, making data entry less overwhelming.
* **Edit Story Form:** A comprehensive form to refine and update any detail about a story after it has been added.
* **Rich Data Model:** The `Story` data type is extensive, capturing:
  * **Basic Info:** Title, Category (Movie, Series, Anime, etc.), Platform (Netflix, etc.).
  * **Journey Tracking:** Status (`planning`, `watching`, `completed`, `on-hold`), Priority for planned stories, and on-hold reasons.
  * **Progress Tracking:** Sophisticated progress calculation that adapts based on the story category. For series, it uses season/episode counts; for movies, it uses watch time in minutes.
* **Visual Identity:** You can upload custom poster images for each story, giving your library a unique and personal visual feel.

phase 2 :-

This phase focused on capturing the *why* behind your story journey—the personal impact.

* **Moment Creation:** You can save "Moments" from any story, capturing a specific quote, your personal thoughts, the associated mood, and even the character involved.
* **Contextual Data:** For series, moments can be tagged with the specific season and episode number.
* **Privacy Control:** Moments can be marked as "private," which hides them from the main timeline and other shared views if you enable the privacy setting.
* **Memory World Page:** A dedicated `/memory` page acts as a beautiful, searchable archive of all your saved moments, displayed in a masonry layout reminiscent of a scrapbook. It features robust filtering by story, mood, category, and year.
* **Session Logging:** You can log detailed watch sessions, including date, duration, and episodes watched, which feeds all the advanced analytics.

phase 3 :-

This was a major phase where we introduced "Smriti," the AI, and the concept of discovery.

* **Smriti Atlas:** A curated, offline-first database of high-impact stories, collections, and "life phases" designed to help you discover new, meaningful content.
* **Discover Page:** A dedicated `/discover` page allows you to explore the Atlas, browse curated collections (e.g., "Mind-Bending Sci-Fi"), and filter by genre, theme, and impact tags.
* **AI Decision Engine (`suggestTodaysWatch`):** We built an advanced AI flow that analyzes your library, recent moods, and the Atlas to provide a single, intelligent recommendation for "Tonight's Watch" on the home screen.
* **Smart Actions:** The "Tonight's Watch" widget is dynamic. If an Atlas story is recommended, it offers to add it to your library. If a rewatch is suggested, it links directly to the story detail page.
* **AI-Powered Classification (`suggestStoryDetails`):** The story forms feature a "Suggest Details" button that uses an AI flow to automatically populate genres, tags, and dominant moods based on the story's title and your reflection.
* **Watch DNA Page:** The central analytics hub for your entire journey, featuring:
  * **Key Stats:** Top-level metrics like total stories, completed stories, moments saved, and average rating.
  * **Emotional Palette:** A bar chart visualizing the frequency of moods you've captured.
  * **Genre & Emotion Chart:** A stacked bar chart showing the emotional makeup of your most-watched genres.
  * **Genre Cloud:** A dynamic, visually engaging cloud where more frequent genres appear larger.
  * **Achievements:** A gamification system with milestones like "Cinephile," "The Critic," and "Archivist" to reward engagement.

phase 4 :-

This phase focused on surfacing deeper wisdom and creating a lasting artifact of your journey.

* **Knowledge Nuggets:** A component on the story detail page with dual functionality:
  1. For stories from the Atlas, it displays the pre-defined "Key Life Lessons" and "Reflection Prompts."
  2. For manually added stories, it uses an AI flow (`extractKnowledge`) to analyze your personal reflection and surface key lessons and a summary.
* **Legacy Archive (Export Page):** A complete overhaul of the export feature into a printable, A4-formatted "Storybook."
  * **Cover Page:** A beautiful title page for your personal book.
  * **Story Resume:** A one-page summary of your entire journey with key analytics and visualizations.
  * **Detailed Story Pages:** Each story gets its own page with its poster, your reflection, and a list of all its saved moments.
  * **JSON Backup:** The ability to download a raw JSON file of all your data remains.

phase 5 :-

This is our current phase, focused on new ways to visualize your data.

* **Watch Calendar:** A new, full-page calendar heatmap that gives you a birds-eye view of your watch activity throughout the entire year.
* **AI-Powered Binge Detection:** An AI flow (`detectBingePatterns`) that analyzes your session data to identify and highlight binge-watching days with a special icon on the calendar, complete with an AI-generated reason for the classification.
* **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, ShadCN UI for components, and Framer Motion for animations.
* **Global Search:** A `⌘K` command menu accessible from anywhere, allowing you to instantly search for stories, moments, and Atlas entries.
* **Onboarding:** A smooth, welcoming guide for first-time users that introduces the core concepts of the app.
* **Theming:** Light and Dark mode support, with a consistent and modern design system.
* **Branding:** We've iterated on the logo to arrive at the final, elegant "K" design that is now used consistently across the app.
* **Work in Progress:** We have successfully completed all the features planned up to this point. There are no functions currently in a half-finished state.
* **Future Ideas (My Suggestions):**

  * **Relationship Graph:** A visual network graph showing how stories in your library connect through shared genres, tags, or themes.
  * **Advanced Search Queries:** Allowing natural language search like, "Show me sci-fi movies I rated over 8."
  * **Character-Centric Views:** A new section to track your favorite characters and see all the moments associated with them across different stories.
  * **More AI Insights:** Deeper analysis on the Watch DNA page, such as identifying common narrative structures or tropes you enjoy.
