---
id: 2026-05-21-duobao-style-tachycardia-live-demo-question-set
title: "Duobao-Style Tachycardia Live Demo Question Set"
date: 2026-05-21
topic: ai-triage
type: handoff
status: clinical-input integrated draft
audience: Jason / Duobao / imedtac engineering / NYCU demo team
source:
  - ../source/2026-05-15-imedtac-second-sync-and-duobao-followup/duobao-demo-case-draft.md
  - ../source/2026-05-20-duobao-demo-cases-question-design/question-design.md
  - ../source/2026-05-20-duobao-demo-cases-question-design/demo-cases.md
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ../source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md
  - ../source/2026-05-25-duobao-afrvr-tachycardia-case/source.md
  - ../docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md
  - https://www.heart.org/en/health-topics/arrhythmia/about-arrhythmia/tachycardia--fast-heart-rate
  - https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack
  - https://medlineplus.gov/atrialfibrillation.html
  - https://media.emscimprovement.center/documents/Emergency_Severity_Index_Handbook.pdf
---

# Duobao-Style Tachycardia Live Demo Question Set

## Recommendation

The first live-performable June demo lane should be:

```text
iMVS measured vital payload
-> elevated heart-rate cue
-> short choice-based palpitation / chest-tightness intake
-> staff_review_summary for human review
```

This lane follows imedtac's post-`2026-05-21` preference because heart rate is the
most controllable live vital. The respiratory low-SpO2 case should remain the
synthetic fallback / evidence demo lane because SpO2 is clinically expressive but
hard to perform reliably in a live meeting.

`2026-05-25` update: 多寶 provided a Case 2 AfRVR-style tachycardia
question-answer demo with measured-first vitals and selected answers. This
confirms the first-lane question / option template is ready to move from
internal clinical-input alignment into imedtac engineering rehearsal.

Teams `2026-05-25` UI update: imedtac working layout supports up to `9` short
options without user scrolling, will keep an `I'm not sure` affordance, and
will not keep a static `None of these` UI button. If this question set needs
`none_of_these`, NYCU should return it as an explicit option in
`question.options`, not rely on a generic UI control.

All content here is a synthetic-data demo question set. It supports
staff-review intake and does not output arrhythmia diagnosis, AfRVR diagnosis,
ECG order, treatment advice, final triage score, formal acuity score, or
production HIS / EMR writeback.

## Pattern Learned From Duobao

| Duobao pattern | How this set preserves it |
| --- | --- |
| Start from chief complaint and duration. | Q1 and Q2 anchor the branch before deeper symptom narrowing. |
| Use symptom-specific branches. | Q3 and Q4 use the chest-tightness / palpitation branch from Duobao's question design. |
| Ask a post-vital trigger question after the measurement cue. | Q5 explicitly connects the measured heart-rate cue with current symptoms. |
| Keep past history / medication / allergy as handoff context. | Q6 and Q7 collect rhythm-history, medication, and allergy context for staff confirmation. |
| SOAP shape is useful but must be normalized. | The output maps Subjective and Objective into `staff_review_summary`, then uses `review_basis` and `review_action` instead of Assessment / Plan. |
| Diagnosis-shaped case labels are design anchors only. | `AfRVR` remains an internal source anchor; runtime wording says palpitation / chest tightness with elevated heart-rate cue. |

## Medical Grounding Used

| Source | Used for | Design control |
| --- | --- | --- |
| `AHA-TACHYCARDIA-FAST-HR` | Palpitations, chest discomfort, shortness of breath, dizziness, sweating, fainting, nausea as tachycardia-related symptom families. | Supports symptom options only; it does not diagnose the cause of tachycardia. |
| `AHA-HEART-ATTACK` | Chest discomfort, upper-body radiation, shortness of breath, cold sweat, nausea, tiredness, lightheadedness, rapid or irregular heartbeat. | Supports warning-symptom screening only; no ACS diagnosis or emergency order is generated. |
| `MEDLINEPLUS-AFIB` | Palpitations, trouble breathing, chest pain, dizziness/fainting, low blood pressure as AFib symptom context. | Supports history/symptom context only; no AFib diagnosis is generated. |
| `ENA-ESI-V5` | Vital signs can reveal instability and must be contextualized with history, medications, and presentation. | Supports staff-review routing and medication-context questions only; no formal triage score is assigned. |

## Demo Persona And Case Design

| Field | Draft value |
| --- | --- |
| `case_id` | `demo-tachycardia-live-001` |
| `flow_version` | `tachycardia-live-demo-flow-v0.2-draft` |
| `question_set_version` | `tachycardia-question-set-v0.2-draft` |
| Runtime-safe label | Palpitation / chest tightness with elevated heart-rate cue |
| Internal clinical anchor | Duobao's AfRVR-style case |
| Synthetic case anchor | `76 y/o female`, palpitations and middle chest tightness for half a day, HR `130 bpm`, RR `16`, SpO2 `98%`, BP `102/68 mmHg`, T `36.5 C`; history context: arrhythmia and hypertension; medication context: aspirin and antihypertensive drug; allergy: none |
| Live demo persona | English-speaking adult demo visitor. The measured heart rate can come from an on-site participant, but symptoms, age, history, and answers remain synthetic. |
| Control comparison | Healthy/control run with normal-looking heart rate and no chest-tightness answers. |
| Fallback mode | Local scripted or synthetic fixture run if live HR cannot be raised, the participant should not exercise, or device quality is unstable. |

Live-demo safety control: do not require any staff member to exercise for the
demo. Use voluntary participation only, and keep the synthetic fixture available
so the product story does not depend on a person's physiology in the meeting.

## Patient-Facing Question Set

The preferred June version stays within `7` visible questions and uses only
`single_choice` / `multi_choice`. The wording below is English-first for the US
customer demo. Duobao / clinical owner should review the exact wording before it
is sent to imedtac as final.

| # | API question id | Type | Patient-facing question | Options | Required / skip policy | Purpose and summary effect |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `tachy-chief-concern` | `single_choice` | What is the main reason you are using the kiosk today? | `heart_racing` = Heart racing / palpitations; `chest_tightness` = Chest tightness / pressure; `breathing_or_dizzy` = Shortness of breath or dizziness; `other_or_not_sure` = Other / not sure | Required. No silent skip. | Anchors the cardiopulmonary branch and records chief concern. |
| 2 | `tachy-onset` | `single_choice` | When did this start? | `within_1_hour` = Within the last hour; `few_hours` = A few hours ago; `half_day` = About half a day; `more_than_1_day_or_not_sure` = More than one day / not sure | Required. No silent skip. | Adds onset and duration context to the staff summary. |
| 3 | `tachy-current-feeling` | `multi_choice` | Which descriptions fit what you feel now? | `heart_racing` = Heart racing or pounding; `chest_heavy` = Chest tightness or heaviness; `chest_pressure_pain` = Chest pressure or pain; `burning_sharp_or_not_sure` = Burning, sharp discomfort, or not sure | Required. Allow one or more. | Preserves Duobao's quality/location branch while using touch choices. |
| 4 | `tachy-associated-symptoms` | `multi_choice` | Are any of these happening with it? | `short_breath` = Shortness of breath; `sweating_nausea_fatigue` = Sweating, nausea, or unusual fatigue; `dizzy_faint` = Dizziness, lightheadedness, or fainting; `none_of_these` = None of these | Required. Allow one or more; `none_of_these` should be mutually exclusive. If imedtac wants a separate radiation screen, split it into a follow-up after UI limits are confirmed. | Captures warning-symptom family for staff review without diagnosing. |
| 5 | `tachy-post-vital-heart-rate-cue` | `single_choice` | The kiosk received a high heart-rate reading for this demo. How do you feel right now? | `still_racing` = My heart still feels fast; `chest_still_heavy` = My chest still feels heavy / tight; `both` = Both; `neither_or_not_sure` = Neither now / not sure | Required. No silent skip. | Makes the vital-aware differentiator visible after measurement. |
| 6 | `tachy-heart-history-meds` | `multi_choice` | Have you been told you have a heart rhythm problem, or do you take heart / blood-pressure medicine? | `known_rhythm_problem` = Known rhythm problem; `heart_bp_medicine` = Heart or blood-pressure medicine; `no_known` = No known history / medicine; `staff_confirm` = Not sure, staff should confirm | Required with `staff_confirm` option. | Adds history/medication context that helps staff interpret the heart-rate cue. |
| 7 | `tachy-medication-allergy-confirm` | `multi_choice` | Do you have medication allergies or medicines staff should confirm? | `med_allergy` = Medication allergy; `regular_medicines` = Regular medicines; `none_known` = No known medication allergy; `not_sure` = Not sure | Optional if time is tight; otherwise required with `not_sure`. | Preserves Duobao's universal handoff context without free text. |

MVP rendering note: if iMVS confirms a strict four-option no-scroll limit, keep
Q1, Q2, Q5, Q6, and Q7 as above. For Q4, the cleaner implementation is to split
warning symptoms into two shorter multi-choice questions and merge Q6/Q7 into
one staff-confirmation question so the total remains at seven.

Updated UI rendering note: after the Teams `2026-05-25` follow-up, the current
working assumption is no-scroll support for up to `9` short options.
NYCU should still prefer shorter labels and fewer options for the first live
demo because the user has to make the selection quickly on a kiosk screen.

## Example Answer Path

```json
{
  "case_id": "demo-tachycardia-live-001",
  "question_set_version": "tachycardia-question-set-v0.2-draft",
  "vitals": {
    "heart_rate_bpm": {
      "value": 130,
      "unit": "bpm",
      "measurement_status": "measured",
      "quality_flag": "needs_review"
    },
    "spo2_percent": {
      "value": 98,
      "unit": "%",
      "measurement_status": "measured",
      "quality_flag": "ok"
    },
    "blood_pressure_systolic_mm_hg": {
      "value": 102,
      "unit": "mmHg",
      "measurement_status": "measured",
      "quality_flag": "ok"
    },
    "blood_pressure_diastolic_mm_hg": {
      "value": 68,
      "unit": "mmHg",
      "measurement_status": "measured",
      "quality_flag": "ok"
    },
    "temperature_c": {
      "value": 36.5,
      "unit": "C",
      "measurement_status": "measured",
      "quality_flag": "ok"
    }
  },
  "answers": {
    "tachy-chief-concern": ["heart_racing"],
    "tachy-onset": ["half_day"],
    "tachy-current-feeling": ["heart_racing", "chest_heavy"],
    "tachy-associated-symptoms": ["none_of_these"],
    "tachy-post-vital-heart-rate-cue": ["both"],
    "tachy-heart-history-meds": ["known_rhythm_problem", "heart_bp_medicine"],
    "tachy-medication-allergy-confirm": ["regular_medicines", "none_known"]
  }
}
```

## Staff-Review Summary Shape

```json
{
  "summary_visibility": "staff_only",
  "handoff_required": true,
  "handoff_reason_codes": [
    "measured_elevated_heart_rate_demo",
    "reported_palpitations",
    "reported_chest_tightness",
    "associated_symptoms_none_selected",
    "staff_review_needed"
  ],
  "staff_review_summary": {
    "format": "review_summary_demo",
    "subjective": [
      "Synthetic demo patient reports palpitations and middle chest tightness for about half a day.",
      "Selected associated symptoms: none of the listed shortness of breath, sweating, dizziness, or fainting options.",
      "Patient selected rhythm-history and hypertension context; aspirin, antihypertensive medication, and allergy status should be confirmed by staff."
    ],
    "objective": [
      "Demo vital payload includes HR 130 bpm, SpO2 98%, BP 102/68 mmHg, and temperature 36.5 C.",
      "Heart-rate field quality flag is needs_review."
    ],
    "review_basis": [
      "Measured heart-rate cue plus reported palpitation / chest-tightness symptoms supports staff review in this demo workflow.",
      "The summary organizes measured vitals and selected answers for human review."
    ],
    "review_action": [
      "Please review measured heart rate, reported symptoms, rhythm-history selection, and medication/allergy confirmation."
    ],
    "staff_handoff_note": "Review measured heart rate and reported cardiopulmonary symptoms.",
    "scope_controls": [
      "Staff-review intake support",
      "Human review workflow",
      "Synthetic-data demo context",
      "Separate validation path before clinical use"
    ]
  }
}
```

Forbidden output for this case:

- no `AfRVR` or arrhythmia diagnosis;
- no ACS / heart-attack diagnosis;
- no ECG order;
- no medication or treatment recommendation;
- no final triage score or formal acuity score;
- no production HIS / EMR / FHIR writeback.

## Items We Should Add To The Plan

| Item | Recommendation |
| --- | --- |
| Live HR may not reach the synthetic target. | Keep three modes: `live_measured`, `synthetic_override`, and `local_scripted_fallback`. The presenter should know which mode is active. |
| Staff exercise may be unsafe or impractical. | Do not depend on exercise. Use voluntary participation only and keep the synthetic fixture ready. |
| Device artifact can look like a medical signal. | Preserve `measurement_status` and `quality_flag`; if quality is uncertain, the summary should say staff should review measurement quality. |
| Patient-facing wording could alarm the user. | Patient questions should say "high heart-rate reading for this demo" or "heart-rate cue", not "dangerous tachycardia". |
| Staff preview and patient UI need separation. | `staff_review_summary` should be `staff_only`; patient-facing UI should show only the next action selected by imedtac's workflow owner. |
| Skip behavior affects safety. | Required questions should include `Not sure` / `Unable to answer` / `Staff should confirm`; avoid a silent skip on Q1-Q5. |
| UI template capacity is partially confirmed. | Use up to `9` short options as the current no-scroll working layout; still ask imedtac to confirm label length, variable option counts, and whether `none_option_id` can enforce mutual exclusion. |
| Summary preview location is now an integration decision. | Preferred path is iMVS rendering `status=summary` / `staff_review_summary` in its existing result / preview page; NYCU-hosted preview should be temporary rehearsal/debug support only. |
| The live demo needs two scripts. | Prepare both "control/normal-looking run" and "elevated-HR cue run" so the differentiator is visible. |
| Clinical owner still controls thresholds. | Treat HR values and stop rules as demo cues until Duobao / company clinical owner approves exact wording and thresholds. |

## System Design Impact

The question-set update affects configuration and routing, not the fundamental
system architecture.

| Layer | Impact |
| --- | --- |
| Workflow | Keep `post_measurement_only`: iMVS measures first, then NYCU starts the question loop. |
| Question router | Add a tachycardia / palpitation route that uses `heart_rate_bpm` plus symptom answers to choose Q3-Q5 and the summary reason codes. |
| Source governance | Add tachycardia-specific source IDs and question rows so every visible question has a review path. |
| UI templates | The case needs `single_choice` and `multi_choice` only, but option count and `none` handling need imedtac confirmation. |
| Summary generator | Add cardiopulmonary handoff reason codes and keep output staff-only. |
| Demo operations | Add mode selection: live measured run, synthetic override, and local scripted fallback. |
| Runtime default | Respiratory can remain the synthetic fallback fixture; tachycardia becomes the first live-performance lane after review. |

## API Contract Impact

The two endpoints remain stable:

```http
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

The case update changes versioned payload values:

```json
{
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "case_version": "demo-tachycardia-live-001-v0.2",
  "question_set_version": "tachycardia-question-set-v0.2-draft",
  "wording_version": "staff-summary-wording-v0.2-clinical-draft"
}
```

Recommended optional question-object fields:

| Field | Why it matters |
| --- | --- |
| `question.required` | Distinguishes required Q1-Q5 from optional staff-context questions. |
| `question.allow_not_sure` | Lets UI support uncertainty without a silent skip. |
| `question.allow_skip` | Should be `false` for Q1-Q5; can be `true` only for non-critical staff-context questions if imedtac requires skip. |
| `question.max_selections` | Needed for `multi_choice` rendering and validation. |
| `question.none_option_id` | Needed only when NYCU explicitly returns a none option inside `question.options`; imedtac will not provide a static UI-level `None of these` button. |
| `question.trigger_reason_codes` | Lets imedtac log why a question appeared. |
| `question.summary_effect` | Explains how an answer contributes to `staff_review_summary`. |

Recommended optional start-session context:

```json
{
  "demo_script": {
    "mode": "live_measured",
    "fallback_mode": "local_scripted_demo",
    "case_id": "demo-tachycardia-live-001"
  }
}
```

If imedtac does not implement a generic skip button, the existing
`answer.selected_option_ids` payload is enough because each required question
has explicit `not_sure` / `staff_confirm` style options. If imedtac implements a
generic skip button, Endpoint 2 should add:

```json
{
  "answer": {
    "selected_option_ids": [],
    "scale_value": null,
    "skipped": true,
    "skip_reason": "user_unable_to_answer"
  }
}
```

## Review Questions For Duobao / imedtac

1. Is the English wording "heart racing", "chest heaviness", and "heart-rate cue"
   acceptable for the US customer demo?
2. The `2026-05-25` 多寶 case uses HR `130 bpm`; should the synthetic fixture
   and API examples keep this as the case-aligned value while preserving a
   clearly labeled local scripted fallback if live HR cannot reach the cue?
3. Should Q5 immediately end in `staff_review_summary` if the user selects
   `both`, or should Q6-Q7 still be asked for handoff completeness?
4. Can iMVS render Q4 with the grouped warning-symptom option, or should Q4 be
   split into two shorter multi-choice questions?
5. Should Q7 be required, optional, or merged into Q6 for a faster live demo?
