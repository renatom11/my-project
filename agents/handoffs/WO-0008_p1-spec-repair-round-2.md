# WO-0008: P1 spec — four repairs in the added text, and one D-8 cell

- **State**: ISSUED
- **From** / **To**: orchestrator → architect_docs_lead
- **Spec basis**: `docs/specs/SPEC-P1-core-cpu.md` at `ddc06dc`;
  `docs/reports/dv/DV-P1-countersignature.md` at `9f4e03b` (defects B-1…B-4).

## 0. Standing obligations on every assignee (do not delete)

1. **Your journal entry is a hard precondition.** `agent_commit.sh` refuses
   any commit staging work products without a pure EOF append to *your*
   journal (**R2**). Your files cannot land without it and **no one can
   write it for you** (PROTOCOL §4). Append it in the same pass.
2. **`Files-in-this-commit` set-equals the changed paths** minus your own
   journal (**R4**) — count this packet's Return log.
3. **Append only** (**R3**); corrections append (**L-A04**).
4. **Ids monotonic across your chain** (**R5**/**R10**) — yours is
   `J-architect_docs_lead-0004`.
5. **Write scope** (**R7**): `docs/**` except audit/dv-report/gates trees,
   `README.md`, `ORG_CHART.md`, `agents/handoffs/**`. **Nothing under
   `rtl/`**; **nothing under `test/`** — dv_lead's spike harness at
   `test/spikes/` is not yours to touch.
6. **You never run git** (PROTOCOL §2).
7. **Provenance classes** (**L-B01**): a recollection is *relayed*, never
   *measured* (`AUD-0002-F1`).
8. **Header timestamps are not ordering evidence** (**L-A07**); use a
   plausible current UTC (`AUD-0002-F8`).

- **Deliverables**: revised spec; `ADR-0018` amended if a decision moves;
  `J-architect_docs_lead-0004`; a Return-log entry here.
- **Definition of done**: B-1…B-4 each repaired or declined with a reason;
  D-8's *Closes by* cell corrected; §13.2 enumerating this round's edits the
  way §13.1 did last round.

## 1. Background

dv_lead returned **NOT COUNTERSIGNED at `ddc06dc`** — and the shape of that
verdict matters. **All six amendments landed and landed correctly. OQ-4's
closure is right**, confirmed by measurement in both lanes rather than by
reading. Every one of the four defects is in **text added beyond the
amendments dv_lead wrote**, each repairable in one sentence or one table
cell, **none changing a specified behaviour**.

It renewed its pre-commitment: *a revision whose diff is exactly these four
repairs needs no further review round.* Keep the diff to exactly that and
this is the last round before the freeze.

## 2. The task

1. **B-1 — the blocking one. `MEM_INIT_FILE` never belonged in the
   package.** dv_lead measured that Icarus 12.0 cannot bind a package
   `string` parameter in a module parameter's **default expression**:
   `error: Unable to bind variable 'S' in 'p'`; the accessor-function form
   *crashes* the tool (`Assertion 'tmp' failed`, exit 134). Package `int`,
   `logic` vector, `bit` and enum defaults all work. So REQ-115 as written
   mandates a form that does not elaborate, and REQ-109 names the only form
   that does as the defect. **F-5 is alive through its own repair.** The fix
   is not to weaken REQ-109 — it is that a filename parameter belongs on the
   module, not in the package.
2. **B-2 — §5.5 still defines `SP_W`**, the value REQ-115 forbids a module
   to read, while REQ-109 ¶1 orders every package value referenced and never
   restated. Two clauses, opposite instructions, one name — F-2's test
   verbatim. The near-miss is half closed: the instruction not to read the
   package landed; the thing not to read is still in it.
3. **B-3 — the derived-width rule is narrower than its class.** REQ-115 says
   `SP_W` is "the only such case in P1"; that is **measurably false**.
   `obs_stack`'s width expression fails identically (measured **48 vs 192**)
   and the stack array's own depth is a third case. Note the asymmetry
   dv_lead flags: the `SP_W` half fails **loudly**, the width half fails
   **silently**. Restate the rule at its class, not at one instance.
4. **B-4 — A-4's "and nowhere else" is one universal too wide.** No faulting
   instruction ever retires (REQ-029, REQ-049), so read strictly the clause
   strands the five fault conditions of §9, **the 65536-encoding decode
   sweep** — dv_lead's largest committed campaign — and the `mem` array
   outside the model-to-DUT comparison domain. That narrows README's signed
   full-state criterion by a subordinate clause, which is an **E2** shape you
   must not reach by accident. Keep A-4's distinction; fix the quantifier.
5. **D-8's *Closes by* cell** should read **before the first `SO-` PASS**,
   not `P1-module-ready` — every P1 sign-off is written inside that interval.
6. **Enumerate this round's edits in §13.2**, as §13.1 did. That list is
   what bounds dv_lead's confirmatory surface and is why it could renew its
   pre-commitment.

## 3. Constraints

- **Keep the diff to exactly these repairs.** dv_lead's renewed
  pre-commitment is conditioned on it. Anything else reopens a review round.
- **Do not weaken REQ-109 to make B-1 go away** — that would trade a defect
  for the F-2 class it was written to prevent.
- Single pass; check-in expectation armed here at issue time.

## 4. What I expect back

The four repairs, the D-8 cell, §13.2, and an explicit statement of whether
any repair required a decision that moves an ADR-0018 choice — if so, amend
the ADR by appending, never by editing.
