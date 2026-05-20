---
id: 2026-05-20-june-demo-question-budget
title: "June Demo Question Budget"
date: 2026-05-20
topic: ai-triage
type: decision
status: active
source:
  - ../source/2026-05-20-duobao-demo-cases-question-design/source.md
  - ../docs/2026-05-20-duobao-demo-design-consistency-review.md
---

# June Demo Question Budget

## Decision

The June demo may use fewer than `12` visible patient-facing questions per
completed case flow.

Use `capabilities.max_questions = 11` in API examples and runtime contract
discussions when a hard numeric cap is needed.

## Counting Rule

Count only questions shown to the patient during the active kiosk intake:

- Phase 1 pre-vital intake questions;
- Phase 2 post-vital follow-up questions;
- universal history / medication / allergy / pregnancy questions if shown to
  the patient.

Do not count:

- measured vital-sign fields sent by iMVS;
- hidden routing metadata;
- staff-summary sections;
- source/evidence references;
- API request/response fields;
- staff-only handoff notes.

## Design Guidance

`<12` is the maximum, not the target. The preferred first respiratory demo flow
should stay around `6-8` visible questions when possible.

Use the extra budget only when it improves clinical plausibility or demo
clarity, for example:

- adding medication/allergy context;
- adding a relevant chronic disease / baseline context question;
- adding one targeted red-flag screen after vital signs are ready;
- supporting a contrast case without compressing the story unnaturally.

Do not use the larger budget to create an all-specialty questionnaire, collect
real identifiers, ask free-text questions, or output diagnosis / final triage /
disposition / department recommendations.

## Relationship To Earlier Source Material

Earlier company/source material mentioned `8-10` questions, and the product
spec text mentions fewer than `8` questions in places. Those remain preserved as
source history. This decision updates the current June demo design constraint:

```text
visible patient-facing question cap: <12
preferred first respiratory flow: 6-8
```
