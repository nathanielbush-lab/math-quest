import { add, div, frac, fromDecimal, mul, sub } from "../../lib/rational";
import { F, choice, fr, linear, ms, num, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { decimalMultiplySteps, gcfSteps, multiplySteps, raw, simplifySteps, st } from "../steps";

const T = "g6-ee";

const exponents: Skill = {
  id: "g6.ee.exponents",
  title: "Powers and exponents",
  topic: T,
  standards: ["NC.6.EE.1"],
  prereqs: ["g5.multiply"],
  lesson: {
    bigIdea: "An exponent tells how many times to multiply the base by itself: 2^5 = 2 × 2 × 2 × 2 × 2 = 32.",
    explain: [
      "3^4 is NOT 3 × 4. It's 3 × 3 × 3 × 3 = 81.",
      "Fractions and decimals work too: ({2/3})^2 = {2/3} × {2/3} = {4/9}, and 0.5^2 = 0.25.",
      "Special names: x^2 is “x squared” (area of a square) and x^3 is “x cubed” (volume of a cube).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is 2^3 = 8 and not 6?", choices: ["2^3 means 2 × 2 × 2 (three 2s multiplied), which is 8.", "Because 2 + 3 + 3 = 8.", "It is 6, because 2 × 3 = 6."], correct: 0, explain: "The exponent counts factors, it doesn't multiply the base by itself once." },
    { kind: "written", prompt: "Explain why 5^2 is called “5 squared” and what it equals.", keyIdeas: ["5^2 = 5 × 5 = 25", "a square with side 5 has area 25", "so the exponent 2 is linked to squares"], exemplar: "5^2 means 5 × 5 = 25. A square with sides of 5 has area 5 × 5 = 25 square units, so we say “5 squared”." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const b = r.int(2, 10);
      const e = b <= 3 ? r.int(2, 5) : b <= 5 ? r.int(2, 3) : 2;
      const ans = b ** e;
      return {
        prompt: `${b}^${e} = ?`,
        answer: num(ans),
        hints: [`Write it out: ${Array(e).fill(b).join(" × ")}.`, "Multiply step by step."],
        steps: [
          st("An exponent means repeated multiplication.", `${b}^${e} means ${e} copies of ${b} multiplied together: ${Array(e).fill(b).join(" × ")}.`),
          st("Multiply one step at a time.", Array.from({ length: e - 1 }, (_, i) => `${b ** (i + 1)} × ${b} = ${b ** (i + 2)}`).join(", then ")),
          st("Answer.", `${b}^${e} = ${ans} (not ${b} × ${e} = ${b * e}!)`),
        ],
        traps: traps(F(ans), [trap(b * e, `${b}^${e} isn't ${b} × ${e}. Multiply ${b} by itself ${e} times.`)]),
      };
    }
    if (lv === 2) {
      const n0 = r.int(1, 4);
      const f = F(n0, r.int(n0 + 1, 6));
      const e = r.int(2, 3);
      const ans = F(f.n ** e, f.d ** e);
      return {
        prompt: `(${fr(f)})^${e} = ?`,
        answer: num(ans, { simplest: true }),
        hints: [`Multiply ${fr(f)} by itself ${e} times.`, `Tops: ${f.n}^${e}. Bottoms: ${f.d}^${e}.`],
        steps: [
          st("An exponent means repeated multiplication.", `(${fr(f)})^${e} = ${Array(e).fill(fr(f)).join(" × ")}`),
          st("Multiply the numerators.", `${Array(e).fill(f.n).join(" × ")} = ${f.n ** e}`),
          st("Multiply the denominators.", `${Array(e).fill(f.d).join(" × ")} = ${f.d ** e}`),
          st("Answer.", `(${fr(f)})^${e} = ${fr(ans)}`),
        ],
        traps: traps(ans, [trap(mul(f, F(e)), `That's ${fr(f)} × ${e}. An exponent means repeated multiplication of the base.`)]),
      };
    }
    const b = r.pick([0.1, 0.2, 0.3, 0.5, 1.2, 1.5]);
    const e = 2;
    const ans = Number((b * b).toFixed(4));
    return {
      prompt: `${b}^${e} = ?`,
      answer: num(fromDecimal(ans)),
      hints: [`${b} × ${b}`, "Count decimal places: one in each factor makes two in the answer."],
      steps: [st("Squaring means multiplying the number by itself.", `${b}^2 = ${b} × ${b}`), ...decimalMultiplySteps(b, b)],
      traps: traps(fromDecimal(ans), [trap(fromDecimal(b * 2), "That's doubling. Squaring means multiplying the number by itself.")]),
    };
  },
};

const orderOps: Skill = {
  id: "g6.ee.order-ops",
  title: "Order of operations",
  topic: T,
  standards: ["NC.6.EE.1", "NC.6.EE.2"],
  prereqs: ["g6.ee.exponents"],
  lesson: {
    bigIdea: "Parentheses first, then exponents, then × and ÷ (left to right), then + and − (left to right).",
    explain: [
      "3 + 4 × 2 = 3 + 8 = **11**, not 14: multiplication happens before addition.",
      "(3 + 4) × 2 = 7 × 2 = 14: the parentheses say to add first.",
      "2 × 3^2 = 2 × 9 = 18: the exponent applies only to the 3.",
    ],
    tip: "× and ÷ are partners: do them left to right. Same for + and −.",
  },
  why: [
    { kind: "choice", prompt: "Why do we need an agreed order of operations?", choices: ["So everyone gets the same answer from the same expression.", "To make problems harder.", "Because addition is less important."], correct: 0, explain: "Without a shared rule, 3 + 4 × 2 could mean 11 or 14." },
    { kind: "written", prompt: "Explain why 20 − 2 × 3^2 is 2, not 162.", keyIdeas: ["exponent first: 3^2 = 9", "then multiply: 2 × 9 = 18", "then subtract: 20 − 18 = 2"], exemplar: "First the exponent: 3^2 = 9. Then multiply: 2 × 9 = 18. Last, subtract: 20 − 18 = 2. Getting 162 would mean subtracting first and doing 18^2, which breaks the order." },
  ],
  generate(r, lv) {
    const a = r.int(2, 12);
    const b = r.int(2, 9);
    const c = r.int(2, 9);
    const d = r.int(2, 5);
    const forms = lv === 1 ? [0, 1] : lv === 2 ? [2, 3, 4] : [5, 6, 7];
    const f = r.pick(forms);
    let expr = "";
    let ans = 0;
    let wrong = 0;
    let steps: string[] = [];
    switch (f) {
      case 0: expr = `${a} + ${b} × ${c}`; ans = a + b * c; wrong = (a + b) * c; steps = [st("No parentheses or exponents, so multiply before adding.", `${b} × ${c} = ${b * c}. The expression becomes ${a} + ${b * c}.`), st("Add.", `${a} + ${b * c} = ${ans}`)]; break;
      case 1: expr = `(${a} + ${b}) × ${c}`; ans = (a + b) * c; wrong = a + b * c; steps = [st("Parentheses first.", `${a} + ${b} = ${a + b}. The expression becomes ${a + b} × ${c}.`), st("Multiply.", `${a + b} × ${c} = ${ans}`)]; break;
      case 2: expr = `${b * c} ÷ ${c} + ${a} × ${d}`; ans = b + a * d; wrong = (b + a) * d; steps = [st("Do × and ÷ before +, working left to right.", `${b * c} ÷ ${c} = ${b} and ${a} × ${d} = ${a * d}.`), st("Rewrite.", `The expression becomes ${b} + ${a * d}.`), st("Add.", `${b} + ${a * d} = ${ans}`)]; break;
      case 3: expr = `${a} × ${b}^2`; ans = a * b * b; wrong = (a * b) ** 2; steps = [st("Exponents before multiplying.", `${b}^2 = ${b} × ${b} = ${b * b}. The exponent belongs only to the number right before it.`), st("Rewrite.", `The expression becomes ${a} × ${b * b}.`), ...multiplySteps(a, b * b)]; break;
      case 4: { const big = a * b + c; expr = `${big} − ${a} × ${b}`; ans = c; wrong = (big - a) * b; steps = [st("Multiply before subtracting.", `${a} × ${b} = ${a * b}. The expression becomes ${big} − ${a * b}.`), st("Subtract.", `${big} − ${a * b} = ${ans}`)]; break; }
      case 5: { const big = 2 * d * d + a; expr = `${big} − 2 × ${d}^2`; ans = a; wrong = (big - 2) * d * d; steps = [st("Exponent first.", `${d}^2 = ${d * d}. Now it's ${big} − 2 × ${d * d}.`), st("Multiply next.", `2 × ${d * d} = ${2 * d * d}. Now it's ${big} − ${2 * d * d}.`), st("Subtract last.", `${big} − ${2 * d * d} = ${ans}`)]; break; }
      case 6: expr = `(${a} + ${b})^2 ÷ ${a + b}`; ans = a + b; wrong = a * a + b * b; steps = [st("Parentheses first.", `${a} + ${b} = ${a + b}. Now it's ${a + b}^2 ÷ ${a + b}.`), st("Exponent next.", `${a + b}^2 = ${a + b} × ${a + b} = ${(a + b) ** 2}. Now it's ${(a + b) ** 2} ÷ ${a + b}.`), st("Divide.", `${(a + b) ** 2} ÷ ${a + b} = ${ans}`)]; break;
      default: expr = `${c} × (${a} + ${b}) − ${d}^2`; ans = c * (a + b) - d * d; wrong = c * a + b - d * d; steps = [st("Parentheses first.", `${a} + ${b} = ${a + b}. Now it's ${c} × ${a + b} − ${d}^2.`), st("Exponent next.", `${d}^2 = ${d * d}. Now it's ${c} × ${a + b} − ${d * d}.`), st("Multiply.", `${c} × ${a + b} = ${c * (a + b)}. Now it's ${c * (a + b)} − ${d * d}.`), st("Subtract last.", `${c * (a + b)} − ${d * d} = ${ms(ans)}`)];
    }
    return {
      prompt: `Evaluate: ${expr}`,
      answer: num(ans),
      hints: ["Parentheses first, then exponents.", "Then multiply/divide left to right, then add/subtract left to right."],
      steps,
      traps: traps(F(ans), [trap(wrong, "Check the order: parentheses, exponents, multiply/divide, then add/subtract.")]),
    };
  },
};

const writeExpr: Skill = {
  id: "g6.ee.write",
  title: "Writing expressions from words",
  topic: T,
  standards: ["NC.6.EE.2"],
  prereqs: [],
  lesson: {
    bigIdea: "Turn words into math: “5 less than n” is n − 5; “twice the sum of x and 3” is 2(x + 3).",
    explain: [
      "Key words: **sum** (+), **difference** (−), **product** (×), **quotient** (÷), **twice** (2 ×).",
      "“Less than” flips the order: 5 less than n means start with n and take away 5 → n − 5.",
      "In algebra, 3x means 3 × x.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is “4 less than y” written y − 4 and not 4 − y?", choices: ["You start with y and take 4 away.", "Because letters always go first.", "Both are the same."], correct: 0, explain: "“Less than” means subtract from the second thing named." },
    { kind: "written", prompt: "Explain the difference between 2(x + 3) and 2x + 3 using words.", keyIdeas: ["2(x + 3) is twice the sum of x and 3", "2x + 3 is 3 more than twice x", "in 2(x + 3) both x and 3 are doubled"], exemplar: "2(x + 3) means add x and 3 first, then double the total, so it's twice the sum. 2x + 3 means double x and then add 3. In the first one the 3 gets doubled too." },
  ],
  generate(r, lv) {
    const v = r.pick(["n", "x", "y", "m", "k"]);
    const a = r.int(2, 12);
    const b = r.int(2, 9);
    const bank: [string, string, (string | [string, string])[]][] = [
      [`${a} more than ${v}`, `${v} + ${a}`, [`${a}${v}`, [`${v} − ${a}`, "“More than” means add."]]],
      [`${a} less than ${v}`, `${v} − ${a}`, [[`${a} − ${v}`, "“Less than” flips the order: start with the variable."], `${v} + ${a}`]],
      [`the product of ${a} and ${v}`, `${a}${v}`, [[`${a} + ${v}`, "Product means multiply."], `${v} ÷ ${a}`]],
      [`the quotient of ${v} and ${a}`, `${v} ÷ ${a}`, [[`${a} ÷ ${v}`, "The first thing named is divided by the second."], `${a}${v}`]],
      [`twice the sum of ${v} and ${b}`, `2(${v} + ${b})`, [[`2${v} + ${b}`, "“Twice the sum” doubles the whole sum, so use parentheses."], `2 + ${v} + ${b}`]],
      [`${b} times the difference of ${v} and ${a}`, `${b}(${v} − ${a})`, [[`${b}${v} − ${a}`, "Multiply the whole difference, so use parentheses."], `${b}(${a} − ${v})`]],
      [`${a} more than ${b} times ${v}`, `${b}${v} + ${a}`, [[`${b}(${v} + ${a})`, "Only the variable is multiplied by ${b}, then add.".replace("${b}", String(b))], `${a}${v} + ${b}`]],
      [`half of ${v}, minus ${a}`, `${v} ÷ 2 − ${a}`, [[`(${v} − ${a}) ÷ 2`, "Take half of the variable first, then subtract."], `2${v} − ${a}`]],
    ];
    const pool = lv === 1 ? bank.slice(0, 4) : lv === 2 ? bank.slice(2, 6) : bank.slice(4);
    const [words, right, wrong] = r.pick(pool);
    return {
      prompt: `Which expression means “${words}”?`,
      answer: choice(r, right, wrong),
      hints: ["Find the operation words: sum, difference, product, quotient, more, less, twice.", "Watch the order with “less than” and use parentheses when a whole sum or difference is multiplied."],
      steps: [
        st("Find the operation words.", /more than .* times/.test(words) ? "“Times” means multiply, and “more than” means add. Only the variable is multiplied." : /less than/.test(words) ? "“Less than” means subtract, and it flips the order: start with the variable, then take the number away." : /more than/.test(words) ? "“More than” means add." : /product/.test(words) ? "“Product” means multiply. A number next to a variable (like 3x) means multiply." : /quotient/.test(words) ? "“Quotient” means divide: the first thing named ÷ the second." : /sum/.test(words) ? "“Sum” means add, and “twice the sum” doubles the WHOLE sum, so the sum goes in parentheses." : /difference/.test(words) ? "“Difference” means subtract, and “times the difference” multiplies the WHOLE difference, so it goes in parentheses." : "“Half of” means ÷ 2, and “minus” means subtract. Take half first, then subtract."),
        st("Write the expression.", `“${words}” → ${right}`),
      ],
    };
  },
};

const evaluate: Skill = {
  id: "g6.ee.evaluate",
  title: "Evaluating expressions and formulas",
  topic: T,
  standards: ["NC.6.EE.2"],
  prereqs: ["g6.ee.order-ops"],
  lesson: {
    bigIdea: "To evaluate, replace the variable with its value, then follow the order of operations.",
    explain: [
      "3x + 2 when x = 4: 3 × 4 + 2 = 12 + 2 = 14.",
      "Formulas work the same way: the area of a square is A = s^2. If s = 7, A = 7^2 = 49.",
    ],
    tip: "Put the number in parentheses when you substitute: 3(4) + 2.",
  },
  why: [
    { kind: "choice", prompt: "When x = 4, why is 3x equal to 12 and not 34?", choices: ["3x means 3 × x, so it's 3 × 4 = 12.", "Because you put the 3 and 4 side by side.", "It is 34."], correct: 0, explain: "A number next to a variable means multiply." },
    { kind: "written", prompt: "Explain how to find the perimeter P = 2l + 2w of a rectangle with l = 8 and w = 5.", keyIdeas: ["substitute: 2(8) + 2(5)", "multiply first: 16 + 10", "add: 26"], exemplar: "I replace l with 8 and w with 5: 2 × 8 + 2 × 5. Multiplying first gives 16 + 10, and adding gives 26 units." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const which = r.int(0, 2);
      if (which === 0) {
        const s = r.int(2, 9);
        return { prompt: `The volume of a cube is V = s^3. Find V when s = ${s}.`, answer: num(s ** 3), hints: [`Replace s with ${s}.`, `${s}^3 = ${s} × ${s} × ${s}.`], steps: [st("Substitute.", `V = ${s}^3`), st("Cubing means three copies multiplied.", `${s} × ${s} × ${s} = ${s * s} × ${s} = ${s ** 3}`), st("Answer.", `V = ${s ** 3} cubic units`)], traps: traps(F(s ** 3), [trap(3 * s, "s^3 means s × s × s, not 3 × s.")]) };
      }
      if (which === 1) {
        const l = r.int(3, 15);
        const w = r.int(2, 12);
        return { prompt: `The perimeter of a rectangle is P = 2l + 2w. Find P when l = ${l} and w = ${w}.`, answer: num(2 * l + 2 * w), hints: [`Substitute: 2(${l}) + 2(${w}).`, "Multiply first, then add."], steps: [st("Substitute.", `P = 2(${l}) + 2(${w})`), st("Multiply first.", `2 × ${l} = ${2 * l} and 2 × ${w} = ${2 * w}`), st("Add.", `${2 * l} + ${2 * w} = ${2 * l + 2 * w}`)] };
      }
      const t = r.int(2, 6);
      const d = 16 * t * t;
      return { prompt: `A dropped ball falls d = 16t^2 feet in t seconds. How far does it fall in ${t} seconds?`, answer: num(d), hints: [`Square first: ${t}^2 = ${t * t}.`, `Then 16 × ${t * t}.`], steps: [st("Substitute.", `d = 16 × ${t}^2`), st("Exponent first.", `${t}^2 = ${t} × ${t} = ${t * t}. Only the t is squared.`), st("Multiply.", `16 × ${t * t} = ${d}`), st("Answer.", `${d} feet`)], traps: traps(F(d), [trap((16 * t) ** 2, "Only t is squared, not 16t. Square first, then multiply by 16.")]) };
    }
    const v = r.pick(["x", "n", "a"]);
    const val = lv === 1 ? r.int(1, 10) : r.pick([F(1, 2), F(3), F(5), F(3, 2), F(4)]);
    const value = typeof val === "number" ? F(val) : val;
    const m = r.int(2, 9);
    const b = r.int(1, 15);
    const V = fr(value);
    const sq = mul(value, value);
    type Ex = [string, (x: typeof value) => ReturnType<typeof frac>, () => string[]];
    const exprs: Ex[] = lv === 1
      ? [
          [`${m}${v} + ${b}`, (x) => frac(m * x.n + b * x.d, x.d), () => [st("Multiply first.", `${m} × ${V} = ${fr(mul(F(m), value))}`), st("Add.", `${fr(mul(F(m), value))} + ${b} = ${fr(add(mul(F(m), value), F(b)))}`)]],
          [`${m}${v} − ${b}`, (x) => frac(m * x.n - b * x.d, x.d), () => [st("Multiply first.", `${m} × ${V} = ${fr(mul(F(m), value))}`), st("Subtract.", `${fr(mul(F(m), value))} − ${b} = ${ms(fr(sub(mul(F(m), value), F(b))))}`)]],
        ]
      : [
          [`${v}^2 + ${b}`, (x) => frac(x.n * x.n + b * x.d * x.d, x.d * x.d), () => [st("Exponent first.", `(${V})^2 = ${V} × ${V} = ${fr(sq)}`), st("Add.", `${fr(sq)} + ${b} = ${fr(add(sq, F(b)))}`)]],
          [`${m}(${v} + ${b})`, (x) => frac(m * (x.n + b * x.d), x.d), () => [st("Parentheses first.", `${V} + ${b} = ${fr(add(value, F(b)))}`), st("Multiply.", `${m} × ${fr(add(value, F(b)))} = ${fr(mul(F(m), add(value, F(b))))}`)]],
          [`${b * m} ÷ ${v} + ${m}`, (x) => frac(b * m * x.d + m * x.n, x.n), () => [st("Divide first.", `${b * m} ÷ ${V} = ${fr(div(F(b * m), value))}${value.d > 1 ? ` (dividing by ${V} is the same as multiplying by ${fr(F(value.d, value.n))})` : ""}`), st("Add.", `${fr(div(F(b * m), value))} + ${m} = ${fr(add(div(F(b * m), value), F(m)))}`)]],
        ];
    const [expr, fn, how] = r.pick(exprs);
    const ans = fn(value);
    return {
      prompt: `Evaluate ${expr} when ${v} = ${V}.`,
      answer: num(ans),
      hints: [`Replace ${v} with ${V}.`, "Use the order of operations."],
      steps: [st("Substitute.", `Replace ${v} with ${V}: ${expr.replace(/(\d)(?=[a-z])/g, "$1 × ").replaceAll(v, `(${V})`)}`), ...how(), st("Answer.", fr(ans))],
    };
  },
};

const equivalent: Skill = {
  id: "g6.ee.equivalent",
  title: "Equivalent expressions",
  topic: T,
  standards: ["NC.6.EE.3", "NC.6.EE.4"],
  prereqs: ["g6.ee.evaluate", "g6.ns.distributive"],
  lesson: {
    bigIdea: "Expressions are equivalent when they're equal for every value of the variable. Use the distributive property and combine like terms.",
    explain: [
      "Distribute: 3(x + 4) = 3x + 12. Each term inside gets multiplied by 3.",
      "Combine like terms: 2x + 5x = 7x, just like 2 apples + 5 apples = 7 apples. But 2x + 5 can't combine.",
      "Factor: 6x + 9 = 3(2x + 3), pulling out the GCF of 6 and 9.",
    ],
    tip: "Test it: pick x = 2 and check that both expressions give the same number.",
  },
  why: [
    { kind: "choice", prompt: "Why is 3(x + 4) equal to 3x + 12 and not 3x + 4?", choices: ["3 groups of (x + 4) contain 3 x's and 3 fours, so 3x + 12.", "Only the first term gets multiplied.", "They're both right."], correct: 0, explain: "The 3 multiplies everything inside the parentheses." },
    { kind: "written", prompt: "Explain how you can check that 2(x + 5) and 2x + 10 are equivalent.", keyIdeas: ["distribute: 2 × x + 2 × 5 = 2x + 10", "or substitute a value, e.g. x = 3: 2(8) = 16 and 6 + 10 = 16", "equivalent means equal for every value"], exemplar: "Using the distributive property, 2(x + 5) = 2·x + 2·5 = 2x + 10. I can also test x = 3: 2(3 + 5) = 16 and 2·3 + 10 = 16. They match for any x, so they're equivalent." },
  ],
  generate(r, lv) {
    const v = r.pick(["x", "y", "n"]);
    if (lv === 1) {
      const a = r.int(2, 9);
      const b = r.int(1, 9);
      return {
        prompt: `Use the distributive property: ${a}(${v} + ${b}) = ?`,
        answer: { kind: "multi", fields: [{ value: F(a), post: v }, { value: F(a * b), pre: "+" }] },
        hints: [`Multiply ${a} by each term inside.`, `${a} × ${v} and ${a} × ${b}.`],
        steps: [
          st("Distribute: multiply EACH term inside the parentheses by the number outside.", `${a} × ${v} = ${a}${v} and ${a} × ${b} = ${a * b}.`),
          st("Write the result.", `${a}(${v} + ${b}) = ${a}${v} + ${a * b}`),
          st("Check with a number.", `Try ${v} = 2: ${a}(2 + ${b}) = ${a} × ${2 + b} = ${a * (2 + b)}, and ${a} × 2 + ${a * b} = ${2 * a} + ${a * b} = ${a * (2 + b)} ✔`),
        ],
      };
    }
    if (lv === 2) {
      const p = r.int(2, 9);
      const q = r.int(1, 9);
      const c = r.int(1, 12);
      const d = r.int(0, 9);
      const ans1 = p + q;
      return {
        prompt: `Combine like terms: ${p}${v} + ${c} + ${q}${v}${d ? ` + ${d}` : ""} = ?`,
        answer: { kind: "multi", fields: [{ value: F(ans1), post: v }, { value: F(c + d), pre: "+" }] },
        hints: [`Group the ${v}-terms and the number terms.`, `${p}${v} + ${q}${v} = ? and ${c}${d ? ` + ${d}` : ""} = ?`],
        steps: [
          st("Sort the terms into like terms.", `${v}-terms: ${p}${v} and ${q}${v}. Number terms: ${c}${d ? ` and ${d}` : ""}.`),
          st(`Combine the ${v}-terms.`, `${p}${v} + ${q}${v} = ${ans1}${v} (${p} ${v}'s plus ${q} more ${v}'s is ${ans1} ${v}'s).`),
          ...(d ? [st("Combine the numbers.", `${c} + ${d} = ${c + d}`)] : []),
          st("Write the simplified expression.", `${ans1}${v} + ${c + d}`),
        ],
      };
    }
    const g = r.int(2, 6);
    let a = r.int(1, 5);
    const b = r.int(1, 7);
    while (a === b || b % a === 0 && a > 1) a = r.int(1, 5);
    const gg = (x: number, y: number): number => (y ? gg(y, x % y) : x);
    const inner = gg(a, b);
    const G = g * inner;
    return {
      prompt: `Factor out the greatest common factor: ${g * a}${v} + ${g * b} = ?`,
      answer: { kind: "multi", fields: [{ value: F(G), post: "(" }, { value: F(a / inner), post: v }, { value: F(b / inner), pre: "+", post: ")" }] },
      hints: [`What's the GCF of ${g * a} and ${g * b}?`, `GCF = ${G}. Divide each term by ${G}.`],
      steps: [
        st("Find the GCF of the numbers.", `Look at ${g * a} (from ${g * a}${v}) and ${g * b}.`),
        ...gcfSteps(g * a, g * b),
        st(`Divide each term by ${G}.`, `${g * a}${v} ÷ ${G} = ${a / inner === 1 ? "" : a / inner}${v} and ${g * b} ÷ ${G} = ${b / inner}.`),
        st(`Write the ${G} outside the parentheses.`, `${g * a}${v} + ${g * b} = ${G}(${linear(a / inner, b / inner, v)})`),
        st("Check by distributing.", `${G} × ${a / inner === 1 ? "" : a / inner}${v} = ${g * a}${v} and ${G} × ${b / inner} = ${g * b} ✔`),
      ],
    };
  },
};

const oneStep: Skill = {
  id: "g6.ee.one-step",
  title: "One-step equations",
  topic: T,
  standards: ["NC.6.EE.5", "NC.6.EE.7"],
  prereqs: ["g6.ee.evaluate"],
  lesson: {
    bigIdea: "An equation is a balance. Undo what's been done to the variable, doing the same thing to both sides.",
    explain: [
      "A $3 notebook plus pencils costs $11: 3 + x = 11. Subtract 3 from both sides: x = 8. The pencils cost $8.",
      "4x = 28: x is multiplied by 4, so divide both sides by 4: x = 7.",
      "Check by substituting: 4 × 7 = 28 ✔",
    ],
    tip: "Addition ↔ subtraction and multiplication ↔ division undo each other.",
  },
  why: [
    { kind: "choice", prompt: "Why do you subtract 3 from BOTH sides of x + 3 = 11?", choices: ["To keep the equation balanced, so both sides stay equal.", "Because subtracting is always the first step.", "You only subtract from the left side."], correct: 0, explain: "Like a balance scale: change both sides the same way." },
    { kind: "written", prompt: "Explain how to solve x ÷ 4 = 6 and how to check your answer.", keyIdeas: ["x is divided by 4, so multiply both sides by 4", "x = 24", "check: 24 ÷ 4 = 6"], exemplar: "x is being divided by 4, so I undo that by multiplying both sides by 4: x = 24. To check, 24 ÷ 4 = 6, which matches." },
  ],
  generate(r, lv) {
    const v = r.pick(["x", "n", "y", "m"]);
    const kind = r.int(0, 3);
    const x = lv === 3 ? r.pick([F(r.int(1, 9), 2), fromDecimal(r.int(11, 99) / 10)]) : F(r.int(2, lv === 1 ? 15 : 40));
    const k = lv === 3 ? r.pick([F(1, 2), F(2, 3), F(3, 4), fromDecimal(r.int(2, 9) / 10), F(r.int(2, 9))]) : F(r.int(2, 12));
    let eqn = "", steps: string[] = [], tr: ReturnType<typeof trap>[] = [];
    const show = (f: typeof x) => fr(f);
    switch (kind) {
      case 0: { const sum = add(x, k); eqn = `${v} + ${show(k)} = ${show(sum)}`; steps = [st(`${show(k)} is added to ${v}. Undo it: subtract ${show(k)} from both sides.`, `${v} + ${show(k)} − ${show(k)} = ${show(sum)} − ${show(k)}`), st("Simplify both sides.", `${v} = ${show(x)}${x.d > 1 || k.d > 1 ? " (use a common denominator to subtract the fractions)" : ""}`), st("Check.", `${show(x)} + ${show(k)} = ${show(sum)} ✔`)]; tr = [trap(add(sum, k), "Subtraction undoes addition. Subtract to get the variable alone.")]; break; }
      case 1: { const prod = mul(k, x); eqn = `${show(k)}${v} = ${show(prod)}`; steps = [st(`${v} is multiplied by ${show(k)}. Undo it: divide both sides by ${show(k)}.`, `${show(k)}${v} ÷ ${show(k)} = ${show(prod)} ÷ ${show(k)}`), ...(k.d > 1 ? [st("Dividing by a fraction means multiplying by its reciprocal.", `${show(prod)} ÷ ${show(k)} = ${show(prod)} × ${fr(F(k.d, k.n))}`), st("Multiply.", `{${prod.n} × ${k.d}/${prod.d} × ${k.n}} = ${raw(prod.n * k.d, prod.d * k.n)}`), ...simplifySteps(prod.n * k.d, prod.d * k.n)] : []), st("So", `${v} = ${show(x)}`), st("Check.", `${show(k)} × ${show(x)} = ${show(prod)} ✔`)]; tr = [trap(mul(prod, k), "The variable is multiplied, so divide (don't multiply) both sides.")]; break; }
      case 2: { const q = div(x, k); eqn = `${v} ÷ ${show(k)} = ${show(q)}`; steps = [st(`${v} is divided by ${show(k)}. Undo it: multiply both sides by ${show(k)}.`, `${v} ÷ ${show(k)} × ${show(k)} = ${show(q)} × ${show(k)}`), st("Simplify.", `${v} = ${show(x)}`), st("Check.", `${show(x)} ÷ ${show(k)} = ${show(q)} ✔`)]; tr = [trap(div(q, k), "The variable is divided, so multiply both sides.")]; break; }
      default: { const diff = sub(x, k); eqn = `${v} − ${show(k)} = ${ms(fr(diff))}`; steps = [st(`${show(k)} is subtracted from ${v}. Undo it: add ${show(k)} to both sides.`, `${v} − ${show(k)} + ${show(k)} = ${ms(fr(diff))} + ${show(k)}`), st("Simplify both sides.", `${v} = ${show(x)}`), st("Check.", `${show(x)} − ${show(k)} = ${ms(fr(diff))} ✔`)]; tr = [trap(sub(diff, k), "Subtraction is undone by adding.")]; }
    }
    return {
      prompt: `Solve for ${v}: ${eqn}`,
      answer: num(x),
      hints: [`What is being done to ${v}?`, "Do the opposite operation to both sides."],
      steps,
      traps: traps(x, tr),
    };
  },
};

const inequalities: Skill = {
  id: "g6.ee.inequalities",
  title: "Inequalities",
  topic: T,
  standards: ["NC.6.EE.5", "NC.6.EE.8"],
  prereqs: ["g6.ns.compare"],
  lesson: {
    bigIdea: "An inequality like x > 4 has many solutions: every number greater than 4.",
    explain: [
      "> greater than, < less than, ≥ greater than or equal to (“at least”), ≤ less than or equal to (“at most”, “no more than”).",
      "On a number line, an open circle means the number itself is NOT included (> or <); a closed circle means it IS included (≥ or ≤).",
    ],
    visual: { type: "numberline", min: 0, max: 10, step: 1, points: [{ v: 4, label: "x > 4 starts here (open)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is 4 not a solution to x > 4?", choices: ["x > 4 means strictly greater than 4, and 4 isn't greater than itself.", "Because 4 is even.", "It is a solution."], correct: 0, explain: "That's why x > 4 uses an open circle." },
    { kind: "written", prompt: "A ride requires riders to be at least 48 inches tall. Explain how to write this as an inequality and whether 48 inches is allowed.", keyIdeas: ["h ≥ 48", "“at least” includes 48", "closed circle at 48 on a number line"], exemplar: "If h is height in inches, then h ≥ 48. “At least” means 48 or more, so someone exactly 48 inches tall can ride. On a number line I'd use a closed circle at 48 and shade to the right." },
  ],
  generate(r, lv) {
    const v = r.pick(["x", "n", "t"]);
    const c = r.int(2, 20);
    if (lv === 1) {
      const sym = r.pick([">", "<", "≥", "≤"]);
      const test = (x: number) => (sym === ">" ? x > c : sym === "<" ? x < c : sym === "≥" ? x >= c : x <= c);
      const cands = r.shuffle([c, c + r.int(1, 5), c - r.int(1, 5), c + r.int(6, 10), c - r.int(6, 9)]);
      const good = cands.filter(test);
      const bad = cands.filter((x) => !test(x));
      const right = r.pick(good);
      return {
        prompt: `Which number is a solution to ${v} ${sym} ${c}?`,
        answer: choice(r, String(right), bad.slice(0, 3).map((b) => [String(b), b === c ? `${c} is ${sym === ">" || sym === "<" ? "not included because the symbol is strict" : "included, but check the direction"}.` : `Is ${b} ${sym} ${c}? Check it.`] as [string, string])),
        hints: ["Test each number in the inequality.", `${sym === ">" ? "Greater than" : sym === "<" ? "Less than" : sym === "≥" ? "Greater than or equal to" : "Less than or equal to"} ${c}.`],
        steps: [
          st("Read the inequality.", `${v} ${sym} ${c} means ${v} is ${sym === ">" ? "greater than" : sym === "<" ? "less than" : sym === "≥" ? "greater than or equal to" : "less than or equal to"} ${c}.`),
          st("Test each choice.", [right, ...bad.slice(0, 3)].sort((p, q) => p - q).map((x) => `${x} ${sym} ${c}? ${test(x) ? "yes ✔" : "no ✘"}`).join(" · ")),
          st("Answer.", `${right} is a solution.`),
        ],
      };
    }
    const scenarios: [string, string, (string | [string, string])[]][] = [
      [`You must be at least ${c} years old to join.`, `${v} ≥ ${c}`, [[`${v} > ${c}`, "“At least” includes the number itself."], [`${v} ≤ ${c}`, "“At least” means that number or more."], `${v} < ${c}`]],
      [`The elevator can hold no more than ${c} people.`, `${v} ≤ ${c}`, [[`${v} < ${c}`, "“No more than” includes the number itself."], [`${v} ≥ ${c}`, "“No more than” means that number or fewer."], `${v} > ${c}`]],
      [`The temperature stayed below ${c} degrees.`, `${v} < ${c}`, [[`${v} ≤ ${c}`, "“Below” doesn't include the number itself."], `${v} > ${c}`, `${v} ≥ ${c}`]],
      [`You need more than ${c} points to win.`, `${v} > ${c}`, [[`${v} ≥ ${c}`, "“More than” doesn't include the number itself."], `${v} < ${c}`, `${v} ≤ ${c}`]],
    ];
    if (lv === 2) {
      const [text, right, wrong] = r.pick(scenarios);
      const incl = right.includes("≥") || right.includes("≤");
      const big = right.includes(">") || right.includes("≥");
      return {
        prompt: `${text} Which inequality matches?`,
        answer: choice(r, right, wrong),
        hints: ["Does the situation include the number itself?", "“At least” → ≥, “no more than / at most” → ≤, “more than” → >, “less than / below” → <."],
        steps: [
          st("Does the situation include the number itself?", incl ? `Yes: “at least” and “no more than” include ${c}, so use ≥ or ≤.` : `No: “more than” and “below” don't include ${c}, so use > or <.`),
          st("Which direction?", big ? `The values must be bigger than ${c}, so ${v} ${incl ? "≥" : ">"} ${c}.` : `The values must be smaller than ${c}, so ${v} ${incl ? "≤" : "<"} ${c}.`),
          st("Answer.", right),
        ],
      };
    }
    const sym = r.pick([">", "<", "≥", "≤"]);
    const open = sym === ">" || sym === "<";
    const dir = sym === ">" || sym === "≥" ? "right" : "left";
    const desc = (o: boolean, d: string) => `${o ? "Open" : "Closed"} circle at ${c}, shaded to the ${d}`;
    return {
      prompt: `Which number-line graph shows ${v} ${sym} ${c}?`,
      answer: choice(r, desc(open, dir), [[desc(!open, dir), open ? "Strict inequalities (> or <) use an open circle." : "≥ and ≤ include the number, so use a closed circle."], [desc(open, dir === "right" ? "left" : "right"), "Check the direction of the symbol."], desc(!open, dir === "right" ? "left" : "right")]),
      hints: ["Is the number itself included? Included → closed circle.", "Greater → shade right. Less → shade left."],
      steps: [
        st("Open or closed circle?", open ? `${sym} does NOT include ${c} itself, so draw an open circle at ${c}.` : `${sym} includes ${c} (“or equal to”), so draw a closed (filled-in) circle at ${c}.`),
        st("Which way to shade?", dir === "right" ? `${v} must be greater than ${c}, and greater numbers are to the right.` : `${v} must be less than ${c}, and smaller numbers are to the left.`),
        st("Answer.", desc(open, dir)),
      ],
    };
  },
};

const twoVariables: Skill = {
  id: "g6.ee.two-variables",
  title: "Dependent and independent variables",
  topic: T,
  standards: ["NC.6.EE.9"],
  prereqs: ["g6.ee.evaluate", "g6.rp.tables"],
  lesson: {
    bigIdea: "When one quantity depends on another, an equation like c = 4t links them.",
    explain: [
      "Movie tickets cost $4: cost c depends on the number of tickets t, so c = 4t. t is the **independent** variable (you choose it); c is **dependent**.",
      "A table shows the pattern: t = 1, 2, 3 gives c = 4, 8, 12. Each extra ticket adds $4.",
    ],
    visual: { type: "table", headers: ["tickets (t)", "cost (c)"], rows: [[1, 4], [2, 8], [3, 12], [4, 16]] },
  },
  why: [
    { kind: "choice", prompt: "In c = 4t for ticket cost, why is c the dependent variable?", choices: ["The cost depends on how many tickets you buy.", "Because c comes first in the alphabet.", "Because 4 is a constant."], correct: 0, explain: "You choose t; c follows from it." },
    { kind: "written", prompt: "A table shows x = 1, 2, 3, 4 and y = 7, 14, 21, 28. Explain how to find the equation.", keyIdeas: ["each y is 7 times x", "y = 7x", "check with a row, e.g. 7 × 3 = 21"], exemplar: "Each y value is 7 times the x value: 7 × 1 = 7, 7 × 2 = 14 and so on. So y = 7x. Checking: 7 × 4 = 28 ✔." },
  ],
  generate(r, lv) {
    const m = r.int(2, 12);
    const b = lv === 3 ? r.int(1, 20) : 0;
    const xs = [1, 2, 3, 4];
    const rows = xs.map((x) => [x, m * x + b]);
    if (lv === 1) {
      const x = r.int(5, 12);
      return {
        prompt: `The table follows the rule y = ${m}x. What is y when x = ${x}?`,
        visual: { type: "table", headers: ["x", "y"], rows },
        answer: num(m * x),
        hints: [`Substitute x = ${x} into y = ${m}x.`, `${m} × ${x}`],
        steps: [st("Substitute the x-value into the rule.", `y = ${m}x, so y = ${m} × ${x}`), ...multiplySteps(m, x), st("Answer.", `y = ${m * x}`)],
      };
    }
    const right = b ? `y = ${m}x + ${b}` : `y = ${m}x`;
    return {
      prompt: `Which equation matches the table?`,
      visual: { type: "table", headers: ["x", "y"], rows },
      answer: choice(r, right, [[b ? `y = ${m}x` : `y = x + ${m}`, b ? "Check x = 1: does it give the right y?" : `x + ${m} works for x = 1 but not for x = 2. Check every row.`], b ? `y = ${m + b}x` : `y = ${m + 1}x`, [b ? `y = x + ${m + b}` : `y = ${m}x + ${m}`, "Check more than one row."]]),
      hints: ["How much does y go up each time x goes up by 1?", b ? `y goes up by ${m} each time. What do you add to ${m}x to get ${m + b} when x = 1?` : `y goes up by ${m}; what do you multiply x by?`],
      steps: [
        st("See how y changes when x goes up by 1.", `${rows.map((r) => r[1]).join(" → ")}: y goes up by ${m} each time.`),
        st(`So x is multiplied by ${m}.`, `The rule starts with y = ${m}x.`),
        b ? st("Find what's added.", `When x = 1, ${m} × 1 = ${m}, but the table says y = ${m + b}. That's ${b} more, so add ${b}: y = ${m}x + ${b}.`) : st("Check whether anything is added.", `When x = 1, ${m} × 1 = ${m}, and the table says y = ${m}. Nothing extra, so y = ${m}x.`),
        st("Check another row.", `x = 3: ${m} × 3${b ? ` + ${b}` : ""} = ${3 * m + b} ✔ (the table says ${3 * m + b})`),
        st("Answer.", right),
      ],
    };
  },
};

export default [exponents, orderOps, writeExpr, evaluate, equivalent, oneStep, inequalities, twoVariables];

