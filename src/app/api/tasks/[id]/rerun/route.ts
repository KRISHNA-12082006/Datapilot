import { NextResponse } from "next/server";
import * as repo from "@/lib/server/repository";
import { startPipeline } from "@/lib/server/pipeline-engine";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const original = await repo.getTask(id);
    if (!original) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const newTaskId = await repo.createTask(original.prompt);
    startPipeline(newTaskId, original.prompt);

    return NextResponse.json({ id: newTaskId }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tasks/:id/rerun]", err);
    return NextResponse.json({ error: "Failed to rerun task" }, { status: 500 });
  }
}
