# Program Board

**Live program state.** The orchestrator updates this file in the same commit
as any state change it describes. A fresh orchestrator session rehydrates by
reading: this board → `agents/PROTOCOL.md` → `ORG_CHART.md` → journal tails of
agents with open work.

## Current milestone

**M0 — bring-up.** This repository is the **CHIP-8 in SystemVerilog**
project: a clone of `renatom11`'s org generic
(https://github.com/renatom11/my-fpga-org), founded as a project on
2026-08-05. The intake is **signed and recorded** (G0 Section B); G0
itself remains **OPEN** on one row — **A9**, the auditor's retro-audit,
in flight as WO-0001. Every sponsor row is discharged. Working branch:
`claude/project-investigation-54wqwc`, PR-flow mode (A8), both branches
under the `protect-history` ruleset (A7).

Founded from the org generic at
`0a60b2ae001cb62ec017d6f949dda3ef4d388321` (C39), which is the SHA the
org generic's own `main` carried at clone time — verified read-only by
`git ls-remote` at intake.

**Founding verification, by this session's own hands at `0a60b2a`:**
enforcement self-test **47 passed, 0 failed** (41 scenarios);
`check_journals.sh --all` green over all 39 commits with the journal
volume chains verified at range head (R10); `journal-check` CI run
**31012592559** on `main` at `0a60b2a` concluded **success**.

**Detection honesty — this copy was found unfounded by PROSE, not
MACHINE.** The board's `This repository` line said `my-fpga-org` while
`origin` said `my-project`; the `R-ROLE-1` CI check did **not** flag it,
because that check compares origin against a `canonical-shell` claim only
and this copy claimed `org-generic`. CI was green on an unfounded copy.
Detection came from the boot logic in `CLAUDE.md`. This is the shell's
first queued law-debt item (recorded below), independently re-derived
here, and it is minted as tier-1 candidate `LC-01` in the G0 harvest.

**The inherited freeze does not bind this repository as written.** The
freeze bullet below arrived from the org generic with an end condition —
*"no new law in `renatom11/my-fpga-org` until its first lessons landing
completes"* — that names an event **this** repository cannot observe, and
no G0 row re-scopes it for a plain `project` (B6 re-scopes the freeze
only for a `solo-collapsed` copy). Read literally it would bar the M1
toolchain ADR that BOOTSTRAP Stage 2 mandates. Taken as the conservative
reading at intake: the inherited bullet never bound this repository, and
M1 proceeds normally. **Filed as a shell defect**, not a lesson — see the
defect log below.

## Milestone roadmap

Canonical scope statement is README.md's phase table (PROTOCOL §1);
the rows below are its roadmap view. Changing either is an E2 escalation.

| Milestone | Scope | Status |
|---|---|---|
| M0 | Bring-up: G0 intake, org ratification, branch protection, enforcement self-test green | **Active** — intake signed; A7 + A9 open |
| M1 | Toolchain ADR (E3), build CI instantiation, SPEC-TEMPLATE §4.1 interface regime | Opens at the G0 flip |
| P1 | Core CPU — memory, register file, stack, multicycle FSM, non-draw/non-I/O instructions, golden model + lockstep harness | Not started |
| P2 | Display and draw path — framebuffer, 64-bit barrel shifter, `DXYN` XOR + collision, `00E0`, font ROM + `FX29` | Not started |
| P3 | I/O, timing, first light — 60 Hz timers, keypad, `FX0A` blocking wait; Pong runs end-to-end | Not started |
| P4 | Quirks, compatibility, formal — quirk parameters, test-ROM suite in multiple configs, formal properties | Not started |
| P5 | Synthesis, timing, delivery — Yosys/nextpnr reports, Verilator → Emscripten WASM build, CI badge | Not started |

## Gates

| Gate | Status | Checklist |
|---|---|---|
| G0 | **OPEN on A9 only** — A1–A5 re-verified; A6 ratified; A7 configured and verified by live fire; A8 decided; B1–B6 signed; Section C harvest instantiated, transmission awaiting the gate signature. **A9 (retro-audit) in flight as WO-0001** | [docs/gates/G0-checklist.md](../docs/gates/G0-checklist.md) |
| P1..P5 | Instantiated from [templates](../docs/gates/templates/) at each phase's spec freeze | — |

## Open work orders

| Packet | From → To | State | Subject |
|---|---|---|---|
| [`WO-0001_g0-retro-audit.md`](../agents/handoffs/WO-0001_g0-retro-audit.md) | orchestrator → auditor | **ISSUED** 2026-08-05 | G0 row A9 — retro-audit of the seed commit range, baseline pinned `fe5dea7` |

## Pending escalations to sponsor

**None live.** All four G0 E0 contacts are discharged: A6 ratification,
A8 branch-flow decision, the B1–B6 intake signature, and **A7 branch
protection** — all 2026-08-05.

- **A7 — branch protection: CONFIGURED AND VERIFIED** (2026-08-05).
  Rulesets on this repository:
  - **`protect-history`** (id 20463571) — `deletion` + `non_fast_forward`,
    targeting **both** `main` and `claude/project-investigation-54wqwc`.
  - **`main-requires-ci`** (id 20463601) — `required_status_checks` on
    `journal-check`, targeting **`main` only** (deliberately not the
    working branch: GitHub rejects direct pushes to any branch carrying
    required checks, so binding it to the working branch would halt all
    work).
  - **PROTOCOL §5 R9 is now MACHINE-enforced here** for force-push, on
    both branches. The evidence classes differ per rule and must not be
    flattened (`CLAUDE.md` iron rule):
    - **No-force-push — verified by live fire** (*measured*). A
      non-fast-forward push of the working branch was rejected:
      `GH013 ... - Cannot force-push to this branch`, exit 1, remote SHA
      unchanged. The same attempt against `main` was rejected naming
      **both** rules, which is also the live proof `main-requires-ci` is
      active.
    - **No-deletion — verified by configuration read only** (*measured*,
      but **not** live fire). The live-fire delete attempt returned a
      proxy-level HTTP 403 before GitHub could adjudicate, so as a live
      test it is **NO-VERDICT** — a distinct class from a pass (L-D04).
      The `deletion` rule's presence on both branches is confirmed from
      `GET /repos/renatom11/my-project/rules/branches/<b>`.
    - **Empty bypass list — verified for the pushing identity only**
      (*derived*). The rules API does not expose bypass actors. But the
      force-push was rejected **for the credential this session pushes
      with**, which is the repository owner's; had the bypass list
      contained an admin entry, that push would have succeeded. The claim
      is therefore proven where it matters and unproven in general.

**In flight, not escalations:**

- **A9 — the retro-audit**, the org's **first spawn**, now **ISSUED** as
  [`WO-0001_g0-retro-audit.md`](../agents/handoffs/WO-0001_g0-retro-audit.md)
  with the baseline pinned at `fe5dea7` (PROTOCOL §3, L-E09). The sponsor
  delegated the spawn/defer call to the orchestrator on 2026-08-05; the
  orchestrator spawned. Returns to the orchestrator for commit under
  `Agent: auditor`; findings relay **verbatim**, CRITICAL as class E4.
- **Session-scope blocker — partially cleared 2026-08-05.**
  `renatom11/my-fpga-org` is now in this session's authorized repository
  set, which **cleared B6's push check** (`git push --dry-run` succeeded,
  exit 0, no branch created — never a probe push) and unblocks the G0
  harvest's inner hop for when the gate signs. **Still blocked**:
  `renatom11/generic-agentic-fpga-org` is not in the set, so the
  freeze-inheritance shell defect (defect log below) cannot be filed —
  and filing it is an outward-facing action on a third repository, held
  for explicit sponsor authorization, which has not been given. Neither
  blocks M1 work.

## Decisions on record

- **This repository**:
  https://github.com/renatom11/my-project — the copy's own
  URL, re-recorded at every founding (BOOTSTRAP Stage 0 step 4 / G0 row
  B6). A session whose `git remote get-url origin` disagrees with this
  line is in a **fresh, unfounded copy** of whatever the role line below
  claims (`CLAUDE.md`, First session).
- **Repo role**: `project` (values: canonical-shell / org-generic /
  project / solo-collapsed — ADR-0011). Recorded at this repository's
  founding as a project, 2026-08-05, discharging the rule that **a fork's
  first act is updating this line**. A project runs a program: G0 intake,
  then the M1+ roadmap above, landing its gate harvests in its org generic
  (`docs/FEDERATION.md` §5.1).
- **Branch flow (G0 A8)**: **PR-flow mode** — work lands on the working
  branch `claude/project-investigation-54wqwc`, `main` receives milestone
  PRs only (PROTOCOL §5 R9, trivial merges). Chosen over the single-branch
  default because only PR-flow lets `journal-check` bind `main` as a
  *required* status check, and because it matches this session's push
  constraint. Sponsor decision, 2026-08-05.
- **Org ratification (G0 A6)**: the org chart and all nine charters
  **ratified as written, without amendment**, sponsor decision
  2026-08-05. Provenance class *relayed* (PROTOCOL §7 — the sponsor holds
  no journal). The trail is kept whole rather than tidied: the sponsor
  first answered "no preference", which J-orchestrator-0040 recorded as an
  **inferred** reading and flagged as correctable; the sponsor then
  confirmed **"ratify the charters"** explicitly (J-orchestrator-0041).
  The signature rests on the direct answer; the inference is retained
  above it so the strengthening is visible rather than silent (L-A04 —
  corrections append, they never rewrite).
- Constitution ADR-0001..0007 pre-adopted at seeding (see each ADR's
  provenance).
- **Declared domain packs**: **none loaded** (G0 B6, 2026-08-05). The only
  pack this org carries is `docs/domains/ethernet-networking.md`, and
  nothing in the intake material puts Ethernet/IP/CRC datapaths in play —
  an irrelevant pack is simply never loaded (`docs/domains/README.md`).
  No pack is created here either: packs accrete **only** at a landing
  fence, from screened tier-2 candidates. The G0 harvest's tier-2 war
  story names a prospective pack `open-source-rtl-toolchains`, which the
  fence creates if and when the candidate lands.
- **Federation upstream** (`docs/FEDERATION.md` §0, §7):
  https://github.com/renatom11/my-fpga-org — this project's **org
  generic**. Re-recorded at this repository's founding as a project,
  2026-08-05, per G0 row B6 (an org generic keeps the canonical shell on
  this line; a project points at its org generic). This is the
  destination of the inner hop (§5.1). **Read access verified** by
  `git ls-remote` at intake (its `main` at `0a60b2a`, identical to this
  repository's founding SHA); **push access unverified** — see the
  session-scope blocker above. The **shell-defect channel** remains the
  canonical shell, https://github.com/renatom11/generic-agentic-fpga-org
  (defects never travel the lessons pipeline).
- **Project slug**: `chip8-sv` — lowercase-hyphenated, unique within this
  org, keying every landing in the org generic (`docs/FEDERATION.md`
  §5.1). Recorded at G0 B6, 2026-08-05.
- **Fork-point harvest baseline** (ADR-0010), the last entry id per
  journal chain inherited at clone time; each chain's first harvest tiles
  from baseline + 1:
  `orchestrator` **0039**; `architect_docs_lead`, `rtl_lead`, `dv_lead`,
  `auditor`, and the four worker templates (`rtl_module_dev`, `tb_writer`,
  `data_wrangler`, `formal_dv`) all **none** — header-only at fork, so
  their first harvests tile from `0001`.
- **Federation sent-ledger** (append-only; one line per landing:
  `<parent-record-id>` · landing SHA(s) · outer-hop PR URL or `—` ·
  obligation ids + states or `—`, ADR-0014):
  _none yet_. A landing's ledger line is written in the same commit as
  its transcription (`docs/FEDERATION.md` §5.1 step 5).
- **Amendment obligations** (open promotion obligations — the recurrence
  threshold, ADR-0010 / `docs/FEDERATION.md` §8; the read-path promotion
  channel rides the same ledger): _none open_. One line per obligation:
  entry id · opened by (landing / recurrence) · **state** — DISCHARGED
  (ADR-NNNN) / NARRATIVE-ONLY (reason) / DEFERRED (reason · discharging
  event). Every landing dispositions its own and sweeps the DEFERRED
  backlog (`docs/FEDERATION.md` §5.1 step 4c, ADR-0014) — landings are
  this fence's only cadence.
- **Outer-hop standing pre-answer** (`docs/FEDERATION.md` §7): _none —
  the per-gate question stands_. The sponsor may replace this value
  with a standing YES or NO (e.g. *STANDING CLOSED — pre-answered NO,
  for every gate and every backlog*); while a standing line is recorded
  here the gate-time question is not asked, the harvest block cites
  this line instead, and only the sponsor changes it. Confirmed at
  every founding (G0 row B6). **Confirmed unset at this repository's
  founding as a project, 2026-08-05** — the sponsor was not asked to
  pre-answer, so the per-gate default-yes question stands for this
  project's outer hop.
- **Feature freeze: NOT ENGAGED in this repository** (G0 B6, 2026-08-05).
  The freeze bullet inherited from the org generic named an end condition
  — *"no new law lands in `renatom11/my-fpga-org` until its first lessons
  landing completes"* — that references an event **this** repository
  cannot observe, and B6 re-scopes the freeze only for a `solo-collapsed`
  copy, not for a plain project. Read literally, the inherited bullet
  would bar the M1 toolchain ADR that BOOTSTRAP Stage 2 mandates. The
  conservative reading taken at intake: **it never bound this repository
  as written**, and M1's ADRs proceed under PROTOCOL §11 normally. Filed
  as a shell defect (defect log below); this line is superseded if the
  upstream fix says otherwise. The canonical shell's own freeze history —
  the three closed sponsor-directed overrides carrying ADR-0008..0016 —
  is likewise inherited law in this tree and never bound this copy.
- **Intake — scope parameters and success criteria (B1, B2, B4, B5)**:
  canonically stated in **README.md's phase table** and the scope-parameter
  paragraph beneath it (PROTOCOL §1); the roadmap above is the board's view
  of the same. Changing either is an **E2** escalation. **Simulation-first
  boundary (B4)**: everything is validated in simulation — **no board, no
  bitstream deployment, no lab equipment, at any phase**. Synthesis runs
  the full Yosys → nextpnr → timing flow purely to produce genuine
  resource and fmax *reports* (real place-and-route numbers, not synthesis
  estimates) as a design artifact, never as a deployment step. Explicitly
  out of scope: bitstream on hardware, physical keypad, VGA/HDMI output,
  audio DAC — the sound timer is a register plus an unconnected
  buzzer-enable output. Delivery surface: CI badge, published
  synthesis/timing report, browser-playable WebAssembly build.
- **Intake — external references, each with a license class (B3)**
  (PROTOCOL §10: free-use may be vendored verbatim with provenance and is
  never edited in place; consult-only is design study only, never ported,
  never quoted into shipped source):
  - **consult-only** — Cowgod's CHIP-8 Technical Reference v1.0; Matthew
    Mikolay's CHIP-8 reference; Tobias Langhoff's emulator guide; Octo /
    John Earnest's quirk tables; COSMAC VIP and RCA 1802 material.
  - **Independence rider, recorded at intake**: both the shipped RTL **and
    the Python golden model** are written from the specification, never
    ported from an existing interpreter. A model derived from another
    emulator is not an independent reference — it is a second copy of the
    same assumptions, and would silently agree with the hardware about any
    misreading the two share. PROTOCOL §10 already binds the RTL; this
    extends it to the model.
  - **free-use, stimulus** — Timendus `chip8-test-suite`; corax89
    `chip8-test-rom`; `BC_test.ch8`. **Licenses to be verified before
    vendoring**; where a suite is copyleft, it is fetched at build time
    under a checksum manifest rather than vendored, keeping this
    repository's own license clean.
  - **Game ROM — fetch, never vendor** (sponsor decision, 2026-08-05).
    Pong's VIP-era provenance is unclear and "freely available" is not a
    license, so the ROM is fetched at build time via a checksum-pinned
    script — the pattern PROTOCOL §5's blob gate already prescribes, and
    the activation trigger for the dormant `data_wrangler`. A small
    original demo ROM in Octo assembly is the guaranteed-clean fallback
    headline demo.
- **Intake — toolchain candidates (B3), feeding the M1 E3 decision**: all
  free-use. Verilator (LGPL-3.0 / Artistic-2.0, primary sim + the WASM
  path); Icarus Verilog (GPL-2.0, secondary); cocotb (BSD-3, testbench
  framework); Yosys · nextpnr · icestorm (ISC, synthesis/P&R/timing);
  SymbiYosys with Z3 / Yices / Boolector (ISC / MIT, formal); Emscripten
  (MIT + NCSA, WASM); Python 3 + pytest (PSF / MIT, golden-model host).
  **Two capability findings the M1 ADR must carry**, surfaced at intake
  before anything binds to them: (a) SystemVerilog **constrained
  randomization** (`rand` / `constraint` / `randomize()`) is implemented by
  neither Verilator nor Icarus, so constrained-random stimulus lives in
  **Python under cocotb**, not in SV classes — which also puts generator,
  golden model, and comparison in one process, where lockstep wants them;
  (b) Verilator is **2-state and cycle-based** — no X-propagation, no
  timing checks — so uninitialized-register and reset-domain bugs stay
  invisible in that lane, and Icarus runs as a **secondary 4-state lane**
  over at least the reset and initialization sequences.
- **First-trial findings absorbed** (2026-08-04, sponsor hand-relay from
  the first org generic founded from this shell, since retired): SD-0001
  → R-ROLE-1 wedge check (ADR-0015); SD-0002 (unobservable freeze) and
  SD-0003 (no defect channel) → already fixed in the zero-question
  founding commit; SD-0004 (fork-button impossibility) → clone-and-push
  now leads the founding docs; its ADR-0014 (obligation discharge)
  adopted as this shell's ADR-0014.
- **Second-trial defect fixed (2026-08-05)**: the first field founding
  from this shell hit an R-ROLE-1 false positive — the check
  substring-matched `canonical-shell` against the whole role line, and
  the shipped line carries the value enumeration as plain text on the
  same physical line, so every founded copy went permanently red (and
  the false red stops the next founding at the project M0 red-check).
  Fixed same-day: exact backticked-value comparison, regression
  scenario S40 (ADR-0015 Amendment A1). Reported live by the founding
  session through the upstream defect channel; its issue closes against
  the fix commit when it lands.
- **Third-trial defect fixed (2026-08-05)**: the second field founding
  parked its Stage 0 founding commit on a working branch, leaving the
  org generic's default branch carrying the pre-founding board; the
  project cloned from that branch inherited the shell's identity and
  mis-founded as an org generic — correct boot logic on poisoned
  state. Fixed same-day, docs-only (freeze-legal founding surfaces):
  Stage 0 step 4 mandates the founding commit lands on the default
  branch, step 7 gates Stage 0 completion on the default branch being
  green, README adds the fork-only-from-green rule, CLAUDE.md's boot
  line carries the branch mandate. The R-ROLE-1 red on the unfounded
  default branch was the designed signal all along — the fix makes it
  a stop condition instead of a judgement call.
- **Queued law-debt (behind the freeze)**: generalize the R-ROLE-1 CI
  check from the canonical-shell claim to every role, keyed on the
  This-repository line (script change + scenario, §11) — the boot logic
  already applies the generalized rule; only the machine backstop waits.
  Second item (2026-08-05, from the third field defect): a MACHINE
  guard in `agent_commit.sh` refusing any commit that sets the board's
  Repo role line to `org-generic` on a branch other than the default
  branch (script change + scenario, §11). C36's Stage 0 branch mandate
  is PROSE — determined, but instructed; this backstop would make the
  side-branch founding mechanically impossible. Lands at the freeze's
  end, or earlier under a sponsor-directed override.
- **Independent claims audit (2026-08-05), on the record**: an
  independent agent audited the orchestrator's architecture claims
  against this tree. Verdicts: 9/13 confirmed or confirmed-with-caveat;
  4/13 refuted in part — the claimed-but-nonexistent standing
  pre-answer (C4); "lessons never touch working files", false in the
  solo-collapsed topology (C7); "lessons move only inside gate-closing
  commits", false of outer-hop PRs (C11); and "45 scenarios, signed
  commits" — 40 scenarios carrying 45 assertions, trailer-attributed,
  not cryptographically signed (C13). Corrected in law under override
  #3 (ADR-0016): the audit's two live tree contradictions — the §8.1
  "three screens" line and the harvest block's stale "informational
  sponsor row" phrase — and the missing standing pre-answer, made law
  on its merits; the remaining overclaims were reporting errors,
  corrected by the standing findings below and the MACHINE/PROSE
  discipline, not by tree edits. A follow-up verification audit
  (2026-08-05) confirmed the three fixes and required the completing
  sweep that landed with ADR-0016 Amendment A1. Standing findings
  every future report must honor: **the federation pipeline has zero
  mechanical test coverage — the 47 self-test assertions (41 scenarios)
  test journal/commit hygiene only, and the first end-to-end landing is
  the pipeline's designated first test**; commits are trailer-attributed,
  not cryptographically signed; enforcement claims are tagged MACHINE or
  PROSE (`CLAUDE.md` iron rule).
- **Inherited shell history vs. this repository's history.** The four
  bullets above — the first/second/third-trial defects, the queued
  law-debt, and the independent claims audit — are the **canonical
  shell's** operating record, carried into this tree at the fork. They
  are inherited context, not events in `renatom11/my-project`, and the
  queued law-debt is the shell's to discharge (it reaches this
  repository only on a future re-fork or landing, never by local
  patching). This repository's own history begins at its founding commit
  — the G0 intake record, 2026-08-05. Everything before it, including the
  C36–C39 org-generic founding commits, is inherited.
- **Upstream defect channel — confirmed at founding** (G0 B6,
  2026-08-05): shell defects — wrong claims, broken steps, gaps
  found while operating this copy — file as **GitHub issues on the
  canonical shell**, https://github.com/renatom11/generic-agentic-fpga-org;
  they never travel through the lessons pipeline, which carries lessons
  only, and shell law is never patched locally. Note the channel and the
  federation upstream now differ: as a project, the upstream (landing
  destination) is this org's generic, while defects still go to the shell
  that authored the law.
  **Local defect log** (one line per defect: date · one-line summary ·
  upstream issue URL):
  - 2026-08-05 · **Freeze inheritance: a project copy inherits an
    unobservable, self-contradictory freeze.** A repo founded as a
    `project` inherits the org generic's freeze bullet, whose end
    condition names an event only the org generic can observe; no G0 row
    re-scopes it for a plain project (B6 does so only for
    `solo-collapsed`). Read literally the inherited freeze bars the M1
    toolchain ADR that BOOTSTRAP Stage 2 mandates — the copy cannot both
    obey the freeze and follow the bootstrap. · **issue not yet filed** —
    blocked on the same session-scope repository add as the B6 push check.
