import { NextResponse } from "next/server";
import * as repo from "@/lib/server/repository";
import { resumePipeline } from "@/lib/server/pipeline-engine";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await repo.getTask(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    if (task.status !== "paused") {
      return NextResponse.json({ error: `Cannot resume a ${task.status} task` }, { status: 409 });
    }
    await resumePipeline(id, task.prompt);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/tasks/:id/resume]", err);
    return NextResponse.json({ error: "Failed to resume task" }, { status: 500 });
  }
}
