import {
  doc, getDoc, setDoc, addDoc, collection,
  query, orderBy, limit, getDocs, Timestamp, updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

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

// ---- Manual duration override on a note (used by the Roadmap duration editor) ----
export async function updateNoteDuration(noteId, minutes) {
  await updateDoc(doc(db, "notes", noteId), { durationMinutes: minutes });
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

// ---- Sessions (login history) ----
export async function addSession() {
  await addDoc(collection(db, "sessions"), { ts: Timestamp.now() });
}

export async function getSessions(max = 10) {
  const q = query(collection(db, "sessions"), orderBy("ts", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---- Time goals (daily commitment per venture, stored in minutes) ----
export async function getTimeGoals() {
  const ref = doc(db, "settings", "timeGoals");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function setTimeGoals(data) {
  const ref = doc(db, "settings", "timeGoals");
  await setDoc(ref, data, { merge: true });
}
