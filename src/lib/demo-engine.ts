import type { Connector, DataTask, ExtractedIntent, StageId, WorkflowStage } from "@/types";

export const CONNECTORS: Connector[] = [
  { id: "web-search", name: "Curated Web Index", type: "web", status: "active", recordsContributed: 0, reliability: 92, icon: "globe" },
  { id: "company-registry", name: "Company Directory", type: "api", status: "active", recordsContributed: 0, reliability: 97, icon: "building" },
  { id: "news-feed", name: "Ecosystem Feed", type: "api", status: "active", recordsContributed: 0, reliability: 88, icon: "newspaper" },
  { id: "social-directory", name: "Public Directory", type: "web", status: "active", recordsContributed: 0, reliability: 79, icon: "users" },
  { id: "csr-database", name: "CSR / Sustainability DB", type: "database", status: "active", recordsContributed: 0, reliability: 94, icon: "leaf" },
  { id: "job-boards", name: "Startup & Tech Index", type: "api", status: "active", recordsContributed: 0, reliability: 90, icon: "briefcase" },
  { id: "csv-upload", name: "Uploaded Files", type: "file", status: "idle", recordsContributed: 0, reliability: 100, icon: "file" },
];

export const STAGE_META: Record<StageId, { label: string; description: string }> = {
  interpret: { label: "Interpret", description: "Parsing the prompt into structured intent" },
  plan: { label: "Plan", description: "Designing a task-specific collection workflow" },
  collect: { label: "Collect", description: "Running connectors against permitted sources" },
  validate: { label: "Validate", description: "Checking field completeness and formats" },
  deduplicate: { label: "Deduplicate", description: "Merging near-identical records" },
  deliver: { label: "Deliver", description: "Publishing the dataset to your workspace" },
};

export function buildInitialStages(): WorkflowStage[] {
  return (Object.keys(STAGE_META) as StageId[]).map((id) => ({
    id,
    label: STAGE_META[id].label,
    description: STAGE_META[id].description,
    status: "pending",
    progress: 0,
    logs: [],
  }));
}

const LOCATIONS = ["pune", "bangalore", "mumbai", "delhi", "hyderabad", "chennai", "gurugram", "ahmedabad", "san francisco", "new york", "london", "berlin"];

function detectLocation(prompt: string): string | undefined {
  const lower = prompt.toLowerCase();
  return LOCATIONS.find((loc) => lower.includes(loc));
}

function detectEntityType(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("sponsor")) return "Sponsor Lead";
  if (lower.includes("job") || lower.includes("hiring") || lower.includes("role")) return "Job Opening";
  if (lower.includes("investor") || lower.includes("vc")) return "Investor";
  if (lower.includes("lead") || lower.includes("sales")) return "Sales Lead";
  if (lower.includes("event")) return "Event";
  return "Organization";
}

function detectFields(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const fields = new Set<string>(["Name"]);
  if (lower.includes("website")) fields.add("Website");
  if (lower.includes("industry")) fields.add("Industry");
  if (lower.includes("location")) fields.add("Location");
  if (lower.includes("contact")) fields.add("Contact Email");
  if (lower.includes("phone")) fields.add("Phone");
  if (lower.includes("company")) fields.add("Company");
  if (lower.includes("salary") || lower.includes("compensation")) fields.add("Salary Range");
  if (lower.includes("role") || lower.includes("title") || lower.includes("job")) fields.add("Role Title");
  // sensible defaults if the prompt didn't spell fields out
  if (fields.size < 4) {
    ["Website", "Industry", "Location", "Contact Email"].forEach((f) => fields.add(f));
  }
  return Array.from(fields);
}

export function extractIntent(prompt: string): ExtractedIntent {
  const location = detectLocation(prompt);
  const entityType = detectEntityType(prompt);
  const fields = detectFields(prompt);
  const constraints: string[] = [];
  if (location) constraints.push(`Location contains "${location}"`);
  if (prompt.toLowerCase().includes("sustain")) constraints.push("Sector relates to sustainability / environment");
  if (prompt.toLowerCase().includes("week")) constraints.push("Posted within the last 7 days");
  if (constraints.length === 0) constraints.push("No hard filters detected — broad collection");

  return {
    goal: prompt.trim(),
    entityType,
    location: location ? location[0].toUpperCase() + location.slice(1) : undefined,
    fields,
    constraints,
    confidence: intentConfidence(!!location, fields.length, entityType !== "Organization"),
  };
}

export function pickConnectorsForIntent(intent: ExtractedIntent): string[] {
  const chosen = new Set<string>(["web-search", "company-registry"]);
  const goal = intent.goal.toLowerCase();
  if (goal.includes("sustain") || goal.includes("csr") || goal.includes("environment")) chosen.add("csr-database");
  if (goal.includes("job") || goal.includes("hiring") || goal.includes("role")) chosen.add("job-boards");
  if (goal.includes("sponsor") || goal.includes("lead") || goal.includes("news")) chosen.add("news-feed");
  if (goal.includes("contact") || goal.includes("social")) chosen.add("social-directory");
  if (chosen.size < 3) chosen.add("news-feed");
  return Array.from(chosen);
}

// Confidence for intent: deterministic, from extraction evidence (no random).
export function intentConfidence(locFound: boolean, fieldsCount: number, entityCertain: boolean): number {
  let c = 0.72;
  if (locFound) c += 0.08;
  if (fieldsCount >= 4) c += 0.06;
  if (entityCertain) c += 0.06;
  return Math.round(Math.min(0.97, c) * 100) / 100;
}

export const DEMO_PROMPT =
  "Find sustainability-focused sponsor leads for a college technology festival in Pune. Include company name, website, industry, location and contact information.";

export function createTaskShell(prompt: string): DataTask {
  return {
    id: `task_${Math.random().toString(36).slice(2, 10)}`,
    prompt,
    createdAt: new Date().toISOString(),
    status: "queued",
    intent: null,
    stages: buildInitialStages(),
    connectors: [],
    recordsFound: 0,
    duplicatesRemoved: 0,
    datasetId: null,
    progress: 0,
    isDemo: false,
  };
}
