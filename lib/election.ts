const DEFAULT_OPENS_AT = "2026-12-15T12:00:00.000Z";
const DEFAULT_CLOSES_AT = "2026-12-30T12:00:00.000Z";

function configuredDate(name: string, fallback: string) {
  const candidate = process.env[name];
  return candidate && !Number.isNaN(Date.parse(candidate)) ? new Date(candidate) : new Date(fallback);
}

export function electionWindow() {
  return {
    opensAt: configuredDate("ELECTION_OPENS_AT", DEFAULT_OPENS_AT),
    closesAt: configuredDate("ELECTION_CLOSES_AT", DEFAULT_CLOSES_AT),
  };
}

export function electionTestMode() {
  return process.env.NODE_ENV === "development" &&
    process.env.ELECTION_TEST_MODE === "true" &&
    process.env.NEXT_PUBLIC_ELECTION_TEST_MODE === "true";
}

export function isElectionOpen(now = new Date()) {
  if (electionTestMode()) return true;
  const { opensAt, closesAt } = electionWindow();
  return now >= opensAt && now < closesAt;
}
