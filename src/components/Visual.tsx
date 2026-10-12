import { useState } from "react";
import type { Visual as V } from "../content/types";
import { MathText } from "./MathText";

const C = { ink: "var(--ink)", ink2: "var(--ink-2)", line: "var(--line)", primary: "var(--primary)", shade: "var(--shade)", shade2: "var(--shade-2)", surface: "var(--surface)", good: "var(--good)", bad: "var(--bad)" };

const fmt = (v: number) => String(Number(v.toFixed(3))).replace("-", "−");

export function Visual({ v }: { v: V }) {
  return <div className="visual">{render(v)}</div>;
}

function render(v: V) {
  switch (v.type) {
    case "numberline":
      return <NumberLine {...v} />;
    case "fractionbars":
      return <FractionBars bars={v.bars} />;
    case "grid":
      return <Grid min={v.min} max={v.max} points={v.points} polygon={v.polygon} lines={v.lines} />;
    case "table":
      return (
        <table>
          {v.caption && <caption>{v.caption}</caption>}
          <thead>
            <tr>{v.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {v.rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j}><MathText text={typeof c === "number" ? fmt(c) : c} /></td>)}</tr>
            ))}
          </tbody>
        </table>
      );
    case "dotplot":
      return <DotPlot {...v} />;
    case "scatter":
      return <Scatter {...v} />;
    case "tape":
      return <Tape rows={v.rows} />;
    case "boxplot":
      return <BoxPlot {...v} />;
    case "shape":
      return <Shape shape={v.shape} labels={v.labels} />;
    case "dicesim":
      return <DiceSim target={v.target} rolls={v.rolls} />;
  }
}

function NumberLine({ min, max, step, labelEvery, points = [], jumps = [] }: Extract<V, { type: "numberline" }>) {
  const W = 600, pad = 30, y = 60;
  const n = Math.round((max - min) / step);
  const every = labelEvery ?? (n > 14 ? 2 : 1);
  const x = (val: number) => pad + ((val - min) / (max - min)) * (W - 2 * pad);
  return (
    <svg viewBox={`0 0 ${W} 100`} width={W} role="img" aria-label="number line">
      <line x1={pad - 12} x2={W - pad + 12} y1={y} y2={y} stroke={C.ink} strokeWidth={2} />
      <polygon points={`${W - pad + 18},${y} ${W - pad + 8},${y - 5} ${W - pad + 8},${y + 5}`} fill={C.ink} />
      <polygon points={`${pad - 18},${y} ${pad - 8},${y - 5} ${pad - 8},${y + 5}`} fill={C.ink} />
      {Array.from({ length: n + 1 }, (_, i) => {
        const val = min + i * step;
        return (
          <g key={i}>
            <line x1={x(val)} x2={x(val)} y1={y - 7} y2={y + 7} stroke={C.ink} strokeWidth={1.5} />
            {i % every === 0 && <text x={x(val)} y={y + 26} textAnchor="middle" fontSize={14} fill={C.ink}>{fmt(val)}</text>}
          </g>
        );
      })}
      {jumps.map((j, i) => {
        const x1 = x(j.from), x2 = x(j.to), mid = (x1 + x2) / 2;
        return (
          <g key={i}>
            <path d={`M ${x1} ${y - 4} Q ${mid} ${y - 50} ${x2} ${y - 6}`} fill="none" stroke={C.shade2} strokeWidth={2.5} />
            {j.label && <text x={mid} y={y - 34} textAnchor="middle" fontSize={14} fontWeight={700} fill={C.ink}>{j.label}</text>}
          </g>
        );
      })}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(p.v)} cy={y} r={7} fill={C.primary} />
          {p.label && <text x={x(p.v)} y={y - 14} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.primary}>{p.label}</text>}
        </g>
      ))}
    </svg>
  );
}

function FractionBars({ bars }: { bars: { parts: number; shaded: number; label?: string }[] }) {
  const W = 480, h = 34, lab = 60;
  return (
    <svg viewBox={`0 0 ${W + lab} ${bars.length * (h + 10)}`} width={W + lab} role="img" aria-label="fraction bars">
      {bars.map((b, i) => (
        <g key={i} transform={`translate(0 ${i * (h + 10)})`}>
          <text x={0} y={h / 2 + 5} fontSize={15} fontWeight={700} fill={C.ink}>{b.label}</text>
          {Array.from({ length: b.parts }, (_, k) => (
            <rect key={k} x={lab + (k * W) / b.parts} y={0} width={W / b.parts} height={h} fill={k < b.shaded ? C.shade : C.surface} stroke={C.ink} strokeWidth={1.5} />
          ))}
        </g>
      ))}
    </svg>
  );
}

export interface GridProps {
  min: number;
  max: number;
  points?: { x: number; y: number; label?: string }[];
  polygon?: { x: number; y: number }[];
  lines?: { m: number; b: number; label?: string }[];
  selected?: { x: number; y: number } | null;
  onPick?: (p: { x: number; y: number }) => void;
  mark?: { x: number; y: number; ok: boolean } | null;
}

export function Grid({ min, max, points = [], polygon, lines = [], selected, onPick, mark }: GridProps) {
  const S = 380, pad = 26;
  const span = max - min;
  const u = (S - 2 * pad) / span;
  const X = (v: number) => pad + (v - min) * u;
  const Y = (v: number) => S - pad - (v - min) * u;
  const labelStep = span > 24 ? 5 : span > 12 ? 2 : 1;
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const toGrid = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * S;
    const sy = ((e.clientY - r.top) / r.height) * S;
    const gx = Math.round((sx - pad) / u + min);
    const gy = Math.round((S - pad - sy) / u + min);
    if (gx < min || gx > max || gy < min || gy > max) return null;
    return { x: gx, y: gy };
  };
  const clip = (m: number, b: number) => {
    const pts: [number, number][] = [];
    for (const xv of [min, max]) {
      const yv = m * xv + b;
      if (yv >= min && yv <= max) pts.push([xv, yv]);
    }
    if (m !== 0) for (const yv of [min, max]) {
      const xv = (yv - b) / m;
      if (xv > min && xv < max) pts.push([xv, yv]);
    }
    return pts.length >= 2 ? pts.slice(0, 2) : null;
  };
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      width={S}
      role="img"
      aria-label="coordinate grid"
      style={{ cursor: onPick ? "crosshair" : undefined, touchAction: "manipulation" }}
      onMouseMove={onPick ? (e) => setHover(toGrid(e)) : undefined}
      onMouseLeave={() => setHover(null)}
      onClick={onPick ? (e) => { const g = toGrid(e); if (g) onPick(g); } : undefined}
    >
      {Array.from({ length: span + 1 }, (_, i) => {
        const v = min + i;
        return (
          <g key={i}>
            <line x1={X(v)} x2={X(v)} y1={Y(min)} y2={Y(max)} stroke={C.line} strokeWidth={1} />
            <line y1={Y(v)} y2={Y(v)} x1={X(min)} x2={X(max)} stroke={C.line} strokeWidth={1} />
          </g>
        );
      })}
      {min <= 0 && max >= 0 && (
        <g>
          <line x1={X(0)} x2={X(0)} y1={Y(min) + 8} y2={Y(max) - 8} stroke={C.ink} strokeWidth={2} />
          <line y1={Y(0)} y2={Y(0)} x1={X(min) - 8} x2={X(max) + 8} stroke={C.ink} strokeWidth={2} />
          <text x={X(max) + 2} y={Y(0) - 6} fontSize={13} fontStyle="italic" fill={C.ink} textAnchor="end">x</text>
          <text x={X(0) + 6} y={Y(max) + 4} fontSize={13} fontStyle="italic" fill={C.ink}>y</text>
        </g>
      )}
      {Array.from({ length: span + 1 }, (_, i) => {
        const v = min + i;
        if (v === 0 || v % labelStep !== 0) return null;
        const axisY = min <= 0 && max >= 0 ? Y(0) : Y(min);
        const axisX = min <= 0 && max >= 0 ? X(0) : X(min);
        return (
          <g key={`l${i}`} fontSize={11} fill={C.ink2}>
            <text x={X(v)} y={axisY + 14} textAnchor="middle">{fmt(v)}</text>
            <text x={axisX - 5} y={Y(v) + 4} textAnchor="end">{fmt(v)}</text>
          </g>
        );
      })}
      {polygon && <polygon points={polygon.map((p) => `${X(p.x)},${Y(p.y)}`).join(" ")} fill={C.shade} fillOpacity={0.35} stroke={C.primary} strokeWidth={2} />}
      {lines.map((l, i) => {
        const seg = clip(l.m, l.b);
        if (!seg) return null;
        return (
          <g key={i}>
            <line x1={X(seg[0][0])} y1={Y(seg[0][1])} x2={X(seg[1][0])} y2={Y(seg[1][1])} stroke={i === 0 ? C.primary : C.shade2} strokeWidth={2.5} />
            {l.label && <text x={X(seg[1][0]) - 4} y={Y(seg[1][1]) + (l.m > 0 ? 16 : -6)} fontSize={13} fontWeight={700} textAnchor="end" fill={i === 0 ? C.primary : C.shade2}>{l.label}</text>}
          </g>
        );
      })}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={5.5} fill={C.ink} />
          {p.label && <text x={X(p.x) + 8} y={Y(p.y) - 8} fontSize={13} fontWeight={700} fill={C.ink}>{p.label}</text>}
        </g>
      ))}
      {onPick && hover && !mark && <circle cx={X(hover.x)} cy={Y(hover.y)} r={7} fill={C.primary} fillOpacity={0.3} />}
      {selected && !mark && (
        <g>
          <circle cx={X(selected.x)} cy={Y(selected.y)} r={7} fill={C.primary} />
          <text x={X(selected.x) + 10} y={Y(selected.y) - 10} fontSize={13} fontWeight={800} fill={C.primary}>({fmt(selected.x)}, {fmt(selected.y)})</text>
        </g>
      )}
      {mark && (
        <g>
          <circle cx={X(mark.x)} cy={Y(mark.y)} r={8} fill={mark.ok ? C.good : C.bad} />
          <text x={X(mark.x) + 10} y={Y(mark.y) - 10} fontSize={13} fontWeight={800} fill={mark.ok ? C.good : C.bad}>({fmt(mark.x)}, {fmt(mark.y)})</text>
        </g>
      )}
    </svg>
  );
}

function DotPlot({ values, min, max, label }: Extract<V, { type: "dotplot" }>) {
  const W = 560, pad = 24, base = 150;
  const x = (v: number) => pad + ((v - min) / (max - min)) * (W - 2 * pad);
  const counts = new Map<number, number>();
  return (
    <svg viewBox={`0 0 ${W} 190`} width={W} role="img" aria-label="dot plot">
      <line x1={pad} x2={W - pad} y1={base} y2={base} stroke={C.ink} strokeWidth={2} />
      {Array.from({ length: max - min + 1 }, (_, i) => (
        <g key={i}>
          <line x1={x(min + i)} x2={x(min + i)} y1={base} y2={base + 6} stroke={C.ink} />
          {(max - min <= 20 || i % 2 === 0) && <text x={x(min + i)} y={base + 22} fontSize={12} textAnchor="middle" fill={C.ink}>{min + i}</text>}
        </g>
      ))}
      {values.map((v, i) => {
        const k = (counts.get(v) ?? 0) + 1;
        counts.set(v, k);
        return <circle key={i} cx={x(v)} cy={base - 10 - (k - 1) * 16} r={6.5} fill={C.primary} />;
      })}
      {label && <text x={W / 2} y={186} textAnchor="middle" fontSize={13} fill={C.ink2}>{label}</text>}
    </svg>
  );
}

function Scatter({ points, xLabel, yLabel, line }: Extract<V, { type: "scatter" }>) {
  const W = 420, H = 300, pad = 44;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const x0 = 0, x1 = Math.ceil(Math.max(...xs) + 1);
  const y0 = Math.max(0, Math.floor(Math.min(...ys) / 10) * 10 - 10), y1 = Math.ceil(Math.max(...ys) / 10) * 10 + 10;
  const X = (v: number) => pad + ((v - x0) / (x1 - x0)) * (W - pad - 12);
  const Y = (v: number) => H - pad - ((v - y0) / (y1 - y0)) * (H - pad - 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label="scatterplot">
      <line x1={pad} x2={W - 8} y1={H - pad} y2={H - pad} stroke={C.ink} strokeWidth={2} />
      <line x1={pad} x2={pad} y1={8} y2={H - pad} stroke={C.ink} strokeWidth={2} />
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const v = Math.round(y0 + f * (y1 - y0));
        return <text key={f} x={pad - 6} y={Y(v) + 4} fontSize={11} textAnchor="end" fill={C.ink2}>{v}</text>;
      })}
      {Array.from({ length: x1 + 1 }, (_, i) => (i % Math.ceil(x1 / 8) === 0 ? <text key={i} x={X(i)} y={H - pad + 16} fontSize={11} textAnchor="middle" fill={C.ink2}>{i}</text> : null))}
      {line && <line x1={X(x0)} y1={Y(line.m * x0 + line.b)} x2={X(x1)} y2={Y(line.m * x1 + line.b)} stroke={C.shade2} strokeWidth={2.5} />}
      {points.map((p, i) => <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={5} fill={C.primary} />)}
      <text x={(W + pad) / 2} y={H - 8} textAnchor="middle" fontSize={13} fill={C.ink}>{xLabel}</text>
      <text x={14} y={(H - pad) / 2} textAnchor="middle" fontSize={13} fill={C.ink} transform={`rotate(-90 14 ${(H - pad) / 2})`}>{yLabel}</text>
    </svg>
  );
}

function Tape({ rows }: { rows: Extract<V, { type: "tape" }>["rows"] }) {
  const W = 480, lab = 90, h = 38;
  const unit = W / Math.max(...rows.map((r) => r.segments.reduce((a, s) => a + s.size, 0)));
  return (
    <svg viewBox={`0 0 ${W + lab} ${rows.length * (h + 10)}`} width={W + lab} role="img" aria-label="tape diagram">
      {rows.map((row, i) => {
        let at = lab;
        return (
          <g key={i} transform={`translate(0 ${i * (h + 10)})`}>
            <text x={0} y={h / 2 + 5} fontSize={14} fontWeight={700} fill={C.ink}>{row.label}</text>
            {row.segments.map((s, k) => {
              const x = at;
              at += s.size * unit;
              return (
                <g key={k}>
                  <rect x={x} y={0} width={s.size * unit} height={h} fill={s.shade ? C.shade : C.surface} stroke={C.ink} strokeWidth={1.5} />
                  <text x={x + (s.size * unit) / 2} y={h / 2 + 5} fontSize={14} textAnchor="middle" fill={C.ink}>{s.text}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function BoxPlot({ min, q1, median, q3, max, scaleMin, scaleMax }: Extract<V, { type: "boxplot" }>) {
  const W = 560, pad = 24, y = 50;
  const x = (v: number) => pad + ((v - scaleMin) / (scaleMax - scaleMin)) * (W - 2 * pad);
  const step = scaleMax - scaleMin > 30 ? 5 : scaleMax - scaleMin > 15 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} 120`} width={W} role="img" aria-label="box plot">
      <line x1={x(min)} x2={x(q1)} y1={y} y2={y} stroke={C.ink} strokeWidth={2} />
      <line x1={x(q3)} x2={x(max)} y1={y} y2={y} stroke={C.ink} strokeWidth={2} />
      <line x1={x(min)} x2={x(min)} y1={y - 12} y2={y + 12} stroke={C.ink} strokeWidth={2} />
      <line x1={x(max)} x2={x(max)} y1={y - 12} y2={y + 12} stroke={C.ink} strokeWidth={2} />
      <rect x={x(q1)} y={y - 22} width={x(q3) - x(q1)} height={44} fill={C.shade} fillOpacity={0.35} stroke={C.ink} strokeWidth={2} />
      <line x1={x(median)} x2={x(median)} y1={y - 22} y2={y + 22} stroke={C.ink} strokeWidth={3} />
      <line x1={pad} x2={W - pad} y1={95} y2={95} stroke={C.ink} />
      {Array.from({ length: Math.floor((scaleMax - scaleMin) / step) + 1 }, (_, i) => {
        const v = scaleMin + i * step;
        return (
          <g key={i}>
            <line x1={x(v)} x2={x(v)} y1={95} y2={100} stroke={C.ink} />
            <text x={x(v)} y={114} fontSize={12} textAnchor="middle" fill={C.ink}>{v}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Shape({ shape, labels }: { shape: string; labels: Record<string, string | undefined> }) {
  const t = (x: number, y: number, s?: string, anchor: "start" | "middle" | "end" = "middle") => s ? <text x={x} y={y} fontSize={15} fontWeight={700} textAnchor={anchor} fill={C.ink}>{s}</text> : null;
  const dash = { stroke: C.ink2, strokeDasharray: "5 4", strokeWidth: 1.5 };
  const body = { fill: C.shade, fillOpacity: 0.25, stroke: C.ink, strokeWidth: 2 };
  let content;
  switch (shape) {
    case "triangle":
      content = <><polygon points="40,170 280,170 190,40" {...body} /><line x1={190} y1={40} x2={190} y2={170} {...dash} /><rect x={190} y={158} width={12} height={12} fill="none" stroke={C.ink2} />{t(160, 192, labels.base)}{t(198, 110, labels.height, "start")}</>;
      break;
    case "parallelogram":
      content = <><polygon points="40,170 250,170 300,50 90,50" {...body} /><line x1={90} y1={50} x2={90} y2={170} {...dash} />{t(145, 192, labels.base)}{t(98, 115, labels.height, "start")}{t(290, 120, labels.side, "start")}</>;
      break;
    case "trapezoid":
      content = <><polygon points="30,170 310,170 240,50 100,50" {...body} /><line x1={100} y1={50} x2={100} y2={170} {...dash} />{t(170, 192, labels.base)}{t(170, 40, labels.top)}{t(108, 115, labels.height, "start")}</>;
      break;
    case "prism":
      content = <><polygon points="40,80 230,80 230,180 40,180" {...body} /><polygon points="40,80 100,30 290,30 230,80" {...body} /><polygon points="230,80 290,30 290,130 230,180" {...body} />{t(135, 200, labels.l)}{t(270, 170, labels.w, "start")}{t(30, 135, labels.h, "end")}</>;
      break;
    case "cylinder":
      content = <><ellipse cx={160} cy={160} rx={90} ry={22} {...body} /><rect x={70} y={50} width={180} height={110} fill={C.shade} fillOpacity={0.25} stroke="none" /><line x1={70} y1={50} x2={70} y2={160} stroke={C.ink} strokeWidth={2} /><line x1={250} y1={50} x2={250} y2={160} stroke={C.ink} strokeWidth={2} /><ellipse cx={160} cy={50} rx={90} ry={22} {...body} /><line x1={160} y1={50} x2={250} y2={50} {...dash} />{t(205, 44, labels.r)}{t(262, 110, labels.h, "start")}</>;
      break;
    case "cone":
      content = <><ellipse cx={160} cy={170} rx={90} ry={22} {...body} /><polygon points="70,170 250,170 160,30" fill={C.shade} fillOpacity={0.25} stroke={C.ink} strokeWidth={2} /><line x1={160} y1={30} x2={160} y2={170} {...dash} /><line x1={160} y1={170} x2={250} y2={170} {...dash} />{t(205, 164, labels.r)}{t(166, 105, labels.h, "start")}</>;
      break;
    case "sphere":
    case "circle":
      content = <><circle cx={160} cy={110} r={85} {...body} />{shape === "sphere" && <ellipse cx={160} cy={110} rx={85} ry={22} fill="none" {...dash} />}<line x1={160} y1={110} x2={245} y2={110} stroke={C.ink} strokeWidth={2} /><circle cx={160} cy={110} r={3} fill={C.ink} />{t(202, 102, labels.r)}{labels.d && t(160, 220, labels.d)}</>;
      break;
    case "righttriangle":
      content = <><polygon points="60,170 260,170 60,40" {...body} /><rect x={60} y={156} width={14} height={14} fill="none" stroke={C.ink} />{t(160, 192, labels.b)}{t(50, 110, labels.a, "end")}{t(172, 96, labels.c, "start")}</>;
      break;
    case "angles":
      content = <><line x1={30} y1={160} x2={300} y2={160} stroke={C.ink} strokeWidth={2} /><line x1={165} y1={160} x2={250} y2={40} stroke={C.ink} strokeWidth={2} /><path d="M 195 160 A 30 30 0 0 0 183 135" fill="none" stroke={C.primary} strokeWidth={2} /><path d="M 145 160 A 20 20 0 0 1 177 143" fill="none" stroke={C.shade2} strokeWidth={2} />{t(210, 150, labels.a, "start")}{t(140, 140, labels.b, "end")}</>;
      break;
    default:
      content = <rect x={40} y={40} width={240} height={130} {...body} />;
  }
  return <svg viewBox="0 0 330 225" width={330} role="img" aria-label={shape}>{content}</svg>;
}

function DiceSim({ target, rolls }: { target: number; rolls: number }) {
  const [counts, setCounts] = useState<number[] | null>(null);
  const roll = () => {
    const c = Array(13).fill(0);
    for (let i = 0; i < rolls; i++) c[Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2]++;
    setCounts(c);
  };
  const W = 480, H = 170, bw = 32;
  const max = counts ? Math.max(...counts) : 1;
  return (
    <div>
      <button className="btn primary" onClick={roll}>🎲 Roll {rolls} times{counts ? " again" : ""}</button>
      {counts && (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label="simulation results" style={{ marginTop: 10 }}>
            {Array.from({ length: 11 }, (_, i) => {
              const s = i + 2;
              const h = (counts[s] / max) * 110;
              return (
                <g key={s}>
                  <rect x={20 + i * (bw + 8)} y={130 - h} width={bw} height={h} fill={s === target ? "var(--accent)" : "var(--shade)"} rx={4} />
                  <text x={20 + i * (bw + 8) + bw / 2} y={148} fontSize={13} textAnchor="middle" fill="var(--ink)">{s}</text>
                  <text x={20 + i * (bw + 8) + bw / 2} y={125 - h} fontSize={11} textAnchor="middle" fill="var(--ink-2)">{counts[s]}</text>
                </g>
              );
            })}
            <text x={W / 2} y={166} fontSize={12} textAnchor="middle" fill="var(--ink-2)">sum of two dice</text>
          </svg>
          <p className="small"><strong>{target}</strong> came up <strong>{counts[target]}</strong> times out of {rolls} ({((counts[target] / rolls) * 100).toFixed(1)}%).</p>
        </>
      )}
    </div>
  );
}
