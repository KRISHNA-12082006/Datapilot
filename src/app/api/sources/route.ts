import { NextResponse } from "next/server";
import * as repo from "@/lib/server/repository";

export async function GET() {
  try {
    const sources = await repo.listConnectorsWithContributions();
    return NextResponse.json({ sources });
  } catch (err) {
    console.error("[GET /api/sources]", err);
    return NextResponse.json({ error: "Failed to list sources" }, { status: 500 });
  }
}
