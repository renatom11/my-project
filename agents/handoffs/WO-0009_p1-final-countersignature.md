# WO-0009: P1 final confirmatory pass and countersignature

- **State**: ISSUED
- **From** / **To**: orchestrator → dv_lead
- **Spec basis**: `docs/specs/SPEC-P1-core-cpu.md` at `b9fd9c6`; its **§13.2**
  (this round's enumerated edits); `docs/adr/ADR-0018` **Amendment A3**;
  your own `docs/reports/dv/DV-P1-countersignature.md` (B-1…B-4).

## 0. Standing obligations on every assignee (do not delete)

1. **Your journal entry is a hard precondition.** `agent_commit.sh` refuses
   any commit staging work products without a pure EOF append to *your*
   journal (**R2**); nobody can write it for you (PROTOCOL §4).
2. **`Files-in-this-commit` set-equals the changed paths** minus your own
   journal (**R4**) — count this packet's Return log.
3. **Append only** (**R3**); corrections append (**L-A04**).
4. **Ids monotonic across your chain** (**R5**/**R10**) — yours is
   `J-dv_lead-0003`.
5. **Write scope** (**R7**): `test/**`, `tools/**`, `docs/reports/dv/**`,
   `agents/handoffs/**`. Never `rtl/**`.
6. **You never run git** (PROTOCOL §2).
7. **Provenance classes** (**L-B01**) — a recollection is *relayed*, never
   *measured* (`AUD-0002-F1`).
8. **Header timestamps are not ordering evidence** (**L-A07**), use a
   plausible current UTC (`AUD-0002-F8`).

- **Deliverables**: `docs/reports/dv/DV-P1-countersignature-final.md`;
  `J-dv_lead-0003`; a Return-log entry here.
- **Definition of done**: one unambiguous verdict, and — if it is
  **COUNTERSIGNED** — an explicit statement of what a sponsor signing the
  freeze should know first.

## 1. Background

You pre-committed that *a revision whose diff is exactly the four repairs
needs no further review round*. The architect applied all four, moved one
ADR decision (appended as A3, never edited), and **enumerated the round's
edits in §13.2** so this pass is bounded by a list rather than by diff.

**The diff is slightly larger than "exactly the four repairs"**, and the
architect flagged it rather than hoping you would not notice. Beyond
B-1…B-4 it contains: D-8's *Closes by* cell, §13.2 itself, ADR-0018 A3, and
**two propagation sites the repairs make false** — §4.C's "M03's parameters"
parenthetical and §10's REQ-115 registry row (description column only; the
hook column untouched, so §10 stays byte-identical to `requirements.md` on
the column you diffed mechanically). Its argument: leaving them keeps the
repaired defect alive at a different address, which is the failure §13.1
named last round.

**Whether that is inside your pre-commitment is yours to say**, not mine and
not the architect's. If it is, this is the last round.

## 2. The task

1. **Confirm B-1…B-4 over §13.2's enumerated surface.** Note what the
   architect did beyond applying B-1 as written: it put the *weakening of
   REQ-109* on the record as a **losing alternative with its cost** in ADR-0018
   A3.3, and ordered the spec's justification per-test-input **first** and the
   tool measurement second — so the reason survives a future Icarus that binds
   package strings. Judge whether that ordering is right.
2. **Judge the two propagation sites** against your pre-commitment. Say
   plainly whether the diff stayed bounded.
3. **B-3's fix claims to bind the class**, not the instance: any parameter,
   width expression or array bound, naming all three P1 cases. Confirm it
   actually covers `obs_stack` and the stack array's depth, since those were
   your measurements (48 vs 192).
4. **B-4 was applied as a restoration, and the architect checked before
   editing** — it verified all three comparison points are already required
   by README's signed criterion and by four existing REQs, so naming them
   restores rather than narrows. **Verify that independently.** If it is
   wrong, a scope change has landed inside a repair round, which is the worst
   place for one to hide.
5. **ADR-0018 A3.4 records that a requirement narrower than the ADR
   authorising it was a *transcription defect, not a decision*.** That
   distinction bears on how you read every future requirement against its
   ADR. Say whether you accept it.
6. **Then countersign, or do not.** If COUNTERSIGNED, name what a signer
   should know first — the architect nominates **D-8**, and you already said
   its handling satisfies you with the *Closes by* cell corrected. Confirm
   the cell now reads correctly.
7. **State what you still owe** at bench-build time: NV-2, NV-4, F-15, the
   X-policy guard, and the four parameter-loading guards.

## 3. Constraints

- **Do not re-open the 84 requirements or the 30 ports** you graded and
  closed, nor anything confirmed in the second pass.
- Single pass; check-in expectation armed here at issue time.

## 4. What I expect back

The report, the journal entry, one verdict, and — whichever way it goes —
a plain statement of whether the bounded-diff discipline worked. If it did,
say so: it is the mechanism that turned two rejections into three cheap
rounds instead of three re-grades, and it should be reusable at P2.
