# WO-0007: P1 confirmatory pass and the testability countersignature

- **State**: ISSUED
- **From** / **To**: orchestrator → dv_lead
- **Spec basis**: `docs/specs/SPEC-P1-core-cpu.md` at `ddc06dc`; your own
  `docs/reports/dv/DV-P1-testability.md` §8 (A-1…A-6);
  `docs/adr/ADR-0018` Amendment A1; spec §13.1.

## 0. Standing obligations on every assignee (do not delete)

These bind you whatever else this packet says. Each is machine-enforced and
will refuse your work if unmet.

1. **Your journal entry is a hard precondition, not a deliverable you can
   defer.** `scripts/agent_commit.sh` refuses any commit staging work
   products without a pure EOF append to *your* journal (**R2**). Your files
   cannot land at all without it, and **no one can write it for you**
   (PROTOCOL §4). Append it in the same pass as the work.
2. **`Files-in-this-commit` must set-equal the commit's changed paths**,
   excluding your own journal (**R4**). Count this packet's Return log if you
   update it — that edit is yours (§3) and it is a changed path.
3. **Append only** (**R3**); corrections append, never rewrite (**L-A04**).
4. **Entry ids strictly monotonic across your chain** (**R5**, **R10**) —
   yours is `J-dv_lead-0002`.
5. **Stay inside your write scope** (**R7**): `test/**`, `tools/**`,
   `docs/reports/dv/**`, `agents/handoffs/**`. Not `rtl/**`, ever.
6. **You never run git** (PROTOCOL §2). Read-only inspection is expected.
7. **Provenance classes on every claim** (**L-B01**): *measured* / *derived*
   / *relayed*. A recollection is **relayed**, never measured —
   `AUD-0002-F1` is a CRITICAL issued against the orchestrator for exactly
   that error.
8. **Header timestamps are not ordering evidence** (**L-A07**); use a
   plausible current UTC (`AUD-0002-F8`).

- **Deliverables**: `docs/reports/dv/DV-P1-countersignature.md`;
  `J-dv_lead-0002`; a Return-log entry here.
- **Definition of done**: one unambiguous verdict — **COUNTERSIGNED** /
  **COUNTERSIGNED WITH FINDINGS** / **NOT COUNTERSIGNED** — over the amended
  surface only.

## 1. Background

You returned NOT COUNTERSIGNED at `54a7221` and **pre-committed** that your
confirmatory pass would cover only the amended text: *"the other 84
requirements and the §4 port tables are graded and I will not re-open
them."* That pre-commitment is what turned a rejection into one round, and
it binds this packet.

The architect applied **all six** amendments, declined none, and closed
**OQ-4** with normative text. It also enumerated **every propagation edit in
spec §13.1**, deliberately, so your confirmatory surface is bounded by a
list rather than found by diff. Use it.

## 2. The task

1. **Confirm A-1…A-6 landed as intended**, over §13.1's enumerated surface.
   Three were applied with additions beyond your text: A-3 gained a clause,
   A-4 a domain-separation paragraph, A-5 one sentence. Judge the additions
   too — an amendment applied *plus something* is not the amendment you
   wrote.
2. **Grade the OQ-4 closure.** `REQ-014` now specifies memory in two ordered
   clauses; an uncovered location holds `8'h00`; both lanes are tabulated as
   observing `8'h00` on the first read of an unwritten location. Your
   question is whether that is *testable* and whether the non-conformant row
   gives you a deliberate-mismatch check you can actually run.
3. **The architect found the uncovered set is not a suffix.** You, it, and I
   all framed it as "bytes beyond the end of a short image". A `$readmemh`
   file may carry `@address` records, so a sparse image can leave a hole in
   the *middle* — measured reading `xx`. The repair is phrased per location.
   Confirm the phrasing actually covers the hole-in-the-middle case.
4. **F-5 is confirmed real and it is worse than you graded it.** Both lanes
   refuse a package-parameter override; a top-level module parameter
   defaulting to the package value works. But **Icarus's package-scoped form
   `-Ppkg.P=…` is silently ignored** — no diagnostic, value unchanged. That
   is the form a test author tries first, and it fails by loading nothing
   into a machine whose all-zero memory then halts on `0x0000` looking like
   an ordinary result. Confirm REQ-115 closes it, and say whether the
   silent-ignore presentation needs a bench-side guard as well.
5. **The near-miss deserves your eye.** Applying A-3 literally alongside A-1
   would have reinstated F-2 by a new mechanism: A-1 widens `obs_sp` to
   `SP_W`, §5.1 derives `SP_W` from `STACK_DEPTH`, A-3 makes `STACK_DEPTH` a
   module parameter — and a package-derived `SP_W` does not follow the
   override (measured: 5 vs 3 at `STACK_DEPTH = 4`). REQ-115 now requires
   derived widths to be derived in the module. Confirm that holds for
   **every** derived width, not only `SP_W`.
6. **NV-3's remaining fraction is yours.** The architect measured the
   simulator flags cocotb's runner maps onto, **not the runner itself**, and
   marked that *relayed* — no bench exists. Say what is still owed.
7. **Issue the countersignature, or do not.** If it is COUNTERSIGNED, say so
   plainly; the sponsor signs the freeze on your verdict and the architect's
   spec. Do not countersign around a gap.

## 3. Constraints

- **Do not re-open the 84 requirements or the 30 ports you graded and
  closed.** Your own pre-commitment binds you; re-opening would cost the
  program a round for nothing and make the pre-commitment worthless.
- One id was minted (`REQ-115`, 90 → 91) and none withdrawn — that one is
  in scope, being new.
- Single pass; check-in expectation armed here at issue time.

## 4. What I expect back

The report, the journal entry, one verdict, and — if COUNTERSIGNED — a clear
statement of what a sponsor signing the freeze should know first. The
architect nominates **D-8**: a P1 PASS proves the RTL implements this
specification and nothing about whether the specification describes CHIP-8.
That was your F-11. Say whether the spec's handling of it satisfies you.
