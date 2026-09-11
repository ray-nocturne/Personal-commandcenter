import { ROLE_COLORS, TAG_COLORS, DIVISION_COLORS } from "./lib/constants";

export function EntryMeta({ n }) {
  if (n.division) {
    return (
      <>
        {n.teamMember && <span className="role-label" style={{ color: DIVISION_COLORS[n.division] || "#4FE0FF" }}>{n.teamMember}</span>}
        <span className="tag-badge" style={{ "--tag-badge-color": DIVISION_COLORS[n.division] || "#4FE0FF" }}>{n.division}</span>
      </>
    );
  }
  return (
    <>
      {n.role && <span className="role-label" style={{ color: ROLE_COLORS[n.role] || "#4FE0FF" }}>{n.role}</span>}
      {n.tag && <span className="tag-badge" style={{ "--tag-badge-color": TAG_COLORS[n.tag] || "#4FE0FF" }}>{n.tag}</span>}
    </>
  );
}
