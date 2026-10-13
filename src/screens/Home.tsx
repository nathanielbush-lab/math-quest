import { useRef } from "react";
import { MISSIONS } from "../content/challenges";
import { SKILLS, SKILL_BY_ID, TOPICS } from "../content";
import { familyOf, type TopicFamily } from "../content/topics";
import { FamilyIcon, Icon } from "../components/Icon";
import { Owl } from "../components/Owl";
import { useSkin } from "../skin";
import { previewToday } from "../engine/session";
import { daysBetween, today, type AppState } from "../engine/state";
import { BADGES, monthFocus } from "../store";
import { TrophyPeek, TrophyRoom } from "../components/Badges";
import { Avatar, ShopTab } from "../components/Shop";
import { AssessCards } from "../components/AssessCards";
import { TrailMap } from "../components/TrailMap";
import { questDaysThisWeek } from "../engine/mastery";
import { LevelBar, LevelGuide, LevelLegend, LevelSummary, fmtDate } from "../ui";
import type { Route } from "../App";

export type HomeTab = "today" | "map" | "trophies" | "missions" | "shop";

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

const TABS: { id: HomeTab; label: string; icon: "home" | "map" | "trophy" | "flag" | "bag" }[] = [
  { id: "today", label: "Today", icon: "home" },
  { id: "map", label: "My Map", icon: "map" },
  { id: "trophies", label: "Trophies", icon: "trophy" },
  { id: "missions", label: "Missions", icon: "flag" },
  { id: "shop", label: "Shop", icon: "bag" },
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
            <Icon name={t.icon} size={19} />
            {t.label}
            {t.id === "trophies" && state.badges.length > 0 && <span className="tab-count">{state.badges.length}</span>}
            {t.id === "missions" && openMissions > 0 && <span className="tab-dot" title={`${openMissions} ready to play`} />}
          </button>
        ))}
      </div>
      {tab === "today" && <Today state={state} go={go} setTab={setTab} mutate={mutate} />}
      {tab === "map" && <MapTab state={state} go={go} mutate={mutate} />}
      {tab === "trophies" && <TrophyRoom state={state} />}
      {tab === "missions" && <MissionsTab state={state} go={go} />}
      {tab === "shop" && <ShopTab state={state} mutate={mutate} />}
    </div>
  );
}

const QUEST_STEPS = [
  { icon: "bolt", name: "Warm-up", time: "~5 min" },
  { icon: "book", name: "Learn", time: "15–20 min" },
  { icon: "flag", name: "Challenge", time: "~10 min" },
] as const;

function Today({ state, go, setTab, mutate }: { state: AppState; go: (r: Route) => void; setTab: (t: HomeTab) => void; mutate: (fn: (s: AppState) => void) => void }) {
  const preview = previewToday(state);
  const week = questDaysThisWeek(state);
  const goal = state.settings.weeklyGoal;
  const doneToday = state.sessions.some((s) => s.kind === "daily" && s.date === today());
  const skin = useSkin();
  const stepFamilies: TopicFamily[] = ["data", preview.focus[0] ? familyOf(preview.focus[0].topic) : "fractions", "ratios"];
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
      <div className="card quest-hero" data-tour="quest">
        <div className="hero-top">
          <svg className="hero-scene" viewBox="0 0 1000 70" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 45 C 150 5 300 15 420 42 S 700 12 820 34 S 950 38 1000 22 V 70 H 0 Z" fill="#9cc0a2" />
            <path d="M0 62 C 200 34 380 58 560 48 S 860 54 1000 44 V 70 H 0 Z" fill="#7fa886" />
          </svg>
          <Owl size={skin === "storybook" ? 104 : 96} className="bob" />
          <div className="hero-text">
            <div className="row" style={{ gap: 10 }}>
              <h1>{skin === "storybook" ? "Welcome back" : "Hi"}, {state.settings.studentName || "there"}!</h1>
              <Avatar state={state} size="lg" />
            </div>
            <div className="bubble">
              {last ?? (skin === "storybook" ? "Your story starts with a quick warm-up. Shall we begin?" : "Your first quest starts with a quick warm-up. Ready?")}
              {last && preview.dueTotal > 0 && ` ${preview.dueTotal} skill${preview.dueTotal === 1 ? " is" : "s are"} ready for a quick review today.`}
            </div>
          </div>
        </div>
        <div className="hero-body">
          <div className="quest-path">
            {QUEST_STEPS.map((q, i) => (
              <div key={q.name} className={`quest-step fam-${stepFamilies[i]} ${doneToday ? "done" : ""}`}>
                <span className="quest-icon"><Icon name={doneToday ? "check" : q.icon} size={26} /></span>
                <span className="quest-chapter">Chapter {i + 1}{doneToday ? " · done" : ""}</span>
                <span className="quest-name">{skin === "storybook" ? q.name : `${i + 1} · ${q.name}`} <span className="quest-time">{q.time}</span></span>
                <span className="quest-detail">{details[i]}</span>
              </div>
            ))}
          </div>
          {doneToday && <p style={{ margin: "14px 0 0", fontWeight: 800 }}>Today's {skin === "storybook" ? "chapters are" : "quest is"} complete! Come back tomorrow, or do a bonus round now.</p>}
          <div className="hero-actions">
            <button className="btn primary big" onClick={() => go({ name: "session", type: "daily" })} autoFocus>
              {doneToday ? "Bonus round" : skin === "storybook" ? "Begin today's chapter" : "Start today's quest"} <Icon name="arrow" />
            </button>
            <span className="week-goal" title="Weekly goal (Monday–Sunday)">
              {Array.from({ length: goal }, (_, i) => <span key={i} className={`goal-dot ${i < week ? "on" : ""}`} />)}
              <span className="small" style={{ fontWeight: 800 }}>{week >= goal ? "Weekly goal done!" : `${week} of ${goal} quests this week`}</span>
            </span>
          </div>
        </div>
      </div>

      <TrophyPeek state={state} onOpen={() => setTab("trophies")} />

      <AssessCards state={state} go={go} />

      {showPlacement && (
        <div className="card row">
          <div className="grow">
            <h3><Icon name="compass" /> Find your starting point</h3>
            <p className="muted small" style={{ margin: 0 }}>Short checks for each topic so you can skip what you already know. {placementDone} of {TOPICS.length} topics checked.</p>
          </div>
          {placementDone > 0 && <button className="btn ghost" onClick={() => mutate((s) => { s.settings.placementHidden = true; })}>Not now</button>}
          <button className="btn primary" onClick={() => go({ name: "placement" })}>{placementDone ? "Keep going" : "Start"}</button>
        </div>
      )}

      {openMistakes > 0 && (
        <div className="card row">
          <div className="grow">
            <h3><Icon name="target" /> Mistake journal</h3>
            <p className="muted small" style={{ margin: 0 }}>{openMistakes} question{openMistakes === 1 ? "" : "s"} to try again with fresh numbers. Mistakes are how we learn!</p>
          </div>
          <button className="btn" onClick={() => go({ name: "session", type: "mistakes" })}>Revisit</button>
        </div>
      )}
    </div>
  );
}

function MapTab({ state, go, mutate }: { state: AppState; go: (r: Route) => void; mutate: (fn: (s: AppState) => void) => void }) {
  const grades = [5, 6, 7, 8] as const;
  const placementDone = Object.keys(state.placement).length;
  const month = monthFocus();
  const ready = SKILLS.filter((s) => state.skills[s.id]?.ready).length;
  const skin = useSkin();
  const view = state.settings.mapView ?? (skin === "classic" ? "list" : "trail");
  const counts = Object.fromEntries(TOPICS.map((t) => [t.id, topicCounts(state, t.id)]));
  // "You are here": the topic of today's first focus skill, or the first topic not finished yet.
  const here = previewToday(state).focus[0]?.topic ?? TOPICS.find((t) => counts[t.id].ready < counts[t.id].total)?.id;
  return (
    <div>
      <div className="row" style={{ marginBottom: 4 }}>
        <h2 className="grow" style={{ margin: 0 }}>Your math map</h2>
        <span className="small muted">{ready} of {SKILLS.length} skills unlocked</span>
      </div>
      <div className="map-toolbar">
        <div className="seg" role="radiogroup" aria-label="Map view">
          {([["trail", "Trail", "map"], ["list", "List", "clipboard"]] as const).map(([id, name, icon]) => (
            <button key={id} type="button" role="radio" aria-checked={view === id} className={view === id ? "on" : ""} onClick={() => mutate((s) => { s.settings.mapView = id; })}><Icon name={icon} size={18} /> {name}</button>
          ))}
        </div>
        <span className="grow small muted">{view === "trail" ? "Each stop is a topic. Its ring fills as you unlock skills, and a star means every skill is unlocked. Tap a landmark to find the math hiding in it!" : ""}</span>
        {placementDone < TOPICS.length && <button className="btn" onClick={() => go({ name: "placement" })}><Icon name="compass" /> Check what I already know ({placementDone}/{TOPICS.length})</button>}
      </div>
      {view === "trail" && <TrailMap counts={counts} here={here} onTopic={(topicId) => go({ name: "topic", topicId })} onFinale={() => go({ name: "assess" })} />}
      {view === "list" && <><LevelLegend /><LevelGuide /></>}
      {view === "list" && grades.map((g) => (
        <div key={g}>
          <div className="grade-label">{g === 5 ? "Warm-up foundations" : `Grade ${g}`}</div>
          <div className="grid2">
            {TOPICS.filter((t) => t.grade === g).map((t) => {
              const c = counts[t.id];
              return (
                <div key={t.id} className={`card tight topic-tile fam-${familyOf(t.id)}`} onClick={() => go({ name: "topic", topicId: t.id })} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && go({ name: "topic", topicId: t.id })}>
                  <div className="row" style={{ marginBottom: 8 }}>
                    <span className="fam-badge"><FamilyIcon family={familyOf(t.id)} size={22} /></span>
                    <strong className="grow">{t.title}</strong>
                    {c.ready === c.total && <span title="every skill unlocked"><Icon name="star" /></span>}
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
      <h2 style={{ marginTop: 0 }}>Stage challenges</h2>
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
