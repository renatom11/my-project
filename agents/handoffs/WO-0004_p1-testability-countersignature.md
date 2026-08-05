# WO-0004: P1 spec testability countersignature, and the OQ-1 adjudication

- **State**: ISSUED
- **From** / **To**: orchestrator → dv_lead
- **Spec basis**: `docs/specs/SPEC-P1-core-cpu.md` at `54a7221` (DRAFT) —
  90 `REQ-###` ids, an 8-state multicycle FSM, an exhaustive decode
  partition, five quirk parameters.
- **Deliverables**:
  - `docs/reports/dv/DV-P1-testability.md` — your countersignature report
  - Your journal entry `J-dv_lead-0001` (chain's first entry)
  - Return-log entry on this packet. **You run no git.**
- **Definition of done**: a per-requirement testability verdict; a stated
  adjudication of **OQ-1**; an explicit list of anything in the spec you
  cannot derive a test from; and a clear overall verdict —
  **COUNTERSIGNED** / **COUNTERSIGNED WITH FINDINGS** / **NOT COUNTERSIGNED**.
- **Context provided**: the spec, `README.md`'s phase table and scope
  paragraph, `docs/adr/ADR-0017-toolchain-lane.md` (incl. A1/A2 — the
  toolchain you will actually build against, and why cocotb is pinned to
  1.9.x), `agents/PROTOCOL.md`, `docs/gates/templates/`, `tasks/BOARD.md`.
- **Standing lessons in force**: **L-D11** — an instrument must prove it can
  still fail; **L-D04** — NO-VERDICT is a class of its own; **L-B12** — read
  the governing requirement before designing the artifact; **L-D16** — a
  check that covers one value of an enumeration says nothing about the rest;
  **L-B01** — provenance classes.
- **Out of scope**: writing any test, any golden-model code, or any RTL.
  This packet is a **judgement on the specification's testability**, not the
  start of implementation. Your P1 build work is a later packet, and it must
  not begin before the freeze — a bench derived from an unfrozen spec is how
  spec-derivation independence quietly becomes fiction.

## 1. Background

PROTOCOL §7 makes your countersignature a precondition of
`P1-spec-freeze`: *"Architect's specs complete with REQ-### requirements;
interface-check evidence per the M1 ADR's regime ... dv_lead countersigns
testability; sponsor signs the freeze."*

The M1 regime is **reviewed port tables**, not compile-checked interface
records (ADR-0017 Consequence 1). That decision was taken knowing the port
table would be **graded line by line at your countersignature** — so §4's
port tables are not a formality you skim. They are the interface contract,
and yours is the review that makes the weaker regime defensible.

## 2. The task

1. **Grade §4's port tables line by line.** Signal, direction, width,
   meaning. A port whose meaning you cannot test against is a finding. Say
   which ports you would need that are absent.
2. **Per-requirement testability.** For each of the 90 `REQ-###`: can a test
   be derived **from this document alone**, without reading RTL that does not
   yet exist? Where the answer is no, say what is missing — an unobservable
   effect, an unstated precondition, a behaviour specified only by example.
3. **Adjudicate OQ-1** — the spec defers whether a *deferred* opcode (a P2/P3
   instruction encountered in P1) halts or no-ops, and routes the decision to
   you. Decide it on testability grounds and say why. Note the spec keeps
   *deferred* and *illegal* as distinct classes with distinct error codes;
   your adjudication should preserve that distinction or argue against it.
4. **Check the decode partition is testable, not just arithmetically sound.**
   The spec partitions all 65536 encodings into 39745 implemented / 4209
   deferred / 21582 illegal. The arithmetic re-sums (I checked). The question
   yours answers is different: can a bench actually *cover* the illegal space
   in a meaningful way, or does covering it require 21582 directed tests? If
   a sampling strategy is the only practical answer, say so now — that is a
   fact the spec freeze should be taken with, not a discovery for P1's bench.
5. **Say what you will need that does not exist yet**, concretely: the shared
   package (spec §5.5, `rtl/chip8_pkg.sv`, deferred item D-3, `rtl_lead`'s to
   author) is on your critical path — your bench imports it too. Flag any
   other such dependency.
6. **Do not countersign around a gap.** If the spec is not testable in some
   respect, **COUNTERSIGNED WITH FINDINGS** or **NOT COUNTERSIGNED** is the
   honest verdict and costs the program far less than a freeze over a hole.

## 3. Constraints

- **You never run git.** Read-only inspection is expected.
- **Write scope**: `test/**`, `tools/**`, `docs/reports/dv/**`,
  `agents/handoffs/**`. This task touches `docs/reports/dv/` and your journal.
  You may **not** stage `rtl/**` — machine-enforced, and it is the structural
  reason your verdict on RTL is worth anything.
- **You have not read any RTL, because none exists.** Record that in your
  Inputs section — it is the audit evidence for spec-derived independence at
  its cleanest, and it will never be this clean again.
- **Check-in expectation, armed at issue time**: single pass.

## 4. What I expect back

- The report and your journal entry.
- One unambiguous verdict from the three above.
- Your Inputs section listing exactly what you read, with paths.
- **Grading**: the sponsor signs the P1 spec freeze (**E1**) on the strength
  of the architect's spec *and* your countersignature. The auditor samples
  both from P1 onward for drift. Return to the orchestrator.

---

## Return / verdict log
