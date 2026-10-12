import { MISSIONS } from "../content/challenges";
import { SKILLS, TOPICS } from "../content";
import { previewToday } from "../engine/session";
import { daysBetween, today, type AppState } from "../engine/state";
import { BADGE_BY_ID, monthFocus } from "../store";
import { LevelBar, LevelLegend } from "../ui";
import type { Route } from "../App";

export function topicCounts(state: AppState, topicId: string) {
  const skills = SKILLS.filter((s) => s.topic === topicId);
  const counts = [0, 0, 0, 0, 0];
  for (const s of skills) counts[state.skills[s.id]?.level ?? 0]++;
  const ready = skills.filter((s) => state.skills[s.id]?.ready).length;
  return { counts, total: skills.length, ready };
}

export function Home({ state, go }: { state: AppState; go: (r: Route) => void }) {
  const preview = previewToday(state);
  const week = state.sessions.filter((s) => daysBetween(s.date, today()) < 7 && s.kind === "daily").length;
  const openMistakes = state.mistakes.filter((m) => !m.resolved).length;
  const placementDone = Object.keys(state.placement).length;
  const month = monthFocus();
  const grades = [5, 6, 7, 8] as const;
  return (
    <div>
      <div className="card hero">
        <h1>Hi {state.settings.studentName || "there"}! 👋</h1>
        <p className="muted">Today's quest:</p>
        <ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>
          <li><strong>Warm-up</strong>: {preview.reviews ? `${preview.reviews} review question${preview.reviews === 1 ? "" : "s"} to keep skills fresh` : "a few quick practice questions"}</li>
          <li><strong>Learn</strong>: {preview.focus.length ? preview.focus.map((f) => f.title).join(", then ") : "mixed practice"}</li>
          <li><strong>Challenge</strong>: an unfamiliar problem to figure out</li>
        </ul>
        <div className="row">
          <button className="btn primary big" onClick={() => go({ name: "session", type: "daily" })} autoFocus>Start today's quest →</button>
          <span className="muted small">{week}/4 sessions this week</span>
        </div>
      </div>

      {placementDone < TOPICS.length && (
        <div className="card row">
          <div className="grow">
            <h3>🧭 Find your starting point</h3>
            <p className="muted small" style={{ margin: 0 }}>Short checks for each topic so you can skip what you already know. {placementDone} of {TOPICS.length} topics checked.</p>
          </div>
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

      <div className="row" style={{ marginTop: 24 }}>
        <h2 className="grow" style={{ margin: 0 }}>🗺️ Your math map</h2>
        <LevelLegend />
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
                  </div>
                  <LevelBar counts={c.counts} total={c.total} />
                  <div className="small muted" style={{ marginTop: 6 }}>{c.ready} of {c.total} skills unlocked{t.strand === "shapes-data" ? " · shapes & data" : ""}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: 28 }}>🚩 Stage challenges</h2>
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

      {state.badges.length > 0 && (
        <>
          <h2 style={{ marginTop: 28 }}>🏅 Badges</h2>
          <div className="pill-list">
            {state.badges.map((b) => BADGE_BY_ID[b] && <span key={b} className="chip">{BADGE_BY_ID[b].icon} {BADGE_BY_ID[b].name}</span>)}
          </div>
        </>
      )}

      <div className="card tight" style={{ marginTop: 28 }}>
        <strong>{month.title}</strong>
        <p className="small muted" style={{ margin: 0 }}>{month.text}</p>
      </div>
    </div>
  );
}
