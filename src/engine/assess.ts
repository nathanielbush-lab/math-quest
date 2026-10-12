// Screener practice tests and monthly checkpoints: picking questions, scoring, saving.
// Pure logic (no React) so it can be unit-tested.
import { SKILL_BY_ID, TOPICS, TOPIC_BY_ID, skillsInTopic } from "../content";
import type { Level, Problem, Skill, Topic } from "../content/types";
import { makeRng, type Rng } from "../lib/rng";
import { answerText, check, type Response } from "./check";
import { addDays, daysBetween, logEvent, today, type AppState, type AssessmentResult, type MistakeEntry } from "./state";

export type AssessKind = "screener-full" | "screener-quick" | "checkpoint";

export const ASSESS_SPEC: Record<AssessKind, { count: number; minutes: number; title: string; icon: string }> = {
  "screener-full": { count: 30, minutes: 45, title: "Full practice test", icon: "📝" },
  "screener-quick": { count: 12, minutes: 15, title: "Quick practice test", icon: "⚡" },
  checkpoint: { count: TOPICS.length, minutes: 0, title: "Monthly checkpoint", icon: "📅" },
};

/** Days between checkpoints. */
export const CHECKPOINT_DAYS = 28;

/** One question on a test. The seed and level re-create the same problem every time it's shown. */
export interface TestItem {
  skillId: string;
  topic: string;
  seed: number;
  level: Level;
}

/** How she answered one question while taking the test. */
export interface ItemAnswer {
  response: Response | null;
  flagged: boolean;
  /** Seconds spent on this question's screen (all visits added up). */
  secs: number;
}

export function problemFor(item: TestItem): Problem {
  return SKILL_BY_ID[item.skillId].generate(makeRng(item.seed), item.level);
}

// ---------- Picking questions ----------

const SCREENER_GRADES = [6, 7, 8] as const;
const GRADE_SHARE: Record<number, number> = { 6: 0.3, 7: 0.35, 8: 0.35 };

/** How many questions come from each grade (about 30% / 35% / 35%). */
export function gradeQuotas(n: number): Record<6 | 7 | 8, number> {
  const g6 = Math.round(n * GRADE_SHARE[6]);
  const g7 = Math.round(n * GRADE_SHARE[7]);
  return { 6: g6, 7: g7, 8: n - g6 - g7 };
}

const seen = (state: AppState, id: string) => (state.skills[id]?.attempts ?? 0) > 0;

/** Weighted pick without replacement. Returns the index. */
function weightedIndex(rng: Rng, weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng.next() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}

/**
 * Pick `count` skills from a topic: different skills where possible, leaning toward ones she
 * has practiced (weight 3) but still including new ones (weight 1) — real tests don't wait.
 */
function pickSkills(state: AppState, topic: Topic, count: number, rng: Rng, used: Set<string>): Skill[] {
  const out: Skill[] = [];
  const all = skillsInTopic(topic.id);
  for (let k = 0; k < count; k++) {
    let pool = all.filter((s) => !used.has(s.id));
    if (!pool.length) pool = all; // more slots than skills: repeat (with a different seed)
    const s = pool[weightedIndex(rng, pool.map((x) => (seen(state, x.id) ? 3 : 1)))];
    used.add(s.id);
    out.push(s);
  }
  return out;
}

/** Spread `k` slots over a grade's topics, at least one per strand, at least one per topic when k allows. */
function allocateTopics(topics: Topic[], k: number, rng: Rng): Map<Topic, number> {
  const counts = new Map<Topic, number>(topics.map((t) => [t, 0]));
  if (k >= topics.length) {
    for (const t of topics) counts.set(t, 1);
    for (let r = k - topics.length; r > 0; r--) {
      // Favor topics with room left (more skills than slots so far).
      const weights = topics.map((t) => Math.max(0.1, skillsInTopic(t.id).length - counts.get(t)!));
      const t = topics[weightedIndex(rng, weights)];
      counts.set(t, counts.get(t)! + 1);
    }
    return counts;
  }
  const chosen: Topic[] = [];
  const strands = [...new Set(topics.map((t) => t.strand))];
  if (k >= strands.length) for (const st of rng.shuffle(strands)) chosen.push(rng.pick(topics.filter((t) => t.strand === st)));
  for (const t of rng.shuffle(topics)) {
    if (chosen.length >= k) break;
    if (!chosen.includes(t)) chosen.push(t);
  }
  for (const t of chosen.slice(0, k)) counts.set(t, 1);
  return counts;
}

/** Roughly 30% of questions at level 3, the rest at level 2. */
function assignLevels(items: TestItem[], rng: Rng) {
  const hard = Math.round(items.length * 0.3);
  const order = rng.shuffle(items.map((_, i) => i));
  order.forEach((idx, k) => (items[idx].level = k < hard ? 3 : 2));
}

const newSeed = (rng: Rng) => rng.int(1, 2 ** 31 - 1);

/** Questions for a screener practice test: Grade 6, 7 and 8 topics, easier grades first. */
export function pickScreenerItems(state: AppState, kind: "screener-full" | "screener-quick", seed: number): TestItem[] {
  const rng = makeRng(seed);
  const quotas = gradeQuotas(ASSESS_SPEC[kind].count);
  const used = new Set<string>();
  const out: TestItem[] = [];
  for (const g of SCREENER_GRADES) {
    const topics = TOPICS.filter((t) => t.grade === g);
    const counts = allocateTopics(topics, quotas[g], rng);
    const gradeItems: TestItem[] = [];
    for (const t of topics) {
      for (const s of pickSkills(state, t, counts.get(t)!, rng, used)) gradeItems.push({ skillId: s.id, topic: t.id, seed: newSeed(rng), level: 2 });
    }
    out.push(...rng.shuffle(gradeItems));
  }
  assignLevels(out, rng);
  return out;
}

/** One level-2 question from every topic (Grade 5–8), in map order. */
export function pickCheckpointItems(state: AppState, seed: number): TestItem[] {
  const rng = makeRng(seed);
  const used = new Set<string>();
  return TOPICS.map((t) => {
    const [s] = pickSkills(state, t, 1, rng, used);
    return { skillId: s.id, topic: t.id, seed: newSeed(rng), level: 2 as Level };
  });
}

export function pickItems(state: AppState, kind: AssessKind, seed: number): TestItem[] {
  return kind === "checkpoint" ? pickCheckpointItems(state, seed) : pickScreenerItems(state, kind, seed);
}

// ---------- Answers ----------

const minus = (t: string) => t.trim().replace(/^-/, "−");

/** Her answer as text (for the results page and the mistake journal). */
export function describeResponse(problem: Problem, r: Response): string {
  switch (r.kind) {
    case "number":
      return minus(r.text);
    case "multi":
      return r.texts.map(minus).join(" , ");
    case "choice":
      return problem.answer.kind === "choice" ? problem.answer.choices[r.index] : String(r.index);
    case "point":
      return `(${r.x}, ${r.y})`.replace(/-/g, "−");
  }
}

/** True when the response can't be read as an answer at all (an unreadable number), so it isn't saved. */
export function unreadable(problem: Problem, r: Response): string | null {
  const v = check(problem, r);
  return v.verdict === "invalid" ? v.message ?? "I couldn't read that. Try a number like 12, −3, 0.75 or 3/4." : null;
}

export interface ScoredItem {
  item: TestItem;
  problem: Problem;
  ok: boolean;
  skipped: boolean;
  given: string;
  correct: string;
  secs: number;
  flagged: boolean;
}

/**
 * Mark every question. "Almost" (right amount, not in simplest form when simplest form was asked)
 * counts as a miss, as it would on a real test.
 */
export function scoreTest(items: TestItem[], answers: ItemAnswer[]): ScoredItem[] {
  return items.map((item, i) => {
    const problem = problemFor(item);
    const a = answers[i] ?? { response: null, flagged: false, secs: 0 };
    const correct = answerText(problem.answer);
    if (!a.response) return { item, problem, ok: false, skipped: true, given: "", correct, secs: Math.round(a.secs), flagged: a.flagged };
    const ok = check(problem, a.response).verdict === "correct";
    return { item, problem, ok, skipped: false, given: describeResponse(problem, a.response), correct, secs: Math.round(a.secs), flagged: a.flagged };
  });
}

// ---------- Saving ----------

export const STARS_PER_CORRECT = 5;
export const FINISH_BONUS = 20;

/** Same shape as the session's mistake-journal entries, so missed test questions come back later with fresh numbers. */
export function mistakeEntry(skillId: string, level: Level, prompt: string, given: string, correct: string, day = today()): MistakeEntry {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    skillId,
    level,
    prompt,
    given,
    correct,
    date: day,
    resolved: false,
  };
}

/**
 * Save a finished test: the result, one attempt event per answered question, missed questions in
 * the mistake journal, and stars. Mastery levels are deliberately NOT changed: a test is a snapshot
 * taken without hints or feedback (and with skills she may not have learned yet), not practice, so
 * it shouldn't push skills up or down. Practice sessions do that.
 * Returns the saved result and the stars earned.
 */
export function saveTest(s: AppState, kind: AssessKind, scored: ScoredItem[], secsUsed: number, now = new Date()): { result: AssessmentResult; stars: number } {
  const day = today(now);
  const result: AssessmentResult = {
    id: `${kind}-${now.getTime().toString(36)}`,
    kind,
    date: day,
    minutes: Math.max(1, Math.round(secsUsed / 60)),
    items: scored.map((x) => ({
      skillId: x.item.skillId,
      topic: x.item.topic,
      ok: x.ok,
      ...(x.skipped ? { skipped: true } : {}),
      prompt: x.problem.prompt,
      given: x.given,
      correct: x.correct,
      secs: x.secs,
    })),
  };
  s.assessments.push(result);
  const mode = kind === "checkpoint" ? "checkpoint" : "screener";
  for (const x of scored) {
    // Unanswered questions aren't logged: she didn't try them, so they say nothing about the skill.
    if (x.skipped) continue;
    logEvent(s, { t: now.getTime(), skill: x.item.skillId, level: x.item.level, mode, ok: x.ok, assisted: false, tries: 0, hints: 0, secs: x.secs });
    if (!x.ok && !s.mistakes.some((m) => !m.resolved && m.skillId === x.item.skillId && m.level === x.item.level)) {
      s.mistakes = [...s.mistakes, mistakeEntry(x.item.skillId, x.item.level, x.problem.prompt, x.given, x.correct, day)].slice(-200);
    }
  }
  const stars = scored.filter((x) => x.ok).length * STARS_PER_CORRECT + FINISH_BONUS;
  s.xp += stars;
  return { result, stars };
}

// ---------- Readiness and comparisons ----------

export type BandId = "ready" | "close" | "building";

export function readinessBand(pct: number): { id: BandId; label: string; text: string } {
  if (pct >= 80) return { id: "ready", label: "Looking ready", text: "You handled most of these on your own. Keep your skills fresh with your daily quests." };
  if (pct >= 60) return { id: "close", label: "Getting close", text: "You know a lot of this already. A little more practice on the topics below will help." };
  return { id: "building", label: "Keep building", text: "That's what practice is for! Every question you missed shows you what to work on next." };
}

export function scoreOf(r: AssessmentResult): { right: number; total: number; pct: number } {
  const right = r.items.filter((i) => i.ok).length;
  const total = r.items.length;
  return { right, total, pct: total ? Math.round((right / total) * 100) : 0 };
}

export interface TopicScore {
  topic: Topic;
  right: number;
  total: number;
}

/** Right/total per topic, in map order. */
export function topicScores(items: { topic: string; ok: boolean }[]): TopicScore[] {
  return TOPICS.filter((t) => items.some((i) => i.topic === t.id)).map((t) => {
    const mine = items.filter((i) => i.topic === t.id);
    return { topic: t, right: mine.filter((i) => i.ok).length, total: mine.length };
  });
}

/**
 * Strongest and weakest topics: the topics tied for the best share right (if above 0) and those
 * tied for the lowest (if below 100%), at most `max` each. Ties go to topics with more questions,
 * then map order. Both are empty when every topic scored the same.
 */
export function strongWeak(items: { topic: string; ok: boolean }[], max = 3): { strongest: TopicScore[]; weakest: TopicScore[] } {
  const ts = topicScores(items);
  const rate = (t: TopicScore) => t.right / t.total;
  const rates = ts.map(rate);
  const hi = Math.max(...rates), lo = Math.min(...rates);
  if (ts.length < 2 || hi === lo) return { strongest: [], weakest: [] };
  const byTotal = (a: TopicScore, b: TopicScore) => b.total - a.total;
  return {
    strongest: hi > 0 ? ts.filter((t) => rate(t) === hi).sort(byTotal).slice(0, max) : [],
    weakest: lo < 1 ? ts.filter((t) => rate(t) === lo).sort(byTotal).slice(0, max) : [],
  };
}

export type Change = "up" | "down" | "same";

/** Per-topic changes since the previous checkpoint, plus overall scores. */
export function compareCheckpoints(prev: AssessmentResult | undefined, cur: AssessmentResult): { before?: number; after: number; total: number; topics: Record<string, Change> } {
  const after = cur.items.filter((i) => i.ok).length;
  if (!prev) return { after, total: cur.items.length, topics: {} };
  const topics: Record<string, Change> = {};
  for (const it of cur.items) {
    const was = prev.items.find((p) => p.topic === it.topic);
    if (!was) continue;
    topics[it.topic] = it.ok === was.ok ? "same" : it.ok ? "up" : "down";
  }
  return { before: prev.items.filter((i) => i.ok).length, after, total: cur.items.length, topics };
}

// ---------- When is the checkpoint due? ----------

export function checkpoints(s: AppState): AssessmentResult[] {
  return s.assessments.filter((a) => a.kind === "checkpoint");
}

export function lastCheckpoint(s: AppState): AssessmentResult | undefined {
  const all = checkpoints(s);
  return all[all.length - 1];
}

/** She's done enough to make a checkpoint fair: 3 practice sessions, or a starting-point check. */
export function checkpointEligible(s: AppState): boolean {
  return s.sessions.length >= 3 || Object.values(s.placement).some((v) => v === "done");
}

/** Due when there's no checkpoint in the last 28 days and she's past day one. */
export function checkpointDue(s: AppState, day = today()): boolean {
  const last = lastCheckpoint(s);
  if (last && daysBetween(last.date, day) < CHECKPOINT_DAYS) return false;
  return checkpointEligible(s);
}

/** The day the next checkpoint opens (undefined before the first one: it opens once she's eligible). */
export function nextCheckpointDate(s: AppState): string | undefined {
  const last = lastCheckpoint(s);
  return last ? addDays(last.date, CHECKPOINT_DAYS) : undefined;
}

// ---------- Timer ----------

/** Seconds left on the clock (never below 0). */
export function secondsLeft(limitSecs: number, startedAt: number, now: number): number {
  return Math.max(0, Math.ceil(limitSecs - (now - startedAt) / 1000));
}

export const WARN_SECS = 5 * 60;

export function fmtClock(secs: number): string {
  const s = Math.max(0, Math.round(secs));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function topicTitle(id: string): string {
  return TOPIC_BY_ID[id]?.title ?? id;
}
