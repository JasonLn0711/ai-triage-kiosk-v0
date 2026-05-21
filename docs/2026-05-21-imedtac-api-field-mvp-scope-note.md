---
id: 2026-05-21-imedtac-api-field-mvp-scope-note
title: "imedtac API Field MVP / Complete Scope Note"
date: 2026-05-21
topic: ai-triage
type: internal-design-note
status: active
source:
  - ../handoff/2026-05-21-imedtac-two-endpoint-api-reply.md
---

# imedtac API Field MVP / Complete Scope Note

本文件保存從對外 API 回覆文件移出的欄位 scope 思考。對外文件最後一欄改為
「範例與說明」，方便 imedtac 工程團隊直接對照 JSON field；本文件保留 NYCU
內部用來排六月 demo MVP、完整 API 與 imedtac 待確認事項的判斷。

## Scope 標籤

| Scope | 定義 |
| --- | --- |
| MVP 必要 | 六月 demo 最小可跑 two-endpoint loop 需要實作或固定回傳的欄位。 |
| MVP 建議 | 建議在 MVP 保留；可先用固定值、簡化值、placeholder 或 log-only 方式實作。 |
| 完整 API | 支援多 case、多版本、臨床審查、production validation 或後續擴充的完整設計欄位；MVP 可先以 placeholder 或固定值管理。 |
| 需 imedtac 確認 | 實作方式取決於 iMVS field dictionary、UI template、畫面限制或 demo environment。 |

## 六月預設值

| Field | Scope | 判斷 |
| --- | --- | --- |
| `workflow_mode` | MVP 必要 | 兩個 endpoint flow 的核心控制欄位。 |
| `measurement_state` | MVP 必要 | 支撐「先 vital sign、後 Q&A」的流程判斷。 |
| `vitals_ready` | MVP 必要 | Endpoint 1 啟動問答前的資料可用性旗標。 |
| `question_phase` | MVP 必要 | iMVS 依此判斷目前要顯示問題或摘要。 |
| `voice_input` | MVP 必要 | 六月版本以固定值關閉語音路徑。 |
| `question.type` | MVP 必要 / 完整 API | 六月先支援 `single_choice` / `multi_choice`；`scale` 屬完整 API 擴充。 |

## Endpoint 1 Request

| Field | Scope | 判斷 |
| --- | --- | --- |
| `api_version` | MVP 必要 | 讓雙方鎖定同一份 API contract。 |
| `schema_version` | MVP 必要 | 讓 request / response 欄位對齊。 |
| `flow_version` | MVP 必要 | 六月至少要區分 tachycardia live lane 與 respiratory fallback lane。 |
| `case_id` | MVP 必要 | 選定本次 demo case。 |
| `case_version` | MVP 建議 | MVP 可先固定；完整 API 用於 case 內容變更追蹤。 |
| `fixture_version` | MVP 建議 | MVP 可先固定；完整 API 用於 rehearsal / regression 對帳。 |
| `question_set_version` | MVP 必要 | 多寶 / 許醫師調整題目時維持 endpoint 穩定。 |
| `wording_version` | MVP 必要 | 管理對外 summary wording 與 scope-control wording。 |
| `request_id` | MVP 必要 | demo rehearsal debug 需要。 |
| `idempotency_key` | MVP 必要 | 處理 timeout / retry 的核心欄位。 |
| `workflow_mode` | MVP 必要 | 固定六月流程。 |
| `measurement_state` | MVP 必要 | 支撐 measure-first demo flow。 |
| `vitals_ready` | MVP 必要 | 支撐 vital-aware question selection。 |
| `client.source` | MVP 建議 | MVP 可固定為 `imvs-demo`；完整 API 用於多 client。 |
| `client.locale` | MVP 必要 | 六月 customer demo 顯示語系控制。 |
| `patient_context.demo_patient_id` | MVP 必要 | demo session 需要 synthetic identity。 |
| `patient_context.age` | 完整 API | MVP 可依 case 固定或省略。 |
| `patient_context.sex` | 完整 API | MVP 可依 case 固定或省略。 |
| `vitals` | MVP 必要 | 兩個 endpoint flow 的主要輸入。 |
| `capabilities.question_types` | MVP 必要 | 讓 NYCU 只回 iMVS 可顯示的題型。 |
| `capabilities.max_questions` | MVP 必要 | 控制 demo 題數與畫面節奏。 |
| `capabilities.max_options_per_question` | 需 imedtac 確認 | MVP 可先採 4 個 option 的 conservative default。 |
| `capabilities.max_option_label_length` | 需 imedtac 確認 | MVP 可先採 48 字元 default。 |
| `capabilities.variable_option_count` | 需 imedtac 確認 | 完整 API 支援 variable options；MVP 可先固定選項數。 |
| `capabilities.voice_input` | MVP 必要 / 完整 API | MVP 固定 `false`；語音輸入屬後續擴充。 |

## Vital Payload

| Field | Scope | 判斷 |
| --- | --- | --- |
| `vitals.measurement_timestamp` | MVP 建議 | rehearsal debug 與 log 對帳需要。 |
| `vitals.device_id` | MVP 建議 | MVP 可固定 demo device id；完整 API 用於多設備。 |
| `vitals.<field>.value` | MVP 必要 | heart rate、SpO2 等 demo vital 的核心數值。 |
| `vitals.<field>.unit` | MVP 必要 | 工程與 UI 顯示需明確單位。 |
| `vitals.<field>.measurement_status` | MVP 建議 | MVP 可先支援 `measured` / `missing`；完整 API 擴充 failed / manual_entry。 |
| `vitals.<field>.quality_flag` | MVP 建議 | MVP 可先支援 `ok` / `needs_review`；完整 API 擴充 device-quality semantics。 |
| `vitals.<field>.missing_reason` | 完整 API | MVP 可先使用 `null` 或簡化固定值。 |

## Endpoint 1 Response

| Field | Scope | 判斷 |
| --- | --- | --- |
| `session_key` | MVP 必要 | 維持 one-session question loop 的核心欄位。 |
| `request_id` | MVP 必要 | 雙方 log 對帳需要。 |
| `response_id` | MVP 建議 | rehearsal debug 需要；完整 API 用於 audit trace。 |
| `session_expires_at` | MVP 建議 | MVP 可用固定 expiry window；完整 API 用於 session lifecycle。 |
| `session_state` | MVP 必要 | iMVS 依此判斷繼續問答、顯示摘要或 fallback。 |
| `last_question_id` | MVP 建議 | 支援 debug 與 answer mismatch 檢查。 |
| `status` | MVP 必要 | iMVS 依此 render question 或 summary。 |
| `workflow_mode` | MVP 必要 | 回傳確認目前流程模式。 |
| `measurement_state` | MVP 必要 | 回傳確認 measured-vitals flow。 |
| `vitals_ready` | MVP 必要 | 回傳確認 vital payload 已進入 session。 |
| `question_phase` | MVP 必要 | iMVS 與 NYCU 對齊問答階段。 |
| `phase_reason` | 完整 API | MVP 可先固定簡短文字；完整 API 用於 explainability / debug。 |
| `progress.current` | MVP 建議 | 若 iMVS 顯示 progress，MVP 需要；否則可先 log-only。 |
| `progress.expected_total` | MVP 建議 | 用於 demo 節奏與畫面預期。 |
| `question` | MVP 必要 | Endpoint 1 的主要 response payload。 |
| `demo_boundary` | MVP 必要 | 對外 demo wording 與 operating scope 控制。 |

## Question Object

| Field | Scope | 判斷 |
| --- | --- | --- |
| `question.id` | MVP 必要 | answer request 必須帶回。 |
| `question.registry_refs` | 完整 API | MVP 可先回 placeholder；完整 API 用於 question provenance。 |
| `question.source_refs` | 完整 API | MVP 可先回 `LOCAL-PROTOCOL-TBD`。 |
| `question.evidence_status` | 完整 API | MVP 可先固定 draft / review status。 |
| `question.review_owner` | 完整 API | MVP 可先固定 `clinical_reviewer_tbd`。 |
| `question.type` | MVP 必要 | iMVS 用來選擇可重用 UI template。 |
| `question.ui_template` | MVP 必要 | 降低 hand-coded screen 需求。 |
| `question.text` | MVP 必要 | 病人端題目顯示核心欄位。 |
| `question.options` | MVP 必要 | choice-based demo 核心欄位。 |
| `question.option_count` | MVP 建議 | 支援 UI capacity check。 |
| `question.none_option_id` | 完整 API | MVP 可在有 none 選項的題目才提供。 |
| `question.rendering_constraints.requires_no_scroll` | 需 imedtac 確認 | MVP 可先固定 `true`。 |
| `question.rendering_constraints.max_visible_options_without_scroll` | 需 imedtac 確認 | MVP 可先採 4 個 options。 |

## Endpoint 2 Request

| Field | Scope | 判斷 |
| --- | --- | --- |
| `api_version` | MVP 必要 | 與 Endpoint 1 contract 對齊。 |
| `schema_version` | MVP 必要 | 與 Endpoint 1 schema 對齊。 |
| `flow_version` | MVP 必要 | 避免不同 demo lane 混用 session。 |
| `case_id` | MVP 必要 | 對齊同一個 synthetic case。 |
| `case_version` | 完整 API | MVP 由 session state 持有；完整 API 可加入 request 以強化 audit trace。 |
| `fixture_version` | 完整 API | MVP 由 session state 持有；完整 API 可加入 request 以強化 rehearsal 對帳。 |
| `question_set_version` | 完整 API | MVP 由 session state 持有；完整 API 可加入 request 以強化 answer provenance。 |
| `wording_version` | 完整 API | MVP 由 session state 持有；完整 API 可加入 request 以強化 summary provenance。 |
| `request_id` | MVP 必要 | answer submission debug 需要。 |
| `idempotency_key` | MVP 必要 | 保護 question loop state。 |
| `session_key` | MVP 必要 | Endpoint 2 的核心 routing key。 |
| `workflow_mode` | MVP 必要 | 回傳 answer 時維持相同 workflow。 |
| `measurement_state` | MVP 必要 | 回傳 answer 時維持 measured-vitals state。 |
| `vitals_ready` | MVP 必要 | 回傳 answer 時維持 vital-ready state。 |
| `question_phase` | MVP 必要 | 讓 NYCU 驗證 answer 屬於正確階段。 |
| `question_id` | MVP 必要 | 答案與題目綁定。 |
| `answer.selected_option_ids` | MVP 必要 | 六月選項題的核心 answer payload。 |
| `answer.scale_value` | 完整 API | MVP 固定為 `null`；`scale` 待 imedtac UI 確認。 |
| `client_event.input_mode` | MVP 必要 | 六月固定 `touch`。 |
| `client_event.answered_at` | MVP 建議 | rehearsal log 與 timing debug 需要。 |

## Staff-Review Summary

| Field | Scope | 判斷 |
| --- | --- | --- |
| `summary_visibility` | MVP 必要 | 控制 summary 顯示對象。 |
| `handoff_required` | MVP 必要 | demo summary 明確進入 staff-review workflow。 |
| `handoff_reason_codes` | MVP 建議 | MVP 可先使用少數固定 codes；完整 API 用於 routing / analytics。 |
| `staff_review_summary.format` | MVP 建議 | MVP 可固定；完整 API 用於多 summary template。 |
| `staff_review_summary.subjective` | MVP 必要 | staff summary 的核心內容。 |
| `staff_review_summary.objective` | MVP 必要 | vital-aware demo 的核心內容。 |
| `staff_review_summary.review_basis` | MVP 必要 | 整理 vital + answer 的 review basis。 |
| `staff_review_summary.review_action` | MVP 必要 | 提供 staff-review workflow cue。 |
| `staff_review_summary.staff_handoff_note` | MVP 必要 | demo preview 可直接顯示的短句。 |
| `staff_review_summary.scope_controls` | MVP 必要 | 對外 demo 文件與 API payload 的 scope-control 欄位。 |

## Error / Fallback

| Field | Scope | 判斷 |
| --- | --- | --- |
| `status` | MVP 必要 | iMVS 依此進入 error / fallback handling。 |
| `error.code` | MVP 必要 | 最小 error contract。 |
| `error.message` | MVP 必要 | rehearsal debug 與 fallback 顯示需要。 |
| `error.retryable` | MVP 建議 | MVP 可先固定常見 error 的 retry rule。 |
| `fallback.recommended_mode` | MVP 必要 | demo continuity 需要。 |
| `demo_boundary` | MVP 必要 | fallback 時仍維持相同 operating scope。 |
