# Gate: P1-spec-freeze

Closes when all Phase-1 module specifications are FROZEN and the sponsor
signs. A spec is FROZEN only with (a) interface-check evidence per the regime
the M1 toolchain ADR recorded — here the **fallback regime**, a line-by-line
reviewed port table (ADR-0017 Consequence 1; SPEC-TEMPLATE §4.1) — and (b) a
`dv_lead` testability countersignature for that spec (PROTOCOL §7).

## Prerequisites

| # | Item | Evidence |
|---|---|---|
| 1 | Toolchain lane decided and its named risk retired by measurement | [ADR-0017](../adr/ADR-0017-toolchain-lane.md) ACCEPTED (E3, `J-orchestrator-0047`); risk **R1** retired at `J-orchestrator-0048` — cocotb 1.9.2 measured green against **both** Icarus 12.0 and Verilator 5.020. Pins committed: `requirements.txt`, `TOOLCHAIN.md` |
| 2 | Interface-check lane | **Not applicable, by decision.** ADR-0017 Consequence 1 chose reviewed port tables over compile-checked records because the synthesis half of the lane has uneven SystemVerilog support. There is **no compile-check CI run for this program and none is owed** — the compensating control is the line-by-line countersignature below, which is the entire reason the weaker regime is defensible |
| 3 | `dv_lead` testability review of the requirements corpus, before this checklist opened | **WO-0004** → NOT COUNTERSIGNED at `54a7221`, six amendments · **WO-0005** → all six applied, OQ-4 closed · **WO-0007** → NOT COUNTERSIGNED at `ddc06dc`, four defects in the added text · **WO-0008** → all four repaired, diff bounded · **WO-0009** → **COUNTERSIGNED at `b9fd9c6`** |

## Requirements testability countersignature

Transcribed by the orchestrator under PROTOCOL §7. The signature's authority
is `J-dv_lead-0003`, which states the act itself; this transcription is
clerical (L-E02).

> **I sign gate `P1-spec-freeze`, row "dv_lead countersigns testability":
> COUNTERSIGNED at `b9fd9c6`** (PROTOCOL §7, L-E03 — a signature's authority
> is this entry, and this entry states the signature).
> — `dv_lead`, journal `J-dv_lead-0003` (WO-0009), transcribed by the
> orchestrator 2026-08-05.

Report: [`DV-P1-countersignature-final.md`](../reports/dv/DV-P1-countersignature-final.md).
This closes spec §11's **D-6**.

## Per-batch freeze record

| Batch | Specs | Drafted at | Interface-check evidence | dv countersign | FROZEN at |
|---|---|---|---|---|---|
| A | [`SPEC-P1-core-cpu`](../specs/SPEC-P1-core-cpu.md) — 91 REQ ids, 8-state multicycle FSM, all 65536 encodings partitioned, 5 quirk parameters | `54a7221` (WO-0002), revised `ddc06dc` (WO-0005), repaired `b9fd9c6` (WO-0008) | **Reviewed port table** — 30 distinct ports across M01/M02/M04 plus M03, graded on signal, direction, width and meaning (`J-dv_lead-0001`, re-confirmed `J-dv_lead-0003`) | **SIGNED** (`J-dv_lead-0003`) | **FROZEN at `b9fd9c6`** — pending sponsor signature S1 |

### Batch countersignature (transcribed)

> "I countersign batch A (`SPEC-P1-core-cpu`) for `P1-spec-freeze` at
> `b9fd9c6`." — `dv_lead`, journal `J-dv_lead-0003` (WO-0009), transcribed by
> the orchestrator 2026-08-05.

**Three gradings, two rejections, one signature.** The verdict history is
recorded because it is the evidence the countersignature means something: a
lane that signs on first presentation has not demonstrated it can withhold.

## Carry-forward ledger

Ids are permanent. A closed row keeps its number and its row; closure is
recorded in place, because countersignatures and work-order logs cite these
numbers and a renumbered table makes those citations lie.

| id | Item | Must land before | Status |
|---|---|---|---|
| C-1 | **F-20** — a third restatement of REQ-115 in §5.5's REQ-109 scope block ("each *defaults to* its package value") is false of `MEM_INIT_FILE` after B-1, while §13.2 asserts no other restatement exists. Exact replacement text pre-approved at report §7.3 and explicitly **not** a signature condition. Origin disclosed by `dv_lead` as its own §8 omission — it covered three sites where B-1's defect statement named four | The first RTL work order | **OPEN** |
| C-2 | **D-3** — `rtl/chip8_pkg.sv` must be authored to match spec §5.5 exactly and add nothing | The first RTL work order | **OPEN** — `rtl_lead`'s; `rtl/**` is outside the architect's write scope |
| C-3 | **D-8** — P1 has no external anchor: a P1 PASS proves the RTL implements *this specification* and nothing about whether the specification describes CHIP-8. Options are **E3**-shaped | **Before the first `SO-` PASS** (cell corrected this round at `dv_lead`'s request) | **OPEN** — orchestrator |
| C-4 | **D-9** — fifteen `I` hooks have no named performer; four are over RTL the countersignatory may not read | The first RTL work order | **OPEN** — orchestrator to assign |
| C-5 | **F-15** — Verilator refuses enum-typed overrides without `-Wno-ENUMVALUE`; four of REQ-095's six vectors need them. A type choice, not a spec defect | The first RTL work order | **OPEN** — `rtl_lead` + `dv_lead` |
| C-6 | **F-19** — four parameter-loading guards. All four ways a P1 test can end up running 4096 zero bytes print something and none fails the run, so **the guard cannot be log-based** | First bench commit | **OPEN** — `dv_lead` |
| C-7 | **The X-policy guard** — `COCOTB_RESOLVE_X=ZEROS` silently resolves X, turning the four-state authoritative lane into a second two-state lane for every X-related check in the program. Nothing pins it today | First bench commit | **OPEN** — `dv_lead` |
| C-8 | **NV-2** (now carrying the 4096-element read cost) and **NV-4** (what X-policy CI provides) | First bench commit | **OPEN** — `dv_lead` |
| C-9 | **F-21, F-22** — attack-plan rows raised by `dv_lead` against its own campaign | First attack plan | **OPEN** — `dv_lead` |
| C-10 | **D-7** — the quirk-parameter set may be short by one: unknown-opcode handling is divergent across the population, and README's P4 row requires *every* divergent behaviour to be a parameter. The reading is arguable and the settling evidence does not exist before P4 | `P4-spec-freeze` | **OPEN** — architect |
| C-11 | **§8.3 of the final countersignature report must reach the auditor** — the accepted form of ADR-0018 A3.4, so the two lanes read requirement-versus-ADR divergence the same way before P3 | The next audit cycle | **OPEN** — orchestrator |

## Lessons harvest

<!-- Instantiated per PROTOCOL §7.1. This gate is sponsor-signed (S1), so
     the block runs the automatic org-generic landing under that signature
     and records the sponsor's one outer-hop yes/no beside it. -->

### Lessons harvest — P1-spec-freeze

#### Span record

Spans tile from each chain's previous harvest `to` + 1. G0's harvest covered
`J-orchestrator-0040..0040`; the four other chains were idle at G0 and take
their first harvest here, tiling from their fork-point baseline of *none* —
so from `0001`.

| Journal chain | Miner | Span | Tiles with | Harvest note | Yield |
|---|---|---|---|---|---|
| `J-orchestrator` | `orchestrator` | `J-orchestrator-0041..0058` | `G0` · `0040` | `J-orchestrator-0058` | _to be recorded at signature_ |
| `J-architect_docs_lead` | `architect_docs_lead` | `J-architect_docs_lead-0001..0004` | first harvest (baseline none) | _owed_ | _to be recorded at signature_ |
| `J-dv_lead` | `dv_lead` | `J-dv_lead-0001..0003` | first harvest (baseline none) | _owed_ | _to be recorded at signature_ |
| `J-auditor` | `auditor` | `J-auditor-0001..0002` | first harvest (baseline none) | _owed_ | _to be recorded at signature_ |
| `J-rtl_lead` | `rtl_lead` | `(idle)` | first harvest (baseline none) | — | NIL |

**Recurrence already on the record**: `architect_docs_lead` declined to mint a
second candidate for "two rounds running, my defects were in text added beyond
the amendment being applied" — `dv_lead` had already minted that rule as
**LC-05** from the other side of the same incident, so it recorded independent
re-derivation as **recurrence evidence against LC-05** rather than a duplicate
(`docs/FEDERATION.md` §8). At the **third** independent arrival that entry
opens a promotion obligation.

#### Preconditions

- [ ] Every active chain has a span row, and spans tile by arithmetic
- [ ] Every yield cell carries candidate ids or a declared NIL
- [ ] Every candidate dispositioned exactly once; war stories name their
      failed criterion
- [ ] Export packet produced, or NONE declared
- [ ] Transmission recorded: the org-generic landing under this gate's
      signature, plus the sponsor's outer-hop yes/no

**The harvest is not complete.** It opens with this checklist and is
collated at the signature — the mining rounds run once the sponsor's decision
on S1 exists, because the landing rides that signature and never precedes it.

## Sponsor items

| # | Item | Status | Signature |
|---|---|---|---|
| S1 | Sponsor reviews the freeze summary (batches, carry-forwards, post-freeze change policy) and signs the gate (escalation class **E1**) | **OPEN** | _<sponsor approval date, recorded in `J-orchestrator-NNNN`>_ |

### What a signer should know first

Named by both the architect and `dv_lead`, and placed in the specification
itself rather than in a verification report so that the gate reads it:

**C-3 / D-8 — P1 has no external anchor.** A P1 PASS proves the RTL
implements this specification. It proves *nothing* about whether this
specification describes CHIP-8. The RTL and the Python golden model both
derive from this document, so they would agree with each other about any
error it contains. The compensating control is external by necessity and
lands three phases later: P4's community test-ROM campaign. Signing the
freeze is signing that the specification is *internally* sound and testable,
which is what three gradings established — not that it is faithful to the
platform.

## Exit

All batches FROZEN, all countersignatures transcribed, every carry-forward
row carrying a named landing site, harvest block complete, sponsor signed →
the orchestrator declares the gate passed in its journal and updates
`tasks/BOARD.md`. Post-freeze changes to any frozen §4/§6/§7 are a spec diff
plus an ADR, recorded in the spec's §13.
