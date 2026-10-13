// "My Map" as an illustrated trail: four lands, one per grade, with every topic a stop on the way
// to Horizons Peak. Positions are worked out in pixels from the map's width, so the drawing never
// stretches and the stops stay readable on a phone.
import { useLayoutEffect, useRef, useState } from "react";
import { TOPICS } from "../content";
import { familyOf } from "../content/topics";
import { FamilyIcon, Icon } from "./Icon";
import { Owl } from "./Owl";
import { useSkin } from "../skin";
import "./trail.css";

type Land = "meadow" | "woods" | "river" | "peaks";
const REGIONS: { grade: 5 | 6 | 7 | 8; name: string; sub: string; land: Land }[] = [
  { grade: 5, name: "Warm-up Meadow", sub: "Foundations", land: "meadow" },
  { grade: 6, name: "Whispering Woods", sub: "Grade 6", land: "woods" },
  { grade: 7, name: "Riverlands", sub: "Grade 7", land: "river" },
  { grade: 8, name: "Summit Peaks", sub: "Grade 8", land: "peaks" },
];

const HEAD = 124; // each land's welcome sign and scenery strip
const ROW = 132; // one topic stop
const GAP = 10; // after the last stop of a land
const FINALE = 250;
const NODE = 40; // stop radius, including its ring
const RIVER_TOP = 92, RIVER_BOTTOM = 118; // the river across the Riverlands sign strip

type Pt = { x: number; y: number };
type Counts = { counts: number[]; total: number; ready: number };

/** Small fixed "random" numbers so the scenery stays put between visits. */
const rand = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** The trail between two points: leaves and arrives vertically, so every bend is a soft S. */
const seg = (a: Pt, b: Pt) => {
  const k = (b.y - a.y) / 2;
  return `C ${a.x} ${a.y + k} ${b.x} ${b.y - k} ${b.x} ${b.y}`;
};
/** Where the trail between a and b is at height y (for placing the bridge). */
function xAt(a: Pt, b: Pt, y: number) {
  const k = (b.y - a.y) / 2;
  const at = (t: number, p0: number, p1: number, p2: number, p3: number) => (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid, a.y, a.y + k, b.y - k, b.y) < y) lo = mid;
    else hi = mid;
  }
  return at(lo, a.x, a.x, b.x, b.x);
}

export function TrailMap({ counts, here, onTopic, onFinale }: { counts: Record<string, Counts>; here?: string; onTopic: (id: string) => void; onFinale: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const skin = useSkin();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!W) return <div ref={ref} className="trail-map" style={{ height: 600 }} />;

  const side = Math.max(88, Math.round(W / 2 - Math.min(W * 0.26, 230)));
  const labelW = (x: number, left: boolean) => Math.min(230, left ? W - (x + NODE + 8) - 10 : x - NODE - 8 - 10);

  // Lay out the lands, signs and stops from top to bottom.
  let y = 0, i = 0;
  const lands = REGIONS.map((r) => {
    const topics = TOPICS.filter((t) => t.grade === r.grade);
    const y0 = y;
    const sign = { x: W / 2, y: y0 + 46 };
    const stops = topics.map((t, j) => {
      const left = i++ % 2 === 0;
      return { topic: t, left, x: left ? side : W - side, y: y0 + HEAD + ROW * (j + 0.5) };
    });
    y = y0 + HEAD + ROW * topics.length + GAP;
    return { ...r, y0, y1: y, sign, stops };
  });
  const finale = { y0: y, peak: { x: W / 2, y: y + 46 }, end: { x: W / 2, y: y + 178 } };
  const H = y + FINALE;

  const points: Pt[] = [];
  for (const l of lands) points.push(l.sign, ...l.stops);
  points.push(finale.end);
  const trail = points.slice(1).reduce((d, p, n) => `${d} ${seg(points[n], p)}`, `M ${points[0].x} ${points[0].y}`);

  // Scenery in the open spaces: at the edges between stops, beside stops, and past the labels.
  const decor: { x: number; y: number; land: Land; kind: number; s: number }[] = [];
  lands.forEach((l, li) => {
    l.stops.forEach((s, j) => {
      const r = (k: number) => rand(li * 31 + j, k);
      const mid = s.y + ROW / 2;
      if (j < l.stops.length - 1 || W >= 600) {
        decor.push({ x: W * (0.07 + r(1) * 0.05), y: mid + (r(2) - 0.5) * 20, land: l.land, kind: Math.floor(r(3) * 3), s: 0.9 });
        decor.push({ x: W * (0.88 + r(4) * 0.05), y: mid + (r(5) - 0.5) * 20, land: l.land, kind: Math.floor(r(6) * 3), s: 0.9 });
        if (W >= 600) {
          decor.push({ x: W * (0.2 + r(7) * 0.06), y: mid + 8, land: l.land, kind: Math.floor(r(8) * 3), s: 1 });
          decor.push({ x: W * (0.74 + r(9) * 0.06), y: mid - 4, land: l.land, kind: Math.floor(r(10) * 3), s: 1 });
        }
      }
      const outer = s.left ? s.x - NODE : W - (s.x + NODE);
      if (outer >= 44 && s.topic.id !== here) decor.push({ x: s.left ? outer / 2 : W - outer / 2, y: s.y + 12, land: l.land, kind: Math.floor(r(11) * 3), s: Math.min(1, outer / 70) });
      const end = s.left ? s.x + NODE + 8 + labelW(s.x, true) : s.x - NODE - 8 - labelW(s.x, false);
      const room = s.left ? W - end : end;
      if (room >= 70) decor.push({ x: s.left ? end + room / 2 : room / 2, y: s.y + 6, land: l.land, kind: Math.floor(r(12) * 3), s: 1.1 });
    });
  });

  const river = lands.find((l) => l.land === "river")!;
  const bridgeTop = river.y0 + RIVER_TOP, bridgeBottom = river.y0 + RIVER_BOTTOM;
  const bx1 = xAt(river.sign, river.stops[0], bridgeTop), bx2 = xAt(river.sign, river.stops[0], bridgeBottom);

  return (
    <div ref={ref} className="trail-map" style={{ height: H }}>
      <svg className="trail-art" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {lands.map((l, li) => (
          <path key={l.land} className={`land-${l.land}`} d={landShape(W, li === 0 ? l.y0 : l.y0 - 12, (li === lands.length - 1 ? H : l.y1) + 2, li)} />
        ))}
        {lands.map((l) => (
          <g key={l.land} transform={`translate(0 ${l.y0})`}>
            <Scene land={l.land} W={W} />
          </g>
        ))}
        <Summit x={finale.peak.x} y={finale.y0} />
        {decor.map((d, n) => (
          <g key={n} transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)}) scale(${d.s})`}>
            <Decor land={d.land} kind={d.kind} />
          </g>
        ))}
        <path className="trail-edge" d={trail} />
        <path className="trail-path" d={trail} />
        <path className="trail-dash" d={trail} />
        <Bridge x1={bx1} x2={bx2} top={bridgeTop - 8} bottom={bridgeBottom + 8} />
      </svg>

      {lands.map((l) => {
        const c = l.stops.reduce((a, s) => ({ ready: a.ready + counts[s.topic.id].ready, total: a.total + counts[s.topic.id].total }), { ready: 0, total: 0 });
        return (
          <div key={l.land} className="trail-sign" style={{ left: l.sign.x, top: l.sign.y }}>
            <span className="sign-sub">{l.sub}</span>
            <span className="sign-name">{l.name}</span>
            <span className="sign-count">{c.ready} of {c.total} skills unlocked</span>
          </div>
        );
      })}

      {lands.flatMap((l) =>
        l.stops.map((s) => {
          const c = counts[s.topic.id];
          const fam = familyOf(s.topic.id);
          const started = c.counts.slice(1).some(Boolean);
          const done = c.total > 0 && c.ready === c.total;
          const isHere = s.topic.id === here;
          const frac = c.total ? c.ready / c.total : 0;
          const lw = labelW(s.x, s.left);
          return (
            <button
              key={s.topic.id}
              type="button"
              className={`trail-stop fam-${fam} ${s.left ? "left" : "right"} ${started ? "started" : ""} ${done ? "done" : ""} ${isHere ? "here" : ""}`}
              style={s.left ? { left: s.x - NODE, top: s.y - NODE } : { right: W - s.x - NODE, top: s.y - NODE }}
              onClick={() => onTopic(s.topic.id)}
            >
              <span className="stop-node">
                <svg viewBox="0 0 80 80" className="stop-ring" aria-hidden="true">
                  <circle cx="40" cy="40" r="36" className="ring-track" />
                  {frac > 0 && <circle cx="40" cy="40" r="36" className="ring-fill" strokeDasharray={`${(frac * 226.2).toFixed(1)} 226.2`} transform="rotate(-90 40 40)" />}
                </svg>
                <span className="stop-disc"><FamilyIcon family={fam} size={28} /></span>
                {done && <span className="stop-star"><Icon name="star" size={24} /></span>}
              </span>
              <span className="stop-label" style={{ maxWidth: lw }}>
                <strong>{s.topic.title}</strong>
                <span className="small">{c.ready} of {c.total} skills unlocked</span>
                {isHere && <span className="here-tag">You are here</span>}
              </span>
              {isHere && (
                <span className="here-mark" aria-hidden="true">
                  {skin === "classic" ? <Icon name="flag" size={30} /> : <Owl size={42} className="bob" />}
                </span>
              )}
            </button>
          );
        }),
      )}

      <button type="button" className="trail-finale" style={{ left: W / 2, top: finale.end.y + 6 }} onClick={onFinale}>
        <Icon name="trophy" size={22} />
        <span><strong>Horizons Peak</strong><span className="small">Practice for the screener</span></span>
      </button>
    </div>
  );
}

/** A land's ground, with a wavy top edge that tucks under the land before it. */
function landShape(W: number, top: number, bottom: number, n: number) {
  const a = 10 + (n % 2) * 4;
  return `M 0 ${top + a} C ${W * 0.2} ${top - a} ${W * 0.35} ${top + a * 1.6} ${W * 0.55} ${top + a * 0.4} S ${W * 0.85} ${top - a * 0.6} ${W} ${top + a} V ${bottom} H 0 Z`;
}

function Scene({ land, W }: { land: Land; W: number }) {
  if (land === "meadow") {
    return (
      <g>
        <circle className="m-sun m-ink" cx={W - Math.min(70, W * 0.14)} cy={34} r={16} />
        <path className="m-meadow-2" d={`M 0 104 C ${W * 0.18} 66 ${W * 0.32} 70 ${W * 0.46} 96 S ${W * 0.78} 64 ${W} 90 V 124 H 0 Z`} />
        <path className="m-ink m-open" d={`M 0 104 C ${W * 0.18} 66 ${W * 0.32} 70 ${W * 0.46} 96 S ${W * 0.78} 64 ${W} 90`} />
        <path className="land-meadow" d={`M 0 128 C ${W * 0.3} 104 ${W * 0.62} 132 ${W} 110 V 134 H 0 Z`} />
      </g>
    );
  }
  if (land === "woods") {
    const trees = [];
    for (let x = 14, n = 0; x < W; x += 30, n++) {
      if (Math.abs(x - W / 2) < 100) continue;
      const h = 44 + rand(n, 7) * 30;
      trees.push(<Pine key={n} x={x} base={116} h={h} dark={n % 3 === 0} />);
    }
    return <g>{trees}</g>;
  }
  if (land === "river") {
    const top = RIVER_TOP, bot = RIVER_BOTTOM;
    const wave = (yy: number, d: number) => `M 0 ${yy} C ${W * 0.25} ${yy - d} ${W * 0.5} ${yy + d} ${W * 0.75} ${yy} S ${W} ${yy - d} ${W} ${yy}`;
    return (
      <g>
        <path className="m-water m-ink" d={`${wave(top, 8)} V ${bot} C ${W * 0.75} ${bot + 8} ${W * 0.5} ${bot - 8} ${W * 0.25} ${bot} S 0 ${bot + 6} 0 ${bot} Z`} />
        <path className="m-ripple" d={`M ${W * 0.12} ${top + 12} h 26 M ${W * 0.3} ${top + 19} h 18 M ${W * 0.68} ${top + 10} h 22 M ${W * 0.84} ${top + 18} h 26`} />
      </g>
    );
  }
  const peaks = [];
  for (let x = 30, n = 0; x < W + 30; x += 64, n++) {
    if (Math.abs(x - W / 2) < 80) continue;
    const h = 52 + rand(n, 3) * 40;
    peaks.push(<Mountain key={n} x={x} base={120} h={h} w={50 + rand(n, 4) * 30} />);
  }
  return <g>{peaks}</g>;
}

function Pine({ x, base, h, dark }: { x: number; base: number; h: number; dark?: boolean }) {
  const w = h * 0.42;
  return (
    <g>
      <rect className="m-trunk m-ink" x={x - 3} y={base - 10} width={6} height={10} />
      <path className={`${dark ? "m-tree-2" : "m-tree"} m-ink`} d={`M ${x} ${base - h} L ${x + w * 0.7} ${base - h * 0.5} H ${x + w * 0.35} L ${x + w} ${base - 8} H ${x - w} L ${x - w * 0.35} ${base - h * 0.5} H ${x - w * 0.7} Z`} />
    </g>
  );
}

function Mountain({ x, base, h, w }: { x: number; base: number; h: number; w: number }) {
  const cap = h * 0.3;
  return (
    <g>
      <path className="m-rock m-ink" d={`M ${x - w} ${base} L ${x} ${base - h} L ${x + w} ${base} Z`} />
      <path className="m-snow m-ink" d={`M ${x - (w * cap) / h} ${base - h + cap} L ${x} ${base - h} L ${x + (w * cap) / h} ${base - h + cap} L ${x + (w * cap) / h / 3} ${base - h + cap * 0.75} L ${x - (w * cap) / h / 3} ${base - h + cap} Z`} />
    </g>
  );
}

/** Horizons Peak: the big mountain at the end of the trail, with a flag on top. */
function Summit({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="m-rock-2 m-ink" d="M -170 180 L -60 70 L -20 100 L 0 40 L 40 92 L 70 64 L 170 180 Z" />
      <path className="m-snow m-ink" d="M -14 60 L 0 40 L 16 62 L 6 58 L -2 66 Z" />
      <path className="m-ink-line" d="M 0 40 V 2" />
      <path className="m-flag m-ink" d="M 0 4 L 30 12 L 0 21 Z" />
    </g>
  );
}

function Bridge({ x1, x2, top, bottom }: { x1: number; x2: number; top: number; bottom: number }) {
  const cx = (x1 + x2) / 2, half = 24 + Math.abs(x1 - x2) / 2;
  const planks = [];
  for (let yy = top + 6; yy < bottom - 2; yy += 7) planks.push(`M ${cx - half + 3} ${yy} H ${cx + half - 3}`);
  return (
    <g>
      <rect className="m-wood m-ink" x={cx - half} y={top} width={half * 2} height={bottom - top} rx={4} />
      <path className="m-plank" d={planks.join(" ")} />
      <path className="m-ink-line" d={`M ${cx - half} ${top - 4} V ${bottom + 4} M ${cx + half} ${top - 4} V ${bottom + 4}`} />
    </g>
  );
}

/** Little things in the grass. Each land has three kinds. */
function Decor({ land, kind }: { land: Land; kind: number }) {
  if (land === "meadow") {
    if (kind === 0) return <Flower />;
    if (kind === 1) return <Bush />;
    return (
      <g>
        <g transform="translate(-9 2) scale(0.8)"><Flower /></g>
        <g transform="translate(9 6) scale(0.7)"><Flower alt /></g>
      </g>
    );
  }
  if (land === "woods") {
    if (kind === 0) return <Pine x={0} base={16} h={46} />;
    if (kind === 1) return (
      <g>
        <rect className="m-trunk m-ink" x={-3} y={0} width={6} height={16} />
        <circle className="m-tree m-ink" cx={0} cy={-8} r={15} />
      </g>
    );
    return (
      <g>
        <rect className="m-cap-stem m-ink" x={-3} y={0} width={6} height={10} rx={2} />
        <path className="m-flower m-ink" d="M -12 1 C -12 -12 12 -12 12 1 Z" />
        <circle className="m-dot" cx={-4} cy={-5} r={2} />
        <circle className="m-dot" cx={4} cy={-3} r={1.6} />
      </g>
    );
  }
  if (land === "river") {
    if (kind === 0) return (
      <g>
        <ellipse className="m-water m-ink" cx={0} cy={4} rx={22} ry={9} />
        <path className="m-tree" d="M -6 3 a 6 3.5 0 1 1 9 2 l -4 -1 z" />
      </g>
    );
    if (kind === 1) return <path className="m-reed" d="M -6 14 C -7 2 -6 -6 -8 -14 M 0 14 C 0 0 1 -8 2 -18 M 6 14 C 7 4 7 -4 10 -10" />;
    return <path className="m-pebble m-ink" d="M -14 10 C -16 0 -6 -8 2 -6 C 12 -5 16 4 14 10 Z" />;
  }
  if (kind === 0) return <Mountain x={0} base={16} h={34} w={24} />;
  if (kind === 1) return (
    <g>
      <Pine x={0} base={16} h={38} />
      <path className="m-snow" d="M 0 -22 L 6 -14 L -6 -14 Z" />
    </g>
  );
  return <path className="m-stone m-ink" d="M -14 10 C -16 0 -6 -8 2 -6 C 12 -5 16 4 14 10 Z" />;
}

function Flower({ alt }: { alt?: boolean }) {
  return (
    <g>
      <path className="m-stem" d="M 0 2 V 16" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} className={alt ? "m-flower-2" : "m-flower"} cx={Math.cos((a * Math.PI) / 180) * 5} cy={Math.sin((a * Math.PI) / 180) * 5 - 4} r={4} />
      ))}
      <circle className={alt ? "m-flower" : "m-flower-2"} cx={0} cy={-4} r={3} />
    </g>
  );
}

function Bush() {
  return (
    <g className="m-meadow-3 m-ink">
      <circle cx={-9} cy={4} r={9} />
      <circle cx={9} cy={4} r={9} />
      <circle cx={0} cy={-3} r={11} />
    </g>
  );
}
