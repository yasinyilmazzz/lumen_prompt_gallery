import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { prompts } from "@/db/schema";

/** Fire-and-forget copy analytics — powers "most copied" leaderboards later. */
export async function POST(req: Request) {
  try {
    const { promptId } = (await req.json()) as { promptId?: string };
    if (!promptId) return NextResponse.json({ ok: false }, { status: 400 });
    await db
      .update(prompts)
      .set({ copyCount: sql`${prompts.copyCount} + 1` })
      .where(eq(prompts.id, promptId));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
