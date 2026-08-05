# WO-0008: P1 spec — four repairs in the added text, and one D-8 cell

- **State**: **RETURNED** 2026-08-05 (see Return log) — header corrected by the orchestrator, clerically; the packet's author had already written its Return log and could not amend the header after returning
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

---

## Return log

### RETURNED — 2026-08-05, `architect_docs_lead`, `J-architect_docs_lead-0004`

**State: RETURNED.** All four repairs applied, D-8's cell corrected, §13.2
written, ADR-0018 amended by appending. **The diff stayed bounded**, and §13.2
is the enumeration that lets `dv_lead` verify that by list rather than by hunt.

#### The four dispositions

| # | Disposition |
|---|---|
| **B-1** | **APPLIED as written**, all three parts. `MEM_INIT_FILE` leaves §5.5's *Other* row; §5.5 gains the paragraph saying why, with the measurement; REQ-115 carries the exception and the literal default `""`. **REQ-109 was not weakened** — the repair removes a definition site rather than licensing a restatement, so the F-2 class REQ-109 exists to close stays closed. The alternative that would have weakened it is recorded as a **losing** alternative in ADR-0018 A3.3, so the temptation is on the record with its cost rather than merely resisted. |
| **B-2** | **APPLIED as written.** `SP_W` leaves §5.5's *Widths and sizes* row; the value cell states why with the 5-against-3 measurement; §5.1 remains the single site defining the derivation, so REQ-109 loses nothing. |
| **B-3** | **APPLIED as written, both halves.** REQ-115 ¶2 now binds *any parameter, width expression or array bound* derived from an overridable parameter and names all three P1 cases. ¶1 now names **M01, M02, M03 and M04** with "those … that they use — M03 declares all of them", which closes **F-16** and stops REQ-115 requiring a RAM to declare `RNG_SEED`. The loud/silent asymmetry is recorded in §13.2 so a future reader cannot diagnose this as "the loud half, now fixed". |
| **B-4** | **APPLIED as written — and it was a restoration, not a scope change.** All three comparison points are already required by README's signed full-state criterion and by REQ-029/REQ-048/REQ-049/REQ-114/REQ-120; the too-wide universal narrowed them by a subordinate clause. A-4's distinction — mid-instruction `obs_*` is deterministic but unspecified, hence lane-to-lane comparable and not model-assertable — is preserved unchanged. **No E2 was reached**, and §13.2 states in the document that it would have been one had the quantifier been unfixable without moving scope. |

#### One decision moved, and it is ADR'd

**ADR-0018 Amendment A3**, appended not edited (L-A04): `MEM_INIT_FILE` and
`SP_W` leave the spec §5.5 package. A2.2 named `MEM_INIT_FILE` among the values
"defaulting to its `chip8_pkg` value", and after B-1 that is no longer true of
it — so B-1 is not merely a text repair, it moves the decision A2 recorded.
A2.7's own falsifier is what fired. A3 carries the losing alternatives
(weakening REQ-109; the accessor form, measured to abort the tool at exit 134;
keeping the entry with a named REQ-109 exception; repairing only the blocking
half), the consequences, and its own falsifier.

**B-3 moved no ADR decision** — the opposite. ADR-0018 A2.2 already stated the
general rule ("any width derived from an overridable parameter"); only REQ-115,
the normative site, stated the narrow one. The specification moved to the ADR,
and A3.4 records that a requirement narrower than the ADR authorising it was a
transcription defect. **B-2 and B-4 move nothing**: B-2 is a consequence of
A2.4, which stands entirely; ADR-0018 does not contain the "and nowhere else"
universal, so B-4 is confined to the spec.

#### Boundedness, stated exactly

Beyond the four repairs, the diff contains only: **D-8's *Closes by* cell**
(the WO's item 5, F-18); **§13.2** (item 6); **ADR-0018 A3** (§4's deliverable);
and **two propagation sites** that the repairs make false — §4.C's "M03's
parameters" paragraph (one parenthetical) and §10's REQ-115 registry row
(description column only; the hook column is untouched, so §10 stays
byte-identical to `docs/specs/requirements.md` on the column measured at
`DV-P1-countersignature.md` §9.6, and the matrix needs no edit). Both are
enumerated in §13.2 under their own heading. Leaving them would have kept the
repaired defect alive at a different address — the failure §13.1 named when it
propagated A-1 beyond the amendment list.

**Not touched**: no other requirement's text; no port table row; §13.1, which
is a record of a past round and is corrected in §13.2 rather than rewritten
(F-17); nothing under `rtl/**` or `test/**`, including `test/spikes/`.

#### Owed onward

D-8 and D-9 still owe board lines this author cannot write (`tasks/**` outside
write scope, L-E10). D-8's row now says **before the first P1 `SO-` PASS**, so
the board line it owes has a tighter deadline than the previous return implied.
