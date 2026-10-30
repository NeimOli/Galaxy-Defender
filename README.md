# Galaxy Defender — Space Shooter Game

> **Software for Enterprise Project**  
> **Student Author:** NeimOli  
> **Module / Subject:** Software for Enterprise  
> **Repository:** [https://github.com/NeimOli/Galaxy-Defender](https://github.com/NeimOli/Galaxy-Defender)

---

## 1. Project Overview

**Galaxy Defender** is an enterprise-grade, browser-based space combat arcade simulation developed to demonstrate core principles of software engineering. Players pilot an advanced tactical starfighter through hostile cosmic sectors, neutralizing waves of rogue drones, navigating dense asteroid fields, engaging crimson raiders, and fighting multi-phase Mothership Dreadnoughts.

The project incorporates live REST interoperability with **Dr. Marc Conrad's Banana API** (`https://marcconrad.com/uob/banana/api.php?out=json`), serving as a Quantum Decryption Matrix that restores shields and replenishes Mega Bombs during combat. Furthermore, the application demonstrates and documents the four main assignment themes:

1. **Version Control:** Industry-standard Git/GitHub feature-branch workflow, atomic commits, conventional commit semantics, and clean branch merges.
2. **Interoperability:** Dr. Marc Conrad's Banana API REST integration, JSON schema contracts, resilient Express/SQLite proxy gateways, and procedural fail-safe backups.
3. **Event-Driven Programming:** High-frequency CustomEvent bus (`galaxy_hud_update`, `galaxy_game_over`, `open_banana_challenge`, `virtual_identity_changed`), 60 FPS `requestAnimationFrame` game loop, DOM input listeners, and real-time Web Audio API procedural sound synthesis.
4. **Virtual Identity:** Secure pilot authentication, BCrypt-compatible password hashing, SQLite session management, rank progression (Cadet to Fleet Admiral), and mission telemetry profiles.

---

## 2. Architecture & File Structure

```text
Galaxy Defender - Space Shooter Game/
├── src/
│   ├── components/
│   │   ├── BananaModal.jsx       # Interoperability challenge dialog with keypad and dual-mode close logic
│   │   ├── GameCanvas.jsx        # HTML5 Canvas game engine wrapper and bridge
│   │   ├── LeaderboardModal.jsx  # SQLite telemetry rankings and pilot high scores
│   │   ├── LoginModal.jsx        # Pilot authentication modal with quick-fill demo credentials
│   │   ├── Navbar.jsx            # Mission control navigation bar with audio toggle and Banana API trigger
│   │   ├── ProfileModal.jsx      # Pilot dossier, rank progression, and career statistics
│   │   ├── RegisterModal.jsx     # Pilot commission portal with ship class selection
│   │   ├── TelemetryHUD.jsx      # Real-time gold & cyan cockpit telemetry panel (Shield, Hull, Bombs, Score)
│   │   └── TestsModal.jsx        # In-browser diagnostic test runner verifying API reachability
│   ├── services/
│   │   └── api.js                # API Gateway client for Express backend & Banana API proxy
│   ├── styles/
│   │   └── style.css             # Cyber-stellar neon & gold design system, cockpit brackets, and debrief grid
│   ├── App.jsx                   # Central React application orchestrator, event bus listener, and modal controller
│   └── main.jsx                  # React 19 application entry point
├── public/
│   └── js/
│       ├── game.js               # Core game loop, particle engine, combat state machine, and audio synth
│       ├── player.js             # Player spacecraft physics, weapon tiers, and Quantum Shield mechanics
│       ├── enemies.js            # AI enemy hierarchies, bullet-hell attack waves, and Mothership Boss
│       └── background.js         # Parallax stellar starfield simulation
├── server.js                     # Express.js REST API server with Better-SQLite3 backend
├── database.sqlite               # Relational SQLite database (users, scores, telemetry logs)
├── index.html                    # Root HTML5 template
├── vite.config.js                # Vite build configuration with React plugin and proxy settings
├── package.json                  # Project dependencies and script definitions
├── README.md                     # Comprehensive project documentation
└── references.md                 # External citations, API documentation references & academic disclosures
```

---

## 3. The Four Main Assignment Themes

### Theme 1: Version Control (Git & GitHub)

Development strictly follows enterprise Git and GitHub version control best practices:
- **Feature Branch Workflow:** Development is isolated into dedicated feature branches before merging into `main`:
  - `feature/banana-api-gateway` — REST interoperability integration and modal UI
  - `feature/quantum-combat-hud` — Real-time telemetry HUD synchronization and game-over debrief
  - `feature/sqlite-telemetry-database` — Express backend and SQLite persistent telemetry
  - `feature/virtual-identity` — Pilot registration, authentication, and rank advancement
  - `feature/audio-synthesizer-controls` — Web Audio API procedural sound engine and mute toggle
  - `feature/cyber-stellar-ui-theme` — Sci-fi cockpit aesthetic, HUD brackets, and debrief cards
- **Commit Semantics:** Every commit follows the Conventional Commits standard (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`), ensuring a clean, auditable changelog.
- **Merge Integrity:** Features are tested, pushed to their upstream remote branch, and fast-forward/non-conflict merged into `main`.

### Theme 2: Interoperability (Dr. Marc Conrad's Banana API)

Interoperability is demonstrated through an external RESTful web service integration:
- **Primary Endpoint:** `https://marcconrad.com/uob/banana/api.php?out=json`
- **Request Format:** HTTP GET with JSON output format
- **Payload Schema:**
  ```json
  {
    "question": "https://www.sanfoh.com/uob/banana/data/tc...png",
    "solution": 8
  }
  ```
- **In-Game Combat Role:**
  The Banana API serves as the **Quantum Decryption Matrix**. When triggered during combat:
  - The game pauses and displays the visual mathematical cipher.
  - **No Dismiss Button:** During combat, the modal cannot be closed manually without answering.
  - **Correct Answer:** Awards **+1,500 Score**, recharges Quantum Shield to 100%, and grants **+1 Mega Bomb**.
  - **Incorrect Answer:** Displays `INCORRECT — No bonus awarded.` in red, auto-closes after 1.2s, and resumes combat without bonuses or penalties.
- **Top Navbar Inspection Mode:**
  Clicking the "Banana API" button in the top navigation bar opens the challenge with a **Close (`×`) Button** and backdrop dismiss enabled, allowing pilots to test and inspect the interoperability service at any time outside combat.
- **Resilience & Proxy Gateway:**
  Requests are routed through an Express server-side proxy (`/api/banana`) to resolve Cross-Origin Resource Sharing (CORS) constraints and mixed-content warnings. If the external university server is unreachable or offline, an internal procedural cipher generator seamlessly activates, ensuring zero downtime.

### Theme 3: Event-Driven Programming

The entire simulation is built on an asynchronous, decoupled event architecture:
- **Decoupled CustomEvent Bus:**
  - `galaxy_hud_update`: Dispatched continuously from `public/js/game.js` to update React `TelemetryHUD` (Shield %, Hull Integrity, Bombs, and Score) with zero React re-render lag.
  - `galaxy_game_over`: Emits full end-of-mission telemetry when Quantum Shield reaches 0.
  - `open_banana_challenge`: Triggers the React Banana modal asynchronously from the canvas game loop.
  - `virtual_identity_changed`: Synchronizes pilot rank and session across all UI components.
  - `audio_mute_changed`: Synchronizes audio mute states between React UI toggles and the canvas audio synthesizer.
- **60 FPS Hardware Render Loop:**
  Driven by `window.requestAnimationFrame()`, processing entity physics, collision detection, and weapon particle trajectories.
- **Web Audio API Synthesizer:**
  All sound effects (lasers, explosions, shield impacts, bomb detonations) are procedurally generated in real time using the Web Audio API (`AudioContext`, `OscillatorNode`, and `GainNode`), requiring no external audio file assets.

### Theme 4: Virtual Identity

A complete persistent Virtual Identity subsystem:
- **Pilot Authentication:** Secure login and registration backed by SQLite with BCrypt-standard salted password verification.
- **Session Persistence:** Active pilot session is tracked seamlessly via `localStorage` and synchronized with the backend.
- **Dynamic Military Rank Progression:**
  Pilot rank automatically advances based on total career combat score:
  - `Cadet` (0 – 4,999 pts)
  - `Ensign` (5,000 – 14,999 pts)
  - `Lieutenant` (15,000 – 29,999 pts)
  - `Commander` (30,000 – 49,999 pts)
  - `Fleet Admiral` (50,000+ pts)
- **Guest Vanguard Mode:** Instant combat access without prior registration, retaining session score and stats.

---

## 4. Key Gameplay Features

1. **Quantum Shield & Combat Survival:**
   - Real-time energy shielding protects the starfighter hull.
   - When the **Quantum Shield reaches 0%**, the ship is destroyed immediately, triggering **Mission Debrief**.
2. **Mission Debrief HUD:**
   - Comprehensive after-action report overlay showing:
     - **Combat Points** earned
     - **Banana Ciphers** successfully solved
     - **Sector / Wave** achieved
     - **Hostiles Down** (kill count)
     - **Accuracy Rating** (%)
     - **Survival Time** (minutes:seconds)
3. **Multi-Tier Weapon Systems:**
   - Level 1: Single Center Blaster
   - Level 2: Dual Twin Lasers
   - Level 3: Plasma Spread (3-way)
   - Level 4: Hyper Photon Spread (5-way barrage)
4. **Tactical Mega Bomb:**
   - Press `B` to detonate a screen-clearing Quantum Mega Bomb that eliminates hostile projectiles and damages all active enemies.
5. **Diverse Enemy AI:**
   - *Scout Drones:* Fast sinusoidal weaving attackers
   - *Asteroid Debris:* Splitting procedural space hazards
   - *Crimson Raiders:* Target-tracking ships with directed laser fire
   - *Void Bombers:* Heavy dreadnoughts releasing homing plasma mines
   - *Mothership Dreadnought (Boss):* Multi-phase boss encounter with dedicated health telemetry HUD.

---

## 5. Installation & Execution Guide

### Prerequisites
- Node.js (version 18 or newer)
- npm (Node Package Manager)

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NeimOli/Galaxy-Defender.git
   cd Galaxy-Defender
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Express API & Database Server:**
   ```bash
   npm run server
   ```
   *Runs on `http://localhost:5000` with SQLite database initialized.*

4. **Start the Vite Frontend Development Server (in a separate terminal):**
   ```bash
   npm run dev
   ```
   *Opens on `http://localhost:3000` (or `http://localhost:5173`).*

5. **Build for Production:**
   ```bash
   npm run build
   ```
   *Outputs optimized production assets to `dist/`.*

---

## 6. Pre-Configured Demo Accounts

For assessment and grading, the following pre-seeded pilot profiles are available:

| Callsign / Username | Passcode | Rank | Ship Class |
| :--- | :--- | :--- | :--- |
| `shepard` | `Password123!` | Fleet Admiral | Dreadnought |
| `fox` | `Password123!` | Commander | Interceptor |
| `valkyrie` | `Password123!` | Lieutenant | Phantom Recon |

*(A quick-fill demo button is also available inside the Login dialog).*

---

## 7. Testing & Quality Assurance Matrix

| Test ID | Module | Scenario / Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Flight Mechanics | Press `W`, `A`, `S`, `D` / Arrow keys | Spaceship accelerates smoothly with responsive banking tilt | **PASS** |
| **TC-02** | Weapon Systems | Press `Spacebar` | Fires blasters corresponding to current weapon tier | **PASS** |
| **TC-03** | Interoperability | Trigger Banana Cipher in-game | Modal displays visual math puzzle; close button hidden | **PASS** |
| **TC-04** | Interoperability | Click Banana API in top navigation | Opens modal with active close (`×`) button and backdrop dismiss | **PASS** |
| **TC-05** | Interoperability | Submit correct cipher digit | Awards +1,500 Score, recharges shields to 100%, +1 Mega Bomb | **PASS** |
| **TC-06** | Interoperability | Submit incorrect cipher digit | Displays "INCORRECT", auto-closes in 1.2s, resumes game without bonus | **PASS** |
| **TC-07** | Interoperability | Network offline / domain timeout | Procedural fallback cipher engine activates with zero disruption | **PASS** |
| **TC-08** | Combat Telemetry | Quantum Shield reaches 0% | Game ends instantly; displays Mission Debrief overlay with stats | **PASS** |
| **TC-09** | Mega Bomb | Press `B` key with available bombs | Detonates full-screen blast, clearing hostiles and enemy ordnance | **PASS** |
| **TC-10** | Virtual Identity | Pilot login with valid credentials | Authenticates session, displays rank badge, loads personal stats | **PASS** |
| **TC-11** | Diagnostics | Open System Tests modal | Runs automated connectivity check for Banana API & SQLite | **PASS** |

---

## 8. Author & Academic Declaration

This project was conceived, structured, and implemented by **NeimOli** for the **Software for Enterprise** academic module. All external web services, documentation references, and AI tools utilized during development are formally acknowledged and cited in [`references.md`](references.md).
