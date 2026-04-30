import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      app: "granix-planering",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        app: "granix-planering",
        timestamp: new Date().toISOString(),
        error: "Databasanslutningen misslyckades.",
      },
      { status: 500 }
    );
  }
}
