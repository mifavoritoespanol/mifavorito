This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Election window and safe local tests

The vote window defaults to 15 December 2026, 12:00 UTC through 30 December 2026, 12:00 UTC. Set `ELECTION_OPENS_AT` and `ELECTION_CLOSES_AT` to ISO 8601 UTC values in the deployment environment to change it. Checkout is rejected by the server outside this interval.

To test the full voting flow locally, create a **separate Supabase staging project** with the same schema and use Stripe test mode. Copy the test-only variables from `.env.example` into `.env.local`, set both election test flags to `true`, and run `npm run dev`. The test override only works in development, requires a Stripe `sk_test_` key, and routes database reads/writes through the separate test project. Turn both flags off after testing. Never use production database credentials for load tests.

## Country scorecard

Each item can have one country of origin in `items.country_code`, using the two-letter codes in the country selector. Existing entries must be assigned a country in Supabase; new music proposals require a country selection and remain pending review.

Supabase schema changes are tracked in `supabase/migrations/`. The country scorecard migration is `20261025135127_country_points.sql`; the security cleanup migrations follow it. Apply outstanding migrations before deploying app code. After an election closes, the scorecard snapshots each approved category's top three once: 5 points for first place, 3 for second, and 1 for third. Ties share the points for that place. The `ELECTION_CATEGORY_SLUG` environment variable identifies the category for the active election; historical points are retained across later election windows.