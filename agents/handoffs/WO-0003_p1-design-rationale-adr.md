# WO-0003: ADR for the P1 spec's five non-obvious choices, plus the traceability matrix

- **State**: ISSUED
- **From** / **To**: orchestrator → architect_docs_lead
- **Spec basis**: `docs/specs/SPEC-P1-core-cpu.md` at `54a7221` (DRAFT), its
  §11 deferred items **D-1** and **D-2**.
- **Deliverables**:
  - `docs/adr/ADR-0018-p1-core-cpu-design-choices.md`
  - `docs/specs/requirements.md` — the P1 requirements register and
    traceability matrix (D-1)
  - Your journal entry `J-architect_docs_lead-0002`
  - Return-log entry on this packet. **You run no git.**
- **Definition of done**: each of the five choices below carries its
  alternatives, the reason the winner won, and what it costs; the
  traceability matrix maps every `REQ-###` to its spec section and leaves a
  column for the test ids DV will fill; spec §11 D-1/D-2 updated to cite the
  landed artifacts (that edit is in your scope).
- **Context provided**: the spec you wrote, `agents/PROTOCOL.md` §11,
  `docs/adr/` (ADR-0017 is the nearest model — note its Amendments A1 and A2,
  which are what an ADR looks like when its author finds it wrong later),
  `README.md`, `tasks/BOARD.md`. Nothing withheld.
- **Standing lessons in force**: **L-B15** — a proposed rule is run backwards
  over the corpus before adoption, and the corpus verdict goes in the ADR;
  **L-B01** — provenance classes on every claim; **L-A04** — corrections
  append; **L-E10** — open questions are artifacts on the board, not prose
  buried in a document.
- **Out of scope**: changing any specified behaviour. This packet records
  *why* the spec says what it says. If writing the rationale convinces you a
  choice was wrong, **say so and stop** — that is a spec revision, which is a
  new packet, not an edit smuggled through an ADR.

## 1. Background

Your spec's §11 lists **D-2** as a freeze precondition: five choices are
load-bearing, non-obvious, and currently justified only inside the spec's own
prose. Charter §5 makes an ADR the right home for that, and you correctly
declined to self-issue the work order. This is it.

The five, as you named them:

1. **Halt on illegal opcode** — rather than no-op-and-continue, or trap.
2. **Fault rather than wrap** on a multi-byte address span crossing the top of
   memory (`FX33`, `FX55`, `FX65`, and the fetch pair).
3. **A deterministic RNG** for `CXNN`.
4. **A fully-specified reset** — every architectural register given a defined
   value rather than left undefined.
5. **The observation interface as a mandated port set** rather than a
   testbench-only convention.

## 2. The task

1. **One ADR, five decisions**, each with: the alternatives actually
   available, why the winner won, what it costs, and what would falsify the
   choice later. Number it `ADR-0018`.
2. **Run each rule backwards over the corpus before adopting it** (PROTOCOL
   §11, L-B15): for choices 1–4, what would a CHIP-8 program that depends on
   the *other* behaviour look like, and does any known program depend on it?
   The corpus verdict — what the rule flags, what it misses — goes in the ADR.
   For choice 4, note explicitly that Verilator is 2-state (ADR-0017), so a
   fully-specified reset is partly a *compensating control* for a lane that
   cannot see uninitialised state at all.
3. **Choice 5 deserves the most care**, because it is the one that touches
   independence. A mandated observation port set makes the architectural state
   visible to the bench by contract. Argue why that is not a spec describing
   an implementation (the thing your packet forbade), and state what stops it
   from becoming a back-door for DV to test structure rather than behaviour.
   If you cannot make that argument cleanly, that is a finding worth more than
   a tidy ADR.
4. **The traceability matrix** (D-1): every `REQ-###` → its spec section →
   an empty column for the test ids `dv_lead` will fill at the countersignature
   and beyond. This is the artifact every later `SO-` packet cites and the
   auditor samples for spec drift.
5. **Update spec §11** to cite `ADR-0018` and `requirements.md`, moving D-1
   and D-2 from *deferred* to *landed*. Leave **D-3** (`rtl/chip8_pkg.sv`)
   deferred — it is `rtl_lead`'s to author from your §5.5, and it is not
   yours to write.

## 3. Constraints

- **You never run git.** Read-only inspection is expected.
- **Write scope**: `docs/**` except the audit, dv-report and gates trees;
  `README.md`; `ORG_CHART.md`; `agents/handoffs/**`. **You may not create
  `rtl/` anything** — D-3 is not yours.
- **Do not renumber or restate REQ ids.** The matrix cites them; it does not
  re-specify them. A requirement stated twice is a requirement that will
  diverge.
- **Check-in expectation, armed at issue time**: single pass.

## 4. What I expect back

The four deliverables, your Inputs section listing exactly what you read, and
an explicit statement in Outcome of whether writing the rationale changed your
confidence in any of the five choices. **A "I would now choose differently"
is a success of this packet, not a failure of the spec** — it is far cheaper
here than after the freeze.

---

## Return / verdict log
