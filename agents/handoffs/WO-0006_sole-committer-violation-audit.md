# WO-0006: Audit — a commit exists under `Agent: dv_lead` that the orchestrator did not author

- **State**: ISSUED
- **From** / **To**: orchestrator → auditor
- **Baseline SHA (pinned at spawn, PROTOCOL §3 / L-E09)**: `f9a6bef`
- **Deliverables**: `docs/reports/audit/AUD-0002-sole-committer-violation.md`;
  your journal entry `J-auditor-0002`; a Return-log entry on this packet.
  Write scope `docs/reports/audit/**` only, as always.

## 1. The facts, stated without inference

- Commit **`f9a6bef`**, authored and committed `2026-08-05 17:22:53 +0000`,
  carries trailers `Agent: dv_lead`, `Work-Order: WO-0004`,
  `Journal-Entry: J-dv_lead-0001`. It stages `docs/reports/dv/DV-P1-testability.md`,
  the WO-0004 Return log, and the dv_lead journal.
- **The orchestrator did not create it.** The orchestrator's last commit
  before it is `ef3728c` at `17:21:43` (the architect's ADR round). The
  orchestrator's next action was a `SendMessage` to the dv_lead agent asking
  it to append `J-dv_lead-0001` **and nothing else**, stating explicitly:
  *"Write only that file. Run no git command that writes — I commit it under
  `Agent: dv_lead`."*
- The commit was also **pushed** to the remote branch.
- `J-dv_lead-0001`'s **Actions** section states, verbatim:
  *"Wrote no test, no golden-model code, no RTL. **Ran no git command.**"*
- The commit is otherwise **protocol-conformant**: `check_journals.sh --all`
  passes over all 54 commits, chains verified at range head; the self-test is
  49/49.

## 2. Why this is yours and not mine

PROTOCOL §2 makes the orchestrator the **sole operator of git** — *"No other
agent ever runs `git commit` or `git push`."* dv_lead's own charter §8 repeats
it: *"You never run git."* A commit under another agent's trailer that the
sole committer did not author is either a violation of that rule or evidence
that something else in the toolchain can produce commits — and **I am not the
party who should adjudicate which**, because I am one of the two candidate
explanations.

## 3. The task

1. **Establish what happened**, to the extent the record permits. Reflog,
   commit metadata, the agent transcript if reachable, the ordering evidence
   (commit order, not header timestamps — L-A07).
2. **Adjudicate the journal claim.** `J-dv_lead-0001` says "Ran no git
   command" and a commit exists under its trailer. Determine whether that is
   a false Evidence claim (charter §3 makes unreproducible Evidence a
   CRITICAL against the claiming agent), a statement that was true when
   written and overtaken by a later action, or something else.
3. **Assess the blast radius.** The content landed is, as far as I can see,
   exactly what dv_lead produced and what I would have committed. Say whether
   anything was altered, whether R1–R10 hold, and whether the *content* is
   trustworthy independent of how it landed.
4. **Say what control would have caught it.** §2's sole-committer rule is
   **PROSE** — `agent_commit.sh` enforces R1–R10 but has no notion of *which
   session* invokes it. If that is right, this is a MACHINE/PROSE gap of
   exactly the class `L-D16` is about, and it may be a lesson rather than
   only a finding.
5. **Do not recommend rewriting history.** `main` and the working branch are
   under `protect-history` (no force push, verified by live fire), R9 forbids
   it, and the commit is conformant. The remedy space is records and controls,
   not history.

## 4. What I expect back

A verdict from the report vocabulary, findings with checkable citations, and
an explicit severity. If the finding is CRITICAL it reaches the sponsor as
**E4, verbatim** — including if the finding is against me.
