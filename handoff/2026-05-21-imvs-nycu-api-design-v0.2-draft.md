---
id: 2026-05-21-imvs-nycu-api-design-v0.2-draft
title: "iMVS / NYCU AI Triage Demo API Design v0.2 Draft"
date: 2026-05-21
topic: ai-triage
type: handoff
status: post-sync update needed
audience: Johnny Fang and imedtac engineering design team
source:
  - ../docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md
  - ../source/2026-05-12-imedtac-company-ai-triage-sync/source.md
  - ../source/2026-05-19-johnny-ai-triage-product-spec/source.md
  - ../source/2026-05-19-johnny-line-thursday-engineering-sync/source.md
  - ../source/2026-05-19-expert-review-scope-api-boundary/source.md
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md
---

# iMVS / NYCU AI Triage Demo API Design v0.2 Draft

## Purpose

This draft answers Johnny's `2026-05-19` request for an API design document for
the mid-June AI triage customer demo.

The goal is to freeze the smallest integration contract for a synthetic-data
demo:

```text
iMVS vital-sign payload
  -> NYCU typed question object + session_key
  -> iMVS answer payload + session_key
  -> NYCU next question or staff_review_summary
```

This file began as NYCU's pre-sync API v0.2 draft. After the sync, treat it as
the working base for the confirmed post-sync API update. It is not frozen until
慧誠 confirms current-device deltas from the 5/12 V1.4 payload baseline,
required/optional fields, missing/failure semantics, UI insertion point, and
session ownership.

Important baseline update: 慧誠 already provided iMVS Product Spec `V2.0.4` and
iMVS API Definition `V1.4` on `2026-05-12`. Those files define hardware modules,
the Vital Sign Upload field family, and sample units. This API draft should use
that company-provided baseline while still asking imedtac engineering to confirm
current-device deltas and target-SKU optionality.

Post-sync update on `2026-05-21`: the Thursday sync selected the simpler June
path. The first integration pass should be `post_measurement_only`, with iMVS
completing measurement before starting the NYCU session and sending the vital
payload in that first call.

This means Endpoint 1 and Endpoint 3 should be merged for June. The separate
vitals-ready endpoint remains the optimized future flow described in
`docs/2026-05-19-two-phase-question-flow-design.md`, not the current June
default.

After the sync, produce the confirmed post-sync API v0.2 from this draft,
`handoff/2026-05-22-api-v0.2-requirements-from-expert-review.md`, and
`source/2026-05-21-imedtac-engineering-sync/meeting-record.md`.

Post-Duobao internal sync update on `2026-05-21 10:57`: do not design this API
as a formal triage-level output API. The API should return typed questions and
staff-review summaries. The new engineering question is whether iMVS can render
a reusable question object with variable options and progress metadata, instead
of requiring one hand-coded screen per clinical question. Numeric / scale
metadata remains a future UI-template question after imedtac confirms support.

## Demo Boundary

This API is for a synthetic-data capability demo only.

It does not provide:

- diagnosis;
- treatment advice;
- final triage / acuity level;
- emergency order;
- real patient-data processing;
- production HIS / EMR / FHIR writeback.

Use `staff_review_summary`, `review_basis`, or `clinical_review_note` for the
output field. Expert freeze-gate update: prefer `review_basis` over
`assessment_support` because the latter can be confused with SOAP Assessment.
Do not name the output field `diagnosis`.

## June v0.2 Endpoint Summary

The June integration contract has two required endpoints:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

For June, iMVS starts the NYCU session only after measurement is complete. The
start-session request therefore includes the measured vital payload. NYCU returns
`session_key` plus the first typed question. Every later answer submission echoes
the same `session_key`; NYCU returns either the next typed question or
`staff_review_summary`.

The future two-phase vitals-ready endpoint is documented in the appendix. It is
not required for the June customer-demo integration.

## Value-Set Contract

The JSON keys are fixed by the endpoint schema. Values are split into four
contract classes:

| Class | Contract rule | Examples |
| --- | --- | --- |
| Programmatic enum / code | Must list allowed values. Any value that affects routing, UI template selection, session state, retry, fallback, error handling, or audit trace must be stable. | `status`, `session_state`, `workflow_mode`, `measurement_state`, `question.type`, `measurement_status`, `quality_flag`, `error.code` |
| Stable ID | Must be stable within the active versioned question set. The UI displays labels but submits ids. | `question.id`, `option.id`, `answer.selected_option_ids`, `handoff_reason_codes` |
| Display text | Must define owner, locale, visibility, length guidance, and versioning; do not enumerate every possible sentence. Frontend must not parse display text for logic. | `question.text`, `option.label`, `phase_reason`, `staff_review_summary.subjective`, `staff_handoff_note` |
| Numeric / boolean / timestamp | Define type, nullable behavior, unit, precision/range if needed, and missing/failure representation. Do not enumerate all possible values. | `heart_rate_bpm.value`, `vitals_ready`, `measurement_timestamp` |

June v0.2 enum baseline:

| Field | Allowed values / rule |
| --- | --- |
| `status` | `question`, `summary`, `error` |
| `session_state` | `active`, `summary_ready`, `expired`, `abandoned`, `error` |
| `workflow_mode` | Current June value: `post_measurement_only`; future optimized value: `parallel_measurement_intake` |
| `measurement_state` | Current June normal value: `complete`; error/future values: `failed`, `missing`, `in_progress` |
| `question_phase` | Current June values: `post_measurement_intake`, `summary`; future optimized values: `pre_vital_intake`, `post_vital_followup` |
| `question.type` | Current June values: `single_choice`, `multi_choice`; future value after UI confirmation: `scale` |
| `question.ui_template` | Same as `question.type` unless imedtac defines a separate template enum. |
| `vitals.<field>.measurement_status` | `measured`, `missing`, `failed`, `manual_entry`, `not_available` |
| `vitals.<field>.quality_flag` | `ok`, `needs_review`, `device_error`, `out_of_range_demo`, `unknown` |
| `summary_visibility` | `staff_only` |
| `client_event.input_mode` | June value: `touch`; optional/future values: `keyboard`, `voice_confirmed`, `operator_scripted` |
| `fallback.recommended_mode` | `standard_staff_workflow`, `local_scripted_demo`, `retry_remote_api` |
| `error.code` | `api_timeout`, `invalid_session`, `measurement_quality_unavailable`, `missing_required_field`, `unsupported_question_type`, `idempotency_conflict` |

`answer.selected_option_ids` is constrained by the immediately preceding
`question.options[*].id` list. This is intentional: option labels may change
with wording review, but option ids remain the machine-readable contract for
answer submission and summary mapping.

## Company-Provided Vital Payload Baseline

Canonical extraction:

- `docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md`

The June adapter should begin from the iMVS V1.4-style nested upload payload and
normalize it into NYCU's per-vital object shape.

| iMVS V1.4 object | iMVS value field(s) | iMVS unit sample | NYCU v0.2 normalized field(s) |
| --- | --- | --- | --- |
| `NBP` | `SYS_Value`, `DIA_Value` | `mmHg` | `blood_pressure_systolic_mm_hg`, `blood_pressure_diastolic_mm_hg` |
| `SPO2` | `Value` | `%` | `spo2_percent` |
| `HR` | `BP_Value` | `bpm` | `heart_rate_bpm` |
| `Temp` | `Value` | `deg C` / source sample `°C` | `temperature_c` |
| `Glucose` | `Value` | `mg/dL` | `glucose_mg_dl` |
| `Weight` | `Value` | `kg` | `weight_kg` |
| `Height` | `Value` | `cm` | `height_cm` |

Adapter controls:

- The company V1.4 values are typed as strings; NYCU runtime can parse numeric
  values but should preserve source units in logs and summaries.
- The company parameter table has an HR unit typo-like `bmp`, while its JSON
  sample uses `bpm`; use `bpm` as the normalized unit.
- `Respiratory rate` is not listed in the 5/12 V1.4 API. Keep any respiratory
  rate field demo-only unless imedtac confirms a measured or manual-entry
  source.
- `BMI` is a report/derived concept from height and weight, not a confirmed
  V1.4 upload field.
- SpO2 and glucose appear in the API baseline, while the product spec marks
  their hardware modules optional in some variants. Confirm target-SKU
  availability before making either field mandatory.

## Endpoint 1: Start Session With Measured Vitals

```http
POST /api/triage-demo/sessions
Content-Type: application/json
```

### Request

Example:

- `api-examples/2026-05-21-start-session-request-demo-tachycardia.json`

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `api_version` | string | yes | Discussion value: `2026-05-22-demo-v0.2-draft`. |
| `schema_version` | string | yes | Discussion value: `imvs-nycu-triage-demo-schema-v0.2-draft`. |
| `flow_version` | string | yes | Discussion value: `tachycardia-live-demo-flow-v0.2-draft`. |
| `case_id` | string | yes | Synthetic demo case id; do not use real encounter id. |
| `case_version` | string | yes | Synthetic case content version. |
| `fixture_version` | string | yes | Synthetic fixture version. |
| `question_set_version` | string | yes | Question wording/order/mapping version. |
| `wording_version` | string | yes | Staff-summary wording version pending clinical signoff. |
| `request_id` | string | yes | Client-generated request id for tracing and retry discussion. |
| `idempotency_key` | string | yes | Prevents duplicate start-session retries from creating duplicate workflow advancement. |
| `workflow_mode` | string | yes | Must be `post_measurement_only` for the June contract. Future optimized value: `parallel_measurement_intake`. |
| `measurement_state` | string | yes | Must be `complete` for the June contract because iMVS calls this endpoint after measurement. |
| `vitals_ready` | boolean | yes | Must be `true` for the June contract because measured vitals are included in this first call. |
| `safe_to_ask_phase1_question` | boolean | no | Do not send for the June contract. Only needed for future `parallel_measurement_intake`. |
| `client.source` | string | yes | Example: `imvs-demo`. |
| `client.locale` | string | yes | Example: `en-US`. |
| `patient_context.demo_patient_id` | string | yes | Demo-only ID. Do not send real MRN or name. |
| `patient_context.age` | number | no | Synthetic demo demographics only. |
| `patient_context.sex` | string | no | Synthetic demo demographics only. |
| `vitals` | object | yes | iMVS-shaped measured vital payload. June requests should not use `measurement_state=in_progress`. |
| `vitals.measurement_timestamp` | string | yes | ISO timestamp for the vital-sign measurement event. |
| `vitals.device_id` | string | yes | Demo device identifier, not a patient identifier. |
| `vitals.<field>.value` | number/null | yes | Per-vital measured value or `null` when unavailable / failed. |
| `vitals.<field>.unit` | string | yes | Explicit unit. Baseline units from iMVS V1.4 are `mmHg`, `%`, `bpm`, `deg C` / `C`, `mg/dL`, `kg`, and `cm`. |
| `vitals.<field>.measurement_status` | string | yes | `measured`, `missing`, `failed`, `manual_entry`, or `not_available`. |
| `vitals.<field>.quality_flag` | string | yes | `ok`, `needs_review`, `device_error`, `out_of_range_demo`, or `unknown`. |
| `vitals.<field>.missing_reason` | string/null | no | Required when a vital is missing or failed. |
| `capabilities.question_types` | array | yes | June tachycardia live lane uses `single_choice` and `multi_choice`; keep `scale` as a future UI template only after imedtac confirms support. |
| `capabilities.max_questions` | number | yes | UI capacity cap, not guaranteed final question count. Use `progress.expected_total` for `Question X of Y`; current June tachycardia lane uses `7`. |
| `capabilities.max_options_per_question` | number | yes after Teams `2026-05-25` signal | imedtac UI working layout supports up to `9` short options without user scrolling; NYCU should still prefer fewer options for readability. |
| `capabilities.max_option_label_length` | number | ask imedtac / design short labels | Needed to avoid text overflow on the kiosk display; current working control is short option wording. |
| `capabilities.variable_option_count` | boolean | ask imedtac | Confirms whether NYCU may return different option counts per question. |
| `capabilities.voice_input` | boolean | yes | Recommended `false` for June critical path. |

### Response

Example:

- `api-examples/2026-05-21-start-session-response-question.json`

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `session_key` | string | yes | Proposed: NYCU generates; iMVS echoes it in later calls. |
| `request_id` | string | yes | Echo request id for traceability. |
| `response_id` | string | yes | NYCU response id for demo debugging. |
| `session_expires_at` | string | yes | Expiry time for the demo session. |
| `session_state` | string | yes | `active`, `summary_ready`, `expired`, `abandoned`, or `error`. |
| `last_question_id` | string/null | yes | Last answered or emitted question id; `null` on first question. |
| `status` | string | yes | `question` or `summary`. |
| `workflow_mode` | string | yes | Echoes the chosen workflow mode. |
| `measurement_state` | string | yes | Echoes `complete` for the June contract. |
| `vitals_ready` | boolean | yes | Echoes `true` for the June contract. |
| `question_phase` | string | yes if `status=question` | Use `post_measurement_intake` for the June contract; future two-phase uses `pre_vital_intake` or `post_vital_followup`. |
| `phase_reason` | string | yes if `status=question` | Short reason why this question is allowed in the current phase. |
| `progress.current` | number | yes | Required for AC07 progress display. |
| `progress.expected_total` | number | yes | Recommended denominator for `Question X of Y`; must be less than or equal to `capabilities.max_questions`. For the June tachycardia lane, keep it stable within a session. |
| `question.id` | string | yes if `status=question` | Stable runtime question id. |
| `question.registry_refs` | array | yes | Question registry IDs backing this runtime question. |
| `question.source_refs` | array | yes | Source IDs backing this runtime question. |
| `question.evidence_status` | string | yes | Current evidence status. |
| `question.review_owner` | string | yes | Owner for wording/source review. |
| `question.type` | string | yes if `status=question` | June tachycardia live lane uses `single_choice` or `multi_choice`; `scale` remains a future template. |
| `question.ui_template` | string | yes if `status=question` | Proposed: same value as `question.type` unless imedtac has separate template names. |
| `question.text` | string | yes if `status=question` | Rendered question text. |
| `question.options` | array | yes for choice types | Stable option ids and labels. |
| `question.option_count` | number | yes for choice types | Number of options in this response; lets iMVS validate template capacity. |
| `question.none_option_id` | string/null | no | Used for mutually exclusive "none" option. |
| `question.rendering_constraints.max_visible_options_without_scroll` | number | no until imedtac confirms | Display limit for customer-demo readability. |
| `question.rendering_constraints.requires_no_scroll` | boolean | no until imedtac confirms | Recommended `true` for customer-facing demo screens. |
| `question.evidence_refs` | array | no | For demo, may be `LOCAL-PROTOCOL-TBD`. |
| `demo_boundary` | string | yes | Explicit demo-only boundary. |

## Endpoint 2: Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
```

### Request

Example:

- `api-examples/2026-05-21-submit-answer-request-demo-tachycardia.json`

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `api_version` | string | yes | Must match supported demo API version. |
| `schema_version` | string | yes | Must match supported demo schema. |
| `flow_version` | string | yes | Must match the running demo flow. |
| `case_id` | string | yes | Synthetic demo case id. |
| `case_version` | string | yes | Synthetic case content version. |
| `fixture_version` | string | yes | Synthetic fixture version. |
| `question_set_version` | string | yes | Question wording/order/mapping version. |
| `wording_version` | string | yes | Staff-summary wording version. |
| `request_id` | string | yes | Client-generated id for tracing one answer submission. |
| `idempotency_key` | string | yes | Prevents retry from advancing the question flow twice. |
| `session_key` | string | yes | Same key returned by Endpoint 1. |
| `workflow_mode` | string | yes | June default: `post_measurement_only`. |
| `measurement_state` | string | yes | June default: `complete`. |
| `vitals_ready` | boolean | yes | June default: `true`. |
| `question_phase` | string | yes | Phase of the question being answered. |
| `question_id` | string | yes | The question being answered. |
| `answer.selected_option_ids` | array | yes for choice questions | For the tachycardia live lane, send selected option ids such as `heart_racing`, `few_hours`, or `chest_heaviness`. |
| `answer.scale_value` | number/null | no for June tachycardia lane | `null` for the current choice-question demo; retain only for future scale templates. |
| `client_event.input_mode` | string | yes | `touch`, `keyboard`, `voice_confirmed`, etc. |
| `client_event.answered_at` | string | no | ISO timestamp if available. |

### Response: Next Question Or Staff Summary

Example:

- `api-examples/2026-05-21-next-question-response-demo-tachycardia.json`
- `api-examples/2026-05-21-post-vital-question-response-demo-tachycardia.json`
- `api-examples/2026-05-21-summary-response-demo-tachycardia.json`

When `status=question`, the response follows the same typed question structure
as Endpoint 1.

### Response: Staff Summary

Example:

- `api-examples/2026-05-21-summary-response-demo-tachycardia.json`

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `session_key` | string | yes | Same session key. |
| `session_expires_at` | string | yes | Same session expiry window. |
| `session_state` | string | yes | `summary_ready`. |
| `last_question_id` | string | yes | Last answered question before summary. |
| `status` | string | yes | `summary`. |
| `workflow_mode` | string | yes | June default: `post_measurement_only`; future optimized flow may use `parallel_measurement_intake`. |
| `measurement_state` | string | yes | `complete` unless an error occurred. |
| `vitals_ready` | boolean | yes | Must be `true` for a staff summary. |
| `question_phase` | string | yes | `summary`. |
| `summary_visibility` | string | yes | Must be `staff_only` for June demo. |
| `handoff_required` | boolean | yes | Explicitly true for the tachycardia / chest-tightness live demo case. |
| `handoff_reason_codes` | array | yes | Stable machine-readable reasons for staff-review handoff. |
| `staff_review_summary.format` | string | yes | Proposed: `review_summary_demo`. |
| `staff_review_summary.subjective` | array | yes | Patient-reported context. |
| `staff_review_summary.objective` | array | yes | Measured vitals. |
| `staff_review_summary.review_basis` | array | yes | Non-diagnostic staff-review context; safer replacement for `assessment_support`. |
| `staff_review_summary.review_action` | array | yes | Human review reminder only. Replaces the risky `plan_support` wording. |
| `staff_review_summary.staff_handoff_note` | string | yes | Short safe display string: `Please review measured vitals and reported symptoms.` |
| `staff_review_summary.not_claimed` | array | yes | Explicit forbidden claims. |
| `evidence_refs` | array | no | For demo, may be `LOCAL-PROTOCOL-TBD`. |
| `demo_boundary` | string | yes | Synthetic demo only. |

## Appendix: Future Endpoint 3 For Two-Phase Mode

Post-sync status: future optimized mode, not June default.

Do not require this endpoint for the June customer-demo integration. Use it only
if a later stakeholder decision reopens the optimized two-phase workflow:

```text
Phase 1 during measurement
-> vitals-ready payload
-> Phase 2 vital-aware follow-up
```

Future endpoint shape:

```http
POST /api/triage-demo/sessions/{session_key}/vitals
Content-Type: application/json
```

Example:

- `api-examples/2026-05-21-update-vitals-request-demo-tachycardia.json`

Required fields for that future mode:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `api_version` | string | yes | Must match supported demo API version. |
| `schema_version` | string | yes | Must match supported demo schema. |
| `flow_version` | string | yes | Must match the running demo flow. |
| `case_id` | string | yes | Synthetic demo case id. |
| `request_id` | string | yes | Client-generated id for tracing the vitals-ready update. |
| `idempotency_key` | string | yes | Prevents duplicate vitals-ready updates from resetting the flow. |
| `session_key` | string | yes | Same key returned by Endpoint 1. |
| `workflow_mode` | string | yes | Must be `parallel_measurement_intake`. |
| `measurement_state` | string | yes | `complete` when vital values are ready; `failed` if measurement failed. |
| `vitals_ready` | boolean | yes | `true` only when measured values and quality flags are available. |
| `vitals` | object | yes | Measured vital payload plus quality fields. |

Reintroduce this endpoint only after imedtac confirms a safe measurement-time UI
window and a vitals-ready event. Until then, call Endpoint 1 after measured or
synthetic vital values are available.

## Question Types

The API should let imedtac render a small set of reusable templates. This is
the practical alternative to hand-coding every possible question screen.

### `single_choice`

Use for mutually exclusive answers.

```json
{
  "type": "single_choice",
  "ui_template": "single_choice",
  "option_count": 2,
  "options": [
    {"id": "today", "label": "Started today"},
    {"id": "days", "label": "A few days"}
  ],
  "rendering_constraints": {
    "requires_no_scroll": true,
    "max_visible_options_without_scroll": 9
  }
}
```

### `multi_choice`

Use when multiple symptoms may apply. Teams `2026-05-25` indicates imedtac UI
will not keep a static `None of these` button. If NYCU returns a
question-specific `none_option_id`, iMVS should treat that returned option as
mutually exclusive and clear other selected options.

```json
{
  "type": "multi_choice",
  "ui_template": "multi_choice",
  "option_count": 3,
  "none_option_id": "none",
  "options": [
    {"id": "shortness_of_breath", "label": "Shortness of breath"},
    {"id": "dizziness", "label": "Dizziness / lightheadedness"},
    {"id": "none", "label": "None of these"}
  ]
}
```

### `scale`

Not used in the June tachycardia live lane. Keep this only as a future UI
template if imedtac confirms a scale widget.

```json
{
  "type": "scale",
  "ui_template": "scale",
  "scale": {
    "min": 0,
    "max": 10,
    "min_label": "No pain",
    "max_label": "Worst imaginable pain"
  }
}
```

## Proposed First Demo Case

Start with one case:

```text
palpitations / chest tightness with elevated heart-rate cue
```

Why:

- It uses heart rate as the most controllable live vital cue for customer demo performance.
- It shows measured vitals affecting follow-up questions after the iMVS measurement completes.
- It can produce a useful staff-review summary without diagnosis.
- It is easier to perform live than a low-SpO2 scenario while preserving respiratory synthetic fallback as a comparison lane.

Demo-safe summary wording after expert review:

```text
Synthetic demo case.
Patient reports palpitations and middle chest tightness for about half a day, with no selected associated shortness of breath, sweating, dizziness, or fainting options.
Measured vitals include HR 130 bpm, SpO2 98%, BP 102/68 mmHg, respiratory rate 16 breaths/min, and temperature 36.5 C.
Staff should review the measured heart-rate cue, reported cardiopulmonary symptoms, rhythm-history selection, and medication/allergy confirmation.
This demo does not diagnose, recommend treatment, assign a final triage level, or write to HIS/EMR.
```

For the tachycardia live case, do not force all eight questions. The preferred
flow is seven visible questions:

```text
Q1 chief concern
Q2 onset timing
Q3 associated symptoms
Q4 known rhythm / heart history
Q5 current medication status
Q6 medication allergy status
Q7 heart-rate cue confirmation for staff review
-> staff_review_summary
```

## Failure Behavior

For June, keep failure behavior simple and explicit.

| Failure | Recommended response |
| --- | --- |
| Missing required vital field | Return `status=error`, `error.code=missing_required_field`, and name the field. |
| Unsupported question type | Return `status=error`, `error.code=unsupported_question_type`. |
| Expired / unknown session | Return `status=error`, `error.code=invalid_session`. |
| Measurement quality unavailable | Return `status=error`, `error.code=measurement_quality_unavailable` or continue only with explicit staff-review handoff if 多寶 approves. |
| Network unavailable | iMVS shows fallback screen; no clinical result is displayed. |
| NYCU API timeout | iMVS shows retry or fallback screen; no fabricated summary. |

Example:

- `api-examples/2026-05-21-error-response-demo-invalid-session.json`

Fallback wording:

```text
AI triage demo service is unavailable. Please continue with the standard staff workflow.
No AI-generated clinical summary was produced.
```

## Data And Privacy Rules

For the June demo, do not send:

- real patient name;
- real MRN / chart number;
- national ID;
- phone number;
- address;
- raw audio;
- real medical record content;
- credentials or endpoint secrets.

Use `demo_patient_id` only.

## Decisions Needed From 慧誠

- Current-device field-name and unit deltas from the `2026-05-12` iMVS API
  `V1.4` baseline.
- Which fields are guaranteed vs optional.
- Whether NYCU may generate `session_key`.
- Where AI triage appears in the UI flow.
- Whether iMVS can render reusable question templates from a typed question
  object: `single_choice`, `multi_choice`, variable option counts, option
  length limits, and no-scroll behavior. Keep numeric / scale as a future
  template only if imedtac confirms support.
- Whether June demo may call an external HTTPS endpoint or laptop API.
- Whether local mock fallback is acceptable.
- Required language: English only, Chinese only, or bilingual.
- Whether voice input is in or out for the June critical path.
- Who is the engineering point of contact.
- When the API design must be finalized.

## Recommended Delivery Timeline

| Date | Deliverable |
| --- | --- |
| `2026-05-20` | Send API design skeleton / sample JSON for review. |
| `2026-05-21` | Thursday sync: freeze fields, session behavior, UI insertion, and clinical wording. |
| `2026-05-22` | API design v0.2 with confirmed field names and one mock flow. |
| `2026-05-25` | First mock adapter or static integration rehearsal, if fields are confirmed. |

## Suggested Reply To Johnny

```text
Johnny 好，我可以先在 5/20 提供一版 API design skeleton，內容會包含：
1. iMVS 上傳 vital sign payload 的建議欄位；
2. NYCU 回傳 question object + session_key 的格式；
3. iMVS 回傳 answer + session_key 後，NYCU 回下一題或 staff-review summary 的格式；
4. 六月 demo 的 in/out scope。

週四可以跟你和工程設計團隊一起確認欄位、session key、UI 插入點、網路/compute 方式，以及 voice input 是否放進六月 demo 主線。
另外我會請多寶一起確認 clinical stop rule 和 summary wording，避免 demo 被理解成 diagnosis 或 final triage decision。
```
