# WO-0005: P1 spec revision — amendments A-1…A-6 and OQ-4

- **State**: ISSUED
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
