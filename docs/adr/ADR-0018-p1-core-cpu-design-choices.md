# ADR-0018: The five non-obvious choices in SPEC-P1-core-cpu

- **Status**: **ACCEPTED (in-role)** — decided by `architect_docs_lead` under
  PROTOCOL §8 ("everything else is decided inside the org"), recorded at
  `J-architect_docs_lead-0002`. **This ADR records decisions that are already
  normative in `docs/specs/SPEC-P1-core-cpu.md`; it creates none and changes
  none.** Their *frozen* force arrives at `P1-spec-freeze`, which the sponsor
  signs (class **E1**). Until then the spec is DRAFT and every choice below is
  cheap to reverse — which is the whole reason this ADR is written before the
  gate rather than after it.
- **Decider**: `architect_docs_lead`. Not an escalation: none of the five adds
  or drops a requirement, phase or role (**E2**), and none touches the
  toolchain lane or a license class (**E3**). Choice 4 and choice 5 are
  *consequences* of ADR-0017's toolchain decision, not re-openings of it.
- **Date**: 2026-08-05
- **Work order**: `agents/handoffs/WO-0003_p1-design-rationale-adr.md`
- **Discharges**: `SPEC-P1-core-cpu.md` §11 deferred item **D-2** (a
  `P1-spec-freeze` precondition, charter §5).
- **Supersedes / amends**: nothing. This ADR carries **no** PROTOCOL §11
  enforcement change and therefore owes **no** `scripts/test_protocol.sh`
  scenario.
- **Depends on**: ADR-0017 (toolchain lane) including Amendments A1 and A2;
  README.md's phase table and scope-parameter paragraph (the canonical scope
  statement, PROTOCOL §1); `tasks/BOARD.md` intake decisions B3 and B4.

---

## 0. What this ADR may and may not do

WO-0003 is explicit and the constraint is honored literally: **this ADR
records why the specification says what it says. It does not change what the
specification says.** Where writing the rationale exposed a problem, the
problem is written down in §7 as a **finding with routing**, and the repair —
which is a spec diff and a new work order — is *not* performed here. An ADR
that quietly edited the behaviour it was commissioned to justify would be the
exact failure mode the packet was drafted to prevent.

Two findings came out of the work. Neither reverses a choice; one of them
**blocks the freeze** until a separate packet closes it. Both are in §7.

---

## 1. The corpus, and what a backtest of a *design* rule can honestly be

PROTOCOL §11 and **L-B15** require a proposed rule to be run backwards over
the historical corpus before adoption, with the corpus verdict — what it
flags, what it misses — recorded in the adopting ADR. Applying that to five
CPU design rules needs the corpus named first, because the obvious reading
does not survive contact.

**Two candidate corpora, and why the first one is useless here.** L-B15's home
incident was a *governance* rule backtested against a repository's commit
history. This repository's history is available and cheap to search — and it
**discriminates none of the five choices**, because no CHIP-8 instruction has
ever been executed in this tree. There is no RTL, no golden model, no ROM, and
`SPEC-P1-core-cpu.md` §8 rules out ROM execution for the whole of P1 by
construction (any real program reaches a `DXYN` — a `DC_DEFERRED` halt in P1 —
within a few instructions). Backtesting these rules against this repository's
history would return "flags nothing, misses nothing" for all five, which is a
true statement carrying no information.

**The corpus that would discriminate them is the population of CHIP-8 programs
the machine will ever execute** — the community test-ROM suites, the VIP-era
game corpus, and hand-written test vectors. That corpus is **external to this
repository, is not vendored here** (the intake makes the game ROM
fetch-never-vendor, `tasks/BOARD.md` B3, and no fetch has run), and **was not
retrieved during this work or during the spec's authorship**. So the literal
backtest — execute each rule over N known programs, count flags and misses —
**is not performable at this commit, and this ADR does not claim to have
performed it.**

**What was performed instead, and its provenance class.** For each of choices
1–4 the ADR characterises the *class* of program that would depend on the
rejected behaviour, and asks whether that class is (a) non-empty, (b)
reachable inside P1's stimulus scope, and (c) discriminating — i.e. whether a
program in it behaves differently under the two rules in a way the program's
author intended. This is a **structural backtest**. Its provenance class is
**derived** where the derivation is shown below and **relayed** wherever it
rests on a CHIP-8 behavioural fact, because every such fact in this program
came from the intake's consult-only references at second hand (spec §11 OQ-3;
L-B01: a relay is not a measurement).

**When the real backtest becomes performable, and against what.** Choices 1
and 2 become measurable at **P3** (Pong runs end-to-end) and decisively at
**P4** (the community test-ROM suite in the default and one alternate quirk
configuration — README's P4 success criterion). Choice 3 is measurable at P1
by the lockstep itself. Choice 4's exposure is measurable only in the **Icarus
lane** (ADR-0017: Verilator is 2-state and cannot see uninitialised state at
all). Choice 5 has a different corpus again — the set of benches built against
this spec — and §6 backtests it against the only bench that has ever existed
here.

Naming a backtest that could not be run, rather than dressing a derivation as
a measurement, is the point of the requirement. A backtest verdict that says
"the corpus cannot see this yet, and here is the gate at which it can" is a
usable result. A fabricated one is not.

---

## 2. Choice 1 — An illegal opcode halts

**Decision.** Every one of the 21582 `DC_ILLEGAL` encodings, and every one of
the 4209 `DC_DEFERRED` encodings, terminates execution at `S_DECODE` with a
distinct error code and **no** architectural state modified — PC included
(spec REQ-041, REQ-042, REQ-043, REQ-048; §6.3).

### 2.1 Alternatives actually available

| Alternative | What it buys | Why it lost |
|---|---|---|
| **No-op and continue** (`PC ← PC + 2`, nothing else) | Tolerant of sloppy ROMs and of padding; lets a partially-implemented machine run further. It is what a large part of the interpreter population does. | It converts the machine's single most diagnostic event into silence. The case that actually occurs is PC walking into data — where the encoding is usually `0x0000`, the value a blank memory region decodes to — and a no-op there produces a machine running quietly on garbage, whose lockstep divergence surfaces thousands of instructions later at a point unrelated to the cause. It also removes the only signal that P1 met an instruction it has not yet built. |
| **Trap to a handler** (vector, save PC, jump) | The classic CPU answer; recoverable; lets software decide. | Invents an architectural feature CHIP-8 does not have. There is no interrupt model, no status register, no reserved vector, and nothing to return to. Adding one would be an **E2** scope change, and it would have to be specified, implemented, modelled and verified in P1 for a fault path no CHIP-8 program can use. |
| **Halt terminally** (chosen) | Observable at the boundary in one bit (`obs_halted`) plus a code; trivially expressible as a formal property (`S_HALT` is terminal, REQ-027); creates no new architectural state; and localises the fault to the offending instruction exactly (REQ-049 holds `obs_instr`/`obs_instr_addr`). | — |

### 2.2 Why the winner won

The decisive argument is not tolerance-versus-strictness, it is **where the
information goes**. P1's signed success criterion is *divergence reported at
the instruction of first difference*. Halting is the only one of the three
that keeps a decode fault **at** the instruction that caused it. No-op moves
the report arbitrarily far downstream; trap moves it into a mechanism that
does not exist.

The second argument is the one that made `DC_DEFERRED` a class of its own
rather than a synonym for illegal. Two error codes cost one enum member.
Collapsing them would mean **every P1 test of the illegal space also passes on
a decoder that has simply forgotten `DXYN` exists** — a test that cannot
distinguish "not a CHIP-8 instruction" from "not built yet" gives false
assurance about the phase boundary, which is the failure shape the standing
lesson on enumerated checks names.

### 2.3 Cost

- **Every P1 stimulus stream must avoid the deferred and illegal space unless
  it intends a halt.** Constrained-random generation over the 16-bit encoding
  space is therefore not uniform-random: it draws from the 39745
  `DC_IMPLEMENTED` encodings. That is a real constraint on `dv_lead`'s
  generator, and it is stated so the generator is designed against it rather
  than discovering it.
- **No CHIP-8 ROM can run in P1** — but this cost is not caused by the halt
  choice. `DXYN` is P2 work; a no-op-on-deferred machine would execute the ROM
  and diverge from the golden model on the first draw anyway. The halt makes
  the phase boundary explicit instead of making it a mystery.
- **The machine is unusable as a tolerant emulator.** It is not intended to
  be one; it is intended to be a specification-conformant machine with a
  golden reference beside it.

### 2.4 Corpus verdict

**What the rule flags.** Every encoding outside the 35-instruction set, and —
until P2 and P3 land — every `DXYN`, `00E0`, `FX29`, `EX9E`, `EXA1`, `FX07`,
`FX0A`, `FX15`, `FX18`.

**What a dependent program looks like, and whether the class is non-empty.**
Three candidate classes, each characterised and dispositioned:

| Class | Non-empty? | Discriminating? | Disposition |
|---|---|---|---|
| **`0NNN` SYS callers** — VIP-era ROMs invoking an 1802 machine-language routine at `NNN`. | **Yes** — this is what the instruction was for. | **No.** Such a program depends on the routine *executing*. There is no 1802 here and none is buildable, so both halt and no-op are wrong for it in the same way. | Out of scope by construction, not by this rule. Spec REQ-043. |
| **Fall-through-into-padding** — a routine that runs off its end into `0x0000` padding and is *intended* to continue past it. | Plausible; not demonstrated. | **Yes** — it runs under no-op and halts here. | This is the class the rule is aimed at. A program in it is correct only under one interpreter's no-op convention, and the conventions differ (skip 2 bytes / halt / error / undefined). It is already broken across half the interpreter population; the halt makes the break visible at the padding rather than invisible downstream. |
| **Deliberate illegal-encoding use** — a program using an undefined `8XYn` or `5XYn` for a documented side effect. | No evidence, and no mechanism: the undefined encodings have no defined effect to depend on. | — | Empty as far as this specification's authors can determine. Provenance **relayed** — nothing in this repository can check it. |

**What the rule misses.** Three things, and the third is the important one:

1. It says nothing about a program that stays entirely inside the legal set
   while doing the wrong thing — which is the overwhelming majority of program
   defects. The halt is a decode-space check, not a correctness check.
2. It cannot fire on a program that never reaches the bad encoding, so its
   coverage is exactly the coverage of the stimulus, no more.
3. **It cannot distinguish a defective program from an incomplete machine
   without the second error code** — and that gap is closed inside the rule
   itself by REQ-042, not by anything outside it. This is the one place where
   running the rule backwards changed its shape rather than confirming it.

**Verdict: the choice holds.** The dependent class that discriminates is
non-empty but consists of programs that are already interpreter-specific, and
P1 cannot execute any of them regardless. **The backtest is not performable in
P1** and becomes performable at P3/P4 — see the falsifier.

### 2.5 Falsifier

If **P4's community test-ROM campaign** finds a suite ROM that is
specification-conformant and yet requires no-op-on-unknown to complete, the
choice is wrong for that configuration and the repair is a compile-time
parameter — the same pattern §5.2 already uses for five divergent behaviours —
landed as a spec diff plus an ADR, never as an edit. **This ADR does not add
that parameter**; see §7.1, where the question of whether README's P4 row
already requires it is recorded as a finding.

---

## 3. Choice 2 — A multi-byte span that crosses the top of memory faults

**Decision.** `FX33` with I + 2 > `0xFFF`, and `FX55`/`FX65` with I + X >
`0xFFF`, raise `ERR_ADDR_RANGE` and halt from `S_EXEC` **before any memory
access is issued and before any register is written** (spec REQ-046, REQ-047).
Single-target 12-bit updates — `PC + 2`, `PC + 4`, a `1NNN`/`BNNN` target,
`I + V<x>` — **wrap** modulo 4096 and never fault (REQ-010, REQ-081).

### 3.1 Alternatives actually available

| Alternative | Why it lost |
|---|---|
| **Wrap the span** (`M[(I + k) mod 4096]`) | An `FX55` at I = `0xFFE` silently writes into the font region at `0x000`, turning a program defect into memory corruption with no indication. Worse for this program: it makes **P4's signed formal property "I never addresses out of range" vacuous** — true by the width of a 12-bit register rather than by anything the design does. A property that no design can violate proves nothing about the design that carries it. |
| **Clamp** (stop the transfer at `0xFFF`, complete partially) | Produces a partial commit, which contradicts REQ-047's fault atomicity and gives the golden model a second, transfer-length-dependent behaviour to reproduce. Worst of both: neither the tolerance of wrap nor the diagnosis of a fault. |
| **Fault before the first access** (chosen) | Atomic — nothing committed, so the fault needs no rollback machinery and no per-fault-class statement. Detectable from state the machine already holds when `S_EXEC` begins. Makes the P4 property non-vacuous: it holds *because the design refuses*, and refusing is a behaviour a proof must reason about. |

### 3.2 Why the winner won — and why the wrap/fault split is not inconsistent

The split looks arbitrary until the distinguishing test is stated: **a fault
is worth specifying only where it can distinguish something.**

- A 12-bit register **physically cannot** hold a value outside `0x000`–`0xFFF`.
  `I ← I + V<x>` producing a wrapped result is not an error condition, it is
  the arithmetic of the register. A fault there would be a decode path no
  stimulus can distinguish from correct behaviour, i.e. a requirement with no
  verification value and a hazard for P4's formal work.
- A **span** `[I, I+X]` is not a register value; it is a derived interval, and
  it *can* be outside the address space in a way the hardware's width does not
  force. That is a real, distinguishable condition, so it gets a real fault.

Stating the test that way makes the split a rule rather than two preferences,
and the rule is checkable: *fault exactly where the width does not already
decide the answer.*

### 3.3 Cost

- **The fault localises the use, not the cause.** A program whose `FX1E`
  walked I past the top wraps *silently* at that instruction, and the halt is
  reported at a later `FX55`/`FX65`/`FX33` — so `obs_instr_addr` (REQ-121)
  points at the symptom. This cost is real and was not stated in the spec; it
  is stated here.
- **The default configuration is the blind one.** With
  `QUIRK_I_OVERFLOW_VF = 0` (the VIP default, REQ-094) the overflow of
  `I + V<x>` is unobservable. With `QUIRK_I_OVERFLOW_VF = 1` (the "Amiga"
  behaviour) VF flags it **at the `FX1E`**, i.e. at the cause. The alternate
  quirk configuration therefore carries a diagnostic the default lacks — which
  is a reason for P4's alternate-configuration run beyond compatibility, and
  is recorded here so P4 inherits it rather than rediscovering it.
- One extra comparator and one extra `S_EXEC` fault path per transfer
  instruction. Negligible against a 7680-LUT4 budget.

### 3.4 Corpus verdict

**What the rule flags.** Exactly the transfers whose span crosses `0xFFF`:
`FX33` with I ≥ `0xFFE`, `FX55`/`FX65` with I + X > `0xFFF`.

**What a dependent program looks like.** A program that *intends* to write off
the top of memory and have the bytes reappear at `0x000` — i.e. one that uses
the wrap as an addressing mode to reach the font region or the low RAM. Two
observations:

1. **Nothing in the interpreter population makes that a stable behaviour to
   depend on.** The common implementations index a 4096-byte array directly;
   in the C-family interpreters that is out-of-bounds access, not a modular
   one, and its observable effect is whatever the host does. "Wrap" is not the
   incumbent behaviour whose corpus this rule would be breaking — it is one of
   several incumbents, and not the most common. Provenance **relayed**.
2. The *accidental* class is the one that matters: a program with an
   uninitialised or mis-computed I near the top of memory that executes a
   transfer. That program is broken; the fault makes it visibly broken at the
   transfer.

**What the rule misses.**

- **Every span that stays inside the address space but is still wrong.**
  `FX65` with X = `0xF` at I = `0x300` reads sixteen bytes of whatever is at
  `0x300`; the rule has nothing to say. Range faults catch address-space
  escape, not semantic error.
- **The silent single-target wrap that usually precedes the fault** (see §3.3).
  The rule detects the consequence and leaves the cause undetected in the
  default configuration.
- **`0x0FFF` exactly is legal** — `FX55` with I + X = `0xFFF` is the last legal
  span and does not fault. The off-by-one is the most likely implementation
  error and the spec's own stimulus class 4 (§8) requires both `0xFFF` and
  `0x1000` to be exercised, so the miss is covered by stimulus rather than by
  the rule.

**Verdict: the choice holds, and strengthened.** The vacuity argument is the
strongest single argument in this ADR because it is grounded in a *signed*
README success criterion (P4's three formal properties), not in taste. The
backtest added a cost the spec had not stated — cause-versus-symptom
localisation — and a use for the alternate quirk configuration that had not
been noticed.

### 3.5 Falsifier

A test ROM at P4 that legitimately relies on span wrap, or a P4 formal run
showing the property is provable *without* the fault (which would mean the
fault buys nothing). Either is a spec diff plus an ADR.

---

## 4. Choice 3 — The random source is a specified deterministic sequence

**Decision.** M04 is a 16-bit Galois LFSR, polynomial `16'hB400`, reset to a
non-zero `RNG_SEED`, advancing **exactly eight steps** when and only when a
`CXNN` executes; `rnd` presents the low byte of the state *after* the next
advance so that consume-and-advance fit in one cycle; the LFSR state is part
of the architectural state and is exposed on `obs_rng` (spec REQ-012,
REQ-103, REQ-104, §6.5).

### 4.1 Alternatives actually available

| Alternative | Why it lost |
|---|---|
| **A free-running LFSR sampled at `CXNN`** — what a hardware designer reaches for first, and what much real hardware does. | **It destroys the golden model as an independent anchor.** The value a `CXNN` reads would depend on how many cycles the program spent elsewhere, so the Python model could only predict it by becoming a cycle-exact emulation of the entire machine. The intake's independence rider (`tasks/BOARD.md` B3) requires the model to be written from the specification as an *independent* implementation; a model forced to replicate the DUT's cycle timing is a second copy of the DUT, and it would agree with the hardware about any timing error the two share. This is a verification-architecture argument, not a randomness-quality one, and it is decisive. |
| **A true entropy source** (ring oscillator, external noise) | Unmodelable by construction, so `CXNN` could not be lockstepped at all — and P1's success criterion is full-state compare after **every** instruction, `CXNN` included. Also unavailable: the intake is simulation-only (B4 — no board, no bitstream, no lab equipment), so there is no entropy source to attach. |
| **A counter or a fixed constant** | Trivially modelable and trivially wrong: `CXNN` results would be perfectly correlated, and a lockstep bench would confirm the agreement happily on both sides. It would satisfy the *test* while failing the *instruction*. |
| **A specified deterministic sequence** (chosen) | Reproducible bit-for-bit by an independent model derived from the same specification, with the seed left as a parameter so variety is a configuration property rather than a design property. | — |

### 4.2 Why the winner won

`CXNN` is the only instruction in P1 whose result is not a function of the
architectural state as CHIP-8 defines it. Either the specification supplies
the missing function, or the lockstep cannot compare `CXNN` at all — and a
lockstep with a hole in it is a lockstep whose coverage claim is false. §6.5
therefore specifies the **sequence produced**, not a circuit; §6.6 leaves the
realisation free (Galois, an equivalent Fibonacci form, a combinational 8-step
matrix) provided the `advance8` values match.

Exposing the state on `obs_rng` is the second half. Without it, a model/DUT
desynchronisation surfaces only at the next `CXNN` whose *masked* result
happens to differ — which for a small `NN` mask can be many instructions
later, and which reports the divergence at the wrong instruction. With it, the
desynchronisation is caught in the retirement where it happened.

### 4.3 Cost

- **The seed is a compile-time parameter, so a single build produces one
  sequence.** For a game, that means the same "random" level every run of that
  build. This is a genuine user-facing cost and it is paid deliberately:
  variety is obtained by varying `RNG_SEED` at construction, and §5.3 already
  makes seed sweeps a test obligation.
- **No hardware entropy path exists.** If this program's scope ever grows a
  hardware target, an entropy input is a spec diff (and an **E2**, since B4's
  simulation-only boundary is a signed intake decision).
- Sixteen flip-flops plus eight XOR stages, or one combinational 8-step matrix.
  Negligible.
- `RNG_SEED = 0` is barred, because zero is an absorbing state for this
  recurrence and a generator stuck at zero returns zero from every `CXNN` — a
  defect **both sides of the lockstep would agree about** if the model shared
  the seed. The bar is stated as a requirement rather than left to a comment.

### 4.4 Corpus verdict

This is the choice where running the rule backwards produced the most
decisive result, and it splits into two sub-rules with **opposite** verdicts.

**Sub-rule (a) — "the source is stepped by the instruction, not free-running."
The corpus is blind to it.** A CHIP-8 program cannot observe cycle counts: it
has no timer in P1, no cycle-count register, and no way to distinguish "the
RNG advanced 8 steps because I executed a `CXNN`" from "the RNG advanced N
steps because N cycles elapsed". The two designs are **indistinguishable to
every program in the corpus** except statistically over long runs. A dependent
program class does not exist. The choice is therefore free to be made on
verification grounds alone — which is exactly what was done, and the backtest
is what licenses that.

**Sub-rule (b) — "eight steps per draw, not one." The corpus is *not* blind to
this one, and it constrains the answer.** The argument in §6.5 is right but
loosely worded, and the precise form is worth having on the record (the
normative content is unchanged; this is the sharper reason, not a different
rule). For this Galois form, one step gives

```
new = (s >> 1) ^ (s[0] ? 16'hB400 : 16'h0000)
```

and because `16'hB400`'s low byte is `8'h00`, the new output byte is exactly
`s[8:1]`. **Seven of its eight bits are the previous output byte's bits,
shifted by one.**

This is **measured**, not argued — the identity is checked over **all 65536
states**, exhaustively rather than by sampling, along with the two other
properties §6.5 asserts:

```sh
python3 -c "
P=0xB400
def step(s):
    l=s&1; s>>=1
    if l: s^=P
    return s
print('one-step low byte == s[8:1]:', all((step(s)&0xFF)==((s>>1)&0xFF) for s in range(65536)))
print('zero is absorbing          :', step(0)==0)
s=0xACE1; n=0
while True:
    s=step(s); n+=1
    if s==0xACE1: break
print('period from RNG_SEED       :', n)"
```

Observed: `True`, `True`, `65535`. So `RNG_POLY = 16'hB400` is maximal-length
over the 16-bit non-zero state space, REQ-103's non-zero-seed bar is confirmed
necessary rather than merely prudent, and the step-count argument below rests
on a checked identity. **This is the only claim in this ADR that is
`measured`; everything else about CHIP-8 is relayed or derived** (§9).

Consecutive `CXNN` draws under a one-step rule would
therefore be near-identical, and a program doing the ordinary thing — two
`CXNN` in a row to pick a coordinate pair — would place both coordinates in
near-lockstep. That *is* a discriminating, non-empty, entirely ordinary
program class. Eight steps make each output byte a function of a disjoint
16-bit window, and the observable correlation disappears.

**What the rule flags.** Nothing in the corpus: no program fails because the
sequence is deterministic.

**What the rule misses.** It does not make the generator *good*. This LFSR has
period **65535** (measured above) and known linear structure; a program drawing
more than 65535 draws sees the sequence repeat exactly. No CHIP-8 game is
affected at
its issue rate (500–1000 instructions/second: over eight hundred million
instructions to exhaust a period even if every one were a `CXNN`), but the
limitation is stated rather than left to be discovered. It also does not
address distribution: `rnd & NN` is not uniform over `0..NN` for a non-mask
`NN` — but that is CHIP-8's own instruction semantics, not this choice's.

**Verdict: the choice holds, strongly.** The corpus cannot see the part of the
decision that was made for verification reasons, and the part it *can* see —
step count — was decided the way the corpus requires.

### 4.5 Falsifier

A P4 test ROM whose expected reference images depend on a specific random
sequence that this LFSR does not produce. That would mean the community's
reference behaviour pins the generator itself, and the repair is to specify
the pinned sequence — a spec diff plus an ADR. Note this is a real
possibility: reference-image comparison and a free choice of RNG are in
tension, and P4 is where the tension resolves.

---

## 5. Choice 4 — Every element of architectural state has a specified reset value

**Decision.** REQ-008 gives PC, I, SP, V0–VF, all sixteen stack entries, the
RNG state, `halted`, `err` and the FSM state an explicit value at reset.
Nothing architectural is left undefined. Reset does **not** alter memory
(REQ-009).

### 5.1 Alternatives actually available

| Alternative | Why it lost |
|---|---|
| **Reset only what correctness requires** (PC and SP; arguably `halted`) — the minimal correct set, and the one a hardware engineer optimising for area would choose. | Leaves V0–VF, I, the stack and the RNG state undefined at time zero. Every one of them is compared by the lockstep **at the first retirement**, so the golden model would need a matching notion of "undefined" — which does not exist in Python. The first full-state compare would be a coin flip. |
| **Leave everything undefined and let the memory image / program initialise it** | Same problem, worse: it makes the machine's first-instruction behaviour a property of the program rather than of the machine, and REQ-123's determinism claim would be false. |
| **Asynchronous reset** | Not an alternative on this axis, but worth recording as considered: it buys nothing here (there is one clock domain and no power-up ordering requirement) and it costs a reset-domain-crossing hazard that **Verilator cannot see at all**. Synchronous, as specified. |
| **Reset everything, explicitly enumerated** (chosen) | Determinism (REQ-123) becomes a property of the design rather than of the stimulus; the two simulator lanes are required to agree and now can; and the golden model's initial state is a table it can copy from the spec. | — |

### 5.2 Why the winner won — and the honest name for what it does

WO-0003 asks for this to be stated explicitly, and it needs stating carefully
because the obvious phrasing overclaims.

ADR-0017's context finding 2: **Verilator is 2-state and cycle-based — no
X-propagation, no timing checks.** An uninitialised bit reads `0` there and `X`
in Icarus. The two lanes run the same cocotb tests and are required to agree,
so an uninitialised bit is a guaranteed cross-lane disagreement — or, worse, a
guaranteed *agreement* on `0` in the fast lane where all the long random
campaigns run, with the disagreement showing up only in whichever Icarus test
happens to read that bit before writing it.

But the specified reset is **not a compensating control** for the blind lane,
and calling it one would be exactly the overclaim **L-F03** exists to prevent.
A compensating control *performs a check that something else fails to perform*.
A fully-specified reset performs no check; it **eliminates the hazard the
blind lane would have failed to detect**. Hazard elimination and hazard
detection are different classes and must not be flattened:

| | What it is | Class |
|---|---|---|
| REQ-008's full reset | Removes uninitialised architectural state from the design, so there is nothing for a 2-state lane to be blind to | **Hazard elimination.** PROSE — a specification instructs; nothing refuses an RTL file that omits a reset term |
| The **Icarus lane** running the reset sequence (REQ-008's DV hook is `D (Icarus lane)`) | Actually detects an X, if one exists and a test reads it | **The compensating control**, and the only one. MACHINE once the lane runs — a red build |
| ADR-0017's dual-lane architecture | Ensures the detecting lane exists at all | Structural |

The distinction has teeth, and §7.2 is where it bites: elimination only covers
what the specification **enumerates**, and the enumeration turns out to be
incomplete.

### 5.3 Cost

- Sixteen 8-bit registers, sixteen 12-bit stack entries, and the rest all
  carry a reset term: roughly 350 flip-flops with a reset input rather than
  without. On an iCE40 HX8K (7680 FF) this is affordable, and the P5 resource
  report is where the cost becomes visible rather than estimated.
- **Zeroing all sixteen stack entries is the item a designer would push back
  on**, since entries above SP are architecturally dead. It is specified
  anyway, and the reason is verification, not correctness: it makes "compare
  all sixteen entries" a deterministic comparison (§6.4.4), which is simpler
  and stronger than "compare the live prefix" — the latter needs the bench to
  model SP correctly before it can compare the stack, coupling two checks that
  should be independent.
- A designer cannot use `X` as a don't-care optimisation hint. That is a
  synthesis-level loss, and it is accepted.

### 5.4 Corpus verdict

**What a dependent program looks like.** A CHIP-8 program that reads a V
register, or I, before writing it. This class is **non-empty and common** —
assuming registers start at zero is ordinary sloppiness in hand-written CHIP-8.
Crucially, **the corpus's dependency is on *zero*, which is what REQ-008
specifies.** A program depending on non-zero garbage is not writable
portably and no such class was identified. The rule and the corpus agree.

**What the rule flags.** Nothing in the corpus: no program is broken by the
machine starting in a defined state.

**What the rule misses — and this is the finding.** It enumerates
*architectural* state and stops there. It does not reach **memory**, which is
32768 bits, is the largest single block of state in the machine, is compared
by the lockstep as part of the architectural state (REQ-013 lists RAM first),
and is explicitly *excluded* from reset (REQ-009). Memory's initial contents
are governed by REQ-014 and §5.4 instead — and for a memory image shorter than
4096 bytes, which is every realistic P1 image, **those clauses do not say what
the remaining bytes hold.** §6.6 then leaves M02's realisation free among three
mechanisms that differ precisely in their answer. This is elaborated as a
finding in §7.2, because the repair is a spec diff and not this ADR's to make.

**Verdict: the choice holds for what it covers, and the backtest found it
incomplete.** The decision is right; its scope is short by the largest term.

### 5.5 Falsifier

An Icarus run that shows an `X` reaching a comparison despite REQ-008 — which
would mean the enumeration is incomplete somewhere else too. §7.2 is one known
instance; the first Icarus reset test at P1 is where any others surface.

---

## 6. Choice 5 — The observation interface is a specification-mandated port set

This is the choice WO-0003 asked to be argued rather than justified, because
it is the one that touches independence. The argument is given in full, and
the two places where it **does not close** are named as such.

**Decision.** M01 and M03 carry eleven `obs_*` outputs — `obs_retire`,
`obs_instr`, `obs_instr_addr`, `obs_pc`, `obs_i`, `obs_sp`, `obs_v`,
`obs_stack`, `obs_rng`, `obs_halted`, `obs_err` — with a normative retire
contract (REQ-029), a passivity requirement (REQ-106), an `OBS_ENABLE`
tie-off (REQ-113), a port-closure clause (REQ-112), and one mandated
*internal* array name for memory (REQ-114).

### 6.1 The charge

WO-0002 forbade a specification that describes an implementation. A mandated
port set makes architectural state visible to the bench by contract, and
REQ-114 goes further and names a signal **inside** a module. On its face that
is the forbidden thing.

### 6.2 The criterion that decides it

"Ports versus internals" is the wrong test — it would license any amount of
implementation description as long as it happened at a boundary. The test that
actually separates the two:

> A specification describes an *implementation* when it removes a degree of
> freedom from the implementer **without** thereby fixing an obligation that
> is stated in terms of the module's own observable behaviour.

Under that test, three questions have to be answered for the observation set:
does it fix an obligation (§6.3); is that obligation *behavioural* rather than
structural (§6.4); and does it leave the implementer free everywhere the
obligation does not reach (§6.5).

### 6.3 The obligation is not invented here — it descends from a signed criterion

README's P1 success criterion, which is canonical scope (PROTOCOL §1) and
sponsor-signed at intake, reads: *lockstep parity against the golden model;
**full architectural-state compare after every instruction**; divergence
reported at the instruction of first difference.*

That criterion is **unimplementable without a specified observation surface**.
The bench has exactly two ways to obtain architectural state from the DUT:

1. from observables the **specification** names, or
2. by reading the **RTL** and discovering signal names and hierarchy.

PROTOCOL §10 forbids (2) outright — DV derives tests from specs, never from
RTL. So a specification that stated the success criterion and omitted the
observables would not be a purer specification; it would be an **incomplete**
one, because it would state an obligation whose only available discharge is a
protocol violation. The observation set is derived from a signed criterion by
elimination, not added by preference.

This is the load-bearing move, and it generalises: **where a signed success
criterion is stated in terms of observation, the observation surface is part
of the specification's subject matter, not an implementation detail leaking
into it.**

### 6.4 The obligation is behavioural, because REQ-013 makes it so

The stronger objection survives §6.3: *the ports expose internal state, and
exposing internal state is what lets a bench test structure*. The answer is
that for this machine there is no such thing as internal architectural state,
and REQ-013 is what makes that true rather than merely plausible.

REQ-013 (the closure clause) declares the enumerated elements to be the
**complete** architectural state, and declares everything else in any
implementation — the instruction register, the loop counter, the FSM state
register — **transient**, with no effect at an instruction boundary. Given
that, take the bundle element by element:

| Element | What it is | Structural? |
|---|---|---|
| `obs_pc`, `obs_i`, `obs_sp`, `obs_v`, `obs_stack`, `obs_rng`, `obs_halted`, `obs_err` | Exactly REQ-013's enumeration, less RAM | **No** — each is architecture *by definition of the machine*, not a design choice. A design that computed V registers by exotic means would still owe the same values. |
| `obs_instr`, `obs_instr_addr` | A function of architectural state — `M[PC_prev]` and `PC_prev` | **No.** Strictly redundant: a bench could compute both from memory and PC. They exist for localisation ergonomics, and a redundant observable cannot create a structural dependence because it carries no information the architecture does not already carry. |
| `obs_retire` | The instruction-boundary marker | **No — and it *reduces* structural dependence.** Without it a bench must know when an instruction completed, which means counting cycles against §7.1's table, which means depending on the FSM's shape. Exposing the boundary is what lets the bench be agnostic about how many cycles an instruction took. This inversion is the single best argument for the port set: the alternative to a specified boundary marker is not "less structure", it is *more*. |

So the bundle contains **no signal that is not architecture, a function of
architecture, or a boundary marker that removes cycle-counting dependence**.
That is a stateable, inspectable invariant, and it yields the rule that governs
future changes to the set:

> **The admission rule for the observation bundle.** An `obs_*` port may be
> added only if it is (a) an element of REQ-013's architectural closure, (b) a
> function of that closure, or (c) an instruction-boundary marker. An
> `obs_fsm_state`, an `obs_mem_en`, an `obs_alu_result` or any similar signal
> fails all three and is the back door. Refusing them is the rule; this ADR is
> where it is written down.

The existing eleven satisfy the rule, so recording it changes nothing today —
which is why it belongs in an ADR rather than in a spec diff.

### 6.5 What remains free to the implementer

§6.6 leaves the FSM encoding, the decoder structure, the BCD algorithm, the
stack realisation, the LFSR realisation, the register-file and ALU structure,
and the width of every internal counter unconstrained — and specifically
leaves free *whether the `obs_*` outputs are driven from the architectural
registers directly or through a register stage*, provided REQ-029's contract
holds during retirement cycles. The obligation is on the **value at the
retirement boundary**, not on the circuit that produces it. That is the third
question answered.

### 6.6 What stops it becoming a back door for DV to test structure

Here is the honest inventory, with each control graded. WO-0003 asked for this
and it is the part of the argument that does **not** close cleanly.

**The risk shape.** The bundle is sampled continuously by a simulator; nothing
restricts a bench to sampling at retirement. A test that asserts on `obs_pc`
*mid-instruction* is asserting on when a register update lands, which is a
timing property of the implementation. If such a test is written and the RTL
later re-times a non-architectural detail, the test fails on a structural
change with no behavioural difference. That is testing structure through a
specified port.

**What actually stands against it:**

1. **The spec makes such a test unsound on its own terms — but does not say
   so imperatively.** §6.6 explicitly leaves free whether `obs_*` is driven
   directly or through a register stage, so **mid-instruction `obs_*` values
   are unspecified**, and an assertion on an unspecified value is a defect in
   the *test*, not in the DUT. This is a real basis for rejecting such a test
   at review. It is inference from §6.6, not an imperative clause, and the
   inference is recorded here rather than pretended to be a requirement.
   Class: **PROSE**.
2. **The traceability matrix is the mechanism that makes it visible.** Every
   test must cite the `REQ-###` it discharges (`docs/specs/requirements.md`,
   landed with this ADR). A structural assertion has **no REQ to cite** —
   there is no requirement about mid-instruction `obs_pc`, because §6.6
   unconstrains it. A test with no matrix row, or with a row citing a REQ
   whose text does not support it, is inspectable at the countersignature and
   samplable by the auditor for spec drift. Class: **PROSE** — nothing refuses
   an uncited test, and a determined author can cite a plausible REQ.
3. **REQ-106 (passivity) and REQ-113 (`OBS_ENABLE` tie-off)** guarantee that
   observation cannot change what the machine does. They constrain the **DUT**,
   not the bench, so they close the "observation perturbs the experiment" hole
   and close **nothing** about what the bench chooses to assert on. Class:
   **PROSE** in the spec; becomes checkable at P1 by REQ-113's directed test
   (a full campaign re-run with `OBS_ENABLE = 0` producing identical
   architectural behaviour).
4. **The structural fact that makes the risk small here, and does not
   generalise.** For this DUT, architectural state *is* the entire observable
   behaviour — a CPU with no display and no I/O has no other output. So
   "compare the state at every retirement" is not a state-inspection shortcut
   around behavioural testing; it **is** the behavioural test, and REQ-013's
   closure clause is what makes that a theorem rather than an opinion. The
   usual worry — that a state bundle lets a bench check internals instead of
   outputs — presupposes the module has outputs distinct from its state. This
   one does not. **In P2 it will**, and the argument must be re-made there
   rather than inherited.

**The honest verdict.** The argument that the port set is not a spec
describing an implementation **closes** — §6.3 (it descends from a signed
criterion), §6.4 (every element is architecture, a function of it, or a
boundary marker), §6.5 (the implementer keeps every freedom the obligation
does not touch), with §6.4's admission rule as the standing guard. The
argument that the port set cannot become a back door for structural testing
**does not close mechanically**: there is no MACHINE control, only three PROSE
ones, and their combined strength is "a structural test is unsound on the
spec's terms, has no REQ to cite, and is visible to two reviewers". That is a
review regime, not an enforcement one, and it is stated as such per **L-F03**
rather than dressed as a guarantee.

### 6.7 The one place the argument does not close — REQ-114

REQ-114 mandates that M02 hold its storage as a single unpacked array named
`mem`, 4096 × 8, at the top level of `chip8_ram`, so a bench can read memory
by a stable hierarchical path. **This is a constraint on an implementation
internal, and none of §6.4's argument covers it** — a hierarchical path is not
a boundary observable, and no amount of REQ-013 makes it one. It is defended
as least-bad among three options, not as clean:

| Option | Cost |
|---|---|
| **(i) Name the internal** (chosen) | A genuine internal-name constraint. Bars any M02 that does not hold memory as one flat array — no banking, no split halves, no vendor-primitive instantiation with a different internal shape. Checked, not assumed: this does **not** conflict with §6.6, which frees the *image* mechanism (file read / parameterized array / synthesis-time BRAM init) and not the storage shape; all three remain available over a flat array, and BRAM inference from a flat 4096 × 8 array is the ordinary iCE40 path. |
| **(ii) Let the bench discover the path from the RTL** | A **PROTOCOL §10 violation** — DV deriving from RTL — in the program's first phase, in its main verification instrument. Not available. |
| **(iii) Add a memory read-back port to M03** | Changes the DUT's synthesised interface for a verification purpose, contradicts REQ-112's port closure, and creates a second read path into the RAM that a design could accidentally use. Strictly worse than (i) for the same benefit. |

**The argument that makes (i) tolerable**: the bench depends on a memory
observable under *all three* options. The only question is **which artifact is
the authority for it** — the specification or the RTL. Choosing (i) does not
create a dependency; it moves the dependency's authority from the RTL to the
spec, which is precisely the direction PROTOCOL §10 requires. Refusing to
choose does not eliminate the coupling, it hides it.

That argument is sound and it is still not the same thing as "this is not
implementation description". **It is implementation description, minimised to
one name, justified by necessity, and declared in place** (§4.C says so in the
spec's own words: "the **only** internal name this specification constrains").
Recording it as an unclosed edge is more useful than a defence that reads
tidier than the fact.

### 6.8 Cost

- **The DUT's port list now depends on the verification strategy.** If the
  lockstep approach changes, the ports change, and after `P1-spec-freeze` that
  is post-freeze interface churn — the metric the charter's §6 counts against
  the architect.
- **~380 output bits** at M03's boundary. `OBS_ENABLE = 0` removes them from
  the P5 resource report (REQ-113), so the synthesis numbers are not inflated;
  but P5 must then also confirm that the `OBS_ENABLE = 0` build is the one
  measured, or the report describes a configuration nobody verified.
- **The pattern does not scale, and P2 will hit the wall.** P2's framebuffer
  is 2048 bits and P2's success criterion is a *full framebuffer compare*. A
  port is implausible at that width for the same reason memory got REQ-114
  rather than a port. So **REQ-114's shape, not the port set's, is the one
  that generalises** — which means P2 will have to re-make §6.7's uncomfortable
  argument at larger scale rather than inherit §6.4's comfortable one. Stated
  here as a prediction so P2's spec work starts from it.

### 6.9 Corpus verdict

The corpus for a *verification-interface* rule is the set of benches built
against specifications in this program. That set has exactly one member: the
toy lockstep bench of **ADR-0017 Amendment A2** (one register, one flag,
Python model, full state compared every cycle, run under both simulators).
The corpus is thin and saying so is part of the verdict.

**What the rule flags.** The A2 bench — correctly. It read DUT signals
directly because its toy DUT had no specification and therefore no specified
observation surface. Under this rule that bench could not be a graded
instrument, which is exactly right: A2 was an exploratory spike, and its own
text treats it as one.

**What the rule confirms.** A2 §5's found hazard — *"how many edges does one
model step correspond to?"*, which produced a **false divergence caused by the
bench rather than the DUT** — is the direct empirical case for `obs_retire`
and REQ-029. The one bench in the corpus supplies positive evidence for the
one element of the bundle that is not architectural state. That is the
strongest thing the backtest returned for this choice.

**What the rule misses.** Everything about whether a bench, once given a
specified surface, uses it behaviourally — see §6.6. The rule constrains the
*specification*; it constrains the *bench* not at all.

### 6.10 Falsifier

The first `SO-` packet whose evidence cites an `obs_*` value **outside** a
retirement cycle, or a matrix row whose test cannot be traced to the REQ it
cites. Either would show the PROSE controls of §6.6 failing in practice, and
the response would be a spec diff adding an imperative sampling clause — the
imperative §6.6 currently only implies.

---

## 7. Findings — what changed under scrutiny

Neither finding reverses a decision. Both are consequences of writing the
rationale down, which is what WO-0003 was for. Per **L-E10** open questions
are board artifacts; this author cannot stage `tasks/BOARD.md` (PROTOCOL §6),
so both are handed to the orchestrator in the packet's Return log and in
`J-architect_docs_lead-0002`, and both are recorded in the spec's own §11 so
that the gate reads them.

### 7.1 Finding A — the quirk-parameter set may be short by one (spec §11 D-7)

**Severity: minor. Does not block the freeze.**

README's P4 row requires "**every** divergent CHIP-8 behaviour exposed as a
compile-time parameter". Interpreter behaviour on unknown opcodes **is**
divergent across the population (halt / no-op / error / undefined). The same
**L-B12** argument used in WO-0002 to add `QUIRK_VF_RESET` and
`QUIRK_I_OVERFLOW_VF` beyond the packet's three would, applied consistently,
require a sixth parameter here.

**Why it is not adopted in this ADR**: (a) adding a parameter is a change to
specified behaviour, which WO-0003 places out of scope; (b) the reading is
genuinely arguable — the community quirk tables enumerate divergences in the
semantics of *CHIP-8 instructions*, and behaviour on encodings that are **not**
CHIP-8 instructions is plausibly outside "divergent CHIP-8 behaviour"; (c) the
evidence that would settle it — a conformant test ROM that needs no-op — does
not exist until P4, and P4 is where the parameter would first be exercised
anyway.

**Recorded as spec §11 deferred item D-7**, not an open question: it has a
stated what-a-reader-assumes-meanwhile (P1 halts; no such parameter exists;
REQ-041/042 are unambiguous) and nobody is blocked today. Closes by
`P4-spec-freeze`.

### 7.2 Finding B — the fully-specified reset does not cover memory (spec §11 OQ-4)

**Severity: blocks `P1-spec-freeze`.** It is the sharpest thing this work order
produced and it comes directly out of §5.4's backtest.

**The gap.** REQ-014: *"The contents of memory at the first fetch SHALL equal
the image named by `MEM_INIT_FILE`, or all-zero when it is `""`."* §5.4 adds
the all-zero guarantee **only** for the empty-string case. For a real image
shorter than 4096 bytes — which is every realistic P1 image — **neither clause
says what the remaining bytes hold.**

**Why it matters, in four steps:**

1. **REQ-123 is falsified as written.** It claims "no free-running counter, no
   uninitialised storage, and no source of nondeterminism anywhere in P1". Under
   a partial image, 32768 bits of storage have no specified initial value. The
   claim is not discharged by REQ-014.
2. **§6.6 makes it worse rather than better.** It frees M02's image mechanism
   among a file-read initial block, a parameterized constant array, and
   synthesis-time block-RAM initialisation. Those three differ **precisely** in
   what they leave in unwritten locations — `$readmemh` leaves them at their
   initial value, a constant array defines them, a BRAM init may or may not.
   The specification therefore permits realisations that disagree about a third
   of the machine's state.
3. **The blind lane hides it.** Verilator is 2-state: unwritten locations read
   `0` and the fast lane, where all long random campaigns run, is green.
   Icarus reads `X`. The disagreement surfaces only in whichever 4-state test
   first reads unwritten memory — and REQ-008's compensating control (§5.2)
   covers *architectural registers*, not memory, so nothing is aimed at this.
4. **It manufactures false divergences.** The Python golden model has no `X`
   and will zero-fill. Against an Icarus DUT that X-fills, the first read of
   unwritten memory diverges — a divergence caused by **the specification**,
   not by the RTL. That is exactly ADR-0017 A2 §5's false-divergence hazard
   class, arriving from a direction A2 did not anticipate.

**What is not done here.** The repair is one sentence of normative text —
plausibly "every byte of memory not covered by `MEM_INIT_FILE` is `8'h00` at
time zero", which would also discharge REQ-123 and align the model — and **one
sentence of normative text is a change to specified behaviour.** WO-0003 puts
that out of scope in terms this ADR will not stretch: *"If writing the
rationale convinces you a choice was wrong, stop and say so — that is a spec
revision, a new packet, not an edit smuggled through an ADR."* The choice is
not wrong; its **scope is short**, and closing it is a spec diff. It is
recorded as **spec §11 OQ-4** and routed. `SPEC-TEMPLATE` §11 bars freezing a
spec that carries an open question, so the gate cannot sign over it — which is
the correct consequence and the reason it is recorded in the spec rather than
only here.

### 7.3 Costs the backtest added that the spec had not stated

Not findings, but new information, recorded so they are not rediscovered:

- **§3.3** — the address-range fault localises the *use* of an overflowed I,
  not the `FX1E` that overflowed it; and `QUIRK_I_OVERFLOW_VF = 1` is the
  configuration that carries the cause-side diagnostic. A reason for P4's
  alternate-configuration run beyond compatibility.
- **§4.4(b)** — the precise reason eight RNG steps are needed: after one step
  the output byte is `s[8:1]`, sharing seven of eight bits with its
  predecessor. The spec's normative "eight steps" is unchanged; only the
  argument is sharpened (**L-A04** — the sharpening appends here, it does not
  rewrite §6.5).
- **§6.8** — the observation-port pattern does not scale to P2's 2048-bit
  framebuffer, so **REQ-114's hierarchical-name shape is the one P2 inherits**,
  not the port set's.
- **§5.2** — "compensating control" is the wrong label for a fully-specified
  reset. It is hazard *elimination*; the compensating control for Verilator's
  blindness is the Icarus lane, and only that.

---

## 8. Consequences

1. **Spec §11 D-2 is discharged**; D-1 is discharged by
   `docs/specs/requirements.md`, landed in the same commit. `P1-spec-freeze`
   loses two preconditions and gains one (OQ-4, §7.2).
2. **The freeze is blocked on OQ-4** until a spec-revision packet closes it.
   OQ-1 (routed to `dv_lead` in WO-0004), OQ-2 (decided P3 by the
   orchestrator, board-recorded), and OQ-3 (accepted limitation with P4 as the
   compensating control) were already open; OQ-4 joins them and is the only
   one of the four that is a *defect in this document* rather than a question
   about scope or provenance.
3. **The admission rule for the observation bundle** (§6.4) governs every
   future `obs_*` addition in P1–P5. It is PROSE, enforced at the
   countersignature and by auditor sampling; nothing mechanical refuses a
   structural port.
4. **P2's spec work inherits two predictions**: the observation pattern must be
   re-argued at framebuffer scale (§6.8), and REQ-114's shape is the one that
   generalises. Neither is a decision made here.
5. **No PROTOCOL §11 enforcement change, no `scripts/test_protocol.sh`
   scenario, no write-scope amendment.** This ADR touches no law.
6. **Nothing in `rtl/**` is created, implied or reserved by this ADR.** D-3
   (`rtl/chip8_pkg.sv`) remains `rtl_lead`'s and remains deferred.

---

## 9. Provenance and enforcement classes

Per **L-B01**, every claim above carries a class; per the `CLAUDE.md` iron rule
and ADR-0002/ADR-0016, every enforcement claim carries **MACHINE** or **PROSE**.

| Claim class | Where | Provenance |
|---|---|---|
| CHIP-8 behavioural facts, interpreter-population behaviour, VIP defaults | §2.4, §3.4, §4.4, §5.4 | **Relayed** — from the intake's consult-only references at second hand. **No external document was retrieved during this work.** Spec §11 OQ-3 states the exposure; P4's test-ROM campaign is where they become *measured*. |
| The LFSR one-step identity (all 65536 states), the absorbing zero state, and the period 65535 | §4.4(b) | **Measured** — the command is shown and its observed output recorded (`True`, `True`, `65535`). Note what this is *not*: it measures the **specified sequence**, i.e. this ADR's own arithmetic. No RTL and no simulator exist; nothing here measures a design. |
| That eight steps are therefore the right count | §4.4(b) | **Derived** from the measured identity plus a relayed premise about ordinary program behaviour (two consecutive `CXNN` to pick a coordinate pair). |
| The decode-space counts cited as context | §2.4 | **Derived** — the derivation is spec §6.3's table, re-summed in `J-architect_docs_lead-0001` Evidence. |
| Toolchain properties (Verilator 2-state, Icarus 4-state, cocotb 1.9.2) | §1, §5.2, §6.9 | **Relayed** from ADR-0017 and its Amendment A2, which measured them. |
| REQ-114 does not conflict with §6.6 | §6.7 | **Derived** — §6.6 frees the image mechanism, not the storage shape; checked against both texts rather than assumed. |
| The corpus backtest of choices 1–4 | §2.4, §3.4, §4.4, §5.4 | **Derived, and explicitly not measured** — §1 states why the literal backtest is not performable at this commit and names the gates at which it becomes performable. |

| Enforcement claim | Class |
|---|---|
| REQ-008's full reset removes uninitialised architectural state | **PROSE** — a specification instructs; no script refuses RTL that omits a reset term |
| The Icarus lane detects an `X` if one exists and a test reads it | **MACHINE**, once the lane runs — a red build. Not yet run: no RTL exists |
| A structural test has no REQ to cite in the traceability matrix | **PROSE** — review- and audit-enforced; nothing refuses an uncited test |
| Mid-instruction `obs_*` values are unspecified, so asserting on them is unsound | **PROSE**, and by *inference* from §6.6 rather than by an imperative clause — see §6.10's falsifier |
| The observation-bundle admission rule (§6.4) | **PROSE** — countersignature and auditor sampling |
| `OBS_ENABLE = 0` changes no architectural behaviour | **PROSE** today; **MACHINE** once REQ-113's directed test runs |
| Port closure (REQ-112), passivity (REQ-106) | **PROSE** — line-by-line countersignature is the control, per ADR-0017 Consequence 1's reviewed-port-table regime |
