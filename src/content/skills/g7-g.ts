import { frac, fromDecimal } from "../../lib/rational";
import { F, choice, cst, num, round, trap, traps } from "../helpers";
import type { Skill } from "../types";

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
        hints: [`Each ${unit[0]} stands for ${s} ${unit[1]}.`, `${d} × ${s}`],
        steps: [`${d} × ${s} = ${d * s} ${unit[1]}`],
        traps: traps(F(d * s), [trap(frac(d, s), "The real object is bigger, so multiply by the scale.")]),
      };
    }
    if (lv === 2) {
      const real = s * r.int(2, 15) + (r.chance(0.3) ? s / 2 : 0);
      const ans = real / s;
      return {
        prompt: `A map scale is 1 ${unit[0]} : ${s} ${unit[1]}. Two places are ${real} ${unit[1]} apart in real life. How far apart are they on the map, in ${unit[0]}?`,
        answer: num(fromDecimal(ans)),
        hints: ["The map distance is smaller, so divide by the scale.", `${real} ÷ ${s}`],
        steps: [`${real} ÷ ${s} = ${ans} ${unit[0]}`],
        traps: traps(fromDecimal(ans), [trap(real * s, "The map distance is smaller than the real distance, so divide.")]),
      };
    }
    const k = r.int(2, 5);
    const l = r.int(2, 8);
    const w = r.int(2, 6);
    return {
      prompt: `A ${l} cm by ${w} cm rectangle is enlarged with a scale factor of ${k}. What is the area of the new rectangle, in square cm?`,
      answer: num(l * w * k * k),
      hints: [`The new sides are ${l * k} cm and ${w * k} cm.`, "Multiply the new sides."],
      steps: [`New sides: ${l} × ${k} = ${l * k}, ${w} × ${k} = ${w * k}`, `Area: ${l * k} × ${w * k} = ${l * w * k * k} cm²`, `That's ${k}² = ${k * k} times the original area of ${l * w}`],
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
        hints: ["The three angles of a triangle add to 180°.", `180 − ${a} − ${b}`],
        steps: [`180 − ${a} − ${b} = ${180 - a - b}°`],
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
        hints: ["The third side plus the shorter side must be more than the longer side.", `It must be more than ${Math.max(a, b)} − ${Math.min(a, b)}.`],
        steps: [`Greater than ${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(a - b)}`, `(and less than ${a} + ${b} = ${a + b})`],
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
      hints: ["Add the two shorter sides.", "Is the sum MORE than the longest side?"],
      steps: [`${sorted[0]} + ${sorted[1]} = ${sorted[0] + sorted[1]} ${sorted[0] + sorted[1] > sorted[2] ? ">" : "≤"} ${sorted[2]}`, ok ? "Yes, it's a triangle" : "No triangle"],
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
        hints: ["C = πd (or 2πr).", giveD ? `d = ${2 * rad}` : `d = 2 × ${rad} = ${2 * rad}`],
        steps: [`C = 3.14 × ${2 * rad} = ${C} cm`],
        traps: traps(fromDecimal(C), [trap(fromDecimal(round(3.14 * rad, 2)), "Use the diameter (2 × radius) for circumference."), trap(fromDecimal(round(3.14 * rad * rad, 2)), "That's the area. Circumference is the distance around.")]),
      };
    }
    if (lv === 2) {
      const A = round(3.14 * rad * rad, 2);
      return {
        prompt: `Find the area of a circle with ${given} m. Use π ≈ 3.14.`,
        answer: num(fromDecimal(A), { tolerance: 0.05 }),
        hints: ["A = πr².", giveD ? `First halve the diameter: r = ${rad}.` : `r² = ${rad * rad}`],
        steps: [`r = ${rad}`, `A = 3.14 × ${rad}² = 3.14 × ${rad * rad} = ${A} m²`],
        traps: traps(fromDecimal(A), [trap(fromDecimal(round(3.14 * 4 * rad * rad, 2)), "Use the radius, not the diameter, in A = πr²."), trap(fromDecimal(round(2 * 3.14 * rad, 2)), "That's the circumference. Area uses r².")]),
      };
    }
    const C = round(3.14 * 2 * rad, 2);
    return {
      prompt: `A circular track has a circumference of ${C} m. What is its radius? (π ≈ 3.14)`,
      answer: num(rad, { tolerance: 0.05 }),
      hints: ["C = 2πr, so r = C ÷ (2π).", `${C} ÷ 6.28`],
      steps: [`2π ≈ 6.28`, `r = ${C} ÷ 6.28 = ${rad} m`],
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
        hints: [kind === "complementary" ? "Complementary angles add to 90°." : kind === "supplementary" ? "Supplementary angles add to 180°." : "Vertical angles are equal."],
        steps: [kind === "vertical" ? `Vertical angles are equal: ${a}°` : `${kind === "complementary" ? 90 : 180} − ${a} = ${ans}°`],
        traps: traps(F(ans), [trap(kind === "complementary" ? 180 - a : 90 - a, kind === "complementary" ? "Complementary means 90°." : "Supplementary means 180°.")]),
      };
    }
    if (lv === 2) {
      const a = r.int(20, 70);
      return {
        prompt: `Two lines cross, making four angles. One angle is ${a}°. What is the angle right next to it (adjacent, on the same straight line)?`,
        answer: num(180 - a),
        hints: ["Adjacent angles on a straight line are supplementary.", `180 − ${a}`],
        steps: [`180 − ${a} = ${180 - a}°`],
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
      hints: [`They add to ${total}°.`, `Combine like terms: ${p + q}x${cst(c + d)} = ${total}`],
      steps: [`(${e1}) + (${e2}) = ${total}`, `${p + q}x${cst(c + d)} = ${total}`, `${p + q}x = ${total - c - d}`, `x = ${x}`, `Check: the angles are ${p * x + c}° and ${q * x + d}°`],
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
        hints: ["Volume = area of the triangle × length of the prism.", `Triangle area: {1/2} × ${b} × ${h} = ${baseArea}.`],
        steps: [`Base area = ${baseArea} cm²`, `V = ${baseArea} × ${L} = ${baseArea * L} cm³`],
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
      hints: ["Find the volume of the whole block and of the hole.", "Subtract."],
      steps: [`Block: ${l} × ${w} × ${hh} = ${l * w * hh}`, `Hole: ${cut} × ${cut} × ${hh} = ${cut * cut * hh}`, `${l * w * hh} − ${cut * cut * hh} = ${V}`],
    };
  },
};

export default [scale, triangles, circles, angles, areaVolume];
