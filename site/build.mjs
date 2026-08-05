// build.mjs — static site generator.
//
// Reads the repository's own markdown and emits ./dist. Nothing here
// transcribes a document by hand: if an artifact changes, rebuild and the
// site changes with it. The only hand-authored content lives in content.mjs
// and is labelled as editorial on the site itself.

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, cpSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
let marked;
try {
  ({ marked } = await import('marked'));
} catch {
  console.error(`
  Missing dependency: marked

  Run the build through npm so dependencies install themselves:

      npm run build          (or: npm run deploy)

  Running \`node build.mjs\` directly skips npm entirely, so nothing
  installs it. If you prefer that, run \`npm install\` first.
`);
  process.exit(1);
}
import { site, intro, phases, milestones, backlog, documents, workOrderDir, agents } from './content.mjs';
import { extractRequirements, HOOKS } from './requirements.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(HERE, 'dist');

marked.setOptions({ mangle: false, headerIds: true, gfm: true });

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = s => marked.parse(s);
const mdInline = s => marked.parseInline(s);

const read = rel => {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8');
};

const NAV = [
  ['/', 'Overview'],
  ['/program/', 'Program'],
  ['/backlog/', 'Backlog'],
  ['/atlas/', 'Spec atlas'],
  ['/documents/', 'Documents'],
  ['/orders/', 'Work orders'],
  ['/agents/', 'Agents'],
];

function page({ path, title, subtitle, body, toc = '', wide = false }) {
  const nav = NAV.map(([href, label]) => {
    const on = href === '/' ? path === '/' : path.startsWith(href);
    return `<a href="${href}"${on ? ' class="on" aria-current="page"' : ''}>${esc(label)}</a>`;
  }).join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ${esc(site.title)}</title>
<meta name="description" content="${esc(site.tagline)}">
<link rel="stylesheet" href="/assets/style.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><text y=%22.9em%22 font-size=%2256%22>⬢</text></svg>">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="bar">
    <a class="brand" href="/"><span class="glyph">⬢</span> <span>${esc(site.title)}</span></a>
    <nav class="nav">${nav}</nav>
  </div>
</header>
<main id="main" class="${wide ? 'wide' : ''}">
  <div class="pagehead">
    <h1>${esc(title)}</h1>
    ${subtitle ? `<p class="lede">${mdInline(subtitle)}</p>` : ''}
  </div>
  ${toc ? `<nav class="toc" aria-label="On this page">${toc}</nav>` : ''}
  ${body}
</main>
<footer class="foot">
  <p>Built by an agent organisation under a written constitution. Every claim on this
  site is either generated from a committed artifact or marked editorial.</p>
  <p class="links">
    <a href="${site.repo}">Project repository</a>
    <a href="${site.orgGeneric}">Organisation generic</a>
    <a href="${site.shell}">Canonical shell</a>
  </p>
</footer>
</body>
</html>`;

  const dir = path === '/' ? OUT : join(OUT, path.replace(/^\/|\/$/g, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

const statusClass = s => {
  const t = String(s).toLowerCase();
  if (t.includes('critical')) return 'crit';
  if (t.includes('not countersigned') || t.includes('draft')) return 'warn';
  if (t.includes('accepted') || t.includes('live') || t.includes('pass')) return 'ok';
  return 'neutral';
};

// ---- Overview ---------------------------------------------------------------
function buildIndex() {
  const stateRows = milestones.map(m => `
    <div class="mile ${m.state}">
      <div class="mile-id">${esc(m.id)}</div>
      <div class="mile-body">
        <h3>${esc(m.name)} <span class="pill ${m.state}">${m.state === 'complete' ? 'complete' : m.state === 'active' ? 'active' : 'not started'}</span></h3>
        <p>${mdInline(m.note)}</p>
      </div>
    </div>`).join('');

  page({
    path: '/', title: site.title, subtitle: site.tagline,
    body: `
<section class="prose">${md(intro.what)}</section>

<section class="callout">
  <h2>The constraint that shapes everything</h2>
  <div class="prose">${md(intro.constraint)}</div>
</section>

<section>
  <h2>Where the program is</h2>
  <div class="miles">${stateRows}</div>
</section>

<section>
  <h2>How it is built</h2>
  <div class="prose">${md(intro.org)}</div>
</section>

<section class="callout subtle">
  <h2>A note on how claims are stated</h2>
  <div class="prose">${md(intro.honesty)}</div>
</section>

<section class="cards">
  <a class="card" href="/program/"><h3>Program</h3><p>Phases, success criteria, and the gates each one has to pass.</p></a>
  <a class="card" href="/backlog/"><h3>Backlog</h3><p>What is open right now, who owns it, and what unblocks it.</p></a>
  <a class="card" href="/documents/"><h3>Documents</h3><p>Specifications, decisions, verification reports and audits, rendered from source.</p></a>
</section>`,
  });
}

// ---- Program ----------------------------------------------------------------
function buildProgram() {
  const rows = phases.map(p => `
    <article class="phase ${p.state}" id="${esc(p.id)}">
      <header>
        <h2><span class="pid">${esc(p.id)}</span> ${esc(p.name)}
          <span class="pill ${p.state}">${p.state === 'active' ? 'active' : p.state === 'complete' ? 'complete' : 'not started'}</span>
        </h2>
      </header>
      <dl>
        <dt>Scope</dt><dd>${mdInline(p.scope)}</dd>
        <dt>Success criteria</dt><dd>${mdInline(p.criteria)}</dd>
      </dl>
    </article>`).join('');

  page({
    path: '/program/', title: 'Program', subtitle: 'The phase table is the canonical statement of scope. Changing it is a sponsor decision, not an edit.',
    toc: phases.map(p => `<a href="#${esc(p.id)}">${esc(p.id)}</a>`).join(''),
    body: `
<section class="callout subtle">
  <h2>Every phase passes three gates</h2>
  <div class="prose"><p><strong>Spec freeze</strong> — requirements written and countersigned as testable, then signed by the sponsor. Nothing is implemented against an unfrozen specification.
  <strong>Module ready</strong> — sign-off packets, each gated on a mutation campaign that qualifies the bench before it is allowed to pass anything.
  <strong>Phase accept</strong> — success criteria met, audit report committed, no open critical findings, sponsor signature.</p></div>
</section>
<section class="phases">${rows}</section>
<section class="callout">
  <h2>Editorial</h2>
  <div class="prose"><p>This page mirrors the repository's phase table. It is hand-maintained, which
  means it can drift — the committed table governs.</p></div>
</section>`,
  });
}

// ---- Backlog ----------------------------------------------------------------
function buildBacklog() {
  const groups = [
    ['now', 'Now — blocking the next gate'],
    ['next', 'Next — owed before the phase closes'],
    ['later', 'Later — carried, with a named settling event'],
  ];
  const kindLabel = { defect: 'defect', finding: 'audit finding', risk: 'risk', deferred: 'deferred', obligation: 'obligation', gate: 'gate' };

  const sections = groups.map(([pri, label]) => {
    const items = backlog.filter(b => b.pri === pri);
    if (!items.length) return '';
    return `<section id="${pri}">
      <h2>${esc(label)}</h2>
      <div class="items">${items.map(b => `
        <article class="item ${b.severity ? 'crit' : ''}">
          <div class="item-meta">
            <code class="id">${esc(b.id)}</code>
            <span class="kind">${esc(kindLabel[b.kind] || b.kind)}</span>
            ${b.severity ? `<span class="sev">${esc(b.severity)}</span>` : ''}
            <span class="owner">${esc(b.owner)}</span>
          </div>
          <h3>${esc(b.title)}</h3>
          <div class="prose">${md(b.body)}</div>
        </article>`).join('')}</div>
    </section>`;
  }).join('');

  page({
    path: '/backlog/', title: 'Backlog', subtitle: 'Open work, ordered by what it blocks. Every item names an owner and what settles it.',
    toc: groups.map(([id, l]) => `<a href="#${id}">${esc(l.split(' — ')[0])}</a>`).join(''),
    body: `<section class="callout subtle"><div class="prose"><p>Curated from the program board, which carries these across several sections.
    Items are dropped from this list only when the artifact that closes them is committed —
    an audit finding, in particular, is closed by the auditor and never by the party that remediated it.</p></div></section>${sections}`,
  });
}

// ---- Document pages ---------------------------------------------------------
function renderDoc(item) {
  const raw = read(item.src);
  if (raw === null) return { ...item, missing: true };

  // Strip a leading H1 — the page header carries the title.
  const body = raw.replace(/^#\s+.*\n/, '');
  const html = md(body);

  const heads = [...body.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].trim()).slice(0, 24);
  const slugify = s => s.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  const toc = heads.map(h => `<a href="#${slugify(h)}">${esc(h.replace(/[`*]/g, ''))}</a>`).join('');

  page({
    path: `/documents/${item.slug}/`, title: item.title, subtitle: item.blurb, wide: true, toc,
    body: `<div class="docmeta">
      <span class="pill ${statusClass(item.status)}">${esc(item.status)}</span>
      <a class="src" href="${site.repo}/blob/main/${item.src}"><code>${esc(item.src)}</code></a>
    </div>
    <article class="doc prose">${html}</article>`,
  });
  return { ...item, lines: raw.split('\n').length };
}

function buildDocuments() {
  const rendered = documents.map(g => ({ group: g.group, items: g.items.map(renderDoc) }));

  const body = rendered.map(g => `
    <section id="${g.group.toLowerCase()}">
      <h2>${esc(g.group)}</h2>
      <div class="doclist">${g.items.map(i => i.missing ? `
        <article class="docitem missing">
          <h3>${esc(i.title)}</h3>
          <p class="prose">Not present in the repository at build time — <code>${esc(i.src)}</code>.</p>
        </article>` : `
        <a class="docitem" href="/documents/${i.slug}/">
          <div class="docitem-top">
            <h3>${esc(i.title)}</h3>
            <span class="pill ${statusClass(i.status)}">${esc(i.status)}</span>
          </div>
          <p>${esc(i.blurb)}</p>
          <span class="meta">${i.lines} lines · <code>${esc(i.src)}</code></span>
        </a>`).join('')}</div>
    </section>`).join('');

  page({
    path: '/documents/', title: 'Documents', subtitle: 'Rendered from the repository at build time. Status badges report each artifact\'s own stated state, not its polish.',
    toc: rendered.map(g => `<a href="#${g.group.toLowerCase()}">${esc(g.group)}</a>`).join(''),
    body,
  });
  return rendered;
}

// ---- Work orders ------------------------------------------------------------
function buildOrders() {
  const dir = join(ROOT, workOrderDir);
  const files = existsSync(dir)
    ? readdirSync(dir).filter(f => /^WO-\d{4}.*\.md$/.test(f)).sort()
    : [];

  const parsed = files.map(f => {
    const raw = readFileSync(join(dir, f), 'utf8');
    const title = (raw.match(/^#\s+(.+)$/m) || [, f])[1];
    const stateLine = raw.match(/^-\s+\*\*State\*\*:\s*(.+)$/m);
    const state = stateLine ? stateLine[1].replace(/\*\*/g, '').replace(/\(see Return log\)/, '').trim() : 'unknown';
    const toFrom = (raw.match(/^-\s+\*\*From\*\*\s*\/\s*\*\*To\*\*:\s*(.+)$/m) || [, ''])[1];
    const slug = f.replace(/\.md$/, '').toLowerCase();
    const body = raw.replace(/^#\s+.*\n/, '');

    page({
      path: `/orders/${slug}/`, title, subtitle: toFrom ? `**${toFrom.trim()}**` : '', wide: true,
      body: `<div class="docmeta">
        <span class="pill ${/ACCEPTED|RETURNED/i.test(state) ? 'ok' : 'warn'}">${esc(state)}</span>
        <a class="src" href="${site.repo}/blob/main/${workOrderDir}/${f}"><code>${esc(workOrderDir)}/${esc(f)}</code></a>
      </div>
      <article class="doc prose">${md(body)}</article>`,
    });
    return { f, slug, title, state, toFrom };
  });

  page({
    path: '/orders/', title: 'Work orders', subtitle: 'Every unit of work is a versioned packet. Nothing is transferred agent-to-agent by conversation alone.',
    body: `<section class="callout subtle"><div class="prose"><p>A packet names its authority, its deliverables, its definition of done, what was
    deliberately withheld from the assignee, and the standing lessons that bind it. Its return log
    carries the reviewing verdict. This list is generated from <code>${esc(workOrderDir)}/</code>.</p></div></section>
    <table class="wo">
      <thead><tr><th>Packet</th><th>Route</th><th>State</th></tr></thead>
      <tbody>${parsed.map(p => `<tr>
        <td><a href="/orders/${p.slug}/">${esc(p.title)}</a></td>
        <td class="mono">${esc(p.toFrom)}</td>
        <td><span class="pill ${/ACCEPTED|RETURNED/i.test(p.state) ? 'ok' : 'warn'}">${esc(p.state)}</span></td>
      </tr>`).join('')}</tbody>
    </table>`,
  });
  return parsed;
}

// ---- Agents -----------------------------------------------------------------
function buildAgents() {
  const jdir = join(ROOT, 'agents/journals');
  const counts = {};
  if (existsSync(jdir)) {
    for (const f of readdirSync(jdir)) {
      const m = f.match(/^claude_(.+)_agent(?:\.v\d+)?\.md$/);
      if (!m) continue;
      const raw = readFileSync(join(jdir, f), 'utf8');
      counts[m[1]] = (counts[m[1]] || 0) + (raw.match(/^## \[J-/gm) || []).length;
    }
  }

  page({
    path: '/agents/', title: 'Agents', subtitle: 'Each agent has a version-controlled charter and an append-only journal. Entry counts are read from the journals at build time.',
    body: `
<section class="callout subtle"><div class="prose"><p>Subagents cannot spawn subagents, so the orchestrator is the sole spawner and the
sole operator of git. The lead → worker hierarchy is honoured logically: a lead writes a work order,
the orchestrator spawns the worker with that packet, and the worker's output returns to the lead for
review. The chain is reconstructible from packets, journals and commit trailers.</p></div></section>
<table class="agents">
  <thead><tr><th>Agent</th><th>Tier</th><th>Owns</th><th>Journal</th></tr></thead>
  <tbody>${agents.map(a => `<tr class="${a.active ? '' : 'dormant'}">
    <td><code>${esc(a.id)}</code>${a.active ? '' : ' <span class="pill neutral">not yet spawned</span>'}</td>
    <td class="mono">${esc(a.tier)}</td>
    <td>${esc(a.owns)}</td>
    <td class="num">${counts[a.id] ? `${counts[a.id]} ${counts[a.id] === 1 ? 'entry' : 'entries'}` : '—'}</td>
  </tr>`).join('')}</tbody>
</table>
<section class="callout">
  <h2>Independence lines</h2>
  <div class="prose">
    <p><strong>Verification is never graded by design.</strong> Tests derive from specifications, never from RTL;
    testbench packets deliberately omit the RTL source. Design-line agents cannot stage test paths and
    verification-line agents cannot stage RTL — enforced by script at commit time and re-checked in CI.</p>
    <p><strong>The auditor is graded only by the sponsor.</strong> It audits everyone, including the orchestrator,
    writes only to its own report tree, and never fixes what it finds. Its findings reach the sponsor unedited —
    including when the finding is against the orchestrator relaying it.</p>
  </div>
</section>`,
  });
}

// ---- Spec atlas -------------------------------------------------------------
// Every requirement, individually, from the specification's own §10 registry —
// which the spec names as "the authoritative registry" for its REQ ids. The
// blocks come from requirements.md. Nothing here is transcribed by hand.
function buildAtlas() {
  const spec = read('docs/specs/SPEC-P1-core-cpu.md');
  const reqsDoc = read('docs/specs/requirements.md');
  if (!spec) { console.warn('atlas: spec not found, skipping'); return 0; }

  // Extraction lives in requirements.mjs so the atlas and the flat list
  // generated by scripts/gen_req_list.mjs read the corpus identically.
  const rows = extractRequirements(spec, reqsDoc);

  const allBlocks = [...new Set(rows.map(r => r.block))];
  const counts = Object.fromEntries(Object.keys(HOOKS).map(k => [k, rows.filter(r => r.hooks.includes(k)).length]));

  const cards = rows.map(r => `
    <article class="req" data-id="${esc(r.id)}" data-block="${esc(r.block)}" data-hooks="${esc(r.hooks.join(' '))}"
             data-text="${esc((r.id + ' ' + r.satisfies + ' ' + (r.body || '') + ' ' + r.section + ' ' + r.block).toLowerCase())}">
      <div class="req-head">
        <a class="req-id" href="/documents/spec-p1-core-cpu/#${sectionAnchor(r.section)}">${esc(r.id)}</a>
        <span class="req-hooks">${r.hooks.map(h => `<abbr class="hook h-${h}" title="${esc(HOOKS[h])}">${h}</abbr>`).join('')}</span>
      </div>
      <p class="req-handle" title="Short handle from the spec's §10 registry — a label, not the requirement. The requirement is the text below.">${mdInline(r.satisfies)}</p>
      ${r.body ? `<p class="req-text">${mdInline(r.body)}${r.truncated ? ` <a class="more" href="/documents/spec-p1-core-cpu/#${sectionAnchor(r.section)}">read in full →</a>` : ''}</p>`
               : `<p class="req-text none">${r.tabular ? 'This requirement <strong>is a table</strong>' : 'Stated in the spec body'} — read it in ${mdInline(r.section)}.</p>`}
      <div class="req-foot">
        <span class="req-sec">${mdInline(r.section)}</span>
        <span class="req-cov ${/unfilled/i.test(r.tests) ? 'none' : 'some'}">${/unfilled/i.test(r.tests) ? 'no test yet' : esc(r.tests)}</span>
      </div>
      <div class="req-block">${esc(r.block)}</div>
    </article>`).join('');

  const legend = Object.entries(HOOKS).map(([k, v]) =>
    `<li><abbr class="hook h-${k}">${k}</abbr> <strong>${esc(v.split('—')[0].trim())}</strong>${v.includes('—') ? ' — ' + esc(v.split('—')[1].trim()) : ''} <span class="cnt">${counts[k]}</span></li>`).join('');

  page({
    path: '/atlas/', wide: true, title: 'Spec atlas',
    subtitle: `Every one of the **${rows.length}** P1 requirements, from the specification's own §10 registry — which the spec names as the authoritative registry for these ids. Search and filter below; each id links into the spec at its section.`,
    body: `
<section class="callout subtle">
  <h2>DV hooks</h2>
  <div class="prose"><p>Each requirement carries the kind of check that can actually perform its
  observation. A hook names a check that can make the observation — a parenthesised module id marks a
  row whose observation point is not the top-level DUT boundary.</p></div>
  <ul class="legend">${legend}</ul>
  <p class="note"><strong>The <code>I</code> hooks owe a named performer and do not yet have one</strong> —
  carry-forward <code>C-4</code> on the spec-freeze gate.</p>
</section>

<section class="callout subtle">
  <h2>How to read a card</h2>
  <div class="prose"><p>The small uppercase line is a <strong>handle</strong> — the short label the
  specification's §10 registry uses to refer to the requirement in tables. It is not the requirement and
  is not binding. The paragraph beneath it is the requirement, quoted from the normative body (§4–§9),
  which is the text that binds. Where a requirement is defined as a table row, the card pairs each cell
  with its column heading so the row reads as a statement.</p>
  <p><strong>${rows.filter(r => !r.body).length} of ${rows.length} cards do not quote their requirement</strong>
  and point into the spec instead. Those requirements are stated in the specification as a label over a
  table, or as a citation inside another requirement's prose, and there is no self-contained sentence to
  quote — inventing one here would put text on the site that the frozen spec does not contain. The id
  links to the binding section.</p></div>
</section>

<div class="atlas-controls">
  <input id="q" type="search" placeholder="Search ${rows.length} requirements — id, text, section…" aria-label="Search requirements">
  <div class="filters" id="filters">
    <button class="f on" data-f="all">All <span class="cnt">${rows.length}</span></button>
    ${Object.keys(HOOKS).map(k => `<button class="f" data-hook="${k}">${k} <span class="cnt">${counts[k]}</span></button>`).join('')}
  </div>
  <select id="blk" aria-label="Filter by block">
    <option value="">All blocks</option>
    ${allBlocks.map(b => `<option value="${esc(b)}">${esc(b)}</option>`).join('')}
  </select>
  <p class="count" id="count">${rows.length} shown</p>
</div>

<div class="reqs" id="reqs">${cards}</div>
<p class="empty" id="empty" hidden>No requirement matches that filter.</p>

<script>
(function(){
  var q=document.getElementById('q'), blk=document.getElementById('blk'),
      reqs=[].slice.call(document.querySelectorAll('.req')),
      count=document.getElementById('count'), empty=document.getElementById('empty'),
      hook=null;
  function apply(){
    var t=(q.value||'').toLowerCase().trim(), b=blk.value, n=0;
    reqs.forEach(function(el){
      var ok = (!t || el.dataset.text.indexOf(t)>-1)
            && (!b || el.dataset.block===b)
            && (!hook || el.dataset.hooks.split(' ').indexOf(hook)>-1);
      el.hidden=!ok; if(ok) n++;
    });
    count.textContent = n + (n===1?' shown':' shown');
    empty.hidden = n>0;
  }
  q.addEventListener('input', apply); blk.addEventListener('change', apply);
  document.getElementById('filters').addEventListener('click', function(e){
    var btn=e.target.closest('.f'); if(!btn) return;
    document.querySelectorAll('.f').forEach(function(x){x.classList.remove('on');});
    btn.classList.add('on');
    hook = btn.dataset.hook || null;
    apply();
  });
})();
</script>`,
  });
  return rows.length;
}

// "§4.B, §6.2" -> anchor of the spec page's "## 6." heading
function sectionAnchor(sectionText) {
  const m = String(sectionText).match(/§\s*(\d+)/);
  if (!m) return '';
  const n = m[1];
  const titles = { '1':'1-purpose','2':'2-scope','3':'3-programme-invariants-that-bind-this-module',
    '4':'4-interface','5':'5-parameters','6':'6-behaviour','7':'7-timing-contract',
    '8':'8-performance-stress-obligation','9':'9-errors-and-discards','10':'10-req-coverage',
    '11':'11-deferred-items-and-open-questions','12':'12-freeze-record','13':'13-change-log' };
  return titles[n] || '';
}

// ---- 404 --------------------------------------------------------------------
function build404() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found — ${esc(site.title)}</title><link rel="stylesheet" href="/assets/style.css"></head>
<body><header class="masthead"><div class="bar"><a class="brand" href="/"><span class="glyph">⬢</span> <span>${esc(site.title)}</span></a></div></header>
<main><div class="pagehead"><h1>Not found</h1><p class="lede">That page does not exist. <a href="/">Back to the overview</a>.</p></div></main></body></html>`;
  writeFileSync(join(OUT, '404.html'), html);
}

// ---- go ---------------------------------------------------------------------
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(HERE, 'assets'), join(OUT, 'assets'), { recursive: true });

buildIndex();
buildProgram();
buildBacklog();
const docs = buildDocuments();
const orders = buildOrders();
const nReqs = buildAtlas();
buildAgents();
build404();

const nDocs = docs.reduce((n, g) => n + g.items.filter(i => !i.missing).length, 0);
const nMissing = docs.reduce((n, g) => n + g.items.filter(i => i.missing).length, 0);
console.log(`built -> ${OUT}`);
console.log(`  documents rendered: ${nDocs}${nMissing ? ` (${nMissing} missing from the tree)` : ''}`);
console.log(`  work orders:        ${orders.length}`);
console.log(`  backlog items:      ${backlog.length}`);
console.log(`  atlas requirements: ${nReqs}`);
