# Arbitrum Proposal Dashboard

## Requirements

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Environment Variables

Copy `packages/nextjs/.env.example` to `packages/nextjs/.env.local` and fill in the values:

```bash
cp packages/nextjs/.env.example packages/nextjs/.env.local
```

Keys you'll need to set:

- `TALLY_API_KEY` — get one from https://www.tally.xyz/
- `GEMINI_API_KEY` — get one from https://aistudio.google.com/apikey
- `POSTGRES_URL` — your local Postgres connection string (the `docker compose up` flow below sets this up)
- `CRON_SECRET` — bearer token used to authenticate cron-triggered import endpoints. Generate one with:

```bash
openssl rand -base64 32
```

In production, set `CRON_SECRET` as a Vercel project env var. Vercel Cron will auto-attach it as `Authorization: Bearer ${CRON_SECRET}` when invoking the import routes.

> **Note:** `.env.local` is gitignored and should never be committed.

## Quickstart

1. Clone the repo

2. Install dependencies:

```bash
cd arbitrum-dashboard
yarn install
```

2. Spin up the Postgres database service

```bash
docker compose up -d
# sync database
yarn drizzle-kit push
# import data
yarn db:seed
# if you want to wipe the database
yarn db:wipe
```

Note: If you get any issues with the database, you can restart by:

```bash
docker compose down
rm -rf data/
docker compose up -d
```

3. Start your NextJS app:

```bash
yarn start
```

Visit your app on: `http://localhost:3000`.

4. You can explore the database with:

```
yarn drizzle-kit studio
```

### Database (dev info)

To iterate fast on the database locally:

- Tweak the schema in `schema.ts`
- Run `yarn drizzle-kit push` to apply the changes.
- Copy `seed.data.example.ts` to `seed.data.ts`, tweak as needed and run `yarn db:seed` (will delete existing data)

We'd switch to a migration model when ready (site live).

### Imports

These routes are GET endpoints, gated by a bearer token that matches `CRON_SECRET`. Vercel Cron sends the same header automatically in production; locally you pass it yourself with curl. The `$CRON_SECRET` reference below assumes the value is loaded into your shell — either source it from `.env.local` or paste the literal value in.

**Forum posts:**

```sh
curl http://localhost:3000/api/import-forum-posts \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Snapshot proposals:**

```sh
curl http://localhost:3000/api/import-snapshot-proposals \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Tally proposals:**

```sh
curl http://localhost:3000/api/import-tally-proposals \
  -H "Authorization: Bearer $CRON_SECRET"
```

### LLM Matching

Match snapshot/tally stages to canonical proposals using Gemini:

```sh
# Match a specific stage
yarn match:llm --type tally --id <stage-uuid>
yarn match:llm --type snapshot --id <stage-uuid>

# Match all unprocessed stages
yarn match:llm --type tally --all
yarn match:llm --type snapshot --all
yarn match:llm --all
```

> **Note:** The default model (`gemini-2.5-flash-lite`) can produce false positives on ambiguous stages. For hard cases, use a stronger model like `gemini-3.1-pro-preview` via the `GEMINI_MODEL` env var.
