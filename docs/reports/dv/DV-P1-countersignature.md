# DV-P1-countersignature — confirmatory pass on the amended `SPEC-P1-core-cpu.md`

- **Packet**: `agents/handoffs/WO-0007_p1-confirmatory-countersignature.md`
- **Author**: dv_lead · journal `J-dv_lead-0002` (this report's authority)
- **Spec under review**: `docs/specs/SPEC-P1-core-cpu.md` at **`ddc06dc`** (DRAFT)
- **Prior round**: `docs/reports/dv/DV-P1-testability.md` at `54a7221` — NOT
  COUNTERSIGNED, six amendments A-1…A-6, `J-dv_lead-0001`
- **Gate row**: `P1-spec-freeze` — "dv_lead countersigns testability" (PROTOCOL §7)
- **Date**: 2026-08-05

---

## 0. Verdict

> ## **NOT COUNTERSIGNED** at `ddc06dc`.

**All six amendments landed, and they landed correctly.** OQ-4's closure is
right, its normative text is testable, and I have now confirmed its behaviour
**by measurement in both lanes** rather than by reading. The architect also
caught a defect my own two amendments would have created together, which I
missed. None of that is in dispute and none of it is re-opened.

The signature is withheld for one reason, and it is new text: **three of the
six amendments were applied with additions beyond the text I wrote, and one of
those additions is measurably wrong.** REQ-109's added sentence forbids the
only form of `MEM_INIT_FILE` declaration that elaborates in the authoritative
lane, while REQ-115 requires the form that does not elaborate at all. There is
therefore **no conformant way to give the DUT a memory image in the Icarus
lane** — which is F-5, alive, arriving through F-5's own repair.

That finding is **measured, not argued**: Icarus 12.0 rejects a package
`string` parameter in a module parameter's default expression, and crashes on
the function form. Commands and outputs are in §9.

Three further blocking items ride along, each one clause or one table cell:

| # | Blocking defect | Repair size |
|---|---|---|
| **B-1** | REQ-109's A-5 addition forbids the only `MEM_INIT_FILE` default that elaborates; REQ-115 mandates one that does not | one sentence + one table cell |
| **B-2** | §5.5 still defines `SP_W` — the value REQ-115 forbids a module to read — while REQ-109 ¶1 orders every package value referenced and never restated | one table cell |
| **B-3** | REQ-115's "`SP_W` … is the only such case in P1" is measurably false: `obs_stack`'s width expression fails identically (measured 48 vs 192 bits at `STACK_DEPTH = 4`) | eight words |
| **B-4** | A-4's added paragraph puts the model-to-DUT comparison "at retirement … and nowhere else", which excludes the entire fault surface (no fault ever retires) and the `mem` array | one clause |

**Total repair: four sentences. No behaviour changes in any of them.** Exact
replacement text is in §8, written to be applied as a transcription.

**Pre-commitment, again, so this costs one round and not two.** A revision
whose diff from `ddc06dc` is exactly §8's four repairs needs no further review
round from me: verifying that diff is a transcription check, not a review, and
the countersignature issues as `J-dv_lead-0003`. **Everything else in this
document is confirmed and closed** — A-1…A-6 as landed, OQ-4's closure, the
§10 hook corrections, the traceability matrix (verified 91/91 rows, hook
columns byte-identical to §10 — measured, §9.6), and the 84 requirements and
30 ports graded at `54a7221`.

**What this round bought that a signature would not have.** Four NO-VERDICT
items are now measured. **NV-1 is discharged positive** (cocotb reaches an
unpacked array by hierarchy in *both* lanes). **NV-3 is discharged and it
fired the falsifier ADR-0018 A2.7 named**: `parameters={"MEM_INIT_FILE":
"/path"}` — the sanctioned form, the documented cocotb API, the one a test
author writes first — **does not reach the parameter in the Icarus lane, and
the run goes green anyway with an unloaded memory** (§9.3). That is a worse
presentation than the `-Ppkg.P=` form the packet flagged, because it is on the
supported path.

---

## 1. Scope of this pass, and what it did not touch

My §8 pre-commitment at `54a7221` binds me: *"on a revision carrying A-1 … A-6,
my confirmatory pass is limited to the amended text. I have graded the other 84
requirements and the §4 port tables line by line; that grading stands and I will
not re-open it."* It is honoured.

**Confirmatory surface** — bounded by spec §13.1's own enumeration, which is
what made this a bounded pass rather than a diff hunt:

- The six amendment landings and the four propagation sites §13.1 lists.
- **The three additions**, flagged by the architect so they would be graded
  rather than discovered (§13.1: *"the additions are in scope for `dv_lead`'s
  confirmatory pass"*). That flagging is the reason B-1 was found.
- OQ-4's closure: REQ-014's rewrite, §4.B, §5.4, §6.6, REQ-008's narrowing,
  REQ-123's enumeration, and ADR-0018 Amendment A1.
- **REQ-115**, new, in scope by virtue of being new (90 → 91).
- D-8 and D-9, both new rows raised by my own report.

**Not touched**: the other 84 requirements; the 30 ports' direction and meaning
columns; §6.3's decode partition; §6.4's instruction semantics; §7.1's cycle
table. Where I quote them below it is to check an amended clause against them,
never to re-grade them.

---

## 2. Inputs, and the independence declaration

Read in full for this work order:

- `agents/charters/dv_lead.md`; `agents/PROTOCOL.md` (v2)
- `agents/handoffs/WO-0007_p1-confirmatory-countersignature.md` (its §0 standing
  obligations bind this entry)
- `docs/specs/SPEC-P1-core-cpu.md` at `ddc06dc` — §2, §4.A–§4.D, §4.3, §5.0,
  §5.1–§5.5, §6.1.1, §6.6, §7.1, §7.7, §8, §10, §11, §12, §13.1 in full
- `docs/specs/requirements.md` (all 91 rows, mechanically diffed against §10)
- `docs/adr/ADR-0018-p1-core-cpu-design-choices.md` Amendments **A1** and **A2**
- `docs/reports/dv/DV-P1-testability.md` (my own, §7 findings and §8 amendments)
- `tasks/BOARD.md`; `docs/LESSONS.md` (L-A04, L-A07, L-B01, L-B04, L-B12, L-C05,
  L-C08, L-C09, L-D04, L-D11, L-D12, L-D16, L-E02, L-E03, L-F03)
- `.github/workflows/build.yml` (the R-CI-d source guard, to keep this round's
  harness out of its way)

**I have read no RTL, because none exists.** `rtl/` is absent from this tree at
`5dfe877`. Every judgement here derives from the specification, the ADR, and my
own measurements of the *language and toolchain* — never of a design, because
there is none to measure. This is the same limit ADR-0018 A1.5 states for the
architect's harness, and I state it in the same place for mine.

**One thing changed since `J-dv_lead-0001`.** That report closed with *"nothing
in this report is measured, because nothing was run."* This one is different:
Icarus 12.0, Verilator 5.020 and cocotb 1.9.2 are present in this checkout, so
the claims that were **relayed** last round are **measured** this round, by my
own hands and my own harness rather than by relay of the architect's. The
harness is committed at `test/spikes/` so the auditor re-executes it at this
SHA; it is deliberately **not** named `test/test_*.py`, so `build.yml`'s R-CI-d
source guard stays armed and its written de-gating condition is not
short-circuited by a measurement instrument.

---

## 3. A-1 … A-6, confirmed over §13.1's enumerated surface

| # | What I asked for | Landed? | Confirmation |
|---|---|---|---|
| **A-1** | Parameter expressions in the width columns; `stack[0]…stack[STACK_DEPTH−1]`; explicit enum base types | **YES, plus propagation** | §4.A/§4.B/§4.D width columns are expressions; the note under §4.A records that every expression evaluates to its old literal at the default, so **no width changes value** — that note is the right thing to have written and I would not have thought to ask for it. §5.5's base-type sentence is verbatim. The five extra propagation sites (§2, §6.1.1, §6.4.4, §6.6, §10 REQ-006) are exactly the sites that carried the same literals; I checked each. **Confirmed.** |
| **A-2** | M02's power-up value; REQ-008 narrowed | **YES, verbatim + one paragraph** | §4.B's paragraph is my text unchanged. REQ-008's closing sentence is narrowed as written. The added paragraph turns the three-clause coverage into an **enumeration** — REQ-008, REQ-014, §4.B — which is the same repair OQ-4 makes from the other end, and it is what makes REQ-123's "no uninitialised storage" discharged rather than asserted (L-D12: a claim is not a check; an enumeration is). **Confirmed, and the addition improves it.** |
| **A-3** | REQ-115, the elaboration-time override path | **YES, plus a clause I needed and did not have** | §5.0 carries REQ-115; §4.3 and §4.C reference it; §5.4 says *module* parameter. The added derived-width clause is judged in §4 and §6 — its direction is right, its scope is wrong (**B-3**), and it is the reason **B-2** is now visible. |
| **A-4** | The compared domain appended to REQ-123 | **YES, verbatim + one paragraph** | The compared-domain block is my text unchanged. The added domain-separation paragraph is judged in §4 — it is the right distinction and it over-reaches (**B-4**). |
| **A-5** | REQ-109 scoped across the SV/Python boundary | **YES, verbatim + one sentence** | The scope block is my text unchanged. **The added sentence is B-1.** |
| **A-6** | REQ-095 replaced; six connectivity vectors | **YES, verbatim + propagation** | REQ-095's replacement text is adopted unchanged and promoted into a normative block in §5.2. Propagated to §2's scope table and §10's hook (`I` → `D + I`). The recorded observation that **A-6 is unimplementable without A-3** is correct and is the pairing I should have stated myself. **Confirmed.** |

**Nothing was declined, and nothing I asked for was weakened.** Six for six.

### 3.1 The four "beyond the amendments" corrections

- **F-1 / F-7 / F-8 → §10's hook column.** Confirmed. The `(M01)`/`(M02)`/`(M04)`
  convention is in the legend; REQ-020 reads "D, via REQ-028"; REQ-105 reads
  `S + D`; REQ-113 reads `D (M01)`; REQ-082 carries the ordering clause's own
  hook. No requirement *text* moved — I checked, because a hook correction that
  quietly edits a requirement would be the worst possible form of this repair.
- **F-6 → D-9 + the legend.** Confirmed, and correctly routed rather than
  decided (L-F03: the missing performer is stated in place).
- **F-11 → D-8.** Confirmed. Judged in §7.
- **F-13 → §2 and §7.1.** Confirmed. §2 cites §6.4.1–§6.4.3; §7.1 gains the
  retire-to-retire paragraph, which states both the fault-row measurement
  (previous `obs_retire` → `obs_halted` rising) and the retire-to-retire one.
  That is more than I asked for and it is the half a bench author actually
  needs.

---

## 4. The three additions, judged

An amendment applied *plus something* is not the amendment I wrote. Each
addition is graded on its own.

### 4.1 A-3's addition — the derived-width clause. **Right, and I missed it.**

> *"Any parameter whose value is derived from an overridable one — `SP_W` =
> `$clog2(STACK_DEPTH)+1` is the only such case in P1 — SHALL be derived inside
> the module from that module's own parameter, not read from `chip8_pkg`."*

**The catch is real and it is mine to have missed.** A-1 and A-3 were written
as independent repairs and reviewed as independent repairs; their *composition*
reinstates F-2. I verified the mechanism myself rather than accepting the
relay (§9.2): at `STACK_DEPTH = 4` pushed through cocotb's runner, a
module-derived `SP_W` reads **3** and a package-derived one reads **5**, in
**both** lanes. The architect's measurement reproduces exactly.

Two things follow, and only one of them is a compliment:

1. **The clause is necessary and its direction is correct.** Without it the
   override path silently mis-widths the observation bundle.
2. **Its scope is narrower than the class, and its inventory claim is false**
   — see **B-3** (§6). §4.A's note under the port table states the *general*
   rule ("`SP_W` **and any other width derived from an overridable parameter**")
   and ADR-0018 A2.2 states the general rule too ("**any width** derived from
   an overridable parameter"). Only REQ-115 — the normative site, the row the
   traceability matrix cites, the text an RTL author implements against —
   states the narrow one.

**And the clause makes a second defect visible that was invisible before it**
(**B-2**, §6): if a module may not read `chip8_pkg::SP_W`, then §5.5 defines a
value that nothing is permitted to reference, while REQ-109 ¶1 orders every
value in that table referenced and never restated. The near-miss is **half
closed**: the instruction not to read the package is in place, and the thing
not to read is still sitting in the package.

### 4.2 A-4's addition — the domain separation. **Right distinction, over-reaching sentence.**

> *"The **model-to-DUT** comparison is a different and smaller thing: it happens
> at retirement, on the bundle REQ-029 pins there, and nowhere else."*

**The distinction is correct and I want it.** §6.6 frees whether `obs_*` is
driven directly or through a register stage, so a mid-instruction `obs_*` value
is deterministic (comparable lane-to-lane, both lanes running the same RTL) but
unspecified (not assertable against a model). Without this paragraph a literal
A-4 licenses a model comparison on mid-instruction values, which false-fails
against a legal implementation. That back door is real and closing it is right.

**"And nowhere else" closes two doors that must stay open:**

1. **The entire fault surface.** A faulting instruction **never retires**
   (REQ-029, REQ-049). Read strictly, there is no licensed model-to-DUT
   comparison point for `obs_halted`, `obs_err`, or the frozen
   `obs_instr`/`obs_instr_addr` — for any of the five fault conditions of §9,
   or for the **65536-encoding decode sweep**, which is the largest campaign I
   committed to at `54a7221` and which lives entirely at halts. The observation
   is independently pinned (REQ-048 makes it sticky and terminal; REQ-049
   identifies the offender), so the check is sound — but its authority would
   then come from a bench decision rather than from the spec, which is exactly
   what F-9 existed to prevent.
2. **Memory.** "The bundle REQ-029 pins there" is the `obs_*` outputs. The
   `mem` array is architectural state (§6.1.1's first row), it is named in the
   *determinism* domain one paragraph above, and REQ-120 says the full state is
   observable at retirement "either through an `obs_*` output **or, for memory,
   through REQ-114's named array**". README's signed P1 criterion is a **full
   architectural-state compare after every instruction**. The strict reading
   drops memory out of the compared domain and narrows a signed success
   criterion by a subordinate clause.

Repair in §8 (**B-4**): name the two additional points. One clause.

### 4.3 A-5's addition — the "not a second definition site" sentence. **Necessary, and it is the blocking defect.**

> *"REQ-115's module parameters are not a second definition site either: each
> **defaults to** its package value and restates none of them. **A default that
> is written as a literal instead of as the package reference is exactly the
> defect this requirement names.**"*

The first half is necessary: REQ-115 creates a new restatement surface and this
sentence closes it. The second half is the one I measured.

**Measured, Icarus 12.0** (§9.1). A package `string` parameter cannot appear in
a module parameter's **default expression**:

```
$ iverilog -g2012 -o a.vvp -s top a.sv
a.sv:5: error: Unable to bind variable `S' in `p'
1 error(s) during elaboration.
```

The same package string is usable **inside the module body** (measured, works).
Package `int`, `logic [11:0]`, `bit` **and enum-typed** parameters are all
accepted as defaults (measured, all four print their values). It is `string`
specifically, and it is `MEM_INIT_FILE` specifically — the one parameter §5.4
says **every test sets**. Compilation-unit `import` does not help; a package
accessor function **crashes the tool** (`Assertion 'tmp' failed`, SIGABRT).
Verilator accepts the package-string default.

So the two clauses are jointly unsatisfiable in the authoritative lane:

| RTL an author could write | REQ-115 | REQ-109 + A-5 addition | Icarus 12.0 |
|---|---|---|---|
| `parameter string MEM_INIT_FILE = chip8_pkg::MEM_INIT_FILE` | satisfied | satisfied | **does not elaborate** |
| `parameter string MEM_INIT_FILE = ""` | satisfied | **violated** — a literal default, "exactly the defect this requirement names" | elaborates |

**There is no third row.** This is F-5's shape exactly: the specification
asserts a mechanism that does not exist. It is the reason the signature is
withheld.

**The repair is not to weaken REQ-109** — it is to notice that `MEM_INIT_FILE`
never belonged in the package. It is a per-test input with no shared value to
drift, unlike every other row of §5.5's table; its "value" is the empty image,
which REQ-014 clause 2 already defines normatively. Removing it from §5.5
leaves REQ-109 fully intact (nothing is restated because nothing is defined
twice), and lets the module parameter default to `""` with no defect. Text in
§8.

---

## 5. OQ-4's closure, graded

### 5.1 Is `8'h00` via two ordered clauses testable? **Yes — and testable in-band, which is better than I expected.**

The specification's normative form is two ordered clauses at REQ-014 plus a
per-lane observation table. Three properties make it testable:

1. **It is a statement about values, not about mechanisms.** REQ-014 fixes the
   contents of all 4096 locations for every value of `MEM_INIT_FILE`; §6.6
   keeps the three realisations free *above* it. A test asserts contents and
   never has to know which realisation it is looking at. That is the difference
   between a testable requirement and a code review.
2. **The observation needs no hierarchical handle.** `ANNN` sets I to an
   uncovered address; `FX65` with X = 0 loads V0 from `M[I]`; `obs_v[7:0]` at
   the retire cycle carries the byte. Both lanes, no VPI array access, no
   dependence on NV-1 — the check runs through the architectural path, which is
   where a spec-derived check belongs. Derived from §6.4.3 + §4.A + REQ-029.
3. **The hierarchical path also works** — NV-1 is now discharged positive
   (§9.5): `dut.mem[0]` reads in **both** lanes under cocotb 1.9.2. So the
   memory-half comparison has two independent channels, not one.

**Measured, both lanes** (§9.4). Conformant realisation, prefix image `11 22 33`
into a 16-location array: `11 22 33 00 00 00 00 00 00 00 00 00 00 00 00 00` in
Icarus **and** Verilator. REQ-014's table row 1 reproduces exactly.

One case REQ-014 does not specify and does not need to: an image covering the
same location **twice** ("the image's byte for it" is then ambiguous; `$readmemh`
takes the last record). Every P1 image is generated by my bench, so this is a
stimulus constraint I accept and place, not a spec defect. Recorded so it is a
decision rather than an oversight.

### 5.2 Does the non-conformant row give me a deliberate-mismatch check I can really run? **Yes — with three qualifications, and one of them is a live hazard in my own instrument.**

**Measured** (§9.4), image applied without clause 1:

| | Icarus 12.0 | Verilator 5.020 |
|---|---|---|
| prefix image, no zero-fill | `11 22 33 xx xx xx xx xx xx xx xx xx xx xx xx xx` | `11 22 33 00 00 …` |
| sparse image, no zero-fill | `11 22 33 xx xx xx xx xx xx xx xx xx aa bb xx xx` | `11 22 33 00 … aa bb 00 00` |

REQ-014's tabulated non-conformant row reproduces. The check is runnable, and
as a mutation cell it is a good one: the mutation is *removing a loop*, the
symptom is lane-asymmetric, and it is precisely the class §10 of the protocol
calls owed.

**Qualification 1 — it is an Icarus-only cell, and a campaign must say so.**
Verilator cannot distinguish conformant from non-conformant on this axis at
all; its two rows above are byte-identical to the conformant ones. A sealed
prediction that scores this cell in the Verilator row would be scoring a cell
that **cannot fail** — a vacuous prediction, caught at adjudication where a
prediction that selects nothing cannot be scored (L-C08, PROTOCOL §10). The
Verilator row is MUST-STAY-GREEN and says nothing; the Icarus row is REQUIRED.

**Qualification 2 — the failure form is an exception, not a value mismatch,**
and a sealed message must say so (L-C09). Measured, cocotb 1.9.2:

```
mem[3] resolvable=False
int=RAISED:ValueError:Unresolvable bit in binary string: 'x'.
     Set the COCOTB_RESOLVE_X environment variable to configure how special
     values are resolved.
```

Sealing "expected 0x00, got 0xXX" would seal the wrong message and the kill
would not count in its named row.

**Qualification 3 — and this is the one that matters — my own instrument can
be configured blind.** Measured (§9.4, config C9): with
`COCOTB_RESOLVE_X=ZEROS` set in the environment, the identical non-conformant
build reports `resolvable=False` but **`int=0`** — the `X` resolves silently to
zero and the comparison passes. One environment variable turns the four-state
authoritative lane into a second two-state lane, for **every** X-related check
in the program, not just this one. Nothing in the repository sets or pins it
today.

That is a silently-always-pass hazard in the instrument rather than in the
design, and closing it is mine, not the spec's: **the bench asserts its own
X-resolution policy at import time and fails loudly if the environment has
overridden it.** Committed in §7.3.

### 5.3 Does the per-location phrasing cover the hole in the middle? **Yes, and it covers more than the hole.**

REQ-014 clause 1 is universally quantified over all 4096 locations *before* any
image is applied, and the "covers" gloss names the mechanism explicitly:

> *"'Covers' is per location, not per prefix: an image may be shorter than 4096
> bytes **and** may leave holes in the middle (a `$readmemh` file may carry
> `@address` records), and clause 1 answers both the same way."*

**Confirmed, and measured** (§9.4, config C7). A sparse image with `@0000` and
`@000C` records, with clause 1 in place, reads
`11 22 33 00 00 00 00 00 00 00 00 00 aa bb 00 00` in both lanes: the
nine-location hole in the middle **and** the two locations past the last record
both hold `8'h00`. The same file without clause 1 reads `xx` in all eleven of
those locations in Icarus.

The phrasing is stronger than the hole case needed. Because clause 1 quantifies
over locations and clause 2 quantifies over coverage, the answer is independent
of the image's *shape* entirely — prefix, suffix, hole, scatter, or empty. A
repair phrased per length ("bytes beyond the end of the image") would have left
a hole in the hole; this one has no shape-dependent residue for a future image
generator to fall into. I checked it against the shape my own decode sweep
produces — two bytes written at a PC, everything else uncovered, no `@` records
— and against the sparse form, and both are answered by clause 1 alone.

---

## 6. The near-miss: does the derived-width rule hold for *every* derived width?

**No.** It holds for `SP_W`. Two other derivations from `STACK_DEPTH` are
outside the clause as written, and one of them I measured failing in exactly
the same way.

**Derived-from-overridable inventory, P1** (derivation shown; the overridable
set is §5.1/§5.3/§5.4's own "Range" column):

| Derivation | Where | Depends on | Covered by REQ-115 ¶2 as written? |
|---|---|---|---|
| `SP_W` = `$clog2(STACK_DEPTH)+1` | §5.1, §4.A `obs_sp` | `STACK_DEPTH` | **Yes** — named |
| **`ADDR_W*STACK_DEPTH`** | §4.A `obs_stack` width column | `STACK_DEPTH` | **No** — it is a width *expression*, not "a parameter whose value is derived" |
| **the stack array's own depth** | §6.1.1 state table, REQ-008's reset row | `STACK_DEPTH` | **No** — same reason |
| `NUM_V*DATA_W` | §4.A `obs_v` | `NUM_V` — not overridable in P1 | latent; becomes live only if `NUM_V` ever opens (E2) |
| `$bits(err_e)` | §4.A `obs_err` | the package enum's base type — not overridable | no |

**Measured** (§9.2), `STACK_DEPTH = 4` pushed through cocotb's runner, both
lanes identical:

| Quantity | Derived in the module | Read from the package |
|---|---|---|
| `SP_W` | **3** | **5** |
| `obs_stack` width | **48** | **192** |

The width expression fails identically to the named parameter. So REQ-115's
parenthetical — *"`SP_W` … is the only such case in P1"* — is a factual claim
in normative text that is **measurably false**, and the SHALL it qualifies
reaches only the case it names.

**Why this one is worse than it looks, and why it is B-3 rather than a note.**
The `SP_W` failure is *loud*: at `STACK_DEPTH = 4` a module that reads the
package's depth also gets the package's overflow threshold, so REQ-122 class 5's
mandatory stack-overflow vector faults at the seventeenth call instead of the
fifth and the directed test goes red. The **width** failure is *quiet*: `obs_sp`
5 bits wide instead of 3 carries the values 0…4 identically, and a
value-compare never sees it; `obs_stack` 192 bits instead of 48 is caught only
by a bench that compares the whole port rather than per-entry slices. A defect
whose behavioural half is loud and whose structural half is silent is one that
gets diagnosed as "the loud half, now fixed".

**Two more things the clause should say, both cheap:**

- **REQ-115 names only M02 and M03.** `obs_sp`, `obs_stack`, the stack array,
  `STACK_DEPTH`, `PROG_START`, `OBS_ENABLE` and the five quirk parameters all
  live in **M01** (§4.A), and `RNG_SEED` lives in **M04** (§4.D). M01 and M04
  acquire their parameters only by *entailment* from REQ-115's "passed down to
  submodules unmodified" — you cannot pass a parameter into a module that has
  none. The entailment is sound, so this is **F-16, MINOR**, not blocking; but
  the derived-width rule's "that module's own parameter" is written about
  modules the SHALL does not name, and a literal reader declares parameters on
  M02 and M03 and lets M01 read the package — which is the near-miss again, one
  level down. The repair is naming all four modules.
- Read literally, REQ-115 also requires **M02** — a RAM — to declare
  `RNG_SEED`, `STACK_DEPTH` and the five quirk parameters. Harmless, and worth
  one word ("each declaring those it uses; M03 declares all of them").

---

## 7. F-5, REQ-115, and the silent-ignore presentation

### 7.1 Does REQ-115 close F-5? **In principle yes; as written, no — see B-1.**

REQ-115 identifies the right mechanism, and the mechanism works: a top-level
module parameter defaulting to a package value is overridable at elaboration in
both lanes, and I confirmed it end-to-end through cocotb 1.9.2 rather than at
the flag level (§9.3) — `int`, `bit`, `logic` vector, **enum-typed** and
`string` parameters all reach the elaborated design and read back correctly.
The package/override conflation that was F-5 is correctly diagnosed and
correctly separated.

What it does not do is elaborate, for `MEM_INIT_FILE`, in the authoritative
lane, because of the *addition* to REQ-109 (§4.3, **B-1**). F-5 is repaired in
its diagnosis and not yet in its text.

### 7.2 Does the silent-ignore presentation need a bench-side guard too? **Yes — and it is worse than the packet's framing, because the sanctioned form is the silent one.**

The packet flagged Icarus's `-Ppkg.P=…` as silently ignored, and that the form
a test author tries first. I confirmed it myself (§9.3): `-Pp.N=99` against a
package parameter is accepted, exits 0, and leaves the value unchanged.

**But that is not the form a test author writes.** A test author writes the
documented cocotb API:

```python
runner.build(sources=[...], hdl_toplevel="chip8_core_top",
             parameters={"MEM_INIT_FILE": "/path/to/prog.hex"})
```

cocotb 1.9.2 formats every parameter as `-P<top>.<name>=<value>` (Icarus) or
`-G<name>=<value>` (Verilator), **with no type awareness and no quoting**
(source read; §9.3). A Python `str` therefore arrives unquoted, and:

| Lane | What happens | Exit code | Suite result |
|---|---|---|---|
| **Icarus 12.0** | `<command line>: error: invalid value specified for defparam: top.S` — **and it exits 0, emits a working `sim.vvp`, and the parameter keeps its default** | **0** | **GREEN, over an unloaded memory** |
| Verilator 5.020 | `%Error: Illegal character in decimal constant: /` | non-zero | build fails, runner raises — **loud** |

Measured, both, in §9.3. The workaround is to pass the value already carrying
SystemVerilog string quotes (`'"/path"'`), which works in both lanes.

So the lane asymmetry runs the wrong way twice over: **the authoritative,
four-state, X-detecting lane is the one that fails silently, and the fast lane
where the long campaigns run is the one that fails loudly.** And the four
distinct ways a P1 test can end up running 4096 zero bytes are, measured:

| Failure | Icarus diagnostic | Icarus exit | Verilator |
|---|---|---|---|
| unquoted string through `parameters=` | `error: invalid value specified for defparam` | **0** | `%Error`, loud |
| `-Ppkg.P=` package-scope override | **none at all** | 0 | no equivalent flag |
| `MEM_INIT_FILE` names a missing path | `ERROR: $readmemh: Unable to open …` | **0** | warning |
| image shorter than the array | `WARNING: Not enough words in the file for the requested range` | **0** | — |

**Every one of them prints something and none of them fails the run.** Under
REQ-043 the all-zero machine then halts on `0x0000` with `ERR_ILLEGAL_OPCODE`
at the first instruction — a plausible test outcome (it is, deliberately, my
own first smoke test). REQ-014's own L-F03 paragraph anticipates precisely
this, declines to fix it in the design because the failure is upstream of the
machine, and names the compensating control as bench-side and `dv_lead`'s.
**That disposition is correct and I accept it** — it is the spec naming a
control it cannot perform instead of pretending a requirement covers it.

### 7.3 The guard, committed

Placed here rather than deferred, because a control named at a freeze and
designed later is a control nobody costed. All four are mine, land with the
first bench, and appear as rows of `test/attack_plans/AP-chip8_core_top.md`:

1. **Assert the load through the design, never through the log.** Every
   generated image carries a known first instruction; every test whose intent
   is a loaded image asserts that the **first post-reset event is that
   instruction's retire**, not a halt. Log scraping is excluded by measurement:
   the diagnostics above are non-fatal, lane-inconsistent, and one case emits
   nothing.
2. **Intent is declared, not inferred.** Tests carry `expects_image = True |
   False`; the small enumerated set that means to run an empty image (the
   REQ-043 smoke test) is the only place `False` appears. Without this, "loaded
   nothing" and "meant to load nothing" are the same observation.
3. **One construction site for the runner.** Every test builds through one
   helper that applies the SV string quoting; the `-P<pkg>.` form appears
   nowhere. A structural control beats a documented intention (L-F03), and a
   repository grep for the forbidden form is a cheap CI check I will propose
   when the first bench lands.
4. **The bench pins its own X-resolution policy** and fails loudly if the
   environment has overridden it (§5.2, measured). The four-state lane must be
   four-state at the *bench* boundary, not just at the simulator's.

**And the guards are qualified before they are trusted** (L-B04, L-D11): each
runs against the defect it names — wrong path, unquoted parameter, package-scope
override, and `COCOTB_RESOLVE_X=ZEROS` — and must go red in both lanes before
any test relies on it. `test/spikes/` already contains the four negative
controls; they become the guard's own regression.

---

## 8. The four repairs, as exact text

Written to be applied as a transcription. **None of them changes a behaviour**;
each corrects a statement about one, or removes a trap.

### B-1 — `MEM_INIT_FILE` must be declarable

**(a)** In **§5.5**'s table, delete `MEM_INIT_FILE` from the *Other* row, so it
reads: `` `OBS_ENABLE`, `THROTTLE_DIV` `` | §5.3.

**(b)** Append to **§5.5**, after the A-5 scope block:

> `MEM_INIT_FILE` is deliberately **not** a package value. It is a per-test
> input with no shared constant to drift, its "default" is the empty image
> whose meaning REQ-014 clause 2 already fixes normatively, and — measured in
> Icarus 12.0 — a package `string` parameter cannot appear in a module
> parameter's default expression at all (`error: Unable to bind variable`),
> so the package reference this rule would otherwise require does not
> elaborate. It is declared only as the module parameter of REQ-115, with the
> literal default `""`.

**(c)** In **REQ-115**, after "each **defaulting to** its `chip8_pkg` value",
insert: "— except `MEM_INIT_FILE`, which is not a package value (§5.5) and
defaults to `""` —".

### B-2 — the package must not define what REQ-115 forbids reading

In **§5.5**'s table, *Widths and sizes* row, delete `SP_W` and append to the
row's value cell: "`SP_W` is **not** a package value: REQ-115 requires each
module to derive it from that module's own `STACK_DEPTH`, and a package-level
`SP_W` would not follow an override (measured: 5 against 3 at `STACK_DEPTH =
4`). Its derivation is defined once, at §5.1."

### B-3 — the derived-width rule covers the class, not one instance

In **REQ-115** ¶2, replace *"Any parameter whose value is derived from an
overridable one — `SP_W` = `$clog2(STACK_DEPTH)+1` is the only such case in P1
— SHALL be derived"* with:

> Any parameter, width expression or array bound whose value is derived from an
> overridable parameter — `SP_W` = `$clog2(STACK_DEPTH)+1`, the `obs_stack`
> width `ADDR_W*STACK_DEPTH`, and the stack array's own depth are P1's cases —
> SHALL be derived

and in REQ-115 ¶1 replace "M02 and M03 SHALL each declare" with "M01, M02, M03
and M04 SHALL each declare, as module parameters, those of the values below
that they use — M03 declares all of them —".

### B-4 — the model-to-DUT comparison has three points, not one

In **§8**'s "Two comparisons, two domains" paragraph, replace *"it happens at
retirement, on the bundle REQ-029 pins there, and nowhere else"* with:

> it happens at three points and nowhere else: at retirement, on the `obs_*`
> bundle REQ-029 pins there; on the `mem` array (REQ-114, REQ-120) at the same
> retirement; and, for an instruction that faults and therefore never retires,
> on `obs_halted`, `obs_err`, `obs_instr` and `obs_instr_addr` from the cycle
> `obs_halted` rises, which REQ-048 makes sticky and REQ-049 makes
> identifying.

---

## 9. Evidence

All commands run from a checkout of this repository at `5dfe877`, on the
toolchain the repository pins: **Icarus Verilog 12.0 (stable)**, **Verilator
5.020 2024-01-01 rev (Debian 5.020-1)**, **cocotb 1.9.2**, Python 3.11
(`iverilog -V`, `verilator --version`, `python3 -c "import cocotb"`).
Provenance **measured** throughout this section unless a line says otherwise.

**What was measured is the language and the toolchain. No design was
measured, because no RTL exists** — the same limit ADR-0018 A1.5 states.

Harness, committed with this report:

```
test/spikes/spike_pkg.sv     spike_top.sv     spike_probe.py
test/spikes/run_spike.py     img_prefix.hex   img_sparse.hex
```

Reproduce everything in §9.2–§9.5 with:

```
python3 test/spikes/run_spike.py            # both lanes, 10 configurations
python3 test/spikes/run_spike.py icarus     # one lane
```

All build output goes to a temp tree outside the repository, so a run leaves
the working tree clean. The driver is deliberately **not** named
`test/test_*.py`: `build.yml`'s R-CI-d source guard keys on that glob, and its
written de-gating condition ties de-gating to the commit landing the first
`rtl/` module and the first bench. A measurement instrument must not
short-circuit it.

### 9.1 B-1 — package `string` parameter as a module parameter default

```
$ cat a.sv
package p;
  parameter string S = "hello";
  parameter int    N = 7;
endpackage
module top #(parameter string S = p::S, parameter int N = p::N)();
  initial begin $display("S=%s N=%0d", S, N); $finish; end
endmodule

$ iverilog -g2012 -o a.vvp -s top a.sv
a.sv:5: error: Unable to bind variable `S' in `p'
1 error(s) during elaboration.            # exit 1
```

Isolating which half fails:

| Variant | Icarus 12.0 | Verilator 5.020 |
|---|---|---|
| package `string` as parameter default | **error, exit 1** | accepts (lint clean) |
| package `int` / `logic[11:0]` / `bit` / **enum** as parameter default | **all four work** (`N=7 PS=200 B=1 E=1`) | accepts |
| package `string` referenced in the module **body** | works | works |
| `localparam string` in the package, used as default | **error, exit 1** | — |
| compilation-unit `import p::*;` then default from `S` | **error, exit 1** | — |
| package accessor `function automatic string get_s()` | **`ivl: elab_expr.cc:5585: Assertion 'tmp' failed. Aborted` (exit 134)** | — |

There is no form that elaborates. The literal default `parameter string S = ""`
elaborates in both lanes.

### 9.2 B-2 / B-3 — derived widths under a module-parameter override

`run_spike.py`, configuration `C2-stackdepth`, `parameters={"STACK_DEPTH": 4}`:

```
=== icarus / C2-stackdepth ===            === verilator / C2-stackdepth ===
  STACK_DEPTH seen by module : 4            STACK_DEPTH seen by module : 4
  SP_W  module / package : 3 / 5            SP_W  module / package : 3 / 5
  obs_stack width  module / package        obs_stack width  module / package
                         : 48 / 192                               : 48 / 192
```

Both lanes agree, so this is a property of the language and not of a tool —
the architect's A2.4 measurement reproduces independently, and the width
expression behaves identically to the named parameter.

### 9.3 NV-3's remaining fraction — cocotb's runner, end to end

Runner formatting, read from the installed package
(`inspect.getsource(cocotb.runner.Icarus._get_parameter_options)`):

```python
return [f"-P{self.hdl_toplevel}.{name}={value}" for name, value in parameters.items()]   # Icarus
return [f"-G{name}={value}" for name, value in parameters.items()]                       # Verilator
```

No type awareness, no quoting. End to end:

| Configuration | Icarus | Verilator |
|---|---|---|
| `{"STACK_DEPTH": 4}` | reaches the design (`STACK_DEPTH seen by module : 4`) | same |
| `{"QUIRK_ENUM": 2, "QUIRK_INT": 2}` (enum-typed) | reaches the design (`2 / 2`) | **`%Error-ENUMVALUE: Implicit conversion to enum … from 'logic[31:0]'`** — needs `-Wno-ENUMVALUE -Wno-WIDTHTRUNC`, then reaches the design (`2 / 2`) |
| `{"MEM_INIT_FILE": '"/abs/path.hex"'}` (SV-quoted) | image loads | image loads |
| `{"MEM_INIT_FILE": "/abs/path.hex"}` (**the natural form**) | `<command line>: error: invalid value specified for defparam: spike_top.MEM_INIT_FILE` — **iverilog exits 0**, `sim.vvp` is produced, the test **runs and passes** with memory all-zero | `%Error: Illegal character in decimal constant: /` — build fails, runner raises |

Icarus's exit code on the failing form, isolated:

```
$ iverilog -g2012 -o h.vvp -s top -Ptop.S=/abs/path.hex f.sv
<command line>: error: invalid value specified for defparam: top.S
IVERILOG EXIT CODE = 0
$ vvp h.vvp
S=[] mem0=00 mem3=00
```

Package-scope override, independently confirming the packet's worst row:

```
$ iverilog -g2012 -o k.vvp -s top -Pp.N=99 k.sv   # exit 0, no diagnostic
$ vvp k.vvp
pkg N=7
$ iverilog -g2012 -o k2.vvp -s top -Ptop.N=99 k.sv
:0: error: parameter `N` not found in `top`.      # exit 2 — loud
```

Non-fatal load failures, both exit 0 and both let the run continue:

```
ERROR: $readmemh: Unable to open /tmp/nope.hex for reading.
WARNING: $readmemh(img_prefix.hex): Not enough words in the file for the requested range [0:7].
```

### 9.4 OQ-4 — REQ-014's two clauses, both lanes

`mem[0..15]` after elaboration, one row per configuration:

| Config | Icarus 12.0 | Verilator 5.020 |
|---|---|---|
| C4 prefix image, zero-fill **on** (conformant) | `11 22 33 00 00 00 00 00 00 00 00 00 00 00 00 00` | identical |
| C5 prefix image, zero-fill **off** | `11 22 33 xx xx xx xx xx xx xx xx xx xx xx xx xx` | `11 22 33 00 …` (**blind**) |
| C6 **sparse** image (`@0000`,`@000C`), zero-fill **off** | `11 22 33 xx xx xx xx xx xx xx xx xx aa bb xx xx` | `11 22 33 00 … aa bb 00 00` (**blind**) |
| C7 **sparse** image, zero-fill **on** (the repair) | `11 22 33 00 00 00 00 00 00 00 00 00 aa bb 00 00` | identical |
| C8 `MEM_INIT_FILE` = missing path | all `00`, run continues | all `00`, run continues |
| C9 = C5 with `COCOTB_RESOLVE_X=ZEROS` | `resolvable=False`, **`int=0`** — the X resolves silently | n/a |

C5/C6 are the negative controls: the instrument proves it can fail before it is
allowed to report agreement (L-D11). C6→C7 is the hole-in-the-middle case
answered by clause 1.

### 9.5 NV-1 — hierarchical access to an unpacked array

`dut.mem[0]` read through cocotb 1.9.2: **`ok: True` in both lanes**, returning
`00010001` for the covered location under the prefix image. NV-1 is discharged
**positive**. Caveat, stated: measured at **16** elements, not 4096 — feasibility
is settled, the cost at full size is not, and it folds into NV-2's spike.

### 9.6 The traceability matrix — mechanically diffed against §10

```
$ python3 - <<'EOF'   # parse both tables, compare id sets and hook columns
...
spec rows 91 matrix rows 91
only in spec: []
only in matrix: []
hook mismatches: []
EOF
```

Also: `grep -o "^| REQ-[0-9]*" | sort -u | wc -l` → **91** distinct ids in §10,
matching the count sentence. Every F-1/F-7/F-8 hook correction propagated to
`docs/specs/requirements.md`. §13.1 does not list the matrix's hook column
among its propagation sites, and it is the one propagation that was done and
not claimed — the opposite of the usual failure.

---

## 10. D-8, and what a signer should know first

**Yes — D-8's handling satisfies me, with one cell to correct.**

F-11 asked for one thing: that the limitation appear *in the document the gate
reads*, so the freeze is signed with knowledge of it rather than despite it.
D-8 does that and does it better than I asked:

- It is a **deferred item, not an open question**, and the reason given is
  right — an OQ row would block the very gate it asks to be signed *with
  knowledge of*, which would have converted my "not freeze-blocking" grade into
  a blocker by filing.
- It states the limitation in full, quotes my grading (MAJOR / ESCALATION /
  not freeze-blocking) rather than softening it, carries all three of my options
  and my recommendation, and names the owner as orchestrator → sponsor, E3-shaped.
- §11's status paragraph records that **OQ-3 is subsumed by D-8** — the quirk
  defaults were one instance of a phase-wide exposure. That is the architect's
  own generalisation of its own finding and it is correct.

**The correction (F-18, MINOR).** D-8's *Closes by* cell reads
"`P1-module-ready` — **not** the freeze". The first half is one step late.
Charter §3 and PROTOCOL §10 require anchor evidence at a SHA **earlier than the
first RTL verdict the model issues**, and the first verdict is the first `SO-`
PASS, which precedes `P1-module-ready`. My report said "before the first `SO-`
PASS"; the row should say so too. The interval between them is exactly the
window in which every P1 sign-off is written, so the difference is not
academic.

**What a sponsor signing this freeze should know first**, in one paragraph, for
transcription into the gate packet when the signature does issue:

> **A P1 lockstep PASS proves the RTL implements this specification. It proves
> nothing about whether this specification describes CHIP-8.** Both artifacts
> the campaign compares — the RTL and the Python golden model — derive from
> this one document by intake decision (the B3 independence rider); every
> CHIP-8 reference recorded at intake is consult-only; and the free-use
> artifacts are test ROMs that P1 cannot execute. There is no external truth
> anywhere in the phase. Three things carry the weight instead: the mutation
> campaign, which is the only thing that qualifies the instrument and is
> therefore not optional colour here; the piecewise anchors that *are*
> available (the LFSR recurrence against an independent implementation of the
> same recurrence, BCD against integer arithmetic, the decode classifier
> against §6.3's row totals); and **P4's community test-ROM campaign, which is
> the first external truth this program ever touches**. This is spec §11 D-8,
> and settling it — option (a), (b) or an explicit NO-ANCHOR declaration —
> is a precondition of the first `SO-` PASS, not of this freeze.

---

## 11. Findings

Severity and class as in `DV-P1-testability.md` §7. **BLOCKING** — the frozen
text must change · **CARRIED** — resolvable inside P1 with no spec change ·
**ESCALATION** — not a spec defect.

| # | Sev | Class | Finding |
|---|---|---|---|
| **B-1** | MAJOR | **BLOCKING** | **No conformant `MEM_INIT_FILE` declaration exists.** REQ-115 requires a module parameter defaulting to its `chip8_pkg` value; REQ-109's A-5 addition names a literal default as "exactly the defect this requirement names"; and Icarus 12.0 rejects a package `string` parameter in a parameter default expression (measured, §9.1 — and crashes on the accessor-function form). The two clauses are jointly unsatisfiable in the authoritative lane, for the one parameter §5.4 says every test sets. This is F-5, reinstated by F-5's own repair. → **§8 B-1** |
| **B-2** | MAJOR | **BLOCKING** | **§5.5 defines `SP_W`, which REQ-115 forbids a module to read**, while REQ-109 ¶1 orders every value in that table "referenced — never restated". Two normative clauses give opposite instructions about one name, and the instruction REQ-109 gives is the one measured to produce a 5-bit `obs_sp` at `STACK_DEPTH = 4` (§9.2). The near-miss is half closed: the instruction not to read the package landed; the thing not to read is still in it. → **§8 B-2** |
| **B-3** | MAJOR | **BLOCKING** | **REQ-115's derived-width rule covers one instance, not the class**, and its parenthetical "the only such case in P1" is measurably false: `obs_stack`'s width expression `ADDR_W*STACK_DEPTH` reads 192 bits from the package against 48 from the module at `STACK_DEPTH = 4` (§9.2), and the stack array's own depth is the third case. §4.A's note and ADR-0018 A2.2 both state the general rule; only the requirement — the text the matrix cites and the RTL implements against — states the narrow one. The behavioural half of this defect is loud; the width half is silent. → **§8 B-3** |
| **B-4** | MAJOR | **BLOCKING** | **A-4's added paragraph puts the model-to-DUT comparison "at retirement … and nowhere else"**, which excludes (a) the entire fault surface — no faulting instruction ever retires (REQ-029, REQ-049), so the five fault conditions of §9 and the 65536-encoding decode sweep have no licensed comparison point — and (b) the `mem` array, narrowing README's signed "full architectural-state compare after every instruction" by a subordinate clause. The distinction the paragraph draws is right; its universal is too wide. → **§8 B-4** |
| **F-15** | MINOR | CARRIED | **Verilator refuses an enum-typed parameter overridden from the command line** (`%Error-ENUMVALUE`, measured §9.3) unless `-Wno-ENUMVALUE -Wno-WIDTHTRUNC` are given. Four of REQ-095's six connectivity vectors set enum-typed quirk parameters, so the fast lane needs either those waivers or module parameters declared as 2-bit `logic` with a cast inside. No spec change: §5.2 types the *package* enum, and REQ-115 does not constrain the module parameter's declared type. Recorded so the six-vector work is not surprised, and because a global `-Wno-ENUMVALUE` suppresses a real type check and is a cost to state rather than absorb. |
| **F-16** | MINOR | CARRIED | **REQ-115 names only M02 and M03**, but `obs_sp`, `obs_stack`, `STACK_DEPTH`, `PROG_START`, `OBS_ENABLE` and the quirk parameters live in M01 and `RNG_SEED` in M04. Their parameterization is entailed by "passed down to submodules unmodified" and is therefore sound, but the derived-width rule speaks of "that module's own parameter" for modules the SHALL does not name. Folded into §8 B-3's second half. |
| **F-17** | MINOR | CARRIED | **§13.1 clerical.** "The matrix in `docs/specs/requirements.md` gains the corresponding row (**REQ-124**)" — the row added is **REQ-115**; REQ-124 existed at `54a7221` and is the matrix's last row, not its new one. The matrix itself is correct: 91/91 rows, hook columns byte-identical to §10 (measured, §9.6). |
| **F-18** | MINOR | CARRIED | **D-8's *Closes by* cell is one step late.** "P1-module-ready" should be "before the first P1 `SO-` PASS, which precedes `P1-module-ready`" — charter §3's anchor-before-judge binds at the first verdict the model issues, and every P1 sign-off is written inside that interval. |
| **F-19** | — | CARRIED | **The image-load guard, the runner-form ban, and the X-resolution pin are mine** (§7.3), placed here rather than deferred, with their negative controls already committed at `test/spikes/`. Not a spec defect: REQ-014's L-F03 paragraph correctly declines to own it and correctly names me. |

---

## 12. NO-VERDICT register, updated (L-D04)

| # | Question | Status now |
|---|---|---|
| **NV-1** | Can cocotb 1.9.2 read M02's `mem` array **in the Verilator lane**? | **DISCHARGED — positive.** Both lanes, `ok: True` (§9.5). Measured at 16 elements; the cost at 4096 is unmeasured and folds into NV-2. The signed success criterion is not narrowed, and the fallback I described at `54a7221` is not needed. |
| **NV-2** | Wall-clock cost of the 65536-encoding sweep per lane | **OPEN.** Unchanged; one spike before the first bench, now also carrying the 4096-element array-read cost. |
| **NV-3** | Can a package parameter be overridden at elaboration via cocotb's runner? | **DISCHARGED**, and the answer fired the falsifier ADR-0018 A2.7 names. No: package parameters cannot (Icarus silently, Verilator loudly); module parameters can, for every type P1 needs — but the runner's string handling breaks the sanctioned call in the Icarus lane and the run stays green (§9.3). The relay of `54a7221` is now measured, and the remaining fraction the architect marked *relayed* is closed. |
| **NV-4** | Does an `X` reaching a comparison in the Icarus lane actually fail, at the bench boundary, under the environment CI provides? | **OPEN, new.** Measured that `COCOTB_RESOLVE_X=ZEROS` silently resolves it (§9.4 C9); unmeasured is what the CI job's environment actually sets. Discharged by §7.3 guard 4 and its negative control, before the first bench. |

**Provenance summary (L-B01).** Everything in §9 is **measured**, with the
command shown at its site. The inventory of derived widths in §6 and the
matrix-count arithmetic in §9.6 are **derived**, with the derivation shown. The
toolchain identities (Icarus 12.0, Verilator 5.020, cocotb 1.9.2) are
**measured** here rather than relayed from `TOOLCHAIN.md`, because the tools are
in this checkout and I ran them. Nothing in this report is a recollection.

---

## 13. Freeze-record rows this report fills

For spec §12, when the amended revision is countersigned:

| Item | Value |
|---|---|
| Interface check | **Fallback regime** (ADR-0017 Consequence 1): reviewed port tables §4.A–§4.D, graded line by line at `docs/reports/dv/DV-P1-testability.md` §3 — 30 distinct ports (M01 19, M02 6, M04 5) plus M03's `clk`, `rst_n` and pass-through bundle; four defects found (F-2, F-3, F-4, F-5), all in the width and parameter columns, none in the direction or meaning columns. The width and parameter defects are repaired at `ddc06dc` (A-1, A-3) and confirmed at `docs/reports/dv/DV-P1-countersignature.md` §3. There is no compile-check CI run for this program and none is owed. |
| dv_lead testability countersignature | **Withheld at `ddc06dc`** (`J-dv_lead-0002`), on four one-clause blocking defects in text added beyond the six amendments — `DV-P1-countersignature.md` §8. Issues as `J-dv_lead-0003` against a revision applying those four repairs. |

Spec §11's **D-6** row stays open until that third entry.

---

## 14. Lessons harvest

Recorded in `J-dv_lead-0002`, span `J-dv_lead-0002..0002`, per PROTOCOL §7.1
and charter §3. Candidates: **LC-03** (a set of individually correct repairs can
compose into a new defect), **LC-04** (a diagnostic is not a failure signal),
**LC-05** (the party applying a repair enumerates its own additions), **LD-02**
(an override path is measured per parameter *type*). One war story. The journal
entry carries the bars, the failure statements and the provenance pins.
