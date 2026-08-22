# Slackr - Design Spec v2

Target: 90+/100 (UX/IA 30 - Accessibility 25 - Artistry 25 - Interactivity 20).
Scope: 6 artboards, 1440x900 desktop, self-contained HTML.
Baseline: v1 scored 55/100. Every numbered critic finding is resolved and cross-referenced in section 8.

---

## 1. Direction

### 1.1 What stays (do not restart)

- **Editorial voice.** Instrument Serif display headline that states the answer as a sentence, Inter for everything else, uppercase tracked eyebrows, hairline rules, generous white, sparklines as the recurring data motif.
- **Indigo accent family**, evolved one step darker for contrast (see 1.2).
- **Left sidebar, 260px, 5 nav items**: Projects, Reports, Members, Connections, Settings.
- **One primary question per screen**, answered in the top third.
- **Interpretation first, raw numbers second and collapsed.** All three disclosures stay, closed by default.
- The IA of all six screens: Projects list -> New Project wizard -> Members -> Project Dashboard -> Contribution Report -> Member Detail.

### 1.2 What deliberately changes

| Change | Reason |
|---|---|
| `#5b4fe5` demoted from "everything" to **data fill only**; `#4b3fd6` becomes brand/link/nav-active | 5.68:1 fails AA for 13px UI text in several places; one hue doing five jobs reads as a system with no hierarchy (Long-tail finding) |
| Every fake control becomes a real one | Fix 1, 2, 9 |
| Bar chart becomes a real `<table>` with a linked row per member | Fix 3, 9, and the Report -> Member Detail route |
| 11 type sizes -> 6, 12 greys -> 5, 10px type deleted | Fix 7 |
| Content column scrolls; the 900px frame no longer clips | Fix 12 |
| Placeholder logo and blank avatars get real marks and initials | Long-tail finding |
| Every stated ratio, median and multiple recomputed from the source data | Fix 6 |
| **Google Meet is connected for COMP30022.** All three sources collect; the Dashboard's readiness gap becomes the unmatched GitHub account | The v1 artboards showed Meet disconnected while publishing meeting counts on two other screens. The shares only reconcile with meetings in the denominator (103 events), so the honest repair is to connect the source, not to delete the data. The "source not connected" state is kept in the system and demonstrated on SWEN30006. See 7.7 and 7.8 |

### 1.3 Explicitly NOT changing

Screen count, screen order, the sidebar, the "answer as a sentence" headline pattern, the serif/sans pairing, the three-bucket Projects idea, the two-step New Project wizard, the summary-panel-beside-the-form layout, the ranked-bar Report, the paired-bar Member Detail, or the member's own note as a quote.

---

## 2. Design tokens

All ratios below are computed with the WCAG 2.x relative-luminance formula and are stated to 2 decimal places. **Requirement column** states the threshold that value must clear.

### 2.1 Surfaces

| Token | Hex | Use |
|---|---|---|
| `--surface-page` | `#f8f8fb` | app background behind cards |
| `--surface-card` | `#ffffff` | sidebar, cards, table body, inputs |
| `--surface-track` | `#e8e8ef` | bar-chart track interior, disabled control fill |
| `--tint-indigo` | `#eeecfd` | active nav pill, note/quote panel, icon tiles |
| `--tint-amber` | `#fbeed6` | attention icon tile, "Well below" badge |
| `--tint-green` | `#d8f0e2` | "In line" badge |
| `--tint-red` | `#fbe6e6` | form error strip |

`--surface-page` on `--surface-card` = 1.06:1 (decorative separation only, carried by the 1px rule token below, not by fill).

### 2.2 Ink (5 greys, exactly)

| Token | Hex | On `#ffffff` | On `#f8f8fb` | On `#eeecfd` | On `#e8e8ef` | Requirement | Use |
|---|---|---|---|---|---|---|---|
| `--ink-900` | `#16161a` | **18.04** | **17.02** | 15.51 | 14.80 | 4.5:1 text | headlines, body, table data, primary labels |
| `--ink-700` | `#41414c` | **10.07** | **9.50** | 8.66 | 8.26 | 4.5:1 text / 3:1 graphic | sparkline neutral stroke, even-split reference line, icon strokes on neutral cards |
| `--ink-500` | `#5d5d69` | **6.49** | **6.12** | 5.58 | 5.32 | 4.5:1 text | secondary text, eyebrows, table `<th>`, helper text, meta |
| `--ink-300` | `#7f7f8a` | **3.96** | **3.73** | 3.40 | **3.25** | 3:1 non-text (1.4.11) | **all control boundaries**: input, select, textarea, secondary-button and disclosure borders, table header rule, bar-track outline, disabled-button border and hatch |
| `--rule` | `#dcdce4` | 1.36 | 1.29 | 1.17 | 1.12 | none (decorative) | card outlines and hairline dividers only, never a control boundary |

> **Boundary rule.** If a border defines an interactive control or the edge of a data mark, it is `--ink-300` (>=3:1 on every surface it can land on; worst case 3.25:1 against the bar track). If it is a decorative container hairline whose removal loses no information, it is `--rule`. Never mix.

> **Pressed and active surfaces are derived, not declared,** so the grey count stays at five: nav-item and secondary-button pressed = `color-mix(in srgb, var(--surface-track) 90%, var(--ink-900) 10%)` = `#d3d3da`, with `--ink-900` on it at **12.12:1**. A pressed fill also darkens the control's own border to `--ink-700` (**6.76:1** on `#d3d3da`); leaving it at `--ink-300` would put the boundary at 2.66:1 and fail 1.4.11 in the pressed state alone. Any pressed state that cannot be derived this way must be added to the table above with its ratios, never inlined as a raw hex.

### 2.3 Indigo family

| Token | Hex | On `#ffffff` | On `#f8f8fb` | On `#eeecfd` | On `#e8e8ef` | Requirement | Use |
|---|---|---|---|---|---|---|---|
| `--indigo-700` | `#3f34b8` | **8.77** | **8.27** | 7.54 | - | 4.5:1 | link hover/active, quote text |
| `--indigo-600` | `#4b3fd6` | **7.04** | **6.65** | 6.06 | **5.78** | 4.5:1 text, 3:1 mark | brand mark, links, `aria-current` nav, primary button fill, **member bar fill**, median outline |
| `--indigo-800` | `#362c9c` | **10.51** | **9.92** | 9.04 | 8.62 | 4.5:1 | pressed state of the primary button; white text on it = **10.51:1** |
| `--indigo-focus` | `#2a21a8` | **11.16** | **10.53** | 9.59 | - | 3:1 focus ring | the global focus ring |
| `--indigo-on-fill` | `#ffffff` | on `#4b3fd6` = **7.04** | - | - | - | 4.5:1 | text on primary button |

`--indigo-600` on `--surface-track` = **5.78:1**, so a filled bar is legible against its own track (Fix 8).
`--indigo-focus` on `--surface-card` = 11.16:1 and on `--surface-page` = 10.53:1 (Fix 2 asked for >=3:1 on both).

### 2.4 Status colours

| Token | Hex | On `#ffffff` | On its tint | Requirement | Use |
|---|---|---|---|---|---|
| `--amber-800` | `#7a4a00` | **7.48** | on `#fbeed6` = **6.52** | 4.5:1 text, 3:1 icon | attention text, warning icon stroke, **Kevin's bar fill**, declining sparkline |
| `--green-800` | `#146b3a` | **6.57** | on `#d8f0e2` = **5.47** | 4.5:1 text, 3:1 icon | "In line" badge text, check icon stroke |
| `--red-700` | `#b3261e` | **6.54** | on `#fbe6e6` = **5.47** | 4.5:1 text, 3:1 border | form error text, invalid-field border |

`--amber-800` on `--surface-track` = **6.13:1** (Kevin's bar against its track).
All three replace the failing v1 values `#d08700` (2.94), `#1e8a4c` (4.38), `#e0b872` (1.86).

### 2.5 Deleted tokens

`#9a9aa4`, `#c9c9d2`, `#c4c4cd`, `#d4d4dc`, `#c7c4f4`, `#a49df0`, `#a1a1ad`, `#ececf2`, `#e5e5ea`, `#f0dcbb`, `#f1f1f4`, `#d08700`, `#1e8a4c`, `#e0b872`, `#ddf5e5`, `#fdf0dc`, `#9a5b00`, `#6b6b76`, `#18181b`, `#f1f0fe`, `#453ac2`, `#5b4fe5`, plus three hexes that appeared in the v2 draft and are now superseded: `#85858f` (-> `--ink-300` `#7f7f8a`), `#372ea0` (-> `--indigo-800` `#362c9c`) and `#dedee6` (-> the derived `color-mix()` pressed value). Any of these appearing in the implementation is a bug.

### 2.6 Type scale (6 sizes, exactly)

| Token | px / line-height | Family, weight | Tracking | Use |
|---|---|---|---|---|
| `--t-display` | 42 / 1.08 | Instrument Serif 400 | -0.005em | the one `<h1>` per screen |
| `--t-quote` | 24 / 1.35 | Instrument Serif 400 **italic** | 0 | **the member's own note, and nothing else** |
| `--t-stat` | 24 / 1.2 | Inter 600, `font-variant-numeric: tabular-nums` | -0.02em | every stat-tile value (Dashboard and Member Detail) |
| `--t-subhead` | 20 / 1.3 | Inter 600 | -0.01em | a card-level `<h2>`, and dialog `<h2>` |
| `--t-section` | 16 / 1.35 | Inter 600 | -0.01em | every `<h3>`, project-card titles, the member name in a bar row |
| `--t-body` | 14 / 1.55 | Inter 400; **500** for emphasis; **600** for button, link and back-link labels | 0 | all running text: decks, helper text, table cells, input text, checklist labels, meta lines, tick labels, consequence lines |
| `--t-eyebrow` | 11 / 1.3 | Inter 600 | 0.06em, uppercase | eyebrows, group `<h2>` labels, `<th>` labels, badge text, step labels, trend words |

Six distinct sizes: **42, 24, 20, 16, 14, 11**. `--t-quote` and `--t-stat` share 24px but never appear in the same block.

**Why six and not seven.** The v2 draft ran 16 / 14 / 13 / 11: four sizes inside a 5px band, of which 14 vs 13 is a distinction almost no reader perceives. The former `--t-meta` (13px) is **merged into `--t-body`** at 14px; where a meta line needs to recede it does so with `--ink-500` and weight 400, which is a channel readers actually resolve. That merge pays for `--t-subhead`, so the ramp gains a bridge at the top without gaining a size overall.

**Rules.**
- No size below 11px anywhere (deletes the three 10px strings, Fix 7 and 10).
- **Serif appears in exactly two places: `--t-display` and `--t-quote`.** It never carries a number, never labels anything, and never takes `tabular-nums`, because Instrument Serif italic has no tabular figures. Every numeric display uses `--t-stat`.
- `--t-subhead` at 20px bridges the 42 -> 16 gap, which is too wide to read as one ramp.
- Numerals in tables, bars and stat tiles use `font-variant-numeric: tabular-nums`.
- Every stat tile in a group renders at the same size. A tile whose value is a word rather than a number still uses `--t-stat`; it is never stepped down.

**The `<h2>` rendering rule (heading level tracks structure; size tracks the job the text does).**

| Kind of `<h2>` | Token | Screens |
|---|---|---|
| **Group label**: an `<h2>` that labels a *set* of sibling cards and is not the title of any one of them | `--t-eyebrow` 11px uppercase | Screen 1 only (`Needs attention`, `Collecting normally`, `Too early to compare`) |
| **Card title**: an `<h2>` that titles a *single* card or region | `--t-subhead` 20px | Screens 2, 3, 4, 5, 6 (`Project details`, `What you're creating`, `GitHub - a-zhang-uni`, `Linked members`, `What the report needs`, `What has been collected`, `Before you rely on this`, `Share of recorded activity`, `Kevin compared with the group median`, `Kevin's own note`) |

On screen 1 this makes the `<h2>` visually smaller than the `<h3>` beneath it. That is deliberate and is the only place it occurs: the group label is a signpost over three cards, while the `<h3>` is the name of a thing the reader can open. Inverting them would make three bucket labels compete with three project names for the same screen, which is the defect the buckets exist to remove. Heading *level* still tracks document structure, so heading navigation is unaffected.

### 2.7 Spacing, radii, borders, motion

- **Spacing scale (7 steps):** `4, 8, 12, 16, 24, 32, 48`. No other values.
- **One section gap:** every top-level block inside the content column is separated by **24px** (`gap: 24px` on the column flex). Not 20, not 28.
- **One header rule:** the page header is `display: grid; grid-template-columns: 1fr auto; align-items: end; column-gap: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--rule);`. The action cluster is the second grid cell and is aligned by `align-items: end` alone. **No `padding-top` or `margin-top` on header buttons on any screen** (Fix 7).
- **Radii:** `--r-control: 8px` (buttons, inputs, selects, badges-with-square-ends), `--r-tile: 12px` (icon tiles, stat tiles), `--r-card: 16px` (cards), `--r-pill: 999px` (bars, badges, nav pill, avatars).
- **Borders:** 1px. Control boundary `--ink-300`; decorative hairline `--rule`; invalid control `--red-700` at 1.5px.
- **Focus ring (global, single definition):**
  ```
  :focus-visible {
    outline: 2px solid #2a21a8;
    outline-offset: 2px;
    border-radius: inherit;
  }
  ```
  Ratio 11.16:1 on card white, 10.53:1 on page grey. `outline-offset: 2px` guarantees the ring lands on the surface, not on the primary button fill, so the >=3:1 requirement is measured against the surface in every case. Add `box-shadow: 0 0 0 2px #ffffff` on controls sitting on `--surface-page` so the ring never touches a neighbouring border. Never use `outline: none` without a replacement.
- **Motion:** 120ms `ease-out` on background/border/colour hover transitions; 160ms on disclosure height and chevron rotation. All wrapped in `@media (prefers-reduced-motion: reduce) { transition: none; animation: none; }`.
- **Shadow:** exactly one, `0 1px 2px rgba(22,22,26,.05)`, on hovered cards and open dropdowns. Nowhere else.

### 2.8 Iconography and brand marks (Long-tail fix)

- **Logo:** 32x32, `--r-tile`, `--indigo-600` fill, containing a white 18x18 mark of three stacked bars of decreasing length with a dot on the longest (a contribution bar chart, not a generic hamburger). `<a href="/" aria-label="Slackr home">`.
- **Project mark:** the generic three-line "list" icon is replaced by a **course-code monogram tile**: 44x44, `--r-tile`, `--tint-indigo` fill, containing the course prefix in `--t-eyebrow` `--indigo-600` (`COMP`, `INFO`, `SWEN`). Attention-state tile swaps to `--tint-amber` + `--amber-800` triangle icon.
- **Avatars:** 32px circle, `--tint-indigo` fill, initials in `--t-eyebrow` `--indigo-600` (`AZ`, `BW`, `KL`, `SC`). Never an empty coloured disc (that reads as a loading skeleton).
- Icon strokes: 1.8px, `stroke-linecap/linejoin: round`, colour `--ink-700` neutral / `--amber-800` warning / `--green-800` done / `--indigo-600` brand.

---

## 3. Component specs

Every component names the exact element and lists all required states. A state that is not listed is not permitted to look different.

### 3.1 Sidebar nav item

- **Element:** `<nav aria-label="Main"> <ul> <li> <a href="/projects" class="nav-item"> ... </a>`
- Five `<a>`, never `<div>` (Fix 2). Current page carries `aria-current="page"`.
- **Geometry:** height 36px, `padding: 0 12px`, `--r-control`, `gap: 12px`, `--t-body` weight 500. Icon 18x18 leading (replaces the v1 6px status dot, which carried no meaning and failed contrast).
- **States:**

| State | Spec |
|---|---|
| default | text `--ink-500`, icon `--ink-500`, transparent bg |
| hover | bg `--surface-track`, text `--ink-900` |
| active (pressed) | bg `color-mix(in srgb, var(--surface-track) 90%, var(--ink-900) 10%)` (= `#d3d3da`), no transform; `--ink-900` label on it = 12.12:1 |
| focus-visible | global ring, no bg change |
| current (`aria-current="page"`) | bg `--tint-indigo`, text + icon `--indigo-600` (6.06:1 on tint), weight 600, plus a 3px `--indigo-600` bar inset-left (so "current" is not colour-only) |
| disabled | not used in nav |

- Sidebar footer: avatar + name (`--t-body` 600 `--ink-900`) + email (`--t-body` `--ink-500`, 6.49:1). Wrapped in `<a href="/settings/account">` so it is reachable.

### 3.2 Buttons

**Element:** `<button type="button|submit">`. Never a `<div>`, never an `<a>` for an action.
Geometry: height 36px (primary/secondary), 32px (small/disclosure), `padding: 0 16px` (18px if it carries a leading icon), `--r-control`, `--t-body` weight 600, `gap: 8px`.

| Variant | default | hover | active | focus-visible | disabled | loading |
|---|---|---|---|---|---|---|
| **Primary** | bg `--indigo-600`, text `#ffffff` (7.04:1), no border | bg `--indigo-700` (8.77:1 with white text) | bg `--indigo-800` `#362c9c` (10.51:1 with white text), `transform: translateY(1px)` | global ring | see the disabled rule below | label replaced by `<span class="spinner" aria-hidden="true">` + unchanged text, `aria-busy="true"`, width locked, pointer-events none |
| **Secondary** | bg `#ffffff`, 1px `--ink-300` (3.96:1), text `--ink-900` | bg `--surface-page`, border `--ink-700` | bg `color-mix(in srgb, var(--surface-track) 90%, var(--ink-900) 10%)` (= `#d3d3da`), **border switches to `--ink-700`** (6.76:1 on that fill), text `--ink-900` (12.12:1) | global ring | see the disabled rule below | as above |
| **Quiet / disclosure** | transparent bg, 1px `--ink-300`, text `--ink-500`, height 32px | bg `--surface-page`, text `--ink-900` | bg `--surface-track` | global ring | n/a | n/a |
| **Consequential** (only "Generate the report without those 6 commits", and "Generate the report without attendance" in the not-connected variant) | secondary shell, but label is followed by a `--t-body` `--ink-500` consequence line inside the button's labelled group, not inside the button | | | | | |

**Disabled rule (one definition, every variant, every screen).**
- **Never use the `disabled` attribute.** Use `aria-disabled="true"` plus a no-op click handler, so the control stays in the tab order and its reason stays reachable. This governs `Next` (New Project), `Match` (Members) and every other blocked control in this spec; where an earlier draft said "disabled", read this rule.
- Presentation: fill `--surface-track`, label `--ink-500` = **5.32:1 against that fill**, which passes 1.4.3 outright. No disabled-control exemption is claimed.
- The fill is only **1.22:1** against the white card, so disabled carries a **second channel**: a 1px `--ink-300` border (**3.96:1** against the card) plus a 45-degree 1.5px `--ink-300` hatch at 6px pitch across the fill (**3.25:1** against the fill). Disabled is distinguishable by texture as well as tone.
- `cursor: not-allowed`, and a `--t-body` `--ink-500` reason line adjacent to the control, wired with `aria-describedby`.

Max **3** buttons/links competing per screen (back link and disclosure toggles do not count as competing actions; they are navigation and progressive disclosure).

### 3.3 Link

- **Element:** `<a href>`. Colour `--indigo-600` (7.04:1), `text-decoration: underline`, `text-underline-offset: 2px`, `text-decoration-thickness: 1px`. **Always underlined** (Fix: v1 links had no underline, so colour was the only cue).
- hover: `--indigo-700`, thickness 2px. active: `--indigo-700`, no underline change. focus-visible: global ring, underline retained. visited: same as default.
- Back links are `<a>` with a leading 16px left-arrow icon, `--t-body` 500, underline on hover only (permitted because they sit alone on their line with an icon, i.e. not "in a block of text").

### 3.4 Card

- **Element:** `<section>` (with an `<h2>`) or `<article>` (list items). Never a bare `<div>` when it has a title.
- bg `--surface-card`, 1px `--rule`, `--r-card`, `padding: 24px`.
- **Attention variant:** border 1px `--amber-800` at 40% is NOT permitted; use solid 1px `--amber-800` on the left edge only (4px) plus 1px `--rule` on the other three edges. The 4px `--amber-800` edge is 7.48:1 (replaces `#f0dcbb` at 1.27:1, Fix 8). Status is also carried by the eyebrow text and the icon, never by the border alone.
- **Interactive card** (Projects list): the whole `<article>` is not clickable. A single `<a>` on the project title is the row's route; the card gets `:has(a:hover)` bg `--surface-page` + the one allowed shadow, and `:has(a:focus-visible)` shows the ring on the link only.

### 3.5 Table

- **Element:** `<table>` + `<caption>` + `<thead><tr><th scope="col">` + `<tbody><tr><th scope="row">|<td>` (Fix 9). No `<span>` grids anywhere.
- `width: 100%; border-collapse: collapse;`
- `<caption>`: `--t-eyebrow` `--ink-500`, `text-align: left`, `padding-bottom: 12px`. Visible, not hidden.
- `<th scope="col">`: `--t-eyebrow` `--ink-500` (6.49:1), `text-align: left`, `padding: 0 16px 10px 0`, `border-bottom: 1px solid var(--ink-300)` (3.96:1, this rule separates header from data so it is meaningful).
- `<td>`, `<th scope="row">`: `--t-body` `--ink-900`, `padding: 14px 16px 14px 0`, `border-bottom: 1px solid var(--rule)`; last row no border. Numeric cells `text-align: right; font-variant-numeric: tabular-nums;`.
- **Column widths are declared per table via `<colgroup>`** and never `repeat(n, 1fr)` (Fix: Members wasted ~40% of the width).
- Row hover (only when the row contains a link): bg `--surface-page`.
- **Empty state:** `<tbody>` replaced by one `<tr><td colspan=n>` containing an icon + `--t-body` `--ink-500` sentence + one action.

### 3.6 Pill / badge

- **Element:** `<span class="badge">` inside the cell, plus the same words present in the row's accessible name. Never colour-only.
- Geometry: height 22px, `padding: 0 10px`, `--r-pill`, `--t-eyebrow`.
- **In line:** bg `--tint-green`, text `--green-800` (5.47:1), leading 12px check glyph.
- **Well below:** bg `--tint-amber`, text `--amber-800` (6.52:1), leading 12px triangle glyph.
- **Too early:** bg `--surface-track`, text `--ink-700` (8.26:1), leading 12px clock glyph.
- The glyph is `aria-hidden`; the word carries the meaning.

### 3.7 Bar chart row (Report) - the load-bearing component

Rendered as a **table row**, not a div stack.

```
<tr>
  <th scope="row"><a href="/report/kevin-liu">Kevin Liu</a></th>
  <td class="num">7%</td>
  <td class="bar"><div class="bar__track" aria-hidden="true">...</div></td>
  <td class="trend"><svg role="img" aria-label="Trend: declining across August">...</svg></td>
  <td><span class="badge badge--warn">Well below</span></td>
</tr>
```

- **Axis convention (Fix: bar length was wrong by 2.5x).** The track spans **0% to 40% of recorded activity**. This maximum is *disclosed on screen*, not implied: a labelled axis sits under the last row with ticks at `0 / 10 / 20 / 30 / 40%`, 1px `--ink-300` tick marks, `--t-eyebrow` `--ink-500` labels. The dashed even-split reference sits at 25% (62.5% of track width) and is labelled inline at the axis as `Even split 25%`.
- **Track:** height 14px, `--r-pill`, fill `--surface-track`, **1px `--ink-300` outline** (3.96:1 against the white card, so the mark's extent is perceivable - Fix 8 replaces `#ececf2` at 1.18:1).
- **The bar cell stays in the accessibility tree.** `aria-hidden` goes on the inner mark, never on the `<td>`: `<td class="bar"><div class="bar__track" aria-hidden="true">...</div></td>`. Hiding the whole cell while its `<th scope="col">` remains can desynchronise the column count in some screen readers. The cell's accessible name is empty; its header still counts.
- **Fill:** `--indigo-600` (5.78:1 against track) for "In line"; `--amber-800` (6.13:1 against track) for "Well below"; `--ink-700` 45-degree 3px hatch on `--surface-track` for "Too early / no data".
- **Even-split line:** 1px dashed `--ink-700` (8.26:1 against the track, replaces `#a1a1ad` at 2.56:1), extending 6px above and below the track, drawn once per row.
- **The whole row is a route** (Fix 3): `<th scope="row">` contains the only `<a>`; the `<tr>` gets `cursor: pointer` and a JS row-click that forwards to that link, but keyboard and screen-reader users use the real link. Row hover: bg `--surface-page`, the `<a>` underline thickens to 2px. Row focus-within: global ring drawn around the whole `<tr>` via `:focus-within` on the row.
- Rows are `<tbody>` sorted descending by share. Rank is not numbered (ranking students by number is a product decision we avoid); order plus bar length carries it.

### 3.8 Sparkline (Fix 5)

- **Element:** `<svg role="img" aria-labelledby="spark-kevin-t">` with a child `<title id="spark-kevin-t">` containing the full sentence, e.g. `Kevin Liu's weekly activity: declining, from 3 events in week 1 to 1 in week 4.` (It ends at 1, not 0: his last activity was 3 days ago, which falls inside week 4. A text alternative that contradicts an adjacent cell is worse than none.)
- 64x20 (in-row) or 90x26 (project card). `fill: none`, `stroke-width: 1.6`, round caps.
- **Colour is never the only channel.** Every sparkline carries (a) a `<title>`, (b) a visible `--t-eyebrow` direction word beside or beneath it (`Rising` / `Steady` / `Declining`), and (c) a 4px end-cap dot at the final point.
- Strokes, all >=3:1 on `#ffffff` and on `#f8f8fb`:
  - rising: `--indigo-600` (7.04 / 6.65)
  - steady: `--ink-700` (10.07 / 9.50)
  - declining: `--amber-800` (7.48 / 7.06)
- Legend key: the legend swatches are `<svg role="img" aria-label>`-free decorative marks; the legend itself is `<dl>` and each row of the chart carries its own text alternative, so no programmatic legend-to-mark link is needed (Fix: v1 legend had no link to the marks; this removes the dependency instead of patching it).

### 3.9 Disclosure (Fix 11)

```
<button type="button" class="btn--quiet" aria-expanded="false" aria-controls="raw-counts">
  <svg class="chev" aria-hidden="true" ...>  Show the raw counts
</button>
<div id="raw-counts" hidden> ... </div>
```

- `aria-expanded` toggles `false`/`true`. `aria-controls` points at the panel `id`. Panel uses the `hidden` attribute (not `display:none` via a class) so it is removed from the a11y tree when closed.
- **Chevron rotates 180 degrees when open** (`transform: rotate(180deg)`, 160ms) - v1 left it pointing down. Reduced-motion: instant.
- Label text swaps `Show` / `Hide`.
- Closed by default on all three screens. Opening does not move the disclosure button (panel expands below it).
- Focus stays on the button after toggling.

### 3.10 Form field (Fix 1)

```
<div class="field">
  <label for="project-name">Project name</label>
  <input id="project-name" name="projectName" type="text" required
         aria-describedby="project-name-help project-name-err"
         autocomplete="off">
  <p id="project-name-help" class="help">Students see this name when they join.</p>
  <p id="project-name-err" class="err" hidden>Enter a project name so you can find it later.</p>
</div>
```

- Real `<input>`, `<select>`, `<input type="date">`. Every `<label>` has `for`. Every field has an `id`, and `aria-describedby` listing help then error.
- Geometry: label `--t-body` 600 `--ink-900`, 8px gap, control height 40px, `padding: 0 12px`, `--r-control`, 1px `--ink-300` (3.96:1), text `--t-body` `--ink-900`, help `--t-body` `--ink-500` (6.49:1) at 6px gap.

| State | Spec |
|---|---|
| default | as above |
| hover | border `--ink-700` |
| focus-visible | global ring (2px `--indigo-focus`, offset 2px), border stays `--ink-300` |
| filled | identical to default (no colour change) |
| required | `required` attribute + the word `Required` in `--t-eyebrow` `--ink-500` to the right of the label. No red asterisk. |
| optional | `Optional` in `--t-eyebrow` `--ink-500` |
| invalid | `aria-invalid="true"`, border 1.5px `--red-700` (6.54:1), error `<p>` unhidden with a 14px alert glyph, text `--red-700` (6.54:1), `--t-body`; on submit, focus moves to the first invalid field and a summary `role="alert"` strip appears at the top of the form with bg `--tint-red` and text `--red-700` (5.47:1) |
| disabled | `aria-disabled="true"` and `readonly` (never the `disabled` attribute, per 3.2), bg `--surface-track`, text `--ink-500` (**5.32:1**), 1px `--ink-300` border (**3.96:1**) plus the 45-degree `--ink-300` hatch, `cursor: not-allowed`, and a `--t-body` reason line wired with `aria-describedby` |
| loading (async select) | `aria-busy="true"` on the control's wrapper, 14px spinner in the trailing slot, control kept enabled but `readonly` |

- `<select>` keeps the native control with a custom chevron via `appearance: none` + background SVG. Chevron `--ink-500`.
- Placeholder text is never a substitute for a label; where a `<select>` has no value the first `<option value="" disabled selected>` reads `Choose a member`.

### 3.11 Stepper (New Project)

```
<nav aria-label="Progress">
  <p class="step-count">Step 1 of 2</p>
  <ol>
    <li aria-current="step"><span class="dot"></span>The project</li>
    <li><span class="dot"></span>Connect the tools</li>
  </ol>
</nav>
```

- **Visible `Step 1 of 2` text** in `--t-eyebrow` `--ink-500` (Fix: v1 had neither text nor `aria-current`).
- Current step: `aria-current="step"`, text `--indigo-600` weight 600, dot 8px filled `--indigo-600` with a 2px `--indigo-600` ring (so the current step differs by shape as well as colour).
- Upcoming step: text `--ink-500`, dot 8px hollow, 1.5px `--ink-300` border (3.96:1, replaces the 6px `#d4d4dc` dot at 1.47:1).
- Completed step: dot filled `--indigo-600` with a white check; text `--ink-900`; the `<li>` becomes an `<a>` back to that step.
- Connector: 32x1px `--ink-300`.

### 3.12 Checklist row (Dashboard, New Project summary)

- **Element:** `<ul>` of `<li>`, each `<li>` a 3-column grid `24px | 220px | 1fr`.
- Icon 20x20 `role="img"` with `<title>`: done = check in `--green-800` inside a 20px `--tint-green` circle; blocked = exclamation in `--amber-800` inside a 20px `--tint-amber` circle; pending = hollow circle 1.5px `--ink-300`.
- The status word is also written in text in the third column. Never icon-only.

---

### 3.13 Dialog

Used twice: `Discard this draft?` (New Project) and `Ask Kevin for context` (Member Detail). One spec covers both.

- **Element:** native `<dialog>` opened with `showModal()`. Never a div overlay.
- `aria-labelledby` points at the dialog's own `<h2>`; `aria-describedby` points at its body `<p>` where one exists.
- **Geometry:** `max-width: 480px; width: calc(100vw - 64px); padding: 24px; border: 1px solid var(--rule); border-radius: var(--r-card); background: var(--surface-card);` centred.
- **Backdrop:** `::backdrop { background: rgba(22, 22, 26, .45); }`
- **Focus:** on open, focus moves to the first interactive control (the `Discard` button; the `<textarea>` in the Ask dialog, caret at the end of the prefilled text). On close by **any** route (primary action, secondary action, close button, `Esc`) focus returns to the element that opened it. **This applies to both dialogs.**
- **Neither dialog light-dismisses.** Backdrop click is **inert**: it is not a close route, and `<dialog>` does not provide one natively, so none is added. The close routes are exactly three: the two action buttons, `Esc`, and the close button. `Esc` and the close button both map to the **non-destructive** choice (`Keep editing`, `Cancel`), so there is no route by which a stray click or key discards work.
- **Inertness:** `showModal()` makes the rest of the page inert; additionally set `overflow: hidden` on the document while open and restore the previous scroll position on close.
- **Layout:** `<h2>` `--t-subhead`, body `--t-body` `--ink-500`, action row bottom-right with 12px gap and the primary last. A 32x32 close `<button aria-label="Close">` sits top-right.
- Reduced-motion: opacity only, no scale-in.

### 3.14 Toast

- **Element:** `<div role="status" aria-live="polite">` in a fixed region at **bottom-left, 24px from both edges**, above cards in the stacking order.
- Fill `--ink-900`, text `#ffffff` (**18.04:1**), `--r-control`, `padding: 12px 16px`, `--t-body`, `max-width: 360px`.
- **Auto-dismisses after 6s**, paused while hovered or while focus is inside. A 24x24 `<button aria-label="Dismiss">` with a white glyph sits at the right; its focus ring is `2px #ffffff` at 2px offset (**18.04:1** against the toast fill), because `--indigo-focus` would not read on `--ink-900`.
- **Undo.** A toast that reports a completed, reversible change carries a trailing `Undo` `<button>` in white with an underline (18.04:1 on the toast fill), and its dismiss timer extends from 6s to **10s**. Two actions use it:
  - **Match accepted:** `a-zhang-uni is now linked to Alice Zhang. 6 commits will be counted for her.` + `Undo`. Undo restores the unmatched-account card, returns focus to its `<select>`, and announces `Match undone.` via `role="status"`.
  - **Draft discarded:** confirming `Discard` in the New Project dialog navigates back to Projects and raises `Draft discarded.` + `Undo`. Undo reopens New Project with the three field values restored and focus on `Project name`. The dialog confirms the intent; the toast covers the misclick, and a destructive action should not rest on the confirmation alone.
  Once the toast is dismissed or expires, the change is final and the `Undo` route is gone. `Change` on a roster row is not undoable this way because its own `Cancel` already restores the previous value before anything is written.
- Maximum 2 stacked; a third replaces the oldest. Never used for errors, which use `role="alert"` in place.
- Reduced-motion: fade only, no slide.

### 3.15 Skeleton

- Base `--surface-track`, highlight `#f2f2f7`, 1.2s linear sweep. Both are decorative: the skeleton sits inside a container carrying `aria-busy="true"` and a visually hidden live-region sentence, so no contrast minimum applies to the sweep.
- Skeleton blocks mirror the real content's box (row height, tile size), never a generic grey slab.
- `@media (prefers-reduced-motion: reduce)`: static `--surface-track`, no sweep.

### 3.16 Select placeholder

- `option[value=""] { color: var(--ink-500); }` and, while the select's value is empty, `.select--empty { color: var(--ink-500); }` on the control itself. **6.49:1** on white. The native UA default for a placeholder option is around 2.5:1 and is explicitly overridden.
- The placeholder `<option value="" disabled selected>` is never the only label; a real `<label for>` is always present.

## 4. Global layout

```
+--------------------------------------------------------------------------+ 1440
| SIDEBAR 260 |  CONTENT COLUMN  (flex:1, padding:32, gap:24, min-width:0)  |
| bg #ffffff  |  bg #f8f8fb                                                 |
| border-right|  overflow-y: auto;  max-height: 900px                       |
|  1px --rule |  scroll-padding-block-start: 24px                           |
+--------------------------------------------------------------------------+ 900
```

- Root: `display:flex; width:1440px; height:900px;` **`overflow: hidden` moves off the root and onto nothing; the content column gets `overflow-y: auto`** (Fix 12). Sidebar never scrolls.
- Content column max text measure: 760px for the deck paragraph, 880px for body prose.
- Skip link: first focusable element in the DOM, `<a href="#main" class="skip">Skip to main content</a>`, visually hidden until `:focus-visible`, then pinned top-left 16/16 with a white bg, 1px `--ink-300` and the global ring.
- `<main id="main" tabindex="-1">` wraps the content column.
- Page header pattern (identical on all 6 screens, Fix 7):

```
grid 1fr auto, align-items:end, column-gap 32, padding-bottom 24, border-bottom 1px --rule
  col 1:  [back link]      (screens 2,4,5,6)
          [eyebrow line]   (screens 4,5,6)
          [h1  --t-display]
          [deck --t-body --ink-500, max 760px]
  col 2:  [action cluster, gap 12, align-self:end]
```

### 4.1 Reflow and text spacing (1.4.10, 1.4.12)

The 1440x900 frame is the artboard, not the layout contract. **One breakpoint: 900px CSS width.**

Below 900px:
- The sidebar collapses to a **56px icon rail**: the 18px icon only, the label moved into the `<a>`'s `aria-label` and a native `title`. `aria-current="page"` and the 3px indigo current-bar are retained, so the current-page cue survives the collapse.
- The page-header grid drops to **one column**; the action cluster moves below the deck with a 16px gap, keeping its left-to-right order.
- Content column padding goes 32px -> 16px.
- The Report table's `.bar` column and the tick row become **`display: none`**. No information is lost: share, trend word and standing badge are already separate cells. The `<caption>` gains `Bars are hidden at this width; each member's share is in the Share column.`
- The Member Detail paired-bar tables do the same, leaving the count and `% of median` columns.
- Nothing scrolls horizontally at 320px except the raw-count tables, which sit in an `overflow-x: auto` wrapper with `tabindex="0"` and an accessible name so the scroll region is keyboard-reachable.

**1.4.12 text spacing.** The page absorbs all four user overrides (line-height 1.5x font size, paragraph spacing 2x, letter-spacing 0.12em, word-spacing 0.16em) with no clipping and no overlap:
- No text container has a fixed `height`. Buttons, nav items, inputs and badges use `min-height` with vertical padding, never `height`.
- Fixed `flex: 0 0 <px>` label columns in bar rows become `minmax(<px>, auto)` grid tracks.
- `white-space: nowrap` is used only on numeric cells and tick labels, which are 1 to 6 characters.
- No `overflow: hidden` on any element containing text; the only clipping in the product is the skip link's `clip-path`.

---

## 5. Screen specs

Copy strings below are **final**. Implement them verbatim.

### 5.1 Screen 1 - Projects

**Question:** Which project needs me right now?

**Heading outline:** h1 -> h2 "Needs attention" / h2 "Collecting normally" / h2 "Too early to compare" (Fix: v1 had no h2 at all and card titles were `<span>`). Card titles are `<h3>` and each `<h3>` contains the card's only link.

```
+---------------------------------------------------------------+
| h1  One project needs you this week.                 [+ New Project]
| deck COMP30022 has an unmatched account and is due in two days.
|      INFO20003 is collecting normally, and SWEN30006 is too new
|      to compare.
+---------------------------------------------------------------+  <- 24px
| h2 NEEDS ATTENTION (--t-eyebrow --amber-800, 7.48:1)          |
| +-----------------------------------------------------------+ |
| |[!]| h3 <a> COMP30022 Final Project </a>                    | |
| | 4px amber left edge                                       | |
| |   | One GitHub account with 6 commits is matched to        | |
| |   | nobody, so the report would understate someone.        | |
| |   |                                    (--amber-800)       | |
| |   | 4 members - due in 2 days           (--ink-500)        | |
| |   |     [sparkline 90x26 + "Rising"] [Match it on Members] | |
| +-----------------------------------------------------------+ |
+---------------------------------------------------------------+  <- 24px
| h2 COLLECTING NORMALLY (--t-eyebrow --ink-500)                |
| +-----------------------------------------------------------+ |
| |[INFO]| h3 <a> INFO20003 Group Project </a>                 | |
| |      | Enough data to report on all 5 members.             | |
| |      |                                    (--green-800)    | |
| |      | 5 members - due 5 Oct 2025           (--ink-500)    | |
| |      | [sparkline + "Rising"]                              | |
| +-----------------------------------------------------------+ |
+---------------------------------------------------------------+  <- 24px
| h2 TOO EARLY TO COMPARE (--t-eyebrow --ink-500)               |
| +-----------------------------------------------------------+ |
| |[SWEN]| h3 <a> SWEN30006 Project 2 </a>                     | |
| |      | Started 3 days ago. GitHub is the only connected    | |
| |      | source, so document edits and attendance are not    | |
| |      | collected.                          (--ink-500)     | |
| |      | 3 members - due 15 Sep 2025                         | |
| |      | [hatched sparkline + "Not enough data"]             | |
| +-----------------------------------------------------------+ |
+---------------------------------------------------------------+
```

- **Third bucket added** (Fix: SWEN30006 was mis-bucketed; "too early to compare" is a third state, not "collecting normally").
- **SWEN30006 is the product's demonstration of the "source not connected" state** (see 5.4 for the reusable checklist-row variant and 7.8 for the rule that governs it). It has only GitHub connected, so it publishes no doc-edit or attendance figures anywhere.
- **One link per card** (Fix: two links to one destination). The trailing `Open project` link is **deleted**; the `<h3>` title is the only route, accessible name `COMP30022 Final Project`. The card shows hover through the existing `:has(a:hover)` rule (bg `--surface-page` plus the one allowed shadow) and `:has(a:focus-visible)` puts the ring on the link.
- **Competing actions = 2 buttons + 1 repeated nav link:** `New Project` (header primary), `Match it on Members` (attention-card primary), and the per-card title link. Within the max of 3.
- **One job, one destination, one label.** The action is written `Match it on Members` on all three screens that reference the unmatched account (this card, the Dashboard header primary, the Report precondition). It navigates to `/projects/comp30022/members` and moves focus to the unmatched-account `<h2>` there. Three labels for one destination was the same propagation defect this round exists to sweep, so the earlier `Match the account` and `Fix it on Members` wordings are retired.
- **Empty state** (no projects): the card region is replaced by a centred 320px block: the logo mark at 40% opacity, h2 `No projects yet.`, `--t-body --ink-500` `Create a project, connect GitHub or Google, and Slackr starts collecting the same day.`, one primary `New Project`.
- **Loading state:** three card-shaped skeletons per 3.15, container `aria-busy="true"` with a visually hidden `Loading projects.` live region.
- **Error state:** the card region is replaced by a `role="alert"` panel, `--tint-red` bg, h2 `We could not load your projects.`, `--t-body` `The connection to Slackr timed out. Your data is not affected.`, secondary button `Try again` (behaviour per 5.3's `Retry`).

### 5.2 Screen 2 - New Project

**Question:** What am I setting up, and what is still missing?

**Heading outline:** h1 "What are we tracking?" -> h2 "Project details" (the `<form>`'s `<h2>`, visually the card title) -> h2 "What you're creating" (summary panel).

```
[<- Back to Projects]
Step 1 of 2   (1) The project ---- (2) Connect the tools
h1 What are we tracking?
deck Two steps, not four. You'll invite the group with a link at
     the end, so you don't need anyone's details now.
------------------------------------------------------------ rule
+----------------------------- 1fr -----------+  +--- 380px ---+
| <form> h2 Project details                   |  | h2 WHAT YOU'RE|
|                                             |  |    CREATING   |
| Project name              Required          |  | [COMP] COMP30022|
| [ COMP30022 Final Project              ]    |  |        Final Project|
| Students see this name when they join.      |  |        COMP30022 IT|
|                                             |  |        Project -  |
| Course                    Required          |  |        due 30 Aug |
| [ COMP30022 IT Project              v ]     |  |  ------------------|
|                                             |  |  o No tools connected|
| Due date                  Required          |  |    yet (step 2)     |
| [ 30/08/2025                        ] 280px |  |  o Invite link is   |
| Reports cover today until this date.        |  |    created at the end|
|                                             |  |  ------------------|
| ------------------ rule ------------------  |  | Nothing is collected|
| [Next: connect the tools ->]  [Cancel]      |  | until you connect at|
| Cancel discards this draft.                 |  | least one tool. You |
+---------------------------------------------+  | can change any of   |
                                                 | this later.         |
                                                 +---------------------+
```

- **Real controls** (Fix 1): `<input id="project-name" required>`, `<select id="course" required>` with 6 `<option>`s, `<input type="date" id="due-date" required min="today">`. `<form novalidate>` with JS validation so error copy is ours.
- **Cancel added** (Fix: v1 had none): `<button type="button">Cancel</button>` secondary, with the consequence stated in `--t-body` `--ink-500` directly beneath the button pair: `Cancel discards this draft.` Clicking it opens a `<dialog>` with h2 `Discard this draft?`, body `The project name, course and due date will not be saved.`, buttons `Discard` (primary) and `Keep editing` (secondary), focus trapped, Esc = Keep editing.
- **Summary panel is live** (Fix: it was static text with no relationship to the form): the panel is `<div aria-live="polite" aria-atomic="false">`. The project-name, course and due-date lines mirror the field values on `input`/`change` and read `Not set yet` in `--ink-500` italic when empty. The two checklist items reference the step that will satisfy them (`step 2`, `at the end`), so the reader sees what the form still owes.
- **Competing actions = 3:** `Next`, `Cancel`, `Back to Projects`.
- **Validation state (required, Fix 3/4):** pressing `Next` with an empty name renders:
  - `role="alert"` strip at the top of the form card: bg `--tint-red`, 1px `--red-700`, text `--red-700` (5.47:1 on tint): `1 thing to fix before you continue.` followed by an `<a href="#project-name">Project name</a>`.
  - `aria-invalid="true"` + 1.5px `--red-700` border on the input, error `<p>` shown: `Enter a project name so you can find it later.`
  - Focus moves to `#project-name`.
- **Loading state:** `Next` in loading variant, label unchanged, `aria-busy="true"`; the Course select shows the async-loading variant while course codes fetch, with `<option>Loading courses...</option>`.
- **Blocked state:** `Next` carries `aria-disabled="true"` with a no-op handler (never the `disabled` attribute, per 3.2) until the three required fields are non-empty. It stays focusable; a `--t-body` `--ink-500` line beside it, referenced by `aria-describedby`, reads `Fill in all three fields to continue.` Pressing it while blocked moves focus to the first empty field rather than doing nothing silently.

### 5.3 Screen 3 - Members

**Question:** Will anyone's work be missed?

**Heading outline (Fix: v1 opened with an alert h1 and an all-clear h2 200px below):** h1 states the exception; the roster h2 is a neutral noun phrase and no longer competes.

```
[h1] One GitHub account isn't matched to anyone.        [Add member]
deck Work done under an unmatched account is left out of the report.
     The four members below are all linked.
------------------------------------------------------------ rule
+--------------------------------------------------------------+
| 4px amber left edge                                          |
| [!]  h2 GitHub - a-zhang-uni                                 |
|      6 commits in group3/final-project since 4 Aug, counted  |
|      for nobody.                              (--amber-800)  |
|                                                              |
|      <label for="match-1">Match to a member</label>          |
|      [ Choose a member                     v ]  [ Match ]    |
|                          (aria-disabled until a member chosen)|
+--------------------------------------------------------------+
+--------------------------------------------------------------+
| h2 Linked members                                            |
| <table>                                                      |
| <caption>All 4 members in COMP30022 are linked to both       |
|          GitHub and Google.</caption>                        |
|  MEMBER (30%) | GITHUB (22%) | GOOGLE (34%) | (14%)          |
|  Alice Zhang  | alice-dev    | alice.zhang@...| Change        |
|  Bob Wang     | bobcode      | bob.wang@...   | Change        |
|  Kevin Liu    | kevinliu97   | kevin.liu@...  | Change        |
|  Sheldon Chen | sheldonchen  | sheldon.chen@..| Change        |
+--------------------------------------------------------------+
```

- **Real `<select id="match-1">`** with a real `<label for="match-1">` (Fix 1). Options: `Choose a member` (`value=""`, disabled, selected), then the four members, then `Not a member of this project`.
- **`Match` starts blocked** (Fix: v1 enabled a primary against an unmade selection). Per the disabled rule in 3.2 it uses **`aria-disabled="true"` with a no-op handler, never the `disabled` attribute**, so it stays focusable and its reason stays reachable. Helper text `Choose a member first.` in `--t-body` `--ink-500` sits beside it and is referenced by `aria-describedby`. It unblocks on the select's `change` event.
- **Match success:** the attention card is replaced in place by the empty-state panel below, the matched account appears in the roster row for that member, and a toast (3.14) reads `a-zhang-uni is now linked to Alice Zhang. 6 commits will be counted for her.` with a trailing `Undo` and a 10s timer **Match failure:** the card keeps its state, `aria-invalid="true"` on the select, and a `role="alert"` line reads `That GitHub account is already linked to Kevin Liu. Unlink it there first.`
- **Real `<table>` with `<colgroup>` at 30% / 22% / 34% / 14%** (Fix 9 and the wasted-width finding). `<th scope="col">` on all four; the fourth is `<th scope="col"><span class="sr-only">Actions</span></th>`. `<th scope="row">` holds the member name.
- The green all-clear check moves out of the h2 and into the `<caption>` sentence, so the reader gets the exception first and the reassurance second, in reading order, with no reconciliation.
- **Empty state (the most common state, Fix 4):** when nothing is unmatched, the attention card is replaced by:
  - h1 becomes `Every account is matched.`
  - deck becomes `Nothing collected in COMP30022 is being left out. Slackr re-checks each time it collects.`
  - a 96px-tall panel: 24px `--green-800` check in a `--tint-green` circle, `--t-section` `No unmatched accounts`, `--t-body` `--ink-500` `Last checked 28 Aug 2025, 4:10pm.` and a quiet button `Check again`.
  - The `Linked members` table is unchanged and becomes the primary content.
- **Loading:** table body replaced by 4 skeleton rows; `aria-busy="true"`.
- **Error:** `role="alert"` strip above the table, `--tint-red`: `We could not reach GitHub, so matches may be out of date.` + `Retry` quiet button.
- **Competing actions = 3:** `Add member`, `Match`, per-row `Change`.

**Destination and outcome for every secondary action on this screen** (Fix: these were labels with no flow).

| Control | Where it goes | Success looks like | A second failure looks like |
|---|---|---|---|
| `Change` (roster row) | Nowhere. The row switches to an inline edit state: the GitHub and Google cells become `<select>`s prefilled with the current accounts, plus a `Save` / `Cancel` pair in the fourth cell. Focus moves to the first select. | The row returns to read-only, the changed cell briefly gets a `--tint-indigo` background for 1.2s, and a toast reads `Bob Wang is now linked to bobcode.` | The row stays in edit state, `aria-invalid="true"` on the offending select, inline error `That GitHub account is already linked to Kevin Liu.` `Cancel` always restores the original values. |
| `Add member` | `/projects/comp30022/members/invite`: one `<input type="email" required>` plus a read-only invite link with a `Copy link` button. | Returns to Members; the new person appears as a roster row with a `Pending` badge in the fourth cell; toast reads `Invite sent to nina@unitech.edu.au.` | `role="alert"` in the invite panel: `We could not send that invite. Copy the link and send it yourself.` with the link field preselected and `Copy link` focused. |
| `Check again` (empty state) | Nowhere. Re-runs the match check in place. The button enters the loading variant, the panel gets `aria-busy="true"`. | Timestamp updates, `role="status"` announces `Checked at 4:12pm. No unmatched accounts.` | The panel switches to the error variant: `We could not reach GitHub at 4:12pm. The last successful check was 28 Aug.` `Check again` stays available. |
| `Retry` (error strip) | Nowhere. Re-runs only the failed fetch. Focus stays on the button, which enters the loading variant. | The strip is removed and `role="status"` announces `Members are up to date.` | The strip text becomes `Still not reachable. This has failed twice; try again in a few minutes.` and `Retry` takes `aria-disabled="true"` for 60s with a visible countdown in its reason line. |


### 5.4 Screen 4 - Project Dashboard

**Question:** Is this ready to report?

**Heading outline:** h1 -> h2 "What the report needs" -> h2 "What has been collected" (inside the disclosure panel).

**Readiness verdict, and the division of labour with Members.** All three sources are connected and collecting for COMP30022. One check is open: the unmatched GitHub account.

This screen **references** that gap; it does not restate it. **Members owns the fix** and states it in full as its own `<h1>`, with the matching control inline. The Dashboard's job is the verdict over all five checks, so its `<h1>` counts rather than describes, its deck says how many pass, and the specifics live in the one checklist row and nowhere else. Two screens returning the same sentence as their primary answer is exactly the defect that retired the v1 Dashboard's members table; see the rule in 7.9.

```
[<- Back to Projects]
COMP30022 FINAL PROJECT - DUE 30 AUG 2025             [Match it on Members]
h1 One thing to settle before you report.
deck Four of the five checks below pass. The fifth is open, and it
     is the only reason this report would understate someone.
------------------------------------------------------------ rule
+--------------------------------------------------------------+
| h2 What the report needs                                     |
| (v) All members linked   Alice, Bob, Kevin and Sheldon       |
| (!) Matched accounts     1 GitHub account, a-zhang-uni, is   |
|                          matched to nobody. Its 6 commits    |
|                          are left out.                       |
| (v) GitHub               group3/final-project - 49 commits   |
| (v) Google Docs          Final Project Report - 40 edits     |
| (v) Google Meet          Weekly stand-up calendar -          |
|                          4 meetings, 14 attendances          |
+--------------------------------------------------------------+
| [ Generate the report without those 6 commits ]              |
| The 6 commits stay out of every member's total. You can match|
| the account later and regenerate.                            |
+--------------------------------------------------------------+
| [v Show what has been collected]   (closed by default)        |
|   h2 What has been collected                                 |
|   [ 49  Commits ] [ 40  Doc edits ] [ 14  Meeting attendances ]
|   [ 28 Aug  Last collected ]                                 |
|   49 + 40 + 14 = 103 recorded events. (--t-body --ink-500)   |
+--------------------------------------------------------------+
```

- **One control per job** (Fix: v1 had a header button and a checklist link for the same task). The checklist rows are **status text only, with no links**. The single primary is `Match it on Members`, which names its destination rather than its verb, because the fix is performed on Members and not here, and it is the identical label used on the Projects card and the Report precondition. It goes to `/projects/comp30022/members`, the same destination as the Projects card action and the Report precondition action.
- **The consequential choice states its consequence** (Fix): `Generate the report without those 6 commits`, secondary variant, followed by a `--t-body` `--ink-500` consequence line wired with `aria-describedby`. It sits in its own card so it is not mistaken for an ordinary header action. Activating it goes to `/projects/comp30022/report` and the Report keeps its `Before you rely on this` precondition card, so the choice is never silently forgotten.
- **Stat tiles** use `--t-stat` (24px Inter 600, tabular) for the value and `--t-body --ink-500` for the label. **All four tiles are the same size**; none is stepped down. `--r-tile`, 1px `--rule`, grid `repeat(4, 1fr)`, 16px gap.
- The tile total line makes the share denominator auditable on the same screen that reports collection (see 7.7).
- **Competing actions = 3:** `Match it on Members`, `Generate the report without those 6 commits`, `Back to Projects`.
- **Ready variant:** h1 `Ready to report.`, deck `All five checks pass.`, checklist all green, primary becomes `Open the report`, and the secondary consequence card is removed.
- **"Source not connected" checklist-row variant (reusable; live on SWEN30006, not on COMP30022).** This is the state the v1 artboards showed and it stays fully specified:
  - Icon: blocked (exclamation in `--amber-800` inside a `--tint-amber` circle), `<title>Blocked</title>`.
  - Text: `Not connected. Attendance will be blank for all four members.` in `--amber-800` (7.48:1).
  - A single inline `Connect` link in that row, and **only** in that row; when this variant is present the header primary becomes `Connect Google Meet` and the inline link is dropped, so the one-control-per-job rule holds either way.
  - When this variant is present, the h1 names the missing source (`Almost ready. One source is still missing.`), the Meetings tile reads `Not collected`, the Meetings column is removed from the Report's raw-count table, the meetings row is removed from Member Detail's paired bars, and shares are recomputed without meetings and restated in the caption. That cascade is the rule in 7.8, not an option.
- **Loading:** checklist rows show pending hollow icons and `Checking...`, container `aria-busy="true"`.
- **Error:** the affected checklist row switches to the blocked icon and reads `Could not reach Google Docs at 4:10pm. Last successful collection 28 Aug.` with an inline `Retry` in that row only, behaving per 5.3's `Retry`.

### 5.5 Screen 5 - Contribution Report

**Question:** Who did the work?

**Heading outline:** h1 -> h2 "Before you rely on this" (the unmatched-account precondition) -> h2 "Share of recorded activity" -> h3 "Raw counts" (disclosure panel).

**Arithmetic corrections (Fix 6).** Shares: Alice 35, Sheldon 30, Bob 28, Kevin 7 (sum 100). An even four-way split is 25%. Kevin at 7% is `7 / 25 = 0.28`, i.e. **just over a quarter** of an even share, not "about a fifth". The copy below states the two numbers instead of a fraction, so the reader is never asked to trust a ratio we computed for them.

```
[<- Back to Dashboard]
COMP30022 FINAL PROJECT - 1 to 30 AUG 2025             [Export as PDF]
h1 Three of four members contributed at a similar level.
deck Kevin Liu accounts for 7% of recorded activity. An even split
     across four members would be 25%. Slackr measures activity
     recorded by connected tools, not the quality or difficulty of
     anyone's work.
------------------------------------------------------------ rule
+--------------------------------------------------------------+   <-- MOVED
| 4px amber left edge   h2 Before you rely on this             |   TO THE TOP
| One GitHub account with 6 commits is matched to nobody, so    |   (Fix 12)
| this report may understate someone.       [Match it on Members]|
+--------------------------------------------------------------+
+--------------------------------------------------------------+
| h2 Share of recorded activity                                |
| Share is a member's recorded events divided by all members'   |
| recorded events. One commit, one document edit and one        |
| attended meeting each count as one event. 103 events were     |
| recorded between 1 and 30 August. Select a name to see how    |
| that member compares.                        (--t-body)       |
|                                                               |
| <table>                                                       |
|  MEMBER(19%) SHARE(9%) 0-40% OF ACTIVITY(46%) TREND(12%) STANDING(14%)
|  ---------------------------------------------------------   |
|  Alice Zhang   35%  [############----|---]  /  Rising  [In line]
|  Sheldon Chen  30%  [##########-----|----]  /  Rising  [In line]
|  Bob Wang      28%  [#########------|----]  \  Declining [In line]
|  Kevin Liu      7%  [##-------------|----]  \  Declining [Well below]
|                     0    10    20    30    40%                |
|                                  ^ even split 25%             |
+--------------------------------------------------------------+
| [v Show the raw counts]        (closed by default)            |
|   h3 Raw counts                                               |
|   <table> Member | Commits | Doc edits | Meetings | Last active| Share
+--------------------------------------------------------------+
```

- **Route to Member Detail exists** (Fix 3): each `<th scope="row">` contains `<a href="/report/{slug}">`. The invitation copy `Select a name to see how that member compares.` sits **directly above the table it describes**, not above the disclosure. The word "below" is removed because it was pointing at the wrong element.
- **Axis is labelled and its maximum disclosed** (Fix: 35% was rendering as an 87.5%-wide bar). The column header reads `0 to 40% of activity`; a tick row sits under the last data row with **evenly spaced labels at 0, 10, 20, 30 and 40%** and 1px `--ink-300` tick marks. **25% carries no tick label**; it is marked only by the dashed reference line and the single annotation `even split 25%` beneath it, so the label row keeps an even rhythm and the reference reads as an annotation rather than as a sixth tick.
- **Trend is text, not geometry** (Fix: Bob declining vs Sheldon rising existed only as SVG path data). The Trend column contains the sparkline `<svg role="img">` **and** the visible word `Rising` / `Declining` / `Steady` in `--t-eyebrow` `--ink-500`.
- **Legend removed.** Its two keys (`Even split`, `Trend across August`) become the axis annotation and the column header respectively, which removes the unlinked-legend problem rather than patching it.
- **Unmatched-account warning promoted above the chart** (Fix 12): it is a precondition for trusting the chart, so it precedes it in reading order and in the DOM. Copy: `One GitHub account with 6 commits is still matched to nobody, so this report may understate someone. You saw this on the project dashboard.` Action: `Match it on Members`, the same destination as the Dashboard primary and the Projects attention card. The reader meets the same gap on the screen that gates the report and again on the report itself, which is the correct relationship between the two screens rather than a surprise at the bottom of one.
- **`Export` is one button, not a menu** (Fix: the v2 draft drew a chevron on an unspecified menu). It is a single secondary `<button type="button">Export as PDF</button>`; the chevron is deleted. Rationale: a menu would be the seventh interactive pattern in the product for one destination, and PDF is the only format a tutor attaches to a marking record. On activation the button enters the loading variant (`aria-busy="true"`, label unchanged) and on completion a toast reads `Report exported. Check your downloads.` On failure a `role="alert"` line appears under the header: `The export failed. Nothing was saved.` with the button restored.
- **The exported PDF is tagged.** Export is the one boundary where the product hands its content to another reader, so the accessibility system does not stop at the browser. The file must carry:
  - a **tagged** structure tree (PDF/UA), not a flattened print of the page;
  - a document title (`COMP30022 Final Project - contribution report, 1 to 30 August 2025`) set in the document properties and set to display in place of the filename, and a declared document language;
  - a heading structure mirroring 6.1 for this screen: H1 headline, then H2 `Before you rely on this`, H2 `Share of recorded activity`, H3 `Raw counts`;
  - the **share definition sentence from 7.7 as real, selectable text**, never rasterised into the chart image, and likewise the axis maximum and the even-split annotation;
  - both tables exported as **tagged tables** with header cells marked as headers and scope preserved, not as positioned text runs;
  - each bar carrying the same alternative text as its `<td>` siblings supply on screen, so a bar is never the only carrier of a number in the PDF either;
  - reading order matching visual order.
  If the export pipeline cannot produce a tagged PDF, the button is not shipped: an untagged export would quietly undo section 6 for the one artefact that leaves the product.
- **Competing actions = 3:** `Export as PDF`, `Match it on Members`, the repeated member row links.
- **Raw counts panel** is a real `<table>` (Fix 9) with `<caption>Everything recorded for each member between 1 and 30 August 2025. Events = commits + document edits + meetings attended; 103 in total.</caption>`, `<colgroup>` 22/13/15/15/20/15, `<th scope="col">` on all six, `<th scope="row">` on the name, numeric cells right-aligned tabular. Rows: Alice 18 / 14 / 4 of 4 / Today / 35%; Sheldon 16 / 11 / 4 of 4 / Today / 30%; Bob 13 / 12 / 4 of 4 / Yesterday / 28%; Kevin 2 / 3 / 2 of 4 / 3 days ago / 7%.
- **Empty state (no activity yet):** table replaced by a panel: hatched bar illustration, h3 `Nothing recorded yet.`, `--t-body --ink-500` `Slackr has been collecting for 3 days. It needs about a week of activity before shares are meaningful.` plus quiet button `Show the raw counts` (which will be all zeros).
- **Loading:** four skeleton rows with animated tracks; `aria-busy="true"` on `<table>`; visually hidden live region `Loading the contribution report.`
- **Error:** `role="alert"` panel replaces the table: `We could not build this report.` / `GitHub returned an error at 4:10pm. The figures you saw last are from 28 Aug.` / `Try again`.

### 5.6 Screen 6 - Member Detail

**Question:** How does this member compare, and what might the numbers be missing?

**Arithmetic corrections (Fix 6).** "Group median" is now **defined on screen** and used identically everywhere:

> **Group median** = the middle value for the other three members. Kevin is excluded so he is not compared against himself.

That gives, from the raw counts: commits median of {18, 16, 13} = **16**; doc edits median of {14, 12, 11} = **12**; meetings median of {4, 4, 4} = **4**. This convention makes 12 (already on screen in v1) correct and fixes 15 to 16.
Against it: commits 2/16 = 13%; doc edits 3/12 = 25%; meetings 2/4 = **exactly half**. So "every measure is under half the group median" is false and is replaced.

```
[<- Back to Report]
KEVIN LIU - COMP30022 - 1 to 30 AUG 2025        [Ask Kevin for context]
h1 Kevin recorded far less activity than the rest of the group.
deck Kevin accounts for 7% of the group's recorded activity, against
     25% for an even four-way split. His commits and document edits
     are a quarter or less of the group median; he attended two of
     the four meetings, which is half the median. Slackr only sees
     the three connected tools, so read Kevin's note before deciding
     what this means.
------------------------------------------------------------ rule
+--------------------------------------------------------------+
| h2 Kevin compared with the group median                       |
| Group median means the middle value for the other three       |
| members. Each row is drawn on its own scale, shown at the      |
| right of the row.                              (--t-body)     |
|                                                               |
| h3 GitHub commits                        scale 0 to 20 commits|
|   Kevin          [##----------------]   2    13% of median    |
|   Group median   [================--]  16    100%             |
|                                                               |
| h3 Google Docs edits                       scale 0 to 20 edits|
|   Kevin          [###---------------]   3    25% of median    |
|   Group median   [============------]  12    100%             |
|                                                               |
| h3 Meetings attended                     scale 0 to 4 meetings|
|   Kevin          [########----------]   2 of 4  50% of median |
|   Group median   [==================]   4 of 4  100%          |
+--------------------------------------------------------------+
| h2 Kevin's own note                          (--t-subhead 20px)|
|   "I ran the five user interviews off-platform and built the  |
|    presentation in Figma, so none of it shows up in GitHub or |
|    Docs."                            (--t-quote, blockquote)  |
|   Added 20 Aug 2025. Not verified by Slackr.   (--t-body)     |
+--------------------------------------------------------------+
| [v Show every recorded number]     (closed by default)        |
|   h3 Every recorded number                                    |
|   4 x 2 grid of stat tiles, values in --t-stat (24px Inter)   |
+--------------------------------------------------------------+
```

- **The 7% share appears here** (Fix: the brief forbids holding a number across screens). It is in the deck and repeated as an eyebrow stat `SHARE OF RECORDED ACTIVITY - 7% (even split: 25%)` immediately under the h1's eyebrow line.
- **The three scale problems are fixed** (Fix: v1 used 5%/unit, 5%/unit and 25%/unit unstated, so Kevin's meetings bar was 5x his commits bar for a smaller number). Two mechanisms:
  1. Each measure declares its own axis in text at the row's right edge: `scale 0 to 20 commits`, `scale 0 to 20 edits`, `scale 0 to 4 meetings`. Bar widths are then honest within a row (2/20 = 10%, 16/20 = 80%; 3/20 = 15%, 12/20 = 60%; 2/4 = 50%, 4/4 = 100%).
  2. A **`% of median` column** is added to every row. This is the one number that is comparable *across* rows (13% / 25% / 50%), so cross-measure comparison never depends on bar length.
- **The two bars are distinguished by form, not by two similar indigos** (Fix 8, which flagged `#c7c4f4` at 1.41:1 on track and 1.77:1 against the member bar):
  - **Member bar:** solid fill. `--amber-800` when the member is "Well below", `--indigo-600` otherwise. 6.13:1 / 5.78:1 against the track.
  - **Group-median bar:** unfilled, with a **2px `--indigo-600` outline** and a 45-degree 2px `--indigo-600` hatch at 8px pitch on `--surface-card` white interior. Outline is 7.04:1 against its interior and 5.78:1 against the track. Fill vs outline is a shape difference, so the two bars are told apart without relying on hue.
  - Both sit on the standard track: `--surface-track` with a 1px `--ink-300` outline.
- **`Ask Kevin for context` states its outcome** (Fix): the button opens a `<dialog>` (h2 `Ask Kevin for context`, a `<textarea id="ask-note">` prefilled with `Hi Kevin - the report shows less recorded activity for you this month. Anything Slackr wouldn't have seen?`, primary `Send request`, secondary `Cancel`). On send, the dialog closes, focus returns to the trigger, and a `role="status"` toast plus an inline line under the h1 reads `Asked 22 Aug. Kevin has 3 days to reply before the report is exported.` The button then shows the disabled variant with reason text `Already asked on 22 Aug.`
- **The h2 sizing conflict is fixed** (Fix: a 14px h2 labelled a 22px quote and differed by 1px from the other h2). Both h2 on this screen are `--t-subhead` 20px Inter 600 `--ink-900`; the quote is a `<blockquote>` at `--t-quote` 24px Instrument Serif italic `--indigo-700` (8.77:1 on white; the panel keeps `--tint-indigo` bg where `--indigo-700` measures 7.54:1). The `<blockquote>` carries `cite` and the attribution sits in a `<figcaption>` inside a `<figure>`.
- **Stat tiles** use `--t-stat`, matching the Dashboard exactly: value 24px Inter 600 tabular `--ink-900`, label `--t-body --ink-500`, `--r-tile`, 1px `--rule`. No serif, no `tabular-nums` on a serif face, no tile stepped down to a different size.
- **Clipping fixed** (Fix 12): content column scrolls; the disclosure panel is a 4x2 grid (2 rows of 4 tiles, 16px gap) totalling ~200px, and it opens into the scroll region. `scroll-margin-block-end: 24px` on the panel so opening it scrolls the last row fully into view.
- **Competing actions = 3:** `Ask Kevin for context`, `Back to Report`, plus the disclosure.
- **Empty state (member has a note but no recorded activity):** the three paired-bar rows are replaced by a single panel: `Nothing was recorded for Kevin by the connected tools between 1 and 30 August.` and the note panel is promoted above it.
- **No-note variant:** the quote panel becomes `--t-body --ink-500` `Kevin has not added a note.` plus the `Ask Kevin for context` button repeated inside that panel (this is the only case where that action appears twice; the header instance is removed to keep the count at 3).

---

## 6. Accessibility

### 6.1 Heading outline per screen (one h1, no skipped levels)

| Screen | h1 | h2 | h3 |
|---|---|---|---|
| 1 Projects | One project needs you this week. | Needs attention / Collecting normally / Too early to compare | one per project card; the `<h3>` contains the card's only link |
| 2 New Project | What are we tracking? | Project details / What you're creating | - |
| 3 Members | One GitHub account isn't matched to anyone. | GitHub - a-zhang-uni / Linked members | - |
| 4 Dashboard | One thing to settle before you report. | What the report needs / What has been collected | - |
| 5 Report | Three of four members contributed at a similar level. | Before you rely on this / Share of recorded activity | Raw counts |
| 6 Member Detail | Kevin recorded far less activity than the rest of the group. | Kevin compared with the group median / Kevin's own note | GitHub commits / Google Docs edits / Meetings attended / Every recorded number |

The eyebrow line (`COMP30022 FINAL PROJECT - DUE 30 AUG 2025`) is **not** a heading; it is a `<p>` with `--t-eyebrow`, and its project name is inside the `<h1>`'s labelled region via `aria-describedby` on `<main>` where needed.

### 6.2 Focus order (DOM order, no `tabindex` above 0)

1. Skip link
2. Logo link
3. Nav items 1 to 5 (`aria-current="page"` on the live one)
4. Sidebar account link
5. `<main>` content, top to bottom exactly as drawn: back link -> header action cluster (left to right) -> each card in order -> within a card, headings are not focusable, then links/controls in visual order -> disclosure button -> (when open) the panel's own links.

`tabindex="-1"` is used only on `<main>` (skip-link target), on the first invalid field, and on `<dialog>` containers.

### 6.3 ARIA inventory (the complete list; nothing else is used)

| Attribute | Where |
|---|---|
| `aria-current="page"` | the one active sidebar nav `<a>` |
| `aria-current="step"` | the active `<li>` in the New Project stepper |
| `aria-expanded` + `aria-controls` | all three disclosure buttons (Dashboard, Report, Member Detail) |
| `hidden` | all three disclosure panels when closed |
| `aria-describedby` | every form field (help + error), and the `Generate the report without those 6 commits` button (consequence line) |
| `aria-invalid="true"` | fields that failed validation |
| `aria-disabled="true"` | **every** blocked control in the product, per the universal rule in 3.2 (`Next`, `Match`, `Retry` during its 60s cooldown, and any control added later). Always paired with a no-op handler, a reason line and `aria-describedby`; the `disabled` attribute is never used anywhere |
| `role="alert"` | form error summary, load-failure panels |
| `role="status"` | the "Asked Kevin" confirmation, every toast (3.14), and every in-place re-check result |
| `aria-labelledby` on `<dialog>` | both dialogs, pointing at their own `<h2>` (3.13) |
| `aria-live="polite"` | the New Project summary panel, the "loading" announcements |
| `aria-busy="true"` | any container in the loading state |
| `role="img"` + `aria-labelledby` -> `<title>` | every sparkline and every status icon that is not accompanied by text |
| `aria-hidden="true"` | the **inner** `.bar__track` mark (never the `<td>` itself), decorative chevrons, badge glyphs, the icon inside a labelled button |
| `<caption>` | every `<table>` |
| `scope="col"` / `scope="row"` | every `<th>` |
| `.sr-only` | the Actions column header, the "Loading" live-region text |

`.sr-only` = `position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap;`

### 6.4 Text alternatives for every chart and mark

| Mark | Alternative |
|---|---|
| Report bar (per row) | The `<td class="bar">` stays in the tree with an empty accessible name; only the inner `.bar__track` is `aria-hidden="true"`, so the column count still matches the `<th scope="col">` row. The data is already in adjacent real cells: `<th scope="row">` name, `35%` share, `Rising`, `In line`. A screen reader reading the table row hears `Alice Zhang, 35%, Rising, In line` with header association from `<th scope="col">`. **No bar is ever the only carrier of a number.** |
| Report axis / even-split line | `<caption>` reads: `Share of recorded activity, 1 to 30 August 2025. Bars are drawn on a scale of 0 to 40%. The dashed line marks an even four-way split of 25%.` |
| Report sparkline | `<svg role="img" aria-labelledby="t-alice">` + `<title id="t-alice">Alice Zhang's weekly activity across August: rising, 4 events to 11.</title>`, plus the visible word `Rising` in the same cell. |
| Projects card sparkline | `<title>COMP30022 activity across the last four weeks: rising.</title>` plus the visible word `Rising` and the `--indigo-600` rising stroke. All three agree, per the triple rule in 7.10. |
| Member Detail paired bars | Each measure is a 2-row `<table>` (`<caption>GitHub commits, scale 0 to 20.</caption>`, `<th scope="col">Who / Count / Share of median`). As on the Report, the `<td class="bar">` stays in the tree with an empty accessible name and only the inner `.bar__track` is `aria-hidden="true"`; `2`, `16`, `13%`, `100%` are real cells. |
| Checklist icons | 20x20 `<svg role="img">` with `<title>Done</title>` / `<title>Blocked</title>` / `<title>Not started</title>`, and the same word in the third column as visible text. |
| Stat tiles | Real text values; `Not collected` is a word, never a dash. |
| Badges | Real words (`In line`, `Well below`, `Too early`); the glyph is `aria-hidden`. |

### 6.5 Non-text contrast summary (1.4.11, all >=3:1)

| Element (v1 value -> v2 value) | New ratio |
|---|---|
| Input / select / button borders `#e5e5ea` (1.26) -> `#7f7f8a` | 3.96 on white, 3.73 on page |
| Bar track `#ececf2` (1.18) -> `#e8e8ef` **with a 1px `#7f7f8a` outline** | 3.96 (outline vs card) |
| Member bar `#5b4fe5` -> `#4b3fd6` on track | 5.78 |
| Kevin's bar `#d08700` -> `#7a4a00` on track | 6.13 |
| Median bar `#c7c4f4` (1.41 / 1.77) -> unfilled with 2px `#4b3fd6` outline + hatch | 7.04 vs interior, 5.78 vs track, plus a shape difference vs the member bar |
| Even-split line `#a1a1ad` (2.56) -> dashed `#41414c` | 10.07 on card, 8.26 on track |
| Warn icons `#d08700` (2.94 / 2.61) -> `#7a4a00` | 7.48 on white, 6.52 on `#fbeed6` |
| Nav state dots `#d4d4dc` (1.47) -> removed; replaced by a 3px `#4b3fd6` current-bar + icon | 7.04 |
| "Not done" circles `#c4c4cd` (1.73) -> 1.5px `#7f7f8a` hollow circle | 3.96 |
| Attention card border `#f0dcbb` (1.27) -> 4px `#7a4a00` left edge | 7.48 |
| Stepper upcoming dot `#d4d4dc` (1.47) -> 1.5px `#7f7f8a` ring | 3.96 |
| Focus ring (absent) -> 2px `#2a21a8`, offset 2px | 11.16 on white, 10.53 on page |
| Toast dismiss-button ring (2px `#ffffff` on `--ink-900`) | 18.04 |
| Disabled-control border `--ink-300` on card, and its hatch on `--surface-track` | 3.96 / 3.25 |
| Nav and secondary pressed fill `#d3d3da`, label `--ink-900` | 12.12 |
| Secondary button **border in the pressed state**: `--ink-700` on `#d3d3da` | 6.76 |
| (rejected) `--ink-300` on `#d3d3da`, which the v3 draft left in place | **2.66 - fails**, which is why the pressed border darkens to `--ink-700` |
| `--ink-300` on the three status tints (`#fbeed6` / `#d8f0e2` / `#fbe6e6`) | 3.45 / 3.30 / 3.31 |
| Primary pressed fill `--indigo-800` `#362c9c`, white label | 10.51 |
| Report tick marks `--ink-300` on card | 3.96 |

**Worst case anywhere in the system: 3.25:1**, the `--ink-300` bar-track outline against the `--surface-track` fill. The v2 draft's `#85858f` sat at exactly 3.00 on that same pair, with no margin on the most repeated data boundary in the product; `#7f7f8a` restores headroom without moving any other token.

That claim is now audited rather than inferred. Every surface a `--ink-300` boundary can land on is enumerated above: card white 3.96, page 3.73, bar track 3.25, indigo tint 3.40, amber tint 3.45, green tint 3.30, red tint 3.31, and the pressed fill 2.66 - the last of which is the one pair that fails, and is the reason the pressed state switches its border to `--ink-700`. A boundary token is only as good as its worst surface, so any new surface added later must be added to this list before a `--ink-300` border is allowed onto it.

### 6.6 Text contrast summary (1.4.3, all >=4.5:1; no text below 11px)

| v1 failure | v2 |
|---|---|
| `#9a9aa4` on white at 10px, 3 instances (2.79) | deleted; those strings are now `--t-eyebrow` 11px `#5d5d69` = **6.49** |
| `#1e8a4c` on white at 13px (4.38) | `#146b3a` = **6.57** |
| `#1e8a4c` on `#ddf5e5` at 11px bold, 3 instances (3.81) | `#146b3a` on `#d8f0e2` = **5.47** |
| `#6b6b76` secondary text (5.26, passing but the 12th grey) | consolidated to `#5d5d69` = **6.49** |
| `#9a5b00` amber text (4.30 on white) | `#7a4a00` = **7.48** |
| `#453ac2` quote text on `#f1f0fe` | `#3f34b8` on `#eeecfd` = **7.54** |

Three ratios in the v2 draft were stated conservatively but imprecisely and are corrected here: `--ink-500` on `--surface-track` is **5.32** (not 5.40); `--rule` on `#ffffff` is **1.36** (not 1.32); `--rule` on `#f8f8fb` is **1.29** (not 1.25). No decision changes; the table is now exact.

### 6.7 Other conformance notes

- **1.4.1 Use of colour:** no status is carried by colour alone anywhere. Every bar has a number, every sparkline has a word, every badge has a word, every checklist icon has a word, the current nav item has a bar and `aria-current`, the current step has text.
- **1.4.4 Resize text / 1.4.10 Reflow / 1.4.12 Text spacing:** specified in full in section 4.1, including the single 900px breakpoint, the icon-rail sidebar, the hidden bar column and the four text-spacing overrides. All type is declared in `rem`.
- **2.4.7 / 2.4.11 Focus:** the global ring plus 2px offset means no focused control is fully obscured by a sticky element (nothing is sticky).
- **2.5.8 Target size:** every interactive target is >=24x24 CSS px. Nav items 36px, buttons 32 to 36px, table row links have 14px vertical padding giving a 42px row, `Change` links get `padding: 8px 0` for a 30px target.
- **3.2.2 On input:** no control submits or navigates on change. Choosing a member in the Members `<select>` only clears `Match`'s `aria-disabled` state and its reason line; nothing is sent until `Match` is activated.
- **3.3.1 / 3.3.3 Errors:** every error is text, identifies the field by name, and suggests the fix.

---

## 7. Data-model consistency

The critic found four numbers that disagreed across screens. These rules make that structurally impossible.

**7.1 One source table.** Every screen renders from one record set. It is stated here so all six artboards agree:

| Member | Commits | Doc edits | Meetings | **Events** | Last active | Share |
|---|---|---|---|---|---|---|
| Alice Zhang | 18 | 14 | 4 of 4 | **36** | Today | 35% |
| Sheldon Chen | 16 | 11 | 4 of 4 | **31** | Today | 30% |
| Bob Wang | 13 | 12 | 4 of 4 | **29** | Yesterday | 28% |
| Kevin Liu | 2 | 3 | 2 of 4 | **7** | 3 days ago | 7% |
| **Project total** | 49 | 40 | 4 meetings, 14 attendances | **103** | 28 Aug | 100% |

Audit trail, every figure derivable on screen:
- Commits 18+16+13+2 = **49**; doc edits 14+11+12+3 = **40**; attendances 4+4+4+2 = **14**. All three match the Dashboard's collected counts and its `49 + 40 + 14 = 103` line.
- Events per member = commits + doc edits + attendances: 36, 31, 29, 7. Total **103**.
- Shares = events / 103: 36/103 = 34.95 -> **35%**; 31/103 = 30.10 -> **30%**; 29/103 = 28.16 -> **28%**; 7/103 = 6.80 -> **7%**. Rounded shares sum to **100**.
- **Google Meet is connected for COMP30022.** Meetings are in the denominator, which is the only reading under which 35/30/28/7 is correct. Every screen that publishes a meeting figure is therefore consistent with every screen that describes the sources. SWEN30006, not COMP30022, carries the "source not connected" state.

**7.2 "Group median" is defined once, on screen, and used once.**
Definition, printed under the h2 on Member Detail: *the middle value for the other three members* (the subject is excluded so nobody is compared with themselves). Applied: commits 16, doc edits 12, meetings 4. This is the only median convention in the product. No screen may show a median computed any other way, and no screen shows a median without that sentence within 200px of it.

**7.3 "Even split" is defined once.** `100% / number of members`. With 4 members that is 25%. It appears as the dashed axis line on the Report and as the words `against 25% for an even four-way split` on Member Detail. No screen says "the group average" without printing the number next to it.

**7.4 Share % is visible on both the Report and the Member Detail.** Report row: `7%`. Member Detail: in the deck sentence and as an eyebrow stat under the h1. The reader never has to carry it.

**7.5 One axis convention per chart, with the maximum disclosed.**
- Report: a single shared axis, `0 to 40% of recorded activity`, printed in the column header, in the `<caption>` and as tick labels. All four bars use it.
- Member Detail: one axis per measure because the units differ, each printed at the right of its own row (`scale 0 to 20 commits`, `0 to 20 edits`, `0 to 4 meetings`), and a `% of median` column that is unitless and therefore comparable across all three rows.
- No chart anywhere is drawn on an undisclosed scale.

**7.6 Rounding.** Shares are whole percents. `% of median` is a whole percent. Counts are integers. Meeting counts always render as `n of 4`, never as a bare integer.

**7.7 "Share of recorded activity" is defined on screen, because it is the most contestable judgement in the product.**

> **Share of recorded activity** = a member's recorded events divided by all members' recorded events. One commit, one document edit and one attended meeting each count as **one event**. Slackr weights all three equally and does not judge how much work an event represents.

- The sentence is printed under the `<h2>` on screen 5 and repeated inside the chart's `<caption>`, so it is present for both sighted and screen-reader readers and travels with an exported PDF.
- The event total (**103**) is printed in the same sentence and again on the Dashboard as `49 + 40 + 14 = 103 recorded events`, so a reader can check the arithmetic without leaving the product.
- Equal weighting is a stated choice, not a hidden one. Any future change to the weighting changes this sentence first and the numbers second.

**7.8 A source marked "not collected" may not appear as a value on any screen.**

If a source is not connected, or is connected but has collected nothing, then on **every** screen:
1. its Dashboard checklist row uses the blocked variant and its tile reads `Not collected`, never a dash and never a number;
2. its column is removed from the Report's raw-count table, and the `<caption>` says which column was removed and why;
3. its row is removed from Member Detail's paired bars;
4. it is **excluded from the share denominator**, and the new event total is restated in the definition sentence and the caption;
5. no headline, deck or note anywhere may cite a figure derived from it.

**Ranking, when a project has more than one gap.** A project can have a missing source *and* an unmatched account at the same time, so the two must not compete for the headline:
1. **Missing or disconnected source** outranks everything: it removes a whole column for every member.
2. **Unmatched account** is second: it misplaces work rather than erasing a measure.
3. Everything else follows in checklist order.

The Dashboard `<h1>` names **only the highest-ranked open gap**; the deck counts the rest (`Four of the five checks below pass` becomes `Three of the five checks below pass, and two are open`). Each gap keeps its own checklist row with its own specifics. The header primary addresses the highest-ranked gap; lower-ranked gaps are addressed from their rows only if no header primary already goes to the same destination.

This is a hard consistency rule, not a preference. It is what the v1 artboards violated by showing Google Meet as never connected while publishing meeting counts on two other screens, and it is the rule that makes the v2 arrangement checkable: COMP30022 has all three sources on and publishes all three; SWEN30006 has only GitHub on and publishes only commits.

**Coverage, stated plainly.** The not-connected cascade is fully specified but **ships unrendered**. The six artboards all show COMP30022, where all three sources are on; the only place a reader sees the state at all is the SWEN30006 card on screen 1. There is no seventh artboard for the SWEN30006 dashboard, and this spec does not add one: the variant is written to be implemented and reviewed in code, not to be drawn. Whoever implements it should render it once and check it against 5.4 and this section before any release that lets a project run on a partial source set. Calling it covered by the artboards would be false.

**7.9 No two screens may carry the same sentence as their primary answer.**

Every screen answers one question, and each *fact* has exactly one screen that owns it as a headline. Other screens may reference that fact, but they must reference it in a different grammatical shape and at a lower level in the heading outline.

| Fact | Owned as an `<h1>` by | Referenced elsewhere as |
|---|---|---|
| One GitHub account is unmatched | **Members** (`One GitHub account isn't matched to anyone.`), with the control inline | Projects: a card status line inside the `Needs attention` bucket. Dashboard: one checklist row, plus a counted `<h1>` (`One thing to settle before you report.`) that never names it. Report: an `<h2>` precondition that says the reader already met it. |
| This project is ready, or is not | **Dashboard** | Projects: bucket membership. |
| Who did the work | **Report** | Member Detail: the `7%` restated so nothing is carried across. |
| How one member compares | **Member Detail** | Report: the row's standing badge. |

The test before shipping any screen: read the six `<h1>`s in sequence. If two could be swapped without a reader noticing, one of them is not doing its job. This is the same defect that retired the v1 Dashboard's members table, and the Meet-connected branch reintroduced it by giving four screens one fact to lead with.

**7.10 A sparkline's three channels are one triple and change together.**

Every sparkline has exactly three carriers of direction:
1. the `<title>` sentence inside the `<svg role="img">`,
2. the visible direction word beside it (`Rising` / `Steady` / `Declining` / `Not enough data`),
3. the stroke token (`--indigo-600` rising, `--ink-700` steady, `--amber-800` declining, `--ink-700` hatch for no data).

They are written from one value in the data model and are never edited independently. Any review that changes one must change all three in the same edit. The current set:

| Mark | `<title>` direction | Visible word | Stroke |
|---|---|---|---|
| COMP30022 card | rising | Rising | `--indigo-600` |
| INFO20003 card | rising | Rising | `--indigo-600` |
| SWEN30006 card | not enough data | Not enough data | `--ink-700` hatch |
| Report: Alice | rising | Rising | `--indigo-600` |
| Report: Sheldon | rising | Rising | `--indigo-600` |
| Report: Bob | declining | Declining | `--amber-800` |
| Report: Kevin | declining, ending at 1 event in week 4 | Declining | `--amber-800` |

Bob declines while staying `In line`: the trend word describes the shape of the four weeks, the badge describes the share. They are different measures and are allowed to disagree, which is why both are shown.

---

## 8. Fix-by-fix resolution checklist

**This table is derived from the body, not maintained beside it.** Every row's last column names the section that actually governs the decision, and that section is the source of truth. If a row and its cited section disagree, the section wins and the row is the bug. Before any review, walk the table and re-read each cited section rather than trusting the summary: the three stale cross-references found in round 3 (an `aria-disabled` scope, a `3.2.2` note and a `16px` heading size) all lived in summaries that had drifted from bodies that were already correct.


| # | Critic finding | Resolution | Where in this spec |
|---|---|---|---|
| 1 | Every control is fake (+4.0) | Real `<input>`, `<select>`, `<input type=date>`, `<textarea>` with `id`, `for`, `required`, `aria-describedby`, `aria-invalid`, `aria-disabled`. Members' match control is a real `<select id="match-1">` with a real `<label for>`. Full default/hover/focus/filled/required/invalid/disabled/loading matrix. | 3.10, 5.2, 5.3 |
| 2 | Nav items are `<div>`; no focus system (+4.0) | `<nav><ul><li><a>` x5 with `aria-current="page"`; global `:focus-visible` = 2px `#2a21a8` at offset 2px, **11.16:1 on `#ffffff` and 10.53:1 on `#f8f8fb`**. | 2.7, 3.1, 6.2 |
| 3 | No route Report -> Member Detail; caption points at the wrong element (+3.5) | Every `<th scope="row">` holds an `<a href>`; row hover, `cursor:pointer`, row `:focus-within` ring. Caption reworded to `Select a name to see how that member compares.` and moved directly above the table. | 3.7, 5.5 |
| 4 | No hover/active/disabled/loading/empty/error states (+3.0) | Full state matrices for all 12 components; empty, loading and error variants written for all 6 screens; Members' "no unmatched accounts" empty state specified as its primary state; New Project validation state specified. | 3.1-3.12, 5.1-5.6 |
| 5 | Sparklines are colour-only and fail 3:1 (+3.0) | `role="img"` + `<title>` sentence + a visible direction word + an end-cap dot. Strokes `#4b3fd6` (7.04), `#41414c` (10.07), `#7a4a00` (7.48). | 3.8, 6.4 |
| 6 | False / undefined numbers (+2.5) | "about a fifth" -> the two raw numbers `7%` and `25%`. "under half" -> `a quarter or less ... half the median` for meetings. Median defined as the middle of the other three: commits 16 (was 15), edits 12, meetings 4. Definition printed on screen. | 5.5, 5.6, 7.1-7.3 |
| 7 | 11 type sizes, 12 greys, 10px type, 3 different header alignments (+2.5) | Exactly 6 sizes (42/24/20/16/14/11, with `--t-subhead` added to bridge 42 -> 16 and the 13px meta size merged into 14px body), exactly 5 greys with pressed states derived via `color-mix()`, nothing below 11px, one header grid rule with `align-items:end` and no padding/margin hacks, one 24px section gap. | 2.2, 2.6, 2.7, 4 |
| 8 | Nine 1.4.11 non-text failures (+2.5) | Each replaced and re-measured; table of before/after ratios, all >=3:1. | 6.5 |
| 9 | Two fake `<span>` grid tables (+2.5) | Members roster and Report raw counts become real `<table>` with `<caption>`, `<colgroup>`, `<th scope="col">`, `<th scope="row">`. The Report chart itself also becomes a table. | 3.5, 3.7, 5.3, 5.5 |
| 10 | Text contrast failures (+2.5) | `#9a9aa4`/10px deleted; green `#1e8a4c` -> `#146b3a` (6.57 on white, 5.47 on tint); all body/meta text >=6.49:1. | 6.6 |
| 11 | Disclosures lack `aria-expanded`/`aria-controls`; chevron never rotates (+2.0) | All three get both attributes, `hidden` panels, label swap, and a 180-degree chevron rotation with a reduced-motion guard. | 3.9 |
| 12 | Member Detail clipped by `overflow:hidden`; Report warning is at the bottom although it is a precondition (+1.5) | `overflow:hidden` removed from root, `overflow-y:auto` on the content column, `scroll-margin` on disclosure panels, stat grid reflowed to 4x2. Unmatched-account warning moved above the chart as `<h2>Before you rely on this</h2>`. | 4, 5.5, 5.6 |
| P1 | Projects: no h2s, SWEN mis-bucketed, inconsistent card affordance, 4 competing actions | Three `<h2>` buckets including `Too early to compare`; card titles are `<h3>` and are the only link on the card (the trailing `Open project` is deleted, see C9); action count reduced to 3. | 5.1 |
| P2 | New Project: no `aria-current`, no "step 1 of 2", no Cancel, static summary | `Step 1 of 2` visible, `aria-current="step"`, Cancel + discard dialog + consequence line, summary panel becomes `aria-live="polite"` and mirrors the fields. | 3.11, 5.2 |
| P3 | Members: h1 and h2 contradict, `repeat(3,1fr)` wastes width, Match enabled with no selection | h1 keeps the exception, the all-clear moves into the table `<caption>`; `<colgroup>` 30/22/34/14; Match carries `aria-disabled="true"` (never the `disabled` attribute) until the select has a value, with the reason `Choose a member first.` | 5.3 |
| P4 | Dashboard: two controls for one job, unstated consequence, em-dash tile | Checklist rows lose their links; the one primary is `Match it on Members`; `Generate the report without those 6 commits` states its consequence via `aria-describedby`; the Meetings tile shows a real value (`14`) because Meet is connected, and reads `Not collected` as a word in the not-connected variant. | 5.4, 7.8 |
| P5 | Report: 40% axis unlabelled, legend unlinked, trend only in geometry | Axis maximum printed in the header, the caption and the tick row; legend removed in favour of a labelled column and axis annotation; trend words rendered as text. | 5.5, 7.5 |
| P6 | Member Detail: three unstated scales, 14px h2 over a 22px quote, 7% absent, no outcome for "Ask Kevin" | Per-row scale printed, plus a unitless `% of median` column; both h2 at `--t-subhead` 20px with the quote at `--t-quote` 24px; 7% in the deck and as an eyebrow stat; Ask flow gets a dialog, a confirmation and a disabled follow-up state. | 5.6 |
| C1 | Meet shown as never connected while meetings are published on three screens; shares only reconcile with meetings in the denominator | Meet is connected for COMP30022; the Dashboard's readiness gap becomes the unmatched GitHub account; shares stay 35/30/28/7 over 103 events; the not-connected state is kept in the system and demonstrated on SWEN30006 | 1.2, 5.1, 5.4, 7.1, 7.8 |
| C2 | "Share of recorded activity" never defined | Definition written, printed under the screen 5 h2 and repeated in the caption, with the 103-event denominator auditable on the Dashboard | 7.7, 5.5, 5.4 |
| C3 | Report precondition duplicates a gap the reader has not met | The reader meets the unmatched account on the Dashboard first; the Report card says so explicitly and shares one destination | 5.4, 5.5 |
| C4 | Export menu unspecified | Demoted to a single `Export as PDF` button; chevron deleted; loading, success toast and failure alert specified | 5.5 |
| C5 | `--t-quote` (serif italic) used for stat values that also ask for tabular figures; one tile a different size | `--t-stat` added (24/1.2 Inter 600 tabular); `--t-quote` confined to the blockquote; all tiles one size, words included | 2.6, 5.4, 5.6 |
| C6 | `<dialog>` used twice with no spec | Full dialog component: backdrop `rgba(22,22,26,.45)`, `aria-labelledby`, focus in and focus returned for **both** dialogs, inert background, scroll lock, 480px max-width | 3.13 |
| C7 | 1.4.10 and 1.4.12 asserted, not specified | One 900px breakpoint: 56px icon rail, one-column header, hidden bar column; plus the four text-spacing overrides accepted without clipping | 4.1, 6.7 |
| C8 | Projects deck contradicts the new third bucket | Deck rewritten to name all three states | 5.1 |
| C9 | Two links to one destination per card | Trailing `Open project` deleted; the `<h3>` link is the only route; hover via `:has(a:hover)` | 5.1, 3.4 |
| C10 | `disabled` vs `aria-disabled` contradiction | One rule in 3.2: `aria-disabled` plus a no-op handler everywhere; the `disabled` attribute is never used; 5.2, 5.3 and 3.10 aligned | 3.2, 3.10, 5.2, 5.3 |
| C11 | `aria-hidden` on `<td>` can desynchronise column counts | `aria-hidden` moved to the inner `.bar__track`; the cell stays in the tree with an empty accessible name | 3.7, 6.3, 6.4 |
| C12 | Disabled-button contrast claim wrong (2.28 asserted) | Corrected to **5.32:1**, which passes outright; the 1.4.3 exemption appeal is withdrawn; a second channel (border + 45-degree hatch) added because the fill is 1.22:1 against the card | 3.2, 6.5 |
| C13 | Two undeclared hexes, one of them a sixth grey | `#372ea0` -> `--indigo-800` `#362c9c` (declared with ratios); `#dedee6` -> derived `color-mix()` pressed value; the grey count stays at five | 2.2, 2.3, 2.5 |
| C14 | Tick labels unevenly spaced | Ticks at 0/10/20/30/40 only; 25% marked solely by the dashed line and its `even split 25%` annotation | 5.5 |
| C15 | `--ink-300` at exactly 3.00 on the track, zero margin | Darkened to `#7f7f8a`: **3.25** on track, **3.96** on white, **3.73** on page, **3.40** on the indigo tint. No other token moved | 2.2, 6.5 |
| C16 | `Change`, `Add member`, `Check again`, `Retry` had no flow | A destination, a success state and a second-failure state written for each, plus success and failure for `Match` | 5.3 |
| C17 | Select placeholder colour, toast and skeleton unspecified | Placeholder `--ink-500` (6.49:1) overriding the UA default; toast bottom-left, `--ink-900`/white, 6s, dismissible, `role="status"`; skeleton base and `#f2f2f7` highlight with a reduced-motion fallback | 3.14, 3.15, 3.16 |
| C18 | Kevin's sparkline title contradicts his "3 days ago" row | Title now ends at 1 event in week 4 | 3.8 |
| C19 | 42 -> 16 type gap predicted to need a bridge | `--t-subhead` at 20px added pre-emptively and assigned to every card-level `<h2>` | 2.6, 5.6 |
| D1 | 6.4 still called the COMP30022 sparkline "declining" while 5.1 rendered "Rising" | 6.4 corrected to rising; the triple rule (title + word + stroke, changed together) written with the full current set enumerated | 6.4, 7.10 |
| D2 | The Meet-connected branch gave four screens one fact to lead with; Dashboard and Members returned near-identical primary answers | Members owns the unmatched account as its `<h1>` with the control inline; the Dashboard `<h1>` counts open checks (`One thing to settle before you report.`) and its primary is `Match it on Members`; a one-owner-per-fact rule added | 5.3, 5.4, 7.9 |
| D3 | 6.5's "worst case 3.25:1" was false: the secondary pressed fill kept an `--ink-300` border at 2.66:1 | Pressed border switches to `--ink-700` (6.76:1); every surface an `--ink-300` boundary can land on is now enumerated in 6.5 and the worst case restated as audited | 3.2, 2.2, 6.5 |
| D4 | C11 repaired at three of four sites; Member Detail's bar cell still hid the whole `<td>` | Fourth site repaired; the rule is stated once and cited from both chart sections | 6.4 |
| D5 | 3.13 listed backdrop click as a close route on a destructive dialog, which `<dialog>` does not provide | Neither dialog light-dismisses; backdrop click is inert; the three close routes are named, and `Esc` and the close button both map to the non-destructive choice | 3.13 |
| D6 | No rule for a project with a missing source **and** an unmatched account | Gaps ranked (missing source, then unmatched account, then checklist order); the `<h1>` names the highest-ranked gap and the deck counts the rest | 7.8 |
| D7 | Four stale cross-references | `aria-disabled` scope made universal in 6.3; the 3.2.2 note reworded; P6 corrected to 20px; `--rule` on the indigo tint corrected 1.12 -> **1.17** and the track column added | 6.3, 6.7, 2.2, 8 |
| D8 | Three `<h2>` renderings with no stated rule; screen 1's `<h2>` is smaller than its `<h3>` | Group-label vs card-title `<h2>` rule added, naming which screens use which, and stating why screen 1 deliberately inverts size while keeping heading level | 2.6 |
| D9 | The ramp gained a size at the top without re-examining the bottom: 16/14/13/11 | `--t-body` and `--t-meta` merged at 14px; the ramp is back to six sizes (42/24/20/16/14/11) with the 20px bridge paying for itself | 2.6 |
| D10 | 7.7 claimed the definition "travels with an exported PDF", true only if tagged | Tagged-PDF requirements specified: structure tree, document title and language, heading structure mirroring 6.1, the definition as real text, tagged tables, bar alternatives, reading order; the button is not shipped if the pipeline cannot tag | 5.5, 7.7 |
| D11 | The not-connected cascade appears on no artboard beyond one Projects card | Stated plainly: it ships **unrendered**, with no seventh artboard, and must be rendered and checked in code before any release that allows partial source sets | 7.8 |
| D12 | No undo on `Discard`, none on an accepted `Match` | Both toasts gain `Undo` and a 10s timer, with the restored state and focus target specified for each; `Change` is exempt because its own `Cancel` precedes any write | 3.14, 5.2, 5.3 |
| P7 | Placeholder logo, initial-less avatars, generic list icon, indigo doing five jobs | Real bar-chart logo mark, initialled avatars, course-monogram project tiles, and indigo split into `--indigo-600` (brand/link/nav/primary) vs the data fill, with amber and a hatch pattern carrying the other data roles. | 2.8, 2.3 |

---

## 9. Implementation order

1. Tokens and the global reset: focus ring, `.sr-only`, skip link, scroll container, type scale, colour custom properties. Delete every hex in 2.5 first, so no stale value survives.
2. Sidebar (shared across all 6 artboards) with `aria-current` per screen.
3. Page-header grid (shared).
4. Table, button, link, field, badge, disclosure primitives.
5. Screen 5 (Report) - it carries the chart, the table conversion and the route, so it de-risks the rest.
6. Screen 6 (Member Detail), then 4, 3, 1, 2.
7. Verify: axe or equivalent with zero violations; keyboard-only walk of every screen with no trap and a visible ring on every stop; every ratio in sections 2 and 6 re-measured against the built page.
