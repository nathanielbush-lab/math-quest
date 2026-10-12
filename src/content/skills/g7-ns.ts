import { add, div, frac, fromDecimal, mul, neg, sub } from "../../lib/rational";
import { F, NAMES, choice, fr, ms, num, round, sn, trap, traps } from "../helpers";
import type { Skill } from "../types";

const T = "g7-ns";

const addInt: Skill = {
  id: "g7.ns.add-int",
  title: "Adding and subtracting integers",
  topic: T,
  standards: ["NC.7.NS.1"],
  prereqs: ["g6.ns.negatives", "g6.ns.abs"],
  lesson: {
    bigIdea: "Adding a positive moves right on the number line; adding a negative moves left. Subtracting means adding the opposite.",
    explain: [
      "A temperature of −3° rises 7°: −3 + 7 = **4**. Start at −3 and move 7 right.",
      "−5 + (−4): move left 4 more → −9. Same signs: add the sizes, keep the sign.",
      "6 − 9 = 6 + (−9) = −3. And 4 − (−2) = 4 + 2 = 6: taking away a debt is like gaining money.",
    ],
    visual: { type: "numberline", min: -5, max: 6, step: 1, points: [{ v: -3, label: "−3" }, { v: 4, label: "4" }], jumps: [{ from: -3, to: 4, label: "+7" }] },
    tip: "Subtracting a negative = adding a positive.",
  },
  why: [
    { kind: "choice", prompt: "Why does 4 − (−2) = 6?", choices: ["Subtracting means adding the opposite: 4 + 2 = 6. (Removing a $2 debt leaves you $2 better off.)", "Because two minus signs always make a plus no matter what.", "It equals 2."], correct: 0, explain: "a − b = a + (−b)." },
    { kind: "written", prompt: "The temperature is −3° and then rises 7°. Explain how to find the new temperature with a number line.", keyIdeas: ["start at −3", "rising means move right 7", "3 steps reach 0, 4 more reach 4"], exemplar: "I start at −3 on the number line. Rising 7 degrees means moving 7 to the right. 3 steps gets me to 0 and 4 more steps gets to 4, so the new temperature is 4 degrees." },
  ],
  generate(r, lv) {
    let a = r.int(-15, 15);
    const b = r.nonzero(-15, 15);
    if (lv === 1 && a >= 0 && b > 0) a = -a - 1;
    const subtract = lv > 1 && r.chance(0.5);
    const ans = subtract ? a - b : a + b;
    if (lv === 1) {
      return {
        prompt: `${ms(a)} + ${sn(b)} = ?`,
        visual: Math.abs(a) <= 10 && Math.abs(ans) <= 10 ? { type: "numberline", min: -12, max: 12, step: 1, labelEvery: 2, points: [{ v: a }] } : undefined,
        answer: num(ans),
        hints: [`Start at ${ms(a)}.`, `Adding ${ms(b)} moves you ${b > 0 ? "right" : "left"} ${Math.abs(b)}.`],
        steps: [`Start at ${ms(a)}, move ${b > 0 ? "right" : "left"} ${Math.abs(b)}`, `= ${ms(ans)}`],
        traps: traps(F(ans), [trap(-ans, "Check the sign: which side of 0 do you end up on?"), trap(a - b, "This is addition: move in the direction of the second number's sign.")]),
      };
    }
    if (lv === 3) {
      const depth = -Math.abs(a) - 5;
      const ctx = r.pick([
        [`At 6 a.m. it was ${ms(a)}°F. By noon the temperature ${b > 0 ? "rose" : "fell"} ${Math.abs(b)}°. What was the noon temperature?`, a + b, `${ms(a)} + ${sn(b)} = ${ms(a + b)}`],
        [`A submarine is at ${ms(depth)} meters. It ${b > 0 ? "rises" : "dives"} ${Math.abs(b)} meters. What is its new elevation?`, depth + b, `${ms(depth)} + ${sn(b)} = ${ms(depth + b)}`],
        [`The high was ${ms(a)}° and the low was ${ms(a - Math.abs(b))}°. How many degrees apart were the high and low?`, Math.abs(b), `${ms(a)} − ${sn(a - Math.abs(b))} = ${Math.abs(b)}`],
      ] as [string, number, string][]);
      return {
        prompt: ctx[0],
        answer: num(ctx[1]),
        hints: ["Write an addition or subtraction with signed numbers.", "Use a number line in your head: up is right, down is left."],
        steps: [ctx[2]],
      };
    }
    const op = subtract ? "−" : "+";
    return {
      prompt: `${ms(a)} ${op} ${sn(b)} = ?`,
      answer: num(ans),
      hints: subtract ? [`Change subtraction to adding the opposite: ${ms(a)} + ${sn(-b)}.`, "Now add using the number line."] : ["Same signs: add sizes and keep the sign. Different signs: subtract sizes and keep the sign of the bigger size."],
      steps: subtract ? [`${ms(a)} − ${sn(b)} = ${ms(a)} + ${sn(-b)}`, `= ${ms(ans)}`] : [`${ms(a)} + ${sn(b)} = ${ms(ans)}`],
      traps: traps(F(ans), [trap(subtract ? a + b : a - b, subtract ? "Subtracting means adding the OPPOSITE of the second number." : "This is addition."), trap(-ans, "Check the sign of your answer.")]),
    };
  },
};

function randRational(r: Parameters<Skill["generate"]>[0], dec: boolean) {
  return dec ? fromDecimal(r.nonzero(-99, 99) / 10) : frac(r.nonzero(-9, 9), r.pick([2, 3, 4, 5, 6, 8]));
}

const addRational: Skill = {
  id: "g7.ns.add-rational",
  title: "Adding and subtracting signed fractions and decimals",
  topic: T,
  standards: ["NC.7.NS.1"],
  prereqs: ["g7.ns.add-int", "g5.addsub", "g6.ns.dec-addsub"],
  lesson: {
    bigIdea: "The same sign rules work for fractions and decimals: just combine them carefully.",
    explain: [
      "−{1/2} + {3/4} = −{2/4} + {3/4} = {1/4}.",
      "−2.5 − 1.3 = −2.5 + (−1.3) = −3.8.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is −{1/2} + {3/4} positive?", choices: ["{3/4} is farther from 0 than {1/2}, so the positive part wins.", "Because fractions are always positive.", "It's negative."], correct: 0, explain: "Compare absolute values to decide the sign." },
    { kind: "written", prompt: "Explain how to find −2.5 − 1.3.", keyIdeas: ["subtracting is adding the opposite: −2.5 + (−1.3)", "both negative, so add sizes: 3.8", "answer −3.8"], exemplar: "Subtracting 1.3 is the same as adding −1.3. So it's −2.5 + (−1.3). Both are negative, so I add 2.5 + 1.3 = 3.8 and keep the negative sign: −3.8." },
  ],
  generate(r, lv) {
    const dec = lv === 1 || (lv === 3 && r.chance(0.5));
    const a = randRational(r, dec);
    const b = randRational(r, dec);
    const subtract = r.chance(0.5);
    const ans = subtract ? sub(a, b) : add(a, b);
    const show = (x: typeof a) => (dec ? ms(round(x.n / x.d, 4)) : ms(fr(x)));
    const showP = (x: typeof a) => (x.n < 0 ? `(${show(x)})` : show(x));
    return {
      prompt: `${show(a)} ${subtract ? "−" : "+"} ${showP(b)} = ?`,
      answer: num(ans, { simplest: !dec }),
      hints: [...(subtract ? [`Rewrite as adding the opposite: ${show(a)} + ${showP(neg(b))}.`] : []), dec ? "Line up the decimal points." : "Use a common denominator.", "Decide the sign: which number is farther from 0?"],
      steps: [...(subtract ? [`${show(a)} + ${showP(neg(b))}`] : []), `= ${dec ? show(ans) : ms(fr(ans))}`],
      traps: traps(ans, [trap(neg(ans), "Check the sign: which number has the larger absolute value?"), trap(subtract ? add(a, b) : sub(a, b), "Double-check the operation (and remember subtracting is adding the opposite).")]),
    };
  },
};

const multInt: Skill = {
  id: "g7.ns.mult-int",
  title: "Multiplying and dividing integers",
  topic: T,
  standards: ["NC.7.NS.2"],
  prereqs: ["g7.ns.add-int"],
  lesson: {
    bigIdea: "Same signs → positive. Different signs → negative. (For both × and ÷.)",
    explain: [
      "3 × (−4) = −12: three groups of −4 (three $4 debts).",
      "(−3) × (−4) = 12: the opposite of 3 × (−4). Removing three $4 debts makes you $12 better off.",
      "Division follows the same rule because it undoes multiplication: −12 ÷ 3 = −4 since 3 × (−4) = −12.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is (−2) × (−5) positive?", choices: ["It's the opposite of 2 × (−5) = −10, so it's 10.", "Because two negatives always cancel when you add them.", "It's negative."], correct: 0, explain: "−2 × (−5) = −(2 × (−5)) = −(−10) = 10." },
    { kind: "written", prompt: "Explain why −20 ÷ 4 = −5.", keyIdeas: ["division undoes multiplication", "4 × (−5) = −20", "so −20 ÷ 4 = −5 (different signs give a negative)"], exemplar: "Division undoes multiplication, so I ask: 4 times what gives −20? 4 × (−5) = −20, so −20 ÷ 4 = −5. That matches the rule that different signs give a negative." },
  ],
  generate(r, lv) {
    let a = r.nonzero(-12, 12);
    const b = r.nonzero(-12, 12);
    if (lv < 3 && a > 0 && b > 0 && r.chance(0.8)) a = -a;
    if (lv === 3) {
      const c = r.nonzero(-5, 5);
      const ans = a * b * c;
      return {
        prompt: `${sn(a)} × ${sn(b)} × ${sn(c)} = ?`,
        answer: num(ans),
        hints: ["Count the negative signs: even → positive, odd → negative.", "Multiply the sizes."],
        steps: [`${[a, b, c].filter((x) => x < 0).length} negative factor(s) → ${ans < 0 ? "negative" : "positive"}`, `= ${ms(ans)}`],
        traps: traps(F(ans), [trap(-ans, "Count the negative factors to decide the sign.")]),
      };
    }
    const divide = lv === 2 && r.chance(0.6);
    const ans = divide ? a : a * b;
    const prompt = divide ? `${ms(a * b)} ÷ ${sn(b)} = ?` : `${sn(a)} × ${sn(b)} = ?`;
    return {
      prompt,
      answer: num(ans),
      hints: ["Same signs → positive. Different signs → negative.", divide ? `Ask: ${sn(b)} × ? = ${ms(a * b)}` : "Multiply the sizes, then decide the sign."],
      steps: [`Signs: ${divide ? (a * b < 0) !== (b < 0) ? "different" : "same" : (a < 0) !== (b < 0) ? "different" : "same"} → ${ans < 0 ? "negative" : "positive"}`, `= ${ms(ans)}`],
      traps: traps(F(ans), [trap(-ans, "Check the sign rule: same signs give a positive, different signs give a negative.")]),
    };
  },
};

const multRational: Skill = {
  id: "g7.ns.mult-rational",
  title: "Multiplying and dividing signed fractions and decimals",
  topic: T,
  standards: ["NC.7.NS.2"],
  prereqs: ["g7.ns.mult-int", "g6.ns.div-fractions", "g6.ns.dec-mult"],
  lesson: {
    bigIdea: "Use the same sign rules with fraction and decimal methods.",
    explain: [
      "−{2/3} × {3/4} = −{6/12} = −{1/2} (different signs → negative).",
      "−1.5 ÷ (−0.5) = 3 (same signs → positive).",
      "Every fraction is a division: {3/8} = 3 ÷ 8 = 0.375. Some decimals repeat: {2/3} = 0.666…",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is −{1/2} ÷ {1/4} equal to −2?", choices: ["Two quarters fit in a half, and different signs make the result negative.", "Because dividing makes numbers smaller.", "It equals −{1/8}."], correct: 0, explain: "{1/2} ÷ {1/4} = 2, then apply the sign rule." },
    { kind: "written", prompt: "Explain why {1/3} as a decimal goes on forever.", keyIdeas: ["1/3 means 1 ÷ 3", "long division keeps leaving remainder 1", "so the 3s repeat: 0.333…"], exemplar: "1/3 means 1 ÷ 3. When I do long division, every step leaves a remainder of 1, so I keep bringing down a zero and getting 3 again. The 3s never stop: 0.333…" },
  ],
  generate(r, lv) {
    if (lv === 3 && r.chance(0.4)) {
      const opts: [string, string, string[]][] = [["{2/3}", "0.666… (repeating)", ["0.23", "0.6", "1.5"]], ["{1/3}", "0.333… (repeating)", ["0.13", "0.3", "3.0"]], ["{3/8}", "0.375", ["0.38", "3.8", "0.83"]], ["{5/6}", "0.8333… (repeating)", ["0.56", "0.83", "1.2"]], ["{7/20}", "0.35", ["0.72", "3.5", "0.0035"]]];
      const [f, right, wrong] = r.pick(opts);
      return {
        prompt: `Which decimal equals ${f}?`,
        answer: choice(r, right, wrong.map((w) => [w, "A fraction means the top divided by the bottom. Try long division."] as [string, string])),
        hints: ["A fraction bar means divide.", "Do the long division and watch for repeating remainders."],
        steps: [`${f} → ${right}`],
      };
    }
    const dec = lv === 1;
    const a = dec ? fromDecimal(r.nonzero(-30, 30) / 10) : frac(r.nonzero(-8, 8), r.pick([2, 3, 4, 5, 6]));
    const b = dec ? fromDecimal(r.nonzero(-9, 9) / 10) : frac(r.nonzero(-8, 8), r.pick([2, 3, 4, 5, 9]));
    const divide = r.chance(0.5);
    const ans = divide ? div(a, b) : mul(a, b);
    const show = (x: typeof a) => (dec ? ms(round(x.n / x.d, 4)) : ms(fr(x)));
    const showP = (x: typeof a) => (x.n < 0 ? `(${show(x)})` : show(x));
    return {
      prompt: `${show(a)} ${divide ? "÷" : "×"} ${showP(b)} = ?`,
      answer: num(ans, { simplest: !dec }),
      hints: ["Decide the sign first: same signs → positive, different → negative.", divide ? (dec ? "Multiply both by 10 to make the divisor whole." : "Multiply by the reciprocal of the second fraction.") : dec ? "Multiply, then count decimal places." : "Multiply tops and bottoms, then simplify."],
      steps: [`Sign: ${ans.n < 0 ? "negative" : "positive"}`, `= ${dec ? show(ans) : ms(fr(ans))}`],
      traps: traps(ans, [trap(neg(ans), "Check the sign rule.")]),
    };
  },
};

const signedWord: Skill = {
  id: "g7.ns.word",
  title: "Signed number word problems",
  topic: T,
  standards: ["NC.7.NS.3"],
  prereqs: ["g7.ns.add-rational", "g7.ns.mult-int"],
  lesson: {
    bigIdea: "Decide what is positive and what is negative, write an expression, then calculate.",
    explain: [
      "A stock loses $2.50 a day for 4 days: 4 × (−2.50) = −10, a $10 drop.",
      "A diver at −30 m rises 12 m and then dives 8 m: −30 + 12 − 8 = −26 m.",
    ],
    tip: "Check that the sign of your answer makes sense in the story.",
  },
  why: [
    { kind: "choice", prompt: "A diver is at −30 m and rises 12 m. Why is the new depth −18 m and not −42 m?", choices: ["Rising moves up toward 0, so you add +12.", "Because depths are always negative.", "It is −42 m."], correct: 0, explain: "Up = positive change." },
    { kind: "written", prompt: "A bank balance is $40. You buy 3 games at $18 each. Explain how to find the new balance and what it means.", keyIdeas: ["3 × (−18) = −54", "40 + (−54) = −14", "−14 means you owe $14 (overdrawn)"], exemplar: "Each game takes away $18, so 3 games change the balance by 3 × (−18) = −54. Then 40 + (−54) = −14. A balance of −$14 means the account is overdrawn and you owe $14." },
  ],
  generate(r, lv) {
    const name = r.pick(NAMES);
    const kind = r.int(0, lv === 1 ? 1 : 3);
    if (kind === 0) {
      const start = -r.int(10, 60);
      const up = r.int(5, 30);
      const down = r.int(3, 25);
      const ans = start + up - down;
      return {
        prompt: `A diver is at ${ms(start)} feet. The diver rises ${up} feet, then dives ${down} feet. What is the diver's new elevation?`,
        answer: num(ans),
        hints: ["Rising is positive, diving is negative.", `${ms(start)} + ${up} − ${down}`],
        steps: [`${ms(start)} + ${up} = ${ms(start + up)}`, `${ms(start + up)} − ${down} = ${ms(ans)} feet`],
      };
    }
    if (kind === 1) {
      const loss = r.int(2, 9) + r.pick([0, 0.25, 0.5, 0.75]);
      const days = r.int(3, 8);
      const ans = round(-loss * days, 2);
      return {
        prompt: `A stock's price drops $${loss.toFixed(2)} each day for ${days} days. What is the total change in price (use a negative number for a drop)?`,
        answer: num(fromDecimal(ans), { pre: "$" }),
        hints: [`Each day's change is −${loss.toFixed(2)}.`, `${days} × (−${loss.toFixed(2)})`],
        steps: [`${days} × (−${loss.toFixed(2)}) = ${ms(ans.toFixed(2))}`],
        traps: traps(fromDecimal(ans), [trap(fromDecimal(-ans), "A drop is a negative change.")]),
      };
    }
    if (kind === 2) {
      const bal = r.int(20, 80);
      const n = r.int(2, 5);
      const cost = r.int(12, 30);
      const ans = bal - n * cost;
      return {
        prompt: `${name} has $${bal} in a bank account and buys ${n} items that cost $${cost} each. What is the new balance?`,
        answer: num(ans, { pre: "$" }),
        hints: [`Spending is negative: ${n} × (−${cost}).`, `${bal} + ${n} × (−${cost})`],
        steps: [`${n} × (−${cost}) = −${n * cost}`, `${bal} − ${n * cost} = ${ms(ans)}`],
      };
    }
    const temps = Array.from({ length: 5 }, () => r.int(-12, 6));
    const total = temps.reduce((a, b) => a + b, 0);
    const adj = ((5 - (((total % 5) + 5) % 5)) % 5);
    temps[0] += adj;
    const mean = temps.reduce((a, b) => a + b, 0) / 5;
    return {
      prompt: `The low temperatures for five days were ${temps.map(ms).join("°, ")}°. What was the mean low temperature?`,
      answer: num(mean),
      hints: ["Add all five temperatures (careful with signs).", "Divide the total by 5."],
      steps: [`Total: ${ms(temps.reduce((a, b) => a + b, 0))}`, `÷ 5 = ${ms(mean)}°`],
      traps: traps(F(mean), [trap(-mean, "Check the sign of the total.")]),
    };
  },
};

export default [addInt, addRational, multInt, multRational, signedWord];
