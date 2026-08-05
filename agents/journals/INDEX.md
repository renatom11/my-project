# Journal Index

One row per journal chain. Updated by the orchestrator at gate boundaries —
this is a best-effort rehydration aid; `tasks/BOARD.md` is the live program
state, and each journal's tail is its own source of truth.

**Regeneration recipe**: the Last-entry column is, per chain, the highest
`^## \[J-` header across its volumes — rebuild it with
`for b in $(ls agents/journals/*_agent.md agents/journals/workers/*_agent.md | sed 's/\.v[0-9]*\.md$//;s/\.md$//' | sort -u); do echo "$b: $(grep -h '^## \[J-' $b.md $b.v*.md 2>/dev/null | tail -1)"; done`
(run from the repo root; a chain with no output has no entries yet).

| Agent | Journal | Last entry | State |
|---|---|---|---|
| orchestrator | [claude_orchestrator_agent.md](claude_orchestrator_agent.md) | J-orchestrator-0045 | **Project `chip8-sv`** (ADR-0011 role `project`); G0 PASSED 2026-08-05; M1 active — toolchain ADR (E3) is the next escalation. Outer-hop PR owed, blocked on repo access |
| architect_docs_lead | [claude_architect_docs_lead_agent.md](claude_architect_docs_lead_agent.md) | — | Seed only; first spawn after G0 intake |
| rtl_lead | [claude_rtl_lead_agent.md](claude_rtl_lead_agent.md) | — | Seed only; first spawn after G0 intake |
| dv_lead | [claude_dv_lead_agent.md](claude_dv_lead_agent.md) | — | Seed only; first spawn after G0 intake |
| auditor | [claude_auditor_agent.md](claude_auditor_agent.md) | J-auditor-0001 | AUD-0001 delivered (G0 retro-audit, PASS WITH FINDINGS, 0 CRITICAL). **Owes a follow-up audit** pinned at/after `4c2bc9b` to adjudicate F3's closure |
| rtl_module_dev (workers) | [workers/claude_rtl_module_dev_agent.md](workers/claude_rtl_module_dev_agent.md) | — | Seed only; worker template, spawned per WO |
| tb_writer (workers) | [workers/claude_tb_writer_agent.md](workers/claude_tb_writer_agent.md) | — | Seed only; worker template, spawned per WO |
| data_wrangler (workers) | [workers/claude_data_wrangler_agent.md](workers/claude_data_wrangler_agent.md) | — | Seed only; DORMANT until a dv_lead work order activates it |
| formal_dv (workers) | [workers/claude_formal_dv_agent.md](workers/claude_formal_dv_agent.md) | — | Seed only; DORMANT until a dv_lead work order activates it |

Contingent roles (e.g. a phase-scoped second RTL lead) have no journal until
activation; their journals are seeded at activation per ADR-0001's
contingent-role pattern (PROTOCOL §5 R8).
