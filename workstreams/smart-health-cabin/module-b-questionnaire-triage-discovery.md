---
id: smart-health-cabin-module-b-questionnaire-triage-discovery
title: "Module B Questionnaire Triage Discovery"
date: 2026-06-17
topic: ai-triage
type: meeting-prep
status: active
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ../../decisions/2026-05-22-api-contract-freeze-and-change-control.md
---

# Module B Questionnaire Triage Discovery

## Scope Statement

Module B is a standardized questionnaire-guided triage and guidance workflow
for the Smart Health Cabin. It is the module most related to the current AI
Triage work, but its scope is broader because it includes CMS, department
guidance, health education, integrated reporting, and future HIS-ready data.

The strongest first-release framing is:

```text
reviewed fixed questionnaire + versioned branching + structured guidance
content + integrated report output
```

## Reusable AI Triage Patterns

Reuse these patterns from the current AI Triage lane:

- choice-only question rendering for predictable kiosk UX;
- stable question and option IDs;
- explicit `not_sure` option semantics;
- branch path recording;
- question set and wording versioning;
- staff-review summary/report structure;
- API contract and change-control discipline.

Do not silently reuse or expose:

- patent-sensitive routing logic;
- internal source-governance method;
- existing June two-endpoint API as if it were the Smart Health Cabin API;
- formal diagnosis, treatment, or autonomous triage claims.

## Questions For Clinical / Medical Content Ownership

1. Who owns the family-medicine questionnaire content?
2. Who approves department guidance and health education wording?
3. Does 北市聯醫 provide clinical rules, or does imedtac expect NYCU / 多寶 to
   draft them?
4. What is the review and release process for new or edited questions?
5. Should outputs be patient-facing, staff-facing, or both?
6. What should the system do when answers suggest urgent concern?
7. How should "not sure", incomplete answers, or contradictory answers appear
   in the report?

## Questions For CMS And Branching

1. Is CMS built by imedtac, NYCU, or a third-party platform?
2. Is NYCU responsible for only the data schema and branching specification, or
   also the admin UI source code?
3. Must CMS support draft/publish states?
4. Is audit log required for every content change?
5. Should old reports preserve old question wording and branch logic?
6. Who can edit health education content?
7. How are content versions approved before release?

## Questions For API / Data / Report

1. What data must be returned to the kiosk frontend after each answer?
2. Does the first release need a live backend, static JSON bundle, or CMS-driven
   backend?
3. What should the integrated report include:
   - vision result;
   - hearing result;
   - questionnaire answers;
   - branch path;
   - department guidance;
   - health education;
   - measurement quality;
   - next-step instruction?
4. Does the QR Code point to a hosted report, local device page, PDF, or mobile
   web page?
5. What is the required HIS-ready payload: custom JSON, HL7, FHIR, or
   hospital-specific mapping?

## First-Release Recommendation

Recommend a first release that is deliberately narrow:

- fixed reviewed questionnaire set;
- choice-only front-end answers;
- simple branch graph;
- explicit content version;
- structured report;
- QR Code report concept with access controls defined;
- HIS-ready JSON schema without live HIS integration unless the hospital
  interface is confirmed.

This keeps September delivery credible while preserving a clean path to richer
CMS and hospital integration later.
