import { frac, fromDecimal } from "../lib/rational";
import type { Rng } from "../lib/rng";
import { F, NAMES, choice, fr, money, num, round, trap, traps } from "./helpers";
import type { Problem } from "./types";

/**
 * "Unfamiliar problems" for the end of each session (the roadmap's APPLY habits):
 * multi-step, in context, with an estimate first and a reasonableness check.
 */
export interface Challenge {
  id: string;
  title: string;
  /** Skills that must be solid before this challenge is offered. */
  needs: string[];
  build: (r: Rng) => { intro: string; parts: Problem[] };
}

export const CHALLENGES: Challenge[] = [
  {
    id: "snack-sale",
    title: "The snack-table deal",
    needs: ["g6.rp.unit-rate", "g6.rp.percent"],
    build(r) {
      const n1 = r.int(6, 12), c1 = r.int(25, 60) / 100;
      const n2 = n1 * 2, c2 = round(c1 * r.pick([0.8, 0.9, 1.1]), 2);
      const p1 = round(n1 * c1, 2), p2 = round(n2 * c2, 2);
      const off = r.pick([10, 20, 25]);
      const better = c1 < c2 ? 1 : 2;
      const bestPrice = better === 1 ? p1 : p2;
      const sale = round(bestPrice * (1 - off / 100), 2);
      return {
        intro: `Your class is buying juice boxes. Pack A has ${n1} for ${money(p1)}. Pack B has ${n2} for ${money(p2)}. The store also has a ${off}% off coupon for one pack.`,
        parts: [
          {
            prompt: "Estimate first: about how much does ONE juice box cost in Pack A?",
            answer: choice(r, `About ${money(Math.round(c1 * 10) / 10)}`, [`About ${money(Math.round(c1 * 10) / 10 + 1)}`, `About ${money(p1)}`]),
            hints: [`${money(p1)} split among ${n1} boxes.`],
            steps: [`${money(p1)} ÷ ${n1} ≈ ${money(c1)}`],
          },
          {
            prompt: "Which pack has the lower price per juice box?",
            answer: choice(r, better === 1 ? "Pack A" : "Pack B", [better === 1 ? "Pack B" : "Pack A"], true),
            hints: ["Find the unit price of each pack.", `${money(p1)} ÷ ${n1} and ${money(p2)} ÷ ${n2}`],
            steps: [`A: ${money(c1)} each`, `B: ${money(c2)} each`],
          },
          {
            prompt: `You buy the better pack and use the ${off}% coupon. What do you pay?`,
            answer: num(fromDecimal(sale), { pre: "$", tolerance: 0.011 }),
            hints: [`Find ${off}% of ${money(bestPrice)} and subtract.`, `Or pay ${100 - off}%: ${(100 - off) / 100} × ${money(bestPrice)}.`],
            steps: [`${(100 - off) / 100} × ${money(bestPrice)} = ${money(sale)}`],
            traps: traps(fromDecimal(sale), [trap(fromDecimal(round((bestPrice * off) / 100, 2)), "That's the discount. Subtract it from the price.")]),
          },
          {
            prompt: "Check: does your answer make sense?",
            answer: choice(r, `Yes, it's a bit less than ${money(bestPrice)}, which is what a coupon should do`, ["No, a coupon should make the price higher", "Yes, because it's close to the number of juice boxes"]),
            hints: ["Should a coupon make the price go up or down?"],
            steps: ["A discount lowers the price a little."],
          },
        ],
      };
    },
  },
  {
    id: "recipe",
    title: "Resize the recipe",
    needs: ["g6.rp.tables", "g5.multiply"],
    build(r) {
      const from = r.pick([4, 6, 8]);
      const to = r.pick([2, 3, 12, 6].filter((x) => x !== from));
      const flour = frac(r.int(3, 9), 4);
      const k = frac(to, from);
      const newFlour = frac(flour.n * k.n, flour.d * k.d);
      return {
        intro: `A pancake recipe for ${from} people uses ${fr(flour)} cups of flour. You're cooking for ${to} people.`,
        parts: [
          {
            prompt: `Estimate: will you need more or less flour than ${fr(flour)} cups?`,
            answer: choice(r, to > from ? "More" : "Less", [to > from ? "Less" : "More", "The same"], true),
            hints: [`Is ${to} more or fewer people than ${from}?`],
            steps: [to > from ? "More people → more flour" : "Fewer people → less flour"],
          },
          {
            prompt: `By what number should you multiply every ingredient? (A fraction is fine.)`,
            answer: num(k),
            hints: [`New amount ÷ old amount of people: ${to} ÷ ${from}.`],
            steps: [`${to} ÷ ${from} = ${fr(k)}`],
            traps: traps(k, [trap(frac(from, to), "Divide the NEW number of people by the OLD number.")]),
          },
          {
            prompt: "How many cups of flour do you need?",
            answer: num(newFlour),
            hints: [`${fr(flour)} × ${fr(k)}`],
            steps: [`${fr(flour)} × ${fr(k)} = ${fr(newFlour)} cups`],
            traps: traps(newFlour, [trap(frac(flour.n + (to - from) * flour.d, flour.d), "Recipes scale by multiplying, not adding.")]),
          },
        ],
      };
    },
  },
  {
    id: "garden",
    title: "Build a garden bed",
    needs: ["g6.g.area", "g6.g.volume"],
    build(r) {
      const l = r.int(4, 10), w = r.int(2, 5);
      const h = frac(r.pick([1, 3]), 2);
      const V = frac(l * w * h.n, h.d);
      const bag = r.pick([1, 2]);
      const bags = Math.ceil((l * w * h.n) / h.d / bag);
      return {
        intro: `A raised garden bed is a box ${l} ft long, ${w} ft wide and ${fr(h)} ft deep. Soil comes in bags of ${bag} cubic ${bag === 1 ? "foot" : "feet"}.`,
        parts: [
          {
            prompt: "How many square feet of ground does the bed cover?",
            answer: num(l * w),
            hints: ["Area of the bottom = length × width."],
            steps: [`${l} × ${w} = ${l * w} sq ft`],
          },
          {
            prompt: "How many cubic feet of soil fill it?",
            answer: num(V),
            hints: ["Volume = length × width × depth."],
            steps: [`${l} × ${w} × ${fr(h)} = ${fr(V)} cubic feet`],
            traps: traps(V, [trap(l * w, "That's the area. Multiply by the depth too.")]),
          },
          {
            prompt: "How many bags must you buy? (You can't buy part of a bag.)",
            answer: num(bags),
            hints: [`Volume ÷ ${bag}, then round UP.`],
            steps: [`${fr(V)} ÷ ${bag} = ${round((l * w * h.n) / h.d / bag, 2)} → ${bags} bags`],
            traps: traps(F(bags), [trap(Math.floor((l * w * h.n) / h.d / bag), "Rounding down would leave the bed short of soil. Round up.")]),
          },
        ],
      };
    },
  },
  {
    id: "reading-log",
    title: "Reading log detective",
    needs: ["g6.sp.center"],
    build(r) {
      const days = Array.from({ length: 6 }, () => r.int(10, 40));
      const total = days.reduce((a, b) => a + b, 0);
      const goal = Math.ceil(total / 7 / 5) * 5 + 5;
      const need = goal * 7 - total;
      return {
        intro: `${r.pick(NAMES)} read ${days.join(", ")} minutes on six days. The goal is a mean of ${goal} minutes per day over 7 days.`,
        parts: [
          {
            prompt: "How many minutes in total for the six days?",
            answer: num(total),
            hints: ["Add them up."],
            steps: [`${days.join(" + ")} = ${total}`],
          },
          {
            prompt: `For a mean of ${goal} over 7 days, what total is needed?`,
            answer: num(goal * 7),
            hints: ["Mean × number of days = total."],
            steps: [`${goal} × 7 = ${goal * 7}`],
          },
          {
            prompt: "How many minutes must be read on day 7?",
            answer: num(need),
            hints: ["Needed total − total so far."],
            steps: [`${goal * 7} − ${total} = ${need}`],
          },
          {
            prompt: "Is that reasonable?",
            answer: choice(r, need > 60 ? "It's possible but a lot. The earlier days were below the goal." : "Yes, it's in a normal range for one day.", ["No, the answer must be wrong because it's not equal to the goal", "Means can't be used to plan ahead"]),
            hints: ["Compare it with the other days."],
            steps: [`Day 7 needs ${need} minutes.`],
          },
        ],
      };
    },
  },
  {
    id: "map-trip",
    title: "Road trip by map",
    needs: ["g7.g.scale", "g6.rp.unit-rate"],
    build(r) {
      const scale = r.pick([10, 20, 25, 50]);
      const cm = r.int(3, 12);
      const speed = r.pick([40, 50, 60]);
      const dist = cm * scale;
      const hrs = round(dist / speed, 2);
      return {
        intro: `On a map, 1 cm stands for ${scale} miles. Two towns are ${cm} cm apart. The car drives ${speed} miles per hour.`,
        parts: [
          { prompt: "How many miles apart are the towns?", answer: num(dist), hints: [`${cm} × ${scale}`], steps: [`${cm} × ${scale} = ${dist} miles`] },
          {
            prompt: "Estimate: about how long will the drive take?",
            answer: choice(r, `About ${Math.max(1, Math.round(dist / speed))} hour${Math.round(dist / speed) === 1 ? "" : "s"}`, [`About ${Math.round(dist / speed) + 4} hours`, `About ${dist} hours`]),
            hints: [`How many ${speed}-mile hours fit in ${dist} miles?`],
            steps: [`${dist} ÷ ${speed} ≈ ${hrs}`],
          },
          {
            prompt: "Exactly how many hours? (Decimal is fine.)",
            answer: num(fromDecimal(hrs), { tolerance: 0.011 }),
            hints: ["Time = distance ÷ speed."],
            steps: [`${dist} ÷ ${speed} = ${hrs} hours`],
            traps: traps(fromDecimal(hrs), [trap(dist * speed, "Divide distance by speed.")]),
          },
        ],
      };
    },
  },
  {
    id: "pizza",
    title: "Which pizza is the better deal?",
    needs: ["g7.g.circles", "g6.rp.unit-rate"],
    build(r) {
      const d1 = r.pick([10, 12]), d2 = r.pick([14, 16]);
      const p1 = r.int(8, 11), p2 = r.int(12, 18);
      const a1 = round(3.14 * (d1 / 2) ** 2, 2), a2 = round(3.14 * (d2 / 2) ** 2, 2);
      const u1 = a1 / p1, u2 = a2 / p2;
      return {
        intro: `A ${d1}-inch pizza costs $${p1}. A ${d2}-inch pizza costs $${p2}. (The inches are diameters. Use π ≈ 3.14.)`,
        parts: [
          { prompt: `What is the area of the ${d1}-inch pizza in square inches?`, answer: num(fromDecimal(a1), { tolerance: 0.5 }), hints: [`Radius is ${d1 / 2}.`, "A = πr²"], steps: [`3.14 × ${d1 / 2}² = ${a1}`], traps: traps(fromDecimal(a1), [trap(fromDecimal(round(3.14 * d1 * d1, 2)), "Use the radius (half the diameter).")]) },
          { prompt: `What is the area of the ${d2}-inch pizza?`, answer: num(fromDecimal(a2), { tolerance: 0.5 }), hints: [`Radius is ${d2 / 2}.`], steps: [`3.14 × ${d2 / 2}² = ${a2}`] },
          {
            prompt: "Which pizza gives more pizza per dollar?",
            answer: choice(r, u1 > u2 ? `The ${d1}-inch pizza` : `The ${d2}-inch pizza`, [u1 > u2 ? `The ${d2}-inch pizza` : `The ${d1}-inch pizza`], true),
            hints: ["Square inches ÷ dollars for each."],
            steps: [`${d1}": ${round(u1, 1)} sq in per $`, `${d2}": ${round(u2, 1)} sq in per $`],
          },
        ],
      };
    },
  },
  {
    id: "temps",
    title: "Weather watcher",
    needs: ["g7.ns.word"],
    build(r) {
      const lo = -r.int(3, 15), rise = r.int(8, 25), drop = r.int(5, 20);
      const noon = lo + rise, night = noon - drop;
      return {
        intro: `At sunrise it was ${lo < 0 ? "−" + -lo : lo}°F. By noon it rose ${rise}°. By midnight it dropped ${drop}° from noon.`,
        parts: [
          { prompt: "What was the noon temperature?", answer: num(noon), hints: [`${lo} + ${rise}`], steps: [`${lo} + ${rise} = ${noon}`] },
          { prompt: "What was the midnight temperature?", answer: num(night), hints: [`${noon} − ${drop}`], steps: [`${noon} − ${drop} = ${night}`] },
          { prompt: "How many degrees warmer was noon than sunrise? (Check with your first answer.)", answer: num(rise), hints: [`noon − sunrise = ${noon} − (${lo})`], steps: [`${noon} − (${lo}) = ${rise}`] },
        ],
      };
    },
  },
  {
    id: "phone-plans",
    title: "Pick a phone plan",
    needs: ["g8.eq.multistep"],
    build(r) {
      let f1: number, m1: number, m2: number, x: number, f2: number;
      do {
        f1 = r.int(15, 40);
        m1 = r.int(2, 5);
        m2 = m1 + r.int(2, 4);
        x = r.int(2, 6);
        f2 = f1 + m1 * x - m2 * x;
      } while (f2 <= 0);
      return {
        intro: `Plan A: $${f1} plus $${m1} per GB. Plan B: $${f2} plus $${m2} per GB.`,
        parts: [
          { prompt: `How many GB make the plans cost the same?`, answer: num(x), hints: [`${f1} + ${m1}g = ${f2} + ${m2}g`], steps: [`${f1 - f2} = ${m2 - m1}g`, `g = ${x}`] },
          { prompt: "What do they both cost then?", answer: num(f1 + m1 * x, { pre: "$" }), hints: ["Substitute into either plan."], steps: [`${f1} + ${m1}(${x}) = ${f1 + m1 * x}`] },
          { prompt: `Which plan is cheaper if you use ${x + 3} GB?`, answer: choice(r, "Plan A", ["Plan B"], true), hints: ["Plan B adds more per GB, so after they meet, B costs more."], steps: [`A: ${f1 + m1 * (x + 3)}; B: ${f2 + m2 * (x + 3)}`] },
        ],
      };
    },
  },
  {
    id: "tv",
    title: "Will the TV fit?",
    needs: ["g8.g.pythagorean"],
    build(r) {
      const [w, h, d] = r.pick([[48, 27, 55], [40, 30, 50], [32, 24, 40], [36, 27, 45]]);
      const space = w + r.pick([-4, 2, 6]);
      return {
        intro: `TVs are measured diagonally. A ${d}-inch TV screen is ${h} inches tall. A cabinet opening is ${space} inches wide.`,
        parts: [
          { prompt: "How wide is the screen?", answer: num(w), hints: ["Width² + height² = diagonal²", `√(${d}² − ${h}²)`], steps: [`${d * d} − ${h * h} = ${w * w}`, `√${w * w} = ${w}`], traps: traps(F(w), [trap(d - h, "Use the Pythagorean theorem, not subtraction of the sides.")]) },
          { prompt: "Will it fit in the cabinet?", answer: choice(r, space >= w ? "Yes" : "No", [space >= w ? "No" : "Yes"], true), hints: [`Compare ${w} with ${space}.`], steps: [`${w} ${space >= w ? "≤" : ">"} ${space}`] },
        ],
      };
    },
  },
  {
    id: "spinner",
    title: "Carnival spinner",
    needs: ["g7.sp.compound"],
    build(r) {
      const n = r.pick([4, 5, 6]);
      const plays = n * 2 * r.int(5, 10);
      return {
        intro: `A game flips a coin and spins a spinner with ${n} equal sections. You win if you get heads AND the spinner lands on 1.`,
        parts: [
          { prompt: "How many equally likely outcomes are there?", answer: num(2 * n), hints: ["2 coin results × spinner results"], steps: [`2 × ${n} = ${2 * n}`] },
          { prompt: "What is P(win)?", answer: num(frac(1, 2 * n)), hints: ["One winning outcome."], steps: [`{1/${2 * n}}`] },
          { prompt: `If you play ${plays} times, about how many wins should you expect?`, answer: num(plays / (2 * n)), hints: [`${plays} × {1/${2 * n}}`], steps: [`${plays} ÷ ${2 * n} = ${plays / (2 * n)}`] },
        ],
      };
    },
  },
  {
    id: "savings",
    title: "Saving for a bike",
    needs: ["g8.f.linear-models"],
    build(r) {
      const start = r.int(10, 60), per = r.int(5, 15);
      const price = start + per * r.int(6, 15) + r.int(0, per - 1);
      const weeks = Math.ceil((price - start) / per);
      return {
        intro: `You have $${start} and save $${per} each week. The bike costs $${price}.`,
        parts: [
          { prompt: "Write the savings equation: y = ?x + ?", answer: { kind: "multi", fields: [{ value: F(per), pre: "y =", post: "x" }, { value: F(start), pre: "+" }] }, hints: ["Weekly amount is the slope; starting amount is b."], steps: [`y = ${per}x + ${start}`] },
          { prompt: "After how many whole weeks can you afford the bike?", answer: num(weeks), hints: [`${per}x + ${start} ≥ ${price}`, "Round up to a whole week."], steps: [`(${price} − ${start}) ÷ ${per} = ${round((price - start) / per, 2)} → ${weeks} weeks`], traps: traps(F(weeks), [trap(Math.floor((price - start) / per), "That's not quite enough yet. Round UP.")]) },
        ],
      };
    },
  },
];

// ---------- Stage challenges (one per grade, from the roadmap) ----------

export interface Mission {
  id: string;
  grade: 6 | 7 | 8;
  title: string;
  blurb: string;
  needs: string[];
  build: (r: Rng) => { intro: string; parts: (Problem & { section: string })[] };
}

export const MISSIONS: Mission[] = [
  {
    id: "party",
    grade: 6,
    title: "Plan a small party",
    blurb: "Compare prices, resize a recipe, sketch a layout and summarize guest preferences.",
    needs: ["g6.rp.unit-rate", "g6.rp.tables", "g6.g.area", "g6.sp.center"],
    build(r) {
      const guests = r.int(8, 14);
      const cupsPer = frac(1, 2);
      const lemonCups = frac(guests * cupsPer.n, cupsPer.d);
      const votes = [r.int(2, 6), r.int(1, 5), r.int(1, 4)];
      const prefs = ["pizza", "tacos", "pasta"];
      const top = prefs[votes.indexOf(Math.max(...votes))];
      const l = r.int(12, 20), w = r.int(10, 15);
      const tableA = r.int(2, 4) * 2;
      const ages = Array.from({ length: 5 }, () => r.int(9, 12));
      const ageMean = ages.reduce((a, b) => a + b, 0) / ages.length;
      const plates1 = r.int(20, 30), cost1 = round(plates1 * r.int(8, 15) / 100, 2);
      const plates2 = plates1 + 20, cost2 = round(plates2 * r.int(8, 15) / 100, 2);
      const u1 = cost1 / plates1, u2 = cost2 / plates2;
      return {
        intro: `You're planning a party for ${guests} guests. Let's do the math!`,
        parts: [
          { section: "Compare prices", prompt: `Plates: ${plates1} for ${money(cost1)} or ${plates2} for ${money(cost2)}. Which costs less per plate?`, answer: choice(r, u1 <= u2 ? `${plates1} for ${money(cost1)}` : `${plates2} for ${money(cost2)}`, [u1 <= u2 ? `${plates2} for ${money(cost2)}` : `${plates1} for ${money(cost1)}`], true), hints: ["Divide price by number of plates."], steps: [`${money(round(u1, 3))} vs ${money(round(u2, 3))} per plate`] },
          { section: "Resize a recipe", prompt: `Each guest drinks {1/2} cup of lemonade. How many cups do you need for ${guests} guests?`, answer: num(lemonCups), hints: [`${guests} × {1/2}`], steps: [`${guests} × {1/2} = ${fr(lemonCups)}`] },
          { section: "Resize a recipe", prompt: `A lemonade mix uses 1 scoop for every 4 cups. How many scoops for ${fr(lemonCups)} cups? (A fraction or decimal is fine.)`, answer: num(frac(lemonCups.n, lemonCups.d * 4)), hints: ["Cups ÷ 4"], steps: [`${fr(lemonCups)} ÷ 4 = ${fr(frac(lemonCups.n, lemonCups.d * 4))}`] },
          { section: "Sketch a layout", prompt: `The party room is ${l} ft by ${w} ft. What is its area?`, answer: num(l * w), hints: ["length × width"], steps: [`${l} × ${w} = ${l * w} sq ft`] },
          { section: "Sketch a layout", prompt: `Each table takes up 6 sq ft and seats ${tableA / 2 + 2} guests. How many tables do you need for ${guests} guests?`, answer: num(Math.ceil(guests / (tableA / 2 + 2))), hints: ["Guests ÷ seats per table, rounded up."], steps: [`${guests} ÷ ${tableA / 2 + 2} → ${Math.ceil(guests / (tableA / 2 + 2))} tables`] },
          { section: "Guest preferences", prompt: `Guests voted: pizza ${votes[0]}, tacos ${votes[1]}, pasta ${votes[2]}. Which food is the mode?`, answer: choice(r, top, prefs.filter((p) => p !== top)), hints: ["The mode is the most common choice."], steps: [`${top} has the most votes`] },
          { section: "Guest preferences", prompt: `Five guests' ages are ${ages.join(", ")}. What is the mean age?`, answer: num(fromDecimal(ageMean)), hints: ["Add the ages and divide by 5."], steps: [`${ages.reduce((a, b) => a + b, 0)} ÷ 5 = ${ageMean}`] },
        ],
      };
    },
  },
  {
    id: "board-game",
    grade: 7,
    title: "Design a board game",
    blurb: "Calculate winning chances, test them with a simulation and compare results with predictions.",
    needs: ["g7.sp.probability", "g7.sp.compound"],
    build(r) {
      const target = r.pick([6, 7, 8]);
      const ways = 6 - Math.abs(7 - target);
      const rolls = 120;
      return {
        intro: `In your game, a player rolls two dice. Landing a sum of ${target} lets them jump ahead. Let's see how often that happens.`,
        parts: [
          { section: "Predict", prompt: "How many equally likely outcomes are there with two dice?", answer: num(36), hints: ["6 × 6"], steps: ["6 × 6 = 36"] },
          { section: "Predict", prompt: `How many of those outcomes give a sum of ${target}?`, answer: num(ways), hints: ["List the pairs: (1, ?), (2, ?), …"], steps: [`${ways} ways`] },
          { section: "Predict", prompt: `What is P(sum = ${target})?`, answer: num(frac(ways, 36)), hints: [`{${ways}/36}`], steps: [`{${ways}/36} = ${fr(frac(ways, 36))}`] },
          { section: "Predict", prompt: `In ${rolls} rolls, about how many times should a ${target} come up?`, answer: num(fromDecimal(round((rolls * ways) / 36, 2)), { tolerance: 0.5 }), hints: [`${rolls} × {${ways}/36}`], steps: [`${rolls} × ${fr(frac(ways, 36))} ≈ ${round((rolls * ways) / 36, 1)}`] },
          { section: "Test it", prompt: `Press “Roll ${rolls} times” to simulate. Was your result close to the prediction?`, answer: choice(r, "Probably close but not exact, because chance varies", ["It must match exactly or the math is wrong", "Simulations can't tell us anything"]), hints: ["Experiments vary from predictions, especially with fewer trials."], steps: ["Results vary; more rolls usually get closer to the prediction."], visual: { type: "dicesim", target, rolls } },
          { section: "Make it fair", prompt: "You want a jump square to happen MORE often. Which sum should trigger it?", answer: choice(r, "7", ["2", "12", "11"]), hints: ["Which sum has the most ways?"], steps: ["7 has 6 ways, the most of any sum"] },
        ],
      };
    },
  },
  {
    id: "bike-rental",
    grade: 8,
    title: "Compare bike-rental plans",
    blurb: "Write equations, graph costs and explain which plan suits different trips.",
    needs: ["g8.f.linear-models", "g8.eq.systems"],
    build(r) {
      const fA = r.int(2, 6) * 2, mA = r.int(1, 3);
      const mB = mA + r.int(1, 2);
      const h = r.int(2, 4);
      const fB = fA + mA * h - mB * h;
      const ok = fB >= 0;
      const [FA, MA, FB, MB, H] = ok ? [fA, mA, fB, mB, h] : [10, 2, 4, 4, 3];
      const cost = FA + MA * H;
      return {
        intro: `Shop A charges $${FA} plus $${MA} per hour. Shop B charges $${FB} plus $${MB} per hour.`,
        parts: [
          { section: "Write equations", prompt: "Write Shop A's cost y for x hours: y = ?x + ?", answer: { kind: "multi", fields: [{ value: F(MA), pre: "y =", post: "x" }, { value: F(FA), pre: "+" }] }, hints: ["Rate per hour is the slope; the starting fee is b."], steps: [`y = ${MA}x + ${FA}`] },
          { section: "Write equations", prompt: "Write Shop B's cost: y = ?x + ?", answer: { kind: "multi", fields: [{ value: F(MB), pre: "y =", post: "x" }, { value: F(FB), pre: "+" }] }, hints: ["Rate per hour is the slope; the starting fee is b."], steps: [`y = ${MB}x + ${FB}`] },
          { section: "Graph costs", prompt: "Click where the two cost lines cross.", answer: { kind: "point", x: H, y: cost, min: 0, max: Math.max(12, cost + 2), lines: [{ m: MA, b: FA, label: "A" }, { m: MB, b: FB, label: "B" }] }, hints: ["Find where the lines meet.", `Solve ${MA}x + ${FA} = ${MB}x + ${FB}.`], steps: [`They meet at (${H}, ${cost})`] },
          { section: "Explain", prompt: `Which shop is cheaper for a ${H + 3}-hour ride?`, answer: choice(r, "Shop A", ["Shop B", "They cost the same"]), hints: ["After the lines cross, the one with the smaller rate is cheaper."], steps: [`A: $${FA + MA * (H + 3)}, B: $${FB + MB * (H + 3)}`] },
          { section: "Explain", prompt: `Which shop is cheaper for a 1-hour ride?`, answer: choice(r, H > 1 ? "Shop B" : "They cost the same", H > 1 ? ["Shop A", "They cost the same"] : ["Shop A", "Shop B"]), hints: ["Substitute x = 1 into both."], steps: [`A: $${FA + MA}, B: $${FB + MB}`] },
        ],
      };
    },
  },
];


