import type { AppState } from "../engine/state";
import type { Route } from "../App";
import { checkpointDue, scoreOf } from "../engine/assess";
import { fmtDate } from "../ui";
import "../screens/assess.css";

/** One small card on the Today tab: the monthly checkpoint when it's due, otherwise screener practice. */
export function AssessCards({ state, go }: { state: AppState; go: (r: Route) => void }) {
  if (checkpointDue(state)) {
    return (
      <div className="card assess-card due">
        <div className="grow">
          <h3>📅 Your monthly checkpoint is ready (about 15 min)</h3>
          <p className="muted small" style={{ margin: 0 }}>One question from each topic, no timer. See how much you've grown!</p>
        </div>
        <button className="btn primary" onClick={() => go({ name: "assess", kind: "checkpoint" })}>Start</button>
      </div>
    );
  }
  const screeners = state.assessments.filter((a) => a.kind !== "checkpoint");
  const last = screeners[screeners.length - 1];
  const s = last && scoreOf(last);
  return (
    <div className="card tight assess-card">
      <div className="grow">
        <h3>📝 Screener practice</h3>
        <p className="muted small" style={{ margin: 0 }}>
          {s ? `Last try (${fmtDate(last.date)}): ${s.right}/${s.total}, ${s.pct}%` : "Try a practice test in a typical test format."}
        </p>
      </div>
      <button className="btn" onClick={() => go({ name: "assess" })}>{s ? "Practice tests" : "Take a look"}</button>
    </div>
  );
}
