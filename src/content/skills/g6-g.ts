import { add, frac, mul } from "../../lib/rational";
import { F, fr, mixed, num, trap, traps } from "../helpers";
import type { Skill } from "../types";

const T = "g6-g";

const area: Skill = {
  id: "g6.g.area",
  title: "Area of triangles, parallelograms and trapezoids",
  topic: T,
  standards: ["NC.6.G.1"],
  prereqs: ["g5.multiply"],
  lesson: {
    bigIdea: "Every one of these shapes comes from a rectangle: cut and rearrange it, or take half of it.",
    explain: [
      "**Parallelogram:** slide the triangle from one end to the other to make a rectangle. Area = base × height.",
      "**Triangle:** two identical triangles make a parallelogram, so Area = {1/2} × base × height.",
      "**Trapezoid:** two identical trapezoids make a parallelogram with base b₁ + b₂, so Area = {1/2} × (b₁ + b₂) × h.",
      "The height is always measured at a right angle to the base, not along the slanted side.",
    ],
    visual: { type: "shape", shape: "triangle", labels: { base: "b", height: "h" } },
  },
  why: [
    { kind: "choice", prompt: "Why does the triangle area formula have {1/2} in it?", choices: ["Two copies of the same triangle make a parallelogram with area b × h, so one triangle is half of that.", "Because triangles have 3 sides.", "To make the number smaller."], correct: 0, explain: "A triangle is half of a parallelogram with the same base and height." },
    { kind: "written", prompt: "Explain why a parallelogram has the same area as a rectangle with the same base and height.", keyIdeas: ["cut a right triangle off one end", "move it to the other end to form a rectangle", "nothing is added or removed, so area = base × height"], exemplar: "If I cut the triangle off one side of the parallelogram and slide it to the other side, it makes a rectangle with the same base and height. No area was added or lost, so the area is base × height." },
  ],
  generate(r, lv) {
    const shape = lv === 1 ? r.pick(["triangle", "parallelogram"]) : lv === 2 ? r.pick(["triangle", "parallelogram", "trapezoid"]) : "trapezoid";
    const b = r.int(3, 16);
    const h = r.int(2, 12);
    const unit = r.pick(["cm", "in", "m", "ft"]);
    if (shape === "triangle") {
      const A = F(b * h, 2);
      return {
        prompt: `A triangle has a base of ${b} ${unit} and a height of ${h} ${unit}. What is its area in square ${unit}?`,
        visual: { type: "shape", shape: "triangle", labels: { base: `${b} ${unit}`, height: `${h} ${unit}` } },
        answer: num(A),
        hints: ["Area of a triangle = {1/2} × base × height.", `{1/2} × ${b} × ${h}`],
        steps: [`${b} × ${h} = ${b * h}`, `{1/2} × ${b * h} = ${mixed(A)} square ${unit}`],
        traps: traps(A, [trap(b * h, "That's the area of the parallelogram. A triangle is half of it."), trap(b + h, "Area multiplies the base and height.")]),
      };
    }
    if (shape === "parallelogram") {
      const side = h + r.int(1, 4);
      return {
        prompt: `A parallelogram has a base of ${b} ${unit}, a slanted side of ${side} ${unit}, and a height of ${h} ${unit}. What is its area in square ${unit}?`,
        visual: { type: "shape", shape: "parallelogram", labels: { base: `${b} ${unit}`, height: `${h} ${unit}`, side: `${side} ${unit}` } },
        answer: num(b * h),
        hints: ["Area of a parallelogram = base × height.", "Use the height (straight up), not the slanted side."],
        steps: [`${b} × ${h} = ${b * h} square ${unit}`],
        traps: traps(F(b * h), [trap(b * side, "Use the height, measured at a right angle to the base, not the slanted side."), trap(F(b * h, 2), "That's a triangle's formula. A parallelogram is base × height.")]),
      };
    }
    const b2 = b + r.int(1, 8);
    const A = F((b + b2) * h, 2);
    return {
      prompt: `A trapezoid has parallel sides of ${b} ${unit} and ${b2} ${unit}, and a height of ${h} ${unit}. What is its area in square ${unit}?`,
      visual: { type: "shape", shape: "trapezoid", labels: { top: `${b} ${unit}`, base: `${b2} ${unit}`, height: `${h} ${unit}` } },
      answer: num(A),
      hints: ["Area = {1/2} × (b₁ + b₂) × h.", `{1/2} × (${b} + ${b2}) × ${h}`],
      steps: [`${b} + ${b2} = ${b + b2}`, `${b + b2} × ${h} = ${(b + b2) * h}`, `{1/2} × ${(b + b2) * h} = ${mixed(A)} square ${unit}`],
      traps: traps(A, [trap((b + b2) * h, "Remember the {1/2}: two trapezoids make one parallelogram."), trap(b2 * h, "Use both parallel sides: add them first.")]),
    };
  },
};

const composite: Skill = {
  id: "g6.g.composite",
  title: "Area of composite shapes",
  topic: T,
  standards: ["NC.6.G.1"],
  prereqs: ["g6.g.area"],
  lesson: {
    bigIdea: "Break a complicated shape into rectangles and triangles, or subtract a missing piece from a bigger rectangle.",
    explain: [
      "An L-shape can be split into two rectangles. Find each area and add.",
      "Or: draw the big rectangle around it and subtract the missing corner. Both ways give the same answer, which makes a great check!",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can you find an L-shape's area by subtracting?", choices: ["The L is a big rectangle with a corner rectangle removed, so its area is the big area minus the corner area.", "Because subtraction is easier.", "You can't; you must add."], correct: 0, explain: "Adding pieces and subtracting a missing piece both work." },
    { kind: "written", prompt: "Explain two different ways to find the area of an L-shaped room.", keyIdeas: ["split it into two rectangles and add their areas", "or make a big rectangle around it and subtract the missing corner", "both methods should give the same answer"], exemplar: "One way is to cut the L into two rectangles, find each area, and add them. Another way is to imagine the full rectangle around the L and subtract the area of the missing corner. Both should match, which checks my work." },
  ],
  generate(r, lv) {
    const W = r.int(6, 11);
    const H = r.int(6, 11);
    const w = r.int(2, W - 3);
    const h = r.int(2, H - 3);
    const poly = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H - h }, { x: W - w, y: H - h }, { x: W - w, y: H }, { x: 0, y: H }];
    if (lv < 3) {
      const ans = W * H - w * h;
      return {
        prompt: `Each grid square is 1 unit. What is the area of the shaded shape in square units?`,
        visual: { type: "grid", min: 0, max: 12, polygon: poly },
        answer: num(ans),
        hints: [`The outer rectangle is ${W} by ${H}.`, `The missing corner is ${w} by ${h}. Subtract its area.`],
        steps: [`Big rectangle: ${W} × ${H} = ${W * H}`, `Missing corner: ${w} × ${h} = ${w * h}`, `${W * H} − ${w * h} = ${ans} square units`],
        traps: traps(F(ans), [trap(W * H, "Don't forget to take away the missing corner."), trap(2 * (W + H), "That's the perimeter. Area counts the squares inside.")]),
      };
    }
    const tri = r.int(2, 6);
    const ans = F(2 * W * H + tri * W, 2);
    return {
      prompt: `A shape is made of a ${W} by ${H} rectangle with a triangle on top. The triangle's base is the rectangle's ${W}-unit side, and its height is ${tri} units. What is the total area?`,
      visual: { type: "grid", min: 0, max: 18, polygon: [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: W / 2, y: H + tri }, { x: 0, y: H }] },
      answer: num(ans),
      hints: ["Find the rectangle's area and the triangle's area separately.", `Triangle: {1/2} × ${W} × ${tri}.`],
      steps: [`Rectangle: ${W} × ${H} = ${W * H}`, `Triangle: {1/2} × ${W} × ${tri} = ${fr(F(W * tri, 2))}`, `Total: ${mixed(ans)} square units`],
      traps: traps(ans, [trap(W * H + W * tri, "The triangle's area needs the {1/2}.")]),
    };
  },
};

const volume: Skill = {
  id: "g6.g.volume",
  title: "Volume of rectangular prisms",
  topic: T,
  standards: ["NC.6.G.2"],
  prereqs: ["g5.multiply"],
  lesson: {
    bigIdea: "Volume counts the cubes that fill a box: V = length × width × height.",
    explain: [
      "A 4 by 3 by 2 box: the bottom layer holds 4 × 3 = 12 cubes, and there are 2 layers, so it holds **24 cubic units**.",
      "Fractional edges work the same way: a box {1/2} by 3 by 4 has V = {1/2} × 3 × 4 = 6 cubic units.",
    ],
    visual: { type: "shape", shape: "prism", labels: { l: "4", w: "3", h: "2" } },
    tip: "Volume is measured in cubic units (cm³, in³): it's 3-D.",
  },
  why: [
    { kind: "choice", prompt: "Why does multiplying length × width × height give the volume?", choices: ["length × width counts the cubes in one layer, and height counts how many layers.", "Because a box has three numbers.", "It gives the surface area."], correct: 0, explain: "Layers of cubes." },
    { kind: "written", prompt: "Explain how many 1-inch cubes fill a box that is 5 in long, 2 in wide and 3 in tall.", keyIdeas: ["the bottom layer has 5 × 2 = 10 cubes", "there are 3 layers", "10 × 3 = 30 cubes (30 cubic inches)"], exemplar: "The bottom layer is 5 by 2, so it holds 10 cubes. The box is 3 inches tall, so there are 3 layers. 10 × 3 = 30 cubes, which is 30 cubic inches." },
  ],
  generate(r, lv) {
    let l = F(r.int(2, 10)), w = F(r.int(2, 8)), h = F(r.int(2, 6));
    if (lv >= 2) h = F(r.int(1, 5), 2);
    if (lv === 3) l = frac(r.int(3, 9), 2);
    const V = mul(mul(l, w), h);
    const ask = lv === 3 && r.chance(0.5);
    if (ask) {
      return {
        prompt: `A box has a volume of ${mixed(V)} cubic feet. Its base is ${mixed(l)} ft by ${mixed(w)} ft. How tall is it?`,
        answer: num(h),
        hints: ["V = l × w × h, so h = V ÷ (l × w).", `Area of the base: ${mixed(l)} × ${mixed(w)} = ${mixed(mul(l, w))}.`],
        steps: [`Base area = ${mixed(mul(l, w))}`, `h = ${mixed(V)} ÷ ${mixed(mul(l, w))} = ${mixed(h)} ft`],
      };
    }
    return {
      prompt: `A rectangular box is ${mixed(l)} ft long, ${mixed(w)} ft wide and ${mixed(h)} ft tall. What is its volume in cubic feet?`,
      visual: { type: "shape", shape: "prism", labels: { l: mixed(l), w: mixed(w), h: mixed(h) } },
      answer: num(V),
      hints: ["V = length × width × height.", `${mixed(l)} × ${mixed(w)} × ${mixed(h)}`],
      steps: [`${mixed(l)} × ${mixed(w)} = ${mixed(mul(l, w))}`, `${mixed(mul(l, w))} × ${mixed(h)} = ${mixed(V)} cubic feet`],
      traps: traps(V, [trap(add(add(l, w), h), "Volume multiplies the three dimensions.")]),
    };
  },
};

const surface: Skill = {
  id: "g6.g.surface",
  title: "Surface area with nets",
  topic: T,
  standards: ["NC.6.G.4"],
  prereqs: ["g6.g.area", "g6.g.volume"],
  lesson: {
    bigIdea: "Surface area is the total area of all the faces, like the cardboard needed to make a box.",
    explain: [
      "Unfold a box into a **net**: 6 rectangles in 3 matching pairs (top/bottom, front/back, left/right).",
      "For a 4 by 3 by 2 box: 2(4 × 3) + 2(4 × 2) + 2(3 × 2) = 24 + 16 + 12 = **52 square units**.",
      "An open box (no top) has only 5 faces.",
    ],
    tip: "Surface area is in square units; volume is in cubic units.",
  },
  why: [
    { kind: "choice", prompt: "Why do we multiply each face area by 2 for a closed box?", choices: ["Faces come in matching pairs: top and bottom, front and back, left and right.", "Because a box has 2 sides.", "To get the volume."], correct: 0, explain: "Opposite faces are identical rectangles." },
    { kind: "written", prompt: "Explain how a net helps you find the cardboard needed for a 4 by 3 by 2 box.", keyIdeas: ["unfolding shows all 6 faces flat", "find the area of each rectangle", "add them: 24 + 16 + 12 = 52 square units"], exemplar: "A net unfolds the box so I can see all 6 faces as rectangles. There are two 4×3 faces (24), two 4×2 faces (16) and two 3×2 faces (12). Adding them gives 52 square units of cardboard." },
  ],
  generate(r, lv) {
    const l = r.int(2, 10);
    const w = r.int(2, 8);
    const h = r.int(1, 6);
    if (lv === 1) {
      const s = r.int(2, 9);
      return {
        prompt: `A cube has edges of ${s} cm. What is its surface area in square centimeters?`,
        answer: num(6 * s * s),
        hints: ["A cube has 6 identical square faces.", `One face is ${s} × ${s} = ${s * s}.`],
        steps: [`One face: ${s * s}`, `6 faces: 6 × ${s * s} = ${6 * s * s} cm²`],
        traps: traps(F(6 * s * s), [trap(s ** 3, "That's the volume. Surface area adds up the 6 faces."), trap(4 * s * s, "A cube has 6 faces, not 4.")]),
      };
    }
    const open = lv === 3;
    const SA = 2 * (l * w + l * h + w * h) - (open ? l * w : 0);
    return {
      prompt: `${open ? "An open box (no top)" : "A closed box"} is ${l} in long, ${w} in wide and ${h} in tall. How many square inches of cardboard cover its outside?`,
      visual: { type: "shape", shape: "prism", labels: { l: String(l), w: String(w), h: String(h) } },
      answer: num(SA),
      hints: [`Find the three different face areas: ${l} × ${w}, ${l} × ${h}, ${w} × ${h}.`, open ? "There are 2 of each, except only 1 bottom (no top)." : "There are 2 of each face."],
      steps: [`${l} × ${w} = ${l * w}, ${l} × ${h} = ${l * h}, ${w} × ${h} = ${w * h}`, open ? `${l * w} + 2(${l * h}) + 2(${w * h}) = ${SA}` : `2(${l * w} + ${l * h} + ${w * h}) = ${SA}`, `${SA} square inches`],
      traps: traps(F(SA), [trap(l * w * h, "That's the volume. Surface area adds the areas of the faces."), trap(l * w + l * h + w * h, "Each face has a matching opposite face, so count each pair twice.")]),
    };
  },
};

const coordPolygons: Skill = {
  id: "g6.g.coord-polygons",
  title: "Polygons on the coordinate plane",
  topic: T,
  standards: ["NC.6.G.3"],
  prereqs: ["g6.ns.coords"],
  lesson: {
    bigIdea: "When two vertices share an x or y value, the side length is the difference of the other coordinates.",
    explain: [
      "Rectangle with vertices (−2, 1), (4, 1), (4, 5), (−2, 5): width = 4 − (−2) = 6, height = 5 − 1 = 4, area = 24.",
      "This is how mapmakers and game designers measure on grids.",
    ],
    visual: { type: "grid", min: -6, max: 6, polygon: [{ x: -2, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 5 }, { x: -2, y: 5 }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the distance from (−2, 1) to (4, 1) equal to 6?", choices: ["They're on the same horizontal line; from −2 to 0 is 2 and from 0 to 4 is 4, for 6 in all.", "Because 4 − 2 = 2.", "Because −2 + 4 = 2."], correct: 0, explain: "Count across 0: 2 + 4." },
    { kind: "written", prompt: "Explain how to find the perimeter of a rectangle with vertices (1, 2), (7, 2), (7, 6) and (1, 6).", keyIdeas: ["width = 7 − 1 = 6", "height = 6 − 2 = 4", "perimeter = 2(6 + 4) = 20"], exemplar: "The bottom side goes from x = 1 to x = 7, so it's 6 long. The right side goes from y = 2 to y = 6, so it's 4 tall. Perimeter = 6 + 4 + 6 + 4 = 20 units." },
  ],
  generate(r, lv) {
    const x1 = r.int(-6, 2);
    const x2 = x1 + r.int(2, 6);
    const y1 = r.int(-6, 2);
    const y2 = y1 + r.int(2, 6);
    const poly = [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }];
    const pts = poly.map((p) => `(${p.x < 0 ? "−" + -p.x : p.x}, ${p.y < 0 ? "−" + -p.y : p.y})`).join(", ");
    if (lv === 1) {
      return {
        prompt: `A rectangle has vertices ${pts}. How long is its bottom side?`,
        visual: { type: "grid", min: -9, max: 9, polygon: poly },
        answer: num(x2 - x1),
        hints: ["The bottom vertices share the same y-coordinate.", `Find the distance from x = ${x1} to x = ${x2}.`],
        steps: [`${x2} − (${x1}) = ${x2 - x1}`],
      };
    }
    if (lv === 2) {
      return {
        prompt: `A rectangle has vertices ${pts}. What is its area?`,
        visual: { type: "grid", min: -9, max: 9, polygon: poly },
        answer: num((x2 - x1) * (y2 - y1)),
        hints: ["Find the width and the height from the coordinates.", `Width ${x2 - x1}, height ${y2 - y1}.`],
        steps: [`width = ${x2 - x1}, height = ${y2 - y1}`, `area = ${(x2 - x1) * (y2 - y1)}`],
        traps: traps(F((x2 - x1) * (y2 - y1)), [trap(2 * (x2 - x1 + y2 - y1), "That's the perimeter. Area = width × height.")]),
      };
    }
    const missing = r.int(0, 3);
    const p = poly[missing];
    return {
      prompt: `Three corners of a rectangle are shown. Click where the fourth corner goes.`,
      answer: { kind: "point", x: p.x, y: p.y, min: -9, max: 9, extraPoints: poly.filter((_, i) => i !== missing) },
      hints: ["Rectangle sides are horizontal and vertical here.", "The missing corner shares its x-coordinate with one point and its y-coordinate with another."],
      steps: [`The fourth corner is (${p.x}, ${p.y})`],
    };
  },
};

export default [area, composite, volume, surface, coordPolygons];

