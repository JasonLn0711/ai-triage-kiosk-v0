---
id: 2026-05-20-duobao-demo-cases-question-design
title: "Duobao Demo Cases And Question Design"
date: 2026-05-20
topic: ai-triage
type: source
status: archived
confidentiality: clinical-draft-local-only
---

# Duobao Demo Cases And Question Design

## Source Boundary

This source bundle preserves 多寶's `2026-05-20` demo case and question-design
drafts for the 慧誠智醫 / imedtac AI triage kiosk demo lane.

Treat these files as clinical/product design input. They are not validated
runtime rules, patient-facing wording, diagnosis output, treatment advice,
final triage / acuity assignment, or production clinical decision logic.

## Archived Files

| File | Original Downloads file | Purpose | SHA-256 |
| --- | --- | --- | --- |
| `question-design.md` | `/home/jnclaw/Downloads/Question_design.md` | Broad structured question design across initial, symptom-specific, universal, post-vital, and SOAP-output phases. | `717499eb212d47e8a664e6ef28f4cc07482c8aa759e0f49a32f16b51d08d0945` |
| `demo-cases.md` | `/home/jnclaw/Downloads/Case.md` | Four synthetic demo case scenarios aligned to the question-design draft: abdominal pain/fever, palpitation/chest tightness, dyspnea/low SpO2, and URI contrast. | `86167375bfeae01a9334494bcf6d5d198875735df93e6d2f9b53948c58fc5788` |

## What It Adds

- A broader symptom category map: abdominal pain, headache, chest tightness /
  chest pain, fever, dizziness, trauma, skin infection, allergy, urinary
  symptoms, URI, diarrhea, back pain, eye, ENT, and chronic disease follow-up.
- A concrete output sketch based on SOAP sections.
- A four-case demo set that updates the earlier 多寶 draft into a cleaner
  English structured case format.
- Draft vital-trigger questions for temperature, SpO2, heart rate, blood
  pressure, and respiratory rate.

## Demo-Safe Interpretation

The broad question map is useful as a clinical-design inventory and future
registry source. For the June demo, runtime should still use the narrower
source-governed question bank and staff-review summary boundary.

Diagnosis-shaped case labels such as `Acute Cholecystitis`, `AfRVR`, and
`Pneumonia` are internal scenario labels only. The kiosk output must describe
reported symptoms and measured vital cues without naming those diagnoses as
system conclusions.

The SOAP `Assessment` and `Plan` sketch must be rewritten before customer-facing
or runtime use. Current repo language should stay with:

```text
staff_review_summary
review_basis
review_action
staff_handoff_note
```

Do not output:

```text
Potential Triage Level
Suggested Acuity
Suggested Disposition
Recommended Department
Immediate Actions
```

unless a clinical/company owner explicitly approves a future product scope and
the regulatory boundary is updated.

## Derived Review

- `../../docs/2026-05-20-duobao-demo-design-consistency-review.md`
- `../../decisions/2026-05-20-june-demo-question-budget.md`
