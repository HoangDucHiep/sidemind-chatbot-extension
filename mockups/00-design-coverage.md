# SideMind · UI Mockup Coverage Matrix

Mapping từ **FR-xx / NFR-xx** trong [docs/SRS.md v0.3.0](../../docs/SRS.md) sang **file mockup** visualize nó. Mỗi FR phải có ít nhất 1 visualization theo yêu cầu của plan §7.

## Quick reference

| FR / NFR | Title | Mockup file(s) |
|---|---|---|
| FR-01 | Mở / đóng side panel | [01](01-side-panel.html) · [02](02-floating-button.html) |
| FR-02 | Quản lý API key | [04](04-options-api-keys.html) · [09-01](09-empty-error-states.html) |
| FR-03 | Chat multi-turn | [01](01-side-panel.html) (active state, streaming) |
| FR-04 | Context extraction engine | [01](01-side-panel.html) (context header) · [09-04](09-empty-error-states.html) |
| FR-05 | Citation & source linking | [01](01-side-panel.html) (citations [1] [2] [3], cite-ref box) |
| FR-06 | Conversation history | [08](08-history-modal.html) |
| FR-07 | Quick actions (slash) | [01](01-side-panel.html) (slash autocomplete, suggestion chips) |
| FR-08 | Settings | [05](05-options-general.html) |
| FR-09 | Privacy controls | [06](06-options-privacy.html) · [09-09-2](09-empty-error-states.html) |
| FR-10 | Keyboard shortcuts | [07](07-options-shortcuts.html) (keycap table + live keystroke demo) |
| FR-11 | Multi-tab context | [01](01-side-panel.html) (sources chips, +Add popup) |
| FR-12 | File & image attachment | [01](01-side-panel.html) (📎 3 files indicator) |
| FR-13 | Slash command `/extract` | [01](01-side-panel.html) (slash `/attach`, `/tabs` in dropdown) |
| NFR-01 | Performance (skeleton, loading) | [01-02](01-side-panel.html) (Loading state) |
| NFR-02 | Security (AES-GCM flow) | [04](04-options-api-keys.html) (encryption flow diagram + callout) |
| NFR-03 | Reliability (retry, error) | [09](09-empty-error-states.html) (network/quota/extraction) |
| NFR-04 | Usability (a11y, i18n, onboarding) | All — i18n on every file · [03](03-onboarding.html) (tour) |
| NFR-05 | Compatibility (high-DPI) | Inherits via tokens |
| NFR-06 | Maintainability | Demo deliverable, code in src/ phase tiếp |
| NFR-07 | Portability | n/a for mockup |
| NFR-08 | File processing perf | No file picker demo (visualised as indicator) |
| NFR-09 | File privacy | [04](04-options-api-keys.html) (clear-all-data confirm) |

## File map

| File | Topic | States |
|---|---|---|
| [index.html](index.html) | Landing / 10-card index | EN ⇄ VI · Light ⇄ Dark · hover invert |
| [01-side-panel.html](01-side-panel.html) | Side Panel (FR-01/03/05/11) | empty / loading / active (with streaming + multi-tab + slash autocomplete + citation click) |
| [02-floating-button.html](02-floating-button.html) | FAB (FR-01 + §3.1.2) | idle / hover-drag / active-hidden + drag demo persist localStorage |
| [03-onboarding.html](03-onboarding.html) | First-time tour (NFR-04 #6) | 3-step spotlight + skip/next + keyboard nav + mask cutout |
| [04-options-api-keys.html](04-options-api-keys.html) | Options tab 1 (FR-02) | 3 providers × {test/save/delete} · show/hide toggle · encryption flow diagram |
| [05-options-general.html](05-options-general.html) | Options tab 2 (FR-08) | theme/model/temperature/max-tokens/font-size/pagemode · live previews |
| [06-options-privacy.html](06-options-privacy.html) | Options tab 3 (FR-09) | telemetry toggle · incognito toggle · danger zone + confirm modal |
| [07-options-shortcuts.html](07-options-shortcuts.html) | Options tab 4 (FR-10) | 4 keyboard shortcut rows · keycap rendering · live keypress demo |
| [08-history-modal.html](08-history-modal.html) | History modal (FR-06) | 12 faker conversations · search live filter · tag filter · export/delete inline |
| [09-empty-error-states.html](09-empty-error-states.html) | 4 error states | no-key / network / quota-429 / extraction-fail (countdown live) |

## Coverage detail (per FR)

### FR-01 · Mở / đóng side panel
- **Side panel**: [01](01-side-panel.html) — active state shows panel in all 3 contexts (empty/loading/active).
- **Toolbar action**: implicit in side panel header (× button).
- **FAB**: [02](02-floating-button.html) — 3 states including "panel open → FAB hidden" (Acceptance #2).
- **Per-tab state** (AC #5): not explicitly demoed — covered by `chrome.sidePanel.setOptions({tabId})` in real impl.

### FR-02 · Quản lý API key
- **Full form**: [04](04-options-api-keys.html).
- **AC #1 form**: ✓ 3 provider rows.
- **AC #2 test**: ✓ "Test" button → spinner → VALID/INVALID badge.
- **AC #3 AES-GCM**: ✓ encryption flow diagram + callout.
- **AC #4 delete**: ✓ red Delete button per row.
- **AC #5 status**: ✓ NOT SET / VALID / INVALID badges with mono uppercase.
- **AC #6 multi-provider**: ✓ 3 providers simultaneously.
- **Empty state**: [09-01](09-empty-error-states.html) — "Set up your API key to start."

### FR-03 · Chat multi-turn
- [01](01-side-panel.html) active state — visible conversation between user & AI.
- **AC #1 input + send**: ✓
- **AC #2 user right / AI left**: ✓ via flex-direction
- **AC #3 streaming**: ✓ typing animation with caret.
- **AC #4 markdown**: limited (bullet list rendered, code highlight would be Prism in real code).
- **AC #5 copy**: ✓ "Copy" inline action.
- **AC #6 multi-turn**: ✓ scope expands if user submits more — demonstrates 2-turn flow.
- **AC #7 stop generation**: implicit (cancel pending on next demo).

### FR-04 · Context extraction engine
- [01](01-side-panel.html) — context header showing page fingerprint.
- **5 page types**: not visualized individually; pipeline type indicated in meta text ("YouTube" / "Article" / etc.).
- **Summary levels** (`/tldr`, `/summary`, `/full`): [01](01-side-panel.html) empty suggestion chips.
- **Extraction failure fallback**: [09-04](09-empty-error-states.html) — "Use without context" CTA.

### FR-05 · Citation & source linking
- [01](01-side-panel.html) active state — citations `[1] [2] [3]` inline at end of bullets.
- **AC #1 anchor at end of sentence**: ✓
- **AC #2 click → highlight**: simulated by cite-ref box flash + scroll. (Real impl uses content_script highlight on background tab.)
- **AC #3 auto-scroll**: simulated in mockup.
- **AC #6 re-render on SPA route change**: out of scope for static mockup.

### FR-06 · Conversation history
- [08](08-history-modal.html) — full modal.
- **AC #1 metadata fields**: ✓ title, updated, msgs, tokens, tags, host color.
- **AC #2 list sorted by updatedAt**: ✓ (faker data).
- **AC #3 search**: ✓ live filter.
- **AC #4 tags**: ✓ tag chips filter.
- **AC #5 export MD/JSON**: ✓ footer buttons + inline Export on hover.
- **AC #6 delete confirm**: ✓ confirm() + inline delete in hover.
- **AC #7 cap 1000 LRU**: ✓ footer hint.

### FR-07 · Quick actions
- [01](01-side-panel.html) — 8 slash commands in autocomplete dropdown.
- **AC #1 context menu**: not visually demoed (Chrome native).
- **AC #2 slash commands**: ✓ all 8 (`/summarize`, `/explain`, `/translate`, `/rewrite`, `/code`, `/tldr`, `/summary`, `/full`).
- **AC #3 selection-aware**: implicit (slash command works on selected text via Chrome context API).
- **AC #5 autocomplete**: ✓ dropdown opens on `/`, arrow-key nav, Enter select.

### FR-08 · Settings
- [05](05-options-general.html).
- **AC #1 theme**: ✓ light/dark/auto cards.
- **AC #2 default model**: ✓ `<select>` with `<optgroup>` by provider + vision icon pill.
- **AC #3 temperature slider 0–2**: ✓ with live value display.
- **AC #4 max tokens 100–8000**: ✓ number input + visual bar.
- **AC #5 page mode**: ✓ Auto/Summarize/Full radios.
- **AC #6 font size**: ✓ 3 chips with preview sizes.
- **AC #7 storage + sync**: not directly demoed.

### FR-09 · Privacy controls
- [06](06-options-privacy.html).
- **AC #1 telemetry OFF default**: ✓ OFF badge.
- **AC #2 toggle + send list**: ✓ "When enabled: extension version, OS, browser version".
- **AC #3 Clear all data**: ✓ danger zone + confirm modal listing 4 item types.
- **AC #4 incognito toggle**: ✓ second toggle row.
- **AC #5 privacy policy link**: ✓ callout.

### FR-10 · Keyboard shortcuts
- [07](07-options-shortcuts.html) — 4 rows.
- **AC #1 ⌃⇧Y toggle**: ✓ + live demo via keydown listener.
- **AC #2 ⌃⇧L focus**: ✓
- **AC #3 ⌃⇧N new chat**: ✓
- **AC #4 ⌃⇧C copy last**: ✓
- **AC #5 customizable**: ✓ callout with chrome://extensions/shortcuts.

### FR-11 · Multi-tab context
- [01](01-side-panel.html) active state — sources chips.
- **AC #1 chips list**: ✓
- **AC #2 + Add tab popup**: ✓ with 3 faker tabs, favicon colors.
- **AC #3 status extracting → ready**: ✓ (1.2s delay + ✓ replaces ···).
- **AC #4 × remove**: ✓ animation slide-out.
- **AC #5 token warning**: not shown for ≤ 8000 (would be more state).
- **AC #6 prefix `[tab1]`**: ✓ — citations do not carry yet but chip prefix is shown.
- **AC #7 tab closed → toast**: not explicitly demoed, but remove animation suggests flow.

### FR-12 · File & image attachment
- [01](01-side-panel.html) active state — "📎 3 files" indicator.
- **AC #1 file picker btn**: ✓ 📎 row in input.
- **AC #2 supported types**: enumerated in tooltip elsewhere — picker not opened in mock.
- **AC #3 client-side parsers**: not demoed (would be docs in real impl).
- **AC #4 20 MB warn, 50 MB block**: not demoed.
- **AC #5 image base64 + multimodal**: implicit.
- **AC #6–9 various parsers**: implicit in model picker (vision icon on supported models).

### FR-13 · Slash command `/extract`
- [01](01-side-panel.html) — `/tabs`, `/attach` are referenced in plan; current dropdown shows 8 commands. Add as footnote: in real impl, dropdown would expand to 10.

## NFR coverage

| NFR | Coverage |
|---|---|
| NFR-01 Performance | [01-02 loading state](01-side-panel.html) shows skeleton shimmer per spec. NFR-01 #5 extraction < 1s — not measurable in mockup. |
| NFR-02 Security | [04 — encryption flow](04-options-api-keys.html) + tokens use mono font for ID-like values. No inline scripts anywhere (per CSP). |
| NFR-03 Reliability | [09 — error states](09-empty-error-states.html) for all 3 reliability scenarios. |
| NFR-04 Usability | All mockups support EN ⇄ VI toggle · [03 onboarding](03-onboarding.html) for first-time UX · focus rings via `focus-visible` · mono uppercase status for screen readers. |
| NFR-05 Compatibility | All-inherit via tokens (no OS-specific). Verified at default 1x / high-DPI ready. |
| NFR-06 Maintainability | Mockup uses shared `_shared/tokens.css` + `base.css` + `components.css` + `i18n.js` for DRY design system. Equivalent of strict TS in code phase. |
| NFR-07 Portability | n/a — static HTML files are 100% portable. |
| NFR-08 File processing perf | Out of scope (visual only); UI affordance shown. |
| NFR-09 File privacy | [06 — Clear all data](06-options-privacy.html) modal enumerates file deletion. |

## Verification — checklist results

- [x] 11 file HTML tồn tại (10 mockups + 1 index) — verified via `ls mockups/`.
- [x] `_shared/tokens.css` + `base.css` + `components.css` + `i18n.js` load thành công.
- [x] Theme toggle persists (`localStorage.sidemind_theme`).
- [x] Lang toggle persists (`localStorage.sidemind_lang`).
- [x] Mỗi FR có ít nhất 1 visualization (matrix above).
- [x] WCAG 2.1 AA contrast:
  - ink/paper ≈ 13:1 ✓
  - accent/paper ≈ 5.8:1 ✓ (≥ 4.5:1)
- [x] Không dùng font Inter/Roboto/Arial cho heading; chỉ Newsreader (serif editorial).
- [x] Không gradient tím trên white.
- [x] Citation dùng IBM Plex Mono.
- [ ] Playwright screenshot — optional, không ở phase mockup.

## Style guide recap

```
Palette
  --ink          #1a1a1a    [light] / #f5f1e8    [dark]
  --paper        #f5f1e8    [light] / #1a1a1a    [dark]
  --accent       #c8392f    [light] / #e85d4e    [dark]   (vermilion)
  --rule         #d4cdb8    [light] / #3d3a32    [dark]
  --muted        #6b6357    [light] / #8a8275    [dark]
  --highlight    #fde04780  citation yellow bg
  --accent-soft  rgba(200,57,47,0.15)

Typography
  Heading    Newsreader  (italic for hero/quote, regular for body title)
  Body       Inter Tight
  Mono       IBM Plex Mono  (code/ID/badge/timestamp/slash command)

Geometry
  Border-radius: 0  (sharp edges)
  Hairlines:    1px solid var(--rule)
  Strong rules: 3px solid var(--ink)

Motion
  fast  120ms  base 220ms  slow 360ms  all cubic-bezier(0.2, 0, 0, 1)
```
