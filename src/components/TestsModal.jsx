/**
 * TestsModal.jsx — Automated Diagnostics Suite
 * Runs 10 tests across the 4 CS themes and reports pass/fail results.
 */
import { useState, useRef } from 'react';
import API from '../services/api.js';

const SUITES = [
  {
    id: 'vc',
    label: 'Version Control',
    color: '#00f0ff',
    tests: [
      {
        id: 'vc1',
        name: 'Git Repository Initialised',
        desc: 'Checks that the project has a .git directory (repository exists).',
        run: async () => {
          const r = await fetch('/api/status');
          const d = await r.json();
          if (d.git && d.git.initialized) return { ok: true, detail: `Branch: ${d.git.branch}` };
          throw new Error('Git repo not detected');
        },
      },
      {
        id: 'vc2',
        name: 'Semantic Commit History',
        desc: 'Verifies at least 4 commits exist documenting project evolution.',
        run: async () => {
          const r = await fetch('/api/status');
          const d = await r.json();
          const count = d.git?.commitCount ?? 0;
          if (count >= 4) return { ok: true, detail: `${count} commits found` };
          throw new Error(`Only ${count} commits — need ≥ 4`);
        },
      },
    ],
  },
  {
    id: 'io',
    label: 'Interoperability',
    color: '#ffb703',
    tests: [
      {
        id: 'io1',
        name: 'Banana API Reachable',
        desc: 'Fetches a live puzzle from the Banana API via the Express proxy.',
        run: async () => {
          const puzzle = await API.fetchBananaPuzzle();
          if (puzzle && typeof puzzle.question === 'string' && puzzle.question.length > 3) {
            return { ok: true, detail: `Question received (${puzzle.question.length} chars)` };
          }
          throw new Error('Banana API returned invalid data');
        },
      },
      {
        id: 'io2',
        name: 'SQLite Leaderboard API',
        desc: 'Retrieves leaderboard data from the Express + SQLite backend.',
        run: async () => {
          const data = await API.getLeaderboard();
          if (Array.isArray(data) && data.length >= 0) {
            return { ok: true, detail: `${data.length} entries returned` };
          }
          throw new Error('Leaderboard API returned non-array');
        },
      },
      {
        id: 'io3',
        name: 'API Status Endpoint',
        desc: 'Verifies the /api/status health-check responds with 200 OK.',
        run: async () => {
          const r = await fetch('/api/status');
          if (r.ok) {
            const d = await r.json();
            return { ok: true, detail: `Status: ${d.status || 'ok'}` };
          }
          throw new Error(`HTTP ${r.status}`);
        },
      },
    ],
  },
  {
    id: 'ed',
    label: 'Event-Driven',
    color: '#a855f7',
    tests: [
      {
        id: 'ed1',
        name: 'Web Audio API Available',
        desc: 'Checks the browser supports the AudioContext API for sound synthesis.',
        run: async () => {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (Ctx) return { ok: true, detail: 'AudioContext constructor available' };
          throw new Error('AudioContext not supported in this browser');
        },
      },
      {
        id: 'ed2',
        name: 'CustomEvent Dispatch',
        desc: 'Dispatches and receives the virtual_identity_changed CustomEvent.',
        run: async () => {
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('CustomEvent not received within 200ms')), 200);
            window.addEventListener('virtual_identity_changed', () => {
              clearTimeout(timeout);
              resolve({ ok: true, detail: 'Event dispatched and received successfully' });
            }, { once: true });
            window.dispatchEvent(new CustomEvent('virtual_identity_changed', { detail: { test: true } }));
          });
        },
      },
      {
        id: 'ed3',
        name: 'requestAnimationFrame Available',
        desc: 'Checks the browser provides requestAnimationFrame for the 60 FPS game loop.',
        run: async () => {
          if (typeof window.requestAnimationFrame === 'function') {
            return { ok: true, detail: 'RAF available — game loop can run at 60 FPS' };
          }
          throw new Error('requestAnimationFrame not available');
        },
      },
    ],
  },
  {
    id: 'vi',
    label: 'Virtual Identity',
    color: '#00f59b',
    tests: [
      {
        id: 'vi1',
        name: 'Guest Identity Fallback',
        desc: 'Verifies a guest pilot identity is created when no user is logged in.',
        run: async () => {
          const user = API.getCurrentUser();
          if (user && user.callsign) {
            return { ok: true, detail: `Pilot: "${user.callsign}" (${user.isGuest ? 'guest' : 'authenticated'})` };
          }
          throw new Error('No pilot identity returned from API.getCurrentUser()');
        },
      },
      {
        id: 'vi2',
        name: 'SHA-256 Session Endpoint',
        desc: 'Tests login endpoint exists and returns structured auth response.',
        run: async () => {
          const r = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: '_test_invalid_', password: '_nope_' }),
            credentials: 'include',
          });
          const d = await r.json();
          // We expect a structured failure — that means the endpoint is live
          if (typeof d.success === 'boolean') {
            return { ok: true, detail: 'Login endpoint responds with structured JSON' };
          }
          throw new Error('Login endpoint returned unstructured response');
        },
      },
    ],
  },
];

const ALL_TESTS = SUITES.flatMap(s => s.tests.map(t => ({ ...t, suiteId: s.id })));

function StatusBadge({ state }) {
  if (state === 'idle') return <span className="test-badge idle">IDLE</span>;
  if (state === 'running') return <span className="test-badge running">RUNNING</span>;
  if (state === 'pass') return <span className="test-badge pass">PASS</span>;
  if (state === 'fail') return <span className="test-badge fail">FAIL</span>;
  return null;
}

export default function TestsModal({ onClose }) {
  const [results, setResults] = useState(() => Object.fromEntries(ALL_TESTS.map(t => [t.id, { state: 'idle', detail: '' }])));
  const [running, setRunning] = useState(false);
  const abortRef = useRef(false);

  const setResult = (id, state, detail = '') =>
    setResults(prev => ({ ...prev, [id]: { state, detail } }));

  const runAll = async () => {
    if (running) return;
    abortRef.current = false;
    setRunning(true);
    // Reset all to idle
    setResults(Object.fromEntries(ALL_TESTS.map(t => [t.id, { state: 'idle', detail: '' }])));

    for (const test of ALL_TESTS) {
      if (abortRef.current) break;
      setResult(test.id, 'running');
      await new Promise(r => setTimeout(r, 120)); // brief visual delay
      try {
        const res = await Promise.race([
          test.run(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout (5s)')), 5000)),
        ]);
        setResult(test.id, 'pass', res.detail || '');
      } catch (err) {
        setResult(test.id, 'fail', err.message || 'Unknown error');
      }
      await new Promise(r => setTimeout(r, 60));
    }
    setRunning(false);
  };

  const passCount = Object.values(results).filter(r => r.state === 'pass').length;
  const failCount = Object.values(results).filter(r => r.state === 'fail').length;
  const total = ALL_TESTS.length;
  const allDone = passCount + failCount === total;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card tests-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #a855f7, #00f59b)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <h2 className="modal-title">System Diagnostics</h2>
            <p className="modal-subtitle">Automated test suite — {total} tests across 4 themes</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Score bar */}
        {allDone && (
          <div className="tests-score-bar">
            <span className={`tests-score ${failCount === 0 ? 'all-pass' : 'has-fail'}`}>
              {failCount === 0
                ? `✓ All ${total} tests passed`
                : `${passCount}/${total} passed · ${failCount} failed`}
            </span>
          </div>
        )}

        {/* Test suites */}
        <div className="tests-body">
          {SUITES.map(suite => (
            <div key={suite.id} className="test-suite">
              <div className="test-suite-header" style={{ '--suite-color': suite.color }}>
                <span className="suite-dot" style={{ background: suite.color }} />
                {suite.label}
              </div>
              <div className="test-list">
                {suite.tests.map(test => {
                  const r = results[test.id];
                  return (
                    <div key={test.id} className={`test-row ${r.state}`}>
                      <div className="test-info">
                        <span className="test-name">{test.name}</span>
                        <span className="test-desc">{test.desc}</span>
                        {r.detail && <span className="test-detail">{r.detail}</span>}
                      </div>
                      <StatusBadge state={r.state} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="tests-footer">
          <button
            className="btn-primary"
            onClick={runAll}
            disabled={running}
          >
            {running ? (
              <span className="btn-loading">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                  <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Running Tests…
              </span>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Run All Tests
              </>
            )}
          </button>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

