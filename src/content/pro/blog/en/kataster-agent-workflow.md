---
title: "Kataster: How My Agent Workflow Became a Project of Its Own"
description: "A month ago I introduced my agent workflow for La Guardia here. Since then it has become a standalone open-source project, and along the way the product owner, the requirements engineer and the lead dev got fired. An update."
date: 2026-11-09
tags: ["Claude Code", "OpenCode", "AI", "Agentic Engineering", "Spec-Driven Development", "Domain-Driven Design", "Open Source"]
draft: false
---

At the end of the [first post about the workflow](/en/pro/blog/laguardia-agent-workflow) I left a few open questions: Is the whole thing overengineered? Do I really still have to accept the PRs myself? And how do you put a workflow like this on a project that already has tons of code? I had also announced that I wanted to turn the framework into a repo of its own.

Almost a month later I can say something about all four. The repo exists: **Kataster**, public at [github.com/hemi1986/kataster](https://github.com/hemi1986/kataster) and installable via npm. And [La Guardia](/en/pro/projects/laguardia-pinball-manager), the machine management software for our museum, is now being built with it.

## First things first: What happened in La Guardia?

A quick status so the numbers make sense. In the first post I had 55 stories in the backlog, and not a single domain story had been started. Today there are 127 stories, 116 of them done, plus more than 220 merged pull requests and 20 architecture decisions. So the thing works, and it works pretty well.

But: That was not thanks to the original workflow, it was thanks to what I changed along the way. Every bigger change came out of a retro. The agent looks at a session, I say what annoyed me, and at the end there is a proposal for which rule changes. The three most important retros in short:

- **End of September: get leaner.** I already described this in the first post: reviews scaled by risk, a hurdle for follow-up stories, foundation only when it is needed.
- **End of October: discovery was too expensive.** A story was reviewed by the product owner, the lead dev and the UX designer, and then the requirements engineer reworked it once more. That ate tokens and, above all, time. Result: a single review pass, at most ten scenarios per story, and the test plan no longer waits for my approval.
- **One day later: the acceptance tester accepts.** That was the answer to my own question from the first post. If an agent already checks whether the acceptance criteria are met, why should I do it a second time? Since then the acceptance tester sets the story to `done`, and I only look at the pull request and merge. If something goes badly wrong, I still get asked, of course.

## From project folder to package

At some point it was clear that the workflow had nothing to do with La Guardia. Skills, hooks, validators, subagents: all of that is generic, it just happened to live in the pinball repo. So I pulled it out. The first standalone version was actually still called "La Guardia", which gets confusing at the latest when you install it into a project that has nothing to do with pinball. Since version 0.2 it is called **Kataster**.

The name is no accident. A Kataster is the German official register of land parcels and their boundaries: a map that is maintained, not invented. That is exactly how the domain model should feel. The bounded contexts are the parcels, the glossary and the data model are the entries, and nothing goes in without evidence. (And let's be honest: a German bureaucracy word as the name of a developer tool, I just had to.)

Installation is now a single command:

```bash
npx kataster init
```

The installer detects the stack, asks four questions and then writes `.claude/`, `.opencode/`, an `AGENTS.md` and a `docs/` skeleton into the repo. Existing files are merged instead of overwritten. `npx kataster upgrade` updates an existing installation and leaves locally changed files alone. That is exactly how I have upgraded La Guardia several times already.

Two things came along with the extraction that I did not have on my radar before:

- **OpenCode.** Kataster no longer runs only with Claude Code but also with [OpenCode](https://opencode.ai). `.claude/` stays the single source of truth, `.opencode/` is just an adapter that uses the same skills, agents and hooks. That also means I am no longer tied to one model or one provider.
- **Issue trackers.** In the first post I wrote that there is no external issue tracker (but it wouldn't be a problem). Now there is one: stories can stay local or live in GitHub Issues or Jira. In that case the tracker is the source of truth and `docs/stories/` is just a synchronized mirror that all the checks run on.

## The layoffs: no more business roleplay

Now to the part I was looking forward to the most. In the first post I was fascinated by how the subagents behaved exactly like the roles I know from real projects. The lead dev wants to split the story, the product owner thinks it is great, the requirements engineer rewrites it nicely afterwards. I found that amusing.

After a few weeks I just found it exhausting. To be honest, I had simply copied the problems of the real world into the workflow:

- **Endless discussions.** Three roles, three opinions, and in the end I still had to decide.
- **Unpredictable stories.** Sometimes an agent cut a story down, sometimes it inflated it. What it looked like depended on who touched it last.
- **No shortcut for small stuff.** A button that needs to move two pixels to the left went through the same mill as new business logic.
- **No deterministic check.** Whether a story was "done" was decided by a language model. Exactly what I wanted to avoid: the LLM generates, code checks.

So with version 0.4, **the product owner, the requirements engineer and the lead dev are gone entirely**. Instead, the main session writes the stories itself, as a kind of "spec engineer" with three lenses at once: domain, architecture and testability. The roles have not disappeared, they now just live in the same head, which, by the way, wouldn't be the worst solution in the real world either.

In return there are a few hard, mechanical rules:

- **The 1-command rule.** A domain story is exactly one command plus its events on exactly one aggregate, with at most four Gherkin scenarios. Aggregate and command are required fields in the story and are checked against the event storming model. Two commands means two stories. The "is this story too big?" discussion simply goes away.
- **A spec linter instead of a reviewer.** Whether a story is complete is now checked by a script: required fields, references to aggregates, commands and events, `Given/When/Then`, the scenario limit, unique titles. No LLM, no tokens, the same result every time. When the linter is green, the story is `ready-for-human-review`, and only I set it to `ready`.
- **A fast lane.** UI tweaks, refactorings and dependency updates run as `chore` or `task`: branch, implement, lint, types, unit tests, pull request. No Gherkin, no formal reviews.
- **Reviewers report, they don't plan.** The code reviewer and the acceptance tester may no longer create, split or rewrite stories. A finding is fixed in the story or handed back as an open question. That also finally ends the flood of follow-up stories I complained about in the first post.

What is left are agents that bring a real perspective and not just a job title: the domain architect, the code reviewer, the acceptance tester, and a UX designer who now only comes on demand and is no longer a gate anywhere.

Upgrading La Guardia then produced the classic: the new linter, of course, hated the old stories that had long been implemented, and the backlog suddenly turned red. The fix: old stories with status `done` are checked against the old rules, new ones against the new rules. Grandfathered in, just like in a real land register.

## The brownfield question

The second big open question from the first post was how to put a workflow like this on a project that already has tons of code. Honestly, that is also the case you run into much more often at work than a project on a green field.

For that there is now `/adopt`. Instead of starting from zero with an event storming, Kataster first builds a deterministic map of the repository: packages, dependencies, who uses what. Then it adopts one domain concept at a time. Read-only analysis agents collect evidence from the code, docs, tests, database schema and git history, the main session drafts the domain model from it, and then I get grilled until it is right.

The most important part: **Kataster does not invent a pretty domain that isn't in the code.** A grown repo with `services/`, `repositories/` and `utils/` is rarely cleanly domain-driven, and that is fine. An aggregate can therefore have three states:

- `target`: how it should be
- `as-is`: how it actually is, with evidence from the code
- `unresolved`: the boundary is unclear, and a story on it does not get through review

The gaps between as-is and target end up in a gap register. They do not automatically become stories, though, because what already works today gets documented, not repackaged as a story. And before a story changes existing code that has no test, the agent first writes a **characterization test** that pins down the current behaviour. If the current behaviour contradicts the story, the test is not bent to fit; the story goes back to review.

So the model is allowed to look ugly, as long as it is honest. For me that might be the most important difference to many spec-driven tools, which implicitly assume you start on a green field.

## What else was added

A few smaller things that have proven themselves in everyday use:

- **`/shape` for big ideas.** Before a big idea turns into stories, `/shape` grills the problem, decides where it belongs (existing context, new context, shared library), cuts it into slices and gives a rough cost range with a rationale. It ends with a recommendation from "go" to "no-go", but not a single story.
- **Throwaway prototypes.** When a UI question can't be settled on paper, the UX designer builds a few structurally different variants as a single HTML file. The decision goes into the story, the prototype onto its own branch that is never merged. The idea, like so many, comes from [Matt Pocock](https://github.com/mattpocock/skills).
- **Research as evidence.** For topics like authentication, security, privacy or new technologies, the agent should not invent a "best practice" from its gut. A strictly read-only researcher searches specifications and official docs, the findings land in `docs/research/` with a source and an expiry date, and a high-risk story does not get through without a solid source. Important: research is evidence, not a specification. Decisions are still made in the grilling, by me.

A nice example from La Guardia is the new AI model proposal: the AI searches the web for manuals and schematics of a pinball machine and fills in its master data. Before there was even a single story for it, there was a spike that clarified whether this works in one model call, how long it takes and what it costs (answer: yes, 10 to 40 seconds, a few cents). That became an ADR, and only then came the stories, neatly one per command.

## Conclusion

In the first post I asked whether the workflow was overengineered. The answer: yes, it was, but in a different place than I thought. The many checks were not the problem. The problem was that some of them were done by language models pretending to be a team. Since the roles are gone and a linter checks instead, the workflow has become faster, cheaper and, above all, more predictable. So the basic idea from the first post holds more than ever: the LLM generates, code checks, and I decide.

I did have to smile a bit. In the first post I wrote that I wanted to model the "real world". Part of that real world is apparently exactly what you should not automate. The roles were never the valuable part. The valuable part was the questions they asked, and those are now asked by one agent with three lenses and a script that does not argue.

As for the question "Is my contribution really just setting the rules of the game?", I am fairly sure by now: yes, and that is no small contribution. Almost every improvement in Kataster came from a retro in which I noticed that a rule didn't fit. The code writes itself, the rules don't.

What is still open for me is the brownfield case in practice. La Guardia is formally registered as a brownfield project in Kataster, but of course it has a domain model that grew with the workflow from day one. The real test only comes with a repo that nobody ever thought about in a domain-driven way. I'm curious.

Kataster is MIT-licensed and lives on [GitHub](https://github.com/hemi1986/kataster). Trying it out, opening issues and sending pull requests are explicitly welcome. And if you use it somewhere: [feel free to write to me](/en/pro/contact), I really want to know where it gets stuck.

---
_translated and co-created with Claude_
