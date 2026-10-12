import { add, div, fromDecimal, gcd, lcm, mul, toNum } from "../../lib/rational";
import { F, NAMES, choice, fr, mixed, ms, num, round, sn, trap, traps } from "../helpers";
import type { Skill } from "../types";

const T = "g6-ns";

const divVisual: Skill = {
  id: "g6.ns.div-groups",
  title: "How many groups? Dividing by a fraction",
  topic: T,
  standards: ["NC.6.NS.1"],
  prereqs: ["g5.multiply"],
  lesson: {
    bigIdea: "3 ÷ {3/4} asks: how many {3/4}-size pieces fit into 3?",
    explain: [
      "Draw 3 bars, each cut into fourths. That's 12 fourths. Group them 3 at a time: 12 ÷ 3 = **4** servings. So 3 ÷ {3/4} = 4.",
      "Dividing by a unit fraction like {1/4} is the same as multiplying by 4: each whole holds 4 quarters.",
    ],
    visual: { type: "tape", rows: [{ label: "3 cups", segments: [{ text: "¾", size: 3, shade: true }, { text: "¾", size: 3 }, { text: "¾", size: 3, shade: true }, { text: "¾", size: 3 }] }] },
    tip: "Dividing by a number less than 1 gives a bigger answer, because lots of small pieces fit.",
  },
  why: [
    { kind: "choice", prompt: "Why is 2 ÷ {1/3} = 6?", choices: ["Each whole holds 3 thirds, so 2 wholes hold 6 thirds.", "Because 2 × 3 = 6 is a rule to memorize.", "Because {1/3} of 2 is 6."], correct: 0, explain: "Division asks how many {1/3}-pieces fit: 3 per whole, 2 wholes → 6." },
    { kind: "written", prompt: "Explain with a drawing in words why 3 cups ÷ {3/4} cup per serving gives 4 servings.", keyIdeas: ["split each cup into fourths: 12 fourths", "each serving uses 3 fourths", "12 ÷ 3 = 4 servings"], exemplar: "I cut each of the 3 cups into 4 fourths, so there are 12 fourths. Each serving is 3 fourths, so I make groups of 3. 12 ÷ 3 = 4 servings." },
  ],
  generate(r, lv) {
    const items = [["cups of rice", "cup", "serving"], ["pounds of trail mix", "pound", "bag"], ["yards of ribbon", "yard", "bow"], ["meters of rope", "meter", "piece"], ["hours", "hour", "practice session"]];
    const [what, unit, group] = r.pick(items);
    let a: number, b: number, total: number;
    if (lv === 1) {
      a = 1;
      b = r.int(2, 6);
      total = r.int(2, 6);
    } else {
      b = r.int(3, 8);
      do a = r.int(2, b - 1);
      while (gcd(a, b) !== 1);
      total = a * r.int(1, 5);
    }
    if (lv === 3) {
      // fraction ÷ fraction with a whole-number answer
      const k = r.int(2, 6);
      const small = F(1, b * r.int(1, 2));
      const big = mul(small, F(k));
      return {
        prompt: `How many ${fr(small)}s are in ${fr(big)}? (Think: ${fr(big)} ÷ ${fr(small)})`,
        answer: num(k),
        hints: [`Rewrite both with the same denominator.`, `${fr(big)} = ${fr(big.n * (small.d / big.d), small.d)}. How many ${fr(1, small.d)}s is that?`],
        steps: [`${fr(big)} = ${fr(k, small.d)}`, `${k} pieces of ${fr(small)} fit, so ${fr(big)} ÷ ${fr(small)} = ${k}`],
        traps: traps(F(k), [trap(mul(big, small), "That's multiplying. The question asks how many pieces fit, which is division.")]),
      };
    }
    const ans = (total * b) / a;
    const piece = F(a, b);
    return {
      prompt: `You have ${total} ${what}. Each ${group} uses ${fr(piece)} ${unit}. How many ${group}s can you make?`,
      answer: num(ans),
      hints: [`How many ${fr(1, b)}s are in ${total} ${unit}s?`, `${total} × ${b} = ${total * b} pieces of size ${fr(1, b)}. Each ${group} uses ${a} of them.`],
      steps: [`${total} wholes = ${total * b} pieces of ${fr(1, b)}`, ...(a > 1 ? [`Each ${group} uses ${a} pieces: ${total * b} ÷ ${a} = ${ans}`] : [`Each ${group} is one piece, so ${ans} ${group}s`]), `${total} ÷ ${fr(piece)} = ${ans}`],
      traps: traps(F(ans), [trap(mul(F(total), piece), `That's ${fr(piece)} of ${total} (multiplying). We want how many ${fr(piece)}s fit into ${total}.`)]),
      estimate: `Will the answer be more or less than ${total}? Each ${group} uses less than 1 ${unit}…`,
    };
  },
};

const divFractions: Skill = {
  id: "g6.ns.div-fractions",
  title: "Dividing fractions",
  topic: T,
  standards: ["NC.6.NS.1"],
  prereqs: ["g6.ns.div-groups"],
  lesson: {
    bigIdea: "To divide by a fraction, multiply by its reciprocal: {a/b} ÷ {c/d} = {a/b} × {d/c}.",
    explain: [
      "Why? Dividing by {1/3} asks how many thirds fit, and 3 thirds fit in each whole, so ÷ {1/3} is the same as × 3.",
      "Dividing by {2/3} is the same as dividing by {1/3} (× 3) and then by 2 (÷ 2). Together: × {3/2}, the reciprocal.",
      "Turn mixed numbers into improper fractions first: 1{1/2} = {3/2}.",
    ],
    tip: "Only flip the second fraction, the divisor.",
  },
  why: [
    { kind: "choice", prompt: "Why does dividing by {1/4} give the same answer as multiplying by 4?", choices: ["Each whole contains 4 quarters, so counting quarters multiplies by 4.", "Division and multiplication are the same thing.", "Because 1 ÷ 4 = 4."], correct: 0, explain: "“How many quarters fit?” is 4 per whole." },
    { kind: "written", prompt: "Explain why {3/4} ÷ {1/8} = 6.", keyIdeas: ["3/4 = 6/8", "count how many eighths fit", "6 eighths, so 6"], exemplar: "3/4 is the same as 6/8. Dividing by 1/8 asks how many eighths fit into 3/4. There are 6 eighths, so the answer is 6." },
  ],
  generate(r, lv) {
    let x = F(r.int(1, 8), r.int(2, 9));
    let y = lv === 1 ? F(r.int(2, 6)) : F(r.int(1, 7), r.int(2, 9));
    if (y.n === 0) y = F(1, 2);
    if (lv === 3) {
      x = add(F(r.int(1, 3)), F(r.int(1, 3), 4));
      y = r.chance(0.5) ? add(F(r.int(1, 2)), F(1, r.pick([2, 3]))) : F(r.int(1, 5), r.int(2, 6));
    }
    const ans = div(x, y);
    const recip = F(y.d, y.n);
    const show = (f: typeof x) => (lv === 3 ? mixed(f) : fr(f));
    return {
      prompt: `${show(x)} ÷ ${show(y)} = ?`,
      answer: num(ans, { simplest: true }),
      hints: [...(lv === 3 ? ["Change mixed numbers to improper fractions."] : []), `Keep the first fraction, change ÷ to ×, and flip the second: × ${fr(recip)}.`, `${fr(x)} × ${fr(recip)}: multiply tops and bottoms, then simplify.`],
      steps: [...(lv === 3 ? [`${show(x)} = ${fr(x)}, ${show(y)} = ${fr(y)}`] : []), `${fr(x)} ÷ ${fr(y)} = ${fr(x)} × ${fr(recip)}`, `= ${fr(x.n * recip.n, x.d * recip.d)}`, `= ${mixed(ans)}`],
      traps: traps(ans, [trap(mul(x, y), "You multiplied without flipping. Multiply by the reciprocal of the second fraction."), trap(mul(F(x.d, x.n), y), "Flip the second fraction (the divisor), not the first.")]),
    };
  },
};

const divWord: Skill = {
  id: "g6.ns.div-word",
  title: "Fraction division word problems",
  topic: T,
  standards: ["NC.6.NS.1"],
  prereqs: ["g6.ns.div-fractions"],
  lesson: {
    bigIdea: "Ask yourself what is being shared or measured out: that tells you what to divide by.",
    explain: [
      "“How many {1/3}-mile laps in 2 miles?” → 2 ÷ {1/3}. “{3/4} of a pizza shared by 3 people” → {3/4} ÷ 3.",
      "Area problems work too: a rectangle with area {3/4} square yard and width {2/3} yard has length {3/4} ÷ {2/3} = {9/8} yards.",
    ],
    tip: "Check: multiply your answer by the divisor. You should get back the starting amount.",
  },
  why: [
    { kind: "choice", prompt: "{3/4} of a pan of brownies is shared equally by 3 friends. Which expression gives each friend's share?", choices: ["{3/4} ÷ 3", "3 ÷ {3/4}", "{3/4} × 3"], correct: 0, explain: "The amount ({3/4}) is split into 3 equal shares." },
    { kind: "written", prompt: "A rectangle has area {3/4} square yard and width {2/3} yard. Explain how to find the length and how to check it.", keyIdeas: ["area = length × width", "so length = area ÷ width = 3/4 ÷ 2/3 = 9/8", "check: 9/8 × 2/3 = 3/4"], exemplar: "Area is length times width, so the length is the area divided by the width: 3/4 ÷ 2/3 = 3/4 × 3/2 = 9/8 yards. To check, 9/8 × 2/3 = 18/24 = 3/4." },
  ],
  generate(r, lv) {
    const name = r.pick(NAMES);
    const kind = lv === 1 ? r.int(0, 1) : r.int(0, 3);
    if (kind === 0) {
      const amt = F(r.int(1, 7), r.pick([2, 3, 4, 8]));
      const people = r.int(2, 5);
      const ans = div(amt, F(people));
      return {
        prompt: `${name} has ${fr(amt)} pound of fudge to share equally among ${people} friends. How many pounds does each friend get?`,
        answer: num(ans, { simplest: true }),
        hints: [`The fudge is being split into ${people} equal parts: ${fr(amt)} ÷ ${people}.`, `Dividing by ${people} is multiplying by ${fr(1, people)}.`],
        steps: [`${fr(amt)} ÷ ${people} = ${fr(amt)} × ${fr(1, people)}`, `= ${fr(ans)} pound each`],
        traps: traps(ans, [trap(mul(amt, F(people)), "Sharing makes each portion smaller, so the answer should be less than the starting amount.")]),
      };
    }
    if (kind === 1) {
      const lap = F(1, r.pick([2, 3, 4, 5, 6, 8]));
      const k = r.int(2, 5);
      const total = r.chance(0.5) ? F(k) : add(F(k), F(r.int(1, lap.d - 1 || 1), lap.d));
      const ans = div(total, lap);
      return {
        prompt: `A walking track is ${fr(lap)} mile around. How many laps does ${name} need to walk ${mixed(total)} miles?`,
        answer: num(ans),
        hints: [`How many ${fr(lap)}-mile laps fit into ${mixed(total)} miles?`, `${mixed(total)} ÷ ${fr(lap)} = ${fr(total)} × ${lap.d}.`],
        steps: [`${mixed(total)} ÷ ${fr(lap)} = ${fr(total)} × ${lap.d} = ${toNum(ans)} laps`],
        traps: traps(ans, [trap(mul(total, lap), "Each lap is less than a mile, so it takes more laps than miles. Divide by the lap length.")]),
      };
    }
    if (kind === 2) {
      const area = F(r.int(1, 5), r.pick([4, 6, 8, 3]));
      const width = F(r.int(1, 3), r.pick([3, 4, 5]));
      const ans = div(area, width);
      return {
        prompt: `A rectangular garden bed has an area of ${fr(area)} square yard. It is ${fr(width)} yard wide. How long is it, in yards?`,
        answer: num(ans, { simplest: true }),
        hints: ["Area = length × width. Which operation undoes multiplying by the width?", `Length = ${fr(area)} ÷ ${fr(width)}.`],
        steps: [`length = area ÷ width = ${fr(area)} ÷ ${fr(width)}`, `= ${fr(area)} × ${fr(width.d, width.n)} = ${mixed(ans)} yards`],
        traps: traps(ans, [trap(mul(area, width), "Area = length × width, so to find the length, divide the area by the width.")]),
      };
    }
    const cup = F(r.int(1, 3), 4);
    const servings = r.int(3, 10);
    const total = mul(cup, F(servings));
    return {
      prompt: `A recipe uses ${fr(cup)} cup of oats per batch. ${name} has ${mixed(total)} cups of oats. How many batches can ${name} make?`,
      answer: num(servings),
      hints: ["How many groups of the batch size fit into the total?", `${mixed(total)} ÷ ${fr(cup)}.`],
      steps: [`${mixed(total)} = ${fr(total)}`, `${fr(total)} ÷ ${fr(cup)} = ${fr(total)} × ${fr(cup.d, cup.n)} = ${servings} batches`],
      traps: traps(F(servings), [trap(mul(total, cup), "Each batch uses part of a cup; how many of those parts fit? Divide.")]),
    };
  },
};

function decStr(x: number) {
  return String(round(x, 6));
}

const decAddSub: Skill = {
  id: "g6.ns.dec-addsub",
  title: "Adding and subtracting decimals",
  topic: T,
  standards: ["NC.6.NS.3"],
  prereqs: ["g5.decimals"],
  lesson: {
    bigIdea: "Line up the decimal points so you add tenths to tenths and hundredths to hundredths.",
    explain: [
      "12.5 + 3.75: write 12.5 as 12.50 so both have hundredths. Then add like whole numbers and keep the decimal point in line: 16.25.",
      "For subtraction, fill in zeros so you can regroup: 7 − 2.35 = 7.00 − 2.35 = 4.65.",
    ],
    tip: "Estimate first: 12.5 + 3.75 is about 13 + 4 = 17.",
  },
  why: [
    { kind: "choice", prompt: "Why do we line up decimal points when adding?", choices: ["So digits with the same place value (tenths with tenths) are added together.", "To make the numbers look neat.", "So the last digits line up."], correct: 0, explain: "Place value: only same-size units can be combined." },
    { kind: "written", prompt: "Someone says 4.5 + 2.25 = 2.70 because they lined up the last digits. Explain the mistake and the right answer.", keyIdeas: ["the 5 is tenths and the last 5 in 2.25 is hundredths", "line up decimal points: 4.50 + 2.25", "= 6.75"], exemplar: "The 5 in 4.5 means 5 tenths, but the last 5 in 2.25 means 5 hundredths, so they can't be added together. Line up the decimal points: 4.50 + 2.25 = 6.75. That makes sense because 4 + 2 is about 6." },
  ],
  generate(r, lv) {
    const p1 = lv === 1 ? 1 : r.int(1, 2);
    const p2 = lv === 1 ? 1 : p1 === 1 ? 2 : r.int(1, 2);
    const notRound = (lo: number, hi: number) => {
      let v = r.int(lo, hi);
      while (v % 10 === 0) v = r.int(lo, hi);
      return v;
    };
    let a = notRound(10, lv === 3 ? 9999 : 999) / 10 ** p1;
    let b = notRound(10, lv === 3 ? 999 : 99) / 10 ** p2;
    if (lv === 3 && r.chance(0.5)) a = r.int(5, 40);
    const subtract = r.chance(0.5);
    if (subtract && a < b) [a, b] = [b, a];
    const ans = subtract ? round(a - b, 4) : round(a + b, 4);
    const ctx = lv === 3 ? r.pick(["money", "plain"]) : "plain";
    const op = subtract ? "−" : "+";
    const prompt = ctx === "money" && !subtract
      ? `A book costs $${a.toFixed(2)} and a bookmark costs $${b.toFixed(2)}. What is the total cost?`
      : ctx === "money"
        ? `You pay $${a.toFixed(2)} for an item that costs $${b.toFixed(2)}. How much change do you get?`
        : `${decStr(a)} ${op} ${decStr(b)} = ?`;
    return {
      prompt,
      answer: num(fromDecimal(ans), { pre: ctx === "money" ? "$" : undefined }),
      hints: ["Line up the decimal points. Add zeros so both numbers have the same number of decimal places.", `Write them as ${a.toFixed(2)} and ${b.toFixed(2)}, then ${subtract ? "subtract" : "add"} like whole numbers.`],
      steps: [`${a.toFixed(2)} ${op} ${b.toFixed(2)}`, `= ${ans.toFixed(2)}`],
      estimate: `Round each number to the nearest whole first. About how big should the answer be?`,
    };
  },
};

const decMult: Skill = {
  id: "g6.ns.dec-mult",
  title: "Multiplying decimals",
  topic: T,
  standards: ["NC.6.NS.3"],
  prereqs: ["g6.ns.dec-addsub"],
  lesson: {
    bigIdea: "Multiply as if there were no decimal points, then place the point using the total number of decimal places.",
    explain: [
      "0.4 × 0.3: 4 × 3 = 12. There are 2 decimal places in all (one in each), so the answer is 0.12. That makes sense: {4/10} × {3/10} = {12/100}.",
      "2.5 × 1.2: 25 × 12 = 300, with 2 decimal places → 3.00 = 3. Estimate: 2.5 × 1 is 2.5, a bit more is 3. ✔",
    ],
    tip: "Estimate to check where the decimal point goes.",
  },
  why: [
    { kind: "choice", prompt: "Why is 0.4 × 0.3 = 0.12 and not 1.2?", choices: ["Tenths × tenths make hundredths: {4/10} × {3/10} = {12/100}.", "Because you always move the decimal two places.", "Because 0.12 is smaller."], correct: 0, explain: "Fractions show it: tenths times tenths are hundredths." },
    { kind: "written", prompt: "Explain how you know where to put the decimal point in 1.5 × 2.4.", keyIdeas: ["15 × 24 = 360", "there are 2 decimal places total (tenths × tenths = hundredths)", "3.60 = 3.6; estimate 1.5 × 2 ≈ 3 confirms"], exemplar: "15 × 24 = 360. Each factor has one decimal place, so tenths times tenths gives hundredths: 3.60 = 3.6. Estimating, 1.5 × 2 = 3, so 3.6 makes sense." },
  ],
  generate(r, lv) {
    let a: number, b: number;
    if (lv === 1) {
      a = r.int(11, 99) / 10;
      b = r.int(2, 9);
    } else if (lv === 2) {
      a = r.int(1, 9) / 10;
      b = r.int(1, 9) / (r.chance(0.5) ? 10 : 100);
    } else {
      a = r.int(11, 99) / 10;
      b = r.int(11, 49) / 10;
    }
    const ans = round(a * b, 6);
    const places = (String(a).split(".")[1]?.length ?? 0) + (String(b).split(".")[1]?.length ?? 0);
    const whole = Math.round(a * 10 ** (String(a).split(".")[1]?.length ?? 0)) * Math.round(b * 10 ** (String(b).split(".")[1]?.length ?? 0));
    return {
      prompt: `${a} × ${b} = ?`,
      answer: num(fromDecimal(ans)),
      hints: ["Multiply the numbers as if there were no decimal points.", `Count the decimal places in both numbers together: ${places}. Put that many in your answer.`],
      steps: [`Ignore the points: ${whole}`, `${places} decimal place${places === 1 ? "" : "s"} in total`, `${a} × ${b} = ${ans}`],
      traps: traps(fromDecimal(ans), [trap(fromDecimal(round(ans * 10, 6)), "Check the number of decimal places: count the places in both factors."), trap(fromDecimal(round(ans / 10, 7)), "Too many decimal places. Count the decimal places in both factors and use exactly that many.")]),
    };
  },
};

const decDiv: Skill = {
  id: "g6.ns.dec-div",
  title: "Dividing whole numbers and decimals",
  topic: T,
  standards: ["NC.6.NS.2", "NC.6.NS.3"],
  prereqs: ["g6.ns.dec-mult"],
  lesson: {
    bigIdea: "To divide by a decimal, multiply both numbers by 10, 100… until the divisor is a whole number.",
    explain: [
      "6 ÷ 0.5 asks how many halves are in 6. Multiply both by 10: 60 ÷ 5 = 12. The answer doesn't change because both numbers were scaled by the same amount.",
      "4.8 ÷ 0.12 → multiply both by 100 → 480 ÷ 12 = 40.",
      "For long division like 1,512 ÷ 24, estimate first (1,500 ÷ 25 ≈ 60), then divide step by step.",
    ],
    tip: "Dividing by a number less than 1 gives a bigger answer.",
  },
  why: [
    { kind: "choice", prompt: "Why does 6 ÷ 0.5 give the same answer as 60 ÷ 5?", choices: ["Multiplying both numbers by 10 keeps the same ratio, so the quotient stays the same.", "Because you always multiply by 10 when dividing.", "It doesn't; the answers are different."], correct: 0, explain: "Like equivalent fractions: {6/0.5} = {60/5}." },
    { kind: "written", prompt: "Explain why 3 ÷ 0.25 = 12.", keyIdeas: ["it asks how many quarters fit in 3", "there are 4 quarters in each whole", "3 × 4 = 12 (or 300 ÷ 25)"], exemplar: "3 ÷ 0.25 asks how many 0.25s (quarters) are in 3. Each whole has 4 quarters, so 3 wholes have 12. I can also multiply both by 100: 300 ÷ 25 = 12." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const dv = r.int(12, 48);
      const q = r.int(12, 95);
      return {
        prompt: `${(q * dv).toLocaleString("en-US")} ÷ ${dv} = ?`,
        answer: num(q),
        hints: [`Estimate first: about how many ${dv}s are in ${q * dv}?`, `Try ${dv} × ${Math.floor(q / 10) * 10} = ${dv * Math.floor(q / 10) * 10} and work with what's left.`],
        steps: [`${dv} × ${Math.floor(q / 10) * 10} = ${dv * Math.floor(q / 10) * 10}`, `${q * dv} − ${dv * Math.floor(q / 10) * 10} = ${dv * (q % 10)} = ${dv} × ${q % 10}`, `${Math.floor(q / 10) * 10} + ${q % 10} = ${q}`],
      };
    }
    const divisor = lv === 2 ? r.pick([0.5, 0.2, 0.25, 0.4, 0.8, 1.5, 2.5]) : r.pick([0.12, 0.15, 0.06, 0.3, 0.7, 1.2, 0.04]);
    const q = lv === 2 ? r.int(2, 30) : r.int(3, 60);
    const dividend = round(divisor * q, 6);
    const scale = 10 ** (String(divisor).split(".")[1]?.length ?? 0);
    return {
      prompt: `${dividend} ÷ ${divisor} = ?`,
      answer: num(q),
      hints: [`Make the divisor a whole number: multiply both numbers by ${scale}.`, `${round(dividend * scale, 4)} ÷ ${round(divisor * scale, 4)} = ?`],
      steps: [`Multiply both by ${scale}: ${round(dividend * scale, 4)} ÷ ${round(divisor * scale, 4)}`, `= ${q}`, `Check: ${q} × ${divisor} = ${dividend}`],
      traps: traps(F(q), [trap(fromDecimal(round(q / 10, 6)), "Make sure you multiplied BOTH numbers by the same power of 10."), trap(fromDecimal(round(dividend * divisor, 6)), "That's multiplication. Division asks how many groups of the divisor fit.")]),
    };
  },
};

const gcfSkill: Skill = {
  id: "g6.ns.gcf",
  title: "Greatest common factor",
  topic: T,
  standards: ["NC.6.NS.4"],
  prereqs: [],
  lesson: {
    bigIdea: "The GCF is the biggest number that divides both numbers evenly.",
    explain: [
      "Factors of 18: 1, 2, 3, 6, 9, 18. Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. Common factors: 1, 2, 3, 6. The greatest is **6**.",
      "GCF helps when splitting things into equal groups with nothing left over, like making identical gift bags.",
    ],
    tip: "List factors in pairs (1×18, 2×9, 3×6) so you don't miss any.",
  },
  why: [
    { kind: "choice", prompt: "You have 18 pencils and 24 erasers and want identical kits with nothing left over. Why is the GCF the most kits you can make?", choices: ["The number of kits has to divide both 18 and 24, and the GCF is the largest number that does.", "Because the GCF is the smallest number.", "Because 18 + 24 = 42."], correct: 0, explain: "Each kit count must be a common factor; the greatest gives the most kits." },
    { kind: "written", prompt: "Explain how you would find the GCF of 36 and 48.", keyIdeas: ["list factors of each (or prime factors)", "find the common ones", "the greatest is 12"], exemplar: "I list the factors of 36 (1, 2, 3, 4, 6, 9, 12, 18, 36) and of 48 (1, 2, 3, 4, 6, 8, 12, 16, 24, 48). The biggest one they share is 12." },
  ],
  generate(r, lv) {
    const g = lv === 1 ? r.int(2, 6) : r.int(3, 15);
    let a: number, b: number;
    do {
      a = r.int(1, lv === 1 ? 6 : 8);
      b = r.int(1, lv === 1 ? 6 : 8);
    } while (a === b || gcd(a, b) !== 1);
    const [x, y] = [g * a, g * b];
    if (lv === 3) {
      return {
        prompt: `${r.pick(NAMES)} has ${x} stickers and ${y} pencils to put into identical party bags with nothing left over. What is the greatest number of bags that can be made?`,
        answer: num(g),
        hints: ["The number of bags must divide both amounts evenly.", `Find the greatest common factor of ${x} and ${y}.`],
        steps: [`Common factors of ${x} and ${y} include ${g}`, `GCF = ${g}, so ${g} bags (each with ${a} stickers and ${b} pencils)`],
        traps: traps(F(g), [trap(lcm(x, y), "That's the least common multiple. Splitting into equal groups uses the greatest common FACTOR.")]),
      };
    }
    return {
      prompt: `What is the greatest common factor of ${x} and ${y}?`,
      answer: num(g),
      hints: [`List the factors of ${Math.min(x, y)}. Which of them also divide ${Math.max(x, y)}?`, `Check from the largest factor down.`],
      steps: [`${x} = ${g} × ${a}`, `${y} = ${g} × ${b}`, `${a} and ${b} share no common factor, so the GCF is ${g}`],
      traps: traps(F(g), [trap(lcm(x, y), "That's a common multiple. The GCF is a factor, so it can't be bigger than either number."), trap(Math.min(x, y), `${Math.min(x, y)} doesn't divide ${Math.max(x, y)} evenly.`)]),
    };
  },
};

const lcmSkill: Skill = {
  id: "g6.ns.lcm",
  title: "Least common multiple",
  topic: T,
  standards: ["NC.6.NS.4"],
  prereqs: [],
  lesson: {
    bigIdea: "The LCM is the smallest number that is a multiple of both numbers.",
    explain: [
      "Multiples of 6: 6, 12, 18, **24**, 30… Multiples of 8: 8, 16, **24**, 32… The LCM of 6 and 8 is 24.",
      "Use the LCM when things repeat on different cycles, like hot dogs sold in 10s and buns sold in 8s, or two lights blinking every 4 and every 6 seconds.",
    ],
    tip: "List multiples of the bigger number and check each one against the smaller number.",
  },
  why: [
    { kind: "choice", prompt: "Hot dogs come in packs of 10 and buns in packs of 8. Why does the LCM tell you the fewest of each to buy so they match?", choices: ["The total must be a multiple of both 10 and 8, and the LCM is the smallest such number.", "Because 10 × 8 is always the answer.", "Because the LCM is a factor of both."], correct: 0, explain: "Matching totals means a common multiple; the least one means the fewest packs." },
    { kind: "written", prompt: "Explain the difference between the GCF and the LCM of 4 and 6.", keyIdeas: ["GCF 2 is the biggest number that divides both", "LCM 12 is the smallest number both divide into", "factors vs multiples"], exemplar: "The GCF is the biggest factor they share: 2 divides both 4 and 6. The LCM is the smallest multiple they share: 12 is in both lists of multiples. GCF is about factors and LCM is about multiples." },
  ],
  generate(r, lv) {
    let a: number, b: number;
    do {
      a = r.int(2, lv === 1 ? 9 : 12);
      b = r.int(2, lv === 1 ? 9 : 15);
    } while (a === b || a % b === 0 || b % a === 0);
    const L = lcm(a, b);
    if (lv === 3) {
      return {
        prompt: `Hot dogs come in packs of ${a} and buns come in packs of ${b}. What is the smallest number of hot dogs you can buy so you have exactly the same number of buns?`,
        answer: num(L),
        hints: ["The number must be a multiple of both pack sizes.", `List multiples of ${Math.max(a, b)} and find the first one that ${Math.min(a, b)} divides.`],
        steps: [`Multiples of ${Math.max(a, b)}: ${Array.from({ length: L / Math.max(a, b) }, (_, k) => (k + 1) * Math.max(a, b)).join(", ")}`, `LCM(${a}, ${b}) = ${L}`],
        traps: traps(F(L), [trap(gcd(a, b), "That's a common factor. We need a number both pack sizes go into: a common multiple.")]),
      };
    }
    return {
      prompt: `What is the least common multiple of ${a} and ${b}?`,
      answer: num(L),
      hints: [`List multiples of ${Math.max(a, b)}: ${Math.max(a, b)}, ${2 * Math.max(a, b)}, ${3 * Math.max(a, b)}, …`, `Which is the first one that ${Math.min(a, b)} divides evenly?`],
      steps: [`Multiples of ${Math.max(a, b)}: ${Array.from({ length: L / Math.max(a, b) }, (_, k) => (k + 1) * Math.max(a, b)).join(", ")}`, `${L} is the first that is also a multiple of ${Math.min(a, b)}`],
      traps: traps(F(L), [trap(gcd(a, b), "That's the greatest common factor. The LCM is a multiple, so it's at least as big as both numbers."), trap(a * b, `${a * b} is a common multiple, but not the least one. Look for a smaller one.`)]),
    };
  },
};

const distributive: Skill = {
  id: "g6.ns.distributive",
  title: "Factor out the GCF",
  topic: T,
  standards: ["NC.6.NS.4"],
  prereqs: ["g6.ns.gcf"],
  lesson: {
    bigIdea: "A sum like 36 + 8 can be rewritten as 4 × (9 + 2) by pulling out the GCF.",
    explain: [
      "36 = 4 × 9 and 8 = 4 × 2. Both have a 4, so 36 + 8 = 4 × 9 + 4 × 2 = **4(9 + 2)**.",
      "This is the distributive property used backwards. Check: 4(9 + 2) = 4 × 11 = 44 = 36 + 8. ✔",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does 4(9 + 2) equal 36 + 8?", choices: ["4 groups of (9 + 2) is 4 groups of 9 plus 4 groups of 2.", "Because 4 + 9 + 2 = 15.", "It only works for even numbers."], correct: 0, explain: "That's the distributive property." },
    { kind: "written", prompt: "Explain how to write 24 + 40 as a product using the GCF.", keyIdeas: ["GCF of 24 and 40 is 8", "24 = 8 × 3 and 40 = 8 × 5", "24 + 40 = 8(3 + 5)"], exemplar: "The GCF of 24 and 40 is 8. 24 is 8 × 3 and 40 is 8 × 5, so 24 + 40 = 8(3 + 5). Check: 8 × 8 = 64 = 24 + 40." },
  ],
  generate(r, lv) {
    const g = r.int(2, lv === 1 ? 6 : 12);
    let a: number, b: number;
    do {
      a = r.int(1, 9);
      b = r.int(1, 9);
    } while (a === b || gcd(a, b) !== 1);
    return {
      prompt: `Use the GCF to rewrite ${g * a} + ${g * b} as a product.`,
      answer: { kind: "multi", fields: [{ value: F(g) }, { value: F(a), pre: "(" }, { value: F(b), pre: "+", post: ")" }], anyOrder: [1, 2] },
      hints: [`Find the GCF of ${g * a} and ${g * b}.`, `GCF = ${g}. How many ${g}s are in each number?`],
      steps: [`GCF of ${g * a} and ${g * b} is ${g}`, `${g * a} = ${g} × ${a}, ${g * b} = ${g} × ${b}`, `${g * a} + ${g * b} = ${g}(${a} + ${b})`],
    };
  },
};

const negatives: Skill = {
  id: "g6.ns.negatives",
  title: "Negative numbers in the real world",
  topic: T,
  standards: ["NC.6.NS.5", "NC.6.NS.6"],
  prereqs: [],
  lesson: {
    bigIdea: "Negative numbers are on the opposite side of 0: below zero, below sea level, money owed.",
    explain: [
      "−5 and 5 are **opposites**: the same distance from 0 on opposite sides. The opposite of the opposite is the number itself: −(−5) = 5.",
      "Temperatures below zero, debts, losses and depths below sea level are all negative.",
    ],
    visual: { type: "numberline", min: -6, max: 6, step: 1, points: [{ v: -5, label: "−5" }, { v: 5, label: "5" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is −(−3) equal to 3?", choices: ["−3 is 3 steps left of 0; its opposite is 3 steps right.", "Because two negatives are always positive no matter what.", "It equals −3."], correct: 0, explain: "“Opposite of” flips to the other side of 0." },
    { kind: "written", prompt: "Explain what 0 means in a bank account and what −20 would mean.", keyIdeas: ["0 means no money and no debt", "−20 means you owe $20", "it is 20 below zero"], exemplar: "0 means the account is empty but you don't owe anything. −20 means you owe $20, which is 20 dollars below zero." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const ctx = r.pick([
        ["A diver is 30 feet below sea level.", -30],
        ["The temperature is 8 degrees below zero.", -8],
        ["You owe your sister $12.", -12],
        ["A football team loses 6 yards.", -6],
        ["An elevator goes up 9 floors.", 9],
        ["You deposit $25 in a bank account.", 25],
      ] as [string, number][]);
      return {
        prompt: `${ctx[0]} Write this as a positive or negative number.`,
        answer: num(ctx[1]),
        hints: ["Is this above/more than zero, or below/less than zero?", "Below, owe, lose, down → negative."],
        steps: [`${ctx[1] < 0 ? "Below zero / a loss" : "Above zero / a gain"} → ${ms(ctx[1])}`],
        traps: traps(F(ctx[1]), [trap(-ctx[1], "Check the direction: is it a gain or a loss?")]),
      };
    }
    if (lv === 2) {
      const v = r.nonzero(-9, 9);
      return {
        prompt: `What is the opposite of the opposite of ${ms(v)}? That is, −(−(${ms(v)}))`,
        answer: num(v),
        hints: ["Each “opposite” flips the number to the other side of 0.", "Flipping twice puts you back where you started."],
        steps: [`Opposite of ${ms(v)} is ${ms(-v)}`, `Opposite of ${ms(-v)} is ${ms(v)}`],
      };
    }
    const lo = r.int(-10, -2);
    const step = r.pick([1, 2, 0.5]);
    const k = r.int(1, 8);
    const v = lo + k * step;
    return {
      prompt: `On this number line, what number is the dot at?`,
      visual: { type: "numberline", min: lo, max: lo + 10 * step, step, labelEvery: 2, points: [{ v }] },
      answer: num(fromDecimal(v)),
      hints: [`Each tick mark is ${step}.`, `Count ticks from a labeled number.`],
      steps: [`Ticks are ${step} apart`, `The dot is ${k} ticks right of ${ms(lo)}: ${ms(lo)} + ${round(k * step, 2)} = ${ms(v)}`],
    };
  },
};

const compare: Skill = {
  id: "g6.ns.compare",
  title: "Comparing and ordering numbers",
  topic: T,
  standards: ["NC.6.NS.7"],
  prereqs: ["g6.ns.negatives"],
  lesson: {
    bigIdea: "On a number line, numbers get larger as you move right. So −2 > −7, even though 7 > 2.",
    explain: [
      "−7 is further left (colder, deeper, more owed) than −2, so −7 < −2.",
      "To compare fractions and decimals, write them in the same form: {3/4} = 0.75 > 0.7.",
    ],
    visual: { type: "numberline", min: -8, max: 2, step: 1, points: [{ v: -7, label: "−7" }, { v: -2, label: "−2" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is −8 less than −3?", choices: ["−8 is further left on the number line (like 8° below zero is colder than 3° below).", "Because 8 is bigger than 3.", "They're equal because both are negative."], correct: 0, explain: "Left on the number line means less." },
    { kind: "written", prompt: "Explain how you'd put −1.5, {1/2}, −2 and 0 in order from least to greatest.", keyIdeas: ["place them on a number line", "the most negative is least: −2", "order −2, −1.5, 0, 1/2"], exemplar: "On a number line, −2 is furthest left, then −1.5, then 0, then 1/2 on the right. So the order is −2, −1.5, 0, 1/2." },
  ],
  generate(r, lv) {
    const n = lv === 1 ? 3 : 4;
    const vals = new Set<number>();
    while (vals.size < n) {
      const v = lv === 1 ? r.int(-12, 12) : lv === 2 ? r.int(-30, 30) / 2 : r.pick([-0.75, -1.25, -0.5, 0.25, -2.5, 1.5, -1, 0.6, -0.6, -3, 2]);
      vals.add(v);
    }
    const list = [...vals];
    const askLeast = r.chance(0.5);
    const target = askLeast ? Math.min(...list) : Math.max(...list);
    const label = (v: number) => (lv === 3 && v === -0.75 ? "−{3/4}" : lv === 3 && v === 0.25 ? "{1/4}" : lv === 3 && v === -1.25 ? "−1{1/4}" : ms(v));
    const nearZero = list.reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a));
    return {
      prompt: `Which number is the ${askLeast ? "least" : "greatest"}?`,
      answer: choice(r, label(target), list.filter((v) => v !== target).map((v) => [label(v), v < 0 && Math.abs(v) > Math.abs(target) ? "Careful: for negative numbers, a bigger distance from 0 means smaller." : v === nearZero && askLeast ? "Numbers close to 0 aren't always the smallest. Picture a number line." : undefined] as [string, string])),
      hints: ["Picture a number line: smaller numbers are on the left.", "For negatives, the one with the larger distance from 0 is smaller."],
      steps: [`Order from least to greatest: ${[...list].sort((a, b) => a - b).map(label).join(", ")}`],
    };
  },
};

const absolute: Skill = {
  id: "g6.ns.abs",
  title: "Absolute value",
  topic: T,
  standards: ["NC.6.NS.7"],
  prereqs: ["g6.ns.negatives"],
  lesson: {
    bigIdea: "Absolute value is distance from 0, so it's never negative: |−6| = 6 and |6| = 6.",
    explain: [
      "A debt of $30 is written −30, and its absolute value, 30, is the size of the debt.",
      "Careful: an account balance less than −30 means a debt *greater* than $30.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is |−9| = 9?", choices: ["−9 is 9 steps away from 0, and absolute value measures distance.", "Absolute value removes the minus sign as a rule with no reason.", "It is −9."], correct: 0, explain: "Distance is never negative." },
    { kind: "written", prompt: "Explain why a balance of −$50 is less than a balance of −$20 even though |−50| > |−20|.", keyIdeas: ["−50 is further left on the number line", "absolute value is the size of the debt", "owing $50 is a bigger debt so the balance is lower"], exemplar: "−50 is further left on the number line than −20, so it's less. The absolute value 50 tells how big the debt is: owing $50 is a bigger debt, which means a lower balance." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const v = r.nonzero(-40, 40);
      return {
        prompt: `What is |${ms(v)}|?`,
        answer: num(Math.abs(v)),
        hints: ["Absolute value means distance from 0.", `How many steps is ${ms(v)} from 0?`],
        steps: [`${ms(v)} is ${Math.abs(v)} units from 0, so |${ms(v)}| = ${Math.abs(v)}`],
        traps: traps(F(Math.abs(v)), [trap(-Math.abs(v), "Absolute value is a distance, so it can't be negative.")]),
      };
    }
    if (lv === 2) {
      const a = r.nonzero(-20, 20);
      const b = r.nonzero(-20, 20);
      const op = r.pick(["+", "−"]);
      const ans = op === "+" ? Math.abs(a) + Math.abs(b) : Math.abs(a) - Math.abs(b);
      return {
        prompt: `|${ms(a)}| ${op} |${ms(b)}| = ?`,
        answer: num(ans),
        hints: ["Find each absolute value first.", `|${ms(a)}| = ${Math.abs(a)} and |${ms(b)}| = ${Math.abs(b)}.`],
        steps: [`|${ms(a)}| = ${Math.abs(a)}, |${ms(b)}| = ${Math.abs(b)}`, `${Math.abs(a)} ${op} ${Math.abs(b)} = ${ms(ans)}`],
      };
    }
    const debt = r.int(15, 80);
    const balances = r.shuffle([-debt - r.int(5, 20), -debt + r.int(5, 14), r.int(1, 30), -r.int(1, 10)]);
    const correct = balances.find((b) => b < -debt)!;
    return {
      prompt: `Which account balance shows a debt of more than $${debt}?`,
      answer: choice(r, `${ms(correct)} dollars`, balances.filter((b) => b !== correct).map((b) => [`${ms(b)} dollars`, b < 0 ? `|${ms(b)}| = ${-b}, which is less than ${debt}.` : "A positive balance means no debt."] as [string, string])),
      hints: ["A debt is a negative balance. The size of the debt is the absolute value.", `Look for a balance less than −${debt}.`],
      steps: [`Debt more than $${debt} → balance less than −${debt}`, `${ms(correct)} < −${debt} ✔`],
    };
  },
};

const coords: Skill = {
  id: "g6.ns.coords",
  title: "The coordinate plane",
  topic: T,
  standards: ["NC.6.NS.6", "NC.6.NS.8"],
  prereqs: ["g6.ns.negatives"],
  lesson: {
    bigIdea: "A point (x, y) means: go x left/right from the origin, then y up/down.",
    explain: [
      "(3, −2): right 3, down 2. The x-coordinate always comes first.",
      "Reflecting across the x-axis flips the sign of y; across the y-axis flips the sign of x.",
      "Two points with the same x (or y) are on a vertical (or horizontal) line, so the distance is the difference of the other coordinates, e.g. (2, 5) to (2, −3) is 5 − (−3) = 8.",
    ],
    visual: { type: "grid", min: -5, max: 5, points: [{ x: 3, y: -2, label: "(3, −2)" }, { x: -4, y: 1, label: "(−4, 1)" }] },
    tip: "x comes before y, just like it does in the alphabet.",
  },
  why: [
    { kind: "choice", prompt: "Why is the distance from (2, 5) to (2, −3) equal to 8?", choices: ["It's 5 units up from the x-axis to (2, 5) and 3 units down to (2, −3): 5 + 3 = 8.", "Because 5 − 3 = 2.", "Because 2 + 5 + 3 = 10 minus 2."], correct: 0, explain: "The points are on opposite sides of the x-axis, so add the distances." },
    { kind: "written", prompt: "Explain what happens to the point (4, 3) when you reflect it across the x-axis, and why.", keyIdeas: ["it becomes (4, −3)", "x stays the same", "it's the same distance from the axis on the other side, so y changes sign"], exemplar: "It moves to (4, −3). Reflecting over the x-axis flips the point to the other side of the axis at the same distance, so x stays 4 and y goes from 3 to −3." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const x = r.nonzero(-6, 6);
      const y = r.nonzero(-6, 6);
      return {
        prompt: `Click to plot the point (${ms(x)}, ${ms(y)}).`,
        answer: { kind: "point", x, y, min: -7, max: 7 },
        hints: ["Start at the origin (0, 0). The first number moves you left or right.", `Go ${x > 0 ? "right" : "left"} ${Math.abs(x)}, then ${y > 0 ? "up" : "down"} ${Math.abs(y)}.`],
        steps: [`From (0, 0): ${x > 0 ? "right" : "left"} ${Math.abs(x)}, ${y > 0 ? "up" : "down"} ${Math.abs(y)}`],
      };
    }
    if (lv === 2) {
      const x = r.nonzero(-6, 6);
      const y = r.nonzero(-6, 6);
      const axis = r.pick(["x", "y"]);
      const [rx, ry] = axis === "x" ? [x, -y] : [-x, y];
      return {
        prompt: `Point A is at (${ms(x)}, ${ms(y)}). Reflect it across the ${axis}-axis and click where it lands.`,
        answer: { kind: "point", x: rx, y: ry, min: -7, max: 7, extraPoints: [{ x, y, label: "A" }] },
        hints: [`Reflecting across the ${axis}-axis keeps the ${axis === "x" ? "x" : "y"}-coordinate the same.`, `The ${axis === "x" ? "y" : "x"}-coordinate changes sign.`],
        steps: [`Across the ${axis}-axis: (${ms(x)}, ${ms(y)}) → (${ms(rx)}, ${ms(ry)})`],
      };
    }
    const sameX = r.chance(0.5);
    const c = r.nonzero(-6, 6);
    const p = r.int(-8, 8);
    let q = r.int(-8, 8);
    while (q === p) q = r.int(-8, 8);
    const [A, B] = sameX ? [[c, p], [c, q]] : [[p, c], [q, c]];
    const d = Math.abs(p - q);
    return {
      prompt: `How far apart are (${ms(A[0])}, ${ms(A[1])}) and (${ms(B[0])}, ${ms(B[1])})?`,
      visual: { type: "grid", min: -9, max: 9, points: [{ x: A[0], y: A[1] }, { x: B[0], y: B[1] }] },
      answer: num(d),
      hints: [`The ${sameX ? "x" : "y"}-coordinates match, so the points line up ${sameX ? "vertically" : "horizontally"}.`, `Find the distance between ${ms(p)} and ${ms(q)} on a number line.`],
      steps: [`Distance = |${ms(p)} − ${sn(q)}| = ${d}`],
      traps: traps(F(d), [trap(Math.abs(Math.abs(p) - Math.abs(q)), "When the points are on opposite sides of an axis, add the distances to the axis.")]),
    };
  },
};

export default [divVisual, divFractions, divWord, decAddSub, decMult, decDiv, gcfSkill, lcmSkill, distributive, negatives, compare, absolute, coords];



