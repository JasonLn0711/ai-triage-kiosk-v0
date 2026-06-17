---
id: 2026-06-17-render-deploy-and-smoke-test-record
title: "Render Deploy And Smoke Test Record"
date: 2026-06-17
topic: ai-triage
type: deployment-test-record
status: active
audience: NYCU / imedtac engineering rehearsal
source:
  - ../source/2026-06-17-render-deploy-and-smoke-verification/source.md
related:
  - ./2026-06-17-imedtac-online-smoke-test-plan.md
  - ./2026-06-17-python-mvp-contract-compatibility-note.md
  - ../decisions/2026-06-17-cors-origin-configuration-boundary.md
  - ../API.md
---

# Render Deploy And Smoke Test Record

## Result

The `2026-06-17` Render deployment is live and the public rehearsal API passed
the repo-safe online smoke gates needed before 慧誠智醫（imedtac Co., Ltd.）
connected testing:

```text
Public URL:
https://nycu-imedtac-triage-demo-api.onrender.com

API base:
https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo
```

Verified live behavior:

- `/healthz` returns HTTP `200` with `status="ok"`.
- Render is serving the FastAPI/Uvicorn backend.
- CORS preflight for `http://localhost:5174` returns HTTP `204` and echoes the
  origin.
- Unknown browser origin is not echoed.
- No-token `POST /api/triage-demo/sessions` returns HTTP `401` /
  `demo_bearer_token_required`, confirming the bearer gate is active.
- The reusable online smoke runner is now recorded as `npm run smoke:online`.

## Contract Preserved

This deployment does not change the external API contract. imedtac should keep
calling the agreed two endpoints:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

The supported June MVP flow remains:

```text
iMVS completes vital measurement
-> NYCU start-session endpoint returns session_key + first question
-> iMVS sends selected option ids through answer endpoint
-> NYCU returns next question or staff_review_summary
```

The runtime remains a synthetic-data staff-review intake support API with human
review workflow and a separate production validation path. It is not diagnosis,
treatment advice, final triage level, production HIS/EMR/FHIR writeback, or a
clinical decision system.

## Evidence Summary

| Gate | Evidence | Result |
| --- | --- | --- |
| Render deploy | Render log showed Uvicorn startup, `/healthz` HTTP `200`, service live, and primary URL | pass |
| Live health | `curl -i https://nycu-imedtac-triage-demo-api.onrender.com/healthz` | HTTP `200` |
| Live CORS allowed origin | `OPTIONS /api/triage-demo/sessions` from `http://localhost:5174` | HTTP `204`, origin echoed |
| Live CORS unknown origin | `OPTIONS /api/triage-demo/sessions` from `https://unexpected-origin.example` | HTTP `204`, origin not echoed |
| Live bearer gate | no-token `POST /api/triage-demo/sessions` | HTTP `401`, `demo_bearer_token_required` |
| Python contract tests | `npm run test:python` | 39 passed |
| JS unit/contract tests | `npm test` | 33 unit + 41 contract passed |
| Repo smoke | `npm run smoke` | passed |
| Online public smoke | `npm run smoke:online` without token | passed public checks |
| Local authenticated full loop | `DEMO_API_BASE_URL=http://127.0.0.1:8000 DEMO_BEARER_TOKEN=<temporary test token> npm run smoke:online` | 7-answer loop reached summary |
| Whitespace hygiene | `git diff --check` | passed |

## New Repo Test Command

Public online checks:

```bash
npm run smoke:online
```

Authenticated online full loop, only after the private demo token is available
in shell:

```bash
DEMO_BEARER_TOKEN='<private token from agreed channel>' npm run smoke:online
```

Optional target override:

```bash
DEMO_API_BASE_URL='https://nycu-imedtac-triage-demo-api.onrender.com' \
DEMO_TEST_ORIGIN='http://localhost:5174' \
DEMO_BEARER_TOKEN='<private token from agreed channel>' \
npm run smoke:online
```

The smoke runner checks:

- health endpoint;
- CORS allowlist and unknown-origin behavior;
- no-token rejection when token is provided locally;
- authorized start session;
- same-body idempotency retry;
- changed-body idempotency conflict;
- full answer loop to terminal `status=summary`;
- `summary_visibility=staff_only`;
- `staff_review_summary` presence and scope-control safety.

## What To Send To imedtac

The concise engineering message can state:

```text
NYCU Render rehearsal API is live:
https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo

Verified:
- GET /healthz returns 200.
- CORS preflight for http://localhost:5174 returns 204 and allows Authorization.
- POST endpoints require Authorization: Bearer <demo token>.
- API paths and JSON contract remain the same two-endpoint June MVP contract.

Next joint test:
imedtac frontend calls POST /api/triage-demo/sessions with measured or
synthetic demo vitals, renders the returned choice question, submits selected
option ids to POST /api/triage-demo/sessions/{session_key}/answers, and verifies
that the final status=summary payload displays staff_review_summary on the
staff/result preview surface.
```

The real bearer token must be provided only through the agreed private channel.
Do not include it in Teams screenshots, repo files, GitHub, Markdown, public
logs, or captured terminal output.

## Remaining Gate

The only gate not run against Render in this repo session is the real-token
authenticated full loop, because the private bearer token was not available in
the shell. The same full-loop path passed locally with a temporary shell-only
test token. Once the real token is available, run:

```bash
DEMO_BEARER_TOKEN='<private token from agreed channel>' npm run smoke:online
```

Pass criteria: the command prints `Completed authenticated answer loop in 7
answer request(s).` and `Online authenticated smoke checks passed.`
