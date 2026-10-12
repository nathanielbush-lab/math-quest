import { frac } from "../../lib/rational";
import { F, choice, fr, ms, num, round, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { st } from "../steps";

const T = "g8-pr";

/** Guess-and-check nudge for √(s²) that never names s. */
function guessSquare(s: number): string {
  const t = s === 10 ? 8 : s > 10 ? 10 : s === 5 ? 3 : 5;
  return `Guess and check: ${t} × ${t} = ${t * t}. That's too ${t < s ? "small" : "big"}, so try ${t < s ? "bigger" : "smaller"} numbers.`;
}

/** Guess-and-check nudge for ∛(c³) that never names c. */
function guessCube(c: number): string {
  const t = c === 5 ? 3 : c < 5 ? 5 : c >= 8 ? 5 : 10;
  return `Guess and check: ${t} × ${t} × ${t} = ${t ** 3}. That's too ${t < c ? "small" : "big"}, so try ${t < c ? "bigger" : "smaller"} numbers.`;
}

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
        hints: div
          ? [`Write it out: ${Math.max(m, n)} factors of ${b} on top, ${Math.min(m, n)} factors of ${b} on the bottom. Each ${b} on the bottom cancels one ${b} on top.`, `How many factors of ${b} are left on top? That's the exponent. (If they all cancel, it's ${b}^0.) Shortcut: same base, dividing → subtract the exponents.`]
          : [`${b}^${m} means ${m} factors of ${b} multiplied together (${b} × ${b} …), and ${b}^${n} adds ${n} more factors of ${b}.`, `How many factors of ${b} are there in all? Shortcut: same base, multiplying → add the exponents.`],
        steps: div
          ? [
              st("Write it out.", `${b}^${Math.max(m, n)} ÷ ${b}^${Math.min(m, n)} = (${Array(Math.max(m, n)).fill(b).join(" × ")}) ÷ (${Array(Math.min(m, n)).fill(b).join(" × ")})`),
              st("Cancel matching factors.", `Each ${b} on the bottom cancels one ${b} on top (${b} ÷ ${b} = 1).`),
              st("Count what's left.", e === 0 ? `Every ${b} cancels, so only 1 is left: ${b}^0 = 1.` : `${Math.max(m, n)} − ${Math.min(m, n)} = ${e}, so ${e === 1 ? "one factor" : e + " factors"} of ${b} ${e === 1 ? "is" : "are"} left on top.`),
              st("Answer.", `${b}^${e}, so the missing exponent is ${e}. Shortcut: same base, dividing → subtract the exponents.`),
            ]
          : [
              st("Write it out.", `${b}^${m} × ${b}^${n} = (${Array(m).fill(b).join(" × ")}) × (${Array(n).fill(b).join(" × ")})`),
              st("Count all the factors.", `${m} + ${n} = ${e} factors of ${b} multiplied together.`),
              st("Answer.", `${b}^${e}, so the missing exponent is ${e}. Shortcut: same base, multiplying → add the exponents.`),
            ],
        traps: traps(F(e), [trap(div ? Math.max(m, n) / Math.min(m, n) : m * n, div ? "Subtract the exponents (don't divide them)." : "Add the exponents (don't multiply them).")]),
      };
    }
    if (lv === 2) {
      const m = r.int(2, 5);
      const n = r.int(2, 4);
      return {
        prompt: `Find the missing exponent: (${b}^${m})^${n} = ${b}^?`,
        answer: num(m * n),
        hints: [`(${b}^${m})^${n} means ${n} copies of ${b}^${m} multiplied: ${Array(n).fill(`${b}^${m}`).join(" × ")}.`, `Each copy has ${m} factors of ${b}. With ${n} copies, how many factors of ${b} in all? (Power of a power: multiply the exponents.)`],
        steps: [
          st("Write it out.", `(${b}^${m})^${n} means ${n} copies of ${b}^${m} multiplied: ${Array(n).fill(`${b}^${m}`).join(" × ")}`),
          st("Same base, multiplying → add the exponents.", `${Array(n).fill(m).join(" + ")} = ${m * n}`),
          st("Shortcut.", `Adding ${m} a total of ${n} times is ${m} × ${n} = ${m * n}. Answer: ${b}^${m * n}.`),
        ],
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
      hints: zero
        ? [`Follow the pattern: ${bb}^3 = ${bb ** 3}, ${bb}^2 = ${bb ** 2}, ${bb}^1 = ${bb}. Each time the exponent drops by 1, divide by ${bb}.`, `So to step down from ${bb}^1 to ${bb}^0, divide ${bb} by ${bb}.`]
        : [
            `A negative exponent doesn't make the number negative. It means 1 ÷ the positive power: ${bb}^${ms(e)} = 1 ÷ ${bb}^${-e}.`,
            -e > 1 ? `Work out ${bb}^${-e} = ${Array(-e).fill(bb).join(" × ")} first. Then write 1 over that number.` : `Pattern check: ${bb}^1 = ${bb} and ${bb}^0 = 1. One more step down means dividing by ${bb} again.`,
          ],
      steps: zero
        ? [
            st("Follow the pattern.", `${bb}^3 = ${bb ** 3}, ${bb}^2 = ${bb ** 2}, ${bb}^1 = ${bb}. Each time the exponent drops by 1, divide by ${bb}.`),
            st("One more step down.", `${bb}^0 = ${bb} ÷ ${bb} = 1`),
            st("Answer.", "1 (any nonzero number to the 0 power is 1)"),
          ]
        : [
            st("A negative exponent means 1 divided by the positive power.", `${bb}^${ms(e)} = 1 ÷ ${bb}^${-e}`),
            ...(-e > 1 ? [st("Work out the power.", `${bb}^${-e} = ${Array(-e).fill(bb).join(" × ")} = ${bb ** -e}`)] : []),
            st("Answer.", `1 ÷ ${bb ** -e} = ${fr(val)}${bb === 3 ? "" : ` = ${ms(round(1 / bb ** -e, 6))}`}`),
            st("Check with the pattern.", `${bb}^1 = ${bb}, ${bb}^0 = 1, then keep dividing by ${bb}: ${Array.from({ length: -e }, (_, i) => fr(frac(1, bb ** (i + 1)))).join(", ")}`),
          ],
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
        hints: [`√${s * s} asks: what number times itself is ${s * s}?`, guessSquare(s)],
        steps: [
          st("Think.", `√${s * s} asks: what number times itself is ${s * s}?`),
          st("Try nearby numbers.", `${s - 1} × ${s - 1} = ${(s - 1) ** 2} (too small). ${s} × ${s} = ${s * s} ✔`),
          st("Answer.", `√${s * s} = ${s}`),
        ],
        traps: traps(F(s), [trap(s * s / 2, "Square root isn't dividing by 2. Find a number that times itself gives this.")]),
      };
    }
    if (lv === 2) {
      const c = r.int(2, 10);
      const plain = r.chance(0.5);
      return {
        prompt: plain ? `∛${c ** 3} = ?` : `A cube has a volume of ${c ** 3} cubic inches. How long is each edge?`,
        answer: num(c),
        hints: [plain ? `∛${c ** 3} asks: what number × itself × itself = ${c ** 3}?` : `A cube's volume is edge × edge × edge. Which number, used 3 times, multiplies to ${c ** 3}?`, guessCube(c)],
        steps: [
          st("Think.", plain ? `∛${c ** 3} asks: what number × itself × itself is ${c ** 3}?` : `Volume of a cube = edge × edge × edge. So find the number that, used 3 times as a factor, makes ${c ** 3}.`),
          st("Try nearby numbers.", `${c - 1} × ${c - 1} × ${c - 1} = ${(c - 1) ** 3} (too small). ${c} × ${c} × ${c} = ${c * c} × ${c} = ${c ** 3} ✔`),
          st("Answer.", plain ? `∛${c ** 3} = ${c}` : `Each edge is ${c} inches.`),
        ],
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
        hints: [`x² means x × x. Undo the squaring with a square root: find the positive number that times itself makes ${s * s}.`, guessSquare(s)],
        steps: [
          st("Undo the squaring.", `x² = ${s * s} means x × x = ${s * s}, so x = √${s * s}.`),
          st("Find the root.", `${s} × ${s} = ${s * s}, so x = ${s}.`),
          st("Note.", `(−${s}) × (−${s}) = ${s * s} too, but the problem asks for x > 0.`),
        ],
      };
    }
    return {
      prompt: `√({${a * a}/${b * b}}) = ?`,
      answer: num(frac(a, b)),
      hints: ["Take the square root of the top and the bottom separately.", `Top: what number times itself is ${a * a}? Bottom: what number times itself is ${b * b}?`],
      steps: [
        st("Take the root of the top and the bottom separately.", `√({${a * a}/${b * b}}) = √${a * a} over √${b * b}`),
        st("Top.", `${a} × ${a} = ${a * a}, so √${a * a} = ${a}`),
        st("Bottom.", `${b} × ${b} = ${b * b}, so √${b * b} = ${b}`),
        st("Answer and check.", `${fr(frac(a, b))}. Check: {${a}/${b}} × {${a}/${b}} = {${a * a}/${b * b}} ✔`),
      ],
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
        hints: [`Find the perfect squares (like 25 = 5 × 5) just below and just above ${n}.`, `${lo * lo} < ${n} < ${(lo + 1) ** 2}. Which whole numbers are those the squares of?`],
        steps: [
          st("List perfect squares near " + n + ".", `${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) ** 2}`),
          st("See where " + n + " fits.", `${lo * lo} < ${n} < ${(lo + 1) ** 2}`),
          st("Take square roots of all three.", `√${lo * lo} < √${n} < √${(lo + 1) ** 2}, so ${lo} < √${n} < ${lo + 1}`),
          st("Answer.", `√${n} is between ${lo} and ${lo + 1}${n - lo * lo < (lo + 1) ** 2 - n ? ` (closer to ${lo}, since ${n} is nearer ${lo * lo})` : n - lo * lo > (lo + 1) ** 2 - n ? ` (closer to ${lo + 1}, since ${n} is nearer ${(lo + 1) ** 2})` : ""}.`),
        ],
      };
    }
    if (lv === 2) {
      const items: [string, boolean, string][] = [
        ["√" + n, false, `${n} isn't a perfect square, so its root is a never-ending, non-repeating decimal → irrational.`],
        ["√" + lo * lo, true, `√${lo * lo} = ${lo} because ${lo} × ${lo} = ${lo * lo}. A whole number → rational.`],
        ["π", false, "π = 3.14159… never ends and never repeats → irrational."],
        ["0.333… (repeating)", true, "0.333… = {1/3}, a fraction → rational."],
        ["{3/7}", true, "It's already a fraction → rational."],
        ["√2", false, "2 isn't a perfect square → irrational."],
        ["−4.5", true, "−4.5 = −{9/2}, a fraction → rational."],
        ["0.1010010001… (pattern never repeats)", false, "The groups of 0s keep growing, so no block ever repeats → irrational."],
      ];
      const askIrr = r.chance(0.5);
      const pool = r.shuffle(items);
      const right = pool.find(([, rat]) => rat !== askIrr)!;
      const wrong = pool.filter(([, rat]) => rat === askIrr).slice(0, 3);
      return {
        prompt: `Which number is ${askIrr ? "irrational" : "rational"}?`,
        answer: choice(r, right[0], wrong.map(([t]) => [t, askIrr ? "This can be written as a fraction (or a repeating/ending decimal), so it's rational." : "This decimal never ends or repeats, so it's irrational."] as [string, string])),
        hints: ["Rational means it can be written as a fraction. Its decimal either stops or repeats. Irrational decimals go on forever with no repeating pattern.", askIrr ? "Look for π, a never-repeating decimal, or the square root of a number that is NOT a perfect square." : "Look for a fraction, a decimal that stops or repeats, or a square root that comes out to a whole number."],
        steps: [
          st("Know the test.", "Rational = can be written as a fraction (its decimal ends or repeats). Irrational = its decimal goes on forever with no repeating block."),
          ...[right, ...wrong].map(([t, , why]) => st(`${t}:`, why)),
          st("Answer.", `${right[0]} is the only ${askIrr ? "irrational" : "rational"} one.`),
        ],
      };
    }
    const est = Math.sqrt(n);
    const t1 = Math.floor(est * 10) / 10;
    const t2 = round(t1 + 0.1, 1);
    const mid = round(t1 + 0.05, 2);
    return {
      prompt: `Estimate √${n} to the nearest tenth.`,
      answer: num(round(est, 1), { tolerance: 0.051 }),
      hints: [
        `Bracket it: ${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) ** 2}, so √${n} is between ${lo} and ${lo + 1}.`,
        `Square some tenths to trap it. For example, ${lo}.5² = ${round((lo + 0.5) ** 2, 2)}. Is ${n} more or less than that?`,
        `It's between ${t1} and ${t2}. Square the halfway number ${mid}: if ${n} is less than ${mid}², pick ${t1}; if more, pick ${t2}.`,
      ],
      steps: [
        st("Bracket it with perfect squares.", `${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) ** 2}, so √${n} is between ${lo} and ${lo + 1}.`),
        st("Make a first guess.", `${n} is ${n - lo * lo} of the ${2 * lo + 1} steps from ${lo * lo} to ${(lo + 1) ** 2}, so try about ${lo} + {${n - lo * lo}/${2 * lo + 1}} ≈ ${round(lo + (n - lo * lo) / (2 * lo + 1), 1)}.`),
        st("Square two tenths that trap it.", `${t1}² = ${round(t1 * t1, 2)} and ${t2}² = ${round(t2 * t2, 2)}, and ${round(t1 * t1, 2)} < ${n} < ${round(t2 * t2, 2)}.`),
        st("Check the halfway point.", `${mid}² = ${round(mid * mid, 4)}. ${n} is ${n < mid * mid ? "below" : "above"} that, so √${n} is closer to ${n < mid * mid ? t1 : t2}.`),
        st("Answer.", `√${n} ≈ ${round(est, 1)} (a calculator gives ${round(est, 3)}…)`),
      ],
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
        hints: ["Scientific notation is (a number from 1 to just under 10) × (a power of 10). Slide the decimal point left until one digit is in front of it.", `${n.toLocaleString("en-US")} → ${a}. How many places did the point move left? That count is the power of 10.`],
        steps: [
          st("Put the decimal point after the first digit.", `${n.toLocaleString("en-US")} → ${a} (a number from 1 up to 10)`),
          st("Count how far the point must move back.", `To get from ${a} back to ${n.toLocaleString("en-US")}, the point moves ${e} places to the right, which is × 10^${e}.`),
          st("Write it.", `${n.toLocaleString("en-US")} = ${a} × 10^${e}`),
          st("Check.", `10^${e} = ${(10 ** e).toLocaleString("en-US")}, and ${a} × ${(10 ** e).toLocaleString("en-US")} = ${n.toLocaleString("en-US")} ✔`),
        ],
      };
    }
    if (lv === 2) {
      const ai = r.int(11, 99);
      const a = ai / 10;
      const e = r.int(2, 5);
      const n = round(a / 10 ** e, 8);
      const ns = n.toFixed(e + 1).replace(/0+$/, "");
      return {
        prompt: `Write ${ns} in scientific notation.`,
        answer: { kind: "multi", fields: [{ value: F(ai, 10) }, { value: F(-e), pre: "× 10^" }] },
        hints: [`${ns} is less than 1, so the power of 10 will be negative.`, `Move the point right until one nonzero digit is in front: ${ns} → ${a}. Count the moves. That's the exponent, with a minus sign.`],
        steps: [
          st("Move the point right until one nonzero digit is in front.", `${ns} → ${a}`),
          st("Count the moves.", `The point moved ${e} places to the right.`),
          st("Small number → negative exponent.", `${ns} is less than 1, so the exponent is negative: ${a} × 10^${ms(-e)}`),
          st("Check.", `10^${ms(-e)} = {1/${(10 ** e).toLocaleString("en-US")}}, and ${a} ÷ ${(10 ** e).toLocaleString("en-US")} = ${ns} ✔`),
        ],
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
        hints: [`Regroup: (${a} × ${b}) × (10^${e1} × 10^${e2}). Handle the front numbers and the powers of 10 separately.`, `Multiply ${a} × ${b}. For 10^${e1} × 10^${e2}: same base, multiplying → add the exponents.`],
        steps: [
          st("Regroup (you can multiply in any order).", `(${a} × ${b}) × (10^${e1} × 10^${e2})`),
          st("Multiply the front numbers.", `${a} × ${b} = ${a * b}`),
          st("Multiply the powers of 10: add the exponents.", `10^${e1} × 10^${e2} = 10^${e1 + e2}`),
          st("Answer.", `${a * b} × 10^${e1 + e2} (${a * b} is between 1 and 10, so it's already in scientific notation)`),
        ],
      };
    }
    const big = Math.max(e1, e2) + 2;
    const small = Math.min(e1, e2);
    return {
      prompt: `About how many times larger is ${a} × 10^${big} than ${a} × 10^${small}? Write your answer as a power of 10.`,
      answer: { kind: "multi", fields: [{ value: F(big - small), pre: "10^" }] },
      hints: [`Both numbers start with ${a}, so only the powers of 10 matter. "How many times larger" means divide.`, `10^${big} ÷ 10^${small}: dividing powers of the same base → subtract the exponents.`],
      steps: [
        st("The front numbers match.", `Both start with ${a}, so only the powers of 10 matter.`),
        st("How many times larger? Divide.", `10^${big} ÷ 10^${small}: dividing powers of the same base → subtract the exponents.`),
        st("Subtract.", `${big} − ${small} = ${big - small}, so 10^${big - small}`),
        st("What that means.", `10^${big - small} = ${(10 ** (big - small)).toLocaleString("en-US")}, so it's ${(10 ** (big - small)).toLocaleString("en-US")} times as large.`),
      ],
    };
  },
};

export default [expRules, roots, irrational, sci];
