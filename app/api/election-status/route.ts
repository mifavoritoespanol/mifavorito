import { NextResponse } from "next/server";
import { electionTestMode, electionWindow, isElectionOpen } from "@/lib/election";

export async function GET() {
  const { opensAt, closesAt } = electionWindow();
  return NextResponse.json({
    opensAt: opensAt.toISOString(),
    closesAt: closesAt.toISOString(),
    isOpen: isElectionOpen(),
    testMode: electionTestMode(),
  }, { headers: { "Cache-Control": "no-store" } });
}
