import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Routes, Route, Link } from "react-router-dom";
import RoadmapPage from "./RoadmapPage.jsx";
import SessionsPage from "./SessionsPage.jsx";
import ActivityPage from "./ActivityPage.jsx";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  getDailyBlocks, setDailyBlocks, getWeeklyBlocks,
  addNote, getNotesForVenture, getAllNotes,
  addLocation, getLocations,
  addSession, getSessions,
} from "./lib/firestoreService";
import {
  BLOCKS, ROLE_COLORS, VENTURES, TAGS, TAG_COLORS, DIVISIONS, TEAM_MEMBERS, DIVISION_COLORS,
  todayKey, nowMinutes, greetingText, fmtFull, fmtTime,
} from "./lib/constants";
import { EntryMeta } from "./EntryMeta.jsx";
import { SessionRow, ActivityRow } from "./LogRows.jsx";
import Background from "./Background.jsx";
import LoginPage from "./LoginPage.jsx";
import LocationGate from "./LocationGate.jsx";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";

function currentLiveBlock() {
  const m = nowMinutes();
  return BLOCKS.find((b) => m >= b.start && m < b.end) || null;
}

function Dashboard() {
  const [now, setNow] = useState(new Date());
  const [blockState, setBlockState] = useState({});
  const [weeklyCounts, setWeeklyCounts] = useState({});
  const [ventureNotes, setVentureNotes] = useState({});
  const [allNotes, setAllNotes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [lastLogin, setLastLogin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ place: "", buildingType: "Rumah", lat: "", lng: "" });
  const [noteDrafts, setNoteDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [viewState, setViewState] = useState({ longitude: 110.3695, latitude: -7.7956, zoom: 12 });
  const [vilacationDivision, setVilacationDivision] = useState(DIVISIONS[0]);

  const live = currentLiveBlock();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const loadEverything = useCallback(async () => {
    const today = todayKey();

    const todayBlocks = await getDailyBlocks(today);
    setBlockState(todayBlocks);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    const weekly = await getWeeklyBlocks(days);
    const counts = {};
    BLOCKS.forEach((b) => { counts[b.id] = days.filter((d) => weekly[d]?.[b.id]).length; });
    setWeeklyCounts(counts);

    const notesByVenture = {};
    for (const v of VENTURES) notesByVenture[v.id] = await getNotesForVenture(v.id, 3);
    setVentureNotes(notesByVenture);
    setAllNotes(await getAllNotes());

    const locs = await getLocations(30);
    setLocations(locs);

    const sess = await getSessions(50);
    setLastLogin(sess[0]?.ts?.toDate() || null);
    await addSession();
    setSessions([{ ts: { toDate: () => new Date() } }, ...sess]);

    setLoading(false);
  }, []);

  useEffect(() => { loadEverything(); }, [loadEverything]);

  useEffect(() => {
    if (locations.length === 0) return;
    setViewState((vs) => ({ ...vs, longitude: locations[0].lng, latitude: locations[0].lat, zoom: 14 }));
  }, [locations]);

  const toggleBlock = async (blockId) => {
    const next = { ...blockState, [blockId]: !blockState[blockId] };
    setBlockState(next);
    await setDailyBlocks(todayKey(), next);
    const days = [];
    for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().slice(0, 10)); }
    const weekly = await getWeeklyBlocks(days);
    const counts = {};
    BLOCKS.forEach((b) => { counts[b.id] = days.filter((d) => weekly[d]?.[b.id]).length; });
    setWeeklyCounts(counts);
  };

  const submitNote = async (ventureId, extra, text) => {
    if (!text.trim()) return;
    await addNote(ventureId, extra, text.trim());
    const notesByVenture = { ...ventureNotes };
    notesByVenture[ventureId] = await getNotesForVenture(ventureId, 3);
    setVentureNotes(notesByVenture);
    setAllNotes(await getAllNotes());
    setNoteDrafts((d) => ({ ...d, [ventureId]: "" }));
  };

  const submitLocation = async (e) => {
    e.preventDefault();
    const lat = parseFloat(form.lat), lng = parseFloat(form.lng);
    if (!form.place || isNaN(lat) || isNaN(lng)) return;
    await addLocation({ place: form.place, buildingType: form.buildingType, lat, lng });
    setLocations(await getLocations(30));
    setShowModal(false);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation is not supported in this browser."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })),
      (err) => alert("Failed to get automatic location (" + err.message + "). Please enter it manually.")
    );
  };

  const doneCount = BLOCKS.filter((b) => blockState[b.id]).length;
  const gaugePct = doneCount / BLOCKS.length;
  const circumference = 220;

  const pieData = useMemo(() => {
    return VENTURES.map((v) => ({
      ...v,
      value: allNotes.filter((n) => n.ventureId === v.id).length,
    }));
  }, [allNotes]);
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  const locationByDate = useMemo(() => {
    const map = {};
    locations.forEach((l) => {
      const d = l.ts?.toDate ? l.ts.toDate() : null;
      if (!d) return;
      const key = d.toISOString().slice(0, 10);
      if (!map[key]) map[key] = l; // locations sorted desc by ts, so first = most recent that day
    });
    return map;
  }, [locations]);

  if (loading) {
    return <div className="loading-screen">Booting system…</div>;
  }

  return (
    <div className="ops-deck">
      <Background />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <p className="modal-title">Location Check-in</p>
            <p className="modal-sub">Where are you working from today?</p>
            <form onSubmit={submitLocation}>
              <div className="modal-field">
                <label>LOCATION (PLACE NAME)</label>
                <input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="e.g. Home, Cafe XYZ" required />
              </div>
              <div className="modal-field">
                <label>BUILDING TYPE</label>
                <select value={form.buildingType} onChange={(e) => setForm({ ...form, buildingType: e.target.value })}>
                  <option>Home</option>
                  <option>Cafe/Coworking</option>
                  <option>Client Office</option>
                  <option>Vilacation Site</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>LATITUDE</label>
                  <input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="-7.7956" required />
                </div>
                <div className="modal-field">
                  <label>LONGITUDE</label>
                  <input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="110.3695" required />
                </div>
              </div>
              <button type="button" className="modal-geo-btn" onClick={useCurrentLocation}>Use current location</button>
              <button type="submit" className="modal-submit">Save &amp; Start</button>
            </form>
          </div>
        </div>
      )}

      <div className="wrap">
        <header>
          <div>
            <div className="clock"><span className="status-dot" />{now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()} · {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
            <h1 className="greeting">{greetingText()}</h1>
            <div className="last-login">
              {lastLogin ? <>Last login: <b>{fmtFull(lastLogin)}</b></> : "First login — welcome to the system."}
            </div>
            <div className={"live-badge" + (live ? "" : " off")}>
              <span className="dot" />{live ? `LIVE NOW — ${live.name.toUpperCase()}` : "OFF-HOURS"}
            </div>
          </div>
          <div className="gauge-wrap">
            <div className="hud-ring" />
            <div className="hud-ring rev" />
            <svg width="128" height="128" viewBox="0 0 80 80">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4FE0FF" /><stop offset="100%" stopColor="#B18CFF" />
                </linearGradient>
              </defs>
              <circle className="gauge-track" cx="40" cy="40" r="35" />
              <circle
                className="gauge-fill" cx="40" cy="40" r="35"
                style={{ strokeDashoffset: circumference - gaugePct * circumference }}
              />
            </svg>
            <div className="gauge-label"><span className="num">{doneCount}/{BLOCKS.length}</span><span className="lbl">BLOCKS</span></div>
          </div>
        </header>

        <section>
          <p className="section-title">VENTURE PERFORMANCE</p>
          <div className="stats-row">
            <div className="stat-card"><div className="stat-num">{doneCount}/{BLOCKS.length}</div><div className="stat-label">BLOCKS DONE TODAY</div></div>
            <div className="stat-card"><div className="stat-num">{Object.values(weeklyCounts).reduce((a, b) => a + b, 0)}/{BLOCKS.length * 7}</div><div className="stat-label">BLOCKS DONE THIS WEEK</div></div>
            <div className="stat-card"><div className="stat-num">{allNotes.length}</div><div className="stat-label">TOTAL ACTIVITY LOGS</div></div>
            <div className="stat-card"><div className="stat-num">{sessions.length}</div><div className="stat-label">SESSIONS LOGGED</div></div>
          </div>
          <div className="perf-grid">
            <div className="card">
              <p className="card-title">ACTIVITY DISTRIBUTION (ALL TIME)</p>
              <div className="pie-wrap">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  {pieTotal === 0 ? (
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#152230" strokeWidth="16" />
                  ) : (
                    (() => {
                      let cumulative = 0;
                      const r = 54, cx = 70, cy = 70, circ = 2 * Math.PI * r;
                      return pieData.filter((d) => d.value > 0).map((d) => {
                        const len = (d.value / pieTotal) * circ;
                        const el = (
                          <circle key={d.id} cx={cx} cy={cy} r={r} fill="none" stroke={d.accent} strokeWidth="16"
                            strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-cumulative}
                            transform={`rotate(-90 ${cx} ${cy})`} opacity="0.92" />
                        );
                        cumulative += len;
                        return el;
                      });
                    })()
                  )}
                </svg>
                <ul className="pie-legend">
                  {pieTotal === 0
                    ? <li style={{ color: "#37505F", fontStyle: "italic" }}>No activity logged yet.</li>
                    : pieData.map((d) => (
                      <li key={d.id}><span className="swatch" style={{ background: d.accent }} />{d.name.replace("Ray - ", "")}
                        <span className="pct">{pieTotal ? Math.round((d.value / pieTotal) * 100) : 0}%</span></li>
                    ))}
                </ul>
              </div>
            </div>
            <div className="card">
              <p className="card-title">LAST 7 DAYS CONSISTENCY</p>
              <div className="bar-rows">
                {BLOCKS.map((b) => {
                  const pct = Math.round(((weeklyCounts[b.id] || 0) / 7) * 100);
                  return (
                    <div className="bar-row" key={b.id}>
                      <div className="bar-head"><b>{b.name}</b><span>{weeklyCounts[b.id] || 0}/7 days · {pct}%</span></div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%`, background: b.color, boxShadow: `0 0 8px ${b.color}77` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section>
          <p className="section-title">BLOCKS TODAY</p>
          <div className="blocks">
            {BLOCKS.map((b) => {
              const done = !!blockState[b.id];
              const isLive = live?.id === b.id;
              return (
                <div key={b.id} className={"block" + (done ? " done" : "") + (isLive ? " live" : "")} onClick={() => toggleBlock(b.id)}>
                  <div className="corner tl" /><div className="corner br" />
                  {isLive && <div className="block-live-tag"><span className="dot" />LIVE</div>}
                  <div className="block-time">{b.time}</div>
                  <div className="block-name">{b.name}</div>
                  <div className="block-hours">{b.hours}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <p className="section-title">
            WORK LOCATION <button className="edit-link" onClick={() => setShowModal(true)}>Update location</button>
          </p>
          <div className="map-container">
            <Map
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
              style={{ height: "300px", width: "100%" }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
            >
              <NavigationControl position="top-left" />
              {locations.map((l) => (
                <Marker key={l.id} longitude={l.lng} latitude={l.lat} anchor="center"
                  onClick={(e) => { e.originalEvent.stopPropagation(); setSelectedLoc(l); }}
                >
                  <div className="map-pin" />
                </Marker>
              ))}
              {selectedLoc && (
                <Popup
                  longitude={selectedLoc.lng} latitude={selectedLoc.lat}
                  anchor="bottom" onClose={() => setSelectedLoc(null)} closeOnClick={false}
                >
                  <b>{selectedLoc.place}</b><br />{selectedLoc.buildingType}<br />
                  {selectedLoc.ts?.toDate ? fmtFull(selectedLoc.ts.toDate()) : ""}
                </Popup>
              )}
            </Map>
          </div>
        </section>

        <section>
          <p className="section-title">VENTURE STATUS</p>
          <div className="ventures">
            {VENTURES.map((v) => {
              const draft = noteDrafts[v.id] || "";
              const draftRole = v.roles[0] || "";
              return (
                <div className="venture" key={v.id} style={{ "--v-accent": v.accent }}>
                  <div className="venture-head"><div className="venture-name">{v.name}</div><div className="venture-pct">{v.pct}</div></div>
                  <div className="venture-goal">{v.goal}</div>
                  <Link to={`/roadmap/${v.id}`} className="roadmap-btn">View Historical Roadmap</Link>
                  {v.id === "vilacation" ? (
                    <div className="roles">
                      {DIVISIONS.map((d) => (
                        <span key={d} className="role-tag" style={{ "--tag-color": DIVISION_COLORS[d] || "#4FE0FF" }}>{d}</span>
                      ))}
                    </div>
                  ) : v.roles.length > 0 && (
                    <div className="roles">
                      {v.roles.map((r) => (
                        <span key={r} className="role-tag" style={{ "--tag-color": ROLE_COLORS[r] || "#4FE0FF" }}>{r}</span>
                      ))}
                    </div>
                  )}
                  {v.id === "vilacation" ? (
                    <form className="add-note" onSubmit={(e) => { e.preventDefault(); submitNote(v.id, { division: e.target.division.value, teamMember: e.target.teamMember.value }, draft); }}>
                      <div className="add-note-row">
                        <select name="division" value={vilacationDivision} onChange={(e) => setVilacationDivision(e.target.value)}>
                          {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select name="teamMember" key={vilacationDivision}>
                          {(TEAM_MEMBERS[vilacationDivision] || []).length
                            ? TEAM_MEMBERS[vilacationDivision].map((m) => <option key={m} value={m}>{m}</option>)
                            : <option value="">(no members yet)</option>}
                        </select>
                      </div>
                      <textarea
                        placeholder="Add a note..." value={draft} rows={3}
                        onChange={(e) => setNoteDrafts((d) => ({ ...d, [v.id]: e.target.value }))}
                      />
                      <button type="submit">Add note</button>
                    </form>
                  ) : (
                    <form className="add-note" onSubmit={(e) => { e.preventDefault(); submitNote(v.id, { role: e.target.role.value, tag: e.target.tag.value }, draft); }}>
                      <div className="add-note-row">
                        <select name="role" defaultValue={draftRole}>
                          {v.roles.length ? v.roles.map((r) => <option key={r} value={r}>{r}</option>) : <option value="">Status</option>}
                        </select>
                        <select name="tag" defaultValue="RESULT">
                          {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <textarea
                        placeholder="Add a note..." value={draft} rows={3}
                        onChange={(e) => setNoteDrafts((d) => ({ ...d, [v.id]: e.target.value }))}
                      />
                      <button type="submit">Add note</button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <p className="section-title">SESSION HISTORY &amp; ACTIVITY LOG</p>
          <div className="panel-grid">
            <div className="card">
              <ul className="session-list">
                {sessions.slice(0, 5).map((s, i) => {
                  const d = s.ts?.toDate ? s.ts.toDate() : null;
                  const key = d ? d.toISOString().slice(0, 10) : null;
                  const loc = key ? locationByDate[key] : null;
                  return <SessionRow key={i} date={d} isCurrent={i === 0} loc={loc} />;
                })}
              </ul>
              {sessions.length > 5 && (
                <Link to="/sessions" className="view-all-btn">
                  View all ({sessions.length}) →
                </Link>
              )}
            </div>
            <div className="card">
              <ul className="activity-feed">
                {allNotes.length === 0
                  ? <div className="activity-empty">No activity logged yet.</div>
                  : allNotes.slice(0, 5).map((n) => {
                    const venture = VENTURES.find((v) => v.id === n.ventureId);
                    const d = n.ts?.toDate ? n.ts.toDate() : null;
                    return <ActivityRow key={n.id} date={d} venture={venture} n={n} />;
                  })}
              </ul>
              {allNotes.length > 5 && (
                <Link to="/activity" className="view-all-btn">
                  View all ({allNotes.length}) →
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer>
        <div className="footer-brand">RAY<span>.OS</span> — v1.0</div>
        <div className="footer-status">
          <span className="dot" />SYSTEM ONLINE · SAVED TO FIRESTORE
          <button className="logout-btn" onClick={() => { sessionStorage.removeItem("rayos_checked_in"); signOut(auth); }}>Log out</button>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = checking, null = logged out
  const [checkedIn, setCheckedIn] = useState(() => sessionStorage.getItem("rayos_checked_in") === "1");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleCheckedIn = () => {
    sessionStorage.setItem("rayos_checked_in", "1");
    setCheckedIn(true);
  };

  if (user === undefined) {
    return <div className="loading-screen">Checking session…</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!checkedIn) {
    return <LocationGate onDone={handleCheckedIn} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/roadmap/:ventureId" element={<RoadmapPage />} />
      <Route path="/sessions" element={<SessionsPage />} />
      <Route path="/activity" element={<ActivityPage />} />
    </Routes>
  );
}
