---
id: 2026-06-17-imedtac-online-smoke-test-plan
title: "imedtac Online Smoke Test Plan"
date: 2026-06-17
topic: ai-triage
type: test-plan
status: active
audience: NYCU / imedtac engineering rehearsal
related:
  - ../API.md
  - ./2026-06-17-python-mvp-contract-compatibility-note.md
  - ./2026-06-17-imedtac-python-mvp-test-note-draft.md
  - ../decisions/2026-06-17-cors-origin-configuration-boundary.md
  - ../handoff/api-examples/2026-05-21-start-session-request-demo-tachycardia.json
---

# imedtac Online Smoke Test Plan

## Purpose

This plan verifies that 慧誠智醫（imedtac Co., Ltd.）can call the live NYCU
rehearsal API according to the agreed June MVP contract:

```text
iMVS completes vital measurement
-> POST /api/triage-demo/sessions
-> NYCU returns session_key + first question
-> iMVS submits selected option ids
-> POST /api/triage-demo/sessions/{session_key}/answers
-> NYCU returns next question or staff_review_summary
```

The test confirms workflow support, CORS, bearer-token protection, idempotent
retry behavior, choice-only question rendering, progress display, and terminal
staff-review summary behavior. It does not validate diagnosis, treatment,
formal triage level, production HIS/EMR/FHIR writeback, or clinical threshold
readiness.

## Live Target

```text
Health check:
https://nycu-imedtac-triage-demo-api.onrender.com/healthz

API base:
https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo
```

## Gate 0: NYCU Internal Readiness

Run before asking imedtac to test:

```bash
npm run test:python
npm run smoke
npm run smoke:online
git diff --check
```

Expected result:

- Python contract tests pass.
- Repo smoke check passes.
- Public online smoke checks pass.
- `npm run smoke:online` reports that authenticated checks are skipped unless
  `DEMO_BEARER_TOKEN` is available locally.

Token-required full loop:

```bash
DEMO_BEARER_TOKEN='<private token from agreed channel>' npm run smoke:online
```

Expected authenticated result:

- `/healthz` returns HTTP `200`.
- CORS preflight for `http://localhost:5174` returns HTTP `204` and echoes the
  origin.
- Unknown origin preflight returns HTTP `204` without
  `Access-Control-Allow-Origin`.
- No-token POST returns HTTP `401` with `demo_bearer_token_required`.
- Token POST starts a session and returns `status=question`.
- Same start-session body plus same `idempotency_key` returns the same
  `session_key`.
- Same `idempotency_key` plus changed body returns HTTP `409` /
  `idempotency_conflict`.
- Answer loop reaches `status=summary` with `summary_visibility=staff_only` and
  `staff_review_summary`.

## Gate 1: Public Deployment And Health

Command:

```bash
curl -i https://nycu-imedtac-triage-demo-api.onrender.com/healthz
```

Pass criteria:

- HTTP `200`.
- JSON includes:

```json
{
  "status": "ok",
  "service": "nycu-imedtac-triage-demo-api",
  "mode": "synthetic-data-rehearsal-api"
}
```

## Gate 2: CORS Preflight

Default imedtac local browser origin:

```bash
curl -i -X OPTIONS \
  https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"
```

Pass criteria:

- HTTP `204`.
- `Access-Control-Allow-Origin: http://localhost:5174`.
- `Access-Control-Allow-Methods` includes `POST`.
- `Access-Control-Allow-Headers` includes `Authorization`.

Repeat the same test for:

```text
/api/triage-demo/sessions/{any-test-session-key}/answers
```

If imedtac tests from a different browser origin, collect the exact DevTools
`Origin` value and add it to Render `DEMO_ALLOWED_ORIGINS`. Do not use `*`.

## Gate 3: Bearer Token

No-token check:

```bash
curl -i -X POST \
  https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions \
  -H "Content-Type: application/json" \
  --data-binary @handoff/api-examples/2026-05-21-start-session-request-demo-tachycardia.json
```

Pass criteria when bearer gate is enabled:

- HTTP `401`.
- `WWW-Authenticate: Bearer realm="nycu-imedtac-triage-demo"`.
- `error.code = demo_bearer_token_required`.

Token success check:

```bash
curl -i -X POST \
  https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEMO_BEARER_TOKEN" \
  --data-binary @handoff/api-examples/2026-05-21-start-session-request-demo-tachycardia.json
```

Pass criteria:

- HTTP `200`.
- `status = question`.
- `workflow_mode = post_measurement_only`.
- `measurement_state = complete`.
- `vitals_ready = true`.
- `session_key` is present.
- `question.type` is `single_choice` or `multi_choice`.
- `question.options[].id` values are present.

Token handling rule:

- Share the token only through the agreed private channel.
- Do not put the token in Git, Markdown, screenshots, shell history captures, or
  chat transcripts.
- When sharing test evidence, redact the whole token value.

## Gate 4: Start-Session Contract

Request body:

```text
handoff/api-examples/2026-05-21-start-session-request-demo-tachycardia.json
```

Pass criteria:

- Endpoint path remains `POST /api/triage-demo/sessions`.
- Response keeps the v0.2 contract fields:
  `api_version`, `schema_version`, `flow_version`, `case_id`,
  `case_version`, `fixture_version`, `question_set_version`,
  `wording_version`.
- Response includes `progress.current` and `progress.expected_total`.
- The first tachycardia lane question is `tachy-chief-concern`.
- The frontend renders option labels but submits option ids.
- No real patient identifier is sent in `patient_context`.

## Gate 5: Full Answer Loop

For each question response:

1. Read `question.id`.
2. Choose one or more ids from `question.options[].id` according to
   `question.type` and `question.max_selections`.
3. POST to:

```text
/api/triage-demo/sessions/{session_key}/answers
```

Answer body shape:

```json
{
  "request_id": "new-id-per-http-request",
  "idempotency_key": "same-key-only-for-the-same-logical-retry",
  "session_key": "<session_key from Endpoint 1>",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "question_id": "<current question.id>",
  "answer": {
    "selected_option_ids": ["<selected option id>"],
    "scale_value": null
  },
  "client_event": {
    "answered_at": "2026-06-17T18:00:00+08:00",
    "input_mode": "touch"
  }
}
```

Pass criteria:

- Every intermediate response returns HTTP `200`, `status=question`, and the
  next `question`.
- Final response returns HTTP `200`, `status=summary`,
  `session_state=summary_ready`, `summary_visibility=staff_only`, and
  `staff_review_summary`.
- `staff_review_summary.objective` includes measured vital context.
- `staff_review_summary.subjective` reflects selected option ids.
- `staff_review_summary.scope_controls` keeps the demo boundary visible.

## Gate 6: UI Compatibility

imedtac frontend checks:

- Use `question.type` / `question.ui_template` for rendering.
- Support only `single_choice` and `multi_choice` for this MVP.
- Render no more than `9` options without scroll.
- Use `progress.expected_total` for `Question X of Y`.
- Treat `capabilities.max_questions` as a capacity cap, not as the progress
  denominator.
- For `not_sure` or `none_of_these` style options, submit the returned option
  id like any other answer.
- Do not implement a generic silent skip for this rehearsal unless a future
  schema change is agreed.

## Gate 7: Reliability And Recovery

Retry behavior:

- Same logical operation, same body, same `idempotency_key`: expected same
  stored response.
- Same `idempotency_key`, changed body: expected HTTP `409` /
  `idempotency_conflict`.
- On timeout after answer submit, retry only the same body/key.
- On `idempotency_conflict`, lock the answer controls and restart the demo
  session or use a clearly labeled fallback.

Negative checks:

- Invalid `session_key` returns HTTP `404` / `invalid_session`.
- Wrong `question_id`, empty selections, unknown option id, or too many
  selections returns HTTP `422` / `invalid_answer`.
- `measurement_state != complete` or `vitals_ready=false` returns HTTP `422` /
  `invalid_start_session_request`.

## Evidence To Capture

For the rehearsal record, capture only repo-safe evidence:

| Evidence | Capture rule |
| --- | --- |
| Render deploy log | Include live URL, `/healthz 200`, and service live line. |
| Health response | Include HTTP status and JSON body. |
| CORS preflight | Include request Origin and response headers; no token. |
| No-token POST | Include HTTP `401` and error code; no token. |
| Token POST success | Include redacted command and response body; redact token. |
| Full answer loop | Include response status sequence and final summary shape. |
| UI screenshot | Ensure no bearer token, private link, real patient data, or credential is visible. |

## Go / No-Go Criteria

Go for imedtac connected rehearsal when:

- Gate 0 through Gate 5 pass.
- imedtac confirms the actual browser `Origin` is allowlisted.
- Bearer token delivery path is private and confirmed.
- The frontend can render all returned questions and show final
  `staff_review_summary`.

Hold and fix before rehearsal when:

- `/healthz` is not HTTP `200`.
- CORS blocks the real imedtac browser origin.
- Token success request fails with valid bearer token.
- The frontend submits labels instead of option ids.
- Full loop cannot reach `status=summary`.
- Any response changes endpoint paths, workflow mode, enum values, or summary
  surface without a recorded change-control decision.
