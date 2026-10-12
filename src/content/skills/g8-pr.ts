import { frac } from "../../lib/rational";
import { F, choice, fr, ms, num, round, trap, traps } from "../helpers";
import type { Skill } from "../types";

const T = "g8-pr";

const expRules: Skill = {
  id: "g8.pr.exponent-rules",
  title: "Exponent rules",
  topic: T,
  standards: ["NC.8.EE.1"],
  prereqs: ["g6.ee.exponents", "g7.ns.mult-int"],
  lesson: {
    bigIdea: "When multiplying powers with the same base, add the exponents. When dividing, subtract. Power of a power: multiply.",
    explain: [
      "3^2 × 3^4 = (3·3)(3·3·3·3) = 3^6. Count the 3s: 2 + 4 = 6.",
      "7^5 ÷ 7^2 = 7^3: two of the 7s cancel.",
      "(5^3)^2 = 5^3 × 5^3 = 5^6.",
      "Zero and negative exponents keep the pattern going: 2^3 = 8, 2^2 = 4, 2^1 = 2, 2^0 = 1, 2^-1 = {1/2}, 2^-2 = {1/4}. Each step down divides by 2.",
    ],
    visual: { type: "table", headers: ["power", "value"], rows: [["2^3", 8], ["2^2", 4], ["2^1", 2], ["2^0", 1], ["2^-1", "1/2"], ["2^-2", "1/4"]] },
  },
  why: [
    { kind: "choice", prompt: "Why is 2^0 = 1?", choices: ["Each step down in the pattern 8, 4, 2, … divides by 2, and 2 ÷ 2 = 1.", "Anything times 0 is 0, so it should be 0.", "Because 2 − 2 = 0."], correct: 0, explain: "Follow the halving pattern." },
    { kind: "written", prompt: "Explain why 4^3 × 4^2 = 4^5 without using a memorized rule.", keyIdeas: ["4^3 is three 4s multiplied, 4^2 is two 4s", "together there are five 4s multiplied", "so 4^5"], exemplar: "4^3 means 4 × 4 × 4 and 4^2 means 4 × 4. Multiplying them gives 4 × 4 × 4 × 4 × 4, which is five 4s, so 4^5." },
  ],
  generate(r, lv) {
    const b = r.int(2, 9);
    if (lv === 1) {
      const m = r.int(2, 7);
      const n = r.int(2, 7);
      const div = r.chance(0.5);
      const e = div ? Math.max(m, n) - Math.min(m, n) : m + n;
      const prompt = div ? `${b}^${Math.max(m, n)} ÷ ${b}^${Math.min(m, n)} = ${b}^?` : `${b}^${m} × ${b}^${n} = ${b}^?`;
      return {
        prompt: `Find the missing exponent: ${prompt}`,
        answer: num(e),
        hints: [div ? "Dividing powers with the same base: subtract exponents." : "Multiplying powers with the same base: add exponents.", "Write them out if you're not sure and count."],
        steps: [div ? `${Math.max(m, n)} − ${Math.min(m, n)} = ${e}` : `${m} + ${n} = ${e}`],
        traps: traps(F(e), [trap(div ? Math.max(m, n) / Math.min(m, n) : m * n, div ? "Subtract the exponents (don't divide them)." : "Add the exponents (don't multiply them).")]),
      };
    }
    if (lv === 2) {
      const m = r.int(2, 5);
      const n = r.int(2, 4);
      return {
        prompt: `Find the missing exponent: (${b}^${m})^${n} = ${b}^?`,
        answer: num(m * n),
        hints: [`(${b}^${m})^${n} means ${n} copies of ${b}^${m} multiplied together.`, "Power of a power: multiply the exponents."],
        steps: [`${m} × ${n} = ${m * n}`],
        traps: traps(F(m * n), [trap(m + n, `You're multiplying ${n} copies of ${b}^${m}, so it's ${m} added ${n} times.`)]),
      };
    }
    const bb = r.pick([2, 3, 4, 5, 10]);
    const e = -r.int(1, bb === 10 ? 3 : 3);
    const zero = r.chance(0.25);
    const val = zero ? F(1) : frac(1, bb ** -e);
    return {
      prompt: `${bb}^${zero ? 0 : ms(e)} = ? (Write a fraction or decimal.)`,
      answer: num(val),
      hints: [zero ? "Look at the pattern: each time the exponent drops by 1, divide by the base." : "A negative exponent means 1 divided by the positive power.", zero ? `${bb}^1 = ${bb}, so ${bb}^0 = ${bb} ÷ ${bb}.` : `${bb}^${ms(e)} = {1/${bb}^${-e}}`],
      steps: zero ? [`${bb}^0 = 1`] : [`${bb}^${ms(e)} = {1/${bb}^${-e}} = ${fr(val)}`],
      traps: traps(val, zero ? [trap(0, "Any nonzero number to the 0 power is 1. Follow the pattern.")] : [trap(-(bb ** -e), "A negative exponent doesn't make the number negative: it means 1 over the power."), trap(bb * e, "An exponent isn't multiplication by the exponent.")]),
    };
  },
};

const roots: Skill = {
  id: "g8.pr.roots",
  title: "Square roots and cube roots",
  topic: T,
  standards: ["NC.8.EE.2"],
  prereqs: ["g6.ee.exponents"],
  lesson: {
    bigIdea: "√49 asks: what number times itself is 49? (7). ∛64 asks: what number cubed is 64? (4).",
    explain: [
      "Perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144.",
      "Perfect cubes: 1, 8, 27, 64, 125, 216, 343, 512, 729, 1000.",
      "A square with area 81 has side √81 = 9. A cube with volume 27 has edge ∛27 = 3.",
      "√({4/9}) = {2/3} because {2/3} × {2/3} = {4/9}.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is √64 = 8 but ∛64 = 4?", choices: ["8 × 8 = 64 and 4 × 4 × 4 = 64.", "Because 64 ÷ 8 = 8 and 64 ÷ 16 = 4.", "They should be equal."], correct: 0, explain: "Square root undoes squaring; cube root undoes cubing." },
    { kind: "written", prompt: "A square garden has an area of 144 square feet. Explain how to find the length of each side.", keyIdeas: ["area of a square = side × side", "side = √144", "12 feet because 12 × 12 = 144"], exemplar: "The area of a square is side × side. So I need a number that times itself makes 144. 12 × 12 = 144, so each side is 12 feet." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const s = r.int(2, 15);
      return {
        prompt: `√${s * s} = ?`,
        answer: num(s),
        hints: [`What number times itself is ${s * s}?`, `Try ${s - 1} × ${s - 1} and ${s + 1} × ${s + 1}.`],
        steps: [`${s} × ${s} = ${s * s}, so √${s * s} = ${s}`],
        traps: traps(F(s), [trap(s * s / 2, "Square root isn't dividing by 2. Find a number that times itself gives this.")]),
      };
    }
    if (lv === 2) {
      const c = r.int(2, 10);
      return {
        prompt: r.chance(0.5) ? `∛${c ** 3} = ?` : `A cube has a volume of ${c ** 3} cubic inches. How long is each edge?`,
        answer: num(c),
        hints: [`What number × itself × itself = ${c ** 3}?`, "Try small numbers: 2³ = 8, 3³ = 27, 4³ = 64, 5³ = 125…"],
        steps: [`${c} × ${c} × ${c} = ${c ** 3}`],
        traps: traps(F(c), [trap(c ** 3 / 3, "Cube root isn't dividing by 3.")]),
      };
    }
    const a = r.int(1, 6);
    const b = r.int(a + 1, 10);
    const g = (x: number, y: number): number => (y ? g(y, x % y) : x);
    if (g(a, b) !== 1 || r.chance(0.4)) {
      const s = r.int(2, 12);
      return {
        prompt: `Solve for x (x > 0): x² = ${s * s}`,
        answer: num(s),
        hints: ["Undo squaring with a square root.", `x = √${s * s}`],
        steps: [`x = √${s * s} = ${s}`, `(−${s} also works, but we want x > 0)`],
      };
    }
    return {
      prompt: `√({${a * a}/${b * b}}) = ?`,
      answer: num(frac(a, b)),
      hints: ["Take the square root of the top and of the bottom.", `√${a * a} and √${b * b}.`],
      steps: [`√${a * a} = ${a}, √${b * b} = ${b}`, `= ${fr(frac(a, b))}`],
    };
  },
};

const irrational: Skill = {
  id: "g8.pr.irrational",
  title: "Irrational numbers and estimating roots",
  topic: T,
  standards: ["NC.8.NS.1", "NC.8.NS.2"],
  prereqs: ["g8.pr.roots"],
  lesson: {
    bigIdea: "√20 isn't a whole number, but it's between 4 and 5 because 16 < 20 < 25.",
    explain: [
      "√20 is closer to 4 than 5 (20 is 4 away from 16 but 5 away from 25), so it's about 4.5 or a bit less: √20 ≈ 4.47.",
      "Numbers like √2, √20 and π are **irrational**: their decimals go on forever without repeating, so they can't be written as fractions.",
      "Square roots of perfect squares (√25 = 5) and fractions and repeating decimals are **rational**.",
    ],
    visual: { type: "numberline", min: 3, max: 6, step: 0.5, labelEvery: 2, points: [{ v: 4.47, label: "√20" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is √20 between 4 and 5?", choices: ["4² = 16 and 5² = 25, and 20 is between 16 and 25.", "Because 20 ÷ 4 = 5.", "Because 20 is between 4 and 5."], correct: 0, explain: "Compare with nearby perfect squares." },
    { kind: "written", prompt: "Explain how to estimate √50 to the nearest whole number.", keyIdeas: ["49 < 50 < 64, so √50 is between 7 and 8", "50 is much closer to 49", "so √50 ≈ 7 (about 7.1)"], exemplar: "The nearest perfect squares are 49 (7²) and 64 (8²). 50 is between them, so √50 is between 7 and 8. Since 50 is very close to 49, √50 is just over 7, about 7.1." },
  ],
  generate(r, lv) {
    let n: number;
    do n = r.int(5, 150);
    while (Number.isInteger(Math.sqrt(n)));
    const lo = Math.floor(Math.sqrt(n));
    if (lv === 1) {
      return {
        prompt: `√${n} is between which two consecutive whole numbers?`,
        answer: { kind: "multi", fields: [{ value: F(lo), pre: "between" }, { value: F(lo + 1), pre: "and" }] },
        hints: [`Find perfect squares just below and above ${n}.`, `${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) ** 2}.`],
        steps: [`${lo * lo} < ${n} < ${(lo + 1) ** 2}`, `so ${lo} < √${n} < ${lo + 1}`],
      };
    }
    if (lv === 2) {
      const items: [string, boolean][] = [["√" + n, false], ["√" + lo * lo, true], ["π", false], ["0.333… (repeating)", true], ["{3/7}", true], ["√2", false], ["−4.5", true], ["0.1010010001… (pattern never repeats)", false]];
      const askIrr = r.chance(0.5);
      const pool = r.shuffle(items);
      const right = pool.find(([, rat]) => rat !== askIrr)!;
      const wrong = pool.filter(([, rat]) => rat === askIrr).slice(0, 3);
      return {
        prompt: `Which number is ${askIrr ? "irrational" : "rational"}?`,
        answer: choice(r, right[0], wrong.map(([t]) => [t, askIrr ? "This can be written as a fraction (or a repeating/ending decimal), so it's rational." : "This decimal never ends or repeats, so it's irrational."] as [string, string])),
        hints: ["Rational numbers can be written as fractions. Their decimals end or repeat.", "Square roots of non-perfect squares and π are irrational."],
        steps: [`${right[0]} is ${askIrr ? "irrational" : "rational"}`],
      };
    }
    const est = Math.sqrt(n);
    return {
      prompt: `Estimate √${n} to the nearest tenth.`,
      answer: num(round(est, 1), { tolerance: 0.051 }),
      hints: [`It's between ${lo} and ${lo + 1}.`, `Try squaring decimals: ${lo}.5² = ${round((lo + 0.5) ** 2, 2)}.`],
      steps: [`${lo}² = ${lo * lo}, ${lo + 1}² = ${(lo + 1) ** 2}`, `√${n} ≈ ${round(est, 2)}, so about ${round(est, 1)}`],
    };
  },
};

const sci: Skill = {
  id: "g8.pr.sci",
  title: "Scientific notation",
  topic: T,
  standards: ["NC.8.EE.3", "NC.8.EE.4"],
  prereqs: ["g8.pr.exponent-rules", "g6.ns.dec-mult"],
  lesson: {
    bigIdea: "Scientific notation writes a number as (a number from 1 to just under 10) × (a power of 10).",
    explain: [
      "45,000 = 4.5 × 10^4 (move the decimal point 4 places). 0.0032 = 3.2 × 10^-3.",
      "Multiply by multiplying the front numbers and adding exponents: (3 × 10^4)(2 × 10^3) = 6 × 10^7.",
      "Comparing: 6 × 10^8 is 10^3 = 1000 times as big as 6 × 10^5.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does 0.0032 have a negative exponent in scientific notation?", choices: ["It's less than 1, so you divide 3.2 by 10 three times.", "Because it has zeros.", "It should be positive."], correct: 0, explain: "10^-3 = {1/1000}." },
    { kind: "written", prompt: "The Sun is about 1.5 × 10^8 km from Earth, and the Moon about 3.8 × 10^5 km. Explain roughly how many times farther the Sun is.", keyIdeas: ["compare the powers: 10^8 ÷ 10^5 = 10^3", "1.5 vs 3.8 changes the estimate a little (about 0.4)", "roughly 400 times"], exemplar: "10^8 ÷ 10^5 = 10^3, which is 1000. But 1.5 is about 0.4 of 3.8, so the Sun is roughly 0.4 × 1000 = 400 times farther." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const ai = r.int(11, 99);
      const a = ai / 10;
      const e = r.int(3, 8);
      const n = ai * 10 ** (e - 1);
      return {
        prompt: `Write ${n.toLocaleString("en-US")} in scientific notation.`,
        answer: { kind: "multi", fields: [{ value: F(ai, 10) }, { value: F(e), pre: "× 10^" }] },
        hints: ["Move the decimal so there's one nonzero digit in front of it.", "Count how many places you moved it: that's the exponent."],
        steps: [`${n.toLocaleString("en-US")} = ${a} × 10^${e}`],
      };
    }
    if (lv === 2) {
      const ai = r.int(11, 99);
      const a = ai / 10;
      const e = r.int(2, 5);
      const n = round(a / 10 ** e, 8);
      return {
        prompt: `Write ${n.toFixed(e + 1).replace(/0+$/, "")} in scientific notation.`,
        answer: { kind: "multi", fields: [{ value: F(ai, 10) }, { value: F(-e), pre: "× 10^" }] },
        hints: ["Small numbers get a negative exponent.", "Move the decimal right until one nonzero digit is in front."],
        steps: [`${n} = ${a} × 10^${ms(-e)}`],
      };
    }
    const a = r.int(1, 4);
    const b = r.int(1, 2);
    const e1 = r.int(2, 9);
    const e2 = r.int(2, 9);
    if (r.chance(0.5)) {
      return {
        prompt: `(${a} × 10^${e1}) × (${b} × 10^${e2}) = ? (Answer in scientific notation.)`,
        answer: { kind: "multi", fields: [{ value: F(a * b) }, { value: F(e1 + e2), pre: "× 10^" }] },
        hints: ["Multiply the front numbers.", "Add the exponents of 10."],
        steps: [`${a} × ${b} = ${a * b}`, `10^${e1} × 10^${e2} = 10^${e1 + e2}`],
      };
    }
    const big = Math.max(e1, e2) + 2;
    const small = Math.min(e1, e2);
    return {
      prompt: `About how many times larger is ${a} × 10^${big} than ${a} × 10^${small}? Write your answer as a power of 10.`,
      answer: { kind: "multi", fields: [{ value: F(big - small), pre: "10^" }] },
      hints: ["The front numbers are the same, so compare the powers of 10.", `10^${big} ÷ 10^${small}`],
      steps: [`10^${big} ÷ 10^${small} = 10^${big - small}`],
    };
  },
};

export default [expRules, roots, irrational, sci];
