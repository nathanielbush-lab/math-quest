import { LEVEL_NAMES, type MasteryLevel } from "./engine/state";

export const LEVEL_COLORS = ["var(--lv0)", "var(--lv1)", "var(--lv2)", "var(--lv3)", "var(--lv4)"];

export function LevelBadge({ level }: { level: MasteryLevel }) {
  return <span className="badge-level" style={{ background: LEVEL_COLORS[level], color: level === 0 ? "var(--ink)" : "#fff" }}>{LEVEL_NAMES[level]}</span>;
}

export function LevelBar({ counts, total }: { counts: number[]; total: number }) {
  return (
    <div className="levelbar" aria-label="progress by level">
      {[4, 3, 2, 1].map((l) => (counts[l] ? <div key={l} style={{ width: `${(counts[l] / total) * 100}%`, background: LEVEL_COLORS[l] }} title={`${LEVEL_NAMES[l]}: ${counts[l]}`} /> : null))}
    </div>
  );
}

export function LevelLegend() {
  return (
    <div className="row small muted">
      {[1, 2, 3, 4].map((l) => (
        <span key={l} className="row" style={{ gap: 4 }}><span className="lv-dot" style={{ background: LEVEL_COLORS[l] }} />{LEVEL_NAMES[l]}</span>
      ))}
    </div>
  );
}

export function fmtDate(d?: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
