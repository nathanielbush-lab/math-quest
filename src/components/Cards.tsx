import { useEffect, useRef, useState } from "react";
import { SKILL_BY_ID } from "../content";
import type { Problem, Skill, WhyChoice, WhyWritten } from "../content/types";
import { makeRng } from "../lib/rng";
import type { Level } from "../content/types";
import { answerText } from "../engine/check";
import { grade as gradeIt, type GradeResult } from "../grading/types";
import { MathText, speak } from "./MathText";
import { ProblemCard, type ProblemResult } from "./ProblemCard";
import { Visual } from "./Visual";

function useEnterToContinue(fn: () => void, enabled = true) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (enabled) ref.current?.focus();
  }, [enabled]);
  return { ref, onClick: fn };
}

export function LessonCard({ skill, recap, readAloud, onDone }: { skill: Skill; recap: boolean; readAloud: boolean; onDone: () => void }) {
  const btn = useEnterToContinue(onDone);
  const { lesson } = skill;
  return (
    <div className="card">
      <div className="row">
        <span className="chip">📘 {recap ? "Quick recap" : "New idea"}</span>
        <span className="muted small grow">{skill.title}</span>
        {readAloud && <button className="btn ghost" aria-label="read aloud" onClick={() => speak([lesson.bigIdea, ...lesson.explain].join(" "))}>🔊</button>}
      </div>
      <p className="bigidea" style={{ marginTop: 12 }}><MathText text={lesson.bigIdea} /></p>
      {lesson.explain.map((t, i) => <MathText key={i} as="p" text={t} />)}
      {lesson.visual && <Visual v={lesson.visual} />}
      {lesson.tip && <p className="tip">⭐ <MathText text={lesson.tip} /></p>}
      <div className="row"><span className="grow" /><button className="btn primary big" {...btn}>Show me an example →</button></div>
    </div>
  );
}

export function WorkedExample({ skill, seed, level, onDone }: { skill: Skill; seed: number; level: Level; onDone: () => void }) {
  const [problem] = useState<Problem>(() => skill.generate(makeRng(seed), level));
  const steps = problem.steps.filter((s, i, all) => s !== all[i - 1]);
  const [shown, setShown] = useState(1);
  const all = shown >= steps.length;
  const btn = useEnterToContinue(all ? onDone : () => setShown((n) => n + 1));
  return (
    <div className="card">
      <span className="chip">👀 Watch me solve one</span>
      <MathText text={problem.prompt} as="div" className="prompt" />
      {problem.visual && problem.answer.kind !== "point" && <Visual v={problem.visual} />}
      <ol className="steps">{steps.slice(0, shown).map((s, i) => <li key={i} className="celebrate"><MathText text={s} /></li>)}</ol>
      {all && <div className="feedback info">Answer: <MathText text={answerText(problem.answer)} /></div>}
      <div className="row"><span className="grow" /><button className="btn primary" {...btn}>{all ? "Your turn →" : "Next step"}</button></div>
    </div>
  );
}

export function WhyCard({ skill, onDone }: { skill: Skill; onDone: (ok: boolean) => void }) {
  const why = skill.why.find((w): w is WhyChoice => w.kind === "choice")!;
  const [pick, setPick] = useState<number | null>(null);
  const ok = pick === why.correct;
  const btn = useEnterToContinue(() => onDone(ok), pick !== null);
  return (
    <div className="card">
      <span className="chip">🧠 Why does it work?</span>
      <MathText text={why.prompt} as="div" className="prompt" />
      <div className="choices">
        {why.choices.map((c, i) => (
          <button key={i} className={`choice ${pick !== null && i === why.correct ? "right" : pick === i ? "wrong" : ""}`} disabled={pick !== null} onClick={() => setPick(i)}>
            <span className="key">{i + 1}</span><MathText text={c} />
          </button>
        ))}
      </div>
      {pick !== null && <div className={`feedback ${ok ? "good" : "info"}`}>{ok ? "Exactly! " : "Here's the reason: "}<MathText text={why.explain} /></div>}
      {pick !== null && <div className="row"><span className="grow" /><button className="btn primary" {...btn}>Continue →</button></div>}
    </div>
  );
}

export function ExplainCard({
  skill,
  apiKey,
  model,
  onDone,
}: {
  skill: Skill;
  apiKey?: string;
  model: string;
  onDone: (r: { response: string; grade: GradeResult | null; error?: string } | null) => void;
}) {
  const why = skill.why.find((w): w is WhyWritten => w.kind === "written")!;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const submit = async () => {
    setSubmitted(true);
    if (!apiKey) return;
    setBusy(true);
    const out = await gradeIt(apiKey, model, { skillTitle: skill.title, prompt: why.prompt, keyIdeas: why.keyIdeas, exemplar: why.exemplar, response: text });
    setGrade(out.grade);
    setError(out.error ?? null);
    setBusy(false);
  };
  return (
    <div className="card">
      <span className="chip">✍️ Explain it in your own words</span>
      <p className="muted small" style={{ marginTop: 8 }}>{skill.title}</p>
      <MathText text={why.prompt} as="div" className="prompt" />
      <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={submitted} placeholder="Write like you're teaching a friend. Use words, numbers, or both!" />
      {!submitted && (
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => onDone(null)}>Skip for now</button>
          <span className="grow" />
          <button className="btn primary" disabled={text.trim().length < 15} onClick={submit}>Submit</button>
        </div>
      )}
      {busy && <div className="feedback info">Reading your explanation… 🤔</div>}
      {grade && (
        <div className={`feedback ${grade.verdict === "got_it" ? "good" : "warn"}`}>
          {grade.verdict === "got_it" ? "🌟 Great explanation! " : grade.verdict === "almost" ? "Almost there! " : "Good start! "}
          {grade.feedbackForStudent}
        </div>
      )}
      {submitted && !busy && !grade && <div className="feedback info">{error ? error + " " : ""}Saved! A grown-up will read it and give you feedback.</div>}
      {submitted && !busy && (
        <div className="row"><span className="grow" /><button className="btn primary" onClick={() => onDone({ response: text, grade, error: error ?? undefined })} autoFocus>Continue →</button></div>
      )}
    </div>
  );
}

/** A multi-part "unfamiliar problem" (challenge or mission). */
export function MultiPart({
  title,
  intro,
  parts,
  readAloud,
  onDone,
}: {
  title: string;
  intro: string;
  parts: (Problem & { section?: string })[];
  readAloud: boolean;
  onDone: (results: ProblemResult[]) => void;
}) {
  const [i, setI] = useState(0);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const p = parts[i];
  return (
    <div>
      <div className="card hero">
        <h2>🧩 {title}</h2>
        <MathText text={intro} as="p" />
        <div className="progressbar" style={{ background: "rgba(255,255,255,0.3)" }}><div style={{ width: `${(i / parts.length) * 100}%`, background: "#fff" }} /></div>
      </div>
      <ProblemCard
        key={i}
        problem={p}
        readAloud={readAloud}
        header={<div className="muted small" style={{ marginBottom: 6 }}>Part {i + 1} of {parts.length}{p.section ? ` · ${p.section}` : ""}</div>}
        onFinish={(r) => {
          const all = [...results, r];
          setResults(all);
          if (i + 1 >= parts.length) onDone(all);
          else setI(i + 1);
        }}
      />
    </div>
  );
}

export function skillOf(id: string) {
  return SKILL_BY_ID[id];
}
