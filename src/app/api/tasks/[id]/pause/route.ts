import { NextResponse } from "next/server";
import { pausePipeline } from "@/lib/server/pipeline-engine";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pausePipeline(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/tasks/:id/pause]", err);
    return NextResponse.json({ error: "Failed to pause task" }, { status: 500 });
  }
}
