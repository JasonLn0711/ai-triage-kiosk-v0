---
id: 2026-05-21-imedtac-two-endpoint-api-reply
title: "iMVS / NYCU AI Triage Demo 兩個 Endpoint API 回覆文件"
date: 2026-05-21
topic: ai-triage
type: handoff
status: external-ready-draft
audience: Ben Siu, Lauren Wang, Johnny Fang, and imedtac engineering team
source:
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ./2026-05-21-imvs-nycu-api-design-v0.2-draft.md
  - ./api-examples/
---

# iMVS / NYCU AI Triage Demo 兩個 Endpoint API 回覆文件

Ben、Lauren、Johnny 大家好：

依照今天會議後確認的方向，NYCU 端建議六月 customer demo 第一版採用
`post_measurement_only` 的兩個 endpoint API contract。這個版本的目標是讓
慧誠智醫（imedtac Co., Ltd.）的 iMVS 先完成 vital-sign measurement，再把
measured vital payload 傳給 NYCU API，由 NYCU 回傳結構化問題與
`staff_review_summary`，供 demo preview / staff-review workflow 使用。

本文正文以台灣使用的繁體中文書寫；API 欄位名稱、HTTP method、URL path、
JSON key、enum value 與範例 payload 會保留英文，避免工程串接時產生欄位
歧義。

此 API contract 是 synthetic-data demo / product capability demo 的工程整合
文件，不是正式臨床診斷、治療建議、最終檢傷等級、HIS / EMR / FHIR 寫回或
production patient-data flow。

## 六月 Demo 確認流程

```text
iMVS 使用者登入 / demo case 開始
-> iMVS 完成 vital-sign measurement
-> iMVS 呼叫 NYCU Endpoint 1，送出 measured vital payload
-> NYCU 回傳 session_key + 第一題 question object
-> iMVS 顯示 single-choice / multi-choice question
-> iMVS 呼叫 NYCU Endpoint 2，送出 session_key + answer
-> NYCU 回傳下一題 question object 或 staff_review_summary
-> imedtac UI 顯示 staff / doctor / customer demo preview
```

六月預設值：

| 欄位 | 六月預設值 | 定義 |
| --- | --- | --- |
| `workflow_mode` | `post_measurement_only` | 表示本次 demo 使用「先完成量測、再開始問答」的流程模式。 |
| `measurement_state` | `complete` | 表示 iMVS 呼叫 NYCU API 時，vital-sign measurement 已經完成。 |
| `vitals_ready` | `true` | 表示 request 內已包含可供 demo 問答流程使用的 vital payload。 |
| `question_phase` | 問題回覆用 `post_measurement_intake`；最終摘要用 `summary` | 標示目前回覆屬於量測後問答階段，或已經進入摘要階段。 |
| `voice_input` | `false` | 表示六月 critical path 不納入語音輸入；先以觸控選項題為主。 |
| `question.type` | `single_choice`、`multi_choice`；`scale` 需待 imedtac UI 確認 | 定義 iMVS 需要使用哪一種 UI template 顯示問題。 |

## Endpoint 清單

### Endpoint 1：Start Session With Measured Vitals

```http
POST /api/triage-demo/sessions
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

用途：

- iMVS 在 vital-sign measurement 完成後呼叫此 endpoint。
- request 內包含 measured 或 synthetic demo vital payload。
- NYCU 建立 demo session，並回傳 `session_key` 與第一題 question object。

### Endpoint 2：Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

用途：

- iMVS 對同一個 active session 送出單題答案。
- NYCU 回傳下一題 question object，或在問答完成後回傳最終
  `staff_review_summary`。

原先獨立的 vitals-ready endpoint 不列為六月 demo integration 必要條件。若
雙方未來重新開啟「量測中先問 Phase 1、量測完成後再問 Phase 2」的 two-phase
workflow，該 endpoint 可以作為 future optimized mode 再納入。

## 問答集變更與 API Contract Change-Control

NYCU 建議六月先 freeze 兩個 endpoint 的 shape。多寶 / 許醫師後續若調整題目、
選項、題目順序、必答規則或 `staff_review_summary` wording，會透過下列版本欄位
管理，不會要求 imedtac 重新串接 endpoint：

- `flow_version`
- `case_version`
- `fixture_version`
- `question_set_version`
- `wording_version`

真正需要更新 API schema 的情況，主要是：

- 新增目前未支援的題型，例如 free text、voice input 或尚未確認的 `scale`；
- 改變 answer payload，例如需要 explicit skip button、`skip_reason` 或其他
  answer metadata；
- 新增 early handoff / stop behavior，需要更明確的 `handoff_required`、
  `handoff_reason_codes`、`session_state` 或 `next_action`；
- imedtac UI template 能力與目前假設不同，例如固定 option count、無法顯示
  progress，或單題選項 / label 長度限制更嚴格；
- vital payload field dictionary 與目前 draft shape 不相容。

因此，題庫與 wording 可以持續臨床審查；endpoint 串接則可先依照本文兩個
endpoint 進行。

## Endpoint 1 Request

必填 request 欄位：

| 欄位 | 型別 | 必填 | 定義 |
| --- | --- | --- | --- |
| `api_version` | string | yes | 本次 API contract 的版本識別碼；目前 draft 值為 `2026-05-22-demo-v0.2-draft`。 |
| `schema_version` | string | yes | request / response JSON schema 的版本識別碼；目前 draft 值為 `imvs-nycu-triage-demo-schema-v0.2-draft`。 |
| `flow_version` | string | yes | 問答流程版本，用來區分不同 demo lane；例如 `tachycardia-live-demo-flow-v0.2-draft` 或 `respiratory-early-handoff-flow-v0.2-draft`。 |
| `case_id` | string | yes | synthetic demo case 的識別碼；不可使用真實 encounter id 或病歷識別碼。 |
| `case_version` | string | yes | synthetic case 內容版本；用來追蹤同一個 `case_id` 的內容是否有更新。 |
| `fixture_version` | string | yes | demo fixture 版本；用來追蹤範例 vital payload / answer path / expected output 的版本。 |
| `question_set_version` | string | yes | 問題清單、問題順序、問題文字與 option mapping 的版本。 |
| `wording_version` | string | yes | `staff_review_summary` 顯示文字與安全邊界 wording 的版本。 |
| `request_id` | string | yes | iMVS 端產生的單次 request 追蹤識別碼，用於 log、debug 與雙方對帳。 |
| `idempotency_key` | string | yes | 防止 retry 造成重複建立 session 或重複推進流程的冪等鍵。 |
| `workflow_mode` | string | yes | demo workflow 模式；六月必須為 `post_measurement_only`。 |
| `measurement_state` | string | yes | vital-sign measurement 的狀態；六月呼叫此 endpoint 時必須為 `complete`。 |
| `vitals_ready` | boolean | yes | 是否已提供可使用的 vital payload；六月呼叫此 endpoint 時必須為 `true`。 |
| `client.source` | string | yes | 呼叫來源識別，例如 `imvs-demo`；用來區分不同前端、設備或 demo client。 |
| `client.locale` | string | yes | 前端顯示語系，例如 `en-US`；六月美國客戶 demo 建議使用英文顯示。 |
| `patient_context.demo_patient_id` | string | yes | demo-only patient id；只能用 synthetic/demo id，不可送 MRN、身分證字號、姓名、電話或真實病歷資料。 |
| `patient_context.age` | number | no | synthetic demo 年齡；只供 demo case 情境使用。 |
| `patient_context.sex` | string | no | synthetic demo 生理性別或情境性別；只供 demo case 情境使用。 |
| `vitals` | object | yes | iMVS 量測完成後送給 NYCU 的 measured 或 synthetic vital payload。 |
| `capabilities.question_types` | array | yes | iMVS UI 支援的題型清單；六月建議先使用 `["single_choice", "multi_choice"]`。 |
| `capabilities.max_questions` | number | yes | 此 session 最多可顯示的病人端問題數；六月建議 hard cap 為 `7` 題以內。 |
| `capabilities.max_options_per_question` | number | ask imedtac | iMVS 單題最多可清楚顯示幾個選項；需要 imedtac 確認以避免畫面過長或需要滑動。 |
| `capabilities.max_option_label_length` | number | ask imedtac | 單一選項 label 最長可接受字元數；需要 imedtac 確認以避免 kiosk 畫面 overflow。 |
| `capabilities.variable_option_count` | boolean | ask imedtac | iMVS 是否允許每一題有不同選項數量；若不允許，NYCU 需固定 option count。 |
| `capabilities.voice_input` | boolean | yes | 本次 session 是否支援語音輸入；六月 critical path 建議固定為 `false`。 |

Vital payload 最小欄位結構：

| 欄位 | 型別 | 定義 |
| --- | --- | --- |
| `vitals.measurement_timestamp` | string | iMVS 完成量測的時間戳，建議使用 ISO 8601 格式。 |
| `vitals.device_id` | string | demo device identifier；用來識別設備，不可作為病人識別碼。 |
| `vitals.<field>.value` | number/null | 單一 vital 欄位的量測值；若 unavailable、failed 或不適用，可為 `null`。 |
| `vitals.<field>.unit` | string | 單位；例如 `%`、`C`、`mmHg`、`beats/min`、`cm`、`kg`。 |
| `vitals.<field>.measurement_status` | string | 此 vital 欄位的量測狀態；可用值建議為 `measured`、`missing`、`failed`、`manual_entry`、`not_available`。 |
| `vitals.<field>.quality_flag` | string | 此 vital 欄位的品質旗標；可用值建議為 `ok`、`needs_review`、`device_error`、`out_of_range_demo`、`unknown`。 |
| `vitals.<field>.missing_reason` | string/null | 當 `value` 缺漏或量測失敗時，說明缺漏原因；若正常量測則可為 `null`。 |

Endpoint 1 request 範例：

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "request_id": "req-demo-start-001",
  "idempotency_key": "idem-demo-start-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "client": {
    "source": "imvs-demo",
    "locale": "en-US"
  },
  "patient_context": {
    "demo_patient_id": "DEMO-TACHY-001",
    "age": 45,
    "sex": "male",
    "identity_mode": "demo"
  },
  "vitals": {
    "measurement_timestamp": "2026-05-21T10:01:00+08:00",
    "device_id": "IMVS-DEMO-001",
    "heart_rate_bpm": {
      "value": 118,
      "unit": "beats/min",
      "measurement_status": "measured",
      "quality_flag": "needs_review",
      "missing_reason": null
    },
    "spo2_percent": {
      "value": 97,
      "unit": "%",
      "measurement_status": "measured",
      "quality_flag": "ok",
      "missing_reason": null
    }
  },
  "capabilities": {
    "question_types": ["single_choice", "multi_choice"],
    "max_questions": 7,
    "max_options_per_question": 4,
    "max_option_label_length": 48,
    "variable_option_count": true,
    "voice_input": false
  }
}
```

## Endpoint 1 Response

NYCU 回傳 session 與第一題 typed question：

| 欄位 | 型別 | 必填 | 定義 |
| --- | --- | --- | --- |
| `session_key` | string | yes | NYCU 產生的 session key；iMVS 在 Endpoint 2 後續每次送 answer 時都要帶回。 |
| `request_id` | string | yes | 回傳 iMVS 原本送出的 `request_id`，方便雙方 trace。 |
| `response_id` | string | yes | NYCU 端產生的 response id，用於 debug、log 與問題追蹤。 |
| `session_expires_at` | string | yes | demo session 的到期時間；超過後應視為 expired 或重新開始。 |
| `session_state` | string | yes | session 狀態；可用值建議為 `active`、`summary_ready`、`expired`、`abandoned`、`error`。 |
| `last_question_id` | string/null | yes | 最近已送出或已回答的 question id；第一題前可為 `null`。 |
| `status` | string | yes | 此 response 類型；可為 `question` 或 `summary`，Endpoint 1 正常情況會是 `question`。 |
| `workflow_mode` | string | yes | 回傳本 session 使用的 workflow mode；六月應為 `post_measurement_only`。 |
| `measurement_state` | string | yes | 回傳目前 measurement state；六月應為 `complete`。 |
| `vitals_ready` | boolean | yes | 回傳目前是否已有可使用的 vital payload；六月應為 `true`。 |
| `question_phase` | string | yes | 目前問題階段；六月量測後問答使用 `post_measurement_intake`。 |
| `phase_reason` | string | yes | 簡短說明為什麼此題可以在目前階段顯示。 |
| `progress.current` | number | yes | 目前顯示到第幾題，用於 iMVS UI progress display。 |
| `progress.expected_total` | number | yes | 預估總題數；動態流程可為估計值，但應維持在 demo 題數上限內。 |
| `question` | object | yes when `status=question` | NYCU 回傳給 iMVS 顯示的 typed question object。 |
| `demo_boundary` | string | yes | 明確標示此 response 為 synthetic-data demo，不是正式臨床輸出。 |

Question object 最小欄位結構：

| 欄位 | 型別 | 必填 | 定義 |
| --- | --- | --- | --- |
| `question.id` | string | yes | 穩定的 runtime question id；iMVS 回答時以此值作為 `question_id`。 |
| `question.registry_refs` | array | yes | 對應到 NYCU 內部 question registry 的來源 id；用於 trace 問題來源與版本。 |
| `question.source_refs` | array | yes | 支援此問題的來源或 review source id；可先使用待審核來源代碼。 |
| `question.evidence_status` | string | yes | 此問題目前的 evidence / review 狀態；例如 `clinician-signoff-needed`。 |
| `question.review_owner` | string | yes | 此題 wording / clinical review 的負責角色或待確認 owner。 |
| `question.type` | string | yes | UI 題型；六月建議使用 `single_choice` 或 `multi_choice`。 |
| `question.ui_template` | string | yes | iMVS 應使用的 UI template；通常與 `question.type` 相同。 |
| `question.text` | string | yes | 顯示給使用者看的題目文字。 |
| `question.options` | array | yes | 選項清單；每個 option 應包含穩定 `id` 與顯示 `label`。 |
| `question.option_count` | number | yes | 此題實際選項數量；讓 iMVS 可驗證是否超過 UI 容量。 |
| `question.none_option_id` | string/null | no | 若此題有互斥的「none / none of these」選項，填入該 option id；沒有則為 `null`。 |
| `question.rendering_constraints.requires_no_scroll` | boolean | no | 是否要求此題盡量不需捲動即可顯示完整內容；六月 demo 建議為 `true`。 |
| `question.rendering_constraints.max_visible_options_without_scroll` | number | no | iMVS 不捲動時可顯示的最大選項數；需要 imedtac 確認。 |

## Endpoint 2 Request

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
```

必填 request 欄位：

| 欄位 | 型別 | 必填 | 定義 |
| --- | --- | --- | --- |
| `api_version` | string | yes | 本次 API contract 的版本識別碼；需與 Endpoint 1 使用的版本相容。 |
| `schema_version` | string | yes | request / response JSON schema 的版本識別碼；需與 Endpoint 1 使用的版本相容。 |
| `flow_version` | string | yes | 目前 active demo flow 的版本；應與 Endpoint 1 啟動 session 時一致。 |
| `case_id` | string | yes | synthetic demo case 的識別碼；應與 Endpoint 1 啟動 session 時一致。 |
| `request_id` | string | yes | iMVS 端產生的單次 answer submission 追蹤識別碼。 |
| `idempotency_key` | string | yes | 防止 retry 造成同一題答案被重複處理、導致 question flow 前進兩次的冪等鍵。 |
| `session_key` | string | yes | Endpoint 1 回傳的 session key；用來讓 NYCU 找到對應 session state。 |
| `workflow_mode` | string | yes | 此 session 使用的 workflow mode；六月應為 `post_measurement_only`。 |
| `measurement_state` | string | yes | measurement state；六月送 answer 時應維持 `complete`。 |
| `vitals_ready` | boolean | yes | 是否已有可使用的 vital payload；六月送 answer 時應維持 `true`。 |
| `question_phase` | string | yes | 正在回答的問題階段；六月多數情況為 `post_measurement_intake`。 |
| `question_id` | string | yes | 使用者正在回答的 question id；應等於 NYCU 前一個 response 的 `question.id`。 |
| `answer.selected_option_ids` | array | yes for choice questions | 使用者選取的 option id 清單；單選題通常只有一個 id，複選題可有多個 id。 |
| `answer.scale_value` | number/null | no | 若題型為 `scale`，填入使用者選擇的數值；若不是 scale 題型則為 `null`。 |
| `client_event.input_mode` | string | yes | 使用者輸入模式；六月建議為 `touch`。 |
| `client_event.answered_at` | string | no | 使用者完成回答的時間戳，建議使用 ISO 8601 格式。 |

Endpoint 2 request 範例：

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "request_id": "req-demo-answer-001",
  "idempotency_key": "idem-demo-answer-001",
  "session_key": "demo-session-tachy-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "question_phase": "post_measurement_intake",
  "question_id": "chief-concern",
  "answer": {
    "selected_option_ids": ["chest_discomfort"],
    "scale_value": null
  },
  "client_event": {
    "input_mode": "touch",
    "answered_at": "2026-05-21T10:02:00+08:00"
  }
}
```

## Endpoint 2 Response

NYCU 會回傳兩種 response 類型之一。

### A. 下一題 question object

```json
{
  "status": "question",
  "session_key": "demo-session-tachy-001",
  "session_state": "active",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "question_phase": "post_measurement_intake",
  "progress": {
    "current": 2,
    "expected_total": 5
  },
  "question": {
    "id": "chest-pain-pressure",
    "type": "single_choice",
    "ui_template": "single_choice",
    "text": "Are you having chest pain or pressure right now?",
    "options": [
      {"id": "yes", "label": "Yes"},
      {"id": "no", "label": "No"},
      {"id": "not_sure", "label": "Not sure"}
    ],
    "option_count": 3
  }
}
```

### B. Staff-review summary

```json
{
  "status": "summary",
  "session_key": "demo-session-tachy-001",
  "session_state": "summary_ready",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "question_phase": "summary",
  "summary_visibility": "staff_only",
  "handoff_required": true,
  "handoff_reason_codes": ["vital_review", "reported_symptoms_review"],
  "staff_review_summary": {
    "format": "review_summary_demo",
    "subjective": [
      "Synthetic demo patient selected chest discomfort."
    ],
    "objective": [
      "Measured heart rate is available in the demo vital payload."
    ],
    "review_basis": [
      "Measured vitals and reported symptoms should be reviewed by staff."
    ],
    "review_action": [
      "Please review measured vitals and reported symptoms."
    ],
    "staff_handoff_note": "Please review measured vitals and reported symptoms.",
    "not_claimed": [
      "No diagnosis",
      "No final triage level",
      "No treatment recommendation",
      "No production HIS/EMR writeback"
    ]
  }
}
```

Staff-review summary 欄位定義：

| 欄位 | 型別 | 必填 | 定義 |
| --- | --- | --- | --- |
| `summary_visibility` | string | yes | 摘要可見範圍；六月 demo 建議為 `staff_only`，表示給 staff / doctor / customer preview，不作為病人自我判讀結論。 |
| `handoff_required` | boolean | yes | 是否需要 human review / staff handoff；demo case 若有需要人工確認的 vital 或 symptom context，應為 `true`。 |
| `handoff_reason_codes` | array | yes | 需要人工 review 的機器可讀理由代碼，例如 `vital_review`、`reported_symptoms_review`。 |
| `staff_review_summary.format` | string | yes | 摘要格式版本或格式名稱；目前建議為 `review_summary_demo`。 |
| `staff_review_summary.subjective` | array | yes | 使用者回報的主觀資訊，例如主訴、症狀、使用者選項。 |
| `staff_review_summary.objective` | array | yes | iMVS 量測到的客觀資訊，例如 heart rate、SpO2、temperature 等 vital payload 摘要。 |
| `staff_review_summary.review_basis` | array | yes | 支援 staff review 的資訊依據；不是 SOAP Assessment，也不是診斷結論。 |
| `staff_review_summary.review_action` | array | yes | 給 staff 的 review reminder；不是 treatment plan 或醫囑。 |
| `staff_review_summary.staff_handoff_note` | string | yes | 給 staff / doctor preview 的短句，提醒檢視量測數值與使用者回報症狀。 |
| `staff_review_summary.not_claimed` | array | yes | 明確列出本 demo 不主張的事項，例如不診斷、不給最終檢傷等級、不建議治療、不寫回正式 HIS / EMR。 |

## Retry 與 Idempotency

使用 `request_id` 做 trace，使用 `idempotency_key` 處理安全 retry。

必要行為：

```text
Same endpoint + same session_key when applicable + same idempotency_key + same
request body -> return the same result and do not advance the question flow
twice.
```

若相同 `idempotency_key` 搭配實質不同 request body，NYCU 應回傳
`error.code = "idempotency_conflict"`，且不推進 session。

## Error 與 Fallback 行為

Error response 不應產生假的臨床摘要，也不應在資料不足時自行補出診斷或檢傷結論。

建議 error 欄位：

| 欄位 | 定義 |
| --- | --- |
| `status` | response 類型；error response 固定為 `error`。 |
| `error.code` | 穩定的 machine-readable error code，供 iMVS 判斷錯誤類型。 |
| `error.message` | 短的工程可讀錯誤訊息，供 debug 或 UI fallback 使用。 |
| `error.retryable` | 此錯誤是否建議 retry；`true` 表示可安全重試，`false` 表示應改走 fallback 或人工流程。 |
| `fallback.recommended_mode` | 建議 fallback 模式；可為 `standard_staff_workflow`、`local_scripted_demo` 或 `retry_remote_api`。 |
| `demo_boundary` | 說明此 error / fallback 仍在 demo-only 邊界內，不代表正式臨床流程。 |

若 rehearsal 或 customer demo 時 NYCU remote API 暫時不可用，imedtac UI 可切換到
Local Scripted Demo Mode 以維持 demo continuity。此模式需在內部與必要畫面上清楚
標示，不應被解讀為 live API behavior。

## 使用者答不出來 / Skip 行為

此點仍需 NYCU 與臨床 reviewer 討論後確認。

目前工程建議如下：

- 對 required safety 或 handoff 問題，不建議使用 silent generic skip。
- 若使用者可能不知道答案，建議在選項中明確提供 `Not sure` 或
  `Unable to answer`。
- 若 imedtac UI 需要對非 critical 問題提供真正的 skip interaction，API 應明確
  表示該題被 skip，而不是把它當成資料遺漏：

```json
{
  "answer": {
    "selected_option_ids": [],
    "scale_value": null,
    "skipped": true,
    "skip_reason": "user_unable_to_answer"
  }
}
```

NYCU 會在與多寶 / 許醫師討論後，確認哪些題目必答、哪些題目可以提供
`Not sure` / `Unable to answer`，以及哪些題目可以允許真正 skip。

## 需要 imedtac 提供的資訊

為了 freeze API examples 並避免 NYCU 猜測欄位名稱，NYCU 需要 imedtac 提供以下資訊。

1. Vital Upload API field dictionary
   - 實際 field names；
   - units；
   - required / optional 狀態；
   - missing / failed / poor-quality value 的表示方式；
   - blood pressure 結構；
   - respiratory rate 是量測值、手動輸入值，或本次 demo 不提供。

2. iMVS question-rendering limits
   - 支援哪些 question templates；
   - 不捲動時最多可顯示幾個 options；
   - option label 最長可接受多少字元；
   - 每題 option count 是否可以不同；
   - 是否可 render `progress`、`ui_template`、`option_count` 與 answer constraints。

3. Demo environment
   - NYCU API 預期 base URL / deployment path；
   - iMVS browser UI 是直接呼叫 NYCU API，或透過 imedtac backend 呼叫；
   - CORS / firewall / VPN 限制；
   - demo bearer token 或 shared token 是否可接受。

4. Demo preview page
   - `staff_review_summary` 顯示在哪一頁；
   - preview 是否僅供 staff / doctor / customer demo preview；
   - patient-facing UI 是否需要隱藏 summary。

## 交付規劃

NYCU 可先提供：

- 本兩個 endpoint API 文件；
- start-session、answer submission、next-question、summary、error response
  的 JSON examples；
- 多寶 / 許醫師 wording review 後的第一版 preset question / option template；
- 臨床 review 後的 skip-behavior 建議。

此 API schema 不綁定單一 case。相同兩個 endpoints 可以支援 tachycardia
live-performance lane 與 respiratory synthetic lane；需要替換的是 `flow_version`、
`case_id`、question set 與 summary wording。
