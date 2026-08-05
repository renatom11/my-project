# Project site

A static site generated from this repository's own artifacts, deployed to
Cloudflare Workers.

## Deploy

```sh
cd site
npm install
npx wrangler login     # once
npm run deploy         # builds ./dist, then deploys
```

**Use `npm run deploy`, not `npx wrangler deploy`.** `dist/` is git-ignored
build output, so it does not exist in a fresh clone and wrangler fails with
*"The directory specified by the assets.directory field ... does not
exist"*. A `[build]` block in `wrangler.toml` does **not** fix it — wrangler
skips `[build]` entirely for assets-only Workers, which was measured rather
than assumed. `npm run deploy` runs the build itself.

`npm run dev` serves it locally through wrangler.

Edit `name` in `wrangler.toml` if it collides with an existing Worker in
your account. Nothing here needs a Cloudflare account at build time — you
can `npm run build` and open `dist/index.html` to check it first.

## What is generated and what is not

This split is deliberate, and the site states it on its own pages. A page
that silently mixes generated and hand-written content is a page whose
staleness nobody can detect.

**Generated at build time**, straight from the markdown — rebuild and they
follow:

| Page | Source |
|---|---|
| Every document page | `docs/specs/`, `docs/adr/`, `docs/reports/` |
| Work orders index + pages | `agents/handoffs/WO-*.md` |
| Journal entry counts | `agents/journals/` |

**Hand-authored in `content.mjs`** — these can drift, and only a human or
the orchestrator keeps them current:

- the overview prose
- the phase table and milestone states (the committed `README.md` phase
  table governs — this mirrors it)
- the backlog (curated from `tasks/BOARD.md`, which carries these items
  across several sections)
- each document's one-line blurb and status badge

## Adding a document

Add an entry to `documents` in `content.mjs` with its repo-relative `src`,
a `slug`, a `title`, a `status` and a `blurb`. If the file is missing at
build time the site says so on the index rather than failing the build or,
worse, silently omitting it.

## Status badges

Badges report each artifact's **own stated state**, not its polish. A
specification that says DRAFT gets a DRAFT badge; a verification report
that says NOT COUNTERSIGNED says so on the card. That is the point — the
site is not a brochure, and an artifact that is not finished should not
look finished.
