import { frac } from "../../lib/rational";
import { F, NAMES, choice, fr, linear, ms, num, sn, trap, traps } from "../helpers";
import type { Skill } from "../types";

const T = "g8-f";

const functions: Skill = {
  id: "g8.f.functions",
  title: "What is a function?",
  topic: T,
  standards: ["NC.8.F.1"],
  prereqs: ["g6.ee.two-variables"],
  lesson: {
    bigIdea: "A function gives exactly ONE output for each input.",
    explain: [
      "{(1, 3), (2, 5), (3, 7)} is a function: every x has one y.",
      "{(1, 3), (1, 5), (2, 7)} is NOT: the input 1 has two different outputs.",
      "Different inputs CAN share an output: {(1, 4), (2, 4)} is still a function.",
      "On a graph, use the vertical line test: if a vertical line hits the graph twice, it's not a function.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is {(2, 5), (2, 8)} not a function?", choices: ["The input 2 has two different outputs.", "Because 5 and 8 are different.", "It is a function."], correct: 0, explain: "One input → one output." },
    { kind: "written", prompt: "Explain why a vending machine where each button gives one specific snack is like a function.", keyIdeas: ["each button (input) gives exactly one snack (output)", "two buttons could give the same snack and it's still a function", "if one button gave different snacks it wouldn't be a function"], exemplar: "Each button is an input and the snack is the output. Pressing a button always gives the same one snack, so each input has exactly one output. Two buttons could give the same snack, which is fine. If one button gave random snacks, it wouldn't be a function." },
  ],
  generate(r) {
    const xs = r.shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 4);
    const ys = xs.map(() => r.int(-5, 9));
    const isFunc = r.chance(0.5);
    const pairs = xs.map((x, i) => [x, ys[i]]);
    if (!isFunc) {
      let y = r.int(-5, 9);
      if (y === pairs[0][1]) y += 2;
      pairs.push([pairs[0][0], y]);
    }
    const shown = r.shuffle(pairs);
    return {
      prompt: `Is this relation a function? {${shown.map(([x, y]) => `(${x}, ${ms(y)})`).join(", ")}}`,
      answer: choice(r, isFunc ? "Yes, each input has exactly one output" : `No, the input ${pairs[0][0]} has two outputs`, [[isFunc ? "No, an output repeats" : "Yes, each input has exactly one output", isFunc ? "Repeated OUTPUTS are allowed. Check whether any INPUT repeats." : `Look at x = ${pairs[0][0]}: it appears twice with different y-values.`]], true),
      hints: ["Look at the x-values (inputs). Does any x appear twice?", "If an x appears twice with different y-values, it's not a function."],
      steps: [isFunc ? "No input repeats → function" : `x = ${pairs[0][0]} has two outputs → not a function`],
    };
  },
};

const slope: Skill = {
  id: "g8.f.slope",
  title: "Slope (rate of change)",
  topic: T,
  standards: ["NC.8.EE.5", "NC.8.EE.6", "NC.8.F.4"],
  prereqs: ["g7.rp.proportional", "g7.ns.mult-rational"],
  lesson: {
    bigIdea: "Slope = rise ÷ run = (change in y) ÷ (change in x). It tells how fast y changes as x increases.",
    explain: [
      "From (1, 3) to (4, 9): rise 9 − 3 = 6, run 4 − 1 = 3, slope = {6/3} = **2**.",
      "Going downhill (left to right) means a negative slope. A horizontal line has slope 0.",
      "In y = mx + b, m is the slope and b is where the line crosses the y-axis.",
    ],
    visual: { type: "grid", min: -1, max: 10, lines: [{ m: 2, b: 1 }], points: [{ x: 1, y: 3, label: "(1, 3)" }, { x: 4, y: 9, label: "(4, 9)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is a line going down from left to right said to have a negative slope?", choices: ["As x increases, y decreases, so the change in y is negative.", "Because it's below the x-axis.", "Slopes are never negative."], correct: 0, explain: "Negative rise for a positive run." },
    { kind: "written", prompt: "Savings y = 5w + 20 after w weeks. Explain what the slope and the starting value mean.", keyIdeas: ["slope 5 means savings grow $5 per week", "20 is the starting amount (week 0)", "the graph starts at (0, 20) and rises 5 per step"], exemplar: "The slope is 5, which means the savings go up $5 every week. The 20 is the starting value: at week 0 there's already $20. On a graph the line starts at (0, 20) and goes up 5 for each week." },
  ],
  generate(r, lv) {
    let x1 = r.int(-5, 4);
    let x2 = x1 + r.nonzero(-5, 6);
    if (x2 === x1) x2 = x1 + 2;
    const m = lv === 1 ? r.nonzero(-4, 5) : frac(r.nonzero(-6, 6), r.int(1, 4));
    const mf = typeof m === "number" ? F(m) : m;
    if (mf.d !== 1) {
      x1 = mf.d * r.int(-2, 1);
      x2 = x1 + mf.d * r.int(1, 3);
    }
    const y1 = r.int(-5, 5);
    const y2 = y1 + (mf.n * (x2 - x1)) / mf.d;
    if (lv === 3) {
      const table = [0, 1, 2, 3].map((i) => [x1 + i * (x2 - x1), y1 + i * (y2 - y1)]);
      return {
        prompt: `The table shows a linear function. What is its slope (rate of change)?`,
        visual: { type: "table", headers: ["x", "y"], rows: table },
        answer: num(mf, { simplest: true }),
        hints: ["Slope = change in y ÷ change in x between any two rows.", `(${y2} − ${y1}) ÷ (${x2} − ${x1})`],
        steps: [`Δy = ${y2 - y1}, Δx = ${x2 - x1}`, `slope = {${y2 - y1}/${x2 - x1}} = ${fr(mf)}`],
        traps: traps(mf, [trap(frac(x2 - x1, y2 - y1 || 1), "Slope is rise over run: change in y on TOP.")]),
      };
    }
    return {
      prompt: `What is the slope of the line through (${ms(x1)}, ${ms(y1)}) and (${ms(x2)}, ${ms(y2)})?`,
      visual: Math.max(Math.abs(x1), Math.abs(x2), Math.abs(y1), Math.abs(y2)) <= 10 ? { type: "grid", min: -10, max: 10, points: [{ x: x1, y: y1 }, { x: x2, y: y2 }], lines: [{ m: mf.n / mf.d, b: y1 - (mf.n / mf.d) * x1 }] } : undefined,
      answer: num(mf, { simplest: true }),
      hints: ["Slope = (y₂ − y₁) ÷ (x₂ − x₁).", `(${ms(y2)} − ${ms(y1)}) ÷ (${ms(x2)} − ${ms(x1)})`],
      steps: [`rise = ${ms(y2)} − (${ms(y1)}) = ${ms(y2 - y1)}`, `run = ${ms(x2)} − (${ms(x1)}) = ${ms(x2 - x1)}`, `slope = ${fr(frac(y2 - y1, x2 - x1))}`],
      traps: traps(mf, [trap(frac(x2 - x1, y2 - y1 || 1), "Slope is rise over run: change in y goes on top."), trap(frac(-(y2 - y1), x2 - x1), "Subtract in the same order for both coordinates.")]),
    };
  },
};

const linearModels: Skill = {
  id: "g8.f.linear-models",
  title: "Writing linear functions (y = mx + b)",
  topic: T,
  standards: ["NC.8.F.3", "NC.8.F.4"],
  prereqs: ["g8.f.slope"],
  lesson: {
    bigIdea: "y = mx + b: m is the rate of change, b is the starting value (y when x = 0).",
    explain: [
      "Savings start at $20 and grow $5 per week: y = 5w + 20.",
      "From a table: if y goes up 3 each time x goes up 1, m = 3. If y = 7 when x = 0, b = 7: y = 3x + 7.",
      "From two points: find the slope first, then use one point to find b.",
    ],
  },
  why: [
    { kind: "choice", prompt: "In a taxi fare y = 2x + 3 (x = miles), what does the 3 mean?", choices: ["A $3 charge before you go any miles.", "$3 per mile.", "The trip is 3 miles."], correct: 0, explain: "b is the value when x = 0." },
    { kind: "written", prompt: "A line goes through (0, 4) and (2, 10). Explain how to write its equation.", keyIdeas: ["slope = (10 − 4) ÷ (2 − 0) = 3", "(0, 4) means the starting value b = 4", "y = 3x + 4"], exemplar: "The slope is (10 − 4) ÷ (2 − 0) = 6 ÷ 2 = 3. The point (0, 4) is where x = 0, so b = 4. The equation is y = 3x + 4." },
  ],
  generate(r, lv) {
    const m = r.nonzero(-5, 8);
    const b = r.int(-9, 15);
    if (lv === 1) {
      const name = r.pick(NAMES);
      const start = r.int(5, 60);
      const per = r.int(2, 15);
      return {
        prompt: `${name} has $${start} and saves $${per} each week. Write an equation for the savings y after x weeks.`,
        answer: { kind: "multi", fields: [{ value: F(per), pre: "y =", post: "x" }, { value: F(start), pre: "+" }] },
        hints: ["The amount added each week is the slope m.", "The starting amount is b."],
        steps: [`m = ${per}, b = ${start}`, `y = ${per}x + ${start}`],
      };
    }
    if (lv === 2) {
      const xs = [0, 1, 2, 3];
      return {
        prompt: `Write the equation of the linear function in the table.`,
        visual: { type: "table", headers: ["x", "y"], rows: xs.map((x) => [x, m * x + b]) },
        answer: { kind: "multi", fields: [{ value: F(m), pre: "y =", post: "x" }, { value: F(b), pre: "+" }] },
        hints: ["How much does y change each time x goes up by 1? That's m.", "What is y when x = 0? That's b."],
        steps: [`m = ${ms(m)}`, `b = ${ms(b)} (the y-value at x = 0)`, `y = ${linear(m, b)}`],
      };
    }
    const x1 = r.int(1, 4);
    const x2 = x1 + r.int(1, 4);
    return {
      prompt: `A line passes through (${x1}, ${ms(m * x1 + b)}) and (${x2}, ${ms(m * x2 + b)}). Write its equation.`,
      answer: { kind: "multi", fields: [{ value: F(m), pre: "y =", post: "x" }, { value: F(b), pre: "+" }] },
      hints: ["Find the slope first.", `Then substitute one point into y = ${ms(m)}x + b to find b.`],
      steps: [`m = (${ms(m * x2 + b)} − ${sn(m * x1 + b)}) ÷ (${x2} − ${x1}) = ${ms(m)}`, `${ms(m * x1 + b)} = ${ms(m)}(${x1}) + b → b = ${ms(b)}`, `y = ${linear(m, b)}`],
    };
  },
};

const compareFunctions: Skill = {
  id: "g8.f.compare",
  title: "Linear vs. nonlinear, comparing functions",
  topic: T,
  standards: ["NC.8.F.2", "NC.8.F.3", "NC.8.F.5"],
  prereqs: ["g8.f.linear-models"],
  lesson: {
    bigIdea: "Linear functions change by the same amount each step (a straight line). Nonlinear ones don't.",
    explain: [
      "y = 3x + 1 → x: 0, 1, 2, 3 gives y: 1, 4, 7, 10 (always +3). Linear.",
      "y = x² → y: 0, 1, 4, 9 (+1, +3, +5). Not constant, so nonlinear.",
      "To compare two functions, compare their rates of change (slopes) and starting values.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is y = x² not linear?", choices: ["Its change isn't constant: from 0 to 1 it rises 1, from 1 to 2 it rises 3.", "Because it has an exponent of 2, which is even.", "It is linear."], correct: 0, explain: "Unequal steps → curved graph." },
    { kind: "written", prompt: "Function A is y = 4x + 2. Function B has a table x: 0, 1, 2 and y: 5, 8, 11. Explain which grows faster.", keyIdeas: ["A's rate of change is 4", "B's rate of change is 3 (y goes up 3 per step)", "A grows faster even though B starts higher"], exemplar: "A goes up 4 for each 1 increase in x. B's table goes up by 3 each time (5, 8, 11). So A grows faster, even though B starts higher (5 vs 2)." },
  ],
  generate(r, lv) {
    if (lv <= 2) {
      const m = r.int(2, 5);
      const b = r.int(0, 6);
      const lin = [0, 1, 2, 3].map((x) => m * x + b);
      const nonlins = [[0, 1, 4, 9].map((y) => y + b), [1, 2, 4, 8].map((y) => y * m), [0, 2, 6, 12].map((y) => y + b)];
      const non = r.pick(nonlins);
      const ask = lv === 1 ? "Which equation is linear?" : "Which table shows a LINEAR function (x = 0, 1, 2, 3)?";
      if (lv === 1) {
        const eqs: [string, boolean][] = [[`y = ${m}x + ${b}`, true], ["y = x²", false], [`y = ${m}/x`, false], ["y = 2^x", false], [`y = −${m}x`, true]];
        const right = r.pick(eqs.filter((e) => e[1]));
        return {
          prompt: ask,
          answer: choice(r, right[0], eqs.filter((e) => !e[1]).map(([t]) => [t, "This has x squared, in a denominator, or in an exponent, so its graph curves."] as [string, string])),
          hints: ["Linear equations can be written y = mx + b.", "Watch out for x², x in an exponent, or x in a denominator."],
          steps: [`${right[0]} is of the form y = mx + b`],
        };
      }
      return {
        prompt: ask,
        answer: choice(r, `y: ${lin.join(", ")}`, [[`y: ${non.join(", ")}`, "Find the differences between y-values. Are they all the same?"], [`y: ${[b, b + 1, b + 3, b + 6].join(", ")}`, "The differences are 1, 2, 3, not constant."]]),
        hints: ["Find how much y changes each step.", "Linear means the change is the same every step."],
        steps: [`${lin.join(", ")} goes up by ${m} each step → linear`],
      };
    }
    const mA = r.int(2, 9);
    const bA = r.int(0, 10);
    let mB = r.int(2, 9);
    if (mB === mA) mB++;
    const bB = r.int(0, 15);
    return {
      prompt: `Function A: y = ${mA}x + ${bA}. Function B is shown in the table. Which has the greater rate of change?`,
      visual: { type: "table", headers: ["x", "y (B)"], rows: [0, 1, 2, 3].map((x) => [x, mB * x + bB]) },
      answer: choice(r, mA > mB ? `A (rate ${mA})` : `B (rate ${mB})`, [[mA > mB ? `B (rate ${mB})` : `A (rate ${mA})`, "Compare slopes, not starting values."], "They have the same rate"], true),
      hints: ["A's rate is its slope.", "B's rate is how much y goes up per step in the table."],
      steps: [`A: ${mA} per unit; B: ${mB} per unit`],
    };
  },
};

export default [functions, slope, linearModels, compareFunctions];
