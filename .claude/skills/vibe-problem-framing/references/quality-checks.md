# Quality Checks: Refine Problem Statement

Run all checks before handing over. Fix any violation.

---

## Statement structure

1. **All three parts present** — problem, context, and impact. Name which is absent and add it.
2. **One sentence, two at most** — more means a description was written, not a statement. Compress.
3. **Declarations, not descriptions** — no story, no sequence of events, no walkthrough.

---

## Impact quality

4. **Impact does not repeat the problem** — run the so-what test: read the problem clause, ask "so what?" If the next clause doesn't answer it, impact hasn't been written. "Leaving people waiting" after "requests are never picked up" is the problem said twice.
5. **Impact is not a benefit** — describes what people can't do now, not what a product would deliver. "So they can't tell whether their application is alive" is impact. "So they could track in real time" is a feature pitch.
6. **Impact lands somewhere recognisable** — a goal they can't reach, hours gone, money spent twice, work redone, a decision delayed, someone giving up, harm done. "Impacting productivity" lands nowhere.
7. **If nobody could say what it costs** — say so: "…and nobody has yet worked out what that costs." A visible hole beats a vague clause.

---

## Specificity

8. **No "users", "staff", "the public"** — narrow to a group someone could go and find.
9. **Unfalsifiable claims caught** — "the process is inefficient" can't be proved or disproved. Say what takes how long against what expectation.
10. **No invented numbers or sources** — never write a figure nobody gave. Never "studies show" or "users have expressed frustration" without naming who said it.
11. **No filler that fits any organisation** — swap in a different team or domain; if the sentence still reads fine, it says nothing.

---

## Language

12. **No corporate words** — leverage, streamline, utilize, facilitate, foster, empower, robust, seamless, elevate, transformative, holistic, synergy, paradigm, best-in-class.
13. **Active voice, people as subject** — "officers cross-check five databases by hand," not "documents are cross-checked manually."
14. **No puffery** — no "critical pain point," no "the real issue." State the thing.
15. **No solution in the statement** — "there is no dashboard" names a missing product, not a problem. Test: could the missing thing go on a build backlog?

---

## Handover

16. **Statement has no preamble above it** — the statement is the first thing they read.
17. **No inline labels** — the statement reads as plain prose, not a framework exercise. No [context], [problem], [impact] tags.
18. **Suggestions explain how to improve the statement** — each names what is weak or missing, what to do about it, and how that changes the statement. Not a generic action list.
19. **Suggestions don't gate** — no "you're not ready," no "don't build until." They decide.
20. **No unsourced domain claims** — when explaining gaps or suggesting next steps, use only what the user provided.

---

## Worked examples

**Input**: "Can you build a dashboard so officers can see licence applications faster?"

> Around 5,000 F&B business owners apply for a food shop licence each year and 80% wait more than 6 months against a 3-month target, losing roughly 8,000 dollars a month in rent on premises they cannot yet trade from. Most of that wait is manual cross-checking against 5 separate databases, which takes up 60% of processing time.

The dashboard disappeared. It was never the problem — once the real problem was on the table, a dashboard may not be the right build at all.

**Input**: "Build me an app so my team can see the forms people send us and who's got what — right now they're stuck in different people's inboxes."

> A few requests a week reach the team by email and some are never picked up, so that work sits untouched for weeks and staff spend time hunting back through inboxes every time someone asks where their request got to. Each request sits in a single person's inbox where nobody else can see it has arrived.

No invented numbers. The impact is a separate fact from the problem: work stalling and staff time lost, not "leaving people waiting" (which is "never picked up" said twice).

---
*Prepared by CIOO Rabbit Team · For use with VIBER Studio on Rabbit Deploy*
