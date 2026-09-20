# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

Personal website for Michael Schempp — michaelschempp.de.
Single Astro site with two sections: Professional (pro) and Hobby (pinball/arcade/retro).

## Commands

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Build static site to dist/
npm run preview  # Preview built site
```

## Tech Stack

- **Astro 6** — static site generator
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin
- **Content Collections** — Astro glob loader, config in `src/content.config.ts`
- **i18n** — Astro built-in, German default, English at `/en/`

## Site Structure

```
/                    Hub landing page
/pro                 Professional: About
/pro/projects        Pro projects list + detail
/pro/blog            Pro blog list + detail
/pro/cv              CV / Resume
/pro/contact         Contact form
/hobby               Hobby: About (pinball/arcade)
/hobby/projects      Hobby projects list + detail
/hobby/blog          Hobby blog list + detail
```

## Adding Content

All content is written as Markdown files:

```
src/content/pro/blog/my-post.md
src/content/pro/projects/my-project.md
src/content/hobby/blog/my-post.md
src/content/hobby/projects/my-project.md
```

### Frontmatter for blog posts

```yaml
---
title: "Post Title"
description: "Short description"
date: 2025-01-15
tags: ["Tag1", "Tag2"]
draft: false
---
```

### Frontmatter for projects

```yaml
---
title: "Project Title"
description: "Short description"
date: 2025-01-01
tags: ["Tag1", "Tag2"]
status: active # active | completed | wip
draft: false
---
```

## Design System

CSS custom properties in `src/styles/global.css`:
- `--color-pro` / `--color-pro-dim` — cyan accent for professional section
- `--color-hobby` / `--color-hobby-dim` — magenta accent for hobby section
- `--color-bg`, `--color-bg-surface`, `--color-bg-elevated` — dark backgrounds
- Light mode applied via `.light` class on `<html>`

## i18n

Translations in `src/i18n/de.ts` and `src/i18n/en.ts`.
Helper: `import { t, getLang } from '../i18n'`.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `hemi1986/michaelschemppde`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, used verbatim as label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
