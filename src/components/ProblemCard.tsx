import { useEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "../content/types";
import { answerText, canonicalResponse, check, type Response } from "../engine/check";
import { AnswerInput } from "./AnswerInput";
import { MathText, speak } from "./MathText";
import { SolutionSteps, scaffoldSteps } from "./SolutionSteps";
import { StuckButton } from "./Tutor";
import { Visual } from "./Visual";

export interface ProblemResult {
  ok: boolean;
  assisted: boolean;
  given: string;
  correct: string;
  /** Wrong tries before the end (0 = right first time). */
  tries: number;
  hints: number;
  secs: number;
  /** She asked the "I'm stuck" tutor. */
  tutor: boolean;
}

const PRAISE = ["Nice work! 🎉", "You got it! ⭐", "Excellent! 🌟", "That's right! 🙌", "Great thinking! 🧠", "Nailed it! 🎯", "Yes! 💪"];
const NUDGE = ["Not quite. Take another look!", "Close. Check your work and try again.", "Hmm, not yet. Try once more!"];

function describe(problem: Problem, r: Response): string {
  switch (r.kind) {
    case "number":
      return r.text;
    case "multi":
      return r.texts.join(" , ");
    case "choice":
      return problem.answer.kind === "choice" ? problem.answer.choices[r.index] : String(r.index);
    case "point":
      return `(${r.x}, ${r.y})`;
  }
}

/** One question with hints, two tries, targeted feedback and a worked solution. */
export function ProblemCard({
  problem,
  guided = false,
  placement = false,
  readAloud,
  onFinish,
  header,
}: {
  problem: Problem;
  guided?: boolean;
  placement?: boolean;
  readAloud: boolean;
  onFinish: (r: ProblemResult) => void;
  header?: React.ReactNode;
}) {
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const [struck, setStruck] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ tone: "good" | "bad" | "warn" | "info"; text: string } | null>(null);
  const [result, setResult] = useState<ProblemResult | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [stepsDone, setStepsDone] = useState(false);
  const [mark, setMark] = useState<{ x: number; y: number; ok: boolean } | null>(null);
  const [tutorUsed, setTutorUsed] = useState(false);
  const [wrongs, setWrongs] = useState<string[]>([]);
  const shownAt = useRef(Date.now());
  const contRef = useRef<HTMLButtonElement>(null);
  const correctText = useMemo(() => answerText(problem.answer), [problem]);
  const scaffold = useMemo(() => (guided ? scaffoldSteps(problem.steps, problem.hints) : []), [guided, problem]);

  // While the solution is being stepped through, its "Next step" button keeps focus; Continue gets it afterwards.
  useEffect(() => {
    if (result && (!showSteps || stepsDone)) contRef.current?.focus();
  }, [result, showSteps, stepsDone]);

  const submit = (r: Response) => {
    const v = check(problem, r);
    if (r.kind === "point") setMark({ x: r.x, y: r.y, ok: v.verdict === "correct" });
    if (v.verdict === "invalid") {
      setFeedback({ tone: "warn", text: v.message ?? "Try entering a number." });
      return;
    }
    if (v.verdict === "almost") {
      setFeedback({ tone: "warn", text: v.message ?? "Almost!" });
      return;
    }
    const given = describe(problem, r);
    if (v.verdict === "correct") {
      const assisted = guided || hints > 0 || tries > 0 || tutorUsed;
      setFeedback({ tone: "good", text: placement ? "Got it!" : PRAISE[Math.floor(Math.random() * PRAISE.length)] + (tries > 0 ? " Fixing a mistake is how brains grow." : "") });
      setResult({ ok: true, assisted, given, correct: correctText, tries, hints, secs: Math.round((Date.now() - shownAt.current) / 1000), tutor: tutorUsed });
      return;
    }
    const n = tries + 1;
    setTries(n);
    setWrongs((w) => [...w, given]);
    if (r.kind === "choice") setStruck((s) => [...s, r.index]);
    const speedy = Date.now() - shownAt.current < 3500 && problem.prompt.length > 60 ? " Whoa, speedy! Read it once more, slowly." : "";
    if (placement || n >= 2) {
      setFeedback({ tone: "bad", text: placement ? "Not this time. That's OK, this just helps find your starting point!" : `${v.message ? v.message + " " : ""}The answer is ${correctText}. Let's look at how it works.` });
      setShowSteps(!placement);
      setResult({ ok: false, assisted: true, given, correct: correctText, tries: n, hints, secs: Math.round((Date.now() - shownAt.current) / 1000), tutor: tutorUsed });
      return;
    }
    setFeedback({ tone: "bad", text: (v.message ?? NUDGE[Math.floor(Math.random() * NUDGE.length)]) + speedy });
    if (r.kind === "point") setTimeout(() => setMark(null), 1200);
  };

  const done = !!result;
  return (
    <div className="card" data-test-answer={import.meta.env.DEV ? JSON.stringify(canonicalResponse(problem.answer)) : undefined} data-range={import.meta.env.DEV && problem.answer.kind === "point" ? JSON.stringify({ min: problem.answer.min, max: problem.answer.max }) : undefined}>
      {header}
      <div className="row" style={{ alignItems: "flex-start" }}>
        <MathText text={problem.prompt} as="div" className="prompt grow" />
        {readAloud && <button className="btn ghost" aria-label="read aloud" onClick={() => speak(problem.prompt)}>🔊</button>}
      </div>
      {problem.estimate && !done && <div className="estimate">🤔 <strong>Estimate first:</strong> <MathText text={problem.estimate} /></div>}
      {problem.visual && <Visual v={problem.visual} />}
      {scaffold.length > 0 && (
        <div className="hintbox">
          <strong>Let's do this one together. Here's the start:</strong>
          <ol className="steps">{scaffold.map((s, i) => <li key={i}><MathText text={s} /></li>)}</ol>
          <span className="small">Now finish it!</span>
        </div>
      )}
      <AnswerInput key={tries} answer={problem.answer} disabled={done} struck={struck} reveal={done} onSubmit={submit} pointMark={mark} />
      {problem.hints.slice(0, hints).map((h, i) => (
        <div className="hintbox" key={i}>💡 <MathText text={h} /></div>
      ))}
      {feedback && <div className={`feedback ${feedback.tone} ${feedback.tone === "good" ? "celebrate" : ""}`}><MathText text={feedback.text} /></div>}
      <div className="row">
        {!done && !placement && hints < problem.hints.length && (
          <button className="btn ghost" onClick={() => setHints((h) => h + 1)}>💡 {hints ? "Another hint" : "Hint"}</button>
        )}
        {done && !placement && !showSteps && <button className="btn ghost" onClick={() => setShowSteps(true)}>See the solution</button>}
        {!done && !placement && <StuckButton problem={problem} wrongAnswers={wrongs} hintsShown={hints} onUsed={() => setTutorUsed(true)} />}
        <span className="grow" />
        {done && (
          <button ref={contRef} className="btn primary" onClick={() => onFinish(result!)}>Continue →</button>
        )}
      </div>
      {showSteps && <SolutionSteps steps={problem.steps} onAllShown={() => setStepsDone(true)} />}
    </div>
  );
}
