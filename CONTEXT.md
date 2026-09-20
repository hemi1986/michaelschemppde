# Domain Model — michaelschempp.de

## Glossary

### Hub
The root page (`/`). Not a landing page or a router — a deliberate identity statement. The one place where both sides of Michael Schempp are visible together: the professional and the hobbyist. Visitors choose a Section from here, but the Hub itself carries meaning: one natural person, two distinct professions.

### Section
One of two independent mini-sites (`pro` or `hobby`) that share a common shell (layout, nav chrome, design system) but are otherwise autonomous: separate navigation, separate accent color, separate content vocabulary. A Section belongs to exactly one identity facet of the person behind the site.

### Pro Section
The professional mini-site. Covers software architecture, engineering leadership, platform engineering. Has its own nav (About, Engagements, Blog, CV, Contact).

### Hobby Section
The hobby mini-site. Covers pinball restoration, arcade, retro gaming. Has its own nav (About, Restorations, Blog) — no CV or Contact equivalent.

### Project
A piece of work documented in either section. The term is shared, but the meaning is section-specific. In Pro: a professional engagement — an architecture built, a system designed, a consulting project. In Hobby: anything built or restored — a machine restoration, a new build (e.g. a virtual pinball cabinet), a mod. The schemas will diverge over time: Hobby Projects may gain fields like `machine`, `manufacturer`, or `year` that Pro Projects will never need.

### About Page
A section's self-introduction page (`/pro`, `/hobby`). Bio text, expertise/skill highlights, and recent content previews. Content-driven: bio and skills are authored in a content file (not baked into translations). Layout and visual structure are defined in the page component.

### Publication Status
The lifecycle state of an Engagement or Restoration. Two states only: `ongoing` (currently active or in progress) and `completed` (finished). Rendered as a visible badge on list and detail pages.

### Draft
An unpublished piece of content. Visible in local development (so it can be previewed while being written), filtered from production builds. No further visibility states exist — content is either draft or published.

### Contact Page
A "how to reach me" page listing channels where the person can be contacted — email, social profiles, community links. Not a form. Both sections have a Contact Page, but with different content: Pro lists professional channels (LinkedIn, GitHub, work email); Hobby lists hobby-relevant channels (pinball community, collector networks, etc.). The current code implements a contact form — that is incorrect and should be replaced.

### Tag
A categorical label on a piece of content. Tags are per-section: Pro and Hobby maintain separate controlled vocabularies defined in code. Pro tags cover professional topics (Architecture, Leadership, Cloud Native, etc.). Hobby tags cover repair and gaming topics (Pinball, Arcade, LED Modding, etc.). Tags from one section carry no meaning in the other.

### Language Variant
A localized version of a piece of content. German (`de`) is always the canonical language — authored first, always present. English (`en`) is an optional translation. The slug is the content's identity; the language is an attribute. A missing EN translation falls back to DE rather than producing a 404.

### CV
The résumé as a rendered page of the Pro Section (`/pro/cv`). Content-driven (not baked into translations): roles, descriptions, and skills are authored as structured data separate from the i18n layer. Rendered with full design control — the CV page layout is a first-class template, not a generic content renderer. Addresses a visitor browsing the site, so it is written as a narrative.

### Lebenslauf-Dokument
A standalone résumé artifact under `public/files/pro/`, authored as its own self-contained HTML document and meant to be printed or sent as a formal application. Deliberately **not** generated from the [[CV]] content collection: it addresses a recruiter reading an application rather than a site visitor, so it carries different emphasis, more detail, and a print layout. Differences in wording and emphasis between the two are intentional, not drift — but factual claims (dates, job titles, employers) must agree across both.

### Article
A blog post in the Pro Section. Opinion or analysis piece addressed to a professional audience. Topics: architecture decisions, engineering leadership, technology opinions.

### Log Entry
A blog post in the Hobby Section. First-person narrative tied to a specific machine or repair technique — a restoration diary. Will eventually want a `machine` reference and repair-specific metadata that an Article would never need.
