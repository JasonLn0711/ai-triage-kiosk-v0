---
id: 2026-06-17-contract-compatible-python-mvp-goal-prompt
title: "Contract-Compatible Python MVP Goal Prompt"
date: 2026-06-17
topic: ai-triage
type: goal-prompt
status: draft-for-execution
related:
  - ../API.md
  - ../python_api/README.md
  - ../source/2026-06-09-to-2026-06-17-duobao-line-architecture-mvp-sync/source.md
  - ../source/2026-06-16-imedtac-teams-question-option-adjustment/source.md
  - ../handoff/2026-05-21-imedtac-two-endpoint-api-reply.md
  - ../handoff/api-examples/
---

# Contract-Compatible Python MVP Goal Prompt

## Recommendation

Implement the next AI triage MVP as a contract-compatible Python/FastAPI
runtime. Use doebow's `Question_DB/` question bank as the canonical question
source and retire the old JS runtime path from production/rehearsal use, while
preserving the externally communicated 慧誠智醫（imedtac Co., Ltd.）API contract.

The key architecture is:

```text
imedtac-facing API contract stays stable
-> Python FastAPI adapter owns endpoint compatibility
-> doebow Question_DB is the canonical question source
-> triage_v1 engine owns internal routing and summary
-> optional AI/LLM modules are introduced only behind staff-review summary gates
```

## Compatibility Analysis

### Short Answer

Yes, doebow's design can be compatible with the already-discussed imedtac API
contract if the Python backend keeps a strict contract adapter and does not
expose internal flow changes as required external contract changes.

The compatibility is conditional, not automatic.

### Compatible Without API Contract Change

These doebow changes fit the existing contract:

- Broader question bank under `Question_DB/*.csv`.
- Internal FastAPI implementation replacing JS implementation.
- Vital-based branch selection after `POST /api/triage-demo/sessions`.
- Staff-review summary generation after the answer loop.
- More symptom modules beyond tachycardia, as long as returned questions use
  the same `question` object shape.
- Converting duration / time questions into single-choice option buckets.
- Keeping `staff_notify` as an additive internal response mode only if it has
  already been documented for the Python contract and is not required for the
  first imedtac test path.

### Must Not Change For Compatibility

These fields and behaviors are part of the external baseline and should remain
stable for the MVP test:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
Authorization: Bearer <demo token> when enabled
CORS origins: http://localhost and http://localhost:5174 unless updated by notice
workflow_mode: post_measurement_only
measurement_state: complete
vitals_ready: true
status: question | summary | error
question.type: single_choice | multi_choice for imedtac-facing MVP
progress.current
progress.expected_total
staff_review_summary
demo_boundary
idempotency retry / conflict semantics
```

### Current Mismatch To Fix

The current Python runtime is close, but has compatibility risks that must be
resolved before imedtac testing:

1. `python_api/triage_contract.py` currently sets global contract fields like:

```text
flow_version: vital-rules-router-v1-demo
case_id: vital-routed-session
case_version: vital-rules-router-v1
fixture_version: not_applicable
question_set_version: vital-routed-question-set-v1
```

The external examples and API baseline still use:

```text
flow_version: tachycardia-live-demo-flow-v0.2-draft
case_id: demo-tachycardia-live-001
case_version: demo-tachycardia-live-001-v0.2
fixture_version: v0.2.0
question_set_version: tachycardia-question-set-v0.2-draft
```

For the first MVP compatibility release, keep external version fields stable
for the tachycardia/high-heart-rate path. If broader branch fields are needed,
make them additive through internal metadata or a feature flag, not a required
change to the imedtac baseline.

2. `Question_DB/Initial_questions.csv` includes `Number` and `Time` question
types (`INIT-2`, `INIT-4`). imedtac Teams discussion says the current UI should
stay within single-choice / multi-choice. Therefore these must not be returned
to imedtac in the first MVP unless they are transformed into single-choice
bucket questions or hidden behind an internal/local-only test mode.

3. The Python response builder can return `status=staff_notify`. This is useful
for safety and has been documented as a possible Python runtime mode, but the
first imedtac MVP should confirm whether imedtac frontend can render it. If not,
route demo test payloads away from terminal `staff_notify` or wrap it as a
summary-like staff-review state only after explicit discussion.

### Compatibility Rule

Doebow's design is compatible if every imedtac-facing response passes this
rule:

```text
The frontend can keep calling the same two endpoints with the same request
shape, can render the same question object schema, can use the same
progress/status/summary semantics, and does not need a new widget, endpoint,
required field, token format, or response parser.
```

If any runtime change violates this rule, it is a change request and must be
discussed with imedtac before testing.

## Codex Goal Prompt

Copy the following prompt into a fresh Codex goal or execution thread.

```text
Goal: Implement the contract-compatible Python/FastAPI MVP for the AI triage
kiosk demo in /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-ai-triage-kiosk-v0.

Primary objective:
Make the Python/FastAPI backend the canonical runtime for the imedtac demo,
using doebow's Question_DB question bank as the canonical question source and
retiring the JS backend runtime path, while preserving the external API contract
already discussed with 慧誠智醫（imedtac Co., Ltd.）. Do not change the imedtac-facing
endpoint paths, required request semantics, response envelope, CORS behavior,
bearer-token behavior, idempotency semantics, supported MVP question types, or
staff-review summary contract unless the change is explicitly documented as a
future change request and not used in the MVP compatibility path.

Traceability sources to read before editing:
1. AGENTS.md
2. API.md
3. handoff/2026-05-21-imedtac-two-endpoint-api-reply.md
4. handoff/api-examples/2026-05-21-start-session-response-question.json
5. handoff/api-examples/2026-05-21-summary-response-demo-tachycardia.json
6. source/2026-06-09-to-2026-06-17-duobao-line-architecture-mvp-sync/source.md
7. source/2026-06-16-imedtac-teams-question-option-adjustment/source.md
8. python_api/README.md
9. python_api/triage_contract.py
10. python_api/triage_v1/
11. Question_DB/
12. package.json
13. README.md
14. docs/source-index.md

Current repo state to preserve:
- main currently contains a merge of origin/doebow:
  78f741d Merge remote-tracking branch 'origin/doebow'
- origin/doebow currently points at:
  fe3cf2b Modify quesions
- doebow's branch introduced Question_DB, python_api, broader fixed-question
  coverage, FastAPI tests, and CSV-backed routing.
- JS dynamic-engine tests currently pass, but the target end state should not
  require JS backend runtime for the imedtac API path.

Non-negotiable external contract constraints:
- Keep POST /api/triage-demo/sessions.
- Keep POST /api/triage-demo/sessions/{session_key}/answers.
- Keep OPTIONS preflight for both endpoints.
- Keep Content-Type: application/json.
- Keep Authorization: Bearer <demo token> when DEMO_BEARER_TOKEN is configured.
- Keep CORS behavior for http://localhost and http://localhost:5174.
- Keep workflow_mode=post_measurement_only.
- Keep measurement_state=complete and vitals_ready=true for normal MVP flow.
- Keep status values required by the first imedtac path: question, summary,
  error. Treat staff_notify as additive and verify compatibility before exposing
  it to imedtac UI.
- Keep progress.current and progress.expected_total.
- Keep the question object schema.
- Keep MVP patient-facing question.type limited to single_choice and
  multi_choice.
- Do not expose number, time, text, free_text, scale, voice, ASR, or raw audio
  as required imedtac UI widgets in this MVP.
- Keep idempotency retry stable and conflict behavior explicit.
- Keep staff_review_summary as the terminal summary payload.
- Keep demo_boundary and scope_controls language.
- No diagnosis, no treatment advice, no final triage level, no acuity score, no
  disposition recommendation, no production HIS/EMR/FHIR writeback claim.

Implementation route:

Phase 0 - Contract freeze and golden tests
1. Create a migration/compatibility note under docs/ or handoff/ that records:
   current external contract, proposed Python runtime, unchanged fields, additive
   fields, compatibility risks, owner, target test date.
2. Add or update Python contract tests that load the existing JSON examples in
   handoff/api-examples/ and assert that the Python response envelope remains
   compatible with the externally sent API examples.
3. Add tests asserting that MVP responses never return question.type values
   outside single_choice or multi_choice.
4. Add tests asserting no question has more than 9 visible options in the MVP
   imedtac-facing path.
5. Add tests asserting duration/time content is rendered as selectable option
   buckets or not returned in the imedtac-facing mode.
6. Add tests asserting tachycardia/high-heart-rate path keeps the externally
   expected version fields unless a feature flag explicitly enables broader
   internal branch metadata.

Phase 1 - Canonical question source
1. Make Question_DB/*.csv the canonical question-bank source for runtime.
2. Adopt doebow's question bank directly and stop using the old JS
   data/question_manifest.tachycardia.v0.3.json as a runtime source.
3. Preserve old JS manifest/data only as archived historical evidence if needed;
   do not let production/rehearsal runtime read it.
4. Ensure tachycardia compatibility questions still exist in Question_DB with
   stable question IDs and option IDs for the first demo path.
5. Convert or gate unsupported doebow question types:
   - INIT-2 Number age question must not be returned to imedtac MVP unless
     transformed into single_choice age buckets or omitted from the first path.
   - INIT-4 Time duration question must not be returned to imedtac MVP unless
     transformed into single_choice duration buckets.

Phase 2 - Python backend as canonical API runtime
1. Make python_api/main.py and python_api/triage_contract.py the canonical
   backend implementation for the imedtac two-endpoint API.
2. Port any still-needed JS runtime behavior into Python:
   - bearer-token gate;
   - CORS;
   - idempotency retry/conflict;
   - request validation;
   - session expiry;
   - staff-review summary envelope;
   - measured-vital objective summary;
   - forbidden clinical wording guardrails.
3. Remove or deprecate JS API runtime files from the active server path.
   Acceptable outcomes:
   - package scripts no longer start JS mock API as the canonical backend;
   - README states Python FastAPI is the canonical backend;
   - JS frontend/static demo may remain only as a local viewer if it calls
     Python or is clearly marked legacy.
4. Do not delete source/handoff/governance records.
5. Do not delete old JS tests until equivalent Python tests exist or the test
   plan explicitly marks them replaced.

Phase 3 - Contract-compatible doebow MVP
1. Implement MVP 0:
   - one high-heart-rate/tachycardia path;
   - doebow Question_DB source;
   - same two endpoints;
   - single_choice/multi_choice only;
   - measured vitals appear in staff_review_summary objective;
   - no voice/free text/numeric/time widget required.
2. Implement MVP 1:
   - broader fixed-question coverage from doebow question bank;
   - vital-rule branches for fever, low SpO2, bradycardia, hypertension,
     respiratory-rate cue, and initial fallback;
   - keep this behind contract-compatible rendering.
3. Implement MVP 1.5 only after MVP 0/1 pass:
   - optional LLM or template-assisted SOAP/staff summary;
   - all outputs constrained to staff-review intake support;
   - measured vitals and selected answers remain visible as source facts;
   - no diagnosis/triage/treatment/disposition wording.

Phase 4 - Documentation and handoff
1. Update README.md to state Python FastAPI is the canonical backend.
2. Update API.md only if clarifying implementation details; do not rewrite the
   external contract semantics.
3. Update python_api/README.md with exact run/test commands.
4. Update docs/source-index.md if new source or handoff records are added.
5. Add a short imedtac-facing test note draft under handoff/ that says:
   - endpoint paths unchanged;
   - supported question types are single_choice/multi_choice;
   - duration content is now option-based;
   - summary uses measured vital payload;
   - bearer token is delivered privately, not in repo;
   - feedback requested: UI rendering, no-scroll labels, summary preview, and
     high-heart-rate demo clarity.

Verification commands:
- git status --short --branch
- uv run --project python_api python -m pytest python_api/tests
- npm test only if JS tests still exist during transition
- npm run demo:ready only if package scripts are still maintained; if scripts
  are changed, replace this with an equivalent Python MVP ready command
- git diff --check
- rg for forbidden clinical claims in runtime outputs and examples:
  diagnosis, treatment, triage level, acuity, disposition, emergency department
  recommendation, medication order, HIS writeback, EMR writeback, FHIR writeback

Acceptance criteria:
1. Python FastAPI serves the two unchanged imedtac endpoints.
2. doebow Question_DB is the runtime question source.
3. Old JS backend is no longer the canonical runtime path.
4. MVP imedtac-facing questions are only single_choice or multi_choice.
5. No imedtac-facing question has more than 9 options.
6. Unsupported doebow number/time/text question types are transformed or gated.
7. High-heart-rate path reaches status=summary and includes measured vitals in
   staff_review_summary.
8. Existing external API examples remain compatible or an explicit compatibility
   diff explains only optional additive differences.
9. Python tests pass.
10. No tracked file contains credentials, bearer tokens, patient identifiers,
    private links, or live hospital integration secrets.
11. Documentation explains what changed internally and what did not change for
    imedtac.

Deliverables:
- Code changes implementing the Python canonical backend.
- Tests proving contract compatibility.
- A compatibility note under docs/ or handoff/.
- Updated README/API/python_api docs.
- A concise final report with changed files, tests run, remaining risks, and the
  exact imedtac-facing behavior that stayed unchanged.
```

## Execution Plan For The Prompt

### Step 1: Freeze Contract Evidence

Create a compatibility note before code edits. The note should cite:

- `API.md`
- `handoff/api-examples/2026-05-21-start-session-response-question.json`
- `handoff/api-examples/2026-05-21-summary-response-demo-tachycardia.json`
- `source/2026-06-09-to-2026-06-17-duobao-line-architecture-mvp-sync/source.md`
- `source/2026-06-16-imedtac-teams-question-option-adjustment/source.md`

This protects the external commitment boundary before replacing runtime code.

### Step 2: Resolve Contract Field Drift

The Python adapter should distinguish:

```text
external contract fields
internal routing metadata
```

For the imedtac-facing tachycardia path, preserve external fields from the sent
examples. If broader routing needs new internal metadata, put it under an
optional field such as `debug`, `routing_trace`, or internal logs only, and do
not make imedtac parse it.

### Step 3: Normalize doebow Question Types

Adopt doebow's question bank as canonical, but add an imedtac MVP renderer
guard:

```text
single_choice -> return as-is
multi_choice -> return as-is
number -> transform to approved single_choice buckets or gate from MVP
time -> transform to approved duration buckets or gate from MVP
text/free_text -> gate from MVP until pre-V3
```

This keeps the source question bank intact while preserving the imedtac UI
contract.

### Step 4: Retire JS Backend Runtime

The JS backend should stop being the canonical imedtac API server. Prefer:

```text
python_api/main.py
python_api/triage_contract.py
python_api/triage_v1/
Question_DB/
```

JS static UI can remain if useful for local display, but it should either call
the Python backend or be marked legacy/static only.

### Step 5: MVP Release Order

1. MVP 0: contract-compatible high-heart-rate path.
2. MVP 1: broader fixed-question routing from doebow bank.
3. MVP 1.5: staff-review summary assist.
4. MVP 2/2.5/pre-V3/V3: only after imedtac UI and clinical wording gates close.

## Suggested imedtac-Facing Test Position

Use this position after implementation, not before:

```text
我們建議這次測試維持既有兩個 endpoint 與既有 question object 格式。
本版後端已改為 Python/FastAPI，但對 iMVS 前端的呼叫方式不變：
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers

本次 MVP 仍只回傳 single_choice / multi_choice 題型。時間長短類問題已先轉成
選項式回答，以符合目前 UI 不新增 numeric/time widget 的整合方向。最終
staff_review_summary 會使用本次 session 的量測生命徵象與使用者選項，供工作人員
review。
```

Do not send this until the compatibility tests pass and the API base URL/token
delivery path are ready.
