// requirements.mjs — the single extractor for P1's requirement corpus.
//
// Both the website's spec atlas and `scripts/gen_req_list.mjs` read the
// requirements through this module, so a flat list and a card can never say
// different things about the same REQ id. Nothing here transcribes a
// requirement by hand: every field is derived from the frozen spec.
//
// The extraction rule, in one sentence: §10's registry supplies the id, the
// short handle, the section and the DV hook; the NORMATIVE BODY (§4-§9)
// supplies the requirement text, because §10's column is a label and reading
// it as the requirement is exactly the defect this module exists to prevent.

// DV hook legend, taken from §10's own prose.
export const HOOKS = {
  D: 'directed vector',
  R: 'constrained-random stream, full-state compare',
  F: 'formal property (P4)',
  S: 'structural — guaranteed by the interface or a construction rule, not assertable by a bench',
  I: 'inspection at countersignature or review',
};

// `maxLen` caps a card's extract. The website wants a cap — a card is an
// index entry, not a substitute for the spec. A generated FLAT LIST does not:
// truncating there would ship a requirement missing its second clause, which
// is how REQ-014 lost "the image is then applied over that". Pass Infinity.
export function extractRequirements(spec, reqsDoc, { maxLen = 380 } = {}) {
  if (!spec) return [];

// §10's registry table: | REQ | How P1 satisfies it | Section | DV hook |
const sec10 = spec.slice(spec.indexOf('\n## 10.'), spec.indexOf('\n## 11.'));
const rows = [...sec10.matchAll(/^\|\s*`?(REQ-\d{3})`?\s*\|(.+?)\|(.+?)\|(.+?)\|\s*$/gm)]
  .map(m => ({
    id: m[1],
    satisfies: m[2].trim(),
    section: m[3].trim(),
    hook: m[4].trim(),
    n: parseInt(m[1].slice(4), 10),
  }));

// requirements.md carries a per-REQ matrix whose group-heading rows name the
// block, plus the test-id and evidence columns the DV lane fills. Walk it in
// order: a heading row sets the current block for the rows beneath it.
// (Note for a later editor: the block-summary table near the top of that file
// is INDENTED inside a list item, so a `^\|` anchor misses it entirely. The
// per-REQ matrix below is the better source anyway — it carries coverage.)
const cover = {};
let curBlock = 'Unclassified';
if (reqsDoc) {
  for (const line of reqsDoc.split('\n')) {
    const head = line.match(/^\|\s*\*\*([^*|]+?)\*\*\s*\|\s*\|/);
    if (head && !/REQ-\d{3}/.test(head[1])) { curBlock = head[1].trim(); continue; }
    const row = line.match(/^\|\s*\*\*(REQ-\d{3})\*\*\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|/);
    if (row) cover[row[1]] = {
      block: curBlock,
      tests: row[4].trim().replace(/^_\(|\)_$/g, ''),
      evidence: row[5].trim().replace(/^_\(|\)_$/g, ''),
    };
  }
}
const blockOf = id => (cover[id] || {}).block || 'Unclassified';

const hooksIn = h => [...new Set((h.match(/\b[DRFSI]\b/g) || []))];

// §10's column is titled "How P1 satisfies it" — a HANDLE, not the
// requirement. Showing it alone made cards read as fragments ("The exact
// cycle table"), which is a viewer defect, not a spec defect: the binding
// text lives in §4–§9. So pull the definitional mention from the normative
// body and show that as the requirement, keeping the handle as a label.
const specLines = spec.split('\n');
const secLine = n => {
  const i = specLines.findIndex(l => new RegExp(`^## ${n}\\.`).test(l));
  return i < 0 ? null : i;
};
const normFrom = secLine(4), normTo = secLine(10);

function normativeText(id) {
  if (normFrom == null || normTo == null) return null;
  const hits = [];
  for (let i = normFrom; i < normTo; i++) {
    const l = specLines[i];
    if (!l.includes(id)) continue;
    let score = l.length / 20;
    // The spec writes normative statements as "**REQ-103 — the sequence.** …"
    // — extra words INSIDE the bold. An `id` followed immediately by `**`
    // matched only a minority (measured: 36 requirements carry this form).
    if (new RegExp(`\\*\\*${id}\\b[^*]*\\*\\*`).test(l)) score += 120;      // bold normative statement
    if (new RegExp(`^\\s*(>\\s*)?\\*\\*${id}\\b`).test(l)) score += 60;     // ...at line start = definitional
    if (new RegExp(`^\\|\\s*\\*?\\*?${id}`).test(l)) score += 80;              // row keyed by the id
    if (new RegExp(`${id}\\s*\\|\\s*$`).test(l)) score += 40;                    // traceability column
    // A table row KEYED BY A DIFFERENT REQ that merely cites this one is
    // not this requirement's definition. REQ-060's row ends "(REQ-006)",
    // and without this it won REQ-006's card.
    const firstCell = (l.match(/^\|\s*([^|]*)\|/) || [, ''])[1] || '';
    const keyed = firstCell.match(/REQ-\d{3}/);
    if (keyed && keyed[0] !== id) score -= 200;
    // A line that opens mid-sentence is the tail of a paragraph, not a
    // definition — the quality bar below rejects it anyway, so it must not
    // outscore a real one. REQ-005 is defined by a state-table row exactly
    // as REQ-003/4/6 are, but lost its card to "...is never entered
    // (REQ-005)" and fell through to a pointer.
    if (!l.trim().startsWith('|') && /^[a-z]/.test(l.trim().replace(/^[>*_`(]+/, ''))) score -= 100;
    hits.push({ i, l, score });
  }
  if (!hits.length) return null;
  hits.sort((a, b) => b.score - a.score);
  const top = hits[0];

  // A requirement's definition is often a BLOCK, not a line: a blockquote
  // or paragraph runs on. Taking one line truncated REQ-095 mid-sentence.
  const l0 = specLines[top.i];
  if (!l0.trim().startsWith('|')) {
    const quote = l0.trim().startsWith('>');
    const out = [l0];
    let j = top.i + 1;
    for (; j < normTo; j++) {
      const nx = specLines[j];
      if (!nx.trim()) break;
      if (quote !== nx.trim().startsWith('>')) break;
      if (/^#{2,}\s/.test(nx) || nx.trim().startsWith('|')) break;
      out.push(nx);
    }
    let text = out.map(x => x.replace(/^\s*>\s?/, '').trim()).join(' ');

    // A statement that ends in a colon is not finished: the spec's next
    // element completes it, and the blank-line break above discards it —
    // leaving a card that trails off. Five requirements state themselves
    // this way and each continues differently, so pull whichever element
    // follows: a fenced block (REQ-103's LFSR step), a list (REQ-040's
    // three decode classes, REQ-122's stimulus classes) or a table
    // (REQ-008's reset values).
    if (/:\s*$/.test(text)) {
      const cont = continuation(j, normTo);
      if (cont) text = text.replace(/:\s*$/, ': ') + cont;
    }
    top.l = text;
  }
  return top;
}

// The element a colon-ended statement points at, flattened into one line.
// Returns null when the next element is ordinary prose — a paragraph that
// merely follows is not the completion of the sentence, and appending it
// would invent a requirement rather than quote one.
function continuation(from, to) {
  let k = from;
  while (k < to && !specLines[k].trim()) k++;
  if (k >= to) return null;
  const l = specLines[k];

  if (/^\s*(```|~~~)/.test(l)) {                                // fenced block
    const code = [];
    for (let m = k + 1; m < to; m++) {
      if (/^\s*(```|~~~)/.test(specLines[m])) break;
      if (specLines[m].trim()) code.push(specLines[m].trim());
    }
    return code.length ? '`' + code.join('; ') + '`' : null;
  }

  if (/^\s*(?:[-*+]|\d+\.)\s/.test(l)) {                        // bullet / numbered list
    const items = [];
    for (let m = k; m < to; m++) {
      const nx = specLines[m];
      if (!nx.trim()) break;
      const start = nx.match(/^\s*(?:[-*+]|\d+\.)\s+(.*)$/);
      if (start) items.push(start[1].trim());
      else if (items.length && /^\s+\S/.test(nx)) items[items.length - 1] += ' ' + nx.trim();
      else break;
    }
    return items.length ? items.join(' · ') : null;
  }

  if (l.trim().startsWith('|') && /^\|[\s:|-]+\|\s*$/.test((specLines[k + 1] || '').trim())) {
    const hdr = l.trim().split('|').slice(1, -1).map(c => c.trim());
    const out = [];
    for (let m = k + 2; m < to; m++) {
      const nx = specLines[m];
      if (!nx.trim().startsWith('|')) break;
      const cells = nx.trim().split('|').slice(1, -1).map(c => c.trim());
      // A two-column table is a mapping and reads as one; anything wider
      // needs its headers to stay legible.
      out.push(cells.length === 2
        ? `${cells[0]} → ${cells[1]}`
        : cells.map((c, q) => (hdr[q] ? `**${hdr[q]}:** ${c}` : c)).filter(Boolean).join(' '));
    }
    return out.length ? out.join(' · ') : null;
  }

  return null;
}

// Find the header row of the table a given line sits in.
function tableHeader(i) {
  for (let j = i - 1; j >= Math.max(0, i - 60); j--) {
    const l = specLines[j];
    if (!l.trim().startsWith('|')) return null;
    if (/^\|[\s:|-]+\|\s*$/.test(l.trim())) {                 // the |---|---| divider
      const h = specLines[j - 1];
      if (h && h.trim().startsWith('|')) return h.trim().split('|').slice(1, -1).map(c => c.trim());
    }
  }
  return null;
}

// A markdown table row -> readable text. 55 of the 91 requirements are
// defined ONLY as a table row, so the row must read as a statement: pair
// each cell with its column header rather than dumping dash-joined cells.
function readable(line, id, lineNo) {
  let t = line.trim();
  if (t.startsWith('|')) {
    const cells = t.split('|').slice(1, -1).map(c => c.trim());
    const hdr = lineNo != null ? tableHeader(lineNo) : null;
    const parts = [];
    cells.forEach((c, k) => {
      if (!c || /^-+$/.test(c)) return;
      if (c === id || c === `**${id}**` || c === `\`${id}\``) return;
      const h = hdr && hdr[k] && !/^(req|id)$/i.test(hdr[k]) ? hdr[k] : null;
      parts.push(h ? `**${h}:** ${c}` : c);
    });
    t = parts.join(' · ');
  }
  t = t.replace(/^>\s*/, '').replace(new RegExp(`^\\*\\*${id}\\.?\\*\\*\\s*`), '');
  return t;
}

rows.forEach(r => {
  r.block = blockOf(r.id); r.hooks = hooksIn(r.hook);
  r.tests = (cover[r.id] || {}).tests || 'unfilled';
  const hit = normativeText(r.id);
  let body = hit ? readable(hit.l, r.id, hit.i) : null;
  // Some requirements ARE a table (e.g. the exact cycle table). Their
  // definitional line reads "is the table above", which is a fragment out
  // of context — say what it is instead of showing the fragment.
  r.tabular = !!(body && body.length < 60 && /\btable\b/i.test(body));
  if (r.tabular) body = null;

  // QUALITY BAR. A requirement with no bold statement and no keyed table
  // row leaves the scorer picking the longest prose mention, which can be
  // a mid-sentence continuation ("happens in S_EXEC and ...") or a line
  // sliced through a bold marker. Showing a fragment as if it were the
  // requirement is the defect the sponsor caught twice. Pointing at the
  // spec is worse UX and better epistemics, so a fragment becomes a
  // pointer rather than a sentence nobody can act on.
  if (body) {
    const startsMidSentence = /^[a-z]/.test(body.replace(/^[`*_(]+/, ''));
    const unbalancedBold = (body.match(/\*\*/g) || []).length % 2 !== 0;
    // Measure the PROSE length, not the markdown length — "**Memory map
    // (REQ-002).**" is 25 characters of asterisks and 21 of content.
    const plain = body.replace(/[*`_]/g, '').replace(/\s+/g, ' ').trim();
    const tooShort = plain.length < 28;
    if (startsMidSentence || unbalancedBold || tooShort) { body = null; r.fragment = true; }
  }
  // Cap long extracts at a sentence boundary. The card is an index entry,
  // not a substitute for the spec — the id links to the binding text, and
  // a truncated extract must LOOK truncated so nobody reads it as whole.
  r.truncated = false;
  if (body && body.length > maxLen) {
    const cut = body.slice(0, maxLen);
    // Cut at a sentence end if there is one. A cut at "; " leaves the card
    // ending on a semicolon, which reads as a sentence that got severed —
    // so those become an ellipsis, which reads as what it is.
    const dot = cut.lastIndexOf('. ');
    const semi = cut.lastIndexOf('; ');
    body = dot > 160 ? cut.slice(0, dot + 1)
         : semi > 160 ? cut.slice(0, semi) + '…'
         : cut.trimEnd().replace(/[;:,·]$/, '') + '…';
    r.truncated = true;
  }
  r.body = body;
});

  return rows;
}
