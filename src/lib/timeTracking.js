// Computes per-note "auto" durations from a chronologically ascending list
// of notes (across all ventures, for one day). The last note has no
// duration yet (nothing has closed it out).
export function computeAutoDurations(notesSortedAsc) {
  return notesSortedAsc.map((n, i) => {
    const curMs = n.ts?.toMillis ? n.ts.toMillis() : n.ts?.toDate?.()?.getTime();
    if (i === notesSortedAsc.length - 1) return { ...n, autoDuration: null };
    const next = notesSortedAsc[i + 1];
    const nextMs = next.ts?.toMillis ? next.ts.toMillis() : next.ts?.toDate?.()?.getTime();
    const minutes = curMs && nextMs ? Math.round((nextMs - curMs) / 60000) : null;
    return { ...n, autoDuration: minutes };
  });
}

// A manual override (note.durationMinutes) always wins over the auto-computed gap.
export function effectiveDuration(note) {
  return typeof note.durationMinutes === "number" ? note.durationMinutes : note.autoDuration;
}

export function sumDurationsByVenture(notesWithDurations) {
  const sums = {};
  notesWithDurations.forEach((n) => {
    const mins = effectiveDuration(n);
    if (!mins) return;
    sums[n.ventureId] = (sums[n.ventureId] || 0) + mins;
  });
  return sums;
}

export function fmtDuration(minutes) {
  if (minutes == null) return "Still running";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
