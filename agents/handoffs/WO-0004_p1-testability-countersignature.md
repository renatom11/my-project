# WO-0004: P1 spec testability countersignature, and the OQ-1 adjudication

- **State**: **RETURNED** 2026-08-05 (see Return log)
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

### RETURNED — dv_lead, 2026-08-05 · `J-dv_lead-0001`

**Report**: `docs/reports/dv/DV-P1-testability.md`
**Spec graded**: `docs/specs/SPEC-P1-core-cpu.md` at `54a7221`
**Spawn short-id**: `WO-0004/2026-08-05T16:52Z`

#### Verdict

> **NOT COUNTERSIGNED at `54a7221`.**

Seven clauses are false, self-contradictory, or unsatisfiable as written, and
each would need a post-freeze spec diff plus an ADR (§13) to repair. They are
written out as six ready-to-apply amendments **A-1 … A-6** in report §8. This
is not a rejection of the spec's substance: no error was found in any
instruction semantic, cycle count, fault definition, or the decode partition,
and **68 of the 90 requirements are testable from the document alone today**
(T 68 · T-conditional 8 · not-bench-derivable 14).

**Pre-commitment**: on a revision carrying A-1 … A-6 my confirmatory pass is
limited to the amended text — the other 84 requirements and the §4 port
tables are graded and I will not re-open them. The countersignature issues as
`J-dv_lead-0002`.

#### DoD, item by item

| WO §2 item | Status |
|---|---|
| 1 — grade §4's port tables line by line | **Met.** Report §3: 30 distinct ports across M01/M02/M04 plus M03, graded on signal, direction, width, meaning. Four defects (F-2, F-3, F-4, F-5); all in the width and parameter columns; none in direction or meaning. **Ports I need that are absent: none** — §3.5 states what I decline to request and why. |
| 2 — per-requirement testability, all 90 | **Met.** Report §4, one row per REQ id with its grade, its bench boundary, and what is missing where the answer is no. |
| 3 — adjudicate OQ-1 | **Met.** Report §5: **HALT upheld**; the two classes and two error codes **preserved**; five reasons, the losing side's strongest argument stated and priced, and three obligations I take on in return. |
| 4 — is the decode partition testable, not just sound | **Met.** Report §6: totals independently re-derived by a different decomposition; **exhaustive classification coverage of all 65536 encodings committed**, with the reason it is affordable here and nowhere else, and the finding that **uniform sampling would be near-worthless** because the information lives entirely in thin class boundaries. |
| 5 — what I need that does not exist yet | **Met.** Report §9. Notable: **`rtl/chip8_pkg.sv` (D-3) is not on my critical path** once A-5 lands — that is what A-5 is for. Also flagged: `build.yml`'s source guard couples rtl_lead's first module and my first bench into one commit. |
| 6 — do not countersign around a gap | **Honored.** The gap is named and the signature is withheld. |

#### Carried to the orchestrator

- **F-11 — P1 has no external anchor available** (report §10). Every CHIP-8
  reference at the B3 intake is *consult-only*, the independence rider bars
  deriving the model from an interpreter, and the free-use test ROMs cannot
  run in P1 (§8: no ROM executes). Charter §3's anchor-before-judge rule
  therefore has nothing to anchor against. **Not freeze-blocking**; it must be
  settled before the first `SO-` PASS. Three options with a recommendation are
  in report §10; option (a) is **E3**-shaped.
- **F-6** — fifteen REQs carry an "inspection" hook with no named performer,
  and five of those inspect **RTL**. If the performer is dv_lead it is a
  charter violation; recommend rtl_lead + auditor, with the machine-checkable
  subset converted to CI.
- **Three NO-VERDICT items** (report §11), all discharged by one spike:
  Verilator hierarchical access to `mem`; sweep wall-clock; package-parameter
  override behaviour. **Nothing in this report is measured** — there is no RTL
  and no bench to run.
- **D-5 recommendation** (non-blocking): require the P2/P3 spec-diff ADR to
  **enumerate the P1 tests it invalidates**, so retiring a frozen P1 assertion
  is an authorised act rather than a test edit inside a phase commit.

#### Scope compliance

No test, no model code, no RTL written; `rtl/**` not touched. Files staged:
`docs/reports/dv/DV-P1-testability.md` and this packet. **No git command was
run.**
