import { NextResponse } from "next/server";
import { cancelPipeline } from "@/lib/server/pipeline-engine";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await cancelPipeline(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/tasks/:id/cancel]", err);
    return NextResponse.json({ error: "Failed to cancel task" }, { status: 500 });
  }
}
