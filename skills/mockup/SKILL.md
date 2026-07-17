---
name: mockup
description: Create HTML mockups for ideas, features, or component redesigns. Use whenever the user asks for a "mockup", "mock-up", "mock up", "design concepts", "show me options/ideas", wants to explore or redesign a UI before building, or invokes /mockup (or /mockups). Produce distinct concepts in a SINGLE self-contained HTML file — 10 by default, or the exact number the user asks for (e.g. "20 concepts", "give me 30") — save it under the root mock-ups/ folder in a concept subfolder with a zero-padded 6-digit generation-order prefix, append to the mock-ups/manifest.js registry, and return the full absolute path to the file and to mock-ups/mockups.html.
---

# Mockups

Turn an idea or a "redesign this component" request into a set of visual concepts the user can open in a browser and pick from — **10 by default, or however many the user asks for**. Do this whenever the user asks for mockups/concepts/options or runs `/mockups`.

## Hard rules — never skip

1. **Concept count: 10 by default; honor a requested number.** If the user asks for a specific amount ("20 mockups", "give me 30", "at least 15"), produce **exactly that many** (or more if they say "at least N") — that number replaces the default. Otherwise produce 10. Never fewer than 10 unless the user explicitly asks for fewer. Every concept must be a *genuinely different* direction — different layout, structure, and idiom, not palette or copy swaps of one idea. Record the real count in the `concepts` field of the `manifest.js` entry.
2. **One single self-contained HTML file** per request. Everything inline (CSS + JS in the file); web fonts via CDN `<link>` are OK. No build step, no local external assets — it must open directly by double-clicking / `file://`.
3. **Always return the full absolute path** to (a) the new mockup file and (b) the `mock-ups/mockups.html` index, so the user can open and review immediately.
4. **Respect the project's design system.** Before designing, discover and read any design/theme markdown in the repo — `DESIGN.md` (root or nearest to the target area), any `*DESIGN*.md` / `design*.md`, and brand/theme/token docs referenced by `AGENTS.md` or `CLAUDE.md`. Treat the closest, most-specific design MD as **authoritative**: pull its color tokens, typography, spacing, radius, borders, and component tone into every concept so the mockups look like they belong to this product — not a generic template. If several apply, the one nearest the thing you're redesigning wins. If no design MD exists, infer the system from the app's theme/token files and existing components.

## Where files go

- Root folder: **`mock-ups/`** at the workspace root (the current project's root directory).
- **Group by concept** in a subfolder: `mock-ups/<concept-kebab>/` — e.g. `pull-request-detail/`, `changes-overview/`, `dashboard-empty-state/`. Reuse an existing subfolder when the new request is about the same subject so related explorations stay together.
- **Filename:** `NNNNNN-<slug>.html` where `NNNNNN` is a **global, zero-padded, 6-digit** number in generation order — `000001`, `000002`, `000003`, … The prefix is global across the whole `mock-ups/` tree (not per-subfolder) so files always sort in the exact order they were created, with no numeric-sorting surprises.
  - **Next number = (highest `NNNNNN` found anywhere under `mock-ups/**` and in `manifest.js`) + 1.** If nothing exists yet, start at `000001`.

## Steps

1. **Understand the ask and the design system.** If redesigning an existing component/page, read its source. Then apply hard rule 4: find and read any design/theme markdown (`DESIGN.md`, etc.) and the project's token/theme files, and make every concept honor those tokens. Use the user's real data/content — never lorem ipsum.
2. **Design the concepts** (10 by default, or the requested number). Follow the `frontend-design` skill's quality bar (bold, non-generic, production-grade) *within* the project's design system. Each concept should feel like a different answer to the question, not a variation.
3. **Compute the next 6-digit number** (see above) and pick the concept subfolder.
4. **Write the single HTML file** at `mock-ups/<group>/NNNNNN-<slug>.html` using the stacked-page structure below. `assets/mockup-template.html` in this skill is a starting scaffold — adapt it, don't ship it verbatim.
5. **Ensure the index exists.** If `mock-ups/mockups.html` or `mock-ups/manifest.js` is missing, create them by copying this skill's `assets/mockups.html` and `assets/manifest.js`.
6. **Append exactly one entry to `mock-ups/manifest.js`** (the index reads this — you do NOT hand-edit `mockups.html`).
7. **Verify it renders** — open the new file in a browser, confirm every concept shows stacked and the anchor-nav rail scrolls to each; fix anything broken.
8. **Report the full absolute paths** to the new mockup file and to `mock-ups/mockups.html`.

## The HTML file structure (all concepts on one scrollable page)

Render **every concept stacked on a single scrollable page** — do NOT hide concepts behind a one-at-a-time selector. The user should see them all by scrolling.

- **All 10+ concepts are laid out top to bottom**, each in its own `<section>` with a unique `id`, rendered at realistic size with the user's real data.
- Each concept section has a header: a **number + title + one-line rationale**, plus a **"Choose this concept"** control that visibly marks the user's pick (highlight + banner) so they can just tell you the number.
- A **sticky left rail = anchor navigation**: one link per concept (numbered `01`…`10+`) whose `href="#<section-id>"` smooth-scrolls to that concept, so the user can jump quickly. Highlight the rail item for the concept currently in view (scrollspy via `IntersectionObserver`). The rail navigates; it does not hide/show.
- Keyboard/scroll friendly, reasonably responsive, and — when redesigning existing product UI — styled to match that product's theme.
- Use `scroll-behavior: smooth` and a small `scroll-margin-top` on the sections so anchored jumps land cleanly.

## The index (`mock-ups/mockups.html`)

- Static page that loads the registry via `<script src="./manifest.js"></script>` — this works over `file://`. Do **NOT** use `fetch()` for the manifest; browsers block `fetch` of local files.
- Renders every mockup grouped by concept subfolder, ordered by the global number, each row showing its title/date/concept-count.
- Has an **open-mode toggle** (persisted): **Side panel** previews the selected mockup in an iframe on the right (master–detail — browse without leaving the index), and **New tab** opens each mockup with `target="_blank"`.
- Has **search** (filters by title, category, or prompt, with match highlighting) and a **category filter** dropdown.
- The left list is a **resizable sidebar**: a drag handle between the list and the preview resizes it (width persisted to `localStorage`). By default it **auto-fits to the widest row** so concept titles never truncate.
- When there are **no mockups yet**, it shows an **onboarding empty state** — what the skill does, how to run it (`/mockup` or just ask), an example prompt, and the `npx skills add …` install hint — so a first-time user knows how to start.
- You almost never edit this file; you only append entries to `manifest.js`.

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
- [ ] Honors the project's design MD / tokens (`DESIGN.md` etc.) — reads like this product, not a generic template.
- [ ] Saved at `mock-ups/<group>/NNNNNN-<slug>.html` with a **global 6-digit** prefix.
- [ ] `mock-ups/manifest.js` appended; `mock-ups/mockups.html` present.
- [ ] Rendered and verified in a browser.
- [ ] **Full absolute paths reported** — the mockup file *and* the index.
