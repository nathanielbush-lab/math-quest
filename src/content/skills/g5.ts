import { add, frac, gcd, mul, sub } from "../../lib/rational";
import { F, choice, fr, mixed, num, trap, traps } from "../helpers";
import type { Skill } from "../types";

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
        hints: [`What did ${d} get multiplied by to make ${d * k}?`, `${d} × ${k} = ${d * k}, so multiply the top by ${k} too.`],
        steps: [`${d} × ${k} = ${d * k}`, `Do the same to the top: ${n} × ${k} = ${n * k}`, `${fr(n, d)} = ${fr(n * k, d * k)}`],
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
      hints: [`Find a number that divides both ${n * k} and ${d * k}.`, `The greatest common factor of ${n * k} and ${d * k} is ${g}.`],
      steps: [`GCF of ${n * k} and ${d * k} is ${g}`, `${n * k} ÷ ${g} = ${n}, ${d * k} ÷ ${g} = ${d}`, `Simplest form: ${fr(n, d)}`],
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
      hints: [`Find a common denominator for ${x.d} and ${y.d}.`, `The least common multiple of ${x.d} and ${y.d} is ${L}. Rewrite both fractions as ${L}ths.`],
      steps: [
        `Common denominator: ${L}`,
        `${fr(x)} = ${fr(x.n * (L / x.d), L)} and ${fr(y)} = ${fr(y.n * (L / y.d), L)}`,
        `${fr(x.n * (L / x.d), L)} ${op} ${fr(y.n * (L / y.d), L)} = ${fr(subtract ? x.n * (L / x.d) - y.n * (L / y.d) : x.n * (L / x.d) + y.n * (L / y.d), L)}`,
        `Simplest form: ${mixed(ans)}`,
      ],
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
        hints: [`This means ${fr(n, d)} of ${w}. First find ${fr(1, d)} of ${w}.`, `${w} ÷ ${d} = ${w / d}. Now multiply by ${n}.`],
        steps: [`${fr(1, d)} of ${w} is ${w} ÷ ${d} = ${w / d}`, `${fr(n, d)} of ${w} is ${n} × ${w / d} = ${ans}`],
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
      hints: lv === 3 ? [`Turn ${mixed(x)} into an improper fraction first.`, `${mixed(x)} = ${fr(x)}. Multiply tops, multiply bottoms.`] : ["Multiply the numerators, then multiply the denominators.", "Simplify at the end."],
      steps: [...(lv === 3 ? [`${mixed(x)} = ${fr(x)}`] : []), `${fr(x)} × ${fr(y)} = ${fr(x.n * y.n, x.d * y.d)}`, `Simplest form: ${mixed(ans)}`],
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
        hints: [`Read it aloud: how many tenths, hundredths or thousandths?`, `Write it over 10, 100 or 1000, then simplify.`],
        steps: [`${dec} = ${fr(Math.round(Number(dec) * 1000), 1000)}`, `Simplify: ${fr(n, d)}`],
      };
    }
    if (lv === 2) {
      const vals = r.shuffle([r.int(1, 9) / 10, r.int(10, 99) / 100, r.int(100, 999) / 1000, r.int(1, 9) / 10 + r.int(1, 9) / 100]);
      const uniq = [...new Set(vals.map((v) => Number(v.toFixed(3))))];
      const big = Math.max(...uniq);
      return {
        prompt: `Which number is greatest?`,
        answer: choice(r, String(big), uniq.filter((v) => v !== big).map(String)),
        hints: ["Give all the numbers the same number of decimal places by adding zeros.", "Compare 0.500 with 0.450 and so on, digit by digit from the left."],
        steps: [`With three decimal places: ${uniq.map((v) => v.toFixed(3)).join(", ")}`, `Greatest: ${big}`],
      };
    }
    const d = r.pick([4, 5, 8, 20, 25]);
    const n = r.int(1, d - 1);
    const ans = n / d;
    return {
      prompt: `Write ${fr(n, d)} as a decimal.`,
      answer: num(ans),
      hints: [`Find an equivalent fraction with a denominator of 10, 100 or 1000.`, `Or divide: ${n} ÷ ${d}.`],
      steps: [`${n} ÷ ${d} = ${ans}`],
    };
  },
};

export default [equiv, decimals, addsub, multiply];
