# API Examples

These examples support the iMVS / NYCU June demo API v0.2 draft.

The vital payload examples follow the company-provided `2026-05-12` iMVS API
`V1.4` baseline recorded in
`../../docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md`.
Baseline units are blood pressure `mmHg`, SpO2 `%`, heart rate `bpm`,
temperature `deg C` / `C`, glucose `mg/dL`, weight `kg`, and height `cm`.
Example field names are normalized for NYCU runtime while preserving explicit
`value` and `unit` fields.

## June Required Flow

Use these files for the current `post_measurement_only` contract. The examples
now use the tachycardia / palpitation / chest-tightness live demo case:
`demo-tachycardia-live-001`.

- `2026-05-21-start-session-request-demo-tachycardia.json`
- `2026-05-21-start-session-response-question.json`
- `2026-05-21-submit-answer-request-demo-tachycardia.json`
- `2026-05-21-next-question-response-demo-tachycardia.json`
- `2026-05-21-post-vital-question-response-demo-tachycardia.json`
- `2026-05-21-summary-response-demo-tachycardia.json`
- `2026-05-21-error-response-demo-api-timeout.json`
- `2026-05-21-error-response-demo-invalid-session.json`
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
