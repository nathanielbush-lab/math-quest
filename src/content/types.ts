import type { Frac } from "../lib/rational";
import type { Rng } from "../lib/rng";

export type Level = 1 | 2 | 3;

// ---------- Visual models shown with a problem or lesson ----------
export type Visual =
  | { type: "numberline"; min: number; max: number; step: number; /** Label every Nth tick, counting from min. */ labelEvery?: number; points?: { v: number; label?: string }[]; jumps?: { from: number; to: number; label?: string }[] }
  | { type: "fractionbars"; bars: { parts: number; shaded: number; label?: string }[] }
  | { type: "grid"; min: number; max: number; points?: { x: number; y: number; label?: string }[]; polygon?: { x: number; y: number }[]; lines?: { m: number; b: number; label?: string }[] }
  | { type: "table"; headers: string[]; rows: (string | number)[][]; caption?: string }
  | { type: "dotplot"; values: number[]; min: number; max: number; label?: string }
  | { type: "scatter"; points: { x: number; y: number }[]; xLabel: string; yLabel: string; line?: { m: number; b: number } }
  | { type: "tape"; rows: { label: string; segments: { text: string; size: number; shade?: boolean }[] }[] }
  | { type: "boxplot"; min: number; q1: number; median: number; q3: number; max: number; scaleMin: number; scaleMax: number }
  | { type: "dicesim"; target: number; rolls: number }
  | { type: "shape"; shape: "rect" | "triangle" | "trapezoid" | "parallelogram" | "prism" | "cylinder" | "cone" | "sphere" | "circle" | "righttriangle" | "angles"; labels: Record<string, string | undefined> };

// ---------- Answers ----------
export interface NumberField {
  value: Frac;
  /** Accept anything within this distance (for rounded answers). */
  tolerance?: number;
  pre?: string;
  post?: string;
}

export type Answer =
  | { kind: "number"; value: Frac; tolerance?: number; simplest?: boolean; unit?: string; pre?: string }
  | { kind: "multi"; fields: NumberField[]; /** Indices of fields that may be entered in any order (like a + b). */ anyOrder?: number[] }
  | { kind: "choice"; choices: string[]; correct: number; feedback?: (string | undefined)[] }
  | { kind: "point"; x: number; y: number; min: number; max: number; extraPoints?: { x: number; y: number; label?: string }[]; polygon?: { x: number; y: number }[]; lines?: { m: number; b: number; label?: string }[] };

export interface Trap {
  value: Frac;
  feedback: string;
}

export interface Problem {
  prompt: string;
  visual?: Visual;
  answer: Answer;
  /** Ordered from gentle nudge to nearly the whole method. */
  hints: string[];
  /** Full worked solution, one step per line. */
  steps: string[];
  /** Common wrong answers with feedback that names the mistake. */
  traps?: Trap[];
  /** Short estimate prompt shown first on multi-step word problems. */
  estimate?: string;
}

// ---------- "Why does it work?" items ----------
export interface WhyChoice {
  kind: "choice";
  prompt: string;
  choices: string[];
  correct: number;
  explain: string;
}

export interface WhyWritten {
  kind: "written";
  prompt: string;
  /** What a complete explanation should mention (used by the grader and the parent). */
  keyIdeas: string[];
  exemplar: string;
}

export type Why = WhyChoice | WhyWritten;

export interface Lesson {
  bigIdea: string;
  /** Short paragraphs; supports the same inline math markup as prompts. */
  explain: string[];
  visual?: Visual;
  tip?: string;
}

export type Strand = "number" | "shapes-data";

export interface Skill {
  id: string;
  title: string;
  topic: string;
  standards: string[];
  prereqs: string[];
  lesson: Lesson;
  generate: (rng: Rng, level: Level) => Problem;
  why: Why[];
}

export interface Topic {
  id: string;
  grade: 5 | 6 | 7 | 8;
  strand: Strand;
  title: string;
  standards: string;
  blurb: string;
  icon: string;
}
