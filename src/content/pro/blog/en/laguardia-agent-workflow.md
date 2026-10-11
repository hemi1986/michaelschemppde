---
title: "My Domain-Driven Agent Workflow: A Field Test"
description: "I want to build new management software for our pinball museum, not by vibe coding, but through a fixed AI workflow of skills, subagents and hooks in Claude Code. A look under the hood."
date: 2026-10-11
tags: ["Claude Code", "AI", "Agentic Engineering", "Domain-Driven Design", "Event Storming", "TDD"]
draft: false
---

At the end of my [website project](/en/pro/projects/personal-website) I wrote that something more complex would come next, to see what agentic engineering looks like with a non-trivial scope. That has now turned into **La Guardia**: software we want to use at the pinball museum to manage our machines, meaning defects, repairs, manuals and problem reports from visitors (that's the plan, at least). The name is an inside joke: Fiorello La Guardia was the New York mayor who banned pinball in 1942.

For this post, though, what it is built with is more interesting than the application itself: a fixed agent workflow of rules, roles and checks in the repository that makes sure Claude Code doesn't just start coding away. The repository is public: [github.com/hemi1986/laguardia](https://github.com/hemi1986/laguardia). You have to see the whole thing as a kind of research project. I simply tried to map the "real world" onto an agent workflow, the way I picture software development.

## The idea isn't new

To put this into context right away: I didn't invent anything here. Capturing requirements and design as files first and then having them implemented in small steps now goes by the name "spec-driven development". There are ready-made tools for it such as [GitHub Spec Kit](https://github.com/github/spec-kit) or the [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD), which also works with roles like analyst, architect and product owner. Rebuilding a software company out of agents was already done by [MetaGPT](https://arxiv.org/abs/2308.00352) in 2023. And that agents are better guided by mechanical rules and tests than by prompts is what OpenAI describes under the term ["harness engineering"](https://openai.com/index/harness-engineering/).

None of this is undisputed. A [study from UC Berkeley](https://arxiv.org/abs/2503.13657) concludes that multi-agent systems fail mainly because of system design and coordination between the agents, and less because of the model itself. And in her [comparison of spec-driven tools](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html), Birgitta Böckeler asks whether some of them transfer our existing workflows to agents too literally. That is exactly what I deliberately did here, and part of this post is about where it was too much. My own focus is on starting with event storming and domain-driven design, and on traceability from the story to the test.

Matt Pocock, whose skills I use here, is also critical of frameworks that own the whole process: they take away your control and make bugs in the process hard to resolve, he writes in the [README of his repo](https://github.com/mattpocock/skills). So my workflow is more of a mix of both worlds. As with him, the actual work happens in conversation in the main session, with grilling before every implementation and subagents mainly for review. The fixed process around it, with roles, statuses and hooks, comes from the framework corner. The difference: the process is mine, and I can rebuild it when it jams.

## The basic idea: the LLM generates, code checks

A language model is good at producing things and bad at sticking to rules over time. So for everything that can be checked, I don't rely on a prompt but on a script. That gives the division of labour:

| Task | Mechanism |
| --- | --- |
| _How_ is something done? | Skills |
| _Who_ looks at it? | Subagents with restricted permissions |
| Structure and consistency | Schemas and validators, triggered by hooks |
| Decisions | Me |

## Two halves: discovery and engineering

The workflow has two halves, and the first one doesn't write a single line of application code.

**Discovery** clarifies what should be built in the first place. It starts with an event storming that first questions me thoroughly about the vision. From that, an architecture agent derives bounded contexts, aggregates, the data model and proposals for architecture decisions (ADRs). Another agent turns this into user stories with acceptance criteria in Gherkin. These stories are then reviewed in parallel by a "product owner" and a "lead dev", and for stories with a user interface by a UX agent as well. Only once I approve them do they count as `ready`.

All of it lives as files in the repository: the glossary in `CONTEXT.md`, the event storming model as YAML, the ADRs and every story as its own Markdown file. There is no external issue tracker (though that wouldn't be a problem).

**Engineering** implements the stories one at a time. A single command, `/implement`, always works through the same seven steps:

```text
1. Prepare       branch, status "in-progress", context pack from discovery
2. Test plan     every scenario → one test            ← I still approve this myself
3. Red → green   one scenario at a time, one commit per scenario
4. Verify        lint, module boundaries, types, tests, traceability
5. Review        code reviewer and acceptance tester in parallel
6. Refactoring   findings are fixed inside the story
7. Pull request  acceptance on the preview deployment ← I accept and merge
```

If it turns out along the way that a story is unclear or wrong, nobody guesses. The story gets an open question and goes back to discovery.

## The building blocks

**`CLAUDE.md`** is loaded in every session and contains the rules that always apply: where which truth lives, who may change it and what the process looks like.

**Skills** describe the method, for example how an event storming runs, what a story has to look like or how to develop test-first. Some of them come from [Matt Pocock's skills](https://github.com/mattpocock/skills) and are slightly adapted, among them "grilling": a relentless interview in rounds where every question already comes with a recommended answer. I'm a big fan of Matt's skills and really wanted to make them part of the workflow.

**Subagents** provide the perspective. There are seven roles: product owner, lead dev, requirements engineer, domain architect, UX designer, code reviewer and acceptance tester. Each has its own model, its own tools and may only write to its own folders. The code reviewer, for example, writes findings to `docs/reviews/` but doesn't fix anything. One important point: the actual work, meaning interview, event storming and implementation, deliberately runs in the main session. Subagents can't ask me questions and don't know the conversation. They derive artifacts or review; they don't write application code.

**Hooks** are the guardrails:

- After every write, stories and the event storming model are validated against a schema, and the generated views (backlog, diagram) are rendered again. If the check fails, Claude has to fix the error immediately.
- Generated files and ADRs that have already been accepted cannot be edited.
- Force pushes, a production deployment from the command line and destructive commands on a non-local database are blocked.
- Before Claude finishes a reply, the type check and the affected tests run.

**Traceability** holds the two halves together. Every Gherkin scenario needs a test with exactly the same title as the scenario (`ST-010: …`), and commands and events carry the same ID in the code as in the event storming model. A script checks both. A story can only be set to `done` if a test exists for every scenario.

## Where I stay in the loop

The workflow doesn't work autonomously, and for now that is entirely intentional. There are fixed points where only I decide:

- the answers in the interview rounds
- accepting ADRs (agents may only propose them)
- approving the stories
- the test plan of every story
- the final acceptance after the implementation, and the merge

## What didn't work right away

After the first day I did a retrospective with Claude, and the numbers were rather sobering: four stories done, eleven new ones added, all of them technical tasks. Not a single domain story had been started.

The cause was home-made. Four reviewers per story always find something, and every finding that was "too big for this story" became a new story. Nobody asked whether it was worth a story of its own. A single foundation story took around two and a half hours including reviews. As a volunteer working alone, you can't keep that up for 55 stories.

Three rules came out of this:

- **Reviews follow the risk.** For a static page the acceptance tester is enough. The full programme including a security review only happens when the diff justifies it.
- **A hurdle for follow-up stories.** A finding only becomes a new story if it is a security or data-loss risk or blocks a specific story, can't be fixed in about an hour, and no existing story can take it.
- **Foundation only when it's needed.** Technical groundwork moves into the first story that needs it, instead of queueing up in front of the domain stories.

## What fascinated me

With this workflow I somehow tried to map the real world, which I've known for decades, and it was quite amusing to see the subagents sometimes behave exactly the way I've so often seen the corresponding roles behave. One example is the opening of follow-up stories mentioned above. I know that well from projects where developers like to push all sorts of stuff into follow-up stories instead of just pragmatically doing things along the way when that makes sense. Admittedly, there's no magic formula for this "making sense", and so no right or wrong either, but I'm generally more a friend of "do it properly right away and don't push the work down the road".

I also had some funny situations in the story reviews between lead dev and product owner. Both subagents write their reviews independently of each other, and a pattern emerged: while the product owner was mostly perfectly fine with the stories the requirements engineer had written and with their length, the lead dev was far more often of the opinion that a story was much too complex and should be split. Another situation I know very well from "real" refinements.

## Conclusion

It's still too early to draw an honest conclusion, since I haven't been using the framework long enough. So far I'm fairly happy with the output, though, and I think the code, the software and its documentation are turning out really well. The implementations work very well because there are clearly defined and rather narrow user stories for the agent to implement. That also means you rarely run into context problems, because the work is split up well from the start. In principle you can start a new session after every story, and so on.

I'm still a bit unsure whether the workflow is somewhat overengineered. A lot of reviews are done, and I'm not yet sure whether the time and tokens invested are really worth it. I'll keep experimenting here.

For me, the biggest difference from the website project is where the work is. The code appears quickly. The real engineering effort is in the workflow itself: deciding what a model may generate freely, what a script has to check, and at which points a human still decides. This way of working is also fundamentally different from what you're used to:

- In classic engineering, writing code takes a lot of time
- With "vibe coding" you write individual prompts and things just get built (sometimes with better, sometimes with worse results)

With this approach, the doing really shifts massively towards "reading text, checking work and making decisions". To be honest, that is sometimes a bit boring, and you quickly start telling the agent "just go ahead with your recommendations" every time. I think this, too, deserves another critical look, to draw the right conclusions from it. Do I still have to check everything? Do I really still have to accept the PRs myself at that point, or couldn't I let the agent do that too, when several sub-processes have already done reviews? And is my contribution perhaps really "only" setting the rules of the game?

Another goal is to turn the framework into a standalone repo that lets you carry the workflow over to other projects. The exciting part will be how to put the workflow onto a project that already has huge amounts of code.

What do you think? [Feel free to write to me about it!](/en/pro/contact)

---
_translated and co-created with Claude_
