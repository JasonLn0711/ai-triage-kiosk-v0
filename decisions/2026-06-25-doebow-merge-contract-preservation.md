# 2026-06-25 Doebow Merge Contract Preservation

## Recommendation

Merge `origin/doebow` into `main` as a contract-compatible runtime expansion.
The merged implementation keeps the externally discussed 慧誠智醫（imedtac
Co., Ltd.）API contract stable while bringing doebow's updated question bank,
local LLM summary service, and demo summary-review frontend into the execution
repo.

## Preserved External Contract

The imedtac-facing API remains the same two-endpoint workflow:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

Terminal completion still returns `status: "summary"` with
`staff_review_summary`. Staff-notify and severe-vital paths remain wrapped as
summary-compatible terminal responses. The implementation does not introduce a
new required endpoint, required field, report URL, QR payload contract, final
triage level, diagnosis, treatment advice, or production clinical claim.

## Merged Capability

- `Question_DB/` and `Case_question/` now include doebow's broader fixed
  English question coverage and no-number-pad initial intake direction.
- Initial age and duration are rendered as single-choice buckets for the current
  imedtac MVP UI surface.
- Symptom question rows keep the supported `single_choice` / `multi_choice`
  rendering contract and stay within the maximum visible option constraint.
- `LLM_api/` is available as a local controlled demo service for subjective SOAP
  summary rewriting.
- `python_api/static/demo-ui/summary-review/` provides a demo review page that
  can render a completed `staff_review_summary` payload.
- Python contract tests now cover LLM fallback, summary-review static route,
  session expiry, body-size guard, CORS behavior, and the expanded initial
  detail-question path.

## Merge-Time Correction Ledger

The merge accepted doebow's branch direction and applied targeted corrections
where the branch would otherwise change the already-communicated imedtac
contract, create an implicit runtime dependency, or break the current MVP UI
constraints.

### Runtime Behavior Corrections

| Area | Files | Final correction | Reason |
| --- | --- | --- | --- |
| LLM summary activation | `.env.example`, `python_api/triage_v1/llm_summary_client.py`, `LLM_api/README.md`, `python_api/README.md` | Changed the default `LLM_SUMMARY_URL` from the local Hugging Face service URL to an empty value. The LLM service is still available, but only when explicitly configured. | Keeps the default FastAPI demo path deterministic and independent from a developer-machine LLM server. |
| Summary completion display | `python_api/static/app.js`, `python_api/static/styles.css` | Kept inline SOAP summary rendering in the local API tester and added an explicit `Open review page` button. The review page opens in a new tab instead of automatic redirect. `summary_review_url=0` or `summary_review_url=false` disables the button. | Preserves the display behavior already implied by the imedtac API contract while keeping the review page as an additive demo surface. |
| Review-page payload handoff | `python_api/static/app.js`, `python_api/static/demo-ui/summary-review/index.html` | Kept the same-browser `window.name` payload handoff and added the missing `summaryMeta` element required by the page script. | Makes the additive review page runnable without introducing a persisted report URL, QR payload, or cross-device storage contract. |
| Staff-review summary content | `python_api/triage_v1/summary_builder.py` | Kept assessment and plan language as staff-review support: measured vitals and selected answers are organized for staff review. Replaced the empty `staff_handoff_note` with `Review measured vital context and selected symptom answers.` | Keeps terminal output useful for staff while avoiding diagnosis, treatment, or final triage claims. |
| Severe-vital terminal path | `python_api/tests/test_contract.py`, `python_api/tests/test_v1_engine.py` | Tests now assert severe-vital terminal responses remain `status: "summary"` with `compatibility_mode: "staff_notify_wrapped_as_summary"`, not a new standalone terminal contract. | Preserves the external two-endpoint flow and the imedtac stop condition around summary-compatible terminal responses. |

### Question And Flow Corrections

| Area | Files | Final correction | Reason |
| --- | --- | --- | --- |
| Age answer persistence | `python_api/triage_v1/flow_router.py` | Resolved the `INIT-2` conflict with `age_value not in (None, "")` before updating `patient.age` and `patient_context["age"]`. | Preserves the stricter main-branch behavior so falsey but valid structured values are handled deliberately. |
| Initial question path tests | `python_api/tests/test_contract.py` | Updated tests to answer age and duration by label lookup instead of hard-coding option ids, and added assertions that all rendered initial/detail/duration questions stay within the MVP choice contract. | Keeps tests stable while accepting doebow's bucketed no-number-pad question direction. |
| Initial detail option count | `Question_DB/Initial_questions.csv` | Removed `sleep problem` from `INIT-3A-NEURO`, leaving headache, dizziness, fainting, confusion or memory change, weakness or paralysis, numbness or tingling, walking imbalance or falls, weakness / fatigue, and not sure. | Keeps the question within the current maximum visible option constraint of 9. |
| Symptom question bank merge | `Question_DB/symptom_questions.csv` | Kept doebow's expanded question bank and single-choice refinements for onset, timing, amount, and duration-style rows; normalized the conflicted CSV to one LF-terminated copy. | Preserves doebow's no-number-pad / choice-first data direction and removes merge duplication / line-ending churn. |
| Design note merge | `Case_question/Case_Question_design.md` | Kept doebow's age-group and duration-bucket wording in the design note while removing conflict duplication. | Aligns the narrative question design with the runtime bucketed initial intake. |

### Contract And Test Corrections

| Area | Files | Final correction | Reason |
| --- | --- | --- | --- |
| Golden contract coverage | `python_api/tests/test_contract.py` | Added golden-field assertions against the saved 2026-05-21 start-session and summary examples. | Makes future changes fail if the externally discussed version fields or baseline response shape drift. |
| CORS and auth coverage | `python_api/tests/test_contract.py` | Kept the main-branch CORS preflight tests, configured-origin tests, wildcard rejection, and bearer-auth CORS error coverage while merging doebow's summary-review page test. | Preserves the browser-origin and bearer-token behavior already communicated externally. |
| LLM disabled-by-default coverage | `python_api/tests/test_llm_summary_client.py` | Added a test that `request_subjective_summary` returns `None` when `LLM_SUMMARY_URL` is absent. | Locks the opt-in LLM behavior. |
| Full question DB guard | `python_api/tests/test_v1_engine.py` | Added coverage that all loaded questions are `single_choice` or `multi_choice`, have 1-9 options, and have valid selection limits. | Keeps doebow's larger question bank inside the imedtac MVP renderer contract. |
| Disposition wording guard | `python_api/tests/test_v1_engine.py` | Added a test that disposition-like source wording is sanitized for MVP display. | Keeps patient-facing wording in staff-review support scope rather than discharge / destination advice. |
| Staff-notify assertion update | `python_api/tests/test_v1_engine.py` | Renamed and updated staff-notify tests to assert summary-compatible terminal flow. | Keeps safety escalation wrapped in the already-communicated summary response envelope. |

### Documentation Corrections

| Area | Files | Final correction | Reason |
| --- | --- | --- | --- |
| QR/report URL boundary | `README.md`, `python_api/README.md`, this decision note | Recorded that the current API does not provide `report_url`, QR-code content, or cross-device report handoff. | Avoids silently adding a new imedtac-facing API commitment. |
| Merge status and verification | `README.md`, `CHANGELOG.md`, this decision note | Added the 2026-06-25 merge status, accepted doebow capabilities, preserved-contract language, and local verification results. | Makes the merge discoverable without reading git history. |
| API contract text cleanup | `python_api/API_contract/ai-triage-demo-api-contract-2026-06-11.md` | Removed trailing whitespace / blank-line churn in the stop-condition section; the stop rule remains unchanged. | Keeps the contract file stable and readable without changing semantics. |
| Start script cleanup | `Start_python_server.sh` | Removed trailing whitespace from the uvicorn command. | Mechanical cleanup from the merge conflict pass. |

## Scope Controls

The deterministic staff-review summary remains the default production-safe demo
behavior. `LLM_SUMMARY_URL` is empty by default and must be explicitly set in
the triage API environment before the local LLM service is used. This keeps the
Render/default path independent from a developer machine LLM server.

The summary-review frontend is an additive demo surface. The local API tester
continues to display `staff_review_summary` inline by default and exposes the
review page through an explicit button. It no longer redirects automatically at
summary completion, so it does not silently replace the display surface already
communicated to imedtac.

The current API does not provide `report_url`, QR-code content, or a
cross-device summary session handoff. The review page currently accepts a
same-browser payload handoff through `window.name`. If imedtac needs their
screen to display a QR code that opens an NYCU-hosted report summary page, that
requires a separate recorded change-control decision covering URL lifetime,
session lookup, payload storage, privacy boundary, bearer/auth behavior,
expiration, and who renders the QR code.

## Verification

```text
PYTHONPATH=. uv run --project python_api python -m pytest python_api/tests -q
uv run --project LLM_api python -m pytest LLM_api/tests -q
npm test
npm run smoke
npm run build
git diff --check
```

Observed local result on 2026-06-25:

- Python API tests: 50 passed.
- LLM API tests: 2 passed.
- JS tests: 33 unit tests and 41 contract tests passed.
- Local smoke: passed.
- Build: passed.
- Whitespace check: passed.

## Next Gate

Publish the merged branch to remote `main`, then run the private-token Render
checks from a shell that has the agreed bearer token:

```bash
DEMO_BEARER_TOKEN='<private token from agreed channel>' npm run smoke:online
DEMO_BEARER_TOKEN='<private token from agreed channel>' npm run smoke:online:doebow
```

The next imedtac-facing decision is whether the summary remains rendered by
iMVS from `staff_review_summary`, or whether a separately governed report URL /
QR flow should be added.
