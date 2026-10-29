/**
 * ArchitectureModules.jsx — Four CS Themes Footer
 * Displays the four key academic themes with cyber-neon cards.
 */

const THEMES = [
  {
    id: 'vc',
    color: '#00f0ff',
    glow: 'rgba(0,240,255,0.25)',
    label: 'Version Control',
    tag: 'Git · GitHub',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="18" r="3"/>
        <circle cx="6" cy="6" r="3"/>
        <circle cx="18" cy="6" r="3"/>
        <path d="M18 9a9 9 0 01-9 9M6 9a9 9 0 009 9"/>
      </svg>
    ),
    points: [
      'Commits track every code change with author & timestamp',
      'Branches enable safe parallel development workflows',
      'Pull requests enforce peer review before merge',
      '6 semantic commits document full project evolution',
    ],
  },
  {
    id: 'io',
    color: '#ffb703',
    glow: 'rgba(255,183,3,0.22)',
    label: 'Interoperability',
    tag: 'Banana API · REST · SQLite',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M6 9l3 3-3 3M11 15h6"/>
      </svg>
    ),
    points: [
      'Banana API REST calls provide live math challenges in-game',
      'Express proxy bridges frontend ↔ backend seamlessly',
      'SQLite stores scores, sessions & API logs cross-platform',
      'JSON data contracts enable language-agnostic exchange',
    ],
  },
  {
    id: 'ed',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.22)',
    label: 'Event-Driven',
    tag: 'DOM Events · CustomEvent · RAF',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    points: [
      'requestAnimationFrame drives a 60 FPS physics loop',
      'CustomEvent("virtual_identity_changed") updates pilot HUD',
      'Keyboard / mouse / touch events wire separate input channels',
      'EventBus pattern decouples game subsystems cleanly',
    ],
  },
  {
    id: 'vi',
    color: '#00f59b',
    glow: 'rgba(0,245,155,0.22)',
    label: 'Virtual Identity',
    tag: 'Auth · Sessions · SHA-256',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <path d="M16 11s1 1 1 3-1 3-1 3M8 11s-1 1-1 3 1 3 1 3"/>
      </svg>
    ),
    points: [
      'SHA-256 password hashing prevents plaintext credential storage',
      'HttpOnly session cookies persist authenticated pilot state',
      'Guest vs. commissioned pilot paths with graceful fallback',
      'Pilot dossier: callsign, rank, ship class, avatar & score history',
    ],
  },
];

export default function ArchitectureModules() {
  return (
    <section className="arch-section" aria-label="Assignment themes">
      <div className="arch-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
        <span>Core CS Themes</span>
      </div>

      <div className="arch-grid">
        {THEMES.map(theme => (
          <article
            key={theme.id}
            className="theme-card"
            style={{ '--tc-color': theme.color, '--tc-glow': theme.glow }}
          >
            <div className="tc-icon" aria-hidden="true" style={{ color: theme.color }}>
              {theme.icon}
            </div>
            <div className="tc-title">{theme.label}</div>
            <div className="tc-tag">{theme.tag}</div>
            <ul className="tc-list">
              {theme.points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

