import { SKILL_BY_ID } from "../content";
import type { Level } from "../content/types";
import { addDays, daysBetween, newSkillState, today, type AppState, type AttemptMode, type SkillState } from "./state";

/** Review spacing in days after each successful retention check. */
const INTERVALS = [1, 3, 7, 14, 30, 60];

export interface AttemptInput {
  skillId: string;
  ok: boolean;
  /** Used a hint, needed a second try, or was shown steps. */
  assisted: boolean;
  mode: AttemptMode;
}

export interface AttemptOutcome {
  becameReady: boolean;
  levelUp?: SkillState["level"];
  demoted: boolean;
  /** Struggling in this skill; the session should step back. */
  struggling: boolean;
  difficultyChanged?: Level;
  xp: number;
}

function nextInterval(current: number): number {
  return INTERVALS.find((d) => d > current) ?? 60;
}

/** Records one answer and updates the skill's mastery. Mutates `state`. */
export function recordAttempt(state: AppState, input: AttemptInput, now = new Date()): AttemptOutcome {
  const day = today(now);
  const ss: SkillState = state.skills[input.skillId] ?? newSkillState();
  state.skills[input.skillId] = ss;
  const out: AttemptOutcome = { becameReady: false, demoted: false, struggling: false, xp: 0 };
  const before = ss.level;

  ss.attempts++;
  ss.lastPracticed = day;
  ss.recent = [...ss.recent, { t: now.getTime(), ok: input.ok, assisted: input.assisted, mode: input.mode }].slice(-12);
  if (ss.level === 0) {
    ss.level = 1;
    ss.dates.exploring ??= day;
  }

  if (input.ok && !input.assisted) {
    ss.p = ss.p + (1 - ss.p) * (input.mode === "review" ? 0.25 : 0.3);
    ss.correct++;
    ss.streak++;
    ss.missStreak = 0;
    if (!ss.correctDays.includes(day)) ss.correctDays = [...ss.correctDays, day].slice(-8);
    out.xp = 10 + ss.difficulty * 2;
  } else if (input.ok) {
    ss.p = ss.p + (1 - ss.p) * 0.08;
    ss.correct++;
    ss.streak = 0;
    ss.missStreak = 0;
    out.xp = 4;
  } else {
    ss.p = ss.p * 0.65;
    ss.streak = 0;
    ss.missStreak++;
    out.xp = 1;
  }

  if (ss.level === 1 && input.ok && !input.assisted) {
    ss.level = 2;
    ss.dates.practicing ??= day;
  }

  // Difficulty within the skill.
  if (ss.streak >= 3 && ss.difficulty < 3) {
    ss.difficulty = (ss.difficulty + 1) as Level;
    ss.streak = 0;
    out.difficultyChanged = ss.difficulty;
  } else if (ss.missStreak >= 2 && ss.difficulty > 1) {
    ss.difficulty = (ss.difficulty - 1) as Level;
    ss.missStreak = 0;
    out.difficultyChanged = ss.difficulty;
  }

  // Ready to build on: a strong estimate AND recent consistency without help.
  const last5 = ss.recent.slice(-5);
  const cleanRecent = last5.filter((a) => a.ok && !a.assisted).length;
  if (!ss.ready && ss.p >= 0.8 && (cleanRecent >= 4 || (ss.recent.slice(-3).every((a) => a.ok && !a.assisted) && ss.recent.length >= 3))) {
    ss.ready = true;
    out.becameReady = true;
    // First retention check tomorrow: "a single successful example is not enough".
    if (ss.level < 3) {
      ss.interval = 1;
      ss.nextReview = addDays(day, 1);
    }
  }

  if (input.mode === "review" || input.mode === "mistake") {
    if (input.ok && !input.assisted) {
      ss.reviewMiss = false;
      // A check on a later day than she first got it right confirms Independent.
      if (ss.level === 2 && ss.ready && ss.correctDays.length >= 2) {
        ss.level = 3;
        ss.dates.independent ??= day;
        ss.placed = false;
      }
      ss.interval = nextInterval(ss.interval);
      ss.nextReview = addDays(day, ss.interval);
      if (ss.level >= 3) ss.dates.recheck = day;
    } else if (ss.reviewMiss) {
      // Two misses in a row on review: this needs relearning, not just a reminder.
      ss.reviewMiss = false;
      if (ss.level >= 3 || ss.ready) out.demoted = true;
      ss.level = Math.min(ss.level, 2) as SkillState["level"];
      ss.ready = false;
      ss.p = Math.min(ss.p, 0.5);
      ss.interval = 0;
      ss.nextReview = undefined;
      ss.difficulty = 1;
    } else {
      ss.reviewMiss = true;
      ss.nextReview = day;
    }
  }

  maybeExplainLevel(ss, day);

  const window = ss.recent.slice(-4).filter((a) => a.mode === "learn" || a.mode === "free");
  out.struggling = !input.ok && window.length >= 3 && window.filter((a) => !a.ok).length >= 3;
  if (ss.level > before) out.levelUp = ss.level;
  return out;
}

/** Level 4 needs Independent + both explanation checks + a retention check a few days after Independent. */
export function maybeExplainLevel(ss: SkillState, day: string): boolean {
  if (ss.level !== 3 || !ss.whyChoice || ss.whyWritten !== "pass" || !ss.dates.independent || !ss.dates.recheck) return false;
  if (daysBetween(ss.dates.independent, ss.dates.recheck) < 2) return false;
  ss.level = 4;
  ss.dates.explain ??= day;
  return true;
}

export function recordWhyChoice(state: AppState, skillId: string, ok: boolean, now = new Date()) {
  const ss = state.skills[skillId] ?? newSkillState();
  state.skills[skillId] = ss;
  if (ok) ss.whyChoice = true;
  maybeExplainLevel(ss, today(now));
}

export function setWrittenStatus(state: AppState, skillId: string, status: SkillState["whyWritten"], now = new Date()) {
  const ss = state.skills[skillId] ?? newSkillState();
  state.skills[skillId] = ss;
  if (ss.whyWritten === "pass" && status !== "pass") return;
  ss.whyWritten = status;
  maybeExplainLevel(ss, today(now));
}

/** Mark a skill (and everything it depends on) as already known from the placement check. */
export function placeSkill(state: AppState, skillId: string, now = new Date(), seen = new Set<string>()) {
  if (seen.has(skillId)) return;
  seen.add(skillId);
  const day = today(now);
  const ss = state.skills[skillId] ?? newSkillState();
  state.skills[skillId] = ss;
  if (!ss.ready) {
    ss.ready = true;
    ss.placed = true;
    ss.level = Math.max(ss.level, 2) as SkillState["level"];
    ss.p = Math.max(ss.p, 0.8);
    ss.difficulty = 2;
    ss.dates.exploring ??= day;
    ss.dates.practicing ??= day;
    ss.interval = 1;
    // Spread the confirmation checks over the next week so warm-ups stay short.
    ss.nextReview = addDays(day, 1 + (seen.size % 6));
  }
  for (const p of SKILL_BY_ID[skillId]?.prereqs ?? []) placeSkill(state, p, now, seen);
}

/** Update the daily streak at the end of a session. */
export function bumpStreak(state: AppState, now = new Date()) {
  const day = today(now);
  const last = state.streak.lastDay;
  if (last === day) return;
  state.streak.count = last && daysBetween(last, day) === 1 ? state.streak.count + 1 : 1;
  state.streak.lastDay = day;
}
