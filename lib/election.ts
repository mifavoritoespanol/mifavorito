export const ELECTIONS = [
  {
    categorySlug: "bebidas",
    categoryName: "Bebidas",
    opensAt: "2026-11-14T23:00:00.000Z",
    closesAt: "2026-11-30T23:00:00.000Z",
  },
  {
    categorySlug: "comidas",
    categoryName: "Comidas",
    opensAt: "2026-12-14T23:00:00.000Z",
    closesAt: "2026-12-31T23:00:00.000Z",
  },
  {
    categorySlug: "estrellas",
    categoryName: "Música",
    opensAt: "2027-01-14T23:00:00.000Z",
    closesAt: "2027-01-31T23:00:00.000Z",
  },
] as const;

function validDate(value: string | undefined, fallback: string) {
  return value && !Number.isNaN(Date.parse(value)) ? new Date(value) : new Date(fallback);
}

export function hasElectionSchedule(categorySlug: string) {
  return ELECTIONS.some((election) => election.categorySlug === categorySlug);
}

export function electionWindow(categorySlug = process.env.ELECTION_CATEGORY_SLUG || "estrellas") {
  const scheduled = ELECTIONS.find((election) => election.categorySlug === categorySlug);
  if (scheduled) {
    const envPrefix = categorySlug.toUpperCase();
    return {
      opensAt: validDate(process.env[`ELECTION_${envPrefix}_OPENS_AT`], scheduled.opensAt),
      closesAt: validDate(process.env[`ELECTION_${envPrefix}_CLOSES_AT`], scheduled.closesAt),
    };
  }

  return {
    opensAt: validDate(process.env.ELECTION_OPENS_AT, "2027-01-14T23:00:00.000Z"),
    closesAt: validDate(process.env.ELECTION_CLOSES_AT, "2027-01-31T23:00:00.000Z"),
  };
}

export function nextElection(now = new Date()) {
  const election = ELECTIONS.find(({ closesAt }) => now < new Date(closesAt));
  if (!election) return null;
  const { opensAt, closesAt } = electionWindow(election.categorySlug);
  return {
    categorySlug: election.categorySlug,
    categoryName: election.categoryName,
    opensAt,
    closesAt,
    isOpen: now >= opensAt && now < closesAt,
  };
}

export function electionTestMode() {
  return process.env.NODE_ENV === "development" &&
    process.env.ELECTION_TEST_MODE === "true" &&
    process.env.NEXT_PUBLIC_ELECTION_TEST_MODE === "true";
}

export function isElectionOpen(now = new Date(), categorySlug = process.env.ELECTION_CATEGORY_SLUG || "estrellas") {
  if (!hasElectionSchedule(categorySlug)) return false;
  if (electionTestMode()) return true;
  const { opensAt, closesAt } = electionWindow(categorySlug);
  return now >= opensAt && now < closesAt;
}

