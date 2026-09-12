import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTimeGoals, setTimeGoals } from "./lib/firestoreService";
import { VENTURES, DEFAULT_TIME_GOALS } from "./lib/constants";
import Background from "./Background.jsx";
import "./App.css";

const HOUR_OPTIONS = Array.from({ length: 13 }, (_, i) => i); // 0-12
const MINUTE_OPTIONS = [0, 15, 30, 45];

export default function SettingsPage() {
  const [goals, setGoals] = useState(DEFAULT_TIME_GOALS);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getTimeGoals();
      if (data) setGoals((g) => ({ ...g, ...data }));
      setLoading(false);
    })();
  }, []);

  const updateVenture = (id, field, value) => {
    setGoals((g) => {
      const total = g[id] || 0;
      const hours = Math.floor(total / 60);
      const minutes = total % 60;
      const next = field === "hours" ? value * 60 + minutes : hours * 60 + value;
      return { ...g, [id]: next };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    await setTimeGoals(goals);
    setSaved(true);
  };

  if (loading) {
    return <div className="loading-screen">Loading settings…</div>;
  }

  return (
    <div className="ops-deck">
      <Background />
      <div className="wrap">
        <header className="roadmap-page-header">
          <div>
            <Link to="/" className="back-link">&larr; Back to dashboard</Link>
            <h1 className="greeting" style={{ fontSize: 26 }}>TIME GOALS</h1>
            <div className="last-login">Daily time commitment per venture.</div>
          </div>
        </header>

        <section>
          <div className="card roadmap-page-card">
            <div className="settings-list">
              {VENTURES.map((v) => {
                const total = goals[v.id] || 0;
                const hours = Math.floor(total / 60);
                const minutes = total % 60;
                return (
                  <div className="settings-row" key={v.id}>
                    <span className="venture-badge" style={{ "--v-accent": v.accent }}>{v.name}</span>
                    <div className="settings-row-controls">
                      <select value={hours} onChange={(e) => updateVenture(v.id, "hours", Number(e.target.value))}>
                        {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h} hr</option>)}
                      </select>
                      <select value={minutes} onChange={(e) => updateVenture(v.id, "minutes", Number(e.target.value))}>
                        {MINUTE_OPTIONS.map((m) => <option key={m} value={m}>{m} min</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="modal-submit settings-save-btn" onClick={handleSave}>
              {saved ? "Saved" : "Save goals"}
            </button>
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
