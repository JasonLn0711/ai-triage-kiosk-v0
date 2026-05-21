---
id: 2026-05-21-duobao-post-imedtac-internal-sync-meeting-record
title: "2026-05-21 Duobao Post-imedtac Internal Sync Meeting Record"
date: 2026-05-21
topic: ai-triage
type: meeting-record
status: active
source:
  - transcript-corrected.md
  - transcript-corrected-gpt-source.txt
  - transcript-gemini-reference.txt
related_source:
  - ../2026-05-21-imedtac-engineering-sync/meeting-record.md
---

# 2026-05-21 Duobao Post-imedtac Internal Sync Meeting Record

## Executive Conclusion

This internal sync sharpened the post-imedtac meeting plan.

The central conclusion is:

```text
Do not make June about AI assigning triage level.
Make June about vital-aware question selection plus staff-review summary.
```

多寶's clinical caution is clear: collecting facts, structuring them, and
summarizing them for clinicians is acceptable demo territory. Assigning a
five-level triage result or a "recommended" triage level moves into a risky
medical-judgment zone.

The technical implication is equally clear: if the demo is choice-based, a
fully hand-enumerated question tree can look non-AI. The most defensible AI
surface is narrower:

```text
measured vital context
-> choose the next appropriate question
-> generate a concise staff-readable summary
```

## What This Meeting Corrects

The earlier company sync left two unresolved questions:

1. What does `AI triage` actually output?
2. Where does AI create value if the UI is mostly single-choice and
   multi-choice?

This internal sync answers them:

- Avoid formal triage output.
- Avoid open-ended voice for June.
- Avoid free-form dynamic medical questioning that changes unpredictably.
- Use reusable UI templates instead of hand-coding every question.
- Use AI only where it improves vital-aware routing or summary quality while
  preserving deterministic controls.

## Idea Attribution / Contribution Notes

Added after Prof. Wu's `2026-05-21 12:05` IP-protection call. These notes keep
the internal contribution trail clear before more AI-Triage know-how is shared
with imedtac.

| Idea / decision | Origin / attribution | Working note |
| --- | --- | --- |
| Do not output a formal triage level in June | 多寶 / 許醫師 clinical caution, adopted by Jason for demo positioning. | Use facts, controlled questions, and staff-review summary instead of acuity-category judgment. |
| AI role as vital-aware question selection | Jason framed the technical/product story; 多寶 validated that vital signs should drive the useful AI surface. | Makes AI value visible without uncontrolled medical reasoning. |
| AI role as staff-review summary generation | Jason and 多寶 shared conclusion. | Keep the summary concise, non-diagnostic, and aimed at staff/doctor preview. |
| Fixed baseline questions plus AI-selected follow-ups | Jason and 多寶 joint design resolution. | Prevents the demo from becoming either a static tree or an uncontrolled conversation. |
| Avoid open voice / ASR for June | Jason and 多寶 joint risk assessment, consistent with imedtac hardware limits. | Voice remains a future capability after API loop and safety boundary stabilize. |
| Reusable question templates | Jason engineering concern raised from the company sync; 多寶 agreed it is necessary to avoid hand-coded screens. | Ask imedtac whether generic `question_type` objects can be rendered by June. |
| Deprioritize small-LLM wording variation | Jason proposed as possible AI surface; Jason and 多寶 deprioritized it as low clinical value. | Use AI effort on selection and summary quality instead. |
| Bounded RAG / embedding for question ranking | Jason technical option; 多寶 accepted only under controlled candidate-bank and wording limits. | Preserve as internal NYCU know-how; do not hand over unrestricted medical-reasoning logic. |
| Next-week iMVS machine review | Jason and 多寶 joint conclusion. | Inspect actual screen flow, option limits, and measurement steps before final case selection. |

## Detailed Notes

### 1. Triage-Level Output Is The Danger Zone

多寶 distinguished facts from judgment:

| Safer territory | Risky territory |
| --- | --- |
| patient-reported chief complaint | five-level triage result |
| measured vital signs | recommended triage level |
| structured intake answers | AI says the patient is category X |
| cleaned staff summary | AI replaces nurse / clinician triage |

The internal rule after this sync:

```text
Facts and summaries are safe enough for demo.
Formal triage judgment is not the June output.
```

This directly supports the existing `staff_review_summary` boundary.

### 2. AI Has Two Plausible Demo Roles

Jason and 多寶 converged on two plausible AI roles:

1. **Question selection**
   - Use measured vital signs and already collected answers to select the next
     question.
   - This is the better product story because it uses imedtac's differentiator:
     measured vital signs.

2. **Summary generation**
   - Convert messy answer details into a concise staff-readable summary.
   - This is clinically useful because clinicians do not want a cluttered raw
     answer dump.

The recommended June emphasis is:

```text
AI-assisted vital-aware question selection first;
staff-review summary generation second;
no final triage level.
```

### 3. Pure Choice Trees Can Undercut The AI Story

多寶 noted that if every question is single-choice and all paths are enumerated,
the system may not need AI at all. Jason framed the constraint: the product
spec wants fewer than 8 visible questions, so the system needs a compact way to
select the most relevant questions.

Practical resolution:

```text
fixed baseline questions
-> AI-selected / vital-aware follow-up questions
```

This creates a credible split:

- fixed questions: chief complaint, basic history, baseline context;
- AI questions: questions selected because of measured vital pattern plus prior
  answers.

### 4. Voice / Open Questions Are Not June-Safe

Both sides treated voice as too risky for the June path:

- hardware is not ready;
- latency may be too long;
- ASR requires GPU or external compute;
- open questions make behavior less controllable;
- medical questioning needs predictable behavior.

This reinforces the post-company-sync decision:

```text
June = touch / structured choice.
Voice = future capability after workflow and safety boundary are stable.
```

### 5. UI Templates Are Now A Must-Close Engineering Topic

The internal sync surfaced a concrete engineering gap that the company meeting
did not fully close:

```text
Can imedtac render a generic question object,
or must every question screen be hand-coded?
```

Jason and 多寶 concluded the demo needs reusable templates:

| Question mode | Needed template behavior |
| --- | --- |
| `single_choice` | Render variable option count and labels. |
| `multi_choice` | Render variable option count, max selection rule, and "none" behavior. |
| `number` / `scale` | Render numeric input or bounded scale. |

The API should not only send question text. It should send enough metadata for
the UI to choose the right template:

```json
{
  "question_type": "single_choice",
  "option_count": 4,
  "question_text": "...",
  "options": [...]
}
```

This should become a concrete question for Ben / imedtac engineering.

### 6. Small LLMs For Wording Variation Are Not A Strong Use Case

Jason considered using a small model such as Google Gemma to rewrite question
wording so the demo appears more flexible. The internal conclusion was that
this is technically possible but strategically weak:

- it does not add clinical value;
- it risks prompt-following errors;
- if correctness matters, too much AI variation becomes undesirable;
- it may look like AI while making the system less controlled.

Recommended stance:

```text
Do not spend June critical path on AI phrasing variation.
Spend it on vital-aware question selection and summary quality.
```

### 7. RAG / Embedding Use Should Stay Bounded

Jason raised RAG / embedding as a way to choose the next question from a larger
question bank. 多寶 agreed the real AI opportunity is selecting questions based
on vital signs.

Safe June interpretation:

```text
RAG / embedding can rank candidate questions,
but the candidate bank and output wording stay controlled.
```

Do not let RAG become open-ended medical reasoning in June.

### 8. The iMVS Workflow Is More Manual Than Assumed

The company UI demo corrected a hidden assumption: iMVS does not appear to be a
fully automatic "sit down and everything runs" device. It is a guided sequence:

```text
screen tells user what to measure
-> user positions body / device
-> user starts or confirms the step
-> measurement completes
-> next measurement step
```

This explains why inserting questions during measurement felt like
"節外生枝" to the company team. Their measurement steps are likely already
scripted and hand-controlled.

This reinforces the post-measurement June default.

### 9. iMVS Machine Review Is Necessary

Jason and 多寶 concluded that they should not continue designing from imagined
workflow. They need to physically inspect or operate the iMVS system.

Target scheduling:

- not Friday `2026-05-22`, because 多寶 has a Saturday exam;
- next week, likely Thursday or Friday;
- if possible, replace the next weekly discussion with an on-site iMVS review
  and working session.

## Planning Implications

### Next imedtac Engineering Questions

Ask Ben / imedtac engineering:

1. Can iMVS render a generic `question_type` object?
2. What question templates exist or can be added by June?
3. What are the maximum option counts for single-choice and multi-choice?
4. Can the UI render a numeric input or scale?
5. Can each question fit without scrolling?
6. Can the NYCU API return variable options per question?
7. Where exactly is the post-measurement question loop inserted?
8. Can the result page show a staff-only / doctor-preview summary?

### Next Clinical Questions For 多寶

Ask 多寶 / 許醫師:

1. Which baseline questions must remain fixed?
2. Which questions can be selected by vital-aware routing?
3. What wording must never appear in staff summary?
4. Which case is best for first demo after seeing the machine:
   respiratory synthetic, tachycardia live-performance, or paired contrast?
5. Is any "triage" wording safe, or should all external wording say
   `vital-aware intake support`?

### Next Build Plan

1. Keep post-measurement flow as June default.
2. Add a question-template API requirement to the v0.2 update.
3. Split question logic into:
   - fixed baseline questions;
   - vital-aware selected questions.
4. Keep staff summary non-diagnostic.
5. Prepare an on-site iMVS review checklist.
6. After the iMVS review, decide whether to adapt the current respiratory
   runtime or prioritize tachycardia live-performance.

## Follow-Up Checklist

- [ ] Ask Johnny / Ben to schedule next-week iMVS machine review.
- [ ] Bring current NYCU / 多寶 demo UI to the visit.
- [ ] Observe actual measurement steps and interaction constraints.
- [ ] Confirm reusable question templates.
- [ ] Confirm option-count and no-scroll limits.
- [ ] Confirm result-page audience and wording.
- [ ] Update API v0.2 with `question_type`, option metadata, and template
      constraints.
- [ ] Keep final triage level out of June summary.

## Current Decision Language

Use this as the internal working line:

```text
The June demo should not claim AI final triage. It should show that measured
vital signs can guide a short controlled question flow and produce a concise
staff-review summary.
```

Use this for external / company-facing language:

```text
This demo shows a synthetic-data vital-aware intake loop for staff-review
summary generation. Final clinical judgment remains with staff or clinicians.
```
