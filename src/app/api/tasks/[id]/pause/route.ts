import { NextResponse } from "next/server";
import * as repo from "@/lib/server/repository";
import { pausePipeline } from "@/lib/server/pipeline-engine";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await repo.getTask(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    if (task.status !== "running") {
      return NextResponse.json({ error: `Cannot pause a ${task.status} task` }, { status: 409 });
    }
    await pausePipeline(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/tasks/:id/pause]", err);
    return NextResponse.json({ error: "Failed to pause task" }, { status: 500 });
  }
}
