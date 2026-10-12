import { describe, expect, it } from "vitest";
import { ORDERED, SKILLS, SKILL_BY_ID, TOPICS } from "../src/content";
import { makeRng } from "../src/lib/rng";
import { canonicalResponse, check } from "../src/engine/check";
import { toNum } from "../src/lib/rational";
import type { Level, Problem } from "../src/content/types";

const SEEDS = 250;

function textOf(p: Problem): string {
  const a = p.answer;
  const extra = a.kind === "choice" ? a.choices.join(" | ") + (a.feedback ?? []).join(" ") : "";
  return [p.prompt, ...p.hints, ...p.steps, ...(p.traps ?? []).map((t) => t.feedback), extra, JSON.stringify(p.visual ?? {})].join("\n");
}

describe("skill graph", () => {
  it("has unique ids and valid topics", () => {
    expect(new Set(SKILLS.map((s) => s.id)).size).toBe(SKILLS.length);
    const topics = new Set(TOPICS.map((t) => t.id));
    for (const s of SKILLS) expect(topics.has(s.topic), s.id).toBe(true);
  });
  it("has known prerequisites and no cycles", () => {
    for (const s of SKILLS) for (const p of s.prereqs) expect(SKILL_BY_ID[p], `${s.id} → ${p}`).toBeDefined();
    expect(ORDERED.length).toBe(SKILLS.length);
    const pos = new Map(ORDERED.map((s, i) => [s.id, i]));
    for (const s of SKILLS) for (const p of s.prereqs) expect(pos.get(p)!).toBeLessThan(pos.get(s.id)!);
  });
  it("every topic has skills, and every skill has a lesson and both kinds of why-question", () => {
    for (const t of TOPICS) expect(SKILLS.some((s) => s.topic === t.id), t.id).toBe(true);
    for (const s of SKILLS) {
      expect(s.lesson.explain.length, s.id).toBeGreaterThan(0);
      expect(s.why.some((w) => w.kind === "choice"), s.id).toBe(true);
      expect(s.why.some((w) => w.kind === "written"), s.id).toBe(true);
      for (const w of s.why) if (w.kind === "choice") expect(w.correct).toBeLessThan(w.choices.length);
    }
  });
});

describe.each(SKILLS.map((s) => [s.id, s] as const))("generator %s", (_id, skill) => {
  it.each([1, 2, 3] as Level[])("level %i produces valid, self-consistent problems", (lv) => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = skill.generate(makeRng(seed * 7919 + lv), lv);
      const where = `${skill.id} L${lv} seed ${seed}: ${p.prompt}`;
      const txt = textOf(p);
      expect(txt, where).not.toMatch(/undefined|NaN|Infinity|\[object Object\]/);
      expect(p.prompt.length, where).toBeGreaterThan(5);
      expect(p.hints.length, where).toBeGreaterThan(0);
      expect(p.steps.length, where).toBeGreaterThan(0);
      const a = p.answer;
      if (a.kind === "number") {
        expect(Number.isFinite(toNum(a.value)), where).toBe(true);
        expect(a.value.d, where).toBeGreaterThan(0);
      }
      if (a.kind === "multi") for (const f of a.fields) expect(Number.isFinite(toNum(f.value)), where).toBe(true);
      if (a.kind === "choice") {
        expect(a.choices.length, where).toBeGreaterThanOrEqual(2);
        expect(new Set(a.choices).size, where).toBe(a.choices.length);
        expect(a.correct, where).toBeGreaterThanOrEqual(0);
        expect(a.correct, where).toBeLessThan(a.choices.length);
      }
      if (a.kind === "point") {
        expect(a.x, where).toBeGreaterThanOrEqual(a.min);
        expect(a.x, where).toBeLessThanOrEqual(a.max);
        expect(a.y, where).toBeGreaterThanOrEqual(a.min);
        expect(a.y, where).toBeLessThanOrEqual(a.max);
        expect(Number.isInteger(a.x) && Number.isInteger(a.y), where).toBe(true);
      }
      expect(check(p, canonicalResponse(a)).verdict, where).toBe("correct");
      for (const t of p.traps ?? []) {
        expect(check(p, { kind: "number", text: `${t.value.n}/${t.value.d}` }).verdict, `${where} trap ${t.value.n}/${t.value.d}`).not.toBe("correct");
      }
    }
  });
});

import { CHALLENGES, MISSIONS } from "../src/content/challenges";

describe("challenges and missions", () => {
  it("only need real skills and build valid parts", () => {
    for (const c of [...CHALLENGES, ...MISSIONS]) {
      for (const n of c.needs) expect(SKILL_BY_ID[n], `${c.id} needs ${n}`).toBeDefined();
      for (let seed = 1; seed <= 200; seed++) {
        const { intro, parts } = c.build(makeRng(seed));
        expect(intro).not.toMatch(/undefined|NaN/);
        expect(parts.length).toBeGreaterThan(1);
        for (const p of parts) {
          expect(textOf(p), `${c.id} seed ${seed}`).not.toMatch(/undefined|NaN|Infinity/);
          expect(check(p, canonicalResponse(p.answer)).verdict, `${c.id} seed ${seed}: ${p.prompt}`).toBe("correct");
          if (p.answer.kind === "choice") expect(new Set(p.answer.choices).size).toBe(p.answer.choices.length);
        }
      }
    }
  });
});
