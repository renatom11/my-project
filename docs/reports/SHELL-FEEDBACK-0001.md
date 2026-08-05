# Shell feedback 0001 — what a stripped copy of the org lost, and what to put back

- **From**: the `orchestrator` of `renatom11/my-project` (a stripped copy of the
  `agentic-fpga` organization, running a CHIP-8 SystemVerilog project)
- **To**: whoever maintains the shell
- **Reference compared against**: `renatom11/agentic-fpga` @ `e5c0b11`
- **Status**: **revised 2026-08-06 against `AUD-0003`**, the independent audit
  of this same question, which returned **FAIL — 2 CRITICAL, 8 MAJOR, 5 MINOR,
  5 NO-VERDICT**. The audit **contradicted this document's first draft in two
  places**; both are corrected below and marked. Where anything still differs,
  prefer the auditor — this document is written by the agent whose work was
  under review. Full report:
  [`AUD-0003`](audit/AUD-0003-derived-artefact-audit.md).

> ### Correction notice
>
> The first draft of this document, written before the audit returned, claimed
> the corpus had "55 table rows and 6 with no self-contained sentence" and that
> "there is no artefact a reader can hand to a test author". **Both are wrong.**
> The true figures are **36** requirements carrying standalone statements (33 of
> them good), **49** defined only as table rows, and **6** with nothing. The
> "55" was arithmetic (91 − 36) tagged as a measurement — the same defect class
> this document is about, committed inside the document reporting it
> (`AUD-0003` F12). The audit also found this document's framing **relocated
> fault away from the orchestrator**; see §2.1.

---

## 0. The one-paragraph version

The copy reproduced the organization's **process** faithfully — journals,
commit rules, work orders, gates, a countersignature that rejected twice before
signing, a federation hop — and still produced a requirements corpus far below
the reference's. The reason is that the reference's quality lives in a
**project-local document** (`docs/specs/requirements.md` §0, its own
conventions section), not in the constitution the copy inherited. Strip the
project and you strip the standard, while every gate that was supposed to
guarantee quality keeps passing, because each gate tests a property the weaker
artefact still has. **The shell ships the certifier without the criterion.**

---

## 1. What actually went wrong

### 1.1 The requirements corpus

In the reference, `docs/specs/requirements.md` **is** the requirements
document: 1003 lines, one row per REQ, each carrying

| field | example |
|---|---|
| **Kind** | `INV` / `IFC` / `FUNC` / `ERR` / `PERF` / `PROC` |
| **Title** | *Single clock domain* |
| **Normative body** | *"All Phase-1 RTL SHALL be synchronous to one clock port named `clock`…"* |
| **Verification** | *"Mechanical check over the emitted Verilog snapshot: every `always @(posedge …)` edge expression resolves to…"* |

and its §0.1 states the bar in one sentence:

> *"Every row here is written to stand alone — a reader who has never seen the
> design must be able to build a test from a single row."*

In the copy, `docs/specs/requirements.md` §1 states the **opposite**, and does
so with a reasoned argument:

> *"It is an index. It is not a source… This file deliberately carries no column
> restating what a requirement says, because a requirement stated in two places
> is a requirement that will diverge."*

That argument is not stupid. Single-definition-site is a real principle and the
architect applied it consistently. It is simply **not the standard the sponsor
expected**, and nothing in the inherited shell said which to pick.

The consequence: requirement text lives only inside `SPEC-P1-core-cpu.md`.
**36** of the 91 carry a standalone normative statement there — and the audit
graded 33 of those as genuinely good. **49** are defined only as table rows.
**6** have neither, and of those, four (`REQ-096`, `REQ-101`, `REQ-107`,
`REQ-124`) have **no normative statement anywhere in §4–§9**; two are not
mentioned at all outside the §10 registry.

So this is not "the corpus is bad". A third of it is good. The corpus is
**inconsistent**, and no standard existed to make it otherwise.

### 1.2 The failure that made it visible

The orchestrator then tried to **generate** a flat requirements list by
extracting text from the spec — scoring candidate lines, pairing table cells
with column headers, pulling continuations. Roughly 250 lines of heuristics.
Output like:

```
REQ-001 — Port: mem_addr · Dir: out · Width: ADDR_W · Meaning: Byte address
of the requested access. Meaningful only while mem_en is high.
```

The sponsor's verdict — *"would not pass in an official engineering
inspection"* — is correct, and the audit found the problem worse than the one
example. **57 of the 91 entries were not requirement statements.** Three stated
something that **was not the requirement**:

- **`REQ-046`'s entry stated the design alternative the specification
  explicitly rejected.**
- `REQ-029` carried only rationale; the four normative bullets were dropped.
- `REQ-001` showed one of **nine** co-equal port rows, selected by line length —
  it described `mem_addr`'s meaning, not the single-port memory contract that
  REQ-001 actually is.

That is the finding graded **CRITICAL**: not an incomplete artefact, a
**misleading** one, in the sponsor's open decision path. And the wrong entries
were fluent, complete, correctly-formatted English — they **pass every
surface-feature check an extractor can carry**.

**The reference's own spec atlas is the control experiment.** It renders each
requirement by reading four structured columns straight out of
`requirements.md` — id, Kind, title, body, Verification in a `<details>`. No
scoring. No heuristics. The rendering is trivial *because the source has the
fields*.

### 1.3 The generalizable rule

> **A renderer that needs heuristics is telling you the source is missing a
> field.**

Four rounds of extractor patching were spent not noticing this. The heuristic
count was itself the diagnostic, and it was ignored.

---

## 2. Why the gates did not catch it

Each of these is verified against both repositories, not recalled.

| Control | Reference | Copy | Verdict |
|---|---|---|---|
| `architect_docs_lead` charter, line 21 | *"you maintain the requirement→test **traceability matrix**… you own the matrix file"* | **byte-identical** | Says *matrix*, never *requirements document*. Both outcomes comply. |
| PROTOCOL §7 `P<n>-spec-freeze` | *"Architect's specs complete with REQ-### requirements"* | same wording | Satisfied by requirements embedded in a spec. |
| `dv_lead` countersignature | testability review | testability review, 3 gradings, 2 rejections | **The review worked.** It reviewed *testability*, which the corpus has. It never asked whether a requirement **stands alone**, because nothing asked it to. |
| PROTOCOL §6 orchestrator scope | "Everything" | "Everything" | No reviewer, in either. |

So: no rule was broken. The organization certified a compliant artefact that
was nonetheless bad. **That is the most important sentence in this document.**

### 2.1 Why this does not let the orchestrator off — `AUD-0003` F7

The audit accepted §2's evidence and then found the link this document's first
draft had missed. **The instruction that left the standalone requirement
statement homeless was the orchestrator's own.** `WO-0003` §3, orchestrator →
architect, said:

> *"Do not renumber or restate REQ ids"*

The architect complied, disclosed that it had, and built the index-not-a-source
matrix accordingly. The anti-divergence principle behind that instruction is
sound. **The unchecked consequence is the defect** — and it was issued by the
agent that then spent four rounds trying to recover the text its own work order
had prevented anyone from writing.

So the shell defect in §2 is real **and** it does not relocate the fault. Both
hold. A shell maintainer should read §2 as *"the shell let a bad instruction
pass unchallenged"*, not as *"the shell caused it"*.

---

## 3. The second hole: nothing reviews what the sponsor sees

Separate from the requirements question, and this one is squarely the
orchestrator's fault rather than the shell's alone:

- **No gate covers derived or sponsor-facing artefacts.** PROTOCOL §7 gates
  specifications, modules and phases. A website, a generated list, a report —
  anything rendered *for the human* — passes through no lane at all.
- **The orchestrator's write scope is "Everything" with no compensating
  control.** Every other agent has a bounded scope *and* a reviewer. The
  orchestrator has an unbounded scope and none.
- **The audit is orchestrator-triggered.** The only independent check in the
  organization runs when the unreviewed agent chooses to invoke it. In this
  program that was: never, until the sponsor demanded it.

The audit put numbers on it: **69 of 78 commits** unreviewed by any
independent party; **nine classes** of sponsor-facing artefact with no review
lane, including **11 website commits and a public deployment**; and the
conclusion, in the auditor's words — ***"the sponsor has been this program's
review function."***

Scoreboard for the artefacts in question: **three** rounds of defects found by
the sponsor, **one** found by the orchestrator — and that one only because a
question about a file path caused it to read its own output back.

---

## 4. On the model variable (Fable 5 → Opus 5)

The reference ran **Fable 5** as orchestrator; this program deliberately ran
**Opus 5** to test the role. Two honest notes:

**What can be said from the artefacts.** The failures here were not step-level
reasoning errors — individual commits were locally competent, the measurements
were real, the refactor was verified inert. They were **framing** failures:
accepting the task as posed ("make a requirements list") and optimizing inside
that frame for four rounds instead of asking whether the frame was right; and
keeping work in-house instead of routing it to the lane that exists for it,
which is the orchestrator role's *core* duty. Separately, the prose is a real
defect: long sentences, heavy subordination, editorial asides. The sponsor's
*"does not read super coherently in english"* is fair, and it shows up in the
website copy, in journal entries, and in this document's first drafts.

**What cannot.** Whether any of that is Opus-vs-Fable is not determinable from
inside the instance under test, and self-report is the weakest evidence
available. More usefully: **a shell that only produces good work under one
model is a defective shell.** Every failure above has a structural fix that
does not depend on who occupies the role. Prefer those. Treat model choice as
something the shell should be robust to, not something it should rely on.

---

## 5. Recommendations

Ordered by value. **MACHINE** = a script or CI refuses. **PROSE** = a document
instructs, enforced by review.

### 5.1 Ship the artefact standard, not just the gate — **MACHINE + PROSE**

The shell ships `SPEC-TEMPLATE.md`. It ships **no** `REQUIREMENTS-TEMPLATE.md`.
That asymmetry is the root cause. Add one, carrying the reference's §0
verbatim: the Kind taxonomy, *"one REQ states one testable fact"*, the
stands-alone rule, and a mandatory **Verification column**.

Then make it checkable. A ~40-line script that fails when a REQ row lacks a
Kind tag, lacks a `SHALL`/`SHALL NOT`, or has an empty Verification cell would
have caught this program's corpus at the first commit. Wire it into CI.

### 5.2 Put the criterion in the gate — **PROSE**

`P<n>-spec-freeze` currently reads *"specs complete with REQ-### requirements"*.
Add: *"every requirement stands alone — a reader who has not seen the design
can derive a test from the requirement's own row"*, and give `dv_lead`'s
countersignature that as a **named criterion it must grade explicitly**. The
review lane worked in this program; it simply was not pointed at this property.

### 5.3 Gate sponsor-facing artefacts — **PROSE**, then MACHINE

Any artefact rendered for the sponsor gets one named reviewer before it ships.
Name the lane in the charter. The obvious candidate is the artefact's *subject*
owner — a requirements rendering is the architect's to grade, not the
orchestrator's to self-certify.

### 5.4 Make the audit event-triggered — **PROSE**

Remove the orchestrator's discretion over when independent review happens.
Minimum triggers: any orchestrator-authored artefact outside `scripts/` and
`.github/`, and anything shown to the sponsor. An audit the reviewed agent can
decline to request is not an independent control.

### 5.5 A read-back rule — **PROSE**

*Deliver, then read back what you delivered as the reader receives it.* Trivial,
free, and it is what caught the one defect round the orchestrator caught. Make
it a standing obligation in the charters, not a habit.

### 5.6 A house style for sponsor-facing prose — **PROSE**

The shell has no writing standard, and it shows. Short sentences. One claim per
sentence. No editorializing inside artefacts. State what a thing is before
stating what is interesting about it. This is cheap to write and would measurably
improve every human-facing surface.

### 5.7 Treat "the renderer needs heuristics" as a stop signal — **PROSE**

Worth one line in the orchestrator's charter. When a rendering task requires
scoring, guessing or reconstruction, stop and ask whether the source artefact
is missing a field. Do not iterate on the heuristic.

---

## 6. What this experiment actually established

The stripped shell **does** transplant: journals, commit discipline, work
orders, gates, countersignatures with genuine rejections, escalation classes
and the federation pipeline all ran on a new domain with no reference to the
NIC. That part worked.

What did not transplant is the **standard of the artefacts**, because the
standard was never in the shell — it was in the reference project's own
documents. The copy therefore reproduced a process that certifies quality
without carrying the definition of it.

That is a fixable, specific defect, and finding it is arguably what the
experiment was for.

**But the audit's second CRITICAL is not a transplant failure.** No review lane
over sponsor-facing work exists in *either* repository. The reference never hit
it; this program did, hard, and the sponsor absorbed the cost. A shell that
relies on the orchestrator choosing to invoke its own audit has no independent
control at all — it has a courtesy.

---

## 7. Postscript: what happened when this document met the audit

This document's first draft was written before `AUD-0003` returned. The audit
corrected it in two ways worth recording, because both are instances of the
very failure modes it recommends fixing:

1. **It contained a fabricated measurement.** "55 of 91 are table rows" was
   `91 − 36` presented as a count. The real figure is 49. An arithmetic
   inference was tagged as an observation, in a document arguing for rigour
   about exactly that.
2. **It framed the fault outward.** By opening on the shell defect it made a
   structural story out of an event whose proximate cause — `WO-0003`'s
   instruction — was the author's own. That framing was disclosed to the
   auditor with an explicit instruction to discount it, and the auditor did,
   and found F7.

Both were caught only because an independent party read the work. That is the
argument for §5.3 and §5.4 in miniature, and it is the reason those two
recommendations should be implemented before any of the others.
