import { frac, fromDecimal } from "../../lib/rational";
import { F, choice, median, num, round, sum, trap, traps } from "../helpers";
import type { Rng } from "../../lib/rng";
import type { Skill } from "../types";
import { st } from "../steps";

const T = "g6-sp";

/** Explains how the median of a sorted list is found. */
function midText(xs: number[]): string {
  const h = Math.floor(xs.length / 2);
  return xs.length % 2 ? `The middle value is ${xs[h]}.` : `The middle two are ${xs[h - 1]} and ${xs[h]}, so (${xs[h - 1]} + ${xs[h]}) ÷ 2 = ${median(xs)}.`;
}

function dataSet(r: Rng, n: number, lo: number, hi: number): number[] {
  return Array.from({ length: n }, () => r.int(lo, hi));
}

/** Quartiles using the usual middle-school method (exclude the median for odd counts). */
export function quartiles(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  const half = Math.floor(s.length / 2);
  const lower = s.slice(0, half);
  const upper = s.slice(s.length % 2 ? half + 1 : half);
  return { q1: median(lower), med: median(s), q3: median(upper), sorted: s };
}

const questions: Skill = {
  id: "g6.sp.questions",
  title: "Statistical questions",
  topic: T,
  standards: ["NC.6.SP.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A statistical question expects answers that vary, so you need data to answer it.",
    explain: [
      "“How old am I?” has one answer, so it's not statistical. “How old are the students in my school?” has many different answers, so it's statistical.",
      "Statistical questions lead to data you can graph and summarize.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is “How many minutes do sixth graders read each night?” a statistical question?", choices: ["Different students read different amounts, so you'd collect data with variability.", "Because it has a number in the answer.", "It isn't statistical."], correct: 0, explain: "Variability in the answers is the key." },
    { kind: "written", prompt: "Explain why “How tall is the classroom door?” is not a statistical question, and change it into one that is.", keyIdeas: ["it has one answer (no variability)", "a statistical version expects many different answers", "e.g. how tall are the doors in our school / how tall are students"], exemplar: "The door has one height, so there's no variability. A statistical question would be “How tall are the students in our class?” because the answers will vary." },
  ],
  generate(r) {
    const stat = ["How many hours of sleep do students in my class get on school nights?", "What are the favorite sports of sixth graders at our school?", "How much do the dogs at the shelter weigh?", "How many books did each student read this summer?", "How long does it take students to get to school?", "What are the daily high temperatures in our town in May?"];
    const non = ["How many hours did I sleep last night?", "What is the capital of North Carolina?", "How much does my dog weigh?", "How many students are in Ms. Lee's class right now?", "What time does school start?", "How tall is the flagpole?"];
    const askStat = r.chance(0.6);
    const right = askStat ? r.pick(stat) : r.pick(non);
    const others = r.shuffle(askStat ? non : stat).slice(0, 3);
    return {
      prompt: askStat ? "Which is a statistical question?" : "Which is NOT a statistical question?",
      answer: choice(r, right, others.map((o) => [o, askStat ? "This has just one answer, so there's no variability." : "This one expects many different answers, so it IS statistical."] as [string, string])),
      hints: [
        "For each choice, imagine asking it many times, to different people or about different things. Would the answers all match, or vary?",
        askStat
          ? "Find the choice where the answers would VARY. Words like “students in my class” or “dogs at the shelter” mean many answers."
          : "Find the choice with just ONE answer. Words like “I”, “my dog” or “right now” usually point to a single answer.",
      ],
      steps: [
        st("Ask yourself: would you expect different answers?", "A statistical question needs data from many people or things, and the answers vary."),
        st("Check the answer choice.", `“${right}” ${askStat ? "would get many different answers, so it IS statistical." : "has just one answer, so it is NOT statistical."}`),
      ],
    };
  },
};

const center: Skill = {
  id: "g6.sp.center",
  title: "Mean, median and mode",
  topic: T,
  standards: ["NC.6.SP.3", "NC.6.SP.5"],
  prereqs: ["g6.ns.dec-div"],
  lesson: {
    bigIdea: "Mean, median and mode each describe a “typical” value.",
    explain: [
      "**Mean:** add all the values, divide by how many. It's the “fair share” if everything were evened out.",
      "**Median:** the middle value when the data is in order. With an even count, average the two middle values.",
      "**Mode:** the value that appears most often.",
    ],
    visual: { type: "dotplot", values: [2, 3, 3, 4, 4, 4, 5, 6, 9], min: 0, max: 10, label: "books read" },
  },
  why: [
    { kind: "choice", prompt: "Why is the mean called the “fair share”?", choices: ["If everyone pooled their values and split them equally, each would get the mean.", "Because it's always the middle number.", "Because it appears most often."], correct: 0, explain: "Total ÷ count = equal shares." },
    { kind: "written", prompt: "Explain how to find the median of 7, 2, 9, 4, 10, 3.", keyIdeas: ["put the values in order: 2, 3, 4, 7, 9, 10", "there are 6 values so there are two middle values: 4 and 7", "median = (4 + 7) ÷ 2 = 5.5"], exemplar: "First I put them in order: 2, 3, 4, 7, 9, 10. There are 6 numbers, so the middle is between 4 and 7. Their average is 5.5, so the median is 5.5." },
  ],
  generate(r, lv) {
    const n = lv === 1 ? r.pick([5, 7]) : r.int(5, 8);
    if (lv === 3) {
      const target = r.int(5, 15);
      const known = dataSet(r, 4, Math.max(1, target - 6), target + 6);
      const missing = target * 5 - sum(known);
      if (missing < 0 || missing > 40) {
        return { prompt: "Four quiz scores are 8, 6, 9 and 7. What fifth score would make the mean exactly 8?", answer: num(10), hints: ["Work with totals. If 5 scores have a mean of 8, they must add up to 5 × 8 = 40.", "The four scores you have add to 8 + 6 + 9 + 7 = 30. How much more do you need to reach 40?"], steps: [st("Mean × number of values = total.", "For a mean of 8 with 5 scores, the total must be 8 × 5 = 40."), st("Add the four scores you have.", "8 + 6 + 9 + 7 = 30"), st("Find the missing score.", "40 − 30 = 10"), st("Check.", "(30 + 10) ÷ 5 = 8 ✔")] };
      }
      return {
        prompt: `Four values are ${known.join(", ")}. What fifth value would make the mean exactly ${target}?`,
        answer: num(missing),
        hints: [
          `Work with totals. If 5 values have a mean of ${target}, they must add up to 5 × ${target} = ${5 * target}.`,
          `The four values you have add to ${sum(known)}. How much more do you need to reach ${5 * target}?`,
        ],
        steps: [
          st("Mean × number of values = total.", `For a mean of ${target} with 5 values, the 5 values must add up to ${target} × 5 = ${5 * target}.`),
          st("Add the four values you have.", `${known.join(" + ")} = ${sum(known)}`),
          st("Find the missing value.", `${5 * target} − ${sum(known)} = ${missing}`),
          st("Check.", `(${sum(known)} + ${missing}) ÷ 5 = ${5 * target} ÷ 5 = ${target} ✔`),
        ],
        traps: traps(F(missing), [trap(target, "The new value has to balance out the others: find the total needed first.")]),
      };
    }
    const data = dataSet(r, n, 1, 20);
    const which = lv === 1 ? r.pick(["median", "mode", "mean"]) : r.pick(["median", "mean"]);
    if (which === "mode") {
      const m = r.pick(data);
      data.push(m, m);
      const counts = new Map<number, number>();
      data.forEach((d) => counts.set(d, (counts.get(d) ?? 0) + 1));
      const max = Math.max(...counts.values());
      const modes = [...counts].filter(([, c]) => c === max).map(([v]) => v);
      if (modes.length > 1) data.push(m);
      const shuffled = r.shuffle(data);
      return {
        prompt: `Find the mode: ${shuffled.join(", ")}`,
        answer: num(m),
        hints: ["The mode is the value that shows up the most times.", "Put the values in order so repeats sit next to each other, then count each group of repeats."],
        steps: [
          st("Put the values in order so repeats sit together.", [...data].sort((a, b) => a - b).join(", ")),
          st("Count the repeats.", [...new Set(data)].filter((v) => data.filter((x) => x === v).length > 1).map((v) => `${v} appears ${data.filter((x) => x === v).length} times`).join("; ")),
          st("Answer.", `The mode is ${m}, the value that appears most often.`),
        ],
      };
    }
    if (which === "mean") {
      const total = sum(data);
      const adj = (n - (total % n)) % n;
      data[0] += adj;
      const mean = sum(data) / n;
      return {
        prompt: `Find the mean: ${data.join(", ")}`,
        visual: lv === 1 ? { type: "dotplot", values: data, min: 0, max: Math.max(...data) + 2 } : undefined,
        answer: num(mean),
        hints: [
          `The mean is the “fair share”: add up all ${n} values, then split the total equally ${n} ways.`,
          `The values add up to ${sum(data)}. Now divide by ${n}: ${sum(data)} ÷ ${n} = ?`,
        ],
        steps: [
          st("Add all the values.", `${data.join(" + ")} = ${sum(data)}`),
          st("Count the values.", `There are ${n} values.`),
          st("Divide the total by the count.", `${sum(data)} ÷ ${n} = ${mean}`),
          st("Check that it makes sense.", `${mean} is between the smallest value (${Math.min(...data)}) and the largest (${Math.max(...data)}) ✔`),
        ],
        traps: traps(F(mean), [trap(median(data), "That's the median (middle value). The mean adds and divides."), trap(sum(data), "Now divide the total by the number of values.")]),
      };
    }
    const med = median(data);
    return {
      prompt: `Find the median: ${data.join(", ")}`,
      answer: num(fromDecimal(med)),
      hints: [
        "The median is the middle value. First put the values in order from least to greatest.",
        n % 2
          ? `There are ${n} values, so the middle one is value number ${(n + 1) / 2} (${(n - 1) / 2} on each side of it).`
          : `There are ${n} values (even), so there are two middle ones: values number ${n / 2} and ${n / 2 + 1}. Find the number halfway between them.`,
      ],
      steps: (() => {
        const so = [...data].sort((a, b) => a - b);
        return [
          st("Put the values in order.", so.join(", ")),
          n % 2
            ? st("Find the middle value.", `There are ${n} values (an odd number), so the middle is value number ${(n + 1) / 2}: ${med}.`)
            : st("Find the middle two values.", `There are ${n} values (an even number), so the middle is between value ${n / 2} and value ${n / 2 + 1}: ${so[n / 2 - 1]} and ${so[n / 2]}.`),
          ...(n % 2 ? [] : [st("Find the number halfway between them.", `(${so[n / 2 - 1]} + ${so[n / 2]}) ÷ 2 = ${so[n / 2 - 1] + so[n / 2]} ÷ 2 = ${med}`)]),
          st("Answer.", `The median is ${med}.`),
        ];
      })(),
      traps: traps(fromDecimal(med), [trap(fromDecimal(n % 2 ? data[Math.floor(n / 2)] : (data[n / 2 - 1] + data[n / 2]) / 2), "Put the numbers in order before finding the middle.")]),
    };
  },
};

const spread: Skill = {
  id: "g6.sp.spread",
  title: "Range, quartiles and box plots",
  topic: T,
  standards: ["NC.6.SP.4", "NC.6.SP.5"],
  prereqs: ["g6.sp.center"],
  lesson: {
    bigIdea: "Spread tells how much the data varies. The range and the interquartile range (IQR) measure it.",
    explain: [
      "**Range** = max − min.",
      "**Quartiles** split ordered data into four parts. Q1 is the median of the lower half, Q3 the median of the upper half.",
      "**IQR** = Q3 − Q1: the spread of the middle half of the data. A box plot shows min, Q1, median, Q3, max.",
    ],
    visual: { type: "boxplot", min: 2, q1: 4, median: 7, q3: 9, max: 14, scaleMin: 0, scaleMax: 15 },
  },
  why: [
    { kind: "choice", prompt: "Why might the IQR describe spread better than the range?", choices: ["The IQR uses the middle half, so one extreme value doesn't change it much.", "The IQR is always bigger.", "The range can't be calculated."], correct: 0, explain: "Outliers stretch the range but barely affect the IQR." },
    { kind: "written", prompt: "Explain what the box in a box plot shows.", keyIdeas: ["the box goes from Q1 to Q3", "it contains the middle half (50%) of the data", "the line inside is the median; the box length is the IQR"], exemplar: "The box stretches from the first quartile to the third quartile, so it holds the middle half of the data. The line inside the box is the median, and the length of the box is the IQR." },
  ],
  generate(r, lv) {
    const n = lv === 3 ? r.pick([8, 9, 10, 11]) : r.pick([7, 8, 9]);
    const data = dataSet(r, n, 2, 40);
    const { q1, q3, sorted } = quartiles(data);
    if (lv === 1) {
      const rg = Math.max(...data) - Math.min(...data);
      return {
        prompt: `Find the range: ${data.join(", ")}`,
        answer: num(rg),
        hints: ["The range shows how spread out the data is: greatest value − least value.", `The greatest value is ${Math.max(...data)} and the least is ${Math.min(...data)}. Subtract.`],
        steps: [
          st("Find the greatest and least values.", `Greatest: ${Math.max(...data)}. Least: ${Math.min(...data)}.`),
          st("Subtract.", `Range = greatest − least = ${Math.max(...data)} − ${Math.min(...data)} = ${rg}`),
        ],
      };
    }
    if (lv === 2) {
      const b = { min: r.int(0, 5), q1: 0, median: 0, q3: 0, max: 0 };
      b.q1 = b.min + r.int(2, 6);
      b.median = b.q1 + r.int(1, 6);
      b.q3 = b.median + r.int(1, 6);
      b.max = b.q3 + r.int(2, 8);
      const ask = r.pick(["IQR", "median", "range"]);
      const ans = ask === "IQR" ? b.q3 - b.q1 : ask === "median" ? b.median : b.max - b.min;
      return {
        prompt: `Use the box plot. What is the ${ask}?`,
        visual: { type: "boxplot", ...b, scaleMin: 0, scaleMax: b.max + 2 },
        answer: num(ans),
        hints: [
          "A box plot shows five numbers, left to right: min (whisker end), Q1 (box's left edge), median (line inside the box), Q3 (box's right edge), max (whisker end).",
          ask === "IQR" ? "IQR = Q3 − Q1, the length of the box. Read both edges of the box and subtract." : ask === "median" ? "The median is the line inside the box. Read where it sits on the number line." : "Range = max − min. Read both whisker ends and subtract.",
        ],
        steps: [
          st("Read the five numbers from the box plot.", `Left whisker end (min) ${b.min}, left edge of the box (Q1) ${b.q1}, line in the box (median) ${b.median}, right edge of the box (Q3) ${b.q3}, right whisker end (max) ${b.max}.`),
          ask === "IQR" ? st("IQR = Q3 − Q1 (the length of the box).", `${b.q3} − ${b.q1} = ${ans}`) : ask === "median" ? st("The median is the line inside the box.", `${ans}`) : st("Range = max − min (whisker end to whisker end).", `${b.max} − ${b.min} = ${ans}`),
        ],
        traps: traps(F(ans), [trap(b.max - b.min, "That's the range. The IQR is just the box: Q3 − Q1."), trap(b.q3 - b.q1, "That's the IQR (length of the box).")]),
      };
    }
    const iqr = q3 - q1;
    return {
      prompt: `Find the interquartile range (IQR): ${data.join(", ")}`,
      answer: num(fromDecimal(iqr)),
      hints: (() => {
        const half = Math.floor(n / 2);
        const lower = sorted.slice(0, half), upper = sorted.slice(n % 2 ? half + 1 : half);
        return [
          "IQR = Q3 − Q1. Put the values in order, then split them into a lower half and an upper half.",
          n % 2
            ? `There are ${n} values. The median, ${sorted[half]}, is the middle one: leave it out. Lower half: ${lower.join(", ")}. Upper half: ${upper.join(", ")}.`
            : `There are ${n} values, so each half gets ${half}. Lower half: ${lower.join(", ")}. Upper half: ${upper.join(", ")}.`,
          "Q1 is the middle of the lower half and Q3 is the middle of the upper half. Then subtract Q3 − Q1.",
        ];
      })(),
      steps: (() => {
        const half = Math.floor(n / 2);
        const lower = sorted.slice(0, half), upper = sorted.slice(n % 2 ? half + 1 : half);
        return [
          st("Put the values in order.", sorted.join(", ")),
          st("Find the median and split the data in half.", n % 2 ? `There are ${n} values; the median is the middle one, ${sorted[half]}. Leave it out of both halves.` : `There are ${n} values, so split them into two halves of ${half}.`),
          st("Q1 is the median of the lower half.", `Lower half: ${lower.join(", ")}. ${midText(lower)} Q1 = ${q1}.`),
          st("Q3 is the median of the upper half.", `Upper half: ${upper.join(", ")}. ${midText(upper)} Q3 = ${q3}.`),
          st("Subtract.", `IQR = Q3 − Q1 = ${q3} − ${q1} = ${iqr}`),
        ];
      })(),
      traps: traps(fromDecimal(iqr), [trap(Math.max(...data) - Math.min(...data), "That's the range. The IQR uses Q1 and Q3.")]),
    };
  },
};

const mad: Skill = {
  id: "g6.sp.mad",
  title: "Mean absolute deviation",
  topic: T,
  standards: ["NC.6.SP.5"],
  prereqs: ["g6.sp.center", "g6.ns.abs"],
  lesson: {
    bigIdea: "MAD is the average distance of the data from the mean: how far values typically are from “typical”.",
    explain: [
      "Data 2, 4, 6, 8: mean = 5. Distances from 5: 3, 1, 1, 3. Average distance = 8 ÷ 4 = **2**.",
      "A small MAD means the values are bunched close together; a large MAD means they're spread out.",
    ],
    visual: { type: "numberline", min: 0, max: 10, step: 1, points: [{ v: 2 }, { v: 4 }, { v: 6 }, { v: 8 }, { v: 5, label: "mean" }] },
  },
  why: [
    { kind: "choice", prompt: "Why do we use absolute value (distance) when finding MAD?", choices: ["Without it, distances above and below the mean cancel out to 0.", "Because negative numbers aren't allowed in data.", "To make the answer bigger."], correct: 0, explain: "Deviations from the mean always sum to 0." },
    { kind: "written", prompt: "Two classes both have a mean reading time of 30 minutes. Class A's MAD is 3 and Class B's is 12. Explain what that tells you.", keyIdeas: ["both have the same typical value", "Class A's times are close to 30", "Class B's times vary much more"], exemplar: "Both classes read about 30 minutes on average. Class A's small MAD means most students read close to 30 minutes. Class B's bigger MAD means their times are much more spread out: some read a lot more and some a lot less." },
  ],
  generate(r, lv) {
    const n = lv === 1 ? 4 : r.pick([4, 5, 6]);
    let data: number[];
    let mean: number;
    do {
      data = Array.from({ length: n }, () => r.int(1, lv === 3 ? 30 : 15));
      mean = sum(data) / n;
    } while (!Number.isInteger(mean));
    const devs = data.map((d) => Math.abs(d - mean));
    const m = sum(devs) / n;
    const ex = data.find((x) => x !== mean) ?? data[0];
    return {
      prompt: `Find the mean absolute deviation (MAD) of ${data.join(", ")}.`,
      answer: num(frac(sum(devs), n), { tolerance: m % 1 ? 0.01 : undefined }),
      hints: [
        `MAD is the average distance from the mean. Start with the mean: ${sum(data)} ÷ ${n} = ${mean}.`,
        `Find how far each value is from ${mean}, like |${ex} − ${mean}| = ${Math.abs(ex - mean)}. Distances are never negative.`,
        `The distances add up to ${sum(devs)}. Divide by ${n}, the number of values.`,
      ],
      steps: [
        st("Find the mean.", `${data.join(" + ")} = ${sum(data)}, and ${sum(data)} ÷ ${n} = ${mean}.`),
        st("Find how far each value is from the mean.", data.map((d) => `|${d} − ${mean}| = ${Math.abs(d - mean)}`).join(", ")),
        st("Add the distances.", `${devs.join(" + ")} = ${sum(devs)}`),
        st("Divide by the number of values.", `${sum(devs)} ÷ ${n} = ${round(m, 2)}`),
        st("Answer.", `MAD = ${round(m, 2)}: on average, values are about ${round(m, 2)} away from the mean.`),
      ],
      traps: traps(frac(sum(devs), n), [trap(mean, "That's the mean. MAD is the average DISTANCE from the mean."), trap(sum(devs), `Now divide the total distance by ${n}.`), trap(0, "Use distances (absolute values), so they don't cancel out.")]),
    };
  },
};

const chooseMeasure: Skill = {
  id: "g6.sp.choose",
  title: "Choosing the best summary",
  topic: T,
  standards: ["NC.6.SP.2", "NC.6.SP.5"],
  prereqs: ["g6.sp.spread"],
  lesson: {
    bigIdea: "An outlier pulls the mean toward it, but the median barely moves.",
    explain: [
      "Allowances $5, $6, $5, $7, $50: mean = $14.60, but no one actually gets close to that! The median, $6, is more typical.",
      "Use median and IQR when the data is skewed or has outliers. Use mean and MAD when the data is roughly symmetric.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does one very large value raise the mean but not the median much?", choices: ["The mean uses every value's size, but the median only depends on the middle position.", "The median ignores the data.", "Large values don't affect the mean."], correct: 0, explain: "Median is about order, not size." },
    { kind: "written", prompt: "Five allowances are $5, $6, $5, $7 and $50. Explain whether the mean or median better describes a typical allowance.", keyIdeas: ["the $50 is an outlier", "the mean ($14.60) is pulled up and higher than four of the five values", "the median ($6) is more typical"], exemplar: "The $50 is an outlier. It pulls the mean up to $14.60, which is more than four of the five kids get. The median, $6, is in the middle of the typical values, so it's a better description." },
  ],
  generate(r, lv) {
    const base = Array.from({ length: 5 }, () => r.int(10, 20));
    const outlier = r.int(60, 95);
    const data = [...base, outlier];
    const mean = round(sum(data) / data.length, 1);
    const med = median(data);
    if (lv === 1) {
      return {
        prompt: `Data: ${r.shuffle(data).join(", ")}. If you removed the ${outlier}, which would change more?`,
        answer: choice(r, "The mean", [["The median", "The median depends only on the middle values, which barely move."], ["Neither would change", "Removing a value changes the total, so the mean changes."]], true),
        hints: [
          `Think about what removing ${outlier} does to each one. The mean adds up EVERY value, so losing a big number changes the total a lot.`,
          `The median is just the middle of the ordered list. Taking away ${outlier} from the end only shifts the middle a little.`,
        ],
        steps: [
          st("Find the mean and median WITH the outlier.", `Mean = ${sum(data)} ÷ 6 ≈ ${mean}. Median = ${med}.`),
          st("Find them WITHOUT the outlier.", `Mean = ${sum(base)} ÷ 5 = ${round(sum(base) / 5, 1)}. Median = ${median(base)}.`),
          st("Compare the changes.", `The mean moved by about ${round(mean - sum(base) / 5, 1)}, but the median moved by only ${round(Math.abs(med - median(base)), 1)}. The mean changes more.`),
        ],
      };
    }
    if (lv === 2) {
      return {
        prompt: `Daily minutes of exercise: ${r.shuffle(data).join(", ")}. Which measure of center best describes a typical day?`,
        answer: choice(r, `The median (${med})`, [[`The mean (${mean})`, `The mean is pulled up by the outlier ${outlier}. Most values are well below it.`], [`The maximum (${outlier})`, "The maximum isn't a measure of center."]]),
        hints: [
          `Look for an outlier: a value far away from the rest. Most days are between ${Math.min(...base)} and ${Math.max(...base)} minutes.`,
          `${outlier} pulls the mean up toward it. Which choice is a center that stays inside the ${Math.min(...base)} to ${Math.max(...base)} range?`,
        ],
        steps: [
          st("Look for an outlier.", `${outlier} is far above all the other values.`),
          st("Find the mean and the median.", `Mean = ${sum(data)} ÷ 6 ≈ ${mean}. Median = ${med}.`),
          st("Which one is typical?", `Most days are between ${Math.min(...base)} and ${Math.max(...base)}. The median (${med}) is right in that range; the mean (${mean}) is pulled up by the outlier.`),
          st("Answer.", `The median describes a typical day best.`),
        ],
      };
    }
    const sym = r.chance(0.5);
    return {
      prompt: sym ? "A dot plot of test scores is roughly symmetric with no outliers. Which pair of measures best describes it?" : "A dot plot of house prices has a few very expensive houses far to the right. Which pair of measures best describes it?",
      answer: choice(r, sym ? "Mean and MAD" : "Median and IQR", [[sym ? "Median and IQR" : "Mean and MAD", sym ? "That works, but mean and MAD are the usual choice for symmetric data." : "The expensive outliers would pull the mean and MAD up."], "Mode and range"]),
      hints: [
        "Picture the dot plot. Is it balanced on both sides (symmetric), or does it have a few values far out on one side?",
        "Far-out values pull the mean and MAD, because they use every value's size. The median and IQR only use the middle, so outliers barely move them.",
      ],
      steps: [
        st("Is the data symmetric or lopsided?", sym ? "Roughly symmetric with no outliers." : "Lopsided (skewed) with a few very large values."),
        st("Choose the matching summary.", sym ? "For symmetric data, the mean and MAD describe it well." : "Outliers pull the mean and MAD, so use the median and IQR, which barely change."),
      ],
    };
  },
};

export default [questions, center, spread, mad, chooseMeasure];
