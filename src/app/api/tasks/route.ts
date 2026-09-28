import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/server/repository";
import { startPipeline } from "@/lib/server/pipeline-engine";

export async function GET() {
  try {
    const tasks = await repo.listTasks();
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("[GET /api/tasks]", err);
    return NextResponse.json({ error: "Failed to list tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const taskId = await repo.createTask(prompt);
    startPipeline(taskId, prompt);

    return NextResponse.json({ id: taskId }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tasks]", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
