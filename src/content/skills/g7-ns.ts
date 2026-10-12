import { add, div, frac, fromDecimal, mul, neg, sub } from "../../lib/rational";
import { F, NAMES, choice, fr, mixed, ms, num, round, sn, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { decimalDivideSteps, decimalMultiplySteps, finishSteps, fracDivide, fracTimes, lcdStep, places, raw, st } from "../steps";

/** Explains the sign rules for adding two signed numbers (works for decimals). */
function addRule(a: number, b: number): string {
  const r = (x: number) => Number(x.toFixed(6));
  const A = Math.abs(a), B = Math.abs(b);
  if (a === 0 || b === 0) return st("Adding zero changes nothing.", `${ms(r(a))} + ${sn(r(b))} = ${ms(r(a + b))}`);
  if ((a < 0) === (b < 0)) return st("Same signs: add the sizes and keep the sign.", `${r(A)} + ${r(B)} = ${r(A + B)}, and both are ${a < 0 ? "negative" : "positive"}, so the answer is ${ms(r(a + b))}.`);
  const big = A >= B ? a : b;
  return st("Different signs: subtract the sizes and keep the sign of the one farther from 0.", `${r(Math.max(A, B))} − ${r(Math.min(A, B))} = ${r(Math.abs(A - B))}. ${ms(r(big))} is farther from 0, so the answer is ${A === B ? "0" : big < 0 ? "negative" : "positive"}: ${ms(r(a + b))}.`);
}

/** Sign rule for × and ÷. */
function signRule(a: number, b: number, op: "×" | "÷"): string {
  const same = (a < 0) === (b < 0);
  return st("Decide the sign first.", `${ms(a)} and ${ms(b)} have ${same ? "the same sign" : "different signs"}, so the answer is ${same ? "positive" : "negative"}. (${op === "×" ? "Multiplying" : "Dividing"} works the same way.)`);
}

/** Short hint version of addRule: which sign rule applies, with this problem's sizes (no answer). */
function addHint(a: number, b: number): string {
  const r = (x: number) => Number(x.toFixed(6));
  const A = r(Math.abs(a)), B = r(Math.abs(b));
  if (a === 0 || b === 0) return "Adding 0 doesn't change a number.";
  if ((a < 0) === (b < 0)) return a < 0 ? `Both are negative: add the sizes, ${A} + ${B}, and keep the minus sign.` : `Both are positive: just add ${A} + ${B}.`;
  if (A === B) return `${ms(r(a))} and ${ms(r(b))} are opposites (same size, different signs). What do opposites add up to?`;
  return `Different signs: subtract the sizes, ${Math.max(A, B)} − ${Math.min(A, B)}. The answer gets the sign of ${ms(r(A > B ? a : b))}, the one farther from 0.`;
}

/** Sign-rule hint for × and ÷ that doesn't give the sign away. */
const SIGN_RULE = "same signs → positive, different signs → negative";

const T = "g7-ns";
const gcdN = (x: number, y: number): number => (y ? gcdN(y, x % y) : Math.abs(x));

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
    { kind: "written", prompt: "The temperature is −3° and then rises 7°. Explain how to find the new temperature with a number line.", keyIdeas: ["start at −3", "rising means move right 7", "3 steps reach 0, 4 more reach 4"], exemplar: "I start at −3 on the number line. Rising 7 degrees means moving 7 to the right. 3 steps gets me to 0 and 4 more steps gets to 4, so the new temperature is 4 degrees.", visual: { type: "numberline", min: -5, max: 5, step: 1 } },
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
        hints: [`Picture a number line and start at ${ms(a)}. Adding ${ms(b)} means moving ${b > 0 ? "right" : "left"} ${Math.abs(b)}.`, addHint(a, b)],
        steps: [
          st("Start at the first number.", `Picture a number line and put your finger on ${ms(a)}.`),
          st("Move by the second number.", `Adding ${ms(b)} means moving ${b > 0 ? "right" : "left"} ${Math.abs(b)}.`),
          st("See where you land.", `You end at ${ms(ans)}.`),
          addRule(a, b),
        ],
        traps: traps(F(ans), [trap(-ans, "Check the sign: which side of 0 do you end up on?"), trap(a - b, "This is addition: move in the direction of the second number's sign.")]),
      };
    }
    if (lv === 3) {
      const depth = -Math.abs(a) - 5;
      const low = a - Math.abs(b);
      const ctx = r.pick([
        [`At 6 a.m. it was ${ms(a)}°F. By noon the temperature ${b > 0 ? "rose" : "fell"} ${Math.abs(b)}°. What was the noon temperature?`, a + b, `${ms(a)} + ${sn(b)} = ${ms(a + b)}`, [`Rising is +, falling is −. Start at ${ms(a)} and ${b > 0 ? "add" : "add the negative"}: ${ms(a)} + ${sn(b)}.`, addHint(a, b)]],
        [`A submarine is at ${ms(depth)} meters. It ${b > 0 ? "rises" : "dives"} ${Math.abs(b)} meters. What is its new elevation?`, depth + b, `${ms(depth)} + ${sn(b)} = ${ms(depth + b)}`, [`Up is +, down is −. Start at ${ms(depth)} and ${b > 0 ? "add" : "add the negative"}: ${ms(depth)} + ${sn(b)}.`, addHint(depth, b)]],
        [`The high was ${ms(a)}° and the low was ${ms(low)}°. How many degrees apart were the high and low?`, Math.abs(b), `${ms(a)} − ${sn(low)} = ${Math.abs(b)}`, [`“How far apart” means subtract: high − low = ${ms(a)} − ${sn(low)}.`, `Subtracting means adding the opposite: ${ms(a)} + ${sn(-low)}. Or picture a number line and count the steps from ${ms(low)} up to ${ms(a)}.`]],
      ] as [string, number, string, string[]][]);
      return {
        prompt: ctx[0],
        answer: num(ctx[1]),
        hints: ctx[3],
        steps: [
          st("Turn the story into signed numbers.", "Rising, up or warmer is +. Falling, down, diving or colder is −."),
          st("Calculate.", ctx[2]),
          st("Answer.", `${ms(ctx[1])}${ctx[0].includes("°") ? "°" : ctx[0].includes("meters") ? " meters" : ""}`),
        ],
      };
    }
    const op = subtract ? "−" : "+";
    return {
      prompt: `${ms(a)} ${op} ${sn(b)} = ?`,
      answer: num(ans),
      hints: subtract
        ? [`Subtracting means adding the opposite: ${ms(a)} − ${sn(b)} = ${ms(a)} + ${sn(-b)}.`, addHint(a, -b)]
        : [`Picture a number line and start at ${ms(a)}. Adding ${ms(b)} means moving ${b > 0 ? "right" : "left"} ${Math.abs(b)}.`, addHint(a, b)],
      steps: [
        ...(subtract ? [st("Subtracting means adding the opposite.", `${ms(a)} − ${sn(b)} = ${ms(a)} + ${sn(-b)}`)] : []),
        addRule(a, subtract ? -b : b),
        st("Answer.", ms(ans)),
      ],
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
      hints: (() => {
        const B = subtract ? neg(b) : b;
        const opp = `Subtracting means adding the opposite: ${show(a)} + ${showP(B)}.`;
        if (dec || (a.d === 1 && B.d === 1)) {
          const x = a.n / a.d, y = B.n / B.d;
          const look = (x < 0) === (y < 0) ? `Look at the signs: both numbers are ${x < 0 ? "negative" : "positive"}.` : "Look at the signs: one number is positive and one is negative.";
          return [subtract ? opp : look, addHint(x, y) + (dec ? " Line up the decimal points." : "")];
        }
        const L = (a.d * B.d) / gcdN(a.d, B.d);
        const an = a.n * (L / a.d), bn = B.n * (L / B.d);
        return [
          subtract ? opp : "To add fractions, they need the same denominator. Then use the sign rules on the tops.",
          a.d === B.d
            ? `Both already have denominator ${L}, so you only need to add the tops.`
            : `Use ${L} as the common denominator. Rewrite ${[[a, an], [B, bn]].filter(([f]) => (f as typeof a).d !== L).map(([f, n]) => `${show(f as typeof a)} = ${raw(n as number, L)}`).join(" and ")}.`,
          an > 0 && bn > 0 ? `Now add the tops: ${an} + ${bn}. Keep the denominator ${L}.` : `Now add the tops: ${ms(an)} + ${sn(bn)}. ${addHint(an, bn)}`,
        ];
      })(),
      steps: (() => {
        const B = subtract ? neg(b) : b;
        if (dec) {
          return [
            ...(subtract ? [st("Subtracting means adding the opposite.", `${show(a)} − ${showP(b)} = ${show(a)} + ${showP(B)}`)] : []),
            addRule(a.n / a.d, B.n / B.d),
            st("Answer.", show(ans)),
          ];
        }
        const L = (a.d * B.d) / gcdN(a.d, B.d);
        const an = a.n * (L / a.d), bn = B.n * (L / B.d);
        return [
          ...(subtract ? [st("Subtracting means adding the opposite.", `${show(a)} − ${showP(b)} = ${show(a)} + ${showP(B)}`)] : []),
          ...(a.d !== B.d ? [lcdStep(a.d, B.d), st(`Rewrite both with ${L} on the bottom.`, `${show(a)} = ${raw(an, L)} and ${show(B)} = ${raw(bn, L)}`)] : []),
          st("Add the numerators using the sign rules.", `${ms(an)} + ${sn(bn)} = ${ms(an + bn)}${(an < 0) !== (bn < 0) && an && bn ? ` (different signs: ${Math.max(Math.abs(an), Math.abs(bn))} − ${Math.min(Math.abs(an), Math.abs(bn))} = ${Math.abs(an + bn)}, and the sign of the bigger one wins)` : ""}, so the sum is ${raw(an + bn, L)}.`),
          ...finishSteps(an + bn, L),
          st("Answer.", ms(mixed(ans))),
        ];
      })(),
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
        hints: (() => {
          const negs = [a, b, c].filter((x) => x < 0).length;
          return [
            "Work out the sign and the size separately. For the sign, count the negative numbers: an even count → positive, an odd count → negative.",
            `There ${negs === 1 ? "is 1 negative number" : `are ${negs} negative numbers`}. For the size, multiply ${Math.abs(a)} × ${Math.abs(b)} × ${Math.abs(c)}.`,
          ];
        })(),
        steps: [
          st("Count the negative factors.", `${[a, b, c].filter((x) => x < 0).length} negative factor${[a, b, c].filter((x) => x < 0).length === 1 ? "" : "s"}. An even number of negatives makes a positive; an odd number makes a negative. So the answer is ${ans < 0 ? "negative" : "positive"}.`),
          st("Multiply the sizes.", `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a * b)}, then × ${Math.abs(c)} = ${Math.abs(ans)}`),
          st("Answer.", ms(ans)),
        ],
        traps: traps(F(ans), [trap(-ans, "Count the negative factors to decide the sign.")]),
      };
    }
    const divide = lv === 2 && r.chance(0.6);
    const ans = divide ? a : a * b;
    const prompt = divide ? `${ms(a * b)} ÷ ${sn(b)} = ?` : `${sn(a)} × ${sn(b)} = ?`;
    return {
      prompt,
      answer: num(ans),
      hints: divide
        ? [`Divide the sizes, then pick the sign. Division uses the same sign rule as ×: ${SIGN_RULE}.`, `${Math.abs(a * b)} ÷ ${Math.abs(b)} = ? ${ms(a * b)} and ${ms(b)} have ${(a * b < 0) === (b < 0) ? "the same sign" : "different signs"}. Check: ${sn(b)} × ? = ${ms(a * b)}.`]
        : [`Multiply the sizes, then pick the sign: ${SIGN_RULE}.`, `${Math.abs(a)} × ${Math.abs(b)} = ? ${ms(a)} and ${ms(b)} have ${(a < 0) === (b < 0) ? "the same sign" : "different signs"}.`],
      steps: divide
        ? [signRule(a * b, b, "÷"), st("Divide the sizes.", `${Math.abs(a * b)} ÷ ${Math.abs(b)} = ${Math.abs(a)}`), st("Answer.", ms(ans)), st("Check by multiplying.", `${sn(b)} × ${sn(ans)} = ${ms(a * b)} ✔`)]
        : [signRule(a, b, "×"), st("Multiply the sizes.", `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(ans)}`), st("Answer.", ms(ans))],
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
        hints: (() => {
          const [fn, fd] = f.slice(1, -1).split("/");
          return [`A fraction bar means divide: ${f} = ${fn} ÷ ${fd}.`, `Do the long division: write ${fn} as ${fn}.000 and divide by ${fd}. Does it stop, or does the same remainder keep coming back?`];
        })(),
        steps: [
          st("A fraction bar means divide.", `${f} means the top ÷ the bottom.`),
          st("Divide (long division).", right.includes("repeating") ? "The remainders start repeating, so the digits repeat forever." : "The division comes out even, so the decimal stops."),
          st("Answer.", `${f} = ${right}`),
        ],
      };
    }
    const dec = lv === 1;
    const divide = r.chance(0.5);
    const b = dec ? fromDecimal(r.nonzero(-9, 9) / 10) : frac(r.nonzero(-8, 8), r.pick([2, 3, 4, 5, 9]));
    // For decimal division, build the dividend from the answer so it comes out even.
    const a = dec ? (divide ? mul(b, fromDecimal(r.nonzero(-12, 12))) : fromDecimal(r.nonzero(-30, 30) / 10)) : frac(r.nonzero(-8, 8), r.pick([2, 3, 4, 5, 6]));
    const ans = divide ? div(a, b) : mul(a, b);
    const show = (x: typeof a) => (dec ? ms(round(x.n / x.d, 4)) : ms(fr(x)));
    const showP = (x: typeof a) => (x.n < 0 ? `(${show(x)})` : show(x));
    return {
      prompt: `${show(a)} ${divide ? "÷" : "×"} ${showP(b)} = ?`,
      answer: num(ans, { simplest: !dec }),
      hints: (() => {
        const x = Math.abs(a.n / a.d), y = Math.abs(b.n / b.d);
        const r6 = (v: number) => Number(v.toFixed(6));
        const first = `Decide the sign first: ${SIGN_RULE}. Then work with the sizes, ignoring the signs.`;
        if (dec) {
          if (divide) return [first, `Make the divisor whole: multiply BOTH numbers by 10. ${r6(x)} ÷ ${r6(y)} becomes ${r6(x * 10)} ÷ ${r6(y * 10)}.`];
          const pa = places(x), pb = places(y);
          return [first, `Multiply ${Math.round(x * 10 ** pa)} × ${Math.round(y * 10 ** pb)} as whole numbers. Then count decimal places: ${pa} + ${pb} = ${pa + pb} in the answer.`];
        }
        const A = F(Math.abs(a.n), a.d), Bf = F(Math.abs(b.n), b.d);
        if (divide) return [first, `Keep, change, flip: ${fr(A)} ÷ ${fr(Bf)} = ${fr(A)} × ${fr(F(Bf.d, Bf.n))}. (Flip the second number to its reciprocal.)`, "Multiply the tops and the bottoms, then simplify."];
        if (A.d === 1 && Bf.d === 1) return [first, `These are whole numbers: multiply the sizes, ${A.n} × ${Bf.n}.`];
        return [first, `Multiply the tops (${A.n} × ${Bf.n}) and the bottoms (${A.d} × ${Bf.d}), then simplify.`];
      })(),
      steps: [
        signRule(a.n / a.d, b.n / b.d, divide ? "÷" : "×"),
        ...(dec
          ? divide
            ? decimalDivideSteps(Math.abs(a.n / a.d), Math.abs(b.n / b.d))
            : decimalMultiplySteps(Math.abs(a.n / a.d), Math.abs(b.n / b.d))
          : [st(divide ? "Divide the sizes: keep, change, flip." : "Multiply the sizes.", divide ? fracDivide(F(Math.abs(a.n), a.d), F(Math.abs(b.n), b.d)) : fracTimes(F(Math.abs(a.n), a.d), F(Math.abs(b.n), b.d)))]),
        st("Answer.", dec ? show(ans) : ms(fr(ans))),
      ],
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
        hints: [`Rising is +, diving is −. Write it: ${ms(start)} + ${up} − ${down}.`, `Go in order. First rise: ${ms(start)} + ${up} = ? Then go down ${down} more from there.`],
        steps: [
          st("Write it with signed numbers.", `Start ${ms(start)}, rise +${up}, dive −${down}: ${ms(start)} + ${up} − ${down}.`),
          st("Rise first.", `${ms(start)} + ${up} = ${ms(start + up)}`),
          st("Then dive.", `${ms(start + up)} − ${down} = ${ms(ans)}`),
          st("Answer.", `${ms(ans)} feet${ans < 0 ? ` (${-ans} feet below sea level)` : ""}`),
        ],
      };
    }
    if (kind === 1) {
      const loss = r.int(2, 9) + r.pick([0, 0.25, 0.5, 0.75]);
      const days = r.int(3, 8);
      const ans = round(-loss * days, 2);
      return {
        prompt: `A stock's price drops $${loss.toFixed(2)} each day for ${days} days. What is the total change in price (use a negative number for a drop)?`,
        answer: num(fromDecimal(ans), { pre: "$" }),
        hints: [`A drop is a negative change, so each day the price changes by −${loss.toFixed(2)}. That happens ${days} times: multiply.`, `${days} × (−${loss.toFixed(2)}) is positive × negative, so the answer is negative. For the size, multiply ${days} × ${loss.toFixed(2)}.`],
        steps: [
          st("Each day's change is negative.", `A drop of $${loss.toFixed(2)} is −${loss.toFixed(2)}.`),
          st(`Multiply by the ${days} days.`, `${days} × (−${loss.toFixed(2)}): positive × negative = negative.`),
          ...decimalMultiplySteps(days, loss),
          st("Answer.", `${ms(ans.toFixed(2))} dollars, a drop of $${(-ans).toFixed(2)}`),
        ],
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
        hints: [`Spending takes money away, so it's negative. ${name} spends ${n} × $${cost} in all.`, `Find ${n} × ${cost}, then subtract it from ${bal}. If that's more than ${bal}, the balance goes below 0.`],
        steps: [
          st("Spending is negative.", `${n} items at $${cost} each change the balance by ${n} × (−${cost}) = −${n * cost}.`),
          st("Add that to the starting balance.", `${bal} + (−${n * cost}) = ${ms(ans)}`),
          st("What it means.", ans < 0 ? `A balance of −$${-ans} means ${name} owes $${-ans}.` : `${name} has $${ans} left.`),
        ],
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
      hints: (() => {
        const negs = temps.filter((t) => t < 0), poss = temps.filter((t) => t > 0);
        const nSum = negs.reduce((x, y) => x + y, 0), pSum = poss.reduce((x, y) => x + y, 0);
        return [
          "Mean = add all five temperatures, then divide by 5. Be careful with the signs when you add.",
          poss.length && negs.length
            ? `Tip: group them. The negatives (${negs.map(ms).join(", ")}) make ${ms(nSum)}. The ${poss.length === 1 ? "positive is" : `positives (${poss.join(", ")}) make`} ${pSum}. Combine those, then divide by 5.`
            : `Add the sizes: ${temps.map((t) => Math.abs(t)).join(" + ")}. ${negs.length ? "They're all below 0, so the total is negative." : ""} Then divide by 5.`.replace("  ", " "),
        ];
      })(),
      steps: [
        st("Add the temperatures (watch the signs).", `${temps.map(ms).join(" + ").replace(/\+ −/g, "+ (−").replace(/(\(−\d+)/g, "$1)")} = ${ms(temps.reduce((a, b) => a + b, 0))}`),
        st("Divide by the number of days.", `${ms(temps.reduce((a, b) => a + b, 0))} ÷ 5 = ${ms(mean)}`),
        st("Answer.", `${ms(mean)}°`),
      ],
      traps: traps(F(mean), [trap(-mean, "Check the sign of the total.")]),
    };
  },
};

export default [addInt, addRational, multInt, multRational, signedWord];
