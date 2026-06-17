---
id: 2026-06-17-render-deploy-and-smoke-verification
title: "Render Deploy And Smoke Verification Source"
date: 2026-06-17
topic: ai-triage
type: source-record
status: active
source_type: user-provided deploy log plus NYCU live smoke verification
contains_credentials: false
related:
  - ../../handoff/2026-06-17-render-deploy-and-smoke-test-record.md
  - ../../handoff/2026-06-17-imedtac-online-smoke-test-plan.md
  - ../../API.md
  - ../../python_api/main.py
---

# Render Deploy And Smoke Verification Source

## Scope

This source record preserves the repo-safe evidence for the `2026-06-17`
Render deployment and smoke-test pass for the NYCU-hosted AI triage rehearsal
API used by 慧誠智醫（imedtac Co., Ltd.）integration testing.

The deployment remains a synthetic-data, staff-review intake support API. It
does not change the externally discussed two-endpoint contract and does not
record any bearer token, private credential, patient identifier, or live
hospital integration detail.

## User-Provided Render Deploy Evidence

The user provided a Render deployment log showing Docker build completion,
Uvicorn startup, Render health checks, and the live public URL.

Key deploy evidence:

```text
2026-06-17T10:24:34Z #13 exporting to image
2026-06-17T10:24:36Z #14 exporting cache to registry
2026-06-17T10:24:41Z ==> Deploying...
2026-06-17T10:24:49Z INFO: Application startup complete.
2026-06-17T10:24:49Z INFO: Uvicorn running on http://0.0.0.0:10000
2026-06-17T10:24:51Z INFO: "GET /healthz HTTP/1.1" 200 OK
2026-06-17T10:24:51Z ==> Your service is live
2026-06-17T10:24:51Z ==> Available at your primary URL https://nycu-imedtac-triage-demo-api.onrender.com
```

Observed non-blocking probe:

```text
HEAD / HTTP/1.1" 405 Method Not Allowed
```

Interpretation: `HEAD /` returning `405` is not a deployment failure. The live
gate is `GET /healthz` returning `200 OK`, followed by Render's service-live
message.

## Live Public Health Verification

Command executed from the repo workspace:

```bash
curl -i --max-time 20 https://nycu-imedtac-triage-demo-api.onrender.com/healthz
```

Result:

```text
HTTP/2 200
x-render-origin-server: uvicorn
```

Response body:

```json
{"status":"ok","service":"nycu-imedtac-triage-demo-api","mode":"synthetic-data-rehearsal-api"}
```

## Live CORS Verification

Allowed origin command:

```bash
curl -i --max-time 20 -X OPTIONS \
  https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions \
  -H 'Origin: http://localhost:5174' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type,authorization'
```

Result:

```text
HTTP/2 204
access-control-allow-origin: http://localhost:5174
access-control-allow-methods: POST, OPTIONS
access-control-allow-headers: Content-Type, Authorization
x-render-origin-server: uvicorn
```

Unknown origin command:

```bash
curl -i --max-time 20 -X OPTIONS \
  https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions \
  -H 'Origin: https://unexpected-origin.example' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type,authorization'
```

Result:

```text
HTTP/2 204
access-control-allow-methods: POST, OPTIONS
access-control-allow-headers: Content-Type, Authorization
```

Interpretation: the unknown origin received a preflight status response but was
not granted browser access through `Access-Control-Allow-Origin`.

## Live Bearer-Gate Verification

No-token command:

```bash
curl -i --max-time 20 -X POST \
  https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions \
  -H 'Content-Type: application/json' \
  --data-binary @handoff/api-examples/2026-05-21-start-session-request-demo-tachycardia.json
```

Result:

```text
HTTP/2 401
www-authenticate: Bearer realm="nycu-imedtac-triage-demo"
```

Response body evidence:

```json
{
  "status": "error",
  "error": {
    "code": "demo_bearer_token_required",
    "message": "A valid demo bearer token is required for this rehearsal API.",
    "retryable": false
  }
}
```

Interpretation: Render is in token-required mode for `POST` endpoints. This is
the expected rehearsal posture. `GET /healthz` and `OPTIONS` preflight remain
available without bearer token.

## Repo Test Evidence

Commands executed:

```bash
npm run test:python
npm test
npm run smoke
npm run smoke:online
git diff --check
```

Results:

```text
npm run test:python
-> 39 passed, 1 Starlette/httpx deprecation warning

npm test
-> 33 JS unit tests passed
-> 41 JS contract tests passed

npm run smoke
-> AI triage kiosk demo smoke check passed.

npm run smoke:online
-> live public online smoke checks passed
-> authenticated checks skipped because DEMO_BEARER_TOKEN was not set in shell

git diff --check
-> passed
```

Local token-required full-loop validation used a temporary shell-only test
token against `http://127.0.0.1:8000`:

```text
Completed authenticated answer loop in 7 answer request(s).
Online authenticated smoke checks passed.
```

This local authenticated run verified the reusable smoke runner's bearer-token
path, idempotency retry, idempotency conflict, answer loop, and terminal
`staff_review_summary` checks without storing a token in the repo.

## Remaining Private Gate

The Render full authenticated answer loop should be run only with the real
private demo token supplied through the agreed private channel:

```bash
DEMO_BEARER_TOKEN='<private token from agreed channel>' npm run smoke:online
```

Do not store the token in Git, Markdown, screenshots, shell-history captures,
or public logs.
