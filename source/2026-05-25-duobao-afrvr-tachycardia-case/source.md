---
id: 2026-05-25-duobao-afrvr-tachycardia-case
title: "Duobao AfRVR Tachycardia Question-Answer Demo Case"
date: 2026-05-25
topic: ai-triage
type: source
status: archived
confidentiality: clinical-draft-local-only
source_note: user-provided Markdown file from Downloads
---

# Duobao AfRVR Tachycardia Question-Answer Demo Case

## Source Boundary

This source bundle preserves the `Case_Tachy.md` file provided by 多寶 for the
慧誠智醫（imedtac Co., Ltd.）AI triage kiosk demo lane on `2026-05-25`.

Treat the AfRVR label as an internal clinical-design anchor. Runtime and
customer-facing wording should continue to describe a synthetic palpitation /
chest-tightness case with a measured heart-rate cue, structured question
answers, and a staff-review summary. The case is not a diagnosis rule,
treatment recommendation, final triage / acuity assignment, ECG order, or
production clinical decision workflow.

## Archived File

| File | Original file | Purpose | SHA-256 |
| --- | --- | --- | --- |
| `duobao-afrvr-tachycardia-question-answer-demo.md` | `/home/jnclaw/Downloads/Case_Tachy.md` | Case 2 AfRVR-style tachycardia question-answer demo with measured-first vitals, selected answers, and expected staff-readable output. | `8aeada683aa69cdb14059060cc5bc710f3f03c2f2d8429aff8a955b4a83e0e23` |

## What It Confirms

- The first live-performance lane can use a measured-first tachycardia /
  palpitation / chest-tightness case.
- The case uses synthetic demographics: `76 y/o Female`.
- The measured-first vital payload is `T 36.5 C`, `HR 130`, `RR 16`, `SpO2 98%`,
  and `BP 102/68`.
- The selected answers support a concise staff-review summary: palpitations and
  middle chest tightness for half a day, no selected associated red-flag
  symptoms, arrhythmia and hypertension history, aspirin / antihypertensive
  medication context, and no allergy.
- The question path remains compatible with `single_choice` / `multi_choice`
  kiosk rendering and the two-endpoint post-measurement API contract.

## Delivery Impact

This source closes the `2026-05-25` first-lane case input needed for the current
imedtac response package. The API contract, JSON examples, question / option
template, and skip-behavior answer can now move to the next engineering step:
imedtac field-dictionary confirmation, UI rendering-limit confirmation, and
API rehearsal with the tachycardia demo lane.

## Demo-Safe Interpretation

Use these output concepts:

- `staff_review_summary`
- `review_basis`
- `review_action`
- `staff_handoff_note`
- `scope_controls`

Do not output these concepts as system conclusions:

- AfRVR diagnosis;
- arrhythmia diagnosis;
- ACS / heart-attack diagnosis;
- ECG order;
- medication or treatment recommendation;
- final triage level or formal acuity score;
- production HIS / EMR / FHIR writeback.

## Derived Handoff Files

- `../../handoff/2026-05-21-imedtac-two-endpoint-api-reply.md`
- `../../handoff/2026-05-21-to-2026-05-25-imedtac-response-plan.md`
- `../../handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md`
