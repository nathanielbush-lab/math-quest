import { useRef } from "react";
import { MISSIONS } from "../content/challenges";
import { SKILLS, SKILL_BY_ID, TOPICS } from "../content";
import { previewToday } from "../engine/session";
import { daysBetween, today, type AppState } from "../engine/state";
import { BADGES, monthFocus } from "../store";
import { TrophyPeek, TrophyRoom } from "../components/Badges";
import { LevelBar, LevelGuide, LevelLegend, LevelSummary, fmtDate } from "../ui";
import type { Route } from "../App";

export type HomeTab = "today" | "map" | "trophies" | "missions";

export function topicCounts(state: AppState, topicId: string) {
  const skills = SKILLS.filter((s) => s.topic === topicId);
  const counts = [0, 0, 0, 0, 0];
  for (const s of skills) counts[state.skills[s.id]?.level ?? 0]++;
  const ready = skills.filter((s) => state.skills[s.id]?.ready).length;
  return { counts, total: skills.length, ready };
}

/** "Yesterday you worked on Unit rates and got 8 of 10 right." */
export function lastTimeLine(state: AppState): string | null {
  const last = [...state.sessions].reverse().find((s) => s.answered > 0);
  if (!last) return null;
  const d = daysBetween(last.date, today());
  const [y, m, day] = last.date.split("-").map(Number);
  const when = d <= 0 ? "Earlier today" : d === 1 ? "Yesterday" : d < 7 ? `On ${new Date(y, m - 1, day).toLocaleDateString(undefined, { weekday: "long" })}` : `On ${fmtDate(last.date)}`;
  const titles = [...new Set(last.skills)].map((id) => SKILL_BY_ID[id]?.title).filter(Boolean);
  const what =
    last.kind === "mistakes" ? "you fixed old mistakes" : !titles.length ? "you practiced" : titles.length <= 2 ? `you worked on ${titles.join(", plus ")}` : `you worked on ${titles[0]}, ${titles[1]}, plus ${titles.length - 2} more`;
  return `${when} ${what}, and got ${last.correct} of ${last.answered} right.`;
}

const TABS: { id: HomeTab; label: string }[] = [
  { id: "today", label: "🏠 Today" },
  { id: "map", label: "🗺️ My Map" },
  { id: "trophies", label: "🏆 Trophies" },
  { id: "missions", label: "🚩 Missions" },
];

export function Home({ state, go, tab = "today", mutate }: { state: AppState; go: (r: Route) => void; tab?: HomeTab; mutate: (fn: (s: AppState) => void) => void }) {
  const setTab = (t: HomeTab) => go({ name: "home", tab: t });
  const openMissions = MISSIONS.filter((m) => m.needs.every((n) => (state.skills[n]?.level ?? 0) >= 2) && !state.missions[m.id]?.done).length;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const j = (i + d + TABS.length) % TABS.length;
    setTab(TABS[j].id);
    tabRefs.current[j]?.focus();
  };
  return (
    <div>
      <div className="tabs" role="tablist" data-tour="tabs">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={tab === t.id}
            tabIndex={tab === t.id ? 0 : -1}
            className={`tab ${tab === t.id ? "on" : ""}`}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {t.label}
            {t.id === "trophies" && state.badges.length > 0 && <span className="tab-count">{state.badges.length}</span>}
            {t.id === "missions" && openMissions > 0 && <span className="tab-dot" title={`${openMissions} ready to play`} />}
          </button>
        ))}
      </div>
      {tab === "today" && <Today state={state} go={go} setTab={setTab} mutate={mutate} />}
      {tab === "map" && <MapTab state={state} go={go} />}
      {tab === "trophies" && <TrophyRoom state={state} />}
      {tab === "missions" && <MissionsTab state={state} go={go} />}
    </div>
  );
}

const QUEST_STEPS = [
  { icon: "🔥", name: "Warm-up", time: "~5 min" },
  { icon: "📘", name: "Learn", time: "15–20 min" },
  { icon: "🧩", name: "Challenge", time: "~10 min" },
];

function Today({ state, go, setTab, mutate }: { state: AppState; go: (r: Route) => void; setTab: (t: HomeTab) => void; mutate: (fn: (s: AppState) => void) => void }) {
  const preview = previewToday(state);
  const week = state.sessions.filter((s) => daysBetween(s.date, today()) < 7 && s.kind === "daily").length;
  const doneToday = state.sessions.some((s) => s.kind === "daily" && s.date === today());
  const openMistakes = state.mistakes.filter((m) => !m.resolved).length;
  const placementDone = Object.keys(state.placement).length;
  const showPlacement = placementDone < TOPICS.length && !state.settings.placementHidden;
  const last = lastTimeLine(state);
  const details = [
    preview.reviews ? `${preview.reviews} review question${preview.reviews === 1 ? "" : "s"} to keep skills fresh` : "a few quick practice questions",
    preview.focus.length ? preview.focus.map((f) => f.title).join(", then ") : "mixed practice",
    "a new kind of problem to figure out",
  ];
  return (
    <div>
      <div className="card hero" data-tour="quest">
        <h1 style={{ marginBottom: 4 }}>Hi {state.settings.studentName || "there"}! 👋</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          {last ?? "Your first quest starts with a quick warm-up. Ready?"}
          {last && preview.dueTotal > 0 && ` ${preview.dueTotal} skill${preview.dueTotal === 1 ? " is" : "s are"} ready for a quick review today.`}
        </p>
        <div className="quest-path">
          {QUEST_STEPS.map((q, i) => (
            <div key={q.name} className={`quest-step ${doneToday ? "done" : ""}`}>
              <div className="quest-icon">{doneToday ? "✅" : q.icon}</div>
              <div>
                <div className="quest-name">{i + 1}. {q.name} <span className="quest-time">{q.time}</span></div>
                <div className="quest-detail">{details[i]}</div>
              </div>
            </div>
          ))}
        </div>
        {doneToday && <p style={{ margin: "12px 0 0", fontWeight: 700 }}>🎉 Today's quest is complete! Come back tomorrow, or do a bonus round now.</p>}
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn primary big" onClick={() => go({ name: "session", type: "daily" })} autoFocus>
            {doneToday ? "Bonus round →" : "Start today's quest →"}
          </button>
          <span className="muted small">{week} of 4 quests this week</span>
        </div>
      </div>

      <TrophyPeek state={state} onOpen={() => setTab("trophies")} />

      {showPlacement && (
        <div className="card row">
          <div className="grow">
            <h3>🧭 Find your starting point</h3>
            <p className="muted small" style={{ margin: 0 }}>Short checks for each topic so you can skip what you already know. {placementDone} of {TOPICS.length} topics checked.</p>
          </div>
          {placementDone > 0 && <button className="btn ghost" onClick={() => mutate((s) => { s.settings.placementHidden = true; })}>Not now</button>}
          <button className="btn primary" onClick={() => go({ name: "placement" })}>{placementDone ? "Keep going" : "Start"}</button>
        </div>
      )}

      {openMistakes > 0 && (
        <div className="card row">
          <div className="grow">
            <h3>🛠️ Mistake journal</h3>
            <p className="muted small" style={{ margin: 0 }}>{openMistakes} question{openMistakes === 1 ? "" : "s"} to try again with fresh numbers. Mistakes are how we learn!</p>
          </div>
          <button className="btn" onClick={() => go({ name: "session", type: "mistakes" })}>Revisit</button>
        </div>
      )}
    </div>
  );
}

function MapTab({ state, go }: { state: AppState; go: (r: Route) => void }) {
  const grades = [5, 6, 7, 8] as const;
  const placementDone = Object.keys(state.placement).length;
  const month = monthFocus();
  const ready = SKILLS.filter((s) => state.skills[s.id]?.ready).length;
  return (
    <div>
      <div className="row" style={{ marginBottom: 4 }}>
        <h2 className="grow" style={{ margin: 0 }}>🗺️ Your math map</h2>
        <span className="small muted">{ready} of {SKILLS.length} skills unlocked</span>
      </div>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div className="grow"><LevelLegend /><LevelGuide /></div>
        {placementDone < TOPICS.length && <button className="btn" onClick={() => go({ name: "placement" })}>🧭 Check what I already know ({placementDone}/{TOPICS.length})</button>}
      </div>
      {grades.map((g) => (
        <div key={g}>
          <div className="grade-label">{g === 5 ? "Warm-up foundations" : `Grade ${g}`}</div>
          <div className="grid2">
            {TOPICS.filter((t) => t.grade === g).map((t) => {
              const c = topicCounts(state, t.id);
              return (
                <div key={t.id} className="card tight topic-tile" onClick={() => go({ name: "topic", topicId: t.id })} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && go({ name: "topic", topicId: t.id })}>
                  <div className="row" style={{ marginBottom: 8 }}>
                    <span className="icon">{t.icon}</span>
                    <strong className="grow">{t.title}</strong>
                    {c.ready === c.total && <span title="every skill unlocked">⭐</span>}
                  </div>
                  <LevelBar counts={c.counts} total={c.total} />
                  <div style={{ marginTop: 6 }}><LevelSummary counts={c.counts} total={c.total} /></div>
                  <div className="small muted" style={{ marginTop: 2 }}>{c.ready} of {c.total} skills unlocked{t.strand === "shapes-data" ? " · shapes & data" : ""}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="card tight" style={{ marginTop: 28 }}>
        <strong>{month.title}</strong>
        <p className="small muted" style={{ margin: 0 }}>{month.text}</p>
      </div>
    </div>
  );
}

function MissionsTab({ state, go }: { state: AppState; go: (r: Route) => void }) {
  const missionBadges = BADGES.filter((b) => b.id.startsWith("mission-"));
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>🚩 Stage challenges</h2>
      <p className="muted small">Bigger, real-world projects that mix lots of skills together. Each one unlocks when you're practicing the skills it needs, and finishing it earns a badge ({missionBadges.filter((b) => state.badges.includes(b.id)).length} of {missionBadges.length} so far).</p>
      <div className="grid2">
        {MISSIONS.map((m) => {
          const unlocked = m.needs.every((n) => (state.skills[n]?.level ?? 0) >= 2);
          const done = state.missions[m.id]?.done;
          return (
            <div key={m.id} className={`card tight mission ${unlocked ? "" : "locked"}`}>
              <strong>Grade {m.grade}: {m.title}</strong>
              <p className="small muted">{m.blurb}</p>
              {unlocked ? (
                <button className="btn primary" onClick={() => go({ name: "mission", id: m.id })}>{done ? "Play again" : "Start mission"}</button>
              ) : (
                <span className="small muted">🔒 Unlocks when you're practicing: {m.needs.map((n) => SKILLS.find((s) => s.id === n)!.title).join(", ")}</span>
              )}
              {done && <span className="small"> ✅ Completed</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
