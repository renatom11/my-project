# A reusable AI-agent organization for FPGA programs

Fork this repository and you get a **complete engineering organization,
staffed by AI agents, with one empty slot: your project**. You describe
what you want built; nine agents — an orchestrator, an architect, design
and verification leads, workers, and an independent auditor — design it,
verify it, document it, and audit themselves, bringing you only
decisions. Every change ships with the reasoning that produced it, in an
append-only record that CI re-verifies on every push; designs are signed
off only after planted-defect campaigns prove the tests can catch real
bugs; and your organization gets smarter with every project, because
lessons are harvested at every gate and land in your own copy
automatically — with at most one yes/no from you (default yes, and
answerable once for good) on sharing them onward to the community
([docs/FEDERATION.md](docs/FEDERATION.md)).

**This repository is the installer, not the program.** Like an executable
that installs software onto a machine, the canonical shell exists to be
forked: each fork becomes a live copy — your organization's ecosystem,
then your projects — while the shell itself runs nothing and holds the
community's shared lessons ([docs/FEDERATION.md](docs/FEDERATION.md) §0;
ADR-0011). Which kind of copy a session is in is written on its board —
the **Repo role** line — and the orchestrator reads it before acting.

**Why this exists — the full story: [the Manifest](docs/MANIFEST.md).**

**New here? Read [the User Guide](docs/GUIDE.md)** — everything
explained for a first-time reader, no FPGA (field-programmable gate
array — a chip whose hardware you define with code) or AI expertise
assumed. If
you'll be the human in charge, your one-page job description is
[docs/SPONSOR.md](docs/SPONSOR.md).

The org design and its enforcement machinery were distilled from the
[agentic-fpga program](https://github.com/renatom11/agentic-fpga), where they
were proven in operation.

## The project

Filled at G0 intake — see [BOOTSTRAP.md](BOOTSTRAP.md). The table below is the
canonical statement of scope, phases, and success criteria (PROTOCOL §1);
it changes only by sponsor decision (escalation class E2 — a scope
change).

**The project**: a synthesizable SystemVerilog implementation of the **CHIP-8
virtual machine** (1977), verified and delivered entirely in simulation using
free, open-source tools. 4 KB single-port RAM · 16 × 8-bit registers · 12-bit
index register · 16-entry call stack · two 60 Hz countdown timers · 16-key
hexadecimal keypad · 64 × 32 monochrome display · 35 fixed-width 2-byte
instructions. Recorded at G0 intake, 2026-08-05.

| Phase | Scope | Success criteria |
|---|---|---|
| **P1 — Core CPU** | Single-port 4 KB RAM, register file, call stack, multicycle fetch/decode/execute FSM, and every instruction that is neither draw nor I/O (arithmetic, logic, conditional skips, jumps, subroutine calls, RNG). Python golden model and lockstep harness stood up as the phase's verification instrument. | Lockstep parity against the golden model over directed vectors and constrained-random instruction streams for the covered opcode subset; full architectural-state compare after every instruction; divergence reported at the instruction of first difference. |
| **P2 — Display and draw path** | Framebuffer in flip-flops, 64-bit barrel shifter, `DXYN` with XOR commit and collision→VF, `00E0` clear, font ROM and `FX29`. | Draw-path lockstep including full framebuffer compare; unaligned positioning, edge wrap/clip and multi-row sprites covered; collision flag correct in both directions (set on erase, cleared otherwise). |
| **P3 — I/O, timing, first light** | 60 Hz delay and sound timers, 16-key keypad, `EX9E`/`EXA1`/`FX0A` blocking wait, `FX07`/`FX15`/`FX18`. | Pong runs to a scored point end-to-end in simulation under scripted keypad input, framebuffer matching the golden model frame-for-frame; 60 Hz tick verified against cycle count. |
| **P4 — Quirks, compatibility, formal** | Every divergent CHIP-8 behaviour exposed as a compile-time parameter (defaulting to 1977 COSMAC VIP semantics); community test-ROM suite; formal property proofs. | Test-ROM suite green with framebuffer compared against reference images, in the 1977 default configuration **and** at least one alternate quirk configuration; formal proofs of stack-never-overflows/underflows, PC-never-leaves-valid-memory, I-never-addresses-out-of-range. |
| **P5 — Synthesis, timing, delivery** | Yosys → nextpnr → timing flow for resource and fmax reports; Verilator → Emscripten WebAssembly build; CI badge. | Post-place-and-route fmax and resource report published with the critical path identified; WebAssembly build playable in a browser from a link with no install; CI green on every push. |

**Scope parameters** (PROTOCOL §10 evidence rules and SPEC-TEMPLATE §8 bind to
these numbers): RAM 4096 × 8 bit, single-port synchronous, one access per
cycle; program load address `0x200`; font ROM 16 glyphs × 5 bytes at
`0x000`–`0x04F`; V0–VF 16 × 8 bit with VF as carry/borrow/collision flag; I and
PC 12 bit; stack 16 × 12 bit (parameterized); DT and ST 8 bit each decrementing
at 60 Hz; framebuffer 64 × 32 × 1 bpp = 2048 flip-flops; sprites 8 wide × 1–15
rows; barrel shifter 64 bit, shift 0–63; 35 instructions, fixed 2 bytes,
big-endian. Cycle budget: 3 cycles fetch-hi/fetch-lo/decode (decode may fold
into fetch-lo → 2), ~4 cycles for a simple ALU instruction, 4 + N for `DXYN`,
4 + (X+1) for `FX55`/`FX65`, `FX0A` blocks indefinitely. Instruction issue rate
500–1000/s (throttled); nominal clock 12 MHz, 60 Hz tick divider 200,000.
Synthesis target iCE40 HX8K (7680 LUT4 / 7680 FF), fmax bar ≥ 25 MHz
post-place-and-route, resource bar ≤ 50% logic cells.

## The org

**Start at [`ORG_CHART.md`](ORG_CHART.md).** Every agent has a
version-controlled charter in [`agents/charters/`](agents/charters/) defining
its responsibilities, interfaces, definition of done, evaluation criteria, and
escalation rules. Shared rules live in
[`agents/PROTOCOL.md`](agents/PROTOCOL.md). Live program state is in
[`tasks/BOARD.md`](tasks/BOARD.md).

## The journaling guarantee

Every agent keeps an **append-only journal**
(`agents/journals/claude_<name>_agent.md` — workers under
`agents/journals/workers/` — a volume chain per PROTOCOL §4.3)
and every commit couples one agent's work with that agent's journal entry
explaining it — mechanically enforced by
[`scripts/agent_commit.sh`](scripts/agent_commit.sh) and re-verified over
every pushed range by CI
([`.github/workflows/journal-check.yml`](.github/workflows/journal-check.yml)).

Consequences you can rely on:

- `git diff A..B` — for *any* two commits — shows both what changed and the
  reasoning that produced it, side by side in the same diff.
- `git log --grep 'Agent: rtl_lead'` reconstructs any one agent's entire
  thread of work.
- Journal history cannot be quietly rewritten: the append-only property is
  re-checked over the FULL history on every push (an incremental range check
  cannot detect a rewrite), backstopped by branch protection on `main` and the
  working branch (a one-time sponsor setup, G0 checklist item), and journal
  `Evidence` sections are falsifiable — the auditor re-executes them at the
  recorded SHA.

Run the enforcement self-test: `bash scripts/test_protocol.sh`.

## Getting started

Three levels; your part is a one-time four-item setup, then two
touchpoints per gate ([docs/FEDERATION.md](docs/FEDERATION.md) §0;
PROTOCOL §8 class E0):

**Found your organization — once.** Make a full-history copy of this
repository — the upstream original, called the **canonical shell** in
these docs. Throughout these docs, "fork" names the **relationship** (a
full-history copy), not GitHub's button: the only load-bearing
requirement is that the commit chain arrives unsquashed. On a single
account — where GitHub's Fork button cannot target the account that
already owns the repo — **clone-and-push is the way**, and it is fully
equivalent:

```bash
git clone https://github.com/renatom11/generic-agentic-fpga-org my-fpga-org
cd my-fpga-org
git remote set-url origin <your new EMPTY repo's URL>
git push -u origin main
```

(Organization accounts can use the Fork button instead.) That copy is
your **org generic**: your
team's own ecosystem, where lessons from all your projects accumulate. It
runs no project itself; its short founding checklist —
[BOOTSTRAP.md](BOOTSTRAP.md) Stage 0 — enables CI, sets the rulesets
(including the `fed/**` staging namespace), verifies the enforcement, and
sets the board's **Repo role** line to `org-generic`. Do **not** use
GitHub's "Use this template"
button: it squashes history into a single commit, and this repository's
commit history is load-bearing — the journal-check CI verifies the whole
chain, and a squashed history fails it by design. (Working alone on a
single project? Your one project fork may play both roles — its board's
Repo role line reads `solo-collapsed`: it holds the org-generic role for
federation, its upstream line stays the canonical shell, and its lessons
land in itself. If a second project ever
becomes likely, found the real org generic first: graduating later means
forking this shell fresh and landing your solo copy's accumulated
lessons into it — via the same screened-landing procedure lessons
normally use ([docs/FEDERATION.md](docs/FEDERATION.md) §5.1) — before
project 2 forks.)

**To start each project:**

1. **Fork your org generic** (fork-the-relationship: clone-and-push on a
   single account, same commands as above with your org generic as the
   source; same no-template-button rule) — one copy
   per project, and **only from a green default branch**: red means the
   source is unfounded or broken, and a clone taken meanwhile inherits
   the wrong identity and mis-founds (BOOTSTRAP Stage 0 step 7); the
   fork's first act is setting its board's Repo role
   line to `project` (completed and signed at G0 row B6). It boots with
   everything your organization has learned:
   the accumulated core lessons and the domain packs your intake
   declares. Inheritance is fixed at the fork point — a running project
   does not refresh from the org generic mid-flight; sibling projects'
   lessons reach your work only when you next fork the org generic, by
   design.
2. Open a Claude Code session on your fork, on any machine, and say:
   *"Read CLAUDE.md — you are this repository's orchestrator. Walk me
   through G0."*
3. Give it your material: paste prose, and/or drop files — docs about
   what you're building, rough requirement drafts, reference specs,
   datasheets — into an `intake/` directory. The org digests everything
   into one proposal for your signature ([BOOTSTRAP.md](BOOTSTRAP.md)
   Section B, Path B); your resources then remain its project reference
   material.
4. Do the sponsor-only setup when the checklist reaches it: ratify the
   charters (A6) and set branch protection with its branch-flow decision
   (A7/A8, a GitHub settings action) — with the intake signature from
   step 3, that completes the one-time four-item E0 setup.

Found a problem with the shell itself while running your copy? **File an
issue on the canonical shell** — defects travel as GitHub issues, lessons
travel through the federation pipeline; the two channels never mix.

The sponsor and the fresh orchestrator session walk G0 together;
[BOOTSTRAP.md](BOOTSTRAP.md) is the script. G0 covers: org ratification (or
amendment before ratification), branch protection on `main` and the working
branch, a green enforcement self-test, and the project intake that fills the
phase table above and records the toolchain candidates, external references,
and their license classes. Until the intake is recorded on
[`tasks/BOARD.md`](tasks/BOARD.md), the orchestrator spawns no agent.

## Repository map

```
BOOTSTRAP.md          the G0 walk-through: sponsor + orchestrator fill the project slot
CLAUDE.md             orchestrator session bootstrap (rehydration order, iron rules)
docs/GUIDE.md         the user guide — start here if any of this is new to you
docs/SPONSOR.md       the sponsor's one-page job description
ORG_CHART.md          the org: chart, roster, execution model
agents/
  PROTOCOL.md         shared operating constitution (journals, commits, gates)
  charters/           per-agent instruction files — open any of them
  journals/           append-only reasoning logs, one volume chain per agent
  handoffs/           versioned work orders, sign-offs, bug packets (+ templates/)
docs/
  adr/                architecture decision records (constitution ADRs seeded)
  gates/              committed gate checklists (signatures = journal refs)
  specs/              module specs and REQ-### requirements (fills after intake)
  reports/audit/      auditor findings + the ledger of bugs that escaped verification
  reports/dv/         verification and performance reports (DV = design verification; fills at the first report)
scripts/              protocol enforcement + self-test
tasks/BOARD.md        live program state
.claude/agents/       thin spawn launchers (charters remain the truth)
rtl/ test/ tools/     created as the program builds, from the first work phase on (RTL = the hardware design source code)
```
