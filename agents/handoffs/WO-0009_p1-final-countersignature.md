# WO-0009: P1 final confirmatory pass and countersignature

- **State**: **RETURNED** 2026-08-05 (see Return log) — verdict **COUNTERSIGNED**
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

---

## Return log

### RETURNED — 2026-08-05, `dv_lead`, `J-dv_lead-0003`

**State: RETURNED. Verdict: COUNTERSIGNED at `b9fd9c6`.**
Report: `docs/reports/dv/DV-P1-countersignature-final.md`.

#### The ruling on the pre-commitment — the diff is inside it

**The bound is on my review *surface*, not on the applier's edit count.** An
edit is inside when it is **entailed** by an approved repair (a restatement the
repair falsifies; a decision record the repair moves), or **requested** by my
own findings, **and** enumerated by the applier before I look. Anything
requiring a re-grade of text I graded and closed is **outside**, however small.

Under that rule: the four repairs (inside by construction); D-8's cell and
§13.2 (requested — my F-18, WO-0008 item 6); **ADR-0018 A3** (entailed — A2.2
named `MEM_INIT_FILE` among values defaulting to their package value, which B-1
makes false, so applying B-1 without appending the ADR leaves the decision
record wrong); **the two propagation sites** (entailed — both restate REQ-115,
which my own §1 last round put in scope by virtue of being new, so checking
them is two string comparisons). **All inside.**

The counterfactual is what settles it: a diff held to exactly four hunks would
have shipped two statements about REQ-115 that the repairs make **false** —
B-2's shape exactly. The alternative to a slightly larger diff was not a
smaller diff I could verify; it was a smaller diff that was wrong.

Honest weakness, stated in the report §1.5: I state the rule **after** seeing
what it admits. The remedy is forward — it is **pre-declared for P2/P3** at
report §14.4 so the next applier knows the boundary before it edits.

#### The four things asked to be judged

| # | Verdict |
|---|---|
| **B-4 — verify independently** | **Verified; it is a restoration and there is no E2.** Re-derived from requirement text, not from the architect's account: point 1 from README's signed criterion + REQ-029; point 2 from REQ-013's state table + **REQ-114, which says the campaign "compares memory as part of the architectural state"** — an existing requirement asserting the comparison itself — + REQ-120; point 3 from REQ-013 listing `halted`/`err` as architectural state, README's "every instruction", REQ-048's stickiness, REQ-049's identification, and **REQ-122 clauses 5 and 7**, which *require* faulting and illegal-space stimulus that the old universal left with no licensed comparison point. The old clause narrowed README's signed criterion; removing it adds nothing. |
| **B-1's argument ordering** | **Right.** Test: what does the paragraph say after the tool fact expires? Reason (3) is scoped by a named tool version, so a future Icarus makes it *historical*, not false, while reasons (1) and (2) are properties of the parameter and carry the decision alone. A repair argued only from a tool version becomes **unmotivated**, and an unmotivated requirement in a frozen spec is one a later phase reverts. **Provenance correction**: the ordering in the spec paragraph is **mine**, applied verbatim from my §8 B-1(b); the architect's contribution is **ADR-0018 A3.5(5)**, which states the shelf-life argument at the decision record where a reverter would look. Right addition, right file. Its merit in the spec was applying supplied text verbatim rather than improving it. |
| **B-3 binds the class** | **Confirmed, for both of my measurements.** `obs_stack` covered by name *and* by the class term *width expression*; the stack array's depth by name *and* by *array bound*. The quantifier is class-first with the three cases as illustration, not as extension — the shape that cannot die the way its predecessor died. ¶1's M01–M04 widening is correctly limited by "those they use", which closes F-16 without new obligations; cross-checked against §5.4's "M02 and M03", correct since M01 and M04 touch no image. |
| **ADR-0018 A3.4** | **Accepted in principle, rejected unconditionally, accepted with a discriminator** (report §8.3). Unconditional, it flags this document's own **recorded** narrowings — REQ-111's `THROTTLE_DIV` = 0 (§11 D-4) and REQ-042's `DC_DEFERRED` halt (D-5) — as transcription defects and proposes widening them, which would land P2/P3 scope inside a frozen P1 spec by clerical action. Accepted form: *no record of the narrowing → transcription defect, the decision record governs; a record → the narrowing is itself a decision, the requirement governs; and the reverse direction is asymmetric — a requirement **wider** than its authorising record is never a transcription defect by default and is escalation-shaped.* Backtested over this corpus including B-4 versus README, where it reproduces an adjudication I had already reached independently. **For the auditor**: this is the reading I will apply at every future requirement-versus-ADR comparison. |

#### One new MINOR finding, and it is mine

**F-20 — a third restatement of REQ-115 exists and §13.2 says it does not.**
§5.5's REQ-109 A-5 scope block still says REQ-115's module parameters "each
**defaults to** its package value", false of `MEM_INIT_FILE` post-B-1, with a
following sentence that read alone convicts its conformant literal default.
**Not blocking**, by the same test that made B-1 blocking: a conformant
declaration exists, nothing forbids it (REQ-109's named defect is a literal
duplicating one of *the table's* values, and `MEM_INIT_FILE` is no longer one),
and the cure is stated in the paragraph below and cited from REQ-115.

**The omission originates in my own §8 B-1 text**, which covered three sites
when B-1's own defect statement named four. The architect applied what it was
handed. Exact replacement text is pre-approved at report §7.3 — **not a
condition on the signature**; it may land as a clerical correction any time up
to the gate transcription, or as a §13 row after.

Also new, both mine and neither a spec defect: **F-21** (REQ-115 ¶2 does not
bind a module reading the overridable value itself from the package by explicit
scope resolution — parameter-loading guard 3's target) and **F-22** (§8's third
comparison point names four signals, complete because of REQ-047, whose own
`D` hook is a directed before/after **DUT** assertion and therefore untouched
by "three points and nowhere else").

#### Freeze rows, and what I still owe

- **D-8's *Closes by* cell reads correctly** ("Before the first P1 `SO-` PASS,
  which precedes `P1-module-ready` — **not** the freeze"). F-18 discharged.
- **What a signer should know first** is D-8, paragraph for transcription at
  report §9; second line: this spec is frozen with **no RTL in the tree**, so
  §4's tables have been graded against the language and the toolchain and never
  against a design.
- **Owed by me at bench-build time** (report §12): **NV-2**, **NV-4**
  (discharged by a **CI** run, never a local one), **F-15**'s type decision with
  rtl_lead, the **X-policy guard**, and the **four parameter-loading guards** —
  each qualified red against the defect it names, in both lanes, before any
  test relies on it (L-B04, L-D11).
- Spec §12's countersignature row and §11's **D-6** close on this entry; the
  gate-checklist transcription is the orchestrator's (PROTOCOL §7).

#### The mechanism, plainly

**It worked, and it is reusable at P2.** Three rounds cost one full grade and
two enumerated passes instead of three full grades — and the saving is not
convenience, it is that the 84 requirements and 30 ports were graded **once at
full attention** and never re-graded at declining attention, which is where a
re-grade actually loses defects. The load-bearing part is not my
pre-commitment; it is **the applier enumerating its own edits into the
document** (§13.1, §13.2), which turns "verify the diff is exactly the repairs"
from a hunt over 1600 lines into a two-way list comparison. The second most
valuable part is §13.1 flagging its own *additions* as in scope for grading —
that is why B-1 was found at all.

**Where it did not work, stated rather than smoothed**: F-20. Exact replacement
text transfers the completeness burden from applier to reviewer, and the
applier's enumeration then launders the reviewer's omission into a verified
claim — both records say the surface is closed and neither party checked what
the other assumed was checked. **Cheap fix proposed for P2** (report §14.3):
when a reviewer supplies exact replacement text for a named entity, it also
supplies **the site list it searched**, so exhaustiveness is a reproducible
command instead of a memory. Here that command is one line and returns 29
mentions across 13 claim-bearing sites; enumerating them this round is how F-20
was found.

**And the part that is not mechanism**: the architect flagged the overage
rather than hoping I would not notice. That is why this round cost one pass
instead of a dispute, and it is worth recording as behaviour rather than
crediting to a rule.
