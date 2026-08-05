# ADR-0017: Toolchain lane — Verilator + Icarus under cocotb, Yosys/nextpnr for synthesis

- **Status**: **PROPOSED** — awaiting sponsor decision, escalation class **E3**
  (PROTOCOL §8: toolchain lane and licensing decisions). Nothing in this ADR
  binds until the sponsor signs it; no M1 artifact is built against it before
  then.
- **Deciders**: sponsor, on orchestrator escalation with options +
  recommendation + cost (PROTOCOL §8, BOOTSTRAP §2.1)
- **Date proposed**: 2026-08-05
- **Supersedes**: nothing. **Amends**: PROTOCOL §6's write-scope table (see
  Consequences 4), which makes this a §11 amendment carrying an enforcement
  change and therefore a proving scenario.

## Context

Every M1+ artifact binds to one toolchain lane: the build project, the CI
workflow, the specs' §4.1 interface regime, all RTL under `rtl/**`, and all
tests under `test/**`. Choosing late is not neutral — the interface regime and
the test architecture are both downstream of this decision, and re-choosing
after P1 means rewriting benches rather than editing a config.

The candidate lanes and their license classes were recorded at the B3 intake
(`tasks/BOARD.md`, "Intake — toolchain candidates"). All candidates are
free-use; there is no consult-only tool in the set and no licensing tension to
resolve here.

Two capability findings were surfaced at intake, **before** anything bound to
them, and they shape the options rather than merely annotating them:

1. **SystemVerilog constrained randomization does not exist in this lane.**
   `rand`, `constraint` and `randomize()` are UVM-class features implemented by
   neither Verilator nor Icarus. The intake's constrained-random stimulus
   therefore cannot live in SystemVerilog classes, whichever lane is chosen.
2. **Verilator is two-state and cycle-based.** No X-propagation, no timing
   checks. Uninitialized-register and reset-domain defects that four-state
   simulation exposes are invisible in a Verilator-only lane.

Three further constraints come from the signed intake and are not negotiable
here, only satisfied or not:

- **P5 requires a browser-playable WebAssembly build.** That requires
  Verilator somewhere in the lane; no other free simulator has a
  compile-to-C++ path Emscripten can consume.
- **P1 requires lockstep against a Python golden reference model**, comparing
  full architectural state after every instruction.
- **P5 requires real post-place-and-route timing**, not synthesis estimates —
  so the lane must reach `nextpnr` and a static timing report, not stop at
  `yosys`.

## Options

| Lane | For | Against | Cost / risk |
|---|---|---|---|
| **A — cocotb over both simulators** (recommended). cocotb is the single testbench framework; the *same* Python tests run under **Icarus** (4-state, authoritative for correctness) and **Verilator** (fast, for long random campaigns). Verilator's C++ output additionally feeds the Emscripten build. Yosys → nextpnr → icetime for synthesis; SymbiYosys + Z3 for formal. | The golden model, the stimulus generator and the comparison all sit in **one Python process** with the DUT — which is exactly what lockstep wants, and removes any cross-process boundary from the P1 critical path. Both capability findings are answered structurally: constrained-random lives in Python where it is a solved problem, and the 4-state gap is covered by a second lane running identical tests. One test suite, two simulators, selected by an environment variable. | Two simulator installs and two CI lanes to keep green. cocotb's Verilator support is narrower than its Icarus support. | **Named risk R1**: cocotb + Verilator has historically carried limitations around timing control and VPI. Mitigation is structural, not hopeful — Icarus is the *authoritative* correctness lane, so if Verilator proves awkward under cocotb the fallback is to run cocotb on Icarus only and use Verilator solely for the WASM build, losing speed on random campaigns but no correctness capability. **This must be validated by a spike before the P1 spec freeze**, and the spike is the first M1 work order. |
| **B — Verilator only, C++ testbenches** | Single toolchain, fastest possible simulation, and the WASM build reuses the same harness directly. | The golden model is Python by intake decision. This lane forces either a second C++ model — duplicating the reference and destroying its value as an independent anchor — or a process boundary between model and DUT, making per-instruction lockstep slow and fragile. Constrained-random generation must be hand-built in C++. **And the 4-state gap has no coverage at all**: nothing in this lane can see an uninitialized-register defect. | Highest DV cost, and it fights the intake's stated architecture. The independence rider (`tasks/BOARD.md`, B3) makes a duplicated model actively harmful, not merely wasteful. |
| **C — Icarus only** | Four-state and event-driven throughout; the best SystemVerilog parsing of the free simulators; simplest single-lane CI. | **Fails a signed success criterion.** Icarus cannot produce the compile-to-C++ artifact Emscripten needs, so P5's browser-playable build is unreachable. Long constrained-random campaigns would also be materially slower. | Rejected on the intake, not on preference: choosing it would require an **E2 scope change** to drop P5's delivery criterion. |

Lanes B and C are recorded because the decision should show its work, not
because they are close. C is disqualified by a signed criterion; B is viable
but strictly worse for this project's stated architecture.

## Decision

**Proposed: Lane A.**

**Version pinning lives in committed project files, never in CI steps**
(BOOTSTRAP §2.1). Concretely:

- **`oss-cad-suite` pinned to one dated release**, recorded in a committed
  file at the repository root. The YosysHQ OSS CAD Suite ships Yosys,
  nextpnr, the iCE40 flow, Verilator, Icarus, SymbiYosys and the SMT solvers
  as a single versioned bundle — one pin instead of seven, and the same bundle
  locally and in CI. **To verify at instantiation**: that the pinned release
  actually contains every tool this lane names, at usable versions. Recorded
  as an instantiation check rather than assumed here — *relayed*, not
  *measured*.
- **`requirements.txt`** pinning `cocotb`, `pytest` and the Python version
  floor for the golden model.
- **Emscripten** pinned by its own SDK version file.

CI runs both simulator lanes on every push. A lane that cannot run is a red
build, never a skipped step (PROTOCOL §10: a skipped simulator is never a
PASS).

## Consequences

1. **The interface regime for SPEC-TEMPLATE §4.1: reviewed port tables**, not
   compile-checked interface records. The reason is honest and specific — the
   *synthesis* half of this lane has uneven SystemVerilog support, and pushing
   SV `interface` constructs through Yosys is a known-rough path. Forcing a
   compile-checked regime would buy checking in simulation and risk breakage in
   synthesis, on a design small enough (single-digit modules) that a reviewed
   table graded line-by-line at the dv_lead countersignature is genuinely
   sufficient. **Mitigation against the regime's known weakness**: a shared
   SystemVerilog *package* holding parameters and opcode encodings, imported by
   both RTL and testbench, so the values at least cannot drift silently even
   though the port lists are review-checked. Recorded so a later session does
   not read "reviewed port tables" as "we did not think about it".
2. **CI instantiation** proceeds per BOOTSTRAP §2.2: `git mv
   .github/workflows/build.yml.template .github/workflows/build.yml` and fill
   every `<SLOT>` for this lane. `journal-check` is untouched and keeps running
   independently.
3. **A capability this lane turns out to lack is a NEW E3** — named gap, raised
   before the affected gate — never a quiet re-pin (BOOTSTRAP §2.1). R1 above
   is the first candidate: if the spike fails, the fallback is recorded here
   and the loss (campaign speed, not correctness) is already stated.
4. **Two new write-scope lanes**, amending PROTOCOL §6's table under §11:

   | Path | Owner | Why |
   |---|---|---|
   | `syn/**` | `rtl_lead` | Synthesis scripts and their resource/timing reports concern the shipped HDL and belong with the agent that owns it. Not `dv_lead`: synthesis is not verification, and putting it in the DV lane would blur an independence boundary for no benefit. |
   | `web/**` | `orchestrator` | The Emscripten shim and page are a delivery artifact, adjacent to the top-level build files the orchestrator already owns. |

   **Cost, measured rather than estimated**: write scopes are enforced by the
   `agent_may_write()` `case` statement in `scripts/policy.sh`, which
   `agent_commit.sh` consults for R7 and `check_journals.sh` re-checks in CI.
   Each lane is one pattern added to one existing `case` arm. Because this
   changes enforcement semantics, PROTOCOL §11 requires a proving scenario per
   lane in `scripts/test_protocol.sh` — the existing R7 scenarios (S-rows for
   `rtl_lead`→`test/`, `auditor`→`rtl/`, `architect`→`docs/gates`) are the
   pattern to copy. Estimated: two `case` patterns, two scenarios, one journal
   entry. Small, but it is a law change and it ships with its proof.
5. **`data_wrangler` activates** for the checksum-pinned ROM fetch decided at
   B3, and `formal_dv` activates in P4 for the SymbiYosys properties. Neither
   needs a new lane — `tools/**` and `test/**` already cover them.
6. **The freeze does not bar this ADR.** `tasks/BOARD.md` records the
   inherited feature freeze as NOT ENGAGED in this repository, on a judgment
   call stated there and flagged by AUD-0001-F9 as the permissive reading. This
   ADR is precisely the artifact that reading was made to permit, so the
   dependency is named here rather than left implicit: **if the sponsor
   reverses that reading, this ADR does not land.**
