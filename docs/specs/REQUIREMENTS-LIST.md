# P1 requirements — flat list — **WITHDRAWN**

**This artefact is withdrawn.** It is not a requirements list and must not be
read as one. Nothing that was in it is authoritative.

- **Withdrawn**: 2026-08-06, by the orchestrator, on `AUD-0003` §3.B.
- **Existed at**: `a729177` … `43757f1`.
- **Authority**: [`AUD-0003`](../reports/audit/AUD-0003-derived-artefact-audit.md),
  findings **F1 (CRITICAL)** and **F3 (MAJOR)**.

## Why

The file was **generated**, by extracting requirement text from
[`SPEC-P1-core-cpu.md`](SPEC-P1-core-cpu.md). The audit established that this
cannot work for this corpus, and that the output was not merely incomplete but
in places **wrong**:

- **57 of its 91 entries were not requirement statements** in any form an
  engineering inspection would accept.
- **Three entries stated something that is not the requirement.** `REQ-046`'s
  entry stated the design alternative the specification explicitly **rejected**.
  `REQ-029` carried only rationale and dropped the four normative bullets.
  `REQ-001` showed one of nine co-equal port rows, selected by line length.
- The failure mode **passes every surface-feature quality check an extractor can
  carry**: the wrong entries were fluent, complete, correctly-formatted English.

Four rounds of repair improved a metric — *does the entry show text?* — that
does not measure the property that matters — *is the text the requirement?*

## What replaces it

Nothing, yet, and that is the honest state.

A flat requirements list **cannot be derived** from the current corpus. It can
be **authored** — `architect_docs_lead`'s work, under a work order, to a
standard the shell does not currently carry. Four requirements (`REQ-096`,
`REQ-101`, `REQ-107`, `REQ-124`) have **no normative statement anywhere** in
§4–§9; `REQ-101` and `REQ-124` are not mentioned at all outside the §10
registry. That is a finding against the specification (`AUD-0003` F5) and it
bears on the open sponsor signature **S1**.

Until then the requirements are the specification's §4–§9, and
[`requirements.md`](requirements.md) is the traceability index over them.
