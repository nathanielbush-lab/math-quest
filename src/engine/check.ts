import { eq, fmtFrac, parseNumber, toNum, type Frac } from "../lib/rational";
import type { Answer, Problem } from "../content/types";

export type Verdict = "correct" | "wrong" | "almost" | "invalid";

export interface CheckResult {
  verdict: Verdict;
  message?: string;
}

export type Response =
  | { kind: "number"; text: string }
  | { kind: "multi"; texts: string[] }
  | { kind: "choice"; index: number }
  | { kind: "point"; x: number; y: number };

const UNREADABLE = "I couldn't read that as a number. Try something like 12, −3, 0.75, 3/4 or 1 1/2.";

function matches(value: Frac, target: Frac, tolerance?: number): boolean {
  if (tolerance !== undefined) return Math.abs(toNum(value) - toNum(target)) <= tolerance + 1e-9;
  return eq(value, target);
}

export function check(problem: Problem, response: Response): CheckResult {
  const a = problem.answer;
  switch (a.kind) {
    case "number": {
      if (response.kind !== "number") return { verdict: "invalid" };
      const p = parseNumber(response.text);
      if (!p) return { verdict: "invalid", message: UNREADABLE };
      if (matches(p.value, a.value, a.tolerance)) {
        if (a.simplest && p.typedFraction && !p.simplest) {
          return { verdict: "almost", message: "That's the right amount! Can you write it in simplest form?" };
        }
        return { verdict: "correct" };
      }
      const t = problem.traps?.find((tr) => matches(p.value, tr.value, a.tolerance));
      return { verdict: "wrong", message: t?.feedback };
    }
    case "multi": {
      if (response.kind !== "multi") return { verdict: "invalid" };
      const parsed = response.texts.map(parseNumber);
      if (parsed.some((p) => !p)) return { verdict: "invalid", message: UNREADABLE };
      const vals = parsed.map((p) => p!.value);
      const free = new Set(a.anyOrder ?? []);
      let ok = a.fields.every((f, i) => free.has(i) || matches(vals[i], f.value, f.tolerance));
      if (ok && free.size) {
        const want = [...free].map((i) => a.fields[i]);
        const got = [...free].map((i) => vals[i]);
        ok = want.every((f) => {
          const k = got.findIndex((g) => matches(g, f.value, f.tolerance));
          if (k < 0) return false;
          got.splice(k, 1);
          return true;
        });
      }
      return { verdict: ok ? "correct" : "wrong" };
    }
    case "choice": {
      if (response.kind !== "choice") return { verdict: "invalid" };
      if (response.index === a.correct) return { verdict: "correct" };
      return { verdict: "wrong", message: a.feedback?.[response.index] };
    }
    case "point": {
      if (response.kind !== "point") return { verdict: "invalid" };
      if (response.x === a.x && response.y === a.y) return { verdict: "correct" };
      if (response.x === a.y && response.y === a.x) return { verdict: "wrong", message: "Close! You swapped x and y. The x-coordinate (left/right) comes first." };
      return { verdict: "wrong" };
    }
  }
}

/** The right answer as plain text, for showing after a miss and for tests. */
export function answerText(a: Answer): string {
  switch (a.kind) {
    case "number": {
      const v = fmtNum(a.value, a.tolerance, a.simplest);
      if (a.pre === "$") return v.startsWith("-") ? `−$${v.slice(1)}` : `$${v}`;
      return `${a.pre ?? ""}${v.replace(/^-/, "−")}${a.unit ?? ""}`;
    }
    case "multi":
      return a.fields
        .map((f) => {
          let v = fmtNum(f.value, f.tolerance).replace(/^-/, "−");
          let pre = f.pre ?? "";
          if (pre === "+" && v.startsWith("−")) {
            pre = "−";
            v = v.slice(1);
          }
          const sep = !pre || pre.endsWith("(") || pre.endsWith("^") ? "" : " ";
          return `${pre}${sep}${v}${f.post ?? ""}`;
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    case "choice":
      return a.choices[a.correct];
    case "point":
      return `(${a.x}, ${a.y})`.replace(/-/g, "−");
  }
}

/** Fractions stay fractions when simplest form was asked for; otherwise terminating values show as decimals. */
function fmtNum(v: Frac, tolerance?: number, preferFraction = false): string {
  if (tolerance !== undefined || v.d === 1) return String(Number(toNum(v).toFixed(4)));
  let d = v.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  if (d === 1 && !preferFraction) return String(Number(toNum(v).toFixed(6)));
  return fmtFrac(v, Math.abs(v.n) > v.d);
}

/** A response that should always be marked correct (used by tests). */
export function canonicalResponse(a: Answer): Response {
  switch (a.kind) {
    case "number":
      return { kind: "number", text: fmtFrac(a.value) };
    case "multi":
      return { kind: "multi", texts: a.fields.map((f) => fmtFrac(f.value)) };
    case "choice":
      return { kind: "choice", index: a.correct };
    case "point":
      return { kind: "point", x: a.x, y: a.y };
  }
}
