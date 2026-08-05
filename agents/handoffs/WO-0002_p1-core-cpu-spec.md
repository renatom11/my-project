# WO-0002: P1 core-CPU specification and REQ-### requirements

- **State**: ISSUED
- **From** / **To**: orchestrator → architect_docs_lead
- **Spec basis**: none yet — **this packet creates the spec basis** every P1
  work order will act under. Authority is `README.md`'s phase table (the
  canonical scope statement, PROTOCOL §1), row **P1**, and
  [ADR-0017](../../docs/adr/ADR-0017-toolchain-lane.md).
- **Deliverables** (all inside your write scope, PROTOCOL §6 — `docs/**`
  except `docs/reports/audit/**` and `docs/reports/dv/**`, plus `README.md`,
  `ORG_CHART.md`, `agents/handoffs/**`):
  - `docs/specs/SPEC-P1-core-cpu.md`, instantiated from
    [`SPEC-TEMPLATE.md`](../../docs/specs/SPEC-TEMPLATE.md).
  - Your journal entry appended to
    `agents/journals/claude_architect_docs_lead_agent.md` (`J-architect_docs_lead-0001`
    — the chain's first entry; the header block exists, append below it).
  - **You run no git.** Write the files; the orchestrator commits them under
    `Agent: architect_docs_lead`.
- **Definition of done**: every P1 behaviour carries a `REQ-###` id; the §4.1
  interface regime is instantiated as **reviewed port tables** (ADR-0017
  Consequence 1 — *not* compile-checked interface records) plus the shared
  parameter package described in task 5; a DV-testability countersignature is
  possible from the document alone; journal entry appended with your reasoning.
- **Context provided**: this packet, `README.md`'s phase table and scope
  paragraph, `docs/specs/SPEC-TEMPLATE.md`, `agents/PROTOCOL.md`,
  `docs/adr/ADR-0017-toolchain-lane.md` (including Amendments A1 and A2),
  `tasks/BOARD.md`. **Nothing is withheld** — there is no RTL to withhold and
  no blinding regime on specification work.
- **Standing lessons in force** (ADR-0012; the BOARD declares **no domain
  packs**, so these are core `docs/LESSONS.md` entries only):
  - **L-B12** — read the governing requirement before designing the artifact:
    README's phase table is the governing statement of P1's scope, not this
    packet's summary of it. Where they differ, README wins and you say so.
  - **L-E04** — freeze atomically, and derive only from committed signed text.
  - **L-B01** — every claim carries a provenance class (measured / derived /
    relayed). A datasheet figure is *relayed*, not *measured*.
  - **L-D16** — an enumerated-identity check that validates one value gives
    false assurance for the rest. Relevant to your opcode-decode table: a
    decode spec that specifies the legal encodings and says nothing about the
    illegal ones leaves the illegal space unspecified, not "don't care".
  - **L-A04** — corrections append; they never rewrite.
- **Out of scope**, explicitly:
  - **The display and draw path** (`00E0`, `DXYN`, `FX29`, the framebuffer,
    the barrel shifter) — that is P2.
  - **Keypad and timers** (`EX9E`, `EXA1`, `FX0A`, `FX07`, `FX15`, `FX18`) —
    that is P3.
  - Writing any RTL, any test, or any golden-model code. You specify; other
    lanes implement and verify. Do not put implementation in the spec.
  - Editing `README.md`'s phase table. If you believe P1's scope is wrong,
    that is an **E2** escalation raised through the orchestrator, not an edit.

## 1. Background

G0 passed; M1's toolchain is decided (ADR-0017, Lane A) and its risk retired
by measurement (A2). This is the org's **first product artifact** — everything
before it was program scaffolding. It is also the first spawn of the
architect_docs_lead chain, so your journal begins here.

P1 builds the CHIP-8 core CPU: a multicycle machine on a single-port memory.
The structural fact that shapes everything is that **only one memory access
can happen per clock cycle**, so no instruction completes in one cycle — fetch
high byte, fetch low byte, decode, then execute across one or more states.

## 2. The task

1. **Instantiate `SPEC-TEMPLATE.md`** as `docs/specs/SPEC-P1-core-cpu.md`.
   Follow its "how to use" items; where a section does not apply to P1, say so
   explicitly rather than deleting it silently.
2. **State the architectural state** as numbers, taking them from README's
   scope paragraph (which is canonical — quote it, do not re-derive it): 4096×8
   single-port RAM, one access per cycle; V0–VF (VF the carry/borrow/collision
   flag); I and PC 12-bit; a 16×12-bit stack; program load address `0x200`;
   font ROM 80 bytes at `0x000`–`0x04F`. Instructions are fixed 2 bytes,
   big-endian.
3. **Specify the instruction set in P1's scope**, one `REQ-###` per behaviour.
   The proposed boundary — **confirm it or argue it**, do not silently adopt
   it: `00EE`, `1NNN`, `2NNN`, `3XNN`, `4XNN`, `5XY0`, `6XNN`, `7XNN`,
   `8XY0`–`8XYE`, `9XY0`, `ANNN`, `BNNN`, `CXNN`, `FX1E`, `FX33`, `FX55`,
   `FX65`. Specify for each: the encoding, the effect on architectural state,
   **the effect on VF where there is one**, and the cycle count in terms of the
   FSM states you define. `0NNN` (SYS) needs an explicit disposition.
4. **Specify the multicycle FSM** — the states, their transitions, and which
   memory access happens in each. This is the structural core of P1 and the
   thing the RTL lead will decompose from. Give the cycle cost of each
   instruction class in terms of these states, including the two loops
   (`FX55`/`FX65` iterate once per register).
5. **The §4.1 interface regime is reviewed port tables** (ADR-0017 Consequence
   1). Produce the port table for every module boundary you define — signal,
   direction, width, and meaning — knowing it will be graded line by line at
   the dv_lead countersignature. **Additionally** specify the shared
   SystemVerilog **package** the ADR requires: parameters and opcode encodings
   in one place, imported by both RTL and testbench, so those values cannot
   drift silently even though the port lists are review-checked.
6. **Declare the quirk parameters now, for the P1 instructions that have
   them** — `8XY6`/`8XYE` (shift: one register or two), `BNNN` (jump offset
   source), `FX55`/`FX65` (whether I advances). The compatibility campaign is
   P4, but the *parameters* belong in the P1 spec: retrofitting a parameter
   into frozen RTL and frozen benches costs more than declaring it unused for
   three phases. Default every one to the **1977 COSMAC VIP** behaviour per the
   intake. Name each parameter; do not specify P4's test matrix.
7. **Specify the illegal-opcode behaviour.** Per L-D16: the decode space is
   16 bits and the legal set does not fill it. Say what the machine does with
   an unrecognised encoding, and make it a `REQ-###` like anything else — an
   unspecified illegal space is a hole the formal properties in P4 will fall
   into.
8. **Flag anything the intake underdetermines.** Do not invent a signed scope
   parameter. If P1 cannot be specified without a decision that is not in
   README or the BOARD, list it in Open-questions and leave it unspecified —
   the orchestrator escalates it (E2 if it is scope), and a spec that guesses
   is worse than a spec with a named gap.

## 3. Constraints

- **You never run git.** Read-only inspection (`git log`, `git show`) is fine.
- **Write scope is absolute**: `docs/**` (except the two report trees),
  `README.md`, `ORG_CHART.md`, `agents/handoffs/**`. In practice this task
  touches `docs/specs/` and your journal. You may **not** stage
  `docs/gates/**` — that exclusion is machine-enforced (S37) so that §7's
  transcription rule holds.
- **No implementation.** A spec that says *how* rather than *what* pre-empts
  the RTL lead's design work and makes the DV lane's independence
  meaningless — tests are derived from this document, so anything you write
  here that describes an implementation becomes a test of that implementation
  rather than of the requirement.
- **Check-in expectation, armed at issue time** (PROTOCOL §3, L-E08): single
  pass, no long-running jobs. If a numbered task above cannot be completed,
  return with it explicitly unfinished rather than guessed — a spec with a
  named gap is worth more than a complete-looking one that invented a value.

## 4. What I expect back

- The two files named in Deliverables.
- Every P1 behaviour carrying a `REQ-###` id, so the traceability matrix and
  every later `SO-` packet can cite them.
- Your journal entry's **Inputs** section listing exactly what you read, with
  paths — this is the audit evidence for spec-derivation independence.
- **Grading**: `dv_lead` countersigns testability at the P1 spec freeze, and
  the sponsor signs the freeze itself (**E1**). The auditor samples this spec
  for drift against the RTL from P1 onward. Return to the orchestrator, which
  commits under your trailer and routes the countersignature.

---

## Return / verdict log

<!-- Appended on RETURNED / ACCEPTED / BOUNCED — newest at the bottom.
     Every entry cites its author's journal entry. -->
