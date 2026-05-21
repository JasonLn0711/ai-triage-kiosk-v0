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
  - ./2026-05-21-imedtac-two-endpoint-api-reply.md
  - ./2026-05-21-to-2026-05-25-imedtac-response-plan.md
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
| P0-02 | Vital Upload API field dictionary | imedtac 提供實際 vital field names、units、required/optional、missing/failed/poor-quality 表示方式。 | imedtac engineering | `2026-05-22` ask | 至少包含 heart rate、SpO2、temperature、blood pressure、height、weight；respiratory rate 是否提供要明確。 |
| P0-03 | Session lifecycle | 定義 `session_key` expiry、abandoned session、summary-ready 後能否再送 answer、重整頁面是否可恢復。 | NYCU propose; imedtac confirm | `2026-05-22` draft | API 文件或 checklist 有明確 session-state behavior。 |
| P0-04 | Retry / idempotency behavior | 確認 timeout retry 不會讓 question flow 前進兩次；相同 `idempotency_key` 搭不同 body 回 conflict。 | NYCU propose; imedtac confirm | `2026-05-22` draft | JSON examples 與 error code 包含 retry / conflict path。 |
| P0-05 | Error / fallback UI contract | 確認 remote API unavailable、invalid answer、session expired、payload mismatch 時 iMVS 顯示與 fallback mode。 | imedtac UI + NYCU | `2026-05-24` | Local Scripted Demo Mode 標示方式與 fallback response 欄位確定。 |
| P0-06 | Engineering environment path | 確認 browser direct call、imedtac backend proxy、CORS、firewall、VPN、token / shared secret。 | imedtac engineering | `2026-05-24` | rehearsal 前有 base URL / network path / auth assumption。 |
| P0-07 | Demo acceptance criteria | 定義「串接完成」的最小可驗證流程。 | NYCU + imedtac | `2026-05-24` | rehearsal 能跑完 vital payload -> first question -> answer -> next question -> summary -> fallback check。 |

## P1 Important Integration Issues

這些項目不一定阻擋 API 文件送出，但會影響 demo 畫面、工程量與 rehearsal
成功率。

| ID | Issue | Decision / Input Needed | Owner | Target | Acceptance Check |
| --- | --- | --- | --- | --- | --- |
| P1-01 | UI rendering constraints | iMVS 單題最多 options、option label 字數、是否需 no-scroll、是否支援 progress。 | imedtac UI / engineering | `2026-05-22` ask | API examples 不超過 UI 容量；必要時調整 question template。 |
| P1-02 | Question template support | 確認 `single_choice`、`multi_choice`、`scale`、variable option count、none-of-these behavior。 | imedtac UI / engineering | `2026-05-22` ask | NYCU question object 與 iMVS reusable template 可對應。 |
| P1-03 | Skip / unable-to-answer policy | required 題不使用 silent skip；不確定情境優先用 `Not sure` / `Unable to answer`。 | 多寶 / 許醫師 + NYCU | `2026-05-25` | 每題標示 required/optional，以及是否允許 explicit skip。 |
| P1-04 | Mock server / contract test packet | 是否需要 NYCU 提供 mock endpoint 或只提供 JSON examples。 | imedtac engineering ask; NYCU implement if needed | `2026-05-24` decision | imedtac 可在 NYCU 正式部署前先串 UI。 |
| P1-05 | Observability / debug logging | 雙方 log 至少保留 `request_id`、`response_id`、`session_key`、`case_id`、`flow_version`。 | both teams | rehearsal 前 | 出錯時能判斷是 payload、network、session state、question engine 或 UI 問題。 |
| P1-06 | Staff-summary display location | 確認 `staff_review_summary` 放在 staff / doctor / customer preview，不放成病人診斷結果。 | imedtac UI + NYCU | `2026-05-24` | UI copy 不含 diagnosis、treatment、final triage level、production HIS/EMR claim。 |
| P1-07 | Demo lane choice | tachycardia live-performance lane 與 respiratory synthetic fallback 的主次與 wording。 | Jason + 多寶 / 許醫師 + Johnny | `2026-05-25` | Monday 回覆可交付第一版 preset questions/options。 |

## P2 Safety / Product Boundary Issues

這些項目應該留在內部追蹤，並在對外回覆時轉成簡潔、安全的工程語言。

| ID | Issue | Needed Control | Owner | When To Reopen |
| --- | --- | --- | --- | --- |
| P2-01 | Early handoff / stop condition | 若某些 vital 或 answer combination 需要直接 staff review，API 應使用 `handoff_required`、`handoff_reason_codes`、`session_state`、`next_action`。 | NYCU + clinical reviewer | 當第一版問題集確定後。 |
| P2-02 | Patient-facing summary boundary | 若 imedtac 要讓病人看到 summary，需要另做 patient-safe copy；不可直接使用 staff-review summary。 | imedtac UI + NYCU | 當 imedtac 要求 patient-facing result page。 |
| P2-03 | Real patient data | 六月維持 synthetic/demo data；若要 real data，需另開 privacy、security、clinical governance 路徑。 | Prof. Wu / 智德萬 / imedtac / legal | 任何 real identifier 或 PHI request 出現時。 |
| P2-04 | HIS / EMR / FHIR writeback | 六月不做 production writeback；可展示 preview / export story，但不可暗示已整合正式醫院系統。 | imedtac + NYCU | 當 customer 要求 production integration。 |
| P2-05 | Patent / reusable-method transfer | 對 imedtac 分享 interface-level API 與 demo examples；routing / scoring / source-governance / prompt / embedding / reusable framework details 保留內部。 | Prof. Wu / Tomi / 智德萬 + Jason | 深入技術教學或 co-development 前。 |

## Minimal Rehearsal Acceptance Criteria

第一次 end-to-end rehearsal 應以「可跑完、可除錯、可 fallback」為準，不以
臨床完整性為準。

- iMVS 或 mock client 能送出 measured / synthetic vital payload。
- NYCU 回 `session_key`、`response_id` 與第一題 typed question。
- iMVS 能 render `single_choice` / `multi_choice` question。
- iMVS 能送 `answer.selected_option_ids` 與 `idempotency_key`。
- NYCU 能回下一題或 `staff_review_summary`。
- 相同 `idempotency_key` retry 不會讓流程前進兩次。
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
| Add API change-control section to the external API reply file. | Jason | done in this planning pass |
| Send the two-endpoint API reply first. | Jason / NYCU | `2026-05-22` |
| Ask imedtac for the P0/P1 engineering input packet. | Jason | `2026-05-22` |
| Discuss skip / required-question policy with 多寶 / 許醫師. | Jason + 多寶 / 許醫師 | night of `2026-05-21` or morning of `2026-05-22` |
| Decide whether mock endpoint is needed or JSON examples are enough. | imedtac engineering + NYCU | before first rehearsal |
| Run first rehearsal against Remote REST API Mode or Local Scripted Demo Mode. | both teams | before `2026-06-10` customer demo |
