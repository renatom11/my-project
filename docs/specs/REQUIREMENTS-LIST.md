# P1 requirements — flat list

<!-- GENERATED FILE — do not edit by hand.
     Regenerate: node scripts/gen_req_list.mjs -->

**91 requirements.** Source: [`SPEC-P1-core-cpu.md`](SPEC-P1-core-cpu.md),
frozen at `b9fd9c6`; sponsor gate `P1-spec-freeze` is **NOT YET SIGNED**.

**This list is NON-NORMATIVE.** It is a view of the specification, generated
from it mechanically. Where the two differ the specification wins, and the
difference is a defect in this generator. Each entry cites the section that
binds; the DV hook letter says what kind of check can observe the requirement
(**D** directed vector, **R** constrained-random stream, full-state compare, **F** formal property (P4), **S** structural, **I** inspection at countersignature or review).

> **6 of 91 requirements are not quoted below.**
> The specification defines them as a label over a table, as a table, or as a
> citation inside another requirement's prose — there is no self-contained
> sentence to quote, and writing one here would put text in circulation that
> the frozen spec does not contain. They are listed with their section instead:
> `REQ-002` (§6.1.1), `REQ-028` (§7.1), `REQ-096` (§4.3, §5.2), `REQ-101` (§4.B), `REQ-107` (§5.5), `REQ-124` (§10, §11 D-1).

---

## Architectural state, memory map, reset (§6.1.1, §5.4, §7.5) — 14

- **REQ-001** — **Port:** `mem_addr` · **Dir:** out · **Width:** `ADDR_W` · **Meaning:** Byte address of the requested access. Meaningful only while `mem_en` is high.  
  <sub>§4.B, §6.2 · hook SD · Single-port memory contract; one access per cycle</sub>
- **REQ-002** — _stated in §6.1.1; see the specification._  
  <sub>§6.1.1 · hook D · Memory map, font region reserved</sub>
- **REQ-003** — **Element:** V0…VF · **Size:** 16 × 8 · **Notes:** VF is the carry/borrow flag; it is an ordinary register in every other respect (REQ-003)  
  <sub>§6.1.1 · hook DR · V0–VF, VF as the flag register</sub>
- **REQ-004** — **Element:** I · **Size:** 12 bit · **Notes:** Index register (REQ-004)  
  <sub>§6.1.1 · hook D · I is 12-bit</sub>
- **REQ-005** — **Element:** PC · **Size:** 12 bit · **Notes:** Program counter (REQ-005)  
  <sub>§6.1.1, §6.2 · hook DR · PC 12-bit, updated exactly once per instruction in `S_EXEC`</sub>
- **REQ-006** — **Element:** SP · **Size:** `SP_W` (default 5) · **Notes:** Number of entries on the stack, 0…`STACK_DEPTH`; `stack[SP]` is the next free slot (REQ-006)  
  <sub>§6.1.1, §6.4.4 · hook DR · Stack `STACK_DEPTH` × `ADDR_W`, dedicated; SP 0…`STACK_DEPTH`; popped entries not cleared</sub>
- **REQ-007** — **Instruction format.** Instructions are fixed 2-byte, big-endian: the instruction at address A is `{M[A], M[A+1]}` — the byte at the **lower** address is the high byte. Instructions are not required to be aligned to even addresses; `1NNN` may target an odd address and the machine fetches from there.  
  <sub>§6.1.1 · hook D · 2-byte big-endian instruction format</sub>
- **REQ-008** — **Reset.** `rst_n` is sampled synchronously. In the first cycle after a rising edge at which `rst_n` was low, and in every such cycle: PC → `PROG_START` (`0x200`) · I → `0x000` · SP → 0 · V0…VF → all `8'h00` · stack[0]…stack[`STACK_DEPTH`−1] → all `12'h000` · RNG state → `RNG_SEED` · `halted` → 0 · `err` → `ERR_NONE` · FSM → `S_RESET`, leaving to `S_FETCH_HI` in the first cycle `rst_n` is high  
  <sub>§6.1.1, §7.5 · hook D · Reset values for every element of architectural state</sub>
- **REQ-009** — **Reset does not alter memory.** RAM contents survive reset; the image is established at construction (REQ-014).  
  <sub>§6.1.1, §7.5 · hook D · Reset does not alter memory</sub>
- **REQ-010** — **12-bit address arithmetic wraps.** PC and I are 12-bit registers. Any single-target update of either — `PC + 2`, `PC + 4`, a `1NNN`/`BNNN` target, `I + V<x>` — is taken **modulo 4096**. There is no fault for a wrapped single target, because a 12-bit register physically cannot leave the address space and a fault that can never distinguish anything is a decode path with no verification value. Multi-byte spans are a different case and **do** fault, see REQ-046.  
  <sub>§6.1.1 · hook DF · 12-bit address arithmetic modulo 4096</sub>
- **REQ-011** — **8-bit register arithmetic wraps.** Every write to a V register is modulo 256. Where an instruction also specifies a flag, the flag carries the information the truncation discarded.  
  <sub>§6.1.1 · hook DR · 8-bit register arithmetic modulo 256</sub>
- **REQ-012** — **RNG state.** Part of the architectural state, reset to `RNG_SEED`, advanced only by `CXNN` (REQ-104).  
  <sub>§6.1.1, §6.5 · hook D · RNG state is architectural, reset to `RNG_SEED`</sub>
- **REQ-013** — **Closure.** The elements above are the **complete** architectural state of the P1 machine. Any other storage in an implementation (the instruction register, the loop counter, the FSM state register) is transient: it SHALL have no effect on the machine's behaviour at an instruction boundary, and a full-state comparison that ignores it is complete. This clause is what makes "full architectural-state compare after every instruction" a well-defined test rather than an aspiration.  
  <sub>§6.1.1 · hook IR · Closure: the enumerated elements are the complete architectural state</sub>
- **REQ-014** — **Memory image, and every location the image does not cover.** Memory is **fully specified at time zero**, for every value of `MEM_INIT_FILE`, in two clauses: **Every one of the 4096 locations SHALL hold `8'h00` at time zero**, before any image is applied. · **The image named by `MEM_INIT_FILE` is then applied over that**: each location the image covers holds the image's byte for it; each location the image does **not** cover retains `8'h00` from clause 1. When `MEM_INIT_FILE` is `""` no image is applied and all 4096 locations hold `8'h00`, which is the same rule and not a special case.  
  <sub>§6.1.1, §5.4 · hook D · Construction-time memory image; all 4096 locations specified at time zero, covered or not</sub>

## Control FSM, cycle counts, retire contract (§6.2, §7.1, §7.7) — 11

- **REQ-020** — **Completeness.** The eight states above are the complete set of control phases visible in this specification's timing contract. An implementation may not add a phase that changes any cycle count in §7.1.  
  <sub>§6.2 · hook D · Eight control states, no others affecting the timing contract</sub>
- **REQ-021** — **State:** `S_FETCH_HI` · **Entered when:** Reset release; or from `S_EXEC`, `S_MEM_WR`, `S_MEM_RD` at instruction completion · **Does:** Latches the instruction address for `obs_instr_addr`; drives `obs_retire` for the just-completed instruction · **Memory access issued:** **read** at `PC` · **Leaves to:** `S_FETCH_LO`, unconditionally  
  <sub>§6.2 · hook D · `S_FETCH_HI` reads at PC</sub>
- **REQ-022** — **State:** `S_FETCH_LO` · **Entered when:** From `S_FETCH_HI` · **Does:** Captures the instruction's high byte from `mem_rdata` · **Memory access issued:** **read** at `(PC + 1) mod 4096` · **Leaves to:** `S_DECODE`, unconditionally  
  <sub>§6.2 · hook D · `S_FETCH_LO` reads at PC+1 and captures the high byte</sub>
- **REQ-023** — **State:** `S_DECODE` · **Entered when:** From `S_FETCH_LO` · **Does:** Captures the instruction's low byte; classifies the complete 16-bit encoding per §6.3 · **Memory access issued:** **none** · **Leaves to:** `S_EXEC` when the class is `DC_IMPLEMENTED`; `S_HALT` when it is `DC_ILLEGAL` or `DC_DEFERRED`  
  <sub>§6.2 · hook D · `S_DECODE` captures the low byte and classifies; no access</sub>
- **REQ-024** — **State:** `S_EXEC` · **Entered when:** From `S_DECODE` · **Does:** **Exactly one such cycle per instruction.** Commits every architectural effect of a register-class instruction, including the PC update. For a memory-class instruction, commits the non-memory effects and issues the **first** memory access. Detects the runtime faults of §9 · **Memory access issued:** **none** for a register-class instruction; the **first write** of `FX33`/`FX55`; the **first read** of `FX65` · **Leaves to:** `S_FETCH_HI` (register class, and `FX55` with X = 0); `S_MEM_WR` (`FX33`, `FX55` with X ≥ 1); `S_MEM_RD` (`FX65`, always); `S_HALT` on a runtime fault  
  <sub>§6.2 · hook D · Exactly one `S_EXEC` per instruction; commits; issues the first memory access</sub>
- **REQ-025** — **State:** `S_MEM_WR` · **Entered when:** From `S_EXEC` or from itself · **Does:** Issues the next byte write of the instruction's write sequence · **Memory access issued:** **one write** · **Leaves to:** itself while bytes remain; `S_FETCH_HI` on the last  
  <sub>§6.2 · hook D · `S_MEM_WR` issues one write per cycle</sub>
- **REQ-026** — **State:** `S_MEM_RD` · **Entered when:** From `S_EXEC` or from itself · **Does:** Captures the byte read by the previous cycle's access into the next destination register, and issues the next read if one remains · **Memory access issued:** **one read**, or none in the final cycle · **Leaves to:** itself while bytes remain; `S_FETCH_HI` on the last  
  <sub>§6.2 · hook D · `S_MEM_RD` issues one read per cycle, capturing the previous</sub>
- **REQ-027** — **State:** `S_HALT` · **Entered when:** From `S_DECODE` (decode fault) or `S_EXEC` (runtime fault) · **Does:** Holds `obs_halted` high and `obs_err` at the fault code. **Terminal.** · **Memory access issued:** **none**, ever · **Leaves to:** itself. The **only** exit is `S_RESET`  
  <sub>§6.2, §9 · hook DF · `S_HALT` is terminal</sub>
- **REQ-028** — _stated in §7.1; see the specification._  
  <sub>§7.1 · hook D · The exact cycle table</sub>
- **REQ-029** — **The retire contract.** This clause exists because ADR-0017 Amendment A2 §5 names "how many edges does one model step correspond to?" as the question most likely to produce false divergences in P1, and a specification that leaves it to the bench author has left the program's main verification instrument undefined.  
  <sub>§7.7 · hook DS · The retire contract</sub>
- **REQ-030** — **The memory port idles** in `S_RESET`, `S_DECODE`, `S_HALT`, in any `S_EXEC` of a register-class instruction, and in the final cycle of an `S_MEM_RD` sequence: `mem_en` is low in every one of those cycles. Combined with the fact that no state issues more than one access, this is the requirement that discharges the single-port invariant behaviourally, as §4.B discharges it structurally.  
  <sub>§6.2 · hook D · Memory port idles in the named states</sub>

## Decode classification and fault behaviour (§6.3, §9) — 10

- **REQ-040** — **Three classes, exhaustive and disjoint.** Every one of the 65536 16-bit encodings falls into exactly one of: `DC_IMPLEMENTED` — a P1 instruction; executes per §6.4. · `DC_DEFERRED` — a legal CHIP-8 instruction whose implementation README assigns to P2 or P3. · `DC_ILLEGAL` — not an instruction of the 35-instruction set.  
  <sub>§6.3 · hook DF · Exhaustive, disjoint three-class partition of all 65536 encodings</sub>
- **REQ-041** — **`DC_ILLEGAL` behaviour.** The machine SHALL enter `S_HALT` from `S_DECODE` with `err = ERR_ILLEGAL_OPCODE`, **before any architectural state is modified by the offending instruction** — including PC, which still holds the address of the offending instruction's first byte, because the PC update happens in `S_EXEC` and `S_EXEC` is never entered (REQ-005).  
  <sub>§6.3, §9 · hook D · `DC_ILLEGAL` → halt, `ERR_ILLEGAL_OPCODE`, no state change</sub>
- **REQ-042** — **`DC_DEFERRED` behaviour.** Identical to REQ-041 except that `err = ERR_DEFERRED_OPCODE`. The distinct code exists so a P1 test can tell "not yet built" from "not a CHIP-8 instruction" — the first is a phase boundary and the second is a program defect, and collapsing them would make every P1 test of the illegal space also pass on a decoder that has forgotten `DXYN` exists. When P2 and P3 implement these encodings, the change to this section is a **spec diff plus an ADR** recorded in §13, not an edit (§11 D-5).  
  <sub>§6.3, §9 · hook D · `DC_DEFERRED` → halt, `ERR_DEFERRED_OPCODE`, no state change</sub>
- **REQ-043** — **`0NNN` (SYS) disposition.** Every `0NNN` encoding other than `00E0` and `00EE` is `DC_ILLEGAL`. On the original machine `0NNN` called a native 1802 machine-language routine at `NNN`. This design contains no 1802 and cannot execute one, so the instruction is unimplementable rather than merely unimplemented. Treating it as a no-operation was rejected: reaching a `0NNN` encoding almost always means the program counter has walked into data, and a silent no-op turns that into a machine that runs on quietly executing garbage, which is the failure mode hardest to diagnose from a lockstep divergence thousands of instructions later. `0x0000` — the encoding a run of blank memory produces — is `DC_ILLEGAL` and halts, which is the useful behaviour.  
  <sub>§6.3 · hook D · `0NNN` other than `00E0`/`00EE` is illegal</sub>
- **REQ-044** — **Condition:** `2NNN` with SP = `STACK_DEPTH` · **Strobe / indication:** `obs_halted` rises; `obs_err = ERR_STACK_OVERFLOW` · **Effect on execution:** Halt from `S_EXEC`; the push does not happen, SP and PC unchanged  
  <sub>§9 · hook DF · Stack overflow fault</sub>
- **REQ-045** — **Condition:** `00EE` with SP = 0 · **Strobe / indication:** `obs_halted` rises; `obs_err = ERR_STACK_UNDERFLOW` · **Effect on execution:** Halt from `S_EXEC`; the pop does not happen, SP and PC unchanged  
  <sub>§9 · hook DF · Stack underflow fault</sub>
- **REQ-046** — **REQ-046's alternative, recorded as rejected.** Wrapping a multi-byte span modulo 4096 instead of faulting was considered and rejected: an `FX55` at I = `0xFFE` would then silently write into the font region at `0x000`, turning a program defect into memory corruption with no indication, and it would make P4's signed formal property "I never addresses out of range" **vacuous** — true by the 12-bit width of the address rather than by anything the design does. The fault makes the property non-vacuous and the defect observable. Single-target address updates still wrap (REQ-010), because there the wrap is the physical behaviour of a 12-bit register and no span is crossed.  
  <sub>§9 · hook DF · Address-range fault on multi-byte spans, checked before any access</sub>
- **REQ-047** — **Fault atomicity.** A faulting instruction commits **nothing**: no register write, no memory write, no SP change, and no PC update. This is achievable for every condition above because each is detectable before the instruction's first commit — decode faults before `S_EXEC` is entered, and the three runtime faults from state the machine already holds when `S_EXEC` begins.  
  <sub>§9 · hook D · Fault atomicity: nothing committed</sub>
- **REQ-048** — **Halt is terminal and sticky.** Once halted, `obs_halted` stays high and `obs_err` holds its code until reset; the memory port issues nothing; no further instruction is fetched. The only exit is `rst_n`.  
  <sub>§9 · hook D · Halt is sticky; only reset exits</sub>
- **REQ-049** — **Fault observability.** On any fault, `obs_retire` SHALL NOT be asserted for the faulting instruction, and `obs_instr` / `obs_instr_addr` SHALL hold the faulting instruction's encoding and address for as long as the machine is halted.  
  <sub>§6.3, §9 · hook D · No retire on fault; faulting instruction identified</sub>

## Instruction semantics (§6.4) — 28

- **REQ-060** — **Encoding:** `00EE` · **Name:** RET · **Effect:** If SP = 0 → `ERR_STACK_UNDERFLOW` (REQ-045). Otherwise SP ← SP − 1, then PC ← stack[SP] (the entry at the **new** SP). The popped entry's stored value is **not** cleared (REQ-006).  
  <sub>§6.4.1 · hook DR · `00EE` RET, with underflow check and no clear of the popped entry</sub>
- **REQ-061** — **Encoding:** `1NNN` · **Name:** JP addr · **Effect:** PC ← `NNN`.  
  <sub>§6.4.1 · hook DR · `1NNN` JP</sub>
- **REQ-062** — **Encoding:** `2NNN` · **Name:** CALL addr · **Effect:** If SP = `STACK_DEPTH` → `ERR_STACK_OVERFLOW` (REQ-044). Otherwise stack[SP] ← PC + 2 (the address of the instruction **after** the call), SP ← SP + 1, PC ← `NNN`.  
  <sub>§6.4.1 · hook DR · `2NNN` CALL, with overflow check; pushes PC+2</sub>
- **REQ-063** — **Encoding:** `3XNN` · **Name:** SE V\<x\>, byte · **Effect:** PC ← PC + 4 if V\<x\> = `NN`, else PC + 2.  
  <sub>§6.4.1 · hook DR · `3XNN` SE byte</sub>
- **REQ-064** — **Encoding:** `4XNN` · **Name:** SNE V\<x\>, byte · **Effect:** PC ← PC + 4 if V\<x\> ≠ `NN`, else PC + 2.  
  <sub>§6.4.1 · hook DR · `4XNN` SNE byte</sub>
- **REQ-065** — **Encoding:** `5XY0` · **Name:** SE V\<x\>, V\<y\> · **Effect:** PC ← PC + 4 if V\<x\> = V\<y\>, else PC + 2.  
  <sub>§6.4.1 · hook DR · `5XY0` SE reg</sub>
- **REQ-066** — **Encoding:** `6XNN` · **Name:** LD · **Effect on V\<x\>:** V\<x\> ← `NN` · **Effect on VF:** none  
  <sub>§6.4.2 · hook DR · `6XNN` LD byte</sub>
- **REQ-067** — **Encoding:** `7XNN` · **Name:** ADD byte · **Effect on V\<x\>:** V\<x\> ← (V\<x\> + `NN`) mod 256 · **Effect on VF:** **none** — this instruction does not set a carry  
  <sub>§6.4.2 · hook DR · `7XNN` ADD byte, **no** carry</sub>
- **REQ-068** — **Encoding:** `8XY0` · **Name:** LD reg · **Effect on V\<x\>:** V\<x\> ← V\<y\> · **Effect on VF:** none  
  <sub>§6.4.2 · hook DR · `8XY0` LD reg</sub>
- **REQ-069** — **Encoding:** `8XY1` · **Name:** OR · **Effect on V\<x\>:** V\<x\> ← V\<x\> \ · **Effect on VF:** V\<y\> · VF ← 0 if `QUIRK_VF_RESET`, else none  
  <sub>§6.4.2 · hook DR · `8XY1` OR, with `QUIRK_VF_RESET`</sub>
- **REQ-070** — **Encoding:** `8XY2` · **Name:** AND · **Effect on V\<x\>:** V\<x\> ← V\<x\> & V\<y\> · **Effect on VF:** VF ← 0 if `QUIRK_VF_RESET`, else none  
  <sub>§6.4.2 · hook DR · `8XY2` AND, with `QUIRK_VF_RESET`</sub>
- **REQ-071** — **Encoding:** `8XY3` · **Name:** XOR · **Effect on V\<x\>:** V\<x\> ← V\<x\> ^ V\<y\> · **Effect on VF:** VF ← 0 if `QUIRK_VF_RESET`, else none  
  <sub>§6.4.2 · hook DR · `8XY3` XOR, with `QUIRK_VF_RESET`</sub>
- **REQ-072** — **Encoding:** `8XY4` · **Name:** ADD reg · **Effect on V\<x\>:** V\<x\> ← (V\<x\> + V\<y\>) mod 256 · **Effect on VF:** VF ← 1 if V\<x\> + V\<y\> > 255, else 0  
  <sub>§6.4.2 · hook DR · `8XY4` ADD reg with carry</sub>
- **REQ-073** — **Encoding:** `8XY5` · **Name:** SUB · **Effect on V\<x\>:** V\<x\> ← (V\<x\> − V\<y\>) mod 256 · **Effect on VF:** VF ← 1 if V\<x\> ≥ V\<y\>, else 0 (**not** the borrow)  
  <sub>§6.4.2 · hook DR · `8XY5` SUB with not-borrow</sub>
- **REQ-074** — **Encoding:** `8XY6` · **Name:** SHR · **Effect on V\<x\>:** `SHIFT_SRC_VY`: V\<x\> ← V\<y\> >> 1. `SHIFT_SRC_VX`: V\<x\> ← V\<x\> >> 1 · **Effect on VF:** VF ← bit 0 of the **source before the shift** (V\<y\> or V\<x\> per the parameter)  
  <sub>§6.4.2 · hook DR · `8XY6` SHR, source per `QUIRK_SHIFT_SRC`</sub>
- **REQ-075** — **Encoding:** `8XY7` · **Name:** SUBN · **Effect on V\<x\>:** V\<x\> ← (V\<y\> − V\<x\>) mod 256 · **Effect on VF:** VF ← 1 if V\<y\> ≥ V\<x\>, else 0  
  <sub>§6.4.2 · hook DR · `8XY7` SUBN</sub>
- **REQ-076** — **Encoding:** `8XYE` · **Name:** SHL · **Effect on V\<x\>:** `SHIFT_SRC_VY`: V\<x\> ← (V\<y\> << 1) mod 256. `SHIFT_SRC_VX`: V\<x\> ← (V\<x\> << 1) mod 256 · **Effect on VF:** VF ← bit 7 of the **source before the shift**  
  <sub>§6.4.2 · hook DR · `8XYE` SHL, source per `QUIRK_SHIFT_SRC`</sub>
- **REQ-077** — **Encoding:** `9XY0` · **Name:** SNE V\<x\>, V\<y\> · **Effect:** PC ← PC + 4 if V\<x\> ≠ V\<y\>, else PC + 2.  
  <sub>§6.4.1 · hook DR · `9XY0` SNE reg</sub>
- **REQ-078** — **Encoding:** `ANNN` · **Name:** LD I · **Effect:** I ← `NNN`. VF unchanged.  
  <sub>§6.4.3 · hook DR · `ANNN` LD I</sub>
- **REQ-079** — **Encoding:** `BNNN` · **Name:** JP offset · **Effect:** `QUIRK_JUMP_OFFSET = JUMP_V0`: PC ← `NNN` + V0. `= JUMP_VX`: PC ← `XNN` + V\<x\>, where `XNN` is the low 12 bits of the encoding read as `X` in [11:8] — i.e. the same 12 bits, with the register selected by them rather than V0. Both modulo 4096.  
  <sub>§6.4.1 · hook DR · `BNNN` JP offset, per `QUIRK_JUMP_OFFSET`</sub>
- **REQ-080** — **Encoding:** `CXNN` · **Name:** RND · **Effect on V\<x\>:** V\<x\> ← `rnd` & `NN`, where `rnd` is defined in §6.5 · **Effect on VF:** none  
  <sub>§6.4.2, §6.5 · hook DR · `CXNN` RND</sub>
- **REQ-081** — **Encoding:** `FX1E` · **Name:** ADD I · **Effect:** I ← (I + V\<x\>) mod 4096. `QUIRK_I_OVERFLOW_VF = 1`: VF ← 1 if I + V\<x\> > `0x0FFF`, else 0. `= 0`: VF unchanged.  
  <sub>§6.4.3 · hook DR · `FX1E` ADD I, per `QUIRK_I_OVERFLOW_VF`</sub>
- **REQ-082** — **Encoding:** `FX33` · **Name:** BCD · **Effect:** M[I] ← V\<x\> / 100; M[I+1] ← (V\<x\> / 10) mod 10; M[I+2] ← V\<x\> mod 10, integer division. Written in that address order, one byte per cycle. I unchanged. VF unchanged. Faults `ERR_ADDR_RANGE` if I + 2 > `0xFFF` (REQ-046).  
  <sub>§6.4.3 · hook D · `FX33` BCD, three bytes in ascending order</sub>
- **REQ-083** — **Encoding:** `FX55` · **Name:** store · **Effect:** M[I + k] ← V\<k\> for k = 0…X, in ascending k, one byte per cycle. Then I per `QUIRK_MEM_I_MODE`: `MEMI_INC_X_PLUS_1` → I ← I + X + 1; `MEMI_INC_X` → I ← I + X; `MEMI_UNCHANGED` → I unchanged. VF unchanged unless X = `0xF`, in which case VF is one of the registers stored and is itself unchanged. Faults `ERR_ADDR_RANGE` if I + X > `0xFFF`.  
  <sub>§6.4.3 · hook DR · `FX55` store, per `QUIRK_MEM_I_MODE`</sub>
- **REQ-084** — **Encoding:** `FX65` · **Name:** load · **Effect:** V\<k\> ← M[I + k] for k = 0…X, in ascending k, one byte per cycle. Then I per `QUIRK_MEM_I_MODE`, exactly as `FX55`. When X = `0xF`, VF is one of the registers **loaded**. Faults `ERR_ADDR_RANGE` if I + X > `0xFFF`.  
  <sub>§6.4.3 · hook DR · `FX65` load, per `QUIRK_MEM_I_MODE`</sub>
- **REQ-085** — **The VF write-ordering rule, and the X = F corner.** In every `8XYn`, and in every other instruction that specifies both a result and a flag, the result is written to V\<x\> **first** and the flag is written to VF **second**. The consequence is normative and is the thing a decode table most often gets wrong: **when X = `0xF`, the final content of VF is the flag, not the arithmetic result.** `8FF4`, `8F16`, `8F25` and their relatives are legal encodings and behave exactly as this rule says. Where an instruction specifies no flag (`8XY0`, and `8XY1`/`8XY2`/`8XY3` with `QUIRK_VF_RESET = 0`), X = `0xF` simply leaves the result in VF.  
  <sub>§6.4.2 · hook D · VF write-ordering rule and the X = `0xF` corner</sub>
- **REQ-086** — **Skips are constant-time.** A taken skip and an untaken skip cost the same number of cycles (§7.1). No instruction's cycle count depends on data. This is a requirement, not an implementation note: it makes the timing contract a single number per instruction and gives P4's formal work a machine with no data-dependent control-flow timing.  
  <sub>§6.4.1, §7.1 · hook D · Skips cost the same taken or untaken</sub>
- **REQ-087** — **Closure on VF.** An instruction that this section does not describe as writing VF SHALL leave VF unchanged. There is no implicit flag behaviour anywhere in P1.  
  <sub>§6.4.2 · hook DR · Closure: no implicit VF behaviour</sub>

## Quirk parameters (§5.2) — 7

- **REQ-090** — **Parameter:** `QUIRK_SHIFT_SRC` · **Type:** enum · **Default (VIP):** `SHIFT_SRC_VY` — the shift reads V\<y\> · **Other permitted values:** `SHIFT_SRC_VX` — the shift reads V\<x\> (CHIP-48 / SUPER-CHIP) · **Instructions bound:** `8XY6`, `8XYE`  
  <sub>§5.2 · hook D · `QUIRK_SHIFT_SRC`, default `SHIFT_SRC_VY`</sub>
- **REQ-091** — **Parameter:** `QUIRK_JUMP_OFFSET` · **Type:** enum · **Default (VIP):** `JUMP_V0` — target is `NNN + V0` · **Other permitted values:** `JUMP_VX` — target is `XNN + V<x>`, i.e. the `BXNN` reading (CHIP-48 / SUPER-CHIP) · **Instructions bound:** `BNNN`  
  <sub>§5.2 · hook D · `QUIRK_JUMP_OFFSET`, default `JUMP_V0`</sub>
- **REQ-092** — **Parameter:** `QUIRK_MEM_I_MODE` · **Type:** enum · **Default (VIP):** `MEMI_INC_X_PLUS_1` — I ← I + X + 1 · **Other permitted values:** `MEMI_INC_X` — I ← I + X (CHIP-48); `MEMI_UNCHANGED` — I unchanged (SUPER-CHIP) · **Instructions bound:** `FX55`, `FX65`  
  <sub>§5.2 · hook D · `QUIRK_MEM_I_MODE`, three-valued, default `MEMI_INC_X_PLUS_1`</sub>
- **REQ-093** — **Parameter:** `QUIRK_VF_RESET` · **Type:** bit · **Default (VIP):** `1` — VF is set to 0 after the result is written · **Other permitted values:** `0` — VF is unchanged · **Instructions bound:** `8XY1`, `8XY2`, `8XY3`  
  <sub>§5.2 · hook D · `QUIRK_VF_RESET`, default 1</sub>
- **REQ-094** — **Parameter:** `QUIRK_I_OVERFLOW_VF` · **Type:** bit · **Default (VIP):** `0` — VF is unchanged · **Other permitted values:** `1` — VF ← 1 when I + V\<x\> exceeds `0x0FFF`, else 0 (the "Amiga" behaviour) · **Instructions bound:** `FX1E`  
  <sub>§5.2 · hook D · `QUIRK_I_OVERFLOW_VF`, default 0</sub>
- **REQ-095** — All quirk parameters default to 1977 COSMAC VIP semantics. P1's functional coverage — directed corners, random streams, lockstep parity — runs the **default configuration only**; the compatibility campaign is P4. P1 additionally runs **one directed vector per non-default parameter value** — six vectors: `SHIFT_SRC_VX`, `JUMP_VX`, `MEMI_INC_X`, `MEMI_UNCHANGED`, `QUIRK_VF_RESET = 0`, `QUIRK_I_OVERFLOW_VF = 1` — whose sole purpose is to prove each parameter is **connected**. Their expected results are already stated in full in §6.4. Without them an implementation that hard-codes the default behaviour and ignores all five parameters passes every P1 test, and the omission surfaces in P4 inside the campaign that depends on them.  
  <sub>§5.2 · hook DI · All quirks default to VIP; P1 runs the default configuration plus six parameter-connectivity vectors</sub>
- **REQ-096** — _stated in §4.3, §5.2; see the specification._  
  <sub>§4.3, §5.2 · hook SI · Quirks are compile-time with no run-time control path</sub>

## Module inventory, interfaces, observation, shared package (§4, §5.5) — 16

- **REQ-100** — **The inventory.** P1's module inventory is exactly the four modules above, with the instantiation relationships shown. Further decomposition **inside** M01 (a separate decoder, a separate register file, a separate ALU) is the `rtl_lead`'s to choose and is unconstrained by this specification, provided M01's port table and the timing contract of §7 hold. The four boundaries above are not the `rtl_lead`'s to change: M02's boundary carries the single-port invariant structurally, M03's boundary is what the bench binds to, and M04's boundary is what makes the random sequence independently modelable.  
  <sub>§4.0 · hook I · Module inventory M01–M04 with fixed boundaries</sub>
- **REQ-101** — _stated in §4.B; see the specification._  
  <sub>§4.B · hook S · Memory port exposes no backpressure — structural</sub>
- **REQ-102** — **Port:** `rdata` · **Dir:** out · **Width:** `DATA_W` · **Meaning:** Data read by the access **of the previous cycle**; holds its value in any cycle not preceded by an enabled read.  
  <sub>§4.B, §7.4 · hook D · Memory read latency is exactly one cycle</sub>
- **REQ-103** — **The sequence.** M04 holds a 16-bit state, reset to `RNG_SEED`. One *step* of the state `s` is: `lsb = s[0]; s   = s >> 1; if lsb == 1: s = s XOR RNG_POLY        // RNG_POLY = 16'hB400`  
  <sub>§6.5 · hook DR · The exact RNG sequence, seed non-zero</sub>
- **REQ-104** — **Advance discipline.** The state advances by exactly eight steps when, and only when, a `CXNN` instruction executes (`step` asserted for one cycle in that instruction's `S_EXEC`). It does **not** free-run, does not advance during any other instruction, does not advance while halted, and does not advance during reset other than by being loaded with `RNG_SEED`. A free-running source would make the value a `CXNN` reads depend on how many cycles the program spent elsewhere, which is exactly the kind of coupling that makes lockstep impossible.  
  <sub>§6.5 · hook DR · RNG advances only on `CXNN` execution</sub>
- **REQ-105** — **Port:** `obs_retire`, `obs_instr`, `obs_instr_addr`, `obs_pc`, `obs_i`, `obs_sp`, `obs_v`, `obs_stack`, `obs_rng`, `obs_halted`, `obs_err` · **Dir:** out · **Width:** as §4.A · **Meaning:** The M01 observation bundle, passed through unmodified and with no added or removed cycle of delay.  
  <sub>§4.A, §4.C · hook SD · The observation bundle and its bit mappings</sub>
- **REQ-106** — **Observation is passive.** No `obs_*` output feeds back into the machine, and the value of any `obs_*` output has no effect on any architectural state, on any cycle count, or on the memory port. Tying every one of them off (`OBS_ENABLE = 0`, REQ-113) changes nothing an instruction can observe.  
  <sub>§4.C · hook I · Observation outputs have no functional effect</sub>
- **REQ-107** — _stated in §5.5; see the specification._  
  <sub>§5.5 · hook I · The shared package's normative content</sub>
- **REQ-108** — **The package contains no behaviour** (REQ-108). It SHALL contain no `module`, no procedural block, and no function or task that computes decode classification or an instruction result. Pure width and constant helpers are permitted. The reason is an independence one, not a style one: PROTOCOL §10 requires DV to derive tests from this specification and not from the RTL, and a shared function that classifies opcodes would make the RTL and the bench agree about decode **by construction**, so the decode requirements would be untested in exactly the way L-D16 describes.  
  <sub>§5.5 · hook I · The package contains no behaviour</sub>
- **REQ-109** — **One definition site.** Every value in the table below is defined **once**, here, and is referenced — never restated — by the RTL, by the testbench, and by any other specification in this program. A literal that duplicates one of these values anywhere else is a defect, because it is a value that can drift while both copies still compile.  
  <sub>§5.5 · hook I · Every shared value has exactly one definition site</sub>
- **REQ-110** — **Port:** `obs_err` · **Dir:** out · **Width:** `$bits(err_e)` · **Meaning:** The error code (§9). `ERR_NONE` whenever `obs_halted` is low.  
  <sub>§5.5, §9 · hook D · The error-code enumeration</sub>
- **REQ-111** — **The throttle insertion point.** `THROTTLE_DIV` is 0 in P1 and 0 is its only supported value. When P3 gives it a range, the throttle SHALL add idle cycles **between an instruction's retirement and the next instruction's `S_FETCH_HI`, and nowhere else**, and SHALL have no architectural effect. That constraint is stated now so that P3's mechanism cannot disturb any instruction semantics or any intra-instruction cycle count frozen here.  
  <sub>§5.3, §7.7 · hook I · `THROTTLE_DIV` = 0 in P1; the throttle insertion point is constrained now</sub>
- **REQ-112** — **Port closure.** M01, M02, M03 and M04 have **no ports other than those tabulated in §4.A–§4.D**. M03 in particular exposes no memory port: the RAM is internal, and the memory image is a construction-time property (§5.4). A port an implementation finds it needs is a spec diff, not an addition.  
  <sub>§4.A–§4.D · hook I · Closure: no port other than those tabulated</sub>
- **REQ-113** — **Parameter:** `OBS_ENABLE` · **Type:** bit · **Default:** `1` · **Range:** 0, 1 · **Why a test overrides it:** P5 synthesis sets it to 0 so the ~380 observation bits do not appear as top-level outputs in the resource report. With `OBS_ENABLE = 0` every `obs_*` output is driven to zero and the machine's architectural behaviour is unchanged (REQ-113).  
  <sub>§5.3 · hook D · `OBS_ENABLE` = 0 zeroes the observation outputs and changes nothing else</sub>
- **REQ-114** — (REQ-114, REQ-120) at the same retirement; and, for an instruction that faults and therefore never retires, on `obs_halted`, `obs_err`, `obs_instr` and `obs_instr_addr` from the cycle `obs_halted` rises, which REQ-048 makes sticky and REQ-049 makes identifying. A mid-instruction `obs_*` value is deterministic but **unspecified**, so it is comparable lane-to-lane and is *not* assertable against the golden model. That distinction is the whole of ADR-0018 §6.6's back-door concern, and stating it here is the imperative that section could only imply.  
  <sub>§4.C · hook SI · Memory observation contract: M02's storage is the array `mem`</sub>
- **REQ-115** — **The override path.** M01, M02, M03 and M04 SHALL each declare, as **module parameters**, those of the values a test overrides that they use — `MEM_INIT_FILE`, `RNG_SEED`, `OBS_ENABLE`, `STACK_DEPTH`, `PROG_START`, and the five quirk parameters of §5.2; **M03 declares all of them** — each **defaulting to its `chip8_pkg` value** — except `MEM_INIT_FILE`, which is not a package value (§5.5) and defaults to `""` — and passed down to submodules unmodified. This is the only mechanism by which a test configures the machine, it is elaboration-time, and it adds no port and no run-time control path, so §4.3 and REQ-096 are unaffected. A package parameter cannot be overridden at elaboration in this toolchain, and the package file is outside the DV write scope, so without this clause no test can place a program in memory.  **Derived widths follow the module, not the package.** Any parameter, width expression or array bound whose value is *derived* from an overridable parameter — `SP_W` = `$clog2(STACK_DEPTH)+1`, the `obs_stack` width `ADDR_W*STACK_DEPTH`, and the stack array's own depth are P1's cases — SHALL be derived **inside the module from that module's own parameter**, not read from `chip8_pkg`. A package-level `SP_W` does not follow a module-level `STACK_DEPTH` override, so reading it from the package would leave `obs_sp` 5 bits wide at `STACK_DEPTH = 4` and reinstate F-2 through the override path itself.  
  <sub>§5.0, §4.3, §4.C · hook SD · The elaboration-time override path: M01, M02, M03 and M04 declare the module parameters they use, defaulting to package values (`MEM_INIT_FILE` excepted, §5.5); every derived parameter, width expression and array bound follows the module</sub>

## Verification obligations and closure clauses (§4.C, §8, §10) — 5

- **REQ-120** — **The observation bundle is complete.** Every element of the architectural state enumerated in REQ-013 is observable at M03's boundary, either through an `obs_*` output or, for memory, through REQ-114's named array. A full architectural-state comparison is therefore constructible without reading any implementation internal, which is what PROTOCOL §10 requires of the DV lane.  
  <sub>§4.C, §7.7 · hook S · Full architectural state observable at every retirement</sub>
- **REQ-121** — **Port:** `obs_instr` · **Dir:** out · **Width:** `INSTR_W` · **Meaning:** The 16-bit encoding of the instruction the `obs_*` bundle currently describes.  
  <sub>§4.A, §7.7 · hook D · Divergence localisation via `obs_instr` / `obs_instr_addr`</sub>
- **REQ-122** — **Stimulus classes the campaign SHALL cover.** Derived by construction from §6.3 and §6.4, not re-invented: **Every one of the 25 implemented forms**, at least once, in a directed vector. · **Register-index corners**: X = 0 and X = `0xF` for every instruction that names X; Y = 0 and Y = `0xF` for every instruction that names Y; X = Y for every two-register form. The X = `0xF` cases exercise REQ-085's ordering rule, which is the P1 requirement most likely to be implemented wrongly and silently. · **Value corners**: operands 0, 1, 127, 128, 255 for every ALU form; carries and borrows in both directions for `8XY4`, `8XY5`, `8XY7`; shift sources with bit 0 and bit 7 both set and both clear. · **Loop corners**: `FX55` and `FX65` with X = 0 and X = `0xF`; I placed so that I + X is `0xFFF` exactly (the last legal span) and `0x1000` (the first faulting one). · **Stack corners**: SP at 0 with a `00EE` (underflow fault), SP at `STACK_DEPTH` with a `2NNN` (overflow fault), and nested calls to depth `STACK_DEPTH − 1` and back. · **Address-space corners**: PC at `0xFFE` and `0xFFF` so the modulo-4096 fetch wrap of REQ-010 is exercised; `1NNN` to an odd address. · **The illegal space**: at least one encoding drawn from each `DC_ILLEGAL` region of §6.3's table — the `0NNN` region, `5XYn≠0`, `8XYn` for n in {8,9,A,B,C,D,F}, `9XYn≠0`, an undefined `EXnn`, an undefined `FXnn` — and at least one `DC_DEFERRED` encoding from each of P2 and P3, checking that the two error codes differ. · **Sustained constrained-random streams** over the implemented forms, at a transaction count `dv_lead` fixes and freezes for the campaign, with a full-state compare at every `obs_retire`. Generation lives in Python under cocotb, because SystemVerilog constrained randomisation exists in neither simulator (ADR-0017 context finding 1). · **Both simulator lanes.** Icarus is the authoritative 4-state lane and is where REQ-008's full explicit reset is actually checked; Verilator carries the long random campaigns (ADR-0017).  
  <sub>§8 · hook I · Stimulus classes the campaign covers</sub>
- **REQ-123** — **Determinism.** For a given `MEM_INIT_FILE`, parameter set and `RNG_SEED`, the machine's cycle-by-cycle behaviour is a deterministic function of that input alone. There is no free-running counter, no uninitialised storage, and no source of nondeterminism anywhere in P1. This is what allows the two simulator lanes to be compared against each other and against one golden model.  
  <sub>§8 · hook R · Determinism for a given image, parameters and seed</sub>
- **REQ-124** — _stated in §10, §11 D-1; see the specification._  
  <sub>§10, §11 D-1 · hook I · Every REQ above has a row in this table and a row in `docs/specs/requirements.md`, whose test-id and evidence cells are filled by `P1-module-ready`</sub>

---

## Coverage

| Kind of check | Requirements |
|---|---|
| **D** — directed vector | 76 |
| **R** — constrained-random stream, full-state compare | 33 |
| **F** — formal property (P4) | 6 |
| **S** — structural — guaranteed by the interface or a construction rule, not assertable by a bench | 8 |
| **I** — inspection at countersignature or review | 13 |

No requirement has a test id yet: the DV lane has not been spawned, so every
row of the traceability matrix in [`requirements.md`](requirements.md) still
carries an unfilled evidence cell. That is the honest state, not an omission.
