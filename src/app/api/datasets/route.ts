import { NextResponse } from "next/server";
import * as repo from "@/lib/server/repository";

export async function GET() {
  try {
    const datasets = await repo.listDatasets();
    return NextResponse.json({ datasets });
  } catch (err) {
    console.error("[GET /api/datasets]", err);
    return NextResponse.json({ error: "Failed to list datasets" }, { status: 500 });
  }
}
