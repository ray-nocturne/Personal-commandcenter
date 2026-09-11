import {
  doc, getDoc, setDoc, addDoc, collection,
  query, orderBy, limit, getDocs, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ---- Daily blocks (one doc per date, e.g. "2026-09-10") ----
export async function getDailyBlocks(dateKey) {
  const ref = doc(db, "dailyBlocks", dateKey);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

export async function setDailyBlocks(dateKey, data) {
  const ref = doc(db, "dailyBlocks", dateKey);
  await setDoc(ref, data, { merge: true });
}

export async function getWeeklyBlocks(dateKeys) {
  const results = {};
  for (const key of dateKeys) {
    results[key] = await getDailyBlocks(key);
  }
  return results;
}

// ---- Notes (one collection, each doc tagged with ventureId) ----
export async function addNote(ventureId, extra, text) {
  await addDoc(collection(db, "notes"), {
    ventureId,
    ...extra,
    text,
    ts: Timestamp.now(),
  });
}

export async function getNotesForVenture(ventureId, max = 3) {
  const q = query(
    collection(db, "notes"),
    orderBy("ts", "desc"),
    limit(200)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((n) => n.ventureId === ventureId)
    .slice(0, max);
}

export async function getAllNotes(max = 300) {
  const q = query(collection(db, "notes"), orderBy("ts", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---- Locations ----
export async function addLocation(entry) {
  await addDoc(collection(db, "locations"), {
    ...entry,
    ts: Timestamp.now(),
  });
}

export async function getLocations(max = 30) {
  const q = query(collection(db, "locations"), orderBy("ts", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTodayLocation(dateKey) {
  const locs = await getLocations(30);
  return locs.find((l) => l.ts?.toDate().toISOString().slice(0, 10) === dateKey) || null;
}

// ---- Sessions (login history) ----
export async function addSession() {
  await addDoc(collection(db, "sessions"), { ts: Timestamp.now() });
}

export async function getSessions(max = 10) {
  const q = query(collection(db, "sessions"), orderBy("ts", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
