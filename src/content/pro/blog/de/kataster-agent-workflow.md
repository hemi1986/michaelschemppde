---
title: "Kataster: Wie aus meinem Agenten-Workflow ein eigenes Projekt wurde"
description: "Vor einem Monat habe ich hier meinen Agenten-Workflow für La Guardia vorgestellt. Inzwischen ist daraus ein eigenständiges Open-Source-Projekt geworden, und auf dem Weg dahin sind Product Owner, Requirements Engineer und Lead Dev rausgeflogen. Ein Update."
date: 2026-11-09
tags: ["Claude Code", "OpenCode", "AI", "Agentic Engineering", "Spec-Driven Development", "Domain-Driven Design", "Open Source"]
draft: false
---

Im [ersten Beitrag zum Workflow](/pro/blog/laguardia-agent-workflow) hatte ich am Ende ein paar offene Fragen stehen: Ist das Ganze overengineered? Muss ich die PRs wirklich noch selbst abnehmen? Und wie bekommt man so einen Workflow auf ein Projekt, das schon Unmengen an Code hat? Außerdem hatte ich angekündigt, aus dem Framework ein eigenes Repo zu machen.

Knapp einen Monat später kann ich zu allen vier Punkten etwas sagen. Das eigene Repo gibt es: **Kataster**, öffentlich unter [github.com/hemi1986/kataster](https://github.com/hemi1986/kataster) und installierbar über npm. Und [La Guardia](/pro/projects/laguardia-pinball-manager), also die Flipper-Verwaltung für unser Museum, wird mittlerweile selbst damit weitergebaut.

## Erst mal: Was ist in La Guardia passiert?

Ganz kurz zum Stand, damit man die Zahlen einordnen kann. Im ersten Beitrag hatte ich 55 Stories im Backlog, von denen keine einzige fachliche begonnen war. Inzwischen sind es 127 Stories, 116 davon umgesetzt, dazu über 220 gemergte Pull Requests und 20 Architekturentscheidungen. Das Ding läuft also, und zwar ziemlich gut.

Aber: Das lag nicht am ursprünglichen Workflow, sondern an dem, was ich unterwegs daran geändert habe. Jede größere Änderung ist dabei aus einer Retro entstanden. Der Agent schaut sich eine Session an, ich sage, was mich genervt hat, und am Ende steht ein Vorschlag, welche Regel sich ändert. Die drei wichtigsten Retros in Kurzform:

- **Ende September: schlanker werden.** Das hatte ich im ersten Beitrag schon beschrieben: Reviews nach Risiko, eine Hürde für Folge-Stories, Fundament erst, wenn es gebraucht wird.
- **Ende Oktober: Discovery war zu teuer.** Eine Story wurde von Product Owner, Lead Dev und UX-Designer geprüft, danach hat der Requirements Engineer sie noch mal überarbeitet. Das hat Tokens und vor allem Zeit gefressen. Ergebnis: nur noch ein Review-Durchlauf, maximal zehn Szenarien pro Story, und der Testplan wartet nicht mehr auf meine Freigabe.
- **Einen Tag später: Der Acceptance Tester nimmt ab.** Das war die Antwort auf meine eigene Frage aus dem ersten Beitrag. Wenn schon ein Agent prüft, ob die Akzeptanzkriterien erfüllt sind, warum soll ich das dann ein zweites Mal machen? Seitdem setzt der Acceptance Tester die Story auf `done`, und ich schaue mir nur noch den Pull Request an und merge. Wenn etwas richtig schiefläuft, werde ich natürlich trotzdem gefragt.

## Vom Projektordner zum eigenen Paket

Irgendwann war klar, dass der Workflow mit La Guardia eigentlich nichts zu tun hat. Skills, Hooks, Validatoren, Subagenten: Das ist alles generisch, es lag halt nur zufällig im Flipper-Repo. Also habe ich es rausgelöst. Die erste eigenständige Version hieß tatsächlich noch „La Guardia“, was spätestens dann verwirrend wird, wenn man es in ein Projekt installiert, das nichts mit Flippern zu tun hat. Ab Version 0.2 heißt es deshalb **Kataster**.

Der Name ist kein Zufall. Ein Kataster ist das amtliche Verzeichnis der Grundstücke und ihrer Grenzen: eine Karte, die gepflegt und nicht erfunden wird. Genau so soll sich das Domänenmodell anfühlen. Die Bounded Contexts sind die Flurstücke, Glossar und Datenmodell sind die Einträge, und es kommt nichts rein, wofür es keinen Beleg gibt. (Und mal ehrlich: Ein deutsches Behördenwort als Name für ein Developer-Tool, das musste einfach sein.)

Die Installation ist jetzt ein einziger Befehl:

```bash
npx kataster init
```

Der Installer erkennt den Stack, fragt vier Dinge ab und schreibt dann `.claude/`, `.opencode/`, eine `AGENTS.md` und ein `docs/`-Gerüst ins Repo. Bestehende Dateien werden zusammengeführt statt überschrieben. Mit `npx kataster upgrade` lässt sich eine bestehende Installation aktualisieren, lokal angepasste Dateien bleiben dabei unangetastet. La Guardia habe ich genau so schon mehrfach hochgezogen.

Zwei Dinge sind beim Rauslösen dazugekommen, die ich vorher gar nicht auf dem Schirm hatte:

- **OpenCode.** Kataster läuft nicht mehr nur mit Claude Code, sondern auch mit [OpenCode](https://opencode.ai). `.claude/` bleibt dabei die einzige Quelle der Wahrheit, `.opencode/` ist nur ein Adapter, der dieselben Skills, Agenten und Hooks verwendet. Damit bin ich auch nicht mehr an ein Modell oder einen Anbieter gebunden.
- **Issue-Tracker.** Im ersten Beitrag hatte ich noch geschrieben, dass es keinen externen Issue-Tracker gibt (wäre aber kein Problem). Jetzt gibt es ihn: Stories können lokal bleiben oder in GitHub Issues bzw. Jira leben. Dann ist der Tracker die Quelle der Wahrheit und `docs/stories/` nur noch ein synchronisierter Spiegel, auf dem die ganzen Prüfungen laufen.

## Der Rauswurf: Schluss mit dem Business-Rollenspiel

Jetzt zum Teil, auf den ich mich am meisten gefreut habe. Im ersten Beitrag hatte ich noch ganz fasziniert beschrieben, wie sich die Subagenten genau so verhalten haben wie die Rollen, die ich aus echten Projekten kenne. Der Lead Dev will die Story aufteilen, der Product Owner findet sie super, der Requirements Engineer schreibt sie danach noch mal schön. Ich fand das amüsant.

Nach ein paar Wochen fand ich es nur noch anstrengend. Ehrlich gesagt hatte ich die Probleme der echten Welt einfach mit in den Workflow kopiert:

- **Endlose Diskussionen.** Drei Rollen, drei Meinungen, und am Ende musste ich trotzdem entscheiden.
- **Unvorhersehbare Stories.** Mal hat ein Agent eine Story zusammengekürzt, mal hat er sie aufgebläht. Wie sie aussah, hing davon ab, wer zuletzt dran war.
- **Keine Abkürzung für Kleinkram.** Ein Button, der zwei Pixel nach links soll, lief durch dieselbe Mühle wie eine neue Fachlogik.
- **Keine deterministische Prüfung.** Ob eine Story „fertig“ war, hat ein Sprachmodell entschieden. Genau das wollte ich eigentlich vermeiden: Das LLM generiert, Code prüft.

Mit Version 0.4 sind **Product Owner, Requirements Engineer und Lead Dev deshalb komplett rausgeflogen**. Stattdessen schreibt die Hauptsession die Stories selbst, als eine Art „Spec Engineer“ mit drei Blickwinkeln gleichzeitig: Fachlichkeit, Architektur und Testbarkeit. Die Rollen sind nicht verschwunden, sie sitzen jetzt nur im selben Kopf, was in der echten Welt übrigens auch nicht die schlechteste Lösung wäre.

Dafür gibt es ein paar harte, mechanische Regeln:

- **Die 1-Command-Regel.** Eine fachliche Story ist genau ein Command samt seinen Events auf genau einem Aggregat, mit höchstens vier Gherkin-Szenarien. Aggregat und Command stehen als Pflichtfelder in der Story und werden gegen das Event-Storming-Modell geprüft. Will man zwei Commands, sind es eben zwei Stories. Die Diskussion „Ist die Story zu groß?“ erledigt sich damit von selbst.
- **Ein Spec-Linter statt eines Reviewers.** Ob eine Story vollständig ist, prüft jetzt ein Skript: Pflichtfelder, Verweise auf Aggregate, Commands und Events, `Given/When/Then`, das Szenario-Limit, eindeutige Titel. Kein LLM, keine Tokens, immer dasselbe Ergebnis. Ist der Linter grün, steht die Story auf `ready-for-human-review`, und nur ich setze sie auf `ready`.
- **Eine Fast Lane.** UI-Kleinkram, Refactorings und Dependency-Updates laufen als `chore` oder `task`: Branch, umsetzen, Lint, Typen, Unit-Tests, Pull Request. Kein Gherkin, keine formalen Reviews.
- **Reviewer berichten, sie planen nicht.** Code Reviewer und Acceptance Tester dürfen keine Stories mehr anlegen, aufteilen oder umschreiben. Ein Finding wird in der Story behoben oder als offene Frage zurückgegeben. Damit ist auch die Flut an Folge-Stories, über die ich mich im ersten Beitrag geärgert habe, endgültig vom Tisch.

Übrig geblieben sind Agenten, die wirklich eine eigene Perspektive mitbringen und nicht nur eine Jobbezeichnung: Domain Architect, Code Reviewer, Acceptance Tester und ein UX-Designer, der nur noch auf Abruf kommt und nirgends mehr ein Gate ist.

Beim Upgrade von La Guardia gab es dann übrigens den Klassiker: Der neue Linter fand die alten, längst umgesetzten Stories natürlich ganz furchtbar, und das Backlog war auf einmal rot. Die Lösung: Alte Stories mit Status `done` werden nach den alten Regeln geprüft, neue nach den neuen. Bestandsschutz, ganz wie im echten Kataster.

## Die Frage nach dem Brownfield

Die zweite große offene Frage aus dem ersten Beitrag war, wie man so einen Workflow auf ein Projekt setzt, das schon Unmengen an Code hat. Das ist ehrlicherweise auch der Fall, der im Job viel häufiger vorkommt als ein Projekt auf der grünen Wiese.

Dafür gibt es jetzt `/adopt`. Statt mit einem Event Storming bei null anzufangen, erstellt Kataster zuerst eine deterministische Karte des Repositorys: Pakete, Abhängigkeiten, wer was nutzt. Dann wird immer nur ein fachliches Konzept auf einmal übernommen. Read-only-Analyse-Agenten sammeln Belege aus Code, Doku, Tests, Datenbankschema und Git-Historie, die Hauptsession baut daraus einen Entwurf des Domänenmodells, und dann werde ich gegrillt, bis er stimmt.

Das Wichtigste daran: **Kataster erfindet keine schöne Domäne, die es im Code nicht gibt.** Gerade ein gewachsenes Repo mit `services/`, `repositories/` und `utils/` ist selten sauber domänengetrieben, und das ist in Ordnung. Ein Aggregat kann deshalb drei Zustände haben:

- `target`: so soll es sein
- `as-is`: so ist es tatsächlich, mit Beleg aus dem Code
- `unresolved`: die Grenze ist unklar, und eine Story darauf kommt nicht durch das Review

Die Lücken zwischen Ist und Soll landen in einem Gap-Register. Daraus entstehen aber nicht automatisch Stories, denn was heute schon funktioniert, wird dokumentiert und nicht neu als Story verpackt. Und bevor eine Story bestehenden Code ändert, für den es keinen Test gibt, schreibt der Agent erst einen **Characterization Test**, der das aktuelle Verhalten festnagelt. Widerspricht das aktuelle Verhalten der Story, wird nicht der Test passend gemacht, sondern die Story geht zurück ins Review.

Das Modell darf also hässlich aussehen, solange es ehrlich ist. Das ist für mich der vielleicht wichtigste Unterschied zu vielen Spec-Driven-Werkzeugen, die implizit davon ausgehen, dass man auf der grünen Wiese startet.

## Was sonst noch dazugekommen ist

Ein paar kleinere Dinge, die sich im Alltag aber bewährt haben:

- **`/shape` für große Ideen.** Bevor eine große Idee zu Stories wird, grillt `/shape` das Problem, entscheidet, wo es hingehört (bestehender Context, neuer Context, gemeinsame Bibliothek), schneidet es in Scheiben und gibt eine grobe Kostenspanne mit Begründung. Am Ende steht eine Empfehlung von „Go“ bis „No-Go“, aber keine einzige Story.
- **Wegwerf-Prototypen.** Wenn sich eine UI-Frage auf dem Papier nicht klären lässt, baut der UX-Designer ein paar strukturell unterschiedliche Varianten als einzelne HTML-Datei. Die Entscheidung wandert in die Story, der Prototyp auf einen eigenen Branch, der nie gemergt wird. Die Idee stammt, wie so vieles, von [Matt Pocock](https://github.com/mattpocock/skills).
- **Recherche als Beleg.** Bei Themen wie Authentifizierung, Security, Datenschutz oder neuen Technologien soll der Agent keine „Best Practice“ aus dem Bauch heraus erfinden. Ein strikt read-only arbeitender Researcher sucht in Spezifikationen und offizieller Doku, die Ergebnisse landen mit Quelle und Ablaufdatum unter `docs/research/`, und eine Story mit hohem Risiko kommt ohne belastbare Quelle nicht durch. Wichtig dabei: Recherche ist ein Beleg, keine Spezifikation. Entschieden wird weiterhin im Grilling, und zwar von mir.

Ein schönes Beispiel aus La Guardia ist der neue KI-Modellvorschlag: Die KI sucht zu einem Flipper im Netz Handbücher und Schaltpläne und füllt die Stammdaten aus. Bevor es dafür auch nur eine Story gab, kam ein Spike, der geklärt hat, ob das in einem einzigen Modell-Aufruf geht, wie lange es dauert und was es kostet (Antwort: ja, 10 bis 40 Sekunden, ein paar Cent). Daraus wurde eine ADR, und erst dann kamen die Stories, schön eine pro Command.

## Fazit

Im ersten Beitrag hatte ich gefragt, ob der Workflow overengineered ist. Die Antwort ist: Ja, war er, aber an einer anderen Stelle, als ich dachte. Nicht die vielen Prüfungen waren das Problem, sondern dass ein Teil davon von Sprachmodellen gemacht wurde, die so getan haben, als wären sie ein Team. Seit die Rollen raus sind und stattdessen ein Linter prüft, ist der Workflow schneller, günstiger und vor allem vorhersehbarer geworden. Die Grundidee aus dem ersten Beitrag gilt also stärker denn je: Das LLM generiert, Code prüft und ich entscheide.

Ein bisschen schmunzeln musste ich dabei schon. Ich hatte im ersten Beitrag geschrieben, dass ich die „reale Welt“ abbilden wollte. Ein Teil dieser realen Welt ist offenbar genau das, was man nicht automatisieren sollte. Die Rollen waren nie das Wertvolle. Wertvoll waren die Fragen, die sie gestellt haben, und die stellt jetzt ein Agent mit drei Blickwinkeln und ein Skript, das nicht diskutiert.

Bei der Frage „Ist meine Leistung wirklich nur noch, die Spielregeln festzulegen?“ bin ich inzwischen ziemlich sicher: Ja, und das ist keine kleine Leistung. Fast jede Verbesserung in Kataster kam aus einer Retro, in der ich gemerkt habe, dass eine Regel nicht passt. Der Code entsteht von allein, die Regeln nicht.

Offen ist für mich vor allem noch der Brownfield-Fall in der Praxis. La Guardia ist zwar formal als Brownfield-Projekt in Kataster eingetragen, hat aber natürlich ein Domänenmodell, das von Anfang an mit dem Workflow entstanden ist. Der richtige Test kommt erst mit einem Repo, das nie jemand domänengetrieben gedacht hat. Ich bin gespannt.

Kataster ist MIT-lizenziert und liegt auf [GitHub](https://github.com/hemi1986/kataster). Ausprobieren, Issues aufmachen und Pull Requests sind ausdrücklich erwünscht. Und wenn ihr es irgendwo einsetzt: [Schreibt mir gerne](/pro/contact), mich interessiert brennend, wo es klemmt.

---
_co-created with Claude_
