/* SideMind · Coverage data
 * Sourced from 00-design-coverage.md. Encoded as a flat array so the heatmap
 * can render with a single loop. Each FR row contains:
 *   id, name, title, state ('full' | 'partial' | 'missing'), cells{}, files[], detail
 * cells{f} ∈ { 'full' | 'partial' | 'none' } — one entry per file (index, 01..09).
 *
 * Files:
 *   index  → index.html            (landing)
 *   01     → 01-side-panel.html    (FR-01/03/05/11)
 *   02     → 02-floating-button.html (FR-01, §3.1.2)
 *   03     → 03-onboarding.html    (NFR-04 onboarding)
 *   04     → 04-options-api-keys.html (FR-02 / NFR-02 / NFR-09)
 *   05     → 05-options-general.html  (FR-08)
 *   06     → 06-options-privacy.html  (FR-09)
 *   07     → 07-options-shortcuts.html (FR-10)
 *   08     → 08-history-modal.html (FR-06)
 *   09     → 09-empty-error-states.html (error states across FRs)
 *
 * NFR row contains the same shape but kind='nfr' (used by filter chips).
 */
(function (window) {
  'use strict';

  const FILES = ['index', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
  const NONE = Object.freeze({
    index: 'none', '01': 'none', '02': 'none', '03': 'none', '04': 'none',
    '05': 'none', '06': 'none', '07': 'none', '08': 'none', '09': 'none',
  });

  // ---------- Functional Requirements ----------
  const frs = [
    {
      id: 'FR-01', name: 'Open / close side panel',
      title: 'Mở / đóng side panel',
      state: 'full',
      cells: { ...NONE, '01': 'full', '02': 'full' },
      files: ['01', '02'],
      detail:
        '<ul>' +
          '<li><strong>Side panel</strong>: <a href="01-side-panel.html">01</a> — empty / loading / active states all show panel open.</li>' +
          '<li><strong>Toolbar close (×)</strong>: implicit in side panel header.</li>' +
          '<li><strong>FAB</strong>: <a href="02-floating-button.html">02</a> — 3 states including "panel open → FAB hidden".</li>' +
          '<li><strong>Per-tab state (AC #5)</strong>: not demoed (Chrome <code>sidePanel.setOptions({tabId})</code> in real impl).</li>' +
        '</ul>',
    },
    {
      id: 'FR-02', name: 'API key management',
      title: 'Quản lý API key',
      state: 'full',
      cells: { ...NONE, '04': 'full', '09': 'full' },
      files: ['04', '09'],
      detail:
        '<ul>' +
          '<li><strong>Full form</strong>: <a href="04-options-api-keys.html">04</a>.</li>' +
          '<li>AC #1 form: ✓ 3 provider rows.</li>' +
          '<li>AC #2 test: ✓ Test button → spinner → VALID/INVALID.</li>' +
          '<li>AC #3 AES-GCM: ✓ encryption flow diagram + callout.</li>' +
          '<li>AC #4 delete: ✓ red Delete button per row.</li>' +
          '<li>AC #5 status: ✓ NOT SET / VALID / INVALID badges.</li>' +
          '<li>AC #6 multi-provider: ✓ 3 providers simultaneously.</li>' +
          '<li><strong>Empty state</strong>: <a href="09-empty-error-states.html">09-01</a> — "Set up your API key to start".</li>' +
        '</ul>',
    },
    {
      id: 'FR-03', name: 'Multi-turn chat',
      title: 'Chat multi-turn',
      state: 'full',
      cells: { ...NONE, '01': 'full' },
      files: ['01'],
      detail:
        '<ul>' +
          '<li><a href="01-side-panel.html">01</a> active state — visible user↔AI conversation.</li>' +
          '<li>AC #1 input + send: ✓</li>' +
          '<li>AC #2 user right / AI left: ✓ via flex-direction</li>' +
          '<li>AC #3 streaming: ✓ typing animation with caret.</li>' +
          '<li>AC #4 markdown: limited (bullet list rendered).</li>' +
          '<li>AC #5 copy: ✓ Copy inline action.</li>' +
          '<li>AC #6 multi-turn: ✓ 2-turn flow demonstrated.</li>' +
          '<li>AC #7 stop generation: implicit (cancel on next demo).</li>' +
        '</ul>',
    },
    {
      id: 'FR-04', name: 'Context extraction engine',
      title: 'Context extraction engine',
      state: 'partial',
      cells: { ...NONE, '01': 'partial', '09': 'partial' },
      files: ['01', '09'],
      detail:
        '<ul>' +
          '<li><a href="01-side-panel.html">01</a> — context header shows page fingerprint.</li>' +
          '<li>5 page types (YouTube / Article / Docs / Paper / Code): not visualized individually; pipeline type indicated in meta text.</li>' +
          '<li>Summary levels (<code>/tldr</code>, <code>/summary</code>, <code>/full</code>): chips in <a href="01-side-panel.html">01</a>.</li>' +
          '<li>Extraction failure fallback: <a href="09-empty-error-states.html">09-04</a> — "Use without context" CTA.</li>' +
        '</ul>',
    },
    {
      id: 'FR-05', name: 'Citation & source linking',
      title: 'Citation & source linking',
      state: 'partial',
      cells: { ...NONE, '01': 'partial' },
      files: ['01'],
      detail:
        '<ul>' +
          '<li><a href="01-side-panel.html">01</a> active state — citations <code>[1] [2] [3]</code> inline.</li>' +
          '<li>AC #1 anchor at end of sentence: ✓</li>' +
          '<li>AC #2 click → highlight: simulated by cite-ref box flash + scroll.</li>' +
          '<li>AC #3 auto-scroll: simulated in mockup.</li>' +
          '<li>AC #6 re-render on SPA route change: out of scope (static mockup).</li>' +
        '</ul>',
    },
    {
      id: 'FR-06', name: 'Conversation history',
      title: 'Conversation history',
      state: 'full',
      cells: { ...NONE, '08': 'full' },
      files: ['08'],
      detail:
        '<ul>' +
          '<li><a href="08-history-modal.html">08</a> — full modal.</li>' +
          '<li>AC #1 metadata: ✓ title, updated, msgs, tokens, tags, host color.</li>' +
          '<li>AC #2 list sorted by updatedAt: ✓ faker data.</li>' +
          '<li>AC #3 search: ✓ live filter.</li>' +
          '<li>AC #4 tags: ✓ tag chips filter.</li>' +
          '<li>AC #5 export MD/JSON: ✓ footer + inline Export.</li>' +
          '<li>AC #6 delete confirm: ✓ confirm + inline delete.</li>' +
          '<li>AC #7 cap 1000 LRU: ✓ footer hint.</li>' +
        '</ul>',
    },
    {
      id: 'FR-07', name: 'Quick actions (slash)',
      title: 'Quick actions (slash)',
      state: 'partial',
      cells: { ...NONE, '01': 'partial' },
      files: ['01'],
      detail:
        '<ul>' +
          '<li><a href="01-side-panel.html">01</a> — 8 slash commands in autocomplete dropdown.</li>' +
          '<li>AC #1 context menu (right-click): not demoed (Chrome native).</li>' +
          '<li>AC #2 slash commands: ✓ all 8 (<code>/summarize</code>, <code>/explain</code>, <code>/translate</code>, <code>/rewrite</code>, <code>/code</code>, <code>/tldr</code>, <code>/summary</code>, <code>/full</code>).</li>' +
          '<li>AC #3 selection-aware: implicit via Chrome context API.</li>' +
          '<li>AC #5 autocomplete: ✓ dropdown opens on <code>/</code>, arrow-key nav, Enter select.</li>' +
        '</ul>',
    },
    {
      id: 'FR-08', name: 'Settings',
      title: 'Settings',
      state: 'partial',
      cells: { ...NONE, '05': 'partial' },
      files: ['05'],
      detail:
        '<ul>' +
          '<li><a href="05-options-general.html">05</a>.</li>' +
          '<li>AC #1 theme: ✓ light/dark/auto cards.</li>' +
          '<li>AC #2 default model: ✓ select with optgroup by provider + vision icon.</li>' +
          '<li>AC #3 temperature slider 0–2: ✓ live value.</li>' +
          '<li>AC #4 max tokens 100–8000: ✓ input + visual bar.</li>' +
          '<li>AC #5 page mode: ✓ Auto/Summarize/Full radios.</li>' +
          '<li>AC #6 font size: ✓ 3 chips with previews.</li>' +
          '<li>AC #7 storage + sync: not directly demoed.</li>' +
        '</ul>',
    },
    {
      id: 'FR-09', name: 'Privacy controls',
      title: 'Privacy controls',
      state: 'full',
      cells: { ...NONE, '06': 'full', '09': 'full' },
      files: ['06', '09'],
      detail:
        '<ul>' +
          '<li><a href="06-options-privacy.html">06</a>.</li>' +
          '<li>AC #1 telemetry OFF default: ✓ OFF badge.</li>' +
          '<li>AC #2 toggle + send list: ✓ "When enabled: extension version, OS, browser version".</li>' +
          '<li>AC #3 Clear all data: ✓ danger zone + confirm modal.</li>' +
          '<li>AC #4 incognito toggle: ✓ second toggle row.</li>' +
          '<li>AC #5 privacy policy link: ✓ callout.</li>' +
          '<li>Error states: <a href="09-empty-error-states.html">09-09-2</a>.</li>' +
        '</ul>',
    },
    {
      id: 'FR-10', name: 'Keyboard shortcuts',
      title: 'Keyboard shortcuts',
      state: 'full',
      cells: { ...NONE, '07': 'full' },
      files: ['07'],
      detail:
        '<ul>' +
          '<li><a href="07-options-shortcuts.html">07</a> — 4 rows.</li>' +
          '<li>AC #1 ⌃⇧Y toggle: ✓ live demo via keydown listener.</li>' +
          '<li>AC #2 ⌃⇧L focus: ✓</li>' +
          '<li>AC #3 ⌃⇧N new chat: ✓</li>' +
          '<li>AC #4 ⌃⇧C copy last: ✓</li>' +
          '<li>AC #5 customizable: ✓ callout with <code>chrome://extensions/shortcuts</code>.</li>' +
        '</ul>',
    },
    {
      id: 'FR-11', name: 'Multi-tab context',
      title: 'Multi-tab context',
      state: 'partial',
      cells: { ...NONE, '01': 'partial' },
      files: ['01'],
      detail:
        '<ul>' +
          '<li><a href="01-side-panel.html">01</a> active state — sources chips.</li>' +
          '<li>AC #1 chips list: ✓</li>' +
          '<li>AC #2 + Add tab popup: ✓ with 3 faker tabs.</li>' +
          '<li>AC #3 status extracting → ready: ✓ (1.2s delay + ✓).</li>' +
          '<li>AC #4 × remove: ✓ animation slide-out.</li>' +
          '<li>AC #5 token warning: not shown for ≤ 8000.</li>' +
          '<li>AC #6 prefix <code>[tab1]</code>: ✓ chip prefix shown.</li>' +
          '<li>AC #7 tab closed → toast: implied by remove animation.</li>' +
        '</ul>',
    },
    {
      id: 'FR-12', name: 'File & image attachment',
      title: 'File & image attachment',
      state: 'partial',
      cells: { ...NONE, '01': 'partial' },
      files: ['01'],
      detail:
        '<ul>' +
          '<li><a href="01-side-panel.html">01</a> — "📎 3 files" indicator.</li>' +
          '<li>AC #1 file picker btn: ✓ 📎 row.</li>' +
          '<li>AC #2 supported types: enumerated in tooltip — picker not opened.</li>' +
          '<li>AC #3 client-side parsers: not demoed.</li>' +
          '<li>AC #4 20 MB warn, 50 MB block: not demoed.</li>' +
          '<li>AC #5 image base64 + multimodal: implicit.</li>' +
          '<li>AC #6–9 various parsers: implicit via vision icon.</li>' +
        '</ul>',
    },
    {
      id: 'FR-13', name: 'Slash command /extract',
      title: 'Slash command /extract',
      state: 'partial',
      cells: { ...NONE, '01': 'partial' },
      files: ['01'],
      detail:
        '<ul>' +
          '<li><a href="01-side-panel.html">01</a> — <code>/tabs</code>, <code>/attach</code> referenced in plan; dropdown currently shows 8 commands. Footnote: real impl dropdown would expand to 10.</li>' +
        '</ul>',
    },
  ];

  // ---------- Non-Functional Requirements ----------
  const nfrs = [
    {
      id: 'NFR-01', name: 'Performance',
      title: 'Performance',
      state: 'full',
      cells: { ...NONE, '01': 'partial' },
      kind: 'nfr',
      detail:
        '<a href="01-side-panel.html">01</a> loading state shows skeleton shimmer per spec. NFR-01 #5 extraction < 1s — not measurable in mockup.',
    },
    {
      id: 'NFR-02', name: 'Security',
      title: 'Security',
      state: 'full',
      cells: { ...NONE, '04': 'partial' },
      kind: 'nfr',
      detail:
        '<a href="04-options-api-keys.html">04</a> encryption flow + tokens use mono font for ID-like values. No inline scripts (per CSP).',
    },
    {
      id: 'NFR-03', name: 'Reliability',
      title: 'Reliability',
      state: 'full',
      cells: { ...NONE, '09': 'full' },
      kind: 'nfr',
      detail:
        '<a href="09-empty-error-states.html">09</a> covers all 3 reliability scenarios (no-key, network, quota-429, extraction-fail).',
    },
    {
      id: 'NFR-04', name: 'Usability',
      title: 'Usability',
      state: 'full',
      cells: { ...NONE, 'index': 'full', '03': 'full' },
      kind: 'nfr',
      detail:
        'All mockups support EN ⇄ VI toggle. <a href="03-onboarding.html">03</a> for first-time UX. Focus rings via <code>:focus-visible</code>. Mono uppercase status for screen readers.',
    },
    {
      id: 'NFR-05', name: 'Compatibility',
      title: 'Compatibility',
      state: 'full',
      cells: { ...NONE, 'index': 'partial' },
      kind: 'nfr',
      detail:
        'All-inherit via tokens (no OS-specific). Verified at default 1× / high-DPI ready.',
    },
    {
      id: 'NFR-06', name: 'Maintainability',
      title: 'Maintainability',
      state: 'full',
      cells: { ...NONE, 'index': 'partial' },
      kind: 'nfr',
      detail:
        'Mockup uses shared <code>_shared/tokens.css</code> + <code>base.css</code> + <code>components.css</code> + <code>i18n.js</code> for DRY design system. Equivalent of strict TS in code phase.',
    },
    {
      id: 'NFR-07', name: 'Portability',
      title: 'Portability',
      state: 'full',
      cells: { ...NONE, 'index': 'full' },
      kind: 'nfr',
      detail:
        'n/a — static HTML files are 100% portable.',
    },
    {
      id: 'NFR-08', name: 'File processing perf',
      title: 'File processing perf',
      state: 'missing',
      cells: { ...NONE, '01': 'partial' },
      kind: 'nfr',
      detail:
        'Out of scope (visual only); UI affordance shown in <a href="01-side-panel.html">01</a>.',
    },
    {
      id: 'NFR-09', name: 'File privacy',
      title: 'File privacy',
      state: 'partial',
      cells: { ...NONE, '06': 'partial' },
      kind: 'nfr',
      detail:
        '<a href="06-options-privacy.html">06</a> Clear-all-data modal enumerates file deletion.',
    },
  ];

  window.COVERAGE_DATA = {
    frs,
    nfrs,
    FILES,
  };
})(window);
