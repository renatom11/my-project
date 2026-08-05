#!/usr/bin/env node
// gen_req_list.mjs — emit docs/specs/REQUIREMENTS-LIST.md: every P1
// requirement, one per line, nothing else.
//
// WHY THIS IS GENERATED AND NOT WRITTEN. A hand-maintained list of 91
// requirements drifts from the specification the first time the spec is
// amended, and a list that disagrees with the frozen text is worse than no
// list at all. This reads the frozen spec through site/requirements.mjs —
// the same extractor the website's atlas uses — so the flat list and the
// atlas cannot say different things about the same id.
//
// Run: node scripts/gen_req_list.mjs      (checked by scripts/test_protocol.sh)

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractRequirements, HOOKS } from '../site/requirements.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => readFileSync(join(ROOT, rel), 'utf8');

const SPEC = 'docs/specs/SPEC-P1-core-cpu.md';
// No length cap: a flat list that truncates is a list of partial requirements.
const rows = extractRequirements(read(SPEC), read('docs/specs/requirements.md'), { maxLen: Infinity });
if (!rows.length) { console.error('no requirements extracted'); process.exit(1); }

// The freeze commit, taken from the gate record rather than asserted here.
const gate = read('docs/gates/P1-spec-freeze-checklist.md');
const frozenAt = (gate.match(/FROZEN at `([0-9a-f]{7,40})`/) || [, 'unknown'])[1];
const signed = /\|\s*S1\s*\|[^|]*\|\s*\*\*OPEN\*\*/.test(gate) ? 'NOT YET SIGNED' : 'signed';

const pointers = rows.filter(r => !r.body);
const blocks = [...new Set(rows.map(r => r.block))];

// The spec writes a normative statement as "**REQ-007 — instruction format.**
// Instructions are…" — the id sits INSIDE the bold lead-in. The id is already
// the bullet's key, so drop it and keep the lead-in bold and intact; slicing
// the id out without repairing the bold left a dangling "**" mid-line.
const statement = r => {
  if (!r.body) return null;
  const s = r.body.replace(/^\*\*REQ-\d{3}\s*[—–-]\s*([^*]*)\*\*/, (m, lead) => {
    const t = lead.trim();
    return t ? `**${t.charAt(0).toUpperCase()}${t.slice(1)}**` : '';
  }).trim();
  return s || null;
};

const out = [];
out.push('# P1 requirements — flat list');
out.push('');
out.push('<!-- GENERATED FILE — do not edit by hand.');
out.push('     Regenerate: node scripts/gen_req_list.mjs -->');
out.push('');
out.push(`**${rows.length} requirements.** Source: [\`SPEC-P1-core-cpu.md\`](SPEC-P1-core-cpu.md),`);
out.push(`frozen at \`${frozenAt}\`; sponsor gate \`P1-spec-freeze\` is **${signed}**.`);
out.push('');
out.push('**This list is NON-NORMATIVE.** It is a view of the specification, generated');
out.push('from it mechanically. Where the two differ the specification wins, and the');
out.push('difference is a defect in this generator. Each entry cites the section that');
out.push('binds; the DV hook letter says what kind of check can observe the requirement');
out.push(`(${Object.entries(HOOKS).map(([k, v]) => `**${k}** ${v.split(/\s+[-—]\s+/)[0]}`).join(', ')}).`);
out.push('');

if (pointers.length) {
  out.push(`> **${pointers.length} of ${rows.length} requirements are not quoted below.**`);
  out.push('> The specification defines them as a label over a table, as a table, or as a');
  out.push('> citation inside another requirement\'s prose — there is no self-contained');
  out.push('> sentence to quote, and writing one here would put text in circulation that');
  out.push('> the frozen spec does not contain. They are listed with their section instead:');
  out.push(`> ${pointers.map(p => `\`${p.id}\` (${p.section})`).join(', ')}.`);
  out.push('');
}

out.push('---');
out.push('');

for (const b of blocks) {
  const inBlock = rows.filter(r => r.block === b).sort((a, z) => a.n - z.n);
  out.push(`## ${b} — ${inBlock.length}`);
  out.push('');
  for (const r of inBlock) {
    const meta = `${r.section}${r.hooks.length ? ` · hook ${r.hooks.join('')}` : ''}`;
    const s = statement(r);
    out.push(s
      ? `- **${r.id}** — ${s}  \n  <sub>${meta} · ${r.satisfies}</sub>`
      : `- **${r.id}** — _stated in ${r.section}; see the specification._  \n  <sub>${meta} · ${r.satisfies}</sub>`);
  }
  out.push('');
}

out.push('---');
out.push('');
out.push('## Coverage');
out.push('');
out.push('| Kind of check | Requirements |');
out.push('|---|---|');
for (const [k, v] of Object.entries(HOOKS)) {
  out.push(`| **${k}** — ${v} | ${rows.filter(r => r.hooks.includes(k)).length} |`);
}
out.push('');
out.push('No requirement has a test id yet: the DV lane has not been spawned, so every');
out.push('row of the traceability matrix in [`requirements.md`](requirements.md) still');
out.push('carries an unfilled evidence cell. That is the honest state, not an omission.');
out.push('');

const path = 'docs/specs/REQUIREMENTS-LIST.md';
writeFileSync(join(ROOT, path), out.join('\n'));
console.log(`wrote ${path}: ${rows.length} requirements, ${pointers.length} not quoted, ${blocks.length} blocks`);
