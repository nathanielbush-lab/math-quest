import { fmtNum, frac, fromDecimal, type Frac } from "../lib/rational";
import type { Rng } from "../lib/rng";
import { F, NAMES, choice, fr, linear, mixed, money, ms, num, round, sn, term, trap, traps } from "./helpers";
import { finishSteps, fracDivide, fracTimes, multiplySteps, piTimes, places, raw, simplifySteps, st } from "./steps";
import type { Problem } from "./types";

/** "1 bag", "3 bags". */
const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Dollars with as many decimals as needed (e.g. $0.365), so exact in-between values can be shown before rounding. */
const cash = (x: number) => {
  const v = Number(x.toFixed(4));
  return places(v) <= 2 ? money(v) : `$${v}`;
};

/** " (= 0.75)" after a fraction that has a short decimal; empty for whole numbers and repeating decimals. */
const decNote = (f: Frac) => {
  if (f.d === 1) return "";
  let d = f.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1 ? ` (= ${fmtNum(f.n / f.d)})` : "";
};

/** "cup" for amounts up to 1, "cups" above. */
const cupWord = (f: Frac) => (f.n <= f.d ? "cup" : "cups");

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
      const cheap = better === 1 ? "A" : "B";
      const bestPrice = better === 1 ? p1 : p2;
      // Work in whole cents so a half cent always rounds up (3.285 → 3.29).
      const cents = Math.round(bestPrice * 100);
      const sale = Math.round((cents * (100 - off)) / 100) / 100;
      const disc = (cents * off) / 10000;
      const exactSale = (cents * (100 - off)) / 10000;
      const est = Math.round(c1 * 10) / 10;
      const [lo, hi] = c1 < c2 ? [c1, c2] : [c2, c1];
      const discWork =
        off === 10
          ? `10% is one tenth: ${money(bestPrice)} ÷ 10 = ${cash(disc)}.`
          : off === 20
            ? `10% is ${money(bestPrice)} ÷ 10 = ${cash(cents / 1000)}, so 20% is 2 × ${cash(cents / 1000)} = ${cash(disc)}.`
            : `25% is one quarter: ${money(bestPrice)} ÷ 4 = ${cash(disc)}.`;
      return {
        intro: `Your class is buying juice boxes. Pack A has ${n1} for ${money(p1)}. Pack B has ${n2} for ${money(p2)}. The store also has a ${off}% off coupon for one pack.`,
        parts: [
          {
            prompt: "Estimate first: about how much does ONE juice box cost in Pack A?",
            answer: choice(r, `About ${money(est)}`, [`About ${money(est + 1)}`, `About ${money(p1)}`]),
            hints: [
              `You want the price of ONE box, so split ${money(p1)} among ${n1} boxes: ${money(p1)} ÷ ${n1}.`,
              `To estimate, try dimes: ${n1} boxes at $0.10 each would cost ${money(n1 / 10)}. How many dimes per box get you close to ${money(p1)}?`,
            ],
            steps: [
              st("We want the price of ONE box.", `Split the price of Pack A among its boxes: ${money(p1)} ÷ ${n1}.`),
              st("Divide.", `${money(p1)} ÷ ${n1} = ${money(c1)} per box`),
              st("Round to the nearest 10 cents.", `${money(c1)} is closest to ${money(est)}.`),
              st("Check the estimate.", `${n1} × ${money(est)} = ${money(n1 * est)}, which is not far from ${money(p1)} ✔`),
              st("Answer.", `About ${money(est)} per box`),
            ],
          },
          {
            prompt: "Which pack has the lower price per juice box?",
            answer: choice(r, better === 1 ? "Pack A" : "Pack B", [better === 1 ? "Pack B" : "Pack A"], true),
            hints: [
              "The packs have different numbers of boxes, so compare the price of ONE box in each pack.",
              `Pack A: ${money(p1)} ÷ ${n1}. Pack B: ${money(p2)} ÷ ${n2}. The smaller price per box is the better deal.`,
              `Shortcut: Pack B has twice as many boxes. Is 2 × ${money(p1)} more or less than Pack B's ${money(p2)}?`,
            ],
            steps: [
              st("Compare the price of ONE box.", "The packs have different numbers of boxes, so comparing the pack prices isn't fair. Divide each price by its number of boxes."),
              st("Pack A.", `${money(p1)} ÷ ${n1} = ${money(c1)} per box`),
              st("Pack B.", `${money(p2)} ÷ ${n2} = ${money(c2)} per box`),
              st("Compare.", `${money(lo)} is less than ${money(hi)}, so Pack ${cheap} is cheaper per box.`),
              st("Check another way.", `Pack B has twice as many boxes as Pack A. Two Pack A's would cost 2 × ${money(p1)} = ${money(2 * p1)}, which is ${better === 1 ? "less" : "more"} than Pack B's ${money(p2)} ✔`),
              st("Answer.", `Pack ${cheap}`),
            ],
          },
          {
            prompt: `You buy the better pack and use the ${off}% coupon. What do you pay?`,
            answer: num(fromDecimal(sale), { pre: "$", tolerance: 0.011 }),
            hints: [
              `The coupon takes ${off}% off the better pack. Find ${off}% of ${money(bestPrice)}, then subtract it from ${money(bestPrice)}.`,
              off === 10
                ? `10% is one tenth: ${money(bestPrice)} ÷ 10.`
                : off === 20
                  ? `10% is ${money(bestPrice)} ÷ 10. Double that to get 20%.`
                  : `25% is one quarter: ${money(bestPrice)} ÷ 4.`,
              `Subtract that discount from ${money(bestPrice)}.${places(exactSale) > 2 ? " Then round to the nearest cent." : ""}`,
            ],
            steps: [
              st("Start with the better pack.", `Pack ${cheap} costs ${money(bestPrice)}.`),
              st(`Find ${off}% of ${money(bestPrice)}.`, discWork),
              st("Subtract the discount.", `${money(bestPrice)} − ${cash(disc)} = ${cash(exactSale)}`),
              ...(places(exactSale) > 2 ? [st("Round to the nearest cent.", `${cash(exactSale)} rounds to ${money(sale)}.`)] : []),
              st("Check another way.", `${off}% off means you pay ${100 - off}% of the price: ${(100 - off) / 100} × ${money(bestPrice)} = ${cash(exactSale)} ✔`),
              st("Answer.", money(sale)),
            ],
            traps: traps(fromDecimal(sale), [trap(fromDecimal(round((bestPrice * off) / 100, 2)), "That's the discount. Subtract it from the price.")]),
          },
          {
            prompt: "Check: does your answer make sense?",
            answer: choice(r, `Yes, it's a bit less than ${money(bestPrice)}, which is what a coupon should do`, ["No, a coupon should make the price higher", "Yes, because it's close to the number of juice boxes"]),
            hints: [
              `A coupon takes money off. Should you pay more or less than the regular ${money(bestPrice)}?`,
              `Only ${off}% comes off, so the new price should be a little less than ${money(bestPrice)}, not a lot less. Is yours?`,
            ],
            steps: [
              st("A coupon takes money off.", `So you should pay LESS than the regular ${money(bestPrice)}, but only ${off}% less, so not a lot less.`),
              st("Compare.", `${money(sale)} is a little less than ${money(bestPrice)}. You save about ${money((cents - Math.round(sale * 100)) / 100)} ✔`),
              st("Answer.", "Yes, it makes sense."),
            ],
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
      const more = to > from;
      return {
        intro: `A pancake recipe for ${from} people uses ${fr(flour)} ${cupWord(flour)} of flour. You're cooking for ${to} people.`,
        parts: [
          {
            prompt: `Estimate: will you need more or less flour than ${fr(flour)} ${cupWord(flour)}?`,
            answer: choice(r, more ? "More" : "Less", [more ? "Less" : "More", "The same"], true),
            hints: [
              `The recipe is for ${from} people. Is ${to} more or fewer people than that?`,
              "More people eat more pancakes. Fewer people eat fewer pancakes.",
            ],
            steps: [
              st("Compare the number of people.", `${to} people is ${more ? "more" : "fewer"} than ${from} people.`),
              st("Think it through.", more ? "More people eat more pancakes, so you need more flour." : "Fewer people eat fewer pancakes, so you need less flour."),
              st("Answer.", `${more ? "More" : "Less"} than ${fr(flour)} ${cupWord(flour)}`),
            ],
          },
          {
            prompt: `By what number should you multiply every ingredient? (A fraction is fine.)`,
            answer: num(k),
            hints: [
              "The scale factor is new ÷ old: the new number of people divided by the old number of people.",
              `Here that's ${to} ÷ ${from}. Write it as a fraction${k.d !== from ? ", then simplify: divide the top and bottom by the same number" : " and check whether it simplifies"}.`,
            ],
            steps: [
              st("Scale factor = new ÷ old.", `You're going from ${from} people to ${to} people, so divide the new number by the old one: ${to} ÷ ${from} = ${raw(to, from)}.`),
              ...simplifySteps(to, from),
              st("Check.", `${from} × ${fr(k)} = ${to} ✔ ${more ? "It's bigger than 1 because the recipe grows." : "It's less than 1 because the recipe shrinks."}`),
              st("Answer.", `Multiply every ingredient by ${fr(k)}.`),
            ],
            traps: traps(k, [trap(frac(from, to), "Divide the NEW number of people by the OLD number.")]),
          },
          {
            prompt: "How many cups of flour do you need?",
            answer: num(newFlour),
            hints: [
              `Multiply the old amount of flour by the scale factor: ${fr(flour)} × ${fr(k)}.`,
              flour.d === 1 && k.d === 1
                ? `Multiply ${flour.n} × ${k.n}.`
                : `${flour.d === 1 ? `Write ${flour.n} as {${flour.n}/1}. ` : k.d === 1 ? `Write ${k.n} as {${k.n}/1}. ` : ""}Multiply the tops (${flour.n} × ${k.n}) and the bottoms (${flour.d} × ${k.d}). Then simplify if you can.`,
              `Does it make sense? ${more ? "More" : "Fewer"} people, so your answer should be ${more ? "more" : "less"} than ${mixed(flour)}.`,
            ],
            steps: [
              st("Multiply the old amount by the scale factor.", `${fr(flour)} × ${fr(k)}`),
              st(flour.d === 1 && k.d === 1 ? "Multiply." : "Multiply the tops and multiply the bottoms.", fracTimes(flour, k)),
              st("Does it make sense?", `${more ? "More" : "Fewer"} people, and ${mixed(newFlour)} is ${more ? "more" : "less"} than ${mixed(flour)} ✔`),
              st("Answer.", `${mixed(newFlour)} ${cupWord(newFlour)} of flour${decNote(newFlour)}`),
            ],
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
      const A = l * w;
      const q = frac(V.n, V.d * bag);
      const short = Math.floor((l * w * h.n) / h.d / bag);
      return {
        intro: `A raised garden bed is a box ${l} ft long, ${w} ft wide and ${fr(h)} ft deep. Soil comes in bags of ${bag} cubic ${bag === 1 ? "foot" : "feet"}.`,
        parts: [
          {
            prompt: "How many square feet of ground does the bed cover?",
            answer: num(l * w),
            hints: [
              "The bed sits on a rectangle of ground. Area of a rectangle = length × width.",
              `The length is ${l} ft and the width is ${w} ft. Leave out the depth: it doesn't change how much ground is covered.`,
            ],
            steps: [
              st("The bed sits on a rectangle of ground.", "The area of a rectangle is length × width."),
              st("Multiply.", `${l} × ${w} = ${A}`),
              st("Answer.", `${A} square feet`),
            ],
          },
          {
            prompt: "How many cubic feet of soil fill it?",
            answer: num(V),
            hints: [
              `Volume = length × width × depth. You already found length × width: it's the area, ${A} square feet.`,
              h.n === 1
                ? `Now multiply ${A} by the depth, {1/2}. Multiplying by {1/2} is the same as taking half.`
                : `Now multiply ${A} by the depth, {3/2}. {3/2} is 1{1/2}, so take all of ${A} plus half of ${A}.`,
            ],
            steps: [
              st("Volume = length × width × depth.", `Length × width is the area of the bottom, which we already found: ${A} square feet. Now multiply by the depth, ${fr(h)} ft.`),
              h.n === 1
                ? st("Multiply by {1/2}.", `Multiplying by {1/2} is the same as taking half: ${A} ÷ 2 = ${mixed(V)}.`)
                : st("Multiply by {3/2}.", `{3/2} = 1{1/2}, so take all of ${A} plus half of it: ${A} + ${mixed(frac(A, 2))} = ${mixed(V)}.`),
              st("Check with fractions.", `${fracTimes(F(A), h)} ✔`),
              st("Answer.", `${mixed(V)} cubic feet${decNote(V)}`),
            ],
            traps: traps(V, [trap(l * w, "That's the area. Multiply by the depth too.")]),
          },
          {
            prompt: "How many bags must you buy? (You can't buy part of a bag.)",
            answer: num(bags),
            hints: [
              bag === 1
                ? `Each bag holds 1 cubic foot, so you need one bag for every cubic foot of soil you found.`
                : `Each bag holds 2 cubic feet, so divide the soil by 2: ${mixed(V)} ÷ 2.`,
              "If you don't get a whole number, round UP. Rounding down would leave the bed short of soil.",
            ],
            steps: [
              bag === 1
                ? st("Each bag holds 1 cubic foot.", `So you need one bag for every cubic foot: ${mixed(V)} bags' worth of soil.`)
                : st("Divide the soil by the size of one bag.", fracDivide(V, F(2))),
              q.d === 1
                ? st("It comes out even.", `Exactly ${count(bags, "bag")} hold all the soil.`)
                : st("Round UP.", `${mixed(q)} isn't a whole number. ${count(short, "bag")} would hold only ${short * bag} cubic feet, which isn't enough. So buy ${bags}.`),
              st("Check.", `${count(bags, "bag")} × ${bag} = ${bags * bag} cubic feet, and that's at least ${mixed(V)} ✔`),
              st("Answer.", count(bags, "bag")),
            ],
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
      const running: string[] = [];
      days.reduce((acc, d) => {
        running.push(`${acc} + ${d} = ${acc + d}`);
        return acc + d;
      });
      const tens = days.map((d) => Math.round(d / 10) * 10);
      const tensSum = tens.reduce((a, b) => a + b, 0);
      const t = Math.floor(goal / 10) * 10, o = goal % 10;
      const avg = total / 6;
      return {
        intro: `${r.pick(NAMES)} read ${days.join(", ")} minutes on six days. The goal is a mean of ${goal} minutes per day over 7 days.`,
        parts: [
          {
            prompt: "How many minutes in total for the six days?",
            answer: num(total),
            hints: [
              "Add the six days. Keep a running total, adding one day at a time.",
              `Start: ${days[0]} + ${days[1]} = ${days[0] + days[1]}. Then add ${days[2]}, and keep going.`,
              `Check: rounded to the nearest 10, the days add to ${tensSum}. Your total should be close to that.`,
            ],
            steps: [
              st("Add one day at a time.", `Keep a running total: ${running.join("; ")}.`),
              st("Check with an estimate.", `Round each day to the nearest 10: ${tens.join(" + ")} = ${tensSum}, which is close to ${total} ✔`),
              st("Answer.", `${total} minutes`),
            ],
          },
          {
            prompt: `For a mean of ${goal} over 7 days, what total is needed?`,
            answer: num(goal * 7),
            hints: [
              "Mean = total ÷ number of days. Work backward: total = mean × number of days.",
              o && t ? `Multiply ${goal} × 7. Split it up: (${t} × 7) + (${o} × 7).` : `Multiply ${goal} × 7.`,
            ],
            steps: [
              st("Mean = total ÷ number of days.", "Working backward, total = mean × number of days."),
              st("Multiply.", o && t ? `${goal} × 7 = (${t} × 7) + (${o} × 7) = ${t * 7} + ${o * 7} = ${goal * 7}` : `${goal} × 7 = ${goal * 7}`),
              st("Answer.", `${goal * 7} minutes over the 7 days`),
            ],
          },
          {
            prompt: "How many minutes must be read on day 7?",
            answer: num(need),
            hints: [
              "You know the total needed for 7 days and the total read in 6 days. Day 7 has to cover the difference.",
              `Subtract: ${goal * 7} − ${total}.`,
            ],
            steps: [
              st("Find what's still missing.", "Take the total needed and subtract the minutes already read."),
              st("Subtract.", `${goal * 7} − ${total} = ${need}`),
              st("Check.", `${total} + ${need} = ${goal * 7}, and ${goal * 7} ÷ 7 = ${goal} ✔`),
              st("Answer.", `${need} minutes on day 7`),
            ],
          },
          {
            prompt: "Is that reasonable?",
            answer: choice(r, need > 60 ? "It's possible but a lot. The earlier days were below the goal." : "Yes, it's in a normal range for one day.", ["No, the answer must be wrong because it's not equal to the goal", "Means can't be used to plan ahead"]),
            hints: [
              `Compare ${need} minutes with the first six days, which were between ${Math.min(...days)} and ${Math.max(...days)} minutes.`,
              `An hour is 60 minutes. Is ${need} minutes more or less than an hour of reading in one day?`,
            ],
            steps: [
              st("Compare with the other days.", `The first six days were between ${Math.min(...days)} and ${Math.max(...days)} minutes. Day 7 needs ${need}.`),
              need > 60
                ? st("Why so many?", `The first six days averaged ${Number.isInteger(avg * 10) ? "" : "about "}${round(avg, 1)} minutes, which is below the goal of ${goal}. Day 7 has to make up the difference. That's possible, just a lot.`)
                : st("Think about it.", `${need} minutes is an hour or less, a normal amount to read in one day.`),
              st("Answer.", need > 60 ? "It's possible, but it's a lot." : "Yes, it's reasonable."),
            ],
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
      const est = Math.max(1, Math.round(dist / speed));
      const whole = Math.floor(dist / speed), rem = dist - whole * speed;
      const part = frac(rem, speed);
      const partDec = round(rem / speed, 2);
      const exact = (rem * 100) % speed === 0;
      return {
        intro: `On a map, 1 cm stands for ${scale} miles. Two towns are ${cm} cm apart. The car drives ${speed} miles per hour.`,
        parts: [
          {
            prompt: "How many miles apart are the towns?",
            answer: num(dist),
            hints: [
              `Every 1 cm on the map is ${scale} miles, so ${cm} cm is ${cm} groups of ${scale} miles.`,
              `Multiply ${cm} × ${scale}. ${scale === 10 ? "Tip: × 10 puts a 0 on the end." : scale === 20 ? "Tip: × 20 is × 2, then × 10." : scale === 25 ? "Tip: × 25 is a quarter of × 100." : "Tip: × 50 is half of × 100."}`,
            ],
            steps: [
              st(`Each centimeter stands for ${scale} miles.`, `The towns are ${cm} cm apart, so that's ${cm} groups of ${scale} miles.`),
              st("Multiply.", `${cm} × ${scale} = ${dist}`),
              st("Answer.", `${dist} miles`),
            ],
          },
          {
            prompt: "Estimate: about how long will the drive take?",
            answer: choice(r, `About ${est} hour${Math.round(dist / speed) === 1 ? "" : "s"}`, [`About ${Math.round(dist / speed) + 4} hours`, `About ${dist} hours`]),
            hints: [
              `The car goes ${speed} miles each hour. How many ${speed}s fit into ${dist}?`,
              dist % speed === 0
                ? `Count by ${speed}s until you reach ${dist}. Each ${speed} is one hour.`
                : whole === 0
                  ? `In 1 hour the car goes ${speed} miles. Is ${dist} miles closer to 0 miles or to ${speed} miles?`
                  : `${count(whole, "hour")} → ${whole * speed} miles. ${count(whole + 1, "hour")} → ${(whole + 1) * speed} miles. Which is ${dist} closer to?${rem * 2 === speed ? " (If it's exactly halfway, round up.)" : ""}`,
            ],
            steps: [
              st(`The car goes ${speed} miles each hour.`, `So ask: how many ${speed}s fit into ${dist}?`),
              dist % speed === 0
                ? st("Try a whole number of hours.", `${count(est, "hour")} × ${speed} = ${est * speed} miles, exactly the distance.`)
                : whole === 0
                  ? st("Compare with one hour.", `In 1 hour the car goes ${speed} miles. ${dist} miles is less than that, but closer to 1 hour than to 0.`)
                  : st("Try whole numbers of hours on each side.", `${count(whole, "hour")} × ${speed} = ${whole * speed} miles and ${count(whole + 1, "hour")} × ${speed} = ${(whole + 1) * speed} miles. ${dist} is ${rem * 2 === speed ? `exactly halfway, so round up to ${est}` : `closer to ${est * speed}`}.`),
              st("Answer.", `About ${count(est, "hour")}`),
            ],
          },
          {
            prompt: "Exactly how many hours? (Decimal is fine.)",
            answer: num(fromDecimal(hrs), { tolerance: 0.011 }),
            hints: [
              `Time = distance ÷ speed, so divide ${dist} miles by ${speed} miles per hour: ${dist} ÷ ${speed}.`,
              ...(rem === 0
                ? [`How many ${speed}s make ${dist}? Count by ${speed}s.`]
                : [
                    whole > 0
                      ? `Whole hours first: ${count(whole, "hour")} × ${speed} = ${whole * speed} miles. That leaves ${dist} − ${whole * speed} = ${rem} miles.`
                      : `${dist} is less than ${speed}, so the trip takes less than 1 hour.`,
                    `${rem} miles out of ${speed} is {${rem}/${speed}} of an hour. Simplify it, change it to a decimal${exact ? "" : " (round to hundredths)"}${whole ? `, and add it to ${whole}` : ""}.`,
                  ]),
            ],
            steps: [
              st("Time = distance ÷ speed.", `${dist} miles ÷ ${speed} miles per hour`),
              whole > 0
                ? st("Whole hours first.", `${count(whole, "hour")} × ${speed} = ${whole * speed} miles${rem ? `, leaving ${dist} − ${whole * speed} = ${rem} miles` : ". That's the whole trip"}.`)
                : st("Less than one hour.", `${dist} is less than ${speed}, so the trip takes less than 1 hour.`),
              ...(rem
                ? [st(`Turn the ${whole ? "leftover " : ""}miles into part of an hour.`, `${rem} miles out of ${speed} is ${raw(rem, speed)}${part.d !== speed ? ` = ${fr(part)}` : ""} of an hour ${exact ? "=" : "≈"} ${partDec} hour.`)]
                : []),
              ...(rem && whole ? [st("Add the parts.", `${whole} + ${partDec} = ${hrs}`)] : []),
              exact
                ? st("Check.", `${hrs} × ${speed} = ${dist} ✔`)
                : st("Round to hundredths.", `${fr(part)} doesn't come out to a short decimal, so we round. That's why the answer is “about”.`),
              st("Answer.", `${exact ? "" : "About "}${hrs} hour${hrs === 1 ? "" : "s"}`),
            ],
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
      const areaSteps = (d: number, a: number) => {
        const rad = d / 2;
        return [
          st("Find the radius.", `The radius is half the diameter: ${d} ÷ 2 = ${rad} inches.`),
          st("Square the radius.", `${rad}^2 = ${rad} × ${rad} = ${rad * rad}`),
          st("Multiply by π ≈ 3.14.", `A = πr^2 ≈ ${piTimes(rad * rad)}`),
          st("Answer.", `About ${a} square inches`),
        ];
      };
      const areaHints = (d: number) => {
        const rad = d / 2;
        return [
          `Area of a circle: A = πr^2. The radius r is half the diameter: ${d} ÷ 2 = ${rad} inches.`,
          `Square the radius: ${rad} × ${rad}. Then multiply by π ≈ 3.14.`,
          `To multiply by 3.14, do ${rad * rad} × 3, plus ${rad * rad} × 0.14, and add.`,
        ];
      };
      // Use enough decimal places that the two unit rates look different.
      let dp = 1;
      while (dp < 3 && round(u1, dp) === round(u2, dp)) dp++;
      const win = u1 > u2 ? d1 : d2;
      const [big, small] = u1 > u2 ? [u1, u2] : [u2, u1];
      return {
        intro: `A ${d1}-inch pizza costs $${p1}. A ${d2}-inch pizza costs $${p2}. (The inches are diameters. Use π ≈ 3.14.)`,
        parts: [
          { prompt: `What is the area of the ${d1}-inch pizza in square inches?`, answer: num(fromDecimal(a1), { tolerance: 0.5 }), hints: areaHints(d1), steps: areaSteps(d1, a1), traps: traps(fromDecimal(a1), [trap(fromDecimal(round(3.14 * d1 * d1, 2)), "Use the radius (half the diameter).")]) },
          { prompt: `What is the area of the ${d2}-inch pizza?`, answer: num(fromDecimal(a2), { tolerance: 0.5 }), hints: areaHints(d2), steps: areaSteps(d2, a2) },
          {
            prompt: "Which pizza gives more pizza per dollar?",
            answer: choice(r, u1 > u2 ? `The ${d1}-inch pizza` : `The ${d2}-inch pizza`, [u1 > u2 ? `The ${d2}-inch pizza` : `The ${d1}-inch pizza`], true),
            hints: [
              "Find how many square inches you get for each dollar: divide each pizza's area by its price. Bigger is better.",
              `${d1}-inch: ${a1} ÷ ${p1}. ${d2}-inch: ${a2} ÷ ${p2}. Which answer is bigger?`,
            ],
            steps: [
              st("Find square inches per dollar.", "Divide each pizza's area by its price. The bigger number means more pizza for each dollar."),
              st(`${d1}-inch pizza.`, `${a1} ÷ ${p1} ≈ ${round(u1, dp)} square inches per dollar`),
              st(`${d2}-inch pizza.`, `${a2} ÷ ${p2} ≈ ${round(u2, dp)} square inches per dollar`),
              st("Compare.", `${round(big, dp)} > ${round(small, dp)}, so the ${win}-inch pizza gives more pizza for each dollar.`),
              st("Answer.", `The ${win}-inch pizza`),
            ],
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
          {
            prompt: "What was the noon temperature?",
            answer: num(noon),
            hints: [
              `A rise means add: start at ${ms(lo)}° and go up ${rise}°.`,
              rise >= -lo
                ? `Count up to 0 first: that uses ${-lo}° of the rise. How many degrees of the ${rise}° are left to go above 0?`
                : `It takes ${-lo}° to get up to 0, but it only rose ${rise}°. So it's still below zero. By how many degrees?`,
            ],
            steps: [
              st("A rise means add.", `Start at ${ms(lo)}° and go up ${rise}°: ${ms(lo)} + ${rise}.`),
              rise >= -lo
                ? st("Count up to zero first.", `From ${ms(lo)} up to 0 is ${-lo}°. That leaves ${rise} − ${-lo} = ${noon}° more to go up, so we end at ${noon}.`)
                : st("Count up toward zero.", `It would take ${-lo}° to get up to 0, but it only rose ${rise}°. ${-lo} − ${rise} = ${-noon}, so it's still ${-noon}° below zero: ${ms(noon)}.`),
              st("Answer.", `${ms(noon)}°F`),
            ],
          },
          {
            prompt: "What was the midnight temperature?",
            answer: num(night),
            hints: [
              `A drop means subtract: start at ${ms(noon)}° and go down ${drop}°.`,
              noon === 0
                ? `Going down from 0 takes you below zero, so the answer is negative.`
                : noon < 0
                  ? `It's already ${-noon}° below zero. Going down ${drop}° more puts it even further below zero.`
                  : noon >= drop
                    ? `${noon} is at least ${drop}, so it stays at or above zero. Just subtract.`
                    : `Count down to 0 first: that uses ${noon}° of the drop. How many more degrees does it drop below zero?`,
            ],
            steps: [
              st("A drop means subtract.", `${ms(noon)} − ${drop}`),
              noon === 0
                ? st("Go down from zero.", `Going down ${drop}° from 0 lands at ${ms(night)}.`)
                : noon < 0
                  ? st("Go further below zero.", `It's already ${-noon}° below zero. Going down ${drop}° more: ${-noon} + ${drop} = ${-night}° below zero, so ${ms(night)}.`)
                  : noon >= drop
                    ? st("Subtract.", `${noon} − ${drop} = ${night}`)
                    : st("Count down to zero first.", `From ${noon} down to 0 is ${noon}°. That leaves ${drop} − ${noon} = ${drop - noon}° more to drop, so we end at ${ms(night)}.`),
              st("Check.", `${ms(night)} + ${drop} = ${ms(noon)} ✔`),
              st("Answer.", `${ms(night)}°F`),
            ],
          },
          {
            prompt: "How many degrees warmer was noon than sunrise? (Check with your first answer.)",
            answer: num(rise),
            hints: [
              `“How much warmer” means subtract: noon − sunrise = ${ms(noon)} − ${sn(lo)}.`,
              `Subtracting a negative is the same as adding the positive: ${ms(noon)} − ${sn(lo)} = ${ms(noon)} + ${-lo}.`,
            ],
            steps: [
              st("“How much warmer” means subtract.", `noon − sunrise = ${ms(noon)} − ${sn(lo)}`),
              st("Subtracting a negative is the same as adding.", `${ms(noon)} − ${sn(lo)} = ${ms(noon)} + ${-lo} = ${rise}`),
              st("Check with the first answer.", `The temperature rose ${rise}° from sunrise to noon. Same number ✔`),
              st("Answer.", `${rise}° warmer`),
            ],
          },
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
      const dm = m2 - m1, c = f1 + m1 * x;
      const g = x + 3, costA = f1 + m1 * g, costB = f2 + m2 * g;
      return {
        intro: `Plan A: $${f1} plus $${m1} per GB. Plan B: $${f2} plus $${m2} per GB.`,
        parts: [
          {
            prompt: `How many GB make the plans cost the same?`,
            answer: num(x),
            hints: [
              `For g GB, Plan A costs ${f1} + ${m1}g and Plan B costs ${f2} + ${m2}g. Set them equal: ${f1} + ${m1}g = ${f2} + ${m2}g.`,
              `Get the g's on one side: subtract ${m1}g from both sides to get ${f1} = ${f2} + ${dm}g.`,
              `Now subtract ${f2} from both sides, then divide by ${dm}.`,
            ],
            steps: [
              st("Set the two costs equal.", `For g GB, Plan A costs ${f1} + ${m1}g and Plan B costs ${f2} + ${m2}g. They're the same when ${f1} + ${m1}g = ${f2} + ${m2}g.`),
              st(`Subtract ${m1}g from both sides.`, `${f1} = ${f2} + ${dm}g`),
              st(`Subtract ${f2} from both sides.`, `${f1} − ${f2} = ${dm}g, so ${f1 - f2} = ${dm}g`),
              st(`Divide both sides by ${dm}.`, `g = ${f1 - f2} ÷ ${dm} = ${x}`),
              st("Check.", `Plan A: ${f1} + ${m1} × ${x} = ${c}. Plan B: ${f2} + ${m2} × ${x} = ${c} ✔`),
              st("Answer.", `${x} GB`),
            ],
          },
          {
            prompt: "What do they both cost then?",
            answer: num(c, { pre: "$" }),
            hints: [
              `The plans cost the same at ${x} GB, so put ${x} in for g in either plan.`,
              `Plan A: ${f1} + ${m1} × ${x}. Multiply first, then add.`,
            ],
            steps: [
              st(`Put ${x} GB into Plan A.`, `${f1} + ${m1} × ${x} = ${f1} + ${m1 * x} = ${c}`),
              st("Check with Plan B.", `${f2} + ${m2} × ${x} = ${f2} + ${m2 * x} = ${c} ✔`),
              st("Answer.", `$${c} for either plan`),
            ],
          },
          {
            prompt: `Which plan is cheaper if you use ${g} GB?`,
            answer: choice(r, "Plan A", ["Plan B"], true),
            hints: [
              `Find what each plan costs for ${g} GB, then compare.`,
              `Plan A: ${f1} + ${m1} × ${g}. Plan B: ${f2} + ${m2} × ${g}. Multiply first, then add.`,
              `Shortcut: the plans cost the same at ${x} GB. After that, which plan adds more for each extra GB?`,
            ],
            steps: [
              st(`Plan A at ${g} GB.`, `${f1} + ${m1} × ${g} = ${f1} + ${m1 * g} = $${costA}`),
              st(`Plan B at ${g} GB.`, `${f2} + ${m2} × ${g} = ${f2} + ${m2 * g} = $${costB}`),
              st("Compare.", `$${costA} < $${costB}, so Plan A is cheaper.`),
              st("Why it makes sense.", `The plans cost the same at ${x} GB. After that, each extra GB adds $${m2} on Plan B but only $${m1} on Plan A, so Plan A stays cheaper.`),
              st("Answer.", "Plan A"),
            ],
          },
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
      const fits = space >= w;
      return {
        intro: `TVs are measured diagonally. A ${d}-inch TV screen is ${h} inches tall. A cabinet opening is ${space} inches wide.`,
        parts: [
          {
            prompt: "How wide is the screen?",
            answer: num(w),
            hints: [
              `The width, height and diagonal make a right triangle. The diagonal is the longest side, so width^2 + ${h}^2 = ${d}^2.`,
              `Square the numbers you know: ${h} × ${h} and ${d} × ${d}. Subtract to find width^2.`,
              `width^2 = ${w * w}. What number times itself is ${w * w}? ${w % 10 === 0 ? "It ends in 00, so try multiples of 10." : `It's between ${Math.floor(w / 10) * 10} × ${Math.floor(w / 10) * 10} and ${Math.ceil(w / 10) * 10} × ${Math.ceil(w / 10) * 10}.`}`,
            ],
            steps: [
              st("The screen makes a right triangle.", `The width and height are the legs, and the ${d}-inch diagonal is the hypotenuse (the longest side).`),
              st("Use the Pythagorean theorem.", `width^2 + ${h}^2 = ${d}^2`),
              st("Square the numbers you know.", `${h}^2 = ${h} × ${h} = ${h * h} and ${d}^2 = ${d} × ${d} = ${d * d}`),
              st("Subtract to find width^2.", `width^2 = ${d * d} − ${h * h} = ${w * w}`),
              st("Take the square root.", `What number times itself is ${w * w}? ${w} × ${w} = ${w * w}, so width = ${w}.`),
              st("Answer.", `${w} inches`),
            ],
            traps: traps(F(w), [trap(d - h, "Use the Pythagorean theorem, not subtraction of the sides.")]),
          },
          {
            prompt: "Will it fit in the cabinet?",
            answer: choice(r, fits ? "Yes" : "No", [fits ? "No" : "Yes"], true),
            hints: [
              "The TV fits if the screen is no wider than the cabinet opening.",
              `Screen: ${w} inches wide. Opening: ${space} inches wide. Which is bigger?`,
            ],
            steps: [
              st("Compare the screen width with the opening.", `Screen: ${w} inches wide. Opening: ${space} inches wide.`),
              fits
                ? st("The opening is wider.", `${w} ≤ ${space}, with ${space - w} inches to spare.`)
                : st("The screen is wider.", `${w} > ${space}. The screen is ${w - space} inches too wide.`),
              st("Answer.", fits ? "Yes, it fits." : "No, it won't fit."),
            ],
          },
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
      const all = ["H", "T"].flatMap((c) => Array.from({ length: n }, (_, i) => `${c}${i + 1}`));
      const wins = plays / (2 * n);
      return {
        intro: `A game flips a coin and spins a spinner with ${n} equal sections. You win if you get heads AND the spinner lands on 1.`,
        parts: [
          {
            prompt: "How many equally likely outcomes are there?",
            answer: num(2 * n),
            hints: [
              `The coin has 2 results (heads or tails). Each one can go with any of the ${n} spinner results.`,
              `Multiply 2 × ${n}. Or list them: H1, H2, …, then T1, T2, …`,
            ],
            steps: [
              st("Count the results for each part.", `The coin has 2 results (heads or tails). The spinner has ${n} results.`),
              st("Multiply.", `Each coin result can go with each spinner result: 2 × ${n} = ${2 * n}.`),
              st("Check by listing.", `${all.join(", ")}. That's ${2 * n} ✔`),
              st("Answer.", `${2 * n} outcomes`),
            ],
          },
          {
            prompt: "What is P(win)?",
            answer: num(frac(1, 2 * n)),
            hints: [
              `P(win) = winning outcomes ÷ all outcomes. There are ${2 * n} outcomes in all.`,
              "Count the winners: which outcomes are heads AND 1?",
            ],
            steps: [
              st("P = winning outcomes ÷ all outcomes.", `There are ${2 * n} equally likely outcomes.`),
              st("Count the winners.", "Only heads AND 1 (H1) wins, so there is 1 winning outcome."),
              st("Divide.", `P(win) = {1/${2 * n}}`),
              st("Check another way.", `P(heads) × P(1) = {1/2} × {1/${n}} = {1/${2 * n}} ✔`),
              st("Answer.", `{1/${2 * n}}`),
            ],
          },
          {
            prompt: `If you play ${plays} times, about how many wins should you expect?`,
            answer: num(wins),
            hints: [
              `Expected wins = number of plays × P(win): ${plays} × {1/${2 * n}}.`,
              `Multiplying by {1/${2 * n}} is the same as dividing by ${2 * n}.`,
            ],
            steps: [
              st("Expected wins = number of plays × P(win).", `${plays} × {1/${2 * n}}`),
              st(`Multiplying by {1/${2 * n}} is the same as dividing by ${2 * n}.`, `${plays} ÷ ${2 * n} = ${wins}`),
              st("Check.", `${wins} × ${2 * n} = ${plays} ✔`),
              st("Answer.", `About ${count(wins, "win")}`),
            ],
          },
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
      const need = price - start, q = Math.floor(need / per), rem = need % per;
      return {
        intro: `You have $${start} and save $${per} each week. The bike costs $${price}.`,
        parts: [
          {
            prompt: "Write the savings equation: y = ?x + ?",
            answer: { kind: "multi", fields: [{ value: F(per), pre: "y =", post: "x" }, { value: F(start), pre: "+" }] },
            hints: [
              "x is the number of weeks and y is your dollars. The slope (the number before x) is what you add EACH week.",
              "b (the number added on at the end) is what you have before any weeks go by, when x = 0.",
            ],
            steps: [
              st("Decide what x and y mean.", "x = number of weeks, y = dollars saved so far."),
              st("Find the starting amount.", `You have $${start} before any weeks go by. That's y when x = 0, so b = ${start}.`),
              st("Find the rate.", `You add $${per} every week, so the slope is m = ${per}.`),
              st("Check.", `After 2 weeks: ${per} × 2 + ${start} = $${per * 2 + start}, which is $${start} plus two weeks of $${per} ✔`),
              st("Answer.", `y = ${per}x + ${start}`),
            ],
          },
          {
            prompt: "After how many whole weeks can you afford the bike?",
            answer: num(weeks),
            hints: [
              `First find how much more money you need: $${price} − $${start}.`,
              `Then see how many weeks of $${per} cover $${need}: ${need} ÷ ${per}.`,
              ...(rem ? ["If there's a remainder, you're still a little short, so round UP to the next whole week."] : []),
            ],
            steps: [
              st("Find how much more money you need.", `$${price} − $${start} = $${need}`),
              st(`See how many $${per} weeks that takes.`, `${need} ÷ ${per}: ${per} × ${q} = ${per * q}${rem ? `, with ${rem} left over` : ", exactly"}.`),
              rem
                ? st("Round UP to a whole week.", `After ${q} weeks you'd have $${start + per * q}, still $${rem} short. One more week does it: ${weeks} weeks.`)
                : st("No rounding needed.", `It comes out even, so ${weeks} weeks is just enough.`),
              st("Check.", `${per} × ${weeks} + ${start} = ${per * weeks} + ${start} = $${per * weeks + start}, enough for the $${price} bike ✔`),
              st("Answer.", `${weeks} weeks`),
            ],
            traps: traps(F(weeks), [trap(Math.floor((price - start) / per), "That's not quite enough yet. Round UP.")]),
          },
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
      const scoops = frac(lemonCups.n, lemonCups.d * 4);
      let votes: number[];
      // Redraw on a tie so there is exactly one mode.
      do votes = [r.int(2, 6), r.int(1, 5), r.int(1, 4)];
      while (votes.filter((v) => v === Math.max(...votes)).length > 1);
      const prefs = ["pizza", "tacos", "pasta"];
      const top = prefs[votes.indexOf(Math.max(...votes))];
      const l = r.int(12, 20), w = r.int(10, 15);
      const tableA = r.int(2, 4) * 2;
      const seats = tableA / 2 + 2;
      const tables = Math.ceil(guests / seats);
      const tq = Math.floor(guests / seats), trem = guests % seats;
      const ages = Array.from({ length: 5 }, () => r.int(9, 12));
      const ageSum = ages.reduce((a, b) => a + b, 0);
      const ageMean = ageSum / ages.length;
      // Cents per plate; the two packs never have the same unit price, so one answer is clearly right.
      const plates1 = r.int(20, 30), c1 = r.int(8, 15);
      let c2 = r.int(8, 15);
      while (c2 === c1) c2 = r.int(8, 15);
      const plates2 = plates1 + 20;
      const cost1 = round((plates1 * c1) / 100, 2), cost2 = round((plates2 * c2) / 100, 2);
      const u1 = cost1 / plates1, u2 = cost2 / plates2;
      const pack1 = `${plates1} for ${money(cost1)}`, pack2 = `${plates2} for ${money(cost2)}`;
      const bestPack = c1 < c2 ? pack1 : pack2;
      return {
        intro: `You're planning a party for ${guests} guests. Let's do the math!`,
        parts: [
          {
            section: "Compare prices",
            prompt: `Plates: ${pack1} or ${pack2}. Which costs less per plate?`,
            answer: choice(r, u1 <= u2 ? pack1 : pack2, [u1 <= u2 ? pack2 : pack1], true),
            hints: [
              "The packs have different numbers of plates, so find the price of ONE plate in each pack: price ÷ plates.",
              `${money(cost1)} ÷ ${plates1} and ${money(cost2)} ÷ ${plates2}. The smaller price per plate is the better deal.`,
              `Tip: think in cents. ${money(cost1)} is ${Math.round(cost1 * 100)}¢, so do ${Math.round(cost1 * 100)} ÷ ${plates1}.`,
            ],
            steps: [
              st("Find the price of ONE plate in each pack.", "Divide each price by its number of plates."),
              st(`${plates1} plates.`, `${money(cost1)} ÷ ${plates1} = ${money(c1 / 100)} per plate`),
              st(`${plates2} plates.`, `${money(cost2)} ÷ ${plates2} = ${money(c2 / 100)} per plate`),
              st("Compare.", `${money(Math.min(c1, c2) / 100)} is less than ${money(Math.max(c1, c2) / 100)}, so ${bestPack} costs less per plate.`),
              st("Answer.", bestPack),
            ],
          },
          {
            section: "Resize a recipe",
            prompt: `Each guest drinks {1/2} cup of lemonade. How many cups do you need for ${guests} guests?`,
            answer: num(lemonCups),
            hints: [
              `Multiply the amount for one guest by the number of guests: ${guests} × {1/2}.`,
              `Multiplying by {1/2} is the same as taking half of ${guests}.`,
            ],
            steps: [
              st("Multiply the amount per guest by the number of guests.", `${guests} × {1/2}`),
              st(`Find half of ${guests}.`, `Multiplying by {1/2} is the same as taking half: ${guests} ÷ 2 = ${mixed(lemonCups)}`),
              st("Answer.", `${mixed(lemonCups)} cups${decNote(lemonCups)}`),
            ],
          },
          {
            section: "Resize a recipe",
            prompt: `A lemonade mix uses 1 scoop for every 4 cups. How many scoops for ${fr(lemonCups)} cups? (A fraction or decimal is fine.)`,
            answer: num(scoops),
            hints: [
              `Each scoop makes 4 cups, so divide the cups by 4: ${fr(lemonCups)} ÷ 4.`,
              lemonCups.d === 1
                ? lemonCups.n % 4 === 0
                  ? `How many 4s fit into ${lemonCups.n}?`
                  : `${lemonCups.n} ÷ 4 doesn't come out even. Write it as a fraction, {${lemonCups.n}/4}, and simplify.`
                : `Keep, change, flip: ${fr(lemonCups)} ÷ 4 becomes ${fr(lemonCups)} × {1/4}. Multiply the tops and the bottoms.`,
            ],
            steps: [
              st("Each scoop makes 4 cups.", `So divide the cups by 4: ${mixed(lemonCups)} ÷ 4.`),
              ...(lemonCups.d === 1
                ? lemonCups.n % 4 === 0
                  ? [st("Divide.", `${lemonCups.n} ÷ 4 = ${lemonCups.n / 4}`)]
                  : [st("Divide.", `${lemonCups.n} ÷ 4 = ${raw(lemonCups.n, 4)}`), ...finishSteps(lemonCups.n, 4)]
                : [st("Keep, change, flip.", fracDivide(lemonCups, F(4)))]),
              st("Check.", `${mixed(scoops)} × 4 = ${mixed(lemonCups)} ✔`),
              st("Answer.", `${mixed(scoops)} ${scoops.n <= scoops.d ? "scoop" : "scoops"}${decNote(scoops)}`),
            ],
          },
          {
            section: "Sketch a layout",
            prompt: `The party room is ${l} ft by ${w} ft. What is its area?`,
            answer: num(l * w),
            hints: [
              `Area of a rectangle = length × width: ${l} × ${w}.`,
              Math.min(l, w) % 10 === 0
                ? `× 10 puts a 0 on the end.`
                : `Break ${Math.min(l, w)} into 10 + ${Math.min(l, w) - 10}. Multiply ${Math.max(l, w)} by each part, then add.`,
            ],
            steps: [
              st("Area of a rectangle = length × width.", `${l} × ${w}`),
              ...(Math.min(l, w) % 10 === 0 ? [st("Multiply.", `${l} × ${w} = ${l * w}`)] : multiplySteps(l, w)),
              st("Answer.", `${l * w} square feet`),
            ],
          },
          {
            section: "Sketch a layout",
            prompt: `Each table takes up 6 sq ft and seats ${seats} guests. How many tables do you need for ${guests} guests?`,
            answer: num(tables),
            hints: [
              `Divide the guests by the seats at each table: ${guests} ÷ ${seats}. (You don't need the 6 sq ft here.)`,
              "If some guests are left over, they still need a seat, so round UP to one more table.",
            ],
            steps: [
              st("Divide the guests by the seats at each table.", `${guests} ÷ ${seats}: ${seats} × ${tq} = ${seats * tq}${trem ? `, with ${trem} left over` : ", exactly"}.`),
              trem
                ? st("Round UP.", `${count(tq, "table")} would seat only ${tq * seats} guests, so ${count(trem, "guest")} would have no seat. Add one more table: ${tables}.`)
                : st("No rounding needed.", `${count(tq, "table")} seat everyone exactly.`),
              st("Check.", `${tables} × ${seats} = ${tables * seats} seats, enough for ${guests} guests ✔`),
              st("Answer.", `${count(tables, "table")}. (The 6 sq ft isn't needed for this question.)`),
            ],
          },
          {
            section: "Guest preferences",
            prompt: `Guests voted: pizza ${votes[0]}, tacos ${votes[1]}, pasta ${votes[2]}. Which food is the mode?`,
            answer: choice(r, top, prefs.filter((p) => p !== top)),
            hints: [
              "The mode is the most common choice, so look for the food with the most votes.",
              `Compare ${votes[0]}, ${votes[1]} and ${votes[2]}. Which number is biggest?`,
            ],
            steps: [
              st("The mode is the most common choice.", "Find the food with the most votes."),
              st("Compare the votes.", `pizza ${votes[0]}, tacos ${votes[1]}, pasta ${votes[2]}. The most is ${Math.max(...votes)}, for ${top}.`),
              st("Answer.", top),
            ],
          },
          {
            section: "Guest preferences",
            prompt: `Five guests' ages are ${ages.join(", ")}. What is the mean age?`,
            answer: num(fromDecimal(ageMean)),
            hints: [
              "Mean = add up all the ages, then divide by how many guests there are (5).",
              `Add: ${ages.join(" + ")}. Then divide that sum by 5.`,
              `Check: the mean should be between the youngest (${Math.min(...ages)}) and the oldest (${Math.max(...ages)}).`,
            ],
            steps: [
              st("Add the ages.", `${ages.join(" + ")} = ${ageSum}`),
              st("Divide by the number of guests (5).", ageSum % 5 ? `5 × ${Math.floor(ageSum / 5)} = ${5 * Math.floor(ageSum / 5)}, with ${ageSum % 5} left over. ${ageSum % 5} ÷ 5 = ${(ageSum % 5) / 5}, so ${ageSum} ÷ 5 = ${ageMean}.` : `5 × ${ageMean} = ${ageSum}, so ${ageSum} ÷ 5 = ${ageMean}.`),
              st("Check.", `The mean should be between the youngest (${Math.min(...ages)}) and the oldest (${Math.max(...ages)}). ${ageMean} is ✔`),
              st("Answer.", `${ageMean} years old`),
            ],
          },
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
      const pairs = [1, 2, 3, 4, 5, 6].filter((a) => target - a >= 1 && target - a <= 6).map((a) => [a, target - a]);
      const P = frac(ways, 36);
      const E = (rolls * ways) / 36;
      const top = rolls * P.n;
      const eq = Math.floor(top / P.d), er = top % P.d;
      return {
        intro: `In your game, a player rolls two dice. Landing a sum of ${target} lets them jump ahead. Let's see how often that happens.`,
        parts: [
          {
            section: "Predict",
            prompt: "How many equally likely outcomes are there with two dice?",
            answer: num(36),
            hints: [
              "The first die can land 6 ways. For EACH of those, the second die can land 6 ways.",
              "So multiply 6 × 6. (Or picture a 6-by-6 grid of pairs.)",
            ],
            steps: [
              st("Each die has 6 faces.", "The first die can land 6 ways, and for EACH of those the second die can land 6 ways."),
              st("Multiply.", "6 × 6 = 36"),
              st("Answer.", "36 outcomes"),
            ],
          },
          {
            section: "Predict",
            prompt: `How many of those outcomes give a sum of ${target}?`,
            answer: num(ways),
            hints: [
              `List every pair (first die, second die) that adds to ${target}. Start with first die = ${pairs[0][0]}: (${pairs[0][0]}, ${pairs[0][1]}).`,
              `Order matters: (${pairs[0][0]}, ${pairs[0][1]}) and (${pairs[0][1]}, ${pairs[0][0]}) are different, because the dice are different. Keep going up to first die = ${pairs[pairs.length - 1][0]}.`,
            ],
            steps: [
              st(`List the pairs that add to ${target}.`, `(first die, second die): ${pairs.map(([a, b]) => `(${a}, ${b})`).join(", ")}`),
              st("Order matters.", `(${pairs[0][0]}, ${pairs[0][1]}) and (${pairs[0][1]}, ${pairs[0][0]}) are different outcomes, because the two dice are different.`),
              st("Answer.", `${ways} outcomes`),
            ],
          },
          {
            section: "Predict",
            prompt: `What is P(sum = ${target})?`,
            answer: num(P),
            hints: [
              `P = favorable outcomes ÷ all outcomes. You found ${ways} ways to roll ${target === 8 ? "an" : "a"} ${target}, out of 36.`,
              "Write it as a fraction over 36. Then simplify it if the top and bottom share a factor.",
            ],
            steps: [
              st("P = favorable outcomes ÷ all outcomes.", `${ways} favorable out of 36: P = {${ways}/36}`),
              ...simplifySteps(ways, 36),
              st("Answer.", `P(sum = ${target}) = ${fr(P)}`),
            ],
          },
          {
            section: "Predict",
            prompt: `In ${rolls} rolls, about how many times should ${target === 8 ? "an" : "a"} ${target} come up?`,
            answer: num(fromDecimal(round(E, 2)), { tolerance: 0.5 }),
            hints: [
              `Expected count = number of rolls × probability: ${rolls} × ${fr(P)}.`,
              P.n === 1 ? `Multiplying by {1/${P.d}} is the same as dividing by ${P.d}.` : `Multiply the top first: ${rolls} × ${P.n}. Then divide by ${P.d}.`,
            ],
            steps: [
              st("Expected count = number of rolls × probability.", `${rolls} × ${fr(P)}`),
              ...(P.n === 1
                ? [st(`Multiplying by {1/${P.d}} is the same as dividing by ${P.d}.`, `${rolls} ÷ ${P.d} = ${E}`)]
                : [
                    st("Multiply the top.", `${rolls} × ${fr(P)} = {${rolls} × ${P.n}/${P.d}} = ${raw(top, P.d)}`),
                    st("Divide.", er ? `${top} ÷ ${P.d} = ${eq} remainder ${er}, so it's ${eq}${raw(er, P.d)}${frac(er, P.d).d !== P.d ? ` = ${mixed(frac(top, P.d))}` : ""} ≈ ${round(E, 2)}` : `${top} ÷ ${P.d} = ${E}`),
                  ]),
              st("Answer.", `About ${round(E, 2)} times${Number.isInteger(E) ? "" : ` (roughly ${Math.round(E)})`}`),
            ],
          },
          {
            section: "Test it",
            prompt: `Press “Roll ${rolls} times” to simulate. Was your result close to the prediction?`,
            answer: choice(r, "Probably close but not exact, because chance varies", ["It must match exactly or the math is wrong", "Simulations can't tell us anything"]),
            hints: [
              "A prediction tells you what happens on average. Do random rolls always match it exactly?",
              "Press the button a few times. Does the count change each time?",
            ],
            steps: [
              st("A prediction is what happens “on average”.", `We predicted a sum of ${target} about ${round(E, 1)} times out of ${rolls}.`),
              st("Real rolls are random.", "Each run of the simulation gives a slightly different count, so it's usually close but not exactly the same."),
              st("More rolls help.", "The more times you roll, the closer the results usually get to the prediction."),
              st("Answer.", "Probably close, but not exact."),
            ],
            visual: { type: "dicesim", target, rolls },
          },
          {
            section: "Make it fair",
            prompt: "You want a jump square to happen MORE often. Which sum should trigger it?",
            answer: choice(r, "7", ["2", "12", "11"]),
            hints: [
              "A sum comes up more often when there are more ways to roll it.",
              "Count the pairs for each choice. 2 can only be (1, 1). How many pairs make 7? 11? 12?",
            ],
            steps: [
              st("Count the ways to make each sum.", "2: 1 way, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1."),
              st("Pick the sum with the most ways.", "7 has 6 ways: (1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1). More ways means it happens more often."),
              st("Answer.", "7, with P = {6/36} = {1/6}"),
            ],
          },
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
      const dm = MB - MA, df = FA - FB;
      const g = H + 3, longA = FA + MA * g, longB = FB + MB * g;
      const oneA = FA + MA, oneB = FB + MB;
      const eqSteps = (shop: string, m: number, b: number) => [
        st("Find the starting fee.", `Shop ${shop} charges $${b} before you ride at all. That's the cost when x = 0, so b = ${b}.`),
        st("Find the rate.", `Each hour adds $${m}, so the slope is m = ${m}.`),
        st("Check.", `For 2 hours: ${m} × 2 + ${b} = $${m * 2 + b}, which is the $${b} fee plus 2 hours at $${m} ✔`),
        st("Answer.", `y = ${linear(m, b)}${m === 1 || b === 0 ? ` (the same as y = ${m}x + ${b})` : ""}`),
      ];
      const eqHints = (shop: string, m: number, b: number) => [
        "In y = mx + b, m (the number before x) is the cost for EACH hour. b is the fee you pay before riding at all, when x = 0.",
        `At Shop ${shop}, $${b} is paid once and $${m} is paid every hour. Which one gets multiplied by x, the number of hours?`,
      ];
      return {
        intro: `Shop A charges $${FA} plus $${MA} per hour. Shop B charges $${FB} plus $${MB} per hour.`,
        parts: [
          { section: "Write equations", prompt: "Write Shop A's cost y for x hours: y = ?x + ?", answer: { kind: "multi", fields: [{ value: F(MA), pre: "y =", post: "x" }, { value: F(FA), pre: "+" }] }, hints: eqHints("A", MA, FA), steps: eqSteps("A", MA, FA) },
          { section: "Write equations", prompt: "Write Shop B's cost: y = ?x + ?", answer: { kind: "multi", fields: [{ value: F(MB), pre: "y =", post: "x" }, { value: F(FB), pre: "+" }] }, hints: eqHints("B", MB, FB), steps: eqSteps("B", MB, FB) },
          {
            section: "Graph costs",
            prompt: "Click where the two cost lines cross.",
            answer: { kind: "point", x: H, y: cost, min: 0, max: Math.max(12, cost + 2), lines: [{ m: MA, b: FA, label: "A" }, { m: MB, b: FB, label: "B" }] },
            hints: [
              `The lines cross where both shops cost the same: ${linear(MA, FA)} = ${linear(MB, FB)}.`,
              `Subtract ${term(MA, "x")} from both sides${FB !== 0 ? `, then subtract ${FB}` : ""}${dm === 1 ? "" : `, then divide by ${dm}`}. That gives x at the crossing.`,
              "Put that x into Shop A's equation to find y. Then click that point.",
            ],
            steps: [
              st("The lines cross where the costs are equal.", `${linear(MA, FA)} = ${linear(MB, FB)}`),
              st(`Subtract ${term(MA, "x")} from both sides.`, `${FA} = ${linear(dm, FB)}`),
              ...(FB !== 0 ? [st(`Subtract ${FB} from both sides.`, `${FA} − ${FB} = ${term(dm, "x")}, so ${df} = ${term(dm, "x")}`)] : []),
              ...(dm === 1 ? [] : [st(`Divide both sides by ${dm}.`, `x = ${df} ÷ ${dm} = ${H}`)]),
              st("Find y.", `Put x = ${H} into Shop A: y = ${MA} × ${H} + ${FA} = ${cost}. Shop B gives ${MB} × ${H} + ${FB} = ${cost} too ✔`),
              st("Answer.", `The lines cross at (${H}, ${cost}): at ${H} hours both shops cost $${cost}.`),
            ],
          },
          {
            section: "Explain",
            prompt: `Which shop is cheaper for a ${g}-hour ride?`,
            answer: choice(r, "Shop A", ["Shop B", "They cost the same"]),
            hints: [
              `Find each shop's cost for ${g} hours: put x = ${g} into both equations.`,
              `Shop A: ${MA} × ${g} + ${FA}. Shop B: ${MB} × ${g} + ${FB}. Which is less?`,
            ],
            steps: [
              st(`Shop A for ${g} hours.`, `${MA} × ${g} + ${FA} = ${MA * g} + ${FA} = $${longA}`),
              st(`Shop B for ${g} hours.`, `${MB} × ${g} + ${FB} = ${MB * g} + ${FB} = $${longB}`),
              st("Compare.", `$${longA} < $${longB}, so Shop A is cheaper.`),
              st("Why it makes sense.", `After the lines cross at ${H} hours, Shop A's smaller hourly rate ($${MA} vs. $${MB}) keeps it cheaper.`),
              st("Answer.", "Shop A"),
            ],
          },
          {
            section: "Explain",
            prompt: `Which shop is cheaper for a 1-hour ride?`,
            answer: choice(r, H > 1 ? "Shop B" : "They cost the same", H > 1 ? ["Shop A", "They cost the same"] : ["Shop A", "Shop B"]),
            hints: [
              "Find each shop's cost for 1 hour: put x = 1 into both equations.",
              `Shop A: ${MA} × 1 + ${FA}. Shop B: ${MB} × 1 + ${FB}. Compare.`,
            ],
            steps: [
              st("Shop A for 1 hour.", `${MA} × 1 + ${FA} = $${oneA}`),
              st("Shop B for 1 hour.", `${MB} × 1 + ${FB} = $${oneB}`),
              st("Compare.", oneB < oneA ? `$${oneB} < $${oneA}, so Shop B is cheaper.` : `Both cost $${oneA}.`),
              ...(H > 1 ? [st("Why it makes sense.", `Before the lines cross at ${H} hours, Shop B's lower starting fee ($${FB} vs. $${FA}) keeps it cheaper.`)] : []),
              st("Answer.", H > 1 ? "Shop B" : "They cost the same."),
            ],
          },
        ],
      };
    },
  },
];
