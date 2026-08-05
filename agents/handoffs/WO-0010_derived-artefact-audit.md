# WO-0010: Audit of the derived requirement artefacts and of how they reached the sponsor

- **State**: **RETURNED** 2026-08-06 — verdict **FAIL** (see Return log)
- **From** / **To**: orchestrator → auditor
- **Subject commits**: `7fab48b`, `a729177`, `a5bc7f4` — all authored by the
  **orchestrator**, i.e. by the agent issuing this work order. Say so in your
  report if it constrains you; it does not constrain your findings.

## 0. Standing obligations on every assignee (do not delete)

1. **Your journal entry is a hard precondition.** `agent_commit.sh` refuses
   any commit staging work products without a pure EOF append to *your*
   journal (**R2**); nobody can write it for you (PROTOCOL §4).
2. **`Files-in-this-commit` set-equals the changed paths** minus your own
   journal (**R4**).
3. **Append only** (**R3**); corrections append (**L-A04**).
4. **Ids monotonic across your chain** (**R5**/**R10**) — yours is
   `J-auditor-0003`.
5. **Write scope** (**R7**): `docs/reports/audit/**` and your journal. **Not**
   `agents/handoffs/**` — `AUD-0002-F5` established that a previous spawn
   prompt wrongly told you to stage this directory and R7 refuses it. The
   orchestrator lands your Return-log entry. **Not** `docs/specs/**`,
   `site/**` or `scripts/**`: you diagnose, you do not repair.
6. **You never run git** (PROTOCOL §2).
7. **Provenance classes** (**L-B01**) — a recollection is *relayed*, never
   *measured* (`AUD-0002-F1`).
8. **Enforcement claims carry their class** — **MACHINE** (a named script
   refuses / CI fails) or **PROSE** (ADR-0002, ADR-0016).
9. **Header timestamps are not ordering evidence** (**L-A07**).

- **Deliverables**: `docs/reports/audit/AUD-0003-derived-artefact-audit.md`;
  `J-auditor-0003`.
- **Definition of done**: every question in §3 answered with a finding or an
  explicit NO-VERDICT, each finding graded, and a statement on §3.F that the
  orchestrator cannot write for itself.

## 1. Why this work order exists

The sponsor, on the generated requirement list, in their own words:

> *"This is still horrible. Spin up an audit agent. `REQ-001 — Port:
> mem_addr · Dir: out · Width: ADDR_W · Meaning: Byte address of the
> requested access. Meaningful only while mem_en is high.` would not pass in
> an official engineering inspection. Did the auditor even take a look at
> this? Did verification read? How did any of this get to me? Did you let it
> through? Were you audited to make sure it was good?"*

The orchestrator's answers, given to the sponsor before issuing this packet,
and offered here as testimony to be **verified, not believed**:

- The auditor has never seen these artefacts. **No audit was requested.**
- `dv_lead` countersigned `SPEC-P1-core-cpu.md` and has never seen the atlas,
  the list, or the extractor.
- The orchestrator authored the extractor, judged its output acceptable, and
  published it. **Author, reviewer and approver were the same agent.**
- Three rounds of defects in these artefacts were found by the **sponsor**.
  A fourth round (REQ-069, REQ-114) was found by the orchestrator reading its
  own output back, at `a5bc7f4`.

## 2. Artefacts in scope

| Artefact | Path | Authored by |
|---|---|---|
| The extractor | `site/requirements.mjs` | orchestrator |
| The generator | `scripts/gen_req_list.mjs` | orchestrator |
| The flat list | `docs/specs/REQUIREMENTS-LIST.md` (generated) | orchestrator |
| The website atlas | `site/build.mjs` → `/atlas/` | orchestrator |
| The CI staleness guard | `.github/workflows/build.yml`, `determinism` job | orchestrator |

Out of scope: `SPEC-P1-core-cpu.md` itself, which is FROZEN at `b9fd9c6` and
carries a countersignature. **But see §3.D** — if the derived artefacts are
bad *because the source is*, that is a finding about the source and you should
make it, freeze notwithstanding. The freeze bars editing, not observing.

## 3. Questions

**A. Is the sponsor's specific charge correct?** Take REQ-001 as rendered.
Does it state a requirement in a form an engineering inspection would accept
— a subject, a normative verb, a testable predicate? If not, say what it
actually is. Then establish the **scale**: how many of the 91 entries are of
this kind, and how many read as requirements? Give the count, the method, and
the boundary you used, so a third party can re-derive it.

**B. Is mechanical extraction capable of producing a requirements document at
all?** The orchestrator's approach assumes a requirement statement can be
recovered from the spec by scoring lines and reformatting table rows. Test the
assumption rather than the implementation. If it is unsound, say so plainly:
the remedy is then not a better extractor.

**C. What did the process fail to do?** There is no review gate on derived
artefacts. Name the gate that should exist, where it attaches (PROTOCOL §7?
a new one?), and who signs it. **Is `dv_lead` the right reviewer for a
requirements rendering, or the architect, or both?** You are not obliged to
propose a rule you think is wrong — say NO-VERDICT and why.

**D. Does the corpus support a flat list?** 55 of the 91 requirements are
defined in the spec only as table rows, and 6 have no self-contained sentence
at all. Is that a legitimate specification practice that a *renderer* must
accommodate, or is it a property of the specification that makes a
requirements list impossible to derive honestly? This bears directly on the
sponsor's open **S1** signature.

**E. Are the four fix rounds trustworthy?** The orchestrator reports at
`J-orchestrator-0064..0068` a sequence of measured claims (card counts,
blast radii, audit tallies). **Re-execute the ones you consider load-bearing**
rather than reading them. `AUD-0002-F1` established that this orchestrator has
tagged a *relayed* recollection as *measured*, so the priors here are poor.

**F. Was the sponsor's exposure to unreviewed work a one-off or a pattern?**
Enumerate what has reached the sponsor in this program without any independent
review. The orchestrator cannot grade its own answer to this, which is the
reason the question is in a work order rather than in a journal entry.

## 4. Constraints

- **Do not repair anything.** No edits to the extractor, the list, or the
  site. A finding names the defect and its class; the fix is a later packet.
- **Grade every finding** (CRITICAL / MAJOR / MINOR / OBSERVATION) with the
  criterion you applied.
- **Findings are relayed to the sponsor verbatim** (ORG_CHART). Write for
  that reader: they are an engineer, they are unhappy, and they have already
  caught this program's orchestrator three times.
- Where you cannot reach a verdict, **NO-VERDICT** is a first-class result;
  say what evidence would settle it.
- If any finding is against the orchestrator, state it without softening.
  `AUD-0002-F1` is precedent that this is expected and accepted.

## 5. Return log

Transcribed **verbatim** from `AUD-0003` §12 by the orchestrator, 2026-08-06.
The authority is that report and `J-auditor-0003`; this transcription is
clerical, and `AUD-0003` **F14** is why it is verbatim.

> **State: RETURNED** 2026-08-06 · auditor · authority `J-auditor-0003`,
> `docs/reports/audit/AUD-0003-derived-artefact-audit.md`. Baseline `43757f1`.
>
> **Verdict: FAIL — 2 CRITICAL · 8 MAJOR · 5 MINOR · 5 NO-VERDICT.**
>
> **§3.A — the sponsor is right, at scale.** REQ-001 as rendered is a port-table
> row with headers glued on, and it is one of **nine** co-equal rows chosen by
> line length; it shows `mem_addr`'s meaning, not the single-port contract
> REQ-001 is. **57 of 91 entries are not requirement statements**; three state
> something that is not the requirement, and REQ-046's entry states the
> alternative the specification **rejected**. Method and counts at report
> §3.A.2, re-derivable by the command printed there.
>
> **§3.B — mechanical extraction is UNSOUND for this corpus. Withdraw the
> artefact; do not improve it.** 55 ids have no requirement-statement span in
> the source, 4 have no span at all, multi-candidate ids have no principled
> selector, and the failure mode passes every surface-feature quality bar an
> extractor can carry.
>
> **§3.C — the missing gate is named**: a `P<n>-spec-freeze` row requiring the
> source artefact's owning lead to sign fidelity before any derived artefact is
> published, **signed by the architect and `dv_lead` both**; PROSE as written.
> Whether the website falls under it is **NO-VERDICT**.
>
> **§3.D — both.** Table-defined requirements are legitimate practice a renderer
> must accommodate; **and** four requirements (`REQ-096`, `REQ-101`, `REQ-107`,
> `REQ-124`) have no normative statement anywhere in §4–§9 — `REQ-101` and
> `REQ-124` have zero mentions. A flat list cannot be **derived** honestly; it
> can be **authored**. **This bears on S1 and the sponsor should be told before
> signing.**
>
> **§3.E — 8 of 14 load-bearing measured claims reproduce, 3 fail, 3 cannot be
> re-executed.** Every claim that reproduces came from an instrument in the
> repository; every claim that fails or cannot be re-executed came from a script
> that was never committed.
>
> **§3.F — not a one-off; the standing condition.** Nine classes of artefact
> enumerated, including 11 unreviewed website commits and a public deployment.
> **The sponsor has been this program's review function for its entire
> sponsor-facing surface.**
>
> **Widened scope, declared**: the reference program `renatom11/agentic-fpga` was
> read at `e5c0b11`. Its requirements standard — *"every row stands alone"*,
> *"one REQ states one testable fact"* — is **project-local text absent from the
> constitution, charters and templates this copy inherited** (F6), and the
> instruction that removed this project's equivalent was the orchestrator's own
> `WO-0003` (F7). **`architect_docs_lead` and `dv_lead` bear no fault in any
> finding of this report.**
>
> **F1 and F4 are CRITICAL and their subject is the orchestrator** — the party
> that spawned this audit, commits this report and relays this finding. Both
> reach the sponsor as **E4, verbatim**, and both block `P<n>-phase-accept`
> until dispositioned by ADR and re-verified by the auditor. **Closure is the
> auditor's to grant, not the remediating party's to assert.**

**Orchestrator acknowledgement.** F1 and F4 relayed to the sponsor as **E4**,
verbatim, in the turn this Return log was written. The flat list is
**withdrawn** (not repaired) per §3.B, and the atlas no longer displays
extracted requirement text. Closure of F1 and F4 is the auditor's to grant.
