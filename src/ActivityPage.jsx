import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllNotes } from "./lib/firestoreService";
import { VENTURES } from "./lib/constants";
import { EntryMeta } from "./EntryMeta.jsx";
import Background from "./Background.jsx";
import "./App.css";

export default function ActivityPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotes(await getAllNotes(1000));
      setLoading(false);
    })();
  }, []);

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
            <h1 className="greeting" style={{ fontSize: 26 }}>ACTIVITY LOG</h1>
          </div>
        </header>

        <section>
          <div className="card roadmap-page-card">
            {loading ? (
              <div className="log-empty">Loading history...</div>
            ) : dateKeys.length === 0 ? (
              <div className="log-empty">No activity logged yet.</div>
            ) : (
              dateKeys.map((key) => (
                <div className="roadmap-date-group" key={key}>
                  <p className="roadmap-date-header">
                    {new Date(key + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  {grouped[key].map((n) => {
                    const venture = VENTURES.find((v) => v.id === n.ventureId);
                    return (
                      <div className="roadmap-entry" key={n.id}>
                        <span className="roadmap-entry-time">
                          {n.ts?.toDate ? n.ts.toDate().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                        <div className="roadmap-entry-body">
                          <div className="roadmap-entry-head">
                            <span className="a-venture">{venture?.name}</span>
                            <EntryMeta n={n} />
                          </div>
                          <div>{n.text}</div>
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
