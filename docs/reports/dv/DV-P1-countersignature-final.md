# DV-P1-countersignature-final — the repair round, verified, and the countersignature

- **Packet**: `agents/handoffs/WO-0009_p1-final-countersignature.md`
- **Author**: dv_lead · journal `J-dv_lead-0003` (this report's authority)
- **Spec under review**: `docs/specs/SPEC-P1-core-cpu.md` at **`b9fd9c6`** (DRAFT)
- **Prior rounds**: `docs/reports/dv/DV-P1-testability.md` at `54a7221`
  (NOT COUNTERSIGNED, A-1…A-6, `J-dv_lead-0001`);
  `docs/reports/dv/DV-P1-countersignature.md` at `ddc06dc`
  (NOT COUNTERSIGNED, B-1…B-4, `J-dv_lead-0002`)
- **Gate row**: `P1-spec-freeze` — "dv_lead countersigns testability" (PROTOCOL §7)
- **Measurements in this report** were run at `64f4df4`, the tree's HEAD at the
  time of this pass; the spec bytes under review are `b9fd9c6`'s and are
  unchanged at `64f4df4` (`git diff b9fd9c6 64f4df4 -- docs/specs/` empty).
- **Date**: 2026-08-05

---

## 0. Verdict

> ## **COUNTERSIGNED** at `b9fd9c6`.

**All four repairs landed as written, and the diff stayed inside my
pre-commitment.** I rule on the boundary in §1, because that ruling was mine to
make and neither the orchestrator nor the architect could make it for me.

B-4 is the one I was asked to verify rather than accept, and it verifies: all
three comparison points are already required by README's signed P1 criterion
and by **REQ-013, REQ-029, REQ-048, REQ-049, REQ-114, REQ-120 and REQ-122**
(§6 re-derives this from the requirement text, not from the architect's
account). **No scope moved, so no E2 is hiding in a repair round.**

**Two MINOR findings are new, and neither blocks.** One of them is a
restatement of REQ-115 that the repairs make stale and that **§13.2 claims does
not exist** — and it is stale because *my own* §8 repair text did not include
it (§7.3). It is recorded with exact replacement text I pre-approve; it changes
no artifact anyone can build wrong, which is why it is a finding and not a
fifth round.

**What a signer should know first** is unchanged and is D-8: a P1 lockstep PASS
proves the RTL implements this specification and proves nothing about whether
this specification describes CHIP-8. The paragraph for transcription is in §9,
and D-8's *Closes by* cell now reads correctly.

---

## 1. The ruling: does this diff fall inside the pre-commitment?

**It does.** Here is the reasoning, stated as a rule rather than as a verdict,
because a boundary decided case-by-case is not a mechanism.

### 1.1 What I actually promised

`J-dv_lead-0002` and report §0: *"A revision whose diff from `ddc06dc` is
exactly §8's four repairs needs no further review round from me: verifying that
diff is a transcription check, not a review."*

### 1.2 What the diff is, measured

`git diff ddc06dc b9fd9c6 -- docs/specs/SPEC-P1-core-cpu.md` is **eight hunks**.
I read all eight. They are, in file order:

| # | Site | Class |
|---|---|---|
| 1 | §4.C "M03's parameters" — one parenthetical | propagation of B-1 |
| 2 | §5.0 REQ-115 ¶1 | **B-1(c)** + **B-3** second half |
| 3 | §5.0 REQ-115 ¶2 | **B-3** first half |
| 4 | §5.5 — new paragraph, *Widths* row, *Other* row | **B-1(a)**, **B-1(b)**, **B-2** |
| 5 | §8 "Two comparisons, two domains" | **B-4** |
| 6 | §10 REQ-115 registry row, description column only | propagation of B-1 + B-3 |
| 7 | §11 D-8 *Closes by* cell | **F-18**, my own finding |
| 8 | §13.2 appended | the round's record |

Plus `docs/adr/ADR-0018` Amendment A3 (appended, L-A04) and a two-line pointer
in the ADR's status block. `docs/specs/requirements.md` is **byte-unchanged**
since `ddc06dc` (measured, §10.4). The architect's repair commit
(`fcc6654..b9fd9c6`) touches four paths in total: the spec, the ADR, its own
journal, and WO-0008's Return log. **Nothing under `rtl/**` or `test/**`.**

### 1.3 The rule I am ruling by

> **A bounded-diff pre-commitment binds the reviewer's *surface*, not the
> applier's *edit count*.** An edit is inside the bound when it is
> (a) **entailed** by an approved repair — a restatement the repair makes
> false, or a decision record the repair moves — or (b) **requested** by the
> reviewer's own findings; **and** (c) it is **enumerated by the applying
> party before the reviewer looks**. An edit to text the reviewer graded and
> closed is **outside** the bound however small it is, and a repair that
> knowingly leaves a restatement false is outside it too, because it converts
> a bounded check into a hunt.

Applied here:

- **Hunks 2–5** are the four repairs. Inside by construction.
- **Hunk 7** (D-8's cell) is my own F-18 and WO-0008's item 5. Inside by (b).
- **Hunk 8** (§13.2) is the enumeration itself, requested by WO-0008 item 6.
  Inside by (b), and it is the artifact that makes (c) checkable.
- **ADR-0018 A3** is entailed: A2.2 named `MEM_INIT_FILE` among the values
  "defaulting to its `chip8_pkg` value", which B-1 makes false. Applying B-1
  *without* amending the ADR would leave the decision record wrong, and
  PROTOCOL §11 plus L-A04 require the append. Inside by (a).
- **Hunks 1 and 6** are the two propagation sites, and they are the ones the
  packet put to me. They are restatements of **REQ-115** — text that is inside
  my surface anyway, because my own §1 last round put REQ-115 in scope "by
  virtue of being new". Checking them costs two string comparisons against
  REQ-115's repaired text. Inside by (a).

### 1.4 Why the rule is "surface", not "size"

The counterfactual settles it. Had the architect held the diff to literally
four hunks, the spec would ship with **two statements about REQ-115 that the
repairs make false** — the exact failure §13.1 named when it propagated A-1
beyond my list, and the exact failure that produced B-2 (the instruction not to
read the package landed; the thing not to read stayed in it). The alternative
to a slightly larger diff was not a smaller diff I could verify; it was a
smaller diff that was **wrong**. A pre-commitment that forces the second is a
defective pre-commitment, and I would rather amend the rule than honour it into
a defect.

Note what the rule does **not** license. A one-word edit to any of the 84
requirements I closed at `54a7221` would be **outside** it, and would cost a
re-grade — because the cost the pre-commitment exists to avoid is re-grading
closed text, not counting hunks. Size is not the criterion; **surface** is.

### 1.5 The honest weakness in this ruling

I am stating the rule **after** seeing the edits it admits. That is weaker than
declaring it in advance, and I say so rather than dress the ruling up as
principle applied. The remedy is forward: the rule above is **pre-declared for
P2 and P3** (§14), so the next applying party knows the boundary before it
edits rather than after.

---

## 2. Confirmatory surface, and what it did not touch

Bounded by **§13.2's own enumeration**, cross-checked against the measured
eight-hunk diff of §1.2 — every hunk appears in §13.2's list and every §13.2
list item appears as a hunk. There is no unlisted edit and no listed-but-absent
edit.

**In scope**: the four repairs as landed; the two propagation sites; D-8's
cell; §13.2's own claims about itself; ADR-0018 A3 including **A3.4's reading
rule**; and — because a repair changes the status of the text it touches — the
clauses the repairs make true or false elsewhere in §5.5 and §10.

**Not touched, and not re-opened**: the 84 requirements and 30 ports graded at
`54a7221`; A-1…A-6 as landed and OQ-4's closure, both confirmed at `ddc06dc`;
§6.3's decode partition; §6.4's instruction semantics; §7.1's cycle table; the
traceability matrix beyond re-running its mechanical diff (§10.4).

**Independence.** I have read no RTL, because none exists: `rtl/` is absent at
`64f4df4`. Every judgement here derives from the specification, the ADR, and my
own measurements of the *language and toolchain*.

---

## 3. B-1, confirmed — and the argument ordering, judged

### 3.1 Applied

All three parts landed byte-identically to report §8 B-1: the *Other* row loses
`MEM_INIT_FILE` and its §5.4 pointer; §5.5 gains the paragraph; REQ-115 carries
the exception clause and the literal default `""`. §5.4's own row already said
*module* parameter with default `""` and needed no edit — confirmed.

**Is there now a conformant declaration?** Yes: `parameter string
MEM_INIT_FILE = ""`, which elaborates in both lanes (measured, §10.2).
**Is any clause left that forbids it?** REQ-109 ¶1 binds "every value in the
table below", and `MEM_INIT_FILE` is no longer in the table. REQ-115 mandates
it explicitly. **The joint unsatisfiability that made B-1 blocking is gone.**
One residual imprecision survives at a third site and is F-20 (§7.3).

**REQ-109 was not weakened** — confirmed by reading it, not by accepting the
claim: ¶1 is unchanged, the A-5 scope block is unchanged, and the repair
removed a definition *site* rather than licensing a *restatement*. The
alternative that would have weakened it is on the record as a **losing**
alternative with its cost, at ADR-0018 A3.3. Putting the cheap wrong answer on
the record with its price is better than resisting it silently, because the
next reader who has the same idea meets the refutation instead of the gap.

### 3.2 The ordering: per-test-input first, tool measurement second

**The ordering is right.** The test is: *what does this paragraph say after the
tool fact expires?*

The paragraph gives three reasons in order: (1) it is a per-test input with no
shared constant to drift; (2) its "default" is the empty image, whose meaning
REQ-014 clause 2 already fixes normatively; (3) — **measured in Icarus 12.0** —
a package `string` cannot appear in a module parameter's default expression.

If a future Icarus binds package strings, reason (3) does not become *false* —
it is scoped by a named tool version, so it becomes **historical**. Reasons (1)
and (2) are properties of the parameter, not of the toolchain, and they still
carry the decision alone. A repair argued only from (3) would not be falsified
either, but it would become **unmotivated**, and an unmotivated requirement in a
frozen spec is one a later phase reverts as obsolete. That is the failure mode
the ordering avoids, and it is a real one.

**Provenance, stated exactly** (L-B01). The ordering in the *spec* paragraph is
**mine** — it is report §8 B-1(b) verbatim, applied as written. What is the
architect's, and what I am grading, is **ADR-0018 A3.5 consequence 5**, which
makes the shelf-life argument explicit at the decision record: *"if a future
Icarus binds package strings in default expressions, the reason this parameter
sits outside the package is still the one in A3.2 — the per-test-input argument
— and not the tool bug alone."* That sentence is the right addition in the right
file: the spec states the rule, the ADR states the rule's shelf life, and a
future reader deciding whether to revert reads the ADR. **Correct, and I accept
it.** I decline the credit for the ordering itself; the architect's merit here
is having applied text verbatim instead of improving it, which is the harder
discipline.

---

## 4. B-2, confirmed

`SP_W` is gone from §5.5's *Widths and sizes* row; the value cell carries the
5-against-3 measurement; §5.1 remains the single site defining the derivation
(`derived: $clog2(STACK_DEPTH)+1`) and is untouched. REQ-109 ¶1 now binds a
table with nothing in it that REQ-115 forbids a module to read — the two
clauses no longer give opposite instructions about one name.

Measurement re-run at `64f4df4`, both lanes: `SP_W module-derived /
package-derived : 3 / 5` (§10.3).

---

## 5. B-3, confirmed — and it does bind the class

REQ-115 ¶2 as landed:

> Any parameter, width expression or array bound whose value is *derived* from
> an overridable parameter — `SP_W` = `$clog2(STACK_DEPTH)+1`, the `obs_stack`
> width `ADDR_W*STACK_DEPTH`, and the stack array's own depth are P1's cases —
> SHALL be derived **inside the module from that module's own parameter**, not
> read from `chip8_pkg`.

**The two cases that were my measurements are both covered, by name:**

| My measurement | Covered by | Verified |
|---|---|---|
| `obs_stack` width **48 vs 192** at `STACK_DEPTH = 4` | "the `obs_stack` width `ADDR_W*STACK_DEPTH`" — named, and the **class** term *width expression* covers it independently of the name | ✅ re-measured `64f4df4`, both lanes (§10.3) |
| the stack array's own depth | "the stack array's own depth" — named, and the class term *array bound* covers it | ✅ named; the array does not exist yet (no RTL), so the class term is what will bind it |

The quantifier is now **class-first, instances-second** — *any parameter, width
expression or array bound* — with the three P1 cases as an illustrative list
rather than as the extension. That is the correct shape: the previous text made
the list the extension ("is the only such case in P1") and was falsified by
finding a fourth member. This one cannot be falsified by finding one.

**¶1's widening to M01–M04 is right too**, and it is narrower than it looks:
"those of the values a test overrides **that they use** — M03 declares all of
them" means a RAM is not required to declare `RNG_SEED`. That closes F-16
without creating a new obligation. Cross-checked against §5.4's
`MEM_INIT_FILE` row, which names **M02 and M03**: correct under the
"those they use" rule, since M01 (`chip8_cpu`) and M04 (`chip8_rng`) touch no
memory image.

**One residual, recorded not repaired (F-21).** ¶2 binds values *derived from*
an overridable parameter. It does not, and need not, bind a module reading the
**overridable value itself** from the package by explicit scope resolution —
`chip8_pkg::STACK_DEPTH` inside a module that also declares a `STACK_DEPTH`
parameter. That defeats an override with exactly the *loud* failure mode B-3
names (overflow detected at the wrong call depth). It is not a spec defect:
REQ-115 ¶1 requires the module parameter and requires it passed down
unmodified, and a spec cannot enumerate every way an implementation can ignore
its own parameter. **It is mine**, and it is what parameter-loading guard 3
(§12) is for — one construction site, and a repository grep for the forbidden
form. Recorded so the guard's target is on the record before the guard is
written (L-B04).

---

## 6. B-4, verified independently — it is a restoration, and there is no E2

This is the one the packet asked me to re-derive rather than accept, because a
scope change inside a repair round is the worst place for one to hide. **I
re-derived it from the requirement text, and the architect's claim holds.**

The applied text names three model-to-DUT comparison points. Taking each
against what was *already* required at `ddc06dc`:

| Point | Already required by | Text that requires it |
|---|---|---|
| **1. The `obs_*` bundle at retirement** | README P1 criterion; **REQ-029**; **REQ-120** | README: *"full architectural-state compare after every instruction"*. REQ-029: *"During any cycle in which `obs_retire` is high, every `obs_*` output describes the just-completed instruction … one consistent post-instruction snapshot per instruction"*. |
| **2. The `mem` array at that same retirement** | README criterion; **REQ-013**; **REQ-114**; **REQ-120** | REQ-013's architectural-state table has **RAM 4096 × 8** as its first row. REQ-114 states it outright: *"the lockstep campaign **compares memory as part of the architectural state**"* — an existing requirement that asserts the comparison, not merely the observability. REQ-120: every element of REQ-013's state is observable *"either through an `obs_*` output or, for memory, through REQ-114's named array"*. |
| **3. Fault observation from the cycle `obs_halted` rises** | README criterion; **REQ-013**; **REQ-048**; **REQ-049**; **REQ-122** | REQ-013's table lists **`halted`, `err`** as architectural state ("The fault state (REQ-048)"). README requires a full-state compare *after every instruction*, and a faulting instruction never retires (REQ-049) — so the compare it demands has to happen somewhere, and REQ-048 (sticky) + REQ-049 (identifying) are what make that somewhere observable. REQ-122 clauses 5 and 7 **require** the campaign to cover stack over/underflow faults and the illegal space, which is stimulus with no licensed comparison point under the old universal. |

**So the old text was a narrowing, and the new text restores.** Point 2 was
required by a requirement that says "compares"; point 3 was required by
README's own "every instruction" plus a stimulus requirement that mandates
faulting vectors. The subordinate clause "and nowhere else" narrowed both, and
removing the narrowing adds no obligation that did not already exist. **No
requirement was added, withdrawn or given a new meaning; nothing under README's
signed criterion moved in either direction. There is no E2 here.** The
architect's decision not to escalate was correct, and its statement in §13.2
that it *would* have been an E2 had the quantifier been unfixable is the right
thing to have written down.

**A-4's distinction is preserved unchanged** — mid-instruction `obs_*` is
deterministic but unspecified, hence lane-to-lane comparable and *not*
model-assertable. I confirmed the sentence is byte-identical to `ddc06dc`'s
apart from the replaced clause.

**One carried note, not a defect (F-22).** Point 3 names four signals
(`obs_halted`, `obs_err`, `obs_instr`, `obs_instr_addr`), not the full
architectural state at the fault. That is complete **because of REQ-047**
(fault atomicity: *"A faulting instruction commits nothing"*), which makes the
state at the halt equal to the state at the previous retirement — already
compared at point 1. But REQ-047 is itself a requirement under test, and its
§10 hook is `D`, a directed vector: so REQ-047 is discharged by a directed
**before/after DUT** assertion, which is not a model-to-DUT comparison and is
therefore untouched by §8's "three points and nowhere else". I record this so
that the bench does not later read the three-point sentence as a bar on the
REQ-047 vector. **No spec change owed**; it is an attack-plan row
(`AP-chip8_core_top.md`) and it is mine.

---

## 7. The two propagation sites, judged — and a third the round missed

### 7.1 §4.C's "M03's parameters" parenthetical — correct and necessary

Before: *"every value a test overrides, each defaulting to its `chip8_pkg`
value"*. After B-1 that sentence is **false of `MEM_INIT_FILE`**, and §4.C is a
paragraph an implementer reads while writing M03's header — the worst place for
a false universal about parameter defaults. The parenthetical is minimal, cites
§5.5, and matches REQ-115's own exception clause word for word. **Correct.**

### 7.2 §10's REQ-115 registry row — correct, and correctly limited to one column

The description column now matches REQ-115's repaired text on both points
(M01–M04, and the class form of the derived-value rule). The **hook column is
untouched** (`S + D`), which is the claim I can check mechanically and did:
§10 and `docs/specs/requirements.md` remain **byte-identical on the hook
column across all 91 rows** (§10.4). So the matrix needed no edit this round,
and the architect's decision not to touch it is right — the matrix carries no
description column precisely so that this class of propagation cannot reach it.

### 7.3 F-20 — a third restatement of REQ-115, which §13.2 says does not exist

§13.2 asserts: *"No other restatement of REQ-115 exists."* **That is wrong**,
and it is wrong at a site inside REQ-109's normative block. §5.5's A-5 scope
block still reads:

> REQ-115's module parameters are not a second definition site either: each
> **defaults to** its package value and restates none of them. A default that
> is written as a literal instead of as the package reference is exactly the
> defect this requirement names.

After B-1, `MEM_INIT_FILE` is one of REQ-115's module parameters, has **no**
package value to default to, and has a **literal** default `""`. The universal
"each defaults to its package value" is false of it, and the following sentence
read in isolation convicts the only conformant declaration of it.

**Why this is MINOR and not a fifth blocking repair.** I grade by the same test
I used to grade B-1 blocking: *does a conformant declaration exist, and does
any clause forbid it?* It exists (`parameter string MEM_INIT_FILE = ""`), and
nothing forbids it: REQ-109's own defect is *"a literal that duplicates one of
these values"*, `MEM_INIT_FILE` is not one of those values any more, and the
paragraph immediately below the block says so explicitly and is cited from
REQ-115. The resolution path is short and signposted. **No implementer can
build the wrong thing from this**, which is the line between a blocking defect
and a precision defect, and holding a signature over it would be a re-grade
rather than the transcription check I pre-committed to.

**Whose miss it is: mine, at least as much as the architect's.** B-1's own
defect statement named *two* halves — REQ-115's requirement **and** REQ-109's
A-5 addition. My §8 repair text supplied exact replacement text for three sites
and **did not include this sentence**. The architect applied my text as
written, which is what it was asked to do, and then §13.2's "no other
restatement exists" inherited my omission and re-asserted it as a checked fact.
That is a real limit of this mechanism and I state it in §14 rather than bury
it here: **exact replacement text transfers the completeness burden to the
reviewer**, and an applier can be no more complete than the text it was handed.

**Exact replacement text, pre-approved.** In §5.5's REQ-109 *Scope* block,
replace the two sentences quoted above with:

> REQ-115's module parameters are not a second definition site either: each
> restates none of these values, and each **defaults to** its package value —
> except `MEM_INIT_FILE`, which has no package value to default to (see the
> paragraph below) and therefore no package reference to omit. For every
> parameter that does have one, a default written as a literal instead of as
> the package reference is exactly the defect this requirement names.

**This is not a condition on my signature.** The signature is issued on
`b9fd9c6` as it stands. I pre-approve the text above so that it can land as a
clerical correction in any commit up to and including the one that transcribes
the gate signature, **without a further review round from me** — and if it
lands after the freeze instead, it is a §13 change-log row and not churn worth
arguing about.

---

## 8. ADR-0018 A3.4 — the reading rule, accepted with a stated discriminator

A3.4 records: *"a requirement narrower than the ADR that authorised it was a
transcription defect, and this records it as one."*

**I accept the principle and I do not accept the rule in its unconditional
form**, because the two lanes reading the corpus differently is exactly the
failure the packet wants avoided, and the unconditional form will make the
auditor's drift sampling flag legitimate decisions.

### 8.1 Why the principle is right

A decision requires an ADR (PROTOCOL §11). A requirement is the *transcription*
of a decision into normative text. So a divergence between the two cannot
itself be a silent decision — a decision would have its own record. Divergence
therefore means one of the two is defective, and the one that is not the
decision record is the requirement. That reasoning is sound and A3.4 applies it
correctly to REQ-115 versus A2.2.

### 8.2 Why the unconditional form is too strong

A narrowing can be a **deliberate, recorded** decision. Two live examples in
this very document:

- **REQ-111 / `THROTTLE_DIV` = 0.** Narrower than the throttle mechanism the
  design contemplates; the narrowing is recorded at §11 **D-4** and is a phase
  decision, not a transcription defect.
- **REQ-042 / `DC_DEFERRED`.** The 4209 deferred encodings halt in P1 and are
  implemented in P2/P3; recorded at §11 **D-5**.

Under A3.4 as written, a drift sample would flag both as transcription defects
and propose widening them — which would land P2 and P3 scope inside P1's frozen
spec by clerical action. That is precisely the direction in which an E2 can
hide.

### 8.3 The form I accept, and will read the corpus by

> **Requirement narrower than its authorising decision record, with no record
> of the narrowing** — no deferred item, no phase-scope clause, no ADR of its
> own — **is a transcription defect**, and the decision record governs.
> **With such a record, the narrowing is itself a decision**, and the
> requirement governs. In neither case does the finding license editing the
> requirement to match the record without the review that requirement text is
> owed: **the decision record sets the target; a review decides whether the
> new text hits it.**
>
> **The reverse direction is not symmetric.** A requirement **wider** than the
> decision record authorising it is never a transcription defect by default: it
> is either a defect or an *unrecorded scope expansion*, it can create
> obligations no decision authorised, and it is **escalation-shaped (E2)** —
> never a quiet edit.

### 8.4 Backtested over this corpus (PROTOCOL §11's habit)

| Case | Accepted rule says | Right answer? |
|---|---|---|
| REQ-115 ¶2 vs ADR-0018 A2.2 (narrower, no record) | transcription defect; ADR governs | ✅ matches A3.4's finding and B-3 |
| REQ-111 `THROTTLE_DIV` = 0 (narrower, recorded at D-4) | decision; requirement governs | ✅ correctly not flagged |
| REQ-042 `DC_DEFERRED` (narrower, recorded at D-5) | decision; requirement governs | ✅ correctly not flagged |
| REQ-008 pre-A-2 (claimed *more* than it covered) | out of scope — wrong direction | ✅ it was a false claim, repaired as A-2, and would have been mis-diagnosed by a symmetric rule |
| B-4's "and nowhere else" vs README's signed criterion (requirement narrower than the **canonical scope statement**) | transcription defect; the canonical statement governs | ✅ this is exactly how §6 adjudicated it, arrived at independently |

The last row is the one that matters: the accepted rule reproduces the B-4
adjudication I made in §6 without knowing the rule, which is the backtest
passing rather than the rule being fitted to it.

**Recorded for the auditor.** This is the reading I will apply at every future
requirement-versus-ADR comparison, and it is stated here so that if the audit
lane reads the corpus differently, the difference surfaces now and not at P3.

---

## 9. D-8, and what a signer should know first

**The *Closes by* cell now reads correctly.** Verified byte for byte at
`b9fd9c6` §11:

> **Before the first P1 `SO-` PASS**, which precedes `P1-module-ready` — **not**
> the freeze

That is F-18 discharged: charter §3 and PROTOCOL §10 bind anchor-before-judge
at the *first verdict the model issues*, which is the first `SO-` PASS, and the
interval between that and `P1-module-ready` is exactly the window in which every
P1 sign-off is written. **D-8's handling satisfies me in full**; nothing else in
the row moved, and I re-read it to confirm (my grading — MAJOR / ESCALATION /
not freeze-blocking — is still quoted rather than softened, all three options
and my recommendation are still carried, and the owner is still
orchestrator → sponsor).

**What a sponsor signing this freeze should know first** — unchanged from
`DV-P1-countersignature.md` §10, reproduced here so the gate packet can
transcribe from the report that carries the signature:

> **A P1 lockstep PASS proves the RTL implements this specification. It proves
> nothing about whether this specification describes CHIP-8.** Both artifacts
> the campaign compares — the RTL and the Python golden model — derive from
> this one document by intake decision (the B3 independence rider); every
> CHIP-8 reference recorded at intake is consult-only; and the free-use
> artifacts are test ROMs that P1 cannot execute. There is no external truth
> anywhere in the phase. Three things carry the weight instead: the mutation
> campaign, which is the only thing that qualifies the instrument and is
> therefore not optional colour here; the piecewise anchors that *are*
> available (the LFSR recurrence against an independent implementation of the
> same recurrence, BCD against integer arithmetic, the decode classifier
> against §6.3's row totals); and **P4's community test-ROM campaign, which is
> the first external truth this program ever touches**. This is spec §11 D-8,
> and settling it — option (a), (b) or an explicit NO-ANCHOR declaration —
> is a precondition of the first `SO-` PASS, not of this freeze.

**Second thing a signer should know**, one line: this specification is being
frozen with **no RTL in the tree**, so every port width, parameter and
observation contract in it has been graded against the *language and the
toolchain* and never against a design. That is not a defect — it is the
correct order — but it means the first RTL work order is also the first time
any of §4's tables meets a compiler.

---

## 10. Evidence

All commands run from a checkout at **`64f4df4`**, working tree clean before
and after (`git status --porcelain` empty). Toolchain measured, not relayed:
**Icarus Verilog 12.0 (stable)**, **Verilator 5.020 2024-01-01 rev (Debian
5.020-1)**, **cocotb 1.9.2** (`iverilog -V`, `verilator --version`,
`python3 -c "import cocotb"`). Provenance **measured** throughout unless a line
says otherwise.

### 10.1 The diff, enumerated

```
$ git diff --stat fcc6654 b9fd9c6
 agents/handoffs/WO-0008_p1-spec-repair-round-2.md  |  61 ++++
 agents/journals/claude_architect_docs_lead_agent.md| 316 +++++++++++++++
 docs/adr/ADR-0018-p1-core-cpu-design-choices.md    | 122 ++++++
 docs/specs/SPEC-P1-core-cpu.md                     | 146 ++++++--
 4 files changed, 626 insertions(+), 19 deletions(-)

$ git diff --stat ddc06dc b9fd9c6 -- docs/specs/requirements.md
                                     # empty — byte-unchanged
```

Eight hunks in the spec, enumerated in §1.2; each read in full.

### 10.2 B-1 reproduces at this SHA

```
$ cat a.sv
package p;
  parameter string S = "hello";
  parameter int    N = 7;
endpackage
module top #(parameter string S = p::S, parameter int N = p::N)();
  initial begin $display("S=%s N=%0d", S, N); $finish; end
endmodule

$ iverilog -g2012 -o a.vvp -s top a.sv
a.sv:5: error: Unable to bind variable `S' in `p'
1 error(s) during elaboration.            # exit 1
```

The literal default `parameter string S = ""` elaborates in both lanes — it is
what `test/spikes/spike_top.sv:32` declares, and every configuration of §10.3
builds through it.

### 10.3 B-2 / B-3 reproduce at this SHA, both lanes

```
$ python3 test/spikes/run_spike.py          # 10 configurations, both lanes
```

Configuration `C2-stackdepth`, `parameters={"STACK_DEPTH": 4}`:

```
=== icarus / C2-stackdepth ===             === verilator / C2-stackdepth ===
  STACK_DEPTH seen by module : 4             STACK_DEPTH seen by module : 4
  SP_W  module-derived / package-derived     SP_W  module-derived / package-derived
                            : 3 / 5                                   : 3 / 5
  obs_stack width  module / package          obs_stack width  module / package
                            : 48 / 192                                : 48 / 192
```

Both lanes agree, so this is a property of the language and not of a tool. The
48-against-192 figure B-3's text names is the figure the harness prints.
Ephemeral: build trees live under a `tempfile.mkdtemp` root and are deleted
with the run; the committed harness is what reproduces them.

### 10.4 §10 versus the matrix, re-diffed mechanically

```
$ python3 - <<'EOF'   # parse spec §10's table and requirements.md's, compare
...
spec §10 rows: 91   matrix rows: 91
id set equal: True
hook-column mismatches: NONE
section-column mismatches: REQ-124 only ('§10, §11 D-1' vs '§10, §11 D-1 (landed)')
EOF
```

91/91, **hook columns byte-identical across every row** — the claim §13.2 makes
about the propagation, verified rather than accepted. The single
section-column difference is a status word the matrix adds to its own citation
of a landed deferred item; it pre-dates this round, is not a hook, and is not a
finding.

---

## 11. Findings

Severity and class as in the prior two reports. **BLOCKING** — the frozen text
must change · **CARRIED** — resolvable inside P1 with no spec change ·
**ESCALATION** — not a spec defect.

| # | Sev | Class | Finding |
|---|---|---|---|
| **B-1** | — | **CLOSED** | Applied as written, three parts. A conformant `MEM_INIT_FILE` declaration exists and nothing forbids it (§3.1). REQ-109 unweakened, verified by reading ¶1 and the A-5 block. |
| **B-2** | — | **CLOSED** | Applied as written. `SP_W` out of §5.5; §5.1 the single derivation site; measurement re-run (§10.3). |
| **B-3** | — | **CLOSED** | Applied as written, both halves. Class-first quantifier; `obs_stack` and the stack array's depth both covered by name **and** by class term (§5). |
| **B-4** | — | **CLOSED** | Applied as written. Restoration verified independently against README's signed criterion and REQ-013/029/048/049/114/120/122 (§6). **No E2.** |
| **F-18** | — | **CLOSED** | D-8's *Closes by* cell reads correctly (§9). |
| **F-20** | MINOR | **CARRIED** | **A third restatement of REQ-115 exists, inside REQ-109's A-5 scope block, and §13.2 says it does not.** "each **defaults to** its package value" is false of `MEM_INIT_FILE` post-B-1, and the next sentence read alone convicts its conformant literal default. Not blocking: a conformant declaration exists, nothing forbids it, and the cure is cited from REQ-115. Exact replacement text pre-approved at §7.3. **The omission originates in my own §8 B-1 text.** |
| **F-21** | MINOR | **CARRIED** | REQ-115 ¶2 binds values *derived from* an overridable parameter, not a module reading the overridable value itself from the package by explicit scope resolution — which defeats an override loudly. No spec change owed; it is parameter-loading guard 3's target (§12), recorded before the guard is written (L-B04). |
| **F-22** | MINOR | **CARRIED** | §8's third comparison point names four signals, not the full state at the fault. Complete because REQ-047 makes a faulting instruction commit nothing — but REQ-047 is itself under test, with a `D` hook, so it is discharged by a directed before/after **DUT** assertion, which is not a model-to-DUT comparison and is untouched by "three points and nowhere else". Recorded so the bench does not later read that sentence as a bar on the REQ-047 vector. Attack-plan row, mine. |
| **F-15** | MINOR | **CARRIED** | Unchanged. Verilator refuses an enum-typed parameter from the command line without `-Wno-ENUMVALUE -Wno-WIDTHTRUNC`. §13.2's disposition — no spec change owed, the declared type is dv_lead's and rtl_lead's choice with the cost stated — **is correct and I accept it**. Reproduced again at `64f4df4` (§10.3's run, configuration `C3-enum`). |
| **F-16** | — | **CLOSED** | Folded into B-3 ¶1 as claimed; verified (§5). |
| **F-17** | — | **CLOSED** | Corrected in §13.2 rather than by editing §13.1. That is the right handling: §13.1 is a record of a past round, and L-A04 says corrections append. |
| **F-19** | — | **CARRIED** | Unchanged. The guards are mine; §12. |

---

## 12. What I still owe, at bench-build time

Stated here because a control named at a freeze and designed later is a control
nobody costed, and because the packet asked for it explicitly.

| Owed | What discharges it | When |
|---|---|---|
| **NV-2** — wall-clock of the 65536-encoding decode sweep per lane, plus the 4096-element `mem` array read cost | one spike, both lanes, before the first bench; the cost decides whether the sweep runs per-commit or per-gate | before the first bench |
| **NV-4** — does an `X` reaching a comparison in the Icarus lane actually fail under the environment **CI** provides | measured that `COCOTB_RESOLVE_X=ZEROS` silently resolves it; unmeasured is what the CI job sets. Discharged by guard 4 **plus a CI run**, never a local one (PROTOCOL §10) | before the first bench |
| **F-15** — the enum-parameter cost | decide with rtl_lead: global `-Wno-ENUMVALUE -Wno-WIDTHTRUNC` (suppresses a real type check) versus a 2-bit `logic` module parameter with a cast inside. My input, rtl_lead's declaration | at the first RTL work order |
| **Guard 4 — the X-policy guard** | the bench pins its own X-resolution policy and fails loudly if the environment overrode it; negative control already committed at `test/spikes/` | with the first bench |
| **Guards 1–3 — the four parameter-loading guards** (with guard 4) | 1: assert the load **through the design** (first post-reset event is the known first instruction's retire), never through the log — measured, every diagnostic is non-fatal and one emits nothing. 2: `expects_image = True/False` declared, never inferred. 3: one construction site for the runner, applying SV string quoting; the `-P<pkg>.` form appears nowhere, plus a repository grep as a cheap CI check — **and this is F-21's guard too**. 4: as above | with the first bench |
| **Each guard qualified before it is trusted** (L-B04, L-D11) | each runs red against the defect it names — wrong path, unquoted parameter, package-scope override, `COCOTB_RESOLVE_X=ZEROS` — in **both** lanes, before any test relies on it. The four negative controls at `test/spikes/` become the guards' own regression | with the first bench |
| **F-21, F-22** | attack-plan rows in `test/attack_plans/AP-chip8_core_top.md`, committed before the first test | before the first test |
| **D-8** | not mine to close — E3-shaped, orchestrator → sponsor — but it is a **precondition of my first `SO-` PASS**, and I will not issue one over an unsettled anchor question | before the first `SO-` PASS |

Also standing, from `54a7221` §9: `build.yml`'s R-CI-d source guard is deleted
in the same commit that lands the first `rtl/` module and the first bench.
This round again did not trip it (the harness is `test/spikes/run_spike.py`,
deliberately not matching `test/test_*.py`).

---

## 13. Freeze-record rows this report fills

For spec §12:

| Item | Value |
|---|---|
| Interface check | **Fallback regime** (ADR-0017 Consequence 1): reviewed port tables §4.A–§4.D, graded line by line at `DV-P1-testability.md` §3 — 30 distinct ports (M01 19, M02 6, M04 5) plus M03's `clk`, `rst_n` and pass-through bundle; four defects found (F-2, F-3, F-4, F-5), all in the width and parameter columns, none in the direction or meaning columns. Repaired at `ddc06dc` (A-1, A-3), confirmed at `DV-P1-countersignature.md` §3, and the parameter-path defects the repair itself created repaired at `b9fd9c6` (B-1…B-3) and confirmed here. There is no compile-check CI run for this program and none is owed. |
| dv_lead testability countersignature | **COUNTERSIGNED at `b9fd9c6`** — `J-dv_lead-0003`, `docs/reports/dv/DV-P1-countersignature-final.md`. Three MINOR findings carried (F-20 with pre-approved text, F-21, F-22); none blocking, none requiring a further review round. |

Spec §11's **D-6** row closes with this entry.

---

## 14. The mechanism, assessed — did the bounded diff work?

**It worked, and I would use it again at P2. Here is the plain version, with
the part that did not work stated in the same breath.**

### 14.1 What it bought, measured in rounds

Two rejections produced **three cheap rounds**, not three re-grades. The cost
structure:

| Round | Surface I graded | What it cost |
|---|---|---|
| `54a7221` | the whole spec — 91 REQs, 30 ports, every table | the full grade |
| `ddc06dc` | §13.1's enumerated list: six landings, four propagation sites, three flagged additions, OQ-4's closure, one new REQ | one pass |
| `b9fd9c6` | §13.2's enumerated list: eight hunks | one pass, of which the mechanical part was minutes |

The saving is not the reviewer's convenience. It is that **the 84 requirements
and 30 ports were graded once, at full attention, and never re-graded at
declining attention** — which is where a re-grade actually loses defects.

### 14.2 The three parts, and which one is load-bearing

1. **The reviewer pre-commits a bounded surface.** Cheap, and it is what makes
   the applier's constraint a deliverable rather than a preference.
2. **The applier enumerates its own edits into the document** (§13.1, §13.2).
   **This is the load-bearing one.** Without it, "verify the diff is exactly
   the repairs" is a diff hunt over a 1600-line document, which is a review by
   another name. With it, the check is: does the hunk list equal the section
   list, in both directions? I ran that check in both directions and it
   matched.
3. **The applier flags its own additions as *in scope for grading*.** §13.1 did
   this and it is **why B-1 was found at all** — B-1 lived in an addition
   beyond my amendment text, and an unflagged addition is text nobody grades.

### 14.3 Where it did not work, stated rather than smoothed

**F-20 is the mechanism's failure mode, and it is instructive.** The
enumeration is only as complete as the repair text it enumerates. My §8 B-1
supplied exact replacement text for three sites; B-1's own defect statement
named a fourth (REQ-109's A-5 addition); my text did not cover it; the
architect applied my text as written — correctly — and then §13.2 asserted
*"No other restatement of REQ-115 exists"* as a checked fact, inheriting my
omission and promoting it to a claim.

The general shape: **exact replacement text transfers the completeness burden
from the applier to the reviewer, and the applier's own enumeration then
launders the reviewer's omission into a verified statement.** Both parties'
records now say the surface is closed, and neither party checked the thing the
other assumed was checked.

**The cheap fix, and I propose it for P2**: when a reviewer supplies exact
replacement text for a named entity, it also supplies the **site list it
searched** — "I grepped this name, these are the N sites, K of them need
edits" — so the applier's enumeration can be checked against a *search* rather
than against the reviewer's memory. That converts a claim of exhaustiveness
into a reproducible command.

The search that would have caught F-20 **last round**, when §8's repair text
was written, is one line (measured at `64f4df4`):

```
$ grep -c "REQ-115" docs/specs/SPEC-P1-core-cpu.md
29
```

Twenty-nine mentions. Excluding §5.0's own normative statement and §13's
records of past rounds leaves **thirteen** sites carrying a claim about
REQ-115. Three of them are edit sites this round (§4.C, §5.5's *Widths* cell,
§10's row); nine are unaffected and I verified each; **one — the A-5 scope
block — is F-20**. I enumerated those thirteen *this* round, which is how F-20
was found. Had I enumerated them when writing §8, B-1 would have shipped with
four parts instead of three and this finding would not exist.

### 14.4 The rule, pre-declared for P2 and P3

So the next round's applier knows the boundary **before** it edits, which is
the deficiency §1.5 admits about this one:

> A bounded-diff pre-commitment binds the reviewer's **surface**, not the
> applier's **edit count**. Inside it: the approved repairs; edits **entailed**
> by them (a restatement they falsify, a decision record they move); edits the
> reviewer's own findings **requested**; and the enumeration section itself.
> Outside it: any edit to text the reviewer graded and closed, **however
> small**. Every inside-edit is **enumerated by the applier before the reviewer
> looks**, and a repair that knowingly leaves a restatement false is outside
> the bound too — it converts a bounded check into a hunt.

And the honest caveat that goes with it: **the reviewer rules on the boundary,
after seeing the diff.** Neither the party that issued the work order nor the
party that made the edits can rule that its own additions fit inside someone
else's promise. That the architect flagged the overage rather than hoping it
would pass is what made this round cost one pass instead of a dispute, and it
is worth saying so plainly.

---

## 15. Lessons harvest

Recorded in `J-dv_lead-0003`, **span `J-dv_lead-0003..0003`**, tiling exactly
from `0002..0002`, per PROTOCOL §7.1 and charter §3. No worker spans — I
commissioned none. **Yield: two tier-1 candidates, one recurrence note, one war
story.** Final ids belong to the landing fence; the journal entry carries the
bars, the failure statements and the provenance pins.

- **LC-06 (tier 1)** — the bounded-review-surface rule of §14.4.
- **LC-07 (tier 1)** — the requirement-versus-decision-record reading rule of
  §8.3, including its asymmetry.
- **Recurrence note on LC-05** (*"the party applying an approved repair
  enumerates its own additions"*), minted at `J-dv_lead-0002`: this round is its
  **second independent confirmation** — §13.2's enumeration is what made this
  pass a transcription check, and §14.2 identifies it as the load-bearing part
  of the mechanism. Recorded as recurrence evidence per `docs/FEDERATION.md` §8
  rather than re-minted as a new candidate.
- **War story** — F-20: exact replacement text transfers the completeness
  burden to the reviewer, and the applier's enumeration then launders the
  reviewer's omission into a verified claim. Kept as a war story pending a
  second instance; the remedy is stated at §14.3 and is testable.
