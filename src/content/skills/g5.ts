import { add, frac, gcd, mul, sub } from "../../lib/rational";
import { F, choice, fr, mixed, num, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { finishSteps, gcfSteps, lcdStep, places, raw, rewriteStep, simplifySteps, st, toImproperStep } from "../steps";

/** Last hint for a fraction answer: what is left to do with n/d (simplify and/or make mixed), or "" if nothing. */
function finishHint(n: number, d: number): string {
  const g = gcd(n, d);
  const improper = n / g > d / g && d / g > 1;
  if (g > 1 && d / g === 1) return `${raw(n, d)} simplifies to a whole number: ${n} ÷ ${d} = ?`;
  if (g > 1) return `Simplify ${raw(n, d)}: divide the top and bottom by ${g}.${improper ? " Then change it to a mixed number." : ""}`;
  if (improper) return `${raw(n, d)} is more than 1 whole. Change it to a mixed number: how many ${d}s fit in ${n}?`;
  return "";
}

/** Short "what's left" reminder that doesn't reveal n/d itself (for a hint that leaves n/d for the student to compute). */
function finishTail(n: number, d: number): string {
  const g = gcd(n, d);
  const improper = n / g > d / g;
  if (g > 1 && d / g === 1) return ` Then simplify: it comes out to a whole number.`;
  if (g > 1) return ` Then simplify (the top and bottom both divide by ${g})${improper ? " and change it to a mixed number" : ""}.`;
  if (improper) return " Then change it to a mixed number.";
  return "";
}

/** Hint for finding the GCF of a and b, matching gcfSteps (factor lists for small numbers, dividing out common primes for big ones). */
function gcfHint(a: number, b: number): string {
  if (Math.max(a, b) <= 60) return `List the factors of ${a} and of ${b}. Which is the biggest number in both lists?`;
  return `Check if both divide by 2, 3, 5, 7 or 11. Divide out each one they share (more than once if you can), then multiply what you took out.`;
}

const equiv: Skill = {
  id: "g5.equiv",
  title: "Equivalent fractions and simplest form",
  topic: "g5",
  standards: ["NC.4.NF.1", "NC.5.NF.1"],
  prereqs: [],
  lesson: {
    bigIdea: "Multiplying or dividing the top and bottom of a fraction by the same number gives the same amount.",
    explain: [
      "{1/2} and {2/4} cover the same part of a bar. Cutting every piece in half doubles the number of pieces *and* the number of shaded pieces.",
      "To **simplify**, divide the numerator and denominator by a common factor. A fraction is in **simplest form** when the only common factor left is 1.",
    ],
    visual: { type: "fractionbars", bars: [{ parts: 2, shaded: 1, label: "1/2" }, { parts: 4, shaded: 2, label: "2/4" }, { parts: 8, shaded: 4, label: "4/8" }] },
    tip: "Use the greatest common factor and you simplify in one step.",
  },
  why: [
    { kind: "choice", prompt: "Why is {6/8} equal to {3/4}?", choices: ["Dividing the top and bottom by 2 groups the pieces into pairs, so the same amount is shaded.", "Because 6 − 3 = 3 and 8 − 4 = 4.", "Because both have even numbers."], correct: 0, explain: "Dividing top and bottom by the same number regroups the pieces without changing how much is shaded." },
    { kind: "written", prompt: "Explain why multiplying the top and bottom of a fraction by the same number doesn't change its value.", keyIdeas: ["each piece is split into the same number of smaller pieces", "the shaded amount stays the same", "it is the same as multiplying by 1 (like 3/3)"], exemplar: "If I multiply top and bottom by 3, I cut every piece into 3 smaller pieces. There are 3 times as many pieces and 3 times as many shaded ones, so the same amount is shaded. It's like multiplying by 3/3, which is 1." },
  ],
  generate(r, lv) {
    if (lv === 2) {
      const d = r.int(2, 9);
      const n = r.int(1, d - 1);
      const k = r.int(2, 6);
      return {
        prompt: `Fill in the missing number: ${fr(n, d)} = {?/${d * k}}`,
        answer: num(n * k),
        hints: [`Equal fractions multiply the top and bottom by the same number. Look at the bottoms: ${d} × what = ${d * k}?`, `${d} × ${k} = ${d * k}. Do the same to the top: ${n} × ${k} = ?`],
        steps: [
          st("Compare the denominators.", `${d} × ? = ${d * k}. Since ${d * k} ÷ ${d} = ${k}, the denominator was multiplied by ${k}.`),
          st("Do the same thing to the numerator.", `Equivalent fractions multiply the top AND bottom by the same number: ${n} × ${k} = ${n * k}.`),
          st("Write the answer.", `${fr(n, d)} = {${n} × ${k}/${d} × ${k}} = ${fr(n * k, d * k)}`),
        ],
        traps: traps(F(n * k), [trap(n + (d * k - d), "It looks like you added. To keep fractions equal, multiply the top and bottom by the same number.")]),
      };
    }
    let n: number, d: number;
    do {
      d = lv === 1 ? r.int(2, 10) : r.int(5, 15);
      n = r.int(1, d - 1);
    } while (gcd(n, d) !== 1);
    const k = lv === 1 ? r.int(2, 4) : r.int(3, 9);
    const g = k;
    return {
      prompt: `Write ${fr(n * k, d * k)} in simplest form.`,
      answer: num(F(n, d), { simplest: true }),
      hints: [
        `Divide the top and bottom by the same number. Use the biggest number that divides both ${n * k} and ${d * k}, and you finish in one step.`,
        gcfHint(n * k, d * k),
        `The greatest common factor is ${g}. Now divide: ${n * k} ÷ ${g} on top and ${d * k} ÷ ${g} on the bottom.`,
      ],
      steps: [
        ...gcfSteps(n * k, d * k),
        st(`Divide the top and the bottom by ${g}.`, `{${n * k} ÷ ${g}/${d * k} ÷ ${g}} = ${fr(n, d)}`),
        st("Check that it's in simplest form.", `${n} and ${d} have no common factor except 1, so ${fr(n, d)} is as simple as it gets.`),
      ],
    };
  },
};

const addsub: Skill = {
  id: "g5.addsub",
  title: "Adding and subtracting fractions",
  topic: "g5",
  standards: ["NC.5.NF.1", "NC.5.NF.2"],
  prereqs: ["g5.equiv"],
  lesson: {
    bigIdea: "You can only add pieces that are the same size, so first rewrite the fractions with a common denominator.",
    explain: [
      "{1/2} + {1/3}: halves and thirds are different-sized pieces. Sixths fit both: {1/2} = {3/6} and {1/3} = {2/6}.",
      "Now the pieces match: {3/6} + {2/6} = {5/6}. Add the numerators and keep the denominator, because the piece size doesn't change.",
    ],
    visual: { type: "fractionbars", bars: [{ parts: 2, shaded: 1, label: "1/2" }, { parts: 3, shaded: 1, label: "1/3" }, { parts: 6, shaded: 5, label: "5/6" }] },
    tip: "Never add the denominators: {1/2} + {1/2} is 1 whole, not {2/4}.",
  },
  why: [
    { kind: "choice", prompt: "Why is {1/2} + {1/3} not equal to {2/5}?", choices: ["{2/5} is less than {1/2}, but adding should give more than {1/2}. Halves and thirds must be rewritten as sixths first.", "Because you should multiply instead.", "It is equal to {2/5}."], correct: 0, explain: "A quick estimate shows the sum must be more than {1/2}, and {2/5} is less than {1/2}." },
    { kind: "written", prompt: "Explain why you need a common denominator to add {1/4} + {1/6}.", keyIdeas: ["fourths and sixths are different-sized pieces", "rewrite both as twelfths (a common multiple)", "then add the numbers of equal pieces"], exemplar: "Fourths and sixths are different sizes, so I can't just count them together. Twelfths fit both: 1/4 = 3/12 and 1/6 = 2/12. Now they are the same size pieces, so 3/12 + 2/12 = 5/12." },
  ],
  generate(r, lv) {
    let b: number, d: number;
    if (lv === 1) {
      b = r.int(2, 6);
      d = b * r.int(2, 3);
    } else {
      do {
        b = r.int(2, 9);
        d = r.int(2, 9);
      } while (b === d || b % d === 0 || d % b === 0);
    }
    const a = r.int(1, b - 1);
    const c = r.int(1, d - 1);
    let x = F(a, b);
    let y = F(c, d);
    if (lv === 3) {
      x = add(x, F(r.int(1, 4)));
      y = add(y, F(r.int(1, 3)));
    }
    const subtract = r.chance(0.5);
    if (subtract && x.n * y.d < y.n * x.d) [x, y] = [y, x];
    const ans = subtract ? sub(x, y) : add(x, y);
    const L = (x.d * y.d) / gcd(x.d, y.d);
    const op = subtract ? "−" : "+";
    const show = (f: typeof x) => (lv === 3 ? mixed(f) : fr(f));
    return {
      prompt: `${show(x)} ${op} ${show(y)} = ?${lv === 3 ? " (A mixed number or fraction is fine.)" : ""}`,
      answer: num(ans, { simplest: true }),
      hints: (() => {
        const verb = subtract ? "subtract" : "add";
        const rw = (f: typeof x) => (f.d === L ? `${fr(f)} already has ${L} on the bottom` : `${fr(f)} = ${raw(f.n * (L / f.d), L)}`);
        const xn = x.n * (L / x.d), yn = y.n * (L / y.d);
        const res = subtract ? xn - yn : xn + yn;
        const lcdHint =
          x.d === y.d
            ? `The bottoms already match (both ${L}), so the pieces are the same size.`
            : L === Math.max(x.d, y.d)
              ? `You can only ${verb} same-size pieces. ${L} is a multiple of ${Math.min(x.d, y.d)}, so use ${L} as the common denominator.`
              : `You can only ${verb} same-size pieces. Find the smallest number both ${x.d} and ${y.d} go into: list multiples of ${Math.max(x.d, y.d)}.`;
        const rewrite = x.d === y.d ? lcdHint : `${lv === 3 ? `The smallest number both ${x.d} and ${y.d} go into is ${L}. ` : "Use " + L + " as the bottom: "}${rw(x)} and ${rw(y)}.`;
        return [
          ...(lv === 3 ? [`Change both mixed numbers to improper fractions first: ${mixed(x)} = ${fr(x)} and ${mixed(y)} = ?`, rewrite] : x.d === y.d ? [lcdHint] : [lcdHint, rewrite]),
          `Now ${verb} the tops: ${xn} ${op} ${yn} = ?, and keep ${L} on the bottom.${finishTail(res, L)}`,
        ];
      })(),
      steps: (() => {
        const xn = x.n * (L / x.d), yn = y.n * (L / y.d);
        const res = subtract ? xn - yn : xn + yn;
        return [
          ...(lv === 3 ? [toImproperStep(x), toImproperStep(y)] : []),
          lcdStep(x.d, y.d),
          rewriteStep(x, L),
          rewriteStep(y, L),
          st(`${subtract ? "Subtract" : "Add"} the numerators. Keep the denominator.`, `${raw(xn, L)} ${op} ${raw(yn, L)} = {${xn} ${op} ${yn}/${L}} = ${raw(res, L)}. The pieces are still the same size (${fr(1, L)} each), so the bottom stays ${L}.`),
          ...finishSteps(res, L),
          st("Answer.", mixed(ans)),
        ];
      })(),
      traps: lv < 3 ? traps(ans, [trap(F(subtract ? Math.abs(x.n - y.n) : x.n + y.n, subtract ? Math.max(1, Math.abs(x.d - y.d)) : x.d + y.d), "It looks like you added (or subtracted) the denominators. Rewrite with a common denominator, then only combine the numerators.")]) : undefined,
    };
  },
};

const multiply: Skill = {
  id: "g5.multiply",
  title: "Multiplying fractions",
  topic: "g5",
  standards: ["NC.5.NF.4"],
  prereqs: ["g5.equiv"],
  lesson: {
    bigIdea: "{a/b} × {c/d} means “{a/b} of {c/d}”. Multiply the tops and multiply the bottoms.",
    explain: [
      "{1/2} × {2/3} means half of two-thirds. Take {2/3} of a bar and shade half of it: that's {2/6} = {1/3} of the whole bar.",
      "Rule: multiply numerators, multiply denominators, then simplify. A whole number like 3 is {3/1}.",
    ],
    tip: "Multiplying by a fraction less than 1 makes the answer smaller.",
  },
  why: [
    { kind: "choice", prompt: "Why is {1/2} × {1/2} smaller than {1/2}?", choices: ["It means half of a half, which is a quarter.", "Multiplying always makes numbers smaller.", "Because 1 × 1 = 1."], correct: 0, explain: "Taking a fraction “of” something less than a whole gives a smaller amount." },
    { kind: "written", prompt: "Explain what {2/3} × 6 means and why the answer is 4.", keyIdeas: ["it means 2/3 of 6", "split 6 into 3 equal groups of 2", "take 2 of the groups: 4"], exemplar: "2/3 × 6 means two-thirds of 6. If I split 6 into 3 equal groups, each group has 2. Two of those groups is 4." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const d = r.int(2, 8);
      const n = r.int(1, d - 1);
      const w = d * r.int(1, 5);
      const ans = (n * w) / d;
      return {
        prompt: `${fr(n, d)} × ${w} = ?`,
        answer: num(ans),
        hints:
          n === 1
            ? [`${fr(n, d)} × ${w} means ${fr(n, d)} of ${w}: split ${w} into ${d} equal groups.`, `How many are in each group? ${w} ÷ ${d} = ?`]
            : [`${fr(n, d)} × ${w} means ${fr(n, d)} of ${w}. Start with ${fr(1, d)} of ${w}: split ${w} into ${d} equal groups.`, `${w} ÷ ${d} = ${w / d} in each group. You want ${n} of those groups: ${n} × ${w / d} = ?`],
        steps: [
          st("“Times” a fraction means “of”.", `${fr(n, d)} × ${w} means ${fr(n, d)} of ${w}.`),
          st(`Find ${fr(1, d)} of ${w}.`, `Split ${w} into ${d} equal groups: ${w} ÷ ${d} = ${w / d} in each group.`),
          st(`Find ${fr(n, d)} of ${w}.`, `Take ${n} of those groups: ${n} × ${w / d} = ${ans}.`),
          st("Another way.", `Multiply the top first: ${n} × ${w} = ${n * w}, then divide by the bottom: ${n * w} ÷ ${d} = ${ans}.`),
        ],
        traps: traps(F(ans), [trap(F(n * w, d * w), "Only multiply the numerator by the whole number: the denominator stays the same.")]),
      };
    }
    const b = r.int(2, 9);
    const d = r.int(2, 9);
    let x = F(r.int(1, b - 1), b);
    let y = F(r.int(1, d - 1), d);
    if (lv === 3) {
      x = add(x, F(r.int(1, 3)));
    }
    const ans = mul(x, y);
    return {
      prompt: `${lv === 3 ? mixed(x) : fr(x)} × ${fr(y)} = ?`,
      answer: num(ans, { simplest: true }),
      hints: (() => {
        const finish = finishHint(x.n * y.n, x.d * y.d);
        const across = finish
          ? `Top: ${x.n} × ${y.n} = ${x.n * y.n}. Bottom: ${x.d} × ${y.d} = ${x.d * y.d}.`
          : `Multiply the tops (${x.n} × ${y.n}) and the bottoms (${x.d} × ${y.d}).`;
        return [
          lv === 3
            ? `Change ${mixed(x)} to an improper fraction first: ${Math.floor(x.n / x.d)} × ${x.d} + ${x.n % x.d} gives the new top.`
            : "Multiply straight across: top times top, and bottom times bottom.",
          lv === 3 ? `${mixed(x)} = ${fr(x)}. ${across}` : across,
          ...(finish ? [finish] : []),
        ];
      })(),
      steps: [
        ...(lv === 3 ? [toImproperStep(x)] : []),
        st("Multiply the numerators.", `${x.n} × ${y.n} = ${x.n * y.n}`),
        st("Multiply the denominators.", `${x.d} × ${y.d} = ${x.d * y.d}`),
        st("Write the product.", `${fr(x)} × ${fr(y)} = {${x.n} × ${y.n}/${x.d} × ${y.d}} = ${raw(x.n * y.n, x.d * y.d)}`),
        ...finishSteps(x.n * y.n, x.d * y.d),
        st("Answer.", mixed(ans)),
      ],
      traps: traps(ans, [trap(frac(x.n * y.d, x.d * y.n), "That's division (flipping the second fraction). For multiplication, multiply straight across.")]),
    };
  },
};

const decimals: Skill = {
  id: "g5.decimals",
  title: "Decimal place value and fractions",
  topic: "g5",
  standards: ["NC.5.NBT.3", "NC.4.NF.6"],
  prereqs: ["g5.equiv"],
  lesson: {
    bigIdea: "Decimals are fractions with denominators of 10, 100, 1000…",
    explain: [
      "0.7 is seven tenths ({7/10}). 0.25 is twenty-five hundredths ({25/100} = {1/4}).",
      "To compare decimals, line up the decimal points and compare place by place: 0.5 = 0.50, which is more than 0.45.",
    ],
    tip: "Adding a zero at the end of a decimal doesn't change it: 0.3 = 0.30.",
  },
  why: [
    { kind: "choice", prompt: "Why is 0.5 greater than 0.45?", choices: ["0.5 is 50 hundredths, which is more than 45 hundredths.", "0.45 has more digits, so it's bigger.", "They are equal."], correct: 0, explain: "Write both in hundredths to compare: 0.50 > 0.45." },
    { kind: "written", prompt: "Explain why 0.75 equals {3/4}.", keyIdeas: ["0.75 means 75 hundredths (75/100)", "divide top and bottom by 25", "75/100 = 3/4"], exemplar: "0.75 is 75 hundredths, which is 75/100. Dividing the top and bottom by 25 gives 3/4." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const pairs: [string, number, number][] = [["0.5", 1, 2], ["0.25", 1, 4], ["0.75", 3, 4], ["0.2", 1, 5], ["0.4", 2, 5], ["0.6", 3, 5], ["0.8", 4, 5], ["0.1", 1, 10], ["0.3", 3, 10], ["0.7", 7, 10], ["0.9", 9, 10], ["0.05", 1, 20], ["0.125", 1, 8]];
      const [dec, n, d] = r.pick(pairs);
      return {
        prompt: `Write ${dec} as a fraction in simplest form.`,
        answer: num(F(n, d), { simplest: true }),
        hints: (() => {
          const pl = places(Number(dec));
          const D = 10 ** pl, N = Math.round(Number(dec) * D);
          const word = ["", "tenths", "hundredths", "thousandths"][pl];
          const g = gcd(N, D);
          return [
            `${dec} has ${pl} digit${pl === 1 ? "" : "s"} after the decimal point, so it means ${N} ${N === 1 ? word.slice(0, -1) : word}.`,
            g === 1
              ? `Write it as ${raw(N, D)}. Do ${N} and ${D} share any factor besides 1?`
              : `Write it as ${raw(N, D)}. Now simplify: what's the biggest number that divides both ${N} and ${D}?`,
          ];
        })(),
        steps: (() => {
          const pl = places(Number(dec));
          const D = 10 ** pl, N = Math.round(Number(dec) * D);
          return [
            st("Read the place value.", `${dec} has ${pl} digit${pl === 1 ? "" : "s"} after the decimal point, so it means ${N} ${["", "tenth", "hundredth", "thousandth"][pl]}${N === 1 ? "" : "s"}: ${raw(N, D)}.`),
            ...simplifySteps(N, D),
            st("Answer.", fr(n, d)),
          ];
        })(),
      };
    }
    if (lv === 2) {
      const vals = r.shuffle([r.int(1, 9) / 10, r.int(10, 99) / 100, r.int(100, 999) / 1000, r.int(1, 9) / 10 + r.int(1, 9) / 100]);
      const uniq = [...new Set(vals.map((v) => Number(v.toFixed(3))))];
      const big = Math.max(...uniq);
      return {
        prompt: `Which number is greatest?`,
        answer: choice(r, String(big), uniq.filter((v) => v !== big).map(String)),
        hints: [
          "Zeros at the end don't change a decimal (0.5 = 0.500). Give every number 3 decimal places so they're easy to compare.",
          `Write them as ${uniq.map((v) => v.toFixed(3)).join(", ")}. Compare them like whole numbers: which is the most thousandths?`,
        ],
        steps: [
          st("Give every number the same number of decimal places.", `Adding zeros at the end doesn't change a decimal: ${uniq.map((v) => `${v} → ${v.toFixed(3)}`).join(", ")}.`),
          st("Compare them like whole numbers of thousandths.", `${[...uniq].sort((a, b) => b - a).map((v) => Math.round(v * 1000)).join(" > ")}`),
          st("Answer.", `${big} is the greatest.`),
        ],
      };
    }
    const d = r.pick([4, 5, 8, 20, 25]);
    const n = r.int(1, d - 1);
    const ans = n / d;
    return {
      prompt: `Write ${fr(n, d)} as a decimal.`,
      answer: num(ans),
      hints: (() => {
        const k = { 4: 25, 5: 2, 8: 125, 20: 5, 25: 4 }[d]!;
        const D = d * k;
        return [
          `Decimals are tenths, hundredths or thousandths. What can you multiply ${d} by to get 10, 100 or 1000?`,
          `${d} × ${k} = ${D}. Multiply the top by ${k} too: ${n} × ${k} = ${n * k}, so ${fr(n, d)} = ${raw(n * k, D)}.`,
          `${raw(n * k, D)} means ${n * k} ${D === 10 ? "tenths" : D === 100 ? "hundredths" : "thousandths"}. How do you write that as a decimal?`,
        ];
      })(),
      steps: (() => {
        const k = { 4: 25, 5: 2, 8: 125, 20: 5, 25: 4 }[d]!;
        const D = d * k;
        return [
          st("Make the denominator 10, 100 or 1000.", `${d} × ${k} = ${D}, so multiply the top and bottom by ${k}: {${n} × ${k}/${d} × ${k}} = ${raw(n * k, D)}.`),
          st("Read it as a decimal.", `${raw(n * k, D)} means ${n * k} ${D === 10 ? "tenths" : D === 100 ? "hundredths" : "thousandths"}, which is written ${ans}.`),
          st("Check by dividing.", `${n} ÷ ${d} = ${ans} ✔`),
        ];
      })(),
    };
  },
};

export default [equiv, decimals, addsub, multiply];
