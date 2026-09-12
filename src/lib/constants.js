export const BLOCKS = [
  { id: "webco",      time: "05:00–12:00", name: "Web Company",   hours: "6 HRS", start: 5*60,  end: 12*60, color: "#4FE0FF" },
  { id: "vilacation", time: "13:00–17:00", name: "Vilacation",    hours: "4 HRS", start: 13*60, end: 17*60, color: "#FF7E6B" },
  { id: "diamante",   time: "17:00–21:00", name: "Diamante",      hours: "4 HRS", start: 17*60, end: 21*60, color: "#B18CFF" },
  { id: "pocket",     time: "21:00–23:00", name: "Pocket Master", hours: "2 HRS", start: 21*60, end: 23*60, color: "#6EE7A0" },
];

export const ROLE_COLORS = {
  Io: "#4FE0FF", Invoker: "#B18CFF", Axe: "#FF6B6B", KOTL: "#FFD166",
  BH: "#6EE7A0", Pudge: "#FF7EB6", Alchemist: "#C7ED6B", Tinker: "#FFA35C",
};

export const TAGS = ["IDEA", "EXECUTING", "RESULT", "UPDATE"];

export const TAG_COLORS = {
  IDEA: "#B18CFF",
  EXECUTING: "#FFA35C",
  RESULT: "#6EE7A0",
  UPDATE: "#4FE0FF",
};

export const DIVISIONS = [
  "Operational & Finance",
  "Acquisition",
  "Tech & Product",
  "Digital Marketing",
  "Sales & Business Development",
];

export const TEAM_MEMBERS = {
  "Operational & Finance": ["Dimas", "Ivana"],
  "Acquisition": ["Aji", "Putri"],
  "Tech & Product": ["Fitrul"],
  "Digital Marketing": ["Ekoy", "Asky"],
  "Sales & Business Development": ["Alena", "Zefa"],
};

export const DIVISION_COLORS = {
  "Operational & Finance": "#4FE0FF",
  "Acquisition": "#B18CFF",
  "Tech & Product": "#6EE7A0",
  "Digital Marketing": "#FFA35C",
  "Sales & Business Development": "#FF7EB6",
};

export const VENTURES = [
  {
    id: "webco", name: "Ray - Company Web", pct: "50%",
    goal: "Company-profile website service — fastest cash flow source.",
    roles: ["Io", "Invoker", "Axe", "KOTL", "BH"],
    accent: "#4FE0FF",
  },
  {
    id: "diamante", name: "Ray - Diamante", pct: "35%",
    goal: "PPOB/top-up whitelabel — core problem: exposure, not the product.",
    roles: ["Io", "BH", "Pudge", "Axe"],
    accent: "#B18CFF",
  },
  {
    id: "pocket", name: "Ray - Pocketmaster", pct: "15%",
    goal: "Finish the commercial scheme — freemium, Stripe, Supabase Auth.",
    roles: ["Io", "Alchemist", "Tinker"],
    accent: "#6EE7A0",
  },
  {
    id: "vilacation", name: "Vilacation", pct: "FIXED",
    goal: "196 listings live, stuck with an investor & partner without clear direction.",
    roles: [],
    accent: "#FF7E6B",
  },
];

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
export function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
export function greetingText() {
  const h = new Date().getHours();
  if (h < 11) return "Good morning, Ray.";
  if (h < 15) return "Good afternoon, Ray.";
  if (h < 19) return "Good evening, Ray.";
  return "Good night, Ray.";
}
export function fmtFull(date) {
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) +
    " · " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
export function fmtTime(date) {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" }) +
    " · " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
export function fmtDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
export function fmtTimeOnly(date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// Finds the location that was active at a given moment: the most recent
// location check-in whose timestamp is at or before that moment.
// `locations` must already be sorted newest-first (desc by ts).
export function locationAtTime(locations, date) {
  if (!date) return null;
  const targetMs = date.getTime();
  for (const loc of locations) {
    const locMs = loc.ts?.toMillis ? loc.ts.toMillis() : loc.ts?.toDate?.()?.getTime();
    if (locMs && locMs <= targetMs) return loc;
  }
  return null;
}

// Defaults mirror the original fixed schedule (in minutes), editable via Settings.
export const DEFAULT_TIME_GOALS = { webco: 360, vilacation: 240, diamante: 240, pocket: 120 };
