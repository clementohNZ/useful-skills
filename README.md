# useful-skills

A personal library of reusable **[Agent Skills](https://www.anthropic.com/news/skills)** — self-contained `SKILL.md` bundles that teach coding agents (Claude Code, and other [skills.sh](https://skills.sh)-compatible tools) a repeatable workflow.

Each skill is a folder with a `SKILL.md` (instructions + trigger description) and optional `assets/` (templates, scripts). Drop one into an agent's skills directory and it becomes available automatically — triggered by its description or an explicit slash command.

## Install

### Via `skills.sh` (recommended)

The [`skills` CLI](https://github.com/vercel-labs/skills) installs skills straight from this repo — no clone required.

```bash
# Browse what's in here
npx skills add clementohNZ/useful-skills --list

# Interactive install (pick skills + scope)
npx skills add clementohNZ/useful-skills

# Install a specific skill, globally, for Claude Code, non-interactive
npx skills add clementohNZ/useful-skills --skill mockup -g -a claude-code -y
```

- `-g` / global → installs to your home skills dir (e.g. `~/.claude/skills/`), available in **every** project.
- omit `-g` → installs into the current project (e.g. `.claude/skills/`), committed with your repo and shared with your team.
- `-a <agent>` targets a specific assistant (`claude-code`, `opencode`, `cursor`, …). Update later with `npx skills update <name>`.

Start a fresh agent session after installing — skills load at startup.

### Manually

Copy the skill folder into your agent's skills directory:

```bash
# Global (Claude Code)
cp -R mockup ~/.claude/skills/mockup

# …or project-scoped
cp -R mockup /path/to/your/project/.claude/skills/mockup
```

## Available skills

| Skill | Invoke | What it does |
| --- | --- | --- |
| **mockup** | `/mockup` (or `/mockups`), or ask for "mockups / design concepts" | Generates HTML mockups for an idea or a component redesign: **10 distinct concepts by default (or however many you ask for)** in a **single self-contained HTML file**, all stacked on one scrollable page with anchor-nav. Saves everything under a root `mock-ups/` folder (grouped subfolders, zero-padded 6-digit generation-order prefixes) and maintains a searchable `mock-ups/mockups.html` index with side-panel preview + new-tab modes. Respects the project's design system (`DESIGN.md` / theme tokens) so concepts look like the real product. |

## Repository layout

```
useful-skills/
├── README.md
├── LICENSE
└── mockup/
    ├── SKILL.md            # skill instructions + trigger description
    └── assets/             # templates the skill copies into a project
        ├── mockups.html        # the mock-ups index (master–detail + search)
        ├── manifest.js         # append-only registry the index reads
        └── mockup-template.html# starter scaffold for a mockup file
```

Each top-level folder is one skill. Adding a skill = add a new folder with its own `SKILL.md`.

## Authoring notes

A `SKILL.md` starts with YAML frontmatter:

```yaml
---
name: my-skill
description: What it does and when to use it — this is what agents match against to auto-trigger the skill.
---
```

Write the `description` so it fires on the right requests; keep the body imperative and self-contained. See `mockup/SKILL.md` for a worked example.

## Security

Only install skills from sources you trust, and review a `SKILL.md` before installing — a skill instructs an agent to run real actions on your machine.

## License

MIT © Clement Oh. See [LICENSE](./LICENSE).
