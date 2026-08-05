# DV-P1-testability — testability countersignature on `SPEC-P1-core-cpu.md`

- **Packet**: `agents/handoffs/WO-0004_p1-testability-countersignature.md`
- **Author**: dv_lead · journal `J-dv_lead-0001` (this report's authority)
- **Spec under review**: `docs/specs/SPEC-P1-core-cpu.md` at **`54a7221`** (DRAFT)
- **Gate row**: `P1-spec-freeze` — "dv_lead countersigns testability" (PROTOCOL §7)
- **Date**: 2026-08-05

---

## 0. Verdict

> ## **NOT COUNTERSIGNED** at `54a7221`.

Seven of the specification's clauses are **false, self-contradictory, or
unsatisfiable as written**, and each one would have to be repaired by a
post-freeze spec diff plus an ADR (§13) if it froze in its current form. They
are listed as **A-1 … A-6** in §8 below, written as replacement text so the
architect can apply them in a single pass.

**This is not a rejection of the specification's substance.** It is the best
specified artifact I have graded, and the grading found no error in any
instruction semantic, any cycle count, any fault definition, or the decode
partition. **68 of the 90 requirements are testable from this document alone,
today, with no amendment and no further artifact.** The seven repairs total
under one page and none of them changes a behaviour — each corrects a
*statement about* a behaviour, or supplies a mechanism the document assumes
and does not provide.

**Pre-commitment, so this costs one round trip and not two**: on a revision
carrying A-1 … A-6, my confirmatory pass is **limited to the amended text**. I
have graded the other 84 requirements and the §4 port tables line by line;
that grading stands and I will not re-open it. The countersignature issues as
`J-dv_lead-0002` against the amended SHA.

**Adjudications delivered as ordered:**

| Item | Ruling |
|---|---|
| **OQ-1** — deferred opcode halts or no-ops | **HALT is upheld.** The two classes and the two error codes are **preserved**. §5. |
| **Illegal-space coverage** — 21582 encodings | **Sampling is not the only answer, and uniform sampling is the wrong answer.** Exhaustive classification coverage of all **65536** encodings is structurally available and I commit to it. §6. |
| **Ports I need that are absent** | **None.** I decline to request the memory-port observation bundle, and I decline an FSM-state output. §3.5. |

---

## 1. Inputs, and the independence declaration

Read for this work order, in full:

- `agents/charters/dv_lead.md`
- `agents/PROTOCOL.md` (v2)
- `agents/handoffs/WO-0004_p1-testability-countersignature.md`
- `docs/specs/SPEC-P1-core-cpu.md` at `54a7221` — all 1132 lines
- `README.md` — phase table and the scope-parameter paragraph
- `docs/adr/ADR-0017-toolchain-lane.md` including Amendments **A1** and **A2**
- `tasks/BOARD.md` (P1 open questions, B3 intake, toolchain measurements)
- `docs/LESSONS.md` — L-B01, L-B12, L-D04, L-D11, L-D12, L-D16, L-E10, L-F03
- `requirements.txt`, `TOOLCHAIN.md`, `.github/workflows/build.yml`
- `agents/handoffs/templates/`, `docs/gates/templates/`

**I have read no RTL, because none exists.** `rtl/` is absent from this tree at
`4a95703`. Every judgement in this report derives from the specification and
the programme documents above. This is spec-derived independence in its
cleanest possible form (PROTOCOL §10, charter §8), and it will never be this
clean again — from the first RTL commit onward my Inputs sections carry a
declared exposure surface instead of a structural absence.

One consequence I want on the record now, because it is a design decision and
not an accident: **A-5 (§8) exists so that my independence stays structural.**
As the specification is written, REQ-109 obliges the testbench to reference
`chip8_pkg` rather than restate its values — which would put an RTL file on
the DV critical path permanently. A-5 moves the Python side's derivation to
§5.5 of this specification instead. That is a *second* derivation from the
same normative source, deliberately, and its failure mode is a red test rather
than a silent agreement.

---

## 2. Method

1. Every REQ's own text was read before it was graded (**L-B12**), through the
   section it lives in, not through the §10 registry row.
2. Each of the 90 requirements was asked one question: **can a bench be
   derived from this document alone, and is there an observation point at
   which the thing it asserts is visible?** A requirement can be perfectly
   written and still unverifiable if nothing exposes its effect.
3. Every port in §4.A–§4.D was graded on four axes — signal, direction, width,
   meaning — with widths checked against §5.1's parameter table rather than
   read off the page.
4. The decode partition's three totals were **independently re-derived by a
   different decomposition** from the spec's (§6, complement counting per high
   nibble) rather than re-added down its columns.
5. Provenance is tagged throughout (**L-B01**). Anything I could not settle is
   marked **NO-VERDICT** and collected in §11 — a thing I could not measure is
   never reported as a thing that passed (**L-D04**).

---

## 3. §4 — the port tables, graded line by line

ADR-0017 Consequence 1 chose reviewed port tables over compile-checked
interface records, and named this grading as the compensating control. §4.1 of
the spec restates that. So this section is the control, and it is performed at
the granularity the trade-off was priced at.

Grades: **OK** — signal, direction, width and meaning are all correct and
testable · **W** — width defect · **M** — meaning cannot be tested as stated ·
**?** — meaning is ambiguous between two implementable readings.

### 3.1 M01 `chip8_cpu` (§4.A) — 19 ports

| Port | Dir | Width | Grade | Finding |
|---|---|---|---|---|
| `clk` | in | 1 | **OK** | "nominal 12 MHz" is documentation, not a testable property of the module; correctly so. |
| `rst_n` | in | 1 | **OK** | Synchronous, active-low, ≥1 rising edge. Testable exactly as written against §7.5. |
| `mem_en` | out | 1 | **OK** | Testable at this boundary. Not visible at M03 — see F-1, which is a hook defect, not a port defect. |
| `mem_we` | out | 1 | **OK** | "Meaningful only while `mem_en` is high" correctly creates a don't-care window; see F-9 for what that window costs the comparison domain. |
| `mem_addr` | out | 12 | **W (minor)** | Value correct; the literal `12` should be `ADDR_W`. Not blocking on its own — `ADDR_W` is fixed at 12 in P1 and a change is an E2. Folded into A-1 for consistency. |
| `mem_wdata` | out | 8 | **W (minor)** | As above: `DATA_W`. |
| `mem_rdata` | in | 8 | **OK** | One-cycle-after contract matches §4.B exactly. Cross-checked both directions. |
| `obs_retire` | out | 1 | **OK** | The single most important port in the specification. Its contract (REQ-029) is complete, and it makes every cycle count in §7.1 observable without any FSM visibility. |
| `obs_instr` | out | 16 | **OK** | `INSTR_W`. Meaning is anchored at retire (REQ-029) and at halt (REQ-049); between those it is unconstrained, correctly. |
| `obs_instr_addr` | out | 12 | **OK** | `ADDR_W`. |
| `obs_pc` | out | 12 | **OK** | `ADDR_W`. |
| `obs_i` | out | 12 | **OK** | `ADDR_W`. |
| `obs_sp` | out | **5** | **W — BLOCKING** | §5.1 declares `SP_W` **derived** as `$clog2(STACK_DEPTH)+1`, and declares `STACK_DEPTH` **overridable in the range 2…16**, giving the reason ("a short stack lets a directed test reach `ERR_STACK_OVERFLOW` in a handful of instructions"). With `STACK_DEPTH = 4`, `SP_W` is 3 and this port is 3 bits, not 5. **§4.A and §5.1 contradict each other in the frozen text.** → **F-2 / A-1** |
| `obs_stack` | out | **192** | **W — BLOCKING** | Same defect, larger. 192 = `ADDR_W × STACK_DEPTH` at the default only. With `STACK_DEPTH = 4` this port is 48 bits and the `obs_stack[12*k +: 12]` mapping ranges over k = 0…3, not 0…15. → **F-2 / A-1** |
| `obs_v` | out | 128 | **W (minor)** | `NUM_V × DATA_W`. `NUM_V` is not overridable in P1, so this one is latent rather than live. Folded into A-1. The **mapping** `obs_v[8*k +: 8]` is correct, unambiguous, and directly testable — see F-8 on its missing hook. |
| `obs_rng` | out | 16 | **OK** | `RNG_W`. The rationale given for exposing it — catching model/DUT desynchronisation where it happens rather than at the next `CXNN` — is exactly right and I would have asked for this port if it were absent. |
| `obs_halted` | out | 1 | **OK** | "High from the cycle the machine enters `S_HALT`" pins the edge precisely enough to measure the 3- and 4-cycle fault rows of §7.1. |
| `obs_err` | out | **4** | **W — BLOCKING** | The width is arithmetically fine for six enum members. The defect is upstream: §5.5 declares `err_e` with **no base type**, and an untyped SystemVerilog enum defaults to `int`. §5.5 is the normative single definition site (REQ-107); a normative definition that leaves the width of the thing on a 4-bit port unstated is a drift surface of exactly the class the package was created to close. → **F-3 / A-1** |

**Direction column**: correct on all 19. **Meaning column**: no port's meaning is
untestable at this boundary. **Closure (REQ-112)**: I want no port added here.

### 3.2 M02 `chip8_ram` (§4.B) — 6 ports

| Port | Dir | Width | Grade | Finding |
|---|---|---|---|---|
| `clk` | in | 1 | **OK** | |
| `en` | in | 1 | **OK** | "When low, the memory does nothing and `rdata` is unchanged" — a complete, testable statement. |
| `we` | in | 1 | **OK** | |
| `addr` | in | 12 | **W (minor)** | `ADDR_W`. Folded into A-1. |
| `wdata` | in | 8 | **W (minor)** | `DATA_W`. |
| `rdata` | out | 8 | **M — BLOCKING** | The steady-state contract is complete and testable, including the two cases a reader would ask about: a **write** cycle is not an enabled read, so `rdata` holds; and there is no read-during-write transparency. What is missing is **time zero**. M02 has no `rst_n` and no specified power-up value for the register the one-cycle read latency implies. REQ-008 claims "Every bit is given an explicit reset value"; REQ-123 claims "no uninitialised storage … anywhere in P1". Both are **false of this port** as the tables stand, and the two-lane regime is where it bites: Icarus reads `x`, Verilator reads `0`, and §3's own row demanding the lanes agree is what breaks. → **F-4 / A-2** |

**The structural note beneath the table is the best paragraph in §4** and I
endorse it without qualification: exposing no `ready`, `busy`, `stall` or
`valid` means a design needing backpressure **cannot be written** against this
interface. That is a structural control, not a documented intention (**L-F03**),
and it is worth more than any assertion I could write about REQ-101.

### 3.3 M03 `chip8_core_top` (§4.C) — the DUT

| Item | Grade | Finding |
|---|---|---|
| `clk`, `rst_n` | **OK** | |
| The `obs_*` bundle, "passed through unmodified and with no added or removed cycle of delay" | **OK as a contract; M for its hook** | The pass-through property is not observable at M03 by construction — you cannot compare a wrapper's output against an input you cannot see. It is guaranteed structurally and REQ-105's hook says so (`S + I`). Correct as written. |
| **Parameters** | **M — BLOCKING** | §4.C carries **no parameter list at all**, and §4.3 declares "Configuration inputs: **None**." Meanwhile §5.4 states of `MEM_INIT_FILE`: "**Every test sets it**: it is how a program and its data reach the machine." A package parameter is not overridable at elaboration in this toolchain, and the package file is under `rtl/**` where DV cannot stage an edit. **As frozen, there is no mechanism by which any test can put a program into this DUT.** → **F-5 / A-3** |
| REQ-112 port closure | **OK** | |
| REQ-120 / REQ-114 memory observation | **OK as a contract, NO-VERDICT on feasibility** | See F-11 and §11. |

### 3.4 M04 `chip8_rng` (§4.D) — 5 ports

| Port | Dir | Width | Grade | Finding |
|---|---|---|---|---|
| `clk` | in | 1 | **OK** | |
| `rst_n` | in | 1 | **OK** | Loads `RNG_SEED`. Note M04 **has** the reset M02 lacks — the asymmetry is F-4's shape. |
| `step` | in | 1 | **OK** | "advances by exactly 8 steps" — exact, countable, testable standalone. |
| `rnd` | out | 8 | **OK** | The pre-advance presentation is the subtle part and it is stated precisely enough that two independent implementers reach the same sequence. I checked the definition against REQ-103's pseudocode: `rnd = low8(advance8(s))` for the current `s`, so a single-cycle `CXNN` consumes and commits together. Consistent. |
| `state` | out | 16 | **OK** | `RNG_W`. Makes the whole generator observable, so `rnd`'s correctness is derivable even though `rnd` itself is internal to M01. |

### 3.5 Ports I would need that are absent

**None.** I want to be explicit, because a countersignature that only asks for
more ports is not a review.

- **I decline to request an `obs_mem_*` observation bundle at M03.** Nine
  requirements (REQ-001, 021, 022, 023, 024, 025, 026, 030, 102) assert
  behaviour of the memory port, which is invisible at M03. The remedy is not a
  new port: §4.A, §4.B and §4.D are complete, normative port tables for real
  modules, so **M01, M02 and M04 are each independently bench-bindable**, and I
  will verify those nine at M01's and M02's own boundaries with a bench-side
  memory model derived from §4.B. This costs the spec nothing. What it does
  cost is the §10 hook column, which assigns five of those nine the hook `R`
  ("constrained-random stream with full-state compare") — a full-state compare
  at `obs_retire` **cannot see which cycle the port was active in**, so those
  hooks name a check that cannot perform the observation. That is F-1, and it
  is a correction to a table, not to a design.
- **I decline an `obs_state` FSM output.** §6.6 deliberately leaves the state
  encoding free, and every timing claim in §7.1 is observable through
  `obs_retire` and `obs_halted`. A state output would bind an implementation
  choice the spec was right to release, in exchange for information I already
  have.
- **I decline a reset port on M02.** Its six-port minimality is load-bearing.
  A-2 fixes F-4 by specifying the power-up value instead.

---

## 4. Per-requirement testability — all 90

**Grades**: **T** — a test is derivable from this document alone; the only
missing thing is the DUT. **T-c** — derivable, conditional on a named
amendment or artifact. **N** — not bench-derivable; verified by inspection or
structure, and the performer must be named.

**Counts (provenance *derived*; the derivation is this table): T = 68 ·
T-c = 8 · N = 14 · total 90.**

**Bench**: which boundary the test binds to — `M01` / `M02` / `M04` standalone,
or `M03` (the lockstep DUT).

### 4.1 Architectural state — REQ-001 … REQ-014

| REQ | Grade | Bench | Note |
|---|---|---|---|
| REQ-001 | T | M01 | One access per cycle, observable as `mem_en` activity per state. §10's hook `S + R` is wrong: `R` cannot see it. **F-1** |
| REQ-002 | T | M03 | The only normative content is that `0x000`–`0x04F` is ordinary RAM; "reserves" asserts nothing checkable and correctly does not pretend to. Tested by `FX55`/`FX65` with I in the font region. |
| REQ-003 | T | M03 | |
| REQ-004 | T | M03 | `ANNN` with `NNN = 0xFFF`, then `FX1E` wrap. |
| REQ-005 | T | M03 | The "updated exactly once, in `S_EXEC`" clause has a clean observable consequence: an illegal opcode halts with PC still at the offending address (REQ-041). No FSM visibility needed. |
| REQ-006 | T | M03 | Including the clause a reader might think structural — "**dedicated array, not a region of RAM**" is directly testable: a call/return pair must leave every byte of memory unchanged. |
| REQ-007 | T | M03 | Big-endianness and the unaligned case (`1NNN` to an odd address) are both separable. |
| REQ-008 | T | M03 (Icarus authoritative) | One trap the spec does not flag and a bench must: checking "all V are `0` after reset" from a cold start cannot distinguish *reset works* from *never written*. The test writes non-zero state first, then resets. §7.5 licenses reset from any state, so this is spec-derived. |
| REQ-009 | T | M03 | Testable **in-band** — write with `FX55`, reset, read back with `FX65` — so it does not depend on the `mem` handle. This same property is what makes §6's exhaustive sweep affordable. |
| REQ-010 | T | M03 | |
| REQ-011 | T | M03 | |
| REQ-012 | T | M03 | `obs_rng` at reset. |
| REQ-013 | **N** | — | Closure over implementation internals is a negative universal; no bench proves it. Honest hook (`I + R`). The real compensating controls are the mutation campaign and long random streams, and I name them here rather than pretend an inspection settles it. |
| REQ-014 | **T-c** | M03 | Conditional on **A-3**. Today there is no mechanism to set `MEM_INIT_FILE` per test. |

### 4.2 Control FSM — REQ-020 … REQ-030

| REQ | Grade | Bench | Note |
|---|---|---|---|
| REQ-020 | **N** | — | "Eight states, no others affecting the timing contract." Its entire observable content **is** REQ-028. Recommend the hook be restated as "D, via REQ-028" rather than `I`, so no one later believes an inspection happened. |
| REQ-021 | T | M01 | Read at PC. Hook `R` → `D` at M01. **F-1** |
| REQ-022 | T | M01 | Read at PC+1; high-byte capture is separately observable in-band via REQ-007. **F-1** |
| REQ-023 | T | M01 | "No access in `S_DECODE`" is invisible everywhere except M01's port. A spurious read would leave no trace at M03. **F-1** |
| REQ-024 | T | M01 + M03 | Cycle count at M03; "issues the first access" at M01. |
| REQ-025 | T | M01 | Including the clause that has **no other observation point**: `FX33`'s three bytes "in ascending address order". A final memory image is order-independent, so the ordering requirement is testable **only** at the port or by cycle-granular probing of `mem`. **F-1** |
| REQ-026 | T | M01 | |
| REQ-027 | T | M03 | |
| REQ-028 | T | M03 | Measurable without FSM visibility: consecutive `obs_retire` pulses bound exactly one instruction (REQ-029), and the fault rows are measured from the previous retire to `obs_halted` rising. I verified the state sequences against the cycle arithmetic for all six rows, including the `FX55 = 4+X` / `FX65 = 5+X` asymmetry — it follows from REQ-102 and is correct. |
| REQ-029 | T | M03 | The instrument's foundation. One trap: §6.2's `S_FETCH_HI` row says it "drives `obs_retire` for the just-completed instruction", which alone would license a spurious pulse in the **first** fetch after reset, where no instruction has completed. REQ-029's "exactly one per instruction that completes" governs and forbids it. Reconcilable, so not a finding — but it is a directed check I will write, because it is the first thing a wrapper gets wrong. |
| REQ-030 | T | M01 | The behavioural discharge of the single-port invariant. Hook `R` cannot see it. **F-1** |

### 4.3 Decode and faults — REQ-040 … REQ-049

| REQ | Grade | Bench | Note |
|---|---|---|---|
| REQ-040 | T | M01 | Exhaustively — see §6. |
| REQ-041 | T | M01/M03 | Halt, code, **and** the no-state-change clause, which is checkable against the full bundle. |
| REQ-042 | T | M01/M03 | The distinct code is what makes §6's sweep informative rather than a halt-counter. See §5. |
| REQ-043 | T | M01 | `0000` is the encoding a run of blank memory produces; with `MEM_INIT_FILE = ""` the default configuration halts on its first instruction. That is a good property and it is my first smoke test. |
| REQ-044 | T | M03 | Reachable in 16 calls at the default `STACK_DEPTH`; the parameter override is a convenience, not a necessity (which is why F-2 is a contradiction to repair, not a capability to buy). |
| REQ-045 | T | M03 | |
| REQ-046 | T | M03 | Boundary checked: `FX55` with X = 0 at I = `0xFFF` does **not** fault (`I + 0 > 0xFFF` is unsatisfiable for a 12-bit I); `FX33` at I = `0xFFE` does. The comparison is stated in wider-than-12-bit arithmetic and is unambiguous. |
| REQ-047 | T | M03 | Full-state compare across the faulting instruction. |
| REQ-048 | T | M03 | Sticky and terminal: run N cycles past the halt and assert nothing moves, including memory. |
| REQ-049 | T | M03 | |

### 4.4 Instruction semantics — REQ-060 … REQ-087 (28)

All **T**, all at **M03**, all derivable from §6.4 alone. I traced each
instruction's effect and its interaction with REQ-085's ordering rule and
REQ-087's closure. No semantic gap, no behaviour specified only by example, no
unstated precondition.

| REQ | Encoding | Note (only where there is something to say) |
|---|---|---|
| REQ-060 | `00EE` | Round-trip with REQ-062 verified: push `PC+2` at `stack[SP]`, `SP+1`; pop `SP−1` then read `stack[SP]`. Consistent. The "popped entry not cleared" clause is what makes the all-16-entries compare deterministic, and it is stated. |
| REQ-061 | `1NNN` | |
| REQ-062 | `2NNN` | |
| REQ-063 | `3XNN` | |
| REQ-064 | `4XNN` | |
| REQ-065 | `5XY0` | |
| REQ-066 | `6XNN` | |
| REQ-067 | `7XNN` | The **no**-carry clause is emphasised and is a classic divergence; correctly non-parameterized (it is not community-divergent). |
| REQ-068 | `8XY0` | |
| REQ-069 | `8XY1` | Default value only in P1 — see F-12. |
| REQ-070 | `8XY2` | Default value only — F-12. |
| REQ-071 | `8XY3` | Default value only — F-12. |
| REQ-072 | `8XY4` | X = Y corner is legal and defined (doubling with carry). |
| REQ-073 | `8XY5` | "**not** the borrow" is called out; X = Y gives 0 with VF = 1. |
| REQ-074 | `8XY6` | Source-before-shift for VF is unambiguous under both parameter values. X = Y = `0xF` is the sharpest corner and is fully determined by REQ-085. |
| REQ-075 | `8XY7` | |
| REQ-076 | `8XYE` | |
| REQ-077 | `9XY0` | |
| REQ-078 | `ANNN` | |
| REQ-079 | `BNNN` | The `JUMP_VX` reading is stated in a way that survives a careless read ("the same 12 bits, with the register selected by them rather than V0"). Only the default is exercised in P1 — F-12. |
| REQ-080 | `CXNN` | Fully modelable because §6.5 specifies the sequence, not a circuit. This is the difference between a verifiable RNG and an unverifiable one. |
| REQ-081 | `FX1E` | |
| REQ-082 | `FX33` | The ascending-order clause needs M01 — see REQ-025. |
| REQ-083 | `FX55` | X = 0 transfers one register, X = `0xF` sixteen; stated explicitly, which removes the off-by-one every implementer meets here. |
| REQ-084 | `FX65` | |
| REQ-085 | **the priority target** | "When X = `0xF`, the final content of VF is the flag, not the arithmetic result." The spec's own assessment — "the P1 requirement most likely to be implemented wrongly and silently" — is correct, and REQ-122 class 2 already binds the stimulus. |
| REQ-086 | skips constant-time | Directly measurable as equal retire-to-retire intervals for taken and untaken. |
| REQ-087 | VF closure | A negative universal, but over a **finite enumerated set** (the 25 forms), so unlike REQ-013 it is genuinely testable. |

### 4.5 Quirk parameters — REQ-090 … REQ-096

| REQ | Grade | Note |
|---|---|---|
| REQ-090 | **T-c** | Default `SHIFT_SRC_VY` is T. The alternate value is **unverifiable in P1** and REQ-095 forbids testing it. **F-12 / A-6** |
| REQ-091 | **T-c** | As above (`JUMP_VX`). |
| REQ-092 | **T-c** | As above — and this one has **two** untested alternates (`MEMI_INC_X`, `MEMI_UNCHANGED`). |
| REQ-093 | **T-c** | As above (`QUIRK_VF_RESET = 0`). |
| REQ-094 | **T-c** | As above (`QUIRK_I_OVERFLOW_VF = 1`). |
| REQ-095 | **N** | It is a scope statement about DV's campaign, and it is the clause A-6 amends. |
| REQ-096 | **N** | Structural (no run-time control path exists to test). |

The architect's argument for carrying five parameters rather than the three
WO-0002 named is correct and I endorse it: README is canonical over a packet's
enumeration of it, `QUIRK_VF_RESET` changes the observable result of three of
the most common instructions in the set, and a three-valued
`QUIRK_MEM_I_MODE` is the right call — a boolean would have made the third
community behaviour unreachable without a spec diff.

### 4.6 Structure, observation, package — REQ-100 … REQ-114

| REQ | Grade | Note |
|---|---|---|
| REQ-100 | **N** | Inventory. Machine-checkable cheaply (module presence + instantiation) — recommend it become a CI check rather than an unattributed "inspection". **F-6** |
| REQ-101 | **N** | Structural, and honestly graded `S`. The port list *is* the proof. |
| REQ-102 | T | M02 standalone. One-cycle latency, the hold behaviour, and the no-write-through case. |
| REQ-103 | T | M04 standalone and via `obs_rng`. The recurrence is exactly specified; `RNG_POLY = 16'hB400` with the stated right-shift/XOR form is a standard maximal-length 16-bit form, and the non-zero seed constraint is stated with its reason. |
| REQ-104 | T | M04 + M03. "Advances **only** on `CXNN`" is a strong negative claim and it is checkable: `obs_rng` must be bit-identical across any instruction stream containing no `CXNN`, across halts, and across reset. |
| REQ-105 | T | The bit mappings are directly testable; §10 grades them `S + I`. **F-8** |
| REQ-106 | T | At M01, where the memory port survives `OBS_ENABLE = 0` as a comparison channel. Not testable at M03, where the parameter removes every observable — see F-7. |
| REQ-107 | **N** | Inspection of an RTL file. **Performer unnamed.** If it is me, it is an RTL review my charter forbids. **F-6** |
| REQ-108 | **N** | Same. Partly machine-checkable (the package must contain no `module`, no procedural block, no classifying function). The *reason* given for REQ-108 is the sharpest independence argument in the document and I endorse it without reservation: a shared decode function would make the RTL and the bench agree about decode **by construction**, and the decode requirements would be untested in exactly the way L-D16 describes. |
| REQ-109 | **N** + amendment | Unsatisfiable across the SV/Python boundary as written. **F-10 / A-5** |
| REQ-110 | T | And this is where **L-D16 is satisfied rather than violated**: all six `err_e` members get a producing test — `ERR_NONE` as the idle value, the two decode codes from the §6 sweep, the three runtime codes from directed vectors. No member of this enumeration is unreachable. |
| REQ-111 | **N** | `THROTTLE_DIV = 0`; back-to-back issue is observable through REQ-028. The forward constraint on P3's insertion point is exactly the right thing to freeze now. |
| REQ-112 | **N** | Machine-checkable by parsing module headers. **F-6** |
| REQ-113 | T | At M01 (memory-port and memory-image comparison with `OBS_ENABLE` 0 vs 1). **Not** testable at M03: the parameter zeroes every channel through which its own claim could be observed. §10 grades it `D`, which at M03 is impossible. **F-7** |
| REQ-114 | **T-c / NO-VERDICT** | The contract is right and the reasoning is right — constraining exactly one internal name, so the bench depends on a specified observable rather than an implementation-derived path. Whether cocotb 1.9.2 can read a 4096-element unpacked array **in the Verilator lane** is unmeasured. **F-11, §11.** |

### 4.7 Verification interface — REQ-120 … REQ-124

| REQ | Grade | Note |
|---|---|---|
| REQ-120 | **N** | Satisfied by construction if REQ-114 is; conditional on F-11. |
| REQ-121 | T | |
| REQ-122 | **N** | A requirement on **me**. I accept all nine stimulus classes as binding and will map every one onto rows of `test/attack_plans/AP-chip8_cpu.md` in the P1 build packet. Class 7's "at least one from each illegal region" is **superseded upward** by §6's exhaustive commitment, not downward. |
| REQ-123 | **T-c** | Determinism is testable (run twice; run in both lanes) but the **comparison domain is undefined**, and §7.4 deliberately creates don't-care windows that a literal reading of REQ-123 would treat as deterministic. **F-9 / A-4** |
| REQ-124 | **N** | Depends on D-1. §10 is authoritative today, which is the right disposition. |

---

## 5. OQ-1 adjudicated — a deferred opcode **HALTS**

**Ruling: HALT is upheld. `DC_DEFERRED` and `DC_ILLEGAL` remain distinct
classes with distinct error codes. REQ-042 stands as written.**

The spec routed this to DV because it is a verification-strategy question, so
it is decided on testability grounds only. Five reasons, strongest first.

**1. A no-op manufactures false parity, and false parity is the one failure a
lockstep bench cannot detect.** The stated benefit of no-op is that
"partially-covered programs can run further in P1". But a program that no-ops
through `DXYN` computes *wrong* results — no framebuffer, no collision, so VF
is wrong from that instruction onward. The golden model, being derived from
the same specification, no-ops identically and agrees. The bench would then be
green over a machine that is not CHIP-8, and the agreement carries no
information. Under halt, the phase boundary is a hard stop that **cannot be
silently traversed**. This alone decides it.

**2. The benefit has no consumer in P1.** §8 states plainly: *"No CHIP-8 ROM is
executed in P1"*, and REQ-122 class 8 generates constrained-random streams
**over the implemented forms**. The filter that would make a no-op useful
already exists, deliberately. There is no P1 stimulus that a no-op lets run
further.

**3. No-op deletes the very distinction the question asks to preserve.** The
proposal keeps `DC_ILLEGAL` halting and makes `DC_DEFERRED` a no-op. Then
`ERR_DEFERRED_OPCODE` has **no producer anywhere in P1** — a member of a
frozen enumeration that no test can reach (**L-D16**, and the mirror image of
REQ-110's current good standing). And at the observable level "deferred" becomes
indistinguishable from "implemented with no architectural effect", which is
precisely the discrimination REQ-042's second sentence exists to buy.

**4. Halt is a positive observable; no-op is a negative one.** Halt asserts
three things at once — `obs_halted`, a specific `obs_err`, and `obs_instr` /
`obs_instr_addr` frozen on the offender (REQ-049). A no-op asserts only that
*nothing changed except PC+2*, which is also what a decoder that has forgotten
how to decode produces. The silently-always-pass class (PROTOCOL §10, **L-D11**)
has a concrete instance here: a decoder that classifies **everything**
deferred passes every no-op test over the deferred and illegal space and fails
only on the implemented space. The same broken decoder under halt stops on the
first instruction of every test, loudly.

**5. Halt gives the bench a well-defined end-of-test event.** P1 has no `HALT`
instruction and no other terminator. Under halt-on-fault, a synthetic program
ends with an illegal encoding — and with `MEM_INIT_FILE = ""` giving all-zero
memory, `0x0000` is already that terminator (REQ-043). Under no-op the bench
must count instructions instead, which couples every test to a magic number.

**The strongest argument on the losing side, stated rather than omitted.**
Because halt is terminal, the decode sweep of §6 needs one reset per encoding
and cannot chain encodings in a single run. A no-op would let a single program
walk thousands of deferred encodings per run. That is a real throughput cost of
this ruling and I am paying it knowingly: §6 shows the sweep is affordable
anyway (≈ 8 cycles per encoding), whereas the cost of no-op — agreement
between two models that are both wrong — is not payable at any price.

### 5.1 What I owe in return for this ruling

A ruling that hardens a fault path obliges me to prove the fault path is
actually checked:

- **Both codes tested positively, in one test.** At least one `DC_DEFERRED`
  encoding from P2 and one from P3 yielding `ERR_DEFERRED_OPCODE`, and at least
  one `DC_ILLEGAL` encoding from each of the six illegal regions yielding
  `ERR_ILLEGAL_OPCODE`, with the two codes asserted **different** — never
  asserted only as "halted".
- **Forward commitment on the mutation campaign** (stated as a forward
  commitment, redeemed by the commit that freezes the seal — PROTOCOL §10
  R-SEAL-1's first exclusion; **I hold no sealed prediction today and claim
  none**): the P1 campaign brief will carry, among its REQUIRED cells, a mutant
  that collapses `ERR_DEFERRED_OPCODE` into `ERR_ILLEGAL_OPCODE`, and a mutant
  that classifies the entire space as one class. Both must be killed in named
  rows with named messages.
- **A forward hazard the spec should record now, in D-5.** When P2 and P3
  implement these encodings, every P1 test asserting "`DXYN` halts with
  `ERR_DEFERRED_OPCODE`" becomes **false**, and someone under deadline will be
  tempted to quietly relax it. D-5 already says the change is "a spec diff plus
  an ADR, never an edit"; I ask that the ADR be required to **enumerate the P1
  tests it invalidates**, so the retirement is an authorised act with a paper
  trail rather than a test edit inside a P2 commit. This is a non-blocking
  recommendation.

---

## 6. The decode partition: can a bench cover 21582 illegal encodings?

### 6.1 The arithmetic, independently re-derived

The spec derives its totals row-by-row per high nibble. I re-derived them by a
**different decomposition** — complement counting within each nibble — so the
confirmation is not a re-addition of the same columns (provenance **derived**;
the derivation is below):

| Class | Derivation | Total |
|---|---|---|
| `DC_IMPLEMENTED` | 1 + (9 × 4096) + 256 + 256 + (9 × 256) + (4 × 16) | **39745** |
| `DC_DEFERRED` | 1 + 4096 + (2 × 16) + 16 + (4 × 16) | **4209** |
| `DC_ILLEGAL` | (4096−2) + (15×256) + (7×256) + (15×256) + (256−2)×16 + (256−9)×16 | **21582** |

= 4094 + 3840 + 1792 + 3840 + 4064 + 3952 = 21582, and
39745 + 4209 + 21582 = **65536**. The partition is exhaustive and disjoint, and
the 25 + 3 + 6 + 1 = 35 instruction-form reconciliation holds. **Confirmed.**

### 6.2 The answer: exhaustive, not sampled — and *why* it is affordable

**Sampling is not the only practical answer, and I commit to exhaustive
classification coverage of all 65536 encodings, not merely the 21582.**

The reason is a structural property of this specification that is worth naming,
because it does not generalise and the freeze should be taken knowing it:

> **The specified behaviour of an illegal or deferred encoding is
> state-independent.** Classification is a pure function of 16 bits (REQ-040),
> and the entire specified response is a fixed triple — halt, a named code, and
> no architectural change (REQ-041, REQ-042). There is no operand, no register,
> no memory content that can alter it.

That makes the illegal space **the one part of P1 where exhaustive coverage is
also complete coverage**. Contrast the implemented space: the behaviour of an
implemented encoding is a function of encoding **×** architectural state, and
that cross-product is not enumerable at any budget. So:

| Space | Classification coverage | Semantic coverage |
|---|---|---|
| 21582 illegal | **exhaustive** | **exhaustive** (classification *is* the semantics) |
| 4209 deferred | **exhaustive** | **exhaustive** (same) |
| 39745 implemented | **exhaustive** | **sampled** — directed corners (REQ-122 classes 2–6) + constrained-random, at a transaction count I fix and freeze as the campaign denominator (**L-C08**) |

**The cost, derived** (the derivation is §7.1's fault rows plus §7.5's reset
rule plus REQ-009): a decode fault costs 3 cycles and is terminal, reset takes
one cycle, and **memory survives reset (REQ-009)** — so the per-encoding loop is
*write two bytes, pulse reset, run ~4 cycles, sample `obs_halted`/`obs_err`/the
bundle*, with **no image reload and no recompilation**. That is ≈ 8 clock cycles
per encoding: ≈ 1.7 × 10⁵ cycles for the illegal space alone, ≈ 5.2 × 10⁵ cycles
for the entire 16-bit space. In simulator terms this is nothing.

**What is NOT derived, and I will not claim it is** (**L-B01**, **L-D04**): the
binding cost is not simulator cycles but the ~13 cocotb VPI round trips per
encoding, ≈ 8.5 × 10⁵ for the full space. I have measured nothing. That figure
is **NO-VERDICT until spiked**, in the same shape ADR-0017 A2 retired R1 —
measurement, not argument. The spike is one iteration of the loop, timed, in
both lanes.

### 6.3 The fact the freeze should be taken with

Even if the sweep proved unaffordable, **uniform sampling of the illegal space
would be close to worthless**, and this is the part I most want on the record
before the freeze rather than discovered inside P1's bench.

All 21582 illegal encodings produce **the same** observable. The information is
not in the encodings; it is entirely in the **class boundaries**, and the
boundaries are thin:

| Boundary | Encodings that decide it |
|---|---|
| `00E0` / `00EE` against all other `0NNN` | `00DF`/`00E0`/`00E1`, `00ED`/`00EE`/`00EF` — **and `0NE0`/`0NEE` for N ≠ 0** (30 encodings), which is where a decoder that matches on the low byte alone fails |
| `5XY0` against `5XYn≠0` | the n nibble |
| `8XY7` / `8XY8`, `8XYE` / `8XYF` | adjacent implemented/illegal pairs |
| `9XY0` against `9XYn≠0` | the n nibble |
| `EX9E`/`EXA1` against 254 other `EXnn` bytes | the nn byte |
| the nine valid `FXnn` bytes against 247 others | the nn byte |

A uniform random sample over 21582 encodings hits the 30-encoding `0NE0`/`0NEE`
trap with probability ≈ 0.0014 per draw. A boundary-directed sample of a few
hundred encodings is worth more than a uniform sample of ten thousand. So the
committed strategy is: **exhaustive**, and if the spike forces a retreat, the
fallback is **exhaustive in the fast lane, boundary-directed-stratified in the
slow one, with the stratification stated and frozen** — never "sampling"
unqualified.

### 6.4 Three commitments that go with it

- **Two states, not one.** The sweep from reset exercises each encoding in
  exactly one architectural state and at one PC. It runs a second time after a
  short random prologue and at a second PC, so a classifier that is
  state- or address-dependent cannot hide.
- **The sweep proves it can fail before it is allowed to report green**
  (**L-D11**): a deliberately mis-classified entry injected into the *model's*
  classification table must turn the sweep red, run as the sweep's own
  precondition.
- **The classifier's anchor.** My model's classifier is derived from §6.3,
  which is the same source the RTL derives from — so the two would agree about
  any error in §6.3 (this is OQ-3's structure, generalised). The one
  independent check available is arithmetic: enumerating my classifier over all
  65536 encodings must reproduce **39745 / 4209 / 21582 exactly**. §6.3's row
  totals therefore function as a genuine external constraint on the model, and
  that check runs before the model judges anything.

---

## 7. Findings

Severity: **MAJOR** — would corrupt a verdict or block a check · **MINOR** —
costs correctness of a record, not of a verdict.
Class: **BLOCKING** — the frozen text must change · **CARRIED** — resolvable
inside P1 with no spec change · **ESCALATION** — not a spec defect.

| # | Sev | Class | Finding |
|---|---|---|---|
| **F-1** | MAJOR | CARRIED | **Nine REQs assert memory-port behaviour that is invisible at the DUT §4.0 names.** REQ-001, 021, 022, 023, 024, 025, 026, 030, 102. §10 gives five of them the hook `R`, and a full-state compare at `obs_retire` cannot observe per-cycle port activity — REQ-030 ("the memory port idles") and REQ-082's ascending-order clause have **no** observation point at M03 at all. No spec change needed: I bench M01, M02 and M04 at their own boundaries. **What is owed is a correction to §10's hook column**, so the traceability matrix does not record checks that cannot perform their observation. |
| **F-2** | MAJOR | **BLOCKING** | **§4.A hard-codes widths §5.1 derives from an overridable parameter.** `obs_sp` = 5 and `obs_stack` = 192 are true only at `STACK_DEPTH = 16`, while §5.1 declares `SP_W` derived and `STACK_DEPTH` overridable across 2…16 *with a stated verification reason*. REQ-008's reset table repeats it (`stack[0]…stack[15]`). Two clauses of a frozen normative interface would contradict each other. → **A-1** |
| **F-3** | MINOR | **BLOCKING** | **§5.5's enums carry no base type.** An untyped SV enum is `int`-based; `obs_err` is a 4-bit port. §5.5 is the normative single definition site whose entire purpose is preventing silent drift — it closes value drift and leaves **type** drift open. → **A-1** |
| **F-4** | MAJOR | **BLOCKING** | **M02 has no reset and no specified power-up value for its read-data path**, so REQ-008's "every bit is given an explicit reset value" and REQ-123's "no uninitialised storage … anywhere in P1" are both false as written. It bites precisely where §3 says it must not: Icarus reads `x`, Verilator reads `0`, and the two lanes are required to agree. → **A-2** |
| **F-5** | MAJOR | **BLOCKING** | **No test can put a program into the DUT.** §5.4 says "Every test sets `MEM_INIT_FILE`"; §5 puts it in a **package**; §4.3 declares no configuration inputs; §4.C lists no parameters. A package parameter is not overridable at elaboration under this lane (provenance ***relayed*** — Verilator `-G` and Icarus `-P` override *top-level module* parameters, and cocotb's runner `parameters=` maps to those flags; **owed a measured check in the same spike as §6.2**), and `rtl/chip8_pkg.sv` is outside DV's write scope, so DV cannot regenerate it either. This blocks **every test in P1**. → **A-3** |
| **F-6** | MINOR | CARRIED | **Fifteen REQs carry an "inspection" hook with no named performer**, and for REQ-100/107/108/109/112 the object of inspection is **RTL** — which, if the performer is me, is the RTL review my charter forbids. Several are cheaply machine-checkable (module inventory, port closure, "the package contains no behaviour"). Recommend: name rtl_lead as performer with auditor sampling, and convert what can be converted into CI checks. This is a governance recommendation to the orchestrator, not a spec defect. |
| **F-7** | MINOR | CARRIED | **REQ-113 removes the observables through which it could be checked.** `OBS_ENABLE = 0` zeroes every `obs_*` output, then asks a bench to confirm "architectural behaviour is unchanged". At M03 that is impossible; at M01 it is testable through the memory port and the memory image. Hook correction, not a spec change. |
| **F-8** | MINOR | CARRIED | **REQ-105's bit mappings carry no executable hook** (`S + I`), yet `obs_v[8*k +: 8]` and `obs_stack[12*k +: 12]` are directly testable. A reversed packing is invisible while every register holds its reset value — so the directed vector must leave all sixteen registers **distinct** before sampling (**L-D16**). Covered in practice by the random campaign; the hook column understates it. |
| **F-9** | MAJOR | **BLOCKING** | **REQ-123 asserts cycle-by-cycle determinism while §7.4 creates don't-care windows.** §7.4 explicitly frees an implementation to drive *any* value on `mem_addr`/`mem_we`/`mem_wdata` when `mem_en` is low, and declares `mem_rdata` uninformative outside its window. A literal REQ-123 makes those cycles comparable; a lane-to-lane comparison over them false-fails, and the repair everybody reaches for at that point is to narrow the compare inside the bench until it goes green — undocumented, unreviewed. **The comparison domain belongs in the frozen spec, not in a bench.** → **A-4** |
| **F-10** | MAJOR | **BLOCKING** | **REQ-109's single-definition-site rule cannot cross the language boundary, and as written it forbids the derivation DV should make.** The entire testbench and golden model are Python (ADR-0017 Lane A); Python cannot import a SystemVerilog package. REQ-109 says a duplicate of any package value "anywhere else is a defect", which makes my model's constants a defect by construction. The correct resolution is not an extractor that puts an RTL file on DV's critical path — it is to scope REQ-109 to the SV side and state that the Python side derives from **§5.5 of this specification**. A second derivation from the same normative source preserves spec-derivation independence, and any drift between the two **fails a test** rather than passing silently. → **A-5** |
| **F-11** | MAJOR | ESCALATION | **P1 has no external anchor available, and my charter forbids a golden model judging RTL without one.** Charter §3 and PROTOCOL §10: "a golden model must agree with an external reference implementation on a shared scenario suite **before** it may judge RTL". But every CHIP-8 reference recorded at the B3 intake is **consult-only**, the independence rider bars deriving the model from any existing interpreter, and the three free-use artifacts are *test ROMs* — which §8 correctly states P1 never executes, because they all reach a `DXYN` within a few instructions. **So P1 as constituted is a self-consistency check between two artifacts derived from one document, with no external truth anywhere in it.** OQ-3 says this of the quirk defaults; it is true of the whole phase. Not a spec defect and **not freeze-blocking** — but it must be settled before `P1-module-ready`, and it is on the board now rather than discovered at the sign-off. Options in §10. |
| **F-12** | MAJOR | **BLOCKING** | **Six declared parameter values are unverifiable in P1, and REQ-095 forbids the cheapest check that they exist at all.** REQ-090…094 declare six alternate values; REQ-095 confines P1 to the default configuration. An implementation that **hard-codes the VIP behaviour and ignores all five parameters passes every P1 test**, and the defect surfaces three phases later in P4 — inside the campaign that was supposed to *use* them. This is L-D16 exactly, the lesson this repository itself minted at G0. The fix is six one-instruction directed vectors whose expected results §6.4 already states in full. → **A-6** |
| **F-13** | MINOR | CARRIED | Editorial. (a) §2 cites "the 25 instruction forms listed in §6.4.1"; they span §6.4.1–§6.4.3. (b) §7.1 defines latency between two `S_FETCH_HI` events, neither observable; the observable equivalent is retire-to-retire, derivable via REQ-029 but worth stating at §7.1 so a bench author is not left to find it. |

---

## 8. The amendments — exact text, so this costs one pass

### A-1 — parameterized widths and typed enums (F-2, F-3)

In §4.A, §4.B and §4.D replace the literal width column entries with their
parameter expressions: `mem_addr`/`obs_pc`/`obs_i`/`obs_instr_addr`/`addr` →
`ADDR_W`; `mem_wdata`/`mem_rdata`/`wdata`/`rdata`/`rnd` → `DATA_W`;
`obs_instr` → `INSTR_W`; `obs_v` → `NUM_V*DATA_W`; `obs_rng`/`state` →
`RNG_W`; **`obs_sp` → `SP_W`**; **`obs_stack` → `ADDR_W*STACK_DEPTH`**;
`obs_err` → `$bits(err_e)`.

In REQ-008's reset table, `stack[0]…stack[15]` becomes
`stack[0]…stack[STACK_DEPTH−1]`.

In §5.5, give every enumeration an explicit base type, and add the sentence:
*"Every enumeration in this package declares an explicit packed base type;
`err_e` is `logic [3:0]`, `dclass_e` and `quirk_memi_e` are `logic [1:0]`,
`quirk_shift_e` and `quirk_jump_e` are `logic`. An untyped enumeration is
`int`-based and would defeat this package's purpose on the very ports that
carry its values."*

### A-2 — M02's power-up value (F-4)

Add to §4.B, beneath the port table: *"M02 holds exactly two pieces of state:
the `mem` array (REQ-014) and the register implied by the one-cycle read
latency. That register SHALL hold `8'h00` from time zero until the first
enabled read completes. M02 has no reset port and needs none — this sentence
is what makes the four-state and two-state lanes agree at time zero (REQ-123),
and without it the two lanes disagree by construction."*

Narrow REQ-008's closing sentence from "Every bit is given an explicit reset
value" to "Every bit of the architectural state tabulated above is given an
explicit reset value; M02's two elements are covered by REQ-014 and §4.B."

### A-3 — the elaboration-time override path (F-5)

Add as **REQ-115** in §5, and reference it from §4.3 and §4.C:

> **REQ-115 — the override path.** M02 and M03 SHALL each declare, as **module
> parameters**, every value a test overrides — `MEM_INIT_FILE`, `RNG_SEED`,
> `OBS_ENABLE`, `STACK_DEPTH`, `PROG_START`, and the five quirk parameters of
> §5.2 — each **defaulting to its `chip8_pkg` value** and passed down to
> submodules unmodified. This is the only mechanism by which a test configures
> the machine, it is elaboration-time, and it adds no port and no run-time
> control path, so §4.3 and REQ-096 are unaffected. A package parameter cannot
> be overridden at elaboration in this toolchain, and the package file is
> outside the DV write scope, so without this clause no test can place a
> program in memory.

§4.3's heading sentence becomes: *"**None** — no configuration reaches this
design through a port. Elaboration-time parameter overrides are REQ-115."*

### A-4 — the comparison domain (F-9)

Append to REQ-123:

> **The compared domain.** REQ-123's determinism is asserted over a named set
> of observables and no others: the `obs_*` bundle in every cycle; the `mem`
> array; `mem_en` in every cycle; `mem_we`, `mem_addr` and `mem_wdata` in
> cycles where `mem_en` is high; and `mem_rdata` in cycles following an
> enabled read. §7.4 makes every other signal-cycle a don't-care, and a
> don't-care is **excluded** from every comparison this program performs —
> including a comparison between the two simulator lanes. Naming the domain
> here rather than in a bench is deliberate: a comparison domain narrowed
> inside a testbench to stop a false failure is a narrowing nobody reviews.

### A-5 — REQ-109 across the language boundary (F-10)

Append to REQ-109:

> **Scope.** This rule binds the SystemVerilog side of the program: the RTL and
> any SystemVerilog testbench component reference `chip8_pkg` and never restate
> its values. The Python golden model and the cocotb testbench derive their
> constants from **§5.5 of this specification** instead. That second derivation
> from the same normative source is deliberate and is not a defect: it keeps
> the DV lane's derivation basis the specification rather than an RTL file
> (PROTOCOL §10), and a drift between the two derivations **fails a test**
> rather than passing silently — which is the outcome REQ-109 exists to
> produce.

### A-6 — the parameter-wiring vectors (F-12)

Replace REQ-095's second clause:

> **REQ-095.** All quirk parameters default to 1977 COSMAC VIP semantics. P1's
> functional coverage — directed corners, random streams, lockstep parity —
> runs the **default configuration only**; the compatibility campaign is P4.
> P1 additionally runs **one directed vector per non-default parameter value**
> — six vectors: `SHIFT_SRC_VX`, `JUMP_VX`, `MEMI_INC_X`, `MEMI_UNCHANGED`,
> `QUIRK_VF_RESET = 0`, `QUIRK_I_OVERFLOW_VF = 1` — whose sole purpose is to
> prove each parameter is **connected**. Their expected results are already
> stated in full in §6.4. Without them an implementation that hard-codes the
> default behaviour and ignores all five parameters passes every P1 test, and
> the omission surfaces in P4 inside the campaign that depends on them.

---

## 9. What I will need that does not exist yet

| # | Needed | Owner | Blocks | Notes |
|---|---|---|---|---|
| 1 | **A-3's parameter override path** | architect (spec) → rtl_lead (RTL) | every P1 test | The one item that blocks *everything*. |
| 2 | **M01, M02, M03, M04 themselves** | rtl_lead | benches, not the freeze | |
| 3 | **`rtl/chip8_pkg.sv`** (D-3) | rtl_lead | the **RTL**, not my bench | The work order records this as on my critical path. **With A-5 it is not.** My model and bench derive constants from §5.5, so the package sits entirely on the SV side and DV need not read it before any verdict — which keeps the independence declaration in §1 true for the whole phase instead of one packet. This is the reason A-5 is worth its two sentences. |
| 4 | **The Verilator hierarchical-access measurement** (F-11 / REQ-114) | dv_lead spike | the memory half of the per-instruction compare in one lane | §11. |
| 5 | **The cocotb sweep-throughput measurement** (§6.2) | dv_lead spike | the exhaustive-vs-stratified decision | §11. |
| 6 | **An external anchor decision** (F-11) | orchestrator → sponsor, E3-shaped | `P1-module-ready`, not the freeze | §10. |
| 7 | **CI source-guard de-gating** | orchestrator | first bench landing | `build.yml`'s guard is deleted *in the same commit* that lands the first `rtl/` module **and** the first `test/` bench. That couples rtl_lead's first delivery and my first bench into one commit boundary — a sequencing constraint the P1 build work orders must respect, not discover. |
| 8 | ADR-0018 (D-2), traceability matrix (D-1) | architect_docs_lead | D-2 blocks the freeze; D-1 does not | §10 of the spec is authoritative today, which is the right disposition. |

---

## 10. The standing limitation: P1 verifies itself against itself

This is the finding I most want the sponsor to have **before** signing the
freeze, because it is not repairable by any amendment and it changes what a P1
PASS means.

Both artifacts that P1 compares — the RTL and the Python golden model — are
derived from this one specification, by intake decision (the B3 independence
rider, which is correct and which I endorse). Every CHIP-8 reference is
**consult-only**. The free-use test ROMs cannot run in P1. Therefore:

> **A P1 lockstep PASS proves the RTL implements this specification. It proves
> nothing about whether this specification describes CHIP-8.**

The spec says this of the five quirk defaults (OQ-3, which is the sharpest
paragraph in the document and is the architect's own finding). It is true of
the entire phase — of the RNG sequence, the fault semantics, the decode
partition, the cycle counts, every one of the 25 instruction semantics.

What that costs, and what carries the weight instead:

1. **The mutation campaign is not optional colour; it is the only thing that
   qualifies the instrument** (PROTOCOL §10, **L-D11**). Its owed
   silently-always-pass class matters more here than in a program with an
   external oracle.
2. **P4's community test-ROM campaign is the first external truth this program
   ever touches.** OQ-3 names it as the compensating control for the quirk
   defaults; it is in fact the compensating control for all of P1.
3. **Charter §3's anchor-before-judge rule has no satisfying anchor in P1** as
   the intake stands. I do not propose to waive it silently. The options, for
   the orchestrator to route:
   - **(a)** Add **one free-use-licensed CHIP-8 reference implementation** to
     the B3 intake list, used *solely* as a differential oracle for the
     non-draw subset and never read while authoring the model. This is a real
     external anchor and it is cheap. It is an intake/licensing change —
     **E3**-shaped.
   - **(b)** Anchor the model **piecewise** against non-CHIP-8 external truth:
     the LFSR sequence (REQ-103) against an independent implementation of the
     same recurrence; BCD against ordinary integer arithmetic; the decode
     classifier against §6.3's row totals (§6.4 above). Partial, but real, and
     available with no intake change.
   - **(c)** Declare **NO-ANCHOR for P1** explicitly, with (b) as partial cover
     and P4 as the compensating control, recorded in every P1 `SO-` packet as a
     stated limitation rather than an omission (**L-D04** — a lane that did not
     reach a verdict is never reported as one that passed).

   My recommendation is **(a) plus (b)**, with **(c)** as the honest fallback.
   None of this blocks the freeze; all of it must be settled before the first
   `SO-` PASS.

---

## 11. NO-VERDICT register (L-D04) and provenance summary (L-B01)

Things I could not settle, recorded as their own class rather than folded into
either a pass or a fail:

| # | Question | Why no verdict | Discharged by |
|---|---|---|---|
| NV-1 | Can cocotb 1.9.2 read M02's 4096-element `mem` array **in the Verilator lane**? | Not measured. Verilator exposes only public signals through VPI; the specification requires no public marking, and REQ-114 is the memory half of the per-instruction full-state compare README's P1 criterion demands. **If the answer is no**, the Verilator lane cannot perform the memory compare per-instruction. A fallback exists and is strong — memory changes only via `FX33`/`FX55`, whose effects are fully predicted by the model from I and V, so a shadow image detects every divergence and only *localisation* is deferred to an end-of-test readback (which is available in-band via `FX65`, needing no handle at all). But that fallback **narrows a signed success criterion**, so it is the orchestrator's call, not mine. | A one-hour spike, before the first bench |
| NV-2 | Wall-clock cost of the 65536-encoding sweep per lane | Derived in cycles, unmeasured in seconds (§6.2) | Same spike |
| NV-3 | Can a package parameter be overridden at elaboration under Icarus/Verilator via cocotb's runner? | Stated ***relayed*** in F-5, from the documented behaviour of `-P`/`-G` and the runner's mapping onto them. I ran nothing. The amendment A-3 is correct either way — it removes the dependency on the answer — but the claim itself is a relay and is labelled as one. | Same spike |

**Provenance of every quantity in this report**: the REQ counts (90; 68/8/14),
the port counts (19/6/5), the decode totals (39745/4209/21582/65536), the
sweep's cycle cost (≈ 8 per encoding, ≈ 5.2 × 10⁵ total), and the boundary
count (30 encodings in the `0NE0`/`0NEE` trap) are all **derived**, and each
derivation is shown at its site. The toolchain facts (cocotb 1.9.2, Verilator
5.020, Icarus 12.0) are **relayed** from `TOOLCHAIN.md`, `requirements.txt` and
ADR-0017 A2. **Nothing in this report is measured**, because nothing was run —
there is no RTL and no bench to run.

---

## 12. Freeze-record rows this report fills

For §12 of the specification, when the amended revision is countersigned:

| Item | Value |
|---|---|
| Interface check | **Fallback regime** (ADR-0017 Consequence 1): reviewed port tables §4.A–§4.D, graded line by line at `docs/reports/dv/DV-P1-testability.md` §3 — 30 distinct ports (M01 19, M02 6, M04 5) plus M03's `clk`, `rst_n` and pass-through bundle; four defects found (F-2, F-3, F-4, F-5), all in the width and parameter columns, none in the direction or meaning columns. There is no compile-check CI run for this program and none is owed. |
| dv_lead testability countersignature | **Withheld at `54a7221`.** Issues as `J-dv_lead-0002` against the revision carrying A-1 … A-6. |

Spec §11's **D-6** row (dv_lead, closes at `P1-spec-freeze`) is answered by this
report and stays open until that second entry.
