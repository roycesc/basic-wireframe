# CLAUDE.md — FW / Forma Wireframe Kit

Context briefing for working in this repo. Last updated 2026-06-11.

## What this project is

A **black & white wireframe design system + component library** ("FW kit") for mocking up
product concepts for **Autodesk Forma Site Design** (the cloud AEC site-design tool,
formerly Spacemaker). Note: Stephen sometimes says "Adobe Forma" — it is **Autodesk**;
Adobe has no product called Forma.

Built in three layers, all static HTML/CSS with **no build step**:

1. **The kit** — tokens + ~50 components + icon sprite, documented in a living style
   guide (`index.html`, organized as drawing sheets FW-00…FW-06).
2. **Five product demos** (`demos/`) — full mockups of Forma's surfaces: project hub,
   3D design editor, sun-hours analysis, compare mode, board whiteboard.
3. **The interview prototype** (`prototype/`) — a 4-screen click-through narrative,
   "From Compare to Board", for Stephen's **Senior Principal Experience Designer
   interview**. This is the part most likely to change.

Repo: `github.com/roycesc/basic-wireframe` (private; `gh` authenticated as `roycesc`).
Everything runs from `file://` or `python3 -m http.server 8077`
(`.claude/launch.json` defines server `fw-kit` on port 8077).

## File map

```
css/tokens.css       ALL custom properties. The ONLY file allowed raw color values.
css/base.css         reset, type, focus, scrollbars, 8px debug-grid overlay (key: g)
css/components.css   every .fw-* component
css/app.css          shells: editor grid, canvas chrome, compare panes, hub, board
css/styleguide.css   sg-* styles for index.html ONLY (never used by demos/prototype)
js/shared.js         progressive enhancement: tabs, flyouts, modal, palette (/),
                     legend drag, debug grid (g), presenter click ring (r toggles)
assets/sprite.svg    CANONICAL icon sprite + SVG pattern defs — see "Sprite rule"
index.html           living style guide (sheets FW-00..FW-06)
demos/*.html         dashboard, editor, analysis, compare, board
prototype/           index.html (redirect → 01) + 01-compare, 02-frame, 03-board,
                     04-proposal
docs/screenshots/    14 JPEG captures: styleguide-{1..5}-of-5, 5 demos, proto-0{1..4}
screenshots/         Stephen's reference captures of the REAL Forma product (committed)
```

## Hard rules (the kit's constitution)

- **8px grid.** Heights, rows, layout gaps land on 8; 4px only inside components.
  Press `g` on any page for the baseline overlay.
- **Grayscale only.** Semantic color is replaced by patterns with legends:
  residential = 45° hatch · commercial = dots · parking = crosshatch · vegetation =
  dense dots · existing context = solid g300 · excluded = white-hatch overlay ·
  analysis ramp = 5 bands g100/g300/g500/g700/g900.
  **Single sanctioned chromatic exception:** `--fw-presenter-ring: #e5484d` (the
  presenter click ring — annotation layer, never product UI).
- **Colors only via `var(--fw-…)`.** Never a raw hex outside `tokens.css`
  (sprite `var(…, fallback)` greys excepted).
- **Components:** `.fw-` prefix, BEM-lite, **no external margins** (parents own
  spacing via gap), states via `.is-*` / aria attrs / native `<details>`.
- **JS is optional.** Every page must read correctly JS-off; interesting states are
  posed in markup (`.is-open`, `.is-selected`, `<details open>`).
- **Desktop only** (≥1280px), deliberately not responsive.
- Use Forma vocabulary: proposal, base layer, site limit, function, GFA, FAR,
  rapid vs detailed analysis, inspect, compare.
- Stacking: app bar sits at `--fw-z-flyout` (40), **above** rail/panels (20) — this
  fixed a real bug where the module menu rendered under the left panel. Don't regress.

### Sprite rule (important, non-obvious)

External `<use href="sprite.svg#id">` is **blocked over `file://`**, so an identical
copy of the sprite block is embedded as the **first child of `<body>` in every page**
(11 copies: canonical `assets/sprite.svg` + index + 5 demos + 4 prototype screens;
prototype pages carry a trimmed subset). After editing an icon, re-apply to all copies —
fixed-string `perl -pi -e 's{\Q<old line>\E}{<new line>}g' <files>` works because the
lines are byte-identical; verify with grep counts.

## Audits (run after any change; commands also in README)

```sh
# chromatic hex — must print EXACTLY one line: #e5484d (presenter ring)
grep -rhoE '#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b' css js demos prototype assets index.html | sort -u \
| perl -ne 'chomp; if(/^#(..)(..)(..)$/){print "$_\n" unless lc$1 eq lc$2 && lc$2 eq lc$3}
            elsif(/^#(.)(.)(.)$/){print "$_\n" unless lc$1 eq lc$2 && lc$2 eq lc$3}'
# token policy — must print nothing
grep -nE '#[0-9a-fA-F]{3,8}' css/components.css css/app.css css/base.css css/styleguide.css
```

## Git workflow

**PR-only — never push directly to `main`.** Branch → commit → push → `gh pr create`;
**Stephen merges PRs himself** (sometimes from his phone — don't merge for him, don't
be surprised if origin/main moves). Commit messages end with the Claude co-author
footer. History: PR #1 reference screenshots (merged), PR #2 README gallery (merged),
**PR #3 the prototype — OPEN** (branch `proto-compare-to-board`, commits: prototype +
fw-steps, menu z-fix + Autodesk logo swap, presenter click ring, landing redirect).

## The prototype ("From Compare to Board") — current design

Concept (interview narrative): *a site proposal should carry its analysis, trade-offs,
feedback, rationale and agreement as it moves from Compare to Board and back.* Closing
line: **"The decision travels with the site proposal, not the meeting."**

Flow and what's on each screen:

1. **01-compare.html** — Compare: 3 option cards (A Perimeter block, B Twin towers,
   C Stepped courtyard = recommended), criteria table (Daylight/Density/Carbon/Planning
   risk, Option C column highlighted), insight note → button **Frame for Review**.
2. **02-frame.html** — Frame for Review (640px column): decision question input,
   alternative + criteria chips, recommended-direction select (Option C), key trade-off
   textarea, requested-response checkboxes → **Send to Board** (ghost: Back to Compare).
3. **03-board.html** — Board review: decision frame on the 32px board grid — question,
   3 snapshot cards, trade-off summary, 2 feedback comments (Astrid Kram, client rep;
   Marta Boel, sustainability consultant), agreement "2 of 3 aligned" with Risk flagged
   badge → **Return rationale to site proposal**.
4. **04-proposal.html** — Proposal 2 — Option C with **Design intent** panel: Agreed
   status, rationale, accepted trade-offs, contributors, **Open Board review** (loops
   to 03), **View decision history** (modal `#proto-history`), closing note.

Mechanics shared by all 4 pages (keep consistent if the flow changes):

- **Light chrome:** app bar (Forma chip links to the matching full demo:
  Compare→`../demos/compare.html`, Board→`board.html`, Site Design→`editor.html`) +
  `fw-steps` bar (`Compare → Frame → Board → Proposal`; every item is a link;
  `.is-done` / `.is-current` states are **hardcoded per page**).
- **Arrow-key nav:** tiny inline `<script>` at the bottom of each page hardcodes that
  page's prev/next hrefs.
- **Entry point:** `prototype/index.html` is a meta-refresh redirect to the first
  screen — update it if Screen 1 changes.
- Content is **hardcoded in markup** (no data layer, presents offline). Cast: Stephen
  Royce (design lead, SR), Astrid Kram (client rep, AK), Marta Boel (sustainability,
  MB). Project: Nordhavn Waterfront.

**So: changing the prototype flow means** editing `prototype/0*.html` (steps-bar states,
button hrefs, arrow-key prev/next, breadcrumbs/chip per screen), possibly the redirect,
the README "Case study prototype" section, then recapturing `docs/screenshots/proto-*`.

## Capture pipeline (for refreshing docs/screenshots)

```sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1440,<pageheight> --virtual-time-budget=3000 \
  --screenshot=/tmp/out.png "http://localhost:8077/<page>"
```
Then PIL → JPEG q90 into `docs/screenshots/` (style guide: capture at full measured
height, slice into 5 with PIL). Gotchas learned the hard way:
- The sandbox shell **loses PATH after invoking Chrome** in the same Bash call — run
  Chrome loops and python/PIL conversions in **separate** Bash calls.
- `sips --cropOffset` silently fails at image edges — **use PIL for slicing**.
- The Claude-Preview panel screenshots scale weirdly at emulated viewports — use it for
  DOM/hit-test verification (`preview_eval` + `elementFromPoint`), headless Chrome for
  visuals. Browser caches CSS aggressively on reload — cache-bust stylesheet hrefs.
- Prototype capture heights used: 01→1100, 02→1180, 03→1500, 04→1100.

## Presenter aids (built into shared.js, work on every page)

- **Red click ring** (`r` toggles): every click flashes an expanding ring snapped to
  the clicked control's box (cursor-point fallback) — for guided demos.
- **8px grid overlay** (`g`), **command palette** (`/` on pages that include one).
- Arrow keys ← → step the prototype screens.
