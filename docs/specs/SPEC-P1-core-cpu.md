# SPEC-P1 — CHIP-8 core CPU (Phase 1)

- **Status**: **DRAFT** — not yet frozen. Freeze gate: `P1-spec-freeze`
  (see §12, empty until the gate).
- **Inventory id**: P1 architecture inventory **M01–M04** (§4.0) · **Paths**:
  `rtl/chip8_cpu.sv`, `rtl/chip8_ram.sv`, `rtl/chip8_core_top.sv`,
  `rtl/chip8_rng.sv`, `rtl/chip8_pkg.sv` — proposed; `rtl/**` is outside this
  author's write scope (PROTOCOL §6) and the files are created by `rtl_lead`.
- **Datapath role**: the whole of P1 — instruction fetch, decode, execute, and
  the single-port memory they run against. Upstream of P1 there is nothing;
  downstream are P2's draw path and P3's I/O, both of which attach to the
  interfaces frozen here.
- **Owns REQs**: REQ-001 … REQ-124 (the complete registry is §10; ids are
  allocated in blocks and the gaps between blocks are deliberate reserve —
  **no id inside a gap has ever existed**, so a later in-block insertion never
  renumbers a cited id).
- **Prior-art counterpart**: the intake-recorded **consult-only** references
  (`tasks/BOARD.md`, B3): Cowgod's CHIP-8 Technical Reference v1.0; Matthew
  Mikolay's CHIP-8 reference; Tobias Langhoff's emulator guide; Octo / John
  Earnest's quirk tables; COSMAC VIP and RCA 1802 material. Consulted for
  **design study only**. No source, no table, and no distinctive structure was
  copied from any of them into this document, and **no external document was
  retrieved during its authorship** — the Inputs list of
  `J-architect_docs_lead-0001` is the complete set of documents read. The
  CHIP-8 behavioural facts stated below therefore carry provenance class
  **relayed** (PROTOCOL §10, L-B01); §11 OQ-3 states what that costs and where
  it is repaid. For a consult-only reference this paragraph is load-bearing.
- **Depends on specs**: none. This is the program's first specification.
- **Author**: architect_docs_lead, journal `J-architect_docs_lead-0001`
  (WO-0002).

---

## 0. How this instantiates SPEC-TEMPLATE.md

`SPEC-TEMPLATE.md` is a **per-module** template written for
`docs/specs/modules/<module>.md`. WO-0002 orders a **phase** specification at
`docs/specs/SPEC-P1-core-cpu.md` covering P1's whole module inventory. The
adaptation is stated here rather than performed silently (template how-to-use
item 1):

- Every template section 1–13 is present, in order, with its template number.
- §4 (Interface) and §5 (Parameters) are instantiated **once per module** in
  the inventory, as §4.A–§4.D and one shared §5 (all parameters live in one
  package — §5.5 — by ADR-0017 Consequence 1's mitigation).
- §6.2 (State machine) is the single control FSM of M01; M02–M04 are
  combinational or trivially sequential and say so.
- Sections that do not apply are answered "not applicable" **with one sentence
  of why**, never deleted.
- The template's references to `docs/specs/requirements.md` are answered by
  **§10 of this document**, which is P1's authoritative REQ registry.
  `docs/specs/requirements.md` exists (§11 D-1, landed) and is the
  program-wide **index and traceability matrix** over that registry — it cites
  ids and carries the verification bookkeeping, and deliberately restates no
  requirement text.

**Interface regime**: **reviewed port tables** (ADR-0017 Consequence 1). There
is no compile-checked interface-record lane in this program. §4.1 states the
fallback verbatim; the §4.2-class port tables in §4.A–§4.D are the **normative
interface** and are graded line by line at the `dv_lead` countersignature.

---

## 1. Purpose

P1 turns a memory image into executed CHIP-8 instructions. It implements the
1977 CHIP-8 virtual machine's register file, index register, program counter,
call stack, and every instruction in the 35-instruction set that is neither a
draw-path instruction nor an I/O instruction — arithmetic, logic, conditional
skips, jumps, subroutine call and return, random number generation, and the
memory-transfer instructions.

It exists as a phase because it is the part of the machine that can be
verified against a reference model with no display, no keypad and no wall
clock: everything it does is a function of the memory image and the
architectural state, so a Python golden model can run beside it in lockstep
and compare the whole state after every instruction.

The structural fact that shapes the entire design is the **single-port
memory**: one access per clock cycle, and therefore no instruction completes
in one cycle. Every requirement about timing below descends from that one
constraint.

---

## 2. Scope

### In scope

- The 4096 × 8 single-port synchronous RAM and its access contract (§4.B).
- V0–VF, I, PC, the 16 × 12-bit call stack and SP (§6.1.1).
- The multicycle fetch / decode / execute FSM (§6.2).
- The 25 instruction forms listed in §6.4.1, with their effect on
  architectural state including VF.
- Classification of **all 65536** 16-bit encodings into implemented, deferred
  and illegal, and the machine's behaviour on the latter two (§6.3).
- The deterministic random source behind `CXNN` (§4.D, §6.5).
- The compile-time quirk parameters for the P1 instructions that have
  divergent community behaviours (§5.2).
- The architectural-state observation interface the lockstep campaign
  requires (§4.C).

### Not this module's job

| Behaviour a reader might expect here | Owner |
|---|---|
| `00E0` clear, `DXYN` draw, the framebuffer, the 64-bit barrel shifter, the font ROM **contents** and `FX29` | **P2** (README phase table) |
| `EX9E`, `EXA1`, `FX0A`, `FX07`, `FX15`, `FX18`, the 60 Hz delay and sound timers, the keypad | **P3** (README phase table) |
| The 500–1000 instructions/second issue throttle | **P3** — see §11 D-4 and OQ-2 |
| Quirk **test matrices** and alternate-configuration campaigns | **P4** (README phase table). P1 declares the parameters and defaults only |
| Synthesis, fmax, resource reports, the WebAssembly build | **P5** |
| The Python golden model, the lockstep harness, the stimulus generator | `dv_lead`. This document defines the observables they need (§4.C, §8); it does not define the bench |

---

## 3. Programme invariants that bind this module

`docs/specs/requirements.md` exists (§11 D-1, landed) but **mints no
requirement ids and holds no programme-invariant REQ block** — it is an index
over the per-spec registries, and creating programme-invariant ids would be a
scope act (E2), not a bookkeeping one. There is therefore still no
programme-invariant REQ registry to cite ids from. The binding programme-level
statements are therefore cited at their canonical home — **README.md's phase
table and the scope-parameter paragraph beneath it** (PROTOCOL §1) — and
`tasks/BOARD.md`'s intake decisions. Each line states what it forces here.

| Programme statement (canonical home) | What it forces in P1 |
|---|---|
| RAM 4096 × 8, single-port synchronous, **one access per cycle** (README scope parameters) | The FSM is multicycle by construction; §4.B exposes exactly one address, one write-enable and one data path, so a second concurrent access **cannot be expressed** in the interface (REQ-001, REQ-101) |
| Program load address `0x200`; font ROM 16 glyphs × 5 bytes at `0x000`–`0x04F` | The reset PC and the memory map, REQ-002 and REQ-008. P1 reserves the font region and does not populate it |
| V0–VF 16 × 8 with **VF as carry/borrow/collision flag**; I and PC 12 bit; stack 16 × 12 (parameterized) | The register model of §6.1.1, and the decision that the stack is a **dedicated array, not a region of RAM** (§6.4.4, REQ-006) |
| 35 instructions, fixed 2 bytes, big-endian | REQ-007, and the exhaustive 65536-encoding partition of §6.3 |
| Cycle budget: 3 cycles fetch-hi/fetch-lo/decode; ~4 cycles for a simple ALU instruction; 4 + (X+1) for `FX55`/`FX65` | The FSM state count and the cycle table of §7.1, which is checked against this budget line by line in §7.2 |
| Instruction issue rate 500–1000/s (throttled); nominal clock 12 MHz | The throttle is a real programme parameter; P1 declares `THROTTLE_DIV` and constrains where the mechanism may be inserted (REQ-111), and assigns the mechanism to P3 (§11 D-4, OQ-2) |
| P1 success criteria: lockstep parity, **full architectural-state compare after every instruction**, divergence reported at the instruction of first difference (README) | The observation interface of §4.C exists **because of this criterion**. It is derived from a signed success criterion, not added to scope: without it the bench must reach into implementation internals, which PROTOCOL §10 forbids |
| Independence rider (`tasks/BOARD.md`, B3): both the shipped RTL **and** the Python golden model are written from the specification, never ported from an existing interpreter | This document must stand alone as the sole derivation source for **two** independent implementations. Every behaviour below is stated in full, with no "see the reference" anywhere |
| Verilator is 2-state; Icarus is the 4-state authoritative lane (ADR-0017 context finding 2) | Every bit of architectural state has a **specified reset value** (REQ-008). Nothing is left uninitialized, because an uninitialized bit reads 0 in one lane and X in the other, and the two lanes must agree |
| ADR-0017 A2 §5 bench-authoring hazard: "how many edges does one model step correspond to?" | Answered normatively by the retire contract, REQ-029 — not left to the bench author |

---

## 4. Interface

### 4.0 Module inventory

| Id | Module | Role | Instantiated by |
|---|---|---|---|
| **M01** | `chip8_cpu` | Control FSM, decoder, register file, I, PC, stack, ALU. Contains M04. | M03 |
| **M02** | `chip8_ram` | 4096 × 8 single-port synchronous RAM with a construction-time image. | M03 |
| **M03** | `chip8_core_top` | Structural wrapper: M01 + M02 wired together; exposes clock, reset and the observation bundle. **This is the P1 DUT.** | the bench |
| **M04** | `chip8_rng` | The deterministic random source behind `CXNN`. | M01 |

**REQ-100 — the inventory.** P1's module inventory is exactly the four modules
above, with the instantiation relationships shown. Further decomposition
**inside** M01 (a separate decoder, a separate register file, a separate ALU)
is the `rtl_lead`'s to choose and is unconstrained by this specification,
provided M01's port table and the timing contract of §7
hold. The four boundaries above are not the `rtl_lead`'s to change: M02's
boundary carries the single-port invariant structurally, M03's boundary is
what the bench binds to, and M04's boundary is what makes the random sequence
independently modelable.

### 4.1 Interface records (toolchain slot — template how-to-use item 6)

> **Fallback regime per the M1 ADR** (ADR-0017 Consequence 1): the port tables
> in §4.A–§4.D are the normative interface, reviewed line-by-line at the
> `dv_lead` countersignature. This program has **no** compile-checked
> interface-record lane and no interface-compile CI evidence; the
> compensating control is the line-by-line countersignature plus the shared
> package of §5.5, which removes silent value drift between RTL and testbench
> even though the port lists are review-checked (L-F03 — a document that
> claims a control nothing performs names the compensating control).

Every port in §4.A–§4.D appears in its module's table exactly once. There are
no reserved or unused fields.

### 4.A Port table — M01 `chip8_cpu`

| Port | Dir | Width | Meaning | REQ |
|---|---|---|---|---|
| `clk` | in | 1 | Single clock domain, nominal 12 MHz (README scope parameters). All state changes are on its rising edge. | REQ-008 |
| `rst_n` | in | 1 | **Synchronous**, active-low reset. Must be held low for at least one rising edge. | REQ-008 |
| `mem_en` | out | 1 | High in exactly those cycles in which this module requests a memory access. | REQ-001 |
| `mem_we` | out | 1 | 1 = write, 0 = read. Meaningful only while `mem_en` is high. | REQ-001 |
| `mem_addr` | out | 12 | Byte address of the requested access. Meaningful only while `mem_en` is high. | REQ-001 |
| `mem_wdata` | out | 8 | Write data. Meaningful only while `mem_en` and `mem_we` are both high. | REQ-001 |
| `mem_rdata` | in | 8 | Read data, valid in the cycle **after** a cycle in which `mem_en` was high and `mem_we` low. | REQ-102 |
| `obs_retire` | out | 1 | One cycle high per instruction that completes without fault. | REQ-029 |
| `obs_instr` | out | 16 | The 16-bit encoding of the instruction the `obs_*` bundle currently describes. | REQ-121 |
| `obs_instr_addr` | out | 12 | The address of the **first (high) byte** of that instruction. | REQ-121 |
| `obs_pc` | out | 12 | Architectural PC. | REQ-105 |
| `obs_i` | out | 12 | Architectural I. | REQ-105 |
| `obs_sp` | out | 5 | Architectural SP — the count of entries currently on the stack, 0…16. | REQ-105 |
| `obs_v` | out | 128 | Packed register file. `obs_v[8*k +: 8]` is V\<k\> for k = 0…15. | REQ-105 |
| `obs_stack` | out | 192 | Packed call stack. `obs_stack[12*k +: 12]` is stack entry k for k = 0…15. | REQ-105 |
| `obs_rng` | out | 16 | The M04 LFSR state. Exposed so a model/DUT random desynchronisation is observed where it happens, not many instructions later when a `CXNN` result first differs. | REQ-105 |
| `obs_halted` | out | 1 | High from the cycle the machine enters `S_HALT` until reset. | REQ-048 |
| `obs_err` | out | 4 | The error code (§9). `ERR_NONE` whenever `obs_halted` is low. | REQ-110 |

### 4.B Port table — M02 `chip8_ram`

| Port | Dir | Width | Meaning | REQ |
|---|---|---|---|---|
| `clk` | in | 1 | Same clock domain as M01. | REQ-001 |
| `en` | in | 1 | Access request for this cycle. When low, the memory does nothing and `rdata` is unchanged. | REQ-001 |
| `we` | in | 1 | 1 = write, 0 = read. Meaningful only while `en` is high. | REQ-001 |
| `addr` | in | 12 | Byte address. | REQ-001 |
| `wdata` | in | 8 | Write data. | REQ-001 |
| `rdata` | out | 8 | Data read by the access **of the previous cycle**; holds its value in any cycle not preceded by an enabled read. | REQ-102 |

**Structural encoding of the single-port invariant** (template §4.1 rule): M02
exposes **one** address, **one** write-enable and **one** data path in each
direction, and **no** ready, stall, busy or valid output. A memory that could
refuse or delay an access cannot be substituted here without a spec diff —
which is the point. A design that needs backpressure cannot be written against
this table.

### 4.C Port table — M03 `chip8_core_top` (the P1 DUT)

| Port | Dir | Width | Meaning | REQ |
|---|---|---|---|---|
| `clk` | in | 1 | See §4.A. | REQ-008 |
| `rst_n` | in | 1 | See §4.A. | REQ-008 |
| `obs_retire`, `obs_instr`, `obs_instr_addr`, `obs_pc`, `obs_i`, `obs_sp`, `obs_v`, `obs_stack`, `obs_rng`, `obs_halted`, `obs_err` | out | as §4.A | The M01 observation bundle, passed through unmodified and with no added or removed cycle of delay. | REQ-105 |

**REQ-112 — port closure.** M01, M02, M03 and M04 have **no ports other than
those tabulated in §4.A–§4.D**. M03 in particular exposes no memory port: the
RAM is internal, and the memory image is a construction-time property (§5.4).
A port an implementation finds it needs is a spec diff, not an addition.

**REQ-120 — the observation bundle is complete.** Every element of the
architectural state enumerated in REQ-013 is observable at M03's boundary,
either through an `obs_*` output or, for memory, through REQ-114's named
array. A full architectural-state comparison is therefore constructible
without reading any implementation internal, which is what PROTOCOL §10
requires of the DV lane.

**REQ-106 — observation is passive.** No `obs_*` output feeds back into the
machine, and the value of any `obs_*` output has no effect on any
architectural state, on any cycle count, or on the memory port. Tying every
one of them off (`OBS_ENABLE = 0`, REQ-113) changes nothing an instruction can
observe.

**Memory observation contract** (REQ-114): the lockstep campaign compares
memory as part of the architectural state, and 32768 bits cannot sensibly be
carried on a port. M02 therefore SHALL declare its storage as a single
unpacked array named **`mem`**, of 4096 elements of 8 bits, at the top level
of module `chip8_ram`, so that a bench can read memory by one stable
hierarchical path. This is the **only** internal name this specification
constrains, and it is constrained precisely so that the bench depends on a
specified observable rather than on an implementation-derived path.

### 4.D Port table — M04 `chip8_rng`

| Port | Dir | Width | Meaning | REQ |
|---|---|---|---|---|
| `clk` | in | 1 | See §4.A. | REQ-103 |
| `rst_n` | in | 1 | On reset the LFSR state is loaded with `RNG_SEED`. | REQ-103 |
| `step` | in | 1 | When high at a rising edge, the LFSR state advances by exactly 8 steps. When low, the state is unchanged. | REQ-104 |
| `rnd` | out | 8 | The low 8 bits of the state the LFSR **will hold after the next advance** — so a `CXNN` executing in one cycle can both consume `rnd` and assert `step` in that same cycle. | REQ-103 |
| `state` | out | 16 | The current LFSR state, for `obs_rng`. | REQ-105 |

### 4.3 Configuration inputs

**None.** Every configuration value in P1 is compile-time and lives in the
shared package (§5). There is no run-time configuration record and no
run-time control path to any parameter (REQ-096).

---

## 5. Parameters

All parameters live in **one** SystemVerilog package, `chip8_pkg`, imported by
both the RTL and the testbench (ADR-0017 Consequence 1). §5.5 states the
package's normative content; the file itself is authored under `rtl/**` by
`rtl_lead` (§11 D-3).

### 5.1 Structural parameters

| Parameter | Type | Default | Range | Why a test overrides it |
|---|---|---|---|---|
| `ADDR_W` | int | 12 | 12 | Never overridden in P1; a different width is a scope change (E2). |
| `DATA_W` | int | 8 | 8 | Never overridden in P1. |
| `RAM_DEPTH` | int | 4096 | 4096 | Never overridden in P1. |
| `NUM_V` | int | 16 | 16 | Never overridden in P1. |
| `STACK_DEPTH` | int | 16 | 2…16 | README records the stack as parameterized. A short stack lets a directed test reach `ERR_STACK_OVERFLOW` in a handful of instructions instead of sixteen. |
| `SP_W` | int | 5 | derived: `$clog2(STACK_DEPTH)+1` | Derived, never set directly; SP must represent the value `STACK_DEPTH` itself. |
| `PROG_START` | 12-bit | `12'h200` | `0x000`…`0xFFF` | A directed test may load a program elsewhere to check that reset PC is a parameter and not a hard-coded constant. |
| `FONT_BASE` | 12-bit | `12'h000` | fixed in P1 | Not overridden; P1 reserves the region, P2 populates it. |
| `FONT_BYTES` | int | 80 | fixed in P1 | As above. |

### 5.2 Quirk parameters (WO-0002 task 6)

Every one defaults to the **1977 COSMAC VIP** behaviour, per README's P4 row
("defaulting to 1977 COSMAC VIP semantics"). P1 verification runs the default
configuration **only**; the compatibility campaign is P4 (REQ-095). The
parameters are declared now because retrofitting one into frozen RTL and
frozen benches costs more than carrying it unused for three phases.

| Parameter | Type | Default (VIP) | Other permitted values | Instructions bound | REQ |
|---|---|---|---|---|---|
| `QUIRK_SHIFT_SRC` | enum | `SHIFT_SRC_VY` — the shift reads V\<y\> | `SHIFT_SRC_VX` — the shift reads V\<x\> (CHIP-48 / SUPER-CHIP) | `8XY6`, `8XYE` | REQ-090 |
| `QUIRK_JUMP_OFFSET` | enum | `JUMP_V0` — target is `NNN + V0` | `JUMP_VX` — target is `XNN + V<x>`, i.e. the `BXNN` reading (CHIP-48 / SUPER-CHIP) | `BNNN` | REQ-091 |
| `QUIRK_MEM_I_MODE` | enum | `MEMI_INC_X_PLUS_1` — I ← I + X + 1 | `MEMI_INC_X` — I ← I + X (CHIP-48); `MEMI_UNCHANGED` — I unchanged (SUPER-CHIP) | `FX55`, `FX65` | REQ-092 |
| `QUIRK_VF_RESET` | bit | `1` — VF is set to 0 after the result is written | `0` — VF is unchanged | `8XY1`, `8XY2`, `8XY3` | REQ-093 |
| `QUIRK_I_OVERFLOW_VF` | bit | `0` — VF is unchanged | `1` — VF ← 1 when I + V\<x\> exceeds `0x0FFF`, else 0 (the "Amiga" behaviour) | `FX1E` | REQ-094 |

**Two parameters beyond the three WO-0002 named, with the argument** (the
packet asked for the boundary to be confirmed or argued, not silently
adopted). `QUIRK_VF_RESET` and `QUIRK_I_OVERFLOW_VF` bind P1 instructions and
are divergent across the community's interpreters, so README's P4 row —
"**every** divergent CHIP-8 behaviour exposed as a compile-time parameter" —
requires them, and README is canonical over a packet's enumeration of it
(L-B12). `QUIRK_VF_RESET` in particular changes the observable result of three
very common instructions, so a P1 design that hard-codes either answer would
have to be edited, not configured, in P4.

**One parameter is three-valued, not boolean**: `QUIRK_MEM_I_MODE` has three
distinct community behaviours, and a boolean would have made the third
unreachable without a spec diff.

### 5.3 Verification and delivery parameters

| Parameter | Type | Default | Range | Why a test overrides it |
|---|---|---|---|---|
| `RNG_SEED` | 16-bit | `16'hACE1` | any **non-zero** value | A test sweeps seeds to show the lockstep parity is not seed-specific. Zero is barred: it is an absorbing state for this LFSR (REQ-103). |
| `OBS_ENABLE` | bit | `1` | 0, 1 | P5 synthesis sets it to 0 so the ~380 observation bits do not appear as top-level outputs in the resource report. With `OBS_ENABLE = 0` every `obs_*` output is driven to zero and the machine's architectural behaviour is unchanged (REQ-113). |
| `THROTTLE_DIV` | int | 0 | **{0} in P1** | Not overridden in P1: 0 is the only supported value, meaning "issue instructions back-to-back". P3 extends the range (§11 D-4, REQ-111). |

### 5.4 Memory image parameter

| Parameter | Type | Default | Range | Why a test overrides it |
|---|---|---|---|---|
| `MEM_INIT_FILE` | string | `""` | any readable path | Every test sets it: it is how a program and its data reach the machine. With `""` every byte of memory is `8'h00` at time zero. |

The image is a **construction-time property of M02**, not a port and not an
architectural mechanism: the CPU has no instruction that loads a program, and
reset does not alter memory (REQ-009, REQ-014). Whether M02 realises the image
with a file-read initial block, a parameterized constant array, or a
synthesis-time block-RAM initialisation is unconstrained (§6.6).

### 5.5 Shared package `chip8_pkg` — normative content

ADR-0017 Consequence 1 requires this package as the mitigation against the
reviewed-port-table regime's known weakness: values that appear in both the
RTL and the testbench must have exactly one definition site so they cannot
drift silently. The table below is that definition site's **normative
content** (**REQ-107**); §11 D-3 tracks the file's authorship.

**REQ-109 — one definition site.** Every value in the table below is defined
**once**, here, and is referenced — never restated — by the RTL, by the
testbench, and by any other specification in this program. A literal that
duplicates one of these values anywhere else is a defect, because it is a
value that can drift while both copies still compile.

| Group | Names | Value / members |
|---|---|---|
| Widths and sizes | `ADDR_W`, `DATA_W`, `RAM_DEPTH`, `NUM_V`, `STACK_DEPTH`, `SP_W`, `INSTR_W` | §5.1; `INSTR_W = 16` |
| Memory map | `PROG_START`, `FONT_BASE`, `FONT_BYTES` | §5.1 |
| Quirks | `quirk_shift_e {SHIFT_SRC_VY, SHIFT_SRC_VX}`, `quirk_jump_e {JUMP_V0, JUMP_VX}`, `quirk_memi_e {MEMI_INC_X_PLUS_1, MEMI_INC_X, MEMI_UNCHANGED}`, and the five parameters `QUIRK_SHIFT_SRC`, `QUIRK_JUMP_OFFSET`, `QUIRK_MEM_I_MODE`, `QUIRK_VF_RESET`, `QUIRK_I_OVERFLOW_VF` | §5.2 |
| Error codes | `err_e { ERR_NONE = 0, ERR_ILLEGAL_OPCODE = 1, ERR_DEFERRED_OPCODE = 2, ERR_STACK_OVERFLOW = 3, ERR_STACK_UNDERFLOW = 4, ERR_ADDR_RANGE = 5 }` | §9 |
| Decode classes | `dclass_e { DC_IMPLEMENTED, DC_DEFERRED, DC_ILLEGAL }` | §6.3 |
| Opcode encodings | High nibbles `OP_0`…`OP_F`; `SUB_CLS = 8'hE0`, `SUB_RET = 8'hEE`; ALU nibbles `ALU_LD=4'h0, ALU_OR=4'h1, ALU_AND=4'h2, ALU_XOR=4'h3, ALU_ADD=4'h4, ALU_SUB=4'h5, ALU_SHR=4'h6, ALU_SUBN=4'h7, ALU_SHL=4'hE`; F-group bytes `F_DT_GET=8'h07, F_KEY=8'h0A, F_DT_SET=8'h15, F_ST_SET=8'h18, F_ADDI=8'h1E, F_FONT=8'h29, F_BCD=8'h33, F_STORE=8'h55, F_LOAD=8'h65`; E-group bytes `E_SKP=8'h9E, E_SKNP=8'hA1` | §6.3, §6.4 |
| RNG | `RNG_W = 16`, `RNG_SEED`, `RNG_POLY = 16'hB400`, `RNG_STEPS_PER_DRAW = 8` | §6.5 |
| Other | `OBS_ENABLE`, `THROTTLE_DIV`, `MEM_INIT_FILE` | §5.3, §5.4 |

The deferred-phase encodings (`SUB_CLS`, `F_FONT`, `E_SKP`, `E_SKNP`,
`F_DT_GET`, `F_KEY`, `F_DT_SET`, `F_ST_SET`) are named in the package **in
P1** so that P2 and P3 add behaviour without adding constants, and so that
P1's own deferred-class decode has names rather than magic numbers.

**The package contains no behaviour** (REQ-108). It SHALL contain no `module`,
no procedural block, and no function or task that computes decode
classification or an instruction result. Pure width and constant helpers are
permitted. The reason is an independence one, not a style one: PROTOCOL §10
requires DV to derive tests from this specification and not from the RTL, and
a shared function that classifies opcodes would make the RTL and the bench
agree about decode **by construction**, so the decode requirements would be
untested in exactly the way L-D16 describes.

---

## 6. Behaviour

### 6.1 Normal path

#### 6.1.1 Architectural state (REQ-001 … REQ-014)

The complete architectural state, quoted from README's canonical scope
paragraph and given its P1 form:

| Element | Size | Notes |
|---|---|---|
| RAM | 4096 × 8 | Single-port synchronous; one access per cycle (REQ-001) |
| V0…VF | 16 × 8 | VF is the carry/borrow flag; it is an ordinary register in every other respect (REQ-003) |
| I | 12 bit | Index register (REQ-004) |
| PC | 12 bit | Program counter (REQ-005) |
| Stack | 16 × 12 bit | Dedicated array, **not** a region of RAM (REQ-006) |
| SP | 5 bit | Number of entries on the stack, 0…16; `stack[SP]` is the next free slot (REQ-006) |
| RNG state | 16 bit | M04's LFSR (REQ-012) |
| `halted`, `err` | 1 + 4 bit | The fault state (REQ-048) |

**REQ-013 — closure.** The elements above are the **complete** architectural
state of the P1 machine. Any other storage in an implementation (the
instruction register, the loop counter, the FSM state register) is transient:
it SHALL have no effect on the machine's behaviour at an instruction boundary,
and a full-state comparison that ignores it is complete. This clause is what
makes "full architectural-state compare after every instruction" a
well-defined test rather than an aspiration.

**Memory map (REQ-002).**

| Range | Contents in P1 |
|---|---|
| `0x000`–`0x04F` | Reserved for the 16 × 5-byte font. P1 **reserves** the region; populating it and `FX29` are P2. P1 places no restriction on a program reading or writing here — CHIP-8 RAM is uniformly readable and writable — but a P1 test that overwrites this region should expect P2 to care. |
| `0x050`–`0x1FF` | Free. On the original machine this held the interpreter; here it is ordinary RAM. |
| `0x200`–`0xFFF` | Program and data. `PROG_START` = `0x200` is the reset PC. |

**REQ-007 — instruction format.** Instructions are fixed 2-byte, big-endian:
the instruction at address A is `{M[A], M[A+1]}` — the byte at the **lower**
address is the high byte. Instructions are not required to be aligned to even
addresses; `1NNN` may target an odd address and the machine fetches from there.

**REQ-008 — reset.** `rst_n` is sampled synchronously. In the first cycle
after a rising edge at which `rst_n` was low, and in every such cycle:

| Element | Value |
|---|---|
| PC | `PROG_START` (`0x200`) |
| I | `0x000` |
| SP | 0 |
| V0…VF | all `8'h00` |
| stack[0]…stack[15] | all `12'h000` |
| RNG state | `RNG_SEED` |
| `halted` | 0 |
| `err` | `ERR_NONE` |
| FSM | `S_RESET`, leaving to `S_FETCH_HI` in the first cycle `rst_n` is high |

Every bit is given an explicit reset value. This is not defensive style: ADR-0017
records that Verilator is 2-state and Icarus is 4-state, so an uninitialised bit
reads `0` in one authoritative lane and `X` in the other, and the two lanes are
required to agree (REQ-123).

**REQ-009 — reset does not alter memory.** RAM contents survive reset; the
image is established at construction (REQ-014).

**REQ-010 — 12-bit address arithmetic wraps.** PC and I are 12-bit registers.
Any single-target update of either — `PC + 2`, `PC + 4`, a `1NNN`/`BNNN`
target, `I + V<x>` — is taken **modulo 4096**. There is no fault for a wrapped
single target, because a 12-bit register physically cannot leave the address
space and a fault that can never distinguish anything is a decode path with no
verification value. Multi-byte spans are a different case and **do** fault, see
REQ-046.

**REQ-011 — 8-bit register arithmetic wraps.** Every write to a V register is
modulo 256. Where an instruction also specifies a flag, the flag carries the
information the truncation discarded.

**REQ-012 — RNG state.** Part of the architectural state, reset to `RNG_SEED`,
advanced only by `CXNN` (REQ-104).

**REQ-014 — memory image.** The contents of memory at the first fetch SHALL
equal the image named by `MEM_INIT_FILE`, or all-zero when it is `""`. The
mechanism is a construction-time property of M02 and is not part of the CPU's
architectural interface.

#### 6.1.2 One instruction, cycle by cycle

The representative transaction is a register-class instruction, `8124`
(`V1 ← V1 + V2`, with carry into VF), fetched from `0x200`:

| Cycle | State | Memory port | Captured / committed |
|---|---|---|---|
| 1 | `S_FETCH_HI` | read `0x200` | — |
| 2 | `S_FETCH_LO` | read `0x201` | instruction high byte `8'h81` captured from `mem_rdata` |
| 3 | `S_DECODE` | idle | instruction low byte `8'h24` captured; the encoding is classified `DC_IMPLEMENTED` |
| 4 | `S_EXEC` | idle | V1 ← (V1 + V2) mod 256; **then** VF ← carry; PC ← `0x202` |
| 5 | `S_FETCH_HI` of the next instruction | read `0x202` | `obs_retire` high for this one cycle; the `obs_*` bundle describes `8124` and the state after it |

Note in row 5 that `obs_retire` costs **no cycle**: it is asserted during the
first cycle of the following instruction's fetch.

### 6.2 State machine

The FSM of M01. `S_RESET` and the behaviour on reset are included as the
template requires. M02, M03 and M04 have no control FSM: M02 is a single
synchronous memory access, M03 is structural, M04 is one register with a
combinational next-state function.

| State | Entered when | Does | Memory access issued | Leaves to | REQ |
|---|---|---|---|---|---|
| `S_RESET` | `rst_n` low at a rising edge, from **any** state | Applies REQ-008 to every element of architectural state except memory | **none** | `S_FETCH_HI`, in the first cycle `rst_n` is high | REQ-008 |
| `S_FETCH_HI` | Reset release; or from `S_EXEC`, `S_MEM_WR`, `S_MEM_RD` at instruction completion | Latches the instruction address for `obs_instr_addr`; drives `obs_retire` for the just-completed instruction | **read** at `PC` | `S_FETCH_LO`, unconditionally | REQ-021 |
| `S_FETCH_LO` | From `S_FETCH_HI` | Captures the instruction's high byte from `mem_rdata` | **read** at `(PC + 1) mod 4096` | `S_DECODE`, unconditionally | REQ-022 |
| `S_DECODE` | From `S_FETCH_LO` | Captures the instruction's low byte; classifies the complete 16-bit encoding per §6.3 | **none** | `S_EXEC` when the class is `DC_IMPLEMENTED`; `S_HALT` when it is `DC_ILLEGAL` or `DC_DEFERRED` | REQ-023 |
| `S_EXEC` | From `S_DECODE` | **Exactly one such cycle per instruction.** Commits every architectural effect of a register-class instruction, including the PC update. For a memory-class instruction, commits the non-memory effects and issues the **first** memory access. Detects the runtime faults of §9 | **none** for a register-class instruction; the **first write** of `FX33`/`FX55`; the **first read** of `FX65` | `S_FETCH_HI` (register class, and `FX55` with X = 0); `S_MEM_WR` (`FX33`, `FX55` with X ≥ 1); `S_MEM_RD` (`FX65`, always); `S_HALT` on a runtime fault | REQ-024 |
| `S_MEM_WR` | From `S_EXEC` or from itself | Issues the next byte write of the instruction's write sequence | **one write** | itself while bytes remain; `S_FETCH_HI` on the last | REQ-025 |
| `S_MEM_RD` | From `S_EXEC` or from itself | Captures the byte read by the previous cycle's access into the next destination register, and issues the next read if one remains | **one read**, or none in the final cycle | itself while bytes remain; `S_FETCH_HI` on the last | REQ-026 |
| `S_HALT` | From `S_DECODE` (decode fault) or `S_EXEC` (runtime fault) | Holds `obs_halted` high and `obs_err` at the fault code. **Terminal.** | **none**, ever | itself. The **only** exit is `S_RESET` | REQ-027 |

**Eight states.** No other state exists in the specified control FSM. The
*encoding* of the state register is unconstrained (§6.6).

**REQ-030 — the memory port idles** in `S_RESET`, `S_DECODE`, `S_HALT`, in any
`S_EXEC` of a register-class instruction, and in the final cycle of an
`S_MEM_RD` sequence: `mem_en` is low in every one of those cycles. Combined
with the fact that no state issues more than one access, this is the
requirement that discharges the single-port invariant behaviourally, as §4.B
discharges it structurally.

**REQ-020 — completeness.** The eight states above are the complete set of
control phases visible in this specification's timing contract. An
implementation may not add a phase that changes any cycle count in §7.1.

### 6.3 Decode classification — all 65536 encodings (WO-0002 task 7)

The decode space is 16 bits wide and the legal set does not fill it. Per
**L-D16**, specifying the legal encodings and saying nothing about the rest
would leave the illegal space *unspecified*, not "don't care", and P4's formal
properties would fall into the hole. This section therefore partitions the
**whole** space, and shows the arithmetic so the partition's exhaustiveness is
checkable rather than asserted.

**REQ-040 — three classes, exhaustive and disjoint.** Every one of the 65536
16-bit encodings falls into exactly one of:

- `DC_IMPLEMENTED` — a P1 instruction; executes per §6.4.
- `DC_DEFERRED` — a legal CHIP-8 instruction whose implementation README
  assigns to P2 or P3.
- `DC_ILLEGAL` — not an instruction of the 35-instruction set.

| High nibble | `DC_IMPLEMENTED` | `DC_DEFERRED` | `DC_ILLEGAL` | Total |
|---|---|---|---|---|
| `0` | `00EE` → 1 | `00E0` → 1 (P2) | 4094 — **including every `0NNN` SYS** | 4096 |
| `1` | `1NNN` → 4096 | 0 | 0 | 4096 |
| `2` | `2NNN` → 4096 | 0 | 0 | 4096 |
| `3` | `3XNN` → 4096 | 0 | 0 | 4096 |
| `4` | `4XNN` → 4096 | 0 | 0 | 4096 |
| `5` | `5XY0` → 256 | 0 | `5XY1`…`5XYF` → 3840 | 4096 |
| `6` | `6XNN` → 4096 | 0 | 0 | 4096 |
| `7` | `7XNN` → 4096 | 0 | 0 | 4096 |
| `8` | n ∈ {0,1,2,3,4,5,6,7,E} → 9 × 256 = 2304 | 0 | n ∈ {8,9,A,B,C,D,F} → 7 × 256 = 1792 | 4096 |
| `9` | `9XY0` → 256 | 0 | `9XY1`…`9XYF` → 3840 | 4096 |
| `A` | `ANNN` → 4096 | 0 | 0 | 4096 |
| `B` | `BNNN` → 4096 | 0 | 0 | 4096 |
| `C` | `CXNN` → 4096 | 0 | 0 | 4096 |
| `D` | 0 | `DXYN` → 4096 (P2) | 0 | 4096 |
| `E` | 0 | `EX9E`, `EXA1` → 2 × 16 = 32 (P3) | 4064 | 4096 |
| `F` | `FX1E`, `FX33`, `FX55`, `FX65` → 4 × 16 = 64 | `FX29` → 16 (P2); `FX07`, `FX0A`, `FX15`, `FX18` → 4 × 16 = 64 (P3) | 3952 | 4096 |
| **Total** | **39745** | **4209** | **21582** | **65536** |

39745 + 4209 + 21582 = 65536. Provenance class **derived** — the derivation is
the table (L-B01). The 25 `DC_IMPLEMENTED` forms plus P2's 3 forms (`00E0`,
`DXYN`, `FX29`) plus P3's 6 forms (`EX9E`, `EXA1`, `FX07`, `FX0A`, `FX15`,
`FX18`) plus `0NNN` account for exactly 35, which is the count README's scope
paragraph fixes. **The P1 instruction boundary WO-0002 proposed is therefore
confirmed, not merely adopted**: it is exactly the complement of P2's and P3's
README-stated scopes within the 35, and the phase partition is both exhaustive
and disjoint.

**REQ-043 — `0NNN` (SYS) disposition.** Every `0NNN` encoding other than
`00E0` and `00EE` is `DC_ILLEGAL`. On the original machine `0NNN` called a
native 1802 machine-language routine at `NNN`. This design contains no 1802
and cannot execute one, so the instruction is unimplementable rather than
merely unimplemented. Treating it as a no-operation was rejected: reaching a
`0NNN` encoding almost always means the program counter has walked into data,
and a silent no-op turns that into a machine that runs on quietly executing
garbage, which is the failure mode hardest to diagnose from a lockstep
divergence thousands of instructions later. `0x0000` — the encoding a run of
blank memory produces — is `DC_ILLEGAL` and halts, which is the useful
behaviour.

**REQ-041 — `DC_ILLEGAL` behaviour.** The machine SHALL enter `S_HALT` from
`S_DECODE` with `err = ERR_ILLEGAL_OPCODE`, **before any architectural state
is modified by the offending instruction** — including PC, which still holds
the address of the offending instruction's first byte, because the PC update
happens in `S_EXEC` and `S_EXEC` is never entered (REQ-005).

**REQ-042 — `DC_DEFERRED` behaviour.** Identical to REQ-041 except that
`err = ERR_DEFERRED_OPCODE`. The distinct code exists so a P1 test can tell
"not yet built" from "not a CHIP-8 instruction" — the first is a phase
boundary and the second is a program defect, and collapsing them would make
every P1 test of the illegal space also pass on a decoder that has forgotten
`DXYN` exists. When P2 and P3 implement these encodings, the change to this
section is a **spec diff plus an ADR** recorded in §13, not an edit (§11 D-5).

**REQ-049 — fault observability.** On any fault, `obs_retire` SHALL NOT be
asserted for the faulting instruction, and `obs_instr` / `obs_instr_addr`
SHALL hold the faulting instruction's encoding and address for as long as the
machine is halted.

### 6.4 Instruction semantics

Notation: `X` is bits [11:8] of the encoding, `Y` bits [7:4], `N` bits [3:0],
`NN` bits [7:0], `NNN` bits [11:0]. `V<x>` is the register selected by `X`.
"PC ← PC + 2" means the address of the next sequential instruction; every PC
assignment is modulo 4096 (REQ-010).

#### 6.4.1 Flow control

| REQ | Encoding | Name | Effect |
|---|---|---|---|
| REQ-060 | `00EE` | RET | If SP = 0 → `ERR_STACK_UNDERFLOW` (REQ-045). Otherwise SP ← SP − 1, then PC ← stack[SP] (the entry at the **new** SP). The popped entry's stored value is **not** cleared (REQ-006). |
| REQ-061 | `1NNN` | JP addr | PC ← `NNN`. |
| REQ-062 | `2NNN` | CALL addr | If SP = `STACK_DEPTH` → `ERR_STACK_OVERFLOW` (REQ-044). Otherwise stack[SP] ← PC + 2 (the address of the instruction **after** the call), SP ← SP + 1, PC ← `NNN`. |
| REQ-063 | `3XNN` | SE V\<x\>, byte | PC ← PC + 4 if V\<x\> = `NN`, else PC + 2. |
| REQ-064 | `4XNN` | SNE V\<x\>, byte | PC ← PC + 4 if V\<x\> ≠ `NN`, else PC + 2. |
| REQ-065 | `5XY0` | SE V\<x\>, V\<y\> | PC ← PC + 4 if V\<x\> = V\<y\>, else PC + 2. |
| REQ-077 | `9XY0` | SNE V\<x\>, V\<y\> | PC ← PC + 4 if V\<x\> ≠ V\<y\>, else PC + 2. |
| REQ-079 | `BNNN` | JP offset | `QUIRK_JUMP_OFFSET = JUMP_V0`: PC ← `NNN` + V0. `= JUMP_VX`: PC ← `XNN` + V\<x\>, where `XNN` is the low 12 bits of the encoding read as `X` in [11:8] — i.e. the same 12 bits, with the register selected by them rather than V0. Both modulo 4096. |

**REQ-086 — skips are constant-time.** A taken skip and an untaken skip cost
the same number of cycles (§7.1). No instruction's cycle count depends on
data. This is a requirement, not an implementation note: it makes the timing
contract a single number per instruction and gives P4's formal work a machine
with no data-dependent control-flow timing.

#### 6.4.2 Register and ALU

| REQ | Encoding | Name | Effect on V\<x\> | Effect on VF |
|---|---|---|---|---|
| REQ-066 | `6XNN` | LD | V\<x\> ← `NN` | none |
| REQ-067 | `7XNN` | ADD byte | V\<x\> ← (V\<x\> + `NN`) mod 256 | **none** — this instruction does not set a carry |
| REQ-068 | `8XY0` | LD reg | V\<x\> ← V\<y\> | none |
| REQ-069 | `8XY1` | OR | V\<x\> ← V\<x\> \| V\<y\> | VF ← 0 if `QUIRK_VF_RESET`, else none |
| REQ-070 | `8XY2` | AND | V\<x\> ← V\<x\> & V\<y\> | VF ← 0 if `QUIRK_VF_RESET`, else none |
| REQ-071 | `8XY3` | XOR | V\<x\> ← V\<x\> ^ V\<y\> | VF ← 0 if `QUIRK_VF_RESET`, else none |
| REQ-072 | `8XY4` | ADD reg | V\<x\> ← (V\<x\> + V\<y\>) mod 256 | VF ← 1 if V\<x\> + V\<y\> > 255, else 0 |
| REQ-073 | `8XY5` | SUB | V\<x\> ← (V\<x\> − V\<y\>) mod 256 | VF ← 1 if V\<x\> ≥ V\<y\>, else 0 (**not** the borrow) |
| REQ-074 | `8XY6` | SHR | `SHIFT_SRC_VY`: V\<x\> ← V\<y\> >> 1. `SHIFT_SRC_VX`: V\<x\> ← V\<x\> >> 1 | VF ← bit 0 of the **source before the shift** (V\<y\> or V\<x\> per the parameter) |
| REQ-075 | `8XY7` | SUBN | V\<x\> ← (V\<y\> − V\<x\>) mod 256 | VF ← 1 if V\<y\> ≥ V\<x\>, else 0 |
| REQ-076 | `8XYE` | SHL | `SHIFT_SRC_VY`: V\<x\> ← (V\<y\> << 1) mod 256. `SHIFT_SRC_VX`: V\<x\> ← (V\<x\> << 1) mod 256 | VF ← bit 7 of the **source before the shift** |
| REQ-080 | `CXNN` | RND | V\<x\> ← `rnd` & `NN`, where `rnd` is defined in §6.5 | none |

**REQ-085 — the VF write-ordering rule, and the X = F corner.** In every
`8XYn`, and in every other instruction that specifies both a result and a
flag, the result is written to V\<x\> **first** and the flag is written to VF
**second**. The consequence is normative and is the thing a decode table most
often gets wrong: **when X = `0xF`, the final content of VF is the flag, not
the arithmetic result.** `8FF4`, `8F16`, `8F25` and their relatives are legal
encodings and behave exactly as this rule says. Where an instruction specifies
no flag (`8XY0`, and `8XY1`/`8XY2`/`8XY3` with `QUIRK_VF_RESET = 0`), X = `0xF`
simply leaves the result in VF.

**REQ-087 — closure on VF.** An instruction that this section does not
describe as writing VF SHALL leave VF unchanged. There is no implicit flag
behaviour anywhere in P1.

#### 6.4.3 Index register and memory transfer

| REQ | Encoding | Name | Effect |
|---|---|---|---|
| REQ-078 | `ANNN` | LD I | I ← `NNN`. VF unchanged. |
| REQ-081 | `FX1E` | ADD I | I ← (I + V\<x\>) mod 4096. `QUIRK_I_OVERFLOW_VF = 1`: VF ← 1 if I + V\<x\> > `0x0FFF`, else 0. `= 0`: VF unchanged. |
| REQ-082 | `FX33` | BCD | M[I] ← V\<x\> / 100; M[I+1] ← (V\<x\> / 10) mod 10; M[I+2] ← V\<x\> mod 10, integer division. Written in that address order, one byte per cycle. I unchanged. VF unchanged. Faults `ERR_ADDR_RANGE` if I + 2 > `0xFFF` (REQ-046). |
| REQ-083 | `FX55` | store | M[I + k] ← V\<k\> for k = 0…X, in ascending k, one byte per cycle. Then I per `QUIRK_MEM_I_MODE`: `MEMI_INC_X_PLUS_1` → I ← I + X + 1; `MEMI_INC_X` → I ← I + X; `MEMI_UNCHANGED` → I unchanged. VF unchanged unless X = `0xF`, in which case VF is one of the registers stored and is itself unchanged. Faults `ERR_ADDR_RANGE` if I + X > `0xFFF`. |
| REQ-084 | `FX65` | load | V\<k\> ← M[I + k] for k = 0…X, in ascending k, one byte per cycle. Then I per `QUIRK_MEM_I_MODE`, exactly as `FX55`. When X = `0xF`, VF is one of the registers **loaded**. Faults `ERR_ADDR_RANGE` if I + X > `0xFFF`. |

Both loops run over k = 0…X inclusive, so `F055` transfers **one** register
and `FF55` transfers **sixteen**.

#### 6.4.4 The stack is not in RAM

README's scope paragraph enumerates "stack 16 × 12 bit (parameterized)"
alongside the registers and separately from the "RAM 4096 × 8" entry, so the
stack is architectural storage of its own. `2NNN` and `00EE` therefore issue
**no** main-memory access and cost the same four cycles as any other
register-class instruction (§7.1). Placing the stack in RAM — as the original
machine did, at a fixed high address — was not open to this specification:
README is canonical (PROTOCOL §1) and it says otherwise.

The consequence for verification is worth stating because a full-state
comparison depends on it: a stack entry is written **only** by `2NNN`, and
`00EE` does not clear the entry it pops (REQ-060). Reset zeroes all sixteen
(REQ-008). Entries above SP therefore hold well-defined values at every
instruction boundary, and comparing all sixteen entries — not just the live
ones — is deterministic.

### 6.5 The random source (REQ-103, REQ-104)

`CXNN` cannot be verified by lockstep unless the sequence is reproducible by
the golden model bit for bit. The generator is therefore specified exactly,
and the specification is of the **sequence produced**, not of a circuit.

**REQ-103 — the sequence.** M04 holds a 16-bit state, reset to `RNG_SEED`. One
*step* of the state `s` is:

```
lsb = s[0]
s   = s >> 1
if lsb == 1: s = s XOR RNG_POLY        // RNG_POLY = 16'hB400
```

Define `advance8(s)` as that step applied eight times. The output `rnd` is the
low 8 bits of `advance8(s)` for the current state `s` — that is, `rnd` presents
the byte the generator will hold **after** the next advance, so a `CXNN`
executing in a single cycle can consume `rnd` and commit the advance in the
same cycle. `RNG_SEED` SHALL be non-zero: an all-zero state is absorbing for
this recurrence, and a generator stuck at zero would make every `CXNN` return
zero — a defect a lockstep bench would happily confirm on both sides if the
model shared the same seed.

**REQ-104 — advance discipline.** The state advances by exactly eight steps
when, and only when, a `CXNN` instruction executes (`step` asserted for one
cycle in that instruction's `S_EXEC`). It does **not** free-run, does not
advance during any other instruction, does not advance while halted, and does
not advance during reset other than by being loaded with `RNG_SEED`. A
free-running source would make the value a `CXNN` reads depend on how many
cycles the program spent elsewhere, which is exactly the kind of coupling that
makes lockstep impossible.

Eight steps rather than one: a single step of a shift-register recurrence
changes only one bit of the low byte, so consecutive `CXNN` results would be
trivially correlated and the byte would take eight instructions to refresh.

### 6.6 Deliberately unconstrained

The implementer may choose all of the following freely. **Anything not listed
here is constrained by this specification, and a test may rely on it.**

- The encoding of the FSM state register (binary, one-hot, gray) and the
  internal names of its states. Only the eight phases of §6.2, their memory
  accesses and their cycle counts are constrained.
- How the decoder is structured: nibble comparisons, a case tree, a one-hot
  match, a ROM. Only the classification of §6.3 and the semantics of §6.4 are
  constrained.
- How the BCD digits of `FX33` are computed (repeated subtraction folded into
  the write cycles, a combinational divider, double-dabble), provided the six
  cycles of §7.1 hold and the three bytes are written in ascending address
  order.
- Whether the 16 × 12 stack is realised as flip-flops or as a small distributed
  memory, provided `00EE` and `2NNN` each complete in the four cycles of §7.1.
- The internal realisation of the M04 recurrence (Galois, an equivalent
  Fibonacci form, or a combinational 8-step matrix), provided the sequence of
  `advance8` values is exactly that of REQ-103.
- Whether M02 realises its image with a file-read initial block, a
  parameterized array, or synthesis-time block-RAM initialisation.
- Register-file implementation, ALU structure, and the width of any internal
  counter.
- Whether the `obs_*` outputs are driven from the architectural registers
  directly or through a register stage, **provided** REQ-029's contract holds
  exactly: during any cycle in which `obs_retire` is high, every `obs_*` output
  describes the completed instruction and the state after it.

---

## 7. Timing contract

### 7.1 Latency — exact cycle counts

Latency is stated in **clock cycles of `clk`**, measured from the first cycle
of an instruction's `S_FETCH_HI` to the last cycle before the next
instruction's `S_FETCH_HI` — two single, well-defined observables. Every
figure is exact, not a bound. `X` is the register index in the encoding, 0…15.

| Class | Instructions | State sequence | Cycles |
|---|---|---|---|
| Register / control | `00EE`, `1NNN`, `2NNN`, `3XNN`, `4XNN`, `5XY0`, `6XNN`, `7XNN`, `8XY0`–`8XY7`, `8XYE`, `9XY0`, `ANNN`, `BNNN`, `CXNN`, `FX1E` | FH, FL, DE, EX | **4** |
| BCD store | `FX33` | FH, FL, DE, EX, WR, WR | **6** |
| Register store | `FX55` | FH, FL, DE, EX, WR × X | **4 + X** (4…19) |
| Register load | `FX65` | FH, FL, DE, EX, RD × (X+1) | **5 + X** (5…20) |
| Decode fault | any `DC_ILLEGAL` or `DC_DEFERRED` encoding | FH, FL, DE → HALT | **3**, then terminal |
| Runtime fault | stack overflow/underflow, address range | FH, FL, DE, EX → HALT | **4**, then terminal |

`FX55` issues its first write in `S_EXEC`, so with X = 0 it never enters
`S_MEM_WR` and costs 4. `FX65` issues its first read in `S_EXEC` and always
needs one further cycle to capture the byte that read returns, so with X = 0 it
costs 5. This asymmetry is a direct consequence of the memory's one-cycle read
latency (REQ-102) and is stated rather than smoothed away.

**REQ-028** is the table above.

### 7.2 The README cycle budget, checked line by line

README's scope paragraph fixes a cycle budget. Each clause is checked against
§7.1 (provenance class **derived**):

| README clause | §7.1 | Verdict |
|---|---|---|
| "3 cycles fetch-hi/fetch-lo/decode (decode may fold into fetch-lo → 2)" | 3 | **At budget.** The fold is permitted by README, not required, and is **not taken**: it makes decode's timing depend on the memory's read-data path, and at a 12 MHz clock a 4-cycle instruction already issues at ~3 MHz against a target issue rate of 500–1000/s — roughly 3000× the required throughput. There is nothing to buy. If a P5 timing or resource result ever makes the fold worth having, it is a spec diff plus an ADR (§13), not a quiet optimisation. |
| "~4 cycles for a simple ALU instruction" | 4 | **At budget, exactly.** |
| "4 + (X+1) for `FX55`/`FX65`" | `FX55` = 4 + X; `FX65` = 5 + X = 4 + (X+1) | **`FX65` at budget exactly; `FX55` one cycle under.** |
| "4 + N for `DXYN`" | — | P2. |
| "`FX0A` blocks indefinitely" | — | P3. |
| "Instruction issue rate 500–1000/s (throttled)" | Not implemented in P1 | See §11 D-4 / OQ-2. With `THROTTLE_DIV = 0` the core issues back-to-back. |

**No clause is exceeded, so no E2 scope escalation arises from the FSM.**
`FX33` is not budgeted in README; its 6 cycles are stated here as new
information, not as a change to a recorded figure.

### 7.3 Throughput

- The memory accepts an access in **every** cycle in which `mem_en` is high;
  there are no wait states and no cycle in which the core cannot issue an
  access it wants to issue. §4.B encodes this structurally by exposing no
  backpressure signal.
- At most one memory access per cycle, in every state (REQ-001, REQ-030).
- Instruction issue is back-to-back: the cycle in which `obs_retire` is high
  is the first fetch cycle of the next instruction, so retirement costs no
  cycle.

### 7.4 Handshake rules

There is no `valid`/`ready` handshake anywhere in P1 — the only inter-module
interface is the memory port, which is a fixed-latency, always-accepting
access with no acknowledgement. `mem_addr`, `mem_we` and `mem_wdata` are
meaningful only in cycles where `mem_en` is high, and an implementation is
free to drive any value on them in cycles where it is low. `mem_rdata` is
meaningful only in the cycle following an enabled read; in every other cycle
its value carries no information and SHALL NOT be relied upon.

### 7.5 Reset

- `rst_n` is sampled synchronously and must be low at at least one rising edge
  to take effect.
- Within one cycle of `rst_n` returning high, the machine is in the state of
  REQ-008 and issues the first fetch of the program at `PROG_START`.
- A reset asserted mid-instruction abandons that instruction. Architectural
  effects already committed by an earlier cycle of that instruction — the
  bytes a partially completed `FX55` has already written to memory — remain in
  memory, because reset does not alter memory (REQ-009). Everything else
  returns to REQ-008's values. There is no in-flight transaction to drain.
- A reset asserted while halted clears `halted` and `err` and restarts
  execution. This is the only exit from `S_HALT` (REQ-048).

### 7.6 Configuration sampling

Not applicable: every parameter is compile-time (§4.3), so there is nothing to
latch and no sampling window to specify.

### 7.7 Retire and observation

**REQ-029 — the retire contract.** This clause exists because ADR-0017
Amendment A2 §5 names "how many edges does one model step correspond to?" as
the question most likely to produce false divergences in P1, and a
specification that leaves it to the bench author has left the program's main
verification instrument undefined.

- `obs_retire` is high for **exactly one** clock cycle per instruction that
  completes without fault, and low in every other cycle.
- **During any cycle in which `obs_retire` is high, every `obs_*` output
  describes the just-completed instruction**: `obs_instr` and
  `obs_instr_addr` identify it, and `obs_pc`, `obs_i`, `obs_sp`, `obs_v`,
  `obs_stack`, `obs_rng` hold the architectural state **after** it. A bench
  that samples the whole bundle in cycles where `obs_retire` is high therefore
  reads one consistent post-instruction snapshot per instruction, with no edge
  counting anywhere.
- `obs_retire` is **never** asserted for a faulting instruction (REQ-049).
- The cycle in which `obs_retire` is high is the first fetch cycle of the next
  instruction, so no cycle is spent on retirement.

**REQ-111 — the throttle insertion point.** `THROTTLE_DIV` is 0 in P1 and 0 is
its only supported value. When P3 gives it a range, the throttle SHALL add
idle cycles **between an instruction's retirement and the next instruction's
`S_FETCH_HI`, and nowhere else**, and SHALL have no architectural effect. That
constraint is stated now so that P3's mechanism cannot disturb any instruction
semantics or any intra-instruction cycle count frozen here.

---

## 8. Performance stress obligation

**Not applicable in the template's sense**, in one sentence: the template's
§8 binds modules on a stress-bench list derived from an intake-recorded
throughput invariant, this program's performance invariants are P5's
post-place-and-route fmax (≥ 25 MHz) and resource (≤ 50% logic cells) bars, and
no P1 module carries a throughput or latency invariant that a stress bench
could violate.

P1's binding verification obligation is a different one, and README fixes it:
**lockstep parity against the golden model, full architectural-state compare
after every instruction, divergence reported at the instruction of first
difference.** The stimulus that obligation needs is stated here so the bench
can be written from this section alone, as the template requires. This section
defines **stimulus and observables**; it does not design the bench, which is
`dv_lead`'s.

**Observables available** (§4.C): `obs_retire` as the sampling event, the full
architectural bundle for the comparison, `obs_instr`/`obs_instr_addr` for
divergence localisation, `obs_halted`/`obs_err` for the fault paths, and the
hierarchical `mem` array (REQ-114) for the memory half of the state compare.

**REQ-122 — stimulus classes the campaign SHALL cover.** Derived by
construction from §6.3 and §6.4, not re-invented:

1. **Every one of the 25 implemented forms**, at least once, in a directed
   vector.
2. **Register-index corners**: X = 0 and X = `0xF` for every instruction that
   names X; Y = 0 and Y = `0xF` for every instruction that names Y; X = Y for
   every two-register form. The X = `0xF` cases exercise REQ-085's ordering
   rule, which is the P1 requirement most likely to be implemented wrongly and
   silently.
3. **Value corners**: operands 0, 1, 127, 128, 255 for every ALU form; carries
   and borrows in both directions for `8XY4`, `8XY5`, `8XY7`; shift sources
   with bit 0 and bit 7 both set and both clear.
4. **Loop corners**: `FX55` and `FX65` with X = 0 and X = `0xF`; I placed so
   that I + X is `0xFFF` exactly (the last legal span) and `0x1000` (the first
   faulting one).
5. **Stack corners**: SP at 0 with a `00EE` (underflow fault), SP at
   `STACK_DEPTH` with a `2NNN` (overflow fault), and nested calls to depth
   `STACK_DEPTH − 1` and back.
6. **Address-space corners**: PC at `0xFFE` and `0xFFF` so the modulo-4096
   fetch wrap of REQ-010 is exercised; `1NNN` to an odd address.
7. **The illegal space**: at least one encoding drawn from each `DC_ILLEGAL`
   region of §6.3's table — the `0NNN` region, `5XYn≠0`, `8XYn` for n in
   {8,9,A,B,C,D,F}, `9XYn≠0`, an undefined `EXnn`, an undefined `FXnn` — and
   at least one `DC_DEFERRED` encoding from each of P2 and P3, checking that
   the two error codes differ.
8. **Sustained constrained-random streams** over the implemented forms, at a
   transaction count `dv_lead` fixes and freezes for the campaign, with a
   full-state compare at every `obs_retire`. Generation lives in Python under
   cocotb, because SystemVerilog constrained randomisation exists in neither
   simulator (ADR-0017 context finding 1).
9. **Both simulator lanes.** Icarus is the authoritative 4-state lane and is
   where REQ-008's full explicit reset is actually checked; Verilator carries
   the long random campaigns (ADR-0017).

**No CHIP-8 ROM is executed in P1.** Any real program reaches a `DXYN` within
a few instructions, which in P1 is a `DC_DEFERRED` halt. README's P1 success
criterion says "for the covered opcode subset", so synthetic streams are what
the criterion asks for; ROM execution begins in P2 and completes in P3.

**REQ-123 — determinism.** For a given `MEM_INIT_FILE`, parameter set and
`RNG_SEED`, the machine's cycle-by-cycle behaviour is a deterministic function
of that input alone. There is no free-running counter, no uninitialised
storage, and no source of nondeterminism anywhere in P1. This is what allows
the two simulator lanes to be compared against each other and against one
golden model.

---

## 9. Errors and discards

P1 has no output *stream* to mark or discard, so the template's stream-effect
column is answered as an effect on **execution**. Every abnormal condition
terminates execution at the offending instruction; none is silent.

| Condition | Strobe / indication | Effect on execution | REQ |
|---|---|---|---|
| Encoding is `DC_ILLEGAL` | `obs_halted` rises; `obs_err = ERR_ILLEGAL_OPCODE` | Halt from `S_DECODE`; no architectural state modified, PC still at the offending instruction | REQ-041 |
| Encoding is `DC_DEFERRED` (a P2 or P3 instruction) | `obs_halted` rises; `obs_err = ERR_DEFERRED_OPCODE` | As above | REQ-042 |
| `2NNN` with SP = `STACK_DEPTH` | `obs_halted` rises; `obs_err = ERR_STACK_OVERFLOW` | Halt from `S_EXEC`; the push does not happen, SP and PC unchanged | REQ-044 |
| `00EE` with SP = 0 | `obs_halted` rises; `obs_err = ERR_STACK_UNDERFLOW` | Halt from `S_EXEC`; the pop does not happen, SP and PC unchanged | REQ-045 |
| `FX33` with I + 2 > `0xFFF`; `FX55`/`FX65` with I + X > `0xFFF` | `obs_halted` rises; `obs_err = ERR_ADDR_RANGE` | Halt from `S_EXEC`; **no** memory access is issued and **no** register is written — the check precedes the first access | REQ-046 |

**REQ-047 — fault atomicity.** A faulting instruction commits **nothing**: no
register write, no memory write, no SP change, and no PC update. This is
achievable for every condition above because each is detectable before the
instruction's first commit — decode faults before `S_EXEC` is entered, and the
three runtime faults from state the machine already holds when `S_EXEC`
begins.

**REQ-048 — halt is terminal and sticky.** Once halted, `obs_halted` stays
high and `obs_err` holds its code until reset; the memory port issues nothing;
no further instruction is fetched. The only exit is `rst_n`.

**Co-occurrence.** The five conditions are mutually exclusive by construction:
the two decode faults are decided in `S_DECODE` on disjoint encoding classes
and end the instruction there, so no runtime fault can follow; and the three
runtime faults belong to disjoint instruction sets (`2NNN`, `00EE`, and the
three `FXnn` transfer forms). Exactly one code can ever be latched per halt,
and there is no precedence rule to state.

**REQ-046's alternative, recorded as rejected.** Wrapping a multi-byte span
modulo 4096 instead of faulting was considered and rejected: an `FX55` at
I = `0xFFE` would then silently write into the font region at `0x000`, turning
a program defect into memory corruption with no indication, and it would make
P4's signed formal property "I never addresses out of range" **vacuous** — true
by the 12-bit width of the address rather than by anything the design does. The
fault makes the property non-vacuous and the defect observable. Single-target
address updates still wrap (REQ-010), because there the wrap is the physical
behaviour of a 12-bit register and no span is crossed.

---

## 10. REQ coverage

Every REQ this specification owns, and the **authoritative registry** for
them: this table is the source of P1's rows in `docs/specs/requirements.md`
(§11 D-1, landed), which indexes these ids and never restates them. DV hooks:
**D** = directed vector,
**R** = constrained-random stream with full-state compare, **F** = formal
property (P4), **S** = structural — guaranteed by the interface or a
construction rule and not assertable by a bench, **I** = inspection at
countersignature or review.

| REQ | How P1 satisfies it | Section | DV hook |
|---|---|---|---|
| REQ-001 | Single-port memory contract; one access per cycle | §4.B, §6.2 | S + R |
| REQ-002 | Memory map, font region reserved | §6.1.1 | D |
| REQ-003 | V0–VF, VF as the flag register | §6.1.1 | D + R |
| REQ-004 | I is 12-bit | §6.1.1 | D |
| REQ-005 | PC 12-bit, updated exactly once per instruction in `S_EXEC` | §6.1.1, §6.2 | D + R |
| REQ-006 | Stack 16 × 12, dedicated; SP 0…16; popped entries not cleared | §6.1.1, §6.4.4 | D + R |
| REQ-007 | 2-byte big-endian instruction format | §6.1.1 | D |
| REQ-008 | Reset values for every element of architectural state | §6.1.1, §7.5 | D (Icarus lane) |
| REQ-009 | Reset does not alter memory | §6.1.1, §7.5 | D |
| REQ-010 | 12-bit address arithmetic modulo 4096 | §6.1.1 | D + F |
| REQ-011 | 8-bit register arithmetic modulo 256 | §6.1.1 | D + R |
| REQ-012 | RNG state is architectural, reset to `RNG_SEED` | §6.1.1, §6.5 | D |
| REQ-013 | Closure: the enumerated elements are the complete architectural state | §6.1.1 | I + R |
| REQ-014 | Construction-time memory image | §5.4, §6.1.1 | D |
| REQ-020 | Eight control states, no others affecting the timing contract | §6.2 | I |
| REQ-021 | `S_FETCH_HI` reads at PC | §6.2 | R |
| REQ-022 | `S_FETCH_LO` reads at PC+1 and captures the high byte | §6.2 | R |
| REQ-023 | `S_DECODE` captures the low byte and classifies; no access | §6.2 | R |
| REQ-024 | Exactly one `S_EXEC` per instruction; commits; issues the first memory access | §6.2 | R |
| REQ-025 | `S_MEM_WR` issues one write per cycle | §6.2 | D |
| REQ-026 | `S_MEM_RD` issues one read per cycle, capturing the previous | §6.2 | D |
| REQ-027 | `S_HALT` is terminal | §6.2, §9 | D + F |
| REQ-028 | The exact cycle table | §7.1 | D |
| REQ-029 | The retire contract | §7.7 | D + S |
| REQ-030 | Memory port idles in the named states | §6.2 | R |
| REQ-040 | Exhaustive, disjoint three-class partition of all 65536 encodings | §6.3 | D + F |
| REQ-041 | `DC_ILLEGAL` → halt, `ERR_ILLEGAL_OPCODE`, no state change | §6.3, §9 | D |
| REQ-042 | `DC_DEFERRED` → halt, `ERR_DEFERRED_OPCODE`, no state change | §6.3, §9 | D |
| REQ-043 | `0NNN` other than `00E0`/`00EE` is illegal | §6.3 | D |
| REQ-044 | Stack overflow fault | §9 | D + F |
| REQ-045 | Stack underflow fault | §9 | D + F |
| REQ-046 | Address-range fault on multi-byte spans, checked before any access | §9 | D + F |
| REQ-047 | Fault atomicity: nothing committed | §9 | D |
| REQ-048 | Halt is sticky; only reset exits | §9 | D |
| REQ-049 | No retire on fault; faulting instruction identified | §6.3, §9 | D |
| REQ-060 | `00EE` RET, with underflow check and no clear of the popped entry | §6.4.1 | D + R |
| REQ-061 | `1NNN` JP | §6.4.1 | D + R |
| REQ-062 | `2NNN` CALL, with overflow check; pushes PC+2 | §6.4.1 | D + R |
| REQ-063 | `3XNN` SE byte | §6.4.1 | D + R |
| REQ-064 | `4XNN` SNE byte | §6.4.1 | D + R |
| REQ-065 | `5XY0` SE reg | §6.4.1 | D + R |
| REQ-066 | `6XNN` LD byte | §6.4.2 | D + R |
| REQ-067 | `7XNN` ADD byte, **no** carry | §6.4.2 | D + R |
| REQ-068 | `8XY0` LD reg | §6.4.2 | D + R |
| REQ-069 | `8XY1` OR, with `QUIRK_VF_RESET` | §6.4.2 | D + R |
| REQ-070 | `8XY2` AND, with `QUIRK_VF_RESET` | §6.4.2 | D + R |
| REQ-071 | `8XY3` XOR, with `QUIRK_VF_RESET` | §6.4.2 | D + R |
| REQ-072 | `8XY4` ADD reg with carry | §6.4.2 | D + R |
| REQ-073 | `8XY5` SUB with not-borrow | §6.4.2 | D + R |
| REQ-074 | `8XY6` SHR, source per `QUIRK_SHIFT_SRC` | §6.4.2 | D + R |
| REQ-075 | `8XY7` SUBN | §6.4.2 | D + R |
| REQ-076 | `8XYE` SHL, source per `QUIRK_SHIFT_SRC` | §6.4.2 | D + R |
| REQ-077 | `9XY0` SNE reg | §6.4.1 | D + R |
| REQ-078 | `ANNN` LD I | §6.4.3 | D + R |
| REQ-079 | `BNNN` JP offset, per `QUIRK_JUMP_OFFSET` | §6.4.1 | D + R |
| REQ-080 | `CXNN` RND | §6.4.2, §6.5 | D + R |
| REQ-081 | `FX1E` ADD I, per `QUIRK_I_OVERFLOW_VF` | §6.4.3 | D + R |
| REQ-082 | `FX33` BCD, three bytes in ascending order | §6.4.3 | D |
| REQ-083 | `FX55` store, per `QUIRK_MEM_I_MODE` | §6.4.3 | D + R |
| REQ-084 | `FX65` load, per `QUIRK_MEM_I_MODE` | §6.4.3 | D + R |
| REQ-085 | VF write-ordering rule and the X = `0xF` corner | §6.4.2 | D |
| REQ-086 | Skips cost the same taken or untaken | §6.4.1, §7.1 | D |
| REQ-087 | Closure: no implicit VF behaviour | §6.4.2 | D + R |
| REQ-090 | `QUIRK_SHIFT_SRC`, default `SHIFT_SRC_VY` | §5.2 | D |
| REQ-091 | `QUIRK_JUMP_OFFSET`, default `JUMP_V0` | §5.2 | D |
| REQ-092 | `QUIRK_MEM_I_MODE`, three-valued, default `MEMI_INC_X_PLUS_1` | §5.2 | D |
| REQ-093 | `QUIRK_VF_RESET`, default 1 | §5.2 | D |
| REQ-094 | `QUIRK_I_OVERFLOW_VF`, default 0 | §5.2 | D |
| REQ-095 | All quirks default to 1977 COSMAC VIP; P1 verifies the default configuration only | §5.2 | I |
| REQ-096 | Quirks are compile-time with no run-time control path | §4.3, §5.2 | S + I |
| REQ-100 | Module inventory M01–M04 with fixed boundaries | §4.0 | I |
| REQ-101 | Memory port exposes no backpressure — structural | §4.B | S |
| REQ-102 | Memory read latency is exactly one cycle | §4.B, §7.4 | D |
| REQ-103 | The exact RNG sequence, seed non-zero | §6.5 | D + R |
| REQ-104 | RNG advances only on `CXNN` execution | §6.5 | D + R |
| REQ-105 | The observation bundle and its bit mappings | §4.A, §4.C | S + I |
| REQ-106 | Observation outputs have no functional effect | §4.C | I |
| REQ-107 | The shared package's normative content | §5.5 | I |
| REQ-108 | The package contains no behaviour | §5.5 | I |
| REQ-109 | Every shared value has exactly one definition site | §5.5 | I |
| REQ-110 | The error-code enumeration | §5.5, §9 | D |
| REQ-111 | `THROTTLE_DIV` = 0 in P1; the throttle insertion point is constrained now | §5.3, §7.7 | I |
| REQ-112 | Closure: no port other than those tabulated | §4.A–§4.D | I |
| REQ-113 | `OBS_ENABLE` = 0 zeroes the observation outputs and changes nothing else | §5.3 | D |
| REQ-114 | Memory observation contract: M02's storage is the array `mem` | §4.C | S + I |
| REQ-120 | Full architectural state observable at every retirement | §4.C, §7.7 | S |
| REQ-121 | Divergence localisation via `obs_instr` / `obs_instr_addr` | §4.A, §7.7 | D |
| REQ-122 | Stimulus classes the campaign covers | §8 | I |
| REQ-123 | Determinism for a given image, parameters and seed | §8 | R |
| REQ-124 | Every REQ above has a row in this table and a row in `docs/specs/requirements.md`, whose test-id and evidence cells are filled by `P1-module-ready` | §10, §11 D-1 | I |

**Count: 90 requirements.** Written as an enumeration, not as a count that
would go stale — the table above is the registry, and this sentence is a
reading of it (L-D12).

---

## 11. Deferred items and open questions

**This specification is a DRAFT.** Per SPEC-TEMPLATE §11 a DRAFT may carry
open questions and a FROZEN spec may not; **every** OQ row below must be
resolved — or converted into a deferred item with a stated
what-a-reader-assumes-meanwhile — before `P1-spec-freeze` can sign. The rows
are the enumeration; a sentence counting them would go stale (L-D12).

**Changed by WO-0003** (`J-architect_docs_lead-0002`, 2026-08-05): **D-1** and
**D-2** are landed; **D-7** and **OQ-4** are new, both raised by
[`ADR-0018`](../adr/ADR-0018-p1-core-cpu-design-choices.md) while writing the
rationale for choices already made. **No specified behaviour changed** — OQ-4
in particular is recorded rather than answered, because answering it is a spec
revision and a separate work order. **OQ-4 is the one that blocks the freeze.**

### Deferred items

| # | Item | Status · what a reader assumes meanwhile | Tracked as | Owner | Closes by |
|---|---|---|---|---|---|
| D-1 | `docs/specs/requirements.md` and the requirement→test traceability matrix do not exist. WO-0002 scoped this deliverable to one spec file. | ✅ **LANDED** 2026-08-05 (WO-0003, `J-architect_docs_lead-0002`) · `docs/specs/requirements.md` carries all 90 P1 rows with `dv_lead`'s test-id and evidence columns unfilled, as expected at spec time. **§10 of this document remains the authoritative registry**; the matrix indexes it and restates nothing. | — | architect_docs_lead | Test-id and evidence cells filled by `P1-module-ready` (charter §6) |
| D-2 | An ADR is owed for the five non-obvious choices this spec embodies: halt-on-illegal-opcode; fault-rather-than-wrap on multi-byte address spans; the specified deterministic RNG; the fully-specified reset of all architectural state; and the observation interface as a specification-mandated port set. Charter §5 makes an ADR a freeze precondition. | ✅ **LANDED** 2026-08-05 (WO-0003, `J-architect_docs_lead-0002`) · [`ADR-0018`](../adr/ADR-0018-p1-core-cpu-design-choices.md) records all five with alternatives, costs, the PROTOCOL §11 corpus verdict, and a falsifier each. It **changes no specified behaviour**; the two problems it surfaced are D-7 and OQ-4 below. | — | architect_docs_lead | Closed |
| D-3 | `rtl/chip8_pkg.sv` is authored by `rtl_lead`; `rtl/**` is outside this author's write scope (PROTOCOL §6). | **DEFERRED** · §5.5 is the normative content; the file must match it exactly and adds nothing. | The first P1 RTL work order | rtl_lead | `P1-module-ready` |
| D-4 | The 500–1000 instruction/second throttle is not implemented in P1. | **DEFERRED** · `THROTTLE_DIV = 0`, the core issues instructions back-to-back, and REQ-111 already fixes where the mechanism may be inserted so it cannot disturb anything frozen here. | Carry-forward row; P3 scope | architect_docs_lead | `P3-spec-freeze` |
| D-5 | The 4209 `DC_DEFERRED` encodings become implemented in P2 and P3, which changes §6.3 of this frozen spec. | **DEFERRED** · in P1 they halt with `ERR_DEFERRED_OPCODE`; the change is a **spec diff plus an ADR** recorded in §13, never an edit. | §13 of this file | architect_docs_lead | `P2-spec-freeze`, `P3-spec-freeze` |
| D-6 | No compile-checked interface evidence exists, by ADR-0017 Consequence 1. | **DEFERRED** · §4's port tables are the normative interface; the compensating controls are the line-by-line countersignature and the single-definition-site package (§5.5). | §12 freeze record | dv_lead (countersignature) | `P1-spec-freeze` |
| D-7 | The quirk-parameter set of §5.2 may be short by one: interpreter behaviour on unknown opcodes is divergent across the population, and README's P4 row requires "**every** divergent CHIP-8 behaviour" to be a compile-time parameter. Raised by ADR-0018 §7.1. | **DEFERRED** · P1 halts (REQ-041/REQ-042) and no such parameter exists; the requirements are unambiguous and nobody is blocked. The reading is arguable — the community quirk tables enumerate divergences in the semantics of CHIP-8 *instructions*, and these encodings are not instructions — and the evidence that would settle it (a conformant test ROM needing no-op) does not exist before P4. | ADR-0018 §7.1; board line owed | architect_docs_lead | `P4-spec-freeze` |

### Open questions (must be closed before freeze)

| # | Question | Why it is not decided here | Routing |
|---|---|---|---|
| OQ-1 | Should `DC_DEFERRED` encodings **halt** (this spec's decision) or behave as a no-operation so that partially-covered programs can run further in P1? | It is a verification-strategy question that belongs to the party who writes the lockstep campaign, and it is cheap to change **before** freeze and expensive after. This spec carries "halt" as its default and states the argument in REQ-042. | `dv_lead`, at the testability countersignature |
| OQ-2 | Which phase owns the instruction-issue throttle? README records the rate in the scope parameters but assigns it to no phase row. | Assigning intake-recorded work to a phase is a scope statement, and this author does not invent one. This spec assumes **P3** (the timing phase) and is correct either way, since P1 is unaffected. If the sponsor intends P1, that is an **E2**. | orchestrator → sponsor if P1 is intended |
| OQ-3 | The five quirk defaults, and the CHIP-8 behavioural facts generally, are provenance class **relayed** — from the intake's consult-only references, none of which was retrieved during authorship. **A wrong default here is invisible to P1 by construction**: the RTL and the Python golden model are both derived from this document (the intake independence rider), so they would agree with each other about any error it contains. | Verifying them requires the community test-ROM suite, which README assigns to P4. There is no P1 experiment that can settle it. | Recorded here as a standing risk; **P4's test-ROM campaign is the compensating control**, and it is the point at which these values become *measured*. `dv_lead` may wish to note it in the countersignature |
| OQ-4 | **What are the contents of memory at the first fetch when `MEM_INIT_FILE` names an image shorter than 4096 bytes?** REQ-014 and §5.4 state the all-zero guarantee only for `MEM_INIT_FILE = ""`; for a partial image — which is every realistic P1 image — neither clause says what the remaining bytes hold, and §6.6 frees M02's realisation among three mechanisms that differ precisely in their answer. | Answering it is a change to specified behaviour, which is a spec revision and therefore a new work order — WO-0003 (which raised it) expressly excludes changing what this document specifies, and an edit smuggled through an ADR is the thing that packet was drafted to prevent. **The consequences are stated so nobody has to rediscover them**: (a) **REQ-123 is falsified as written** — it claims no uninitialised storage anywhere in P1, and 32768 bits have no specified initial value; (b) Verilator is 2-state and reads unwritten locations as `0`, so the fast lane where the long campaigns run is green while Icarus reads `X`; (c) the Python golden model has no `X` and will zero-fill, so the first read of unwritten memory in the Icarus lane is a **false divergence caused by this document**, not by the RTL. | **Blocks `P1-spec-freeze`** (SPEC-TEMPLATE §11 bars freezing a spec carrying an open question). Raised in ADR-0018 §7.2; routed to the orchestrator for a board line and a spec-revision packet. `dv_lead` should read it before the countersignature — it bears directly on the lockstep's first instruction |

Per **L-E10**, open questions are artifacts on the program board, not items
buried in a document. This author cannot stage `tasks/BOARD.md` (PROTOCOL §6);
OQ-1, OQ-2 and OQ-3 were handed to the orchestrator in the return of WO-0002
and carry board lines. **OQ-4 and D-7 are handed over in the return of
WO-0003** and owe board lines of their own — OQ-4 as a freeze blocker with a
spec-revision packet behind it, D-7 as a P4 carry-forward.

---

## 12. Freeze record

Filled in at `P1-spec-freeze`. All four rows are required and all four are
empty: **this specification is not frozen.**

| Item | Value |
|---|---|
| Interface check | **Fallback regime** (ADR-0017 Consequence 1): reviewed port tables §4.A–§4.D, `J-dv_lead-____`. There is no compile-check CI run for this program and none is owed. |
| Architect signature | `J-architect_docs_lead-____` |
| dv_lead testability countersignature | `J-dv_lead-____` |
| Frozen at | SHA `________`, gate `docs/gates/P1-spec-freeze-checklist.md` |

---

## 13. Change log

Post-freeze changes only. Each row cites the ADR that authorised it; a
breaking interface change is counted against post-freeze churn.

| Date | Change | Breaking? | ADR | Journal |
|---|---|---|---|---|
| — | *(none — not yet frozen)* | — | — | — |
