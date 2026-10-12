import { div, frac, fromDecimal, mul } from "../../lib/rational";
import { F, NAMES, choice, fr, mixed, money, num, round, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { fracDivide, percentDetail, simplifySteps, st } from "../steps";

const T = "g7-rp";

/** How to find p% of an amount in your head (the method percentDetail uses), without the result. */
function pctHow(p: number, base: string): string {
  if (p === 50) return `50% is half, so divide ${base} by 2.`;
  if (p === 25) return `25% is a quarter, so divide ${base} by 4.`;
  if (p === 10) return `10% is a tenth, so divide ${base} by 10.`;
  if (p % 10 === 0) return `Find 10% first (${base} ÷ 10), then multiply by ${p / 10} to get ${p}%.`;
  if (p === 5) return `5% is half of 10%: find ${base} ÷ 10, then halve it.`;
  if (p % 5 === 0) return `Find 10% (${base} ÷ 10) and 5% (half of that). ${p}% is ${Math.floor(p / 10) > 1 ? `${Math.floor(p / 10)} × 10%` : "10%"} + 5%.`;
  return `Find 1% first (${base} ÷ 100), then multiply by ${p} to get ${p}%.`;
}

const complexRate: Skill = {
  id: "g7.rp.complex-rate",
  title: "Unit rates with fractions",
  topic: T,
  standards: ["NC.7.RP.1"],
  prereqs: ["g6.rp.unit-rate", "g6.ns.div-fractions"],
  lesson: {
    bigIdea: "A unit rate can come from fractions: {1/2} mile in {1/4} hour is ({1/2}) ÷ ({1/4}) = 2 miles per hour.",
    explain: [
      "Divide the first quantity by the second, even when they're fractions.",
      "{3/4} cup of sugar for every {1/2} cup of butter: {3/4} ÷ {1/2} = {3/2} = 1{1/2} cups of sugar per cup of butter.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Walking {1/2} mile in {1/4} hour: why is the speed 2 mph?", choices: ["In a full hour you walk 4 quarter-hours' worth, which is 4 × {1/2} = 2 miles.", "Because {1/2} + {1/4} is about 2.", "Because {1/4} ÷ {1/2} = 2."], correct: 0, explain: "Scale up to 1 hour." },
    { kind: "written", prompt: "A snail crawls {1/3} meter in {1/6} hour. Explain how to find its speed in meters per hour.", keyIdeas: ["speed = distance ÷ time", "1/3 ÷ 1/6 = 1/3 × 6 = 2", "2 meters per hour (6 sixths make an hour)"], exemplar: "Speed is distance divided by time: 1/3 ÷ 1/6 = 1/3 × 6 = 2. That makes sense because an hour has 6 sixth-hours and the snail crawls 1/3 meter in each one, so 6 × 1/3 = 2 meters per hour." },
  ],
  generate(r, lv) {
    const t = F(1, r.pick([2, 3, 4, 5, 6]));
    const rate = lv === 1 ? F(r.int(2, 8)) : frac(r.int(2, 9), r.pick([1, 2, 3]));
    const d = mul(rate, t);
    const [verb, thing, one, per] = r.pick([["walks", "miles", "mile", "hour"], ["reads", "pages", "page", "hour"], ["swims", "laps", "lap", "hour"]]);
    if (lv === 3) {
      const sugar = frac(r.pick([1, 3, 5]), 4);
      const flour = frac(r.pick([1, 2]), 3);
      const ans = div(sugar, flour);
      return {
        prompt: `A recipe uses ${fr(sugar)} cup of sugar for every ${fr(flour)} cup of flour. How many cups of sugar is that per cup of flour?`,
        answer: num(ans),
        hints: [
          `You want the sugar for ONE cup of flour, so divide sugar by flour: ${fr(sugar)} ÷ ${fr(flour)}.`,
          `Keep, change, flip: ${fr(sugar)} × ${fr(F(flour.d, flour.n))}. Then multiply the tops and the bottoms.`,
        ],
        steps: [
          st("A unit rate is “per ONE”.", `We want cups of sugar for 1 cup of flour, so divide sugar by flour: ${fr(sugar)} ÷ ${fr(flour)}.`),
          st("Keep, change, flip.", fracDivide(sugar, flour)),
          st("Answer.", `${mixed(ans)} cup${ans.n === ans.d ? "" : "s"} of sugar per cup of flour`),
        ],
        traps: traps(ans, [trap(div(flour, sugar), "That's flour per cup of sugar. Divide the sugar by the flour.")]),
      };
    }
    return {
      prompt: `${r.pick(NAMES)} ${verb} ${mixed(d)} ${d.n === d.d ? one : thing} in ${fr(t)} ${per}. What is the rate in ${thing} per ${per}?`,
      answer: num(rate),
      hints: [
        `You want ${thing} in ONE whole ${per}, so divide ${thing} by ${per}s: ${mixed(d)} ÷ ${fr(t)}.`,
        `Dividing by ${fr(t)} is the same as multiplying by ${t.d}: a whole ${per} has ${t.d} pieces of ${fr(t)} ${per}. So find ${mixed(d)} × ${t.d}.`,
        ...(d.d > 1 && d.n > d.d ? [`Write ${mixed(d)} as ${fr(d)} first, then multiply the top by ${t.d}.`] : []),
      ],
      steps: [
        st(`Rate = ${thing} ÷ ${per}s.`, `${mixed(d)} ÷ ${fr(t)}`),
        st("Keep, change, flip.", fracDivide(d, t)),
        st("Make sense of it.", `A whole ${per} has ${t.d} pieces of ${fr(t)} ${per}. In each piece you go ${mixed(d)} ${thing}, so in a whole ${per}: ${t.d} × ${mixed(d)} = ${mixed(rate)}.`),
        st("Answer.", `${mixed(rate)} ${thing} per ${per}`),
      ],
      traps: traps(rate, [trap(mul(d, t), "Divide the distance by the time (don't multiply).")]),
    };
  },
};

const proportional: Skill = {
  id: "g7.rp.proportional",
  title: "Proportional relationships",
  topic: T,
  standards: ["NC.7.RP.2"],
  prereqs: ["g6.ee.two-variables", "g7.rp.complex-rate"],
  lesson: {
    bigIdea: "In a proportional relationship, y ÷ x is always the same number k, so y = kx. Its graph is a straight line through (0, 0).",
    explain: [
      "Table: x = 2, 4, 6 and y = 5, 10, 15. Each {y/x} = 2.5, so y = 2.5x. **k = 2.5** is the constant of proportionality (the unit rate).",
      "If the ratios aren't all equal, or the graph doesn't go through the origin, it's NOT proportional.",
      "On the graph, the point (1, k) shows the unit rate.",
    ],
    visual: { type: "grid", min: 0, max: 10, lines: [{ m: 2, b: 0, label: "y = 2x" }], points: [{ x: 1, y: 2, label: "(1, 2)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why must a proportional graph pass through (0, 0)?", choices: ["If y = kx and x = 0, then y = 0: zero items cost zero.", "All lines pass through (0, 0).", "Because k is positive."], correct: 0, explain: "y = k · 0 = 0." },
    { kind: "written", prompt: "A gym charges a $20 sign-up fee plus $10 per month. Explain why total cost is NOT proportional to months.", keyIdeas: ["cost = 10m + 20", "cost ÷ months isn't constant (30/1, 40/2 = 20)", "0 months still costs $20, so the graph doesn't go through the origin"], exemplar: "Cost is 10m + 20. After 1 month it's $30 (30 per month) but after 2 months it's $40 (20 per month), so the ratio changes. Also, at 0 months you'd still pay $20, so the graph doesn't start at (0, 0). It isn't proportional." },
  ],
  generate(r, lv) {
    const k = lv === 1 ? r.int(2, 9) : r.pick([1.5, 2.5, 0.5, 3, 4, 1.25, 0.75]);
    if (lv === 1) {
      const xs = [r.int(1, 3), r.int(4, 6), r.int(7, 9)];
      return {
        prompt: `The table shows a proportional relationship. What is the constant of proportionality (k in y = kx)?`,
        visual: { type: "table", headers: ["x", "y"], rows: xs.map((x) => [x, k * x]) },
        answer: num(k),
        hints: ["In a proportional table, y ÷ x gives the same number in every row. That number is k.", `Use the first row: x = ${xs[0]} and y = ${k * xs[0]}. Divide y by x.`],
        steps: [
          st("In a proportional relationship, y ÷ x is the same in every row.", "That number is k, the constant of proportionality."),
          st("Divide y by x in one row.", `${k * xs[0]} ÷ ${xs[0]} = ${k}`),
          st("Check another row.", `${k * xs[1]} ÷ ${xs[1]} = ${k} ✔ and ${k * xs[2]} ÷ ${xs[2]} = ${k} ✔`),
          st("Answer.", `k = ${k}, so y = ${k}x`),
        ],
        traps: traps(F(k), [trap(frac(xs[0], k * xs[0]), "k is y ÷ x, not x ÷ y.")]),
      };
    }
    if (lv === 2) {
      const prop = r.chance(0.5);
      const b = prop ? 0 : r.int(1, 5);
      const xs = [1, 2, 4, 5];
      const rows = xs.map((x) => [x, round(k * x + b, 2)]);
      return {
        prompt: `Is the relationship in this table proportional?`,
        visual: { type: "table", headers: ["x", "y"], rows },
        answer: choice(r, prop ? `Yes, y ÷ x is always ${k}` : "No, y ÷ x is not the same for every row", [prop ? ["No, y ÷ x is not the same for every row", "Check y ÷ x for each row. Are they equal?"] : [`Yes, y ÷ x is always ${round(k + b, 2)}`, `Try the second row: ${rows[1][1]} ÷ 2 isn't ${round(k + b, 2)}.`], "Yes, because y increases when x increases"]),
        hints: [
          `Divide y by x in every row. Start with the first row: ${rows[0][1]} ÷ ${rows[0][0]}.`,
          "If every row gives the same number, it's proportional. If even one row is different, it isn't. (Both going up together is not enough.)",
        ],
        steps: [
          st("Find y ÷ x for every row.", rows.map(([x, y]) => `${y} ÷ ${x} = ${round(Number(y) / Number(x), 3)}`).join("; ")),
          st("Compare the results.", prop ? `They're all ${k}, so the relationship is proportional: y = ${k}x.` : "They're not all the same, so it's NOT proportional."),
          ...(prop ? [] : [st("Another clue.", `If you extend the table back to x = 0, y would be ${b}, not 0. A proportional relationship always passes through (0, 0).`)]),
        ],
      };
    }
    const kk = r.pick([2, 3, 0.5, 1.5, 4]);
    return {
      prompt: `The graph shows a proportional relationship. Use the point at x = 1 (or any point) to find k.`,
      visual: { type: "grid", min: 0, max: 10, lines: [{ m: kk, b: 0 }], points: kk === 0.5 || kk === 1.5 ? [{ x: 2, y: 2 * kk }] : [{ x: 1, y: kk }] },
      answer: num(fromDecimal(kk)),
      hints: [
        "k = y ÷ x for any point on the line. Find a point that sits exactly on grid lines.",
        kk === 0.5 || kk === 1.5 ? "Look at the dot at x = 2. Read how high it is (its y-value), then divide that by 2." : "Look at the dot at x = 1. Its y-value is y ÷ 1, which is k itself.",
      ],
      steps: [
        st("Pick a point on the line with easy coordinates.", kk === 0.5 || kk === 1.5 ? `(2, ${2 * kk}) is on the line.` : `(1, ${kk}) is on the line.`),
        st("k = y ÷ x.", kk === 0.5 || kk === 1.5 ? `${2 * kk} ÷ 2 = ${kk}` : `${kk} ÷ 1 = ${kk}. The point (1, k) always shows the unit rate.`),
        st("Answer.", `k = ${kk}, so y = ${kk}x`),
      ],
    };
  },
};

const solveProportion: Skill = {
  id: "g7.rp.solve",
  title: "Solving proportions",
  topic: T,
  standards: ["NC.7.RP.2"],
  prereqs: ["g7.rp.proportional"],
  lesson: {
    bigIdea: "If two ratios are equal, find the scale factor or the unit rate to fill in the missing value.",
    explain: [
      "5 notebooks cost $8.75. How much do 8 cost? Unit rate: $8.75 ÷ 5 = $1.75 each, so 8 cost 8 × $1.75 = $14.",
      "Or set up {5/8.75} = {8/x} and solve.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does finding the unit rate help solve a proportion?", choices: ["Once you know the amount for 1, you can multiply to get the amount for any number.", "The unit rate is always the answer.", "It doesn't help."], correct: 0, explain: "Unit rate → multiply." },
    { kind: "written", prompt: "3 tickets cost $27. Explain two ways to find the cost of 7 tickets.", keyIdeas: ["unit rate: 27 ÷ 3 = $9 per ticket, 7 × 9 = $63", "or a proportion 3/27 = 7/x", "both give $63"], exemplar: "First way: one ticket costs 27 ÷ 3 = $9, so 7 tickets cost 7 × 9 = $63. Second way: set up 3/27 = 7/x. Since 27 is 9 times 3, x is 9 times 7 = 63." },
  ],
  generate(r, lv) {
    const unit = lv === 1 ? r.int(2, 12) : r.int(105, 995) / 100;
    const a = r.int(2, 9);
    let b = r.int(2, 15);
    if (b === a) b++;
    const item = r.pick(["notebooks", "tickets", "pounds of apples", "bottles of water", "packs of cards"]);
    const ans = round(unit * b, 2);
    if (lv === 3) {
      const x = r.int(2, 12);
      const k = r.int(2, 9);
      const y = r.int(2, 12);
      return {
        prompt: `Solve for n: {${x}/${x * k}} = {${y}/n}`,
        answer: num(y * k),
        hints: [
          `Equal ratios keep the same relationship between top and bottom. In {${x}/${x * k}}, how many times bigger is the bottom than the top?`,
          `${x * k} ÷ ${x} = ${k}, so the bottom is ${k} times the top. In {${y}/n} it's the same: n is ${k} times ${y}.`,
        ],
        steps: [
          st("Compare the top and bottom of the first ratio.", `${x * k} ÷ ${x} = ${k}, so the bottom is ${k} times the top.`),
          st("Keep the same relationship in the second ratio.", `n = ${y} × ${k} = ${y * k}`),
          st("Check by cross-multiplying.", `${x} × ${y * k} = ${x * y * k} and ${x * k} × ${y} = ${x * y * k} ✔`),
        ],
        traps: traps(F(y * k), [trap(frac(x * k * y, x * x), "Keep the same relationship between top and bottom in both ratios.")]),
      };
    }
    return {
      prompt: `${a} ${item} cost ${money(round(unit * a, 2))}. At the same price, how much do ${b} ${item} cost?`,
      answer: num(fromDecimal(ans), { pre: "$" }),
      hints: [
        `Find the price of ONE first (the unit price). Then multiply to get the cost of ${b}.`,
        `One costs ${money(round(unit * a, 2))} ÷ ${a}.${Number.isInteger(unit) ? "" : ` Tip: think in cents: ${Math.round(unit * a * 100)} ÷ ${a}.`}`,
        `Now multiply the price of one by ${b}.`,
      ],
      steps: [
        st("Find the unit price (the cost of ONE).", `${money(round(unit * a, 2))} ÷ ${a} = ${money(unit)}${Number.isInteger(unit) ? "" : ` (in cents: ${Math.round(unit * a * 100)} ÷ ${a} = ${Math.round(unit * 100)} cents)`}`),
        st(`Multiply by the number you want, ${b}.`, `${b} × ${money(unit)} = ${money(ans)}`),
        st("Check that it makes sense.", `${b} is ${b > a ? "more" : "fewer"} than ${a}, so the cost should be ${b > a ? "more" : "less"} than ${money(round(unit * a, 2))} ✔`),
      ],
    };
  },
};

const percentApps: Skill = {
  id: "g7.rp.percent-apps",
  title: "Discounts, tax, tips and percent change",
  topic: T,
  standards: ["NC.7.RP.3"],
  prereqs: ["g6.rp.percent", "g6.ns.dec-mult"],
  lesson: {
    bigIdea: "Find the percent amount, then add it (tax, tip, markup) or subtract it (discount). Or multiply by the remaining percent.",
    explain: [
      "A $40 item at 25% off: discount = 0.25 × 40 = $10, so it costs **$30**. Shortcut: you pay 75%, and 0.75 × 40 = 30.",
      "6% tax on $30: 0.06 × 30 = $1.80, total $31.80. Shortcut: 1.06 × 30.",
      "Percent change = change ÷ original. From 50 to 60 is a 10 ÷ 50 = 20% increase.",
    ],
    tip: "Percent change always divides by the ORIGINAL amount.",
  },
  why: [
    { kind: "choice", prompt: "Why does multiplying by 0.75 give the price after a 25% discount?", choices: ["After taking off 25%, you pay the remaining 75% of the price.", "Because 0.75 is close to 1.", "Because 25 × 3 = 75."], correct: 0, explain: "100% − 25% = 75%." },
    { kind: "written", prompt: "A $40 item is 25% off. Explain why the discount is $10 and the price is $30.", keyIdeas: ["25% is one quarter", "a quarter of $40 is $10", "40 − 10 = 30 (or pay 75%: 0.75 × 40)"], exemplar: "25% is one quarter, and a quarter of $40 is $10, so that's the discount. The sale price is 40 − 10 = $30. I can check by paying 75%: 0.75 × 40 = 30." },
  ],
  generate(r, lv) {
    const price = r.int(8, 120);
    if (lv === 1) {
      const p = r.pick([10, 20, 25, 50, 30, 40]);
      const ans = round(price * (1 - p / 100), 2);
      return {
        prompt: `A $${price} item is on sale for ${p}% off. What is the sale price?`,
        answer: num(fromDecimal(ans), { pre: "$" }),
        hints: [
          `Sale price = original price − discount. First find the discount, ${p}% of $${price}.`,
          `${pctHow(p, `$${price}`)} Then subtract that discount from $${price}.`,
        ],
        steps: [
          st("Find the discount.", percentDetail(p, price, true)),
          st("Subtract the discount from the price.", `${money(price)} − ${money(round((price * p) / 100, 2))} = ${money(ans)}`),
          st("Check with a shortcut.", `Taking off ${p}% leaves ${100 - p}% to pay: ${(100 - p) / 100} × ${money(price)} = ${money(ans)} ✔`),
        ],
        traps: traps(fromDecimal(ans), [trap(fromDecimal(round((price * p) / 100, 2)), "That's the discount. Subtract it from the original price."), trap(price - p, `Taking off ${p}% isn't the same as taking off $${p}.`)]),
        estimate: "Will the sale price be more or less than half the original?",
      };
    }
    if (lv === 2) {
      const kind = r.pick(["tax", "tip", "markup"]);
      const p = kind === "tax" ? r.pick([5, 6, 7, 8]) : kind === "tip" ? r.pick([15, 18, 20]) : r.pick([20, 25, 40, 50]);
      const base = kind === "markup" ? r.int(10, 60) : r.int(12, 80) + r.pick([0, 0.5, 0.25]);
      const ans = round(base * (1 + p / 100), 2);
      const prompt = kind === "tax" ? `A jacket costs ${money(base)}. Sales tax is ${p}%. What is the total cost?` : kind === "tip" ? `A restaurant bill is ${money(base)}. ${r.pick(NAMES)}'s family leaves a ${p}% tip. What is the total with tip?` : `A store buys a game for ${money(base)} and marks it up ${p}%. What is the selling price?`;
      return {
        prompt,
        answer: num(fromDecimal(ans), { pre: "$", tolerance: 0.011 }),
        hints: [
          `Total = original amount + the ${kind}. First find the ${kind}: ${p}% of ${money(base)}.`,
          `${pctHow(p, money(base))} Round to the nearest cent if needed.`,
          `Add the ${kind} to ${money(base)}.`,
        ],
        steps: [
          st(`Find the ${kind}.`, percentDetail(p, base, true)),
          ...(Math.abs(round((base * p) / 100, 2) - (base * p) / 100) > 1e-9 ? [st("Round to the nearest cent.", `${money(round((base * p) / 100, 2))}`)] : []),
          st(`Add the ${kind} to the ${kind === "markup" ? "store's cost" : "price"}.`, `${money(base)} + ${money(round((base * p) / 100, 2))} = ${money(ans)}`),
          st("Check with a shortcut.", `Paying ${100 + p}% of the price: ${(100 + p) / 100} × ${money(base)} ≈ ${money(ans)} ✔`),
        ],
        traps: traps(fromDecimal(ans), [trap(fromDecimal(round((base * p) / 100, 2)), `That's just the ${kind}. Add it to the original amount.`)]),
      };
    }
    const orig = r.pick([20, 25, 40, 50, 80, 120, 200]);
    const pct = r.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]);
    const up = r.chance(0.5);
    const now = round(orig * (1 + (up ? pct : -pct) / 100), 2);
    return {
      prompt: `A price changed from ${money(orig)} to ${money(now)}. What is the percent ${up ? "increase" : "decrease"}?`,
      answer: num(pct, { unit: "%" }),
      hints: [
        `Percent change compares the change to the ORIGINAL price. First find the change: ${up ? `${money(now)} − ${money(orig)}` : `${money(orig)} − ${money(now)}`}.`,
        `Divide the change by the original price, ${money(orig)}. Then turn that decimal into a percent (× 100).`,
      ],
      steps: [
        st("Find the amount of change.", up ? `${money(now)} − ${money(orig)} = ${money(Math.abs(now - orig))}` : `${money(orig)} − ${money(now)} = ${money(Math.abs(now - orig))}`),
        st("Compare the change to the ORIGINAL price.", `{${round(Math.abs(now - orig), 2)}/${orig}}`),
        ...(Number.isInteger(round(Math.abs(now - orig), 2)) ? simplifySteps(round(Math.abs(now - orig), 2), orig) : []),
        st("Change it to a percent.", `${round(Math.abs(now - orig), 2)} ÷ ${orig} = ${pct / 100} = ${pct}%`),
        st("Answer.", `a ${pct}% ${up ? "increase" : "decrease"}`),
      ],
      traps: traps(F(pct), [trap(fromDecimal(round((Math.abs(now - orig) / now) * 100, 2)), "Divide by the ORIGINAL amount, not the new one."), trap(fromDecimal(round(Math.abs(now - orig), 2)), "That's the dollar change. Divide by the original and convert to a percent.")]),
    };
  },
};

export default [complexRate, proportional, solveProportion, percentApps];
