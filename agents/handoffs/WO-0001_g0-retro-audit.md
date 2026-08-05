# WO-0001: G0 retro-audit of the seed commit range

- **State**: ACCEPTED
- **From** / **To**: orchestrator → auditor
- **Spec basis**: none — process work. Authority is `docs/gates/G0-checklist.md`
  row **A9** ("Auditor's G0 retro-audit of the seed commit range committed to
  `docs/reports/audit/` — the new org's **first spawn**, and the first proof
  the audit lane works") and PROTOCOL §7's G0 preconditions.
- **Baseline SHA (pinned at spawn, PROTOCOL §3 / L-E09)**:
  `fe5dea721397acef6a48bc924f89af41037f033e`
  — findings are adjudicated against this pin, not against a moving tree. The
  commit carrying *this packet* is deliberately outside the window: it is
  scaffolding for the audit, not a subject of it.
- **Audit window**: the full history through the pin —
  `git log --oneline fe5dea7` — 40 commits. Two strata, and the distinction is
  load-bearing:
  - **C1..C39 (`0a60b2a`)** — history *inherited* from the canonical shell and
    this org's generic. Not authored in this repository.
  - **C40 (`fe5dea7`)** — this repository's **own** first commit: the G0
    intake record. Authored here, by the orchestrator, unreviewed by anyone.
- **Deliverables** (all inside your write scope, PROTOCOL §6 — you stage
  `docs/reports/audit/**` and nothing else, ever):
  - `docs/reports/audit/AUD-0001-g0-retro-audit.md` — the numbered report, per
    `docs/reports/audit/README.md` conventions (findings `AUD-0001-Fn`,
    severities CRITICAL/MAJOR/MINOR, verdict from the PASS / PASS WITH
    FINDINGS / FAIL / NO-VERDICT vocabulary).
  - Your journal entry appended to `agents/journals/claude_auditor_agent.md`
    (`J-auditor-0001` — the chain's first entry; the header block already
    exists, append below it).
  - **You run no git.** Write both files in the working tree and return; the
    orchestrator commits them under `Agent: auditor`.
- **Definition of done**: the DoD checklist in your charter §5, restricted to
  what a G0 retro-audit can reach (no RTL, no specs, no `SO-` packets, no
  mutation campaigns exist yet — say so rather than silently skipping);
  journal entry appended with the sampling frame recorded; every finding
  falsifiable per charter §6.1.
- **Context provided**: the whole repository at the pin, read-only, plus CI
  run ids `31012592559` (branch `main`, head `0a60b2a`, conclusion success)
  and `31016037714` (branch `claude/project-investigation-54wqwc`, head
  `fe5dea7`, conclusion success). **Nothing is withheld** — there is no
  blinding regime on a process audit, and you may read every file, journal,
  and script in the tree.
- **Standing lessons in force** (ADR-0012; the BOARD declares **no domain
  packs**, so these are core `docs/LESSONS.md` entries only):
  - **L-E09** — an audit pins its baseline SHA at spawn: the pin is above;
    adjudicate against it, and if the tree has moved under you, say so.
  - **L-E08** — spawn discipline: your Trigger section carries the spawn
    short-id verbatim.
  - **L-D04** — NO-VERDICT is a class of its own: if a check cannot execute,
    that is not a PASS and not a FAIL; name it.
  - **L-D09** — evidence cites what a checkout can verify: quote checkout
    SHA, exact commands, and observed output.
  - **L-D12** — a report is not a check: do not credit a document's claim
    about enforcement as enforcement.
  - **L-B01** — every claim carries a provenance class (measured / derived /
    relayed).
  - **L-A07** — commit order is the ordering evidence; journal header
    timestamps are not.
  - **L-E07** — label a request a request, never a block.
- **Out of scope**: fixing anything (charter §2 — you never fix what you
  find); staging any path outside `docs/reports/audit/**`; auditing the
  sponsor's outstanding A7 ruleset (it is an open gate row, not a defect);
  re-litigating the canonical shell's own inherited operating record on the
  BOARD, which is context carried into this tree, not events here.

## 1. Background

This repository was cloned from `renatom11/my-fpga-org` (this org's generic)
and founded as a **project** on 2026-08-05. G0's Section A rows A1–A5 were
re-verified by the orchestrator, A6 (charter ratification) and A8 (branch
flow) were decided by the sponsor, and Section B (the project intake for a
CHIP-8 virtual machine in SystemVerilog) was signed and recorded in commit
`fe5dea7` under `J-orchestrator-0040`. **A9 is the last row besides the
sponsor's A7**, and it is deliberately the org's first spawn: if the audit
lane does not work, nothing downstream of it can be trusted either.

Two facts about the window you should have before you start, both stated by
the orchestrator against itself:

1. **This copy was found unfounded by prose, not by machine.** The board's
   `This repository` line disagreed with `origin`, and the `R-ROLE-1` CI check
   did not fire, because it compares origin against a `canonical-shell` claim
   only and this copy claimed `org-generic`. CI ran green over the entire
   history of a repository whose own state file asserted it was a different
   repository. Run `31012592559` is that green run.
2. **`fe5dea7` is an orchestrator commit that no one has reviewed.** The
   orchestrator's write scope is everything, so R1 (one agent per commit) is
   audit-enforced there, not machine-enforced — your charter §3 names this
   explicitly as *your* check.

## 2. The task

1. **R1–R10 conformance over the window.** Verify CI actually ran and was not
   bypassed, then check what CI cannot: that `fe5dea7`'s trailer attribution
   matches the diff's real author-agent (R1), and that its
   `Files-in-this-commit` list set-equals its changed paths (R4) — re-derive
   both from the diff rather than trusting the entry.
2. **Journal vacuity sampling.** Sample entries across the window for
   WHAT-without-WHY (PROTOCOL §4.1). `J-orchestrator-0040` is a mandatory
   sample: it is long, it was written by the agent that also committed it, and
   nobody else has read it.
3. **The G0 checklist's own integrity.** Every signed row cites
   `J-orchestrator-0040`. Verify each cited signature is actually *supported*
   by that entry's text, and that the transcription rule (PROTOCOL §7) was
   honored — in particular row **A6**, whose authority is a *relayed* sponsor
   decision, not a journaled agent signature. The orchestrator recorded that
   the sponsor first answered "no preference", read it as ratification, then
   received explicit confirmation. Judge whether the record states its own
   provenance honestly.
4. **The Section C harvest block** (charter §5, gate-audit row). Check span
   tiling by arithmetic against the B6 fork-point baselines; check `LC-01`'s
   LH1/LH2-g/LH3 claims hold at the grade claimed; check `WS-01`'s failed
   criterion is named honestly; check no yield cell carries a count. A padded
   yield is a finding; a declared nil is not.
5. **Evidence re-execution** (charter §3, mandatory). Re-run a sample of
   `J-orchestrator-0040`'s Evidence claims at the pin and record
   observed-vs-claimed: at minimum `scripts/test_protocol.sh`,
   `scripts/check_journals.sh --all`, and the `git ls-remote` result for the
   org generic. Quote what you observed, not what the entry said you would.
6. **MACHINE vs PROSE audit** (`CLAUDE.md` iron rule, ADR-0002/0016). Sample
   the enforcement claims made in `tasks/BOARD.md`, `README.md`, and
   `docs/gates/G0-checklist.md` at the pin and check each is tagged at the
   right class. A claim that a script refuses something, where no script
   refuses it, is a finding regardless of how reasonable the prose is.
7. **Escalation discipline** (charter §3, "audit the orchestrator itself").
   PROTOCOL §8 admits only E0–E6. Judge whether what the orchestrator escalated
   to the sponsor, and what it decided alone, fell on the right side of that
   line — including its decision to treat the inherited feature freeze as never
   having bound this repository, and its decision to defer filing the shell
   defect.

## 3. Constraints

- **You never run git.** No `git commit`, no `git push`, no branch operations.
  Read-only git inspection (`git log`, `git show`, `git diff`) is expected.
- **Write scope is absolute**: `docs/reports/audit/**` plus your own journal.
  If you believe a file outside that scope must change, that is a finding with
  a named owner, never an edit.
- **Numbering**: this report is `AUD-0001` — allocated here by the
  orchestrator as sole committer (PROTOCOL §3). Number your findings
  `AUD-0001-F1`, `AUD-0001-F2`, …
- **Check-in expectation, armed at issue time** (PROTOCOL §3 / L-E08): this is
  a single-pass audit with no long-running jobs; return in one pass. If you
  find yourself unable to complete a numbered task above, return early with a
  NO-VERDICT on that task rather than guessing — a partial audit that says
  which parts are partial is worth more than a complete-looking one that is not.
- **Adverse-party fidelity** (charter §8): the subject of most of this window
  is the orchestrator — the same agent that spawned you, will commit your
  report, and will relay your findings. Write as if it will be read by someone
  who does not trust that arrangement. Your charter §7 provides the structural
  compensating control: your report is a committed file the sponsor reads
  unmediated.

## 4. What I expect back

- The two files named in Deliverables, written into the working tree.
- A verdict from the report's vocabulary, stated once and unambiguously.
- Every finding carrying a checkable citation: SHA, `file:line`, packet path,
  or `J-<agent>-NNNN`.
- Your journal entry's **Reasoning** section recording the **sampling frame**:
  what was in the window, what you sampled, what you deliberately skipped and
  why (charter §8 — an audit whose sample cannot be reconstructed is itself
  vacuous).
- Your **Trigger** section carrying the spawn short-id verbatim.
- **Grading**: no lead reviews you — you are graded by the sponsor alone
  (ORG_CHART, Independence lines). The orchestrator will transcribe your
  verdict into this packet's Return log under its own trailer (PROTOCOL §3,
  auditor exception) and relay your findings **verbatim**, CRITICAL findings
  as class E4.

---

## Return / verdict log

<!-- Appended on RETURNED / ACCEPTED / BOUNCED — newest at the bottom.
     The auditor's verdicts are transcribed here by the orchestrator
     (PROTOCOL §3). -->

- `RETURNED` 2026-08-05 — auditor, `J-auditor-0001`: report committed at
  `93fd657` as
  [`docs/reports/audit/AUD-0001-g0-retro-audit.md`](../../docs/reports/audit/AUD-0001-g0-retro-audit.md).
  **Transcription note (PROTOCOL §3 auditor exception; L-E02 — transcription
  is clerical and the transcriber states the relay limit):** the auditor
  cannot stage this packet, so the orchestrator writes this row under its own
  trailer. Authority is the auditor's committed report and journal entry, not
  this row. **The transcriber is the audited party**; nothing below is
  paraphrased, and the report is the governing text wherever it and this row
  could be read to differ.

  Verdict, quoted verbatim from `AUD-0001` §Verdict:

  > **PASS WITH FINDINGS.**
  >
  > **0 CRITICAL · 4 MAJOR · 6 MINOR.** No finding blocks a gate.
  > G0 row A9 may be signed against this report; G0 itself remains open on
  > its own terms (A7 at the pin).

  Findings: F1, F2, F3, F4 MAJOR; F5–F10 MINOR. Four are against the
  orchestrator (F1, F3, F4, plus F2's local half); F2's root cause and F7 are
  shell defects; F8 is inherited and non-remediable. **No E4 relay is owed** —
  E4 carries CRITICAL findings and there are none — but the full finding set
  was relayed to the sponsor unsummarized regardless.
- `ACCEPTED` 2026-08-05 — orchestrator, `J-orchestrator-0043`: DoD met.
  Deliverables are exactly the two the packet required, write scope was
  respected absolutely (262 insertions / 0 deletions on the auditor's journal;
  no non-`docs/reports/audit/**` path staged), every finding carries a
  checkable citation, the sampling frame is reconstructible, the spawn
  short-id appears verbatim in Trigger, and the NO-VERDICT rows are declared
  rather than skipped. **F10 is a finding against this packet and it is
  upheld, not contested.**
