// PLACEHOLDER — the star shop (avatars, color themes, streak freezes) is being built here.
import type { AppState } from "../engine/state";

export function ShopTab(_props: { state: AppState; mutate: (fn: (s: AppState) => void) => void }) {
  return <p className="muted">The shop is coming soon.</p>;
}

/** Her chosen avatar (or a default), shown in the greeting and the top bar. */
export function Avatar(_props: { state: AppState; size?: "sm" | "lg" }) {
  return null;
}
