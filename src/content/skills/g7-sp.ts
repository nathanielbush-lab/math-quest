import { frac, mul } from "../../lib/rational";
import { F, choice, num, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { simplifySteps, st } from "../steps";

const T = "g7-sp";

const sampling: Skill = {
  id: "g7.sp.sampling",
  title: "Random samples",
  topic: T,
  standards: ["NC.7.SP.1"],
  prereqs: ["g6.sp.questions"],
  lesson: {
    bigIdea: "A sample tells you about a population only if it's representative, and random sampling is the best way to get that.",
    explain: [
      "To learn students' favorite lunch, surveying only the soccer team is **biased**: they might not be like everyone else.",
      "Picking names at random from the whole school gives every student an equal chance, so the sample is likely representative.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is surveying people leaving a gym a biased way to learn how much a town exercises?", choices: ["People at a gym probably exercise more than the average person.", "Gyms are too small.", "It isn't biased."], correct: 0, explain: "The sample doesn't represent everyone." },
    { kind: "written", prompt: "Explain how you'd choose a fair sample of 50 students to learn the favorite sport at your school.", keyIdeas: ["use a random method (names from a hat / random numbers)", "choose from the whole school, all grades", "every student has an equal chance"], exemplar: "I'd put every student's name in a list and use random numbers (or draw from a hat) to choose 50. That way every student in every grade has the same chance of being picked, so the sample should represent the school." },
  ],
  generate(r) {
    const scenarios: [string, string, [string, string][]][] = [
      ["The principal wants to know how students feel about a later start time.", "Survey 60 students chosen at random from the school roster.", [["Survey the first 60 students who arrive in the morning.", "Early arrivers may feel differently about start times."], ["Survey students in the math club.", "One club isn't representative of the whole school."], ["Survey 60 students in the sixth grade.", "Only one grade is included."]]],
      ["A town wants to know how often residents use the library.", "Call 200 randomly chosen phone numbers from a list of all residents.", [["Ask 200 people inside the library.", "People in the library use it more than average."], ["Ask the library staff.", "Staff aren't a sample of all residents."], ["Ask 200 people at a football game.", "That group may not represent all residents."]]],
      ["A cafeteria wants to know students' favorite lunch.", "Draw 50 names at random from all students.", [["Ask the 50 students in line for pizza.", "Students in the pizza line probably like pizza."], ["Ask the cafeteria staff.", "Staff aren't the students being studied."], ["Ask the 8th-grade basketball team.", "One team isn't representative."]]],
    ];
    const [setting, right, wrong] = r.pick(scenarios);
    return {
      prompt: `${setting} Which sampling method is most likely to be representative?`,
      answer: choice(r, right, wrong),
      hints: ["Look for a method where everyone has an equal chance of being picked.", "Watch out for groups that might all think the same way."],
      steps: [
        st("A good sample gives EVERYONE in the group an equal chance to be picked.", "That's what random selection from the whole group does."),
        st("Look for bias in the other choices.", wrong.map(([w, why]) => `“${w}”: ${why}`).join(" ")),
        st("Answer.", `“${right}”`),
      ],
    };
  },
};

const inference: Skill = {
  id: "g7.sp.inference",
  title: "Making predictions from samples",
  topic: T,
  standards: ["NC.7.SP.2"],
  prereqs: ["g7.sp.sampling", "g7.rp.solve"],
  lesson: {
    bigIdea: "If a random sample is representative, the population should have about the same proportion.",
    explain: [
      "In a random sample of 50 students, 18 prefer tacos. That's {18/50} = 36%. In a school of 600, about 0.36 × 600 = **216** students prefer tacos.",
      "Different random samples give slightly different estimates. That's normal variation.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can we use 18 out of 50 to predict a whole school of 600?", choices: ["A random sample should have about the same proportion as the population.", "Because 600 is a multiple of 50.", "We can't predict anything from a sample."], correct: 0, explain: "Same proportion, bigger group." },
    { kind: "written", prompt: "In a random sample of 40 seventh graders, 10 walk to school. There are 320 seventh graders. Explain your estimate.", keyIdeas: ["10/40 = 1/4 (25%) walk", "1/4 of 320", "about 80 students"], exemplar: "10 out of 40 is 1/4 of the sample. If the sample is representative, about 1/4 of all 320 seventh graders walk, which is 320 ÷ 4 = 80 students." },
  ],
  generate(r, lv) {
    const n = r.pick([20, 40, 50, 80, 100]);
    let pct = r.pick([10, 20, 25, 30, 40, 60, 75]);
    while (!Number.isInteger((pct * n) / 100)) pct = r.pick([10, 20, 30, 40, 60]);
    const k = (pct * n) / 100;
    const N = n * r.int(4, 20);
    const ans = (pct * N) / 100;
    const thing = r.pick(["prefer tacos", "walk to school", "have a pet", "play an instrument", "read before bed"]);
    if (lv === 3) {
      const ests = [r.int(Math.round(ans * 0.85), Math.round(ans * 0.95)), r.int(Math.round(ans * 1.05), Math.round(ans * 1.15))];
      return {
        prompt: `Two random samples estimate how many of ${N} students ${thing}: one estimates ${ests[0]}, the other ${ests[1]}. Which statement is best?`,
        answer: choice(r, `The true number is probably between about ${ests[0]} and ${ests[1]}; random samples vary a little.`, [["One of the samples must be wrong.", "Random samples naturally give slightly different results."], [`The true number is exactly ${Math.round((ests[0] + ests[1]) / 2)}.`, "Samples give estimates, not exact values."], ["Samples can't tell us anything.", "Random samples give useful estimates."]]),
        hints: ["Do random samples always give exactly the same result?", "Think about variation."],
        steps: [
          st("Random samples vary a little.", "Two random samples of the same school almost never give exactly the same result."),
          st("Use both estimates together.", `The true number is probably somewhere around ${ests[0]} to ${ests[1]}.`),
          st("Rule out the other choices.", "A different estimate doesn't make a sample wrong, and samples can't give an exact answer."),
        ],
      };
    }
    return {
      prompt: `In a random sample of ${n} students, ${k} ${thing}. There are ${N} students in the school. About how many students in the school ${thing}?`,
      answer: num(ans),
      hints: [`Find the fraction or percent in the sample: {${k}/${n}}.`, `Take that fraction of ${N}.`],
      steps: [
        st("Find the fraction in the sample.", `${k} out of ${n} is {${k}/${n}}.`),
        ...simplifySteps(k, n),
        st("Change it to a percent.", `{${k}/${n}} = ${k} ÷ ${n} = ${pct / 100} = ${pct}%`),
        st("Use the same percent for the whole school.", `${pct}% of ${N} = ${pct / 100} × ${N} = ${ans}`),
        st("Answer.", `About ${ans} students. It's an estimate, since the sample might not be perfect.`),
      ],
      traps: traps(F(ans), [trap(k, "That's the sample. Scale up to the whole school."), trap(N - ans, `That's the number who do NOT ${thing}.`)]),
    };
  },
};

const compareGroups: Skill = {
  id: "g7.sp.compare",
  title: "Comparing two groups",
  topic: T,
  standards: ["NC.7.SP.3", "NC.7.SP.4"],
  prereqs: ["g6.sp.mad"],
  lesson: {
    bigIdea: "Compare the centers, and use the spread to judge whether the difference is big or small.",
    explain: [
      "Team A's mean height is 62 in, Team B's is 68 in; both have a MAD of 3 in. The difference (6 in) is **2 MADs**, which is a noticeable difference.",
      "If the spreads were large (MAD 10), a 6-inch difference would be small compared to the variation, and the groups would overlap a lot.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why divide the difference in means by the MAD?", choices: ["It tells how big the difference is compared to the normal variation in the data.", "To get the median.", "It makes the numbers smaller."], correct: 0, explain: "A difference is only “big” relative to spread." },
    { kind: "written", prompt: "Two classes' test scores have means 78 and 84, each with MAD 2. Explain whether the difference is meaningful.", keyIdeas: ["difference is 6", "6 ÷ 2 = 3 MADs", "that's large compared to the variation, so the classes really differ"], exemplar: "The means differ by 6 points. Each MAD is 2, so the difference is 3 MADs. That's big compared to how much scores normally vary, so the second class really did score higher." },
  ],
  generate(r, lv) {
    const m1 = r.int(20, 70);
    const madv = r.int(2, 6);
    const times = lv === 1 ? r.int(1, 4) : r.int(1, 5);
    const m2 = m1 + times * madv;
    if (lv < 3) {
      return {
        prompt: `Group A has a mean of ${m1} and Group B a mean of ${m2}. Both have a MAD of ${madv}. The difference in means is how many MADs?`,
        answer: num(times),
        hints: [`Difference: ${m2} − ${m1} = ${m2 - m1}.`, `Divide by the MAD: ${m2 - m1} ÷ ${madv}.`],
        steps: [
          st("Find the difference between the means.", `${m2} − ${m1} = ${m2 - m1}`),
          st("Divide by the MAD to compare it with the normal spread.", `${m2 - m1} ÷ ${madv} = ${times}`),
          st("Answer.", `The means are ${times} MAD${times === 1 ? "" : "s"} apart. ${times >= 2 ? "That's a noticeable difference." : "That's small: the groups overlap a lot."}`),
        ],
        traps: traps(F(times), [trap(m2 - m1, "That's the difference. Divide it by the MAD.")]),
      };
    }
    const big = times >= 2;
    return {
      prompt: `Plant heights: Group A mean ${m1} cm, Group B mean ${m2} cm, both with MAD ${madv} cm. Which is the best conclusion?`,
      answer: choice(r, big ? `The difference is ${times} MADs, so Group B's plants are noticeably taller.` : "The difference is only 1 MAD, so the groups overlap a lot.", [[big ? "The groups are about the same because they overlap." : "Group B is clearly much taller.", "Compare the difference to the MAD."], "We can't compare groups with different means."]),
      hints: ["Find the difference in means as a number of MADs.", "About 2 or more MADs → a noticeable difference."],
      steps: [
        st("Find the difference between the means.", `${m2} − ${m1} = ${m2 - m1} cm`),
        st("Compare it with the spread (MAD).", `${m2 - m1} ÷ ${madv} = ${times} MAD${times === 1 ? "" : "s"}`),
        st("Decide.", times >= 2 ? "2 or more MADs apart means the groups are noticeably different." : "Less than 2 MADs apart means the groups overlap a lot, so the difference isn't convincing."),
      ],
    };
  },
};

const probability: Skill = {
  id: "g7.sp.probability",
  title: "Probability",
  topic: T,
  standards: ["NC.7.SP.5", "NC.7.SP.6", "NC.7.SP.7"],
  prereqs: ["g5.equiv"],
  lesson: {
    bigIdea: "Probability = favorable outcomes ÷ total outcomes (when all outcomes are equally likely). It's between 0 (impossible) and 1 (certain).",
    explain: [
      "A bag has 3 red and 5 blue marbles. P(red) = {3/8}.",
      "If you repeat an experiment many times, the fraction of successes gets close to the probability. Rolling a die 60 times, expect about 60 × {1/6} = 10 sixes.",
      "Experimental probability comes from actual results; theoretical probability comes from reasoning.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why might you roll a 6 only 7 times in 60 rolls instead of exactly 10?", choices: ["Results vary by chance; over many more rolls, the fraction gets closer to {1/6}.", "The die must be broken.", "The probability is wrong."], correct: 0, explain: "Experimental results vary." },
    { kind: "written", prompt: "Explain what a probability of {3/4} means.", keyIdeas: ["it's likely (closer to 1 than 0)", "it should happen about 3 out of 4 times", "in 100 tries, about 75 times"], exemplar: "A probability of 3/4 means the event is likely. Over many tries it should happen about 3 out of every 4 times, so in 100 tries about 75 times." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const red = r.int(1, 8);
      const blue = r.int(1, 8);
      const green = r.int(0, 5);
      const total = red + blue + green;
      const ask = r.pick(["red", "blue"]);
      const fav = ask === "red" ? red : blue;
      return {
        prompt: `A bag has ${red} red, ${blue} blue${green ? ` and ${green} green` : ""} marbles. You pick one at random. What is P(${ask})?`,
        answer: num(frac(fav, total)),
        hints: ["P = favorable ÷ total.", `Total marbles: ${total}.`],
        steps: [
          st("Count all the marbles.", `${red} + ${blue}${green ? ` + ${green}` : ""} = ${total}`),
          st(`Count the ${ask} marbles.`, `${fav}`),
          st("Probability = favorable outcomes ÷ total outcomes.", `P(${ask}) = {${fav}/${total}}`),
          ...simplifySteps(fav, total),
        ],
        traps: traps(frac(fav, total), [trap(frac(fav, total - fav), "Compare to the TOTAL number of marbles, not just the other color.")]),
      };
    }
    if (lv === 2) {
      const sides = r.pick([4, 6, 8, 10]);
      const trials = sides * r.int(5, 20);
      const ans = trials / sides;
      return {
        prompt: `A fair ${sides}-sided number cube is rolled ${trials} times. About how many times would you expect to roll a 3?`,
        answer: num(ans),
        hints: [`P(3) = {1/${sides}}.`, `Expected = ${trials} × {1/${sides}}.`],
        steps: [
          st("Find the probability of rolling a 3.", `The cube has ${sides} equally likely sides and one of them is 3, so P(3) = {1/${sides}}.`),
          st("Expected count = number of rolls × probability.", `${trials} × {1/${sides}} = ${trials} ÷ ${sides} = ${ans}`),
          st("It's an estimate.", `In real rolls you'd get close to ${ans}, but probably not exactly.`),
        ],
        traps: traps(F(ans), [trap(trials / 2, `There are ${sides} equally likely outcomes, not 2.`)]),
      };
    }
    const flips = r.pick([20, 40, 50, 100]);
    const heads = Math.round(flips / 2) + r.int(-7, 7);
    return {
      prompt: `A coin is flipped ${flips} times and lands heads ${heads} times. What is the experimental probability of heads?`,
      answer: num(frac(heads, flips)),
      hints: ["Experimental probability = times it happened ÷ total trials.", `{${heads}/${flips}}`],
      steps: [
        st("Experimental probability = times it happened ÷ number of tries.", `{${heads}/${flips}}`),
        ...simplifySteps(heads, flips),
        st("Compare with the theoretical probability.", `A fair coin should land heads {1/2} of the time. Real experiments come out a little different, which is normal.`),
      ],
      traps: traps(frac(heads, flips), [trap(frac(1, 2), "That's the theoretical probability. Use the actual results.")]),
    };
  },
};

const compound: Skill = {
  id: "g7.sp.compound",
  title: "Compound events",
  topic: T,
  standards: ["NC.7.SP.8"],
  prereqs: ["g7.sp.probability", "g5.multiply"],
  lesson: {
    bigIdea: "List all outcomes (with a table or tree), then count the favorable ones.",
    explain: [
      "Two coin tosses: HH, HT, TH, TT are equally likely. Exactly one head: HT and TH → {2/4} = **{1/2}**.",
      "Two dice make 6 × 6 = 36 outcomes. A sum of 7 happens 6 ways: P = {6/36} = {1/6}.",
      "For independent events you can also multiply: P(heads and 6) = {1/2} × {1/6} = {1/12}.",
    ],
    visual: { type: "table", headers: ["", "H", "T"], rows: [["H", "HH", "HT"], ["T", "TH", "TT"]] },
  },
  why: [
    { kind: "choice", prompt: "Why is P(exactly one head in two tosses) = {1/2} and not {1/3}?", choices: ["There are 4 equally likely outcomes (HH, HT, TH, TT), and 2 have exactly one head.", "There are 3 outcomes: 0, 1 or 2 heads.", "Because coins are 50/50."], correct: 0, explain: "0, 1, 2 heads aren't equally likely. HT and TH are different outcomes." },
    { kind: "written", prompt: "Explain why the most common sum when rolling two dice is 7.", keyIdeas: ["there are 36 equally likely outcomes", "7 can be made 6 ways (1+6, 2+5, 3+4, 4+3, 5+2, 6+1)", "no other sum has that many ways"], exemplar: "Two dice have 36 equally likely outcomes. A sum of 7 can happen 6 ways: 1+6, 2+5, 3+4, 4+3, 5+2 and 6+1. Every other sum has fewer ways, so 7 is the most likely." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const n = r.pick([2, 3]);
      const want = r.int(0, n);
      const ways = n === 2 ? [1, 2, 1][want] : [1, 3, 3, 1][want];
      const total = 2 ** n;
      return {
        prompt: `A fair coin is tossed ${n} times. What is the probability of getting exactly ${want} head${want === 1 ? "" : "s"}?`,
        answer: num(frac(ways, total)),
        hints: [`List all ${total} outcomes (like HH, HT, …).`, `Count those with exactly ${want} head${want === 1 ? "" : "s"}.`],
        steps: (() => {
          const all = n === 2 ? ["HH", "HT", "TH", "TT"] : ["HHH", "HHT", "HTH", "HTT", "THH", "THT", "TTH", "TTT"];
          const good = all.filter((o) => o.split("").filter((c) => c === "H").length === want);
          return [
            st("List every possible outcome.", `${all.join(", ")}: ${total} equally likely outcomes.`),
            st(`Find the ones with exactly ${want} head${want === 1 ? "" : "s"}.`, `${good.join(", ")}: that's ${ways}.`),
            st("Probability = favorable ÷ total.", `P = {${ways}/${total}}`),
            ...simplifySteps(ways, total),
          ];
        })(),
        traps: traps(frac(ways, total), [trap(frac(1, n + 1), `The ${n + 1} possible counts of heads aren't equally likely. List all ${total} outcomes.`)]),
      };
    }
    if (lv === 2) {
      const target = r.int(2, 12);
      const ways = 6 - Math.abs(7 - target);
      return {
        prompt: `Two fair dice are rolled. What is the probability that the sum is ${target}?`,
        visual: { type: "table", headers: ["+", "1", "2", "3", "4", "5", "6"], rows: [1, 2, 3, 4, 5, 6].map((a) => [a, ...[1, 2, 3, 4, 5, 6].map((b) => a + b)]) },
        answer: num(frac(ways, 36)),
        hints: ["There are 36 equally likely outcomes. Use the table.", `Count the cells that show ${target}.`],
        steps: [
          st("Two dice have 6 × 6 = 36 equally likely outcomes.", "The table shows all 36 sums."),
          st(`Find every pair that adds to ${target}.`, `${[1, 2, 3, 4, 5, 6].filter((x) => target - x >= 1 && target - x <= 6).map((x) => `(${x}, ${target - x})`).join(", ")}: that's ${ways}.`),
          st("Probability = favorable ÷ total.", `P = {${ways}/36}`),
          ...simplifySteps(ways, 36),
        ],
        traps: traps(frac(ways, 36), [trap(frac(1, 11), "The 11 possible sums aren't equally likely. Count outcomes in the table.")]),
      };
    }
    const sec = r.pick([3, 4, 5]);
    const coinOrSpinner = r.pick([["flip a coin", 2, "heads"], ["roll a 6-sided number cube", 6, "a 6"]] as [string, number, string][]);
    const ans = mul(frac(1, coinOrSpinner[1]), frac(1, sec));
    return {
      prompt: `You ${coinOrSpinner[0]} and spin a spinner with ${sec} equal sections numbered 1 to ${sec}. What is P(${coinOrSpinner[2]} and spinning a 1)?`,
      answer: num(ans),
      hints: [`There are ${coinOrSpinner[1]} × ${sec} = ${coinOrSpinner[1] * sec} equally likely outcomes.`, "Only one of them is the outcome we want (or multiply the two probabilities)."],
      steps: [
        st("Count all the outcomes.", `Each of the ${coinOrSpinner[1]} results of the first part can go with each of the ${sec} spinner results: ${coinOrSpinner[1]} × ${sec} = ${coinOrSpinner[1] * sec}.`),
        st("Count the winning outcomes.", `Only one: ${coinOrSpinner[2]} AND spinning a 1.`),
        st("Probability.", `P = {1/${coinOrSpinner[1] * sec}}`),
        st("Another way: multiply the probabilities.", `{1/${coinOrSpinner[1]}} × {1/${sec}} = {1/${coinOrSpinner[1] * sec}}`),
      ],
      traps: traps(ans, [trap(frac(sec + coinOrSpinner[1], coinOrSpinner[1] * sec), "For “and” with independent events, multiply the probabilities (don't add).")]),
    };
  },
};

export default [sampling, inference, compareGroups, probability, compound];


