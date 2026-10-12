import { div, frac, fromDecimal, mul } from "../../lib/rational";
import { F, NAMES, choice, fr, mixed, money, num, round, trap, traps } from "../helpers";
import type { Skill } from "../types";

const T = "g7-rp";

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
      const sugar = frac(r.int(1, 5), 4);
      const flour = frac(r.int(1, 3), r.pick([2, 3]));
      const ans = div(sugar, flour);
      return {
        prompt: `A recipe uses ${fr(sugar)} cup of sugar for every ${fr(flour)} cup of flour. How many cups of sugar is that per cup of flour?`,
        answer: num(ans),
        hints: ["Unit rate = sugar ÷ flour.", `${fr(sugar)} ÷ ${fr(flour)}`],
        steps: [`${fr(sugar)} ÷ ${fr(flour)} = ${fr(sugar)} × ${fr(F(flour.d, flour.n))} = ${mixed(ans)} cups of sugar per cup of flour`],
        traps: traps(ans, [trap(div(flour, sugar), "That's flour per cup of sugar. Divide the sugar by the flour.")]),
      };
    }
    return {
      prompt: `${r.pick(NAMES)} ${verb} ${mixed(d)} ${d.n === d.d ? one : thing} in ${fr(t)} ${per}. What is the rate in ${thing} per ${per}?`,
      answer: num(rate),
      hints: [`Rate = ${thing} ÷ ${per}s.`, `${mixed(d)} ÷ ${fr(t)} = ${mixed(d)} × ${t.d}`],
      steps: [`${mixed(d)} ÷ ${fr(t)} = ${mixed(d)} × ${t.d} = ${mixed(rate)} ${thing} per ${per}`],
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
        hints: ["k = y ÷ x for any row.", `${k * xs[0]} ÷ ${xs[0]}`],
        steps: [`${k * xs[0]} ÷ ${xs[0]} = ${k}`, `Check another row: ${k * xs[1]} ÷ ${xs[1]} = ${k}`],
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
        hints: ["Find y ÷ x for every row.", "Proportional only if every ratio is the same."],
        steps: rows.map(([x, y]) => `${y} ÷ ${x} = ${round(Number(y) / Number(x), 3)}`).concat(prop ? ["All equal → proportional"] : ["Not all equal → not proportional"]),
      };
    }
    const kk = r.pick([2, 3, 0.5, 1.5, 4]);
    return {
      prompt: `The graph shows a proportional relationship. Use the point at x = 1 (or any point) to find k.`,
      visual: { type: "grid", min: 0, max: 10, lines: [{ m: kk, b: 0 }], points: kk === 0.5 || kk === 1.5 ? [{ x: 2, y: 2 * kk }] : [{ x: 1, y: kk }] },
      answer: num(fromDecimal(kk)),
      hints: ["k = y ÷ x for any point on the line.", "The point (1, k) shows the unit rate."],
      steps: kk === 0.5 || kk === 1.5 ? [`Point (2, ${2 * kk}): k = ${2 * kk} ÷ 2 = ${kk}`] : [`Point (1, ${kk}): k = ${kk}`],
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
        hints: [`The bottom of the first ratio is ${k} times its top.`, `So n = ${y} × ${k}.`],
        steps: [`${x * k} ÷ ${x} = ${k}`, `n = ${y} × ${k} = ${y * k}`],
        traps: traps(F(y * k), [trap(frac(x * k * y, x * x), "Keep the same relationship between top and bottom in both ratios.")]),
      };
    }
    return {
      prompt: `${a} ${item} cost ${money(round(unit * a, 2))}. At the same price, how much do ${b} ${item} cost?`,
      answer: num(fromDecimal(ans), { pre: "$" }),
      hints: [`Find the cost of 1: ${money(round(unit * a, 2))} ÷ ${a}.`, `Then multiply by ${b}.`],
      steps: [`1 costs ${money(round(unit * a, 2))} ÷ ${a} = ${money(unit)}`, `${b} cost ${b} × ${money(unit)} = ${money(ans)}`],
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
        hints: [`Find ${p}% of ${price}, then subtract.`, `Or find ${100 - p}% of ${price}.`],
        steps: [`Discount: ${p / 100} × ${price} = ${money(round((price * p) / 100, 2))}`, `${money(price)} − ${money(round((price * p) / 100, 2))} = ${money(ans)}`],
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
        hints: [`Find ${p}% of ${money(base)}.`, "Add it to the original amount."],
        steps: [`${p / 100} × ${money(base)} = ${money(round((base * p) / 100, 2))}`, `${money(base)} + ${money(round((base * p) / 100, 2))} = ${money(ans)}`],
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
      hints: [`Change = ${up ? `${now} − ${orig}` : `${orig} − ${now}`}.`, `Divide the change by the ORIGINAL amount (${orig}), then ×100.`],
      steps: [`Change: ${round(Math.abs(now - orig), 2)}`, `${round(Math.abs(now - orig), 2)} ÷ ${orig} = ${pct / 100}`, `= ${pct}%`],
      traps: traps(F(pct), [trap(fromDecimal(round((Math.abs(now - orig) / now) * 100, 2)), "Divide by the ORIGINAL amount, not the new one."), trap(fromDecimal(round(Math.abs(now - orig), 2)), "That's the dollar change. Divide by the original and convert to a percent.")]),
    };
  },
};

export default [complexRate, proportional, solveProportion, percentApps];
