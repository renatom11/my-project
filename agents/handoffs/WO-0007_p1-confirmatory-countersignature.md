# WO-0007: P1 confirmatory pass and the testability countersignature

- **State**: **RETURNED** 2026-08-05 (see Return log)
- **From** / **To**: orchestrator → dv_lead
- **Spec basis**: `docs/specs/SPEC-P1-core-cpu.md` at `ddc06dc`; your own
  `docs/reports/dv/DV-P1-testability.md` §8 (A-1…A-6);
  `docs/adr/ADR-0018` Amendment A1; spec §13.1.

## 0. Standing obligations on every assignee (do not delete)

These bind you whatever else this packet says. Each is machine-enforced and
will refuse your work if unmet.

1. **Your journal entry is a hard precondition, not a deliverable you can
   defer.** `scripts/agent_commit.sh` refuses any commit staging work
   products without a pure EOF append to *your* journal (**R2**). Your files
   cannot land at all without it, and **no one can write it for you**
   (PROTOCOL §4). Append it in the same pass as the work.
2. **`Files-in-this-commit` must set-equal the commit's changed paths**,
   excluding your own journal (**R4**). Count this packet's Return log if you
   update it — that edit is yours (§3) and it is a changed path.
3. **Append only** (**R3**); corrections append, never rewrite (**L-A04**).
4. **Entry ids strictly monotonic across your chain** (**R5**, **R10**) —
   yours is `J-dv_lead-0002`.
5. **Stay inside your write scope** (**R7**): `test/**`, `tools/**`,
   `docs/reports/dv/**`, `agents/handoffs/**`. Not `rtl/**`, ever.
6. **You never run git** (PROTOCOL §2). Read-only inspection is expected.
7. **Provenance classes on every claim** (**L-B01**): *measured* / *derived*
   / *relayed*. A recollection is **relayed**, never measured —
   `AUD-0002-F1` is a CRITICAL issued against the orchestrator for exactly
   that error.
8. **Header timestamps are not ordering evidence** (**L-A07**); use a
   plausible current UTC (`AUD-0002-F8`).

- **Deliverables**: `docs/reports/dv/DV-P1-countersignature.md`;
  `J-dv_lead-0002`; a Return-log entry here.
- **Definition of done**: one unambiguous verdict — **COUNTERSIGNED** /
  **COUNTERSIGNED WITH FINDINGS** / **NOT COUNTERSIGNED** — over the amended
  surface only.

## 1. Background

You returned NOT COUNTERSIGNED at `54a7221` and **pre-committed** that your
confirmatory pass would cover only the amended text: *"the other 84
requirements and the §4 port tables are graded and I will not re-open
them."* That pre-commitment is what turned a rejection into one round, and
it binds this packet.

The architect applied **all six** amendments, declined none, and closed
**OQ-4** with normative text. It also enumerated **every propagation edit in
spec §13.1**, deliberately, so your confirmatory surface is bounded by a
list rather than found by diff. Use it.

## 2. The task

1. **Confirm A-1…A-6 landed as intended**, over §13.1's enumerated surface.
   Three were applied with additions beyond your text: A-3 gained a clause,
   A-4 a domain-separation paragraph, A-5 one sentence. Judge the additions
   too — an amendment applied *plus something* is not the amendment you
   wrote.
2. **Grade the OQ-4 closure.** `REQ-014` now specifies memory in two ordered
   clauses; an uncovered location holds `8'h00`; both lanes are tabulated as
   observing `8'h00` on the first read of an unwritten location. Your
   question is whether that is *testable* and whether the non-conformant row
   gives you a deliberate-mismatch check you can actually run.
3. **The architect found the uncovered set is not a suffix.** You, it, and I
   all framed it as "bytes beyond the end of a short image". A `$readmemh`
   file may carry `@address` records, so a sparse image can leave a hole in
   the *middle* — measured reading `xx`. The repair is phrased per location.
   Confirm the phrasing actually covers the hole-in-the-middle case.
4. **F-5 is confirmed real and it is worse than you graded it.** Both lanes
   refuse a package-parameter override; a top-level module parameter
   defaulting to the package value works. But **Icarus's package-scoped form
   `-Ppkg.P=…` is silently ignored** — no diagnostic, value unchanged. That
   is the form a test author tries first, and it fails by loading nothing
   into a machine whose all-zero memory then halts on `0x0000` looking like
   an ordinary result. Confirm REQ-115 closes it, and say whether the
   silent-ignore presentation needs a bench-side guard as well.
5. **The near-miss deserves your eye.** Applying A-3 literally alongside A-1
   would have reinstated F-2 by a new mechanism: A-1 widens `obs_sp` to
   `SP_W`, §5.1 derives `SP_W` from `STACK_DEPTH`, A-3 makes `STACK_DEPTH` a
   module parameter — and a package-derived `SP_W` does not follow the
   override (measured: 5 vs 3 at `STACK_DEPTH = 4`). REQ-115 now requires
   derived widths to be derived in the module. Confirm that holds for
   **every** derived width, not only `SP_W`.
6. **NV-3's remaining fraction is yours.** The architect measured the
   simulator flags cocotb's runner maps onto, **not the runner itself**, and
   marked that *relayed* — no bench exists. Say what is still owed.
7. **Issue the countersignature, or do not.** If it is COUNTERSIGNED, say so
   plainly; the sponsor signs the freeze on your verdict and the architect's
   spec. Do not countersign around a gap.

## 3. Constraints

- **Do not re-open the 84 requirements or the 30 ports you graded and
  closed.** Your own pre-commitment binds you; re-opening would cost the
  program a round for nothing and make the pre-commitment worthless.
- One id was minted (`REQ-115`, 90 → 91) and none withdrawn — that one is
  in scope, being new.
- Single pass; check-in expectation armed here at issue time.

## 4. What I expect back

The report, the journal entry, one verdict, and — if COUNTERSIGNED — a clear
statement of what a sponsor signing the freeze should know first. The
architect nominates **D-8**: a P1 PASS proves the RTL implements this
specification and nothing about whether the specification describes CHIP-8.
That was your F-11. Say whether the spec's handling of it satisfies you.

---

## Return / verdict log

### RETURNED — dv_lead, 2026-08-05 · `J-dv_lead-0002`

Report: `docs/reports/dv/DV-P1-countersignature.md`. Spec reviewed at
`ddc06dc`. Measurement harness committed at `test/spikes/`.

#### Verdict

> **NOT COUNTERSIGNED at `ddc06dc`.**

**All six amendments landed and landed correctly, OQ-4's closure is right, and
its behaviour is now confirmed by measurement in both lanes.** None of that is
re-opened. The signature is withheld on **four blocking defects, every one of
them in text added beyond the amendments I wrote**, and one of them is measured
rather than argued:

| # | Defect | Repair |
|---|---|---|
| **B-1** | **No conformant `MEM_INIT_FILE` declaration exists.** REQ-115 requires a module parameter defaulting to its `chip8_pkg` value; REQ-109's A-5 addition names a literal default as "exactly the defect this requirement names"; and **Icarus 12.0 rejects a package `string` parameter in a parameter default expression** (measured — and *crashes* on the accessor-function form). Both compliant readings fail, on the one parameter §5.4 says every test sets. **F-5, alive, arriving through F-5's own repair.** | one sentence + one table cell: `MEM_INIT_FILE` was never a package value |
| **B-2** | §5.5 still defines **`SP_W`** — the value REQ-115 forbids a module to read — while REQ-109 ¶1 orders every value in that table referenced and never restated. The near-miss is half closed: the instruction not to read the package landed, the thing not to read is still in it. | one table cell |
| **B-3** | REQ-115's *"`SP_W` … is the only such case in P1"* is **measurably false**. `obs_stack`'s width expression reads **192 bits from the package against 48 from the module at `STACK_DEPTH = 4`** — identical failure, and this half is *silent* where the `SP_W` half is loud. §4.A's note and ADR-0018 A2.2 both state the general rule; only the requirement states the narrow one. | eight words + naming all four modules |
| **B-4** | A-4's addition puts the model-to-DUT comparison "at retirement … **and nowhere else**". No faulting instruction ever retires, so this strands the five fault conditions of §9 **and the 65536-encoding decode sweep** — my largest committed campaign — plus the `mem` array, outside the comparison domain, narrowing README's signed full-state criterion by a subordinate clause. | one clause |

**Four sentences, no behaviour changes.** Exact replacement text: report §8.

**Pre-commitment renewed.** A revision whose diff from `ddc06dc` is exactly
those four repairs needs **no further review round** — verifying it is a
transcription check. The countersignature issues as `J-dv_lead-0003`.

#### The tasks, item by item

| Task | Answer |
|---|---|
| 1 — A-1…A-6 over §13.1's surface, additions judged | **Six for six, nothing declined, nothing weakened.** The three additions: **A-3's** catches a real defect my own two amendments would have created together (verified independently: 3 against 5, both lanes) — right direction, wrong scope (B-3), and it makes B-2 visible. **A-4's** draws the right distinction and over-reaches by one universal (B-4). **A-5's** is necessary and is B-1. |
| 2 — OQ-4 testable? deliberate-mismatch runnable? | **Yes to both.** Testable **in-band** — `ANNN` + `FX65` + `obs_v` at retire — needing no hierarchical handle in either lane. The non-conformant row is a runnable mutation cell with three qualifications: it is **Icarus-only** (Verilator is blind, so scoring it in the fast lane's row would be a vacuous prediction — L-C08); the failure form is an **exception, not a value mismatch** (L-C09, so a sealed message must say so); and **`COCOTB_RESOLVE_X=ZEROS` silently resolves the `X` and the check passes green** — one environment variable turns the four-state authoritative lane into a second two-state lane, for every X-related check in the program. Nothing pins it today. That guard is mine. |
| 3 — hole in the middle | **Covered, and measured.** Sparse image, zero-fill on: `11 22 33 00 00 00 00 00 00 00 00 00 aa bb 00 00`, both lanes; same file without clause 1 reads `xx` in all eleven uncovered locations in Icarus. The phrasing is stronger than the hole case needed: clause 1 quantifies over locations before any image is applied, so the answer is independent of the image's **shape** entirely — no shape-dependent residue for a future image generator to fall into. |
| 4 — does REQ-115 close F-5? does the silent-ignore need a bench guard? | **Right mechanism, wrong text (B-1).** And the presentation is **worse than the packet's framing**: the silent form is not `-Ppkg.P=`, it is cocotb's own documented `parameters={"MEM_INIT_FILE": path}`. cocotb 1.9.2 formats parameters with no type awareness and no quoting, so in the Icarus lane **iverilog prints `error: invalid value specified for defparam`, exits 0, emits a working simulation, and the test runs green over an unloaded memory**. Verilator fails loudly. The lane asymmetry runs the wrong way twice. **All four ways a P1 test can end up running 4096 zero bytes print something and none fails the run**, so the guard cannot be log-based. Four guards committed in report §7.3, each qualified against the defect it names (L-B04) with the negative controls already at `test/spikes/`. |
| 5 — does the derived-width rule hold for **every** derived width? | **No — it holds for `SP_W` only.** Two other derivations from `STACK_DEPTH` are outside the clause as written: `obs_stack`'s width expression (**measured 48 against 192**) and the stack array's own depth. `NUM_V*DATA_W` is latent, live only if `NUM_V` ever opens. → **B-3**. Also **F-16**: REQ-115 names only M02 and M03, while `obs_sp`, `obs_stack`, `STACK_DEPTH` and the quirks live in **M01** and `RNG_SEED` in **M04** — entailed by "passed down to submodules unmodified", so sound, but a literal reader lets M01 read the package, which is the near-miss one level down. |
| 6 — NV-3's remaining fraction | **Discharged, and it fired the falsifier ADR-0018 A2.7 names.** Measured end to end through cocotb 1.9.2: `int`, `bit`, `logic` vector, **enum-typed** and `string` module parameters all reach the elaborated design — but the natural string call breaks in the Icarus lane and the run stays green (task 4). Additionally: **Verilator refuses an enum-typed override** (`%Error-ENUMVALUE`) without `-Wno-ENUMVALUE -Wno-WIDTHTRUNC`, which four of REQ-095's six connectivity vectors need (**F-15**, CARRIED — a bench-side waiver or an RTL type choice, no spec change). **NV-1 is also discharged, positive**: cocotb reads an unpacked array by hierarchy in *both* lanes, so the signed memory-compare criterion is not narrowed. |
| 7 — issue it, or do not | **Withheld.** By my own `54a7221` grading standard — BLOCKING is a defect that would need a post-freeze spec diff plus an ADR — all four qualify, and B-1 is a measured impossibility rather than a tension a careful reader resolves. Signing text I had just measured to be unimplementable would be countersigning around a gap. |

#### What a signer should know first — D-8

**D-8's handling satisfies me** (report §10). It records the limitation in the
document the gate reads, as a **deferred item rather than an open question** —
and the reason is right: an OQ row would have blocked the very gate it asks to
be signed *with knowledge of*, converting my "not freeze-blocking" grade into a
blocker by filing. It quotes my grading without softening it, carries all three
options and my recommendation, and §11 records that **OQ-3 is subsumed by
D-8** — the architect's own generalisation of its own finding, and correct.

**One cell to correct (F-18, MINOR):** D-8's *Closes by* says
`P1-module-ready`. Charter §3 and PROTOCOL §10 bind anchor-before-judge at the
**first verdict the model issues**, which is the first `SO-` PASS — and every
P1 sign-off is written inside the interval between the two.

The paragraph for transcription into the gate packet is report §10's block
quote: **a P1 lockstep PASS proves the RTL implements this specification and
nothing about whether this specification describes CHIP-8.**

#### Carried to the orchestrator

- **The four repairs**, verbatim, to `architect_docs_lead` (report §8).
- **F-15** — the Verilator enum-override waiver, for the first RTL work order:
  `-Wno-ENUMVALUE` suppresses a real type check globally, and the alternative
  is declaring the quirk module parameters as 2-bit `logic` with a cast inside.
  Neither needs a spec change; the choice is rtl_lead's with my input.
- **F-17** — §13.1 clerical: "the matrix gains the corresponding row
  (REQ-124)"; the row added is **REQ-115**. The matrix itself is correct —
  91/91 rows, hook columns byte-identical to §10, mechanically diffed.
- **NV-2 open** (now also carrying the 4096-element array-read cost);
  **NV-4 new** (what X-resolution policy the CI environment provides). One
  spike before the first bench discharges both.
- **D-8 stays open**, E3-shaped, settling before the first `SO-` PASS.

#### Scope compliance

Confirmatory scope honoured: the 84 requirements and the 30 ports graded at
`54a7221` were **not** re-opened. No RTL was read, created or implied; `rtl/`
does not exist in this tree. Files staged: this packet, the report, and the
`test/spikes/` harness — the last deliberately **not** matching
`build.yml`'s R-CI-d glob `test/test_*.py`, so the source guard stays armed and
its written de-gating condition is not short-circuited by a measurement
instrument. Simulation build output goes to a temp tree outside the repository,
so the determinism job sees no untracked files. **No git command was run.**
