import type { ExtractedIntent } from "@/types";
import { extractIntent as extractIntentHeuristic } from "@/lib/demo-engine";

const SYSTEM_PROMPT = `You extract structured data-collection intent from a plain-English request.
Respond with ONLY a JSON object (no markdown, no prose) matching this exact shape:
{
  "goal": string,
  "entityType": string,
  "location": string | null,
  "industry": string | null,
  "fields": string[],
  "constraints": string[],
  "confidence": number (0 to 1)
}
"fields" should be the concrete data columns the user wants (e.g. "Website", "Industry",
"Contact Email"). "constraints" should be short human-readable filters implied by the
prompt. Keep it concise.`;

/**
 * Extracts intent from a prompt. If AI_API_KEY is configured, this calls the
 * Anthropic Messages API for real LLM-based extraction. Otherwise (and on any
 * failure, so the product never hard-fails a demo) it falls back to the local
 * keyword-based heuristic in demo-engine.ts.
 */
export async function extractIntentAI(prompt: string): Promise<{ intent: ExtractedIntent; usedAI: boolean }> {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return { intent: extractIntentHeuristic(prompt), usedAI: false };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    const text = (data.content ?? [])
      .map((block: { type: string; text?: string }) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    const cleaned = text.replace(/^```json\s*|```$/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const intent: ExtractedIntent = {
      goal: parsed.goal ?? prompt,
      entityType: parsed.entityType ?? "Organization",
      location: parsed.location ?? undefined,
      industry: parsed.industry ?? undefined,
      fields: Array.isArray(parsed.fields) && parsed.fields.length > 0 ? parsed.fields : ["Name", "Website"],
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
    };

    return { intent, usedAI: true };
  } catch (err) {
    console.error("[extractIntentAI] falling back to heuristic extraction:", err);
    return { intent: extractIntentHeuristic(prompt), usedAI: false };
  }
}
