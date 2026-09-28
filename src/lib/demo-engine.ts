import type { Connector, DataTask, ExtractedIntent, SourceRecord, StageId, WorkflowStage } from "@/types";

export const CONNECTORS: Connector[] = [
  { id: "web-search", name: "Web Search Index", type: "web", status: "active", recordsContributed: 0, reliability: 92, icon: "globe" },
  { id: "company-registry", name: "Company Registry API", type: "api", status: "active", recordsContributed: 0, reliability: 97, icon: "building" },
  { id: "news-feed", name: "News & Press Feed", type: "api", status: "active", recordsContributed: 0, reliability: 88, icon: "newspaper" },
  { id: "social-directory", name: "Public Social Directory", type: "web", status: "active", recordsContributed: 0, reliability: 79, icon: "users" },
  { id: "csr-database", name: "CSR / Sustainability DB", type: "database", status: "active", recordsContributed: 0, reliability: 94, icon: "leaf" },
  { id: "job-boards", name: "Job Board Aggregator", type: "api", status: "active", recordsContributed: 0, reliability: 90, icon: "briefcase" },
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

const LOCATIONS = ["pune", "bangalore", "mumbai", "delhi", "hyderabad", "chennai", "san francisco", "new york", "london", "berlin"];
const INDUSTRIES: Record<string, string[]> = {
  sustainability: ["Renewable Energy", "Green Manufacturing", "CSR", "Environmental Services", "Sustainable Packaging"],
  sponsor: ["Consumer Goods", "Technology", "Finance", "Retail", "Beverages"],
  tech: ["Software", "SaaS", "Fintech", "AI/ML", "Cloud Infrastructure"],
  job: ["Technology", "Marketing", "Design", "Operations", "Sales"],
  default: ["Technology", "Consumer Goods", "Finance", "Manufacturing", "Retail"],
};

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

function pickIndustryPool(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  if (lower.includes("sustain") || lower.includes("environment") || lower.includes("green")) return INDUSTRIES.sustainability;
  if (lower.includes("sponsor")) return INDUSTRIES.sponsor;
  if (lower.includes("tech") || lower.includes("startup")) return INDUSTRIES.tech;
  if (lower.includes("job") || lower.includes("hiring")) return INDUSTRIES.job;
  return INDUSTRIES.default;
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
    confidence: 0.86 + Math.random() * 0.1,
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

const NAME_PARTS_1 = ["Green", "Nimbus", "Solara", "Verdant", "Northwind", "Brightline", "Terra", "Aether", "Evercore", "Bluepeak", "Cedar", "Ironwood", "Lumen", "Meridian", "Riverside", "Skyward", "Vantage", "Windrose", "Kinetic", "Halcyon"];
const NAME_PARTS_2 = ["Labs", "Group", "Collective", "Industries", "Partners", "Holdings", "Works", "Systems", "Ventures", "Solutions", "Networks", "Foundation", "Technologies", "Dynamics", "& Co."];
const FIRST_NAMES = ["Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Diya", "Kabir", "Meera", "Arjun", "Ishaan", "Sara", "Nikhil", "Tara", "Dev", "Maya"];
const LAST_NAMES = ["Sharma", "Mehta", "Iyer", "Kapoor", "Rao", "Nair", "Verma", "Chopra", "Bose", "Malhotra"];
const ROLES = ["CSR Manager", "Partnerships Lead", "Marketing Director", "Sustainability Officer", "Community Relations Head", "Brand Manager"];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function generateCompanyName(rand: () => number): string {
  const a = NAME_PARTS_1[Math.floor(rand() * NAME_PARTS_1.length)];
  const b = NAME_PARTS_2[Math.floor(rand() * NAME_PARTS_2.length)];
  return `${a} ${b}`;
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function generateDemoRecords(intent: ExtractedIntent, connectors: string[], count: number): SourceRecord[] {
  const rand = seededRandom(Math.floor(intent.goal.length * 137.5) + count);
  const industries = pickIndustryPool(intent.goal);
  const records: SourceRecord[] = [];

  for (let i = 0; i < count; i++) {
    const company = generateCompanyName(rand);
    const domain = `${slugify(company)}.com`;
    const industry = industries[Math.floor(rand() * industries.length)];
    const source = connectors[Math.floor(rand() * connectors.length)];
    const contactFirst = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const contactLast = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const location = intent.location || ["Pune", "Bangalore", "Mumbai", "Delhi"][Math.floor(rand() * 4)];

    const fields: Record<string, string | number> = {};
    intent.fields.forEach((field) => {
      switch (field) {
        case "Name":
          fields["Name"] = company;
          break;
        case "Website":
          fields["Website"] = `https://${domain}`;
          break;
        case "Industry":
          fields["Industry"] = industry;
          break;
        case "Location":
          fields["Location"] = location;
          break;
        case "Contact Email":
          fields["Contact Email"] = `${contactFirst.toLowerCase()}.${contactLast.toLowerCase()}@${domain}`;
          break;
        case "Phone":
          fields["Phone"] = `+91 ${70000 + Math.floor(rand() * 9999)} ${10000 + Math.floor(rand() * 89999)}`;
          break;
        case "Company":
          fields["Company"] = company;
          break;
        case "Role Title":
          fields["Role Title"] = ROLES[Math.floor(rand() * ROLES.length)];
          break;
        case "Salary Range":
          fields["Salary Range"] = `₹${8 + Math.floor(rand() * 20)}L – ₹${20 + Math.floor(rand() * 20)}L`;
          break;
        default:
          fields[field] = "—";
      }
    });

    records.push({
      id: `rec_${Date.now().toString(36)}_${i}`,
      taskId: "",
      fields,
      confidence: Math.round((0.62 + rand() * 0.37) * 100) / 100,
      sourceName: CONNECTORS.find((c) => c.id === source)?.name ?? "Web Search Index",
      sourceUrl: `https://${domain}/about`,
      collectedAt: new Date(Date.now() - Math.floor(rand() * 1000 * 60 * 40)).toISOString(),
      flagged: rand() < 0.08,
    });
  }

  return records;
}

export function estimateDuplicates(records: SourceRecord[]): number {
  return Math.max(1, Math.round(records.length * (0.06 + Math.random() * 0.08)));
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
    isDemo: true,
  };
}
