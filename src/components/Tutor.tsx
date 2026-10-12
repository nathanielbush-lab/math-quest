// PLACEHOLDER — the "I'm stuck" tutor is being built here.
import type { ReactNode } from "react";
import type { Problem } from "../content/types";
import type { AppState } from "../engine/state";

/** Gives the tutor (deep inside ProblemCard) access to settings and a way to save chats. Wraps the whole app. */
export function TutorProvider({ children }: { state: AppState; mutate: (fn: (s: AppState) => void) => void; children: ReactNode }) {
  return <>{children}</>;
}

/** Shown next to the Hint button. Opens a short Socratic chat with Claude about this problem. */
export function StuckButton(_props: { problem: Problem; wrongAnswers: string[]; hintsShown: number; onUsed: () => void }) {
  return null;
}
