# 10-Minute Video Presentation Script & Transcript

> **Unit Code & Title:** CIS046-3 Software For Enterprise  
> **Assignment:** 1 — Artifact Submission (Video Based on Code)  
> **Student Name:** Sagar Thapa  
> **Project Title:** Galaxy Defender — Space Shooter Game  
> **Duration:** 10:00 Minutes Maximum  
> **Core Themes Addressed:** Version Control, Interoperability, Event-Driven Programming, Virtual Identity

---

## Video Recording Checklist Before You Begin
1. **Screen Resolution:** Recommended 1080p (1920×1080) or 720p (1280×720) on your laptop.
2. **Audio:** Use your own natural voice (as strictly required by the brief: *"Your video must have your own voice"*).
3. **Open Tabs in Browser:**
   - Tab 1: `index.html` (Running game with Fullscreen capability)
   - Tab 2: `tests.html` (Automated Test Suite showing 10/10 PASS)
   - Tab 3: `login.html` & `register.html` (Virtual Identity portals)
   - Tab 4: Terminal / VS Code open showing `git log --graph --oneline` and `api/api.php`

---

## Detailed Minute-by-Minute Script

### Minute 0:00 – 01:30 | Introduction & Live System Demonstration
- **Screen to Show:** Browser on `index.html`.
- **What to Say:**
  > *"Hello, my name is Sagar Thapa, and this is my presentation for CIS046-3 Software For Enterprise. Today, I am demonstrating my project: **Galaxy Defender**, a tactical space combat simulation built to explore and critically evaluate four foundational software engineering paradigms: **Version Control**, **Interoperability**, **Event-Driven Programming**, and **Virtual Identity**."*
- **Action on Screen:**
  - Click **Launch Mission**.
  - Move the starfighter using `W`, `A`, `S`, `D` or arrow keys. Shoot blasters with `Spacebar`.
  - Collect energy power-ups, defeat waves of drones, and trigger a bomb with `B`.
  - Demonstrate clicking the **Banana Matrix** button or encountering a Quantum Banana Core to bring up Dr. Marc Conrad’s Banana puzzle.
  - Solve the puzzle with the keypad to show shield restoration and score boost.
  - Click **Fullscreen [⛶]** in the navbar to show the responsive laptop immersion.

---

### Minute 01:30 – 03:30 | Theme 1: Version Control (Git & GitHub)
- **Screen to Show:** Terminal / Git Bash or VS Code Source Control tab.
- **What to Say:**
  > *"Moving to our first theme: **Version Control**. Throughout this unit, development was managed under industry-standard Git version control. In enterprise systems, version control provides traceability, rollback capabilities, and parallel feature isolation."*
- **Action on Screen:**
  - In terminal, run: `git log --graph --oneline`
  - Show the semantic commit messages:
    - `feat: initialize project architecture, database schema, and documentation (Week 1-2)`
    - `feat(interoperability): implement Marc Conrad Banana API proxy gateway and PDO backend (Week 3)`
    - `feat(engine): implement spacecraft physics, enemy hierarchies, and combat AI (Week 3-4)`
    - `feat(identity): implement pilot authentication, BCrypt hashing, sessions, and cookies (Week 5)`
    - `feat(ui): finalize high-definition laptop UI, event bus, fullscreen mode, and automated test suite`
  - Run `git branch -a` to show the branching strategy (`main`, `feature/banana-api-gateway`, `feature/virtual-identity`).
  - Explain:
    > *"By employing feature branches, experimental integrations—such as external API proxies—were developed in isolation before merging into main via pull requests. We followed Conventional Commits syntax, ensuring a transparent changelog for enterprise auditability."*

---

### Minute 03:30 – 05:30 | Theme 2: Interoperability (Dr. Marc Conrad's Banana API)
- **Screen to Show:** `js/api.js` (lines 50–120) and `api/api.php` (lines 170–225).
- **What to Say:**
  > *"The second theme is **Interoperability**, which is the ability of disparate computer systems and software to exchange and mutually make use of information. In our game, interoperability is demonstrated through live integration with **Dr. Marc Conrad’s external Banana API**."*
- **Action on Screen:**
  - Highlight the API endpoint: `https://marcconrad.com/uob/banana/api.php?out=json`.
  - Explain the multi-tier client/server architecture:
    > *"Direct browser-to-server calls across different origins frequently trigger CORS (Cross-Origin Resource Sharing) restrictions. To solve this, our PHP backend (`api/api.php`) acts as an enterprise gateway and reverse proxy. It makes server-to-server HTTP requests using `stream_context_create()` and relays the JSON payload to the client."*
  - Show the JSON schema contract:
    ```json
    { "question": "https://www.sanfoh.com/uob/banana/data/tc...png", "solution": 8 }
    ```
  - Show the **Offline Procedural Fallback Engine**:
    > *"A core principle of enterprise interoperability is fault tolerance and graceful degradation. If the external university server is down or the player is offline, our system automatically falls back to an internal procedural math cipher generator, ensuring zero gameplay disruption."*

---

### Minute 05:30 – 07:15 | Theme 3: Event-Driven Programming
- **Screen to Show:** `js/game.js` (lines 460–530) and the Web Audio synthesizer section.
- **What to Say:**
  > *"Our third theme is **Event-Driven Programming**. Unlike linear batch architectures, event-driven systems respond asynchronously to user inputs, hardware states, and messaging buses."*
- **Action on Screen:**
  - Point to DOM input listeners:
    > *"We register asynchronous event listeners for `keydown`, `keyup`, `mousemove`, `touchstart`, and `touchmove`. Hardware events are translated into directional velocity vectors and firing commands."*
  - Explain the rendering loop:
    > *"The core simulation loop runs via `window.requestAnimationFrame()`, synchronized with the monitor's refresh rate (~60 FPS). It dispatches delta-time ticks to update particle engines, enemy collision detection, and bullet trajectories."*
  - Point to the decoupled Event Bus (`CustomEvent`):
    > *"We also implemented an Observer pattern using native DOM `CustomEvent`. When a pilot's profile updates or a cipher is solved, the system fires events like `virtual_identity_changed` and `banana_solved`. Decoupled UI components listen and update independently without tight coupling."*
  - Mention Web Audio API:
    > *"Furthermore, sound effects are generated procedurally on the fly using Web Audio API oscillator nodes, triggered strictly by game collision events."*

---

### Minute 07:15 – 08:45 | Theme 4: Virtual Identity & Cookies (Week 5)
- **Screen to Show:** `login.html`, `register.html`, and `api/api.php` (`handleLogin`).
- **What to Say:**
  > *"The fourth theme is **Virtual Identity**, reflecting Week 5 of our unit syllabus covering Authentication, Sessions, and Cookies."*
- **Action on Screen:**
  - Show the pilot registration form with avatar selection and fighter ship class.
  - Open `api/api.php` and highlight `password_hash($password, PASSWORD_BCRYPT)`:
    > *"Security is paramount in enterprise systems. We never store plain-text passwords. Credentials are cryptographically hashed using BCrypt. When a pilot logs in, `password_verify()` validates the hash."*
  - Show the Cookie implementation:
    > *"Upon successful authentication, the server generates a cryptographically secure 64-character hex session token and issues HTTP cookies: `galaxy_pilot_session` and `galaxy_pilot_callsign`. This fulfills the Week 5 curriculum topic on Cookies and persistent state."*
  - Demonstrate military rank progression:
    > *"Virtual identity is not static; it evolves dynamically. As the pilot accumulates combat score across missions, their military rank upgrades from Cadet, to Ensign, Lieutenant, Commander, and Fleet Admiral."*

---

### Minute 08:45 – 09:30 | Automated Testing Harness (Evidence of Testing)
- **Screen to Show:** Browser on `tests.html`.
- **What to Say:**
  > *"As required by the assignment brief, here is our supporting **Evidence of Testing**. We built a dedicated, browser-based automated test harness that validates all four themes in real time."*
- **Action on Screen:**
  - Click **RUN ALL TESTS**.
  - Show all 10 tests passing with green badges:
    - *Test 2.1 & 2.2: Live Banana API endpoint and JSON schema verification.*
    - *Test 2.3: Procedural fallback resilience.*
    - *Test 4.1 & 4.2: Virtual identity authentication and Cookie synchronization.*
    - *Test 4.3: Military rank progression formula.*
    - *Test 3.1 & 3.2: CustomEvent dispatch and Web Audio API synthesizer.*
    - *Test 1.1 & 1.2: 3-tier distributed architecture gateway and modular separation.*

---

### Minute 09:30 – 10:00 | Conclusion & Alignment with Learning Outcomes
- **Screen to Show:** Back to `index.html` showing the 4 academic theme cards in the footer.
- **What to Say:**
  > *"In summary, Galaxy Defender successfully satisfies both Unit Learning Outcomes: differentiating and applying industry-standard version control and modularity (LO1), and developing a robust distributed software solution tailored to external REST interoperability, event-driven paradigms, and secure virtual identity (LO2). Thank you for listening."*
- **Action:** End recording cleanly under 10 minutes.
