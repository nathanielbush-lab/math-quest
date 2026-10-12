import { frac } from "../../lib/rational";
import { F, NAMES, choice, cst, fr, linear, mixed, term, ms, num, sn, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { finishSteps, st } from "../steps";

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
      answer: choice(
        r,
        isFunc ? "Yes, it's a function" : "No: an input has two different outputs",
        [
          [isFunc ? "No: an input has two different outputs" : "Yes, it's a function", isFunc ? "Look again: does any x-value (first number) appear twice?" : `Look at x = ${pairs[0][0]}: it appears twice with different y-values.`],
          ["No: an output repeats", "Repeated OUTPUTS are allowed. Check whether any INPUT repeats."],
        ],
        true,
      ),
      hints: ["A function gives each input just ONE output. The inputs are the x-values, the first number in each pair.", `The inputs here are ${shown.map(([x]) => x).join(", ")}. Does any x show up twice? If so, does it have two different y-values?`],
      steps: [
        st("A function gives exactly ONE output for each input.", "So look at the inputs (the x-values, first in each pair)."),
        st("List the inputs.", shown.map(([x]) => x).join(", ")),
        isFunc ? st("Does any input repeat?", "No. Each input has one output, so it IS a function. (Repeated outputs are fine.)") : st("Does any input repeat?", `Yes: x = ${pairs[0][0]} appears with y = ${ms(pairs[0][1])} AND y = ${ms(pairs[pairs.length - 1][1])}. One input with two outputs means it's NOT a function.`),
      ],
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
        hints: [
          "Slope = (change in y) ÷ (change in x). Pick any two rows of the table.",
          `Use the first two rows: x goes from ${ms(x1)} to ${ms(x2)}, and y goes from ${ms(y1)} to ${ms(y2)}. Subtract to find each change.`,
          `Change in y = ${ms(y2 - y1)}, change in x = ${ms(x2 - x1)}. Divide and simplify.`,
        ],
        steps: [
          st("Slope = change in y ÷ change in x.", "Use any two rows."),
          st("Change in y.", `${ms(y2)} − ${sn(y1)} = ${ms(y2 - y1)}`),
          st("Change in x.", `${ms(x2)} − ${sn(x1)} = ${ms(x2 - x1)}`),
          st("Divide.", `{${ms(y2 - y1)}/${ms(x2 - x1)}}`),
          ...finishSteps(y2 - y1, x2 - x1),
          st("Answer.", `slope = ${ms(fr(mf))}${mf.d !== 1 && Math.abs(mf.n) > mf.d ? ` = ${ms(mixed(mf))}` : ""}`),
        ],
        traps: traps(mf, [trap(frac(x2 - x1, y2 - y1 || 1), "Slope is rise over run: change in y on TOP.")]),
      };
    }
    return {
      prompt: `What is the slope of the line through (${ms(x1)}, ${ms(y1)}) and (${ms(x2)}, ${ms(y2)})?`,
      visual: Math.max(Math.abs(x1), Math.abs(x2), Math.abs(y1), Math.abs(y2)) <= 10 ? { type: "grid", min: -10, max: 10, points: [{ x: x1, y: y1 }, { x: x2, y: y2 }], lines: [{ m: mf.n / mf.d, b: y1 - (mf.n / mf.d) * x1 }] } : undefined,
      answer: num(mf, { simplest: true }),
      hints: [
        "Slope = rise ÷ run: how much y changes, divided by how much x changes, going from the first point to the second.",
        `Rise: ${ms(y2)} − ${sn(y1)}. Run: ${ms(x2)} − ${sn(x1)}. Subtract in the same order for both.`,
        `Rise = ${ms(y2 - y1)}, run = ${ms(x2 - x1)}. Divide and simplify. If exactly one of them is negative, the slope is negative.`,
      ],
      steps: [
        st("Slope = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁).", "Subtract in the same order for both."),
        st("Rise (change in y).", `${ms(y2)} − ${sn(y1)} = ${ms(y2 - y1)}`),
        st("Run (change in x).", `${ms(x2)} − ${sn(x1)} = ${ms(x2 - x1)}`),
        st("Divide.", `{${ms(y2 - y1)}/${ms(x2 - x1)}}${(y2 - y1) / (x2 - x1) < 0 ? " (different signs → negative)" : ""}`),
        ...finishSteps(Math.abs(y2 - y1) * Math.sign((y2 - y1) * (x2 - x1)), Math.abs(x2 - x1)),
        st("Answer.", `slope = ${ms(fr(mf))}${mf.n < 0 ? ": the line goes down from left to right" : mf.n > 0 ? ": the line goes up from left to right" : ""}`),
      ],
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
        hints: ["In y = mx + b, m is how much y changes each week, and b is how much there is at the start (week 0).", `Which number grows with every week, $${per} or $${start}? That one is m. The other one is b.`],
        steps: [
          st("Find the rate of change (slope m).", `Savings go up $${per} every week, so m = ${per}.`),
          st("Find the starting value (b).", `At week 0 there's $${start}, so b = ${start}.`),
          st("Put them into y = mx + b.", `y = ${per}x + ${start}`),
          st("Check.", `After 2 weeks: ${per} × 2 + ${start} = ${per * 2 + start}, which is $${start} + 2 × $${per} ✔`),
        ],
      };
    }
    if (lv === 2) {
      const xs = [0, 1, 2, 3];
      return {
        prompt: `Write the equation of the linear function in the table.`,
        visual: { type: "table", headers: ["x", "y"], rows: xs.map((x) => [x, m * x + b]) },
        answer: { kind: "multi", fields: [{ value: F(m), pre: "y =", post: "x" }, { value: F(b), pre: "+" }] },
        hints: [`Look down the y-column: ${[0, 1, 2, 3].map((x) => ms(m * x + b)).join(", ")}. How much does y change each time x goes up by 1? That's m (negative if y goes down).`, "b is the starting value: the y in the row where x = 0."],
        steps: [
          st("Find the slope: how much y changes when x goes up by 1.", `${[0, 1, 2, 3].map((x) => ms(m * x + b)).join(" → ")}: y changes by ${ms(m)} each time, so m = ${ms(m)}.`),
          st("Find b: the y-value when x = 0.", `The table says y = ${ms(b)} when x = 0, so b = ${ms(b)}.`),
          st("Write the equation.", `y = ${linear(m, b)}`),
          st("Check another row.", `x = 3: ${ms(m)} × 3${cst(b)} = ${ms(3 * m + b)} ✔`),
        ],
      };
    }
    const x1 = r.int(1, 4);
    const x2 = x1 + r.int(1, 4);
    return {
      prompt: `A line passes through (${x1}, ${ms(m * x1 + b)}) and (${x2}, ${ms(m * x2 + b)}). Write its equation.`,
      answer: { kind: "multi", fields: [{ value: F(m), pre: "y =", post: "x" }, { value: F(b), pre: "+" }] },
      hints: [
        `First find the slope: m = (change in y) ÷ (change in x) = (${ms(m * x2 + b)} − ${sn(m * x1 + b)}) ÷ (${x2} − ${x1}).`,
        `Then find b: put x = ${x1} and y = ${ms(m * x1 + b)} into y = mx + b, using your slope for m. Solve for b.`,
        `In other words, b = ${ms(m * x1 + b)} − (your slope × ${x1}).`,
      ],
      steps: [
        st("Find the slope.", `m = (${ms(m * x2 + b)} − ${sn(m * x1 + b)}) ÷ (${x2} − ${x1}) = ${ms(m * (x2 - x1))} ÷ ${x2 - x1} = ${ms(m)}`),
        st("Use one point to find b.", `Put x = ${x1}, y = ${ms(m * x1 + b)} into y = ${term(m, "x")} + b: ${ms(m * x1 + b)} = ${ms(m)} × ${x1} + b = ${ms(m * x1)} + b.`),
        st("Solve for b.", `b = ${ms(m * x1 + b)} − ${sn(m * x1)} = ${ms(b)}`),
        st("Write the equation.", `y = ${linear(m, b)}`),
        st("Check with the other point.", `${ms(m)} × ${x2}${cst(b)} = ${ms(m * x2 + b)} ✔`),
      ],
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
          hints: ["A linear equation can be written y = (number)x + (number). Its graph is a straight line.", "Cross out any choice where x is squared (x²), up in an exponent (like 2^x), or on the bottom of a fraction."],
          steps: [
            st("A linear equation can be written y = mx + b.", "x appears only to the first power: not squared, not in a denominator, not in an exponent."),
            st("Check each choice.", `${right[0]} fits y = mx + b. The others have x², x in a denominator, or x in an exponent, so their graphs curve.`),
          ],
        };
      }
      return {
        prompt: ask,
        answer: choice(r, `y: ${lin.join(", ")}`, [[`y: ${non.join(", ")}`, "Find the differences between y-values. Are they all the same?"], [`y: ${[b, b + 1, b + 3, b + 6].join(", ")}`, "The differences are 1, 2, 3, not constant."]]),
        hints: ["Linear means y changes by the SAME amount every time x goes up by 1.", "For each table, subtract neighboring y-values (2nd − 1st, 3rd − 2nd, 4th − 3rd). Pick the table where all the differences match."],
        steps: [
          st("Linear means y changes by the SAME amount each time x goes up by 1.", "Find the differences between y-values."),
          st("Check the linear table.", `${lin.join(", ")}: differences ${lin.slice(1).map((v, i) => v - lin[i]).join(", ")}, all the same ✔`),
          st("Check the others.", `${non.join(", ")}: differences ${non.slice(1).map((v, i) => v - non[i]).join(", ")}, not the same, so not linear.`),
        ],
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
      answer: choice(r, mA > mB ? "Function A" : "Function B", [[mA > mB ? "Function B" : "Function A", "Compare the rates of change (how much y grows each time x goes up 1), not the starting values."], ["They have the same rate", "Find each rate of change: are they really equal?"]], true),
      hints: [`A's rate of change is its slope: the number multiplying x in y = ${mA}x + ${bA}.`, `B's rate is how much y goes up each time x goes up 1 (${[0, 1, 2].map((x) => mB * x + bB).join(" → ")} …). Compare the two rates, not the starting values.`],
      steps: [
        st("Rate of change for A.", `In y = ${mA}x + ${bA}, the slope is ${mA}.`),
        st("Rate of change for B.", `In the table, y goes ${[0, 1, 2, 3].map((x) => mB * x + bB).join(" → ")}: up ${mB} each time.`),
        st("Compare the rates (not the starting values).", `${Math.max(mA, mB)} > ${Math.min(mA, mB)}, so ${mA > mB ? "A" : "B"} grows faster.`),
      ],
    };
  },
};

export default [functions, slope, linearModels, compareFunctions];
