import { randomUUID } from "crypto";
import { pool, query, queryOne } from "@/lib/server/db";
import { buildInitialStages, STAGE_META } from "@/lib/demo-engine";
import type {
  DataTask,
  Dataset,
  ExtractedIntent,
  SourceRecord,
  StageId,
  StageStatus,
  TaskStatus,
  WorkflowStage,
  WorkflowTemplate,
} from "@/types";

const STAGE_ORDER: StageId[] = ["interpret", "plan", "collect", "validate", "deduplicate", "deliver"];

function newId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function createTask(prompt: string): Promise<string> {
  const id = newId("task");
  await query(
    `INSERT INTO "Task" (id, prompt, status, progress, "recordsFound", "duplicatesRemoved", "isDemo")
     VALUES ($1, $2, 'queued', 0, 0, 0, true)`,
    [id, prompt]
  );

  const stages = buildInitialStages();
  for (let i = 0; i < stages.length; i++) {
    await query(
      `INSERT INTO "Stage" (id, "taskId", "stageId", label, description, status, progress, logs, "order")
       VALUES ($1, $2, $3, $4, $5, 'pending', 0, '{}', $6)`,
      [newId("stage"), id, stages[i].id, stages[i].label, stages[i].description, i]
    );
  }

  return id;
}

export async function setTaskStatus(taskId: string, status: TaskStatus) {
  await query(`UPDATE "Task" SET status = $2, "updatedAt" = now() WHERE id = $1`, [taskId, status]);
}

export async function setTaskProgress(taskId: string, progress: number) {
  await query(`UPDATE "Task" SET progress = $2, "updatedAt" = now() WHERE id = $1`, [taskId, progress]);
}

export async function setTaskCounts(taskId: string, recordsFound: number, duplicatesRemoved: number) {
  await query(
    `UPDATE "Task" SET "recordsFound" = $2, "duplicatesRemoved" = $3, "updatedAt" = now() WHERE id = $1`,
    [taskId, recordsFound, duplicatesRemoved]
  );
}

export async function saveIntent(taskId: string, intent: ExtractedIntent) {
  await query(
    `INSERT INTO "Intent" (id, "taskId", goal, "entityType", location, industry, fields, constraints, confidence)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT ("taskId") DO UPDATE SET
       goal = EXCLUDED.goal, "entityType" = EXCLUDED."entityType", location = EXCLUDED.location,
       industry = EXCLUDED.industry, fields = EXCLUDED.fields, constraints = EXCLUDED.constraints,
       confidence = EXCLUDED.confidence`,
    [
      newId("intent"),
      taskId,
      intent.goal,
      intent.entityType,
      intent.location ?? null,
      null,
      intent.fields,
      intent.constraints,
      intent.confidence,
    ]
  );
}

export async function saveTaskConnectors(taskId: string, connectorIds: string[]) {
  for (const connectorId of connectorIds) {
    await query(
      `INSERT INTO "TaskConnector" (id, "taskId", "connectorId") VALUES ($1, $2, $3)
       ON CONFLICT ("taskId", "connectorId") DO NOTHING`,
      [newId("tc"), taskId, connectorId]
    );
  }
}

export async function updateStage(
  taskId: string,
  stageId: StageId,
  patch: { status?: StageStatus; progress?: number; appendLogs?: string[] }
) {
  const sets: string[] = [];
  const params: unknown[] = [taskId, stageId];
  let i = 3;

  if (patch.status !== undefined) {
    sets.push(`status = $${i++}`);
    params.push(patch.status);
  }
  if (patch.progress !== undefined) {
    sets.push(`progress = $${i++}`);
    params.push(patch.progress);
  }
  if (patch.appendLogs && patch.appendLogs.length > 0) {
    sets.push(`logs = logs || $${i++}::text[]`);
    params.push(patch.appendLogs);
  }
  if (sets.length === 0) return;

  await query(
    `UPDATE "Stage" SET ${sets.join(", ")} WHERE "taskId" = $1 AND "stageId" = $2`,
    params
  );
}

interface TaskRow {
  id: string;
  prompt: string;
  status: TaskStatus;
  progress: number;
  recordsFound: number;
  duplicatesRemoved: number;
  isDemo: boolean;
  createdAt: Date;
  datasetId: string | null;
}

interface StageRow {
  stageId: StageId;
  status: StageStatus;
  progress: number;
  logs: string[];
  order: number;
}

interface IntentRow {
  goal: string;
  entityType: string;
  location: string | null;
  fields: string[];
  constraints: string[];
  confidence: number;
}

async function hydrateTask(row: TaskRow): Promise<DataTask> {
  const stageRows = await query<StageRow>(
    `SELECT "stageId", status, progress, logs, "order" FROM "Stage" WHERE "taskId" = $1 ORDER BY "order" ASC`,
    [row.id]
  );
  const intentRow = await queryOne<IntentRow>(
    `SELECT goal, "entityType", location, fields, constraints, confidence FROM "Intent" WHERE "taskId" = $1`,
    [row.id]
  );
  const connectorRows = await query<{ connectorId: string }>(
    `SELECT "connectorId" FROM "TaskConnector" WHERE "taskId" = $1`,
    [row.id]
  );

  const stages: WorkflowStage[] = stageRows.map((s) => ({
    id: s.stageId,
    label: STAGE_META[s.stageId].label,
    description: STAGE_META[s.stageId].description,
    status: s.status,
    progress: s.progress,
    logs: s.logs ?? [],
  }));

  const intent: ExtractedIntent | null = intentRow
    ? {
        goal: intentRow.goal,
        entityType: intentRow.entityType,
        location: intentRow.location ?? undefined,
        fields: intentRow.fields,
        constraints: intentRow.constraints,
        confidence: intentRow.confidence,
      }
    : null;

  return {
    id: row.id,
    prompt: row.prompt,
    createdAt: new Date(row.createdAt).toISOString(),
    status: row.status,
    intent,
    stages,
    connectors: connectorRows.map((c) => c.connectorId),
    recordsFound: row.recordsFound,
    duplicatesRemoved: row.duplicatesRemoved,
    datasetId: row.datasetId,
    progress: row.progress,
    isDemo: row.isDemo,
  };
}

export async function getTask(taskId: string): Promise<DataTask | null> {
  const row = await queryOne<TaskRow>(
    `SELECT t.id, t.prompt, t.status, t.progress, t."recordsFound", t."duplicatesRemoved", t."isDemo",
            t."createdAt", d.id AS "datasetId"
     FROM "Task" t
     LEFT JOIN "Dataset" d ON d."taskId" = t.id
     WHERE t.id = $1`,
    [taskId]
  );
  if (!row) return null;
  return hydrateTask(row);
}

export async function listTasks(limit = 50): Promise<DataTask[]> {
  const rows = await query<TaskRow>(
    `SELECT t.id, t.prompt, t.status, t.progress, t."recordsFound", t."duplicatesRemoved", t."isDemo",
            t."createdAt", d.id AS "datasetId"
     FROM "Task" t
     LEFT JOIN "Dataset" d ON d."taskId" = t.id
     ORDER BY t."createdAt" DESC
     LIMIT $1`,
    [limit]
  );
  return Promise.all(rows.map(hydrateTask));
}

// ---------------------------------------------------------------------------
// Datasets & records
// ---------------------------------------------------------------------------

export async function createDataset(params: {
  taskId: string;
  name: string;
  prompt: string;
  columns: string[];
  sourcesUsed: string[];
  records: SourceRecord[];
}): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const datasetId = newId("ds");
    await client.query(
      `INSERT INTO "Dataset" (id, "taskId", name, prompt, columns, "sourcesUsed")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [datasetId, params.taskId, params.name, params.prompt, params.columns, params.sourcesUsed]
    );

    for (const r of params.records) {
      await client.query(
        `INSERT INTO "Record" (id, "datasetId", fields, confidence, flagged, "sourceName", "sourceUrl", "collectedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          newId("rec"),
          datasetId,
          JSON.stringify(r.fields),
          r.confidence,
          r.flagged ?? false,
          r.sourceName,
          r.sourceUrl,
          r.collectedAt,
        ]
      );
    }

    await client.query("COMMIT");
    return datasetId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

interface DatasetRow {
  id: string;
  taskId: string;
  name: string;
  prompt: string;
  columns: string[];
  sourcesUsed: string[];
  createdAt: Date;
}

interface RecordRow {
  id: string;
  fields: Record<string, string | number>;
  confidence: number;
  flagged: boolean;
  sourceName: string;
  sourceUrl: string;
  collectedAt: Date;
}

export async function getDataset(datasetId: string): Promise<Dataset | null> {
  const row = await queryOne<DatasetRow>(
    `SELECT id, "taskId", name, prompt, columns, "sourcesUsed", "createdAt" FROM "Dataset" WHERE id = $1`,
    [datasetId]
  );
  if (!row) return null;

  const recordRows = await query<RecordRow>(
    `SELECT id, fields, confidence, flagged, "sourceName", "sourceUrl", "collectedAt"
     FROM "Record" WHERE "datasetId" = $1 ORDER BY "collectedAt" DESC`,
    [datasetId]
  );

  return {
    id: row.id,
    taskId: row.taskId,
    name: row.name,
    prompt: row.prompt,
    createdAt: new Date(row.createdAt).toISOString(),
    columns: row.columns,
    sourcesUsed: row.sourcesUsed,
    records: recordRows.map((r) => ({
      id: r.id,
      taskId: row.taskId,
      fields: r.fields,
      confidence: r.confidence,
      flagged: r.flagged,
      sourceName: r.sourceName,
      sourceUrl: r.sourceUrl,
      collectedAt: new Date(r.collectedAt).toISOString(),
    })),
  };
}

export async function listDatasets(limit = 100): Promise<Dataset[]> {
  const rows = await query<DatasetRow & { recordCount: string }>(
    `SELECT d.id, d."taskId", d.name, d.prompt, d.columns, d."sourcesUsed", d."createdAt",
            COUNT(r.id) AS "recordCount"
     FROM "Dataset" d
     LEFT JOIN "Record" r ON r."datasetId" = d.id
     GROUP BY d.id
     ORDER BY d."createdAt" DESC
     LIMIT $1`,
    [limit]
  );

  // The list view renders a small preview per card; full records are fetched
  // via getDataset(id) when the user opens the Dataset Explorer. We still cap
  // at 200 here (not just a count) so the shared Dataset type stays honest.
  return Promise.all(
    rows.map(async (row) => {
      const recordRows = await query<RecordRow>(
        `SELECT id, fields, confidence, flagged, "sourceName", "sourceUrl", "collectedAt"
         FROM "Record" WHERE "datasetId" = $1 LIMIT 200`,
        [row.id]
      );
      return {
        id: row.id,
        taskId: row.taskId,
        name: row.name,
        prompt: row.prompt,
        createdAt: new Date(row.createdAt).toISOString(),
        columns: row.columns,
        sourcesUsed: row.sourcesUsed,
        recordCount: Number(row.recordCount),
        records: recordRows.map((r) => ({
          id: r.id,
          taskId: row.taskId,
          fields: r.fields,
          confidence: r.confidence,
          flagged: r.flagged,
          sourceName: r.sourceName,
          sourceUrl: r.sourceUrl,
          collectedAt: new Date(r.collectedAt).toISOString(),
        })),
      };
    })
  );
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export async function createWorkflow(params: {
  taskId: string;
  name: string;
  prompt: string;
  connectors: string[];
}): Promise<void> {
  await query(
    `INSERT INTO "Workflow" (id, "taskId", name, prompt, stages, connectors, "usageCount")
     VALUES ($1, $2, $3, $4, $5, $6, 1)
     ON CONFLICT ("taskId") DO NOTHING`,
    [newId("wf"), params.taskId, params.name, params.prompt, STAGE_ORDER, params.connectors]
  );
}

interface WorkflowRow {
  id: string;
  taskId: string | null;
  name: string;
  prompt: string;
  stages: StageId[];
  connectors: string[];
  usageCount: number;
  createdAt: Date;
}

export async function listWorkflows(limit = 100): Promise<WorkflowTemplate[]> {
  const rows = await query<WorkflowRow>(
    `SELECT id, "taskId", name, prompt, stages, connectors, "usageCount", "createdAt"
     FROM "Workflow" ORDER BY "createdAt" DESC LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    prompt: r.prompt,
    usageCount: r.usageCount,
    createdAt: new Date(r.createdAt).toISOString(),
    stages: r.stages,
    connectors: r.connectors,
  }));
}

// ---------------------------------------------------------------------------
// Connectors / sources
// ---------------------------------------------------------------------------

interface ConnectorRow {
  id: string;
  name: string;
  type: string;
  status: string;
  reliability: number;
  contributed: string;
}

export async function listConnectorsWithContributions() {
  const rows = await query<ConnectorRow>(
    `SELECT c.id, c.name, c.type, c.status, c.reliability, COUNT(r.id) AS contributed
     FROM "Connector" c
     LEFT JOIN "Record" r ON r."sourceName" = c.name
     GROUP BY c.id
     ORDER BY c.name ASC`
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    status: r.status,
    reliability: r.reliability,
    recordsContributed: Number(r.contributed),
  }));
}
