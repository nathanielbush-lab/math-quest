import { useEffect, useState } from "react";
import type { SessionType } from "./engine/session";
import { BADGE_BY_ID, useAppState } from "./store";
import { Home } from "./screens/Home";
import { MissionScreen } from "./screens/Mission";
import { Parent } from "./screens/Parent";
import { Placement } from "./screens/Placement";
import { Session } from "./screens/Session";
import { Topic } from "./screens/Topic";
import { Welcome } from "./screens/Welcome";

export type Route =
  | { name: "home" }
  | { name: "session"; type: SessionType; skillId?: string }
  | { name: "placement"; topicId?: string }
  | { name: "topic"; topicId: string }
  | { name: "mission"; id: string }
  | { name: "parent" };

export default function App() {
  const { state, mutate, replace, saveFailed, newBadges, popBadge } = useAppState();
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [toastText, setToastText] = useState<string | null>(null);
  const go = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0 });
  };
  const toast = (t: string) => setToastText(t);

  useEffect(() => {
    if (!toastText) return;
    const id = setTimeout(() => setToastText(null), 2800);
    return () => clearTimeout(id);
  }, [toastText]);

  useEffect(() => {
    if (!newBadges.length || toastText) return;
    const b = BADGE_BY_ID[newBadges[0]];
    popBadge();
    if (b) setToastText(`${b.icon} New badge: ${b.name}`);
  }, [newBadges, toastText, popBadge]);

  const inActivity = route.name === "session" || route.name === "mission" || (route.name === "placement" && !!route.topicId);
  const home = () => go({ name: "home" });

  let body;
  if (!state.settings.studentName && route.name === "home") {
    body = <Welcome mutate={mutate} onDone={(next) => go(next === "placement" ? { name: "placement" } : { name: "home" })} />;
  } else {
    switch (route.name) {
      case "home":
        body = <Home state={state} go={go} />;
        break;
      case "session":
        body = <Session key={JSON.stringify(route)} state={state} mutate={mutate} type={route.type} skillId={route.skillId} onExit={home} toast={toast} />;
        break;
      case "placement":
        body = <Placement state={state} mutate={mutate} topicId={route.topicId} onExit={home} go={(topicId) => go({ name: "placement", topicId })} />;
        break;
      case "topic":
        body = <Topic state={state} topicId={route.topicId} go={go} />;
        break;
      case "mission":
        body = <MissionScreen state={state} mutate={mutate} id={route.id} onExit={home} />;
        break;
      case "parent":
        body = <Parent state={state} mutate={mutate} replace={replace} onExit={home} />;
        break;
    }
  }

  return (
    <div className="app">
      {!inActivity && (
        <div className="topbar">
          <div className="brand" onClick={home} role="link">🧭 Math Quest</div>
          <span className="spacer" />
          {state.streak.count > 0 && <span className="chip" title="days in a row">🔥 {state.streak.count}</span>}
          <span className="chip" title="experience points">⭐ {state.xp}</span>
          {route.name !== "parent" && <button className="btn ghost" onClick={() => go({ name: "parent" })}>👪 Parent</button>}
        </div>
      )}
      {saveFailed && <div className="feedback warn">Progress couldn't be saved in this browser (private window or storage blocked?). Use Parent → Settings → Download progress file to keep it.</div>}
      {body}
      {toastText && <div className="toast" role="status">{toastText}</div>}
    </div>
  );
}
