// Kept separate from claude.ts so screens can use these without loading the Anthropic SDK up front.
export interface ExplanationToGrade {
  skillTitle: string;
  prompt: string;
  keyIdeas: string[];
  exemplar: string;
  response: string;
}

export interface GradeResult {
  verdict: "got_it" | "almost" | "not_yet";
  feedbackForStudent: string;
  noteForParent: string;
}

export interface GradeOutcome {
  grade: GradeResult | null;
  error?: string;
}

/** Loads the SDK on first use and grades; never throws. */
export async function grade(apiKey: string, model: string, item: ExplanationToGrade): Promise<GradeOutcome> {
  const mod = await import("./claude");
  try {
    return { grade: await mod.gradeExplanation(apiKey, model, item) };
  } catch (e) {
    return { grade: null, error: mod.describeError(e) };
  }
}

/** Text a parent can paste into a Claude chat to have pending explanations graded there. */
export function reviewPrompt(items: (ExplanationToGrade & { id: string; date: string })[]): string {
  const body = items
    .map((it, i) => `### ${i + 1}. ${it.skillTitle} (${it.date})\nQuestion: ${it.prompt}\nKey ideas: ${it.keyIdeas.join("; ")}\nStrong answer example: ${it.exemplar}\nHer explanation: """${it.response}"""`)
    .join("\n\n");
  return `My 5th-grade daughter is learning middle school math with a practice app. Please grade each written explanation below.

For each one, say GOT IT, ALMOST or NOT YET (GOT IT = correct reasoning that explains why, even if simply worded; ignore spelling). Then give one warm sentence of feedback I can read to her, and if it isn't GOT IT, one guiding question. Keep it short. A table is fine.

${body}`;
}
