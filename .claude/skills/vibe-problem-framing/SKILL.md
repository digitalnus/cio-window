---
name: "vibe-problem-framing"
description: "Generate or refresh a government-domain problem statement for the app in this VIBER session — interviews the user (or works from what they already said), classifies the app into an agency/sector/domain taxonomy, and writes it to problem-statement.md in the project (VIBER has no file download — can also print it in the chat reply on request). Use ONLY when the user explicitly asks for this (e.g. 'use vibe-problem-framing', 'generate a problem statement for this app', 'write up the problem this app solves', 'what problem does this app address'). Never invoke automatically as part of building a feature — this is a standalone, optional, user-called tool, not a step in the normal build flow. Works whether or not the app already exists: with an existing app, it classifies what's there and can suggest improvements grounded in the fresh statement; with no app yet, it produces a statement meant to directly seed what gets built next. Re-runnable any time — overwrites problem-statement.md with a fresh interview, not a diff against a prior answer."
metadata:
  author: viber-studio
  version: "1.0.0"
  audience: internal
  category: content
---

# vibe-problem-framing

Produces a short, specific problem statement for the app in this VIBER
session, plus a government-domain classification record, written to
`problem-statement.md` in the project. VIBER has no file-download
capability, so the file can only be opened in the editor — this skill
also offers to print the statement in the chat reply so the user can
copy it out directly.

Most build requests arrive as solutions — work backwards to the problem
underneath. Everything the user reads throughout this flow, including the
final statement, goes in everyday words — no corporate vocabulary, no
jargon, nothing that reads like a framework exercise. `No corporate
words` in `quality-checks.md` lists specific words to avoid; this is the
broader positive standard behind that list — plain enough that someone
outside this project could read the statement and understand it on the
first pass.

**Optional and user-invoked only** — never run as part of a normal build
request, and never required before building anything. A user can build
their whole app without ever calling this skill. Start this flow only
when the user explicitly asks for it (see the trigger phrases in the
description above) — not on your own initiative, and not because a build
request happens to mention a problem in passing.

---

## Step 0 — Which mode: existing app or no app yet

Look at the current VIBER workspace. **Always check `src/app/page.tsx`'s
actual source first** — the template's default homepage is a fully
styled, multi-section page (hero, "Getting Started" cards, example
prompts, tips), not a blank page, so judging by visual completeness alone
will misclassify it as a real app. The reliable signal is the file's
first line: `// PLACEHOLDER — Replace this entire page with the user's
requested app content.` If that comment is still present, or the page
still shows the stock "Build your app with AI" / "Getting Started" / "Try
these prompts" content, treat this as **no app yet** regardless of how
complete the page looks — do not classify by appearance alone.

**If there is an existing app** (the homepage has been replaced with real
content — the PLACEHOLDER comment and stock sections above are gone — or
there are custom pages/components beyond the template starter):
- Tell the user briefly what you can see the app does, in one sentence,
  so they can correct it if wrong.
- Continue to Step 1 treating "what does the app do" as already partly
  answered by what you can see — don't re-ask something the code already
  shows. Still ask what's not visible from code alone: who it's for, how
  big the problem is, what it costs, why now.
- After delivering the statement (Step 7), offer — don't push — to use it
  to suggest concrete improvements to the existing app. If the user says
  yes, suggest specific, scoped changes grounded in the fresh statement
  (e.g. "the statement says the real cost is officers re-entering the same
  data twice — right now the form has no autosave, which is exactly that
  gap"). Never make the improvement suggestion mandatory or implement it
  without the user agreeing first.

**If there is no app yet** (template starter homepage, no custom
features):
- Continue to Step 1 from scratch — this is a first-use case, there is
  nothing to read from code.
- The delivered statement (Step 7) is meant to directly seed what gets
  built next — but **this skill never builds anything itself.** Delivering
  the statement document is the end of this skill's job. Do not start
  writing app code, scaffolding pages, or touching the project in any way
  after Step 7, even if the statement obviously implies a specific build.
- **Hard gate before any build starts, in this exact order:**
  1. The full interview from `references/question-guide.md` must have
     actually run (or been explicitly skipped per Step 3's "if nothing
     material is missing" rule) — not shortcut because the request
     "already sounded clear enough."
  2. The statement must have been delivered (Step 7) and the user must
     have reviewed it — don't assume silence or a quick "ok" after
     delivery means they read and accepted it; if their reply is
     ambiguous, ask directly whether the statement looks right before
     treating it as agreed.
  3. The user must separately and explicitly ask to build the app from
     this statement — a real request ("build this", "let's build it",
     "go ahead and create the app"), not implied by them liking the
     statement or by this skill offering to build it. **Do not offer to
     build it unprompted** — at most, mention once that they can ask you
     to build from it, or copy the statement into a fresh prompt
     themselves, then stop and wait.
  4. Only after all three are satisfied does normal VIBER build behaviour
     (per the main `CLAUDE.md`) take over — treat the agreed statement as
     the brief for what gets built, the same as if the user had typed it
     as their build request directly.
  If the user asks to build before step 2 or 3 is actually satisfied
  (e.g. mid-interview), say plainly that the statement isn't finished or
  agreed yet and finish the gate first — don't comply early just because
  they asked.

Either way, the output document and the classification step are
identical — only how Step 1 starts differs.

---

## Step 1 — Classify the input

Work out what was given. If Step 0 already surfaced enough of this from
reading the existing app, treat that as the answer here rather than
asking again:

| Input looks like | Action |
|---|---|
| A solution ("Build me a dashboard") | Strip the solution. Ask what breaks today without it, and for whom. |
| A feature idea ("Auto-fill the form") | Find the friction the feature assumes exists. |
| A symptom ("The process is slow") | Slow for whom, at which step, against what expectation. |
| A vague blurb ("Help officers work better") | Find one specific user and one specific task. |
| A complaint ("People keep complaining") | Whose complaint, about which moment, what did it cost. |
| An actual problem (names user, task, friction) | Go straight to Step 2's internal assessment. |
| A prior statement, cited by the user, plus new context ("does this still hold now that X changed?") | Compare what was stated against what changed. Name the drift in one sentence. If nothing material shifted, confirm the original holds and stop — no need to re-interview. Otherwise continue from Step 2 with the changed part as new input. |

If there is no user, no task and no friction — only a technology or a
wish — say so plainly and ask what triggered the request.

**This drift-check row is a different situation from Step 8's re-run
behaviour — don't conflate them.** This row applies when the user brings
up a prior statement themselves to ask whether it still holds, without
asking for a fresh one. Step 8 applies when the user explicitly invokes
this skill again (e.g. "generate the problem statement again") — that
case is always a full fresh interview, no comparison, because an
explicit re-invocation is itself a signal that the user wants the full
process repeated, not a quick sanity check.

---

## Step 2 — Assess internally and find the cause

Run the 4Cs privately (don't show this to the user, it's your own working
check) — note which are solid and which are gaps:
- **Clarity** — specific user group, task, friction, severity, frequency
- **Consequence** — what it costs if nothing changes
- **Cause** — single biggest contributing factor
- **Confirmation** — evidence the cause is real

Find the cause by asking "why" (internally) until reaching something
specific and actionable. Too shallow = patching symptoms. Too deep =
outside their control. The cause goes into the context part of the
statement, described as what is happening — never as the fix.

---

## Step 3 — Ask questions to close gaps

Always confirm who and how big, if not already clear:
- **Who is affected?** Specific group, not "users" or "staff."
- **How big?** Offer the option to provide actual numbers first ("If you
  have the data, how many per week/month?"), then ranges as fallback ("a
  handful a month," "a few a week," "several a day") plus "honestly, no
  idea." Never invent a number.

**If an answer is too broad to be useful** (e.g. "who is affected" comes
back as the whole agency/organisation, or a frequency answer is too
vague to act on) — explain briefly why a narrower answer makes the
statement stronger (e.g. "'GovTech' covers hundreds of teams — is there a
specific division or role that feels this most?"), and give the user one
chance to narrow it. **Push once, not repeatedly.** If they confirm the
broad answer is genuinely the right scope, or they don't have a narrower
one, accept it as given — this skill helps the user articulate their
problem, it does not interrogate them into one. Note the broadness as a
gap in Step 7's delivery rather than silently writing it in as if it were
specific. The same applies to Step 6's Agency/Government Sector pair
below — if both answers come back identical, ask once whether that's
really both fields or just a placeholder for "haven't figured this out
yet," then accept whatever they say next.

Then read `references/question-guide.md` for the full question table and
ask one round for whatever's still missing — maximum 8 questions, fewer
if the prompt or the existing app already answered some. Ask only what
closes a real gap. If nothing material is missing, skip the round.

---

## Step 4 — Draft the statement

**One sentence, two at most, for the whole statement** — context, problem,
and impact combined, not two sentences per part. Three separate sentences
(one per part) is already over the limit — compress until the full
statement fits in one or two. If it doesn't fit, that's a sign the draft
is describing a sequence of events rather than declaring the problem —
cut narrative detail, not the substance.

**Staying under the sentence ceiling doesn't by itself mean it's a
declaration, not a narrative.** A single sentence can still read as a
walkthrough if it chains three or more actions with "and"/commas (e.g.
"staff record X, then tally Y, then cross-check Z by hand at month-end")
— that is a sequence of steps wearing one sentence's clothes. If a
sentence has more than two chained actions, pick the one action that
actually causes the problem and state that; move the rest into context
only if it's load-bearing, drop it otherwise.
- **Context** — "Currently, [who] [does what]..."
- **Problem** — what is going wrong within that context
- **Impact** — "This leads to..." — must pass the so-what test: read the
  problem clause, ask "so what?" If the next clause doesn't answer it,
  impact hasn't been written.

**Watch for the "missing thing" pattern** — a Problem clause shaped like
"there is no X" or "there is no way to Y" names an absent *product*, not
a problem (`quality-checks.md`'s own worked example: "there is no
dashboard" is a build backlog item wearing a problem statement's clothes
— this applies just as much to "there is no consolidated way to analyse
X" or "there is no tool for Y"). If the draft has this shape, rewrite the
Problem clause around what people actually do today instead and where
that breaks down (e.g. not "there's no way to see totals by category" but
"officers tally each entry by hand against five categories, and
miscounts aren't caught until month-end").

Review the draft for remaining weaknesses (a vague number, unconfirmed
cause, unmeasured impact) — ask the user directly whether they can fill
each gap. If they answer, incorporate and re-check. If they can't, note it
plainly rather than papering over it.

**Never invent a concrete-sounding phrase to stand in for a vague
answer.** If the user said "time spent reconciling" with no number, do
not upgrade that to "several hours a month" in the statement — that
specific-looking phrase came from you, not them, even though it isn't a
hard number. Either keep the impact in the user's own words ("time is
spent reconciling the two") or ask them directly for a rough size before
writing anything more specific than what they actually said. The gap
note in Step 7 must be honest about this distinction too: "no hard
number given" is a different, smaller admission than "the word 'several'
in this impact clause was written by the skill, not supplied by the
user" — say whichever one actually happened.

---

## Step 5 — Quality check the statement

Read `references/quality-checks.md`. Go through **all 20 checks one by
one against the actual drafted text** — not a mental skim, not just the
few that come to mind. A checklist that's only consulted for the
"obvious" items (three parts present, no invented numbers) will reliably
miss the quieter ones (sentence count, passive voice creeping in after
the first clause, a "there is no X" problem clause). Fix every violation
found before moving on — this step does not finish until a genuine pass
has been made against each of the 20, not until the statement "looks
done."

---

## Step 6 — Classify into the government-domain taxonomy

With the statement now quality-checked, fill in the rest of the record.
Two of these fields need direct questions — VIBER has no
workspace-to-agency mapping to infer them from, so guessing would violate
quality-checks.md's own "no unsourced claims" check. If Agency and
Government Sector come back identical, apply Step 3's "push once, then
accept" rule before moving on:

1. **Agency** — ask directly: "Which agency is this app for?"
2. **Government Sector** — ask directly: "Which Government Sector does
   that agency sit under?" (e.g. Health, Education, Social and Family,
   Home Affairs, Economic Development)
3. **App Domain** — classify into exactly ONE of the 21 categories below,
   based on what the app actually *does*, not the industry its users are
   in (e.g. an internal HR leave-management app is category 1 regardless
   of which agency builds it):

   1. **Human Capital & HR** — recruitment, onboarding, training, performance, compensation, leave management.
   2. **Finance & Accounting** — budgeting, accounting, payments, financial reporting, treasury.
   3. **Procurement & Contract Management** — sourcing, tendering, vendor/contract management, purchase orders.
   4. **Grants & Funding** — grant application, disbursement, funding administration and tracking.
   5. **Corporate Administration** — general office administration, records, internal admin services.
   6. **Operations & Service Delivery** — day-to-day operational workflows and frontline service delivery.
   7. **Policy & Planning** — policy formulation, planning, feasibility studies.
   8. **Strategy & Organisational Performance** — strategic planning, KPIs, performance management, organisational reviews.
   9. **Technology & Digital** — IT infrastructure, applications, digitalisation, systems development.
   10. **Data, Analytics & AI** — data pipelines, analytics, dashboards, machine learning/AI systems.
   11. **Governance, Risk & Audit** — internal controls, risk management, audit, compliance oversight.
   12. **Legal & Regulatory Affairs** — legal advisory, contracts review, regulatory interpretation.
   13. **Licensing, Regulation & Enforcement** — permits, licences, inspections, enforcement actions.
   14. **Communications & Engagement** — public communications, media, stakeholder/public engagement.
   15. **Learning & Capability Development** — training programmes, capability building, skills development.
   16. **Facilities, Estates & Asset Management** — building/estate management, facilities maintenance, physical asset tracking.
   17. **Citizen & Business Services** — public-facing service delivery to citizens or businesses.
   18. **Research, Innovation & Experimentation** — R&D, pilots, innovation labs, experimentation.
   19. **Partnerships & International Relations** — external partnerships, international cooperation/relations.
   20. **Security, Safety & Resilience** — security operations, safety management, business continuity/resilience.
   21. **Project & Programme Management** — project/programme planning, tracking, delivery management.

4. **Problem Type** — exactly ONE of: `Dashboard`, `Workflow/Process
   Tool`, `Portal`, `Case Management System`, `Registry/Directory`,
   `Reporting & Analytics Tool`, `Communication/Collaboration Tool`,
   `Data Pipeline/Integration`, `Content Management System`, `Other`. Use
   `Other` only if none reasonably fit.
5. **Problem Theme** — a short, literal 2-5 word tag distinct from the
   full statement, e.g. "Candidate assessment", "Leave application
   tracking", "Grant disbursement". Keep it literal, not creatively
   paraphrased — two apps solving the same underlying problem should get
   the same (or very similarly worded) theme.

This classification step covers exactly one app per call — it does not
produce or depend on any cross-app rollup view (per-agency,
whole-of-government, or cross-domain-theme totals). That kind of rollup
needs to look at many apps' statements at once and is out of scope for a
single invocation of this skill.

---

## Step 7 — Deliver

VIBER has no file-download capability from the session workspace — a
file written here can only be opened inside the VIBER code editor itself,
there is no link the user can click to download it. Do not describe the
file as "downloadable" or imply a download link exists.

Write the document to **`problem-statement.md`** at the project root —
always this exact filename, never a per-app or per-topic variant. If the
file already exists (a prior run of this skill), overwrite it — this
skill keeps a single current statement per project, not a history of
every past run. Content:

```markdown
# Problem Statement — [App Name or short descriptor]

**Agency:** [answer]
**Government Sector:** [answer]
**App Domain:** [one of the 21]
**Problem Type:** [one of the 10]
**Problem Theme:** [short tag]

## Problem Statement

[The drafted, quality-checked statement — context, problem, impact]
```

The "no preamble / no inline labels" quality check applies to the
statement's own prose (no [context]/[problem]/[impact] tags inside it) —
not to this document's own section headers, which are a document
convention, not part of the statement text.

**After writing the file, ask the user if they also want it printed in
the chat reply** so they can copy it out directly (e.g. to paste into
Confluence, email, or elsewhere). If they say yes, print the exact same
content as plain text, not inside a code block — a code block would make
the statement look like code and complicates copying for most users. If
they don't want it printed, just confirm the file was saved and move on.

If there are gaps the user could not answer, or Step 3's "push once, then
accept" ended with a broad answer kept as-is (a whole-agency "who",
identical Agency/Government Sector, etc.), list each below the document
(not inside it): what is weak because of the gap, what to do about it,
and how filling it would change the statement. Don't gate on these — the
user decides whether to proceed as-is.

If the final statement contains no actual numbers (only vague ranges),
recommend gathering real data — a statement with real figures is harder
to dismiss and easier to act on.

---

## Step 8 — Re-run behaviour

This skill can be called again later on the same app, any time its
features, structure, or data have changed. Each run is a fresh interview
from Step 0 — not a diff against prior answers. If the user mentions what
changed, that's just part of what they describe when asked what the app
does now; treat it the same as a brand-new interview. The new statement
overwrites `problem-statement.md` — mention this before writing if the
file already exists, so the user knows the prior version won't be kept.

This is for an **explicit re-invocation** of the skill. If instead the
user just asks whether an existing statement still holds without asking
to regenerate it, that's Step 1's drift-check row, not this one — a
quick comparison, not a full re-interview.

---
*Prepared by CIOO Rabbit Team · For use with VIBER Studio on Rabbit Deploy*
