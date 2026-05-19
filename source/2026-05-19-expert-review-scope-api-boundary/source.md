---
id: 2026-05-19-expert-review-scope-api-boundary
title: "Expert Review On AI Triage Scope, API, And Boundary"
date: 2026-05-19
topic: ai-triage
type: expert-review
status: archived
source: user-provided expert reply
---

# Expert Review On AI Triage Scope, API, And Boundary

## Source Boundary

This note preserves the user's provided expert reply after reviewing the
expert-review packet. Treat it as expert guidance for project planning and
handoff refinement. The regulatory links are expert-cited references; they are
recorded here as citation targets, not as independently revalidated claims in
this note.

## Expert Judgment

The expert's core judgment:

```text
Current scope cut is appropriate and should be maintained.
The June demo should remain synthetic-data vital-aware intake + staff-review
summary, not a clinical triage product.
```

The expert agreed with the main demo shape:

```text
iMVS synthetic vital-sign payload
-> NYCU structured / choice-based dynamic intake
-> staff_review_summary
-> staff / clinician review
```

The expert also agreed that the following should remain excluded:

- diagnosis;
- final triage / acuity level;
- treatment advice;
- emergency order;
- production HIS / EMR / FHIR writeback;
- real patient data;
- raw ASR audio.

## Key Expert Corrections

### 1. API v0.2 fields to add

The expert said the two-endpoint API is reasonable for the June demo, but v0.2
should add:

| Category | Expert-recommended fields |
| --- | --- |
| session | `session_expires_at`, `session_state`, `last_question_id` |
| retry | `request_id`, `idempotency_key` |
| vital payload | `measurement_timestamp`, `device_id`, `measurement_status`, `quality_flag`, `missing_reason` |
| versioning | keep `api_version`, `schema_version`, `flow_version`, `case_id` |
| output control | `summary_visibility: "staff_only"` |
| safety | `handoff_required`, `handoff_reason_codes`, `not_claimed` |
| error | `status=error`, stable `error.code`, no fake summary |

The expert also flagged `plan_support` as risky because SOAP `Plan` can imply
medical action. Recommended replacement:

```json
"review_action": [
  "Staff or clinician review required."
]
```

or:

```json
"staff_handoff_note": "Please review measured vitals and reported symptoms."
```

### 2. Runtime enforcement needs strengthening

The expert said the document-level claim boundary is good, but UI/API/runtime
must enforce it. Forbidden wording:

- `diagnosis`
- `AI diagnosis`
- `ESI level`
- `emergency severity`
- `likely pneumonia`
- `likely sepsis`
- `needs emergency treatment`
- `safe to go home`
- `FDA-cleared`
- `510(k)-cleared`
- `clinical-grade triage`

### 3. 510(k) language

The expert said June demo can say `comparable-product / 510(k) scope scan`, but
must not say `predicate-equivalent` or `510(k)-ready`.

### 4. Voice and HIS / FHIR

Voice input and HIS/FHIR writeback should remain out of the June critical path.
If voice is shown at all, it should be:

```text
voice -> transcript -> patient confirms -> structured choice answer
```

Voice must not directly generate a summary.

### 5. First respiratory case

The expert approved `fever + dyspnea + low SpO2` as the first case, but said it
should become an early staff-review handoff case rather than a full eight
question flow.

Recommended flow:

```text
Q1 chief complaint
Q2 dyspnea duration / severity
Q3 chest pain / pressure
Q4 chronic lung disease / baseline oxygen / medication context
-> staff_review_summary
```

Safe wording:

```text
Synthetic demo case. Patient reports shortness of breath. Measured vitals
include fever, increased respiratory rate, and lower oxygen saturation than
expected for this demo scenario. Staff should review the respiratory complaint
and measured vitals. This demo does not diagnose, assign final triage level,
recommend treatment, or write to HIS/EMR.
```

### 6. Biggest risks

| Risk category | Expert-identified risk |
| --- | --- |
| Clinical | No clinical owner approval for stop rule and summary wording. |
| Engineering | iMVS payload fields, units, missing value, and measurement failure not frozen. |
| Privacy | Real identifiers, raw audio, logs, or screenshots can slip into demo once iMVS connects. |
| Regulatory / claim | Saying `AI triage` too strongly; safer language is `vital-aware intake support`, `clinician-review summary`, and `synthetic-data workflow demo`. |
| Cybersecurity | External endpoint, kiosk browser, local network, API token, and logging threat boundary not yet defined. |

### 7. Thursday owner/date asks

The expert reinforced owner/date closeout:

| Owner | Deliverable | Suggested due |
| --- | --- | --- |
| 慧誠 engineering | synthetic iMVS vital payload example + field dictionary | `2026-05-22` |
| 慧誠 engineering | units, required/optional, missing/failure representation | `2026-05-22` |
| 慧誠 engineering | UI insertion point | `2026-05-22` |
| 慧誠 engineering | demo environment: internet, HTTPS, CORS, firewall, local fallback | `2026-05-22` |
| Johnny / product | customer demo date, audience, success standard | during meeting |
| Johnny / product | single engineering POC + communication channel | during meeting |
| 多寶 / clinical | respiratory case approval | `2026-05-22` |
| 多寶 / clinical | stop rule + forbidden wording + safe summary wording | `2026-05-22` |
| Jason / NYCU | API v0.2 + sample JSON + error behavior | `2026-05-22` |
| Jason / NYCU | one-case mock adapter / static integration rehearsal | `2026-05-25` |
| Privacy/security owner | no real identifiers / no raw audio / no production endpoint | `2026-05-22` |

## Expert-Cited References

- FDA Clinical Decision Support Software:
  `https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software`
- FDA Premarket Notification 510(k):
  `https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/premarket-notification-510k`
- TW Core Observation Vital Signs:
  `https://twcore.mohw.gov.tw/ig/twcore/0.3.2/StructureDefinition-Observation-vitalSigns-twcore.html`
- CDC Flu Signs and Symptoms:
  `https://www.cdc.gov/flu/signs-symptoms/index.html`
- Taiwan PDPC Personal Data Protection Act Article 6:
  `https://www.pdpc.gov.tw/en/News_Content/169/747/`
- FDA Cybersecurity in Medical Devices:
  `https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-management-system-considerations-and-content-premarket`

## Derived Action Plan

- `../../docs/2026-05-19-expert-review-action-plan.md`
- `../../handoff/2026-05-22-api-v0.2-requirements-from-expert-review.md`

