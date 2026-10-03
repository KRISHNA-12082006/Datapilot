import { NextResponse } from "next/server";
import * as repo from "@/lib/server/repository";
import { cancelPipeline } from "@/lib/server/pipeline-engine";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await repo.getTask(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    if (!["queued", "running", "paused"].includes(task.status)) {
      return NextResponse.json({ error: `Cannot cancel a ${task.status} task` }, { status: 409 });
    }
    await cancelPipeline(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/tasks/:id/cancel]", err);
    return NextResponse.json({ error: "Failed to cancel task" }, { status: 500 });
  }
}
