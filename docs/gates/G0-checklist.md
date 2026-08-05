# Gate G0 — Org Ratification and Project Intake

Passing G0 means (A) the org, protocol, and enforcement machinery exist, are
proven, and are ratified by the sponsor, and (B) the project slot is filled:
scope, phases, and success criteria are recorded where the constitution says
they live. **No M1 work order may be issued before G0 passes** (PROTOCOL §1,
§7). Signatures are journal-entry references, transcribed by the orchestrator
under PROTOCOL §7's transcription rule. The walkthrough that drives this
checklist is [`BOOTSTRAP.md`](../../BOOTSTRAP.md).

## Section A — Org ratification

| # | Item | Owner | Status | Signature / verify |
|---|---|---|---|---|
| A1 | Operating protocol committed (`agents/PROTOCOL.md`, v2) | orchestrator | ✅ satisfied at seeding | J-orchestrator-0001 · verify: `git log --oneline -- agents/PROTOCOL.md` |
| A2 | Enforcement self-test green in CI (every rejection asserting its rule, R1–R10 + WARN-SEAL) | orchestrator | ✅ satisfied at seeding | J-orchestrator-0001 · verify: `bash scripts/test_protocol.sh` locally; same script is the first step of the `journal-check` workflow on every push |
| A3 | `journal-check` CI green on the pushed branch (full-history re-verification) | orchestrator | ✅ satisfied at seeding | J-orchestrator-0002 (run 1, conclusion success) · verify: Actions tab → `journal-check` on the latest push, or `bash scripts/check_journals.sh --all` |
| A4 | Charters, org chart, and spawn launchers committed and mutually consistent (roster 1:1 across `ORG_CHART.md`, `agents/charters/`, `.claude/agents/`) | orchestrator | ✅ satisfied at seeding | J-orchestrator-0002 · verify: `ls agents/charters .claude/agents` against the ORG_CHART roster table |
| A5 | Journals seeded, append-only from birth; `agents/journals/INDEX.md` committed | orchestrator | ✅ satisfied at seeding | J-orchestrator-0001, J-orchestrator-0002 · verify: `bash scripts/check_journals.sh --all` |
| A6 | **Sponsor**: charter critique round — org chart + all nine charters read, critiqued, and ratified (or amended by ADR before ratification) | sponsor | ✅ **ratified as written, no amendment** — 2026-08-05 | J-orchestrator-0041 (provenance class *relayed*, PROTOCOL §7 — the sponsor holds no journal). Provenance trail, kept whole: the sponsor first answered "no preference", which J-orchestrator-0040 recorded as an **inferred** reading, flagged as such; the sponsor then confirmed **"ratify the charters"** explicitly. The signature now rests on the direct answer, not the inference. |
| A7 | **Sponsor**: branch protection on `main` AND the working branch — exact click-path below. Until this is done, PROTOCOL §5 R9's no-force-push guarantee is convention only | sponsor | ✅ **configured and verified** 2026-08-05 | J-orchestrator-0042. Rulesets: **`protect-history`** (id 20463571 — `deletion` + `non_fast_forward`, targeting **both** `main` and `claude/project-investigation-54wqwc`) and **`main-requires-ci`** (id 20463601 — `required_status_checks` on `journal-check`, targeting `main` only). **Rejection verified by live fire**: force-push rewind of the working branch → `GH013 ... Cannot force-push to this branch`, exit 1, remote SHA unchanged; force-push rewind of `main` → rejected naming *both* rules. **Deletion rule verified by configuration read, not live fire** — the live-fire delete attempt returned a proxy-level HTTP 403 before GitHub could adjudicate, so it is NO-VERDICT as a live-fire test (PROTOCOL §10 / L-D04); the `deletion` rule's presence on both branches is confirmed from the rules API |
| A8 | **Decision**: single-branch mode (work lands on `main` directly) vs PR-flow mode (working branch + milestone PRs into `main`, R9). **Default: single-branch mode** — the orchestrator proposes it in the intake proposal and the sponsor overrides only if they want PR-flow; either way the choice rides the E0 setup, no open-ended question asked. Decide with A7 — it changes which ruleset binds what — and record the decision and the working-branch name on [`tasks/BOARD.md`](../../tasks/BOARD.md) | sponsor + orchestrator | ✅ **PR-flow mode**, working branch `claude/project-investigation-54wqwc` — 2026-08-05 | J-orchestrator-0040 · BOARD "Branch flow (G0 A8)" · chosen over the single-branch default because only PR-flow lets `journal-check` bind `main` as a *required* check |
| A9 | Auditor's G0 retro-audit of the seed commit range committed to `docs/reports/audit/` — the new org's **first spawn**, and the first proof the audit lane works | auditor | **ISSUED** — [`WO-0001_g0-retro-audit.md`](../../agents/handoffs/WO-0001_g0-retro-audit.md), baseline pinned `fe5dea7` (PROTOCOL §3) | <J-auditor-0001 — verdict + report path, on return> |

### A7 click-path (branch rulesets)

Use GitHub's **rulesets** (Settings → Rules → Rulesets), not classic branch
protection — an empty bypass list makes a ruleset admin-proof by default.
Do this **only after A3 is green** — the `journal-check` status check must
have run at least once before GitHub will list it in the picker.

**Ruleset 1 — "protect-history"** (guards git history):

1. **New ruleset → New branch ruleset**; name it `protect-history`.
2. *Enforcement status*: **Active**.
3. *Bypass list*: leave **empty** — this is what stops the admin account
   (the same one the orchestrator pushes with) from force-pushing history
   away; the append-only journal guarantee depends on it.
4. *Target branches* → Include by pattern → add `main`, and — in PR-flow
   mode — the working branch named on the BOARD.
5. *Rules*: check **Restrict deletions** and **Block force pushes**.
6. **Create**.

In a **solo-collapsed** copy (ADR-0011), add `fed/**` to Ruleset 1's
target patterns as well — the project repo is then itself the landing
fence and carries the federation staging namespace
([`docs/FEDERATION.md`](../FEDERATION.md) §5.2 clause 10). In the normal
topology that namespace lives in the org generic and is protected at its
founding ([`BOOTSTRAP.md`](../../BOOTSTRAP.md) Stage 0).

**Ruleset 2 — "main-requires-ci"** (PR-flow mode only):

1. New branch ruleset, name `main-requires-ci`, Active, empty bypass list.
2. *Target branches*: `main` only.
3. *Rules*: **Require status checks to pass** → add `journal-check`.
   Optionally also **Require a pull request before merging** (R9: `main`
   receives milestone PRs only).
4. **Create**.

**Why the split, and why A8 matters here**: GitHub rejects direct pushes to
any branch with required status checks (new commits cannot have passing
checks yet). In PR-flow mode the check requirement binds `main` only, and
the working branch is guarded by force-push/deletion blocking with CI
failing publicly on every push as the detection mechanism. In single-branch
mode `main` **cannot** carry ruleset 2 at all — protection is ruleset 1 plus
public CI failure — and that weaker regime is exactly what the A8 decision
row exists to record consciously rather than inherit silently.

## Section B — Project intake

The sponsor answers; the orchestrator records. Every row below writes its
answer into **[`README.md`](../../README.md)'s phase table** (the canonical
scope statement, PROTOCOL §1) **and [`tasks/BOARD.md`](../../tasks/BOARD.md)**
(milestone roadmap + decisions on record). Intake fills the project slot;
it never amends the protocol (PROTOCOL §1).

| # | Item | Recorded where | Status | Signature |
|---|---|---|---|---|
The B rows may be filled by questionnaire or, expectedly, by the sponsor's
brain dump digested into one signed proposal (BOOTSTRAP.md Section B,
Path B). The rows below are the record either way.

| B1 | **The project, decomposed into phases**: what is being built, split into orderable phases with a one-line scope each | README phase table + BOARD roadmap | ✅ **signed** 2026-08-05 — 5 phases (P1 core CPU · P2 display/draw · P3 I/O + first light · P4 quirks/compat/formal · P5 synthesis/delivery) | J-orchestrator-0040 |
| B2 | **Scope parameters and performance criteria**: the interface parameters, throughput/latency/capacity figures, and any resource envelope the design must meet — stated as numbers, since PROTOCOL §10's evidence rules and SPEC-TEMPLATE §8's stress obligation will bind to them | README phase table + BOARD | ✅ **signed** 2026-08-05 — full parameter set in README's scope paragraph; fmax bar ≥ 25 MHz post-P&R on iCE40 HX8K, resource bar ≤ 50% logic cells, stack depth 16 (parameterized) | J-orchestrator-0040 |
| B3 | **External references and toolchain candidates, each with a license class**: every reference design, document, dataset, or candidate toolchain lane the org may consult or adopt, classed **free-use** (may be vendored verbatim with provenance, never edited in place) or **consult-only** (design study only — never ported, never quoted into shipped source), per PROTOCOL §10. Toolchain candidates feed the M1 E3 decision | BOARD (decisions on record) | ✅ **signed** 2026-08-05 — docs consult-only; test ROMs free-use (licenses to verify before vendoring); **game ROM fetched, never vendored**; toolchain candidates all free-use, with the two capability findings recorded | J-orchestrator-0040 |
| B4 | **The simulation-first boundary**: what this program validates in simulation, and where (if anywhere) hardware bring-up sits — phases and success criteria must not silently assume lab equipment nobody has | README phase table + BOARD | ✅ **signed** 2026-08-05 — everything in simulation; **no board, no bitstream deployment, no lab equipment, at any phase**; synthesis runs full P&R for reports only | J-orchestrator-0040 |
| B5 | **Success criteria per phase**: for each phase, the evidence that closes its `P<n>-phase-accept` gate — replay/validation runs, performance figures, audit state. These become the gate checklists' acceptance rows (see [`templates/`](templates/)) | README phase table + BOARD | ✅ **signed** 2026-08-05 — one criterion per phase in README's table; P3 = Pong to a scored point, P4 = test suite green in ≥2 quirk configurations, P5 = published timing + browser-playable build | J-orchestrator-0040 |
| B6 | **Federation founding record**: this project's org generic = `<URL>`, proposed by the orchestrator from the fork relationship (clone case: one line in the same signed proposal — the intake signature covers it); push access verified **read-only** (`git ls-remote` + `git push --dry-run` — never a probe push or probe commit); the **project slug** recorded on the BOARD (lowercase-hyphenated, unique in the org — it keys every landing, [`docs/FEDERATION.md`](../FEDERATION.md) §5.1); the **fork-point harvest baseline** recorded on the BOARD (last inherited entry id per journal chain — the first harvest tiles from baseline + 1, ADR-0010); the board's **Repo role** line completed to `project` (or `solo-collapsed`) and its **This repository** line re-recorded to this project's own URL, ADR-0011; the board's **outer-hop standing pre-answer** line confirmed — kept, set (YES or NO), or left empty so the per-gate question stands ([`docs/FEDERATION.md`](../FEDERATION.md) §7). For a solo-collapsed copy, BOOTSTRAP Stage 0 steps 5–6 also run here: the freeze bullet re-scoped to *"no new law until this repository's first lessons landing completes"*, and the upstream defect channel confirmed. An org generic itself keeps the canonical shell on this line; a solo-collapsed copy does too ([`docs/FEDERATION.md`](../FEDERATION.md) §0, §5.1) | BOARD (decisions on record) | ✅ **signed, all sub-items verified** 2026-08-05 — org generic `renatom11/my-fpga-org` (read verified, `main` @ `0a60b2a`); slug `chip8-sv`; baseline orchestrator 0039, all other chains none; role → `project`; This-repository → `renatom11/my-project`; upstream → the org generic; standing pre-answer confirmed unset. **Push access verified read-only**: `git push --dry-run` to the org generic succeeded (`* [new branch] HEAD -> __dryrun_probe_never_created`, exit 0) after the repository was added to the session's authorized set — never a probe push, no branch created. The 403 recorded at J-orchestrator-0040 is cleared | J-orchestrator-0040, cleared at J-orchestrator-0041 |

## Section C — Lessons harvest

### Lessons harvest — G0

<!-- Bars and classifier: docs/gates/templates/lessons-harvest-block.md,
     top half. The export contract: docs/FEDERATION.md. -->

#### Span record

Fork-point baselines are the B6 record: `orchestrator` 0039, every other
chain none (header-only at clone). First harvests therefore tile from
baseline + 1. No worker span has been commissioned yet — no lead has been
spawned — so there are no lead-mined worker rows.

| Journal chain | Miner | Span (`J-<agent>-NNNN..NNNN`) | Tiles with (previous harvest · its `to`) | Harvest note (miner's journal entry) | Yield (ids or NIL) |
|---|---|---|---|---|---|
| `J-orchestrator` | `orchestrator` | `J-orchestrator-0040..0040` | first harvest (baseline 0039) | `J-orchestrator-0040` | `LC-01`, war story `WS-01` |
| `J-architect_docs_lead` | `architect_docs_lead` | `(idle)` | first harvest (baseline none) | — | NIL |
| `J-rtl_lead` | `rtl_lead` | `(idle)` | first harvest (baseline none) | — | NIL |
| `J-dv_lead` | `dv_lead` | `(idle)` | first harvest (baseline none) | — | NIL |
| `J-auditor` | `auditor` | `(idle)` | first harvest (baseline none) | — | NIL |

#### Yield — three-way disposition

| Candidate | Tier | Target | Disposition |
|---|---|---|---|
| `LC-01 enumerated-identity check that validates one value` | 1 | core `docs/LESSONS.md` (org generic, then onward) | in export packet |

#### War stories

| Candidate | Failed criterion | Kept where |
|---|---|---|
| `WS-01 verify the simulator implements the testbench features the DV plan assumes` | **LH1** — anticipatory, not provenance-pinned: the gap was caught at intake before any test was written, so there is no incident commit to cite. Re-read at P1 if it bites. | `J-orchestrator-0040`; export packet appendix |

#### Export packet and transmission

- Export packet: [`docs/federation/outbox/G0.md`](../federation/outbox/G0.md),
  committed in this same commit — carries `LC-01` with a self-contained
  incident description and `WS-01` in the war-story appendix.
- Transmission — **NOT RUN; G0 is not yet signed.** G0 is a sponsor-signed
  parent, so the inner hop runs automatically *after* the gate signature
  and never before (`docs/FEDERATION.md` §5.1). Two things stand between
  here and that:
  - the gate is still open on **A7** and **A9**;
  - even once signed, the landing is **blocked**: the git proxy returns
    403 for `renatom11/my-fpga-org`, which is outside this session's
    authorized repository set, so no `fed/**` branch can be pushed.
    Clears with a one-time repository add.
- Outer-hop decision: **not asked** — it rides the gate signature, and the
  board's standing pre-answer is confirmed unset, so the per-gate
  default-yes question stands and will be put at signature time.

#### Preconditions (these gate the parent record)

- [x] Every active persistent journal chain has a span row, and every
      commissioned worker span has a lead-mined row (none commissioned).
- [x] Spans tile: `orchestrator` from baseline 0039 + 1 = 0040 ✓; the four
      idle chains from baseline none, unchanged.
- [x] Every yield cell carries candidate ids or a declared NIL — no blank
      cells, no counts.
- [x] Every candidate is dispositioned exactly once, and the war story
      names its failed criterion (LH1).
- [x] Export packet produced and cited above.
- [ ] **Transmission recorded** — open. Blocked on the gate signature
      (A7, A9) and, beyond it, on repository access for the landing push.

The parent gate is **not fully signed** until every box above is checked
(PROTOCOL §7.1).

**Note on what is deliberately *not* here.** The freeze-inheritance
problem found during this bring-up is a **shell defect**, not a lesson: it
is a broken step in the shell's own law, and it travels as a GitHub issue
on the canonical shell. Routing it through this pipeline would be a
category error — LH2 bars the specificity a defect report needs. It is
recorded in the BOARD's defect log instead.

## Exit

All Section A and Section B rows signed and the Section C harvest block
complete → the orchestrator declares G0 passed
in its journal, updates `tasks/BOARD.md` (milestone → M1), and M1 work orders
may issue.

**Spawn ordering**: until the Section B intake is recorded on the board, the
orchestrator spawns no agent ([`README.md`](../../README.md),
[`CLAUDE.md`](../../CLAUDE.md)). A9's retro-audit — the org's first spawn —
therefore runs **after** Section B is recorded, as the final open item before
the gate flip.
