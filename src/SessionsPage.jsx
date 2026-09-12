import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSessions, getLocations } from "./lib/firestoreService";
import { locationAtTime } from "./lib/constants";
import { SessionRow } from "./LogRows.jsx";
import Background from "./Background.jsx";
import "./App.css";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [sess, locs] = await Promise.all([getSessions(300), getLocations(300)]);
      setSessions(sess);
      setLocations(locs);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="ops-deck">
      <Background />
      <div className="wrap">
        <header className="roadmap-page-header">
          <div>
            <Link to="/" className="back-link">&larr; Back to dashboard</Link>
            <h1 className="greeting" style={{ fontSize: 26 }}>SESSION HISTORY</h1>
          </div>
        </header>

        <section>
          <div className="card roadmap-page-card">
            {loading ? (
              <div className="log-empty">Loading history...</div>
            ) : sessions.length === 0 ? (
              <div className="log-empty">No sessions logged yet.</div>
            ) : (
              <ul className="session-list">
                {sessions.map((s, i) => {
                  const d = s.ts?.toDate ? s.ts.toDate() : null;
                  const loc = locationAtTime(locations, d);
                  return <SessionRow key={s.id || i} date={d} isCurrent={i === 0} loc={loc} />;
                })}
              </ul>
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
