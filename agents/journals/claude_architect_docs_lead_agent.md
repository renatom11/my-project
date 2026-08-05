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
