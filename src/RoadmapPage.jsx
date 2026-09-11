import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getNotesForVenture } from "./lib/firestoreService";
import { VENTURES } from "./lib/constants";
import { EntryMeta } from "./EntryMeta.jsx";
import Background from "./Background.jsx";
import "./App.css";

export default function RoadmapPage() {
  const { ventureId } = useParams();
  const venture = VENTURES.find((v) => v.id === ventureId);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await getNotesForVenture(ventureId, 200);
      if (!active) return;
      setNotes(data.slice().sort((a, b) => (a.ts?.toMillis?.() || 0) - (b.ts?.toMillis?.() || 0)));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [ventureId]);

  const grouped = {};
  notes.forEach((n) => {
    const d = n.ts?.toDate ? n.ts.toDate() : null;
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });
  const dateKeys = Object.keys(grouped).sort();

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
                  {grouped[key].map((n) => (
                    <div className="roadmap-entry" key={n.id}>
                      <span className="roadmap-entry-time">
                        {n.ts?.toDate ? n.ts.toDate().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                      <div className="roadmap-entry-body">
                        <div className="roadmap-entry-head">
                          <EntryMeta n={n} />
                        </div>
                        <div>{n.text}</div>
                      </div>
                    </div>
                  ))}
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
