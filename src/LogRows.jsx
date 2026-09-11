import { fmtDate, fmtTimeOnly } from "./lib/constants";
import { EntryMeta } from "./EntryMeta.jsx";

export function SessionRow({ date, isCurrent, loc }) {
  return (
    <li className={"session-row" + (isCurrent ? " current" : "")}>
      <div className="row-when">
        <div className="row-line1"><span className="row-date">{date ? fmtDate(date) : ""}</span></div>
        <div className="row-time">{date ? fmtTimeOnly(date) : ""}</div>
        <div className="row-line3">
          {loc?.buildingType && <span className="outline-badge">{loc.buildingType}</span>}
        </div>
      </div>
      <div className="row-where">
        <div className="row-line1">
          {loc && <span className="session-loc-pill">{loc.place}</span>}
        </div>
        {loc && <span className="session-loc-coords">{loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}</span>}
      </div>
    </li>
  );
}

export function ActivityRow({ date, venture, n }) {
  return (
    <li className="activity-row">
      <div className="row-when">
        <div className="row-line1"><span className="row-date">{date ? fmtDate(date) : ""}</span></div>
        <div className="row-time">{date ? fmtTimeOnly(date) : ""}</div>
        <div className="row-line3">
          {venture && (
            <span className="outline-badge" style={{ "--outline-color": venture.accent }}>
              {venture.name}
            </span>
          )}
        </div>
      </div>
      <div className="row-what">
        <div className="row-line1"><div className="activity-meta"><EntryMeta n={n} /></div></div>
        <div className="activity-text">{n.text}</div>
      </div>
    </li>
  );
}
