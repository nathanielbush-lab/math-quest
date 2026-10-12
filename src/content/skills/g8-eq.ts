import { frac } from "../../lib/rational";
import { F, NAMES, choice, cst, linear, ms, num, trap, traps } from "../helpers";
import type { Skill } from "../types";

const T = "g8-eq";

const multistep: Skill = {
  id: "g8.eq.multistep",
  title: "Equations with variables on both sides",
  topic: T,
  standards: ["NC.8.EE.7"],
  prereqs: ["g7.ee.two-step", "g7.ee.simplify"],
  lesson: {
    bigIdea: "Collect the variable terms on one side and the numbers on the other, then solve.",
    explain: [
      "Two phone plans cost 10 + 2h and 4 + 4h. When are they equal? 10 + 2h = 4 + 4h → subtract 2h: 10 = 4 + 2h → subtract 4: 6 = 2h → **h = 3**. Each costs $16.",
      "Distribute and combine like terms first if needed: 3(x + 2) = x + 14 → 3x + 6 = x + 14 → 2x = 8 → x = 4.",
    ],
  },
  why: [
    { kind: "choice", prompt: "In 10 + 2h = 4 + 4h, why subtract 2h from both sides?", choices: ["To get all the h-terms on one side while keeping the equation balanced.", "Because 2h is smaller.", "To make the equation false."], correct: 0, explain: "Same operation on both sides keeps balance." },
    { kind: "written", prompt: "Plans cost 10 + 2h and 4 + 4h dollars for h hours. Explain when they cost the same and what that cost is.", keyIdeas: ["set them equal: 10 + 2h = 4 + 4h", "solve: 6 = 2h, h = 3", "cost is 10 + 2(3) = $16 for both"], exemplar: "I set the costs equal: 10 + 2h = 4 + 4h. Subtracting 2h and 4 from both sides gives 6 = 2h, so h = 3 hours. Then both cost 10 + 6 = $16 (and 4 + 12 = $16)." },
  ],
  generate(r, lv) {
    const x = lv === 3 ? r.nonzero(-10, 10) : r.int(1, 12);
    let a = r.nonzero(-8, 9);
    let c = r.nonzero(-8, 9);
    while (a === c) c = r.nonzero(-8, 9);
    if (lv === 1) {
      a = Math.abs(a) + 1;
      c = r.int(1, a - 1) || 1;
      if (c === a) c = a - 1 || 1;
    }
    const b = r.int(-15, 15);
    const d = (a - c) * x + b;
    if (lv === 3 && r.chance(0.6)) {
      const k = r.int(2, 5);
      const m = r.nonzero(-6, 6);
      // k(x + m) = c x + d2
      let c2 = r.nonzero(-6, 6);
      if (c2 === k) c2 = k + 1;
      const d2 = k * (x + m) - c2 * x;
      return {
        prompt: `Solve for x: ${k}(x${cst(m)}) = ${linear(c2, d2)}`,
        answer: num(x),
        hints: [`Distribute: ${k}x${cst(k * m)}.`, `Move the x-terms to one side: ${k - c2}x = ${ms(d2 - k * m)}.`],
        steps: [`${linear(k, k * m)} = ${linear(c2, d2)}`, `${linear(k - c2, 0)} = ${ms(d2 - k * m)}`, `x = ${ms(x)}`],
      };
    }
    return {
      prompt: `Solve for x: ${linear(a, b)} = ${linear(c, d)}`,
      answer: num(x),
      hints: [`Subtract ${linear(c, 0)} from both sides to collect x-terms.`, `${linear(a - c, b)} = ${ms(d)}`],
      steps: [`${linear(a - c, b)} = ${ms(d)}`, `${linear(a - c, 0)} = ${ms(d - b)}`, `x = ${ms(x)}`, `Check: ${linear(a, b).replace(/x/g, `(${ms(x)})`)} = ${ms(a * x + b)} and ${linear(c, d).replace(/x/g, `(${ms(x)})`)} = ${ms(c * x + d)} ✔`],
      traps: traps(F(x), [...(a + c !== 0 ? [trap(frac(d - b, a + c), "When you move a term to the other side, subtract it from both sides (its sign changes).")] : []), trap(-x, "Check your signs.")]),
    };
  },
};

const solutionTypes: Skill = {
  id: "g8.eq.solution-types",
  title: "One, none or infinitely many solutions",
  topic: T,
  standards: ["NC.8.EE.7"],
  prereqs: ["g8.eq.multistep"],
  lesson: {
    bigIdea: "If simplifying leads to x = a number → one solution. To a false statement like 3 = 5 → no solution. To a true statement like 4 = 4 → infinitely many.",
    explain: [
      "2x + 3 = 2x + 5 → 3 = 5. False! No value works: **no solution**.",
      "2(x + 3) = 2x + 6 → 6 = 6. Always true: **infinitely many solutions**.",
      "Look at the coefficients: same x-coefficient + different constants → none. Same both → infinite. Different x-coefficients → one.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does x + 4 = x + 7 have no solution?", choices: ["Adding 4 and adding 7 to the same number can never give equal results.", "Because x is 0.", "It has one solution."], correct: 0, explain: "It simplifies to 4 = 7, which is never true." },
    { kind: "written", prompt: "Explain why 3(x − 2) = 3x − 6 has infinitely many solutions.", keyIdeas: ["distribute: 3x − 6 = 3x − 6", "both sides are identical", "any value of x makes it true"], exemplar: "Distributing the left side gives 3x − 6, which is exactly the right side. The two sides are the same expression, so any x makes the equation true: infinitely many solutions." },
  ],
  generate(r) {
    const a = r.nonzero(-6, 6);
    const b = r.int(-9, 9);
    const kind = r.int(0, 2);
    let lhs: string, rhs: string;
    if (kind === 0) {
      let c = r.nonzero(-6, 6);
      if (c === a) c = a + 1 === 0 ? a + 2 : a + 1;
      lhs = linear(a, b);
      rhs = linear(c, r.int(-9, 9));
    } else if (kind === 1) {
      let d = r.int(-9, 9);
      if (d === b) d = b + 3;
      lhs = linear(a, b);
      rhs = linear(a, d);
    } else {
      const k = r.int(2, 4);
      lhs = `${k}(${linear(a, b)})`;
      rhs = linear(k * a, k * b);
    }
    const labels = ["Exactly one solution", "No solution", "Infinitely many solutions"];
    return {
      prompt: `How many solutions does ${lhs} = ${rhs} have?`,
      answer: choice(r, labels[kind], labels.filter((_, i) => i !== kind).map((l) => [l, "Simplify both sides and compare the x-terms and the constants."] as [string, string]), true),
      hints: ["Simplify both sides completely.", "Compare: are the x-coefficients the same? Are the constants the same?"],
      steps: [kind === 0 ? "Different x-coefficients → exactly one solution" : kind === 1 ? "Same x-coefficient, different constants → no solution" : "Both sides are identical → infinitely many"],
    };
  },
};

const systems: Skill = {
  id: "g8.eq.systems",
  title: "Systems of linear equations",
  topic: T,
  standards: ["NC.8.EE.8"],
  prereqs: ["g8.eq.multistep", "g8.f.slope"],
  lesson: {
    bigIdea: "The solution to a system is the point (x, y) that makes BOTH equations true, where their graphs cross.",
    explain: [
      "y = 2x + 10 and y = 4x + 4 (two plans). Set them equal: 2x + 10 = 4x + 4 → x = 3, y = 16. The lines cross at (3, 16).",
      "Parallel lines (same slope, different intercept) never cross: no solution.",
    ],
    visual: { type: "grid", min: -2, max: 10, lines: [{ m: 1, b: 1, label: "y = x + 1" }, { m: -1, b: 7, label: "y = −x + 7" }], points: [{ x: 3, y: 4, label: "(3, 4)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the solution of a system where the lines cross?", choices: ["That point is on both lines, so it makes both equations true.", "Because lines always cross at the origin.", "The solution is where the lines start."], correct: 0, explain: "Every point on a line satisfies its equation." },
    { kind: "written", prompt: "Explain how to solve y = 3x − 2 and y = x + 4.", keyIdeas: ["both equal y, so set 3x − 2 = x + 4", "2x = 6, x = 3", "y = 3 + 4 = 7: solution (3, 7); check in both"], exemplar: "Both equations equal y, so 3x − 2 = x + 4. Subtract x and add 2: 2x = 6, x = 3. Then y = 3 + 4 = 7. Check in the first: 3(3) − 2 = 7 ✔. The solution is (3, 7)." },
  ],
  generate(r, lv) {
    const x = r.int(-4, 6);
    const y = r.int(-4, 8);
    let m1 = r.nonzero(-3, 3);
    let m2 = r.nonzero(-3, 3);
    while (m2 === m1) m2 = r.nonzero(-3, 3);
    const b1 = y - m1 * x;
    const b2 = y - m2 * x;
    if (lv === 1) {
      return {
        prompt: `Click the point where the two lines cross (the solution of the system).`,
        answer: { kind: "point", x, y, min: -8, max: 10, lines: [{ m: m1, b: b1 }, { m: m2, b: b2 }] },
        hints: ["Find where the two lines meet.", "Read its coordinates and check them in both equations."],
        steps: [`The lines meet at (${x}, ${y})`, `Check: y = ${linear(m1, b1)} → ${m1 * x + b1} ✔`],
      };
    }
    if (lv === 2) {
      return {
        prompt: `Solve the system: y = ${linear(m1, b1)} and y = ${linear(m2, b2)}`,
        answer: { kind: "multi", fields: [{ value: F(x), pre: "x =" }, { value: F(y), pre: "y =" }] },
        hints: ["Both equal y, so set the right sides equal to each other.", `${linear(m1, b1)} = ${linear(m2, b2)} → solve for x, then find y.`],
        steps: [`${linear(m1, b1)} = ${linear(m2, b2)}`, `${linear(m1 - m2, 0)} = ${ms(b2 - b1)}`, `x = ${ms(x)}`, `y = ${ms(y)}`],
      };
    }
    const name = r.pick(NAMES);
    const f1 = r.int(5, 20), p1 = r.int(1, 4);
    let p2 = r.int(2, 6);
    if (p2 <= p1) p2 = p1 + r.int(1, 3);
    const h = r.int(2, 8);
    const f2 = f1 + p1 * h - p2 * h;
    if (f2 < 0) {
      return {
        prompt: `Bike rental A costs $10 plus $2 per hour. Rental B costs $4 plus $4 per hour. After how many hours do they cost the same?`,
        answer: num(3),
        hints: ["Write 10 + 2h = 4 + 4h.", "Solve for h."],
        steps: ["10 + 2h = 4 + 4h", "6 = 2h", "h = 3"],
      };
    }
    return {
      prompt: `${name} compares two bike rentals. Shop A charges $${f1} plus $${p1} per hour. Shop B charges $${f2} plus $${p2} per hour. After how many hours do they cost the same?`,
      answer: num(h),
      hints: [`Write ${f1} + ${p1}h = ${f2} + ${p2}h.`, "Collect the h-terms on one side."],
      steps: [`${f1} + ${p1}h = ${f2} + ${p2}h`, `${f1 - f2} = ${p2 - p1}h`, `h = ${h}`, `Both cost $${f1 + p1 * h}`],
      traps: traps(F(h), [trap(f1 + p1 * h, "That's the cost. The question asks for the number of hours.")]),
    };
  },
};

export default [multistep, solutionTypes, systems];
