import type { StageId } from "@/types";
import {
  CONNECTORS,
  estimateDuplicates,
  generateDemoRecords,
  pickConnectorsForIntent,
} from "@/lib/demo-engine";
import { extractIntentAI } from "@/lib/server/ai";
import * as repo from "@/lib/server/repository";

const STAGE_ORDER: StageId[] = ["interpret", "plan", "collect", "validate", "deduplicate", "deliver"];
const STAGE_DURATIONS: Record<StageId, number> = {
  interpret: 1400,
  plan: 1600,
  collect: 3200,
  validate: 1800,
  deduplicate: 1200,
  deliver: 900,
};

// One Node process backs `next dev` / `next start`, so an in-memory timer
// registry per task is enough to drive live progress for a hackathon demo.
// A production deployment behind a serverless platform would replace this
// with a real job queue (e.g. a worker consuming a Postgres-backed queue),
// but the persisted state (Task/Stage/Dataset rows) is real either way.
const timers = new Map<string, ReturnType<typeof setTimeout>>();
function setTimer(taskId: string, fn: () => void, ms: number) {
  const existing = timers.get(taskId);
  if (existing) clearTimeout(existing);
  timers.set(taskId, setTimeout(fn, ms));
}

const runState = new Map<string, { recordsFound: number; duplicatesRemoved: number; connectors: string[] }>();

export function startPipeline(taskId: string, prompt: string) {
  runState.set(taskId, { recordsFound: 0, duplicatesRemoved: 0, connectors: [] });
  repo.setTaskStatus(taskId, "running").catch((e) => console.error("[pipeline] setTaskStatus failed", e));
  runStage(taskId, prompt, 0);
}

export function pausePipeline(taskId: string) {
  const timer = timers.get(taskId);
  if (timer) clearTimeout(timer);
  timers.delete(taskId);
  return repo.setTaskStatus(taskId, "paused");
}

export async function resumePipeline(taskId: string, prompt: string) {
  const existing = timers.get(taskId);
  if (existing) clearTimeout(existing);
  await repo.setTaskStatus(taskId, "running");
  const task = await repo.getTask(taskId);
  if (!task) return;
  const stageIndex = task.stages.findIndex((s) => s.status === "active" || s.status === "pending");
  if (!runState.has(taskId)) {
    runState.set(taskId, {
      recordsFound: task.recordsFound,
      duplicatesRemoved: task.duplicatesRemoved,
      connectors: task.connectors,
    });
  }
  runStage(taskId, prompt, Math.max(stageIndex, 0));
}

export function cancelPipeline(taskId: string) {
  const timer = timers.get(taskId);
  if (timer) clearTimeout(timer);
  timers.delete(taskId);
  runState.delete(taskId);
  return repo.setTaskStatus(taskId, "cancelled");
}

async function isStillRunning(taskId: string): Promise<boolean> {
  const task = await repo.getTask(taskId);
  return task?.status === "running";
}

function runStage(taskId: string, prompt: string, stageIndex: number) {
  if (stageIndex >= STAGE_ORDER.length) {
    finalizePipeline(taskId, prompt).catch((e) => console.error("[pipeline] finalize failed", e));
    return;
  }

  const stageId = STAGE_ORDER[stageIndex];
  const duration = STAGE_DURATIONS[stageId];
  const steps = 10;
  const stepTime = duration / steps;
  let currentStep = 0;

  repo
    .updateStage(taskId, stageId, { status: "active", progress: 0 })
    .then(() => repo.setTaskProgress(taskId, Math.round((stageIndex / STAGE_ORDER.length) * 100)))
    .catch((e) => console.error("[pipeline] stage start failed", e));

  const tick = async () => {
    if (!(await isStillRunning(taskId))) return;

    currentStep += 1;
    const stageProgress = Math.min(100, Math.round((currentStep / steps) * 100));
    await repo.updateStage(taskId, stageId, { progress: stageProgress });

    if (currentStep >= steps) {
      await completeStage(taskId, prompt, stageIndex);
      setTimer(taskId, () => runStage(taskId, prompt, stageIndex + 1), 260);
    } else {
      setTimer(taskId, () => void tick(), stepTime);
    }
  };

  setTimer(taskId, () => void tick(), stepTime);
}

async function completeStage(taskId: string, prompt: string, stageIndex: number) {
  const stageId = STAGE_ORDER[stageIndex];
  const state = runState.get(taskId) ?? { recordsFound: 0, duplicatesRemoved: 0, connectors: [] };
  const logs: string[] = [];

  if (stageId === "interpret") {
    const { intent, usedAI } = await extractIntentAI(prompt);
    await repo.saveIntent(taskId, intent);
    logs.push(
      `Detected entity type: ${intent.entityType}`,
      `Extracted ${intent.fields.length} target fields`,
      `Confidence: ${Math.round(intent.confidence * 100)}%`,
      usedAI ? "Intent extracted via LLM" : "Intent extracted via local heuristic (no AI_API_KEY configured)"
    );
  } else if (stageId === "plan") {
    const task = await repo.getTask(taskId);
    const connectors = task?.intent ? pickConnectorsForIntent(task.intent) : ["web-search", "company-registry"];
    state.connectors = connectors;
    await repo.saveTaskConnectors(taskId, connectors);
    logs.push(
      `Selected ${connectors.length} connectors`,
      ...connectors.map((c) => `+ ${CONNECTORS.find((x) => x.id === c)?.name ?? c}`)
    );
  } else if (stageId === "collect") {
    const target = 24 + Math.floor(Math.random() * 30);
    state.recordsFound = target;
    logs.push(
      `Collected ${target} raw records across ${state.connectors.length || 1} sources`,
      `Average response time: ${(220 + Math.random() * 400).toFixed(0)}ms`
    );
  } else if (stageId === "validate") {
    const dropped = Math.round(state.recordsFound * (0.03 + Math.random() * 0.05));
    state.recordsFound = Math.max(1, state.recordsFound - dropped);
    logs.push(`Validated field formats`, `Dropped ${dropped} incomplete records`);
  } else if (stageId === "deduplicate") {
    state.duplicatesRemoved = Math.max(1, Math.round(state.recordsFound * (0.05 + Math.random() * 0.07)));
    state.recordsFound = Math.max(1, state.recordsFound - state.duplicatesRemoved);
    logs.push(`Removed ${state.duplicatesRemoved} duplicate records`, `${state.recordsFound} unique records remain`);
  } else if (stageId === "deliver") {
    logs.push("Publishing dataset", "Indexing for search & filter");
  }

  runState.set(taskId, state);
  await repo.updateStage(taskId, stageId, { status: "done", progress: 100, appendLogs: logs });
  await repo.setTaskCounts(taskId, state.recordsFound, state.duplicatesRemoved);
  await repo.setTaskProgress(taskId, Math.round(((stageIndex + 1) / STAGE_ORDER.length) * 100));
}

async function finalizePipeline(taskId: string, prompt: string) {
  const task = await repo.getTask(taskId);
  if (!task || !task.intent) return;

  const records = generateDemoRecords(task.intent, task.connectors, task.recordsFound || 30).map((r) => ({
    ...r,
    taskId,
  }));
  const duplicatesRemoved = estimateDuplicates(records);
  const name = deriveDatasetName(prompt);

  const datasetId = await repo.createDataset({
    taskId,
    name,
    prompt,
    columns: task.intent.fields,
    sourcesUsed: task.connectors,
    records,
  });

  await repo.setTaskCounts(taskId, records.length, duplicatesRemoved);
  await repo.setTaskProgress(taskId, 100);
  await repo.setTaskStatus(taskId, "completed");
  await repo.createWorkflow({ taskId, name, prompt, connectors: task.connectors });

  timers.delete(taskId);
  runState.delete(taskId);

  return datasetId;
}

function deriveDatasetName(prompt: string): string {
  const words = prompt.replace(/[."]/g, "").split(" ").slice(0, 6).join(" ");
  return words.length > 0 ? words : "Untitled Dataset";
}
