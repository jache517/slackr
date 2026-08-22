# Slackr - Final build spec

Supersedes nothing. Reads on top of `DESIGN_SPEC.md`, which stays the authority for
tokens, copy, semantics and accessibility. This file records the six per-screen layout
decisions taken on 22 Aug 2026 and the one deliberate deviation from the spec.

Two sources are being merged:

- **Prototype** = `design/prototype/` (spec v2 build). Correct tokens, real semantics,
  full a11y. Layouts run tall and stacked.
- **Reimagined** = `design/reimagined/` (the v1 design, extracted from artifact
  `89bee073`). Scored 55/100 and uses 22 blacklisted hexes, `<div>` nav items, 10px
  type and fake tables. Its **layouts** are denser and read better.

## The one rule that governs every merge

Take Reimagined's **layout, density and rhythm**. Keep Prototype's **tokens, elements,
ARIA and copy**. No hex, type size, spacing step or element choice crosses over from
Reimagined. If a Reimagined layout only works because of a 13px size or a 1.4.11-failing
border, the layout gets rebuilt on Prototype tokens, not the tokens relaxed.

Concretely, everything below is a change to **arrangement**. The type ramp stays
42/24/20/16/14/11, the five greys stay five, the focus ring stays one definition, every
table stays a real `<table>`, every control stays a real control.

---

## 1. The header block: the deliberate deviation

**Problem.** Every screen opens with an eyebrow line plus a three-to-four-sentence deck.
It reads as a wall of text before the reader reaches anything they can act on.

**Resolution.** The deck paragraph is deleted from all six screens. The eyebrow line and
the deck merge into a single **meta line**: 11px uppercase `--t-eyebrow`, `--ink-500`,
items separated by a 3px `--ink-300` dot. Where the `<h1>` genuinely needs a qualifier it
gets **one** sentence at `--t-body` `--ink-500`, hard-capped at roughly 90 characters.

Every fact removed from a deck moves to the element that already owns it. No number
leaves the screen, so 7.4 and 7.7 still hold.

| Screen | Meta line | Qualifier sentence | Where the removed sentences go |
|---|---|---|---|
| 1 Projects | none | none | the three bucket `<h2>`s and each card's status line already say it |
| 2 New Project | `Step 1 of 2` (the stepper) | `Two steps. You'll invite the group with a link at the end.` | the summary panel's closing paragraph |
| 3 Members | none | `Work under an unmatched account is left out of the report.` | `The four members below are all linked.` moves into the table `<caption>`, which already carries the all-clear |
| 4 Dashboard | `COMP30022 Final Project · due 30 Aug 2025 · 4 of 5 checks pass` | none | the fifth check's specifics stay in its blocked checklist row, which is where 7.9 puts them |
| 5 Report | `COMP30022 Final Project · 1 to 30 Aug 2025 · 103 events · 4 members` | none | the share definition and the "not the quality or difficulty of anyone's work" caveat join the definition paragraph inside the chart card |
| 6 Member Detail | `Kevin Liu · COMP30022 · 1 to 30 Aug 2025 · 7% share · even split 25%` | none | the per-measure comparisons are the `% of median` column; "read Kevin's note" is redundant with the note panel sitting directly below |

**What this costs.** Non-negotiable 1 of the original brief said the deck copy was
verbatim. This overrides it on the user's instruction. The reconciling numbers
(49/40/14/103, 35/30/28/7, 16/12/4, 13/25/50) are untouched and all still appear.

---

## 2. Screen 1 - Projects

Prototype sidebar. Reimagined main interface.

- **Cards become one horizontal row each**, vertically centred:
  `[44px monogram tile] [text block, flex:1] [sparkline + trend word, right-aligned] [action]`
  Replaces Prototype's stacked block. Card padding 24px, gap 16px.
- Text block is three lines at 4px gap: `<h3>` title link, status line, meta line.
- The sparkline column right-aligns and keeps the visible direction word beneath it
  (`Rising` / `Not enough data`), per rule 7.10. Reimagined's `Last 4 weeks` label is
  **not** carried over: it would be a fourth channel with no data behind it.
- Trailing action per card: COMP30022 keeps `Match it on Members` as a primary button.
  INFO20003 and SWEN30006 get **nothing** - one link per card (C9), and the `<h3>` is it.
- Attention card keeps Prototype's 4px `--amber-800` left edge, not Reimagined's
  full 1px `#f0dcbb` border (1.27:1).
- Header: `<h1>` and the `New Project` primary only. No deck.

## 3. Screen 2 - New Project

Prototype version, unchanged, except the header per section 1.

The empty-field state is deliberate: it is what makes the blocked `Next`, the summary
panel's `Not set yet` and the validation path reachable. Filling the three fields
produces the populated look. Nothing else changes.

## 4. Screen 3 - Members

Prototype version, with the **warning card restyled to Reimagined's shape**:

- Border: **full 1px `--amber-800` on all four edges**, replacing the 4px left edge.
  This is the user's call and is contrast-safe: `--amber-800` is 7.48:1 on white, well
  past the 3:1 the 4px edge was buying. Applies to this card only; the Projects
  attention card keeps its left edge.
- One horizontal row, vertically centred:
  `[44px amber tile] [<h2> + status line, flex:1] [<label> + <select> + Match, right]`
- The `Match to a member` label sits above the select in the right-hand cluster, so the
  cluster is `[field][button]` with 12px gap and `align-items: flex-end`.
- `Choose a member first.` reason line sits under the button pair, still wired by
  `aria-describedby`. It must not push the row height around when it hides.
- Everything else - the real `<select>`, `aria-disabled` `Match`, the roster `<table>`
  with `<colgroup>` 30/22/34/14, the match toast with `Undo` - stays as built.

## 5. Screen 4 - Project Dashboard

Reimagined layout, Prototype sidebar and tokens.

- **Checklist becomes full-width rows inside one card**, separated by 1px `--rule`
  hairlines, last row borderless. Row: `[20px icon] [220px name] [detail, flex:1]
  [optional inline action, right]`, 16px vertical padding. Replaces the 24px-gap list.
- The status word (`Done` / `Blocked`) stays visible in the detail column per 3.12.
- **Header carries two buttons**, Reimagined's pairing, secondary first:
  `[Generate the report without those 6 commits] [Match it on Members]`
  The consequential button moves out of its own card and into the header cluster. Its
  consequence line moves with it, sitting under the pair at `--t-body` `--ink-500`,
  still wired by `aria-describedby`. Competing actions stay at 3 with the back link
  excluded.
- **Unmatched-account sidenote.** Below the checklist card, a tinted strip:
  `--tint-amber` background, `--r-card`, 16px 20px padding, 18px `--amber-800` warning
  icon, text in `--amber-800`. Copy is the spec's, unchanged:
  `1 GitHub account, a-zhang-uni, is matched to nobody. Its 6 commits are left out.`
  It renders only when a check is open; the ready variant drops it.
- Disclosure and its four stat tiles stay as built, below the strip.

## 6. Screen 5 - Contribution Report

Reimagined layout, rebuilt on Prototype's semantics. This is the flagship; `Main.dc.html`.

- **One card holds the whole chart**: `<h2>`, definition paragraph, the table, the axis,
  the disclosure and the raw counts. Reimagined's single-card composition, not
  Prototype's three stacked cards.
- **The bar row is still a real `<table>`.** Reimagined's flex rows are the visual
  target, not the markup. Column widths tighten to Reimagined's proportions:

  | Column | Prototype | Final |
  |---|---|---|
  | Member | 19% | 16% |
  | Share | 9% | 8% |
  | Bar (0 to 40% of activity) | 46% | **38%** |
  | Trend | 12% | 22% |
  | Standing | 14% | 16% |

  That is the "shorten the percentage line" change: the bar loses 8 points so the trend
  and standing columns stop crowding. The 0-to-40% axis, the tick row, the dashed
  even-split at 62.5% of track and the `Even split 25%` annotation are unaffected -
  they are proportional to the column, not absolute.
- Bar track height stays 14px with its 1px `--ink-300` outline. Reimagined's 12px
  `#ececf2` track (1.18:1) does not carry over.
- Standing badge keeps `--r-pill` and its leading glyph; it does **not** become
  Reimagined's fixed 96px centred pill, which would strand it from the row.
- **The precondition card moves back above the chart.** Reimagined put it at the bottom
  as an indigo info strip; Fix 12 exists because that is the wrong reading order. It
  keeps Prototype's position, its `<h2>Before you rely on this</h2>` and its
  `Match it on Members` action, and takes the Members warning card's full 1px
  `--amber-800` border for consistency.
- Disclosure row picks up Reimagined's arrangement: the toggle button left, and the
  invitation copy `Select a name to see how that member compares.` right-aligned on the
  same line, above the axis rather than in the definition paragraph.
- Row links to Member Detail, row hover, `:focus-within` ring and the row-click forward
  all stay.

## 7. Screen 6 - Member Detail

Reimagined layout, Prototype semantics.

- **Each measure becomes a tight two-row block**: a `<h3>` label, then two rows at 10px
  gap. Row: `[112px who] [bar, flex:1] [76px count, right] [76px % of median, right]`.
  Replaces Prototype's four-column table geometry. Still a real 2-row `<table>` per
  measure with `<caption>` and `<th scope>`; only the proportions change.
- The `scale 0 to 20 commits` text stays at the right of the `<h3>` line.
- Member bar solid `--amber-800`; median bar keeps the unfilled 2px `--indigo-600`
  outline plus hatch. Reimagined's `#c7c4f4` filled median bar (1.41:1) does not carry
  over - fill-versus-outline is the shape channel that makes the pair readable.
- **Note panel takes Reimagined's shape**: `--tint-indigo` block, 20px 24px padding,
  an 18px `--indigo-600` speech icon beside the `<h2>`, then the serif italic quote and
  the attribution line. Heading text stays the spec's `Kevin's own note`, at
  `--t-subhead` 20px, not Reimagined's 14px. Quote stays `--t-quote` 24px
  `--indigo-700`, inside `<figure>/<blockquote cite>/<figcaption>`.
- The eight disclosure tiles stay as built. Reimagined's set invented `Pull requests`,
  `Issues closed`, `Repositories` and `Comments`, none of which exist in the data model
  in 7.1; those are dropped.

---

## 8. Canvas

Unchanged. Six artboards, 1440x900, two rows of three, 160px between columns, 420px
between rows, launching on the canvas view.

| File | Title | x | y |
|---|---|---|---|
| `Projects.dc.html` | 1. Projects | 0 | 0 |
| `NewProject.dc.html` | 2. New Project | 1600 | 0 |
| `Members.dc.html` | 3. Members | 3200 | 0 |
| `Dashboard.dc.html` | 4. Project Dashboard | 0 | 1320 |
| `Main.dc.html` | 5. Contribution Report | 1600 | 1320 |
| `MemberDetail.dc.html` | 6. Member Detail | 3200 | 1320 |

Published to artifact `dcc6dc5c-56fd-4e90-9a96-6bb09c8100c1`; rebuilds republish the
same URL.

## 9. What stays working

The interaction set is unchanged by any of the above: three disclosures with
`aria-expanded` and a rotating chevron, the New Project form with live summary and
validation, the Members select and its `aria-disabled` `Match`, both dialogs, both
toasts with `Undo`, and hover / active / `:focus-visible` on every interactive element.

## 10. Still open

- The not-connected cascade (7.8) ships unrendered. The SWEN30006 card on screen 1 is
  the only place it appears. No seventh artboard.
- Three of the six `<h1>`s open with "One". Flagged for a copy pass; not changed here.
- Cross-artboard navigation is not possible in this format. Links carry the spec's real
  hrefs but do not move between artboards.
