# AUD-0003 — the derived requirement artefacts, and how they reached the sponsor

- **Work order**: [`WO-0010_derived-artefact-audit.md`](../../../agents/handoffs/WO-0010_derived-artefact-audit.md), ISSUED 2026-08-06
- **Auditor**: `auditor` · authority `J-auditor-0003`
- **Baseline SHA, pinned at spawn** (PROTOCOL §3): **`43757f17052f1a9219e2e27cf792d5e02a55ed97`**
- **Subject commits**: `7fab48b`, `a729177`, `a5bc7f4` — **all authored by the orchestrator, the agent that issued this work order, commits this report, and relays it.** Precedent for a CRITICAL against that party is `AUD-0002-F1`.
- **Constraint honoured**: nothing was repaired. No file outside `docs/reports/audit/**` and my own journal was written, and no git command was run.

---

## 0. Verdict

> ## **FAIL — 2 CRITICAL · 8 MAJOR · 5 MINOR · 5 NO-VERDICT**
>
> **The sponsor is right, and the scale is larger than the one example.**
> `REQ-001` as rendered is a port-table row with its column headers glued back
> on — and worse than that: it is **one of nine** equally-cited port rows,
> selected by line length, describing the meaning of `mem_addr` rather than the
> single-port memory contract that REQ-001 actually is. **57 of the 91 entries
> in `docs/specs/REQUIREMENTS-LIST.md` are not requirement statements in any
> form an engineering inspection would accept.** Three of them state something
> that is *not the requirement at all* — `REQ-046`'s entry states the
> alternative the specification **rejected**.
>
> **Mechanical extraction cannot produce a requirements document from this
> corpus, and no better extractor will change that.** The artefact should be
> **withdrawn**, not improved. §3.B gives the argument; §7 gives the causal
> chain, which is not the one the orchestrator proposed to me.
>
> **Nothing in this program has ever reviewed anything the orchestrator
> published to the sponsor.** Not one derived artefact — the website, the
> atlas, the flat list, the extractor, the board — has been read by any agent
> other than its author before it reached the sponsor. That is not an
> oversight in four commits; it is the standing condition of the program, and
> §3.F enumerates it.
>
> **`FAIL` and not `PASS WITH FINDINGS`** because the audited artefact does not
> do the thing it claims to do, and because the process question the sponsor
> asked has the answer "nobody looked, and no one was ever going to."

**What this verdict does not say.** It says nothing against the *substance* of
`SPEC-P1-core-cpu.md`. `dv_lead` graded that document three times and found no
error in any instruction semantic, cycle count, fault definition or the decode
partition; that grading is not disturbed here. The findings below are about the
**form** of the requirements corpus and about **who checked what**.

---

## 1. Scope, the pin, and where I widened it

WO-0010 §3 asks six questions, A–F. All six are answered, each with a finding
or an explicit NO-VERDICT.

**I widened the audit, and say so here as instructed.** Mid-audit the
orchestrator disclosed that this repository is a stripped-down copy of
`renatom11/agentic-fpga` and that the sponsor's concern is whether the
organization reproduces its quality on a project other than the NIC, and made
that repository readable at `/workspace/renatom11/agentic-fpga` (HEAD
`e5c0b11`). That material bears directly on §3.B and §3.D, so I took it in.
Three things about how I took it:

1. **It is out-of-repo evidence.** It is not at my pin, it is not in this
   repository's history, and a future reader of this report cannot re-execute
   against it from a checkout of `my-project`. Every claim I make about it is
   marked *(reference repo)* and is a file-and-line citation into a tree at
   `e5c0b11`.
2. **I discounted the framing that came with it.** The orchestrator's covering
   note proposed a conclusion — that a standalone requirement statement "was
   never authored in this program", making the fault a shell defect rather than
   its own judgement. It told me to discount that framing because it has an
   interest in it. I did, and **the framing is materially wrong**: 36 of the 91
   requirements *do* carry a standalone statement, 33 of them good ones. §7
   states the chain I actually found, and its third link is an instruction the
   orchestrator itself wrote.
3. **I read the reference repository and wrote nothing to it.**

**Deliberately out of scope.** `AUD-0001-F3` and `AUD-0002-F1` are both still
open and I did **not** re-verify either here. Closing a finding deserves its own
sampling frame, not a drive-by inside another window. Both remain the
auditor's to close and neither is closed by this report.

**Discharged in passing**: carry-forward row **C-11** on the
`P1-spec-freeze` checklist requires §8.3 of `DV-P1-countersignature-final.md` to
"reach the auditor" by "the next audit cycle". This is that cycle, and
**WO-0010 did not route it** — I found it by reading the checklist. I have read
§8.3 and adopt its rule for corpus reading. Routing gap recorded as **F15**'s
sibling observation in §9.

---

## 2. Sampling frame

*An audit whose sample cannot be reconstructed is itself vacuous (charter §8).*

**Method environment.** All re-execution ran in a throwaway clone in the
session scratchpad, checked out at the pin and at four historical SHAs. No
writing git command touched `/home/user/my-project`. This matters: three of the
questions turn on regenerating `docs/specs/REQUIREMENTS-LIST.md`, which is a
**write** to an audited path, and doing that in place would have been a
write-scope violation as well as a contaminated measurement.

**Sampled exhaustively**
- All **91** entries of `docs/specs/REQUIREMENTS-LIST.md`, classified by a
  script whose partition is stated in §3.A.2 and re-derivable.
- All **91** ids traced back into `docs/specs/SPEC-P1-core-cpu.md` for their
  definitional form and their mention count inside §4–§9.
- All **36** prose-derived entries read in full and adjudicated by hand.
- `site/requirements.mjs` and `scripts/gen_req_list.mjs` read line by line.
- Every *Measured*-tagged quantity in `J-orchestrator-0064..0069` — 24 claims —
  triaged, and the 14 load-bearing ones re-executed or declared
  non-re-executable with the reason.
- R1–R10 over the three subject commits; the marker-check duty tree-wide and
  across all refs; the whole commit range by `check_journals.sh --all`.
- Every file under `docs/reports/audit/**`, `docs/reports/dv/**`,
  `agents/journals/**` and `agents/handoffs/**` grepped for any mention of the
  atlas, the list, the extractor or the generator.

**Sampled by reading**: `docs/specs/requirements.md` §1–§3;
`docs/specs/SPEC-TEMPLATE.md` §10 in both repositories; `agents/PROTOCOL.md` §7
in both; `agents/charters/architect_docs_lead.md` in both;
`DV-P1-testability.md` §0/§2/§4; `DV-P1-countersignature-final.md` §8.3;
`WO-0003` §3; `J-architect_docs_lead-0002`'s matrix-design section;
`ORG_CHART.md`'s roster; the `P1-spec-freeze` checklist.

**Deliberately skipped, with reasons**
- `site/build.mjs`'s HTML/CSS layer beyond the atlas card rendering — the
  question is what the artefacts *say*, not how they are styled.
- The 55 table-derived entries were not each traced to a hand judgement; the
  partition that puts them in that class is structural and mechanical, and I
  spot-checked six against the spec rather than all 55. Stated so the reader
  knows which of my counts is mechanical and which is adjudicated.
- The reference repository's own history, benches, RTL and journals. I read its
  requirements document, its spec template, its protocol §7 and one charter,
  and nothing else. A comparative audit of that program is not this packet.
- `AUD-0001-F3`, `AUD-0002-F1` — see §1.

**Could not execute; declared NO-VERDICT rather than skipped silently** — §8.

---

## 3. The questions

### 3.A — Is the sponsor's charge correct, and at what scale?

**Yes, and REQ-001 is a worse example than the sponsor knew.**

#### 3.A.1 REQ-001 as rendered

`docs/specs/REQUIREMENTS-LIST.md:26-27`, verbatim:

```
- **REQ-001** — **Port:** `mem_addr` · **Dir:** out · **Width:** `ADDR_W` ·
  **Meaning:** Byte address of the requested access. Meaningful only while
  `mem_en` is high.
  <sub>§4.B, §6.2 · hook SD · Single-port memory contract; one access per cycle</sub>
```

Applying the inspection test WO-0010 §3.A names:

| Test | Verdict on REQ-001 as rendered |
|---|---|
| **Subject** — does it name the thing obliged? | **No.** `Port: mem_addr` is a field/value pair. Nothing is the subject of a sentence. |
| **Normative verb** — does it oblige? | **No.** There is no finite verb at all in the first three fields. "Meaningful only while `mem_en` is high" is an adjectival fragment. |
| **Testable predicate** — could a test falsify it? | **No.** "Byte address of the requested access" is a definition of a name, not a claim about behaviour. There is nothing to fail. |

**What it actually is**: row 3 of the §4.A port table for module M01
(`docs/specs/SPEC-P1-core-cpu.md:186`), reformatted by pairing each cell with
its column header.

**And it is one of nine.** REQ-001 is cited in the traceability column of
**nine** port rows across §4.A and §4.B — spec lines 184, 185, 186, 187, 217,
218, 219, 220, 221. The extractor scores each and picks the winner; the
tie-break that decided it is **line length** (`site/requirements.mjs:85` —
`score = l.length / 20`). Nothing about `mem_addr` makes it REQ-001's
definition; it is merely the longest of nine co-equal rows.

**What REQ-001 requires** is the single-port memory contract — stated in the
spec as a *structural property of the §4.B interface* and as a bullet at
`SPEC-P1-core-cpu.md:1013` ("At most one memory access per cycle, in every
state"). **Neither is in the entry.** The nearest thing to REQ-001's content
anywhere on that line of the list is the small grey `<sub>` label —
"Single-port memory contract; one access per cycle" — which is §10's registry
*handle*, the very column `J-orchestrator-0064` correctly established **is not
the requirement**.

So the entry does not merely fail the form test. **It shows the wrong fact, and
the right one is present only in the field the program has already ruled
non-normative.**

Three other entries share the arbitrary-pick property: REQ-102 (1 of 2),
REQ-105 (**1 of 8**), REQ-121 (1 of 2). *Measured.*

#### 3.A.2 The scale — method, boundary, counts

**The method, so a third party can re-derive it.** From a checkout at the pin:

```
node -e '
 import("./site/requirements.mjs").then(async m=>{
  const fs=await import("node:fs");
  const rows=m.extractRequirements(
    fs.readFileSync("docs/specs/SPEC-P1-core-cpu.md","utf8"),
    fs.readFileSync("docs/specs/requirements.md","utf8"),{maxLen:Infinity});
  const P=rows.filter(r=>!r.body).length;
  const T=rows.filter(r=>r.body&&/^\*\*[^*]+:\*\* /.test(r.body)).length;
  console.log("POINTER",P,"TABLE-ROW",T,"PROSE",rows.length-P-T);})'
```

Observed: **POINTER 6 · TABLE-ROW 49 · PROSE 36**. The partition is exact and
mechanical; `/^\*\*[^*]+:\*\* /` matches exactly the header-paired cell
rendering that `readable()` at `site/requirements.mjs:222-238` emits for a
table row and emits for nothing else.

**The boundary I used**, stated so it can be argued with:

- **Class P — pointer (6).** The entry carries no requirement text at all; it
  reads *"stated in §X; see the specification."* It cannot be a requirement
  statement because it contains none. Ids: `REQ-002 REQ-028 REQ-096 REQ-101
  REQ-107 REQ-124`.
- **Class T — transcribed table row (49).** The entry is a spec table row with
  its column headers pasted onto its cells. **Fails the subject and
  normative-verb tests by construction**: a `Field: value · Field: value`
  sequence has no finite verb binding the fields to the system. This is the
  class REQ-001 is in.
- **Class S — prose (36).** A statement lifted from the spec's normative body.
  These I adjudicated **by reading all 36**, printed in full during the audit.

**Adjudication of the 36 prose entries**

| Outcome | Count | Ids |
|---|---|---|
| States a requirement — subject, obligation, falsifiable predicate | **33** | REQ-007 008 009 010 011 013 014 020 030 040 041 042 043 047 048 049 085 086 087 095 100 103 104 106 108 109 111 112 114 115 120 122 123 |
| **Verbless** — noun phrase plus appositives, no finite verb | 1 | REQ-012 |
| **States something that is not the requirement** | **2** | REQ-029, REQ-046 |

**REQ-029** ships, as its requirement, only the paragraph explaining *why the
clause exists*: *"This clause exists because ADR-0017 Amendment A2 §5 names …
as the question most likely to produce false divergences in P1 …"*. The actual
retire contract — four normative bullets at `SPEC-P1-core-cpu.md:1051-1064`,
including "`obs_retire` is high for **exactly one** clock cycle per instruction
that completes without fault" — is **entirely absent**. The block collector
stops at the blank line, and the colon-continuation rule added at `7fab48b`
does not fire because the rationale sentence ends in a period. *Measured.*

**REQ-046** is the sharpest one. Its entry reads:

> **REQ-046's alternative, recorded as rejected.** Wrapping a multi-byte span
> modulo 4096 instead of faulting was considered and rejected: …

That is the **rejected** design, presented under the requirement's id. The
requirement itself — halt with `ERR_ADDR_RANGE`, check before any access — is a
§9 fault-table row at `SPEC-P1-core-cpu.md:1194`, which the scorer loses to the
rejected-alternative paragraph because that paragraph carries the bold-statement
bonus (+120, `site/requirements.mjs:93`) and a line-start bonus (+60) while the
fault row scores only length plus the +40 traceability-column bonus. *Measured.*

A reader skimming REQ-046 in a document titled "P1 requirements — flat list"
can come away believing the machine wraps. It does not; it faults.

#### 3.A.3 The count

| | Entries | of 91 |
|---|---|---|
| **Read as a requirement** | **34** | 37% |
| — clean prose statements | 33 | |
| — verbless but recoverable (REQ-012) | 1 | |
| **Do not read as a requirement** | **57** | **63%** |
| — transcribed table rows (class T) | 49 | |
| — pointers with no text (class P) | 6 | |
| — prose stating the wrong thing | 2 | |

**A supplementary split I deliberately do not lean on.** Within class T, a
proxy for "the content is at least recoverable from the cells" — does any cell
contain a ≥40-character full sentence — puts 22 of the 49 on the favourable
side. **I do not rely on it, because REQ-001 itself lands in that favourable
bucket**, on the strength of two verbless fragments. That is the proxy failing,
and it is worth stating: even a generous automated read of these entries
mis-scores the sponsor's own example.

→ **F1 (CRITICAL)**, **F2 (MAJOR)**.

---

### 3.B — Is mechanical extraction capable of producing a requirements document at all?

> ## **No. The assumption is unsound, and the remedy is not a better extractor.**

WO-0010 asks me to test the assumption rather than the implementation, so I
will not list regex defects. The assumption is:

> *a requirement statement can be recovered from the specification by scoring
> lines and reformatting table rows.*

This presupposes that for each id **there exists, in the source, a text span
that is the requirement statement**, and that it is identifiable by surface
features. Four measured facts, each independently fatal:

**1. For 55 of 91 ids there is no such span.** The specification states these
requirements as table rows, as an absence in a port list, as a bold label over
a table, or as a parenthetical citation inside a *different* requirement's
prose. Reformatting a row does not produce a requirement statement; it produces
a reformatted row. This is not a limitation of the current scorer — a perfect
scorer selecting the perfect line still yields `Port: mem_addr · Dir: out · …`.
**No function of the source text produces a requirement here, because the
requirement statement is not a function of the source text — it is new
authorship.**

**2. For 4 ids there is no span at all.** `REQ-101` and `REQ-124` appear **zero
times** in §4–§9 (measured over lines 143–1225 of the frozen spec); `REQ-096`
and `REQ-107` appear only as parenthetical citations inside other requirements'
sentences. Their entire textual existence is §10's registry handle, which this
program has ruled non-normative. There is nothing to extract, correctly or
otherwise.

**3. Where multiple candidate spans exist, there is no principled selector.**
REQ-001 has nine co-equal traceability rows; REQ-105 has eight. The extractor
picks the longest. Length is not evidence of definitional status, and no
feature in the source distinguishes them, because the source never marked one
as definitional.

**4. The failure mode is undetectable by any quality bar the extractor can
carry.** This is the decisive argument. The quality bar at
`site/requirements.mjs:258-266` rejects a body that starts mid-sentence, has
unbalanced bold, or is under 28 characters of prose. REQ-029 and REQ-046 pass
every one of those tests: they are fluent, complete, well-formed English
paragraphs, correctly bolded, hundreds of characters long. **They are simply
the wrong text.** A bar built out of surface features cannot separate a correct
extraction from a confident wrong one, because the difference is semantic and
lives outside the document's surface form. The orchestrator named this class
itself at `J-orchestrator-0068` — *"not a fragment a reader can see is
incomplete, but a plausible, well-formed, wrong statement"* — and then shipped
two more instances of it in the same commit that named it.

**What follows.** Four rounds of extractor improvement produced monotonic
improvement in a metric (`3 → 7 → 6 → 6` pointer cards; `88 → 84 → 82 → 85`
cards with text) that does not measure the property in question. The metric
counts *whether a card shows text*. The property is *whether the text is the
requirement*. Those came apart at round one and never rejoined.

**The recommendation, stated plainly because the packet asked for it plainly:
withdraw `docs/specs/REQUIREMENTS-LIST.md`.** Do not improve it. A requirements
document for this corpus has to be **authored**, requirement by requirement,
against the frozen spec, by the lead who owns requirements, and reviewed by the
lead who owns testability. That is §3.C's gate and §7's missing artefact — not
a rendering job.

**One thing this finding does not license.** The *atlas* — an index of cards
each linking into the spec — is a defensible artefact for what an index is. Its
current defects are the same ones, and it carries them into a page that says
"read it in §X" alongside. If it survives, it should present the §10 handle and
the section link and **stop**, rather than synthesise a body it cannot
guarantee. That is a design choice for whoever owns it; I record only that the
index use and the requirements-document use are different problems, and only
the second is impossible.

→ **F3 (MAJOR)**.

---

### 3.C — What did the process fail to do?

**There is no review gate on derived artefacts, and there is no role that could
staff one.** `ORG_CHART.md:79-87` lists nine roles. Not one has "review what the
orchestrator publishes" in its remit. The auditor audits process and is spawned
only when the orchestrator writes it a work order. PROTOCOL §7 gates specs
(`P<n>-spec-freeze`), modules (`P<n>-module-ready`) and phases
(`P<n>-phase-accept`); nothing gates anything rendered for, deployed for, or
handed to the sponsor.

**The gate I name, and where it attaches.** I am willing to propose this one:

> **A `P<n>-spec-freeze` precondition, new row**: *no artefact derived from a
> frozen specification and placed in a sponsor's decision path may be published
> until the lead who owns the source artefact has signed that it represents the
> source faithfully.*

- **Where it attaches**: `PROTOCOL §7`, as a row on `P<n>-spec-freeze` and on
  `P<n>-phase-accept` — not a new gate. A new gate would need its own
  checklist, quorum and signature machinery, for a class of artefact that
  appears only next to an existing gate anyway.
- **Who signs it**: **the architect, and dv_lead, both.** Not either alone.
  - The architect signs **fidelity** — does this artefact say what the frozen
    document says? That is definitionally the owner of the source artefact's
    call, and PROTOCOL §6 already gives the architect `docs/**`.
  - `dv_lead` signs **usability as a test-derivation basis** — can a bench be
    derived from this? A requirements rendering that no test can be built from
    is not a requirements rendering, and dv_lead is the only lead whose charter
    makes that judgement.
  - The reason for both is §7's finding: this program produced an artefact that
    the architect would have caught as unfaithful *and* that dv_lead would have
    caught as underivable, and it got neither review because it got no review.
- **Enforcement class**: **PROSE** if written this way — a checklist row and a
  signature. There is a MACHINE component available and I name it because
  ADR-0002 requires the distinction be honest: a CI check can refuse a commit
  that adds or modifies a file under a declared `derived/` manifest without a
  matching signature row. I do not propose it; I record that the difference
  between PROSE and MACHINE here is real and that a PROSE rule in a program
  whose author-reviewer-approver collapse is the finding is a weak instrument.

**I decline to propose the second half.** Whether the *website* — a public
deployment with 11 unreviewed commits — belongs under the same gate or needs a
different one is a scope question with cost implications I cannot price, and it
touches roles that do not exist. **NO-VERDICT (NV-3)**, with what would settle
it named in §8.

→ **F4 (CRITICAL)**.

---

### 3.D — Does the corpus support a flat list?

**Two answers, and they are not in tension.**

**(a) The table-defined majority is legitimate specification practice.** 49
entries derive from table rows: port tables, state tables, opcode tables, quirk
parameter tables, fault tables. Defining a port's direction, width and meaning
in a table row is normal, good hardware-specification practice; the alternative
is 30 paragraphs restating a table badly. `dv_lead` graded all 90-then-91
requirements against the question *"can a bench be derived from this document
alone"* (`DV-P1-testability.md:82-86`) and answered yes for 68 at the first
grading, and countersigned after two more rounds. **A renderer must accommodate
this, and the fact that this renderer cannot is the renderer's problem.**

**(b) Four requirements have no definition site anywhere, and that is a real
defect in the frozen document.** Measured over the normative body
(`SPEC-P1-core-cpu.md` lines 143–1225, i.e. §4 through §9):

| Id | Mentions in §4–§9 | What exists |
|---|---|---|
| `REQ-101` | **0** | Nothing. Only §10's handle. |
| `REQ-124` | **0** | Nothing. Only §10's handle. |
| `REQ-096` | 3 | All three are parenthetical citations inside *other* requirements ("…so §4.3 and REQ-096 are unaffected"). |
| `REQ-107` | 1 | A mid-sentence parenthetical. |
| `REQ-002` | 1 | `**Memory map (REQ-002).**` — a bold label over a table. |
| `REQ-028` | 1 | `**REQ-028** is the table above.` |

For the first four, **the only text stating what the requirement is** is §10's
registry row — the "How P1 satisfies it" column, which the architect
characterised as *"a restatement whose divergence from the spec nothing in this
repository could detect"* (`J-architect_docs_lead-0002`) and which
`J-orchestrator-0064` correctly ruled is not the requirement. So for four of 91
ids, this program's own doctrine says the only text that exists is not the
requirement.

**In fairness to everyone who signed it**: `dv_lead` looked at exactly these
and dispositioned them (`DV-P1-testability.md` §4.5–§4.7) — REQ-101 *"Structural,
and honestly graded `S`. The port list **is** the proof"*; REQ-096 *"Structural
(no run-time control path exists to test)"*; REQ-107 flagged as **F-6**,
performer unnamed. Structural-by-absence is a legitimate category and dv_lead
handled it honestly. **The defect is not that these are bad requirements. It is
that a requirement with no text has nothing for a reader, a reviewer, a
renderer or a traceability matrix to bind to** — and the list's own disclaimer,
*"Where the two differ the specification wins"*, has no referent for these ids.

**(c) So: can a flat list be derived honestly?** **No — derived, no; authored,
yes.** A generator cannot honestly produce this document. A human-or-agent
author working requirement by requirement can, and would surface (b) as four
spec diffs on the way.

**Does this touch S1?** **Yes, and the sponsor should be told so before
signing.** Three things a signer should have in front of them:

1. **Four of the 91 requirements being frozen have no normative statement in
   the document.** That is true of the frozen text, independent of any
   rendering defect, and it was not on the checklist.
2. **The corpus does not meet the standard the reference program set for
   itself.** That program's `requirements.md` §0.1 requires *"a reader who has
   never seen the design must be able to build a test from a single row"* and
   §0.2 requires *"one REQ states one testable fact"*. This corpus meets
   neither as a general property — by measurement, 34 of 91 entries could
   support the first. **If the sponsor's standard is the reference program's,
   this corpus does not meet it and S1 should not be signed until that is
   dispositioned.** §7 explains why it does not meet it, and the reason is not
   that the specification is bad.
3. **What S1 would still be signing is sound.** `dv_lead` withheld its
   signature twice and found eleven blocking defects across three gradings.
   The substance was hammered. It is the *atomicity and self-containment* of
   the requirement statements that nobody ever graded, because nobody was ever
   asked to.

→ **F5 (MAJOR)**, and see **F6**, **F7**, **F8**.

---

### 3.E — Are the four fix rounds trustworthy?

I re-executed rather than read, per the packet. **14 load-bearing claims;
8 reproduce, 3 do not, 3 cannot be re-executed at all.**

#### 3.E.1 Re-execution table

All at a throwaway clone, checked out at the SHA named.

| # | Entry | Claim (tagged *Measured* unless noted) | At SHA | Observed | Verdict |
|---|---|---|---|---|---|
| 1 | 0064 | 3 cards point at the spec (⇒ 88 of 91 carry text) | `a3fc912` | 3 pointer cards in the rendered atlas | **reproduces** |
| 2 | 0065 | 36 of 91 carry a bold `**REQ-nnn …**` statement | pin | **36** | **reproduces** |
| 3 | 0065 | **55 are defined only in tables** | pin | **false as stated** — 49 render from table rows; the other 6 are a bold label, a "is the table above" sentence, and four parenthetical/absent ids. 55 = 91 − 36, i.e. *derived by subtraction*, tagged *Measured* | **FAILS — F12** |
| 4 | 0065 | 84 show text, 7 point | `b05da82` | 7 pointer cards ⇒ 84 | **reproduces** |
| 5 | 0066 | audit `ok 76 → 82`, `POINTER 7 → 6`, `TRAILS-OFF 5 → 0` | `7fab48b` | POINTER = **6** reproduces. `ok` and `TRAILS-OFF` **cannot be re-executed**: the audit script is not in the repository, at any commit, and `site/dist/` — which the entry names as the re-derivation target — is in `site/.gitignore` | **NOT RE-EXECUTABLE — F9** |
| 6 | 0066 | scoring-change blast radius: exactly 1 card (REQ-005) | `7fab48b` | not re-executable — needs the pre-change rendered snapshot, which is not committed | **NO-VERDICT (NV-2)** |
| 7 | 0067 | list: 91 entries, 7 blocks, 6 not quoted | pin | `wrote docs/specs/REQUIREMENTS-LIST.md: 91 requirements, 6 not quoted, 7 blocks` | **reproduces** |
| 8 | 0067 | generator output is byte-identical to the committed file | pin | sha256 identical before and after regeneration: `07c5c051…05cdd` | **reproduces** |
| 9 | 0067 | list script-audited: **0 flagged** other than the 6 pointers | pin | **not re-executable** (same missing script) — and **refuted on the merits**: REQ-029 and REQ-046 are in the list and are wrong | **FAILS — F1, F9** |
| 10 | 0067 | `test_protocol.sh`: 49 passed, 0 failed | pin | `protocol self-test: 49 passed, 0 failed` | **reproduces** |
| 11 | 0067 | `check_journals.sh --all`: **75 commits** green | `a729177` | **76** at `a729177`. 75 reproduces only at the **parent** `7fab48b`. No measurement SHA stated | **FAILS — F11** |
| 12 | 0067 | CI staleness guard has **never executed** (*explicitly not measured*, per ADR-0016) | — | Correct when written. **Now superseded**: the `determinism` job has run 3× (`a729177`, `a5bc7f4`, `43757f1`), all success — run `31047557264`, job `92446727395`, steps "Regenerate the flat requirement list" and "Verify nothing was left unpromoted" both `success`. **The guard is now MACHINE and demonstrated** | **honest then; superseded — see F13** |
| 13 | 0068 | regeneration diff against `a729177`: exactly 2 entries | `a5bc7f4` | exactly 2: REQ-069 and REQ-114 | **reproduces** |
| 14 | 0068 | Atlas: **82** state, **6** point | `a5bc7f4` | **85** carry text, **6** point. 82 + 6 = 88 ≠ 91 | **FAILS — F10** |
| 15 | 0069 | zero audit reports, zero dv reports naming the atlas/list/extractor | pin | zero in `docs/reports/audit/**`, zero in `docs/reports/dv/**`, zero in every journal but the orchestrator's, zero in every packet but WO-0010 | **reproduces** |

#### 3.E.2 The pattern in the failures

They are not random. **Every claim that reproduces was produced by an
instrument that is in the repository** (the generator, `test_protocol.sh`,
`check_journals.sh`, `git diff`). **Every claim that fails or cannot be
re-executed was produced by an ad-hoc script that was never committed.** That
is a clean, mechanical predictor, and it is the finding: not that the
orchestrator measured carelessly, but that half of what it measured with cannot
be inspected.

`J-orchestrator-0066` states, as its own lesson candidate: *"A claim I cannot
re-derive on demand is not evidence."* Two entries later it emitted three more
such claims. **PROTOCOL §4.1 is explicit** — Evidence cites either commands
runnable from a repo checkout or externally verifiable references, and mentions
of ephemeral artifacts **must say so explicitly**. None of these did.

**Answer to §3.E**: the *repairs* are largely real — the four rounds fixed
genuine defects and I verified two of the fixes directly (REQ-069's escaped
pipe, REQ-114's continuation). **The tallies reporting them are not
trustworthy as evidence**, because the instrument is gone. And the highest-level
claim of all — "0 flagged across 91 entries" — is refuted by reading the file.

→ **F9 (MAJOR)**, **F10 (MINOR)**, **F11 (MAJOR)**, **F12 (MINOR)**, **F13
(MINOR)**.

---

### 3.F — Was the sponsor's exposure to unreviewed work a one-off or a pattern?

**It is the standing condition of the program. Nothing has ever been
reviewed.** The orchestrator is right that it cannot grade this, so here it is
measured rather than asserted.

**Commit census at the pin**: 78 commits. `orchestrator` 69, `architect_docs_lead`
4, `dv_lead` 3, `auditor` 2. *Measured.*

**Enumeration of what reached the sponsor with no independent review**

| # | Artefact | Commits | Reviewed by | Evidence |
|---|---|---|---|---|
| 1 | **The public website** (`site/**`, deployed to Cloudflare) | 11, all orchestrator | **nobody** | `git log --oneline -- site/` |
| 2 | **The spec atlas** (`/atlas/`, 91 cards) | 5 of the above | **nobody** | as above |
| 3 | **`docs/specs/REQUIREMENTS-LIST.md`** | 2 | **nobody** | `a729177`, `a5bc7f4` |
| 4 | **The extractor and generator** (`site/requirements.mjs`, `scripts/gen_req_list.mjs`) | 2 | **nobody** | as above |
| 5 | **`tasks/BOARD.md`** — the live state summary the sponsor reads | ~40 | **nobody** | orchestrator-owned by §6 |
| 6 | **Every escalation packet's framing**, including the E1 for `P1-spec-freeze` and its "what a signer should know first" | — | **nobody** | BOARD "Pending escalations" |
| 7 | **The G0 export packet** `docs/federation/outbox/G0.md` | 1 | **nobody** (AUD-0001-F6 found a defect in it *after* it was written) | `93fd657` window |
| 8 | **ADR-0017 Amendments A1** — two corrections made to a sponsor-**accepted** ADR | 1 | **nobody** | BOARD, E3 DISCHARGED bullet |
| 9 | **Every toolchain measurement** feeding that ADR | — | **nobody** | BOARD, "Toolchain, measured" |

**Against that, what *was* independently reviewed**: `SPEC-P1-core-cpu.md`
(three gradings by `dv_lead`, two withheld signatures, eleven blocking defects
— and it is the best-checked artefact in the tree); the seed commit range
(AUD-0001); the `f9a6bef` authorship question (AUD-0002). **Three artefacts.**

**The structural fact underneath**: the auditor is the only independent reviewer
this org has, and it is spawned **only when the orchestrator writes it a work
order**. Independence of *judgement* is preserved — AUD-0002-F1 is a CRITICAL
against the spawning party and it stands — but independence of *agenda* is not:
the orchestrator chooses what gets audited, and for the entire life of the
website, the atlas, the list and the extractor, it chose nothing. It disclosed
this itself, unprompted, when asked. That disclosure is real and I record it.
It does not change the measurement.

**So: not a one-off. Rounds 1–3 of atlas defects were caught by the sponsor
(`J-orchestrator-0064`, `0065`, `0069`); round 4 by the orchestrator reading its
own output back after a question about a file path (`0068`). The sponsor has
been the program's review function for its entire sponsor-facing surface.**
*Measured from the journal chain; the 3-and-1 split reproduces.*

→ **F4 (CRITICAL)**.

---

## 4. The widened question — the reference program, and where the standard went

*Out-of-repo evidence, read at `/workspace/renatom11/agentic-fpga` HEAD
`e5c0b11`. Not re-executable from a checkout of this repository.*

### 4.1 What the reference program has that this one does not

`(reference repo) docs/specs/requirements.md` is 1003 lines and **is itself the
requirements document**. Its per-REQ tables are headed
`| REQ | Kind | Requirement | Verification |` and each row carries a Kind tag
(INV/IFC/FUNC/ERR/PERF/PROC), a bold title, a normative **SHALL** sentence, and
a Verification cell stating how the requirement is tested. Verified by reading
rows REQ-001 … REQ-012 in full at lines 596–607.

Its §0.1 and §0.2 state the design rule the sponsor is measuring against:

> *"Every row here is written to stand alone — a reader who has never seen the
> design must be able to build a test from a single row"* — §0.1
>
> *"One REQ states **one** testable fact. Where a behaviour has several
> observable consequences, each consequence gets its own REQ."* — §0.2

**A flat requirements list for that program is a `cat` of a file.** There is
nothing to extract because nothing needs extracting.

### 4.2 Is the standard absent from the manifest this copy inherited? — verified

I checked this independently rather than accepting it, because the party that
raised it benefits from the answer.

| Artefact | Reference repo | This repo | Result |
|---|---|---|---|
| `PROTOCOL.md` §7, `P<n>-spec-freeze` row | *"Architect's specs complete with REQ-### requirements … dv_lead countersigns testability"* (line 254) | same wording plus the interface-check clause (line 329) | **the form of a requirement is unspecified in both** |
| `agents/charters/architect_docs_lead.md` line 21 | *"every spec carries numbered requirements, and you maintain the requirement→test traceability matrix …"* | **byte-identical** | **no form requirement in either** |
| `docs/specs/SPEC-TEMPLATE.md` §10 | `| REQ | How this module satisfies it | Section | Verification hook for DV |` / `| REQ-### | one sentence | §6.1 | … |` | **identical** | the only form words the shell ships are **"one sentence"**, in a *coverage* column |

**Confirmed: no law, charter, gate or template in this shell states what a
requirement must look like.** The reference program's quality lived in
`requirements.md` §0.1/§0.2 — **project-local text authored inside that
project** — and in a document topology the shipped `SPEC-TEMPLATE.md` assumes
without ever mandating. The template repeatedly treats `requirements.md` as the
normative source ("Do not paraphrase the requirement text — cite"; "Strobe names
are normative and come from `requirements.md`"), which is coherent only if that
file holds requirement text.

**That is a shell defect and it is the most valuable thing this experiment has
produced.** The organization's constitution transports *process* faithfully —
journals, commit rules, gates, independence, escalation, the auditor — and
transports **none of the artefact standard** that made the reference program's
output good. A fork inherits how to work and not what good looks like.

→ **F6 (MAJOR)**, filed against the canonical shell per `CLAUDE.md`'s defect
rule, **not** through the lessons pipeline.

### 4.3 But the fault does not relocate entirely, and here is why

The orchestrator's framing was that the standalone statement "was never
authored in this program", making this wholly a shell defect. **Three
corrections, each measured:**

**(a) 36 of 91 requirements *do* carry a standalone statement**, in the form
`**REQ-nnn — title.** <sentence>`, and 33 of those are good ones by the test in
§3.A. The corpus is **heterogeneous**, not empty. An honest account is "this
program authored standalone statements for 40% of its requirements and table
rows for the rest", which is a different and less exculpatory fact.

**(b) The instruction that removed the standalone statement's home was the
orchestrator's own.** `WO-0003` §3, orchestrator → architect, lines 84–86:

> **"Do not renumber or restate REQ ids.** The matrix cites them; it does not
> re-specify them. A requirement stated twice is a requirement that will
> diverge."

The architect complied and said so in its own record
(`J-architect_docs_lead-0002`): *"The packet says: do not renumber or restate
REQ ids… I took that literally and it decided the file's shape. There is **no
prose column**…"* — and gave a good reason for the underlying principle.
`docs/specs/requirements.md` §1 now reads *"It is an index. It is not a
source… This file deliberately carries **no column restating what a requirement
says**"*.

**The anti-divergence principle is sound. The consequence was not checked.** In
the shell's template model, `requirements.md` is where standalone requirement
text lives; instructing that it hold none, while §10 of the spec became "the
authoritative registry" with a *handle* column, left **no artefact anywhere in
the project holding a per-requirement standalone statement**. Nobody noticed
because nobody's remit was to notice. **The architect is not at fault here**:
it executed an instruction, disclosed that it had, and reasoned about it in
public.

**(c) `SPEC-P1-core-cpu.md` §10 fills the template's "one sentence" column with
handles.** "Single-port memory contract; one access per cycle" is a noun phrase.
That is a deviation from the shipped template, made locally, and it was never
raised — but it is a *consequence* of (b), not an independent choice: with the
matrix forbidden to restate, §10 had to become the registry, and a registry of
handles is what it became.

→ **F7 (MAJOR)**, subject: the orchestrator.

### 4.4 How the freeze certified it — and why dv_lead is not at fault

`dv_lead`'s method is stated at `DV-P1-testability.md:80-86`:

> 1. *"Every REQ's own text was read before it was graded, **through the
>    section it lives in, not through the §10 registry row**."*
> 2. *"Each of the 90 requirements was asked one question: **can a bench be
>    derived from this document alone**, and is there an observation point at
>    which the thing it asserts is visible?"*

That is **testability from the whole document**. It is exactly what PROTOCOL §7
asks for, and dv_lead applied it hard — three gradings, two withheld
signatures, eleven blocking defects, and it explicitly declined to read the §10
registry rows, which was the right call for the question it was asked.

**"Testable from this document" does not entail "stands alone".** A requirement
distributed across nine port-table rows and a bullet in §7 is testable from the
document and does not stand alone. Nobody in this program has ever been asked
the second question — not the architect (its charter says "numbered
requirements", not self-contained ones), not dv_lead (its gate row says
"testability"), not the auditor (never spawned at it), not the orchestrator.

**Classification, as the packet asks**: this is a **gate-wording defect**, not a
charter defect and not a dv_lead failure. The gate row asks for testability and
gets it. What it does not ask for is atomicity, and adding that is a one-clause
change to PROTOCOL §7 that reaches every project founded from this shell.

→ **F8 (MAJOR)**. **`dv_lead` is exonerated of any part of this.**

---

## 5. Findings

> **Every finding below cites a SHA, a `file:line`, a `J-<agent>-NNNN`, or a
> command. A finding a reader cannot check is not a finding.**

### F1 — CRITICAL — the flat list states, as requirements, text that is not the requirement

**Subject: the orchestrator** — author, sole reviewer, approver and publisher of
`site/requirements.mjs`, `scripts/gen_req_list.mjs` and
`docs/specs/REQUIREMENTS-LIST.md`; and the party relaying this finding.

Three entries in a sponsor-facing artefact assert something the frozen
specification does not require:

| Id | The list says | The spec requires | Cite |
|---|---|---|---|
| `REQ-046` | *"REQ-046's alternative, recorded as rejected. Wrapping a multi-byte span modulo 4096 instead of faulting…"* — **the rejected design** | Halt with `ERR_ADDR_RANGE`; no access issued, no register written; the check precedes the first access | list:94-95; spec:1194 (requirement), spec:1214 (what was rendered) |
| `REQ-029` | Only the paragraph explaining why the clause exists | `obs_retire` high for **exactly one** cycle per non-faulting instruction; the whole `obs_*` bundle describes the just-completed instruction in that cycle; never asserted on a fault | list:75-76; spec:1049 (rendered), spec:1051-1064 (**dropped**) |
| `REQ-001` | `mem_addr`'s meaning — **1 of 9** co-equal port rows citing REQ-001, chosen by line length | The single-port memory contract: at most one memory access per cycle, in every state | list:26-27; spec:186 (rendered); spec:184-187, 217-221 (the other eight); spec:1013 (the requirement) |

**Criterion applied**: an artefact published into the sponsor's decision path
misrepresents the content of a frozen, countersigned specification. This is the
defect class the orchestrator itself defined at `J-orchestrator-0064` — *"a
viewer that misrepresents the thing it views is worse than no viewer, because
it produces confident wrong decisions rather than absent ones"* — and named
again at `J-orchestrator-0068` as *"the worst class of defect this generator
can produce"*. It is CRITICAL because it is not a legibility complaint: a
reader acting on REQ-046's entry would build the wrong machine.

**It is not cured by the file's non-normative disclaimer.** *"Where the two
differ the specification wins"* tells a reader what to do once they know the two
differ. It cannot help a reader who does not.

**Grading note, recorded so it can be overruled rather than discovered.** I
considered MAJOR on the grounds that the list is labelled non-normative and no
RTL exists yet. I rejected it: the artefact was produced *for* a gate decision
that is currently open, the sponsor is currently being asked to sign, and
`AUD-0002-F1` established that this auditor does not discount severity for the
party that relays its findings.

**Blocks** `P<n>-phase-accept` until dispositioned and re-verified by me.
**Closure is the auditor's to grant, not the remediating party's to assert.**
Relayed to the sponsor as **E4, verbatim**.

---

### F2 — MAJOR — 57 of the 91 entries are not requirement statements

Method, boundary and counts at §3.A.2–§3.A.3, re-derivable by the command
printed there. 49 transcribed table rows, 6 pointers with no text, 2 stating
the wrong thing; 34 read as requirements (33 clean, 1 verbless).

**Criterion**: an artefact titled "P1 requirements — flat list" in which 63% of
entries are not requirements does not do what its title claims, and a reader
cannot tell from the artefact which 37% are which.

**The sponsor's specific charge on REQ-001 is upheld in full.**

---

### F3 — MAJOR — mechanical extraction cannot produce a requirements document from this corpus

Argument at §3.B, resting on four measured facts: 55 ids have no requirement-
statement span in the source; 4 have no span at all; where several spans exist
there is no principled selector (REQ-001: 1 of 9; REQ-105: 1 of 8); and the
failure mode passes every surface-feature quality bar an extractor can carry
(REQ-029 and REQ-046 are fluent, complete, correctly-bolded English).

**Criterion**: the approach's stated premise is false of the corpus it operates
on, so the defect is in the approach and not in its implementation.

**Recommendation, since the packet asked for it plainly: withdraw
`docs/specs/REQUIREMENTS-LIST.md`. Do not improve it.** A requirements document
for this corpus must be authored and reviewed, not derived. I propose no
schedule and no owner — that is the orchestrator's call under §3.C's gate.

---

### F4 — CRITICAL — no review gate exists on derived artefacts, and the entire sponsor-facing surface of this program is unreviewed

**Subject: the orchestrator and the org design.**

Nine-item enumeration at §3.F, measured. 11 unreviewed website commits
including a public deployment; the atlas; the flat list; the extractor; the
board; every escalation framing; the G0 export packet; two amendments to a
sponsor-accepted ADR; every toolchain measurement. `ORG_CHART.md:79-87` has no
role that reviews the orchestrator's output. PROTOCOL §7 gates specs, modules
and phases and nothing else.

**Criterion**: the program's second non-negotiable property (PROTOCOL §1 —
"verification is never graded by the designer") is honoured for RTL and
specifications and **absent for everything the orchestrator produces**, which
is 69 of 78 commits. The sponsor has been the review function.

The gate I propose, where it attaches and who signs it: §3.C. Enforcement class
if adopted as written: **PROSE**.

**Blocks** `P<n>-phase-accept`. Relayed as **E4, verbatim**.

---

### F5 — MAJOR — four frozen requirements have no normative statement anywhere in the specification

`REQ-101` and `REQ-124`: **zero** mentions in `SPEC-P1-core-cpu.md` §4–§9
(lines 143–1225). `REQ-096`: three parenthetical citations inside other
requirements. `REQ-107`: one mid-sentence parenthetical. Their only statement
is §10's registry handle, which this program's own doctrine
(`J-architect_docs_lead-0002`, `J-orchestrator-0064`) holds is not the
requirement. Measured; table at §3.D(b).

**Criterion**: a requirement with no text has nothing for a reader, a reviewer,
a renderer or a traceability matrix to bind to. The spec is FROZEN at `b9fd9c6`
and this finding observes it rather than editing it, per WO-0010 §2.

**Not a fault of `dv_lead`**, which dispositioned exactly these as structural
and said so honestly. **Bears on S1** — §3.D(c). Landing site is a post-freeze
spec diff plus an ADR, or a pre-signature decision by the sponsor; either is
someone else's to choose.

---

### F6 — MAJOR — the shell transports process and not the artefact standard

Verified independently at §4.2: `PROTOCOL.md` §7's spec-freeze row, the
architect charter's REQ clause (byte-identical), and `SPEC-TEMPLATE.md` §10 are
the same in this repository and in `renatom11/agentic-fpga`; none states what a
requirement must look like. The reference program's *"every row stands alone"*
and *"one REQ states one testable fact"* are project-local text in its own
`requirements.md` §0.1/§0.2, and the shipped `SPEC-TEMPLATE.md` assumes that
file holds requirement text without ever mandating it.

**Criterion**: a fork inherits every rule about how to work and no rule about
what good output looks like, and the gap is invisible until a project produces
bad output that passes every gate. **This is a shell defect** — filed as a
GitHub issue on the canonical shell per `CLAUDE.md`'s iron rule, never through
the lessons pipeline, and never patched locally. Owner: orchestrator, subject
to the standing filing hold on the BOARD's defect log.

---

### F7 — MAJOR — the instruction that left the standalone requirement statement homeless was the orchestrator's

`WO-0003` §3 lines 84–86 instructed `architect_docs_lead` not to restate REQ
text in the matrix. The architect complied and disclosed it
(`J-architect_docs_lead-0002`); `docs/specs/requirements.md` §1 records the
result. With the matrix holding no requirement text and §10 becoming a handle
registry, no artefact in this project holds a per-requirement standalone
statement — and the shell template's model, which puts that text in
`requirements.md`, was silently inverted with no ADR.

**Criterion**: an instruction whose consequence removes an artefact the
shipped template depends on is a decision, and a decision of that reach is
ADR-shaped (PROTOCOL §11's habit of running a rule backwards over the corpus
before adopting it). The anti-divergence principle behind it is **sound**; what
is missing is the check on what it displaced.

**`architect_docs_lead` bears no fault**: it executed an instruction, reasoned
about it publicly, and recorded the trade-off it rejected.

---

### F8 — MAJOR — "testable" as this program certifies it does not entail "stands alone", and no role is asked the second question

`DV-P1-testability.md:80-86` — dv_lead's question was *"can a bench be derived
from this document alone"*, and it explicitly read requirements "through the
section it lives in, not through the §10 registry row". PROTOCOL §7's gate row
asks for testability. The architect charter asks for "numbered requirements".
No charter, gate, template or playbook asks whether a single requirement is
self-contained.

**Criterion**: a gate-wording defect — the gate obtains what it asks for, and
what it asks for does not cover the property the sponsor is measuring. Remedy
is a clause on PROTOCOL §7, which reaches every project founded from this
shell, and therefore travels with **F6**.

**`dv_lead` is exonerated.** It graded what it was asked, graded it hard, and
withheld its signature twice.

---

### F9 — MAJOR — load-bearing *Measured* quantities rest on an instrument that was never committed

Three claims — `J-orchestrator-0066`'s `ok 76 → 82` / `TRAILS-OFF 5 → 0`,
`J-orchestrator-0067`'s *"0 flagged"* over the list, `J-orchestrator-0068`'s
*"91 entries, 0 flagged"* — were produced by an audit script that exists at no
commit in this repository. Verified: `git ls-files scripts site` lists no such
file, and a tree-wide grep for its predicates returns nothing outside my own
scratch work. `J-orchestrator-0066` names `site/dist` as the re-derivation
target; `site/.gitignore` excludes `dist/`.

**PROTOCOL §4.1**: Evidence cites commands runnable from a repo checkout or
externally verifiable references, and *"mentions of ephemeral artifacts must say
so explicitly"*. **None of the three did.** All three are tagged *Measured*.

**Criterion**: an Evidence claim whose instrument cannot be inspected is not
falsifiable, which is the property the whole journal apparatus exists to
produce. Aggravating: `J-orchestrator-0066` states *"A claim I cannot re-derive
on demand is not evidence"* as its own lesson, in the entry that emits the
first of them.

**Graded MAJOR, not CRITICAL**, and I record why: unlike `AUD-0002-F1` these
claims are not *refuted*, they are *unfalsifiable* — with one exception, the
"0 flagged" claim, which **is** refuted, and which is carried inside F1 rather
than double-counted here.

---

### F10 — MINOR — "Atlas: 82 state, 6 point" does not reproduce

Re-executed at `a5bc7f4`: **85** cards carry text, **6** point. The reported
tally does not close — 82 + 6 = 88, not 91. The three missing cards are the
`CITES-OTHER` flags (REQ-060, REQ-062, REQ-082) that `J-orchestrator-0066`
adjudicated as audit false positives and then never folded back into the total,
a fact recoverable only from a footnote two entries earlier.

**Criterion**: a tally reported to a sponsor whose parts do not sum to its
denominator, where the reconciliation lives in a different journal entry.
MINOR because the direction of the error is *against* the reporter — the real
figure is better than the reported one.

---

### F11 — MAJOR — recurrence of `AUD-0001-F1`, after its own remedy was recorded

`J-orchestrator-0067` Evidence: *"`scripts/check_journals.sh --all`: **75
commits** green. *Measured.*"* Re-executed: **76** at `a729177`, the commit the
entry ships in; 75 reproduces only at its parent `7fab48b`. No measurement SHA
is stated.

This is `AUD-0001-F1` exactly — a pre-commit measurement quoted as a property of
the commit — and the standing remedy the orchestrator itself recorded at
`J-orchestrator-0043` (*"pre-commit measurements state their measurement SHA in
Evidence"*) was not applied.

**Criterion**: charter §6.7 — repeat findings of the same class against the same
agent are escalated as an org-level finding rather than silently re-tallied.
The first instance was MAJOR; a recurrence after a self-authored remedy is not
less. **The remedy is PROSE and it did not hold**; whether it should become
MACHINE is the orchestrator's to decide and to write down.

---

### F12 — MINOR — "55 are defined only in tables" is derived by subtraction, tagged *Measured*, and false as stated

`J-orchestrator-0065` Evidence. Measured composition at the pin: **49** entries
render from a table row; the remaining 6 are a bold label over a table
(REQ-002), the sentence *"REQ-028 is the table above"*, and four ids that are
parenthetical or absent (REQ-096, REQ-101, REQ-107, REQ-124). 55 = 91 − 36, the
complement of the bold-statement count.

**L-B01**: a derivation is *derived*, not *measured*. The claim then propagated
into a **code comment** at `site/requirements.mjs:219-220` — and PROTOCOL §10 is
explicit that *"a code comment is a relay, not a derivation"* — and from there
into **WO-0010 §3.D**, which put the unverified number into the framing of the
question I was asked. That last hop is the one worth the finding: an unchecked
figure travelled into an audit packet as a premise.

`J-orchestrator-0066` contradicts it two entries later, correctly, when it
describes REQ-096/107/124 as parenthetical citations.

---

### F13 — MINOR — the staleness guard proves freshness, not correctness, and was described as keeping the list honest

The `determinism` job (`.github/workflows/build.yml`) regenerates the list
before the tree-clean check. **MACHINE, and now demonstrated**: three runs, all
`success` — most recently run `31047557264`, job `92446727395` at `43757f1`,
both steps green. `J-orchestrator-0067` correctly declared it never-executed at
the time and tagged that *not measured* per ADR-0016; that honesty is noted.

What it enforces is that the committed file equals the generator's output. **It
cannot detect that the generator's output is wrong**, and it passed green on
every commit carrying REQ-046's inverted entry. `J-orchestrator-0067`'s title —
*"the drift guard that keeps it honest"* — overstates it: it keeps it *fresh*.

**Criterion**: this is the silently-always-pass class (PROTOCOL §10) — a green
check that certifies nothing about the property a reader assumes it certifies.
The guard is not defective; its description is.

---

### F14 — MINOR — the `WO-0006` Return log states "nothing below is paraphrased" and then paraphrases

`AUD-0002` §8 supplied an exact block for transcription. The Return log
transcribed different text — a two-line blockquote re-voiced in the second
person (*"You created `f9a6bef` yourself"*) — under the label *"nothing below
is paraphrased"*.

**Stated first, because it is what matters**: **no softening occurred.** The
verdict, the counts (1 CRITICAL / 4 MAJOR / 4 MINOR), `dv_lead`'s exoneration,
F1's CRITICAL grade and its E4 relay are all present and correct, and the
orchestrator additionally transcribed **F5, a finding against its own packet**,
unprompted. This is a labelling defect in a relay that was otherwise faithful.

**Criterion**: PROTOCOL §3 makes auditor findings a verbatim-relay class, and a
row asserting verbatim fidelity while re-voicing is a false statement about the
relay even when the relay is honest. This is the charter's relay-fidelity
spot-check, discharged for the first time in this program's history —
`J-auditor-0001` and `J-auditor-0002` both left it as an open question for want
of a prior relay to diff against.

---

### F15 — MINOR — the orchestrator authored a new document into the architect's owned lane with no work order and no notice

`docs/specs/REQUIREMENTS-LIST.md` was created at `a729177` under
`Agent: orchestrator`, `Work-Order: none`. PROTOCOL §6 assigns `docs/**` to
`architect_docs_lead`; R7 permits the commit because the orchestrator's scope is
everything, so this is not a rule violation — it is the attribution question
R1's honesty note makes **audit-enforced**, and this is the audit. The owning
lead has never seen the file: zero mentions in
`agents/journals/claude_architect_docs_lead_agent.md`.

**Criterion**: a document about requirements, in the requirements directory,
authored by an agent that owns neither, with no packet and no notice to the
owner. It is the mechanism by which F1 reached the sponsor without F4's
missing gate ever being noticed as missing.

---

## 6. R1–R10, marker check, and the mechanical layer

Clean. Recorded so the reader knows the findings above are not mechanical
defects in disguise.

| Check | Result |
|---|---|
| `bash scripts/test_protocol.sh` at the pin | `protocol self-test: 49 passed, 0 failed` |
| `bash scripts/check_journals.sh --all` at the pin | `OK: 78 commit(s) satisfy the journal/commit protocol`; `OK: journal volume chains verified at range head (R10)` |
| R1 over the three subject commits (audit-enforced for an all-scope agent) | Each stages only orchestrator-authored work plus the orchestrator's journal. No foreign-agent content. **Holds.** |
| R4 set-equality, `7fab48b` / `a729177` / `a5bc7f4` | Changed paths minus the committing agent's journal set-equal each entry's `Files-in-this-commit`. **Holds** for all three. |
| R6 trailers | `Agent: orchestrator`, `Work-Order: none`, `Journal-Entry: J-orchestrator-0066/0067/0068`. Well-formed. |
| R7 | Orchestrator scope is everything; no violation. See F15 for the ownership question R7 cannot reach. |
| Marker check — `git log --all --grep 'MUTATION ('` | empty |
| Marker check — tree grep at the pin | hits only in documentation of the convention (`docs/playbooks/`, `docs/reports/audit/README.md`, prior audit reports, built HTML of those reports). No `mut/*` branch exists. **PASS.** |
| CI | `build` run `31047557264` at `43757f1`: `sim-verilator`, `sim-icarus`, `determinism` all `success`, every step individually. Not bypassed. |
| Journal vacuity sample | `J-orchestrator-0064..0069` all carry substantive Reasoning with rejected alternatives named. **No vacuity finding.** These are good entries; the defects are in what they measured with, not in what they explain. |

---

## 7. The causal chain, in one place

Because the sponsor's question was *"how did any of this get to me?"* and the
answer has five links, each independently verified:

1. **The shell requires that requirements exist and never says what one looks
   like.** (`PROTOCOL.md` §7, architect charter line 21, `SPEC-TEMPLATE.md` §10
   — identical in both repositories.) → **F6**
2. **`WO-0003`, orchestrator → architect, instructed that the traceability
   matrix restate no requirement text.** The architect complied and disclosed
   it. With the shell's template model putting standalone requirement text in
   exactly that file, the statement lost its home. → **F7**
3. **`SPEC-P1-core-cpu.md` §10 became "the authoritative registry" with a
   handle column**, and the corpus settled into 36 prose statements, 49 table
   rows and 6 ids with nothing — a heterogeneous corpus with no per-REQ
   statement unit. → **F5**
4. **`dv_lead` certified testability-from-the-document and was never asked
   about self-containment**, because no gate, charter or template asks anyone.
   → **F8**
5. **The orchestrator then built an extractor on the assumption that a
   standalone statement could be recovered**, spent four rounds improving the
   recovery of a thing that does not exist for 60% of the corpus, and published
   each round to the sponsor with no review by anyone. → **F1, F3, F4**

**The sponsor caught rounds 1, 2 and 4-as-delivered. The program caught none of
it.** That is the answer to "did the auditor even take a look at this" — no,
because nobody asked; and to "were you audited to make sure it was good" — no,
and until this packet there was no mechanism by which that could have happened.

---

## 8. NO-VERDICT register

*A thing I could not measure is never reported as a thing that passed
(L-D04).*

| id | Question | Why no verdict | What would settle it |
|---|---|---|---|
| **NV-1** | Were `AUD-0001` and `AUD-0002` relayed to the sponsor verbatim in conversation? | Chat is out-of-repo and ephemeral. The *committed* relay is checked and is F14. | Nothing reproducible. The compensating control is unchanged and structural: audit reports are committed files the sponsor reads unmediated. |
| **NV-2** | `J-orchestrator-0066`'s "scoring-change blast radius: exactly 1 card" and `J-orchestrator-0067`'s "refactor blast radius: 1 of 91" | Both need a rendered pre-change snapshot that was never committed. | Committing the audit script and a snapshot, or re-deriving both by rebuilding two historical trees — which I did not do because the atlas build needs `node_modules` that are gitignored, and I judged the claim not load-bearing enough to justify it. |
| **NV-3** | Should the *website* fall under §3.C's gate, or a different one? | Scope and cost question touching roles that do not exist. Not the auditor's to decide. | A sponsor decision on whether the site is a deliverable or an aid, and an owner for it. |
| **NV-4** | `J-orchestrator-0064`'s body-length statistics (min 21 / median 152 / max 392 at `a3fc912`) | The extractor lived inside `site/build.mjs` at that SHA; I re-derived the pointer count from the rendered page and did not reconstruct the length distribution. | Rebuilding `a3fc912`'s atlas with its dependencies and re-measuring. Low value; the claim carries nothing. |
| **NV-5** | Does this organization reproduce the reference program's quality in general? | I audited artefacts and process in one repository over one window. Capability is not what an audit measures, and one corpus is not a sample. | Not settleable by audit. What *is* settleable, and is settled here, is that the artefact standard did not transport and no gate would have caught its absence. |

---

## 9. Observations — recorded, not findings

1. **`C-11` was not routed.** The `P1-spec-freeze` checklist carries a
   carry-forward requiring `DV-P1-countersignature-final.md` §8.3 to reach the
   auditor by "the next audit cycle", owner orchestrator. WO-0010 does not
   mention it; I found it by reading the checklist. I have read §8.3 and adopt
   its rule (a requirement narrower than its authorising decision record, with
   no record of the narrowing, is a transcription defect and the decision record
   governs; the reverse direction is E2-shaped and never a quiet edit). **C-11
   is discharged by this paragraph.** The routing gap is worth one line in
   whatever process F4's gate produces.
2. **The orchestrator's conduct in commissioning this audit was correct and
   unusually good**, and saying so does not soften anything above. It answered
   the sponsor's four questions with the worst available answers before issuing
   the packet; it named its own commits as the subject in the packet header
   rather than letting me discover it; it told me to test its approach's
   soundness rather than its regexes and pre-committed to withdrawal; it wrote
   §3.F specifically because it could not grade itself; it honoured
   `AUD-0002-F5` by keeping `agents/handoffs/**` out of my instructions; and it
   handed me evidence that reframes the fault away from itself while telling me
   to discount its framing — which was the correct instruction and I acted on
   it (§4.3). Mitigation is a disposition argument, not a severity argument.
3. **Two findings against this program are findings *for* it.** F6 and F8 are
   the reason this experiment was worth running: they are defects in the shell
   that only a second project could expose, and they are cheap to fix now and
   expensive to fix after ten projects have forked.

---

## 10. Lesson candidates

Pre-staged for this chain's first harvest (`J-auditor-0001..0003`), not mined
here — an audit cycle is not a gate.

- **LC-06 (tier 1 candidate)** — *A rendering of a normative document is a
  claim about that document, and needs the document owner's signature before
  publication.* **LH3**: without it, an author who is also the reviewer ships a
  view that misstates the source, and the misstatement is confident, fluent and
  invisible to any surface-feature check. **LH1**: this report, F1/F4;
  `J-orchestrator-0064`, `0069`. **LH2-g**: passes — no project noun.
- **LC-07 (tier 1 candidate)** — *A process constitution that specifies how
  work is done but not what its output must look like transports its rituals to
  a fork and not its quality.* **LH3**: a forked organization passes every gate
  and produces materially worse artefacts, with nothing in the machinery able to
  detect the difference. **LH1**: this report, F6/F8; `PROTOCOL.md` §7 compared
  across two repositories. **LH2-g**: passes.
- **LC-08 (tier 1 candidate)** — *An instrument that produces a quantity for
  the record is part of the record: if it is not committed, the quantity is not
  evidence.* **LH3**: measured claims accumulate that no later reader can
  falsify, and the agent that made them cannot falsify them either. **LH1**:
  this report, F9; `J-orchestrator-0066`'s own stated lesson. **LH2-g**: passes.
- **War story** — *Improving a metric that does not measure the property.* Four
  rounds of extractor work moved a card-completeness count monotonically while
  the property in question (is the text the requirement?) was never measured
  once. Kept as a war story rather than minted: I cannot yet state the rule in a
  form that does not collapse into "measure the right thing", which fails
  **LH3** — it is not recognisable as a failure in someone else's repo.
- **Recurrence evidence, not a new candidate**: **F11** is `AUD-0001-F1`
  recurring after its own PROSE remedy. Recorded here so the third instance, if
  it comes, opens the promotion obligation rather than being tallied again.

---

## 11. Disposition summary

| Finding | Severity | Subject | Blocks | Closure |
|---|---|---|---|---|
| **F1** — list states non-requirements as requirements (REQ-046 inverted, REQ-029 rationale, REQ-001 arbitrary) | **CRITICAL** | orchestrator | `P<n>-phase-accept`; bears on S1 | Withdrawal or an authored replacement, plus auditor re-verification |
| **F2** — 57 of 91 are not requirement statements | MAJOR | orchestrator | — | Subsumed by F1's disposition |
| **F3** — mechanical extraction is unsound for this corpus | MAJOR | orchestrator | — | A decision, recorded, on withdraw-vs-author |
| **F4** — no review gate; entire sponsor-facing surface unreviewed | **CRITICAL** | orchestrator + org design | `P<n>-phase-accept` | A gate row (§3.C) adopted by ADR, plus auditor re-verification |
| **F5** — 4 frozen requirements have no normative text | MAJOR | the specification | bears on **S1** | Post-freeze spec diff + ADR, or a sponsor decision before signing |
| **F6** — shell transports process, not the artefact standard | MAJOR | canonical shell | — | GitHub issue on the shell; never the lessons pipeline |
| **F7** — `WO-0003`'s instruction left the statement homeless | MAJOR | orchestrator | — | ADR recording the topology decision and its consequence |
| **F8** — "testable" ≠ "stands alone"; nobody is asked | MAJOR | gate wording (shell) | — | Travels with F6 |
| **F9** — *Measured* quantities from an uncommitted instrument | MAJOR | orchestrator | — | Commit the instrument, or restate the claims with their class |
| **F10** — "82 state, 6 point" does not reproduce (85/6) | MINOR | orchestrator | — | Correcting append |
| **F11** — recurrence of `AUD-0001-F1` | MAJOR | orchestrator | — | A decision on whether the PROSE remedy becomes MACHINE |
| **F12** — "55 defined only in tables" derived-as-measured, propagated into WO-0010 | MINOR | orchestrator | — | Correcting append |
| **F13** — staleness guard proves freshness, not correctness | MINOR | orchestrator | — | Restate what the guard enforces |
| **F14** — Return log claims verbatim, paraphrases; **no softening** | MINOR | orchestrator | — | Transcribe supplied blocks verbatim, or drop the claim |
| **F15** — new document into the architect's lane, no WO, no notice | MINOR | orchestrator | — | At the owner's discretion, written down |

**Open from prior audits and untouched here**: `AUD-0001-F3` (closure owed, needs
a follow-up pinned at or after `4c2bc9b`); `AUD-0002-F1` (open CRITICAL,
disposition and re-verification owed). Neither is closed by this report.

**Enforcement-class summary** (ADR-0002, ADR-0016): every enforcement mentioned
in this report is **PROSE** except three — the `determinism` staleness guard
(**MACHINE**, demonstrated, run `31047557264`), `agent_commit.sh`/`check_journals.sh`
R1–R10 (**MACHINE**, demonstrated), and branch protection (**MACHINE**, per the
BOARD's A7 record, not re-verified here). §3.C's proposed gate would be
**PROSE**. The absence of a requirement-form standard is a **PROSE gap** — there
is no rule at all, of either class.

---

## 12. RETURNED verdict for `WO-0010` — for orchestrator transcription

Per PROTOCOL §3's auditor exception, the authority is this report and
`J-auditor-0003`; the orchestrator transcribes the block below into
`agents/handoffs/WO-0010_derived-artefact-audit.md`'s Return log under its own
trailer. **Transcribe it verbatim** — see **F14**.

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

---

*Report ends. `AUD-0001-F3` and `AUD-0002-F1` remain open and are not closed by
this report.*
