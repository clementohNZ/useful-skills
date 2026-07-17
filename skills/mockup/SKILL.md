---
name: mockup
description: Create HTML mockups for ideas, features, or component redesigns. Use whenever the user asks for a "mockup", "mock-up", "mock up", "design concepts", "show me options/ideas", wants to explore or redesign a UI before building, or invokes /mockup (or /mockups). First briefly scope the request with a few clarifying questions — including a 1-10 creativity level (default 5) shown as a terminal gauge — which the user can skip at any time. Then produce distinct concepts in a SINGLE self-contained HTML file — 10 by default, or the exact number the user asks for — save it under the root mock-ups/ folder in a concept subfolder with a zero-padded 6-digit generation-order prefix, append to the mock-ups/manifest.js registry, and return the full absolute path to the file and to mock-ups/mockups.html.
---

# Mockups

Turn an idea or a "redesign this component" request into a set of visual concepts the user can open in a browser and pick from — **10 by default, or however many the user asks for**. Do this whenever the user asks for mockups/concepts/options or runs `/mockups`.

## How users invoke it

Users run it with any extra instructions right after the command (the chevrons are a placeholder):

```
/mockup <specify any instructions here>
```

Everything after the command is free-form context — what to design/redesign, plus optional count, creativity, motion, and reference hints. Users may also just ask in prose ("give me mockups for …"). Recognize requests like:

- `/mockup redesign the pull request detail page`
- `/mockup change the modal design — make it feel lighter and less cramped`
- `/mockup restyle our primary and secondary buttons`
- `/mockup a new empty state for the dashboard when there's no data yet`
- `/mockup redesign the settings page — give me 20 concepts`
- `/mockup the pricing hero section, creativity 9, with motion`
- `/mockup a mobile bottom navigation bar for the app`
- `/mockup loading + skeleton treatment for the reports table`
- `/mockup rework the sign-in screen — reference: none, go wild`
- `/mockup notification toast + banner styles, keep it strictly on-brand, no motion`

Honor any count / creativity / motion / reference hints already in the request, ask about the rest (see scope round below), and let the user skip with "just generate".

## Hard rules — never skip

1. **Concept count: 10 by default; honor a requested number.** If the user asks for a specific amount ("20 mockups", "give me 30", "at least 15"), produce **exactly that many** (or more if they say "at least N") — that number replaces the default. Otherwise produce 10. Never fewer than 10 unless the user explicitly asks for fewer. Every concept must be a *genuinely different* direction — different layout, structure, and idiom, not palette or copy swaps of one idea. Record the real count in the `concepts` field of the `manifest.js` entry.
2. **One single self-contained HTML file** per request. Everything inline (CSS + JS in the file); web fonts via CDN `<link>` are OK. No build step, no local external assets — it must open directly by double-clicking / `file://`.
3. **Always return the full absolute path** to (a) the new mockup file and (b) the `mock-ups/mockups.html` index, so the user can open and review immediately.
4. **Ground it in the real design system.** Before designing, learn how this product actually looks and is built, in this order of authority: (a) **design/theme markdown** — `DESIGN.md` (root or nearest the target), any `*DESIGN*.md` / `design*.md`, and brand/theme/token docs referenced by `AGENTS.md` or `CLAUDE.md`; (b) the **actual front-end code** — the design-system / UI package (e.g. `packages/ui*`, `components/ui`, a Storybook), shared primitives, and theme/token files (CSS custom properties, Tailwind/theme config, design tokens); (c) the **target component's own source** and neighboring components for real spacing, radius, borders, typography, and component tone. Pull these **real tokens and patterns** into the concepts so the mockups genuinely look like this product — not a generic template. Closest / most-specific source wins; if none exists, infer from whatever styling the app has.
5. **Mostly on-system, with a few deliberate breakouts.** Make the **majority** of concepts faithful to the discovered design system, so they're representative and shippable. But **always include a few that step outside the system** — bolder type, different structure, new color/motion ideas — so the user can see what it *could* look like beyond today's constraints. Mark those clearly (an "off-system" / "exploratory" note in the concept header). The number of breakouts scales with the **creativity level**: low (1-3) → 1-2 gentle ones; balanced (4-6) → a few; high (7-10) → many, pushing well past the current system while staying usable.
6. **Reserve sequence numbers atomically.** Multiple mockup agents may run in the same workspace. Never derive the next number with a plain scan-and-write: two agents can choose the same filename. Run the bundled reservation script before choosing the filename, and use exactly the returned `id` / `n`. Reservations are permanent by design, so an interrupted run may leave a harmless gap but a later run can never overwrite its number.

## Where files go

- Root folder: **`mock-ups/`** at the workspace root (the current project's root directory).
- **Group by concept** in a subfolder: `mock-ups/<concept-kebab>/` — e.g. `pull-request-detail/`, `changes-overview/`, `dashboard-empty-state/`. Reuse an existing subfolder when the new request is about the same subject so related explorations stay together.
- **Filename:** `NNNNNN-<slug>.html` where `NNNNNN` is the **globally reserved, zero-padded, 6-digit** number — `000001`, `000002`, `000003`, … The prefix is global across the whole `mock-ups/` tree (not per-subfolder).
  - Reserve it with `node "<mockup-skill-directory>/scripts/reserve-number.mjs" "<workspace-root>"`. Parse the JSON result and use its `id` for the filename/manifest `id` and its `n` for manifest `n`.
  - The script atomically creates `mock-ups/.sequence-reservations/NNNNNN` with exclusive-create semantics. Competing agents that calculate the same candidate cannot both claim it; the loser automatically retries with the next number.
  - Never delete or reuse a reservation, even if generation fails. Gaps preserve the no-overwrite guarantee.

## Scope it out first (ask — but never block)

Before generating, run **one short round of clarifying questions** so the concepts actually fit what the user wants. Keep it tight — a few questions asked together — then build. **The user can stop at any time**: "just generate", "go", "skip", or answering nothing means you proceed immediately with sensible defaults. Never interrogate; this is a quick scope, not a form.

Ask about:

- **What & where** — the exact component / page / idea, and where it lives (so you can read its source + design system).
- **Goal & audience** — the primary job this UI does and who uses it.
- **Must-haves / constraints / avoid** — data to show, key actions, states (empty / loading / error), anything off-limits.
- **Motion** — include animations, transitions, and micro-interactions, or keep everything static? *(remembered in the config)*
- **Reference mode** — how much to ground the styling: `design-md` (design markdown only) · `design-md+repo` (markdown **plus** the real front-end code / design system) · `none` (no reference — free-form). Default `design-md+repo`. *(remembered in the config)*
- **Inspiration / vibe** — any references or direction to lean into (separate from the reference mode above).
- **How many concepts** — default 10.
- **Creativity level (1-10, default 5)** — how far to push. Show it as a terminal-friendly gauge:

```
Creativity  [█████·····] 5/10   ·   grounded  ←→  experimental
```

Fill N of 10 cells for the level on the table and restate it when the user picks — e.g. `[███·······] 3/10`, `[████████··] 8/10`.

**How the creativity level maps to the concepts:**

- **1-3 · grounded** — conventional, safe, close to existing patterns and the current product; refinement over reinvention.
- **4-6 · balanced** (default 5) — mostly practical, with two or three bolder swings.
- **7-10 · experimental** — push layout, structure, and aesthetics hard; unexpected idioms and standout visuals — still usable, still on-brand.

Whatever the level, every concept stays genuinely distinct and production-quality.

## Preferences (`mock-ups/config.yaml`)

Persist the user's standing choices in **`mock-ups/config.yaml`** so you don't re-ask every time and they can tweak them over time.

- **First run** (no config yet): ask **motion?** and **reference mode?** as part of the scope round, then create `mock-ups/config.yaml` with the answers (write sensible defaults if the user skips).
- **Later runs**: read the config and apply it silently. Briefly surface the current settings so the user can change them; if they do, **update the file**.

Shape:

```yaml
# mock-ups/config.yaml — preferences for the `mockup` skill.
# Read on every run; updated whenever you change your mind.

# Include motion — animations, transitions, micro-interactions?
motion: true

# How much to reference when styling concepts:
#   design-md       → the project's design/theme markdown only
#   design-md+repo  → design markdown PLUS the real front-end code / design system
#   none            → no reference; free-form / generic design
reference: design-md+repo

# Optional standing defaults (still overridable per run):
default_creativity: 5   # 1-10
```

**What the settings do:**

- `motion: true` → include tasteful motion (transitions, hover/enter micro-interactions, subtle animation); `false` → everything static, no animation.
- `reference` gates how far you apply rules 4–5: `design-md` reads only the design markdown; `design-md+repo` does the full grounding (markdown + front-end code); `none` skips grounding entirely (design freely — the on-system / off-system split from rule 5 doesn't apply).

## Steps

1. **Scope it out first (unless told to skip).** Run the short clarifying round above — the creativity gauge, plus (on first run) the persisted **motion** and **reference-mode** questions. Read `mock-ups/config.yaml` if it exists and apply it silently (surface the current settings so they can tweak); if it's missing or the user changes a preference, write/update it. Stop the instant the user says go / skip / answers nothing, and proceed with defaults. A few questions, then build — never a form.
2. **Study the design system — per the `reference` preference (rules 4–5).** For `design-md`, read the design/theme markdown only; for `design-md+repo`, also read the actual front-end code (UI/design-system package, shared primitives, theme/token/Tailwind config) so you pull real tokens and components; for `none`, skip grounding and design freely. Use the user's real data/content — never lorem ipsum.
3. **Design the concepts** (10 by default, or the requested number) **at the chosen creativity level, honoring the `motion` preference** (tasteful animation when on; fully static when off). Keep the majority on-system and include a few clearly-marked off-system breakouts (rule 5; skipped when `reference: none`). Each concept is a genuinely different direction, not a variation.
4. **Reserve the next 6-digit number atomically** by running `node "<mockup-skill-directory>/scripts/reserve-number.mjs" "<workspace-root>"`. Keep the returned `id` and `n`; do not rescan or substitute another number.
5. **Before writing, assert the target path does not exist**, then create the single HTML file at `mock-ups/<group>/<reserved-id>-<slug>.html` using the stacked-page structure below. If that exact path exists despite the reservation, stop and reserve a new number; never overwrite it. `assets/mockup-template.html` in this skill is a starting scaffold — adapt it, don't ship it verbatim.
6. **Ensure the index is current.** Copy this skill's `assets/mockups.html` to `mock-ups/mockups.html` so existing projects receive gallery improvements; create `mock-ups/manifest.js` from `assets/manifest.js` only when the manifest is missing. Never overwrite an existing manifest.
7. **Append exactly one entry to `mock-ups/manifest.js`** using the reserved `id` and `n`. Re-read the manifest immediately before the anchored append; if another agent changes it first, re-read and retry. Never replace the whole manifest from a stale snapshot.
8. **Verify it renders** — open the new file in a browser, confirm every concept shows stacked and the anchor-nav rail scrolls to each; fix anything broken.
9. **Report the full absolute paths** to the new mockup file and to `mock-ups/mockups.html`.

## The HTML file structure (all concepts on one scrollable page)

Render **every concept stacked on a single scrollable page** — do NOT hide concepts behind a one-at-a-time selector. The user should see them all by scrolling.

- **All 10+ concepts are laid out top to bottom**, each in its own `<section>` with a unique `id`, rendered at realistic size with the user's real data.
- Each concept section has a header: a **number + title + one-line rationale**, plus a **"Choose this concept"** control that visibly marks the user's pick (highlight + banner) so they can just tell you the number.
- A **sticky left rail = anchor navigation**: one link per concept (numbered `01`…`10+`) whose `href="#<section-id>"` smooth-scrolls to that concept, so the user can jump quickly. Highlight the rail item for the concept currently in view (scrollspy via `IntersectionObserver`). The rail navigates; it does not hide/show.
- Keyboard/scroll friendly, reasonably responsive, and — when redesigning existing product UI — styled to match that product's theme.
- Use `scroll-behavior: smooth` and a small `scroll-margin-top` on the sections so anchored jumps land cleanly.

## The index (`mock-ups/mockups.html`)

- Static page that loads the registry via `<script src="./manifest.js"></script>` — this works over `file://`. Do **NOT** use `fetch()` for the manifest; browsers block `fetch` of local files.
- Defaults to **Recent** view: newest generation number first, divided into dated sections using `createdAt` so each generation day is visually distinct.
- Offers an optional persisted **Group** view that reorganizes the same newest-first rows by concept subfolder. Grouping is off for first-time users.
- Places **search**, **category filter**, **Recent / Group**, and **Side panel / New tab** controls together at the top of the left column, immediately above the results.
- The open-mode toggle is persisted: **Side panel** previews the selected mockup in an iframe on the right (master–detail — browse without leaving the index), and **New tab** opens each mockup with `target="_blank"`.
- Search filters by title, category, or prompt with match highlighting. The category dropdown works in either arrangement. Category sections are collapsible in Group view, and collapsed state is remembered.
- The left list is a **resizable sidebar**: drag the handle between the list and the preview (Pointer Events + pointer capture, so the drag keeps tracking over the preview iframe). By default it **auto-fits to the widest row** so concept titles never truncate.
- When there are **no mockups yet**, it shows an **onboarding empty state** — what the skill does, how to run it (`/mockup` or just ask), an example prompt, and the `npx skills add …` install hint — so a first-time user knows how to start.
- **Preferences (arrangement, open mode, sidebar width, collapsed categories) persist in a cookie**, with a `localStorage` fallback so they survive a refresh even over `file://` (where browsers drop cookies).
- Refresh this index from the skill asset when running the skill; append registry entries only to `manifest.js`.

## `manifest.js` entry shape

```js
window.MOCKUPS = window.MOCKUPS || [];
window.MOCKUPS.push({
  n: 1,                                                   // global sequence, integer
  id: "000001",                                           // zero-padded 6-digit string
  title: "PR detail body",                                // human-readable title
  group: "pull-request-detail",                           // concept subfolder
  path: "pull-request-detail/000001-pr-detail-body.html", // path relative to mock-ups/
  concepts: 10,                                           // how many concepts in the file
  createdAt: "2026-07-17",                                // ISO date
  prompt: "one-line summary of what was asked",
});
```

## Definition of done

- [ ] The requested number of genuinely distinct concepts (**10 by default**) in **one** self-contained HTML file, stacked on one scrollable page.
- [ ] Honors `mock-ups/config.yaml` — the `reference` grounding mode and the `motion` on/off preference (config created/updated as needed) — and reads like this product, not a generic template.
- [ ] Saved at `mock-ups/<group>/<reserved-id>-<slug>.html` using the atomic reservation script; the target was confirmed absent and never overwritten.
- [ ] `mock-ups/manifest.js` appended from a fresh snapshot with the same reserved `id` / `n`; `mock-ups/mockups.html` present.
- [ ] Rendered and verified in a browser.
- [ ] **Full absolute paths reported** — the mockup file *and* the index.
