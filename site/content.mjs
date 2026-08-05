// content.mjs — the EDITORIAL layer.
//
// Everything in this file is hand-authored and must be kept current by a
// human or the orchestrator. Everything else on the site is GENERATED from
// the repository's own markdown at build time and cannot drift.
//
// The split is deliberate and is stated on the site itself: a page that
// silently mixes generated and curated content is a page whose staleness is
// undetectable.

export const site = {
  title: 'CHIP-8 in SystemVerilog',
  tagline: 'A CHIP-8 virtual machine in synthesizable SystemVerilog, designed and verified entirely by an agent organisation.',
  repo: 'https://github.com/renatom11/my-project',
  orgGeneric: 'https://github.com/renatom11/my-fpga-org',
  shell: 'https://github.com/renatom11/generic-agentic-fpga-org',
};

export const intro = {
  what: `A hardware implementation of the **CHIP-8 virtual machine** — an interpreted
computing platform from 1977, and arguably the smallest thing that still
qualifies as a complete computer. It has an instruction set, addressable
memory, a display, keyboard input, timers and sound. Nothing in it is large,
but nothing important is missing.

The machine is deliberately modest: 4 KB of RAM, sixteen 8-bit registers, a
12-bit index register, a small call stack, two 60 Hz countdown timers, a
16-key hexadecimal keypad, and a 64 × 32 monochrome display. Thirty-five
instructions, every one exactly two bytes long.

Everything is built and validated **in simulation**, with free open-source
tools. The deliverable is not a board on a desk — it is a repository with a
green CI badge, synthesis results showing real resource usage and timing,
and a browser-playable build.`,

  constraint: `Because the design uses a single-port block RAM, **only one memory access can
happen per clock cycle** — so no instruction completes in one cycle. The
natural architecture is a multicycle finite state machine: fetch the high
byte, fetch the low byte, decode, then execute across one or more states.
Simple arithmetic finishes quickly. Drawing a sprite loops once per row.
Waiting for a keypress blocks indefinitely.

That sequencing is the structural lesson of the project, and it arises from a
genuine hardware constraint rather than an artificial exercise.`,

  org: `The project is built by an **agent organisation** operating under a written
constitution. A single orchestrator session is the sole spawner of agents and
the sole operator of git. Leads own architecture, RTL and verification; an
independent auditor audits everyone, including the orchestrator.

Two properties are non-negotiable:

- **Traceability.** For any commit range, the diff shows both the change and,
  adjacent in the same diff, the responsible agent's journal entry explaining
  the reasoning that produced it.
- **Independence.** Verification is never graded by the designer. Tests are
  derived from specifications, never from RTL — testbench work orders
  deliberately omit the RTL source, and the write scopes that enforce it are
  checked by script at commit time and re-checked in CI.`,

  honesty: `Enforcement claims on this site are tagged. **MACHINE** means a named script
refuses the action or CI fails. **PROSE** means a document instructs and the
rule is review- or audit-enforced. The two are never presented with the same
confidence — a habit adopted after an audit found the distinction being
blurred.`,
};

// Phase table — mirrors README.md's phase table, which is the canonical
// scope statement (PROTOCOL §1). Changing scope is a sponsor decision.
export const phases = [
  { id: 'P1', name: 'Core CPU', state: 'active',
    scope: 'Single-port 4 KB RAM, register file, call stack, multicycle fetch/decode/execute FSM, and every instruction that is neither draw nor I/O. Python golden model and lockstep harness stood up as the phase\'s verification instrument.',
    criteria: 'Lockstep parity against the golden model over directed vectors and constrained-random instruction streams; full architectural-state compare after every instruction; divergence reported at the instruction of first difference.' },
  { id: 'P2', name: 'Display and draw path', state: 'not-started',
    scope: 'Framebuffer in flip-flops, 64-bit barrel shifter, DXYN with XOR commit and collision→VF, 00E0 clear, font ROM and FX29.',
    criteria: 'Draw-path lockstep including full framebuffer compare; unaligned positioning, edge wrap/clip and multi-row sprites covered; collision flag correct in both directions.' },
  { id: 'P3', name: 'I/O, timing, first light', state: 'not-started',
    scope: '60 Hz delay and sound timers, 16-key keypad, EX9E/EXA1/FX0A blocking wait, FX07/FX15/FX18.',
    criteria: 'Pong runs to a scored point end-to-end in simulation under scripted keypad input, framebuffer matching the golden model frame-for-frame; 60 Hz tick verified against cycle count.' },
  { id: 'P4', name: 'Quirks, compatibility, formal', state: 'not-started',
    scope: 'Every divergent CHIP-8 behaviour exposed as a compile-time parameter, defaulting to 1977 COSMAC VIP semantics; community test-ROM suite; formal property proofs.',
    criteria: 'Test-ROM suite green with framebuffer compared against reference images, in the 1977 default configuration AND at least one alternate quirk configuration; formal proofs of stack bounds, PC range and I range.' },
  { id: 'P5', name: 'Synthesis, timing, delivery', state: 'not-started',
    scope: 'Yosys → nextpnr → timing flow for resource and fmax reports; Verilator → Emscripten WebAssembly build; CI badge.',
    criteria: 'Post-place-and-route fmax and resource report published with the critical path identified; WebAssembly build playable in a browser from a link with no install; CI green on every push.' },
];

export const milestones = [
  { id: 'M0', name: 'Bring-up', state: 'complete', note: 'G0 passed — intake signed, org ratified, branch protection configured and verified by live fire, enforcement self-test green.' },
  { id: 'M1', name: 'Toolchain, build CI, spec regime', state: 'complete', note: 'ADR-0017 accepted (Lane A: cocotb over Icarus + Verilator). Named risk R1 retired by measurement. Pin manifests committed. build.yml instantiated.' },
  { id: 'P1', name: 'Core CPU', state: 'active', note: 'Specification written, revised twice against an independent testability grading. Spec freeze pending.' },
];

// The BACKLOG. Curated from tasks/BOARD.md, which carries these across
// several sections. Each item names its owner and what unblocks it.
export const backlog = [
  { id: 'P1-spec-freeze', kind: 'gate', pri: 'now', owner: 'sponsor',
    title: 'P1 spec freeze — sponsor signature (E1)',
    body: 'Blocked on the current repair round and then dv_lead\'s confirmatory pass. What a signer should know first is D-8: a P1 PASS proves the RTL implements this specification, and nothing about whether the specification describes CHIP-8.' },
  { id: 'B-1', kind: 'defect', pri: 'now', owner: 'architect_docs_lead',
    title: 'MEM_INIT_FILE cannot be a package parameter',
    body: 'Icarus 12.0 cannot bind a package `string` parameter in a module parameter\'s default expression; the accessor form crashes the tool. The requirement as written mandates a form that does not elaborate. The repair is that a filename parameter never belonged in the package — not weakening the rule it collides with.' },
  { id: 'B-2', kind: 'defect', pri: 'now', owner: 'architect_docs_lead',
    title: 'Two clauses, opposite instructions, one name',
    body: 'The package still defines SP_W — the value a requirement forbids a module to read — while another clause orders every package value referenced and never restated.' },
  { id: 'B-3', kind: 'defect', pri: 'now', owner: 'architect_docs_lead',
    title: 'The derived-width rule is narrower than its class',
    body: 'SP_W is called "the only such case in P1"; measurably false — obs_stack\'s width expression fails identically (48 vs 192) and the stack array\'s depth is a third case. The SP_W half fails loudly; the width half fails silently.' },
  { id: 'B-4', kind: 'defect', pri: 'now', owner: 'architect_docs_lead',
    title: '"and nowhere else" is one universal too wide',
    body: 'No faulting instruction ever retires, so read strictly the clause strands the fault conditions, the 65536-encoding decode sweep and the memory array outside the model-to-DUT comparison domain — narrowing a signed criterion by a subordinate clause.' },
  { id: 'AUD-0002-F1', kind: 'finding', pri: 'now', owner: 'orchestrator', severity: 'CRITICAL',
    title: 'An Evidence claim tagged "measured" that was a recollection',
    body: 'The orchestrator asserted, tagged as measured, that a commit was not its own. It was. The claim is false and was refuted by its own words in the same session. Blocks phase-accept until dispositioned by ADR and re-verified. Closure is the auditor\'s to grant, not the subject\'s.' },
  { id: 'X-policy', kind: 'risk', pri: 'next', owner: 'dv_lead',
    title: 'One environment variable can silently disarm the four-state lane',
    body: 'COCOTB_RESOLVE_X=ZEROS silently resolves X, turning the authoritative four-state lane into a second two-state lane for every X-related check in the program. Nothing pins it today.' },
  { id: 'param-silent', kind: 'risk', pri: 'next', owner: 'dv_lead',
    title: 'A test can run green over an unloaded memory',
    body: 'cocotb formats parameters with no type awareness or quoting, so Icarus prints an error, exits 0, emits a working simulation, and the test passes over 4096 zero bytes. Verilator fails loudly — the lane asymmetry runs the wrong way. Four guards committed; none can be log-based.' },
  { id: 'D-8', kind: 'deferred', pri: 'next', owner: 'orchestrator',
    title: 'P1 has no external anchor',
    body: 'A P1 PASS proves the RTL implements this specification and nothing about whether the specification describes CHIP-8. Recorded as a deferred item rather than an open question — deliberately, since an open question would block the gate it asks to be signed with knowledge of. Settles before the first sign-off.' },
  { id: 'OQ-3', kind: 'risk', pri: 'later', owner: 'dv_lead',
    title: 'A wrong quirk default is invisible to P1 by construction',
    body: 'The 1977 defaults are relayed, not measured. The RTL and the golden model both derive from the same specification, so they would agree about any error in it. The compensating control is external by necessity: P4\'s community test-ROM campaign.' },
  { id: 'D-9', kind: 'deferred', pri: 'later', owner: 'orchestrator',
    title: 'Fifteen inspection hooks have no named performer',
    body: 'Four are over RTL the countersignatory may not read. Assignment is due at the first RTL work order.' },
  { id: 'outer-hop', kind: 'obligation', pri: 'later', owner: 'orchestrator',
    title: 'Lessons owed upstream',
    body: 'The sponsor answered yes to sending the G0 harvest onward to the canonical shell. The pull request cannot be opened from the current session. Carried, not dropped, and not to be quietly re-read as a no.' },
];

// Documents to render. `src` is repo-relative; `status` is shown as a badge
// and must reflect the artifact's own stated state, not its polish.
export const documents = [
  { group: 'Specifications', items: [
    { src: 'docs/specs/SPEC-P1-core-cpu.md', slug: 'spec-p1-core-cpu', title: 'SPEC-P1 — Core CPU', status: 'DRAFT · not frozen',
      blurb: 'The P1 specification. 91 REQ ids, an 8-state multicycle FSM, all 65536 opcode encodings partitioned, five quirk parameters. Graded twice by an independent testability review; not yet countersigned.' },
    { src: 'docs/specs/requirements.md', slug: 'requirements', title: 'Requirements register & traceability matrix', status: 'live',
      blurb: 'Every REQ id mapped to its spec section, with the test-id and evidence columns left for the verification lane to fill.' },
    { src: 'docs/specs/SPEC-TEMPLATE.md', slug: 'spec-template', title: 'SPEC-TEMPLATE', status: 'template',
      blurb: 'The template every module specification instantiates.' },
  ]},
  { group: 'Decisions', items: [
    { src: 'docs/adr/ADR-0018-p1-core-cpu-design-choices.md', slug: 'adr-0018', title: 'ADR-0018 — P1 design choices', status: 'accepted',
      blurb: 'Five non-obvious choices with alternatives, costs and falsifiers: halt on illegal opcode, fault rather than wrap, a deterministic RNG, a fully-specified reset, and the observation interface as a mandated port set.' },
    { src: 'docs/adr/ADR-0017-toolchain-lane.md', slug: 'adr-0017', title: 'ADR-0017 — Toolchain lane', status: 'accepted',
      blurb: 'cocotb driving both Icarus and Verilator; Yosys for synthesis; SymbiYosys for formal; Emscripten for the browser build. Carries two self-corrections found while executing it.' },
  ]},
  { group: 'Verification', items: [
    { src: 'docs/reports/dv/DV-P1-countersignature.md', slug: 'dv-p1-countersignature', title: 'DV-P1 — Confirmatory pass', status: 'NOT COUNTERSIGNED',
      blurb: 'Second grading. All six amendments confirmed landed; four defects found in the text added beyond them. Claims relayed in the first pass are measured here.' },
    { src: 'docs/reports/dv/DV-P1-testability.md', slug: 'dv-p1-testability', title: 'DV-P1 — Testability grading', status: 'NOT COUNTERSIGNED',
      blurb: 'First grading of the specification. Thirty ports graded line by line; per-requirement testability across all 90 ids; the illegal-opcode adjudication.' },
  ]},
  { group: 'Audits', items: [
    { src: 'docs/reports/audit/AUD-0002-sole-committer-violation.md', slug: 'aud-0002', title: 'AUD-0002 — Sole-committer allegation', status: '1 CRITICAL',
      blurb: 'An allegation the orchestrator raised against another agent, investigated and found false — the orchestrator had done it itself. The CRITICAL finding is against the orchestrator, relayed unedited.' },
    { src: 'docs/reports/audit/AUD-0001-g0-retro-audit.md', slug: 'aud-0001', title: 'AUD-0001 — G0 retro-audit', status: 'PASS WITH FINDINGS',
      blurb: 'The organisation\'s first spawn, deliberately: if the audit lane does not work, nothing downstream is trustworthy. Ten findings, every one in the prose layer, none in the mechanical one.' },
  ]},
];

export const workOrderDir = 'agents/handoffs';

export const agents = [
  { id: 'orchestrator', tier: 'main session', owns: 'Everything. Sole spawner of agents, sole operator of git, sole escalator to the sponsor.', active: true },
  { id: 'architect_docs_lead', tier: 'Opus', owns: 'Specifications, ADRs, REQ-### requirements, all documentation.', active: true },
  { id: 'dv_lead', tier: 'Opus', owns: 'Tests, golden models, replays, sign-off packets. Derives tests from specs, never from RTL.', active: true },
  { id: 'auditor', tier: 'Opus, independent', owns: 'Audits everyone including the orchestrator. Owns the escape ledger. Never fixes what it finds.', active: true },
  { id: 'rtl_lead', tier: 'Opus', owns: 'All shipped HDL, and the synthesis lane.', active: false },
  { id: 'rtl_module_dev', tier: 'Sonnet ×N', owns: 'One module per frozen spec packet.', active: false },
  { id: 'tb_writer', tier: 'Sonnet ×N', owns: 'Spec-derived tests. Work orders deliberately omit the RTL source.', active: false },
  { id: 'data_wrangler', tier: 'Sonnet, dormant', owns: 'External stimulus data and checksum manifests.', active: false },
  { id: 'formal_dv', tier: 'Sonnet, dormant', owns: 'Formal equivalence and property checks.', active: false },
];
