import { NextResponse } from "next/server";
import { electionTestMode, electionWindow, hasElectionSchedule, isElectionOpen, nextElection } from "@/lib/election";

type ElectionStatus = {
  categorySlug: string;
  categoryName: string;
  opensAt: Date;
  closesAt: Date;
  isOpen: boolean;
  scheduled: boolean;
};

const CATEGORY_NAMES: Record<string, string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  estrellas: "Música",
};

export async function GET(request: Request) {
  const requestedSlug = new URL(request.url).searchParams.get("category");
  let election: ElectionStatus | null;

  if (requestedSlug) {
    const scheduled = hasElectionSchedule(requestedSlug);
    const { opensAt, closesAt } = scheduled
      ? electionWindow(requestedSlug)
      : { opensAt: new Date("9999-01-01T00:00:00.000Z"), closesAt: new Date("9999-01-02T00:00:00.000Z") };
    election = {
      categorySlug: requestedSlug,
      categoryName: CATEGORY_NAMES[requestedSlug] ?? requestedSlug,
      opensAt,
      closesAt,
      isOpen: scheduled && isElectionOpen(new Date(), requestedSlug),
      scheduled,
    };
  } else {
    const next = nextElection();
    election = next ? { ...next, scheduled: true } : null;
  }

  if (!election) {
    return NextResponse.json({ election: null, testMode: electionTestMode() }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({
    ...election,
    opensAt: election.opensAt.toISOString(),
    closesAt: election.closesAt.toISOString(),
    isOpen: election.scheduled && (electionTestMode() || election.isOpen),
    testMode: electionTestMode(),
  }, { headers: { "Cache-Control": "no-store" } });
}

