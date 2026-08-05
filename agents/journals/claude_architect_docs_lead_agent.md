# Journal: claude_architect_docs_lead_agent

- **Agent**: architect_docs_lead (Opus-class lead)
- **Charter**: agents/charters/architect_docs_lead.md
- **Format**: v2 — entry grammar in agents/PROTOCOL.md §4

This file is APPEND-ONLY. Content may only ever be added after the last line;
nothing above it is ever edited. Enforced by scripts/agent_commit.sh and CI.

---

## [J-architect_docs_lead-0001] 2026-08-05T16:55Z | task:WO-0002 | P1 core-CPU specification: 90 REQs, an 8-state multicycle FSM, and a fully partitioned 16-bit decode space

### Trigger

Spawn short-id `WO-0002/2026-08-05T16:26Z`. The orchestrator issued
`agents/handoffs/WO-0002_p1-core-cpu-spec.md` (state ISSUED, 2026-08-05) to
write the P1 core-CPU specification — the org's first product artifact and the
first entry of this journal chain. Authority for scope is README.md's phase
table (PROTOCOL §1), row P1; authority for the toolchain and the interface
regime is ADR-0017 including Amendments A1 and A2.

### Inputs

Read in full, in this order. This list is the audit evidence for
spec-derivation independence (PROTOCOL §10) and is complete — **no external
document was retrieved during this unit of work**, and nothing outside this
repository was opened.

- `agents/charters/architect_docs_lead.md`
- `agents/PROTOCOL.md`
- `agents/handoffs/WO-0002_p1-core-cpu-spec.md`
- `README.md` (the phase table and the scope-parameter paragraph — the
  canonical scope statement)
- `docs/specs/SPEC-TEMPLATE.md`
- `docs/adr/ADR-0017-toolchain-lane.md`, including Amendment A1 (A1.1, A1.2)
  and Amendment A2
- `tasks/BOARD.md` (intake decisions B3/B4, the declared domain packs line,
  the fork-point harvest baseline, the toolchain measurements)
- `docs/LESSONS.md` — entries L-A04, L-B01, L-B12, L-B15, L-D11, L-D12,
  L-E02, L-E04, L-E10, L-F03, and the `^### L-D` index
- `docs/gates/templates/spec-freeze-checklist.md` (for the carry-forward
  ledger form the spec's deferred items point at)
- `agents/journals/INDEX.md`, `ORG_CHART.md`, and this journal's header block

**One packet citation does not resolve in this tree.** WO-0002's standing
lessons cite **L-D16**; `docs/LESSONS.md` here runs L-D01…L-D15 and has no
L-D16. The board explains it: `LC-01` landed in the **org generic** as `L-D16`
at `849843f`, which is a repository this project does not read from. The
packet's own statement of the rule is therefore the operative text I worked
from, provenance class *relayed*, and I record the resolution failure rather
than quietly treating the citation as satisfied.

### Reasoning

**What the packet asked me to decide, and what I actually had to decide.** The
eight tasks are mostly transcription of README into requirement form. Three
were not, and they are where the work went.

**1. The FSM, because the memory is single-port.** README fixes 4096 × 8
single-port RAM, one access per cycle. That alone forces a multicycle machine;
what it does not fix is the state set. I pinned eight states — `S_RESET`,
`S_FETCH_HI`, `S_FETCH_LO`, `S_DECODE`, `S_EXEC`, `S_MEM_WR`, `S_MEM_RD`,
`S_HALT` — with two structural rules that do the real work: **exactly one
`S_EXEC` cycle per instruction**, and **the architectural PC is updated only
in `S_EXEC`**. The second is the one that pays. It makes fault semantics free:
an instruction that never reaches `S_EXEC` has committed nothing, including
PC, so "no architectural state is modified by a faulting instruction" needs no
rollback machinery and no separate statement per fault class. It also makes
skips constant-time (PC + 4 instead of PC + 2, same cycle), which removes
data-dependent instruction timing from the machine entirely — a gift to P4's
formal work.

The loops were the fiddly part. A naive read loop costs two cycles per
register (present address, capture data) because the RAM is synchronous, which
would put `FX65` at 2X + 5 against README's budget of 4 + (X+1). Pipelining
the loop — each cycle captures the previous read and issues the next — brings
it to X + 5, exactly the budget. Making `S_EXEC` issue the *first* access of a
memory-class instruction is what closes the last cycle. The consequence is an
asymmetry I chose to state rather than smooth away: `FX55` costs 4 + X (one
under budget, because writes have no return latency) and `FX65` costs 5 + X.

**Rejected: README's permitted fold of decode into fetch-lo** (3 cycles → 2).
README permits it; it does not require it. I declined it because a spec must
give the DV lane one number, not two, and the fold buys nothing here: at 12 MHz
a 4-cycle instruction issues at ~3 MHz against README's target issue rate of
500–1000/s. The saving is roughly three thousandths of one percent of the
available slack. Recorded in §7.2 with the budget checked clause by clause, so
that if P5 timing ever makes the fold worth having it is a spec diff plus an
ADR rather than a quiet optimisation. **No budget clause is exceeded, so no E2
arises from the FSM.**

**2. The illegal space, because L-D16 says an enumerated check that validates
one value gives false assurance for the rest.** The packet's framing is right:
a decode spec listing the legal encodings leaves the illegal ones
*unspecified*, not "don't care", and P4's formal properties fall into the hole.
I did not want to assert exhaustiveness, so I made it checkable — a
three-class partition (`DC_IMPLEMENTED` / `DC_DEFERRED` / `DC_ILLEGAL`) with
the per-high-nibble counts written out and summed: 39745 + 4209 + 21582 =
65536. That table also settled task 3 without an argument from authority: the
25 P1 forms plus P2's 3 plus P3's 6 plus `0NNN` are exactly 35, which is
README's own count, so the proposed boundary is **confirmed by arithmetic**
rather than adopted.

Three sub-decisions inside it:

- **`DC_DEFERRED` is a class of its own, not lumped with illegal.** Same
  behaviour in P1 (halt), different error code. Collapsing them would mean
  every P1 test of the illegal space also passes on a decoder that has simply
  forgotten `DXYN` exists — the same false-assurance shape L-D16 names.
- **`0NNN` (SYS) is illegal, not a no-op.** There is no 1802 here, so it is
  unimplementable rather than unimplemented. A no-op reading matters most in
  the case that actually occurs — PC walking into data, where `0x0000` is what
  blank memory decodes to — and there a silent no-op produces a machine
  running quietly on garbage, which is the failure hardest to localise from a
  divergence thousands of instructions later.
- **Faults halt terminally rather than trapping or ignoring.** Halt is
  observable, formally trivial, and cannot manufacture new state. Rejected:
  ignore-and-continue (unobservable), and a trap vector (invents an
  architectural feature CHIP-8 does not have).

The same principle drove the **fault-versus-wrap** split on addresses, which
is the subtlest thing in the document. Single-target 12-bit updates (PC + 2, a
`BNNN` target, `I + Vx`) **wrap** modulo 4096, because a 12-bit register
physically cannot leave the address space and a fault that can never
distinguish anything is a decode path with no verification value. Multi-byte
spans (`FX33`, `FX55`, `FX65` with I + X > `0xFFF`) **fault**, checked before
the first access. Wrapping there would silently write into the font region —
and, worse, it would make P4's signed property "I never addresses out of
range" **vacuously true** by the width of the register rather than by anything
the design does. Both alternatives are recorded as rejected in §9.

**3. The quirk parameters, where I went beyond the packet.** The packet named
three (`8XY6`/`8XYE`, `BNNN`, `FX55`/`FX65`). I declared five, adding
`QUIRK_VF_RESET` (`8XY1`/`8XY2`/`8XY3` leave VF at 0 on the VIP) and
`QUIRK_I_OVERFLOW_VF` (`FX1E`). The justification is **L-B12** applied to the
packet itself: README's P4 row says "**every** divergent CHIP-8 behaviour
exposed as a compile-time parameter", README is the canonical scope statement
(PROTOCOL §1), and a packet's enumeration of a canonical statement does not
narrow it. `QUIRK_VF_RESET` is the sharper of the two — it changes the
observable result of three of the most common instructions in the set, so a P1
design that hard-codes either answer would have to be *edited* in P4, not
configured, which is precisely the retrofit cost the packet's own task-6
rationale is about. One parameter is three-valued rather than boolean
(`QUIRK_MEM_I_MODE` has three community behaviours); a boolean would have made
the third unreachable without a spec diff.

**What I decided that the packet did not ask about, and why each was forced.**

- **The observation interface** (`obs_retire` plus the full architectural
  bundle at M03's boundary). Not an addition to scope: README's P1 success
  criterion is a *full architectural-state compare after every instruction*
  with *divergence reported at the instruction of first difference*, and
  PROTOCOL §10 forbids the bench deriving anything from RTL. Without specified
  observables the bench must reach into implementation internals, which would
  make the independence rule unenforceable in the program's very first phase.
  So the ports are derived from a signed criterion. I added `OBS_ENABLE`
  (default 1) so P5 can tie ~380 output bits off for the resource report —
  the same declare-it-now-rather-than-retrofit logic as the quirks.
- **The retire contract** (REQ-029). ADR-0017 Amendment A2 §5 names "how many
  edges does one model step correspond to?" as the question most likely to
  produce false divergences in P1, found the hard way in the spike. Leaving
  that to the bench author would leave the program's main verification
  instrument undefined, so I answered it normatively: during any cycle where
  `obs_retire` is high, the whole bundle describes the completed instruction
  and the state after it. One sampling rule, no edge counting.
- **A deterministic RNG, specified as a sequence.** `CXNN` cannot be
  lockstepped at all unless the golden model reproduces the byte stream
  exactly, so I pinned the recurrence, the seed, the eight-steps-per-draw
  rule, and the "advances only on `CXNN`, never free-runs" discipline — and
  exposed the LFSR state on `obs_rng` so a model/DUT desynchronisation is
  caught where it happens rather than at the next `CXNN` whose masked result
  differs. Eight steps rather than one because a single shift changes one bit
  of the low byte, making consecutive draws trivially correlated.
- **Every bit of architectural state gets an explicit reset value.** ADR-0017's
  context finding 2 says Verilator is 2-state and Icarus 4-state; an
  uninitialised bit reads 0 in one authoritative lane and X in the other, and
  the two lanes must agree. This is the one place where a lane property, not
  CHIP-8, wrote a requirement.
- **The memory observation contract** (REQ-114 — M02's storage is a top-level
  array named `mem`). Memory is part of the architectural state and 32768 bits
  cannot go on a port. Naming one observable is the only way I found to let
  the bench compare memory without depending on an implementation-derived
  hierarchical path. It is the single internal name this spec constrains, and
  I said so in place rather than letting it look like an oversight.
- **The package contains no behaviour** (REQ-108). ADR-0017 Consequence 1
  mandates a shared package as the mitigation for the reviewed-port-table
  regime. But a shared *function* that classifies opcodes would make the RTL
  and the bench agree about decode by construction, leaving the decode
  requirements untested in exactly L-D16's shape. Constants and typedefs only,
  stated as a requirement rather than a convention.

**Where I refused to decide.** Three items are in Open-questions rather than
specified, per the packet's instruction not to invent a signed scope parameter:
OQ-1 (whether deferred opcodes should halt or no-op — a verification-strategy
call belonging to whoever writes the campaign, cheap before freeze and
expensive after); OQ-2 (README records the 500–1000/s throttle in its scope
parameters but assigns it to no phase row — I assume P3 and note that if the
sponsor intends P1 it is an E2); OQ-3 (the VIP defaults). OQ-3 is the one that
worries me and it is stated bluntly in the spec: those behaviours are
provenance class **relayed**, from consult-only references none of which I
opened, and **a wrong default is invisible to P1 by construction** — the RTL
and the Python golden model are both derived from this document by the intake's
independence rider, so they will agree with each other about any error it
contains. There is no P1 experiment that can settle it; P4's test-ROM campaign
is the compensating control, and that is where these values become *measured*.
Naming the blind spot is the only honest move available (L-B01, L-F03).

**Scope discipline on my own deliverables.** The charter's freeze DoD requires
an ADR for every non-obvious choice, and this spec embodies five. I did not
write them: WO-0002's deliverables are two files, and I do not expand my own
work order or self-issue work. They are recorded as deferred item D-2 with the
decisions and their rejected alternatives already stated normatively in the
spec — so nobody downstream is blocked today, which is exactly the
SPEC-TEMPLATE §11 test for a deferred item versus an open question. The ADR is
owed **before** the freeze can sign, and the return summary says so. Same for
`docs/specs/requirements.md` and the traceability matrix (D-1), and for
`rtl/chip8_pkg.sv`, which I cannot author because `rtl/**` is outside my write
scope (D-3).

I appended the packet's Return log directly, per PROTOCOL §3's rule that
packet participants execute their own packet lifecycle; that is the second
non-journal file in this commit.

### Actions

- Wrote `docs/specs/SPEC-P1-core-cpu.md` (DRAFT, 1132 lines, 73984 bytes),
  instantiating `docs/specs/SPEC-TEMPLATE.md`. The template is per-module and
  this is a phase spec covering four modules, so §0 states the adaptation
  explicitly rather than performing it silently: every template section 1–13
  is present in order, §4 is instantiated once per module as §4.A–§4.D, and
  sections that do not apply (§4.3 configuration inputs, §7.6 configuration
  sampling, §8's stress-bench sense) are answered "not applicable" with one
  sentence of why, never deleted.
- Interface regime: **reviewed port tables** (ADR-0017 Consequence 1). §4.1
  states the fallback verbatim and names the two compensating controls — the
  line-by-line countersignature and the single-definition-site package —
  rather than claiming an interface check this program does not perform
  (L-F03). There is no compile-check CI evidence and none is owed.
- 90 numbered requirements, REQ-001…REQ-124, allocated in blocks with the
  inter-block gaps declared as permanent reserve so a later insertion never
  renumbers a cited id.
- Appended the RETURNED entry to
  `agents/handoffs/WO-0002_p1-core-cpu-spec.md`'s Return log.
- Ran no git command that writes. Read-only inspection only.

### Evidence

All commands run from a checkout root at this commit's tree.

1. **REQ registry is internally consistent** — every id used anywhere in the
   document has exactly one row in §10, and §10 contains no id the body does
   not state (*measured*):

   ```
   cd docs/specs && diff \
     <(grep -o 'REQ-[0-9]\{3\}' SPEC-P1-core-cpu.md | sort -u) \
     <(awk '/^## 10\. REQ coverage/,/^## 11\./' SPEC-P1-core-cpu.md \
       | grep -o '^| REQ-[0-9]\{3\}' | sed 's/| //' | sort -u)
   ```
   Observed: no output (identical). Count:
   `grep -o 'REQ-[0-9]\{3\}' SPEC-P1-core-cpu.md | sort -u | wc -l` → **90**.

2. **The decode partition is exhaustive** — the per-high-nibble counts in §6.3
   were re-summed independently of the table's own total row (*measured*, of a
   *derived* claim):

   ```
   python3 -c "
   impl=1+4096*4+256+4096*2+2304+256+4096*3+64
   defr=1+4096+16+32+64
   illg=4094+3840+1792+3840+4064+3952
   print('impl',impl,'deferred',defr,'illegal',illg,'sum',impl+defr+illg)"
   ```
   Observed: `impl 39745 deferred 4209 illegal 21582 sum 65536`, matching
   §6.3's totals row and the 16-bit space exactly.

3. **No banned phrasing** (SPEC-TEMPLATE how-to-use item 5) (*measured*):
   `grep -n -i "as needed\|appropriately\|should normally\|obviously\|TBD" \
   docs/specs/SPEC-P1-core-cpu.md` → no output.

4. **Blob gate** (PROTOCOL §5, default 1000000 bytes) (*measured*):
   `wc -c docs/specs/SPEC-P1-core-cpu.md` → **73984**. Well under.

5. **No interface-compile evidence is cited anywhere in this entry or the
   spec**, deliberately: ADR-0017 Consequence 1 puts this program in the
   reviewed-port-table regime, so there is no compile lane to cite and
   claiming one would be the failure L-F03 names. The §12 freeze record is
   empty in all four rows and the spec is DRAFT.

6. **Not verified here, and stated as such**: the CHIP-8 behavioural facts and
   the five VIP quirk defaults are provenance class **relayed** — no external
   reference was retrieved during this work, and no command in this repository
   can check them. Spec §11 OQ-3 records the exposure and names P4's test-ROM
   campaign as the compensating control.

### Outcome

**DoD vs WO-0002: met, with three named gaps carried as deferred items and
three as open questions — none of them a guess.**

| Task | Status |
|---|---|
| 1 — instantiate SPEC-TEMPLATE | Met; adaptation to a phase spec declared in §0 |
| 2 — architectural state as numbers from README | Met; quoted, not re-derived |
| 3 — instruction set, one REQ per behaviour | Met; boundary **confirmed by arithmetic** (35 = 25 + 3 + 6 + `0NNN`); `0NNN` disposed as illegal |
| 4 — the multicycle FSM | Met; 8 states, per-state memory access, exact per-instruction cycle counts including both loops, checked against README's budget clause by clause |
| 5 — reviewed port tables + shared package | Met; four port tables, package content normative in §5.5 (the file itself is D-3, outside my write scope) |
| 6 — quirk parameters | Met and **exceeded with argument**: five, not three; all defaulting to 1977 COSMAC VIP |
| 7 — illegal-opcode behaviour | Met; all 65536 encodings classified, REQ-041/042/043 |
| 8 — flag what the intake underdetermines | Met; OQ-1, OQ-2, OQ-3 |

**Handoff**: returned to the orchestrator. Next hops are `dv_lead`'s
testability countersignature and the sponsor's P1 spec freeze (E1). The spec
is **DRAFT** and its §12 freeze record is empty; SPEC-TEMPLATE §11 bars
freezing a spec that still carries an open question, so OQ-1/2/3 must close or
convert before the gate signs.

**No harvest note is owed at this entry**: PROTOCOL §7.1 makes the lessons
harvest a precondition of a gate signature or `SO-` packet, and this is
neither. Recording the arithmetic for the first harvest that does fall due:
`tasks/BOARD.md` fixes this chain's fork-point baseline as **none**, so my
first harvest span tiles from `J-architect_docs_lead-0001` — this entry.

### Open-questions

Three, all recorded in the spec's §11 and, per **L-E10**, owed a line on
`tasks/BOARD.md` that I cannot write myself (`tasks/**` is outside my write
scope, PROTOCOL §6). Handed to the orchestrator:

1. **OQ-1** — should `DC_DEFERRED` (P2/P3) encodings halt, as this spec
   specifies, or behave as a no-operation so partially-covered programs run
   further in P1? Routes to `dv_lead` at the countersignature. Cheap to change
   before freeze, expensive after.
2. **OQ-2** — which phase owns the 500–1000 instruction/second throttle?
   README records the rate in its scope parameters and assigns it to no phase
   row. The spec assumes **P3** and is correct either way (`THROTTLE_DIV = 0`
   in P1, and REQ-111 already fixes where the mechanism may be inserted). **If
   the sponsor intends P1, that is an E2.**
3. **OQ-3** — the five quirk defaults and the CHIP-8 behavioural facts are
   provenance class **relayed**, and a wrong value is invisible to P1 by
   construction because RTL and golden model both derive from this document.
   No P1 experiment settles it; P4's test-ROM campaign is the compensating
   control.

Plus one obligation that is not a question but blocks the freeze, tracked as
spec deferred item **D-2**: an ADR is owed covering the five non-obvious
choices this spec embodies (halt-on-illegal; fault-rather-than-wrap on
multi-byte spans; the specified deterministic RNG; the fully-specified reset;
the observation interface as a mandated port set). Charter §5 makes it a
freeze precondition, and I do not self-issue work orders.

### Files-in-this-commit
- docs/specs/SPEC-P1-core-cpu.md
- agents/handoffs/WO-0002_p1-core-cpu-spec.md

## [J-architect_docs_lead-0002] 2026-08-05T17:40Z | task:WO-0003 | ADR-0018 and the P1 traceability matrix: five rationales, a corpus that could not be run, and two problems the writing found

### Trigger

Spawn short-id `WO-0003/2026-08-05T16:52Z`. The orchestrator issued
`agents/handoffs/WO-0003_p1-design-rationale-adr.md` (state ISSUED,
2026-08-05) to discharge `SPEC-P1-core-cpu.md` §11 deferred items **D-2** (an
ADR for the five non-obvious choices — a `P1-spec-freeze` precondition under
charter §5) and **D-1** (the requirements register and traceability matrix).
This is the second entry of this chain; the first wrote the spec these
rationales are about. I declined to self-issue this work in WO-0002 and the
packet is the orchestrator's answer to that.

### Inputs

Read in full, in this order. This list is the audit evidence for
spec-derivation independence (PROTOCOL §10) and is complete — **no external
document was retrieved during this unit of work**, and nothing outside this
repository was opened. That matters more here than usual: an ADR arguing about
what CHIP-8 programs do would be the natural place to reach for a reference,
and I did not.

- `agents/charters/architect_docs_lead.md`
- `agents/PROTOCOL.md` (§11 especially, and §3, §6, §7.1, §8, §10)
- `agents/handoffs/WO-0003_p1-design-rationale-adr.md`
- `docs/specs/SPEC-P1-core-cpu.md` in full, at `54a7221` as committed
- `docs/adr/ADR-0017-toolchain-lane.md`, including Amendments A1 (A1.1, A1.2)
  and A2 — the nearest model, and the source of the 2-state/4-state finding
  that choices 4 and 5 both descend from
- `docs/LESSONS.md` — L-A04, L-B01, L-B12, L-B15, L-D11, L-D12, L-E04, L-E10,
  L-F03
- `tasks/BOARD.md` (intake B3/B4, the P1 open-questions table, the audit
  dispositions, the declared-packs line, the MACHINE/PROSE standing finding)
- `README.md` — the phase table and the scope-parameter paragraph
- `agents/journals/claude_architect_docs_lead_agent.md` (this chain's header
  and `J-architect_docs_lead-0001`)
- `docs/adr/` file listing and `docs/gates/templates/` listing (for numbering
  and for the carry-forward form)

**The same citation failure as last time, unchanged.** WO-0002's standing
lessons cited **L-D16**, which does not resolve in this tree
(`docs/LESSONS.md` runs L-D01…L-D15; `LC-01` landed in the org generic as
L-D16 at `849843f`, a repository this project does not read). WO-0003 does not
cite it, so nothing in this unit of work depends on it — but my spec does, in
§6.3, and I record that the resolution failure persists rather than letting it
age into an assumption.

### Reasoning

**The packet asked for two artifacts and one argument. The argument was the
work, and the corpus question ate a third of it.**

**1. What "run the rule backwards over the corpus" means for a design rule,
and why I refused to fake it.**

PROTOCOL §11 and L-B15 are unambiguous: a proposed rule is backtested before
adoption and the verdict goes in the ADR. L-B15's home incident is a
*governance* rule backtested against commit history, and that mapping does not
survive contact with five CPU design decisions. I worked the corpus question
first because getting it wrong would have made everything downstream
decorative.

Two candidate corpora. This repository's history is available and cheap — and
it **discriminates none of the five**, because no CHIP-8 instruction has ever
executed in this tree and my own spec §8 rules out ROM execution for the whole
of P1 by construction (any real program hits a `DXYN` — a `DC_DEFERRED` halt —
within a few instructions). A backtest against it returns "flags nothing,
misses nothing" five times, which is true and worthless. The corpus that
*would* discriminate them is the population of CHIP-8 programs: external to
this repository, not vendored (B3 makes the game ROM fetch-never-vendor and no
fetch has run), and not retrieved here or during the spec's authorship.

So the literal backtest **is not performable at this commit**, and I said so in
ADR-0018 §1 rather than writing five paragraphs that would read like
measurements. What I did instead is a structural backtest — for each rule,
characterise the class of program that depends on the *rejected* behaviour and
test that class for three properties: non-empty, reachable inside P1's
stimulus scope, and *discriminating* (does the program behave differently under
the two rules in a way its author intended?). That third test is what does the
work; it is what disposes of `0NNN` SYS callers, which are a real and
non-empty class that both candidate behaviours fail identically. The result is
labelled **derived**, and each choice names the gate at which the real
backtest becomes performable — P3/P4 for choices 1 and 2, P1's own lockstep
for 3, the Icarus lane for 4. L-B01's whole point is that a relay is not a
measurement; a *derivation* dressed as a backtest would be the same offence
one level up.

This is the decision I would most expect an auditor to push on, so: the
alternative I rejected was to backtest against the spec's own §6.3 decode
partition and call that the corpus. It would have produced a tidy table. It
would also have been circular — testing a rule against the document that
states it.

**2. The five, and where the argument moved.**

*Halt on illegal opcode.* Holds. Alternatives were no-op-and-continue and a
trap vector; the decisive argument is not strictness but **where the
information goes** — P1's signed criterion is "divergence reported at the
instruction of first difference", and halting is the only one of the three
that keeps a decode fault at the instruction that caused it. The backtest
changed the rule's shape in exactly one place, and it is a place the spec
already got right: the `DC_DEFERRED`/`DC_ILLEGAL` split. Without it, every P1
test of the illegal space also passes on a decoder that has simply forgotten
`DXYN` exists. That is the correction a backtest would have demanded, and it
was already made.

*Fault rather than wrap.* Holds, and strengthened. The strongest argument in
the whole ADR is the vacuity one, because it rests on a **signed** README
criterion (P4's formal property "I never addresses out of range"), not on
taste: under wrap the property is true by the width of a 12-bit register, so
no design can violate it and proving it proves nothing. I also found the
articulation of the wrap/fault split that I did not have when writing the spec:
**fault exactly where the register width does not already decide the answer.**
That makes the split a rule instead of two preferences.

The backtest added a cost the spec does not state: the fault localises the
*use* of an overflowed I, not the `FX1E` that overflowed it, because
single-target updates wrap silently. Chasing that produced something I did not
expect — with `QUIRK_I_OVERFLOW_VF = 1` the overflow **is** flagged at the
cause. So P4's alternate-configuration run carries a diagnostic the default
lacks, which is a reason to run it beyond compatibility. That is now on the
record so P4 inherits it.

*Deterministic RNG.* Holds, strongly, and this is where the backtest paid best
because it split into two sub-rules with **opposite** verdicts. The corpus is
**blind** to stepped-versus-free-running: a CHIP-8 program cannot observe cycle
counts, so no program can tell the two designs apart, and the dependent class
is empty. That is what licenses deciding it purely on verification grounds —
and the verification ground is decisive, because a free-running source would
force the Python model to become a cycle-exact emulation of the whole machine
to predict `CXNN`, which turns the independent anchor into a second copy of
the DUT and violates the intake's independence rider in spirit and effect.

But the corpus is **not** blind to step count, and there I checked the algebra
instead of trusting the spec's prose. §6.5 says a single step "changes only one
bit of the low byte", which is loose. The precise fact is that `16'hB400`'s low
byte is zero, so after one step the output byte is exactly `s[8:1]` — seven of
its eight bits are the previous byte's, shifted. So two consecutive `CXNN` to
pick a coordinate pair, which is what an ordinary program does, would place
both coordinates in near-lockstep under a one-step rule. That is a
discriminating, non-empty, entirely ordinary program class, and it requires
eight. I measured the identity rather than asserting it (Evidence 4), which
also confirmed the period is 65535 and that zero is absorbing — so REQ-103's
non-zero-seed bar is *necessary*, not merely prudent. The spec's normative
content is untouched; only the argument is sharper, and per L-A04 it appends
in the ADR rather than rewriting §6.5.

*Fully specified reset.* This is the one that moved, and it moved twice.

First, on the label. The orchestrator's framing was that a fully-specified
reset is "partly a compensating control for a blind lane". I could not write
that, and the reason is L-F03 exactly: a compensating control **performs a
check** that something else fails to perform. A specified reset performs no
check — it removes the hazard the blind lane would have failed to detect.
Hazard elimination and hazard detection are different classes, and flattening
them is the overclaim the org's honesty discipline exists to stop. So
ADR-0018 §5.2 states three rows: the reset spec is elimination and **PROSE**
(nothing refuses RTL that omits a reset term); the **Icarus lane** is the
compensating control and the only one, **MACHINE** once it runs; and
ADR-0017's dual-lane architecture is what makes the detecting lane exist.

Second, and this is the finding: **elimination only covers what the
specification enumerates, and the enumeration is short by the largest term.**
REQ-008 enumerates architectural registers. Memory is excluded by REQ-009 and
governed by REQ-014 instead — and REQ-014 states the all-zero guarantee **only**
for `MEM_INIT_FILE = ""`. For a partial image, which is every realistic P1
image, nothing says what the remaining bytes hold. That is 32768 bits, it is
the largest single block of state in the machine, the lockstep compares it, and
**REQ-123 — which claims no uninitialised storage anywhere in P1 — is therefore
falsified by my own document.** §6.6 makes it worse by freeing M02's
realisation among three mechanisms that differ precisely in their answer. And
the failure mode is the nasty one: Verilator reads unwritten locations as `0`
so the fast lane where all the long campaigns run stays green, while Icarus
reads `X`; and the Python model has no `X` and will zero-fill, so the first
read of unwritten memory in the 4-state lane is a **false divergence caused by
the specification, not by the RTL** — ADR-0017 A2 §5's hazard class arriving
from a direction A2 did not anticipate.

I did not fix it. The repair is one sentence of normative text, and one
sentence of normative text is a change to specified behaviour, which WO-0003
excludes in terms I will not stretch. It is **OQ-4**, it blocks the freeze, and
it needs its own packet.

*The observation port set.* The packet asked for an argument rather than a
justification and said a failure to make one cleanly would be worth more than a
tidy ADR. My honest answer is that the argument closes on one half and does not
close on the other, and I wrote both.

It closes on "is this a spec describing an implementation?". The test I used is
not ports-versus-internals — that would license any amount of implementation
description as long as it happened at a boundary. It is: *a specification
describes an implementation when it removes a degree of freedom without thereby
fixing an obligation stated in terms of the module's own observable behaviour.*
Three legs. **(a)** The obligation is not invented here: README's P1 criterion
is stated in terms of observation, and the bench has exactly two ways to get
architectural state — from observables the spec names, or by reading the RTL,
which PROTOCOL §10 forbids outright. So a spec that stated the criterion and
omitted the observables would be *incomplete*, not purer. **(b)** Every element
of the bundle is REQ-013 architectural state, a function of it
(`obs_instr`/`obs_instr_addr` are strictly redundant with memory and PC), or a
boundary marker — and the boundary marker is the best argument in the section,
because without `obs_retire` the bench must count cycles against §7.1, which is
*more* structural dependence, not less. **(c)** §6.6 leaves free everything the
obligation does not reach, including whether `obs_*` is driven directly or
through a register stage. That yields an **admission rule** for future `obs_*`
ports — architecture, a function of it, or a boundary marker; an
`obs_fsm_state` fails all three and is the back door — which is the ADR's most
reusable output and which the existing eleven already satisfy, so writing it
down changes nothing today.

It does **not** close in two places, and I say so in the ADR rather than
padding over them.

**REQ-114 is implementation description.** Mandating an internal array name is
not covered by any part of (b): a hierarchical path is not a boundary
observable. The defence is least-bad-of-three — the alternatives being a
PROTOCOL §10 violation and a read-back port that contradicts REQ-112 — and the
real argument is that the bench depends on a memory observable under all three
options, so the only question is **whether the spec or the RTL is the authority
for it**, and choosing the spec moves the dependency in the direction §10
requires. That argument is sound. It is still not the same claim as "this is
not implementation description", and I refused to let the two blur. I did check
one thing rather than assuming it: REQ-114 does **not** conflict with §6.6,
because §6.6 frees the *image* mechanism and not the storage shape, and all
three image mechanisms remain available over a flat array.

**Nothing mechanical stops DV testing structure through the bundle.** The risk
shape is precise: nothing restricts a bench to sampling at retirement, and
mid-instruction `obs_*` is a timing property of the implementation. Three
controls stand there and all three are **PROSE**. §6.6 makes such a test
*unsound on the spec's own terms* — but by inference, not by an imperative
clause, and I recorded that as an inference. The traceability matrix makes it
*visible*, because a structural assertion has no REQ to cite — but nothing
refuses an uncited test and a determined author can cite a plausible REQ.
REQ-106/REQ-113 constrain the DUT, not the bench. I also recorded the reason
the risk is genuinely smaller here than the general worry implies — for a CPU
with no display and no I/O, architectural state **is** the entire observable
behaviour, and REQ-013's closure clause makes that a theorem rather than an
opinion — together with the reason that mitigation **expires**: P2 has a
framebuffer, and P2's 2048 bits cannot go on a port, so P2 inherits REQ-114's
uncomfortable shape rather than §6.4's comfortable one. That prediction is on
the record so P2's spec work starts from it instead of rediscovering it.

**3. The matrix, and the one design decision in it.**

The packet says: do not renumber or restate REQ ids; a requirement stated twice
will diverge. I took that literally and it decided the file's shape. There is
**no prose column** — no "subject", no summary, nothing a reader could mistake
for the requirement. Columns are id, spec section, DV hook, test ids
(`dv_lead`'s, empty), evidence (`dv_lead`'s, empty). The tempting alternative
was a short handle per row for readability; I rejected it because a handle is
a restatement whose divergence from the spec **nothing in this repository could
detect**, and a silent divergence in the artifact every `SO-` packet cites is
worse than an unfriendly table. Group headings name the *block*, which is a
structural label and not a statement about any requirement.

Two further decisions. The file **mints no requirement ids and holds no
programme-invariant REQ block** — minting ids for the cross-cutting invariants
would be a scope act (E2) dressed as bookkeeping, so §3 of the spec keeps
citing README at its canonical home and I updated its wording rather than its
approach. And the completeness check is a **two-way** diff, so it fails both on
a requirement the matrix forgot and on a row the matrix invented; I wrote it as
a runnable command and labelled it PROSE, since wiring it into CI is
`scripts/**` work outside my scope and I do not expand my own packet.

**4. Scope judgment I made, and would defend.**

WO-0003 scopes my spec edit to "cite ADR-0018 and requirements.md, move D-1 and
D-2 to landed". I did more: I added **D-7** and **OQ-4** to §11, and corrected
four places (§0, §3, §10 intro, REQ-124) that asserted `requirements.md` does
not exist. The corrections are plainly required — doc truthfulness is my own
charter §6 evaluation criterion and I had just falsified four sentences.

The additions need the argument. Adding an open question changes no specified
behaviour; it is the DRAFT's designated mechanism, and SPEC-TEMPLATE §11 bars
freezing a spec that carries one — so recording OQ-4 in the spec is exactly
what makes the gate unable to sign over it. The alternative was to leave OQ-4
in the ADR and this journal only, which would have left a **freeze-blocking
defect absent from the document the gate reads**, and L-E10 exists because
questions dispositioned inside an ADR's narrative existed as no artifact anyone
tracked. Between over-stepping a packet's enumeration by one row and letting a
freeze sign over a known defect, the first is obviously right; I record it as a
judgment call rather than letting it look like the packet asked for it.

**What I did not do.** I did not repair OQ-4 — that is a spec revision and a
new packet. I did not add the sixth quirk parameter D-7 contemplates. I created
nothing under `rtl/`, so D-3 is untouched. I ran no git command that writes.

### Actions

- Wrote `docs/adr/ADR-0018-p1-core-cpu-design-choices.md` (57k) — status
  ACCEPTED (in-role, PROTOCOL §8; not an E2 or E3, since it records decisions
  already normative in a DRAFT and adds no requirement, phase, role, toolchain
  or license change). Sections: §0 what the ADR may not do; §1 the corpus
  question; §2–§6 the five decisions, each with alternatives, why the winner
  won, cost, corpus verdict (flags/misses), and a falsifier; §7 the two
  findings with routing; §8 consequences; §9 provenance and a MACHINE/PROSE
  enforcement table.
- Wrote `docs/specs/requirements.md` (15k) — P1's 90 rows generated
  mechanically from spec §10 rather than transcribed by hand, plus the
  id-allocation policy, per-column ownership and timing, the hook legend, fill
  discipline, and a two-way completeness check.
- Edited `docs/specs/SPEC-P1-core-cpu.md`: §11 D-1 and D-2 → **LANDED**; added
  **D-7** (deferred, closes P4) and **OQ-4** (blocks the freeze), each placed
  in id order; rewrote the §11 preamble and the closing L-E10 paragraph;
  corrected §0, §3, the §10 intro and REQ-124 where they asserted
  `requirements.md` does not exist. **No normative behaviour statement was
  touched** — no REQ text, no port table, no cycle count, no parameter.
- Appended the RETURNED entry to
  `agents/handoffs/WO-0003_p1-design-rationale-adr.md`'s Return log and set its
  header state.
- Ran no git command that writes. Read-only inspection only.

### Evidence

All commands run from a checkout root at this commit's tree.

1. **The matrix and the spec registry contain exactly the same ids**, two-way
   (*measured*):

   ```
   diff \
     <(awk '/^## 10\. REQ coverage/,/^## 11\./' docs/specs/SPEC-P1-core-cpu.md \
       | grep -o '^| REQ-[0-9]\{3\}' | sed 's/| //' | sort -u) \
     <(awk '/^## 5\. Matrix — P1/,/^## 6\./' docs/specs/requirements.md \
       | grep -o '^| \*\*REQ-[0-9]\{3\}\*\*' | grep -o 'REQ-[0-9]\{3\}' | sort -u)
   ```
   Observed: no output (identical). Matrix row count:
   `awk '/^## 5\. Matrix — P1/,/^## 6\./' docs/specs/requirements.md | grep -c '^| \*\*REQ-'`
   → **90**.

2. **The spec's REQ registry is still internally consistent after my edits** —
   every id used anywhere in the document has exactly one §10 row and §10
   contains no id the body does not state (*measured*, same command as
   `J-architect_docs_lead-0001` Evidence 1):

   ```
   diff <(grep -o 'REQ-[0-9]\{3\}' docs/specs/SPEC-P1-core-cpu.md | sort -u) \
        <(awk '/^## 10\. REQ coverage/,/^## 11\./' docs/specs/SPEC-P1-core-cpu.md \
          | grep -o '^| REQ-[0-9]\{3\}' | sed 's/| //' | sort -u)
   ```
   Observed: no output. Count unchanged at **90** — confirming I added and
   removed no requirement.

3. **No banned phrasing** in any of the three files (SPEC-TEMPLATE how-to-use
   item 5) (*measured*):
   `grep -n -i "as needed\|appropriately\|should normally\|obviously\|TBD" docs/specs/SPEC-P1-core-cpu.md docs/specs/requirements.md docs/adr/ADR-0018-p1-core-cpu-design-choices.md`
   → no output.

4. **The LFSR claims underpinning ADR-0018 §4.4(b) are measured, not argued**
   (*measured*). The command is quoted in full in ADR-0018 §4.4; observed
   output `True`, `True`, `65535` — i.e. one step's output byte is exactly
   `s[8:1]` **over all 65536 states, exhaustively rather than by sampling**,
   zero is an absorbing state, and the period from `RNG_SEED = 16'hACE1` is
   maximal. (A first pass sampled 20000 random states and agreed; the
   exhaustive form replaced it before commit, since the state space is small
   enough that sampling bought nothing.) **What this measures is the
   specified sequence — this ADR's own arithmetic. It measures no design: no
   RTL and no simulator exist.**

5. **Blob gate** (PROTOCOL §5, default 1000000 bytes) (*measured*):
   `wc -c` → SPEC 77660, requirements.md 14955, ADR-0018 57587. All well under.

6. **The corpus backtest was NOT executed, deliberately and on the record.**
   No CHIP-8 program was run, no ROM was fetched, no external reference was
   retrieved. ADR-0018 §1 states why the literal backtest is not performable at
   this commit and names the gate at which each choice becomes measurable.
   Every CHIP-8 behavioural claim in the ADR is provenance class **relayed**;
   the program-class analyses are **derived**. §9 of the ADR is the
   claim-by-claim table.

7. **Enforcement classes are tagged, not flattened** (`CLAUDE.md` iron rule,
   ADR-0002/ADR-0016): ADR-0018 §9's second table classifies seven enforcement
   claims. Six are **PROSE**; one is **MACHINE** and is explicitly marked *not
   yet run, because no RTL exists*.

### Outcome

**DoD vs WO-0003: met on all five tasks, with the corpus question answered
explicitly rather than assumed, and two findings returned that the packet
invited and did not expect to be needed.**

| Task | Status |
|---|---|
| 1 — one ADR, five decisions, alternatives + cost + falsifier | Met |
| 2 — backtest each rule; verdict in the ADR; Verilator's blindness named for choice 4 | Met, **and the corpus itself is dispositioned first** (ADR-0018 §1): the literal backtest is not performable at this commit, a structural backtest was performed instead, and each choice names the gate at which the real one becomes possible. The 2-state point is made **and corrected** — a specified reset is hazard *elimination*, not a compensating control |
| 3 — argue choice 5; report failure to close | Met. Closes for the port set on three legs and yields a standing admission rule; **does not close** for REQ-114 (genuine implementation description, defended as least-bad) or for anti-back-door protection (three controls, all PROSE) |
| 4 — traceability matrix | Met. 90 rows, no prose column by design, two-way completeness check |
| 5 — spec §11 cites both as landed; D-3 left alone | Met, **plus D-7 and OQ-4 and four truthfulness corrections** — the scope judgment is argued in Reasoning §4 |

**Did any choice weaken?** No choice is reversed and there is no "I would now
choose differently" on the substance of any of the five. Three things moved:
choice 4's **scope** is short by the largest term (OQ-4); the quirk set's
**completeness claim** is weaker than §5.2 presents (D-7); and choice 5's
**defence** is partly unclosable and is now recorded as such instead of
polished.

**Handoff**: returned to the orchestrator via the packet's Return log.
`P1-spec-freeze` loses two preconditions (D-1, D-2) and gains one (OQ-4).

**No harvest note is owed at this entry**: PROTOCOL §7.1 makes the lessons
harvest a precondition of a gate signature or an `SO-` packet, and this is
neither. Carrying the arithmetic forward: this chain's fork-point baseline is
**none** (`tasks/BOARD.md`), so my first harvest span will tile from
`J-architect_docs_lead-0001` and must reach this entry — the interval at the
next gate is `J-architect_docs_lead-0001..0002` unless further entries
intervene.

### Open-questions

Two new, both owed a `tasks/BOARD.md` line I cannot write (`tasks/**` is
outside my write scope, PROTOCOL §6; L-E10 requires them to be board
artifacts). Both are in spec §11 and in the packet's Return log.

1. **OQ-4 — blocks `P1-spec-freeze`.** Memory outside a partial
   `MEM_INIT_FILE` image has no specified initial value. **REQ-123 is falsified
   as written**; §6.6 permits three realisations that disagree about 32768
   bits; Verilator reads `0` and stays green while Icarus reads `X`; and the
   Python golden model will zero-fill, so the first read of unwritten memory in
   the 4-state lane is a false divergence caused by the specification. The
   repair is a spec revision and needs its own work order. **`dv_lead` should
   see this before the WO-0004 countersignature** — it bears on the lockstep's
   first instruction.
2. **D-7 — does not block the freeze.** The quirk set may be short by one:
   unknown-opcode handling is divergent across interpreters, and README's P4
   row requires "every divergent CHIP-8 behaviour" as a compile-time parameter.
   Not adopted here (it would change specified behaviour); the reading is
   arguable and the settling evidence does not exist before P4.

Carried unchanged from `J-architect_docs_lead-0001`: **OQ-1** (routed to
`dv_lead` in WO-0004), **OQ-2** (decided P3 by the orchestrator), **OQ-3** (the
relayed VIP defaults, with P4's test-ROM campaign as the compensating control).
**D-3** remains `rtl_lead`'s and remains untouched.

One item that is not a question: the **L-D16 citation still does not resolve**
in this tree, and `SPEC-P1-core-cpu.md` §6.3 depends on it. Noted again rather
than allowed to age into an assumption.

### Files-in-this-commit
- docs/adr/ADR-0018-p1-core-cpu-design-choices.md
- docs/specs/requirements.md
- docs/specs/SPEC-P1-core-cpu.md
- agents/handoffs/WO-0003_p1-design-rationale-adr.md

## [J-architect_docs_lead-0003] 2026-08-05T17:57Z | task:WO-0005 | P1 spec revision: OQ-4 closed at `8'h00`, all six amendments applied, F-5 confirmed real and measured in both lanes

### Trigger

Spawn short-id `WO-0005/2026-08-05T17:40Z`. The orchestrator issued
`agents/handoffs/WO-0005_p1-spec-revision.md` (ISSUED, 2026-08-05) after
`dv_lead` returned **NOT COUNTERSIGNED at `54a7221`** with six ready-to-apply
amendments. Two things had to come out of this round: **OQ-4 closed by
normative text** — my own finding from WO-0003, and the freeze blocker — and
**each of A-1…A-6 applied or declined with a reason**. The packet additionally
ordered F-5 reasoned through rather than accepted or dismissed, because
`dv_lead` marked its own toolchain premise provenance *relayed* with a spike
owed.

### Inputs

Read in full, in this order. No external document was retrieved during this
unit of work; nothing outside this repository was opened.

- `agents/charters/architect_docs_lead.md`
- `agents/PROTOCOL.md` (v2)
- `agents/handoffs/WO-0005_p1-spec-revision.md` — governs, and is authoritative
  over the spawn prompt where they differ
- `docs/reports/dv/DV-P1-testability.md` — **all 764 lines**, not only §8. The
  amendments are unintelligible without the findings they repair, and three of
  the four corrections I made beyond A-1…A-6 come from sections §3, §4 and §7
  that §8 does not restate
- `docs/specs/SPEC-P1-core-cpu.md` at `ef3728c` — all 1153 lines
- `docs/adr/ADR-0018-p1-core-cpu-design-choices.md` — all 932 lines, including
  §5.4's backtest and §7.2, which is OQ-4's origin
- `docs/adr/ADR-0017-toolchain-lane.md` — §§ index plus Amendments A1 and A2,
  for the amendment form this repository has established
- `docs/specs/requirements.md`
- `docs/LESSONS.md` — L-A04, L-B01, L-D11, L-D12, L-E04, L-F03 read at their
  entries, not from the packet's summary of them
- `agents/journals/claude_architect_docs_lead_agent.md` — my own tail, for the
  harvest-span arithmetic carried forward from `-0002`

### Reasoning

**1. F-5 first, because if it were false the round's shape changed.** The
packet was right that it is the most consequential defect in the set: if no
test can configure the DUT, every other repair is decoration. `dv_lead` had
marked the claim *relayed* and owed it a spike, so I had two ways to settle it.

The first needs no toolchain fact at all, and it is the one I lead with.
§5.4 says *"Every test sets `MEM_INIT_FILE`"*; §5 puts every parameter in the
package; §4.3 declares "Configuration inputs: **None**"; §4.C lists no
parameters. **Those four clauses are jointly unsatisfiable under any toolchain
assumption whatever.** Even on the most generous reading of the tools, the
document named no mechanism. That makes F-5 adjudicable from the document
alone — which matters, because it means the finding never depended on the
relay, and a spike that came back the other way would not have saved it.

The second way was available and I took it anyway, because "the relay is
probably right" is not a verdict and both simulators are installed. Verilator
5.020 and Icarus 12.0 both **refuse** a package-parameter override and both
**accept** a top-level module parameter defaulting to the package value; a
`string` module parameter feeding `$readmemh` works in both. So A-3 is not
merely correct-either-way as `dv_lead` argued — it is measured to work.

The measurement also returned something the relay did not contain, and it is
the reason I upgraded F-5's severity rather than merely confirming it.
Icarus's package-scoped form `-Ppkg.P=…` is **silently ignored**: no error, no
warning, value unchanged. That is the form a test author reaches for first,
and it fails by loading nothing — against a machine whose all-zero memory then
halts on `0x0000` with `ERR_ILLEGAL_OPCODE` at the first instruction, which
looks exactly like an ordinary decode-fault test result. A defect whose
presentation is a plausible pass is the silently-always-pass class (PROTOCOL
§10, L-D11), and that is a different and worse thing than "the override does
not work".

**2. The near-miss: A-3 applied literally would have reinstated F-2.** This is
the part of the round I would most want a reviewer to check. A-1 makes
`obs_sp` `SP_W` wide. §5.1 derives `SP_W` as `$clog2(STACK_DEPTH)+1`. A-3
makes `STACK_DEPTH` a module parameter. If `SP_W` is still read from
`chip8_pkg`, it is computed from the *package's* `STACK_DEPTH` and does not
follow the override — so at `STACK_DEPTH = 4` the port is 5 bits while the
stack is 4 deep. That is F-2 exactly, arriving through the mechanism written
to repair it, and it would have frozen into the document under two amendments
that each look right in isolation.

I measured it rather than trusting my reading of the LRM: with `STACK_DEPTH`
overridden to 4, a package-derived `SP_W` reads **5** and a module-derived one
reads **3**, in both simulators — so it is a property of the language, not of
a tool. REQ-115 therefore carries a clause A-3 did not have: derived widths
are derived **in the module from the module's parameter**. Applying an
amendment as written would have been worse than reasoning it through, and this
is the one place in the round where that was true.

**3. OQ-4 — why zero-fill won, and why "narrow REQ-123" lost.** The packet
allowed either making REQ-123 true or narrowing it until it is. I chose to
make it true, and the reason is consistency with a decision ADR-0018 already
took. §5.1 of that ADR rejected "reset only what correctness requires" for
architectural registers on the ground that it makes determinism a property of
the *stimulus* rather than of the *design*. "Leave uncovered memory undefined
and require the bench to read only covered locations" is the same alternative
one level up, and accepting it here after rejecting it there would be
incoherent — quite apart from being unenforceable, since PC wraps (REQ-010)
and the decode sweep deliberately executes from locations no image covers.

The other two alternatives lost on measurement rather than principle.
Requiring a full 4096-byte image does not close the hole, it makes the hole a
precondition **nothing checks** — a short image still elaborates and still
X-fills. Specifying the locations as `X` is unavailable because Verilator
cannot represent it: measured, it reads `00`, so the lane where the long
campaigns run could never check the property.

**The measurement changed the wording, which is why it was worth running.** I
had assumed with `dv_lead` and with my own ADR §7.2 that the uncovered set is
a *suffix* — "bytes beyond the end of a short image". It is not: a `$readmemh`
file may carry `@address` records, and I measured a sparse image leaving a
hole **in the middle** reading `xx` under Icarus. So the repair had to be
phrased per location ("every location the image does not cover") rather than
per length. A one-sentence repair phrased the way all three of us were
thinking about it would have left a hole in the hole.

**4. What I applied beyond the six, and the boundary I was told not to cross.**
`dv_lead` pre-committed that its confirmatory pass covers only the amended
text, and the packet was explicit that the pre-commitment binds me too. I read
that as barring me from **re-opening graded requirements**, not as barring the
corrections `dv_lead` itself marked *owed*. Four sets, each enumerated in §13.1
so the confirmatory surface is bounded rather than discovered by diff:

- **F-1/F-7/F-8 → §10's hook column.** Five requirements carried an `R` hook —
  a full-state compare at `obs_retire` — for behaviour that a full-state
  compare cannot observe. Leaving a frozen document recording checks that
  cannot perform their observation is a false record, and doc truthfulness is
  the thing my charter §6 evaluates me on. No requirement text changed; only
  the column saying how each is checked.
- **F-6 → §10's legend + D-9.** Fifteen `I` hooks have no named performer.
  I stated that in place (L-F03) and **routed** it rather than deciding it:
  naming `rtl_lead` as performer is assigning another lead work, which
  charter §7 makes a WO- request to the orchestrator, not my call.
- **F-11 → D-8.** This is the judgement I most want on the record. `dv_lead`
  graded it MAJOR, ESCALATION, explicitly **not freeze-blocking**, and asked
  that the sponsor have it *before* signing. Those two facts constrain the
  form: an **OQ** row would block the gate it asked to be signed with
  knowledge of, so it had to be a **deferred item** with a stated
  what-a-reader-assumes-meanwhile. D-8 is that, and it is now in the document
  the gate reads rather than only in a DV report.
- **F-13 → §2, §7.1.** Editorial, and §7.1's is not merely cosmetic: latency
  was defined between two `S_FETCH_HI` events, neither observable anywhere, so
  the retire-to-retire equivalent is now stated rather than left for each
  bench author to re-derive.

**5. Two amendments to ADR-0018, appended, because two decisions moved.**
L-A04 and the packet both require append-not-edit, and ADR-0017's A1/A2 set
the form. **A1** extends Choice 4's scope to memory — §5.4's backtest had
found the decision "right in what it covered and short by the largest term",
and closing OQ-4 is exactly the extension it named. **A2** records a decision
ADR-0018 does not contain at all: the override path is a non-obvious design
choice with real alternatives (preprocessor defines *do* reach package
parameters, and that is the one alternative that is not a strawman — it loses
on making the value a macro property and putting an RTL edit in DV's path for
every new overridable value). Charter §3 makes every non-obvious choice owe an
ADR; REQ-115 is one, so it owes this.

I did not fold either into the original text, and I did not rewrite §0's
promise that the repair would be a separate packet — that promise was kept,
this *is* the separate packet, and both statements are true of their own
sections. I added a header bullet pointing forward, which is the pattern
ADR-0017's Status line already uses.

**6. What I deliberately did not do.** I re-opened nothing `dv_lead` graded and
closed: no requirement outside the amendment set had its meaning revised, and
the propagation edits change wording to preserve a meaning rather than to
alter one. I minted exactly one id, REQ-115, which A-3 dictated. I touched
nothing under `rtl/**`. And I added no requirement obliging `dv_lead` to check
the image actually loaded — the missing-file hazard I measured is real, but
imposing a bench obligation on another lead mid-countersignature is not mine
to do, so REQ-014 names the gap and assigns the control to `dv_lead` without
mandating it (L-F03: name the control that does not exist rather than claim
one that does).

### Actions

- Revised `docs/specs/SPEC-P1-core-cpu.md`: A-1 across §4.A/§4.B/§4.D/§5.5/
  REQ-008 plus propagation to §2, §6.1.1, §6.4.4, §6.6, §10; A-2 into §4.B and
  REQ-008; A-3 as new **REQ-115** at §5.0 with §4.3 and §4.C referencing it;
  A-4 and the two-domain distinction into REQ-123; A-5 into REQ-109; A-6 as a
  normative REQ-095 block in §5.2 with propagation to §2 and §10. **OQ-4
  closed** by rewriting REQ-014 and amending §5.4, §6.6, REQ-008, REQ-123 and
  §4.B. §10 hook column corrected; §11 OQ-4 marked closed and D-6 updated;
  D-8 and D-9 added; §12's interface-check row transcribed with its relay
  limit stated; §13.1 written as the revision record.
- Appended **Amendments A1 and A2** to `docs/adr/ADR-0018-p1-core-cpu-design-choices.md`.
- Updated `docs/specs/requirements.md`: REQ-115 row, block table, hook column
  synced to §10, §7's OQ-4 item marked closed and the hook-column note
  rewritten from "a proposal" to "post-grading".
- Flipped `agents/handoffs/WO-0005_p1-spec-revision.md` to **RETURNED** and
  wrote its Return log.
- **Ran no git command.** Not `add`, not `commit`, not `push`, not `stash`.
  The packet's §3 emphasis was read as written; the files are handed to the
  orchestrator for commit.

### Evidence

Commands are self-contained and runnable from a checkout at this commit,
except the two simulator spikes, whose scratch sources are **ephemeral** — the
heredocs below recreate them in full, which is what makes the results
reproducible rather than the files.

1. **Every REQ id used in the spec has exactly one §10 row, and §10 contains no
   id the body does not state** (*measured*, same command as `-0001` and
   `-0002`):
   ```
   diff <(grep -o 'REQ-[0-9]\{3\}' docs/specs/SPEC-P1-core-cpu.md | sort -u) \
        <(awk '/^## 10\. REQ coverage/,/^## 11\./' docs/specs/SPEC-P1-core-cpu.md \
          | grep -o '^| REQ-[0-9]\{3\}' | sed 's/| //' | sort -u)
   ```
   Observed: no output. Registry row count **91** — 90 at `54a7221` plus
   REQ-115, confirming I added exactly the one id A-3 dictated and withdrew
   none.

2. **Spec registry and traceability matrix hold exactly the same ids**
   (*measured*, the two-way check `requirements.md` §6 specifies):
   ```
   diff <(awk '/^## 10\. REQ coverage/,/^## 11\./' docs/specs/SPEC-P1-core-cpu.md \
          | grep -o '^| REQ-[0-9]\{3\}' | sed 's/| //' | sort -u) \
        <(awk '/^## 5\. Matrix — P1/,/^## 6\./' docs/specs/requirements.md \
          | grep -o '^| \*\*REQ-[0-9]\{3\}\*\*' | grep -o 'REQ-[0-9]\{3\}' | sort -u)
   ```
   Observed: no output. Matrix row count **91**.

3. **F-5, measured in both lanes** (*measured*; scratch sources ephemeral,
   recreated by this command):
   ```sh
   d=$(mktemp -d); cd "$d"
   cat > pkg.sv <<'X'
   package p;
     parameter int PKG_SEED = 16'hACE1;
   endpackage
   X
   cat > top.sv <<'X'
   module top;
     parameter int MOD_SEED = p::PKG_SEED;
     initial begin
       $display("PKG_SEED=%0d  MOD_SEED=%0d", p::PKG_SEED, MOD_SEED);
       $finish;
     end
   endmodule
   X
   iverilog -g2012 -o a.out pkg.sv top.sv && ./a.out                        # baseline
   iverilog -g2012 -Ptop.PKG_SEED=1234 -o b.out pkg.sv top.sv               # package param, top scope
   iverilog -g2012 -Pp.PKG_SEED=1234   -o b2.out pkg.sv top.sv && ./b2.out  # package param, pkg scope
   iverilog -g2012 -Ptop.MOD_SEED=1234 -o c.out pkg.sv top.sv && ./c.out    # module param
   ```
   Observed — Icarus 12.0: baseline `PKG_SEED=44257 MOD_SEED=44257`;
   `-Ptop.PKG_SEED` → **`error: parameter 'PKG_SEED' not found in 'top'`**;
   `-Pp.PKG_SEED` → **no diagnostic and no effect**, `PKG_SEED=44257`;
   `-Ptop.MOD_SEED` → `MOD_SEED=1234`. Verilator 5.020 with the same sources
   and a trivial C++ harness: `-GPKG_SEED=1234` →
   **`%Error: Parameters from the command line were not found in the design:
   PKG_SEED`**; `-GMOD_SEED=1234` → `MOD_SEED=1234`.
   **Conclusion: F-5 is real. A-3's mechanism works in both lanes.** The
   silent-ignore row is the one the relay did not contain.

4. **The derived-width consequence A-3 lacked** (*measured*): with `SP_W`
   derived in the package and `STACK_DEPTH` overridden to 4 via
   `-Ptop5.STACK_DEPTH=4` / `-GSTACK_DEPTH=4`, both simulators report
   `STACK_DEPTH=4 | pkg SP_W=5 | module SP_W=3`. The package-derived width
   does **not** follow the override; the module-derived one does. This is why
   REQ-115 carries its second paragraph.

5. **OQ-4, measured in both lanes** (*measured*; sources ephemeral, recreated
   here). An 8-element array, a 3-byte image `11 22 33`, `$readmemh` with and
   without a zero-fill first:
   ```sh
   printf '11\n22\n33\n' > img.hex
   # top3.sv: logic [7:0] mem[0:7]; NO zero-fill; $readmemh(MEM_INIT_FILE, mem)
   # top4.sv: same, but preceded by  for (int i=0;i<8;i++) mem[i] = 8'h00;
   iverilog -g2012 -Ptop3.MEM_INIT_FILE=\"img.hex\" -o u1.out top3.sv && ./u1.out
   iverilog -g2012 -Ptop4.MEM_INIT_FILE=\"img.hex\" -o z1.out top4.sv && ./z1.out
   verilator --cc --exe --build --timing -GMEM_INIT_FILE='"img.hex"' top3.sv tb3.cpp \
             --top-module top3 -o Vtop3 && ./obj_dir/Vtop3
   ```
   Observed:

   | Case | Icarus 12.0 | Verilator 5.020 |
   |---|---|---|
   | No zero-fill, uncovered locations | **`xx`** | **`00`** |
   | Zero-fill then `$readmemh`, uncovered | **`00`** | **`00`** |
   | Sparse image (`@0000` … `@0006`), hole in the middle | **`xx`** | — |
   | `MEM_INIT_FILE` = missing path | non-fatal diagnostic, all-zero, **exit 0** | non-fatal warning, all-zero, **exit 0** |

   Row 1 is the divergence ADR-0018 §7.2 predicted, now observed rather than
   derived. **Row 3 is the one that changed the normative wording**: the
   uncovered set is not a suffix, so REQ-014 is phrased per location. Row 2 is
   the repair working in both lanes. Row 4 is the limitation REQ-014 names and
   does not fix.

   **The instrument proved it can fail before it was allowed to report
   agreement** (L-D11): rows 1 and 3 are the negative controls. A harness
   reporting `00` unconditionally would have shown row 2 green and the
   conclusion would have been worthless.

   **What this measures**: the `$readmemh` image mechanism, in a scratch
   harness. **It measures no design** — no RTL and no M02 exist. Same limit
   ADR-0018 §9 states for its LFSR measurement.

6. **No banned phrasing** in any of the three files (SPEC-TEMPLATE how-to-use
   item 5) (*measured*):
   `grep -n -i "as needed\|appropriately\|should normally\|obviously\|TBD" docs/specs/SPEC-P1-core-cpu.md docs/specs/requirements.md docs/adr/ADR-0018-p1-core-cpu-design-choices.md`
   → no output.

7. **No residual literal width in any port table** (*measured*):
   `awk '/^### 4\.A/,/^### 4\.3/' docs/specs/SPEC-P1-core-cpu.md | grep -E '^\| `' | grep -E '\| (5|12|8|16|128|192|4) \|'`
   → no output. The two surviving `16 × 12` occurrences (§3's invariants table,
   §6.4.4) are **verbatim quotations of README**, which is canonical over this
   document (PROTOCOL §1) and both already carry "(parameterized)".

8. **No open question blocks the freeze** (*measured*):
   `awk '/^### Open questions/,/^Per \*\*L-E10\*\*/' docs/specs/SPEC-P1-core-cpu.md | grep -o "Blocks \`P1-spec-freeze\`\|No longer blocks\|CLOSED"`
   → `CLOSED`, `No longer blocks`. No row asserts a block.

9. **Blob gate** (PROTOCOL §5, default 1000000 bytes) (*measured*): `wc -c` →
   SPEC 109610, requirements.md 16193, ADR-0018 77296. All well under.

10. **No git command was run in this unit of work.** Stated as an assertion
    about my own conduct, which is the only class of claim it can be — the
    reproducible form of it is `git reflog` and the absence of any commit
    bearing this entry, checkable by the orchestrator at commit time.

### Outcome

**DoD vs WO-0005: met on every item.**

| Task | Status |
|---|---|
| 1 — apply A-1…A-6, or decline with a reason in §13 | **Met. All six APPLIED, none declined.** Three carry additions, each named with its reason in §13.1 |
| 2 — close OQ-4 with normative text; state both lanes | **Met.** `8'h00`, REQ-014 rewritten, both lanes measured and tabulated in the requirement itself |
| 3 — reason F-5 through; say which it is | **Met. F-5 is REAL** — on an internal contradiction that needs no toolchain fact, *and* on a measurement that confirms the relay and finds one row worse than relayed |
| 4 — amend ADR-0018 if a decision moves | **Met.** Two moved, two amendments appended |
| 5 — re-open nothing dv_lead graded and closed | **Met.** No graded requirement's meaning revised; propagation edits enumerated in §13.1 so the confirmatory surface is bounded |

**Is the spec freezable?** **In my judgement yes — and the countersignature is
`dv_lead`'s to issue, not mine, which is why this is a judgement and not a
verdict.** Charter §5's preconditions: D-1 and D-2 landed at `-0002`; the
interface-check regime is ADR-0017's reviewed-port-table fallback and the
grading has been performed line by line; an ADR exists for every non-obvious
choice, including the two this round added; every REQ has a matrix row; no
open question remains unresolved. What a signer should know before signing is
**D-8** — a P1 lockstep PASS proves the RTL implements this specification and
proves nothing about whether this specification describes CHIP-8 — and
**OQ-3**, the relayed quirk defaults. Both are now in the document the gate
reads, which is what `dv_lead`'s F-11 asked for and could not itself do from
`docs/reports/dv/`.

**Handoff**: returned to the orchestrator via the packet's Return log.
`P1-spec-freeze` loses its last blocker and gains two routed carry-forwards.

**No harvest note is owed at this entry**: PROTOCOL §7.1 makes the lessons
harvest a precondition of a gate signature or an `SO-` packet, and this is
neither — it is the revision *preceding* the gate. Carrying the arithmetic
forward from `-0002`: this chain's fork-point baseline is **none**, so my
first harvest span tiles from `J-architect_docs_lead-0001` and must reach this
entry — the interval at `P1-spec-freeze` is `J-architect_docs_lead-0001..0003`
unless further entries intervene.

### Open-questions

1. **D-8 — P1 has no external anchor.** Not freeze-blocking, and it must be
   settled before `P1-module-ready`. `dv_lead`'s options are (a) add one
   free-use CHIP-8 reference to the B3 intake as a differential oracle for the
   non-draw subset, **E3**-shaped; (b) anchor piecewise against non-CHIP-8
   external truth; (c) declare NO-ANCHOR explicitly. Its recommendation is
   (a)+(b) with (c) as the fallback. **Owes a board line I cannot write**
   (`tasks/**` outside my write scope, L-E10).
2. **D-9 — fifteen `I` hooks have no named performer**, four of them over RTL
   files the countersignatory may not read. Routed to the orchestrator because
   assigning `rtl_lead` is not mine to do (charter §7). Owes a board line.
3. **NV-3's remaining fraction is `dv_lead`'s.** I measured the simulator
   flags cocotb's runner maps onto; I did **not** measure the runner itself,
   because no bench exists. Evidence 3 makes the end-to-end result very likely
   and "very likely" is not a measurement. Discharged by its first bench.

Carried unchanged: **OQ-3** (relayed VIP defaults; P4's test-ROM campaign is
the compensating control — now subsumed by D-8, which establishes the exposure
covers the whole phase). **D-3** remains `rtl_lead`'s and is untouched.
**D-7** unchanged, a P4 carry-forward. **OQ-1** is closed by `dv_lead`'s
adjudication (halt upheld — my spec's default confirmed, so no text moved) and
**OQ-2** by the orchestrator's P3 assignment.

One item that is not a question, noted a third time rather than allowed to age
into an assumption: the **L-D16 citation still does not resolve** in this
tree, and §6.3 of the spec depends on it.

### Files-in-this-commit
- docs/specs/SPEC-P1-core-cpu.md
- docs/adr/ADR-0018-p1-core-cpu-design-choices.md
- docs/specs/requirements.md
- agents/handoffs/WO-0005_p1-spec-revision.md

---

## [J-architect_docs_lead-0004] 2026-08-05T20:35Z | task:WO-0008 | Four repairs in text I added beyond the amendments: `MEM_INIT_FILE` leaves the package, and A-4's universal loses one word too many

### Trigger

Work order `agents/handoffs/WO-0008_p1-spec-repair-round-2.md`, spawn short-id
`WO-0008/2026-08-05T19:55Z`, issued by the orchestrator against `dv_lead`'s
second verdict — **NOT COUNTERSIGNED at `ddc06dc`**,
`docs/reports/dv/DV-P1-countersignature.md` at `9f4e03b`, authority
`J-dv_lead-0002`.

The shape of that verdict is the thing worth recording. All six amendments
landed and landed correctly; OQ-4's closure is right and was confirmed **by
measurement in both lanes**, not by reading; the catch I made that neither of
us had seen — A-1 and A-3 composing to reinstate F-2 — is confirmed and
credited. **Every one of the four defects is in text I added beyond the
amendments `dv_lead` wrote.** Three of the six amendments were applied *plus
something*, and three of those additions carried a defect. That is the finding
I take forward whatever else this round produced.

### Inputs

- `agents/charters/architect_docs_lead.md`; `agents/PROTOCOL.md` v2 (§3 packets,
  §4 journals, §6 write scope, §7 gates and transcription, §8 escalation
  classes, §10 evidence and provenance, §11 amendments)
- `agents/handoffs/WO-0008_p1-spec-repair-round-2.md` — §0's eight standing
  obligations bind this entry
- `docs/reports/dv/DV-P1-countersignature.md` at `9f4e03b` **in full** — §0
  verdict, §3 the amendment confirmations, §4 the three additions judged, §5
  OQ-4 graded, §6 the derived-width inventory, §7 F-5 and the silent-ignore
  presentation, **§8 the four repairs as exact text**, §9 evidence, §10 D-8,
  §11 findings B-1…B-4 and F-15…F-19, §12 the NO-VERDICT register
- `docs/specs/SPEC-P1-core-cpu.md` at `ddc06dc` — §4.A note, §4.C M03
  parameters, §4.3, §5.0 REQ-115, §5.1, §5.4, §5.5, §8, §10 registry, §11
  D-8/D-9, §13.1
- `docs/adr/ADR-0018-p1-core-cpu-design-choices.md` — header, §0, §6.5, §6.6,
  **Amendment A2 in full** (A2.1…A2.7)
- `docs/specs/requirements.md` — REQ-115's row and the count sentence, to
  establish whether the matrix needed an edit this round (it did not)
- My own `J-architect_docs_lead-0003`, for the harvest-span arithmetic it left

**No RTL read, because none exists.** No simulator run by me this round: every
toolchain fact below is `dv_lead`'s measurement, provenance **relayed**, with
the report and `J-dv_lead-0002` named as its authority (L-B01, `AUD-0002-F1`).

### Reasoning

**B-1 first, because the obvious repair is the wrong one.** The two clauses are
jointly unsatisfiable: REQ-115 requires a module parameter defaulting to its
package value, my A-5 addition names a literal default as "exactly the defect
this requirement names", and Icarus 12.0 will not bind a package `string` in a
parameter default expression at all. Two edits close it. Weakening REQ-109 is
one word of work and is wrong: it licenses a literal second copy of *every*
package value in a module header, which is the F-2 class REQ-109 was written to
prevent, so it trades a blocking defect for the defect the requirement exists
against. The other is to notice that a **filename never belonged in the
package**. §5.5 exists because ADR-0017 Consequence 1 wants values that appear
in both the RTL and the bench to have exactly one definition site *so they
cannot drift* — and a per-test input has no second copy to drift against. Its
"default" is the empty image, whose meaning REQ-014 clause 2 already fixes
normatively. `MEM_INIT_FILE` fails the membership test §5.5 applies to
everything else in it, and the tool merely made that visible.

That is why the tool bug is not the argument. I put both reasons in the spec
paragraph and the ADR, in that order, so that if a future Icarus binds package
strings the reason this parameter sits outside the package still holds.

**B-2 is the same table, one row up, and it is not a consequence of B-1.**
REQ-115 forbids a module to read `chip8_pkg::SP_W`; REQ-109 ¶1 orders every
value in that table referenced and never restated. Two normative clauses,
opposite instructions, one name. Both defects are "a value in the
single-definition-site table that has no business being there", found by two
different routes, so I recorded them as one ADR amendment with two names rather
than pretending B-2 fell out of B-1.

**B-3: restate the rule at its class.** `dv_lead` measured `obs_stack`'s width
expression failing identically to the named parameter — 48 against 192 at
`STACK_DEPTH = 4` — and the stack array's own depth is a third case, so
"`SP_W` … is the only such case in P1" is a factual claim in normative text
that is false. What makes this one instructive rather than clerical is where
the narrow version was: §4.A's note stated the general rule, and **ADR-0018
A2.2 stated the general rule too**. Only REQ-115 — the normative site, the row
the matrix cites, the text an RTL author implements against — carried the
narrow one. So the specification was narrower than the ADR that authorised it,
which is a transcription defect, and I recorded it as one in A3.4 rather than
as a decision. The asymmetry `dv_lead` flags is the part worth carrying: the
`SP_W` half fails loudly (a short-stack overflow vector faults at the wrong
call depth, a directed test goes red) and the width half fails silently (a
5-bit `obs_sp` carries 0…4 identically). A defect with a loud half and a silent
half gets diagnosed as "the loud half, now fixed", so the enumeration in §13.2
says so in the document rather than only here.

**B-4 is the one I checked before editing, because it has an E2 shape.** "At
retirement **and nowhere else**" — but no faulting instruction ever retires
(REQ-029, REQ-049), so read strictly the clause strands the five fault
conditions of §9, `dv_lead`'s 65536-encoding decode sweep, and the `mem` array.
README's signed P1 criterion is a **full architectural-state compare after
every instruction**, and narrowing a signed success criterion by a subordinate
clause is a scope change, which is the sponsor's (E2) and not mine. So the
question I had to answer first was whether the quantifier could be fixed
*without* moving scope. It could: all three comparison points are already
required by README's criterion and by REQ-029, REQ-048, REQ-049, REQ-114 and
REQ-120, so naming them **restores** the domain rather than changing it. The
edit is therefore in-role. Had it gone the other way the deliverable would have
been an escalation packet and not a diff, and I wrote that counterfactual into
§13.2 so the next reader knows the test was applied rather than skipped.

The distinction A-4's paragraph draws is right and I kept it whole: a
mid-instruction `obs_*` value is deterministic (both lanes run the same RTL) but
unspecified (§6.6 frees the register stage), so it is lane-to-lane comparable
and not model-assertable. Only the quantifier moved.

**On keeping the diff bounded, and the two places I did not.** `dv_lead`
renewed its pre-commitment conditioned on the diff being exactly these repairs,
so boundedness is a deliverable here and not a preference. Two restatements of
REQ-115 outside §5.0 are made **false** by the repairs — §4.C's "M03's
parameters" paragraph, which says every declared value defaults to its package
value, and §10's REQ-115 registry row, which says "M02 and M03" and "derived
widths". Leaving either would keep the repaired defect alive at a different
address, which is precisely the failure §13.1 named last round when it
propagated A-1 beyond the amendment list. I made both edits minimal (one
parenthetical; one description column, hook column untouched so §10 stays
byte-identical to the matrix on the column `dv_lead` diffed mechanically) and
gave them their own heading in §13.2 so the confirmatory surface stays a list.

**F-17 I corrected by appending, not by editing.** §13.1 says the matrix "gains
the corresponding row (REQ-124)"; the row added was REQ-115. §13.1 is a record
of a past round, and rewriting a record to make it right is the failure mode
L-A04 exists against — so the correction sits in §13.2's own list of findings
not repaired by edit, with the reason.

**Why §13.2 exists at all.** §13.1's enumeration is what let `dv_lead` bound
its confirmatory pass by a list rather than by a diff hunt, and it is why round
two cost one pass instead of a re-grade. It also flagged my own three additions
so they were *graded rather than discovered* — which is the only reason B-1 was
caught before RTL existed. The enumeration cost me a section and bought the
program a review round; I wrote §13.2 the same way, including the two
propagation sites and the dispositions of the findings I did not repair.

**One decision moved and it is ADR'd by appending.** A2.2 named
`MEM_INIT_FILE` among the values "defaulting to its `chip8_pkg` value", and
after B-1 that is no longer true of it — so B-1 is not merely a text repair.
**A2.7's own falsifier is what fired**, which is the outcome a falsifier is for,
and I said so in A3 rather than presenting the amendment as a tidy-up. A3
carries four losing alternatives with their costs — including weakening REQ-109,
recorded as a *losing* alternative precisely so the temptation is on the record
rather than merely resisted, and the accessor-function form, measured to abort
the tool — and its own falsifier. B-2 is a consequence of A2.4, which stands
entirely. B-3 moves nothing: the spec moved to the ADR. B-4 moves nothing:
ADR-0018 does not contain the "and nowhere else" universal, so the defect is
confined to the spec — I checked §6.5 and §6.6 for it rather than assuming.

I also appended a header bullet naming A3 rather than editing the bullet that
names A1 and A2, for the same reason A3 is appended.

### Actions

- `docs/specs/SPEC-P1-core-cpu.md`:
  - **B-1** — §5.5 *Other* row loses `MEM_INIT_FILE` and its §5.4 pointer; §5.5
    gains the "deliberately not a package value" paragraph; REQ-115 ¶1 gains the
    exception clause and the literal default `""`.
  - **B-2** — §5.5 *Widths and sizes* row loses `SP_W`; its value cell states
    why, with the measurement, and points at §5.1 as the sole derivation site.
  - **B-3** — REQ-115 ¶2 restated at its class (any parameter, width expression
    or array bound; all three P1 cases named); REQ-115 ¶1 now names M01, M02,
    M03 and M04 with "those … that they use — M03 declares all of them",
    closing F-16.
  - **B-4** — §8's "Two comparisons, two domains" paragraph now names three
    comparison points; A-4's distinction preserved verbatim.
  - **D-8's *Closes by* cell** → "**Before the first P1 `SO-` PASS**, which
    precedes `P1-module-ready` — **not** the freeze" (F-18).
  - **Propagation** — §4.C's M03-parameters paragraph (one parenthetical);
    §10's REQ-115 registry row, description column only.
  - **§13.2 added** — this round's enumeration: the four dispositions, the two
    propagation sites and why they are not creep, the bounded extras, the
    findings not repaired (F-15, F-16, F-17, F-19) with reasons, and the E2
    counterfactual for B-4.
- `docs/adr/ADR-0018-p1-core-cpu-design-choices.md`: **Amendment A3** appended
  (A3.1 what was measured and what it broke; A3.2 the decision; A3.3 four
  losing alternatives; A3.4 what did not move; A3.5 consequences; A3.6
  falsifier), plus one appended header bullet naming it.
- `agents/handoffs/WO-0008_p1-spec-repair-round-2.md`: Return log, state
  RETURNED, carrying the four dispositions, the ADR movement, and an exact
  statement of what else is in the diff.
- **Not touched**: `docs/specs/requirements.md` (no matrix edit owed — REQ-115's
  row carries id, sections and hook, no description, and the hook did not
  change); §13.1; anything under `rtl/**` or `test/**`, including `dv_lead`'s
  spike harness at `test/spikes/`.

### Evidence

**Provenance, stated first (L-B01, WO §0.7).** Every toolchain measurement
cited in the spec and ADR text this round is **relayed** from
`docs/reports/dv/DV-P1-countersignature.md` §9 at `9f4e03b`, authority
`J-dv_lead-0002` — the `Unable to bind variable` error and its exit code, the
accessor-function abort at exit 134, the four types that do work, `SP_W` 3
against 5, and `obs_stack` 48 against 192. **I ran no simulator this round.**
Where the spec quotes a measurement it names it as measured *by that report*,
not by this file.

The document-level claims below are **measured**, from a checkout at this
commit:

1. Neither name survives in §5.5's table:
   ```
   $ sed -n '/^| Group | Names | Value/,/^| Other/p' docs/specs/SPEC-P1-core-cpu.md \
       | grep -c 'MEM_INIT_FILE'      → 0
   $ sed -n '/^| Group | Names | Value/,/^| Other/p' docs/specs/SPEC-P1-core-cpu.md \
       | grep -o '`SP_W`, ' | wc -l   → 0
   ```
2. The false parenthetical survives only as a quotation convicting it:
   ```
   $ grep -n 'only such case in P1' docs/specs/SPEC-P1-core-cpu.md
   1565: | **B-3** | REQ-115's parenthetical "…" is measurably false: …
   ```
   — one hit, inside §13.2's disposition table. No normative site carries it.
3. The repaired universal, and no stranded one:
   ```
   $ grep -n 'nowhere else' docs/specs/SPEC-P1-core-cpu.md
   1071: `S_FETCH_HI`, and nowhere else**, …          # §7, unrelated clause, untouched
   1169: … it happens at three points and nowhere else — at retirement, …
   1566: … quoting the old clause in §13.2's B-4 row
   ```
4. No requirement added, withdrawn or renumbered, and the matrix still tiles:
   ```
   $ grep -o '^| REQ-[0-9]*' docs/specs/SPEC-P1-core-cpu.md | sort -u | wc -l      → 91
   $ grep -o '^| \*\*REQ-[0-9]*\*\*' docs/specs/requirements.md | sort -u | wc -l  → 91
   ```
5. Diff size, for the boundedness claim:
   ```
   $ git diff --stat
    docs/adr/ADR-0018-p1-core-cpu-design-choices.md | 122 +++++
    docs/specs/SPEC-P1-core-cpu.md                  | 138 ++++++---
   ```
   with `agents/handoffs/WO-0008_p1-spec-repair-round-2.md` appended after that
   snapshot. The spec's 15 deleted lines are the six repaired passages and
   nothing else; the rest is §13.2 and the two propagation sites.

**No interface compile-check evidence is cited or owed** — ADR-0017 Consequence
1 puts this program in the reviewed-port-table fallback regime, and this
revision moves no port table row.

### Outcome

**DoD met.** B-1…B-4 each **repaired**, none declined; D-8's *Closes by* cell
corrected; §13.2 enumerates this round's edits as §13.1 did. `ADR-0018`
amended by appending because B-1 moved A2.2's enumeration. Journal entry
appended; Return log written; the packet is **RETURNED** to the orchestrator.

`dv_lead`'s renewed pre-commitment is that a revision whose diff is exactly
these repairs needs no further review round, and the countersignature then
issues as `J-dv_lead-0003`. **Whether this diff qualifies is `dv_lead`'s call,
not mine** — I have made the diff and enumerated it; I have not graded it. Spec
§12's two signature rows stay empty and D-6 stays open until that entry exists.

**Harvest note (PROTOCOL §7.1, charter §3).** Not a harvest round — this is the
revision preceding the gate, and no gate signature or `SO-` packet is being
issued. Carrying the arithmetic forward from `-0003`: my chain's fork-point
baseline is **none**, so the first harvest span at `P1-spec-freeze` is
`J-architect_docs_lead-0001..0004`, extended by this entry, unless further
entries intervene. Recorded so the tiling stays exact and a skipped harvest
would show as arithmetic rather than as silence.

**One candidate I am carrying rather than minting, so it is not lost.** Two
rounds running, the defects in my work were in text I added *beyond* the
amendment I was applying, and both rounds the additions were caught only
because I enumerated them for the reviewer. The rule that wants writing is
about the party applying a repair enumerating its own additions — but
`dv_lead` has already minted exactly that as **LC-05** at `J-dv_lead-0002`,
from the other side of the same incident. Independent re-derivation of a
candidate already in the pipeline is **recurrence evidence**
(`docs/FEDERATION.md` §8), not a second candidate, so I record it as
recurrence against LC-05 and mint nothing. The count matters: at the third
independent arrival that entry opens a promotion obligation.

### Open-questions

1. **D-8's deadline is now tighter than the last return implied.** Its *Closes
   by* cell reads **before the first P1 `SO-` PASS**, which precedes
   `P1-module-ready` — the interval between them is exactly the window in which
   every P1 sign-off is written. It still **owes a board line I cannot write**
   (`tasks/**` outside my write scope, L-E10), and the line now carries the
   earlier deadline.
2. **D-9 — fifteen `I` hooks have no named performer**, four over RTL files the
   countersignatory may not read. Routed to the orchestrator; assigning
   `rtl_lead` is not mine to do (charter §7). Owes a board line.
3. **NV-4 is new and is `dv_lead`'s** (`DV-P1-countersignature.md` §12):
   `COCOTB_RESOLVE_X=ZEROS` silently resolves an `X` to zero, turning the
   authoritative four-state lane two-state for every X-related check in the
   program, and nothing in this repository pins it today. Not a spec defect —
   REQ-014's L-F03 paragraph correctly names the performer — but it is a
   silently-always-pass hazard in the instrument that a signer should know
   exists, and its guard is `dv_lead`'s §7.3 item 4.
4. **F-15 is a cost, not a defect, and someone must choose.** Verilator refuses
   an enum-typed parameter from the command line without `-Wno-ENUMVALUE
   -Wno-WIDTHTRUNC`, and four of REQ-095's six connectivity vectors set
   enum-typed quirk parameters. §5.2 types the *package* enum and REQ-115 does
   not constrain the module parameter's declared type, so the choice — global
   waivers that suppress a real type check, or 2-bit `logic` parameters with a
   cast inside — is `rtl_lead`'s and `dv_lead`'s. No spec change owed.

Carried unchanged: **OQ-3** (relayed VIP defaults, subsumed by D-8); **D-3**
(`rtl/chip8_pkg.sv`, `rtl_lead`'s, untouched — and §5.5's normative content is
two names shorter than it was, which is a change to what that file must
contain); **D-7**, a P4 carry-forward. **OQ-1** and **OQ-2** remain closed.

Noted a fourth time rather than allowed to age into an assumption: the
**L-D16 citation still does not resolve** in this tree, and §6.3 of the spec
depends on it.

### Files-in-this-commit
- docs/specs/SPEC-P1-core-cpu.md
- docs/adr/ADR-0018-p1-core-cpu-design-choices.md
- agents/handoffs/WO-0008_p1-spec-repair-round-2.md
