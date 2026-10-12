import Anthropic from "@anthropic-ai/sdk";

import type { ApiMessage } from "./tutor";

/** One tutor reply as plain text ("" when Claude declined or wrote nothing). Throws on network/auth problems. */
export async function tutorReply(apiKey: string, model: string, system: string, messages: ApiMessage[]): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 });
  const message = await client.messages.create({
    model,
    // Room for a little thinking plus a reply of at most ~60 words.
    max_tokens: 800,
    output_config: { effort: "low" },
    system,
    messages,
  });
  if (message.stop_reason === "refusal") return "";
  return message.content
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("\n")
    .trim();
}

/** Kid-friendly error text for the chat panel. */
export function describeTutorError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
    return "The tutor can't log in right now. Ask a grown-up to check the key in the Teacher corner. Try a hint!";
  }
  if (e instanceof Anthropic.RateLimitError) return "The tutor is busy right now. Try a hint, or ask again in a minute!";
  return "I couldn't reach the tutor right now. Try a hint!";
}
