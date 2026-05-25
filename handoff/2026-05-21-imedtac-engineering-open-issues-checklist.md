---
id: 2026-05-21-imedtac-engineering-open-issues-checklist
title: "慧誠智醫工程整合 Open Issues / Integration Checklist"
date: 2026-05-21
topic: ai-triage
type: handoff
status: active
audience: internal NYCU / Jason coordination; selective imedtac engineering follow-up
source:
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ../source/2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md
  - ./2026-05-21-imedtac-two-endpoint-api-reply.md
  - ./2026-05-21-duobao-style-tachycardia-live-demo-question-set.md
  - ./2026-05-21-to-2026-05-25-imedtac-response-plan.md
  - ./2026-05-25-imedtac-integration-next-steps.md
---

# 慧誠智醫工程整合 Open Issues / Integration Checklist

## First Principle

目前最稀缺的資源不是再增加醫療邏輯，而是讓慧誠智醫（imedtac Co.,
Ltd.）與 NYCU 在 `2026-05-25` 前取得同一份可執行的工程邊界。

六月 demo 的工程主線應固定為：

```text
iMVS 完成 vital-sign measurement
-> iMVS 呼叫 NYCU start-session endpoint，送 measured vital payload
-> NYCU 回 session_key 與第一題 typed question
-> iMVS 用同一個 session_key 送 answer
-> NYCU 回下一題或 staff_review_summary
```

問答集、選項、必答規則與 summary wording 可以繼續由多寶 / 許醫師審查
調整；但除非題型、answer payload、skip behavior、early handoff behavior
或 UI template 能力改變，否則不應讓 endpoint shape 反覆變動。

## Current Contract Position

- 六月 required endpoints 維持兩個：
  - `POST /api/triage-demo/sessions`
  - `POST /api/triage-demo/sessions/{session_key}/answers`
- 六月 default values：
  - `workflow_mode = "post_measurement_only"`
  - `measurement_state = "complete"`
  - `vitals_ready = true`
  - `question_phase = "post_measurement_intake"` for questions
  - `question_phase = "summary"` for the final staff summary
- clinical content change 應透過版本欄位管理：
  - `flow_version`
  - `case_version`
  - `fixture_version`
  - `question_set_version`
  - `wording_version`

## P0 Blocking Issues

這些項目會直接影響 imedtac 工程團隊能否開始穩定串接。

| ID | Issue | Decision / Input Needed | Owner | Target | Acceptance Check |
| --- | --- | --- | --- | --- | --- |
| P0-01 | API change-control rule | 確認 endpoint shape 先 freeze；題目、選項、順序與 wording 透過版本欄位更新。 | NYCU / Jason | `2026-05-22` | API 回覆文件明確說明 question set 改版不等於 endpoint 改版。 |
| P0-02 | Vital Upload API field dictionary | 以 `2026-05-12` iMVS API `V1.4` 的 `NBP/SPO2/HR/Temp/Glucose/Height/Weight` 與 units 作為 baseline；imedtac 確認 current demo machine / GitHub 格式的 field-name delta、required/optional、missing/failed/poor-quality 表示方式。 | imedtac engineering | `2026-05-22` ask | 至少確認 heart rate、SpO2、temperature、blood pressure、height、weight 是否沿用 V1.4；respiratory rate 是否提供要明確。 |
| P0-03 | Session lifecycle | 定義 `session_key` expiry、abandoned session、summary-ready 後能否再送 answer、重整頁面是否可恢復。 | NYCU propose; imedtac confirm | `2026-05-22` draft | API 文件或 checklist 有明確 session-state behavior。 |
| P0-04 | Retry / idempotency behavior | 確認 timeout retry 不會讓 question flow 前進兩次；相同 `idempotency_key` 搭不同 body 回 conflict。 | NYCU propose; imedtac confirm | `2026-05-22` draft | JSON examples 與 error code 包含 retry / conflict path。 |
| P0-05 | Progress denominator semantics | Ben asked whether `capabilities.max_questions` can be used as `Question X of Y`. NYCU should clarify that it is a cap and iMVS should use response-level `progress.expected_total`. | NYCU / Jason | immediate reply | API reply states `max_questions` is a cap; `progress.expected_total` drives UI progress. |
| P0-06 | Error / fallback UI contract | 確認 remote API unavailable、invalid answer、session expired、payload mismatch 時 iMVS 顯示與 fallback mode。 | imedtac UI + NYCU | before rehearsal | Local Scripted Demo Mode 標示方式與 fallback response 欄位確定。 |
| P0-07 | Engineering environment path | imedtac plans browser direct call to NYCU API. NYCU must provide base URL, CORS for `http://localhost` and `http://localhost:5174`, and bearer-token header rule if enabled. | NYCU + imedtac engineering | before rehearsal | Browser preflight and first API call pass from imedtac demo origin. |
| P0-08 | Demo acceptance criteria | 定義「串接完成」的最小可驗證流程。 | NYCU + imedtac | before rehearsal | rehearsal 能跑完 vital payload -> first question -> answer -> next question -> summary -> fallback check。 |

## P0 Contract Closeout Snapshot - 2026-05-25

NYCU can now start engineering rehearsal without waiting for final clinical
wording. The endpoint shape is frozen for the June mock path:

```http
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

| ID | Rehearsal status | Evidence |
| --- | --- | --- |
| P0-02 | Closed for NYCU mock and first rehearsal. The field baseline uses the `2026-05-12` iMVS API `V1.4` vital dictionary and the tachycardia fixture uses HR `130`, SpO2 `98`, BP `102/68`, RR `16`, T `36.5 C`. imedtac still owns current-device delta confirmation, but it is no longer an endpoint-shape blocker. | `docs/2026-05-21-imedtac-api-field-mvp-scope-note.md`; `demo/fixtures/tachycardia-live-demo.json`; `handoff/2026-05-25-first-rehearsal-packet.md`. |
| P0-03 | Closed for mock. Sessions return `session_key`, `session_expires_at`, `session_state=active`, then `summary_ready`. New answers after summary return `session_summary_ready`; invalid keys return `invalid_session`. | `api/lib/triage-demo-contract.js`; `tests/contract/triage-demo-api.test.js`. |
| P0-04 | Closed for mock. Same `idempotency_key` retry returns the same response without advancing; same key with a different body returns `idempotency_conflict` with `recovery.safe_next_action=restart_demo_session`. iMVS should not auto-submit a changed answer with a new key after this error. | `api/lib/triage-demo-contract.js`; `tests/contract/triage-demo-api.test.js`; `handoff/2026-05-25-first-rehearsal-packet.md`. |
| P0-05 | Closed. `capabilities.max_questions` is a capacity cap; UI progress uses response-level `progress.expected_total`. The tachycardia lane returns `expected_total=7`. | `handoff/2026-05-25-imedtac-integration-next-steps.md`; `handoff/2026-05-25-first-rehearsal-packet.md`; contract tests. |
| P0-06 | Closed for rehearsal. Runtime and presenter notes support `live_measured`, `synthetic_override`, and `local_scripted_demo`; error responses include stable `status=error`. | `docs/2026-05-25-demo-fallback-script.md`; `docs/demo-script-for-presenter.md`; `api/lib/triage-demo-contract.js`. |
| P0-07 | Closed for first rehearsal path. CORS allows browser origins `http://localhost` and `http://localhost:5174`, supports `OPTIONS`, and the runtime uses an environment-controlled `DEMO_BEARER_TOKEN` gate for `Authorization: Bearer <demo token>` without storing a token. Public verification on `2026-05-25 20:25 GMT+8` confirmed `/healthz` HTTP `200`, CORS preflight HTTP `204`, and no-token start-session HTTP `401` / `demo_bearer_token_required`; private-token success was shared through the agreed private channel. The NYCU-hosted Render rehearsal base URL is fixed as `https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo`; this is a deployment target, not a schema change. | `api/lib/triage-demo-contract.js`; `api/triage-demo/sessions.js`; `api/triage-demo/sessions/[session_key]/answers.js`; `handoff/2026-05-25-first-rehearsal-packet.md`; `handoff/2026-05-25-render-rehearsal-api-deployment-runbook.md`. |
| P0-08 | Closed for first rehearsal. Acceptance now covers start session, next question, answer, summary, retry, conflict, invalid session, CORS, summary preview, and fallback mode. | `docs/demo-acceptance-criteria.md`; `handoff/2026-05-25-first-rehearsal-packet.md`; `tests/contract/triage-demo-api.test.js`. |

## P1 Important Integration Issues

這些項目不一定阻擋 API 文件送出，但會影響 demo 畫面、工程量與 rehearsal
成功率。

| ID | Issue | Decision / Input Needed | Owner | Target | Acceptance Check |
| --- | --- | --- | --- | --- | --- |
| P1-01 | UI rendering constraints | Teams `2026-05-25` signal: current working layout supports up to `9` short options without user scroll; exact max label length still needs practical confirmation. | imedtac UI / engineering + NYCU | before rehearsal | API examples stay within UI capacity; NYCU keeps labels short and prefers fewer options unless clinically needed. |
| P1-02 | Question template support | 確認 `single_choice`、`multi_choice`、variable option count、AI-returned none option behavior；`scale` remains future. | imedtac UI / engineering | before rehearsal | NYCU question object 與 iMVS reusable template 可對應。 |
| P1-03 | Skip / unable-to-answer policy | required 題不使用 silent skip；保留 `I'm not sure`；static UI `None of these` removed; NYCU returns `none_of_these` only as ordinary option when needed. | 多寶 / 許醫師 + NYCU + imedtac UI | current package achieved; refine after UI | 每題標示 required/optional，以及是否允許 explicit skip。 |
| P1-04 | Mock server / contract test packet | 是否需要 NYCU 提供 mock endpoint 或只提供 JSON examples。 | imedtac engineering ask; NYCU implement if needed | `2026-05-24` decision | imedtac 可在 NYCU 正式部署前先串 UI。 |
| P1-05 | Observability / debug logging | 雙方 log 至少保留 `request_id`、`response_id`、`session_key`、`case_id`、`flow_version`。 | both teams | rehearsal 前 | 出錯時能判斷是 payload、network、session state、question engine 或 UI 問題。 |
| P1-06 | Staff-summary display location | Johnny asked whether NYCU already has a summary preview page after all questions. Preferred path: iMVS renders `status=summary` / `staff_review_summary` inside its existing result / preview page; NYCU-hosted preview can be a temporary rehearsal/debug surface only after discussion. Jason has already noted that NYCU-provided UI may affect visual consistency and device-operation completeness, so this surface must not be switched unilaterally. | imedtac UI + NYCU | immediate | UI copy 不含 diagnosis、treatment、final triage level、production HIS/EMR claim；summary remains `staff_only` and is not a patient result page。 |
| P1-07 | Demo lane choice | tachycardia live-performance lane 與 respiratory synthetic fallback 的主次與 wording。 | Jason + 多寶 / 許醫師 + Johnny | drafted | `handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md` 可作為 Monday 第一版 preset questions/options 的 review draft。 |
| P1-08 | Live HR demo mode / fallback | 確認 demo script 是否標示 `live_measured`、`synthetic_override`、或 `local_scripted_demo`，避免 demo 成敗依賴現場心跳值。 | NYCU propose; imedtac confirm | rehearsal 前 | Presenter script 和 payload 都能顯示目前 mode；live HR 不適合時可切 scripted fixture。 |
| P1-09 | Answer-submit UI locking | iMVS should lock all answer-related controls immediately after submit and unlock only after NYCU returns the next question or summary. Help / restart / fallback controls can remain available. | imedtac UI | first rehearsal | Prevents changed-answer resubmission while the request is pending and lowers `idempotency_conflict` risk. |

## P2 Safety / Product Boundary Issues

這些項目應該留在內部追蹤，並在對外回覆時轉成簡潔、安全的工程語言。

| ID | Issue | Needed Control | Owner | When To Reopen |
| --- | --- | --- | --- | --- |
| P2-01 | Early handoff / stop condition | 若某些 vital 或 answer combination 需要直接 staff review，API 應使用 `handoff_required`、`handoff_reason_codes`、`session_state`、`next_action`。 | NYCU + clinical reviewer | 當第一版問題集確定後。 |
| P2-02 | Patient-facing summary boundary | 若 imedtac 要讓病人看到 summary，需要另做 patient-safe copy；不可直接使用 staff-review summary。 | imedtac UI + NYCU | 當 imedtac 要求 patient-facing result page。 |
| P2-03 | Real patient data | 六月維持 synthetic/demo data；若要 real data，需另開 privacy、security、clinical governance 路徑。 | Prof. Wu / 智德萬 / imedtac / legal | 任何 real identifier 或 PHI request 出現時。 |
| P2-04 | HIS / EMR / FHIR writeback | 六月不做 production writeback；可展示 preview / export story，但不可暗示已整合正式醫院系統。 | imedtac + NYCU | 當 customer 要求 production integration。 |
| P2-05 | Patent / reusable-method transfer | 對 imedtac 分享 interface-level API 與 demo examples；routing / scoring / source-governance / prompt / embedding / reusable framework details 保留內部。 | Prof. Wu / Tomi / 智德萬 + Jason | 深入技術教學或 co-development 前。 |
| P2-06 | Live participant safety | 不要求任何人為 demo 做運動或追求特定心跳值；現場只使用自願量測，必要時切 synthetic fixture。 | Jason + imedtac demo owner | 任何 live-performance rehearsal 前。 |
| P2-07 | Measurement artifact handling | 若 live HR quality 不穩或可能是 device artifact，summary 應以 `quality_flag=needs_review` 呈現，不當作乾淨臨床結論。 | imedtac engineering + NYCU | 接上真機量測品質欄位時。 |

## Minimal Rehearsal Acceptance Criteria

第一次 end-to-end rehearsal 應以「可跑完、可除錯、可 fallback」為準，不以
臨床完整性為準。

- iMVS 或 mock client 能送出 measured / synthetic vital payload。
- NYCU 回 `session_key`、`response_id` 與第一題 typed question。
- iMVS 能 render `single_choice` / `multi_choice` question。
- iMVS 能送 `answer.selected_option_ids` 與 `idempotency_key`。
- NYCU 能回下一題或 `staff_review_summary`。
- 相同 `idempotency_key` retry 不會讓流程前進兩次。
- 送出答案後，iMVS 鎖住答題相關按鈕與選項，直到 NYCU 回下一題或 summary。
- 相同 `idempotency_key` 搭配不同 answer body 時，NYCU 回
  `idempotency_conflict`，recovery 固定為 restart demo session。
- `session_key` expired / invalid 時有穩定 error response。
- remote API unavailable 時，iMVS 能切換到清楚標示的 fallback。
- summary display 不含 diagnosis、treatment、final triage level、HIS / EMR
  writeback claim。
- 雙方 log 能用 `request_id` / `response_id` / `session_key` 對帳。

## Suggested Message To imedtac Engineering

```text
Ben、Lauren、Johnny 大家好，補充一點工程串接邊界：

我們建議六月先 freeze 兩個 endpoint 的 shape。多寶 / 許醫師接下來若調整題目、
選項、題目順序、必答規則或 staff summary wording，會透過 question_set_version、
wording_version、case_version 與 fixture_version 管理，不會要求 imedtac 重新串接
endpoint。

真正會需要更新 API schema 的情況，主要是題型能力改變、answer payload 改變、
需要 explicit skip button、需要 early handoff / stop behavior，或 iMVS UI template
能力與目前假設不同。這些我們會列成 open issues 與 imedtac 工程團隊逐項確認。
```

## Next Actions

| Action | Owner | Target |
| --- | --- | --- |
| Add API change-control section to the external API reply file. | Jason | done |
| Send the two-endpoint API reply first. | Jason / NYCU | done / in discussion |
| Reply to Ben's `request_id` / `idempotency_key` and `max_questions` questions. | Jason / NYCU | drafted in Teams reply; send externally |
| Confirm whether summary preview should be iMVS-native rendering or temporary NYCU-hosted demo preview. | imedtac UI + NYCU | first rehearsal acceptance item |
| Ask imedtac for the remaining P0/P1 engineering input packet. | Jason | before rehearsal |
| Discuss skip / required-question policy with 多寶 / 許醫師. | Jason + 多寶 / 許醫師 | achieved for tachycardia lane; refine after UI confirmation |
| Decide whether mock endpoint is needed or JSON examples are enough. | imedtac engineering + NYCU | mock implemented for rehearsal |
| Run first rehearsal against Remote REST API Mode or Local Scripted Demo Mode. | both teams | before `2026-06-10` customer demo |
