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
