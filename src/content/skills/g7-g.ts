import { frac, fromDecimal } from "../../lib/rational";
import { F, choice, cst, ms, num, round, sn, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { piTimes, st } from "../steps";

const T = "g7-g";

const scale: Skill = {
  id: "g7.g.scale",
  title: "Scale drawings",
  topic: T,
  standards: ["NC.7.G.1"],
  prereqs: ["g7.rp.solve"],
  lesson: {
    bigIdea: "A scale like 1 cm : 2 m means every centimeter on the drawing stands for 2 meters in real life.",
    explain: [
      "On a drawing where 1 cm represents 2 m, a 4 cm wall represents 4 × 2 = **8 m**.",
      "To go from real to drawing, divide: a 10 m room is 10 ÷ 2 = 5 cm on the drawing.",
      "Area scales differently: if lengths are 2 times bigger, area is 2 × 2 = 4 times bigger.",
    ],
  },
  why: [
    { kind: "choice", prompt: "If a drawing doubles every length, why does the area become 4 times as big?", choices: ["Area is length × width, and both doubled: 2 × 2 = 4.", "Area always grows by the same factor as length.", "Because a rectangle has 4 sides."], correct: 0, explain: "Two dimensions each scale by 2." },
    { kind: "written", prompt: "On a map, 1 inch represents 25 miles. Explain how far apart two towns 3.5 inches apart on the map really are.", keyIdeas: ["each inch is 25 miles", "3.5 × 25", "87.5 miles"], exemplar: "Each inch on the map stands for 25 miles, so I multiply 3.5 × 25 = 87.5. The towns are 87.5 miles apart." },
  ],
  generate(r, lv) {
    const s = r.pick([2, 3, 4, 5, 10, 25, 50]);
    const unit = r.pick([["cm", "m"], ["in", "ft"], ["in", "mi"]]);
    if (lv === 1) {
      const d = r.int(2, 12);
      return {
        prompt: `On a scale drawing, 1 ${unit[0]} represents ${s} ${unit[1]}. A wall is ${d} ${unit[0]} long on the drawing. How long is the real wall, in ${unit[1]}?`,
        answer: num(d * s),
        hints: [
          `Every 1 ${unit[0]} on the drawing stands for ${s} ${unit[1]} in real life. The real wall is bigger, so multiply.`,
          `The drawing has ${d} of those 1-${unit[0]} pieces, and each one is worth ${s} ${unit[1]}. Find ${d} × ${s}.`,
        ],
        steps: [
          st("Read the scale.", `Every 1 ${unit[0]} on the drawing stands for ${s} ${unit[1]} in real life.`),
          st("Drawing → real life: multiply.", `${d} ${unit[0]} × ${s} = ${d * s} ${unit[1]}`),
          st("Answer.", `The real wall is ${d * s} ${unit[1]} long.`),
        ],
        traps: traps(F(d * s), [trap(frac(d, s), "The real object is bigger, so multiply by the scale.")]),
      };
    }
    if (lv === 2) {
      const real = s * r.int(2, 15) + (r.chance(0.3) ? s / 2 : 0);
      const ans = real / s;
      return {
        prompt: `A map scale is 1 ${unit[0]} : ${s} ${unit[1]}. Two places are ${real} ${unit[1]} apart in real life. How far apart are they on the map, in ${unit[0] === "in" ? "inches" : "centimeters"}?`,
        answer: num(fromDecimal(ans)),
        hints: [
          `Each 1 ${unit[0]} on the map stands for ${s} ${unit[1]}. Going from real life to the map, distances get smaller, so divide.`,
          `How many ${s}s fit into ${real}? Work out ${real} ÷ ${s}.`,
        ],
        steps: [
          st("Read the scale.", `1 ${unit[0]} on the map = ${s} ${unit[1]} in real life.`),
          st("Real life → map: divide.", `How many ${s}s are in ${real}? ${real} ÷ ${s} = ${ans}`),
          st("Check.", `${ans} ${unit[0]} × ${s} = ${real} ${unit[1]} ✔`),
        ],
        traps: traps(fromDecimal(ans), [trap(real * s, "The map distance is smaller than the real distance, so divide.")]),
      };
    }
    const k = r.int(2, 5);
    const l = r.int(2, 8);
    const w = r.int(2, 6);
    return {
      prompt: `A ${l} cm by ${w} cm rectangle is enlarged with a scale factor of ${k}. What is the area of the new rectangle, in square cm?`,
      answer: num(l * w * k * k),
      hints: [
        `A scale factor of ${k} makes EACH side ${k} times as long. Find the new sides first.`,
        `New sides: ${l} × ${k} and ${w} × ${k}. Then multiply the two new sides to get the new area.`,
      ],
      steps: [
        st("Scale each side.", `${l} × ${k} = ${l * k} cm and ${w} × ${k} = ${w * k} cm`),
        st("Find the new area.", `${l * k} × ${w * k} = ${l * w * k * k} cm²`),
        st("Compare with the original area.", `Original: ${l} × ${w} = ${l * w}. ${l * w * k * k} ÷ ${l * w} = ${k * k} = ${k}². Area grows by the scale factor SQUARED because both length and width grew.`),
      ],
      traps: traps(F(l * w * k * k), [trap(l * w * k, "Both the length AND the width are scaled, so area grows by the scale factor squared.")]),
    };
  },
};

const triangles: Skill = {
  id: "g7.g.triangles",
  title: "Building triangles",
  topic: T,
  standards: ["NC.7.G.2"],
  prereqs: [],
  lesson: {
    bigIdea: "Three side lengths make a triangle only if the two shorter sides add up to MORE than the longest side. The three angles always add to 180°.",
    explain: [
      "3, 4, 8: 3 + 4 = 7, which is less than 8, so the two short sides can't meet. No triangle.",
      "3, 4, 5: 3 + 4 = 7 > 5 ✔. That's a triangle (a right triangle, in fact).",
      "Angles: if two angles are 50° and 60°, the third is 180 − 50 − 60 = 70°.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can't sides 2, 3 and 6 form a triangle?", choices: ["2 + 3 = 5 is shorter than 6, so the two short sides can't reach each other.", "Because 6 is even.", "They can."], correct: 0, explain: "Triangle inequality." },
    { kind: "written", prompt: "Explain why the angles of any triangle add up to 180°.", keyIdeas: ["tear off the three corners", "put them together along a straight line", "a straight angle is 180°"], exemplar: "If you tear off the three corners of a paper triangle and put them side by side, they form a straight line. A straight angle is 180°, so the three angles add to 180°." },
  ],
  generate(r, lv) {
    if (lv === 2) {
      const a = r.int(25, 100);
      const b = r.int(20, 150 - a);
      return {
        prompt: `Two angles of a triangle measure ${a}° and ${b}°. What is the third angle?`,
        answer: num(180 - a - b),
        hints: ["The three angles of any triangle add up to 180°.", `Add the two angles you know, ${a} + ${b}. Then subtract that from 180.`],
        steps: [
          st("The angles in a triangle add up to 180°.", ""),
          st("Add the two angles you know.", `${a} + ${b} = ${a + b}`),
          st("Subtract from 180°.", `180 − ${a + b} = ${180 - a - b}°`),
          st("Check.", `${a} + ${b} + ${180 - a - b} = 180 ✔`),
        ],
        traps: traps(F(180 - a - b), [trap(360 - a - b, "Triangles add to 180°, not 360°.")]),
      };
    }
    if (lv === 3) {
      const a = r.int(3, 12);
      let b = r.int(3, 12);
      if (b === a) b = a + r.int(1, 5);
      return {
        prompt: `Two sides of a triangle are ${a} and ${b}. The third side must be greater than what number?`,
        answer: num(Math.abs(a - b)),
        hints: [
          `For a triangle, any two sides must add up to MORE than the third. So the third side plus the shorter side (${Math.min(a, b)}) must be more than ${Math.max(a, b)}.`,
          `third + ${Math.min(a, b)} > ${Math.max(a, b)}. How much more than ${Math.min(a, b)} do you need to reach ${Math.max(a, b)}? Subtract.`,
        ],
        steps: [
          st("Triangle rule.", "Any two sides must add up to MORE than the third side, or they can't meet."),
          st("The third side plus the shorter side must beat the longer side.", `third + ${Math.min(a, b)} > ${Math.max(a, b)}, so third > ${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(a - b)}.`),
          st("And the two given sides must beat the third side.", `third < ${a} + ${b} = ${a + b}.`),
          st("Answer.", `The third side must be greater than ${Math.abs(a - b)} (and less than ${a + b}).`),
        ],
        traps: traps(F(Math.abs(a - b)), [trap(a + b, `That's the upper limit. The third side must be LESS than ${a + b}, and greater than the difference.`)]),
      };
    }
    const ok = r.chance(0.5);
    const x = r.int(2, 10);
    const y = r.int(2, 10);
    const z = ok ? r.int(Math.abs(x - y) + 1, x + y - 1) : x + y + r.int(0, 4);
    const sides = r.shuffle([x, y, z]);
    const sorted = [...sides].sort((p, q) => p - q);
    return {
      prompt: `Can sides of length ${sides.join(", ")} form a triangle?`,
      answer: choice(r, ok ? "Yes" : "No", [[ok ? "No" : "Yes", `Add the two shorter sides: ${sorted[0]} + ${sorted[1]} = ${sorted[0] + sorted[1]}. Is that more than ${sorted[2]}?`]], true),
      hints: [
        "Find the longest side. The two shorter sides must be long enough to meet over it: together they must be MORE than the longest side.",
        `The two shorter sides are ${sorted[0]} and ${sorted[1]}. Is ${sorted[0]} + ${sorted[1]} more than ${sorted[2]}?`,
      ],
      steps: [
        st("Find the longest side.", `${sorted[2]} is the longest; the two shorter sides are ${sorted[0]} and ${sorted[1]}.`),
        st("Add the two shorter sides.", `${sorted[0]} + ${sorted[1]} = ${sorted[0] + sorted[1]}`),
        st("Compare with the longest side.", `${sorted[0] + sorted[1]} ${sorted[0] + sorted[1] > sorted[2] ? ">" : "≤"} ${sorted[2]}. ${ok ? "The short sides are long enough to meet." : "The short sides are too short to meet, so they can't close up into a triangle."}`),
        st("Answer.", ok ? "Yes, it's a triangle." : "No, it can't be a triangle."),
      ],
    };
  },
};

const circles: Skill = {
  id: "g7.g.circles",
  title: "Circles: circumference and area",
  topic: T,
  standards: ["NC.7.G.4"],
  prereqs: ["g6.ns.dec-mult", "g6.ee.exponents"],
  lesson: {
    bigIdea: "Circumference C = πd = 2πr. Area A = πr². Use π ≈ 3.14.",
    explain: [
      "π (pi) is the number of diameters that fit around any circle, about 3.14.",
      "Radius 5 cm: C = 2 × 3.14 × 5 = 31.4 cm, A = 3.14 × 5² = 78.5 cm².",
      "Watch out: if you're given the diameter, halve it to get the radius before finding area.",
    ],
    visual: { type: "shape", shape: "circle", labels: { r: "r", d: "d = 2r" } },
  },
  why: [
    { kind: "choice", prompt: "Why is the circumference a little more than 3 diameters?", choices: ["π ≈ 3.14 diameters wrap around any circle.", "Because circles have 3 parts.", "It's exactly 3 diameters."], correct: 0, explain: "That's the definition of π." },
    { kind: "written", prompt: "Explain why the area formula uses r² and give the area of a circle with diameter 10.", keyIdeas: ["area is about squares, so r × r appears", "radius is half the diameter: 5", "3.14 × 25 = 78.5"], exemplar: "A circle's area is about 3.14 squares of side r, so A = πr². The diameter is 10, so r = 5, r² = 25, and A ≈ 3.14 × 25 = 78.5 square units." },
  ],
  generate(r, lv) {
    const rad = r.int(2, 12);
    const giveD = r.chance(0.5);
    const given = giveD ? `diameter ${2 * rad}` : `radius ${rad}`;
    if (lv === 1) {
      const C = round(2 * 3.14 * rad, 2);
      return {
        prompt: `Find the circumference of a circle with ${given} cm. Use π ≈ 3.14.`,
        answer: num(fromDecimal(C), { tolerance: 0.05 }),
        hints: [
          "Circumference is the distance around: C = π × diameter, with π ≈ 3.14.",
          giveD ? `The diameter is ${2 * rad} cm, so find 3.14 × ${2 * rad}.` : `The diameter is twice the radius: 2 × ${rad} = ${2 * rad} cm. Now find 3.14 × ${2 * rad}.`,
          `Split it up: 3 × ${2 * rad}, plus 0.14 × ${2 * rad}. Add the two parts.`,
        ],
        steps: [
          st("Use the circumference formula.", "C = π × diameter, with π ≈ 3.14."),
          st(giveD ? "The diameter is given." : "Find the diameter.", giveD ? `d = ${2 * rad} cm` : `The diameter is twice the radius: d = 2 × ${rad} = ${2 * rad} cm.`),
          st("Multiply.", piTimes(2 * rad)),
          st("Answer with units.", `C ≈ ${C} cm`),
        ],
        traps: traps(fromDecimal(C), [trap(fromDecimal(round(3.14 * rad, 2)), "Use the diameter (2 × radius) for circumference."), trap(fromDecimal(round(3.14 * rad * rad, 2)), "That's the area. Circumference is the distance around.")]),
      };
    }
    if (lv === 2) {
      const A = round(3.14 * rad * rad, 2);
      return {
        prompt: `Find the area of a circle with ${given} m. Use π ≈ 3.14.`,
        answer: num(fromDecimal(A), { tolerance: 0.05 }),
        hints: [
          "Area uses the RADIUS: A = π × r², which means 3.14 × r × r.",
          giveD ? `The radius is half the diameter: ${2 * rad} ÷ 2 = ${rad} m. Square it: ${rad} × ${rad} = ${rad * rad}.` : `Square the radius: ${rad} × ${rad} = ${rad * rad}.`,
          `Now find 3.14 × ${rad * rad}. Split it up: 3 × ${rad * rad}, plus 0.14 × ${rad * rad}.`,
        ],
        steps: [
          st("Use the area formula.", "A = π × r², with π ≈ 3.14. It uses the RADIUS."),
          st(giveD ? "Find the radius." : "The radius is given.", giveD ? `The radius is half the diameter: ${2 * rad} ÷ 2 = ${rad} m.` : `r = ${rad} m`),
          st("Square the radius.", `${rad}² = ${rad} × ${rad} = ${rad * rad}`),
          st("Multiply by π.", piTimes(rad * rad)),
          st("Answer with units.", `A ≈ ${A} m²`),
        ],
        traps: traps(fromDecimal(A), [trap(fromDecimal(round(3.14 * 4 * rad * rad, 2)), "Use the radius, not the diameter, in A = πr²."), trap(fromDecimal(round(2 * 3.14 * rad, 2)), "That's the circumference. Area uses r².")]),
      };
    }
    const C = round(3.14 * 2 * rad, 2);
    return {
      prompt: `A circular track has a circumference of ${C} m. What is its radius? (π ≈ 3.14)`,
      answer: num(rad, { tolerance: 0.05 }),
      hints: [
        "Work backward from C = 2 × π × r. Since 2 × 3.14 = 6.28, the radius is the circumference ÷ 6.28.",
        `Make the divisor whole: multiply both numbers by 100, so ${C} ÷ 6.28 becomes ${Math.round(C * 100)} ÷ 628.`,
        `Or estimate: 6.28 is close to 6, so ask “6 times what is about ${Math.round(C)}?” Then check your guess: 6.28 × r should be ${C}.`,
      ],
      steps: [
        st("Start from the formula.", "C = 2 × π × r, so r = C ÷ (2 × π)."),
        st("Find 2π.", "2 × 3.14 = 6.28"),
        st("Divide.", `${C} ÷ 6.28: multiply both by 100 to get ${Math.round(C * 100)} ÷ 628 = ${rad}.`),
        st("Check.", `2 × 3.14 × ${rad} = ${C} ✔`),
      ],
      traps: traps(F(rad), [trap(2 * rad, "That's the diameter. The radius is half of it.")]),
    };
  },
};

const angles: Skill = {
  id: "g7.g.angles",
  title: "Angle relationships",
  topic: T,
  standards: ["NC.7.G.5"],
  prereqs: ["g7.ee.two-step"],
  lesson: {
    bigIdea: "Complementary angles add to 90°, supplementary angles add to 180°, and vertical angles are equal.",
    explain: [
      "Two angles on a straight line are supplementary: 130° and 50°.",
      "Two angles making a right angle are complementary: 35° and 55°.",
      "When two lines cross, the angles opposite each other (vertical angles) are equal.",
      "Algebra helps: if (2x + 10)° and (3x − 20)° are supplementary, 5x − 10 = 180 → x = 38.",
    ],
    visual: { type: "shape", shape: "angles", labels: { a: "a", b: "b" } },
  },
  why: [
    { kind: "choice", prompt: "Why are vertical angles equal?", choices: ["Each one is supplementary to the same angle between them, so they must be equal.", "Because they look the same.", "They're only equal sometimes."], correct: 0, explain: "a + b = 180 and c + b = 180 → a = c." },
    { kind: "written", prompt: "Angles of (2x + 10)° and (3x − 20)° are supplementary. Explain how to find x.", keyIdeas: ["supplementary: they add to 180", "(2x + 10) + (3x − 20) = 180 → 5x − 10 = 180", "5x = 190, x = 38"], exemplar: "Supplementary angles add to 180°, so (2x + 10) + (3x − 20) = 180. Combining gives 5x − 10 = 180, so 5x = 190 and x = 38." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const kind = r.pick(["complementary", "supplementary", "vertical"]);
      const a = kind === "complementary" ? r.int(10, 80) : r.int(20, 160);
      const ans = kind === "complementary" ? 90 - a : kind === "supplementary" ? 180 - a : a;
      return {
        prompt: kind === "vertical" ? `Two lines cross. One angle is ${a}°. What is the angle vertically opposite it?` : `Two angles are ${kind}. One is ${a}°. What is the other?`,
        answer: num(ans),
        hints: kind === "vertical"
          ? ["Vertical angles sit straight across from each other where two lines cross, like the tips of an X.", "Vertical angles always have the same measure."]
          : [kind === "complementary" ? "Complementary angles fit together to make a right angle, 90°." : "Supplementary angles fit together to make a straight line, 180°.", `So ${a}° + ? = ${kind === "complementary" ? 90 : 180}°. Subtract ${a} from ${kind === "complementary" ? 90 : 180}.`],
        steps: kind === "vertical"
          ? [st("Vertical angles are the angles straight across from each other where two lines cross.", ""), st("Vertical angles are always equal.", `So the angle is ${a}°.`)]
          : [st(kind === "complementary" ? "Complementary angles add up to 90° (a right angle)." : "Supplementary angles add up to 180° (a straight line).", ""), st("Subtract the angle you know.", `${kind === "complementary" ? 90 : 180} − ${a} = ${ans}°`), st("Check.", `${a} + ${ans} = ${kind === "complementary" ? 90 : 180} ✔`)],
        traps: traps(F(ans), [trap(kind === "complementary" ? 180 - a : 90 - a, kind === "complementary" ? "Complementary means 90°." : "Supplementary means 180°.")]),
      };
    }
    if (lv === 2) {
      const a = r.int(20, 70);
      return {
        prompt: `Two lines cross, making four angles. One angle is ${a}°. What is the angle right next to it (adjacent, on the same straight line)?`,
        answer: num(180 - a),
        hints: ["The angle right next to it shares a straight line with it, and a straight line makes 180°.", `So ${a}° + ? = 180°. Subtract ${a} from 180.`],
        steps: [
          st("Adjacent angles on a straight line are supplementary.", "Together they make a straight line, 180°."),
          st("Subtract.", `180 − ${a} = ${180 - a}°`),
          st("Notice.", `The angle across from ${a}° (vertical angle) is also ${a}°, and the one across from ${180 - a}° is ${180 - a}°.`),
        ],
        traps: traps(F(180 - a), [trap(a, "That's the vertical (opposite) angle. Adjacent angles add to 180°.")]),
      };
    }
    const total = r.pick([90, 180]);
    let x: number, p: number, q: number, c: number, d: number;
    do {
      x = r.int(5, 30);
      p = r.int(1, 4);
      q = r.int(1, 4);
      c = r.int(-10, 20);
      d = total - (p + q) * x - c;
    } while (p * x + c <= 5 || q * x + d <= 5 || c === 0 || d === 0);
    const e1 = `${p === 1 ? "" : p}x${cst(c)}`;
    const e2 = `${q === 1 ? "" : q}x${cst(d)}`;
    return {
      prompt: `Angles of (${e1})° and (${e2})° are ${total === 90 ? "complementary" : "supplementary"}. What is x?`,
      answer: num(x),
      hints: [
        `${total === 90 ? "Complementary" : "Supplementary"} angles add to ${total}°, so write (${e1}) + (${e2}) = ${total}.`,
        `Combine like terms: ${p === 1 ? "" : p}x + ${q === 1 ? "" : q}x = ${p + q}x, and ${ms(c)} + ${sn(d)} = ${ms(c + d)}. So ${p + q}x${cst(c + d)} = ${total}.`,
        c + d !== 0 ? `Now ${c + d > 0 ? "subtract" : "add"} ${Math.abs(c + d)} on both sides, then divide both sides by ${p + q}.` : `Now divide both sides by ${p + q}.`,
      ],
      steps: [
        st(`${total === 90 ? "Complementary" : "Supplementary"} angles add to ${total}°.`, `(${e1}) + (${e2}) = ${total}`),
        st("Combine like terms.", `${p}x + ${q}x = ${p + q}x, and ${ms(c)} + ${sn(d)} = ${ms(c + d)}: ${p + q}x${cst(c + d)} = ${total}`),
        ...(c + d !== 0 ? [st(`${c + d > 0 ? "Subtract" : "Add"} ${Math.abs(c + d)} on both sides.`, `${p + q}x = ${total - c - d}`)] : []),
        st(`Divide both sides by ${p + q}.`, `x = ${total - c - d} ÷ ${p + q} = ${x}`),
        st("Check.", `The angles are ${p * x + c}° and ${q * x + d}°, and ${p * x + c} + ${q * x + d} = ${total} ✔`),
      ],
    };
  },
};

const areaVolume: Skill = {
  id: "g7.g.prisms",
  title: "Volume and surface area of prisms",
  topic: T,
  standards: ["NC.7.G.6"],
  prereqs: ["g6.g.surface", "g6.g.area"],
  lesson: {
    bigIdea: "For any prism, Volume = (area of the base) × height.",
    explain: [
      "A triangular prism with a triangle base (base 6, height 4) and length 10: base area = {1/2} × 6 × 4 = 12, volume = 12 × 10 = 120 cubic units.",
      "Surface area = add the areas of all faces (2 bases + the rectangles around the side).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does V = (base area) × height work for every prism?", choices: ["The prism is a stack of identical layers shaped like the base.", "Because all prisms are boxes.", "It only works for cubes."], correct: 0, explain: "Layers again!" },
    { kind: "written", prompt: "Explain how to find the volume of a triangular prism whose triangle has base 6 and height 4, and whose length is 10.", keyIdeas: ["find the triangle's area: 1/2 × 6 × 4 = 12", "multiply by the prism's length", "12 × 10 = 120 cubic units"], exemplar: "The base is a triangle with area 1/2 × 6 × 4 = 12. The prism is 10 layers of that triangle, so the volume is 12 × 10 = 120 cubic units." },
  ],
  generate(r, lv) {
    const b = r.int(2, 10) * 2;
    const h = r.int(2, 10);
    const L = r.int(3, 15);
    if (lv <= 2) {
      const baseArea = (b * h) / 2;
      return {
        prompt: `A triangular prism has a triangular base with base ${b} cm and height ${h} cm. The prism is ${L} cm long. What is its volume?`,
        answer: num(baseArea * L),
        hints: [
          "The prism is a stack of identical triangles. Volume = area of one triangle × the prism's length.",
          `Triangle area = {1/2} × base × height = {1/2} × ${b} × ${h}.`,
          `Multiply the triangle's area by the length, ${L} cm.`,
        ],
        steps: [
          st("Volume of any prism = area of the base × length.", "The prism is a stack of identical triangles."),
          st("Area of the triangle base.", `{1/2} × ${b} × ${h} = ${b * h} ÷ 2 = ${baseArea} cm²`),
          st("Multiply by the length of the prism.", `${baseArea} × ${L} = ${baseArea * L}`),
          st("Answer with units.", `${baseArea * L} cm³ (cubic centimeters)`),
        ],
        traps: traps(F(baseArea * L), [trap(b * h * L, "The base is a triangle, so its area needs the {1/2}.")]),
      };
    }
    const l = r.int(4, 12);
    const w = r.int(3, 8);
    const hh = r.int(2, 6);
    const cut = r.int(1, Math.min(l, w) - 1);
    const V = l * w * hh - cut * cut * hh;
    return {
      prompt: `A block is a ${l} × ${w} × ${hh} rectangular prism with a ${cut} × ${cut} × ${hh} square hole cut all the way through it (top to bottom). What volume of material is left?`,
      answer: num(V),
      hints: [
        "Find the volume of the whole block as if there were no hole. Then take away the volume of the hole.",
        `Whole block: ${l} × ${w} × ${hh}. Hole: ${cut} × ${cut} × ${hh}. Subtract the hole from the block.`,
      ],
      steps: [
        st("Volume of the whole block.", `${l} × ${w} × ${hh} = ${l * w} × ${hh} = ${l * w * hh}`),
        st("Volume of the hole.", `It's a ${cut} × ${cut} square going all ${hh} units through: ${cut} × ${cut} × ${hh} = ${cut * cut * hh}`),
        st("Subtract the hole.", `${l * w * hh} − ${cut * cut * hh} = ${V} cubic units`),
      ],
    };
  },
};

export default [scale, triangles, circles, angles, areaVolume];
