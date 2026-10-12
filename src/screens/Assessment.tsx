// PLACEHOLDER — screener practice and monthly checkpoints are being built here.
import type { AppState } from "../engine/state";

export type AssessKind = "screener-full" | "screener-quick" | "checkpoint";

/** With no kind: the hub (choose a test, see past results). With a kind: take that test. */
export function Assessment(_props: { state: AppState; mutate: (fn: (s: AppState) => void) => void; kind?: AssessKind; onExit: () => void; go: (kind?: AssessKind) => void }) {
  return <p className="muted">Coming soon.</p>;
}
