# Journal: claude_dv_lead_agent

- **Agent**: dv_lead (Opus-class lead)
- **Charter**: agents/charters/dv_lead.md
- **Format**: v2 — entry grammar in agents/PROTOCOL.md §4

This file is APPEND-ONLY. Content may only ever be added after the last line;
nothing above it is ever edited. Enforced by scripts/agent_commit.sh and CI.

---

## [J-dv_lead-0001] 2026-08-05T18:20Z | task:WO-0004 | P1 testability countersignature — NOT COUNTERSIGNED at 54a7221; OQ-1 adjudicated to HALT; exhaustive decode coverage committed

### Trigger

Spawned by the orchestrator with spawn short-id `WO-0004/2026-08-05T16:52Z`,
carrying `agents/handoffs/WO-0004_p1-testability-countersignature.md`
(ISSUED 2026-08-05). This is the first entry of the `dv_lead` chain. The
packet is a PROTOCOL §7 freeze precondition: `P1-spec-freeze` cannot sign
without the dv_lead testability countersignature. Three things were routed to
me by name — the line-by-line grade of §4's port tables (ADR-0017's
compensating control for choosing reviewed tables over compile-checked
interface records), the OQ-1 adjudication, and the question of whether the
21582-encoding illegal space is coverable.

### Inputs

- `agents/charters/dv_lead.md`; `agents/PROTOCOL.md` (v2)
- `agents/handoffs/WO-0004_p1-testability-countersignature.md`
- `docs/specs/SPEC-P1-core-cpu.md` at `54a7221` — read in full, all 1132 lines
- `README.md` — phase table and the scope-parameter paragraph
- `docs/adr/ADR-0017-toolchain-lane.md` including Amendments **A1** and **A2**
- `tasks/BOARD.md` — P1 open questions, B3 intake and its license classes,
  the measured toolchain line, the AUD-0001 dispositions
- `docs/LESSONS.md` — L-B01, L-B12, L-D04, L-D11, L-D12, L-D16, L-E10, L-F03
- `requirements.txt`, `TOOLCHAIN.md`, `.github/workflows/build.yml`
- `agents/handoffs/templates/`, `docs/gates/templates/`

**I read no RTL, because none exists.** `rtl/` is absent from this tree at
`4a95703`. Every judgement below derives from the specification and the
programme documents listed. Recording it because it is the audit evidence for
spec-derived independence (PROTOCOL §10, charter §8) in the only form it will
ever take structurally rather than by discipline.

**Every governing REQ was read in its own section before it was graded**
(L-B12), not through §10's registry row — which is how F-1 and F-7 were found
at all: both are cases where the registry's hook column names a check that
cannot perform the observation the requirement's own text demands.

### Reasoning

**Why NOT COUNTERSIGNED rather than COUNTERSIGNED WITH FINDINGS.** I needed a
principled boundary between the two verdicts rather than a feeling about
severity, so I used this one: *COUNTERSIGNED WITH FINDINGS* means I sign and
the findings are obligations that do **not** require the frozen text to
change; *NOT COUNTERSIGNED* means the frozen text must change first. Seven
clauses fail that test — they are false (REQ-008's and REQ-123's
"no uninitialised storage", of an M02 whose read register has no specified
power-up value), self-contradictory (§4.A's literal widths against §5.1's
derived `SP_W` and overridable `STACK_DEPTH`), or unsatisfiable (§5.4's
"every test sets `MEM_INIT_FILE`", of a package parameter that cannot be
overridden at elaboration and lives in a file DV cannot stage; REQ-109's
single-definition-site rule, of a testbench written in a language that cannot
import a SystemVerilog package). Freezing any of them means repairing it later
by spec diff plus ADR under §13 — the packet says it plainly: cheap before
freeze, expensive after.

I weighed the cost of the verdict honestly. This is an unusually good
specification and a NOT COUNTERSIGNED reads harsher than the seven one-sentence
repairs deserve. I mitigated rather than softened: the amendments are written
out as applicable text (report §8) and I pre-committed that my confirmatory
pass is limited to the amended text, since the other 84 requirements and all
30 ports are graded and stand. That makes the honest verdict cost one architect
pass instead of a re-review.

**The finding I expected to make and did not.** I went in expecting to demand
an `obs_mem_*` observation bundle at M03, because nine requirements assert
memory-port behaviour that is invisible at the DUT §4.0 names — REQ-030 ("the
memory port idles"), the fetch-address requirements, and `FX33`'s
ascending-order clause have no observation point at M03 at all. Then I noticed
§4.A, §4.B and §4.D are complete normative port tables for real modules, so
M01, M02 and M04 are each independently bench-bindable with a bench-side memory
model derived from §4.B. Asking for a port would have been asking the design to
pay for my bench architecture. So I declined it, declined an `obs_state` FSM
output too (§6.6 deliberately frees the state encoding, and `obs_retire` already
makes every cycle count in §7.1 observable), and reduced F-1 to what it actually
is: a defect in §10's hook column, not in the interface. Stating what I decline
to ask for is part of the grade — a countersignature that only adds ports is
not a review.

**OQ-1 — decided on one argument above all others.** The spec presents no-op as
the alternative that lets partially-covered programs run further. The decisive
objection is not cost, it is that **a no-op manufactures false parity**: a
program that no-ops through `DXYN` computes wrong results, the golden model —
derived from the same specification — no-ops identically and agrees, and the
bench goes green over a machine that is not CHIP-8. Agreement between two
wrong models is the one failure mode a lockstep bench cannot see, and it is
exactly what P1's entire instrument is. Four supporting reasons in report §5,
including that no-op would leave `ERR_DEFERRED_OPCODE` with no producer
anywhere in P1 — a frozen enumeration member no test can reach, which is L-D16
turned on the very distinction the question asked me to preserve.

I made myself state the losing side's best argument and pay for it rather than
omit it: because halt is terminal, the §6 sweep needs one reset per encoding
and cannot chain them, where a no-op would walk thousands per run. That is a
real throughput cost of my ruling. It is payable (≈ 8 cycles per encoding);
false parity is not payable at any price.

**The illegal-space question — the answer is a structural property, not a
budget.** The specified behaviour of an illegal or deferred encoding is
**state-independent**: classification is a pure function of 16 bits (REQ-040)
and the whole response is a fixed triple (REQ-041/042). That makes the illegal
space the one part of P1 where exhaustive coverage is also *complete* coverage,
and it is why the answer differs from the implemented space, whose behaviour is
a function of encoding × architectural state and is not enumerable at any
budget. REQ-009 is the clause that makes the sweep cheap — memory survives
reset, so the loop is write-two-bytes / pulse-reset / four cycles / sample, with
no image reload and no recompile: ≈ 8 cycles per encoding, ≈ 5.2 × 10⁵ cycles
for the entire 16-bit space.

The more useful half of the answer is the one the question did not ask for: even
if the sweep were unaffordable, **uniform sampling would be near-worthless**.
All 21582 illegal encodings produce the same observable, so the information is
entirely in the class boundaries, and the boundaries are thin — the sharpest is
the 30-encoding `0NE0`/`0NEE` set for N ≠ 0, which a decoder matching on the low
byte alone gets wrong and which a uniform draw hits with probability ≈ 0.0014.
So the fallback is not "sampling" but boundary-directed stratification, stated
and frozen (L-C08).

**Two independent derivations rather than a re-check.** I re-derived the
partition totals by complement counting per high nibble — a different
decomposition from the spec's row-by-row table — and reached 39745 / 4209 /
21582 / 65536. That is confirmation rather than re-addition. The same
arithmetic doubles as the only genuinely independent constraint available on my
decode classifier: my model and the RTL both derive from §6.3 and would agree
about any error in it, but enumerating my classifier over 65536 encodings must
reproduce the three totals exactly, and §6.3's row totals were derived
independently of its region rules.

**The finding that is not about the spec at all.** Charter §3 and PROTOCOL §10
require a golden model to agree with an external reference **before** it may
judge RTL. Every CHIP-8 reference recorded at B3 is *consult-only*; the intake's
independence rider bars deriving the model from any interpreter; the three
free-use artifacts are test ROMs, which §8 correctly says P1 never executes
because they all reach a `DXYN` within a few instructions. So P1 has **no
available anchor**, and a P1 PASS proves the RTL implements this specification
while proving nothing about whether this specification describes CHIP-8. OQ-3
says this of the five quirk defaults and calls it the sharpest thing in the
document; it is true of the whole phase. I did not waive the rule quietly. It
goes up as F-11 with three options, is not freeze-blocking, and must be settled
before the first `SO-` PASS.

**A-5 was written for an independence reason, not a convenience one.** REQ-109
as written obliges the testbench to reference `chip8_pkg` rather than restate
its values, which would put an RTL file on the DV critical path permanently and
make the Inputs declaration above untrue from the first bench onward. The fix
is not an extractor — it is to scope REQ-109 to the SystemVerilog side and have
the Python model derive from §5.5 of the specification. A second derivation
from the same normative source keeps the DV lane's basis the spec, and any
drift between the two **fails a test** rather than passing silently, which is
the outcome REQ-109 exists to produce. The work order recorded the shared
package as on my critical path; with A-5 it is not, and that is the whole point
of the two sentences.

**Rejected while grading, and why:** (a) demanding a compile-checked interface
regime after all — ADR-0017's reasoning is sound (Yosys's SV `interface`
support is the rough path) and the tables proved gradeable, four defects and
all of them in the width and parameter columns; (b) asking for `mem` to be
replaced by a port — 32768 bits cannot ride a port and REQ-114's reasoning is
right; (c) treating F-1 as blocking — it is a hook-column defect, resolvable in
my own bench architecture; (d) recommending that DV write the package
conformance checker — it reads RTL and belongs with rtl_lead plus auditor
sampling, which is F-6.

### Actions

- Graded all 30 distinct ports of §4.A/§4.B/§4.D plus §4.C's pass-through
  bundle on four axes each (signal, direction, width, meaning), checking every
  width against §5.1's parameter table rather than reading it off the page.
- Graded all 90 REQ ids for bench-derivability and named an observation point
  for each: **T 68 · T-conditional 8 · not-bench-derivable 14**.
- Adjudicated OQ-1; upheld halt and preserved both classes and both error
  codes.
- Re-derived the decode partition by an independent decomposition; enumerated
  the class-boundary set; committed to exhaustive classification coverage of
  all 65536 encodings with a stated fallback.
- Wrote `docs/reports/dv/DV-P1-testability.md` (13 sections), including six
  ready-to-apply amendments A-1 … A-6 and a NO-VERDICT register.
- Updated WO-0004: state ISSUED → RETURNED, with the verdict and a DoD table in
  its Return log.
- Wrote no test, no golden-model code, no RTL. Ran no git command.

### Evidence

**Nothing in this unit of work is measured, and I claim no measurement**
(L-B01, L-D04). There is no RTL and no bench in this tree, so there was nothing
to execute. The report's quantities are **derived**, with each derivation shown
at its site, or **relayed** with the source named. Commands runnable from a
checkout at this commit that reproduce the derived quantities:

- Spec under review, and the confirmation that no RTL exists:
  `git show --stat 54a7221` → `docs/specs/SPEC-P1-core-cpu.md`, 1132 lines, one
  file of source; `ls rtl` → the path does not exist at `4a95703`.
- REQ registry count: the 90 ids are the rows of §10's table —
  `grep -c '^| REQ-' docs/specs/SPEC-P1-core-cpu.md` over §10's block. The
  blocks are 001–014 (14), 020–030 (11), 040–049 (10), 060–087 (28), 090–096
  (7), 100–114 (15), 120–124 (5) = **90**, matching the spec's own enumeration
  sentence.
- Decode partition, re-derived by complement counting per high nibble
  (**derived**, arithmetic in report §6.1):
  implemented 1 + 9×4096 + 256 + 256 + 9×256 + 4×16 = **39745**;
  deferred 1 + 4096 + 2×16 + 16 + 4×16 = **4209**;
  illegal (4096−2) + 15×256 + 7×256 + 15×256 + (256−2)×16 + (256−9)×16
  = 4094 + 3840 + 1792 + 3840 + 4064 + 3952 = **21582**;
  sum **65536**. Confirms the spec's table by a different decomposition.
- Sweep cost (**derived** from §7.1's decode-fault row, §7.5's reset rule and
  REQ-009): ≈ 8 clock cycles per encoding ⇒ ≈ 1.7 × 10⁵ cycles for the illegal
  space, ≈ 5.2 × 10⁵ for all 65536. The **wall-clock** cost is unmeasured and
  is NV-2 in the report's NO-VERDICT register.
- Toolchain facts are **relayed**: `requirements.txt` (`cocotb==1.9.2`),
  `TOOLCHAIN.md` (Verilator 5.020, Icarus 12.0), ADR-0017 A2.
- The claim that a package parameter cannot be overridden at elaboration in
  this lane is **relayed**, from the documented behaviour of Verilator `-G` and
  Icarus `-P` (top-level module parameters) and cocotb's runner mapping onto
  them. It is NV-3 in the register; amendment A-3 is correct either way,
  because it removes the dependency on the answer.

Artifacts committed with this entry: `docs/reports/dv/DV-P1-testability.md`
(the verdict's authority) and WO-0004's Return log.

### Outcome

**DoD met in full, with an adverse verdict.** All six items of WO-0004 §2 are
discharged — see the DoD table in the packet's Return log.

> **Verdict: NOT COUNTERSIGNED at `54a7221`.** Six amendments (A-1 … A-6,
> report §8) must land in the spec before I sign.

**I sign nothing on this revision.** For PROTOCOL §7's transcription rule:
`docs/specs/SPEC-P1-core-cpu.md` §12's dv_lead countersignature row and the
`P1-spec-freeze` checklist's dv_lead testability row both stay **empty**; my
countersignature issues as `J-dv_lead-0002` against the amended SHA, and my
confirmatory pass is limited to the amended text — the other 84 requirements
and all 30 ports are graded and I will not re-open them.

Handoff: `docs/reports/dv/DV-P1-testability.md`, to the orchestrator, for
relay to `architect_docs_lead` (A-1 … A-6, plus the non-blocking hook-column
corrections F-1/F-7/F-8/F-13 and the D-5 recommendation).

**Lessons harvest** (PROTOCOL §7.1, charter §3 — a gate-facing signature
carries one as a precondition, and it is owed whether the signature issues or
is withheld). **Span: `J-dv_lead-0001..0001`** — this chain's first harvest,
tiling from 0001 per the BOARD's fork-point baseline (`dv_lead` **none**,
header-only at fork). No worker spans: I commissioned none. **Yield: three
candidates and one recurrence** (final ids belong to the landing fence; a
candidate never self-assigns one):

- **LC-02 (tier 1, general).** *A specification that names the artifact a test
  binds to must also name an observation point for every requirement it
  asserts; a requirement whose asserted behaviour is invisible at the named
  binding boundary is unverifiable however precisely it is written.* LH2-g:
  no proper noun of any project or domain. LH3 — what breaks without it: a
  specification freezes carrying requirements whose verification hooks cannot
  see what they assert, and the gap surfaces when the bench is written, after
  the freeze, when repair costs a spec diff. LH1: this entry; report §7 F-1;
  `docs/specs/SPEC-P1-core-cpu.md` at `54a7221` §10 against §6.2.
- **LC-03 (tier 1, general).** *Where a specification must choose between
  silently continuing past an unimplemented case and stopping loudly,
  testability prefers the loud stop: a silent continuation manufactures
  agreement between two models that are both wrong, and agreement between two
  wrong models is the one failure a differential instrument cannot detect.*
  LH2-g: no proper nouns. LH3: a phase boundary gets crossed silently and the
  comparison goes green over behaviour neither side implements. LH1: this
  entry; report §5; the OQ-1 row of `tasks/BOARD.md`.
- **LD-01 (tier 2, domain — prospective pack `open-source-rtl-toolchains`,
  the pack named at G0 and not yet created).** *Where one simulation lane is
  two-state and another four-state and the two are required to agree, every
  storage element inside the compared domain carries a specified power-up
  value or is excluded from the comparison by name; an unspecified one reads
  zero in one lane and unknown in the other, so the lanes disagree by
  construction.* LH2-d: simulator, two-state/four-state, storage element,
  comparison domain — domain vocabulary only, no project noun. LH3: a
  cross-lane comparison false-fails, and the repair reached for under pressure
  is to narrow the comparison inside a testbench where nobody reviews it. LH1:
  this entry; report §7 F-4 and F-9.
- **Recurrence of L-D16, independently re-derived** (`docs/FEDERATION.md` §8 —
  recorded as recurrence evidence, not minted as a new candidate). L-D16 is
  this repository's own first lesson, landed from G0's `LC-01`. It arrived
  again here from a different direction and twice in one pass: F-12 (five
  declared parameters, six alternate values, and REQ-095 forbidding the one
  cheap check that they are wired at all — so an implementation that ignores
  every parameter passes every P1 test) and the OQ-1 no-op case (which would
  leave a frozen error-code enumeration with a member no test can reach). No
  new candidate is minted; the arrival is recorded so the recurrence counter
  is honest.
- **War stories: none.** No candidate failed a bar this round.

### Open-questions

- **F-11 — P1 has no external anchor available**, and charter §3 forbids a
  golden model judging RTL without one. Not freeze-blocking; must be settled
  before the first `SO-` PASS. Three options with a recommendation in report
  §10; option (a) — adding one free-use-licensed reference implementation to
  the B3 intake as a differential oracle only — is **E3**-shaped and is the
  orchestrator's to route.
- **F-6 — fifteen REQs carry an "inspection" hook with no named performer**,
  and five of them inspect RTL. If that performer is dv_lead it is a charter
  violation. Recommend rtl_lead as performer with auditor sampling, and the
  machine-checkable subset converted into CI checks.
- **Three NO-VERDICT items**, all discharged by one spike before the first
  bench: NV-1 Verilator hierarchical access to M02's `mem` (if negative, the
  Verilator lane cannot do the memory half of the per-instruction compare, and
  the fallback narrows a signed success criterion — the orchestrator's call,
  not mine); NV-2 the sweep's wall-clock cost; NV-3 package-parameter override
  behaviour.
- **Sequencing constraint, flagged rather than discovered**: `build.yml`'s
  R-CI-d source guard is deleted in the *same commit* that lands the first
  `rtl/` module and the first `test/` bench, which couples rtl_lead's first
  delivery to my first bench at one commit boundary. The P1 build work orders
  need to be written knowing that.
- **D-5 recommendation** (non-blocking): the P2/P3 spec-diff ADR should be
  required to enumerate the P1 tests it invalidates.

### Files-in-this-commit

- docs/reports/dv/DV-P1-testability.md
- agents/handoffs/WO-0004_p1-testability-countersignature.md
