import { NextResponse } from "next/server";
import * as repo from "@/lib/server/repository";

export async function GET() {
  try {
    const workflows = await repo.listWorkflows();
    return NextResponse.json({ workflows });
  } catch (err) {
    console.error("[GET /api/workflows]", err);
    return NextResponse.json({ error: "Failed to list workflows" }, { status: 500 });
  }
}
