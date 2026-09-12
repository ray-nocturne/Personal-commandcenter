import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllNotes, updateNoteDuration } from "./lib/firestoreService";
import { VENTURES } from "./lib/constants";
import { computeAutoDurations, effectiveDuration, fmtDuration } from "./lib/timeTracking.js";
import { EntryMeta } from "./EntryMeta.jsx";
import Background from "./Background.jsx";
import "./App.css";

const DURATION_HOURS = Array.from({ length: 9 }, (_, i) => i); // 0-8
const DURATION_MINUTES = [0, 15, 30, 45];

export default function RoadmapPage() {
  const { ventureId } = useParams();
  const venture = VENTURES.find((v) => v.id === ventureId);
  const [notes, setNotes] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      // Fetch ALL notes across every venture so durations reflect the real
      // gap to the next activity, even when that next activity is logged
      // under a different venture.
      const all = await getAllNotes(1000);
      const asc = all.slice().sort((a, b) => (a.ts?.toMillis?.() || 0) - (b.ts?.toMillis?.() || 0));
      const withDurations = computeAutoDurations(asc);
      if (!active) return;
      const filtered = withDurations.filter((n) => n.ventureId === ventureId);
      setNotes(filtered);
      const initialDrafts = {};
      filtered.forEach((n) => {
        const mins = effectiveDuration(n) || 0;
        initialDrafts[n.id] = { hours: Math.floor(mins / 60), minutes: mins % 60 };
      });
      setDrafts(initialDrafts);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [ventureId]);

  const handleDraftChange = (noteId, field, value) => {
    setDrafts((d) => ({ ...d, [noteId]: { ...d[noteId], [field]: value } }));
  };

  const handleSaveDuration = async (noteId) => {
    const draft = drafts[noteId];
    if (!draft) return;
    const total = draft.hours * 60 + draft.minutes;
    await updateNoteDuration(noteId, total);
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, durationMinutes: total } : n)));
  };

  const grouped = {};
  notes.forEach((n) => {
    const d = n.ts?.toDate ? n.ts.toDate() : null;
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });
  const dateKeys = Object.keys(grouped).sort().reverse();

  return (
    <div className="ops-deck">
      <Background />
      <div className="wrap">
        <header className="roadmap-page-header">
          <div>
            <Link to="/" className="back-link">&larr; Back to dashboard</Link>
            <h1 className="greeting" style={{ fontSize: 26 }}>ROADMAP</h1>
            <span className="venture-badge" style={{ "--v-accent": venture?.accent }}>{venture?.name || ventureId}</span>
            {venture?.goal && <div className="last-login" style={{ marginTop: 10 }}>{venture.goal}</div>}
          </div>
        </header>

        <section>
          <div className="card roadmap-page-card" style={{ "--v-accent": venture?.accent }}>
            {loading ? (
              <div className="log-empty">Loading history...</div>
            ) : dateKeys.length === 0 ? (
              <div className="log-empty">No history logged yet for this venture.</div>
            ) : (
              dateKeys.map((key) => (
                <div className="roadmap-date-group" key={key}>
                  <p className="roadmap-date-header">
                    {new Date(key + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  {grouped[key].slice().reverse().map((n) => {
                    const isRunning = effectiveDuration(n) == null;
                    const draft = drafts[n.id] || { hours: 0, minutes: 0 };
                    return (
                      <div className="roadmap-entry" key={n.id}>
                        <span className="roadmap-entry-time">
                          {n.ts?.toDate ? n.ts.toDate().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                        <div className="roadmap-entry-body">
                          <div className="roadmap-entry-head">
                            <EntryMeta n={n} />
                          </div>
                          <div>{n.text}</div>
                          <div className="duration-editor">
                            {isRunning && <span className="duration-running">Still running · </span>}
                            <select
                              value={draft.hours}
                              onChange={(e) => handleDraftChange(n.id, "hours", Number(e.target.value))}
                            >
                              {DURATION_HOURS.map((h) => <option key={h} value={h}>{h} hr</option>)}
                            </select>
                            <select
                              value={draft.minutes}
                              onChange={(e) => handleDraftChange(n.id, "minutes", Number(e.target.value))}
                            >
                              {DURATION_MINUTES.map((m) => <option key={m} value={m}>{m} min</option>)}
                            </select>
                            <button className="duration-save-btn" onClick={() => handleSaveDuration(n.id)}>Save</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <footer>
        <div className="footer-brand">RAY<span>.OS</span> — v1.0</div>
        <div className="footer-status"><span className="dot" />SYSTEM ONLINE · SAVED TO FIRESTORE</div>
      </footer>
    </div>
  );
}
