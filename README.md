# Galaxy Defender — Space Shooter Game

> **Software for Enterprise Project**  
> **Student Author:** Sagar Thapa  
> **Module / Subject:** Software for Enterprise  
> **Repository:** `galaxy-defender`

---

## 1. Project Overview

**Galaxy Defender** is an enterprise-grade, browser-based space combat arcade simulation developed to demonstrate core principles of software engineering. Players control an advanced starfighter navigating through hostile cosmic sectors, shooting waves of rogue drones, dodging asteroids, destroying crimson raiders, and engaging mothership dreadnoughts.

The project incorporates live interoperability with **Dr. Marc Conrad's Banana API** (`https://marcconrad.com/uob/banana/api.php?out=json`), serving as a Quantum Decryption and Hyperdrive Shield Overcharge mechanism. Furthermore, the application thoroughly explores and documents the four main assignment themes:

1. **Version Control** (Git & GitHub workflow, branching strategy, commit semantics)
2. **Interoperability** (Banana API REST integration, JSON schema contracts, proxy gateways, and resilience fallbacks)
3. **Event-Driven Programming** (DOM input handling, custom event dispatching, frame tick loops, procedural audio triggers)
4. **Virtual Identity** (Secure user authentication, BCrypt password hashing, session tokens, pilot dossiers, military rank progression)

---

## 2. Architecture & File Structure

```text
Galaxy Defender - Space Shooter Game/
├── index.html          # Main application interface, HUD, canvas viewport & modal dialogs
├── login.html          # Pilot authentication portal with demo quick-fill credentials
├── register.html       # Pilot commission portal with avatar selector & fighter specialization
├── css/
│   └── style.css       # Cyberpunk glassmorphism design system & responsive layout
├── js/
│   ├── api.js          # Interoperability engine (Banana API + Auth + Telemetry + Dual-Mode)
│   ├── player.js       # Player spacecraft physics, weapon tiers, regenerating shield & vector rendering
│   ├── enemies.js      # AI enemy hierarchies, Mothership Sector Boss with phases, power-up drops
│   └── game.js         # Core game loop, event bus, particle explosions, Web Audio API synthesizer
├── api/
│   └── api.php         # Enterprise PHP backend (XAMPP PDO MySQL bridge & CORS proxy)
├── database.sql        # MySQL relational schema (users, scores, game_history, banana_api_logs)
├── README.md           # Comprehensive project report & deployment instructions
└── references.md       # External citations, API documentation references & AI disclosures
```

---

## 3. The Four Main Assignment Themes

### Theme 1: Version Control (Git & GitHub)

Development follows industry standard Git and GitHub version control practices:
- **Repository Organization:** Isolated branch topology separating experimental feature developments (`feature/banana-api-gateway`, `feature/virtual-identity`, `feature/audio-synth`) from production-ready code on the `main` branch.
- **Commit Semantics:** Adheres to Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`), ensuring a legible, auditable chronological history.
- **Maintainability & Collaboration:** Clean modular separation of concerns between presentation (`index.html`, `style.css`), business logic (`js/`), backend services (`api/api.php`), and data schemas (`database.sql`).

### Theme 2: Interoperability (Marc Conrad's Banana API)

Interoperability is demonstrated through a multi-tier client/server communication architecture:
- **Endpoint:** `https://marcconrad.com/uob/banana/api.php?out=json`
- **Request Format:** HTTP GET with query parameter `out=json`
- **Payload Schema:**
  ```json
  {
    "question": "https://www.sanfoh.com/uob/banana/data/tc...png",
    "solution": 8
  }
  ```
- **In-Game Role:** 
  Integrated as the **Quantum Banana Decryption Matrix**. When a player clears a sector boss, collects a rare in-flight Banana Core, or clicks the top HUD button, the game pauses and prompts the pilot to solve the visual equation. A successful solve restores shields to 100%, awards a Banana Mega Bomb, and grants 1,500 bonus points.
- **CORS & Resilience Gateway (`api/api.php`):**
  Because direct browser calls to external HTTP/HTTPS endpoints can trigger Cross-Origin Resource Sharing (CORS) blocks or mixed-content warnings, `api/api.php?action=banana` provides a robust server-side proxy. If external university servers experience network timeouts, the game seamlessly activates an internal **Procedural Neural Fallback Engine** (`generateProceduralBananaPuzzle()`), ensuring zero downtime or player disruption.

### Theme 3: Event-Driven Programming

The architecture relies entirely on an asynchronous, event-driven reactive paradigm:
- **Input Events:** Asynchronous DOM event listeners (`keydown`, `keyup`, `mousemove`, `touchstart`, `touchmove`, `touchend`) translate hardware inputs into real-time directional vectors and firing commands.
- **Game Loop State Machine:** Driven by the browser's hardware-synchronized `window.requestAnimationFrame()` cycle (~60 FPS), dispatching frame-tick updates to entities, physics engines, and particle renderers.
- **Observer / EventBus Model:** Custom decoupled events (e.g., `virtual_identity_changed`, `player_hit`, `boss_defeated`, `banana_challenge_triggered`) notify distinct UI subsystems without tight coupling.
- **Web Audio API Event Triggers:** Synthesizes sound events (lasers, explosions, shield impacts, victory fanfares) procedurally on the fly with zero external audio file dependencies.

### Theme 4: Virtual Identity

The software implements a complete Virtual Identity framework:
- **User Authentication:** Registered pilots possess a unique callsign, encrypted password hash (`password_hash($pass, PASSWORD_BCRYPT)`), email, avatar, and ship class specialization.
- **Session Persistence:** State is managed through secure tokens and client-side `localStorage` synchronization with server-side validation.
- **Military Rank Progression:** Player identity dynamically evolves as career score accumulates:
  - `Cadet` (0 – 4,999 pts)
  - `Ensign` (5,000 – 14,999 pts)
  - `Lieutenant` (15,000 – 29,999 pts)
  - `Commander` (30,000 – 49,999 pts)
  - `Fleet Admiral` (50,000+ pts)
- **Guest Mode:** Non-authenticated players can play immediately under a temporary "Guest Vanguard" identity while maintaining session high scores.

---

## 4. Key Gameplay Features

1. **Player Spacecraft Mechanics:** Smooth momentum physics, screen boundary clamping, banking tilts, dynamic thruster flame particles, and invulnerability blinking.
2. **Multi-Tier Weapon Systems:**
   - Level 1: Single Center Blaster
   - Level 2: Dual Twin Lasers
   - Level 3: Plasma Spread (3-way)
   - Level 4: Hyper Photon Spread (5-way barrage)
3. **Regenerative Forcefield Shielding:** Automatic energy shield recovery after 3 seconds without taking damage.
4. **Diverse Enemy AI Hierarchy:**
   - *Scout Drone:* High-speed sinusoidal weaving patroller
   - *Asteroid Debris:* Procedural multi-vertex tumbling rocks that split upon destruction
   - *Crimson Raider:* Targeting vessel firing red laser bolts toward player's coordinates
   - *Void Bomber:* Armored dreadnought launching triple-cluster homing plasma mines
   - *Mothership Dreadnought (Boss):* Multi-phase sector boss with dedicated top-screen health HUD and escalating bullet hell attack patterns.
5. **Procedural Web Audio API Synth:** Zero missing audio files; all sound effects are synthesized mathematically in real-time.

---

## 5. Installation & Deployment Guide

Galaxy Defender is engineered with **Dual-Engine Flexibility**. It can run either directly in any modern browser without any software installation, or inside an enterprise **XAMPP** environment.

### Mode A: Standalone Browser Play (Zero Configuration)
1. Double-click `index.html` or open it in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.
2. The game will automatically detect that no local PHP server is running and switch to the **Standalone Virtual DB Engine** (`localStorage`).
3. All features—including Banana API decryption, leaderboards, registration, login, and combat—work 100% out of the box!

### Mode B: Full Enterprise XAMPP Setup (Apache + PHP + MySQL)
1. Copy the `Galaxy Defender - Space Shooter Game` directory into your XAMPP `htdocs` directory:
   ```text
   C:\xampp\htdocs\galaxy-defender\
   ```
2. Start **Apache** and **MySQL** from the XAMPP Control Panel.
3. Open **phpMyAdmin** in your browser: `http://localhost/phpmyadmin/`.
4. Import `database.sql` to create the `galaxy_defender` database and seed tables.
5. Open `http://localhost/galaxy-defender/` in your web browser.
6. The status pill on the login screen will confirm:  
   `🟢 Live XAMPP MySQL Database Active`.

---

## 6. Pre-Configured Demo Accounts

For grading and assessment, the following pilot profiles are pre-seeded:

| Callsign / Username | Passcode | Rank | Ship Class |
| :--- | :--- | :--- | :--- |
| `shepard` | `Password123!` | Fleet Admiral | Dreadnought |
| `fox` | `Password123!` | Commander | Interceptor |
| `valkyrie` | `Password123!` | Lieutenant | Phantom Recon |

*(A one-click demo button is also available on `login.html`)*.

---

## 7. Testing & Quality Assurance

| Test ID | Module | Scenario / Input | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Input Event | Press `W`, `A`, `S`, `D` & Arrow keys | Spaceship accelerates smoothly with banking tilt | **PASS** |
| **TC-02** | Input Event | Press `Spacebar` | Fires blasters matching current weapon power level | **PASS** |
| **TC-03** | Interoperability | Click "Banana Matrix" or collect core | Fetches puzzle from `marcconrad.com`, renders question | **PASS** |
| **TC-04** | Interoperability | Click correct keypad digit | Awards 1,500 pts, refills shield, awards +1 Bomb | **PASS** |
| **TC-05** | Interoperability | Disconnect internet / block domain | Activates procedural canvas math fallback gracefully | **PASS** |
| **TC-06** | Virtual Identity | Register new pilot on `register.html` | Creates record, updates rank and avatar badge | **PASS** |
| **TC-07** | Virtual Identity | Login with invalid passcode | Displays security error message without crash | **PASS** |
| **TC-08** | Boss Encounter | Survive past wave threshold | Spawns Mothership Dreadnought with Boss Health HUD | **PASS** |
| **TC-09** | Mega Bomb | Press `B` key with available bombs | Screen flashes, detonates all enemies and clears bullets | **PASS** |

---

## 8. Author & Academic Declaration

This project was conceived, structured, and implemented by **Sagar Thapa** for the **Software for Enterprise** academic module. All external web services, documentation references, and AI tools used during development are formally cited in [`references.md`](references.md).
