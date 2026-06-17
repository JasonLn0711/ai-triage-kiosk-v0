---
id: smart-health-cabin-feasibility-response-outline
title: "Smart Health Cabin Feasibility Response Outline"
date: 2026-06-17
topic: ai-triage
type: handoff-outline
status: draft
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
---

# Smart Health Cabin Feasibility Response Outline

## Purpose

Use this outline after the `2026-06-23` onsite visit to prepare a
source-backed response to 慧誠智醫（imedtac Co., Ltd.）on feasibility, initial
schedule, and preliminary budget basis.

## Recommended Structure

### 1. Recommendation

State the positive first decision:

```text
We recommend a staged Smart Health Cabin software delivery path that begins
with equipment-confirmed MVP scope, reviewed questionnaire content, structured
report design, and HIS-ready data modeling.
```

### 2. Confirmed Source Facts

Include only facts confirmed by:

- Johnny's email and requirements PDF;
- `2026-06-23` equipment visit;
- imedtac engineering answers;
- clinical/content owner answers.

### 3. Proposed MVP

Split the MVP into:

- Module A minimum viable vision/hearing screening workflow;
- Module B minimum viable questionnaire/branching/report workflow;
- report + QR Code minimum;
- API/JSON/ERD minimum;
- CMS minimum or CMS interface boundary.

### 4. Work Breakdown

Use clear phases:

| Phase | Target | Deliverable |
| --- | --- | --- |
| Discovery closeout | late June | source facts, RACI, MVP boundary |
| Design spec | early July | UI flow, schema, ERD draft, question flow |
| Prototype | July | clickable frontstage and data model prototype |
| Build/integration | August | narrowed module implementation and CMS/API boundary |
| Site integration | early September | integration test and acceptance fixes |
| Handoff | mid-September | deployment guide, source package, acceptance record |

### 5. RACI

Include owners for:

- UI/UX;
- vision/hearing method;
- questionnaire content;
- clinical review;
- CMS;
- API/JSON;
- ERD;
- deployment;
- acceptance testing;
- maintenance.

### 6. Budget Basis

Provide ranges only after assumptions are explicit. Tie each estimate to:

- number of modules included;
- whether CMS is built or integrated;
- whether hearing calibration is exploratory or validated;
- whether HIS is schema-only or live integration;
- whether source-code delivery includes reusable engine components;
- post-launch support period.

### 7. Scope Controls

Use affirmative operating-scope language:

- screening support;
- reviewed questionnaire guidance;
- human-review workflow;
- HIS-ready data model;
- future validation path;
- separate production governance path.

### 8. Open Decisions

End with a table:

| Decision | Owner | Needed by | Impact |
| --- | --- | --- | --- |
| First-release target | imedtac / hospital | TBD | schedule and cost |
| Clinical content owner | imedtac / hospital / 多寶 | TBD | questionnaire readiness |
| CMS ownership | imedtac / NYCU | TBD | build scope |
| HIS standard | imedtac / hospital IT | TBD | API and ERD |
| Source-code/license terms | imedtac / NYCU | TBD | delivery and IP boundary |

## Material To Exclude From External Version

- raw Teams screenshots;
- private token details;
- unreviewed internal speculation;
- patent-sensitive AI Triage method details;
- any statement implying diagnosis, treatment, final triage level, or live HIS
  integration unless explicitly confirmed.
