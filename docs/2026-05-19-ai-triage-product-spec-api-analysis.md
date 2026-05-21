---
id: 2026-05-19-ai-triage-product-spec-api-analysis
title: "AI Triage Product Spec API Analysis"
date: 2026-05-19
topic: ai-triage
type: analysis
status: draft
source_bundle: ../source/2026-05-19-johnny-ai-triage-product-spec/
related_source:
  - ../docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md
  - ../source/2026-05-12-imedtac-company-ai-triage-sync/source.md
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md
---

# AI Triage Product Spec API Analysis

## FIRST PRINCIPLE

- Scarce resource: mid-June demo execution bandwidth and stakeholder trust.
- Canonical source: `source/2026-05-19-johnny-ai-triage-product-spec/`.
- Near-term product job: make the AI triage demo contractable with 慧誠's iMVS
  UI / API team.
- Boundary: demo-only triage support and clinician-review summary; no
  diagnosis, treatment, final triage level, real patient data, or production
  HIS writeback.

## What Changed

The project is no longer only asking "can we build a credible demo?" 慧誠 is now
asking for the API shape needed to connect their iMVS workflow to the NYCU AI
question/summary service.

The later standalone PDF named
`iMVS AI Triage 智慧檢傷分流系統_20260515.pdf` was verified as byte-identical to
the archived product-spec PDF in the source bundle. It is therefore not a
second spec version; it is the same `V 1.0` product document referenced by the
email.

The `2026-05-19` email creates three concrete interface questions:

1. What vital-sign payload should iMVS upload to NYCU?
2. What question object should NYCU return, including type, options, progress,
   and session key?
3. How should iMVS send an answer plus session key and receive the next question
   or final output?

多寶 workflow clarification adds a fourth interface question:

4. Can iMVS start Phase 1 questions while measurements are still running, then
   send a vitals-ready payload for Phase 2 vital-aware follow-up?

The `2026-05-21` imedtac engineering sync answered this for the June customer
demo: use the post-measurement flow first. The two-phase design remains a
future optimized workflow after the June integration loop is stable.

The `2026-05-21 10:57` internal sync with 多寶 adds one practical API/UI
requirement: the question object must be reusable enough for iMVS to render
without hand-coding each question screen. Ask engineering to confirm
`single_choice`, `multi_choice`, variable option counts, label limits, and
no-scroll behavior. Keep numeric / scale widgets as future templates until
imedtac confirms support.

The linked spec adds product-level acceptance criteria that mostly align with a
choice-first demo: OPQRST-like dynamic questions, fewer than eight questions,
progress display, single-choice, multi-choice, future scale input, and a demo
doctor AI-result page.

Current June design calibration follows this 慧誠 / iMVS requirement: fewer
than `8` visible patient-facing questions per completed case flow.

## Existing iMVS Field And Unit Baseline

The `2026-05-12` company package already provided an iMVS Product Spec `V2.0.4`
and iMVS API Definition `V1.4`. Treat
`docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md` as the canonical
baseline for hardware and vital units until imedtac engineering supplies a newer
field dictionary.

For API design, the key baseline is:

| Company API object | Company value field(s) | Company unit sample | NYCU normalized field(s) |
| --- | --- | --- | --- |
| `NBP` | `SYS_Value`, `DIA_Value` | `mmHg` | `blood_pressure_systolic_mm_hg`, `blood_pressure_diastolic_mm_hg` |
| `SPO2` | `Value` | `%` | `spo2_percent` |
| `HR` | `BP_Value` | `bpm` | `heart_rate_bpm` |
| `Temp` | `Value` | `deg C` / source sample `°C` | `temperature_c` |
| `Glucose` | `Value` | `mg/dL` | `glucose_mg_dl` |
| `Weight` | `Value` | `kg` | `weight_kg` |
| `Height` | `Value` | `cm` | `height_cm` |

The adapter should preserve explicit `value` and `unit` fields, parse numeric
values from the company API's string values, and keep respiratory rate outside
the iMVS-provided baseline unless imedtac confirms it as measured, manually
entered, or synthetic for the demo.

## Demo Scope Cut

| Spec area | June demo stance | Reason |
| --- | --- | --- |
| Vital-sign upload | Include with synthetic or mock iMVS-shaped payload. | This is the core differentiator and the API question 慧誠 is asking now. |
| Two-phase question flow | Future optimized path, not June default after the `2026-05-21` sync. | The June customer demo should minimize iMVS UI and measurement-flow change; ask after measurement is complete. |
| Dynamic question loop | Include as deterministic session flow. | Matches AC06-AC10 and current runtime direction. |
| Progress indicator / question budget | Include. | AC07 is explicit and low-risk. |
| Single-choice / multi-choice | Include. | Already aligned with v0 choice-only runtime. |
| Scale input | Add or stub for pain/severity. | AC11 is explicit; useful for OPQRST. |
| Voice input | Defer unless explicitly approved for demo. | Email says it depends on team progress; current repo boundary excludes ASR from v0. |
| Doctor AI result page | Include as demo staff-summary page. | AC14 is demo-specific and near-term. |
| SOAP/HIS return path | Demo visualization only; no real writeback. | Email says grey-text HIS return flow is not implemented for mid-June. |
| Evidence mapping | Show source placeholders or reviewer-only evidence refs. | AC16 matters for trust, but real clinical-source mapping remains a governance gate. |
| Diagnosis / final triage | Exclude. | Repo boundary and safety rules forbid autonomous clinical claims. |

## Proposed V0 API Contract

Use one small session-based contract for June. Keep it JSON-only and make every
clinical claim demo-bounded.

The compact JSON below is the historical v0 discussion shape. The post-sync
v0.2 handoff files use nested per-vital objects with explicit `value`, `unit`,
`measurement_status`, `quality_flag`, and `missing_reason` fields so the
payload stays aligned with the company-provided V1.4 iMVS upload baseline.

### 1. Start Session

```http
POST /api/triage-demo/sessions
```

```json
{
  "client": {
    "source": "imvs-demo",
    "site": "demo",
    "locale": "en-US"
  },
  "patient_context": {
    "demo_patient_id": "DEMO-TACHY-001",
    "age": 76,
    "sex": "female",
    "identity_mode": "demo"
  },
  "vitals": {
    "temperature_c": 36.5,
    "spo2_percent": 98,
    "heart_rate_bpm": 150,
    "respiratory_rate_per_min": 16,
    "blood_pressure_systolic_mm_hg": 102,
    "blood_pressure_diastolic_mm_hg": 68,
    "height_cm": null,
    "weight_kg": null,
    "glucose_mg_dl": null
  },
  "capabilities": {
    "question_types": ["single_choice", "multi_choice"],
    "max_questions": 7,
    "voice_input": false
  }
}
```

Response:

```json
{
  "session_key": "demo-session-uuid",
  "status": "question",
  "progress": {
    "current": 1,
    "expected_total": 7
  },
  "question": {
    "id": "tachy-chief-concern",
    "type": "single_choice",
    "text": "What is the main reason you are using the kiosk today?",
    "options": [
      {"id": "heart_racing", "label": "Heart racing / palpitations"},
      {"id": "chest_tightness", "label": "Chest tightness / pressure"},
      {"id": "breathing_or_dizzy", "label": "Shortness of breath or dizziness"},
      {"id": "other_or_not_sure", "label": "Other / not sure"}
    ],
    "none_option_id": null,
    "evidence_refs": ["LOCAL-PROTOCOL-TBD"],
    "demo_boundary": "This is a synthetic-data demo question for staff-review intake support."
  }
}
```

### 2. Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
```

```json
{
  "question_id": "tachy-chief-concern",
  "answer": {
    "selected_option_ids": ["heart_racing"],
    "scale_value": null
  },
  "client_event": {
    "answered_at": "2026-05-19T16:52:00+08:00",
    "input_mode": "touch"
  }
}
```

Response can either return the next question:

```json
{
  "session_key": "demo-session-uuid",
  "status": "question",
  "progress": {
    "current": 2,
    "expected_total": 7
  },
  "question": {
    "id": "tachy-onset",
    "type": "single_choice",
    "text": "When did this start?",
    "options": [
      {"id": "within_1_hour", "label": "Within the last hour"},
      {"id": "few_hours", "label": "A few hours ago"},
      {"id": "half_day", "label": "About half a day"},
      {"id": "more_than_1_day_or_not_sure", "label": "More than one day / not sure"}
    ],
    "evidence_refs": ["LOCAL-PROTOCOL-TBD"],
    "demo_boundary": "Staff should review this answer with the measured vitals."
  }
}
```

or return a demo staff-summary:

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "session_key": "demo-session-uuid",
  "session_state": "summary_ready",
  "status": "summary",
  "summary_visibility": "staff_only",
  "handoff_required": true,
  "handoff_reason_codes": [
    "measured_elevated_heart_rate_demo",
    "reported_palpitations",
    "reported_chest_tightness"
  ],
  "staff_review_summary": {
    "format": "review_summary_demo",
    "subjective": [
      "Synthetic demo patient reports heart racing with chest heaviness for about half a day."
    ],
    "objective": [
      "Demo vital payload includes HR 150 bpm, SpO2 98%, BP 102/68 mmHg, respiratory rate 16 breaths/min, and temperature 36.5 C."
    ],
    "review_basis": [
      "Measured heart-rate cue plus reported palpitation / chest-tightness symptoms supports staff review in this demo workflow."
    ],
    "review_action": [
      "Please review measured heart rate, reported symptoms, rhythm-history selection, and medication/allergy confirmation."
    ],
    "staff_handoff_note": "Review measured heart rate and reported cardiopulmonary symptoms.",
    "not_claimed": [
      "This demo does not diagnose.",
      "This demo does not recommend treatment.",
      "This demo does not assign a final triage level.",
      "This demo does not write to HIS/EMR."
    ]
  },
  "evidence_refs": ["LOCAL-PROTOCOL-TBD"],
  "demo_boundary": "Synthetic-data capability demo only."
}
```

## Immediate Gaps

| Gap | Why it matters | Next action |
| --- | --- | --- |
| Current iMVS vital-field names | The 5/12 V1.4 API provides a usable baseline, but the 5/21 sync says June should adapt to imedtac's current Vital Upload / GitHub format. | Use the 5/12 baseline now; ask for one current synthetic example payload and any field-name delta from V1.4. |
| Vital units and hardware availability | The 5/12 API gives units, while the product spec marks SpO2 and glucose optional in some hardware variants. | Preserve `mmHg`, `%`, `bpm`, `deg C`, `mg/dL`, `kg`, and `cm`; confirm target SKU and guaranteed fields. |
| Payload quality fields | Expert review flagged missing/failure semantics as an engineering blocker. | Add `measurement_timestamp`, `device_id`, `measurement_status`, `quality_flag`, and `missing_reason`; ask 慧誠 to freeze exact semantics. |
| Two-phase UI feasibility | 多寶's workflow idea depends on asking safe questions during measurement. | Ask whether the kiosk can display Phase 1 questions without disrupting posture/signal quality and whether iMVS can send a vitals-ready event. |
| Session-key ownership | Determines whether iMVS or NYCU stores state. | For demo, NYCU can issue `session_key`; iMVS echoes it back. |
| Retry/idempotency | A duplicated answer retry could advance the dynamic flow twice. | Add `request_id` and `idempotency_key`. |
| Session state | The API needs explicit expiry and last-question recovery. | Add `session_expires_at`, `session_state`, and `last_question_id`. |
| Question type enum | Needed for UI rendering. | Freeze `single_choice` and `multi_choice` first for the tachycardia live lane; keep `scale` as a future template. |
| Question UI template metadata | Needed to avoid hand-coding each question screen. | Add `ui_template`, `option_count`, rendering constraints, and ask imedtac for option / label limits. |
| Progress semantics | AC07 asks for visible progress. | Return `current`, `expected_total`, and optional `remaining_estimate`. |
| "Diagnosis" field wording | Company email uses `診斷等格式`. | Rename our output as `summary` / `staff_review_summary` with `review_basis`, not `diagnosis`. |
| `plan_support` wording | Expert review flagged SOAP `Plan` wording as risky. | Replace with `review_action` and `staff_handoff_note`. |
| Scale widget | Spec AC11 mentions it, but the tachycardia live lane does not need it. | Do not require it for June; add only after imedtac confirms a reliable widget. |
| Evidence mapping | Spec AC16 asks for source links. | For demo, expose `evidence_refs` and mark unresolved rows as `LOCAL-PROTOCOL-TBD`. |
| Voice input | Spec AC12 is detailed, but email says it is conditional. | Keep out of live v0 unless a separate ASR data/privacy decision is made. |
| HIS/FHIR writeback | Spec mentions it, email excludes it from June. | Demo a doctor-view page only; no real writeback. |

## Recommended Reply To 慧誠

Use this stance in the next technical sync:

- We can discuss and freeze the vital payload shape now.
- For June, NYCU can return typed question objects with `session_key`,
  `question_id`, `type`, `options`, and `progress`.
- iMVS can submit answer objects with the same `session_key`; NYCU returns either
  the next question or a demo staff-summary JSON.
- We recommend wording the final field as `staff_review_summary`, with
  `summary_visibility: "staff_only"`, `handoff_required`, `review_basis`, `review_action`, and
  `staff_handoff_note`, not `diagnosis` or `plan_support`, for the June customer
  demo.
- Voice can remain optional; if shown, it should have transcript confirmation
  and fallback, and should not store real patient audio.
- HIS return / FHIR writeback should stay grey-text / future-state for June.

## Planning Recommendation

This creates a narrow W21/W22 plan:

1. Freeze the demo API contract and send 慧誠 a concrete question list.
2. Map the current runtime questions to the contract and registry manifest.
3. Add the missing AC07 progress audit / implementation; keep AC11 scale-widget
   support as a future UI capability unless imedtac confirms it is ready.
4. Add the v0.2 expert-review fields: session expiry/state, retry keys,
   measurement quality, staff-only visibility, handoff flags, and stable error
   behavior.
5. For the post-sync June path, set `workflow_mode=post_measurement_only`.
   Preserve two-phase fields and the vitals-ready endpoint as future optimized
   mode after the first imedtac loop works.
6. For the post-Duobao UI gate, confirm generic iMVS question-template support
   before promising dynamic question expansion.
7. Build a mock iMVS adapter using synthetic vital payloads.
8. Rehearse the loop with the tachycardia live demo case before expanding to
   respiratory fallback or other `3-5` cases.

Do not start a broad product rewrite, real identity integration, real HIS
integration, or ASR sprint until the API contract, clinical wording, and demo
boundary are signed off.
