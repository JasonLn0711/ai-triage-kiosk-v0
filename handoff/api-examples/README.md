# API Examples

These examples support the iMVS / NYCU June demo API v0.2 draft.

The vital payload examples follow the company-provided `2026-05-12` iMVS API
`V1.4` baseline recorded in
`../../docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md`.
Baseline units are blood pressure `mmHg`, SpO2 `%`, heart rate `bpm`,
temperature `deg C` / `C`, glucose `mg/dL`, weight `kg`, and height `cm`.
Example field names are normalized for NYCU runtime while preserving explicit
`value` and `unit` fields.

## Value Contract

The example JSON files use fixed machine-readable values for workflow state,
question rendering, answer submission, error handling, fallback behavior, and
staff-review routing. Values such as `status`, `session_state`,
`workflow_mode`, `question.type`, `measurement_status`, `quality_flag`,
`error.code`, `fallback.recommended_mode`, `question.id`, `option.id`, and
`handoff_reason_codes` should be treated as code values.

Display strings such as `question.text`, `option.label`, `phase_reason`, and
`staff_review_summary.*` are versioned wording. iMVS should display them as
provided and should not parse them for workflow logic. Numeric values are
governed by type, unit, nullable behavior, and measurement-quality fields rather
than by an exhaustive value list.

## June Required Flow

Use these files for the current `post_measurement_only` contract. The examples
now use the tachycardia / palpitation / chest-tightness live demo case:
`demo-tachycardia-live-001`.

The `2026-05-25` 多寶 case input aligns this example set to a measured-first
HR `130 bpm` cue with palpitations, middle chest tightness, selected
`none_of_these` associated symptoms, rhythm-history / hypertension context,
aspirin / antihypertensive medication context, and no known medication allergy.

Teams `2026-05-25` UI follow-up clarifies that
`capabilities.max_questions` is a cap, while `progress.expected_total` should
drive `Question X of Y`. imedtac UI working layout supports up to `9` short
options without user scrolling; these examples keep most returned questions
shorter for readability. Summary examples use `status=summary` and
`staff_review_summary`, which iMVS can render in an existing result / preview
page or NYCU can show in a temporary demo-only preview during rehearsal.
For answer submission, iMVS should lock answer-related controls after submit and
unlock only after NYCU returns the next question or summary. The
`idempotency_conflict` example fixes the June recovery rule as
`restart_demo_session`, not answer revision.

- `2026-05-21-start-session-request-demo-tachycardia.json`
- `2026-05-21-start-session-response-question.json`
- `2026-05-21-submit-answer-request-demo-tachycardia.json`
- `2026-05-21-next-question-response-demo-tachycardia.json`
- `2026-05-21-post-vital-question-response-demo-tachycardia.json`
- `2026-05-21-summary-response-demo-tachycardia.json`
- `2026-05-21-error-response-demo-api-timeout.json`
- `2026-05-21-error-response-demo-invalid-session.json`
- `2026-05-21-error-response-demo-idempotency-conflict.json`
- `2026-05-21-error-response-demo-measurement-quality-unavailable.json`
- `2026-05-21-error-response-demo-missing-required-field.json`
- `2026-05-21-error-response-demo-unsupported-question-type.json`

The required June request pattern is:

```text
POST /api/triage-demo/sessions
  workflow_mode=post_measurement_only
  measurement_state=complete
  vitals_ready=true
  vitals=<measured or synthetic vital payload>

POST /api/triage-demo/sessions/{session_key}/answers
  session_key=<NYCU session key>
```

## Future Two-Phase Mode

`2026-05-21-update-vitals-request-demo-tachycardia.json` is retained only as a
future `parallel_measurement_intake` example. It is not required for the June
customer-demo integration unless a later stakeholder decision reopens the
two-phase during-measurement workflow.
