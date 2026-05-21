---
id: 2026-05-21-imedtac-meeting-q-and-a
title: "imedtac 2026-05-21 Meeting Classified Q&A"
date: 2026-05-21
topic: ai-triage
type: handoff
status: draft
audience: NYCU meeting presenter
source:
  - ./2026-05-15-imedtac-anticipated-q-and-a-zh-TW.md
  - ./2026-05-21-imedtac-engineering-sync-prep.md
  - ./2026-05-21-decision-defaults-and-owner-matrix.md
  - ./2026-05-21-imvs-nycu-api-design-v0.2-draft.md
  - ../source/2026-05-15-imedtac-second-sync-and-duobao-followup/company-provided-meeting-minutes.md
  - ../source/2026-05-19-johnny-ai-triage-product-spec/source.md
  - ../source/2026-05-19-johnny-line-thursday-engineering-sync/source.md
  - ../source/2026-05-19-johnny-direct-line-thursday-engineering-sync/source.md
  - ../source/2026-05-20-imedtac-personal-pre-meeting-note/AI-Triage_imedtac_Pre-Meeting_Pre-Read_2026-05-21.md
  - ../source/2026-05-15-imedtac-second-sync-and-duobao-followup/pre-sync-thread-snapshot-2026-05-21.md
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
---

# imedtac 2026-05-21 Meeting Classified Q&A

## Purpose

This Q&A is the classified response sheet for the `2026-05-21` imedtac
engineering sync. It consolidates earlier anticipated Q&A, the 5/21 engineering
prep, the owner matrix, the API v0.2 draft, and the personal pre-meeting notes.
The `2026-05-21 09:50` Gmail thread snapshot confirms that Johnny added Ben Siu
from imedtac engineering before the sync, so route payload, UI/API, session, and
fallback details to Ben when the meeting moves from product framing into
implementation decisions.

Use this as a speaking aid. It is not a clinical protocol, production API
specification, regulatory submission, or customer-facing claim sheet.

Post-sync note: this file remains useful as the pre-meeting classified answer
bank, but the `2026-05-21` sync closed several items. The June default is now
post-measurement-only, Endpoint 1/3 merge for June, voice out of scope, and
product wording centered on `vital-aware intake support` /
`staff_review_summary` rather than final clinical triage.

## Core Position

Recommended opening:

```text
六月 demo 的主線是 synthetic-data vital-aware intake support workflow。
正常路徑是 Remote REST API Mode：iMVS 先完成 vital measurement，
再把 measured vital payload 送給 NYCU，NYCU 回 session_key、typed questions
與 staff_review_summary。
備援路徑是 Local Scripted Demo Mode，只用於 demo continuity，必須清楚標示不是 live AI API mode。
```

Fixed boundary:

```text
No diagnosis.
No treatment advice.
No final triage / acuity level.
No real patient identifiers.
No production HIS / EMR / FHIR writeback.
Human review remains the final decision point.
```

## imedtac Pre-Meeting Question Index

Use this table to avoid missing explicit questions from 慧誠智醫's meeting
materials. `Explicit` means 慧誠 asked or assigned it directly in the 5/15
minutes, 5/19 product-spec email, or 5/19 LINE sync request. `Spec-derived`
means the product spec states an acceptance expectation that NYCU must answer
through design.

| Source prompt from imedtac | Status | Current NYCU answer | Why this answer | Where answered |
| --- | --- | --- | --- | --- |
| `3-5` demo patient / injury cases and `AI 資料訓練 study`. | Explicit, 5/15 minutes | Start with one full respiratory loop, then expand to `3-5` synthetic cases; interpret `AI 資料訓練 study` as synthetic demo case / feasibility study, not real patient-data model training. | Keeps June scope feasible and avoids real patient-data governance, clinical validation, and model-training claims before approval. | Q3, Q35 |
| Touch-option interaction plus partial voice input; question count `8-10`. | Explicit, 5/15 minutes | Use touch / structured choices as the main flow; keep voice optional; current product-spec-aligned cap is `<8`, implemented as `max_questions=7`, while earlier `8-10` is treated as historical upper-bound context. | Touch choices are faster, safer, and easier to audit; the later product spec says fewer than eight questions; voice adds noise/privacy/error risk. | Q28, Q36 |
| Combine data and answers into a patient chief-complaint summary for doctors. | Explicit, 5/15 minutes | Output `staff_review_summary` / clinician-review summary, not diagnosis, final triage level, treatment advice, or production HIS writeback. | This preserves the useful doctor-facing summary while avoiding overclaiming clinical decision support. | Q21-Q24, Q41 |
| Provide technical architecture design. | Explicit, 5/15 minutes | Provide RESTful JSON API contract, endpoints, JSON examples, session behavior, fallback behavior, versioning, and deployment questions. | imedtac engineering needs a contract they can wire into UI/API work; framework details are secondary. | Q5-Q7, Q31-Q34 |
| Should iMVS upload vital sign data format to NYCU be discussed? | Explicit, 5/19 email | Yes. Freeze actual field names, units, required/optional semantics, missing/failure status, quality flags, timestamp, and demo device identifier. | Dynamic question routing depends on reliable vital payload meaning; missing/failed data must not become hidden medical inference. | Q11-Q13 |
| What question format should NYCU return: type, options, expected question count / AC07, session key? | Explicit, 5/19 email | Return typed `question` objects with `single_choice`, `multi_choice`, or `scale`, stable options, progress, registry/source refs where available, and `session_key`. | The iMVS UI needs deterministic rendering and state continuity; question count and progress are product-spec acceptance criteria. | Q5-Q8, Q34, Q39 |
| How should iMVS upload user answer plus session key, and how does NYCU return next question or diagnosis/output format? | Explicit, 5/19 email | iMVS posts answer + `session_key`; NYCU returns next question or `staff_review_summary`. Do not name output `diagnosis`; use `summary`, `review_basis`, `review_action`, and `staff_handoff_note`. | The loop matches imedtac's requested API shape while preserving the no-diagnosis / human-review boundary. | Q7-Q10, Q23, Q39 |
| When can NYCU provide the API design document? | Explicit, 5/19 LINE | Use the 5/20 pre-read and this Q&A as the meeting answer; offer Markdown API spec + JSON examples first, then OpenAPI / Postman / mock endpoint if imedtac engineering requests them. | It gives engineering a usable near-term contract without waiting for all future production details. | Q5, Q42 |
| Can progress be discussed on Thursday with imedtac engineering design team? | Explicit, 5/19 LINE | Yes. Treat 5/21 as engineering handoff / contract-freeze meeting, not broad brainstorming. | The meeting should close payload, session, UI insertion, environment, and ownership decisions. | Q4, Q5, Q43, closeout |
| Product spec triage standards and presentation logic were AI-discussed drafts and adjustable. | Explicit, 5/19 direct LINE | Treat spec clinical logic as negotiable input. Freeze API mechanics now; route clinical standards, stop rules, and wording to 多寶 / clinical review. | Prevents AI-drafted standards from becoming unreviewed clinical protocol. | Q21-Q25, Q44 |
| Grey-text HIS summary return path is not part of the June demo. | Explicit, 5/19 email | Do not implement production HIS / EMR / FHIR writeback in June; use demo staff-summary page and future-state placeholders only. | Production medical-record writeback creates governance, cybersecurity, access-control, and liability work outside June scope. | Q29 |
| Voice input depends on NYCU/Jason progress and needs discussion before demo inclusion. | Explicit, 5/19 email | Defer voice from the June critical path unless separately approved; if shown, use transcript confirmation and failover and never let raw ASR directly control medical logic. | Voice adds recognition, noise, privacy, microphone, and fallback risk; typed choices are enough to prove the main workflow. | Q28 |
| US06-US11: OPQRST dynamic questioning, progress, single choice, multi choice, scale. | Spec-derived, 5/19 product spec | Include deterministic dynamic question flow, progress display, `single_choice`, `multi_choice`, and `scale`; use `<8` visible questions. | These are explicit acceptance expectations and low-risk for June. | Q25, Q34, Q36, Q39 |
| US14: demo doctor sees AI result page. | Spec-derived, 5/19 product spec | Provide a staff/doctor review page or response with `staff_review_summary`, `summary_visibility=staff_only`, handoff reason codes, and no diagnosis. | Satisfies demo doctor view while preserving safety and human review. | Q23-Q24, Q41 |
| US15-US16: SOAP / evidence mapping / HIS-side decision support. | Spec-derived, future side | For June, show reviewer-only source placeholders and safe summary fields; defer production SOAP/HIS and full evidence mapping until clinical source governance is complete. | Evidence mapping matters, but unverified clinical references or production HIS writeback would overstate readiness. | Q23, Q29, Q41 |
| Section 4 User Flow: IT admin configuration, patient measurement/intake flow, and doctor/HIS view. | Spec-derived, required coverage | Include the three-lane flow as design input. June demo covers patient measurement/intake and demo doctor review; IT admin configuration and production HIS view are future-state / imedtac-owned unless explicitly scoped. | This preserves the product spec while keeping June API/demo scope realistic. | Q45 |
| Section 5 Constraints & Risks: visible non-diagnostic statement. | Spec-derived, required coverage | Include a visible demo boundary and non-diagnostic statement in API responses, UI copy, summary wording, and fallback/error behavior. | This is a required safety constraint and must be visible, not only implied in internal notes. | Q46 |

## A. Scope And Product Positioning

### Q1. 六月 demo 到底要展示什麼？

**Answer:**

六月 demo 展示一個最小可運作的 vital-aware intake loop：iMVS 提供合成或
iMVS-shaped vital payload，NYCU 回傳結構化動態問題，最後產生
`staff_review_summary` 給工作人員或臨床人員覆核。

**Imedtac pre-meeting prompt:** 慧誠 5/15 minutes 明確要求六月美國客戶
demo、`3-5` cases、綜合數據與回答後產出主訴摘要給醫生；5/19 email
進一步要求 iMVS/NYCU API loop。

**Why this answer:** 這是最小可整合閉環，能回答慧誠的 demo 需求，又不把
demo 說成正式 clinical triage product。

**What to avoid:**

```text
不要說我們已經完成正式 AI triage product。
不要說會產生診斷、治療建議或 final triage level。
```

### Q2. 這是不是 AI triage？

**Answer:**

對內可以說這是 AI triage demo lane；對外建議更精準地說：

```text
synthetic-data vital-aware intake support demo
AI-assisted staff-review intake workflow
```

這個 demo 支援人員覆核，不是 autonomous medical decision maker。

### Q3. 能不能做 3-5 個 cases？

**Answer:**

可以作為 roadmap，但工程主線要先完成一個 respiratory full loop。建議順序是：

1. 先完成 `fever + dyspnea + lower SpO2 context` 的完整 API / UI / summary loop。
2. 再擴充 additional fixtures。
3. 不為了案例數犧牲 primary integration path。

**Imedtac pre-meeting prompt:** 這是慧誠 5/15 meeting minutes 明確分配給
NYCU 的 action item：研究 `3-5` 個 demo 傷患案例。

**Why this answer:** `3-5` cases 是展示範圍，但第一個 full loop 是工程風險
控制；先打通一個 iMVS payload -> question -> summary，再擴案例才可靠。

### Q4. 六月 demo 成功的定義是什麼？

**Answer:**

```text
iMVS or mock iMVS-shaped vital payload enters NYCU intake engine;
the system produces structured follow-up questions based on answers and vital context;
the flow ends with a non-diagnostic staff_review_summary;
the UI preserves human review boundary;
local scripted fallback can continue the demo if remote API is unavailable.
```

## B. API Contract And Engineering Integration

### Q5. 還需要 API spec 嗎？

**Answer:**

需要。API spec 是六月 demo 的 primary integration contract。Fallback mode
只是 demo 風險控制，不是 API spec 的替代品。

API spec 至少要定義：

- endpoints;
- HTTP methods;
- JSON request / response;
- required / optional fields;
- field types and units;
- `session_key` rules;
- error behavior;
- timeout / retry / idempotency;
- deployment method.

**Imedtac pre-meeting prompt:** 5/19 LINE 明確說工程師會需要 API 設計文件，
並請 NYCU 回覆什麼時候可以提供；5/19 email 也列出 API 溝通需求。

**Why this answer:** API spec 是雙方工程對接的實際契約；沒有它，UI、payload、
session、錯誤處理都會各自假設。

### Q6. REST API、JSON、FastAPI 要怎麼說？

**Answer:**

```text
REST API 是對外溝通風格。
JSON 是雙方交換資料格式。
FastAPI 是 NYCU 端內部用來實作這組 RESTful JSON API 的 Python backend framework。
```

對方主要需要 API contract，不一定需要知道所有內部 framework 細節。但工程會議中可以簡短說：

```text
NYCU 端會先以 Python FastAPI 實作 RESTful JSON API，方便快速產生 OpenAPI / Swagger 文件並串接 intake logic。
```

### Q7. 最小 endpoint list 是什麼？

**Answer:**

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
POST /api/triage-demo/sessions/{session_key}/vitals
GET  /api/triage-demo/sessions/{session_key}/summary
```

If the team wants fewer calls, the answer / vitals endpoint can directly return
`status="summary"` with `staff_review_summary`.

**Imedtac pre-meeting prompt:** 5/19 email 明確問 NYCU 回傳問題格式，以及
iMVS 上傳回答 + `session_key` 後，NYCU 如何回下一題或輸出格式。

**Why this answer:** 這組 endpoint 把慧誠要求的三段 loop 拆成可測、可 debug、
可 fallback 的最小 contract。

### Q8. `session_key` 誰產生？

**Answer:**

NYCU 建議由 NYCU API 產生 `session_key`，iMVS 後續 echo 回來。原因是
dynamic question state、Phase 1 / Phase 2 state、answer history、retry /
idempotency handling 都在 NYCU demo engine 端。

**Imedtac pre-meeting prompt:** 5/19 email 明確把 `session key` 列入 NYCU
回傳問題格式與後續 answer loop 的討論項。

**Why this answer:** 讓 question engine 和 session state 在同一端，能降低
兩邊 state 不同步、retry 跳題、summary 重複產生的風險。

Fallback if not accepted:

```text
若 imedtac 要產生 encounter/session id，需要提供 id format、expiry rule、restart behavior 與 retry semantics。
```

### Q9. Retry 會不會讓 question loop 跳題？

**Answer:**

使用 `request_id` + `idempotency_key`。同一個 idempotency key 重送時，
NYCU API 應回同一個結果，不讓流程前進兩次。

### Q10. session 多久過期？

**Answer:**

Demo 建議 `15-30` 分鐘。過期後回 `session_expired` 或 `invalid_session`，
不產生 summary，並讓 UI restart 或切 fallback。

## C. Payload, Vitals, And Missing Data

### Q11. iMVS vital payload 需要確認什麼？

**Answer:**

需要 imedtac engineering 確認：

- actual field names;
- units;
- required vs optional;
- missing / failed / re-measured representation;
- per-vital `measurement_status`;
- per-vital `quality_flag`;
- `missing_reason`;
- timestamp and device identifier semantics.

**Imedtac pre-meeting prompt:** 5/19 email 明確問 `iMVS 上傳 vital sign data
到陽交大的格式是否需要討論?`

**Why this answer:** vital payload 是 demo 的核心差異化資料；欄位、單位、
缺值與品質語意不清楚時，NYCU 不能安全地做 vital-aware routing。

### Q12. Vitals 欄位建議 flat 還是 nested？

**Answer:**

建議 nested per-vital object：

```json
{
  "spo2": {
    "value": 92,
    "unit": "%",
    "measurement_status": "measured",
    "quality_flag": "needs_review",
    "missing_reason": null
  }
}
```

這比只有 `"spo2": 92` 更清楚，因為單位、品質、缺值語意都在欄位內。

### Q13. 如果 vital sign 壞掉或缺資料怎麼辦？

**Answer:**

把 vital signs 視為 optional-but-important input。若 vital missing、failed
或 quality flag abnormal，系統不硬做推論，而是走 non-vital-dependent
question flow，並在 summary 標記：

```text
vital unavailable
measurement requires confirmation
```

Core phrase:

```text
缺資料時，不推論；只標記。
```

## D. UI Integration And Demo Environment

### Q14. AI step 放在 iMVS 哪裡？

**Answer:**

需要 imedtac 決定 UI insertion point。建議會中收斂到其中一種：

- same app;
- iframe;
- external link;
- backend API only;
- laptop-adjacent demo;
- static/local scripted mock.

**Imedtac pre-meeting prompt:** 5/15 meeting record 與 minutes 都指向下一步
技術端對接；慧誠需提供流程 / spec 規劃與 UI/技術設計修改。

**Why this answer:** NYCU 可以提供 API and question engine，但 AI step 放在
iMVS 哪個 UI 位置只能由慧誠 engineering / UI team 決定。

### Q15. Two-phase flow 是什麼？

**Answer:**

```text
Phase 1: measurement in progress, ask non-vital-dependent intake questions.
Phase 2: after vitals-ready event, ask vital-aware follow-up questions.
```

If this disrupts measurement posture or signal quality, use post-measurement-only flow.

### Q16. Demo 當天怎麼部署？

**Answer:**

Recommended primary path:

```text
iMVS UI -> HTTPS demo URL -> NYCU FastAPI backend -> intake engine -> summary
```

Recommended risk control:

```text
If external HTTPS / tunnel / backend is unavailable, switch to local scripted fallback.
```

Need to confirm:

- stable internet;
- firewall / VPN / CORS limits;
- whether browser frontend or backend calls NYCU API;
- who starts backend;
- who monitors logs;
- who decides failover.

## E. Fallback / Degraded Demo Mode

### Q17. 如果 API 臨時掛掉怎麼辦？

**Answer:**

六月 demo 分兩層：

```text
Primary: kiosk UI calls NYCU API for live session-based dynamic intake.
Fallback: UI switches to local preloaded scripted demo flow.
```

This fallback is a demo resilience mechanism, not the production architecture.

Core phrase:

```text
Fallback 是展示穩定性設計，不是臨床正式使用設計。
```

### Q18. Local fallback 會不會讓人誤會成 live AI?

**Answer:**

必須明確標記：

```text
Local Scripted Demo Mode
Scripted synthetic flow
Not live API mode
```

Suggested response/log fields:

```json
{
  "execution_mode": "local_scripted_demo",
  "fallback_used": true,
  "fallback_reason": "remote_api_timeout"
}
```

### Q19. Local fallback 要誰實作？

**Answer:**

建議 iMVS UI 端實作 local scripted fallback，NYCU 提供：

- fixed synthetic respiratory case JSON;
- scripted question flow;
- scripted staff_review_summary;
- execution-mode labels;
- fallback reason codes.

### Q20. 是否需要 demo kill switch？

**Answer:**

需要。至少要有：

```text
Restart demo session
Switch to Local Scripted Demo Mode
Clear current session
Return to Live API Mode
```

This is a demo reliability control, not feature creep.

## F. Clinical Boundary And Summary Wording

### Q21. 你們根據什麼判斷 SpO2 偏低？

**Answer:**

六月不要宣稱正式 clinical threshold。建議說：

```text
measured oxygen level is included in staff review context
```

Exact thresholds and wording require clinical owner signoff.

### Q22. 如果漏掉危險訊號怎麼辦？

**Answer:**

The system is not a final triage decision maker. If red-flag context appears,
the system should raise a staff-review handoff cue, not diagnose.

Core phrase:

```text
Red flag 的責任不是讓 AI 判斷疾病，而是讓資訊不要被安靜地埋掉。
```

### Q23. Summary wording 會不會誤導醫師？

**Answer:**

Use observed-data and staff-review wording only:

```text
patient reports dyspnea
SpO2 value received
staff review recommended
```

Avoid:

```text
diagnosis
assessment_support
plan_support
triage_level
acuity_score
likely pneumonia
needs emergency treatment
safe to go home
```

Use:

```text
staff_review_summary
review_basis
review_action
staff_handoff_note
summary_visibility: staff_only
```

### Q24. 病人會看到 summary 嗎？

**Answer:**

Recommended: no. The summary should be `staff_only`. If imedtac needs a
patient-facing display, create a separate patient-safe wording layer after
clinical review.

## G. AI Behavior, Question Logic, And Robustness

### Q25. 如果 AI 問錯問題怎麼辦？

**Answer:**

June demo uses structured / rule-constrained flow. Patient-facing questions are
selected from reviewed question bank logic, not freely generated by a model.

Recommended wording:

```text
問題不是 AI 亂想的，而是從受控規則和預先審查過的 question bank 選出來。
```

### Q26. Prompt injection 怎麼辦？

**Answer:**

Avoid free text as the main control signal in June. Use choice-based structured
input. If ASR or free text is added later, treat it as supplemental notes, not
direct control of medical logic.

### Q27. 病人亂按、答案不一致、中途停止怎麼辦？

**Answer:**

Support partial completion and staff confirmation:

```json
{
  "completion_status": "partial",
  "requires_staff_confirmation": true
}
```

Do not amplify uncertain data into conclusions. Mark it for staff review.

## H. ASR, HIS / EMR, And Future Scope

### Q28. 為什麼六月不做 ASR？

**Answer:**

ASR is valuable, but it adds recognition error, noise handling, language
support, raw-audio privacy, transcript confirmation, microphone quality, and
fallback UX risk. June should first prove:

```text
kiosk vital payload -> dynamic question flow -> staff_review_summary
```

**Imedtac pre-meeting prompt:** 5/15 minutes 提到「部分語音輸入」；5/19 email
明確說語音輸入要視 NYCU/Jason 進度討論是否在本次 demo 呈現。

**Why this answer:** 語音是下一階段能力，不應阻塞六月主線；先證明 structured
touch + vital-aware loop，demo 風險最低。

### Q29. 為什麼六月不做 HIS / EMR writeback？

**Answer:**

Production writeback creates hospital-system integration, access control,
medical-record responsibility, cybersecurity audit, and data-governance issues.
June should prove workflow value first through staff-review summary, not write
to production medical records.

Core phrase:

```text
六月先證明 workflow value，不碰 production medical record responsibility。
```

**Imedtac pre-meeting prompt:** 5/19 email 明確說灰字如 AI 摘要串回 HIS 流程
暫時不會實作。

**Why this answer:** 這是慧誠已經給出的 scope cut；NYCU 應順著切掉 production
HIS/EMR/FHIR writeback，避免 demo 變成院內系統上線專案。

### Q30. 正式版是不是可以全部 local 跑？

**Answer:**

Possible, but not a June decision. Local-only production would require:

- per-kiosk deployment;
- version synchronization;
- bug-fix rollout;
- log collection;
- model / question-bank update strategy;
- device performance review;
- cybersecurity controls.

June local fallback is demo insurance, not a production architecture decision.

## I. Security, Logs, And Governance

### Q31. Authentication 怎麼做？

**Answer:**

At minimum, use demo bearer token or shared demo token:

```text
Authorization: Bearer <demo-token>
```

Do not place tokens in Markdown, Git, screenshots, logs, or command history.

### Q32. CORS 會不會擋？

**Answer:**

If iMVS browser frontend calls NYCU API directly, CORS matters. Need to confirm
iMVS UI origin. NYCU backend can allowlist that origin; avoid unrestricted `*`
for formal rehearsal.

### Q33. Audit log 記什麼？

**Answer:**

Demo log should include:

- `session_key`;
- `request_id`;
- endpoint;
- response status;
- error code;
- latency;
- `api_version`;
- `flow_version`;
- `case_id`;
- `question_id`;
- `execution_mode`;
- fallback state.

Do not log real identifiers, raw audio, access tokens, or live chart content.

### Q34. 版本號要放哪些？

**Answer:**

Use:

```json
{
  "api_version": "2026-05-demo-v0.2",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2",
  "flow_version": "respiratory_demo_v0.2",
  "case_version": "respiratory_case_v0.2",
  "question_set_version": "2026-05-21-demo",
  "wording_version": "staff_summary_v0.2"
}
```

Without versioning, debugging and bilateral API alignment will be painful.

## J. Detailed Speaking Answers

Use this section when the meeting needs a fuller answer than the short Q&A
above. These answers are written to sound confident, direct, and product-minded
while preserving the demo boundary.

### 1. Product / Scope: "六月 demo 到底要展示什麼？"

**Detailed answer:**

```text
六月 demo 我們建議先聚焦在一個最小可運作的 workflow，而不是把它包成完整醫療系統。

具體來說，iMVS 端提供 synthetic or iMVS-shaped vital payload，NYCU 端根據 vital context 和結構化回答回傳下一題，最後產生 staff_review_summary 給工作人員或臨床人員覆核。

這個 demo 的價值是讓客戶看到：iMVS 不只是量測設備，也可以成為 vital-aware intake workflow 的入口。它展示的是 workflow value、integration readiness 和 staff-review support，不是 autonomous diagnosis、treatment advice 或 final triage decision。
```

**If they push for a stronger claim:**

```text
我們可以說這是 AI-assisted staff-review intake workflow，或 synthetic-data vital-aware intake support demo。這個說法比較準確，也比較安全，因為最後決策仍然在人員覆核。
```

### 2. API / Engineering: "你們 API 要怎麼讓我們接？"

**Detailed answer:**

```text
我們會提供 RESTful JSON API contract。對 imedtac engineering team 來說，最重要的不是 NYCU 內部用什麼 framework，而是你們可以清楚知道要 call 哪些 endpoint、送什麼 JSON、哪些欄位必填、型態和單位是什麼、NYCU 會回什麼 response，以及 error / timeout / retry 時怎麼處理。

NYCU 端內部建議先用 Python FastAPI 實作，因為它可以快速產生 OpenAPI / Swagger 文件，也方便接我們的 intake logic。但對外合約仍然是 REST API + JSON schema。
```

**Concrete contract to mention:**

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
POST /api/triage-demo/sessions/{session_key}/vitals
GET  /api/triage-demo/sessions/{session_key}/summary
```

**What to ask imedtac:**

```text
請確認你們工程端需要 Markdown API spec、OpenAPI / Swagger、Postman collection、mock endpoint，或 sequence diagram。NYCU 可以先提供 Markdown + JSON examples，再依你們需要補 OpenAPI。
```

### 3. Session / State: "session_key 誰產生？狀態怎麼維持？"

**Detailed answer:**

```text
NYCU 建議由 NYCU API 產生 session_key，iMVS 後續每次 answer submit 或 vitals-ready update 都 echo 同一個 session_key。

原因是 dynamic question loop 的狀態在 NYCU 端，包括目前問到哪一題、Phase 1 / Phase 2 狀態、answer history、是否已產生 summary、retry 是否重送同一個 request。讓 state owner 和 question engine 在同一端，六月 demo 會比較穩。
```

**Retry answer:**

```text
我們會用 request_id 和 idempotency_key 控制 retry。同一個 idempotency_key 重送時，API 回同一個結果，不讓 question loop 因為重送而跳兩題。
```

**If they want iMVS-owned session:**

```text
可以討論，但 imedtac 需要提供 encounter/session id format、session expiry rule、restart / abandon behavior，以及 retry semantics。否則兩邊 state 會很容易不同步。
```

### 4. Vitals / Missing Data: "欄位缺值或量測失敗怎麼辦？"

**Detailed answer:**

```text
我們會把 vital signs 當成 optional-but-important input。也就是 vital 很重要，但缺資料時系統不能硬做推論。

如果 SpO2、temperature、heart rate 或其他欄位 missing、failed、quality_flag abnormal，NYCU flow 可以回到 non-vital-dependent questions，並在 staff_review_summary 中標記 vital unavailable 或 measurement requires confirmation。

核心原則是：缺資料時，不推論；只標記。
```

**Recommended payload shape:**

```json
{
  "spo2": {
    "value": null,
    "unit": "%",
    "measurement_status": "failed",
    "quality_flag": "device_error",
    "missing_reason": "measurement_failed"
  }
}
```

**What to ask imedtac:**

```text
請 imedtac engineering 確認每個 vital 的 field name、unit、required / optional、missing / failed semantics，以及能不能每個 vital 都帶 measurement_status、quality_flag、missing_reason。
```

### 5. UI / Demo Environment: "AI triage 要放在 iMVS 哪裡？"

**Detailed answer:**

```text
這需要 imedtac 決定 UI insertion point。NYCU 端可以支援 API-based workflow，但 iMVS 端要確認這個 AI intake 是放在 same app、iframe、external link、backend API、laptop-adjacent demo，還是先用 local scripted mock。

如果 iMVS UI 支援 two-phase flow，我們建議 Phase 1 在 measurement in progress 時先問 non-vital-dependent questions；vitals-ready 後進入 Phase 2，問 vital-aware follow-up。這樣可以利用量測等待時間。

如果 Phase 1 會影響量測姿勢、signal quality 或 kiosk 操作，那就改成 post-measurement-only flow。
```

**Demo environment questions:**

```text
我們需要確認 demo 現場是否能連外網、是否能 call external HTTPS endpoint、是否有 VPN / firewall / CORS / WebView 限制、誰啟動 backend、誰監看 log、誰決定 failover。
```

### 6. Fallback / Degraded Mode: "API 掛掉怎麼辦？"

**Detailed answer:**

```text
六月 demo 我們建議採 hybrid demonstration strategy。

正常情況走 Remote REST API Mode：iMVS UI 呼叫 NYCU API，NYCU API 回 dynamic questions 和 staff_review_summary。

如果 network、tunnel、backend 或 timeout 暫時不可用，UI 可以切到 Local Scripted Demo Mode。這個 local fallback 使用預先定義的 synthetic respiratory case、固定 question flow 和固定 staff_review_summary，目的是讓 demo continuity 不被網路或 API 狀態綁死。

但 fallback 必須清楚標示為 Local Scripted Demo Mode，不代表 live AI API mode，也不是正式 production architecture。
```

**Core sentence:**

```text
Fallback 是展示穩定性設計，不是臨床正式使用設計。
```

**What to implement:**

```text
UI 至少要能標記 execution_mode: live_api 或 local_scripted_demo。
Operator 最好有 Restart demo session、Switch to fallback、Clear current session、Return to live mode 這幾個 recovery controls。
```

### 7. Clinical Boundary: "這會不會被看成診斷或分流？"

**Detailed answer:**

```text
我們會把輸出固定在 staff_review_summary，而不是 diagnosis、treatment advice 或 final triage level。

Summary 只描述 observed data 和 patient-reported symptoms，例如 patient reports dyspnea、SpO2 value received、staff review recommended。它不寫疑似肺炎、不寫治療建議、不寫 ESI level、不寫 safe to go home。

SpO2、temperature、heart rate 等 vital signs 在六月 demo 中是 review context，不是 autonomous decision。確切 threshold 和 wording 需要 clinical owner signoff。
```

**Safe field names:**

```text
staff_review_summary
review_basis
review_action
staff_handoff_note
summary_visibility: staff_only
handoff_required
handoff_reason_codes
```

### 8. AI Behavior: "如果 AI 問錯、漏掉、被 prompt injection 呢？"

**Detailed answer:**

```text
六月 demo 不讓模型自由生成 patient-facing medical questions。核心 flow 採 structured / rule-constrained question logic，問題從受控 question bank 或 predefined flow 選出，每個問題都應該能回溯到 trigger，例如 symptom answer、vital context 或 case logic。

如果未來加入 free text 或 ASR，六月階段也不會讓 free text 直接控制醫療邏輯。它最多是 supplemental note，不直接決定下一題或 summary conclusion。
```

**If asked about red flags:**

```text
Red flag 的責任不是讓 AI 判斷疾病，而是讓資訊不要被安靜地埋掉。系統只做 staff-review handoff cue，不做 diagnosis 或 final triage level。
```

### 9. Partial / Inconsistent Answers: "病人亂按或中途停止怎麼辦？"

**Detailed answer:**

```text
六月 demo 不假設每個回答都完整或一致。如果使用者中途停止、答案不一致或跳題，系統可以支援 partial completion，summary 標記 answered questions、missing questions 和 requires_staff_confirmation。

重點是不要把不確定資料放大成醫療結論，而是把不完整或不一致的地方交給 staff review。
```

**Example fields:**

```json
{
  "completion_status": "partial",
  "answered_question_ids": ["q001", "q002"],
  "missing_question_ids": ["q003"],
  "requires_staff_confirmation": true
}
```

### 10. ASR And HIS / EMR: "為什麼六月不做？"

**Detailed ASR answer:**

```text
ASR 很有價值，但六月 critical path 應該先證明 kiosk vital payload、dynamic question flow 和 staff_review_summary 可以接起來。

ASR 會新增辨識錯誤、噪音環境、語言支援、transcript confirmation、raw audio privacy、硬體麥克風品質和 fallback UX 等問題。所以建議列為 next phase，不放進六月核心交付。
```

**Detailed HIS / EMR answer:**

```text
HIS / EMR writeback 會把 demo 直接帶進 production medical record responsibility，包括權限管理、audit、資安稽核、資料治理和院內 IT 審核。

六月比較合理的範圍是產生 staff_review_summary 給人員覆核，不寫回正式病歷系統。先證明 workflow value，再開正式 integration governance path。
```

### 11. Security / Logs: "demo API 安全和追蹤怎麼做？"

**Detailed answer:**

```text
即使是 demo API，也不應該裸奔。最低限度可以用 demo bearer token 或 shared demo token，並且不把 token 寫進 Markdown、Git、截圖、logs 或 command history。

如果 iMVS browser frontend 直接 call NYCU API，需要確認 CORS origin。NYCU backend 可以 allowlist 具體 origin，不建議正式 rehearsal 使用 unrestricted wildcard。

Log 方面，demo 需要 lightweight audit log，至少記 session_key、request_id、endpoint、response status、error code、latency、api_version、flow_version、question_id、execution_mode 和 fallback state。不要 log real patient identifiers、raw audio、access tokens 或 live chart content。
```

### 12. Versioning: "為什麼要這麼多版本號？"

**Detailed answer:**

```text
因為 API field、case content、question wording、summary wording 都會改，而且這些改動可能會影響 UI、clinical wording 和 demo behavior。

如果沒有 api_version、schema_version、flow_version、case_version、question_set_version、wording_version，之後會很難知道某次 demo 用的是哪一版問題、哪一版 summary wording、哪一版 payload contract。

版本號不是多餘欄位，是讓雙方工程和臨床 review 可以對齊的最低成本控制。
```

Recommended version block:

```json
{
  "api_version": "2026-05-demo-v0.2",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2",
  "flow_version": "respiratory_demo_v0.2",
  "case_version": "respiratory_case_v0.2",
  "question_set_version": "2026-05-21-demo",
  "wording_version": "staff_summary_v0.2"
}
```

### 13. Strong Summary Answer

Use this when the meeting needs one compact, confident answer:

```text
我們六月 demo 的策略是先證明最小可運作流程：vital payload 進來，question flow 根據資料往下走，最後產生 staff_review_summary 給人員覆核。

正常情況走 NYCU Remote REST API；如果 API、network、tunnel 或 backend timeout，UI 可以切換到 local scripted fallback flow，確保 demo 不會中斷。Fallback 會清楚標記，不會被包裝成 live AI result。

這樣設計的目的，是穩定展示 workflow value，同時把正式產品之後才需要處理的 session recovery、audit log、deployment、security、ASR、HIS/EMR integration 保留下來做下一階段決策。
```

## K. Additional imedtac-Prompted Q&A

These questions are added because 慧誠智醫 raised them explicitly or indirectly
in the meeting materials, and the earlier categorized Q&A did not fully capture
the answer.

### Q35. 慧誠說的 `AI 資料訓練 study`，NYCU 要怎麼回答？

**Answer:**

建議回答：

```text
六月 demo 階段，我們先把 AI 資料訓練 study 定義為 synthetic demo case / question-flow feasibility study，不使用真實病患資料做模型訓練。

NYCU 會整理 3-5 個合成案例、生命徵象、問題流程、答案格式和 staff_review_summary wording，用來驗證 workflow 與 API contract。

如果未來要進入真實資料訓練，會需要另外確認 IRB / data governance / de-identification / hospital approval / model validation，不放在六月 demo critical path。
```

**Imedtac pre-meeting prompt:** 慧誠 5/15 minutes 明確把「研究 `3-5` 個 Demo
用的傷患案例，並進行 `AI 資料訓練 study`」列為陽交大 action item。

**Why this answer:** 這個詞可能被理解成真實病患資料訓練。六月 demo 目前沒有
真實資料授權、IRB、資料治理或臨床驗證，因此要收斂為 synthetic-data / feasibility
study。

### Q36. 慧誠 earlier minutes 說 `8-10` 題，但產品規格說小於 `8` 題，我們怎麼回答？

**Answer:**

建議回答：

```text
我們看到 5/15 minutes 曾寫 8-10 題，但 5/19 iMVS AI Triage product spec 在 OPQRST dynamic questioning acceptance criteria 裡寫總題數預計小於 8 題。

因此六月 API v0.2 建議以產品規格為準：visible patient-facing questions <8，hard cap 用 max_questions=7。實際第一個 respiratory flow 會盡量控制在 5-7 題。
```

**Imedtac pre-meeting prompt:** 5/15 minutes 提到 `8-10` 題；5/19 product spec
US06/AC06 提到總題數小於 `8`。

**Why this answer:** 以較新的產品規格作為 demo contract，可降低病人端負擔，也
讓 AC07 progress 更容易被 UI 呈現。

### Q37. 是否要把許醫師加入 email loop？

**Answer:**

建議回答：

```text
建議加入。若後續要確認 demo case、stop rule、red-flag wording、staff_review_summary wording，許醫師 / 多寶應該在 email loop 中，以免 clinical wording 只由工程端或 NYCU 自行決定。
```

**Imedtac pre-meeting prompt:** Johnny 5/15 minutes email 明確寫「如需要的話請
Jason 將許醫師也加到 Email Loop 中」。

**Why this answer:** demo 可用 synthetic cases，但 clinical wording 和 stop rule
仍需要臨床 reviewer；把許醫師加入 loop 可降低事後誤解。

### Q38. API design document 什麼時候、用什麼形式提供？

**Answer:**

建議回答：

```text
NYCU 先提供 Markdown API design + JSON examples 作為 v0.2 discussion draft。若 imedtac engineering 需要，我們可以再補 OpenAPI / Swagger、Postman collection、mock endpoint 或 sequence diagram。

5/21 sync 先確認欄位、session behavior、UI insertion point、demo environment 和 owner/date；確認後再整理 confirmed API v0.2。
```

**Imedtac pre-meeting prompt:** 5/19 LINE 明確問「工程師會需要 API 的設計文件，
再麻煩回覆什麼時候可以提供」。

**Why this answer:** Markdown + JSON examples 最快可讀、可討論；OpenAPI / Postman
等工程 artifact 應在欄位與流程確認後再產生，避免反覆改 schema。

### Q39. NYCU 回傳的 question object 應該包含什麼？

**Answer:**

建議回答：

```text
每一題至少包含 question_id、type、text、options、progress、session_key、question_phase、demo_boundary。

type 先支援 single_choice、multi_choice、scale。multi_choice 需要 none_option_id 互斥邏輯；scale 需要 min/max 與兩端語意標籤。
```

Example:

```json
{
  "session_key": "demo-session-uuid",
  "status": "question",
  "progress": {
    "current": 2,
    "expected_total": 7
  },
  "question": {
    "id": "dyspnea-duration",
    "type": "single_choice",
    "text": "How long have you felt short of breath?",
    "options": [
      {"id": "today", "label": "Started today"},
      {"id": "days", "label": "A few days"},
      {"id": "week_plus", "label": "More than a week"}
    ]
  },
  "demo_boundary": "Synthetic-data staff-review intake support only."
}
```

**Imedtac pre-meeting prompt:** 5/19 email 明確列出「陽交大回傳問題格式：
選擇類型、選項、預計問題數量 AC07、session key 等」。

**Why this answer:** UI 需要 deterministic render contract；progress 和 session
key 是產品規格與 API state 的共同需求。

### Q40. OPQRST / VINDICATE 這些規格裡的問診邏輯，我們要照做嗎？

**Answer:**

建議回答：

```text
六月 demo 可以採用 OPQRST 作為 question-flow 的結構參考，尤其是 onset、location、quality、severity、timing 這些病人可理解的問診維度。

但不把 OPQRST / VINDICATE 包成已完成的 clinical standard engine。每一個 specialty 或 red-flag logic 未來仍需要 source mapping 與 clinical review。
```

**Imedtac pre-meeting prompt:** 5/19 product spec US06 與 3.2 明確提到 OPQRST /
VINDICATE dynamic questioning。

**Why this answer:** OPQRST 很適合 demo 的結構化問題，但不能取代臨床驗證或
triage protocol signoff。

### Q41. 慧誠文件寫 SOAP、Assessment、Plan、建議科別，我們為什麼不用這些欄位？

**Answer:**

建議回答：

```text
六月 demo 先保留 S/O 類型資訊：patient-reported symptoms 和 measured vitals。

對 A/P 類型內容，我們建議改名為 review_basis、review_action、staff_handoff_note，避免被誤解為診斷、治療計畫或正式分流結論。

如果未來要進 HIS SOAP view，需要 clinical owner、hospital workflow owner、evidence mapping、security 和 version-control signoff。
```

**Imedtac pre-meeting prompt:** 5/19 product spec US15-US16 與 3.3 提到 SOAP
摘要、Assessment/Plan、Evidence Mapping、HIS 接軌。

**Why this answer:** SOAP 的 A/P 容易被理解為醫療判斷或處置建議；六月 demo
只應產生 staff-review summary。

### Q42. 慧誠問進度時，我們怎麼定義目前進度？

**Answer:**

建議回答：

```text
目前 NYCU 已收斂出 API v0.2 draft：iMVS vital payload -> NYCU question object + session_key -> iMVS answer + session_key -> NYCU next question or staff_review_summary。

下一步不是重新討論方向，而是 5/21 sync 確認欄位、UI insertion、demo environment、fallback、clinical wording owner，然後產出 confirmed API v0.2。
```

**Imedtac pre-meeting prompt:** 5/19 LINE 明確問「這週四有空快速討論一下目前的
進度嗎？同時我也會帶工程設計團隊一起加入討論細節」。

**Why this answer:** 讓會議從 brainstorm 轉成 contract-freeze，避免工程團隊會後
仍不知道要接什麼。

### Q43. 慧誠技術團隊需要從 NYCU 拿到哪些最小交付物？

**Answer:**

建議回答：

```text
最小交付物是：
1. API v0.2 Markdown spec；
2. start-session / submit-answer / update-vitals / summary / error JSON examples；
3. first respiratory synthetic case fixture；
4. question object schema；
5. staff_review_summary schema；
6. error and fallback behavior；
7. owner/date closeout checklist。
```

**Imedtac pre-meeting prompt:** 5/15 minutes 要 NYCU 做技術架構設計；5/19 LINE
說工程師需要 API 設計文件；5/19 email 列出 API 欄位需求。

**Why this answer:** 這些是 engineering team 可以直接拿去做 UI / integration
rehearsal 的最小材料。

### Q44. 慧誠說規格中的檢傷標準與呈現邏輯可調整，我們要怎麼接？

**Answer:**

建議回答：

```text
我們建議把規格中的 clinical standards / presentation logic 分成兩層：

第一層是六月可以先凍結的 engineering contract：payload、question object、session_key、answer loop、summary schema。

第二層是需要 clinical review 的 logic：red flag、stop rule、summary wording、evidence refs、是否出現建議科別或 triage wording。

5/21 可以先凍結第一層，第二層請許醫師 / 多寶和慧誠一起確認。
```

**Imedtac pre-meeting prompt:** 5/19 direct LINE 中 Johnny 明確說文件中的檢傷標準與
呈現邏輯是先與 AI 討論後定下來的，實務上可以再與 NYCU 討論、可以調整。

**Why this answer:** 把可工程凍結的部分和需臨床審查的部分分開，才能同時推進
demo integration 和安全邊界。

### Q45. 慧誠規格第 4 節 `使用者流程 (User Flow)`，我們有納入嗎？

**Answer:**

有，但需要分成「六月 demo 主線」與「future-state / 慧誠既有系統」兩層來納入。

規格第 4 節有三個維度：

| 慧誠 User Flow | NYCU 目前設計狀態 | 六月回答 |
| --- | --- | --- |
| `4.1 IT 管理員：出廠與院內設定` | 部分納入為 API/config assumptions；未做完整 admin UI。 | 六月 demo 不實作 imedtac admin backend。NYCU 需要知道啟用哪些 vital fields、identity mode、workflow mode；管理端配置由 imedtac 既有系統或 demo setup 控制。 |
| `4.2 用戶（病患）：檢傷量測流程` | 已納入主線。 | iMVS 身分/量測流程後，NYCU API 接收 synthetic or iMVS-shaped vital payload，回傳 structured questions；支援 OPQRST-style dynamic follow-up、progress、single/multi/scale。 |
| `4.3 醫師：HIS 系統端` | 以 demo doctor / staff-review view 納入；production HIS deferred。 | 六月提供 `staff_review_summary` 或 demo doctor review page；不連接 production HIS / EMR / FHIR，不輸出正式 SOAP A/P 或 final triage level。 |

**Imedtac pre-meeting prompt:** `iMVS AI Triage 智慧檢傷分流系統_20260515`
第 4 節明確列出 IT 管理端配置、病患端量測/問診流程、醫師端 HIS 檢視流程。

**Why this answer:** 如果全部照產品規格一次做，會變成 admin backend + identity
integration + production HIS project；六月 demo 應先把 patient measurement/intake
loop 和 demo doctor review loop 打通，其他保留為 future-state or imedtac-owned setup。

### Q46. 慧誠規格第 5 節 `非功能性需求與限制 (Constraints & Risks)`，我們有納入嗎？

**Answer:**

有，而且這是目前設計中最明確納入的部分。第 5 節目前抽取到的明確限制是：

```text
系統介面必須在顯眼處標註「本建議僅供分流參考，非正式醫療診斷」
```

NYCU 設計已經把它落到四個地方：

1. API / summary 欄位使用 `staff_review_summary`，不使用 `diagnosis`。
2. `not_claimed` 明確列出不診斷、不治療、不指定 final triage level、不寫入 HIS/EMR/FHIR。
3. UI / demo copy 必須顯示 non-diagnostic boundary。
4. Error / fallback 時不產生假的 clinical summary，回 standard staff workflow。

建議會議中使用這句：

```text
本 demo 產生的是 staff-review summary；本建議僅供分流參考，非正式醫療診斷。最終判斷仍由工作人員 / 臨床人員覆核。
```

**Imedtac pre-meeting prompt:** `iMVS AI Triage 智慧檢傷分流系統_20260515`
第 5 節明確要求系統介面顯眼標註非診斷性聲明。

**Why this answer:** 這不是 optional wording，而是慧誠規格中的安全限制；如果只
寫在內部文件而沒有進 API/UI/summary/fallback，就不算真正納入設計。

## L. Must-Ask Closeout Questions

Ask these before the call ends:

1. What is the exact June demo date, site, and audience?
2. What is the UI insertion path: same app, iframe, external link, backend API,
   laptop-adjacent demo, or static/local fallback?
3. Can Phase 1 questions be shown during measurement without disrupting signal quality?
4. What are the actual iMVS vital field names, units, required / optional rules,
   and missing / failed semantics?
5. Is NYCU-generated `session_key` acceptable?
6. Does engineering need Markdown API spec, OpenAPI, Postman collection, mock endpoint, or all of them?
7. Can the demo call external HTTPS? Any firewall, CORS, VPN, or WebView limit?
8. Can local scripted fallback live inside the kiosk UI and be clearly labeled?
9. Where will `staff_review_summary` appear, and can patients see it?
10. Who owns field dictionary, UI insertion decision, clinical wording signoff,
    local fallback, demo environment, and confirmed API v0.2 by `2026-05-22`?

## M. Closing Script

Use this to close:

```text
今天我們先把六月 demo 收斂成 synthetic-data vital-aware intake support workflow。
主路徑是 Remote REST API Mode：iMVS 送 vital payload 與 structured answers，
NYCU 回 typed questions 與 staff_review_summary。
備援路徑是 Local Scripted Demo Mode，只用於 demo continuity，必須清楚標示為 scripted synthetic flow，不代表 live AI API mode。

下一步需要 imedtac 提供 field dictionary、UI insertion decision、demo environment decision；
臨床端確認 wording；NYCU 依此更新 confirmed API v0.2。
Voice input 與 HIS/EMR writeback 不進六月 critical path，除非另開 decision。
```
