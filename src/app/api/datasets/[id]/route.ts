import { NextResponse } from "next/server";
import * as repo from "@/lib/server/repository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dataset = await repo.getDataset(id);
    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }
    return NextResponse.json({ dataset });
  } catch (err) {
    console.error("[GET /api/datasets/:id]", err);
    return NextResponse.json({ error: "Failed to load dataset" }, { status: 500 });
  }
}
