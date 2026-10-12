import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import type { ExplanationToGrade, GradeResult } from "./types";

const GradeSchema = z.object({
  verdict: z.enum(["got_it", "almost", "not_yet"]),
  feedback_for_student: z.string(),
  note_for_parent: z.string(),
});

const SYSTEM = `You grade short written math explanations from a bright 10-year-old (5th grade) who is learning middle school math (North Carolina Grades 6–8 standards).

Decide whether the explanation shows real understanding of WHY the method works, using the key ideas as a guide:
- "got_it": the reasoning is correct and covers the important ideas, even if worded simply or not every key idea is spelled out. Spelling, grammar and length don't matter.
- "almost": on the right track but missing an important step or containing a small error.
- "not_yet": incorrect reasoning, only restates the answer or procedure with no "why", or off topic.

feedback_for_student: 1–3 short, warm sentences written directly to her. Praise something specific, and if it's not "got_it", ask one guiding question instead of giving the full answer. No more than 60 words.
note_for_parent: one sentence for her parent naming what she understands and any misconception.`;

/** Grades one explanation with Claude. Throws on network/auth problems so the caller can keep it for parent review. */
export async function gradeExplanation(apiKey: string, model: string, item: ExplanationToGrade): Promise<GradeResult> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 });
  const message = await client.messages.parse({
    model,
    max_tokens: 2000,
    output_config: { effort: "low", format: zodOutputFormat(GradeSchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Topic: ${item.skillTitle}\nQuestion: ${item.prompt}\nKey ideas: ${item.keyIdeas.join("; ")}\nExample of a strong answer: ${item.exemplar}\n\n<student_explanation>\n${item.response}\n</student_explanation>`,
      },
    ],
  });
  if (message.stop_reason === "refusal" || !message.parsed_output) throw new Error("No grade returned");
  const g = message.parsed_output;
  return { verdict: g.verdict, feedbackForStudent: g.feedback_for_student, noteForParent: g.note_for_parent };
}

export function describeError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "The API key was rejected. Check it in the Parent corner.";
  if (e instanceof Anthropic.PermissionDeniedError) return "This API key isn't allowed to use that model.";
  if (e instanceof Anthropic.RateLimitError) return "Claude is busy right now (rate limit). It'll be saved for later.";
  if (e instanceof Anthropic.APIConnectionError) return "Couldn't reach Claude (no internet?). It'll be saved for later.";
  if (e instanceof Anthropic.APIError) return `Claude returned an error (${e.status}). It'll be saved for later.`;
  return "Couldn't grade it right now. It'll be saved for later.";
}

