import { useCallback, useRef, useState } from "react";
import { MISSIONS } from "./content/challenges";
import { SKILLS, TOPICS } from "./content";
import { loadState, saveState, type AppState } from "./engine/state";

export interface Badge {
  id: string;
  icon: string;
  name: string;
  test: (s: AppState) => boolean;
}

const lv = (s: AppState, min: number) => Object.values(s.skills).filter((x) => x.level >= min).length;

export const BADGES: Badge[] = [
  { id: "first-correct", icon: "🌱", name: "First right answer", test: (s) => Object.values(s.skills).some((x) => x.correct > 0) },
  { id: "first-ready", icon: "🔓", name: "Unlocked a new skill", test: (s) => Object.values(s.skills).some((x) => x.ready && !x.placed) },
  { id: "independent-1", icon: "🦉", name: "First Independent skill", test: (s) => lv(s, 3) >= 1 },
  { id: "independent-10", icon: "🏅", name: "10 Independent skills", test: (s) => lv(s, 3) >= 10 },
  { id: "independent-25", icon: "🏆", name: "25 Independent skills", test: (s) => lv(s, 3) >= 25 },
  { id: "explainer", icon: "🎤", name: "Can explain & apply", test: (s) => lv(s, 4) >= 1 },
  { id: "explainer-5", icon: "👩‍🏫", name: "Explained 5 skills", test: (s) => lv(s, 4) >= 5 },
  { id: "streak-3", icon: "🔥", name: "3-day streak", test: (s) => s.streak.count >= 3 },
  { id: "streak-7", icon: "☄️", name: "7-day streak", test: (s) => s.streak.count >= 7 },
  { id: "mistake-fixer", icon: "🛠️", name: "Fixed 5 old mistakes", test: (s) => s.mistakes.filter((m) => m.resolved).length >= 5 },
  { id: "placement", icon: "🧭", name: "Found my starting point", test: (s) => Object.keys(s.placement).length >= 5 },
  ...TOPICS.map((t) => ({ id: `topic-${t.id}`, icon: t.icon, name: `Topic star: ${t.title}`, test: (s: AppState) => SKILLS.filter((k) => k.topic === t.id).every((k) => s.skills[k.id]?.ready) })),
  ...MISSIONS.map((m) => ({ id: `mission-${m.id}`, icon: "🚩", name: `Mission: ${m.title}`, test: (s: AppState) => !!s.missions[m.id]?.done })),
];

export const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);
  const ref = useRef(state);
  const [saveFailed, setSaveFailed] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  /** Apply changes to a copy of the state, award badges, save. */
  const mutate = useCallback((fn: (s: AppState) => void) => {
    const next: AppState = structuredClone(ref.current);
    fn(next);
    const earned = BADGES.filter((b) => !next.badges.includes(b.id) && b.test(next)).map((b) => b.id);
    if (earned.length) {
      next.badges = [...next.badges, ...earned];
      setNewBadges((x) => [...x, ...earned]);
    }
    next.updatedAt = new Date().toISOString();
    ref.current = next;
    setState(next);
    setSaveFailed(!saveState(next));
  }, []);

  const replace = useCallback((s: AppState) => {
    ref.current = s;
    setState(s);
    setSaveFailed(!saveState(s));
  }, []);

  const popBadge = useCallback(() => setNewBadges((x) => x.slice(1)), []);
  return { state, mutate, replace, saveFailed, newBadges, popBadge };
}

/** The roadmap's month-by-month suggestion. */
export function monthFocus(d = new Date()): { title: string; text: string } {
  const m = d.getMonth();
  if (m === 9) return { title: "October: diagnose and build connections", text: "Check Grades 6–8 in short sessions. Begin fraction division, decimals, ratios, rates and percents. Start a geometry or data topic alongside." };
  if (m === 10) return { title: "November: strengthen algebra", text: "Signed numbers, expressions, equations, inequalities and proportions. Continue scale drawings, circles, data and probability." };
  if (m === 11) return { title: "December: reach Grade 8 ideas", text: "Powers and roots, functions, slope and systems as foundations permit. Include transformations, Pythagorean reasoning, solid volumes and data relationships." };
  if (m === 0) return { title: "Early January: review and retain", text: "Mixed problems and revisiting earlier errors. Treat unlearned topics as learning needs, not failures." };
  return { title: "Keep building", text: "Short, regular sessions: review, learn something new, then try an unfamiliar problem." };
}
