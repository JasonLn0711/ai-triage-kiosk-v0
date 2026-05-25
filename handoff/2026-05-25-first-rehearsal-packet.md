---
id: 2026-05-25-first-rehearsal-packet
title: "AI Triage Demo First Rehearsal Packet"
date: 2026-05-25
topic: ai-triage
type: handoff
status: active-rehearsal-packet
audience: NYCU / imedtac engineering rehearsal
source:
  - ./2026-05-25-imedtac-integration-next-steps.md
  - ./2026-05-21-imedtac-engineering-open-issues-checklist.md
  - ./api-examples/README.md
  - ../demo/fixtures/tachycardia-live-demo.json
  - ../api/lib/triage-demo-contract.js
---

# AI Triage Demo First Rehearsal Packet

## Recommendation

Run the first rehearsal against the tachycardia lane mock contract before
waiting for the full production engine. The goal is to prove the browser-callable
shape:

```text
start session -> first typed question -> answer -> next question -> summary
-> idempotency retry check -> fallback/error check
```

This packet shares only interface-level API behavior, demo payloads, and
staff-review summary output. It does not share internal routing, scoring,
source-governance, prompt, embedding, or reusable-method details.

## Base URL

Local mock for NYCU / imedtac rehearsal:

```bash
npm run mock:api
```

Default local base URL:

```text
http://localhost:4193
```

Serverless route shape:

```http
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

NYCU-hosted Render rehearsal base URL:

```text
https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo
```

Render health check:

```http
GET /healthz
```

Render service settings:

```text
Build Command: npm install && npm run render:build
Start Command: npm run render:start
Health Check Path: /healthz
```

Do not use Render's autofilled `yarn start` for this service. In this repo,
`start` is the static frontend server; the rehearsal API must run
`node scripts/mock-api-server.js` through `npm run render:start`.

Status update on `2026-05-25 17:50 GMT+8`: Render now runs
`npm run render:start`; public `/healthz`, CORS preflight, start-session, and
submit-answer checks all passed against the `onrender.com` URL.

Render Outbound IP Addresses (`74.220.50.0/24`, `74.220.58.0/24`) are not
needed for the current iMVS browser -> NYCU API call path. They become relevant
only if NYCU's Render service must initiate calls to an imedtac IP-restricted
backend or webhook.

## Browser / CORS Contract

Allowed rehearsal origins:

```text
http://localhost
http://localhost:5174
```

These values are browser `Origin` values for a frontend served on the
imedtac/iMVS test machine. They are not Render-localhost settings. If the actual
frontend origin is `127.0.0.1`, a LAN IP, another port, an HTTPS domain, or a
WebView custom origin, NYCU should add that exact origin after imedtac confirms
it.

Supported preflight:

```http
OPTIONS /api/triage-demo/sessions
OPTIONS /api/triage-demo/sessions/{session_key}/answers

Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

Bearer token format if enabled:

```http
Authorization: Bearer <demo token>
```

NYCU runtime behavior:

- If `DEMO_BEARER_TOKEN` is unset, the mock accepts POST requests without a
  token so local UI rehearsal can start before credential distribution.
- If `DEMO_BEARER_TOKEN` is set in Render or local shell, both POST endpoints
  require the exact header above.
- `GET /healthz` and `OPTIONS` preflight do not require the bearer token.

The actual token is not stored in this repo, Markdown, screenshots, or logs; it
should be shared only through the agreed private channel.

Jason prepared `DEMO_BEARER_TOKEN` in Render for token-required rehearsal; the
value is intentionally not recorded in this packet. Token-required behavior
became active after the environment variable was saved and Render
rebuilds/redeployed the latest GitHub `main` commit. Public verification on
`2026-05-25 20:25 GMT+8` confirmed `/healthz` HTTP `200`, CORS preflight HTTP
`204`, and no-token start-session HTTP `401` /
`demo_bearer_token_required`. Private bearer-token success was shared with
imedtac through the agreed private channel and the token value remains outside
repo files.

## Start Session Request

Reference example:

```text
handoff/api-examples/2026-05-21-start-session-request-demo-tachycardia.json
```

Minimum rehearsal fields:

```json
{
  "request_id": "req-demo-tachy-start-001",
  "idempotency_key": "idem-demo-tachy-start-001",
  "case_id": "demo-tachycardia-live-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "demo_script": {
    "mode": "live_measured",
    "fallback_mode": "local_scripted_demo",
    "case_label": "Palpitation / chest tightness with elevated heart-rate cue"
  },
  "vitals": {
    "heart_rate_bpm": {
      "value": 130,
      "unit": "bpm",
      "measurement_status": "measured",
      "quality_flag": "needs_review",
      "missing_reason": null
    }
  },
  "capabilities": {
    "question_types": ["single_choice", "multi_choice"],
    "max_questions": 7,
    "max_options_per_question": 9,
    "variable_option_count": true,
    "voice_input": false
  }
}
```

Expected response:

- `status = "question"`
- `session_key` present
- `response_id` present
- `progress.current = 1`
- `progress.expected_total = 7`
- `question.id = "tachy-chief-concern"`
- `question.options` uses stable `id` values; imedtac sends back option ids,
  not labels.

## Answer Request

Route:

```http
POST /api/triage-demo/sessions/{session_key}/answers
```

Minimum request:

```json
{
  "request_id": "req-demo-tachy-answer-001",
  "idempotency_key": "idem-demo-tachy-answer-001",
  "session_key": "demo-session-tachy-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "question_id": "tachy-chief-concern",
  "answer": {
    "selected_option_ids": ["heart_racing"],
    "scale_value": null
  },
  "client_event": {
    "answered_at": "2026-05-25T10:02:00+08:00",
    "input_mode": "touch"
  }
}
```

Expected next-question response:

- `status = "question"`
- `last_question_id = "tachy-chief-concern"`
- `progress.current = 2`
- `progress.expected_total = 7`
- `question.id = "tachy-onset"`

Expected summary response after the seventh answer:

- `status = "summary"`
- `session_state = "summary_ready"`
- `question_phase = "summary"`
- `progress.current = 7`
- `progress.expected_total = 7`
- `summary_visibility = "staff_only"`
- `staff_review_summary` present
- no diagnosis, treatment advice, final triage level, ECG order, or production
  HIS / EMR / FHIR writeback claim.

## Idempotency Checks

Same logical operation retry:

```text
same endpoint + same session/question context + same idempotency_key
+ same answer body = same response_id and no flow advance
```

Conflict:

```text
same endpoint + same idempotency_key + different answer body
= status error, error.code idempotency_conflict, HTTP 409
= recovery.safe_next_action restart_demo_session
```

`request_id` can be unique per HTTP request. The mock compares idempotency
payloads without treating a changed `request_id` as a conflict.

iMVS UI behavior during answer submission:

```text
user submits answer
-> iMVS freezes the answer body and idempotency_key
-> iMVS disables / marks readonly all answer-related controls
-> if a timeout occurs, retry only the same body with the same idempotency_key
-> keep non-answer controls such as help, restart demo, or operator fallback if desired
-> unlock the next screen's answer controls only after NYCU returns the next question or summary
```

For rehearsal, `answer-related controls` means any control that can change or
resubmit the current answer: option buttons, submit, back-to-edit,
change-answer, next-answer, and equivalent UI affordances. This pending state is
a front-end duplicate-submit / race-condition control; it does not change the
API schema.

If `idempotency_conflict` occurs, the first rehearsal rule is restart demo
session. Do not auto-generate a new `idempotency_key` for the changed answer,
because that would become an answer-revision workflow outside the June contract.

## Error / Fallback Examples

Invalid session:

```json
{
  "status": "error",
  "session_key": "missing-session",
  "error": {
    "code": "invalid_session",
    "message": "The session_key was not found or is no longer available.",
    "retryable": false
  }
}
```

Idempotency conflict:

```json
{
  "status": "error",
  "session_key": "demo-session-tachy-001",
  "session_state": "active",
  "error": {
    "code": "idempotency_conflict",
    "message": "The same idempotency_key was reused with a different request body.",
    "retryable": false
  },
  "recovery": {
    "safe_next_action": "restart_demo_session",
    "owner": "imvs_ui_operator",
    "ui_locking_required": true,
    "instructions": [
      "Do not reuse this idempotency_key for a different answer.",
      "Do not auto-submit the changed answer with a new idempotency_key.",
      "Keep answer controls locked until the operator starts a new demo session or switches to labeled fallback.",
      "Start a new demo session through POST /api/triage-demo/sessions."
    ]
  }
}
```

Remote unavailable rehearsal behavior:

```text
iMVS labels the run as local_scripted_demo
-> loads the tachycardia fixture path
-> preserves the same question/option ids
-> shows the same staff_review_summary scope controls
```

## Summary Preview Acceptance Item

Preferred rehearsal path:

```text
iMVS renders NYCU status=summary / staff_review_summary in its existing result
or preview page.
```

Temporary fallback:

```text
NYCU-hosted demo-only preview page may be used for debugging, but it must be
visibly labeled as temporary rehearsal support.
```

Change-control note:

```text
Jason has already told imedtac that a NYCU-provided UI may affect visual
consistency and device-operation completeness. Do not switch the rehearsal
summary surface from iMVS rendering to NYCU-provided UI without first discussing
the impact with imedtac.
```

Acceptance check:

- imedtac can show the returned `staff_review_summary` without building a
  patient-facing diagnosis page.
- The summary remains `staff_only`.
- UI copy avoids diagnosis, treatment, final triage level, and production
  writeback claims.

## First Rehearsal Checklist

- Browser preflight passes from `http://localhost` or `http://localhost:5174`.
- `POST /api/triage-demo/sessions` returns a typed first question.
- iMVS renders `single_choice` and `multi_choice` options without scroll.
- iMVS sends selected option ids, not labels.
- `capabilities.max_questions` is treated as a cap; UI progress uses
  `progress.expected_total`.
- Same `idempotency_key` retry returns the same response without advancing.
- After submit, iMVS enters pending answer state: answer-related controls are
  disabled / readonly, retry uses the same body/key, and the next screen's
  answer controls unlock only after the NYCU next-question or summary response
  arrives.
- Same `idempotency_key` with a different body returns `idempotency_conflict`
  and `recovery.safe_next_action=restart_demo_session`.
- Seventh answer returns `status=summary` and `staff_review_summary`.
- Invalid session returns stable `status=error`.
- Remote unavailable path switches to a labeled `local_scripted_demo` mode.
