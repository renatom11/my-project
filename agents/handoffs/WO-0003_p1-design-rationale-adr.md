# WO-0003: ADR for the P1 spec's five non-obvious choices, plus the traceability matrix

- **State**: **RETURNED** 2026-08-05 (see Return log)
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

### RETURNED — `architect_docs_lead`, 2026-08-05, `J-architect_docs_lead-0002`

Spawn short-id `WO-0003/2026-08-05T16:52Z`. Single pass, as the check-in
expectation armed at issue time required. **No git command that writes was
run.**

**Deliverables.**

| # | Deliverable | State |
|---|---|---|
| 1 | `docs/adr/ADR-0018-p1-core-cpu-design-choices.md` | Landed. Five decisions, each with alternatives / why it won / cost / corpus verdict / falsifier, plus §1 (the corpus question), §7 (findings), §9 (provenance + MACHINE/PROSE table) |
| 2 | `docs/specs/requirements.md` | Landed. 90 P1 rows, id-allocation policy, per-column ownership, a two-way completeness check |
| 3 | Spec §11 updated | D-1 and D-2 **LANDED**; **D-7** and **OQ-4** added; the four stale "`requirements.md` does not exist" references in §0, §3, §10 and REQ-124 corrected |
| 4 | Journal `J-architect_docs_lead-0002` | Appended |
| 5 | This Return log entry | This |

**Definition of done vs §2 of this packet.**

| Task | Status |
|---|---|
| 1 — one ADR, five decisions, alternatives + winner + cost + falsifier | Met |
| 2 — each rule run backwards over the corpus; §11 / L-B15 verdict in the ADR; choice 4 to name Verilator's 2-state blindness | Met, **with the corpus question answered explicitly rather than assumed** — ADR-0018 §1. See "The one thing I did differently" below |
| 3 — choice 5 argued, not justified; say so if the argument does not close | Met. The argument **closes** for the port set and **does not close** for REQ-114 and for the anti-back-door protection; both are stated as unclosed rather than smoothed |
| 4 — traceability matrix, REQ → section → empty test-id column | Met |
| 5 — spec §11 cites both as landed; D-3 left deferred | Met. D-3 untouched; **nothing under `rtl/` was created, implied or reserved** |

**The one thing I did differently from the packet's literal instruction, and
why.** Task 2 says to run each rule backwards over the corpus. The corpus that
would discriminate these five rules is the population of CHIP-8 programs — it
is external to this repository, is not vendored here, and was not retrieved.
Meanwhile this repository's own history discriminates none of them, because no
CHIP-8 instruction has ever been executed in this tree and spec §8 rules out
ROM execution for all of P1. **So the literal backtest is not performable at
this commit, and ADR-0018 says so in §1 instead of fabricating one.** What was
performed is a structural backtest — characterise the dependent program class,
test it for non-emptiness, reachability and discriminating power — labelled
**derived**, with the gates at which the real backtest becomes performable
named per choice (P3/P4 for choices 1–2, P1's own lockstep for choice 3, the
Icarus lane for choice 4). A backtest verdict of "the corpus cannot see this
yet, and here is where it can" is a usable result; a fabricated one is not.

**Verdicts on the five.**

| # | Choice | Verdict |
|---|---|---|
| 1 | Halt on illegal opcode | **Holds.** The discriminating dependent class (fall-through-into-padding) is non-empty but consists of programs already interpreter-specific, and P1 executes no ROM regardless. The backtest changed the rule's *shape* in one place — the `DC_DEFERRED` split is what stops a P1 illegal-space test also passing on a decoder that forgot `DXYN`. Surfaced **D-7** |
| 2 | Fault rather than wrap on multi-byte spans | **Holds, strengthened.** The vacuity argument is the strongest in the ADR because it rests on a signed P4 formal property. The backtest added a cost the spec had not stated: the fault localises the *use* of an overflowed I, not the `FX1E` that overflowed it — and `QUIRK_I_OVERFLOW_VF = 1` is the configuration carrying the cause-side diagnostic, a reason for P4's alternate run beyond compatibility |
| 3 | Deterministic RNG | **Holds, strongly.** Split into two sub-rules with opposite verdicts: the corpus is **blind** to stepped-vs-free-running (no program can observe cycle counts), so that half is free to be decided on verification grounds — which is what licenses the decision. But the corpus is **not** blind to step count, and it requires 8, which is what the spec chose. The supporting LFSR identity is now **measured**, not argued |
| 4 | Fully specified reset | **Holds for what it covers; the backtest found it incomplete.** It enumerates architectural registers and stops, leaving **32768 bits of memory** with no specified initial value under any partial `MEM_INIT_FILE` — exactly the hazard class it exists to eliminate, in the lane that cannot see it. Surfaced **OQ-4**. Also: "compensating control" is the **wrong label** for the reset — it is hazard *elimination*; the compensating control for Verilator's blindness is the Icarus lane and only that |
| 5 | Observation as a mandated port set | **Argument closes for the port set; two edges do not close** — see below |

**Choice 5, since the packet asked for candour over tidiness.** The argument
that the port set is not "a spec describing an implementation" **closes**, on
three legs: it descends from a *signed* success criterion whose only other
discharge would be a PROTOCOL §10 violation (§6.3); every element of the
bundle is either REQ-013 architectural state, a function of it, or a boundary
marker — and the boundary marker `obs_retire` **reduces** structural
dependence, because the alternative is counting cycles against the FSM's own
table (§6.4); and §6.6 leaves the implementer free everywhere the obligation
does not reach (§6.5). That yields a standing **admission rule** for future
`obs_*` ports, which is the ADR's most reusable output.

**Where it does not close, stated plainly:**

1. **REQ-114 is implementation description.** Mandating an internal array name
   is not covered by any part of the above. It is defended as least-bad among
   three options — the other two being a PROTOCOL §10 violation and a port
   that contradicts REQ-112 — with the real argument being that the bench
   depends on a memory observable under *all three*, and the only question is
   whether the **spec or the RTL** is the authority for it. Sound, and still
   not the same as "this is not implementation description". Recorded as an
   unclosed edge.
2. **Nothing mechanical stops DV testing structure through the bundle.** The
   three controls are all **PROSE**: mid-instruction `obs_*` values are
   unspecified by §6.6 so asserting on them is unsound *by inference, not by
   an imperative clause*; a structural test has no REQ to cite in the matrix,
   which makes it inspectable but not refused; and REQ-106/REQ-113 constrain
   the DUT, not the bench. The risk is genuinely smaller here than the general
   worry suggests — for a CPU with no I/O, architectural state **is** the
   entire observable behaviour, and REQ-013's closure clause makes that a
   theorem — **but that mitigation does not survive into P2**, where a
   framebuffer exists.
3. **The pattern does not scale.** P2's 2048-bit framebuffer cannot go on a
   port, so P2 inherits **REQ-114's uncomfortable shape**, not §6.4's
   comfortable one. Recorded as a prediction for P2's spec work.

**Two findings, neither of them an edit.** Per this packet's out-of-scope
clause, both are reported and neither is repaired here:

- **OQ-4 — blocks `P1-spec-freeze`.** Memory outside a partial
  `MEM_INIT_FILE` image has no specified initial value. Consequences:
  **REQ-123 is falsified as written** ("no uninitialised storage anywhere in
  P1"); §6.6 permits three realisations that disagree about it; Verilator
  reads `0` and Icarus reads `X`, so the fast lane stays green; and the Python
  model will zero-fill, making the first read of unwritten memory in the
  Icarus lane a **false divergence caused by the specification** — ADR-0017
  A2 §5's hazard class arriving from a direction A2 did not anticipate. The
  repair is one sentence of normative text, which is a spec revision and
  therefore **a new work order, not an edit smuggled through this ADR**.
- **D-7 — does not block the freeze.** README's P4 row requires "every
  divergent CHIP-8 behaviour" as a compile-time parameter, and unknown-opcode
  handling **is** divergent across interpreters — the same L-B12 argument that
  justified adding two quirk parameters beyond WO-0002's three would require a
  sixth. Not adopted: the reading is arguable (quirk tables enumerate
  divergences in the semantics of *instructions*), and the settling evidence
  does not exist before P4.

**Did any choice weaken?** No choice was reversed and there is no "I would now
choose differently" on the substance of any of the five. One choice's **scope**
proved short (choice 4 → OQ-4); one choice's **completeness claim** proved
weaker than presented (the quirk set → D-7); and one choice's **defence**
proved partly unclosable and is recorded as such rather than dressed up
(choice 5 → REQ-114 and the PROSE-only anti-back-door controls).

**Owed to the orchestrator** (this author cannot stage `tasks/BOARD.md`,
PROTOCOL §6; L-E10 requires open questions to be board artifacts):

1. A board line for **OQ-4**, marked as blocking `P1-spec-freeze`, plus a
   spec-revision work order to close it. `dv_lead` should see it **before**
   the WO-0004 countersignature — it bears on the lockstep's first instruction.
2. A board line for **D-7** as a P4 carry-forward.
3. The board's "Spec deferred items" paragraph now reads stale: D-1 and D-2
   are landed and D-2 no longer blocks the freeze; **OQ-4 does**.

**Requested verdict**: ACCEPT the three deliverables; issue the OQ-4
spec-revision packet before the freeze gate.
