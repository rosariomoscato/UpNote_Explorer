import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST() {
  try {
    execSync("npx tsx scripts/build-notes.ts --cleanup", {
      cwd: process.cwd(),
      stdio: "pipe",
      timeout: 30000,
    });

    return NextResponse.json({
      success: true,
      message: "Note re-indicizzate con successo. Vecchi export rimossi.",
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}
