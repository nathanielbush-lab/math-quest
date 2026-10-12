import { frac, fromDecimal } from "../../lib/rational";
import { F, choice, fr, mixed, ms, num, round, trap, traps } from "../helpers";
import type { Skill } from "../types";
import { st } from "../steps";

const par = (v: number) => (v < 0 ? `(${ms(v)})` : String(v));
const quad = (x: number, y: number) => (x > 0 ? (y > 0 ? "I" : "IV") : y > 0 ? "II" : "III");

const T = "g8-g";

const transform: Skill = {
  id: "g8.g.transform",
  title: "Transformations on the coordinate plane",
  topic: T,
  standards: ["NC.8.G.3"],
  prereqs: ["g6.ns.coords"],
  lesson: {
    bigIdea: "Translations slide, reflections flip, rotations turn and dilations resize, and each has a coordinate rule.",
    explain: [
      "**Translate** 3 right and 2 down: (x, y) → (x + 3, y − 2).",
      "**Reflect** across the x-axis: (x, y) → (x, −y). Across the y-axis: (x, y) → (−x, y).",
      "**Rotate** 90° counterclockwise about the origin: (x, y) → (−y, x). 180°: (x, y) → (−x, −y).",
      "**Dilate** by scale factor k from the origin: (x, y) → (kx, ky).",
    ],
    visual: { type: "grid", min: -6, max: 6, points: [{ x: 4, y: 2, label: "A(4, 2)" }, { x: -2, y: 4, label: "A′ (90° turn)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does a 180° rotation about the origin send (3, 2) to (−3, −2)?", choices: ["A half-turn points the opposite way from the origin, flipping both signs.", "Because you swap x and y.", "It sends it to (2, 3)."], correct: 0, explain: "Opposite side of the origin, same distance." },
    { kind: "written", prompt: "Explain the difference between a rigid transformation and a dilation.", keyIdeas: ["rigid transformations (slides, flips, turns) keep size and shape: congruent", "a dilation changes size but keeps shape: similar", "angles stay the same in all of them"], exemplar: "Translations, reflections and rotations move a shape without changing its size or shape, so the image is congruent. A dilation stretches or shrinks the shape, so the image is similar: same angles, but different side lengths." },
  ],
  generate(r, lv) {
    const x = r.nonzero(-5, 5);
    const y = r.nonzero(-5, 5);
    const kinds = lv === 1 ? ["translate", "reflect-x", "reflect-y"] : lv === 2 ? ["rotate180", "rotate90", "reflect-x", "reflect-y"] : ["dilate", "rotate90cw", "rotate90", "translate"];
    const kind = r.pick(kinds);
    let nx = x, ny = y, desc = "", rule = "";
    const dx = r.nonzero(-4, 4), dy = r.nonzero(-4, 4), k = r.pick([2, 3]);
    switch (kind) {
      case "translate": nx = x + dx; ny = y + dy; desc = `translate it ${Math.abs(dx)} ${dx > 0 ? "right" : "left"} and ${Math.abs(dy)} ${dy > 0 ? "up" : "down"}`; rule = `(x ${dx > 0 ? "+" : "−"} ${Math.abs(dx)}, y ${dy > 0 ? "+" : "−"} ${Math.abs(dy)})`; break;
      case "reflect-x": ny = -y; desc = "reflect it across the x-axis"; rule = "(x, −y)"; break;
      case "reflect-y": nx = -x; desc = "reflect it across the y-axis"; rule = "(−x, y)"; break;
      case "rotate180": nx = -x; ny = -y; desc = "rotate it 180° about the origin"; rule = "(−x, −y)"; break;
      case "rotate90": nx = -y; ny = x; desc = "rotate it 90° counterclockwise about the origin"; rule = "(−y, x)"; break;
      case "rotate90cw": nx = y; ny = -x; desc = "rotate it 90° clockwise about the origin"; rule = "(y, −x)"; break;
      default: nx = k * x; ny = k * y; desc = `dilate it by a scale factor of ${k} centered at the origin`; rule = `(${k}x, ${k}y)`;
    }
    const lim = Math.max(8, Math.abs(nx) + 1, Math.abs(ny) + 1);
    const pt = `(${ms(x)}, ${ms(y)})`;
    const img = `(${ms(nx)}, ${ms(ny)})`;
    const transformSteps = (): string[] => {
      switch (kind) {
        case "translate":
          return [
            st("Left/right changes x; up/down changes y.", `Right is +, left is −, up is +, down is −.`),
            st("Move x.", `${ms(x)} ${dx > 0 ? "+" : "−"} ${Math.abs(dx)} = ${ms(nx)}`),
            st("Move y.", `${ms(y)} ${dy > 0 ? "+" : "−"} ${Math.abs(dy)} = ${ms(ny)}`),
            st("Answer.", `A lands at ${img}.`),
          ];
        case "reflect-x":
          return [
            st("Reflecting across the x-axis flips the point up ↔ down.", "x stays the same and y changes sign: (x, y) → (x, −y)."),
            st("Apply it.", `x stays ${ms(x)}; y: ${ms(y)} → ${ms(ny)}`),
            st("Answer.", `${img}: the same distance (${Math.abs(y)}) from the x-axis, on the other side.`),
          ];
        case "reflect-y":
          return [
            st("Reflecting across the y-axis flips the point left ↔ right.", "y stays the same and x changes sign: (x, y) → (−x, y)."),
            st("Apply it.", `x: ${ms(x)} → ${ms(nx)}; y stays ${ms(y)}`),
            st("Answer.", `${img}: the same distance (${Math.abs(x)}) from the y-axis, on the other side.`),
          ];
        case "rotate180":
          return [
            st("A half-turn sends the point straight through the origin to the opposite side.", "Both signs flip: (x, y) → (−x, −y)."),
            st("Apply it.", `x: ${ms(x)} → ${ms(nx)}; y: ${ms(y)} → ${ms(ny)}`),
            st("Answer and check.", `${img}. A started in Quadrant ${quad(x, y)} and a half-turn lands it in Quadrant ${quad(nx, ny)} ✔`),
          ];
        case "rotate90":
          return [
            st("Rule for 90° counterclockwise.", "(x, y) → (−y, x): swap the coordinates, then change the sign of the new first one."),
            st("Swap.", `${pt} → (${ms(y)}, ${ms(x)})`),
            st("Change the sign of the first.", `(${ms(y)}, ${ms(x)}) → ${img}`),
            st("Check the quadrant.", `Counterclockwise quarter-turns go I → II → III → IV. A was in Quadrant ${quad(x, y)}, and ${img} is in Quadrant ${quad(nx, ny)} ✔`),
          ];
        case "rotate90cw":
          return [
            st("Rule for 90° clockwise.", "(x, y) → (y, −x): swap the coordinates, then change the sign of the new second one."),
            st("Swap.", `${pt} → (${ms(y)}, ${ms(x)})`),
            st("Change the sign of the second.", `(${ms(y)}, ${ms(x)}) → ${img}`),
            st("Check the quadrant.", `Clockwise quarter-turns go I → IV → III → II. A was in Quadrant ${quad(x, y)}, and ${img} is in Quadrant ${quad(nx, ny)} ✔`),
          ];
        default:
          return [
            st(`A dilation by ${k} from the origin multiplies both coordinates by ${k}.`, `(x, y) → (${k}x, ${k}y)`),
            st("Multiply x.", `${k} × ${par(x)} = ${ms(nx)}`),
            st("Multiply y.", `${k} × ${par(y)} = ${ms(ny)}`),
            st("Answer.", `${img}: in the same direction from the origin, ${k} times as far.`),
          ];
      }
    };
    return {
      prompt: `Point A is at (${ms(x)}, ${ms(y)}). Click where A lands if you ${desc}.`,
      answer: { kind: "point", x: nx, y: ny, min: -lim, max: lim, extraPoints: [{ x, y, label: "A" }] },
      hints: [`The rule is (x, y) → ${rule}.`, `Apply it: x = ${ms(x)}, y = ${ms(y)}.`],
      steps: transformSteps(),
    };
  },
};

const similarity: Skill = {
  id: "g8.g.similar",
  title: "Congruence and similarity",
  topic: T,
  standards: ["NC.8.G.2", "NC.8.G.4"],
  prereqs: ["g8.g.transform", "g7.g.scale"],
  lesson: {
    bigIdea: "Congruent figures match exactly. Similar figures have the same shape: equal angles, and sides in the same ratio.",
    explain: [
      "If triangle ABC is similar to triangle DEF with AB = 4 and DE = 10, the scale factor is {10/4} = 2.5. Every side of DEF is 2.5 times the matching side of ABC.",
      "A shadow problem: a 6 ft person casts a 4 ft shadow while a tree casts a 20 ft shadow. Similar triangles: tree height = 6 × {20/4} = 30 ft.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why are all similar triangles' angles equal but sides different?", choices: ["Dilations scale lengths but don't change angles.", "Because triangles always have equal sides.", "Their angles are different."], correct: 0, explain: "Shape stays, size changes." },
    { kind: "written", prompt: "A 6 ft person casts a 4 ft shadow. At the same time a tree casts a 20 ft shadow. Explain how tall the tree is.", keyIdeas: ["the sun makes similar triangles", "the tree's shadow is 5 times as long (20 ÷ 4)", "so the tree is 5 × 6 = 30 ft"], exemplar: "The sun's rays make similar triangles for the person and the tree. The tree's shadow is 20 ÷ 4 = 5 times as long, so the tree is 5 times as tall: 5 × 6 = 30 feet." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const options: [string, boolean][] = [["a translation", true], ["a reflection", true], ["a rotation", true], ["a dilation by a factor of 2", false]];
      const askNot = r.chance(0.6);
      const right = askNot ? options[3][0] : r.pick(options.slice(0, 3))[0];
      return {
        prompt: askNot ? "Which transformation does NOT always produce a congruent figure?" : "Which transformation always produces a congruent figure?",
        answer: choice(r, right, options.filter(([t]) => t !== right).map(([t, rig]) => [t, rig ? "Slides, flips and turns keep the size the same." : "A dilation changes the size."] as [string, string])),
        hints: ["Congruent means same size and shape.", "Which one changes the size?"],
        steps: [
          st("Congruent means same size AND same shape.", "So ask: which moves can change the size?"),
          st("Translations, reflections and rotations", "only slide, flip or turn the figure. The size never changes → always congruent."),
          st("A dilation", "stretches or shrinks the figure. The shape stays but the size changes → similar, not congruent."),
          st("Answer.", right),
        ],
      };
    }
    const k = lv === 2 ? r.int(2, 5) : r.pick([1.5, 2.5, 3, 4]);
    const a = r.int(2, 9) * 2;
    const b = r.int(2, 9) * 2;
    const ans = round(b * k, 2);
    if (lv === 3) {
      const ph = r.int(5, 6);
      const ps = r.int(2, 4);
      const ts = ps * r.int(3, 8);
      const tree = (ph * ts) / ps;
      return {
        prompt: `A ${ph} ft tall person casts a ${ps} ft shadow. At the same time, a tree casts ${/^(8|11|18)/.test(String(ts)) ? "an" : "a"} ${ts} ft shadow. How tall is the tree?`,
        answer: num(fromDecimal(round(tree, 3)), { tolerance: 0.01 }),
        hints: ["The person and the tree make similar triangles with their shadows.", `The tree's shadow is ${ts} ÷ ${ps} = ${ts / ps} times as long.`],
        steps: [
          st("Spot the similar triangles.", "The sun's rays hit the person and the tree at the same angle, so (height, shadow) make two similar right triangles."),
          st("Find the scale factor from the shadows.", `tree's shadow ÷ person's shadow = ${ts} ÷ ${ps} = ${ts / ps}`),
          st("Scale the height by the same factor.", `${ph} × ${ts / ps} = ${tree} ft`),
          st("Check the ratios match.", `height ÷ shadow: {${ph}/${ps}} and {${tree}/${ts}} both simplify to ${fr(frac(ph, ps))} ✔`),
        ],
        traps: traps(fromDecimal(round(tree, 3)), [trap(ph + ts - ps, "Similar figures scale by multiplying, not by adding.")]),
      };
    }
    return {
      prompt: `Triangle ABC is similar to triangle DEF. AB = ${a}, BC = ${b}, and DE = ${a * k}. Find EF.`,
      answer: num(fromDecimal(ans)),
      hints: [`Scale factor = DE ÷ AB = ${a * k} ÷ ${a} = ${k}.`, `EF = BC × ${k}.`],
      steps: [
        st("Match corresponding sides.", "ABC ~ DEF, so AB ↔ DE, BC ↔ EF and CA ↔ FD (letters in the same order)."),
        st("Find the scale factor.", `DE ÷ AB = ${a * k} ÷ ${a} = ${k}`),
        st("Scale BC to get EF.", `EF = ${b} × ${k} = ${ans}`),
        st("Check the ratios match.", `${a * k} ÷ ${a} = ${k} and ${ans} ÷ ${b} = ${k} ✔`),
      ],
      traps: traps(fromDecimal(ans), [trap(b + a * k - a, "Similar figures scale by multiplying, not by adding the same amount.")]),
    };
  },
};

const angles8: Skill = {
  id: "g8.g.angles",
  title: "Parallel lines and triangle angles",
  topic: T,
  standards: ["NC.8.G.5"],
  prereqs: ["g7.g.angles", "g7.g.triangles"],
  lesson: {
    bigIdea: "When a line crosses two parallel lines, matching angles are equal; and a triangle's exterior angle equals the two far interior angles.",
    explain: [
      "Corresponding angles (same position at each crossing) are equal. Alternate interior angles (inside, on opposite sides) are equal.",
      "Same-side interior angles are supplementary (add to 180°).",
      "Exterior angle of a triangle = sum of the two remote interior angles. If two angles are 40° and 65°, the exterior angle at the third corner is 105°.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is a triangle's exterior angle equal to the two remote interior angles added?", choices: ["The exterior angle and the third interior angle both make 180° with the same angle.", "It's a coincidence.", "It equals all three angles."], correct: 0, explain: "Both sum with the adjacent angle to 180°." },
    { kind: "written", prompt: "Explain why alternate interior angles are equal when a line crosses two parallel lines.", keyIdeas: ["each is vertical to / corresponding with an angle at the other crossing", "the parallel lines cross the transversal at the same angle", "so the angles match"], exemplar: "Because the lines are parallel, the transversal crosses both at the same angle, so corresponding angles are equal. An alternate interior angle is vertical to one of those corresponding angles, and vertical angles are equal, so alternate interior angles are equal too." },
  ],
  generate(r, lv) {
    const a = r.int(30, 150);
    if (lv === 1) {
      const kind = r.pick(["corresponding", "alternate interior", "same-side interior"]);
      const ans = kind === "same-side interior" ? 180 - a : a;
      return {
        prompt: `Two parallel lines are cut by a transversal. One angle is ${a}°. What is the measure of its ${kind} angle?`,
        answer: num(ans),
        hints: [kind === "same-side interior" ? "Same-side interior angles are supplementary." : `${kind[0].toUpperCase() + kind.slice(1)} angles are equal.`],
        steps:
          kind === "corresponding"
            ? [
                st("Where is it?", "Corresponding angles sit in the same position at each crossing (for example, both above the line and right of the transversal)."),
                st("Parallel lines → same tilt.", "The transversal crosses both parallel lines at the same angle, so corresponding angles are equal."),
                st("Answer.", `${a}°`),
              ]
            : kind === "alternate interior"
              ? [
                  st("Where is it?", "Alternate interior angles are between the parallel lines, on opposite sides of the transversal (they make a Z shape)."),
                  st("They're equal.", "Each one matches a corresponding angle that is vertical to the other, so they're the same size."),
                  st("Answer.", `${a}°`),
                ]
              : [
                  st("Where is it?", "Same-side interior angles are between the parallel lines, on the same side of the transversal (a C shape)."),
                  st("They're supplementary.", "Together they add to 180°."),
                  st("Subtract.", `180 − ${a} = ${ans}°`),
                  st("Check.", `${a} + ${ans} = 180 ✔`),
                ],
        traps: traps(F(ans), [trap(kind === "same-side interior" ? a : 180 - a, kind === "same-side interior" ? "Same-side interior angles add to 180°." : "These angles are equal, not supplementary.")]),
      };
    }
    const p = r.int(25, 80);
    const q = r.int(25, 150 - p);
    if (lv === 2) {
      return {
        prompt: `In a triangle, two interior angles are ${p}° and ${q}°. What is the exterior angle at the third vertex?`,
        answer: num(p + q),
        hints: ["Exterior angle = sum of the two remote interior angles.", `${p} + ${q}`],
        steps: [
          st("Picture it.", "The exterior angle and the third interior angle sit side by side on a straight line, so they add to 180°."),
          st("Find the third interior angle.", `The angles of a triangle add to 180°: 180 − ${p} − ${q} = ${180 - p - q}°`),
          st("Find the exterior angle.", `180 − ${180 - p - q} = ${p + q}°`),
          st("Shortcut for next time.", `Exterior angle = the two remote interior angles added: ${p} + ${q} = ${p + q}° ✔`),
        ],
        traps: traps(F(p + q), [trap(180 - p - q, "That's the interior angle. The exterior angle is next to it on a straight line.")]),
      };
    }
    let x: number, k1: number, p2: number;
    do {
      x = r.int(8, 30);
      k1 = r.int(2, 4);
      p2 = r.int(25, 80);
    } while (k1 * x + p2 >= 170);
    const ext = k1 * x + p2;
    return {
      prompt: `In a triangle, the two remote interior angles measure (${k1}x)° and ${p2}°. The exterior angle at the third vertex is ${ext}°. What is x?`,
      answer: num(x),
      hints: ["Exterior angle = sum of the two remote interior angles.", `${k1}x + ${p2} = ${ext}`],
      steps: [
        st("Use the exterior angle rule.", "Exterior angle = sum of the two remote interior angles."),
        st("Write the equation.", `${k1}x + ${p2} = ${ext}`),
        st(`Subtract ${p2} from both sides.`, `${k1}x = ${ext} − ${p2} = ${ext - p2}`),
        st(`Divide both sides by ${k1}.`, `x = ${ext - p2} ÷ ${k1} = ${x}`),
        st("Check.", `${k1} × ${x} + ${p2} = ${k1 * x} + ${p2} = ${ext} ✔`),
      ],
      traps: traps(F(x), [trap(frac(180 - ext - p2, k1), "The exterior angle equals the two REMOTE interior angles added together.")]),
    };
  },
};

const pythag: Skill = {
  id: "g8.g.pythagorean",
  title: "The Pythagorean theorem",
  topic: T,
  standards: ["NC.8.G.6", "NC.8.G.7"],
  prereqs: ["g8.pr.roots", "g7.g.triangles"],
  lesson: {
    bigIdea: "In a right triangle, a² + b² = c², where c is the hypotenuse (the longest side, across from the right angle).",
    explain: [
      "A rectangle with sides 3 and 4 has diagonal 5, because 3² + 4² = 9 + 16 = 25 = 5².",
      "Finding a leg: if c = 13 and a = 5, then b² = 169 − 25 = 144, so b = 12.",
      "It also works backwards: sides 6, 8, 10 make a right triangle because 36 + 64 = 100.",
    ],
    visual: { type: "shape", shape: "righttriangle", labels: { a: "3", b: "4", c: "5" } },
  },
  why: [
    { kind: "choice", prompt: "Why is the hypotenuse always the longest side?", choices: ["c² = a² + b² is bigger than a² or b² alone, so c is bigger than a or b.", "Because it's slanted.", "It isn't always."], correct: 0, explain: "Adding positive squares makes a bigger square." },
    { kind: "written", prompt: "Explain why a rectangle with sides 3 and 4 has a diagonal of 5.", keyIdeas: ["the diagonal makes two right triangles", "3² + 4² = 9 + 16 = 25", "√25 = 5"], exemplar: "The diagonal splits the rectangle into two right triangles with legs 3 and 4. By the Pythagorean theorem, the diagonal squared is 3² + 4² = 9 + 16 = 25, so the diagonal is √25 = 5." },
  ],
  generate(r, lv) {
    const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15], [7, 24, 25], [12, 16, 20], [15, 20, 25]];
    const [a, b, c] = r.pick(triples);
    if (lv === 1) {
      return {
        prompt: `A right triangle has legs ${a} and ${b}. How long is the hypotenuse?`,
        visual: { type: "shape", shape: "righttriangle", labels: { a: String(a), b: String(b), c: "?" } },
        answer: num(c),
        hints: ["a² + b² = c².", `${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}`],
        steps: [
          st("Use a² + b² = c².", "The legs are a and b; the hypotenuse c is the side across from the right angle."),
          st("Square the legs.", `${a}² = ${a * a} and ${b}² = ${b * b}`),
          st("Add.", `${a * a} + ${b * b} = ${c * c}, so c² = ${c * c}`),
          st("Take the square root.", `c = √${c * c} = ${c}, because ${c} × ${c} = ${c * c}`),
          st("Sense check.", `${c} is longer than both legs, as the hypotenuse must be ✔`),
        ],
        traps: traps(F(c), [trap(a + b, "The sides don't simply add. Square, add, then take the square root."), trap(c * c, "Now take the square root.")]),
      };
    }
    if (lv === 2) {
      const findA = r.chance(0.5);
      return {
        prompt: `A right triangle has hypotenuse ${c} and one leg ${findA ? b : a}. How long is the other leg?`,
        visual: { type: "shape", shape: "righttriangle", labels: { a: findA ? "?" : String(a), b: findA ? String(b) : "?", c: String(c) } },
        answer: num(findA ? a : b),
        hints: ["The hypotenuse is c: leg² = c² − (other leg)².", `${c}² − ${findA ? b : a}²`],
        steps: [
          st("Use a² + b² = c² with the hypotenuse c = " + c + ".", `${findA ? b : a}² + ?² = ${c}²`),
          st("Square what you know.", `${findA ? b : a}² = ${(findA ? b : a) ** 2} and ${c}² = ${c * c}`),
          st("Subtract to find the missing leg squared.", `?² = ${c * c} − ${(findA ? b : a) ** 2} = ${(findA ? a : b) ** 2}`),
          st("Take the square root.", `? = √${(findA ? a : b) ** 2} = ${findA ? a : b}`),
          st("Check.", `${(findA ? b : a) ** 2} + ${(findA ? a : b) ** 2} = ${c * c} ✔`),
        ],
        traps: traps(F(findA ? a : b), [trap(round(Math.sqrt(c * c + (findA ? b : a) ** 2), 1), "When finding a leg, subtract from the hypotenuse squared.")]),
      };
    }
    if (r.chance(0.4)) {
      const right = r.chance(0.5);
      const sides = right ? [a, b, c] : [a, b, c + r.pick([-1, 1])];
      return {
        prompt: `Do sides ${sides.join(", ")} form a right triangle?`,
        answer: choice(r, right ? "Yes" : "No", [[right ? "No" : "Yes", `Check: ${sides[0]}² + ${sides[1]}² = ${sides[0] ** 2 + sides[1] ** 2} and ${sides[2]}² = ${sides[2] ** 2}.`]], true),
        hints: ["Check whether a² + b² = c² with c the longest side."],
        steps: [
          st("The longest side would have to be the hypotenuse.", `So test whether ${sides[0]}² + ${sides[1]}² = ${sides[2]}².`),
          st("Left side.", `${sides[0]}² + ${sides[1]}² = ${sides[0] ** 2} + ${sides[1] ** 2} = ${sides[0] ** 2 + sides[1] ** 2}`),
          st("Right side.", `${sides[2]}² = ${sides[2] ** 2}`),
          st("Compare.", right ? `${sides[0] ** 2 + sides[1] ** 2} = ${sides[2] ** 2}, so it IS a right triangle. Answer: Yes` : `${sides[0] ** 2 + sides[1] ** 2} ≠ ${sides[2] ** 2}, so it is NOT a right triangle. Answer: No`),
        ],
      };
    }
    const p = r.int(2, 9);
    const q = r.int(2, 9);
    const h = Math.sqrt(p * p + q * q);
    return {
      prompt: `A ladder leans against a wall. Its foot is ${p} ft from the wall and it reaches ${q} ft up the wall. How long is the ladder, to the nearest tenth of a foot?`,
      answer: num(round(h, 1), { tolerance: 0.051 }),
      hints: ["The wall, ground and ladder make a right triangle; the ladder is the hypotenuse.", `√(${p}² + ${q}²) = √${p * p + q * q}`],
      steps: [
        st("Draw the right triangle.", `The ground (${p} ft) and the wall (${q} ft) are the legs; the ladder is the hypotenuse.`),
        st("Square the legs and add.", `${p}² + ${q}² = ${p * p} + ${q * q} = ${p * p + q * q}`),
        ...(Number.isInteger(h)
          ? [st("Take the square root.", `√${p * p + q * q} = ${h}`)]
          : [
              st("Estimate the square root.", `${Math.floor(h)}² = ${Math.floor(h) ** 2} and ${Math.floor(h) + 1}² = ${(Math.floor(h) + 1) ** 2}, so √${p * p + q * q} is between ${Math.floor(h)} and ${Math.floor(h) + 1}.`),
              st("Use the calculator.", `√${p * p + q * q} ≈ ${round(h, 3)}`),
            ]),
        st("Round to the nearest tenth.", `The ladder is about ${round(h, 1)} ft long.`),
      ],
    };
  },
};

const distance: Skill = {
  id: "g8.g.distance",
  title: "Distance between points",
  topic: T,
  standards: ["NC.8.G.8"],
  prereqs: ["g8.g.pythagorean", "g6.ns.coords"],
  lesson: {
    bigIdea: "Draw a right triangle between two points: the legs are the horizontal and vertical distances; the distance is the hypotenuse.",
    explain: [
      "From (1, 2) to (4, 6): horizontal 3, vertical 4, distance √(9 + 16) = 5.",
    ],
    visual: { type: "grid", min: 0, max: 8, points: [{ x: 1, y: 2, label: "(1, 2)" }, { x: 4, y: 6, label: "(4, 6)" }], polygon: [{ x: 1, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 6 }] },
  },
  why: [
    { kind: "choice", prompt: "Why can you use the Pythagorean theorem to find distance on a grid?", choices: ["The horizontal and vertical gaps form the legs of a right triangle, and the distance is the hypotenuse.", "Because grids are made of squares.", "You can't."], correct: 0, explain: "Grid lines meet at right angles." },
    { kind: "written", prompt: "Explain how to find the distance from (−1, 1) to (5, 9).", keyIdeas: ["horizontal change 6, vertical change 8", "6² + 8² = 100", "distance √100 = 10"], exemplar: "The points are 5 − (−1) = 6 apart horizontally and 9 − 1 = 8 apart vertically. These are the legs of a right triangle, so the distance squared is 36 + 64 = 100, and the distance is 10." },
  ],
  generate(r, lv) {
    const triples = [[3, 4], [6, 8], [5, 12], [4, 3], [8, 6], [12, 5]];
    const [dx, dy] = lv === 3 ? [r.int(1, 7), r.int(1, 7)] : r.pick(triples);
    const x1 = r.int(-6, 3);
    const y1 = r.int(-6, 3);
    const x2 = x1 + dx * r.sign();
    const y2 = y1 + dy * r.sign();
    const d = Math.sqrt(dx * dx + dy * dy);
    return {
      prompt: `What is the distance between (${ms(x1)}, ${ms(y1)}) and (${ms(x2)}, ${ms(y2)})?${lv === 3 ? " Round to the nearest tenth." : ""}`,
      visual: Math.max(Math.abs(x2), Math.abs(y2), Math.abs(x1), Math.abs(y1)) <= 12 ? { type: "grid", min: -12, max: 12, points: [{ x: x1, y: y1 }, { x: x2, y: y2 }], polygon: [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }] } : undefined,
      answer: num(lv === 3 ? fromDecimal(round(d, 1)) : F(d), { tolerance: lv === 3 ? 0.051 : undefined }),
      hints: [`Horizontal distance: |${ms(x2)} − (${ms(x1)})| = ${dx}. Vertical: ${dy}.`, `d = √(${dx}² + ${dy}²)`],
      steps: [
        st("Make a right triangle.", "Draw a horizontal leg and a vertical leg joining the two points. The distance is the hypotenuse."),
        st("Horizontal leg (change in x).", `${ms(x2)} − ${par(x1)} = ${ms(x2 - x1)}, so the leg is ${dx} long`),
        st("Vertical leg (change in y).", `${ms(y2)} − ${par(y1)} = ${ms(y2 - y1)}, so the leg is ${dy} long`),
        st("Square and add.", `${dx}² + ${dy}² = ${dx * dx} + ${dy * dy} = ${dx * dx + dy * dy}`),
        Number.isInteger(d)
          ? st("Take the square root.", `d = √${dx * dx + dy * dy} = ${d}`)
          : st("Take the square root and round.", `d = √${dx * dx + dy * dy} ≈ ${round(d, 3)} ≈ ${round(d, 1)}`),
      ],
      traps: traps(lv === 3 ? fromDecimal(round(d, 1)) : F(d), [trap(dx + dy, "Distance isn't the horizontal plus vertical distance. Use the Pythagorean theorem.")]),
    };
  },
};

const volume8: Skill = {
  id: "g8.g.volume",
  title: "Volume of cylinders, cones and spheres",
  topic: T,
  standards: ["NC.8.G.9"],
  prereqs: ["g7.g.circles", "g7.g.prisms"],
  lesson: {
    bigIdea: "Cylinder V = πr²h. Cone V = {1/3}πr²h. Sphere V = {4/3}πr³.",
    explain: [
      "A cylinder is a stack of circles: base area πr² times height.",
      "A cone holds exactly {1/3} of the cylinder with the same base and height: try filling one with sand!",
      "Answers “in terms of π” keep π as a symbol: a cylinder with r = 3 and h = 5 has V = 45π.",
    ],
    visual: { type: "shape", shape: "cylinder", labels: { r: "r", h: "h" } },
  },
  why: [
    { kind: "choice", prompt: "Why is a cylinder's volume πr²h?", choices: ["It's a stack of circular layers, each with area πr², and h layers tall.", "Because it has a circle.", "Because π ≈ 3."], correct: 0, explain: "Base area × height, like prisms." },
    { kind: "written", prompt: "Explain how the volume of a cone compares to a cylinder with the same radius and height.", keyIdeas: ["the cone is 1/3 of the cylinder", "V = 1/3 πr²h", "it takes 3 cones to fill the cylinder"], exemplar: "A cone holds one third of a cylinder with the same base and height. That's why its formula is 1/3 πr²h: it would take three cones full of water to fill the cylinder." },
  ],
  generate(r, lv) {
    const rad = r.int(1, 6);
    const h = r.int(2, 10) * (lv === 2 ? 3 : 1);
    const kind = lv === 1 ? "cylinder" : lv === 2 ? "cone" : r.pick(["sphere", "cone", "cylinder"]);
    const coef = kind === "cylinder" ? frac(rad * rad * h) : kind === "cone" ? frac(rad * rad * h, 3) : frac(4 * rad ** 3, 3);
    const shapeDesc = kind === "sphere" ? `a sphere with radius ${rad}` : `a ${kind} with radius ${rad} and height ${h}`;
    return {
      prompt: `Find the volume of ${shapeDesc}. Give your answer in terms of π (type the number in front of π).`,
      visual: { type: "shape", shape: kind as "cylinder" | "cone" | "sphere", labels: kind === "sphere" ? { r: String(rad) } : { r: String(rad), h: String(h) } },
      answer: { kind: "multi", fields: [{ value: coef, post: "π" }] },
      hints: [kind === "cylinder" ? "V = πr²h" : kind === "cone" ? "V = {1/3}πr²h" : "V = {4/3}πr³", kind === "sphere" ? `r³ = ${rad ** 3}` : `r² = ${rad * rad}`],
      steps:
        kind === "cylinder"
          ? [
              st("Formula.", "V = πr²h: the area of the circular base (πr²) times the height."),
              st("Square the radius.", `r² = ${rad} × ${rad} = ${rad * rad}`),
              st("Multiply by the height.", `${rad * rad} × ${h} = ${rad * rad * h}`),
              st("Answer.", `V = ${rad * rad * h}π`),
            ]
          : kind === "cone"
            ? [
                st("Formula.", "V = {1/3}πr²h: one third of a cylinder with the same base and height."),
                st("Square the radius.", `r² = ${rad} × ${rad} = ${rad * rad}`),
                st("Multiply by the height.", `${rad * rad} × ${h} = ${rad * rad * h} (the matching cylinder would be ${rad * rad * h}π)`),
                st("Take one third.", `${rad * rad * h} ÷ 3 = ${coef.d === 1 ? coef.n : `{${coef.n}/${coef.d}} = ${mixed(coef)}`}`),
                st("Answer.", `V = ${fr(coef)}π`),
              ]
            : [
                st("Formula.", "V = {4/3}πr³"),
                st("Cube the radius.", `r³ = ${rad} × ${rad} × ${rad} = ${rad ** 3}`),
                st("Multiply by 4.", `4 × ${rad ** 3} = ${4 * rad ** 3}`),
                st("Divide by 3.", `${4 * rad ** 3} ÷ 3 = ${coef.d === 1 ? coef.n : `{${coef.n}/${coef.d}} = ${mixed(coef)}`}`),
                st("Answer.", `V = ${fr(coef)}π`),
              ],
    };
  },
};

export default [transform, similarity, angles8, pythag, distance, volume8];
