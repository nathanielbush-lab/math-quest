import g5 from "./skills/g5";
import g6ns from "./skills/g6-ns";
import g6rp from "./skills/g6-rp";
import g6ee from "./skills/g6-ee";
import g6g from "./skills/g6-g";
import g6sp from "./skills/g6-sp";
import g7ns from "./skills/g7-ns";
import g7rp from "./skills/g7-rp";
import g7ee from "./skills/g7-ee";
import g7g from "./skills/g7-g";
import g7sp from "./skills/g7-sp";
import g8pr from "./skills/g8-pr";
import g8eq from "./skills/g8-eq";
import g8f from "./skills/g8-f";
import g8g from "./skills/g8-g";
import g8sp from "./skills/g8-sp";
import { TOPICS, TOPIC_BY_ID } from "./topics";
import type { Skill } from "./types";

export const SKILLS: Skill[] = [...g5, ...g6rp, ...g6ns, ...g6ee, ...g6g, ...g6sp, ...g7rp, ...g7ns, ...g7ee, ...g7g, ...g7sp, ...g8pr, ...g8eq, ...g8f, ...g8g, ...g8sp];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export { TOPICS, TOPIC_BY_ID };

export function skillsInTopic(topicId: string): Skill[] {
  return ORDERED.filter((s) => s.topic === topicId);
}

export function topicOf(skillId: string) {
  return TOPIC_BY_ID[SKILL_BY_ID[skillId].topic];
}

/** All prerequisites, direct and indirect. */
export function ancestors(skillId: string, seen = new Set<string>()): Set<string> {
  for (const p of SKILL_BY_ID[skillId]?.prereqs ?? []) {
    if (!seen.has(p)) {
      seen.add(p);
      ancestors(p, seen);
    }
  }
  return seen;
}

/** Skills in an order where every prerequisite comes first (stable by grade, then listing order). */
function topoSort(skills: Skill[]): Skill[] {
  const out: Skill[] = [];
  const done = new Set<string>();
  const visit = (s: Skill, stack: string[]) => {
    if (done.has(s.id)) return;
    if (stack.includes(s.id)) throw new Error(`Prerequisite cycle: ${[...stack, s.id].join(" → ")}`);
    for (const p of s.prereqs) {
      const ps = SKILL_BY_ID[p];
      if (!ps) throw new Error(`Unknown prerequisite ${p} for ${s.id}`);
      visit(ps, [...stack, s.id]);
    }
    done.add(s.id);
    out.push(s);
  };
  const gradeOf = (s: Skill) => TOPIC_BY_ID[s.topic].grade;
  [...skills].sort((a, b) => gradeOf(a) - gradeOf(b)).forEach((s) => visit(s, []));
  return out;
}

export const ORDERED: Skill[] = topoSort(SKILLS);
