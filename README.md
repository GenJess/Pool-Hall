# PoolPro AI

PoolPro AI is a smart billiards assistant that helps you determine the best next shot on the pool table. Simply snap a picture of the table, tell the app whether you're playing solids or stripes, and receive an AI-generated top-down virtual map of the table guiding you exactly where to aim.

## Current Tech Stack

- **Frontend Framework:** React 19, TypeScript, Vite
- **Styling & UI:** Tailwind CSS v4, Framer Motion (for smooth micro-animations and loading states), Lucide React (Icons)
- **AI Engine:** Google Gemini 2.5 Pro (`@google/genai` SDK) utilizing its advanced vision capabilities to process 3D images of pool tables into 2D trajectory maps.

## Future Vision

We are turning PoolPro AI into the ultimate AI-powered billiards companion platform. Our roadmap includes:

### 📱 Progressive Web App (PWA)
Transforming the app into an installable PWA for a seamless, native-like mobile experience.

### 🔐 Authentication & Database
Adding secure player sign-ups and profiles so users can build out their identity in the app.

### ⚔️ Player Challenges & Leaderboards
- **Matchmaking & Challenges:** Find other players at your local pool hall or across the globe and challenge them to ranked matches.
- **Head-to-Head Stats:** Track your win/loss records and history against specific friends and rivals.
- **Leaderboards:** Climb the ranks in an Elo-based ranking system and see where you stand on local and global leaderboards.

### 🤖 Advanced End-of-Game AI Analysis (The "Chess.com for Pool")
- **Play-by-Play Tracking:** Take a picture after every shot to log the entire game state sequentially.
- **Post-Game Stats & Breakdown:** The AI tracks all ball movements and provides an end-of-game statistical breakdown.
- **Blunder Detection:** Just like popular chess engines, the app will review your game and highlight brilliant shots, missed opportunities, and crucial blunders, helping players review and improve their game.
