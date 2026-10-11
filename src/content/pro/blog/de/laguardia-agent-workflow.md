---
title: "Mein domänengetriebener Agenten-Workflow: Ein Feldversuch"
description: "Für unser Flippermuseum will ich eine neue Verwaltungssoftware bauen, und zwar nicht per Vibe Coding, sondern über einen festen AI-Workflow aus Skills, Subagenten und Hooks in Claude Code. Ein Blick unter die Haube."
date: 2026-10-11
tags: ["Claude Code", "AI", "Agentic Engineering", "Domain-Driven Design", "Event Storming", "TDD"]
draft: false
---

Im [Website-Projekt](/pro/projects/personal-website) hatte ich am Ende geschrieben, dass als Nächstes etwas Komplexeres kommt, um zu sehen, wie agentisches Engineering bei nicht-trivialem Scope aussieht. Daraus ist jetzt **La Guardia** geworden: eine Software, mit der wir im Flippermuseum unsere Geräte verwalten wollen, also Defekte, Reparaturen, Handbücher und Problemmeldungen von Besuchern (So zumindest mal der Plan). Der Name ist ein Insider: Fiorello La Guardia war der New Yorker Bürgermeister, der 1942 Flipper verboten hat.

Spannender als die Anwendung selbst ist für diesen Beitrag aber das, womit sie gebaut wird: ein fester Agenten-Workflow aus Regeln, Rollen und Prüfungen im Repository, der dafür sorgt, dass Claude Code nicht einfach drauflos programmiert. Das Repository ist öffentlich: [github.com/hemi1986/laguardia](https://github.com/hemi1986/laguardia). Man muss das Ganze als eine Art Forschungsprojekt sehen. Ich habe einfach versucht, die „reale Welt“ in einem Agent-Workflow abzubilden, so wie ich mir Softwareentwicklung vorstelle.

## Neu ist die Idee nicht

Um das gleich einzuordnen: Erfunden habe ich hier nichts. Erst Anforderungen und Entwurf als Dateien festzuhalten und dann in kleinen Schritten umsetzen zu lassen, läuft inzwischen unter dem Namen „Spec-Driven Development“. Dafür gibt es fertige Werkzeuge wie [GitHub Spec Kit](https://github.com/github/spec-kit) oder die [BMAD-Method](https://github.com/bmad-code-org/BMAD-METHOD), die ebenfalls mit Rollen wie Analyst, Architekt und Product Owner arbeitet. Eine Softwarefirma aus Agenten nachzubauen, gab es mit [MetaGPT](https://arxiv.org/abs/2308.00352) schon 2023. Und dass man Agenten besser über mechanische Regeln und Tests führt als über Prompts, beschreibt OpenAI unter dem Begriff [„Harness Engineering“](https://openai.com/index/harness-engineering/).

Unumstritten ist das alles nicht. Eine [Studie der UC Berkeley](https://arxiv.org/abs/2503.13657) kommt zu dem Ergebnis, dass Multi-Agenten-Systeme vor allem am Systemdesign und an der Abstimmung zwischen den Agenten scheitern und weniger am Modell selbst. Und Birgitta Böckeler fragt in ihrem [Vergleich von Spec-Driven-Werkzeugen](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html), ob manche davon unsere bestehenden Arbeitsabläufe zu wörtlich auf Agenten übertragen. Genau das habe ich hier bewusst getan, und ein Teil dieses Beitrags handelt davon, wo das zu viel war. Mein eigener Schwerpunkt liegt auf dem Einstieg über Event Storming und Domain-Driven Design und auf der Rückverfolgbarkeit von der Story bis zum Test.

Auch Matt Pocock, dessen Skills ich hier einsetze, sieht Frameworks kritisch, die den ganzen Prozess besitzen: Sie nähmen einem die Kontrolle und machten Fehler im Prozess schwer behebbar, schreibt er in der [README seines Repos](https://github.com/mattpocock/skills). Mein Workflow ist deshalb eher eine Mischung aus beiden Welten. Die eigentliche Arbeit passiert wie bei ihm im Gespräch in der Hauptsession, mit Grilling vor jeder Umsetzung und Subagenten vor allem fürs Review. Der feste Ablauf mit Rollen, Status und Hooks drumherum kommt dagegen aus der Framework-Ecke. Der Unterschied: Der Prozess gehört mir, und ich kann ihn umbauen, wenn er klemmt.

## Die Grundidee: Das LLM generiert, Code prüft

Ein Sprachmodell ist gut darin, Dinge zu erzeugen, und schlecht darin, sich dauerhaft an Regeln zu halten. Also verlasse ich mich bei allem, was sich prüfen lässt, nicht auf einen Prompt, sondern auf ein Skript. Daraus ergibt sich die Arbeitsteilung:

| Aufgabe | Mechanismus |
| --- | --- |
| _Wie_ wird etwas gemacht? | Skills |
| _Wer_ schaut drauf? | Subagenten mit eingeschränkten Rechten |
| Struktur und Konsistenz | Schemas und Validatoren, ausgelöst per Hook |
| Entscheidungen | Ich |

## Zwei Hälften: Discovery und Engineering

Der Workflow hat zwei Hälften und die erste schreibt keine Zeile Anwendungscode.

**Discovery** klärt, was überhaupt gebaut werden soll. Am Anfang steht ein Event Storming, das mich erst einmal ausführlich zur Vision befragt. Daraus leitet ein Architektur-Agent Bounded Contexts, Aggregate, das Datenmodell und Vorschläge für Architekturentscheidungen (ADRs) ab. Ein weiterer Agent schreibt daraus User Stories mit Akzeptanzkriterien in Gherkin. Diese Stories werden anschließend von einem „Product Owner“ und einem „Lead Dev“ parallel geprüft, bei Stories mit Oberfläche zusätzlich von einem UX-Agenten. Erst wenn ich sie freigebe, gelten sie als `ready`.

Alles davon liegt als Datei im Repository: das Glossar in `CONTEXT.md`, das Event-Storming-Modell als YAML, die ADRs und jede Story als eigene Markdown-Datei. Es gibt keinen externen Issue-Tracker (Wäre aber kein Problem).

**Engineering** setzt die Stories einzeln um. Ein einziger Befehl, `/implement`, arbeitet immer dieselben sieben Schritte ab:

```text
1. Vorbereiten   Branch, Status „in-progress“, Kontextpaket aus der Discovery
2. Testplan      jedes Szenario → ein Test            ← gebe ich noch selbst frei
3. Rot → Grün    ein Szenario nach dem anderen, ein Commit pro Szenario
4. Verify        Lint, Modulgrenzen, Typen, Tests, Rückverfolgbarkeit
5. Review        Code-Reviewer und Acceptance-Tester parallel
6. Refactoring   Findings werden in der Story behoben
7. Pull Request  Abnahme auf dem Preview-Deployment   ← ich nehme ab und merge
```

Stellt sich dabei heraus, dass eine Story unklar oder falsch ist, wird nicht geraten. Die Story bekommt eine offene Frage und geht zurück in die Discovery.

## Die Bausteine

**`CLAUDE.md`** wird in jeder Session geladen und enthält die Regeln, die immer gelten: wo welche Wahrheit liegt, wer sie ändern darf und wie der Ablauf aussieht.

**Skills** beschreiben die Methode, etwa wie ein Event Storming abläuft, wie eine Story aussehen muss oder wie testgetrieben entwickelt wird. Einige davon stammen aus den [Skills von Matt Pocock](https://github.com/mattpocock/skills) und sind leicht angepasst, darunter das „Grilling“: ein hartnäckiges Interview in Runden, bei dem jede Frage schon eine empfohlene Antwort mitbringt. Ich bin großer Fan von den Skills von Matt und wollte sie unbedingt in den Workflow mit einbinden.

**Subagenten** liefern die Perspektive. Es gibt sieben Rollen: Product Owner, Lead Dev, Requirements Engineer, Domain Architect, UX Designer, Code Reviewer und Acceptance Tester. Jeder hat ein eigenes Modell, eigene Werkzeuge und darf nur in seine eigenen Ordner schreiben. Der Code Reviewer zum Beispiel schreibt Findings nach `docs/reviews/`, behebt aber nichts. Wichtig dabei: Die eigentliche Arbeit, also Interview, Event Storming und Implementierung, läuft bewusst in der Hauptsession. Subagenten können mir keine Fragen stellen und kennen das Gespräch nicht. Sie leiten Artefakte ab oder prüfen, Anwendungscode schreiben sie nicht.

**Hooks** bilden die Leitplanken:

- Nach jedem Schreibvorgang werden Stories und das Event-Storming-Modell gegen ein Schema validiert, und die generierten Ansichten (Backlog, Diagramm) werden neu erzeugt. Schlägt die Prüfung fehl, muss Claude den Fehler sofort beheben.
- Generierte Dateien und bereits akzeptierte ADRs lassen sich nicht bearbeiten.
- Force Push, ein Produktiv-Deployment von der Kommandozeile und zerstörerische Befehle auf einer nicht lokalen Datenbank werden blockiert.
- Bevor Claude eine Antwort abschließt, laufen Typprüfung und die betroffenen Tests.

**Rückverfolgbarkeit** hält die beiden Hälften zusammen. Jedes Gherkin-Szenario braucht einen Test, der exakt so heißt wie das Szenario (`ST-010: …`), und Commands und Events tragen im Code dieselbe ID wie im Event-Storming-Modell. Ein Skript prüft beides. Eine Story lässt sich nur auf `done` setzen, wenn für jedes Szenario ein Test existiert.

## Wo ich im Spiel bleibe

Der Workflow arbeitet nicht autonom, und das ist aktuell auch völlig beabsichtigt. Es gibt feste Stellen, an denen nur ich entscheide:

- die Antworten in den Interview-Runden
- das Akzeptieren von ADRs (Agenten dürfen sie nur vorschlagen)
- die Freigabe der Stories
- den Testplan jeder Story
- die finale Abnahme nach der Implementierung und den Merge

## Was nicht auf Anhieb funktioniert hat

Nach dem ersten Tag habe ich eine Retrospektive mit Claude gemacht, und die Zahlen waren eher ernüchternd: vier Stories fertig, elf neue dazugekommen, und zwar ausschließlich technische Aufgaben. Von den fachlichen Stories war keine einzige begonnen.

Der Grund war hausgemacht. Vier Reviewer pro Story finden immer etwas, und jedes Finding, das „zu groß für diese Story“ war, wurde zu einer neuen Story. Niemand hat gefragt, ob es eine eigene Story wert ist. Eine einzelne Grundlagen-Story hat inklusive Reviews rund zweieinhalb Stunden gedauert. Das hält man als ehrenamtlicher Einzelkämpfer keine 55 Stories lang durch.

Daraus sind drei Regeln entstanden:

- **Reviews richten sich nach dem Risiko.** Für eine statische Seite reicht der Acceptance Tester. Das volle Programm inklusive Security-Review gibt es nur, wenn der Diff es rechtfertigt.
- **Eine Hürde für Folge-Stories.** Ein Finding wird nur dann zur neuen Story, wenn es ein Sicherheits- oder Datenverlustrisiko ist oder eine konkrete Story blockiert, sich nicht in etwa einer Stunde beheben lässt und keine bestehende Story es aufnehmen kann.
- **Fundament erst, wenn es gebraucht wird.** Technische Vorarbeit wandert in die erste Story, die sie benötigt, statt sich vor die fachlichen Stories zu schieben.

## Was mich fasziniert hat

Ich habe mit diesem Workflow ja irgendwie versucht, die echte Welt abzubilden, die ich bereits seit Jahrzehnten kenne, und es war schon amüsant zu sehen, wie sich die Subagenten teilweise genau so verhalten haben, wie ich es von den entsprechenden Rollen schon oft erlebt habe. Ein Beispiel ist das oben angesprochene Eröffnen von Folge-Stories. Ich kenne das gut aus Projekten, in denen Entwickler gerne mal dazu neigen, jegliches Zeugs in Folge-Stories zu schieben, anstatt Dinge einfach mal kurz pragmatisch mit umzusetzen, wenn dies denn Sinn ergibt. Zugegeben: Für dieses „Sinn ergeben“ gibt es kein Patentrezept und demnach auch kein Richtig und kein Falsch, aber ich bin grundsätzlich eher ein Freund von „Mach's lieber gleich ordentlich und schieb die Arbeit nicht nach hinten“.

Des Weiteren hatte ich bei den Story-Reviews zwischen Lead Dev und Product Owner witzige Situationen. Beide Subagenten schreiben ja unabhängig voneinander ihre Reviews, und hier war folgendes Muster erkennbar: War der Product Owner meistens mit den Stories und deren Länge völlig fein, die der Requirements Engineer geschrieben hat, war der Lead Dev viel öfter der Meinung, dass die Story viel zu komplex wäre und man sie doch aufteilen sollte. Auch eine Situation, die ich aus „echten“ Refinements sehr gut kenne.

## Fazit

Es wäre aktuell noch zu früh, ein ehrliches Fazit zu ziehen, da ich das Framework noch nicht lange genug einsetze. Bisher bin ich mit dem Output aber recht zufrieden und ich denke, dass der Code und die Software sowie ihre Dokumentation wirklich sehr gut werden. Die Implementierungen funktionieren sehr gut, weil es eben klar definierte und eher schmale User Stories gibt, welche der Agent implementieren kann. So hat man auch selten Kontext-Probleme, weil die Arbeitsschritte eben von vornherein gut aufgeteilt sind. Man kann also im Prinzip nach jeder Story eine neue Session starten etc.

Ich bin mir noch etwas unsicher, ob der Workflow etwas overengineered ist. Es werden viele Reviews gemacht und da bin ich mir aktuell noch unsicher, ob die investierte Zeit und die investierten Tokens sich wirklich lohnen. Hier werde ich noch weiter experimentieren.

Der größte Unterschied zum Website-Projekt ist für mich, wo die Arbeit steckt. Der Code entsteht schnell. Die eigentliche Engineering-Leistung liegt im Workflow selbst: zu entscheiden, was ein Modell frei erzeugen darf, was ein Skript prüfen muss und an welchen Stellen ein Mensch noch entscheidet. Diese Arbeitsweise ist auch fundamental anders, als man es sonst gewohnt ist:

- Im klassischen Engineering braucht das Schreiben von Code viel Zeit
- Beim „Vibecoding“ schreibt man einzelne Prompts und es wird einfach gebaut (Mal mit besseren und mal mit schlechteren Ergebnissen)

Bei diesem Ansatz verschiebt sich das Doing wirklich massiv zum „Texte lesen, Arbeit kontrollieren und Entscheidungen treffen“. Das ist bisweilen auch etwas langweilig, um ehrlich zu sein, und man fängt auch schnell an, dem Agent jedes Mal nur zu sagen: „Mach einfach mit deinen Empfehlungen weiter“. Ich glaube, auch dies sollte nochmal kritisch beäugt werden, um ggf. die richtigen Schlüsse daraus zu ziehen. Muss ich denn noch alles kontrollieren? Muss ich die PRs an der Stelle wirklich noch selbst abnehmen oder kann ich das nicht auch den Agent übernehmen lassen, wenn schon mehrere Sub-Prozesse Reviews gemacht haben? Und ist meine Leistung vielleicht wirklich „nur“ noch, die entsprechenden Spielregeln festzulegen?

Ziel ist außerdem, aus dem Framework ein eigenständiges Repo zu bauen, mit dem man den Workflow auf andere Projekte übertragen kann. Spannend wird dann vor allem, wie man den Workflow auf ein Projekt setzen kann, welches schon Unmengen an Code bereithält.

Was meint ihr? [Schreibt mir gerne dazu!](/pro/contact)

---
_co-created with Claude_