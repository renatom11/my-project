# Requirements register and traceability matrix

- **Owner**: `architect_docs_lead` (charter §3 — "you own the matrix file";
  `dv_lead` supplies the test-side columns).
- **Landed**: 2026-08-05, `J-architect_docs_lead-0002`, discharging
  `SPEC-P1-core-cpu.md` §11 deferred item **D-1** under
  `agents/handoffs/WO-0003_p1-design-rationale-adr.md`.
- **Covers**: P1 (REQ-001 … REQ-124, the 91 ids enumerated below — 90 at the
  spec's `54a7221` draft plus **REQ-115**, added by the WO-0005 revision under
  `dv_lead` amendment A-3). P2–P5 blocks
  are added by their own phases' spec work; this file is the program-wide
  register and grows with the program.

---

## 1. What this file is, and what it is not

**It is an index.** Each row cites a requirement by id, names the specification
section that states it normatively, and carries the verification bookkeeping
against it.

**It is not a source.** The normative text of every `REQ-###` lives in exactly
one place — its spec section — and the authoritative registry for P1 is
**`docs/specs/SPEC-P1-core-cpu.md` §10**. This file deliberately carries **no
column restating what a requirement says**, because a requirement stated in two
places is a requirement that will diverge, and the divergence would be silent:
nothing here can fail if the two copies disagree. If you want to know what
`REQ-046` requires, read §9 of the spec. If you want to know whether it is
tested, read the row below.

**It mints no requirement ids.** No `REQ-###` originates in this file, and
none ever will. Requirements are created by a specification, at a freeze; this
file follows them. In particular there is still **no programme-invariant REQ
block** — the program's cross-cutting invariants are cited at their canonical
home (README.md's phase table and the scope-parameter paragraph beneath it,
PROTOCOL §1), exactly as `SPEC-P1-core-cpu.md` §3 does. Minting ids for them
would be a scope act (**E2**), not a bookkeeping one.

## 2. Id allocation policy

- Ids are **allocated in blocks per subject**, and the gaps between blocks are
  **permanent reserve**. **No id inside a gap has ever existed.** A later
  in-block insertion therefore never renumbers a cited id.
- **Ids are never reused and never renumbered.** A requirement that is deleted
  keeps its id, marked withdrawn with the ADR that withdrew it; the id does not
  return to the pool.
- The P1 blocks, as allocated by `SPEC-P1-core-cpu.md`:

  | Block | Subject | Spec home |
  |---|---|---|
  | REQ-001 … REQ-014 | Architectural state, memory map, reset, wrap rules | §6.1.1, §5.4, §7.5 |
  | REQ-020 … REQ-030 | Control FSM, cycle counts, retire contract | §6.2, §7.1, §7.7 |
  | REQ-040 … REQ-049 | Decode classification and fault behaviour | §6.3, §9 |
  | REQ-060 … REQ-087 | Instruction semantics | §6.4 |
  | REQ-090 … REQ-096 | Quirk parameters | §5.2 |
  | REQ-100 … REQ-115 | Module inventory, interfaces, observation, shared package, the override path | §4, §5.0, §5.5 |
  | REQ-120 … REQ-124 | Verification obligations and closure clauses | §4.C, §8, §10 |

## 3. Columns — who writes each, and when

| Column | Written by | When | Meaning |
|---|---|---|---|
| **REQ** | `architect_docs_lead` | At the spec's freeze | The id. Cited, never restated. |
| **Spec §** | `architect_docs_lead` | At the spec's freeze | The section of `SPEC-P1-core-cpu.md` that states it normatively. Follow the citation for the text. |
| **Hook** | `architect_docs_lead`, reviewable by `dv_lead` | At the spec's freeze | The *intended* verification means (legend below). A proposal, not a commitment: `dv_lead` may discharge a requirement by a different means and record it in the Test-ids column. |
| **Test ids** | **`dv_lead`** | From the testability countersignature onward; complete before `P1-module-ready` | The test(s) that discharge the requirement. Empty today for every row — no test exists, because no RTL exists. |
| **Evidence** | **`dv_lead`** | At each `SO-` sign-off | Where the passing result is recorded — the `SO-` packet and the CI run that carries it. Never a local build (PROTOCOL §10). |

**Hook legend** (identical to `SPEC-P1-core-cpu.md` §10, which is its
definition site):

- **D** — directed vector
- **R** — constrained-random stream with full-state compare at every retirement
- **F** — formal property (P4)
- **S** — structural: guaranteed by the interface or a construction rule, and
  **not assertable by a bench**
- **I** — inspection, at the countersignature or at review

**An `S` or `I` row is discharged by a named human-readable act, not by a test
id**, and its Test-ids cell records that act's journal entry or packet — a
countersignature entry, a review verdict. Leaving such a row empty because "it
has no test" is how a structural requirement quietly goes unchecked.

## 4. Fill discipline

1. **Every row is filled before `P1-module-ready`** (charter §6: every
   `REQ-###` has a matrix row before its module's `P<n>-module-ready` gate).
   Today every Test-ids and Evidence cell is `_(unfilled)_`, and that is the
   honest state: this file is landed at spec time so that DV fills it as tests
   are written, not backfilled at the gate.
2. **A test that cites no REQ is visible here by its absence.** This is the
   mechanism that makes a structural test — one asserting on something the
   specification deliberately leaves unconstrained — inspectable rather than
   invisible (ADR-0018 §6.6). It is **PROSE**: nothing refuses an uncited test.
   The controls are the `dv_lead` countersignature and auditor sampling for
   spec drift.
3. **A row whose cited section no longer exists is a defect in this file**, not
   in the spec. The completeness check in §6 catches added and removed ids; it
   does **not** catch a section rename, which is caught at review.
4. **No count is load-bearing here.** The table is the enumeration (L-D12); any
   sentence stating a total is a reading of it and may go stale.

## 5. Matrix — P1

Rows are in id order. Group headings name the block; they are structural
labels, **not** statements of what any requirement says.

| REQ | Spec § | Hook | Test ids | Evidence |
|---|---|---|---|---|
| **Architectural state, memory map, reset (§6.1.1, §5.4, §7.5)** | | | | |
| **REQ-001** | §4.B, §6.2 | S + D (M01) | _(unfilled)_ | _(unfilled)_ |
| **REQ-002** | §6.1.1 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-003** | §6.1.1 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-004** | §6.1.1 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-005** | §6.1.1, §6.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-006** | §6.1.1, §6.4.4 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-007** | §6.1.1 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-008** | §6.1.1, §7.5 | D (Icarus lane) | _(unfilled)_ | _(unfilled)_ |
| **REQ-009** | §6.1.1, §7.5 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-010** | §6.1.1 | D + F | _(unfilled)_ | _(unfilled)_ |
| **REQ-011** | §6.1.1 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-012** | §6.1.1, §6.5 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-013** | §6.1.1 | I + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-014** | §6.1.1, §5.4 | D | _(unfilled)_ | _(unfilled)_ |
| | | | | |
| **Control FSM, cycle counts, retire contract (§6.2, §7.1, §7.7)** | | | | |
| **REQ-020** | §6.2 | D, via REQ-028 | _(unfilled)_ | _(unfilled)_ |
| **REQ-021** | §6.2 | D (M01) | _(unfilled)_ | _(unfilled)_ |
| **REQ-022** | §6.2 | D (M01) | _(unfilled)_ | _(unfilled)_ |
| **REQ-023** | §6.2 | D (M01) | _(unfilled)_ | _(unfilled)_ |
| **REQ-024** | §6.2 | D (M01) + D | _(unfilled)_ | _(unfilled)_ |
| **REQ-025** | §6.2 | D (M01) | _(unfilled)_ | _(unfilled)_ |
| **REQ-026** | §6.2 | D (M01) | _(unfilled)_ | _(unfilled)_ |
| **REQ-027** | §6.2, §9 | D + F | _(unfilled)_ | _(unfilled)_ |
| **REQ-028** | §7.1 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-029** | §7.7 | D + S | _(unfilled)_ | _(unfilled)_ |
| **REQ-030** | §6.2 | D (M01) | _(unfilled)_ | _(unfilled)_ |
| | | | | |
| **Decode classification and fault behaviour (§6.3, §9)** | | | | |
| **REQ-040** | §6.3 | D + F | _(unfilled)_ | _(unfilled)_ |
| **REQ-041** | §6.3, §9 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-042** | §6.3, §9 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-043** | §6.3 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-044** | §9 | D + F | _(unfilled)_ | _(unfilled)_ |
| **REQ-045** | §9 | D + F | _(unfilled)_ | _(unfilled)_ |
| **REQ-046** | §9 | D + F | _(unfilled)_ | _(unfilled)_ |
| **REQ-047** | §9 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-048** | §9 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-049** | §6.3, §9 | D | _(unfilled)_ | _(unfilled)_ |
| | | | | |
| **Instruction semantics (§6.4)** | | | | |
| **REQ-060** | §6.4.1 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-061** | §6.4.1 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-062** | §6.4.1 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-063** | §6.4.1 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-064** | §6.4.1 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-065** | §6.4.1 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-066** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-067** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-068** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-069** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-070** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-071** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-072** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-073** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-074** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-075** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-076** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-077** | §6.4.1 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-078** | §6.4.3 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-079** | §6.4.1 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-080** | §6.4.2, §6.5 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-081** | §6.4.3 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-082** | §6.4.3 | D + D (M01) for the ordering clause | _(unfilled)_ | _(unfilled)_ |
| **REQ-083** | §6.4.3 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-084** | §6.4.3 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-085** | §6.4.2 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-086** | §6.4.1, §7.1 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-087** | §6.4.2 | D + R | _(unfilled)_ | _(unfilled)_ |
| | | | | |
| **Quirk parameters (§5.2)** | | | | |
| **REQ-090** | §5.2 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-091** | §5.2 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-092** | §5.2 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-093** | §5.2 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-094** | §5.2 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-095** | §5.2 | D + I | _(unfilled)_ | _(unfilled)_ |
| **REQ-096** | §4.3, §5.2 | S + I | _(unfilled)_ | _(unfilled)_ |
| | | | | |
| **Module inventory, interfaces, observation, shared package (§4, §5.5)** | | | | |
| **REQ-100** | §4.0 | I | _(unfilled)_ | _(unfilled)_ |
| **REQ-101** | §4.B | S | _(unfilled)_ | _(unfilled)_ |
| **REQ-102** | §4.B, §7.4 | D (M02) | _(unfilled)_ | _(unfilled)_ |
| **REQ-103** | §6.5 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-104** | §6.5 | D + R | _(unfilled)_ | _(unfilled)_ |
| **REQ-105** | §4.A, §4.C | S + D | _(unfilled)_ | _(unfilled)_ |
| **REQ-106** | §4.C | I | _(unfilled)_ | _(unfilled)_ |
| **REQ-107** | §5.5 | I | _(unfilled)_ | _(unfilled)_ |
| **REQ-108** | §5.5 | I | _(unfilled)_ | _(unfilled)_ |
| **REQ-109** | §5.5 | I | _(unfilled)_ | _(unfilled)_ |
| **REQ-110** | §5.5, §9 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-111** | §5.3, §7.7 | I | _(unfilled)_ | _(unfilled)_ |
| **REQ-112** | §4.A–§4.D | I | _(unfilled)_ | _(unfilled)_ |
| **REQ-113** | §5.3 | D (M01) | _(unfilled)_ | _(unfilled)_ |
| **REQ-114** | §4.C | S + I | _(unfilled)_ | _(unfilled)_ |
| **REQ-115** | §5.0, §4.3, §4.C | S + D | _(unfilled)_ | _(unfilled)_ |
| | | | | |
| **Verification obligations and closure clauses (§4.C, §8, §10)** | | | | |
| **REQ-120** | §4.C, §7.7 | S | _(unfilled)_ | _(unfilled)_ |
| **REQ-121** | §4.A, §7.7 | D | _(unfilled)_ | _(unfilled)_ |
| **REQ-122** | §8 | I | _(unfilled)_ | _(unfilled)_ |
| **REQ-123** | §8 | R | _(unfilled)_ | _(unfilled)_ |
| **REQ-124** | §10, §11 D-1 (landed) | I | _(unfilled)_ | _(unfilled)_ |

## 6. Completeness check

The matrix and the spec's own registry must contain **exactly** the same ids —
no more, no less. The check is a two-way `diff`, so it fails both on a
requirement the matrix has forgotten and on a row the matrix has invented.
Runnable from a repository checkout at this commit (provenance **measured** in
`J-architect_docs_lead-0002`):

```sh
diff \
  <(awk '/^## 10\. REQ coverage/,/^## 11\./' docs/specs/SPEC-P1-core-cpu.md \
    | grep -o '^| REQ-[0-9]\{3\}' | sed 's/| //' | sort -u) \
  <(awk '/^## 5\. Matrix — P1/,/^## 6\./' docs/specs/requirements.md \
    | grep -o '^| \*\*REQ-[0-9]\{3\}\*\*' | grep -o 'REQ-[0-9]\{3\}' | sort -u)
```

Empty output is the pass. This is a **PROSE** control today: it is a command in
a document, not a CI step, and nothing refuses a commit that leaves the two
out of step. Wiring it into the build is `orchestrator` work (`scripts/**` and
`.github/**` are outside this author's write scope, PROTOCOL §6) and is not
requested here — the matrix's currency is a charter §6 evaluation criterion
checked by the auditor, and a machine backstop would be an improvement, not a
prerequisite.

## 7. Open items against this file

- ~~**OQ-4** blocks `P1-spec-freeze`…~~ **✅ CLOSED 2026-08-05** by the WO-0005
  spec revision (`J-architect_docs_lead-0003`). REQ-014 now specifies all 4096
  locations at time zero for every value of `MEM_INIT_FILE`, so **REQ-123's
  row below is no longer citing a requirement its spec section fails to
  discharge**. The note is marked rather than deleted (L-A04) so the interval
  during which the row was known-weak stays on the record.
- **Every Test-ids and Evidence cell is empty.** No RTL and no bench exist;
  this is the expected state at spec time, not an omission.
- ~~**The Hook column is a proposal.**~~ **Graded 2026-08-05** at
  `docs/reports/dv/DV-P1-testability.md`, and the hooks above are the
  **post-grading** column: `dv_lead` found that nine requirements assert
  memory-port behaviour invisible at the M03 DUT boundary and that five of
  them carried a hook naming a check which could not perform the observation
  (its F-1, F-7, F-8). Those cells are corrected here and in the spec's §10,
  which remains authoritative; a `(M01)`/`(M02)`/`(M04)` annotation marks a row
  bound at that module's own boundary rather than at the DUT's. `dv_lead` may
  still discharge any requirement by a different means.
- **Fifteen `I` hooks have no named performer** (`DV-P1-testability.md` F-6;
  spec §11 D-9). For REQ-100/107/108/112 the object of inspection is an RTL
  file, which the countersignatory's charter bars it from reviewing. Routed to
  the orchestrator; until it is answered, an `I` in the column above is a
  claimed control with no performer named anywhere.

## 8. Related artifacts

| Artifact | Relationship |
|---|---|
| `docs/specs/SPEC-P1-core-cpu.md` §10 | The authoritative P1 registry. This file indexes it and never restates it. |
| `docs/adr/ADR-0018-p1-core-cpu-design-choices.md` | Why five of the requirements below say what they say; §6.6 explains what this matrix is load-bearing for. |
| `docs/adr/ADR-0017-toolchain-lane.md` | Consequence 1 puts this program in the reviewed-port-table regime, so there is **no** interface-compile evidence column here and none is owed. |
| `agents/handoffs/SO-*.md` (future) | Each sign-off cites the rows it discharges; the Evidence column points back at it. |
| `docs/gates/P1-spec-freeze-checklist.md` (to be instantiated) | Carries D-1's closure row, discharged by this file. |
