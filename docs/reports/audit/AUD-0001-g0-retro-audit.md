# AUD-0001 — G0 retro-audit of the seed commit range

- **Auditor**: `auditor` (independent; graded by the sponsor alone)
- **Work order**: [`agents/handoffs/WO-0001_g0-retro-audit.md`](../../../agents/handoffs/WO-0001_g0-retro-audit.md)
- **Spawn short-id**: `WO-0001/2026-08-05T15:02Z`
- **Baseline SHA (pinned at spawn, PROTOCOL §3)**: `fe5dea721397acef6a48bc924f89af41037f033e`
- **Window**: the full history through the pin — 40 commits, `4421d62`..`fe5dea7`
- **Date**: 2026-08-05
- **Journal entry**: `J-auditor-0001`

---

## Verdict

> **PASS WITH FINDINGS.**
>
> **0 CRITICAL · 4 MAJOR · 6 MINOR.** No finding blocks a gate.
> G0 row A9 may be signed against this report; G0 itself remains open on
> its own terms (A7 at the pin).

Stated once and unambiguously: the mechanical protocol layer (R1–R10, CI,
journal coupling) is **sound and machine-verified** over the whole window. Every
finding below is in the **prose layer** — what signatures rest on, what evidence
claims say, and where identifiers and routing rules point. That distribution is
itself the audit's most useful result, and it is what a bring-up audit is for.

**This report concerns the relaying party.** The subject of the entire authored
stratum of this window is the orchestrator — the agent that spawned this audit,
will commit this report, and will relay these findings. Four of the ten findings
are against it. Per charter §7 the structural compensating control is that this
file is committed and the sponsor reads it unmediated. Nothing here has been
softened to settle.

---

## 1. Scope, and what a bring-up audit cannot reach

This is the org's first spawn. There is **no RTL, no frozen spec, no `SO-`, no
`BUG-`, no `RV-`, no mutation campaign, no replay manifest, and no DV lane**.
Rather than silently skip the charter rows that name them, they are recorded
here as **NO-VERDICT** — a distinct class from PASS and from FAIL (PROTOCOL §10,
L-D04).

Verified absent at the pin (**measured**: `ls` at
`fe5dea7`) — `rtl/`, `test/`, `tools/`, `test/attack_plans/`,
`docs/reports/dv/`; `docs/specs/` holds `SPEC-TEMPLATE.md` only;
`agents/handoffs/` holds `README.md` and `templates/` only.

| Charter §3 row | Outcome | Why |
|---|---|---|
| Process-integrity audit (R1–R10, vacuity) | **PASS** | Executed — §3, §4 |
| Evidence falsifiability (re-execution) | **PASS WITH FINDINGS** | Executed — §5; one claim fails to reproduce (F1) |
| Marker-check duty (`MUTATION (`, `mut/*`) | **PASS** | Executed — §7 |
| Harvest-block sampling | **PASS** | Executed — §6 |
| Audit the orchestrator (escalation, packets) | **PASS WITH FINDINGS** | Executed — §8 |
| Spec-drift audit | **NO-VERDICT** | No `rtl/**`, no frozen `docs/specs/` REQ text |
| Mutation seeding / campaign adjudication | **NO-VERDICT** | No module, no `RV-` ACCEPT, no `SO-` |
| Attack-plan sampling | **NO-VERDICT** | No `test/attack_plans/` |
| Replay reproducibility | **NO-VERDICT** | No committed replay manifest, no dv_lead |
| Independence audit (DV-from-specs, self-gating, licensing taint) | **NO-VERDICT** | No DV artifacts and no shipped source to compare |
| Relay-fidelity spot-check | **NO-VERDICT** | No verbatim-class packet has yet been relayed. **This report is the first**; its relay fidelity is the next audit's check |
| DV-escape ledger | **N/A, correctly** | No sign-off exists, so no escape can. `dv_escapes.md` is created at its first entry (audit README) — its absence is correct, not a gap |
| Absorption (repeat-finding trend) | **NO-VERDICT** | First audit in this repository; no prior baseline |
| Canary detection | **See §9** | Stated honestly rather than claimed |

### Sampling frame

- **In the window**: 40 commits, two strata. **C1–C39** (`4421d62`..`0a60b2a`)
  is history inherited from the canonical shell and this org's generic — real
  commits in this tree, not authored here. **C40** (`fe5dea7`) is this
  repository's own first commit.
- **Sampled exhaustively**: R1–R10 conformance (all 40 commits, by script);
  narrative-section presence across all 40 orchestrator entries (by script);
  `MUTATION (` markers tree-wide and across all refs.
- **Sampled by reading**: `J-orchestrator-0040` in full (mandatory);
  `J-orchestrator-0039`, `0014`, `0015`, `0016`, `0003`, `0006` — the last five
  chosen because a scripted pass flagged them as the window's structurally or
  quantitatively thinnest entries, i.e. the sample was chosen adversarially, not
  conveniently. `J-orchestrator-0002` read to adjudicate F2.
- **Re-executed**: `scripts/test_protocol.sh`, `scripts/check_journals.sh --all`,
  `git ls-remote`, `git push --dry-run`, all at the pin (§5).
- **Deliberately not sampled**: the substance of the inherited ADRs 0001–0016
  and `docs/LESSONS.md`, which are inherited law rather than events in this
  repository; the canonical shell's own operating record on the BOARD, which the
  work order places out of scope. Neither omission affects any finding.
- **Method note**: re-execution ran in a throwaway clone at
  `/tmp/.../scratchpad/pin` checked out at the pin, because the live tree has
  moved to `4c2bc9b`. No git command that writes was run against
  `/home/user/my-project`; the audited tree was never modified.

---

## 2. Findings

Severities per `docs/reports/audit/README.md`. Every finding carries a citation
a reader can check without asking me.

### AUD-0001-F1 — MAJOR — an Evidence quantity that does not reproduce at its own commit's SHA

**Against**: orchestrator · **Cite**: `J-orchestrator-0040`, Evidence section,
in `fe5dea7:agents/journals/claude_orchestrator_agent.md`.

The entry states:

> `bash scripts/check_journals.sh --all`: green, **39 commits** satisfy the
> protocol …

**Observed at the pin** (measured):

```
$ git checkout fe5dea721397acef6a48bc924f89af41037f033e
$ bash scripts/check_journals.sh --all
...
OK: journal volume chains verified at range head (R10)
OK: 40 commit(s) satisfy the journal/commit protocol
```

The count is 40, not 39. The discrepancy is exactly the commit the entry is
attached to: the command was run before `fe5dea7` existed and the result recorded
without saying so. PROTOCOL §4.1 is explicit — "Claims here must reproduce at
this commit's SHA — the auditor re-executes samples." This one does not.

Two things keep this at MAJOR rather than CRITICAL, and the sponsor should
second-guess me on both. (a) The **verdict** the claim supports — the protocol
check is green over the full history — reproduces exactly; nothing was
fabricated and nothing green was reported red or vice versa. (b) The defect is
one of provenance labelling (L-B01: *measured* — but measured at which SHA?),
not of substance. Charter §3 reads "Unreproducible claims are CRITICAL findings
against the claiming agent" without qualification; I am declining the literal
reading because a gate-blocking severity for an off-by-one caused by measurement
ordering would devalue the class. I record that I made that call so it can be
overridden.

**Aggravating**: the orchestrator wrote the *correct* framing elsewhere in the
same commit. `fe5dea7:tasks/BOARD.md:23-27` scopes the identical numbers to a
SHA — "Founding verification, by this session's own hands **at `0a60b2a`** …
green over all 39 commits". At `0a60b2a` the figure 39 is right. The board is
honest; the journal Evidence section, which is the artifact PROTOCOL §4.1 binds
and the one this audit re-executes, is not.

**Remedy** (owner: orchestrator, in a future entry — journals are append-only
and this one is not to be edited): state the measurement SHA in Evidence
whenever a pre-commit measurement is reported, or re-state the figure as of the
commit.

---

### AUD-0001-F2 — MAJOR — G0 rows A1–A5 are signed against journal entries authored in a different repository

**Against**: orchestrator (local disposition) and the canonical shell (root
cause) · **Cite**: `fe5dea7:docs/gates/G0-checklist.md:15-19`;
`cded2f5` (the commit that introduced `J-orchestrator-0002`).

At the pin, G0's Section A reads:

| Row | Status | Signature |
|---|---|---|
| A1 | ✅ satisfied at seeding | `J-orchestrator-0001` |
| A2 | ✅ satisfied at seeding | `J-orchestrator-0001` |
| A3 | ✅ satisfied at seeding | `J-orchestrator-0002` (run 1, conclusion success) |
| A4 | ✅ satisfied at seeding | `J-orchestrator-0002` |
| A5 | ✅ satisfied at seeding | `J-orchestrator-0001`, `J-orchestrator-0002` |

`J-orchestrator-0001` and `-0002` were introduced at `4421d62` and `cded2f5`
(2026-08-03) — the **canonical shell's** seeding commits, inherited into this
tree at the clone. They are not events in `renatom11/my-project`.

A3 is the sharpest case. Its cell attests "`journal-check` CI green on the pushed
branch" and cites `J-orchestrator-0002 (run 1, conclusion success)`. That entry's
Trigger reads (measured, `fe5dea7:agents/journals/claude_orchestrator_agent.md`):

> C1 green in CI (journal-check run 1, conclusion success)

— the canonical shell's run 1, on `renatom11/generic-agentic-fpga-org`, in a CI
history this repository does not contain. This repository's own run 1 is
`31012592559`; that it also concluded success is a coincidence of two
repositories both being green, not evidence supplied by the cited entry.

This matters beyond bookkeeping. `CLAUDE.md`'s M0 path *requires* the
orchestrator to "verify the seeded state with your own hands", and the
orchestrator **did** — the re-verification is real, recorded on the BOARD at
`fe5dea7:tasks/BOARD.md:23-27` and in `J-orchestrator-0040`'s Evidence. But the
gate rows were never re-pointed at it. The result is a G0 checklist for *this*
repository whose foundational rows resolve, when followed, to another
repository's record — while the genuine local evidence sits uncited two files
away.

**Remedy** (owner: orchestrator, `docs/gates/**` is in its write scope): re-point
A1–A5's signature cells at `J-orchestrator-0040`, which actually contains this
repository's re-verification. **Upstream** (owner: canonical shell, via the
BOARD's defect log and the defect channel, never a local law patch): the G0
template ships A1–A5 pre-signed against seeding-era entries, so every fork
inherits pre-signed rows that its own founding does not re-establish. That is a
shell defect, not a lesson.

---

### AUD-0001-F3 — MAJOR — A6's ratification rests on a two-word non-answer whose question is not on the record

**Against**: orchestrator · **Cite**: `fe5dea7:docs/gates/G0-checklist.md:20`;
`J-orchestrator-0040` (Trigger and Reasoning); `fe5dea7:tasks/BOARD.md:123-128`.

A6 is the row that gives all nine charters — including the orchestrator's own,
and including mine — their authority. At the pin its entire evidentiary basis is:

- Trigger: "the sponsor answered: (1) Sign, (2) confirm, (3) **no preference**."
- Reasoning: "A6 asks the sponsor to ratify or amend; 'no preference' is not
  literally either. I read it as no amendments requested…"

PROTOCOL §7 sets the bar for a sponsor signature precisely because the sponsor
holds no journal: its authority "is the orchestrator's transcription entry
**quoting the sponsor's decision verbatim** — provenance class *relayed*". The
transcription quotes an *answer* — "no preference" — but nowhere records the
**question**, so no reader can check what the sponsor expressed no preference
about. Three questions were asked; only their compressed answers survive.

The interpretation was also made by an interested party. The proposition being
ratified is a set of nine charters, one of which is the interpreter's own, and
the interpreter then transcribed its own reading into the checklist under its own
trailer with no second reader anywhere in the loop.

**Substantial credit where it is due, and it does not cure the finding.** The
orchestrator did not hide this. It flagged the gap in its own Reasoning, tagged
the provenance class *relayed* in both the checklist cell and the BOARD bullet,
and wrote "recorded as such so the reading is correctable on the record". That
is the honesty discipline working exactly as designed — and it is why this is
MAJOR and not CRITICAL. But disclosing that a signature is weak does not make it
a signature. "No preference" is a declination to engage, and a charter critique
round that produced no critique is not evidence that a critique round happened.

**Disposition note, stated so it cannot be mistaken for credit.** The work order
asserts the orchestrator "then received explicit confirmation", and the
out-of-window commit `4c2bc9b` is titled in part "A6 strengthened to direct
ratification". **I have not audited that commit**; it lies outside my pin and
L-E09 forbids adjudicating against a moving tree. The finding stands as written
at `fe5dea7`. Re-verification of the claimed remedy is owed to a follow-up audit
and is a precondition of closing this finding — closure is mine to grant, not the
remediating party's to assert.

---

### AUD-0001-F4 — MAJOR — A8's signature cites an entry containing neither the decision's rationale nor the sponsor's words

**Against**: orchestrator · **Cite**: `fe5dea7:docs/gates/G0-checklist.md:22`;
`fe5dea7:tasks/BOARD.md:117-122`; `J-orchestrator-0040`.

The A8 cell records a substantive rationale:

> ✅ **PR-flow mode**, working branch `claude/project-investigation-54wqwc` …
> `J-orchestrator-0040` · BOARD "Branch flow (G0 A8)" · chosen over the
> single-branch default because only PR-flow lets `journal-check` bind `main` as
> a *required* check

`J-orchestrator-0040`'s Reasoning section contains **six** sub-headed arguments —
repository identity, PROSE detection, the freeze, digesting the dump, toolchain
findings, golden-model independence, the A6 reading, the A9 deferral, domain
packs — and **not one word about branch flow**. The only trace of A8 in the entry
is the Actions line "A6, A8, B3, B4 decisions added" and the bare token "(2)
confirm" in Trigger.

So the checklist and the BOARD both assert a reason that its cited authority does
not contain, and the sponsor's contribution to a row owned by "sponsor +
orchestrator" is one word with no record of the proposition it confirmed. Under
PROTOCOL §7 there is here not even the partial verbatim quote that A6 has.

This is the same class as F3 but the cleaner violation, and it is listed
separately because its disposition differs: nothing out-of-window claims to have
addressed A8.

**Remedy** (owner: orchestrator): a future journal entry that states the A8
rationale in the signer's own record and quotes what the sponsor was asked and
answered, with the checklist cell re-pointed at it.

---

### AUD-0001-F5 — MINOR — the identifier `AUD-0001` now denotes two different reports inside this tree

**Against**: orchestrator (allocator of the id; owner of `scripts/` and
`.github/`) · **Cite**, all at `fe5dea7`:
`.github/workflows/journal-check.yml:5`; `scripts/test_protocol.sh:23`, `:341`,
`:358`, `:387`, `:398`; `docs/adr/ADR-0001-org-design.md:26`, `:98`.

The inherited tree carries bare references to `AUD-0001-F1`, `AUD-0001-F2`,
`AUD-0001-F3`, `AUD-0002 N4a` and `AUD-0002 N4b`. They denote the *canonical
shell's* audit reports. The workflow comment reads:

```
# Runs the check over the FULL history every time — an incremental range check
# cannot detect a rewrite of already-pushed history (AUD-0001-F3) —
```

This report is also `AUD-0001`, allocated by the orchestrator per WO-0001 §3, and
it also has an F3. A reader in this repository following that comment lands on
the wrong document. `docs/LESSONS.md:950-951` and `ADR-0001:127-128` escape the
collision because they resolve `[AUD-0001]` through a link definition pointing at
`renatom11/agentic-fpga`; the seven bare citations above do not.

**Remedy** (owner: orchestrator): qualify the bare references at their sites
(e.g. `agentic-fpga AUD-0001-F3`). Note the tension: those sites are shell law
under the "never patch law locally" rule, so the durable fix is upstream — but
the *comment text* is not enforcement semantics, and leaving a wrong pointer in
the tree has its own cost. That trade-off is the orchestrator's to make and to
write down; this finding only requires that it be made deliberately.

---

### AUD-0001-F6 — MINOR — the export packet's provenance cannot be resolved by its intended reader

**Against**: orchestrator · **Cite**: `fe5dea7:docs/federation/outbox/G0.md:11-12`
against `:62-65`.

The packet's own contract, line 11:

> Every incident below is described self-containedly: a reader can judge
> LH1/LH2/LH3 **without access to the source repository**.

`LC-01`'s provenance block, line 62:

> Adjudicating journal entry `J-orchestrator-0040`. Incident commits: the copy's
> inherited head `0a60b2a` and the green CI run `31012592559` that passed on it.

A bare seven-character SHA, a bare nine-digit run id and a bare journal-entry id,
none qualified by a repository. A screener at the org generic — the packet's
declared destination — cannot resolve any of the three. The packet fails the
contract it states in its own second paragraph, and it fails it in precisely the
section (LH1, provenance-pinned) where resolvability is the bar.

The *narrative* half of the packet is exemplary by contrast: the incident is
rewritten with every proper noun removed, and I confirm `LC-01` clears **LH2-g**
(the rule statement at `:20-23` contains no project, module, requirement, signal,
file-path, protocol or interface-standard noun) and **LH3** (`:50-57` states what
breaks in a form recognisable elsewhere). The defect is confined to LH1's
citations.

**Remedy** (owner: orchestrator, `docs/federation/**` is in its write scope):
qualify each citation with its repository URL before transmission. The packet is
staged and untransmitted, so this is cheap now and expensive after landing.

---

### AUD-0001-F7 — MINOR — `CLAUDE.md`'s defect-routing rule names the wrong destination for a `project`-role copy

**Against**: the canonical shell (upstream defect); recorded locally by the
orchestrator · **Cite**: `fe5dea7:CLAUDE.md:54-57` against
`fe5dea7:tasks/BOARD.md:139-140` and `:324-332`.

`CLAUDE.md`'s iron rule:

> A wrong claim, broken step, or gap in the shell found while operating any copy
> is filed as a GitHub issue on the **federation upstream** named on the BOARD

The BOARD's **Federation upstream** line names
`https://github.com/renatom11/my-fpga-org` — this project's org generic. The
correct destination, which the BOARD states separately at `:324-327` and which
the orchestrator actually used, is the canonical shell
`https://github.com/renatom11/generic-agentic-fpga-org`. Followed literally,
`CLAUDE.md` routes shell defects to a repository that did not author the law.

The rule was written when upstream and defect channel coincided (an org generic's
upstream *is* the shell). ADR-0011's role split broke that coincidence for
`project` copies, and this line was not updated with it. The orchestrator spotted
the divergence in-flight — BOARD `:329-332`, "Note the channel and the federation
upstream now differ" — and routed correctly, which is why this is MINOR: the
hazard was live and the operator navigated it. The next operator may not.

**Remedy**: file upstream on the canonical shell (the fix is to name the
*defect channel* line, not the upstream line) and add it to the BOARD's local
defect log. Not locally patchable — `CLAUDE.md` is shell law.

---

### AUD-0001-F8 — MINOR — three inherited journal entries in the window carry no Trigger, Inputs or Reasoning

**Against**: no local owner — inherited, non-remediable · **Cite**: `7fe6f42`
(`J-orchestrator-0014`), `a45bc84` (`J-orchestrator-0015`), `a655654`
(`J-orchestrator-0016`).

`check_journals.sh --all` at the pin emits, for each (measured):

```
WARN-GRAMMAR: 7fe6f42: entry header lacks the '| task:<WO-id|none> | <title>' fields (PROTOCOL §4.1)
WARN-GRAMMAR: 7fe6f42: entry missing narrative section(s): Trigger Inputs Reasoning (PROTOCOL §4.1)
```

I read all three. They are **not vacuous in content** — each carries a
substantive `### Context` section, and `J-orchestrator-0016` records a genuine
self-correction ("the roster table said the auditor 'plants nothing' while §6
said it plants defects"). They are non-conformant in **structure**: no Trigger,
no Inputs, no Reasoning, and headers missing the `task:`/title fields.

`WARN-GRAMMAR` is advisory by design (ADR-0013) and never gates, correctly. This
finding exists so the count is on the record rather than absorbed into a warning
stream nobody tallies. **Disposition: carried, permanently.** Journals are
append-only and no agent may edit another's; there is no legal repair, and I am
not asking for one.

**Sampled and passed at the margin, no finding**: `J-orchestrator-0003` (42
words of Reasoning) and `J-orchestrator-0006` (41 words) are the window's
thinnest conformant entries. Both state a WHY, though neither records a rejected
alternative as PROTOCOL §4.1 invites. They are seeding commits porting settled
artifacts; I judge them acceptable and record the judgement so it can be
disputed.

---

### AUD-0001-F9 — MINOR — "the conservative reading" labels the permissive choice

**Against**: orchestrator · **Cite**: `fe5dea7:tasks/BOARD.md:44-45` and
`:190-192`; `J-orchestrator-0040` Reasoning ("The inherited freeze cannot be
obeyed as written").

The orchestrator found that the inherited feature freeze names an end condition
this repository cannot observe, and that read literally it bars the M1 toolchain
ADR that BOOTSTRAP Stage 2 mandates. It chose to treat the freeze as never having
bound this repository. The BOARD records:

> Taken as the conservative reading at intake: **it never bound this repository
> as written**, and M1's ADRs proceed under PROTOCOL §11 normally.

Of the two options the entry itself enumerates — obey the freeze and stall M1, or
disapply it and proceed — disapplying is the **permissive** one. It removes a
constraint and unblocks work. `CLAUDE.md:45` instructs the orchestrator, when it
hits a shell defect, to "take the tree's most conservative reading", and the
label is doing exactly the work of making a discretionary call read as compliance
with that instruction.

**I am not faulting the decision.** A rule that forbids the procedure it ships
with is a defect in the rule, and the orchestrator's argument for that is sound,
fully exposed on the BOARD with both readings stated, and filed as a shell
defect. Nor is non-escalation a fault: a feature freeze is not one of PROTOCOL
§8's E0–E6 classes, and §8 says everything else is decided inside the org. I also
note the counter-argument on the merits — permanent deadlock is not obviously
"conservative" either.

The finding is the **label on the live state file every future session rehydrates
from**. A rehydrating orchestrator reads "conservative reading" and stops; it
should read that a judgment call was made, so that it re-examines rather than
inherits.

**Remedy** (owner: orchestrator): replace "the conservative reading" with a plain
statement that this was a judgment call between two stated readings, or defend
the label in a journal entry.

---

### AUD-0001-F10 — MINOR — the work order imports a post-pin fact into a window it declares closed

**Against**: orchestrator (as packet author) · **Cite**:
`agents/handoffs/WO-0001_g0-retro-audit.md:105-108` against `:9-13`.

The packet pins the baseline at `fe5dea7` and states that findings "are
adjudicated against this pin, not against a moving tree" — L-E09, correctly
stated and correctly armed at spawn. Then §2 task 3 instructs:

> The orchestrator recorded that the sponsor first answered "no preference", read
> it as ratification, **then received explicit confirmation**. Judge whether the
> record states its own provenance honestly.

The explicit confirmation exists nowhere at `fe5dea7`. It exists only in the
out-of-window commit `4c2bc9b`, which the packet itself excludes at `:11-13`. The
packet therefore hands the auditor a post-pin fact that pre-frames the A6 row as
already-cured, inside the same document that forbids adjudicating against a
moving tree.

I record it because the framing was load-bearing in the direction of leniency and
because the audit is worthless if it treats the subject's framing as a boundary.
It changed no outcome here: F3 is adjudicated at the pin and the confirmation is
explicitly not credited.

**On the exclusion of `4c2bc9b` itself, which the spawn prompt invited me to
challenge: the exclusion is correct.** A commit carrying an audit's own work
order is scaffolding, and auditing it in the same pass would let the packet's
author shape the window by editing it. I endorse it as written — with the single
exception above, which is not the exclusion but a leak across it.

---

## 3. R1–R10 conformance over the window (WO §2 task 1)

**Did CI run, and was it bypassed?** No bypass found. Three workflow runs exist
in this repository, total; the two covering the window both concluded **success**
(**measured**, GitHub Actions API):

| Run | Branch | Head | Conclusion |
|---|---|---|---|
| `31012592559` | `main` | `0a60b2a` | success |
| `31016037714` | `claude/project-investigation-54wqwc` | `fe5dea7` | success |

For run `31016037714` (job `92340202750`) all five steps report `success`
individually, including **"Verify full history (append-only cannot be re-checked
incrementally)"**. That step runs `check_journals.sh --all`, so the entire
40-commit history — inherited stratum included — was machine re-verified in this
repository, not merely the two commits pushed here. This disposes of the concern
that inherited commits arrived unchecked: they did not.

**R4, re-derived from the diff rather than from the entry** (measured):

```
$ git show --name-status fe5dea7
M  README.md
M  agents/journals/claude_orchestrator_agent.md
A  docs/federation/outbox/G0.md
M  docs/gates/G0-checklist.md
M  tasks/BOARD.md
```

Excluding the committing agent's own journal (PROTOCOL §4.2), the changed set is
{`README.md`, `docs/federation/outbox/G0.md`, `docs/gates/G0-checklist.md`,
`tasks/BOARD.md`}. `J-orchestrator-0040`'s `Files-in-this-commit` lists exactly
those four. **Set-equal. R4 holds.**

**R1, the check CI cannot make.** The orchestrator's write scope is everything,
so R1 is audit-enforced there (PROTOCOL §5 honesty note; charter §3). I examined
`fe5dea7`'s diff for content attributable to a different author-agent. None
found: no agent other than the orchestrator had been spawned at the pin, and
every substantive change is orchestrator work — README phase table, BOARD state,
gate transcription, export packet.

One construct deserved adjudication rather than a pass by default. The Section C
span table (`docs/gates/G0-checklist.md`) contains rows for
`architect_docs_lead`, `rtl_lead`, `dv_lead` and **`auditor`** declaring `NIL`
yields — the orchestrator appearing to speak for four other agents, mine
included. It does not. Each such row's "Harvest note (miner's journal entry)"
cell is `—`: no journal entry is claimed, no signature is fabricated, and the
chains are header-only with nothing to mine. Declaring NIL for an idle chain is
clerical transcription, which PROTOCOL §7 assigns to the orchestrator. **R1
holds.**

**R2, R3, R5, R7, R8, R9, R10** across all 40 commits: verified green by
`check_journals.sh --all` at the pin (measured, §5) and independently by CI. R6
trailer well-formedness likewise; `fe5dea7` carries exactly the three protected
trailers with no duplicates.

**R9's out-of-repo dependency** at the pin: branch protection was not yet
configured, so no-force-push was **PROSE only** at `fe5dea7`, exactly as the
BOARD states at `:86-88`. See §10 for what has changed since.

---

## 4. Journal vacuity sampling (WO §2 task 2)

Method (measured): all 40 orchestrator entries at the pin were parsed for the
eight §4.1 sections and their Reasoning length measured, then the outliers were
read. 37 of 40 carry all eight sections; the three that do not are F8.

**`J-orchestrator-0040` — the mandatory sample — is emphatically non-vacuous.**
At 766 words of Reasoning it is the longest in the chain, and length is not the
reason it passes. It passes because it does what §4.1 actually asks: it
enumerates options and says why the winner won. Four examples, each checkable in
the entry:

- **Stack depth**: names the conflict between the project's stated "default to
  1977" philosophy (which argues 12) and ROM expectations (which assume 16),
  chooses 16, and says plainly "I broke the philosophy deliberately and said
  why."
- **Phase count**: proposes 5 over 4 because "the draw path is correct" and "the
  machine plays a game" are different kinds of evidence that should not share an
  acceptance row — and records that a one-line sponsor override to merge them was
  offered.
- **ROM provenance**: rejects vendoring because "freely available is not a
  license", choosing fetch-with-checksum to sidestep redistribution.
- **Golden model independence**: extends PROTOCOL §10's spec-derivation rule to
  the Python reference model, with the reason stated as a failure mode — a ported
  model "would silently agree with the hardware about any misreading the two
  share."

Each records a rejected alternative and its reason. It also volunteers material
against its own interest: the PROSE-not-MACHINE detection, the "no preference"
reading, and the 403 blocker. That is the standard this org should be held to,
and I record it as such — it is the reason F1, F3 and F4 are findings about
*form* rather than about candour.

`J-orchestrator-0039` (read in full) is similarly strong, and contains an
unprompted MACHINE/PROSE distinction at exactly the seam where it would have been
easiest to blur: "The R-ROLE-1 clearance is MACHINE… The fork gate itself is
PROSE: nothing refuses a clone of a red repo, and nothing will."

**Vacuity verdict over the window: no WHAT-without-WHY finding.** F8 records the
structural shortfall; nothing in the window is substantively vacuous.

---

## 5. Evidence re-execution (WO §2 task 5)

Checkout: `git checkout fe5dea721397acef6a48bc924f89af41037f033e` in a throwaway
clone. All results below are **measured**.

| # | Claim in `J-orchestrator-0040` | Command re-run at the pin | Observed | Verdict |
|---|---|---|---|---|
| 1 | "47 passed, 0 failed (41 scenarios)" | `bash scripts/test_protocol.sh` | `protocol self-test: 47 passed, 0 failed`; 41 scenario headers counted | **reproduces exactly** |
| 2 | "green, **39 commits** satisfy the protocol" | `bash scripts/check_journals.sh --all` | `OK: 40 commit(s) satisfy the journal/commit protocol` | **fails to reproduce → F1** |
| 3 | "journal volume chains verified at range head (R10)" | same run | `OK: journal volume chains verified at range head (R10)` | **reproduces** |
| 4 | "advisory `WARN-SEAL` ×3 and `WARN-GRAMMAR` on three inherited commits" | same run | 3 × `WARN-SEAL`; `WARN-GRAMMAR` on exactly `7fe6f42`, `a45bc84`, `a655654` | **reproduces exactly** |
| 5 | CI run `31012592559`, branch `main`, head `0a60b2a`, conclusion success | GitHub Actions API | id, workflow `journal-check`, branch `main`, head `0a60b2a…`, conclusion `success` | **reproduces exactly** |
| 6 | `git ls-remote` on the org generic → `refs/heads/main` = `0a60b2ae001cb62ec017d6f949dda3ef4d388321` | `git ls-remote --heads https://github.com/renatom11/my-fpga-org` | `0a60b2ae001cb62ec017d6f949dda3ef4d388321  refs/heads/main` | **reproduces exactly** |
| 7 | `git push --dry-run` → "failed, 403 … not in this session's authorized repository set" | `git push --dry-run https://github.com/renatom11/my-fpga-org HEAD:refs/heads/audit-probe-do-not-use` | **exit 0**, `* [new branch]` | **does not reproduce — see below** |

**Reproduction rate: 6 of 7 substantive claims reproduce; 1 fails (F1); 1 is
environment-dependent and is not counted as a failure of the entry.**

**On claim 7 — no finding against the entry.** The 403 was true when written; the
out-of-window commit `4c2bc9b` is titled in part "B6 push check cleared", i.e.
repository access was granted after the pin. Under L-E09 a claim that was true at
the pin is not falsified by the tree moving. What it *does* show is a class
limit: a credential-state result is neither "runnable from a repo checkout" nor
an "externally verifiable reference" in PROTOCOL §4.1's sense — it is a property
of a session, unreproducible by construction, and future entries should label it
as such rather than as a reproducible command result. Recorded as a note, not a
finding, because §4.1 does not currently name this class.

**Disclosure of my own conduct.** I executed `git push --dry-run` against a
third-party repository. It is a dry run — it transfers nothing and creates no
ref — and it is the exact verification method G0 row B6 prescribes ("`git
ls-remote` + `git push --dry-run` — never a probe push or probe commit"). I
verified afterwards that the remote still carries only `refs/heads/main`; no
`audit-probe-do-not-use` ref exists. I disclose it unprompted because it is the
most consequential command this audit ran (L-F06).

---

## 6. The Section C harvest block (WO §2 task 4)

All checks at `fe5dea7:docs/gates/G0-checklist.md`, Section C. **Verdict: PASS,
no finding.**

**Span tiling, by arithmetic.** The B6 fork-point baseline on the BOARD
(`:153-159`) records `orchestrator` **0039** and every other chain **none**. The
span table records `J-orchestrator-0040..0040`, tiling from baseline + 1 = 0040.
The window's own head entry is 0040. **Tiles exactly, no gap, no overlap.**

**The apparent gap that is not one.** The BOARD's baseline lists **nine** chains;
Section C's span table has **five** rows. The four missing are the worker
templates (`rtl_module_dev`, `tb_writer`, `data_wrangler`, `formal_dv`). Under
PROTOCOL §7.1 a worker span is mined by the **lead that commissioned it**, not
self-mined; no lead has been spawned and no worker commissioned, so no row is
owed. The block's own precondition states this ("every commissioned worker span
has a lead-mined row (none commissioned)"). I checked this specifically because
it reads as an omission and is not one.

**`LC-01` at the grade claimed (tier 1):**

- **LH1 — provenance-pinned**: cites adjudicating entry `J-orchestrator-0040`,
  incident head `0a60b2a`, and CI run `31012592559`. All three exist and I
  verified the latter two independently (§5 rows 5 and 6). **Holds** — with the
  resolvability defect recorded separately as F6.
- **LH2-g — no proper noun of any project or domain**: the rule statement
  (`docs/federation/outbox/G0.md:20-23`) reads "A self-identification check that
  validates only one value of an enumerated identity gives false assurance for
  every other value…". Read with provenance hidden: no module id, requirement id,
  signal name, file path, protocol name or interface standard. The incident
  narrative is likewise fully abstracted ("a repository template", "a
  continuous-integration check"). **Holds at tier 1.**
- **LH3 — stated failure**: `:50-57` states what breaks in transferable terms —
  "the check does not report 'not applicable,' it reports success." **Holds.**

**`WS-01`'s failed criterion is named honestly.** It declares **LH1** and
explains why: "The gap was identified while digesting intake material, before any
test existed, so there is no incident commit or adjudicating packet to cite." I
agree with the classification. It is a genuine failure named plainly rather than
a candidate padded into the yield — and, correctly, it names a *prospective*
domain pack without creating one, since packs accrete only at a landing fence.

**No yield cell carries a count.** The `orchestrator` row reads "`LC-01`, war
story `WS-01`" — ids. The four idle rows read `NIL` — declared, not blank, not
zero. PROTOCOL §7.1's "no counting metric, ever" is honored. **No padding
detected**: one candidate promoted, one demoted to a war story with its criterion
named, which is the shape of an honest first harvest rather than a productive
one.

**Preconditions**: five checked, one unchecked (transmission, blocked on the gate
signature and on repository access), with the block stating "The parent gate is
**not fully signed** until every box above is checked." Consistent with G0 OPEN
on the BOARD and in the gate table. **No contradiction found.**

---

## 7. MACHINE vs PROSE audit (WO §2 task 6)

Sampled enforcement claims across `tasks/BOARD.md`, `README.md` and
`docs/gates/G0-checklist.md` at the pin. **Verdict: PASS — every sampled claim is
tagged at the right class.** This is the cleanest result in the audit and it
deserves saying: the discipline `CLAUDE.md` mandates is being practiced, not
merely documented.

| Claim | Where | Class claimed | Verified | Verdict |
|---|---|---|---|---|
| "this copy was found unfounded by PROSE, not MACHINE… `R-ROLE-1` did not flag it, because that check compares origin against a `canonical-shell` claim only" | `BOARD.md:29-33` | PROSE | `check_journals.sh:322` — `if [ "$ROLE_VALUE" = "canonical-shell" ]`. The board claimed `org-generic` at `0a60b2a`, so the branch was not entered and the check emitted nothing at all | **correct** |
| "Until this is configured, PROTOCOL §5 R9 … is convention only here — enforced by nothing" | `BOARD.md:86-88` | PROSE | No ruleset existed at the pin (§10) | **correct at the pin** |
| "the federation pipeline has zero mechanical test coverage — the 47 self-test assertions (41 scenarios) test journal/commit hygiene only" | `BOARD.md:308-311` | MACHINE-absent | Grep across all four scripts for `federation|lessons|domain|outbox|harvest`: the only hits are R-ROLE-1's fixture BOARD text and its own comment. **No test exercises the federation, lessons or harvest machinery.** | **correct** |
| "commits are trailer-attributed, not cryptographically signed" | `BOARD.md:311-313` | honest downgrade | `git show --format=fuller fe5dea7` shows no signature; attribution is the `Agent:` trailer | **correct** |
| "mechanically enforced by `scripts/agent_commit.sh` and re-verified over every pushed range by CI" | `README.md:88-92` | MACHINE | Both exist and ran; workflow steps 3–5 all `success` at `fe5dea7` | **correct** |
| "the append-only property is re-checked over the FULL history on every push … **backstopped by branch protection** … (a one-time sponsor setup, G0 checklist item)" | `README.md:100-105` | MACHINE + named dependency | The full-history re-check is real (workflow step 4). The branch-protection dependency is named as a sponsor item rather than asserted as done | **correct** |
| "47 passed, 0 failed (41 scenarios) … `check_journals.sh --all` green over all 39 commits" | `BOARD.md:23-27` | measured, **SHA-scoped** | Reproduces at `0a60b2a`, the SHA the sentence names | **correct** — and see F1, where the same figures are unscoped in the journal |

Two further checks I ran because they are the kind of claim that ages badly:

- **`R-ROLE-1` at `project` role.** With `ROLE_VALUE = project`, the check emits
  neither a pass nor an `OK:` line — it is silently inapplicable. The BOARD's
  queued law-debt (`:280-283`) already names the generalization, and my reading
  of the code confirms the diagnosis is exact: the check compares origin against
  the **Federation upstream** line, which for a `project` legitimately differs
  from origin, so generalizing it requires re-keying on the **This-repository**
  line — precisely what the law-debt says. That debt is the shell's, not this
  repository's.
- **The `journal-check` workflow really does run full history**, not an
  incremental range. Step 4 is unconditional `--all`; step 5 adds the range check
  for a precise message. The README claim at `:100-102` is not overstated.

---

## 8. Escalation discipline, and the orchestrator's own conduct (WO §2 task 7)

PROTOCOL §8 admits E0–E6 and nothing else; everything not on that list "is
decided inside the org and recorded in journals/ADRs."

**Escalated (correctly, all class E0 — founding contacts, G0 only)**: A6 charter
ratification, A8 branch-flow decision, the B1–B6 intake signature, and A7 left
live as the last open E0. All four are on the enumerated list, all four are
sponsor-reserved, and the BOARD's "Pending escalations" section states one live
item with the other three recorded as discharged. **Correct, and correctly
batched** — the sponsor was asked once, for three decisions, with a proposal
attached, which is what "batched and decision-ready" means.

**Decided alone (each judged separately):**

| Decision | On the right side of §8? | Verdict |
|---|---|---|
| Disapplying the inherited feature freeze | Yes — a freeze is not E1–E6, and not a scope change under E2 (no requirement, phase or role added or dropped) | **Non-escalation correct.** The *label* is F9 |
| Deferring the shell-defect filing | Yes — an environment blocker, disclosed and logged | **Correct.** BOARD `:333-343` records the defect with "issue not yet filed — blocked on the same session-scope repository add." A defect filed to a log and blocked on access is not a suppressed defect |
| Routing the defect to the canonical shell rather than the BOARD's upstream line | Yes, on the merits | **Correct substantively**, against `CLAUDE.md`'s literal text — F7 |
| Deferring the A9 spawn | Yes | **Correct, and handled well.** The entry records a genuine conflict (an unblocked gate row vs a harness instruction not to spawn unrequested), states that deferring "costs the program nothing" because G0 cannot close on A7 anyway, and says "I raised it to the sponsor rather than resolving the conflict silently in either direction." That is the escalation discipline working |
| Queueing the repository-access blocker rather than escalating it | Yes — not an E-class | **Correct.** Recorded under "Queued, not yet escalations" with its three consequences enumerated |

**No suppressed escalation found.** I looked specifically for the failure mode
the charter names — a human-reserved matter decided quietly — and found the
opposite pattern: the entry and BOARD repeatedly surface decisions *against* the
orchestrator's own convenience (the PROSE detection, the weak A6 reading, the
unverified B6 sub-item, the 403). Where I fault the orchestrator in this report,
it is for the form of its records, never for hiding anything.

**Packet discipline.** WO-0001 is well-formed against PROTOCOL §3: state
`ISSUED`, from/to named, baseline SHA pinned at spawn (L-E09), check-in
expectation armed at issue time rather than after silence (L-E08), definition of
done bounded to what a bring-up audit can reach, standing lessons in force
enumerated (ADR-0012), context provided with nothing withheld, and a Return log
stub awaiting orchestrator transcription under the §3 auditor exception. One
defect: F10.

**Write-scope compliance, mine.** This report and `J-auditor-0001` are the only
files I wrote. Both are inside `docs/reports/audit/**` plus my own journal
(PROTOCOL §6). I ran no git command that writes to the audited repository.

---

## 9. Marker-check duty, and the canary question

**Marker check — executed, PASS** (measured at the pin):

- `grep -rn 'MUTATION (' --exclude-dir=.git .` → four hits, all in documentation
  describing the convention (`agents/handoffs/templates/CAMPAIGN-template.md:128`,
  `docs/playbooks/mutation-campaign.md:54`, `docs/reports/audit/README.md:59,79`).
  **No seeded mutant anywhere in the tree.**
- `git log --all --grep 'MUTATION ('` → no commits.
- `git branch -a` → `main`, `claude/project-investigation-54wqwc`, and their
  remotes. **No `mut/*` branch exists.**

No leaked mutant. This is a trivially clean result today — there has never been a
campaign — and it is recorded so the baseline exists.

**Canary.** Charter §6.2 makes a missed sponsor-planted canary my own CRITICAL. I
was told nothing in advance, which is the design. I found no artifact in this
window that reads as a deliberately planted process violation: every anomaly I
found has a visible, self-consistent cause traceable to the founding sequence or
to inherited template state, and none has the signature of a plant (an isolated
inconsistency with no surrounding narrative). **I therefore neither claim a
detection nor assert that none was planted** — the honest statement is that if
one was planted here, I did not identify it as such, and the findings above are
the complete list of what I found. If a canary was planted and is absent from
this list, that absence is my failure and should be recorded against me.

---

## 10. Observations outside the pinned window

Recorded, not graded. The work order places A7 out of scope ("it is an open gate
row, not a defect") and I honor that — no finding is raised. But the facts below
are material to the sponsor and reach them here or nowhere (L-F06).

**Branch protection now exists.** Queried live against the GitHub API
(**measured**, 2026-08-05, outside the pin):

| Ruleset | Enforcement | Targets | Rules | Bypass |
|---|---|---|---|---|
| `protect-history` | `active` | `refs/heads/main`, `refs/heads/claude/project-investigation-54wqwc` | `deletion`, `non_fast_forward` | none configured |
| `main-requires-ci` | `active` | `refs/heads/main` | `required_status_checks` | none configured |

Both were created at `2026-08-05T14:43:47Z` — **after** the pin commit
(`14:35:30Z`) and **before** the out-of-window commit `4c2bc9b` (`14:51:34Z`).
They match the A7 click-path's shape: rulesets rather than classic protection,
Active, empty bypass, both branches targeted, `journal-check` required on `main`.

Consequences the sponsor should see:

1. **R9's status has changed class since the pin.** At `fe5dea7` no-force-push
   was PROSE. It is now MACHINE. Every statement in the tree that says otherwise
   — `BOARD.md:86-88` ("enforced by nothing"), the A7 row's `OPEN` status,
   `README.md`'s conditional phrasing — is now **stale in the safe direction**,
   understating the guarantee rather than overstating it.
2. **No gate row records it.** A7 still reads `OPEN` with a placeholder
   signature cell. The gate checklist is behind the world.
3. **A7's own row demands more than I verified.** It requires "rejection verified
   by live fire". I confirmed configuration, not behavior — deliberately, since
   live-firing a force-push against a protected branch is both a write operation
   and a deliberate test of a protection, which PROTOCOL §8 requires be
   pre-declared. **NO-VERDICT on the live-fire element**, owner: orchestrator and
   sponsor.

**Owner for all three: orchestrator** (`docs/gates/**` and `tasks/BOARD.md` are
in its write scope; both are outside mine). Not a finding — an open row that
appears to have been satisfied between the pin and now, and whose record has not
caught up.

**One inherited-history curiosity, for the record.** `J-orchestrator-0014`
through `-0016` carry header timestamps of `2026-08-08`, while commits later in
the same chain are dated `2026-08-05`. This is exactly the situation L-A07 and
PROTOCOL §9 anticipate: journal header timestamps are not ordering evidence in
this repository; commit order is. I used commit order throughout and raise no
finding. It is noted because a future reader who trusts the headers will
mis-order this history.

---

## 11. Disposition summary

| Finding | Severity | Against | Blocks a gate? | Owed |
|---|---|---|---|---|
| F1 — Evidence quantity does not reproduce at the pin | MAJOR | orchestrator | No | Correction in a future entry; SHA-scoped Evidence going forward |
| F2 — A1–A5 signed against another repository's entries | MAJOR | orchestrator; canonical shell | No | Re-point cells at `J-orchestrator-0040`; file the template defect upstream |
| F3 — A6 ratification rests on a non-answer | MAJOR | orchestrator | No | **Re-verification by me** of the claimed out-of-window remedy before closure |
| F4 — A8 signature unsupported by its cited entry | MAJOR | orchestrator | No | Journal entry carrying the rationale and the sponsor's words |
| F5 — `AUD-0001` id collision | MINOR | orchestrator | No | Qualify the seven bare references, or record the decision not to |
| F6 — export-packet provenance unresolvable | MINOR | orchestrator | No | Qualify citations with repository URLs before transmission |
| F7 — `CLAUDE.md` defect routing names the wrong line | MINOR | canonical shell | No | Upstream issue; BOARD defect-log line |
| F8 — three inherited entries lack §4.1 sections | MINOR | none (inherited) | No | **Carried permanently** — no legal repair exists |
| F9 — "conservative reading" mislabels the permissive choice | MINOR | orchestrator | No | Re-word the BOARD line or defend the label |
| F10 — packet imports a post-pin fact | MINOR | orchestrator | No | Noted; changed no outcome |

**No CRITICAL findings. No finding blocks `G0`.** For the record, what a CRITICAL
would have looked like in this window: an Evidence claim whose *verdict* did not
reproduce; a journal edited above EOF; a gate row signed with no cited entry at
all; a `MUTATION` marker on a mergeable branch; or a verbatim-class packet
altered in relay. I checked for each. None is present.

**Recommendation on G0 row A9**: satisfiable by this report. G0 remains open on
its own terms; §10 records that A7's underlying condition appears to have been
met after the pin, which is the orchestrator's to verify and transcribe, not
mine.

**On closure**: F3's closure requires re-verification by me in a follow-up report
(audit README, and charter §2 — an auditor's finding is not closed by the party
that remediates it). F1, F2, F4 must be dispositioned before the next gate
signature that touches them. F5–F10's dispositions are at their owners'
discretion but must be written down.

---

*Prepared by `auditor` under WO-0001. Every finding cites a SHA, a `file:line`, a
packet path, or a journal entry id, and is intended to be falsifiable by a reader
who trusts neither the orchestrator nor me.*
