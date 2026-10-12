import { frac, fromDecimal } from "../../lib/rational";
import { F, NAMES, choice, money, num, round, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { percentOfSteps, raw, simplifySteps, st } from "../steps";

const T = "g6-rp";

const ratioLanguage: Skill = {
  id: "g6.rp.ratios",
  title: "Ratio language",
  topic: T,
  standards: ["NC.6.RP.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A ratio compares two quantities. Order matters: the ratio of cats to dogs is cats first.",
    explain: [
      "In a class with 12 girls and 15 boys, the ratio of girls to boys is 12 : 15 (or 4 : 5). The ratio of boys to **all students** is 15 : 27.",
      "Ratios can be written 4 : 5, 4 to 5, or {4/5}.",
    ],
    visual: { type: "tape", rows: [{ label: "girls", segments: [1, 2, 3, 4].map(() => ({ text: "3", size: 1, shade: true })) }, { label: "boys", segments: [1, 2, 3, 4, 5].map(() => ({ text: "3", size: 1 })) }] },
  },
  why: [
    { kind: "choice", prompt: "A bag has 3 red and 5 blue marbles. Why is the ratio of red to all marbles 3 : 8, not 3 : 5?", choices: ["“All marbles” is 3 + 5 = 8, so you compare 3 to the total.", "Because 8 is bigger.", "It is 3 : 5."], correct: 0, explain: "Part-to-whole ratios use the total." },
    { kind: "written", prompt: "Explain the difference between a part-to-part ratio and a part-to-whole ratio, using 4 dogs and 6 cats.", keyIdeas: ["part-to-part compares the groups: dogs to cats 4 : 6", "part-to-whole compares a group to the total: dogs to all pets 4 : 10", "the total is 4 + 6 = 10"], exemplar: "Part-to-part compares one group to another, like dogs to cats, 4 : 6. Part-to-whole compares one group to everything, like dogs to all pets, 4 : 10, because there are 4 + 6 = 10 pets." },
  ],
  generate(r, lv) {
    const things = r.pick([["red marbles", "blue marbles", "marbles"], ["cats", "dogs", "pets"], ["girls", "boys", "students"], ["apples", "oranges", "pieces of fruit"], ["fiction books", "nonfiction books", "books"]]);
    const a = r.int(2, 9);
    let b = r.int(2, 9);
    if (b === a) b = a + 1;
    const total = a + b;
    const q = lv === 1 ? r.int(0, 1) : r.int(0, 3);
    const opts: [string, string][] = [[`${a} : ${b}`, `${things[0]} to ${things[1]}`], [`${b} : ${a}`, `${things[1]} to ${things[0]}`], [`${a} : ${total}`, `${things[0]} to all ${things[2]}`], [`${b} : ${total}`, `${things[1]} to all ${things[2]}`]];
    const [correct, desc] = opts[q];
    return {
      prompt: `There are ${a} ${things[0]} and ${b} ${things[1]}. What is the ratio of ${desc}?`,
      answer: choice(r, correct, opts.filter((o) => o[0] !== correct).map((o) => [o[0], `That's the ratio of ${o[1]}.`] as [string, string])),
      hints: q >= 2
        ? [`“All ${things[2]}” means the total, so first add: ${a} + ${b}.`, `The question names ${desc.split(" to ")[0]} first, so their number goes first and the total goes second.`]
        : [`The question names ${desc.split(" to ")[0]} first, so their number goes first.`, `Careful: the question may list them in a different order than the first sentence. Write (number of ${desc.split(" to ")[0]}) : (number of ${desc.split(" to ")[1]}).`],
      steps: [
        st("Read the order of the words.", `“The ratio of ${desc}” means the number of ${desc.split(" to ")[0]} comes first and the number of ${desc.split(" to ")[1].replace(/^all /, "all the ")} comes second.`),
        ...(q >= 2 ? [st(`Find the total number of ${things[2]}.`, `${a} + ${b} = ${total}`)] : []),
        st("Write the ratio.", `${desc}: ${correct}`),
      ],
    };
  },
};

const ratioTables: Skill = {
  id: "g6.rp.tables",
  title: "Equivalent ratios and tape diagrams",
  topic: T,
  standards: ["NC.6.RP.3"],
  prereqs: ["g6.rp.ratios", "g5.multiply"],
  lesson: {
    bigIdea: "Equivalent ratios come from multiplying (or dividing) both quantities by the same number.",
    explain: [
      "A lemonade recipe uses 2 cups lemon juice for every 5 cups water. Doubling gives 4 : 10, tripling 6 : 15. These are equivalent ratios.",
      "Tape diagrams help with totals: if boys : girls = 2 : 3 and there are 25 students, draw 5 equal boxes (2 + 3). Each box is 25 ÷ 5 = 5 students, so there are 3 × 5 = 15 girls.",
    ],
    visual: { type: "table", headers: ["lemon juice (cups)", "water (cups)"], rows: [[2, 5], [4, 10], [6, 15], [8, 20]] },
  },
  why: [
    { kind: "choice", prompt: "Why is 2 : 5 equivalent to 6 : 15?", choices: ["Both parts were multiplied by 3, so the mixture tastes the same.", "Because 6 − 2 = 4 and 15 − 5 = 10.", "Because 6 and 15 are both multiples of 3."], correct: 0, explain: "Equivalent ratios scale both parts by the same factor." },
    { kind: "written", prompt: "The ratio of boys to girls is 2 : 3 and there are 25 students. Explain how a tape diagram shows there are 15 girls.", keyIdeas: ["draw 2 boxes for boys and 3 for girls (5 boxes)", "25 ÷ 5 = 5 students per box", "3 boxes × 5 = 15 girls"], exemplar: "I draw 2 boxes for boys and 3 boxes for girls, which is 5 equal boxes for 25 students. Each box is 25 ÷ 5 = 5 students. The girls have 3 boxes, so 3 × 5 = 15 girls.", visual: { type: "tape", rows: [{ label: "Boys", segments: [{ text: "?", size: 1, shade: true }, { text: "?", size: 1, shade: true }] }, { label: "Girls", segments: [{ text: "?", size: 1 }, { text: "?", size: 1 }, { text: "?", size: 1 }] }] } },
  ],
  generate(r, lv) {
    const a = r.int(1, 6);
    let b = r.int(2, 9);
    if (a === b) b++;
    if (lv < 3) {
      const ks = r.shuffle([2, 3, 4, 5, 6, 7, 8, 10]).slice(0, 3).sort((x, y) => x - y);
      const miss = r.int(0, 2);
      const col = r.int(0, 1);
      const rows: (string | number)[][] = [[a, b], ...ks.map((k) => [a * k, b * k])];
      const ans = col === 0 ? a * ks[miss] : b * ks[miss];
      rows[miss + 1][col] = "?";
      const [h1, h2] = r.pick([["flour (cups)", "sugar (cups)"], ["red paint (cans)", "white paint (cans)"], ["laps", "minutes"], ["tickets", "dollars"]]);
      return {
        prompt: `The ratio stays the same in every row. What number goes in the “?”`,
        visual: { type: "table", headers: [h1, h2], rows },
        answer: num(ans),
        hints: [
          `Every row is the first row (${a} : ${b}) multiplied by the same number. Find that number for the “?” row.`,
          `In the “?” row, the ${col === 0 ? h2 : h1} number is ${col === 0 ? b * ks[miss] : a * ks[miss]}. Divide: ${col === 0 ? b * ks[miss] : a * ks[miss]} ÷ ${col === 0 ? b : a} = ? That's the scale factor.`,
          `Multiply the other first-row number, ${col === 0 ? a : b}, by that same scale factor.`,
        ],
        steps: [
          st("Look at the row with the “?”.", `The number we know in that row is ${col === 0 ? b * ks[miss] : a * ks[miss]} (in the ${col === 0 ? h2 : h1} column).`),
          st("Find the scale factor.", `Compare it with the first row: ${col === 0 ? b * ks[miss] : a * ks[miss]} ÷ ${col === 0 ? b : a} = ${ks[miss]}. So this row is ${ks[miss]} times the first row.`),
          st("Multiply the other number by the same factor.", `${col === 0 ? a : b} × ${ks[miss]} = ${ans}`),
          st("Check.", `${a} : ${b} and ${a * ks[miss]} : ${b * ks[miss]} are equivalent because both parts were multiplied by ${ks[miss]}.`),
        ],
        traps: traps(F(ans), [trap(col === 0 ? b * ks[miss] - (b - a) : a * ks[miss] + (b - a), "Equivalent ratios multiply, they don't add. Find the scale factor.")]),
      };
    }
    const k = r.int(2, 8);
    const [p, q] = r.pick([["boys", "girls"], ["dogs", "cats"], ["red beads", "blue beads"]]);
    const askFirst = r.chance(0.5);
    const ans = (askFirst ? a : b) * k;
    return {
      prompt: `The ratio of ${p} to ${q} is ${a} : ${b}. There are ${(a + b) * k} ${p} and ${q} in all. How many ${askFirst ? p : q} are there?`,
      visual: { type: "tape", rows: [{ label: p, segments: Array.from({ length: a }, () => ({ text: "?", size: 1, shade: true })) }, { label: q, segments: Array.from({ length: b }, () => ({ text: "?", size: 1 })) }] },
      answer: num(ans),
      hints: [
        `Draw a tape: ${a} box${a === 1 ? "" : "es"} for ${p} and ${b} boxes for ${q}. Together, all the boxes hold the ${(a + b) * k} in all.`,
        `There are ${a} + ${b} = ${a + b} equal boxes. Share ${(a + b) * k} equally: ${(a + b) * k} ÷ ${a + b} = ? per box.`,
        `The ${askFirst ? p : q} get ${askFirst ? a : b} box${(askFirst ? a : b) === 1 ? "" : "es"}. Multiply ${askFirst ? a : b} × (one box).`,
      ],
      steps: [
        st("Draw the tape diagram.", `${p}: ${a} box${a === 1 ? "" : "es"}, ${q}: ${b} boxes. That's ${a} + ${b} = ${a + b} equal boxes in all.`),
        st("Find what one box is worth.", `All ${a + b} boxes together are ${(a + b) * k}, so one box = ${(a + b) * k} ÷ ${a + b} = ${k}.`),
        st(`Find the number of ${askFirst ? p : q}.`, `${askFirst ? a : b} box${(askFirst ? a : b) === 1 ? "" : "es"} × ${k} = ${ans}`),
        st("Check.", `${a * k} ${p} + ${b * k} ${q} = ${(a + b) * k} ✔, and ${a * k} : ${b * k} simplifies to ${a} : ${b} ✔`),
      ],
      traps: traps(F(ans), [trap((askFirst ? a : b) * ((a + b) * k) / (askFirst ? b : a), `Use the total: there are ${a + b} boxes in all.`)]),
    };
  },
};

const unitRate: Skill = {
  id: "g6.rp.unit-rate",
  title: "Unit rates and best buys",
  topic: T,
  standards: ["NC.6.RP.2", "NC.6.RP.3"],
  prereqs: ["g6.rp.tables", "g6.ns.dec-div"],
  lesson: {
    bigIdea: "A unit rate is how much for ONE: price per item, miles per hour, words per minute.",
    explain: [
      "6 pencils cost $3: $3 ÷ 6 = **$0.50 per pencil**. 10 pencils cost $4: $4 ÷ 10 = **$0.40 per pencil**. The second pack costs less per pencil.",
      "To find a unit rate, divide by the quantity you want “per one” of.",
    ],
    tip: "“Per” means “for each one”, which tells you what to divide by.",
  },
  why: [
    { kind: "choice", prompt: "Why compare price per pencil instead of total price?", choices: ["The packs have different numbers of pencils, so price for one pencil is a fair comparison.", "Total price is always wrong.", "Because cheaper packs are always better."], correct: 0, explain: "Unit rates compare on equal footing." },
    { kind: "written", prompt: "6 pencils cost $3 and 10 pencils cost $4. Explain which is the better buy and how you know.", keyIdeas: ["find cost per pencil", "$3 ÷ 6 = $0.50; $4 ÷ 10 = $0.40", "10 for $4 is cheaper per pencil"], exemplar: "I find the price of one pencil in each pack. $3 ÷ 6 = $0.50 each and $4 ÷ 10 = $0.40 each. The 10-pack is the better buy because each pencil costs less." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const per = r.int(2, 15);
      const n = r.int(2, 9);
      const [verb, thing, unit, rateUnit] = r.pick([["bikes", "miles", "hours", "miles per hour"], ["reads", "pages", "minutes", "pages per minute"], ["types", "words", "minutes", "words per minute"], ["earns", "dollars", "hours", "dollars per hour"]]);
      return {
        prompt: `${r.pick(NAMES)} ${verb} ${per * n} ${thing} in ${n} ${unit}. What is the rate in ${rateUnit}?`,
        answer: num(per),
        hints: [`“Per ${unit.replace(/s$/, "")}” means in ONE ${unit.replace(/s$/, "")}. Share the ${per * n} ${thing} equally over the ${n} ${unit}.`, `Divide the ${thing} by the ${unit}: ${per * n} ÷ ${n} = ?`],
        steps: [
          st("“Per” means “for each one”.", `We want the number of ${thing} for 1 ${unit.replace(/s$/, "")}.`),
          st(`Share the ${thing} equally over the ${unit}.`, `${per * n} ÷ ${n} = ${per}`),
          st("Answer with units.", `${per} ${rateUnit}`),
          st("Check.", `${per} × ${n} ${unit} = ${per * n} ${thing} ✔`),
        ],
        traps: traps(F(per), [trap(frac(n, per * n), `That's ${unit} per ${thing.replace(/s$/, "")}. Divide by the ${unit}.`)]),
      };
    }
    const cents = r.int(15, 95);
    const n = r.int(3, 12);
    const price = (cents * n) / 100;
    if (lv === 2) {
      const item = r.pick(["granola bars", "markers", "apples", "stickers", "notebooks"]);
      return {
        prompt: `A pack of ${n} ${item} costs ${money(price)}. What is the price per ${item.replace(/s$/, "")}?`,
        answer: num(fromDecimal(cents / 100), { pre: "$" }),
        hints: [`You want the price of ONE ${item.replace(/s$/, "")}, so split ${money(price)} equally among ${n} ${item}: divide by ${n}.`, `Think in cents: ${money(price)} is ${Math.round(price * 100)} cents. ${Math.round(price * 100)} ÷ ${n} = ? cents. Then write it in dollars.`],
        steps: [
          st("Price for one = total price ÷ number of items.", `${money(price)} ÷ ${n}`),
          st("Think in cents to make it easier.", `${money(price)} = ${Math.round(price * 100)} cents, and ${Math.round(price * 100)} ÷ ${n} = ${cents} cents.`),
          st("Write it in dollars.", `${cents} cents = ${money(cents / 100)} each`),
          st("Check.", `${n} × ${money(cents / 100)} = ${money(price)} ✔`),
        ],
      };
    }
    let cents2 = r.int(15, 95);
    while (cents2 === cents) cents2 = r.int(15, 95);
    let n2 = r.int(3, 12);
    if (n2 === n) n2++;
    const price2 = (cents2 * n2) / 100;
    const item = r.pick(["pencils", "juice boxes", "pens", "cookies"]);
    const a = `${n} ${item} for ${money(price)}`;
    const b = `${n2} ${item} for ${money(price2)}`;
    const better = cents < cents2 ? a : b;
    const worse = cents < cents2 ? b : a;
    return {
      prompt: `Which is the better buy (lower price per item)?`,
      answer: choice(r, better, [[worse, "Compare the price of ONE item in each pack."], ["They cost the same per item", "Divide each price by the number of items to compare."]], true),
      hints: [
        `The packs are different sizes, so compare the price of ONE ${item === "juice boxes" ? "juice box" : item.replace(/s$/, "")} in each pack.`,
        `Pack of ${n}: ${money(price)} is ${Math.round(price * 100)} cents, and ${Math.round(price * 100)} ÷ ${n} = ? cents each.`,
        `Pack of ${n2}: ${Math.round(price2 * 100)} cents ÷ ${n2} = ? cents each. The pack with the smaller price for one is the better buy.`,
      ],
      steps: [
        st("The packs have different sizes, so compare the price of ONE item.", "Unit price = total price ÷ number of items."),
        st(`Pack of ${n}.`, `${money(price)} ÷ ${n}: ${Math.round(price * 100)} cents ÷ ${n} = ${cents} cents = ${money(cents / 100)} each.`),
        st(`Pack of ${n2}.`, `${money(price2)} ÷ ${n2}: ${Math.round(price2 * 100)} cents ÷ ${n2} = ${cents2} cents = ${money(cents2 / 100)} each.`),
        st("Compare.", `${money(Math.min(cents, cents2) / 100)} < ${money(Math.max(cents, cents2) / 100)}, so the better buy is ${better}.`),
      ],
    };
  },
};

/** Hint ladder for p% of base that follows percentOfSteps (easy fractions, else 10% building blocks). */
function percentHints(p: number, base: number): string[] {
  const n = (x: number) => String(round(x, 4));
  const ten = base / 10;
  const easy: Record<number, [string, number]> = { 50: ["half", 2], 25: ["a quarter", 4], 20: ["a fifth", 5] };
  if (easy[p]) return [`${p}% is ${easy[p][0]} of a number.`, `Split ${base} into ${easy[p][1]} equal parts: ${base} ÷ ${easy[p][1]} = ?`];
  if (p === 75) return ["75% is three quarters of a number.", `Find a quarter first: ${base} ÷ 4. Then take 3 of those quarters.`];
  if (p === 10) return ["10% is one tenth of a number.", `Split ${base} into 10 equal parts: ${base} ÷ 10 = ?`];
  if (p === 5) return [`5% is half of 10%. Find 10% first: ${base} ÷ 10 = ${n(ten)}.`, `Now take half of that: ${n(ten)} ÷ 2 = ?`];
  const tens = Math.floor(p / 10);
  const out = [`Use 10% as a building block: 10% of ${base} is ${base} ÷ 10 = ${n(ten)}.`];
  if (tens > 1) out.push(`${tens * 10}% is ${tens} groups of 10%: ${tens} × ${n(ten)} = ?`);
  if (p % 10 === 5) out.push(`5% is half of 10%, so 5% is ${n(ten / 2)}. Add it to your ${tens * 10}%.`);
  return out;
}

const percentOf: Skill = {
  id: "g6.rp.percent",
  title: "Percent of a number",
  topic: T,
  standards: ["NC.6.RP.3"],
  prereqs: ["g6.rp.tables", "g5.decimals"],
  lesson: {
    bigIdea: "Percent means “per 100”. 30% of 80 means {30/100} of 80.",
    explain: [
      "Easy percents: 50% is half, 25% is a quarter, 10% is divide by 10. So 30% of 80 = 3 × (10% of 80) = 3 × 8 = **24**.",
      "Any percent: change it to a decimal and multiply. 35% of 60 = 0.35 × 60 = 21.",
      "What percent is 12 of 48? {12/48} = {1/4} = {25/100} = 25%.",
    ],
    visual: { type: "tape", rows: [{ label: "80", segments: Array.from({ length: 10 }, (_, i) => ({ text: "8", size: 1, shade: i < 3 })) }, { label: "%", segments: Array.from({ length: 10 }, (_, i) => ({ text: `${(i + 1) * 10}%`, size: 1 })) }] },
    tip: "10% is a great building block: find 10%, then scale up.",
  },
  why: [
    { kind: "choice", prompt: "Why is 10% of a number the same as dividing it by 10?", choices: ["10% = {10/100} = {1/10}, and one-tenth of a number is that number ÷ 10.", "Because percent always means divide by 10.", "Because 10 × 10 = 100."], correct: 0, explain: "{10/100} simplifies to {1/10}." },
    { kind: "written", prompt: "Explain two different ways to find 30% of 80.", keyIdeas: ["10% of 80 is 8, so 30% is 3 × 8 = 24", "0.30 × 80 = 24 (or 30/100 × 80)", "check: 24 is a bit less than one third of 80"], exemplar: "One way: 10% of 80 is 8, and 30% is three times that, 24. Another way: 30% = 0.3, and 0.3 × 80 = 24. Both give 24." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const p = r.pick([10, 50, 25, 20, 75]);
      const base = r.pick([20, 40, 60, 80, 100, 120, 200]) * (p === 25 || p === 75 ? 1 : r.int(1, 2));
      const ans = (p * base) / 100;
      return {
        prompt: `What is ${p}% of ${base}?`,
        answer: num(ans),
        hints: percentHints(p, base),
        steps: percentOfSteps(p, base),
        traps: traps(F(ans), [trap(base / p, "That's dividing by the percent. Percent means per 100: multiply by {p/100}.".replace("{p/100}", `{${p}/100}`))]),
      };
    }
    if (lv === 2) {
      const p = r.int(1, 19) * 5;
      const base = r.int(2, 30) * 4;
      const ans = round((p * base) / 100, 2);
      return {
        prompt: `What is ${p}% of ${base}?`,
        answer: num(fromDecimal(ans)),
        hints: percentHints(p, base),
        steps: percentOfSteps(p, base),
        traps: traps(fromDecimal(ans), [trap(p * base, "Remember to change the percent to a decimal (divide by 100) first.")]),
      };
    }
    const whole = r.pick([20, 25, 40, 50, 80, 200, 60, 120]);
    const p = r.pick([10, 20, 25, 30, 40, 50, 60, 75, 80, 5, 15]);
    const part = (p * whole) / 100;
    if (!Number.isInteger(part)) {
      return { prompt: `What percent of 40 is 10?`, answer: num(25, { unit: "%" }), hints: ["Percent means “out of 100”. Write 10 out of 40 as a fraction: {10/40}.", "Simplify {10/40}: divide the top and bottom by 10.", "Now make the bottom 100: multiply the top and bottom by 25."], steps: [st("Write the part over the whole.", "{10/40}"), ...simplifySteps(10, 40), st("Make the denominator 100.", "{1/4} = {1 × 25/4 × 25} = {25/100}"), st("Percent means “out of 100”.", "{25/100} = 25%")] };
    }
    return {
      prompt: `${part} is what percent of ${whole}?`,
      answer: num(p, { unit: "%" }),
      hints: (() => {
        const g = (x: number, y: number): number => (y ? g(y, x % y) : x);
        const k = g(part, whole);
        const sd = whole / k;
        return [
          `Percent means “out of 100”. Write ${part} out of ${whole} as a fraction: {${part}/${whole}}.`,
          ...(k > 1 ? [`Simplify {${part}/${whole}}: divide the top and bottom by ${k}.`] : []),
          100 % sd === 0
            ? `Now make the bottom 100: 100 ÷ ${sd} = ${100 / sd}, so multiply the top and bottom by ${100 / sd}.`
            : `Divide ${part} ÷ ${whole} to get a decimal, then read it as hundredths.`,
        ];
      })(),
      steps: (() => {
        const g = (x: number, y: number): number => (y ? g(y, x % y) : x);
        const k = g(part, whole);
        const sn = part / k, sd = whole / k;
        return [
          st("Write the part over the whole.", `${part} out of ${whole} is ${raw(part, whole)}.`),
          ...simplifySteps(part, whole),
          100 % sd === 0
            ? st("Make the denominator 100.", `100 ÷ ${sd} = ${100 / sd}, so multiply the top and bottom by ${100 / sd}: {${sn} × ${100 / sd}/${sd} × ${100 / sd}} = {${p}/100}.`)
            : st("Divide to get a decimal.", `${part} ÷ ${whole} = ${round(part / whole, 4)} = {${p}/100}.`),
          st("Percent means “out of 100”.", `{${p}/100} = ${p}%`),
          st("Check.", `${p}% of ${whole} = ${part} ✔`),
        ];
      })(),
      traps: traps(F(p), [trap(round((whole / part) * 100, 2), `Put the part (${part}) on top and the whole (${whole}) on the bottom.`)]),
    };
  },
};

const percentWhole: Skill = {
  id: "g6.rp.percent-whole",
  title: "Finding the whole from a percent",
  topic: T,
  standards: ["NC.6.RP.3"],
  prereqs: ["g6.rp.percent"],
  lesson: {
    bigIdea: "If you know a part and its percent, scale up to 100%.",
    explain: [
      "12 is 30% of what number? 30% → 12, so 10% → 4, so 100% → **40**.",
      "Or use a table: 30 : 12 is the same ratio as 100 : ?. Multiply 12 by {100/30}.",
    ],
    visual: { type: "table", headers: ["percent", "amount"], rows: [[30, 12], [10, 4], [100, 40]] },
  },
  why: [
    { kind: "choice", prompt: "12 is 30% of a number. Why is the number bigger than 12?", choices: ["12 is only part (30%) of the whole, and the whole is 100%.", "Because percents make numbers bigger.", "It isn't; the number is 3.6."], correct: 0, explain: "A part less than 100% is smaller than the whole." },
    { kind: "written", prompt: "Explain how you'd find the whole number if 15 is 25% of it.", keyIdeas: ["25% is one quarter", "the whole is 4 times the part", "15 × 4 = 60"], exemplar: "25% is a quarter of the whole. If a quarter is 15, the whole is 4 times that: 15 × 4 = 60. Check: 25% of 60 is 15." },
  ],
  generate(r, lv) {
    const p = lv === 1 ? r.pick([10, 25, 50, 20]) : r.pick([10, 20, 25, 30, 40, 60, 75, 80, 5, 15, 35]);
    const whole = (lv === 1 ? r.int(2, 20) * 10 : r.int(2, 30) * 20);
    const part = (p * whole) / 100;
    const ctx = lv === 3
      ? `${r.pick(NAMES)} has read ${part} pages, which is ${p}% of the book. How many pages is the whole book?`
      : `${part} is ${p}% of what number?`;
    return {
      prompt: ctx,
      answer: num(whole),
      hints: [
        `${part} is only ${p}% of the ${lv === 3 ? "book" : "number"}. The whole is 100%, so work up from ${p}% to 100%.`,
        ...(p === 50
          ? [`50% is half. If half is ${part}, the whole is 2 halves: 2 × ${part} = ?`]
          : p === 25
            ? [`25% is a quarter. If a quarter is ${part}, the whole is 4 quarters: 4 × ${part} = ?`]
            : p === 75
              ? [`75% is three quarters. Find one quarter first: ${part} ÷ 3.`, "The whole is 4 quarters: multiply one quarter by 4."]
              : p === 10
                ? [`10% is one tenth. The whole is 10 tenths: 10 × ${part} = ?`]
                : p === 5
                  ? [`100% is 20 groups of 5%. Multiply: 20 × ${part} = ?`]
                  : p % 10 === 0
                    ? [`${p}% is ${p / 10} groups of 10%. Find 10%: ${part} ÷ ${p / 10}.`, "100% is 10 groups of 10%: multiply your 10% by 10."]
                    : [`${p}% is ${p / 5} groups of 5%. Find 5%: ${part} ÷ ${p / 5}.`, "100% is 20 groups of 5%: multiply your 5% by 20."]),
      ],
      steps: [
        st("Write what you know.", `${p}% of the whole is ${part}. We want 100%.`),
        ...(p === 50
          ? [st("50% is half.", `If half is ${part}, the whole is 2 × ${part} = ${whole}.`)]
          : p === 25
            ? [st("25% is a quarter.", `If a quarter is ${part}, the whole is 4 × ${part} = ${whole}.`)]
            : p === 75
              ? [st("75% is three quarters.", `So one quarter is ${part} ÷ 3 = ${part / 3}.`), st("Four quarters make the whole.", `4 × ${part / 3} = ${whole}`)]
              : p === 10 || p === 5
                ? [st(`Find 100%.`, `100% is ${100 / p} groups of ${p}%: ${100 / p} × ${part} = ${whole}.`)]
                : p % 10 === 0
                ? [st("Find 10%.", `${p}% is ${p / 10} groups of 10%, so 10% = ${part} ÷ ${p / 10} = ${part / (p / 10)}.`), st("Find 100%.", `100% is 10 groups of 10%: 10 × ${part / (p / 10)} = ${whole}.`)]
                : [st("Find 5%.", `${p}% is ${p / 5} groups of 5%, so 5% = ${part} ÷ ${p / 5} = ${part / (p / 5)}.`), st("Find 100%.", `100% is 20 groups of 5%: 20 × ${part / (p / 5)} = ${whole}.`)]),
        st("Check.", `${p}% of ${whole} = ${p / 100} × ${whole} = ${part} ✔`),
      ],
      traps: traps(F(whole), [trap(fromDecimal(round((p * part) / 100, 4)), `That's ${p}% of ${part}. Here ${part} is the part; we need the whole.`)]),
    };
  },
};

const convert: Skill = {
  id: "g6.rp.convert",
  title: "Converting units",
  topic: T,
  standards: ["NC.6.RP.3"],
  prereqs: ["g6.rp.tables"],
  lesson: {
    bigIdea: "Use a known rate like 12 inches per foot to convert, multiplying when going to smaller units.",
    explain: [
      "Feet → inches: each foot is 12 inches, so 5 ft = 5 × 12 = 60 in. Bigger unit → smaller unit: multiply.",
      "Inches → feet: 48 in ÷ 12 = 4 ft. Smaller unit → bigger unit: divide.",
      "Handy facts: 3 ft = 1 yd, 16 oz = 1 lb, 2 cups = 1 pint, 2 pints = 1 quart, 4 quarts = 1 gallon, 100 cm = 1 m, 1000 g = 1 kg, 60 min = 1 hr.",
    ],
    tip: "Ask: should my answer be a bigger or smaller number?",
  },
  why: [
    { kind: "choice", prompt: "Why do you multiply to change feet into inches?", choices: ["Inches are smaller, so it takes more of them, and each foot is 12 inches.", "You always multiply when converting.", "Because 12 is a big number."], correct: 0, explain: "Smaller units → more of them." },
    { kind: "written", prompt: "Explain how to change 3 gallons into cups.", keyIdeas: ["1 gallon = 4 quarts, 1 quart = 2 pints, 1 pint = 2 cups → 16 cups per gallon", "multiply because cups are smaller", "3 × 16 = 48 cups"], exemplar: "One gallon is 4 quarts, each quart is 2 pints, and each pint is 2 cups, so a gallon is 4 × 2 × 2 = 16 cups. Cups are smaller, so I multiply: 3 × 16 = 48 cups." },
  ],
  generate(r, lv) {
    const one = (u: string) => (u === "feet" ? "foot" : u.replace(/s$/, ""));
    const facts: [string, string, number][] = [["feet", "inches", 12], ["yards", "feet", 3], ["pounds", "ounces", 16], ["hours", "minutes", 60], ["meters", "centimeters", 100], ["kilograms", "grams", 1000], ["gallons", "quarts", 4], ["quarts", "pints", 2], ["pints", "cups", 2], ["minutes", "seconds", 60]];
    if (lv === 3) {
      const [big, , k] = r.pick([["yards", "", 36], ["gallons", "", 16]] as [string, string, number][]);
      const small = big === "yards" ? "inches" : "cups";
      const n = r.int(2, 6);
      return {
        prompt: `How many ${small} are in ${n} ${big}?`,
        answer: num(n * k),
        hints: big === "yards"
          ? ["Inches are much smaller than yards, so multiply. First find how many inches are in ONE yard.", "1 yard = 3 feet, and each foot is 12 inches, so 1 yard = 3 × 12 inches.", `Now multiply: ${n} × (inches in 1 yard).`]
          : ["Cups are much smaller than gallons, so multiply. First find how many cups are in ONE gallon.", "1 gallon = 4 quarts, 1 quart = 2 pints, 1 pint = 2 cups. So 1 gallon = 4 × 2 × 2 cups.", `Now multiply: ${n} × (cups in 1 gallon).`],
        steps: [
          st("Build the conversion fact one step at a time.", big === "yards" ? "1 yard = 3 feet, and each foot = 12 inches, so 1 yard = 3 × 12 = 36 inches." : "1 gallon = 4 quarts, each quart = 2 pints, each pint = 2 cups, so 1 gallon = 4 × 2 × 2 = 16 cups."),
          st("Bigger unit → smaller unit, so multiply.", `There will be more ${small} than ${big}: ${n} × ${k} = ${n * k} ${small}.`),
        ],
      };
    }
    const [big, small, k] = r.pick(facts);
    const n = r.int(2, 9);
    const toSmall = lv === 1 || r.chance(0.5);
    if (toSmall) {
      return {
        prompt: `${n} ${big} = how many ${small}?`,
        answer: num(n * k),
        hints: [`${small[0].toUpperCase() + small.slice(1)} are smaller than ${big}, so you'll need MORE of them. Multiply.`, `Each ${one(big)} is ${k} ${small}, so multiply: ${n} × ${k} = ?`],
        steps: [
          st("Know the conversion fact.", `1 ${one(big)} = ${k} ${small}.`),
          st("Multiply or divide?", `${small[0].toUpperCase() + small.slice(1)} are smaller than ${big}, so it takes MORE of them. Multiply.`),
          st("Multiply.", `${n} × ${k} = ${n * k} ${small}`),
        ],
        traps: traps(F(n * k), [trap(frac(n, k), `${small} are smaller units, so there should be MORE of them. Multiply.`)]),
      };
    }
    return {
      prompt: `${n * k} ${small} = how many ${big}?`,
      answer: num(n),
      hints: [`${big[0].toUpperCase() + big.slice(1)} are bigger than ${small}, so you'll get FEWER of them. Divide.`, `Every ${k} ${small} make 1 ${one(big)}, so divide: ${n * k} ÷ ${k} = ?`],
      steps: [
        st("Know the conversion fact.", `1 ${one(big)} = ${k} ${small}.`),
        st("Multiply or divide?", `${big[0].toUpperCase() + big.slice(1)} are bigger than ${small}, so there will be FEWER of them. Divide.`),
        st("Divide.", `${n * k} ÷ ${k} = ${n} ${big}`),
        st("Check.", `${n} × ${k} = ${n * k} ${small} ✔`),
      ],
      traps: traps(F(n), [trap(n * k * k, `${big} are bigger units, so there should be FEWER of them. Divide.`)]),
    };
  },
};

export default [ratioLanguage, ratioTables, unitRate, percentOf, percentWhole, convert];
