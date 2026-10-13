// Landmarks on the map trail. Each one sits beside a topic's stop and hides that topic's math in
// the picture; tapping it shows the caption. Drawn in a box about 90 × 80, centered on (0, 0).
import type { ReactNode } from "react";

export interface Sight { name: string; caption: string; art: ReactNode }

const I = "m-ink";

/** Point on an ellipse at angle a (degrees). */
const ep = (cx: number, cy: number, rx: number, ry: number, a: number) => [cx + rx * Math.cos((a * Math.PI) / 180), cy + ry * Math.sin((a * Math.PI) / 180)] as const;

function Acorn({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse className={`m-trunk ${I}`} cx={0} cy={1} rx={3.6} ry={4.2} />
      <path className={`m-plank-fill ${I}`} d="M -4.4 -1 C -4.4 -5 4.4 -5 4.4 -1 Z" />
    </g>
  );
}

function Duck({ x, y, white, flip }: { x: number; y: number; white?: boolean; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <ellipse className={`${white ? "m-snow" : "m-flower-2"} ${I}`} cx={0} cy={0} rx={7.5} ry={4.6} />
      <circle className={`${white ? "m-snow" : "m-flower-2"} ${I}`} cx={-5} cy={-5.5} r={3.6} />
      <path className="m-beak" d="M -8.4 -5.6 L -12 -4.6 L -8.4 -3.6 Z" />
      <circle className="m-eye" cx={-5.6} cy={-6.2} r={0.9} />
    </g>
  );
}

function Star({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  const pts = Array.from({ length: 10 }, (_, k) => {
    const rr = k % 2 ? r * 0.45 : r;
    const a = (-90 + k * 36) * (Math.PI / 180);
    return `${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`;
  });
  return <path className="m-flower-2" d={`M ${pts.join(" L ")} Z`} />;
}

function Pizza() {
  const c = [-6, 17] as const, rx = 14, ry = 7;
  const lines = [0, 45, 90, 135].map((a) => {
    const [x1, y1] = ep(c[0], c[1], rx, ry, a);
    const [x2, y2] = ep(c[0], c[1], rx, ry, a + 180);
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  });
  const [ax, ay] = ep(c[0], c[1], rx + 3, ry + 2, -90);
  const [bx, by] = ep(c[0], c[1], rx + 3, ry + 2, -45);
  return (
    <g>
      <path className={`m-flower ${I}`} d="M -44 30 L -32 8 L 42 8 L 30 30 Z" />
      <path className="m-check" d="M -38 19 H 36 M -20 8 L -26 30 M -2 8 L -8 30 M 16 8 L 10 30 M 34 8 L 28 30" />
      <ellipse className={`m-wood ${I}`} cx={c[0]} cy={c[1]} rx={rx + 3} ry={ry + 2} />
      <ellipse className="m-flower-2" cx={c[0]} cy={c[1]} rx={rx} ry={ry} />
      <path className="m-slice" d={lines.join(" ")} />
      {[[-14, 15], [-4, 21], [2, 14], [-12, 20], [-8, 12]].map(([x, y], k) => <ellipse key={k} className="m-flower" cx={x} cy={y} rx={2} ry={1.2} />)}
      <path className="m-flower" d={`M ${c[0]} ${c[1]} L ${ax.toFixed(1)} ${ay.toFixed(1)} A ${rx + 3} ${ry + 2} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)} Z`} />
      {/* The bunny with the missing slice. */}
      <ellipse className={`m-bunny ${I}`} cx={28} cy={1} rx={9} ry={8} />
      <ellipse className={`m-bunny ${I}`} cx={25.5} cy={-21} rx={2.4} ry={7.5} transform="rotate(-10 25.5 -21)" />
      <ellipse className={`m-bunny ${I}`} cx={32} cy={-20.5} rx={2.4} ry={7.5} transform="rotate(12 32 -20.5)" />
      <circle className={`m-bunny ${I}`} cx={29} cy={-10} r={6.5} />
      <circle className="m-eye" cx={27} cy={-11} r={1} />
      <circle className="m-flower" cx={25} cy={-9} r={1} />
      <path className={`m-flower-2 ${I}`} d="M 16 -4 L 24 -1 L 18 4 Z" />
      <circle className={`m-bunny ${I}`} cx={20} cy={0} r={2.6} />
    </g>
  );
}

function Lemonade() {
  return (
    <g>
      <rect className={`m-wood ${I}`} x={-31} y={-30} width={4} height={34} />
      <rect className={`m-wood ${I}`} x={27} y={-30} width={4} height={34} />
      {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} className={`${k % 2 ? "m-snow" : "m-flower"} ${I}`} x={-36 + k * 12} y={-38} width={12} height={10} />)}
      {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} className={k % 2 ? "m-snow" : "m-flower"} cx={-30 + k * 12} cy={-28} r={6} />)}
      <rect className={`m-wood ${I}`} x={-34} y={2} width={68} height={28} rx={2} />
      <rect className={`m-sign ${I}`} x={-26} y={8} width={52} height={16} rx={3} />
      <text className="m-text" x={0} y={19.5} textAnchor="middle">50¢ a cup</text>
      <path className={`m-lemonade ${I}`} d="M -20 2 L -18 -16 H -6 L -4 2 Z" />
      <path className="m-ink-line thin" d="M -4.6 -12 C 2 -12 2 -3 -4.2 -3" />
      {[6, 15, 24].map((x) => <path key={x} className={`m-snow ${I}`} d={`M ${x - 3.5} -7 H ${x + 3.5} L ${x + 2.5} 2 H ${x - 2.5} Z`} />)}
    </g>
  );
}

function NumberFence() {
  const posts = [-34, -12, 10, 32];
  return (
    <g>
      <rect className={`m-wood ${I}`} x={-44} y={-6} width={88} height={5} rx={1} />
      <rect className={`m-wood ${I}`} x={-44} y={8} width={88} height={5} rx={1} />
      {posts.map((x) => <path key={x} className={`m-wood ${I}`} d={`M ${x - 3.5} 20 V -14 L ${x} -19 L ${x + 3.5} -14 V 20 Z`} />)}
      {["−1", "0", "1", "2"].map((t, k) => <text key={t} className="m-text on-grass" x={posts[k]} y={32} textAnchor="middle">{t}</text>)}
      <path className="m-ink-line thin" d="M 21 18 V 24" />
      {/* Bluebird at 1½. */}
      <g transform="translate(21 -11)">
        <path className={`m-bird ${I}`} d="M -9 0 L -15 -3 L -13 2 Z" />
        <ellipse className={`m-bird ${I}`} cx={-2} cy={0} rx={7} ry={5} />
        <circle className={`m-bird ${I}`} cx={4} cy={-4} r={3.8} />
        <path className="m-beak" d="M 7.4 -4.6 L 10.6 -3.6 L 7.4 -2.6 Z" />
        <circle className="m-eye" cx={4.8} cy={-4.8} r={0.9} />
      </g>
    </g>
  );
}

function Seesaw() {
  return (
    <g>
      <path className={`m-rock ${I}`} d="M -9 28 L 0 10 L 9 28 Z" />
      <rect className={`m-wood ${I}`} x={-44} y={6} width={88} height={5} rx={2} />
      <rect className={`m-sign ${I}`} x={-40} y={-11} width={17} height={17} rx={4} />
      <text className="m-text big" x={-31.5} y={1.5} textAnchor="middle">x</text>
      <Acorn x={-17} y={1} />
      <Acorn x={-9} y={1} />
      {[[15, 1], [23, 1], [31, 1], [39, 1], [19, -7], [27, -7], [35, -7]].slice(0, 5).map(([x, y], k) => <Acorn key={k} x={x} y={y} />)}
      <text className="m-text on-grass" x={0} y={-12} textAnchor="middle">x + 2 = 5</text>
    </g>
  );
}

function CubeCabin() {
  // 3 cubes long, 2 deep, 2 tall. Front face 11-unit cells; depth steps of (6, −5).
  return (
    <g transform="translate(-2 2)">
      <path className={`m-cube-top ${I}`} d="M -22 -2 H 11 L 23 -12 H -10 Z" />
      <path className={`m-cube-side ${I}`} d="M 11 -2 L 23 -12 V 10 L 11 20 Z" />
      <rect className={`m-cube ${I}`} x={-22} y={-2} width={33} height={22} />
      <path className="m-grid" d="M -11 -2 V 20 M 0 -2 V 20 M -22 9 H 11 M -16 -7 H 17 M -11 -2 L 1 -12 M 0 -2 L 12 -12 M 17 -7 V 15 M 11 9 L 23 -1" />
      <rect className="m-door" x={-6} y={10} width={6} height={10} rx={1} />
      <rect className="m-snow" x={-18} y={2} width={5} height={4} />
      <path className="m-ink-line thin" d="M -26 24 H 30" />
      <text className="m-text on-grass" x={2} y={34} textAnchor="middle">3 × 2 × 2</text>
    </g>
  );
}

function SunflowerGraph() {
  const xs = [-27, -9, 9, 27], hs = [2, 4, 3, 5];
  return (
    <g>
      {xs.map((x, k) => (
        <g key={x}>
          {Array.from({ length: hs[k] }, (_, j) => <rect key={j} className={`m-tree ${I}`} x={x - 4} y={26 - (j + 1) * 9} width={8} height={9} />)}
          {[0, 60, 120, 180, 240, 300].map((a) => {
            const [px, py] = ep(x, 26 - hs[k] * 9 - 4, 5.5, 5.5, a);
            return <circle key={a} className="m-flower-2" cx={px} cy={py} r={3.4} />;
          })}
          <circle className={`m-trunk ${I}`} cx={x} cy={26 - hs[k] * 9 - 4} r={3.6} />
        </g>
      ))}
      <path className="m-ink-line thin" d="M -40 26 H 40" />
      <g transform="translate(36 -40)">
        <ellipse className={`m-flower-2 ${I}`} cx={0} cy={0} rx={5} ry={3.4} />
        <path className="m-ink-line thin" d="M -1 -3 V 3 M 2 -3 V 3" />
        <ellipse className="m-wing" cx={-1} cy={-5} rx={3} ry={2.2} />
      </g>
    </g>
  );
}

function SaleBoat() {
  return (
    <g>
      <path className="m-water" d="M -44 24 C -30 18 -16 30 0 24 S 30 18 44 24 V 34 H -44 Z" />
      <rect className={`m-wood ${I}`} x={-1.5} y={-36} width={3} height={50} />
      <path className={`m-flower ${I}`} d="M 1.5 -36 L 12 -32 L 1.5 -28 Z" />
      <path className={`m-sign ${I}`} d="M 3 -32 L 3 11 L 40 11 Z" />
      <text className="m-text" x={16} y={-1} textAnchor="middle">25%</text>
      <text className="m-text" x={16} y={8.5} textAnchor="middle">off</text>
      <path className={`m-flower-2 ${I}`} d="M -3 -22 L -3 10 L -24 10 Z" />
      <path className={`m-wood ${I}`} d="M -34 12 H 38 L 28 27 H -26 Z" />
    </g>
  );
}

function DepthPole() {
  const marks: [number, string][] = [[-26, "+2"], [-13, "+1"], [0, "0"], [13, "−1"], [26, "−2"]];
  return (
    <g>
      <path className={`m-water ${I}`} d="M -44 0 C -30 -4 -18 4 -4 0 S 30 -4 44 0 V 34 H -44 Z" />
      <rect className={`m-sign ${I}`} x={-4} y={-30} width={8} height={62} rx={2} />
      {marks.map(([y, t]) => (
        <g key={t}>
          <path className="m-ink-line thin" d={`M -4 ${y} H 2`} />
          <text className={`m-text ${y < 0 ? "on-grass" : "on-water"}`} x={9} y={y + 3.5}>{t}</text>
        </g>
      ))}
      {/* Gull on top (+2), fish below (−2). */}
      <g transform="translate(0 -33)">
        <ellipse className={`m-snow ${I}`} cx={0} cy={0} rx={7} ry={4.2} />
        <circle className={`m-snow ${I}`} cx={-5} cy={-4} r={3.2} />
        <path className="m-beak" d="M -8 -4.4 L -11.4 -3.4 L -8 -2.4 Z" />
        <path className="m-wing" d="M -1 -2 L 9 -6 L 6 1 Z" />
        <circle className="m-eye" cx={-5.4} cy={-4.6} r={0.8} />
      </g>
      <g transform="translate(-22 26)">
        <ellipse className={`m-fish ${I}`} cx={0} cy={0} rx={7} ry={4} />
        <path className={`m-fish ${I}`} d="M 6 0 L 12 -4 L 12 4 Z" />
        <circle className="m-eye" cx={-3.5} cy={-1} r={0.9} />
      </g>
      <path className="m-ripple" d="M -36 12 h 10 M 20 18 h 12" />
    </g>
  );
}

function FrogStones() {
  return (
    <g>
      <ellipse className={`m-water ${I}`} cx={0} cy={16} rx={44} ry={15} />
      {[[-28, 18], [-5, 12], [19, 18], [37, 10]].map(([x, y], k) => <ellipse key={k} className={`m-stone ${I}`} cx={x} cy={y} rx={8} ry={4} />)}
      <path className="m-hop" d="M -28 13 C -24 -2 -12 -2 -7 6 M 0 6 C 5 -4 14 -2 18 12" />
      <g transform="translate(-5 4)">
        <ellipse className={`m-frog ${I}`} cx={0} cy={0} rx={9} ry={6.5} />
        <circle className={`m-frog ${I}`} cx={-4.5} cy={-6} r={3.2} />
        <circle className={`m-frog ${I}`} cx={4.5} cy={-6} r={3.2} />
        <circle className="m-eye" cx={-4.5} cy={-6.4} r={1.2} />
        <circle className="m-eye" cx={4.5} cy={-6.4} r={1.2} />
        <path className="m-ink-line thin" d="M -4 0 C -2 2 2 2 4 0" />
      </g>
      <text className="m-text on-grass" x={6} y={-16} textAnchor="middle">2x + 3 = 11</text>
    </g>
  );
}

function WaterWheel() {
  const cx = 18, cy = 4, r = 19;
  const spokes = [0, 45, 90, 135].map((a) => {
    const [x1, y1] = ep(cx, cy, r, r, a);
    const [x2, y2] = ep(cx, cy, r, r, a + 180);
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  });
  return (
    <g>
      <rect className={`m-wall ${I}`} x={-40} y={-10} width={36} height={36} />
      <path className={`m-flower ${I}`} d="M -44 -10 L -22 -32 L 0 -10 Z" />
      <rect className="m-door" x={-28} y={10} width={10} height={16} rx={2} />
      <rect className="m-sign" x={-36} y={-4} width={7} height={7} />
      <path className="m-water" d="M -2 24 C 8 20 18 28 28 24 S 40 20 44 24 V 32 H -2 Z" />
      <circle className={`m-wheel ${I}`} cx={cx} cy={cy} r={r} />
      <path className="m-spoke" d={spokes.join(" ")} />
      <circle className={`m-wood ${I}`} cx={cx} cy={cy} r={3.5} />
      <path className="m-arc" d={`M ${cx + 9} ${cy} A 9 9 0 0 0 ${(cx + 9 * Math.cos(-Math.PI / 4)).toFixed(1)} ${(cy + 9 * Math.sin(-Math.PI / 4)).toFixed(1)}`} />
      <text className="m-text on-grass" x={cx + 6} y={cy - 24} textAnchor="middle">45°</text>
    </g>
  );
}

function DuckPond() {
  return (
    <g>
      <ellipse className={`m-water ${I}`} cx={0} cy={14} rx={44} ry={17} />
      <ellipse className="m-tree" cx={30} cy={22} rx={7} ry={3} />
      <Duck x={-26} y={10} />
      <Duck x={-4} y={20} flip />
      <Duck x={12} y={6} />
      <Duck x={30} y={14} white flip />
      <path className="m-reed" d="M -38 2 C -39 -8 -38 -14 -40 -22 M -33 4 C -33 -8 -32 -14 -31 -20" />
      <text className="m-text on-grass" x={6} y={-14} textAnchor="middle">3 of 4</text>
    </g>
  );
}

function SquareRootTree() {
  return (
    <g>
      <rect className="m-dirt" x={-24} y={2} width={48} height={38} rx={4} />
      <path className="m-ink-line thin" d="M -40 2 H 40" />
      <rect className={`m-trunk ${I}`} x={-4} y={-16} width={8} height={20} />
      <circle className={`m-tree ${I}`} cx={0} cy={-28} r={15} />
      <circle className={`m-tree-2 ${I}`} cx={-11} cy={-20} r={8} />
      <circle className={`m-tree-2 ${I}`} cx={11} cy={-21} r={8} />
      <path className="m-root" d="M 0 4 V 9 M -14 9 H 14 V 37 H -14 Z M -7 9 V 37 M 0 9 V 37 M 7 9 V 37 M -14 16 H 14 M -14 23 H 14 M -14 30 H 14" />
      <text className="m-text on-grass" x={34} y={-16} textAnchor="middle">√16</text>
      <text className="m-text on-grass" x={34} y={-5} textAnchor="middle">= 4</text>
    </g>
  );
}

function SkiLifts() {
  // Cable A: (−40, 22) → (40, −24). Cable B: (−40, −20) → (40, 18). They cross near (−1, 0).
  return (
    <g>
      <rect className={`m-rock-2 ${I}`} x={-42} y={-20} width={4} height={52} />
      <rect className={`m-rock-2 ${I}`} x={38} y={-24} width={4} height={56} />
      <path className="m-cable" d="M -40 22 L 40 -24 M -40 -20 L 40 18" />
      {[[-24, 12.8], [22, -13.6]].map(([x, y], k) => (
        <g key={k}><path className="m-ink-line thin" d={`M ${x} ${y} v 6`} /><rect className={`m-flower ${I}`} x={x - 5} y={y + 6} width={10} height={8} rx={2} /></g>
      ))}
      {[[-22, -10], [20, 8.5]].map(([x, y], k) => (
        <g key={k}><path className="m-ink-line thin" d={`M ${x} ${y} v 6`} /><rect className={`m-bird ${I}`} x={x - 5} y={y + 6} width={10} height={8} rx={2} /></g>
      ))}
      <Star x={-1} y={-1} r={6.5} />
    </g>
  );
}

function GoatStairs() {
  return (
    <g>
      <path className={`m-rock ${I}`} d="M -44 30 V 18 H -20 V 6 H 4 V -6 H 28 V -18 H 44 V 30 Z" />
      <path className="m-hop" d="M -44 18 L 28 -18" />
      <text className="m-text on-rock" x={-24} y={15.5} textAnchor="end">1</text>
      <text className="m-text on-rock" x={-8} y={3} textAnchor="middle">2</text>
      <g transform="translate(36 -25)">
        <ellipse className={`m-snow ${I}`} cx={0} cy={0} rx={7.5} ry={4.5} />
        <path className="m-ink-line thin" d="M -4 3 V 7 M 4 3 V 7" />
        <circle className={`m-snow ${I}`} cx={-7} cy={-4} r={3.2} />
        <path className="m-horn" d="M -7 -7 C -6 -11 -3 -11 -2 -9" />
        <circle className="m-eye" cx={-8} cy={-4.4} r={0.8} />
      </g>
    </g>
  );
}

function MirrorLake() {
  return (
    <g>
      <ellipse className={`m-water ${I}`} cx={0} cy={16} rx={44} ry={14} />
      <path className={`m-flower ${I}`} d="M -20 4 L -2 -26 L 16 4 Z" />
      <path className="m-door" d="M -7 4 L -2 -8 L 3 4 Z" />
      <path className="m-flower m-reflect" d="M -20 6 L -2 28 L 16 6 Z" />
      <path className={`m-tree ${I}`} d="M 30 -22 L 38 4 H 22 Z" />
      <path className="m-tree m-reflect" d="M 30 26 L 38 6 H 22 Z" />
      <path className="m-ripple" d="M -38 16 h 10 M 18 22 h 12" />
    </g>
  );
}

function Observatory() {
  const stars: [number, number][] = [[8, 22], [15, 6], [23, 8], [31, -12], [40, -22]];
  return (
    <g>
      <path className="m-hop" d="M 2 30 L 44 -32" />
      {stars.map(([x, y]) => <Star key={x} x={x} y={y} r={4.4} />)}
      <rect className={`m-wall ${I}`} x={-40} y={0} width={32} height={28} />
      <path className={`m-rock-2 ${I}`} d="M -42 0 A 18 18 0 0 1 -6 0 Z" />
      <rect className={`m-sign ${I}`} x={-22} y={-24} width={22} height={7} rx={2} transform="rotate(-35 -22 -10)" />
      <rect className="m-door" x={-28} y={12} width={8} height={16} rx={2} />
    </g>
  );
}

export const SIGHTS: Record<string, Sight> = {
  g5: { name: "Pizza picnic", caption: "The pizza was cut into 8 equal slices and the bunny took 1. So 7/8 of the pizza is left.", art: <Pizza /> },
  "g6-rp": { name: "Lemonade stand", caption: "3 cups cost $1.50, so 1 cup costs $1.50 ÷ 3 = $0.50. The price for one is called a unit rate.", art: <Lemonade /> },
  "g6-ns": { name: "Number line fence", caption: "The fence posts are a number line. The bluebird is perched at 1½, halfway between 1 and 2.", art: <NumberFence /> },
  "g6-ee": { name: "Balance seesaw", caption: "A bag of x acorns plus 2 more balances 5 acorns: x + 2 = 5. Take 2 from each side and the bag must hold 3.", art: <Seesaw /> },
  "g6-g": { name: "Cube cabin", caption: "The cabin is 3 cubes long, 2 deep and 2 tall. Its volume is 3 × 2 × 2 = 12 unit cubes.", art: <CubeCabin /> },
  "g6-sp": { name: "Sunflower bar graph", caption: "The sunflowers are 2, 4, 3 and 5 blocks tall. The range is tallest minus shortest: 5 − 2 = 3.", art: <SunflowerGraph /> },
  "g7-rp": { name: "Sale boat", caption: "A $40 fishing net is 25% off. 25% of $40 is $10, so the net costs $40 − $10 = $30.", art: <SaleBoat /> },
  "g7-ns": { name: "Depth pole", caption: "The gull is at +2 and the fish is at −2. They are 2 − (−2) = 4 feet apart.", art: <DepthPole /> },
  "g7-ee": { name: "Frog's stepping stones", caption: "Solve 2x + 3 = 11 one hop at a time. Hop 1: take away 3 to get 2x = 8. Hop 2: divide by 2 to get x = 4.", art: <FrogStones /> },
  "g7-g": { name: "Water wheel", caption: "8 spokes split the wheel into 8 equal angles. A full turn is 360°, so each angle is 360° ÷ 8 = 45°.", art: <WaterWheel /> },
  "g7-sp": { name: "Duck pond", caption: "3 of the 4 ducks are yellow. Pick a duck at random and the chance it's yellow is 3/4.", art: <DuckPond /> },
  "g8-pr": { name: "Square-root tree", caption: "This tree has square roots! They make a 4 × 4 square of 16 little squares, so √16 = 4.", art: <SquareRootTree /> },
  "g8-eq": { name: "Crossing ski lifts", caption: "Each cable is a straight line, and they cross at exactly one point. The solution to a system of two equations is where their lines meet.", art: <SkiLifts /> },
  "g8-f": { name: "Goat stairs", caption: "Each step goes up 1 and across 2. Rise over run gives a slope of 1/2.", art: <GoatStairs /> },
  "g8-g": { name: "Mirror lake", caption: "The tent's reflection is the tent flipped across the water line. A reflection is one kind of transformation.", art: <MirrorLake /> },
  "g8-sp": { name: "Observatory", caption: "These stars almost line up, like points on a scatterplot. The dashed line is a line of best fit.", art: <Observatory /> },
};

/** Animals that wander the lands (one per land). */
export function Critter({ land }: { land: "meadow" | "woods" | "river" | "peaks" }) {
  if (land === "meadow") {
    return (
      <g className="m-flutter">
        <ellipse className={`m-flower ${I}`} cx={-5} cy={-3} rx={5} ry={6} transform="rotate(-20 -5 -3)" />
        <ellipse className={`m-flower ${I}`} cx={5} cy={-3} rx={5} ry={6} transform="rotate(20 5 -3)" />
        <ellipse className="m-flower-2" cx={-4} cy={5} rx={3.4} ry={3.8} />
        <ellipse className="m-flower-2" cx={4} cy={5} rx={3.4} ry={3.8} />
        <path className="m-ink-line thin" d="M 0 -6 V 9 M 0 -6 L -3 -11 M 0 -6 L 3 -11" />
      </g>
    );
  }
  if (land === "woods") {
    return (
      <g>
        <path className={`m-snail ${I}`} d="M -14 8 C -14 4 -10 4 -6 4 H 10 C 14 4 15 0 13 -4 L 16 -8 M 13 -4 L 11 -9 M -14 8 H 12 C 15 8 16 6 16 4" />
        <circle className={`m-flower-2 ${I}`} cx={-2} cy={-2} r={8} />
        <path className="m-shell" d="M -2 -2 m 0 0 a 2 2 0 1 1 2 2 a 4 4 0 1 1 -4 -4 a 6 6 0 1 1 6 6" />
      </g>
    );
  }
  if (land === "river") return <g className="m-bob"><Duck x={0} y={4} /></g>;
  return <path className="m-soar" d="M -14 0 C -10 -6 -4 -6 0 0 C 4 -6 10 -6 14 0 M 6 -14 C 8 -18 12 -18 14 -14 C 16 -18 20 -18 22 -14" />;
}
