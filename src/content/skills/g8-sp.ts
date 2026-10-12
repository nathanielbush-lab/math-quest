import { frac, fromDecimal } from "../../lib/rational";
import { choice, fr, num, round, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { simplifySteps, st } from "../steps";

const T = "g8-sp";

const scatter: Skill = {
  id: "g8.sp.scatter",
  title: "Scatterplots and association",
  topic: T,
  standards: ["NC.8.SP.1"],
  prereqs: ["g6.ns.coords", "g6.sp.center"],
  lesson: {
    bigIdea: "A scatterplot shows whether two variables are related: positive, negative or no association.",
    explain: [
      "Practice time vs. scores: if points rise left to right, there's a **positive association**.",
      "If points fall left to right, it's **negative** (like hours of TV vs. hours of sleep).",
      "An association alone does not prove that one thing CAUSES the other. Ice cream sales and sunburns rise together because of hot weather!",
    ],
    visual: { type: "scatter", points: [{ x: 1, y: 52 }, { x: 2, y: 58 }, { x: 3, y: 61 }, { x: 4, y: 70 }, { x: 5, y: 72 }, { x: 6, y: 80 }, { x: 7, y: 83 }], xLabel: "hours practiced", yLabel: "score" },
  },
  why: [
    { kind: "choice", prompt: "Ice cream sales and swimming-pool visits have a positive association. Why doesn't that mean ice cream causes swimming?", choices: ["A third factor, hot weather, makes both go up.", "Because the association is negative.", "It does mean that."], correct: 0, explain: "Association ≠ causation." },
    { kind: "written", prompt: "A scatterplot shows students who practice more get higher scores. Explain what you can and can't conclude.", keyIdeas: ["there is a positive association", "practice may help, but the plot alone doesn't prove it causes higher scores", "other factors (interest, prior skill) could explain both"], exemplar: "There's a positive association: more practice goes with higher scores. But the scatterplot alone doesn't prove practice causes the higher scores. Students who already like the subject might practice more and score higher." },
  ],
  generate(r, lv) {
    const type = r.pick(["positive", "negative", "none"]);
    const pts = Array.from({ length: 12 }, (_, i) => {
      const x = i + 1 + r.int(0, 2) * 0.5;
      const base = type === "positive" ? 10 + 6 * x : type === "negative" ? 90 - 6 * x : 50;
      const noise = type === "none" ? r.int(-35, 35) : r.int(-7, 7);
      return { x, y: Math.max(2, Math.round(base + noise)) };
    });
    if (lv === 3) {
      const pairs: [string, string, string][] = [
        ["hours of exercise", "resting heart rate", "People who exercise more might also differ in other ways (age, diet, sleep) that affect heart rate. The study alone can't separate these."],
        ["shoe size", "reading level (for kids ages 5 to 15)", "Age! Older kids have bigger feet AND read better. Bigger shoes don't make anyone read better."],
        ["hours studying", "test score", "Studying probably does help, but students who study more may also be more interested in the subject. Only an experiment could prove the cause."],
      ];
      const [a, b, other] = r.pick(pairs);
      return {
        prompt: `A study finds a strong association between ${a} and ${b}. Which conclusion is best?`,
        answer: choice(r, "They are related, but this alone doesn't prove one causes the other.", [[`Increasing ${a} definitely causes a change in ${b}.`, "Association alone doesn't prove causation."], ["There's no relationship.", "A strong association is a relationship."]]),
        hints: ["A strong association means the two things tend to change together. Does that prove one MAKES the other happen?", `Could something else explain why ${a} and ${b.replace(/ \(.*\)/, "")} go together? Cross out choices that claim too much, or that ignore the pattern.`],
        steps: [
          st("Association means a pattern.", `As ${a} changes, ${b.replace(/ \(.*\)/, "")} tends to change too.`),
          st("Causation means one thing makes the other happen.", "A pattern in data alone can't prove that."),
          st("Look for another explanation.", other),
          st("Answer.", "They are related, but this alone doesn't prove one causes the other."),
        ],
      };
    }
    const labels: Record<string, string> = { positive: "Positive association", negative: "Negative association", none: "No association" };
    return {
      prompt: `What kind of association does the scatterplot show?`,
      visual: { type: "scatter", points: pts, xLabel: "x", yLabel: "y" },
      answer: choice(r, labels[type], Object.entries(labels).filter(([k]) => k !== type).map(([, v]) => [v, "Look at the overall trend from left to right."] as [string, string]), true),
      hints: ["Don't focus on single dots. Look at the whole cloud of points as your eyes move from left to right.", "Compare the left end with the right end. Higher on the right → positive. Lower on the right → negative. No clear rise or fall → none."],
      steps: [
        st("Read the graph from left to right.", "Watch what the y-values do as x gets bigger."),
        st("Compare the two ends.", `The 4 leftmost points average y ≈ ${Math.round(pts.slice(0, 4).reduce((t, q) => t + q.y, 0) / 4)}; the 4 rightmost average y ≈ ${Math.round(pts.slice(-4).reduce((t, q) => t + q.y, 0) / 4)}.`),
        st(
          "Describe the trend.",
          type === "positive" ? "The points rise: as x increases, y tends to increase." : type === "negative" ? "The points fall: as x increases, y tends to decrease." : "There's no clear rise or fall: the points are scattered all over, and the ends don't differ much compared with the spread.",
        ),
        st("Answer.", labels[type]),
      ],
    };
  },
};

const lineFit: Skill = {
  id: "g8.sp.line-fit",
  title: "Lines of best fit",
  topic: T,
  standards: ["NC.8.SP.2", "NC.8.SP.3"],
  prereqs: ["g8.sp.scatter", "g8.f.linear-models"],
  lesson: {
    bigIdea: "A line of fit summarizes the trend in a scatterplot. Its equation lets you make predictions and interpret the slope.",
    explain: [
      "If y = 4x + 50 fits test score y vs. hours studied x, then studying 5 hours predicts 4(5) + 50 = 70.",
      "The slope 4 means each extra hour is associated with about 4 more points. The intercept 50 is the predicted score for 0 hours.",
    ],
    visual: { type: "scatter", points: [{ x: 1, y: 55 }, { x: 2, y: 57 }, { x: 3, y: 63 }, { x: 4, y: 65 }, { x: 5, y: 71 }, { x: 6, y: 73 }], xLabel: "hours", yLabel: "score", line: { m: 4, b: 50 } },
  },
  why: [
    { kind: "choice", prompt: "In y = 4x + 50 (score vs. hours), why does the slope 4 mean “about 4 points per hour”?", choices: ["Slope is the change in y for each 1-unit increase in x.", "Because 4 is less than 50.", "It means 4 hours total."], correct: 0, explain: "Rate of change." },
    { kind: "written", prompt: "A line of fit for plant height (cm) vs. days is y = 0.5x + 2. Explain what the 0.5 and the 2 mean and predict day 20.", keyIdeas: ["0.5 means about 0.5 cm growth per day", "2 is the predicted height at day 0", "day 20: 0.5(20) + 2 = 12 cm"], exemplar: "The slope 0.5 means the plant grows about half a centimeter each day. The 2 means it was about 2 cm tall at the start (day 0). On day 20 the prediction is 0.5 × 20 + 2 = 12 cm." },
  ],
  generate(r, lv) {
    const m = r.pick([2, 3, 4, 5, 0.5, 1.5]);
    const b = r.int(5, 50);
    const ctx = r.pick([["hours studied", "test score", "hour of studying", "points"], ["days", "plant height (cm)", "day", "cm"], ["temperature (°F)", "lemonade cups sold", "degree warmer", "cups"]]);
    if (lv <= 2) {
      const x = r.int(2, 12);
      const ans = round(m * x + b, 2);
      return {
        prompt: `The line of fit for ${ctx[1]} (y) vs. ${ctx[0]} (x) is y = ${m}x + ${b}. Predict y when x = ${x}.`,
        visual: lv === 1 ? { type: "scatter", points: [1, 3, 5, 7, 9, 11].map((xx) => ({ x: xx, y: Math.round(m * xx + b + r.int(-3, 3)) })), xLabel: ctx[0], yLabel: ctx[1], line: { m, b } } : undefined,
        answer: num(fromDecimal(ans)),
        hints: [`The line's equation is the prediction rule: put ${x} in place of x in y = ${m}x + ${b}.`, `Multiply first: ${m} × ${x}. Then add ${b}.`],
        steps: [
          st("The line of fit is the prediction rule.", `y = ${m}x + ${b}`),
          st(`Substitute x = ${x}.`, `y = ${m} × ${x} + ${b}`),
          st("Multiply first.", `${m} × ${x} = ${round(m * x, 2)}`),
          st("Then add.", `${round(m * x, 2)} + ${b} = ${ans}`),
          st("Answer in context.", `When x = ${x}, the predicted ${ctx[1].replace(/ \(.*\)/, "")} is about ${ans} ${ctx[3]}.`),
        ],
      };
    }
    return {
      prompt: `The line of fit for ${ctx[1]} vs. ${ctx[0]} is y = ${m}x + ${b}. What does the slope tell you?`,
      answer: choice(r, `For each extra ${ctx[2]}, the ${ctx[1].replace(/ \(.*\)/, "")} goes up by about ${m} ${ctx[3]}.`, [[`The ${ctx[1].replace(/ \(.*\)/, "")} starts at ${m} ${ctx[3]}.`, "The starting value is the y-intercept, b."], [`The ${ctx[1].replace(/ \(.*\)/, "")} is always ${b} ${ctx[3]}.`, "The slope is a rate of change."]]),
      hints: ["In y = mx + b, the slope m is the number multiplying x. It tells how much y changes when x goes up by 1.", `Here the slope is ${m}. A slope is a change for each 1 step in x, not a starting amount or a fixed total. (${b} is the start.)`],
      steps: [
        st("In y = mx + b, the slope m is the rate of change.", "It tells how much y changes when x goes up by 1."),
        st(`Here m = ${m}.`, `So each extra ${ctx[2]} adds about ${m} ${ctx[3]} to the ${ctx[1].replace(/ \(.*\)/, "")}.`),
        st("Don't mix it up with b.", `b = ${b} is the starting value (the prediction when x = 0), not the rate.`),
      ],
    };
  },
};

const twoWay: Skill = {
  id: "g8.sp.two-way",
  title: "Two-way tables",
  topic: T,
  standards: ["NC.8.SP.4"],
  prereqs: ["g6.rp.percent", "g7.sp.probability"],
  lesson: {
    bigIdea: "A two-way table shows two categories at once. Relative frequencies (fractions or percents of a row or column) let you compare groups fairly.",
    explain: [
      "Of 40 students who have a pet, 30 also play a sport: {30/40} = 75%. Of 60 without a pet, 30 play a sport: 50%. Pet owners in this group are more likely to play a sport.",
      "Always ask: “out of which group?” That's your denominator.",
    ],
    visual: { type: "table", headers: ["", "Sport", "No sport", "Total"], rows: [["Pet", 30, 10, 40], ["No pet", 30, 30, 60], ["Total", 60, 40, 100]] },
  },
  why: [
    { kind: "choice", prompt: "Why compare percents (relative frequencies) instead of raw counts in a two-way table?", choices: ["The groups can be different sizes, so percents make a fair comparison.", "Percents are always bigger.", "Counts can't be compared."], correct: 0, explain: "30 out of 40 vs 30 out of 60 are very different." },
    { kind: "written", prompt: "30 of 40 pet owners and 30 of 60 non-owners play a sport. Explain whether there's an association.", keyIdeas: ["75% of pet owners play a sport", "50% of non-owners do", "the difference suggests an association (but not causation)"], exemplar: "75% of pet owners (30/40) play a sport, but only 50% of non-owners (30/60) do. That big difference suggests an association between having a pet and playing a sport, though it doesn't prove one causes the other." },
  ],
  generate(r, lv) {
    const [rowA, rowB, colA, colB] = r.pick([["Grade 7", "Grade 8", "Likes music", "Doesn't"], ["Pet", "No pet", "Plays sport", "Doesn't"], ["Bus", "Walk", "Breakfast", "No breakfast"]]);
    const a = r.int(5, 30), b = r.int(5, 30), c = r.int(5, 30), d = r.int(5, 30);
    const rows: (string | number)[][] = [[rowA, a, b, a + b], [rowB, c, d, c + d], ["Total", a + c, b + d, a + b + c + d]];
    const visual = { type: "table" as const, headers: ["", colA, colB, "Total"], rows };
    if (lv === 1) {
      return {
        prompt: `How many students in the "${rowB}" row are in the "${colA}" column?`,
        visual,
        answer: num(c),
        hints: [`Find the "${rowB}" row first (it goes across).`, `Slide along that row until you reach the "${colA}" column. Read the number where they meet.`],
        steps: [
          st("Find the row.", `"${rowB}" is the second row of numbers.`),
          st("Find the column.", `"${colA}" is the first column of numbers.`),
          st("Read the cell where they meet.", `${c}`),
        ],
      };
    }
    if (lv === 2) {
      return {
        prompt: `What fraction of the "${rowA}" students are in the "${colA}" column? (Relative frequency for that row.)`,
        visual,
        answer: num(frac(a, a + b)),
        hints: [`"Of the ${rowA} students" means the whole is the ${rowA} row. Its total goes on the bottom of the fraction.`, `${rowA} row total: ${a} + ${b} = ${a + b}. The top is the number of ${rowA} students in "${colA}". Simplify if you can.`],
        steps: [
          st("Which group is the whole?", `"Of the ${rowA} students", so the bottom of the fraction is the ${rowA} row total.`),
          st("Row total.", `${a} + ${b} = ${a + b}`),
          st("The part.", `${rowA} students in "${colA}": ${a}`),
          st("Write the fraction.", `{${a}/${a + b}}`),
          ...(frac(a, a + b).d !== a + b ? simplifySteps(a, a + b) : []),
          st("Answer.", `${fr(frac(a, a + b))} (about ${round((100 * a) / (a + b), 1)}%)`),
        ],
        traps: traps(frac(a, a + b), [trap(frac(a, a + c), `That's out of the ${colA} column total. The question asks out of the ${rowA} row.`), trap(frac(a, a + b + c + d), "That's out of everyone. Use the row total.")]),
      };
    }
    const pA = a / (a + b);
    const pB = c / (c + d);
    const diff = Math.abs(pA - pB);
    return {
      prompt: `Compare the percent of "${rowA}" vs "${rowB}" students who are in "${colA}". Which group has the higher percent?`,
      visual,
      answer: choice(
        r,
        diff < 0.005 ? "About the same" : pA > pB ? rowA : rowB,
        [
          ...(diff < 0.005 ? [rowA, rowB] : [pA > pB ? rowB : rowA]).map((g) => [g, "Divide by each ROW total to get a percent for each group, then compare the percents (not the counts)."] as [string, string]),
          ...(diff < 0.005 ? [] : [["About the same", "Work out each percent: are they really that close?"] as [string, string]]),
        ],
      ),
      hints: [`The rows have different totals, so compare percents, not counts. For each row, divide its "${colA}" number by that row's total.`, `${rowA}: ${a} ÷ ${a + b}. ${rowB}: ${c} ÷ ${c + d}. Turn each into a percent and compare.`],
      steps: [
        st("Use each ROW total.", "The groups are different sizes, so compare percents, not counts."),
        st(`${rowA}.`, `{${a}/${a + b}} = ${a} ÷ ${a + b} ≈ ${round(pA, 3)} = ${round(pA * 100, 1)}%`),
        st(`${rowB}.`, `{${c}/${c + d}} = ${c} ÷ ${c + d} ≈ ${round(pB, 3)} = ${round(pB * 100, 1)}%`),
        st("Compare.", diff < 0.005 ? "The percents are almost equal, so about the same." : `${round(Math.max(pA, pB) * 100, 1)}% > ${round(Math.min(pA, pB) * 100, 1)}%, so ${pA > pB ? rowA : rowB} has the higher percent.`),
      ],
    };
  },
};

export default [scatter, lineFit, twoWay];


