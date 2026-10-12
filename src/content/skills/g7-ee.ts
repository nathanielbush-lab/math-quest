import { frac, fromDecimal } from "../../lib/rational";
import { F, NAMES, choice, cst, linear, ms, num, sn, term, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { st, twoStepSolve } from "../steps";

const T = "g7-ee";

const simplify: Skill = {
  id: "g7.ee.simplify",
  title: "Simplifying expressions with negatives",
  topic: T,
  standards: ["NC.7.EE.1", "NC.7.EE.2"],
  prereqs: ["g6.ee.equivalent", "g7.ns.mult-int"],
  lesson: {
    bigIdea: "Distribute carefully (including negative signs), then combine like terms.",
    explain: [
      "−2(x − 3) = −2·x + (−2)(−3) = −2x + 6. The −2 multiplies BOTH terms.",
      "4x − 7 − 6x + 2 = (4x − 6x) + (−7 + 2) = −2x − 5.",
      "Rewriting can reveal meaning: a + 0.05a = 1.05a means “increase by 5%”.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is −3(x − 4) equal to −3x + 12?", choices: ["−3 times −4 is +12: the −3 multiplies both terms.", "Only the x is multiplied.", "It equals −3x − 12."], correct: 0, explain: "Negative × negative = positive." },
    { kind: "written", prompt: "Explain why a + 0.05a = 1.05a and what it could mean for a price.", keyIdeas: ["a is 1a", "1a + 0.05a = 1.05a (combine like terms)", "the price went up by 5% (e.g. tax)"], exemplar: "a is the same as 1a, so 1a + 0.05a = 1.05a. If a is a price, adding 0.05a adds 5% more, like sales tax, and 1.05a is the new total." },
  ],
  generate(r, lv) {
    const v = r.pick(["x", "y", "n"]);
    if (lv === 1) {
      const p = r.nonzero(-9, 9);
      const q = r.nonzero(-9, 9);
      const c = r.nonzero(-12, 12);
      const d = r.nonzero(-12, 12);
      return {
        prompt: `Simplify: ${term(p, v)}${cst(c)}${term(q, v, false)}${cst(d)}`,
        answer: { kind: "multi", fields: [{ value: F(p + q), post: v }, { value: F(c + d), pre: "+" }] },
        hints: [`Combine the ${v}-terms: ${ms(p)} + ${sn(q)}.`, `Combine the numbers: ${ms(c)} + ${sn(d)}.`],
        steps: [
          st("Group the like terms (keep each sign with its term).", `${v}-terms: ${term(p, v)} and ${term(q, v)}. Numbers: ${ms(c)} and ${ms(d)}.`),
          st(`Combine the ${v}-terms.`, `${ms(p)} + ${sn(q)} = ${ms(p + q)}, so ${term(p + q || 0, v)}`),
          st("Combine the numbers.", `${ms(c)} + ${sn(d)} = ${ms(c + d)}`),
          st("Answer.", linear(p + q, c + d, v)),
        ],
      };
    }
    const a = r.nonzero(-6, 6) || -2;
    const b = r.nonzero(-9, 9);
    if (lv === 2) {
      return {
        prompt: `Expand: ${ms(a)}(${v}${cst(b)})`,
        answer: { kind: "multi", fields: [{ value: F(a), post: v }, { value: F(a * b), pre: "+" }] },
        hints: [`Multiply ${ms(a)} by ${v} and by ${ms(b)}.`, `${sn(a)} × ${sn(b)} = ?`],
        steps: [
          st("Distribute: multiply the number outside by EACH term inside.", `${sn(a)} × ${v} = ${term(a, v)}`),
          st("Multiply the second term, watching the signs.", `${sn(a)} × ${sn(b)} = ${ms(a * b)} (${(a < 0) === (b < 0) ? "same signs → positive" : "different signs → negative"})`),
          st("Answer.", linear(a, a * b, v)),
        ],
        traps: undefined,
      };
    }
    const c = r.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
    const d = r.nonzero(-9, 9);
    const k = r.nonzero(-8, 8);
    const coef = a + k;
    const constant = a * b + c * d;
    return {
      prompt: `Simplify: ${ms(a)}(${v}${cst(b)})${term(k, v, false)}${c < 0 ? " − " : " + "}${Math.abs(c)}(${d})`.replace(`(${d})`, `(${ms(d)})`),
      answer: { kind: "multi", fields: [{ value: F(coef), post: v }, { value: F(constant), pre: "+" }] },
      hints: ["Distribute first.", "Then combine like terms."],
      steps: [
        st("Distribute first.", `${ms(a)}(${v}${cst(b)}) = ${sn(a)} × ${v} + ${sn(a)} × ${sn(b)} = ${linear(a, a * b, v)}`),
        st("Multiply the last part.", `${c < 0 ? "−" : "+"}${Math.abs(c)}(${ms(d)}) = ${ms(c * d)}`),
        st("Rewrite with no parentheses.", `${linear(a, a * b, v)}${term(k, v, false)}${cst(c * d)}`),
        st(`Combine the ${v}-terms.`, `${ms(a)} + ${sn(k)} = ${ms(coef)}`),
        st("Combine the numbers.", `${ms(a * b)} + ${sn(c * d)} = ${ms(constant)}`),
        st("Answer.", linear(coef, constant, v)),
      ],
    };
  },
};

const twoStep: Skill = {
  id: "g7.ee.two-step",
  title: "Two-step equations",
  topic: T,
  standards: ["NC.7.EE.4"],
  prereqs: ["g6.ee.one-step", "g7.ns.mult-int"],
  lesson: {
    bigIdea: "Undo in reverse order: first undo the adding/subtracting, then undo the multiplying/dividing.",
    explain: [
      "3x + 5 = 20 → subtract 5: 3x = 15 → divide by 3: x = 5.",
      "Think of wrapping a present: the last thing done to x (+5) is the first thing you undo.",
      "2(x − 4) = 10 → divide by 2: x − 4 = 5 → add 4: x = 9.",
    ],
    tip: "Always check by plugging your answer back in.",
  },
  why: [
    { kind: "choice", prompt: "In 3x + 5 = 20, why do you subtract 5 before dividing by 3?", choices: ["The 5 was added last, so it's undone first, leaving 3x alone.", "Subtraction always comes first.", "You must divide first."], correct: 0, explain: "Undo operations in reverse order." },
    { kind: "written", prompt: "Explain how to solve −4x + 7 = −13 and check your answer.", keyIdeas: ["subtract 7: −4x = −20", "divide by −4: x = 5", "check: −4(5) + 7 = −13 ✔"], exemplar: "First I subtract 7 from both sides: −4x = −20. Then divide both sides by −4: x = 5. Check: −4 × 5 + 7 = −20 + 7 = −13 ✔." },
  ],
  generate(r, lv) {
    const v = r.pick(["x", "n", "y", "p"]);
    const x = lv === 3 ? r.nonzero(-12, 12) : r.int(1, 12);
    const a = lv === 1 ? r.int(2, 9) : r.pick([-9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]);
    const b = r.nonzero(-15, 15);
    const form = lv === 3 ? r.int(0, 2) : r.int(0, 1);
    if (form === 1) {
      const rhs = a * (x + b);
      return {
        prompt: `Solve for ${v}: ${ms(a)}(${v}${cst(b)}) = ${ms(rhs)}`,
        answer: num(x),
        hints: [`Divide both sides by ${ms(a)} first (or distribute).`, `${v}${cst(b)} = ${ms(x + b)}`],
        steps: [
          st(`The parentheses are multiplied by ${ms(a)}. Undo that first: divide both sides by ${ms(a)}.`, `${ms(rhs)} ÷ ${sn(a)} = ${ms(x + b)}, so ${v}${cst(b)} = ${ms(x + b)}.`),
          st(`Undo the ${b > 0 ? "+" : "−"} ${Math.abs(b)}: ${b > 0 ? "subtract" : "add"} ${Math.abs(b)} on both sides.`, `${v} = ${ms(x + b)}${cst(-b)} = ${ms(x)}`),
          st("Check by substituting.", `${ms(a)}(${ms(x)}${cst(b)}) = ${ms(a)} × ${sn(x + b)} = ${ms(rhs)} ✔`),
        ],
        traps: traps(F(x), [trap(rhs / a + b, `To undo ${b > 0 ? "+" : "−"}${Math.abs(b)} inside the parentheses, ${b > 0 ? "subtract" : "add"} ${Math.abs(b)}.`)]),
      };
    }
    if (form === 2) {
      const d = r.pick([2, 3, 4, 5]);
      const xx = d * r.nonzero(-6, 6);
      const rhs = xx / d + b;
      return {
        prompt: `Solve for ${v}: {${v}/${d}}${cst(b)} = ${ms(rhs)}`,
        answer: num(xx),
        hints: [`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} first.`, `Then multiply both sides by ${d}.`],
        steps: [
          st(`Undo the ${b > 0 ? "+" : "−"} ${Math.abs(b)} first: ${b > 0 ? "subtract" : "add"} ${Math.abs(b)} on both sides.`, `{${v}/${d}} = ${ms(rhs)}${cst(-b)} = ${ms(rhs - b)}`),
          st(`${v} is divided by ${d}. Undo it: multiply both sides by ${d}.`, `${v} = ${sn(rhs - b)} × ${d} = ${ms(xx)}`),
          st("Check by substituting.", `${sn(xx)} ÷ ${d}${cst(b)} = ${ms(xx / d)}${cst(b)} = ${ms(rhs)} ✔`),
        ],
        traps: traps(F(xx), [trap(rhs * d - b, "Undo the addition/subtraction before multiplying.")]),
      };
    }
    const rhs = a * x + b;
    return {
      prompt: `Solve for ${v}: ${term(a, v)}${cst(b)} = ${ms(rhs)}`,
      answer: num(x),
      hints: [`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} on both sides.`, `Then divide both sides by ${ms(a)}.`],
      steps: [
        st("Plan: undo the operations in reverse order.", `${v} was multiplied by ${ms(a)}, then ${b > 0 ? `${b} was added` : `${-b} was subtracted`}. Undo the ${b > 0 ? "adding" : "subtracting"} first.`),
        ...twoStepSolve(a, b, rhs, v),
      ],
      traps: traps(F(x), [trap(frac(rhs + b, a), `To undo ${b > 0 ? "+" : "−"}${Math.abs(b)}, ${b > 0 ? "subtract" : "add"} it.`), trap(frac(rhs, a) , "Undo the addition/subtraction first, then divide."), trap(-x, "Check the sign when you divide.")]),
    };
  },
};

const twoStepIneq: Skill = {
  id: "g7.ee.inequalities",
  title: "Two-step inequalities",
  topic: T,
  standards: ["NC.7.EE.4"],
  prereqs: ["g7.ee.two-step", "g6.ee.inequalities"],
  lesson: {
    bigIdea: "Solve like an equation, but if you multiply or divide by a NEGATIVE number, flip the inequality sign.",
    explain: [
      "A $5 entry fee plus $3 per ride must fit in $20: 5 + 3r ≤ 20 → 3r ≤ 15 → r ≤ 5. You can buy **at most 5 rides**.",
      "−2x > 8 → divide by −2 and flip: x < −4. Check x = −5: −2(−5) = 10 > 8 ✔.",
    ],
    tip: "Test a number from your answer in the original inequality.",
  },
  why: [
    { kind: "choice", prompt: "Why does the sign flip when dividing both sides by a negative?", choices: ["Multiplying by a negative reverses the order of numbers: 2 < 3 but −2 > −3.", "It's just a rule with no reason.", "It doesn't flip."], correct: 0, explain: "Negatives mirror the number line." },
    { kind: "written", prompt: "A $5 entry fee plus $3 per ride must fit $20. Explain how many rides you can buy.", keyIdeas: ["5 + 3r ≤ 20", "3r ≤ 15 so r ≤ 5", "at most 5 rides (whole rides)"], exemplar: "The total cost is 5 + 3r and it must be at most 20, so 5 + 3r ≤ 20. Subtract 5: 3r ≤ 15. Divide by 3: r ≤ 5. You can buy at most 5 rides." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const fee = r.int(2, 12);
      const per = r.int(2, 8);
      const n = r.int(3, 10);
      const budget = fee + per * n + r.int(0, per - 1);
      return {
        prompt: `A park charges a $${fee} entry fee plus $${per} per ride. ${r.pick(NAMES)} has $${budget}. What is the greatest number of rides that fits the budget?`,
        answer: num(n),
        hints: [`Write ${fee} + ${per}r ≤ ${budget}.`, `Subtract ${fee}, then divide by ${per}. Round down to a whole number of rides.`],
        steps: [
          st("Write an inequality.", `Let r = number of rides. Fee + rides must be no more than the money: ${fee} + ${per}r ≤ ${budget}.`),
          st(`Subtract ${fee} from both sides.`, `${per}r ≤ ${budget} − ${fee} = ${budget - fee}`),
          st(`Divide both sides by ${per}.`, `r ≤ ${budget - fee} ÷ ${per} = ${Math.round(((budget - fee) / per) * 100) / 100}`),
          st("Rides come in whole numbers.", `The biggest whole number that's ≤ ${Math.round(((budget - fee) / per) * 100) / 100} is ${n}.`),
          st("Check.", `${n} rides: ${fee} + ${per} × ${n} = ${fee + per * n} ≤ ${budget} ✔. ${n + 1} rides would cost ${fee + per * (n + 1)}, too much.`),
        ],
        traps: traps(F(n), [trap(n + 1, "Rides must be whole and the total can't go over the budget, so round DOWN."), trap(Math.floor(budget / per), `Don't forget the $${fee} entry fee.`)]),
      };
    }
    const a = lv === 3 ? -r.int(2, 6) : r.int(2, 6);
    const b = r.nonzero(-10, 10);
    const x0 = r.nonzero(-8, 8);
    const sym = r.pick(["<", ">", "≤", "≥"]);
    const rhs = a * x0 + b;
    const flip: Record<string, string> = { "<": ">", ">": "<", "≤": "≥", "≥": "≤" };
    const res = a < 0 ? flip[sym] : sym;
    const right = `x ${res} ${ms(x0)}`;
    return {
      prompt: `Solve: ${term(a, "x")}${cst(b)} ${sym} ${ms(rhs)}`,
      answer: choice(r, right, [[`x ${a < 0 ? sym : flip[sym]} ${ms(x0)}`, a < 0 ? "You divided by a negative, so the sign must flip." : "You only flip when multiplying or dividing by a negative."], `x ${res} ${ms(-x0)}`, `x ${sym} ${ms(rhs - b)}`]),
      hints: [`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} on both sides.`, `Divide by ${ms(a)}${a < 0 ? " and FLIP the sign" : ""}.`],
      steps: [
        st(`Undo the ${b > 0 ? "+" : "−"} ${Math.abs(b)}: ${b > 0 ? "subtract" : "add"} ${Math.abs(b)} on both sides.`, `${term(a, "x")} ${sym} ${ms(rhs)}${cst(-b)} = ${ms(a * x0)}`),
        a < 0
          ? st(`Divide both sides by ${ms(a)}, and FLIP the sign because ${ms(a)} is negative.`, `x ${res} ${ms(a * x0)} ÷ (${ms(a)}) = ${ms(x0)}`)
          : st(`Divide both sides by ${a}. (It's positive, so the sign stays.)`, `x ${res} ${ms(a * x0)} ÷ ${a} = ${ms(x0)}`),
        st("Check with a number.", (() => {
          const t = res === ">" || res === "≥" ? x0 + 1 : x0 - 1;
          return `Try x = ${ms(t)}: ${ms(a)} × ${sn(t)}${cst(b)} = ${ms(a * t + b)}, and ${ms(a * t + b)} ${sym} ${ms(rhs)} is true ✔`;
        })()),
        st("Answer.", right),
      ],
    };
  },
};

const wordEq: Skill = {
  id: "g7.ee.word",
  title: "Writing and solving equations from stories",
  topic: T,
  standards: ["NC.7.EE.3", "NC.7.EE.4"],
  prereqs: ["g7.ee.two-step"],
  lesson: {
    bigIdea: "Name the unknown, write an equation from the story, solve, then check it makes sense.",
    explain: [
      "“The perimeter of a rectangle is 54 cm and its length is 15 cm. Find the width.” → 2(15) + 2w = 54 → 2w = 24 → w = 12 cm.",
      "Estimate first and check the answer in the story's words.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is it helpful to estimate before solving a word problem?", choices: ["It lets you catch answers that don't make sense.", "Estimating replaces solving.", "It makes the answer exact."], correct: 0, explain: "Reasonableness check." },
    { kind: "written", prompt: "A phone plan costs $25 per month plus a $40 fee. The total so far is $215. Explain how to find how many months have passed.", keyIdeas: ["25m + 40 = 215", "25m = 175", "m = 7 months; check 25·7 + 40 = 215"], exemplar: "Let m be the months. The cost is 25m + 40 = 215. Subtract 40: 25m = 175. Divide by 25: m = 7 months. Check: 25 × 7 + 40 = 175 + 40 = 215 ✔." },
  ],
  generate(r, lv) {
    const name = r.pick(NAMES);
    const kind = r.int(0, lv === 1 ? 1 : 3);
    if (kind === 0) {
      const l = r.int(8, 30);
      const w = r.int(3, l - 1);
      return {
        prompt: `A rectangle has a perimeter of ${2 * (l + w)} cm and a length of ${l} cm. What is its width?`,
        answer: num(w),
        hints: ["Perimeter = 2 × length + 2 × width.", `2(${l}) + 2w = ${2 * (l + w)}`],
        steps: [
          st("Write an equation.", `Perimeter = 2 × length + 2 × width, so 2(${l}) + 2w = ${2 * (l + w)}.`),
          st("Multiply.", `${2 * l} + 2w = ${2 * (l + w)}`),
          st(`Subtract ${2 * l} from both sides.`, `2w = ${2 * (l + w)} − ${2 * l} = ${2 * w}`),
          st("Divide both sides by 2.", `w = ${w}`),
          st("Check.", `${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} cm ✔`),
        ],
        traps: traps(F(w), [trap(2 * (l + w) - l, "Remember both lengths are part of the perimeter, and there are two widths.")]),
        estimate: `Is the width more or less than ${l} cm?`,
      };
    }
    if (kind === 1) {
      const per = r.int(5, 40);
      const fee = r.int(10, 60);
      const m = r.int(2, 12);
      return {
        prompt: `A club costs $${fee} to join plus $${per} per month. ${name} has paid $${fee + per * m} in total. How many months has ${name} been a member?`,
        answer: num(m),
        hints: [`Write ${per}m + ${fee} = ${fee + per * m}.`, `Subtract ${fee}, then divide by ${per}.`],
        steps: [
          st("Write an equation.", `Let m = months. Cost per month × m + joining fee = total: ${per}m + ${fee} = ${fee + per * m}.`),
          st(`Subtract the ${fee} fee from both sides.`, `${per}m = ${fee + per * m} − ${fee} = ${per * m}`),
          st(`Divide both sides by ${per}.`, `m = ${per * m} ÷ ${per} = ${m}`),
          st("Check.", `${per} × ${m} + ${fee} = ${per * m + fee} ✔`),
        ],
        traps: traps(F(m), [trap(frac(fee + per * m, per), `Don't forget to take away the $${fee} joining fee first.`)]),
      };
    }
    if (kind === 2) {
      const a = r.int(8, 40);
      const diff = r.int(2, 12);
      const total = 2 * a + diff;
      return {
        prompt: `${name} and a friend collected ${total} cans in all. The friend collected ${diff} more than ${name}. How many cans did ${name} collect?`,
        answer: num(a),
        hints: [`Let c = ${name}'s cans. The friend has c + ${diff}.`, `c + (c + ${diff}) = ${total}`],
        steps: [
          st("Name the unknowns.", `Let c = ${name}'s cans. The friend has ${diff} more: c + ${diff}.`),
          st("Write an equation.", `c + (c + ${diff}) = ${total}, which is 2c + ${diff} = ${total}.`),
          st(`Subtract ${diff} from both sides.`, `2c = ${total} − ${diff} = ${2 * a}`),
          st("Divide both sides by 2.", `c = ${a}`),
          st("Check.", `${name}: ${a}, friend: ${a + diff}. ${a} + ${a + diff} = ${total} ✔`),
        ],
        traps: traps(F(a), [trap(a + diff, "That's the friend's amount.") , trap(total / 2, `If they had the same amount... but the friend has ${diff} more. Use 2c + ${diff} = ${total}.`)]),
      };
    }
    const price = r.int(4, 15) + 0.5;
    const n = r.int(3, 8);
    const coupon = r.int(2, 8);
    const total = price * n - coupon;
    return {
      prompt: `${name} buys ${n} identical shirts and uses a $${coupon} coupon. The total is $${total.toFixed(2)}. How much does each shirt cost?`,
      answer: num(fromDecimal(price), { pre: "$" }),
      hints: [`${n}s − ${coupon} = ${total.toFixed(2)}`, `Add ${coupon}, then divide by ${n}.`],
      steps: [
        st("Write an equation.", `Let s = price of one shirt. ${n} shirts minus the coupon = total: ${n}s − ${coupon} = ${total.toFixed(2)}.`),
        st(`Add the ${coupon} back on both sides.`, `${n}s = ${total.toFixed(2)} + ${coupon} = ${(total + coupon).toFixed(2)}`),
        st(`Divide both sides by ${n}.`, `s = ${(total + coupon).toFixed(2)} ÷ ${n} = ${price.toFixed(2)}`),
        st("Check.", `${n} × $${price.toFixed(2)} = $${(n * price).toFixed(2)}, minus $${coupon} = $${total.toFixed(2)} ✔`),
      ],
    };
  },
};

export default [simplify, twoStep, twoStepIneq, wordEq];

