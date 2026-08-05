# Toolchain manifest — minimum acceptable versions

Authority: [ADR-0017](docs/adr/ADR-0017-toolchain-lane.md) (M1 toolchain
lane, Lane A), Amendment A1.2 and A2.

**Why minimums and not exact pins.** `docs/playbooks/ci-evidence.md` §7
**R-CI-b** requires dependencies to come from the runner distribution's
archive (`apt-get install -y <pkg>`) — no third-party archives, no source
builds. Apt versions cannot be pinned by number reliably, because the archive
rotates and a pinned install then fails on a version that was never wrong.
So the reproducibility condition is recorded in two halves, which together
give what BOOTSTRAP §2.1 is actually protecting:

1. **A floor, here** — a too-old runner fails loudly instead of silently
   changing behaviour.
2. **The actual versions, per run** — captured into a `.meta` sidecar
   artifact by each CI lane (**R-CI-c**), never into a compared file.

Python pins are exact and live in [`requirements.txt`](requirements.txt).

| Tool | Minimum | Role | Source | Measured present |
|---|---|---|---|---|
| `verilator` | 5.020 | Fast simulation lane; compiles to C++ for the P5 WebAssembly build | distribution | **5.020** |
| `iverilog` | 12.0 | Four-state, event-driven lane — **authoritative for correctness** (Verilator is 2-state and cannot see uninitialized-register or reset-domain defects) | distribution | **12.0** |
| `yosys` | 0.33 | Synthesis, P5 resource reports | distribution | **0.33** |
| `z3` | 4.8.12 | SMT backend for the formal lane | distribution | **4.8.12** |
| `nextpnr-ice40` | — | Place and route, P5 post-P&R timing | distribution | **not yet verified** |
| `icetime` | — | Static timing report | distribution | **not yet verified** |

## The two named exceptions (R-CI-b / R-CI-h)

Neither of these is carried by the runner distribution, so each is installed
from its upstream project at a pinned revision. R-CI-h explicitly requires a
taken exception to be *stated*, so that its absence is a decision rather than
an omission — this is that statement.

| Tool | Role | Why an exception | Confinement |
|---|---|---|---|
| `sby` (SymbiYosys) | Formal property checks | Not packaged by the distribution | Own CI job (**R-CI-a**). Not on the P1 critical path — formal lands in **P4** |
| `emcc` (Emscripten) | Compiles Verilator's C++ output to WebAssembly | Not packaged by the distribution | Own CI job. Not on the P1 critical path — the browser build lands in **P5** |

If either exception proves unstable, that is a **new E3** (named gap, raised
before the affected gate), never a quiet re-pin.
