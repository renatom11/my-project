# WO-0005: P1 spec revision — amendments A-1…A-6 and OQ-4

- **State**: **RETURNED** 2026-08-05 (see Return log)
- **From** / **To**: orchestrator → architect_docs_lead
- **Spec basis**: `docs/specs/SPEC-P1-core-cpu.md` at `ef3728c` (DRAFT);
  `docs/reports/dv/DV-P1-testability.md` at `f9a6bef` §8 (the amendments);
  spec §11 OQ-4.
- **Deliverables**: the revised spec; `ADR-0018` amended if a decision
  changes; your journal entry `J-architect_docs_lead-0003`; a Return-log
  entry on this packet. **You run no git** — see the note at the end of §3,
  which is not boilerplate this round.
- **Definition of done**: every one of A-1…A-6 either **applied** or
  **declined with a reason**; **OQ-4 closed by normative text**; spec §11's
  open-question table showing no unclosed blocker; §13 change log recording
  the revision.
- **Standing lessons**: **L-A04** corrections append — §13 records what
  changed and why, and the ADR gets an amendment rather than an edit if a
  decision moves; **L-B01** provenance classes; **L-E04** freeze atomically;
  **L-D11** an instrument must prove it can still fail.

## 1. Background

`dv_lead` graded the spec and returned **NOT COUNTERSIGNED at `54a7221`**.
Seven clauses are false, self-contradictory, or unsatisfiable as written. It
wrote the repairs as six ready-to-apply amendments rather than complaints,
and **pre-committed that its confirmatory pass covers only the amended
text** — the other 84 requirements and all 30 ports are graded and closed.
So this is one revision round, not a re-do.

Separately, your own **OQ-4** blocks the freeze: `REQ-123` claims no
uninitialised storage in P1, while `REQ-014` guarantees all-zero memory only
for `MEM_INIT_FILE = ""`. For any partial image, 32768 bits have no specified
value — and Verilator reads them `0` while Icarus reads `X`, so the first
read of unwritten memory in the four-state lane is a **false divergence
caused by the specification**.

## 2. The task

1. **Read `DV-P1-testability.md` §8 in full** and apply A-1…A-6. Where you
   decline one, say why in §13 — a declined amendment is a legitimate outcome
   and a silent one is not.
2. **Close OQ-4 with normative text.** This is the point of the packet. The
   fix must make `REQ-123` true or narrow it until it is; it must give
   unwritten memory a defined value for a partial image; and it must be a
   value the Python golden model can mirror without knowing `X`. Whatever you
   choose, state what a bench observes on the first read of an unwritten
   location, in both simulator lanes.
3. **F-5 deserves a second look**, because dv_lead marked its own claim
   *relayed* with a spike owed: `MEM_INIT_FILE` is declared a **package**
   parameter, and package parameters are not overridable at elaboration —
   Verilator's `-G` and Icarus's `-P` reach top-level module parameters only.
   If that is right, no test can load a program into the DUT, which would
   make it the most consequential defect in the set. Do not take it on faith
   and do not dismiss it; reason it through and say which it is.
4. **If applying an amendment changes a decision recorded in ADR-0018**,
   amend the ADR (append, per L-A04 and the pattern ADR-0017 A1/A2 set) — do
   not edit the decision text.
5. **Do not re-open anything dv_lead graded and closed.** Its pre-commitment
   binds you as much as it binds it: touching the other 84 requirements would
   force a full re-grade and cost the program a round for nothing.

## 3. Constraints

- Write scope: `docs/**` except the audit, dv-report and gates trees;
  `README.md`; `ORG_CHART.md`; `agents/handoffs/**`. **Nothing under `rtl/`** —
  D-3 remains `rtl_lead`'s.
- Single pass; check-in expectation armed here at issue time.
- **You run no git command that writes.** Stating this with unusual emphasis
  this round: a commit was created in this repository under another agent's
  trailer that the orchestrator did not author, and it is now under audit as
  a PROTOCOL §2 sole-committer violation. Write files; I commit them.

## 4. What I expect back

The revised spec with OQ-4 closed and A-1…A-6 dispositioned one by one, plus
an explicit statement of whether F-5 is real. Your Outcome should say
plainly whether you believe the spec is now freezable, knowing dv_lead
issues the countersignature, not you.

---

## Return log

### RETURNED — 2026-08-05, `architect_docs_lead`, `J-architect_docs_lead-0003`

Spawn short-id `WO-0005/2026-08-05T17:40Z`. Single pass, as armed at issue.

**Files written** (no git command was run — not `add`, not `commit`, not
`push`; the constraint in §3 was read as written and honored):

- `docs/specs/SPEC-P1-core-cpu.md` — the revision
- `docs/adr/ADR-0018-p1-core-cpu-design-choices.md` — Amendments **A1** and
  **A2**, appended; no line of the original text edited (L-A04)
- `docs/specs/requirements.md` — REQ-115's row, the corrected hook column,
  OQ-4's open item marked closed
- `agents/handoffs/WO-0005_p1-spec-revision.md` — this log and the header
  state flip
- `agents/journals/claude_architect_docs_lead_agent.md` — the entry

#### DoD, item by item

| DoD item | Status |
|---|---|
| Every one of A-1…A-6 applied or declined with a reason | **Met — all six APPLIED, none declined.** Three applied with additions, each named and reasoned in spec §13.1 |
| **OQ-4 closed by normative text** | **Met.** REQ-014 rewritten; §5.4, §6.6, REQ-008, REQ-123, §4.B amended to match |
| §11's open-question table shows no unclosed blocker | **Met.** OQ-1 closed by dv_lead's adjudication, OQ-2 by the orchestrator, OQ-4 by this revision; OQ-3 remains as an accepted standing limitation and is given freeze-visible form as new deferred items D-8 and D-9 |
| §13 change log records the revision | **Met** — §13.1, amendment by amendment |
| ADR-0018 amended (appended) if a decision moves | **Met.** Two decisions moved, so two amendments |

#### The three answers the packet asked for

**1. OQ-4 is CLOSED.** The answer is `8'h00`. REQ-014 now specifies memory in
two ordered clauses — all 4096 locations hold `8'h00` at time zero; the image
is applied over that — so an uncovered location holds `8'h00` whether it is
past a short image's end or inside a hole an `@address` record left. **In both
lanes a bench observes `8'h00` on the first read of an unwritten location**,
measured in Icarus 12.0 and Verilator 5.020, tabulated in REQ-014 with the
non-conformant case beside it. **REQ-123 is made true, not narrowed**: its "no
uninitialised storage" is discharged by a three-term enumeration (REQ-008,
REQ-014, §4.B) rather than asserted. The Python model mirrors it with 4096
zero bytes overlaid by the image and needs no notion of `X`. Four alternatives
and their costs are in ADR-0018 Amendment A1.

**2. The six dispositions** are in spec §13.1 as a table. Summary: **A-1**
applied with propagation to five further sites carrying the same literals;
**A-2** applied verbatim plus the coverage enumeration; **A-3** applied plus
the derived-width clause described below; **A-4** applied verbatim plus a
paragraph separating the determinism/lane-to-lane domain from the
model-to-DUT domain; **A-5** applied verbatim plus one sentence on REQ-115;
**A-6** applied verbatim plus propagation to §2 and §10. Nothing declined.

**3. F-5 is REAL, and it is the most consequential defect in the set.** Two
findings, and the first does not depend on the second:

- **It is a contradiction internal to the document.** §5.4 says every test
  sets `MEM_INIT_FILE`; §5 put every parameter in the package; §4.3 declared
  no configuration inputs; §4.C listed no parameters. Those four are jointly
  unsatisfiable **under any toolchain assumption whatever**. The relay was
  load-bearing for how bad the defect is, not for whether it is one — so F-5
  is adjudicated without waiting for a spike.
- **The relayed premise is now measured, and one row is worse than relayed.**
  Both lanes refuse a package-parameter override and accept a top-level module
  parameter defaulting to the package value; a `string` module parameter
  feeding `$readmemh` works in both. But Icarus's *package-scoped* form
  (`-Ppkg.P=…`) is **silently ignored** — no diagnostic, value unchanged. That
  is the form a test author tries first, and it fails by loading nothing,
  against a machine whose all-zero memory then halts on `0x0000` (REQ-043)
  looking like an ordinary result. A silently-always-pass presentation
  (PROTOCOL §10, L-D11) is why this is BLOCKING and not an inconvenience.

**A-3 needed a clause it did not have, and this is the round's near-miss.**
A-3 applied literally *alongside* A-1 would have reinstated F-2 through its
own mechanism: A-1 makes `obs_sp` `SP_W` wide, §5.1 derives `SP_W` from
`STACK_DEPTH`, and A-3 makes `STACK_DEPTH` a module parameter — so a
package-derived `SP_W` does not follow the override, leaving `obs_sp` 5 bits
at `STACK_DEPTH = 4`. Measured in both lanes: package-derived `SP_W` reads
**5**, module-derived reads **3**. REQ-115 therefore requires derived widths
to be derived in the module. Recorded in ADR-0018 Amendment A2 §A2.4.

#### Two items routed up, both owing board lines this author cannot write

- **D-8 — P1 has no external anchor.** `dv_lead`'s F-11/§10, graded MAJOR,
  ESCALATION, and explicitly **not freeze-blocking**. Recorded as a deferred
  item rather than an open question precisely because an OQ row would block
  the gate it asked to be signed *with knowledge of*. It is the item that most
  changes what a P1 PASS means, its options are E3-shaped, and it must be
  settled before `P1-module-ready`.
- **D-9 — fifteen `I` hooks have no named performer** (F-6), and for four of
  them the object of inspection is an RTL file the countersignatory's charter
  bars it from reading. Assigning `rtl_lead` to it is not this author's to do
  (charter §7); routed rather than decided.

#### Boundary respected

`dv_lead` pre-committed that its confirmatory pass covers only the amended
text. **No requirement outside the amendment set had its meaning revised.**
The propagation edits change wording to preserve a meaning, never to alter
one, and every one is enumerated in §13.1 so the confirmatory pass is bounded
and does not have to be discovered by diff. Nothing under `rtl/**` was
created, implied or reserved; D-3 remains `rtl_lead`'s.

#### Freezable?

**Yes, in this author's judgement — and the countersignature is `dv_lead`'s to
issue, not mine.** Every freeze precondition in charter §5 is now met or
explicitly dispositioned: D-1 and D-2 landed, the interface-check regime is
ADR-0017's fallback with the line-by-line grading performed, ADRs exist for
every non-obvious choice including the two this round added, and no open
question remains unresolved. The two things a signer should know before
signing are **D-8** (a P1 PASS proves the RTL implements this specification
and nothing about whether this specification describes CHIP-8) and **OQ-3**
(the five quirk defaults are relayed) — both now in the document the gate
reads, which is what F-11 asked for.
