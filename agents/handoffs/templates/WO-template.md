# WO-NNNN: <title>

<!-- Copy to agents/handoffs/WO-XXXX_<slug>.md. Drafts use a placeholder id;
     the orchestrator allocates the real NNNN at first commit (PROTOCOL §3).
     Delete these comments when instantiating. -->

- **State**: DRAFT <!-- DRAFT → ISSUED → RETURNED → ACCEPTED | BOUNCED -->
- **From** / **To**: <agent> → <agent>
- **Spec basis**: <docs/specs/… sections and REQ-### ids — the authority this
  packet acts under; a WO with no spec basis says why (e.g. process work)>
- **Deliverables**: <files to produce, every one inside the assignee's write
  scope (PROTOCOL §6)>
- **Definition of done**: <spec section satisfied | required tests and how to
  run them | journal entry appended | docs touched, or "no doc impact">
- **Context provided**: <the exact files/excerpts handed to the assignee —
  a tb_writer WO deliberately omits RTL source (PROTOCOL §10); state what was
  deliberately withheld, not only what was given>
- **Standing lessons in force**: <entry ids from the `docs/LESSONS.md` core
  and the BOARD-declared packs that bind this task, each with a one-line
  statement of what it requires here — filled by the issuing lead
  (ADR-0012); "none apply" is declared, never omitted>
- **Out of scope**: <explicit exclusions — what a reasonable assignee might
  do and must not>

## 0. Standing obligations on every assignee (do not delete)

<!-- Added 2026-08-05 after two agents in one cycle returned work products
     with no journal entry, and after AUD-0002-F7 found that NO spawn prompt
     had stated the consequence — so the fix belongs here, in the vehicle
     every packet inherits, not in one prompt's wording (L-F02: the packet
     template is the real rule-propagation vehicle). -->

These bind you whatever else this packet says. They are not boilerplate;
each one is machine-enforced and will refuse your work if unmet.

1. **Your journal entry is a hard precondition, not a deliverable you can
   defer.** `scripts/agent_commit.sh` refuses any commit that stages work
   products without a pure end-of-file append to *your* journal (**R2 —
   work without journal**). Your files cannot land at all without it, and
   **no one can write it for you**: PROTOCOL §4 bars every agent from
   writing another agent's journal. Append it in the same pass as the work.
2. **`Files-in-this-commit` must set-equal the commit's changed paths**,
   excluding your own journal (**R4**, PROTOCOL §4.2). Count the packet's
   own Return log if you updated it — packet participants execute their own
   lifecycle (§3), so that edit is yours and it is a changed path.
3. **Append only.** Nothing above the last byte of your journal may change
   (**R3**). Corrections append; they never rewrite (**L-A04**).
4. **Entry ids are strictly monotonic across your whole volume chain**
   (**R5**, **R10**) — derive the next id from the chain, not from the base
   file.
5. **Stay inside your write scope** (**R7**, PROTOCOL §6). A path outside it
   is refused at commit time. If you believe a file outside your scope must
   change, that is a finding with a named owner, never an edit.
6. **You never run git.** The orchestrator is the sole committer
   (PROTOCOL §2). Read-only inspection (`git log`, `git show`, `git diff`)
   is expected and encouraged.
7. **Provenance classes on every claim** (**L-B01**): *measured* (the
   command is shown), *derived* (the derivation is shown), *relayed* (the
   source is named). A recollection is **relayed**, never measured —
   AUD-0002-F1 is a CRITICAL finding issued for exactly that error.
8. **Header timestamps are not ordering evidence** (**L-A07**); commit order
   is. Use a plausible current UTC, not a projected one (AUD-0002-F8).

## 1. Background

<Why this work exists now: the decision, defect, or gate row it serves.
Reference journal entries and prior packets by id.>

## 2. The task

<The ask, stated so the assignee can act from this packet plus the context
provided, without asking anyone. Numbered sub-items if separable.>

## 3. Constraints

<Standing rules that bind this work beyond the protocol: interfaces that may
not move, files that may not be read (with the enforcement stated honestly —
prompt + packet + audit, PROTOCOL §6), toolchain pins, check-in expectation
if the work can run long (armed here at issue time, PROTOCOL §3).>

## 4. What I expect back

<The shape of the return: files, the packet's Return-log entry, the journal
entry's required content (spawn short-id in Trigger for workers), and the
review that will grade it (which lead, against which criteria).>

---

## Return / verdict log

<!-- Appended on RETURNED / ACCEPTED / BOUNCED — newest at the bottom.
     Every entry cites its author's journal entry. The auditor's verdicts are
     transcribed here by the orchestrator (PROTOCOL §3). -->

- `RETURNED` <UTC date> — <assignee>, `J-<agent>-NNNN`: <one line — what came
  back, where it lives>
- `ACCEPTED | BOUNCED` <UTC date> — <reviewer>, `J-<agent>-NNNN`: <verdict
  basis; on BOUNCE, the RV- packet carrying the defect list>
