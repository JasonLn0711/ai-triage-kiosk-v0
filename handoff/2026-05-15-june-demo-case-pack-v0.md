---
id: 2026-05-15-june-demo-case-pack-v0
title: "June AI-Triage Demo Case Pack v0"
date: 2026-05-15
topic: ai-triage
type: handoff
status: draft
source_bundle: ../source/2026-05-15-huicheng-second-sync-and-duobao-followup/
---

# June AI-Triage Demo Case Pack v0

## Boundary

All cases here are synthetic demo cases. They are not real patient data, not
clinical guidance, and not validated triage rules.

The demo output should be a clinician-review intake summary, not a diagnosis or
autonomous triage decision.

Company-side minutes after the meeting add a useful constraint: keep the
question count within `8-10`, use touch options plus partial voice input, and
consider case families such as trauma, chronic disease, and allergy. Those case
families should be confirmed against the vital-sign story before implementation.

## Case Table

| Case | Demo purpose | Vital signs to use | Kiosk-level questions | Stop rule |
| --- | --- | --- | --- | --- |
| Fever + cough / shortness of breath | Show temperature + SpO2 affecting follow-up. | Temp, SpO2, HR | Chief complaint, fever duration, cough, shortness of breath, chest pain, chronic disease, allergy. | Stop after respiratory red flags and hand staff a summary. Do not diagnose pneumonia / flu / COVID. |
| Abdominal pain + fever | Show location + pain score + fever. | Temp, HR, BP | Chief complaint, pain location, pain score, fever, vomiting, chronic disease, allergy. | Stop after location and red-flag context. Do not diagnose cholecystitis / appendicitis. |
| Chest tightness / palpitations + very fast HR | Show vital-sign-driven staff-review signal. | HR, BP, SpO2 | Chest discomfort, shortness of breath, dizziness/fainting, onset, chronic disease, medication/allergy. | If HR is very high or symptoms are concerning, show staff-review language only. Do not name arrhythmia or assign acuity. |
| Low SpO2 + dyspnea | Show clear vital abnormality plus symptom confirmation. | SpO2, HR, Temp | Shortness of breath, chest pain, fever/cough, chronic lung/heart disease, onset. | Hand off promptly to staff-review summary. No autonomous emergency instruction until wording is approved. |
| High BP / chronic-disease context | Match realistic kiosk self-measurement story. | BP, BMI/weight, HR | Headache/chest pain, dizziness, chronic disease, medication, allergy. | Present chronic-risk context and reported symptoms only. Do not recommend medication changes. |
| Allergy / mild trauma candidate | Matches company example categories, but vital-sign linkage must be designed carefully. | Temp, HR, BP, SpO2 if respiratory allergy | Exposure/allergen or injury mechanism, breathing symptoms, swelling, pain score, allergy history. | Use only if it demonstrates vital-aware intake. Do not diagnose anaphylaxis, fracture, or wound severity. |

## First Case To Implement

Start with:

```text
Fever + cough / shortness of breath
```

Minimum payload:

```json
{
  "case_id": "demo-fever-respiratory-001",
  "status": "synthetic_demo_only",
  "age": 42,
  "sex": "female",
  "chief_complaint": "I have fever and cough",
  "vitals": {
    "temperature_c": 38.7,
    "spo2_percent": 93,
    "heart_rate_bpm": 108,
    "blood_pressure": "128/78"
  }
}
```

Question sequence:

1. What brings you in today?
2. How long have you had fever or chills?
3. Are you coughing?
4. Are you short of breath?
5. Do you have chest pain or pressure?
6. Do you have any chronic diseases?
7. Are you allergic to any medicine?
8. Is there anything short you want staff to know?

Clinician-review summary shape:

```text
Synthetic demo case.
Patient reports fever and cough.
Measured vitals include elevated temperature and lower SpO2 than expected.
Patient reports / denies shortness of breath and chest pain according to answers.
Staff should review the respiratory complaint and measured vitals.
This demo does not diagnose, recommend treatment, or assign final triage level.
```

## What 多寶 Can Fill Next

For each case:

- realistic age / sex;
- chief complaint wording in patient language;
- plausible vital-sign pattern;
- `5-8` kiosk-level questions;
- one sentence of staff-facing concern;
- one sentence of what the system must not claim.

## What Jason Can Build Next

- Convert each case into JSON-shaped fixtures.
- Build one guided question-flow screen.
- Build one summary screen.
- Add an API contract draft:
  - input: `vitals + fixed answers + optional ASR text`;
  - output: `next_question` or `summary`.
- Keep a remote-compute option for ASR / LLM-style behavior during the June demo.
