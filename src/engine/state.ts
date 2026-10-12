import type { Level } from "../content/types";

export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

/** The roadmap's four stages, plus "not started". */
export const LEVEL_NAMES = ["Not started", "Exploring", "Practicing", "Independent", "Can explain & apply"] as const;

export interface Attempt {
  t: number;
  ok: boolean;
  assisted: boolean;
  mode: AttemptMode;
}

export type AttemptMode = "learn" | "review" | "probe" | "placement" | "challenge" | "mistake" | "free";

export interface SkillState {
  level: MasteryLevel;
  /** Running estimate (0–1) that she knows the skill. */
  p: number;
  difficulty: Level;
  /** Consecutive unassisted correct answers at the current difficulty. */
  streak: number;
  /** Consecutive misses (any mode), used to lower difficulty. */
  missStreak: number;
  recent: Attempt[];
  /** Days (yyyy-mm-dd) with at least one unassisted correct answer. */
  correctDays: string[];
  attempts: number;
  correct: number;
  /** Solid enough to build on: unlocks skills that depend on it. */
  ready: boolean;
  nextReview?: string;
  interval: number;
  /** A review was missed; the next review question decides whether to step back. */
  reviewMiss?: boolean;
  whyChoice: boolean;
  whyWritten: "none" | "pending" | "pass" | "revise";
  dates: { exploring?: string; practicing?: string; independent?: string; explain?: string; recheck?: string };
  placed?: boolean;
  lessonSeen: boolean;
  lastPracticed?: string;
}

export interface MistakeEntry {
  id: string;
  skillId: string;
  level: Level;
  prompt: string;
  given: string;
  correct: string;
  date: string;
  resolved: boolean;
}

export interface Explanation {
  id: string;
  skillId: string;
  prompt: string;
  keyIdeas: string[];
  exemplar: string;
  response: string;
  date: string;
  status: "pending" | "pass" | "revise";
  feedback?: string;
  parentNote?: string;
  gradedBy?: "claude" | "parent";
}

export interface SessionLog {
  date: string;
  minutes: number;
  answered: number;
  correct: number;
  skills: string[];
  kind: string;
}

export interface Settings {
  studentName: string;
  parentPin?: string;
  calculator: boolean;
  sessionLength: "short" | "standard";
  readAloud: boolean;
  apiKey?: string;
  model: string;
  targetDate: string;
}

export interface AppState {
  version: 1;
  createdAt: string;
  updatedAt: string;
  settings: Settings;
  skills: Record<string, SkillState>;
  xp: number;
  streak: { count: number; lastDay?: string };
  badges: string[];
  mistakes: MistakeEntry[];
  explanations: Explanation[];
  sessions: SessionLog[];
  placement: Record<string, "done" | "skipped">;
  missions: Record<string, { done: boolean; date?: string; score?: number }>;
}

export const DEFAULT_MODEL = "claude-haiku-5-5";

export function today(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return today(new Date(y, m - 1, d + n));
}

export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export function newSkillState(): SkillState {
  return {
    level: 0,
    p: 0.15,
    difficulty: 1,
    streak: 0,
    missStreak: 0,
    recent: [],
    correctDays: [],
    attempts: 0,
    correct: 0,
    ready: false,
    interval: 0,
    whyChoice: false,
    whyWritten: "none",
    dates: {},
    lessonSeen: false,
  };
}

export function newState(): AppState {
  const now = new Date().toISOString();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    settings: { studentName: "", calculator: false, sessionLength: "standard", readAloud: false, model: DEFAULT_MODEL, targetDate: "2027-01-15" },
    skills: {},
    xp: 0,
    streak: { count: 0 },
    badges: [],
    mistakes: [],
    explanations: [],
    sessions: [],
    placement: {},
    missions: {},
  };
}

export function skillState(state: AppState, id: string): SkillState {
  return state.skills[id] ?? newSkillState();
}

// ---------- Saving, export and import ----------

const KEY = "mathquest.v1";

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch {
    // fall through to a fresh state
  }
  return newState();
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function migrate(raw: unknown): AppState {
  const base = newState();
  const s = raw as Partial<AppState>;
  if (!s || typeof s !== "object" || s.version !== 1) throw new Error("Unrecognized save data");
  const skills: Record<string, SkillState> = {};
  for (const [id, v] of Object.entries(s.skills ?? {})) skills[id] = { ...newSkillState(), ...v };
  return { ...base, ...s, settings: { ...base.settings, ...s.settings }, skills };
}

export interface ExportFile {
  app: "math-quest";
  exportedAt: string;
  state: AppState;
}

/** Progress file contents. The API key stays on this computer unless asked for. */
export function exportJson(state: AppState, includeKey = false): string {
  const copy: AppState = JSON.parse(JSON.stringify(state));
  if (!includeKey) delete copy.settings.apiKey;
  const file: ExportFile = { app: "math-quest", exportedAt: new Date().toISOString(), state: copy };
  return JSON.stringify(file, null, 1);
}

export function parseImport(text: string): AppState {
  const file = JSON.parse(text) as Partial<ExportFile>;
  if (file.app !== "math-quest" || !file.state) throw new Error("This doesn't look like a Math Quest progress file.");
  return migrate(file.state);
}
