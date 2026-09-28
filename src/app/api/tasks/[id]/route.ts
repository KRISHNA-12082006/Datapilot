import { NextResponse } from "next/server";
import * as repo from "@/lib/server/repository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await repo.getTask(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ task });
  } catch (err) {
    console.error("[GET /api/tasks/:id]", err);
    return NextResponse.json({ error: "Failed to load task" }, { status: 500 });
  }
}
