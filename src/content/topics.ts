import type { Topic } from "./types";

// The roadmap's grade maps, plus a short Grade 5 foundations block.
// Strand "number" = Build: numbers and relationships. "shapes-data" = Explore alongside: shapes and data.
export const TOPICS: Topic[] = [
  { id: "g5", grade: 5, strand: "number", title: "Fraction foundations", standards: "NC.5.NF", blurb: "Equivalent fractions, adding, subtracting and multiplying fractions.", icon: "🧱" },

  { id: "g6-rp", grade: 6, strand: "number", title: "Ratios, rates and percents", standards: "NC.6.RP.1-4", blurb: "Compare quantities, use unit rates and percents, and convert units.", icon: "⚖️" },
  { id: "g6-ns", grade: 6, strand: "number", title: "Fractions, decimals and number lines", standards: "NC.6.NS.1-9", blurb: "Divide fractions, calculate with decimals, factors, multiples, negatives, absolute value and coordinates.", icon: "📏" },
  { id: "g6-ee", grade: 6, strand: "number", title: "Expressions, equations and inequalities", standards: "NC.6.EE.1-9", blurb: "Variables and powers, rewriting expressions, simple equations and inequalities.", icon: "🔤" },
  { id: "g6-g", grade: 6, strand: "shapes-data", title: "Area, surface area and volume", standards: "NC.6.G.1-4", blurb: "Areas, prism volumes, surface area with nets, and coordinate shapes.", icon: "📦" },
  { id: "g6-sp", grade: 6, strand: "shapes-data", title: "Describe data", standards: "NC.6.SP.1-5", blurb: "Statistical questions, center and spread.", icon: "📊" },

  { id: "g7-rp", grade: 7, strand: "number", title: "Proportions and percent changes", standards: "NC.7.RP.1-3", blurb: "Fractional unit rates, proportional relationships, and percent problems.", icon: "🏷️" },
  { id: "g7-ns", grade: 7, strand: "number", title: "Calculate with signed numbers", standards: "NC.7.NS.1-3", blurb: "Add, subtract, multiply and divide positive and negative numbers.", icon: "🌡️" },
  { id: "g7-ee", grade: 7, strand: "number", title: "Multistep algebra", standards: "NC.7.EE.1-4", blurb: "Rewrite expressions and solve multistep equations and inequalities.", icon: "🧮" },
  { id: "g7-g", grade: 7, strand: "shapes-data", title: "Scale, circles and angles", standards: "NC.7.G.1-2, 4-6", blurb: "Scale drawings, triangles, circles, angle relationships, area and volume.", icon: "⭕" },
  { id: "g7-sp", grade: 7, strand: "shapes-data", title: "Samples and probability", standards: "NC.7.SP.1-8", blurb: "Random samples, comparing groups, and chance.", icon: "🎲" },

  { id: "g8-pr", grade: 8, strand: "number", title: "Powers, roots and irrational numbers", standards: "NC.8.NS.1-2; NC.8.EE.1-4", blurb: "Exponent rules, square and cube roots, irrational numbers, scientific notation.", icon: "🚀" },
  { id: "g8-eq", grade: 8, strand: "number", title: "Equations and systems", standards: "NC.8.EE.7-8", blurb: "Variables on both sides and pairs of linear equations.", icon: "⚔️" },
  { id: "g8-f", grade: 8, strand: "number", title: "Functions, slope and graphs", standards: "NC.8.F.1-5", blurb: "Rules, tables and graphs; slope and starting value; linear vs nonlinear.", icon: "📈" },
  { id: "g8-g", grade: 8, strand: "shapes-data", title: "Transformations and distance", standards: "NC.8.G.2-9", blurb: "Transformations, angle reasoning, the Pythagorean theorem and volume.", icon: "🔺" },
  { id: "g8-sp", grade: 8, strand: "shapes-data", title: "Relationships in data", standards: "NC.8.SP.1-4", blurb: "Scatterplots, fitted lines and two-way tables.", icon: "🔍" },
];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

/** Six color families so every topic has a consistent color (and icon) across the app. */
export type TopicFamily = "fractions" | "ratios" | "algebra" | "number" | "geometry" | "data";

export const TOPIC_FAMILY: Record<string, TopicFamily> = {
  g5: "fractions",
  "g6-ns": "fractions",
  "g6-rp": "ratios",
  "g7-rp": "ratios",
  "g6-ee": "algebra",
  "g7-ee": "algebra",
  "g8-eq": "algebra",
  "g8-f": "algebra",
  "g7-ns": "number",
  "g8-pr": "number",
  "g6-g": "geometry",
  "g7-g": "geometry",
  "g8-g": "geometry",
  "g6-sp": "data",
  "g7-sp": "data",
  "g8-sp": "data",
};

export function familyOf(topicId: string): TopicFamily {
  return TOPIC_FAMILY[topicId] ?? "fractions";
}
