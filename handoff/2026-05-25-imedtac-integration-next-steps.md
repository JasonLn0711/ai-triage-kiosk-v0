---
id: 2026-05-25-imedtac-integration-next-steps
title: "imedtac Integration Next Steps After Teams UI / API Follow-Up"
date: 2026-05-25
topic: ai-triage
type: handoff
status: active-next-step-plan
audience: internal NYCU / Jason / 多寶 coordination; selective imedtac engineering follow-up
source:
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ../source/2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md
  - ../source/2026-05-25-duobao-afrvr-tachycardia-case/source.md
  - ./2026-05-21-imedtac-two-endpoint-api-reply.md
  - ./2026-05-21-imedtac-engineering-open-issues-checklist.md
---

# imedtac Integration Next Steps After Teams UI / API Follow-Up

## Recommendation

NYCU should move from document delivery to a **contract rehearsal pack** for
imedtac. The next concrete goal is:

```text
answer Ben's API questions
-> publish one case-aligned tachycardia question/option template
-> provide one browser-callable demo API base URL or mock endpoint
-> run Endpoint 1 / Endpoint 2 rehearsal with imedtac UI
```

This keeps the project in the correct operating scope: vital-aware intake
support, structured question workflow, staff-review summary, synthetic-data demo
context, and human review workflow.

## Decisions To Send Back

### 1. `request_id` / `idempotency_key`

Reply position:

```text
request_id：每次 HTTP request 都產生新的 unique id，主要用於 log trace、debug、
以及雙方對帳。

idempotency_key：用於同一個 logical operation 的安全 retry。同一 endpoint、
同一 session/question context、同一 request body retry 時使用同一個
idempotency_key，NYCU 會回同一個結果，不讓 question flow 前進兩次。

不同題目、或使用者明確送出新的答案嘗試時，請使用新的 idempotency_key。
若同一 idempotency_key 搭配不同 request body，NYCU 會視為
idempotency_conflict。
```

### 2. `capabilities.max_questions` and Progress UI

Reply position:

```text
capabilities.max_questions 是 iMVS 告訴 NYCU 的問題數上限 / UI capacity cap，
不是保證最後一定會問到的題數。

UI 的 "Question X of Y" 建議使用 NYCU response 裡的 progress.expected_total
作為 Y。六月 tachycardia rehearsal lane 可以先固定 expected_total，讓 UI 的進度
顯示穩定；若未來流程有 early summary，NYCU 會用 status=summary 結束流程，而
不是要求 iMVS 自己用 max_questions 判斷。
```

### 3. Skip / Unable-To-Answer

Reply position:

```text
NYCU 同意這次 demo 不做 generic silent skip。保留 "I'm not sure" 是好的，
因為它是一個可解讀的答案狀態。

None of these 不需要做成 UI 內建固定按鈕；若某一題臨床上需要 "none" 答案，
NYCU 會把它當成該題 question.options 裡的普通 option id 回傳，例如
none_of_these。iMVS 只要依 option id 回傳即可。
```

### 4. Option Count / Label Length

Working design:

- imedtac UI current working capacity: up to `9` short options without user
  scrolling.
- NYCU first-lane target: keep most questions at `4` options for readability.
- Hard design guard: keep option labels short; avoid long sentence options.
- If a question needs more than `6` options, use grouped wording or split the
  question only when 多寶 / imedtac UI confirms the split is clearer.

### 5. Summary Preview Page

Reply position:

```text
回答完所有問題後，NYCU Endpoint 2 會回 `status=summary` 與
`staff_review_summary`。最省工程量的 demo 路徑，是 iMVS 直接在既有 result /
preview page 顯示同一份 summary payload；這樣不需要另外刻一個完整頁面。

如果 imedtac 想先快速驗證顯示效果，NYCU 也可以提供一個 demo-only 的輕量
preview page / mock page，展示同一份 summary payload。正式 rehearsal 仍建議以
iMVS 端 render payload 為主，確保 customer demo 看到的是實際串接結果。
```

Scope control:

```text
summary_visibility 維持 staff_only；summary 是 staff-review / demo preview，
不是病人診斷結果、治療建議或 final triage level。
```

### 6. Demo Environment

NYCU implementation checklist:

- Provide one HTTPS API base URL before rehearsal.
- Allow CORS origins:
  - `http://localhost`
  - `http://localhost:5174`
- Support `OPTIONS` preflight for:
  - `Content-Type: application/json`
  - `Authorization: Bearer <demo token>` if enabled
- Decide whether bearer token is required for the first rehearsal.
- Keep tokens out of repo docs and screenshots.

## Work Plan

| Step | Concrete Output | Owner | Target |
| --- | --- | --- | --- |
| 1 | Send concise Teams reply answering Ben's two API questions and confirming the progress rule. | Jason / NYCU | Immediate |
| 2 | Update the external API reply with clarified idempotency, progress, UI capacity, and CORS notes. | Jason | `2026-05-25` |
| 3 | Deliver the first tachycardia preset question/option template aligned to 多寶's HR `130` case. | Jason + 多寶 | `2026-05-25` |
| 4 | Confirm whether summary display will use iMVS existing preview page or a temporary NYCU-hosted demo preview page. | imedtac UI + NYCU | Immediate |
| 5 | Prepare a browser-callable demo API or mock endpoint for imedtac UI. | NYCU engineering | Before first rehearsal |
| 6 | Run contract rehearsal: start session -> first question -> answer -> next question -> summary. | NYCU + imedtac | Before `2026-06-10` customer demo |
| 7 | Run fallback rehearsal: API timeout / invalid session -> structured error -> local scripted demo label. | NYCU + imedtac | Before customer demo |
| 8 | Capture UI screenshots from imedtac and update option-count / progress assumptions. | imedtac UI + Jason | After first rehearsal |

## Suggested Teams Reply

```text
Ben、Johnny、Lauren 大家好，收到，謝謝，我們先把幾個工程點對齊如下：

1. request_id / idempotency_key
request_id 建議每次 HTTP request 都產生新的 unique id，主要用於 trace 與雙方 log 對帳。
idempotency_key 用於同一個 logical operation 的 retry；同一 endpoint、同一 session/question context、同一 request body retry 時使用同一個 key，NYCU 會回同一個結果，避免 question flow 前進兩次。不同題目，或使用者明確送出新的答案嘗試時，請使用新的 idempotency_key。

2. capabilities.max_questions / Question X of Y
capabilities.max_questions 建議視為 iMVS 提供給 NYCU 的上限，不是保證最後一定會問到的題數。UI 的 Y 建議使用 NYCU response 裡的 progress.expected_total。六月 tachycardia demo lane 我們可以先讓 expected_total 在同一個 session 內維持穩定，讓進度顯示容易處理。

3. skip / I'm not sure / None of these
我們同意這次 demo 不做 generic silent skip。保留 I'm not sure 很好，因為它是可解讀的 answer state。None of these 不需要做成 UI 固定按鈕；如果某題需要 none answer，我們會把它當成該題 options 裡的一個 option id 回傳，iMVS 依 option id 回傳即可。

4. Option count / label length
選項數量的部分，我們會配合你們目前最多 9 個短選項、且不讓使用者 scroll 的排法。第一版 tachycardia preset 會盡量維持短選項與較少選項，只有必要時才接近上限。

5. Summary preview
回答完所有問題後，NYCU Endpoint 2 會回 status=summary 與 staff_review_summary。最省工程量的方式是 iMVS 直接在既有 result / preview page 顯示這份 payload；如果你們想先快速驗證畫面，我們也可以提供一個 NYCU-hosted demo-only preview / mock page，但正式 rehearsal 建議還是以 iMVS 端顯示同一份 summary payload 為主。

6. Demo environment
了解你們會由前端直接呼叫 NYCU API。我們會準備 base URL，並把 http://localhost 與 http://localhost:5174 加入 CORS allowlist。Demo bearer token 我們會用一個簡單的 demo token 做法，之後提供實際 header 格式。

我們也會把第一版 tachycardia preset questions/options 對齊多寶今天提供的 case 後整理給大家。
```

## Rehearsal Acceptance Criteria

First rehearsal is successful when:

- iMVS can call `POST /api/triage-demo/sessions` from browser origin.
- CORS preflight passes from `http://localhost` or `http://localhost:5174`.
- NYCU returns `session_key`, `response_id`, `progress`, and one typed question.
- iMVS renders `single_choice` and `multi_choice` options without user scroll.
- iMVS sends selected option ids, not labels.
- Same `idempotency_key` retry does not advance the flow twice.
- NYCU returns `status=summary` and `staff_review_summary` with staff-only
  scope controls.
- iMVS renders the summary in an existing result / preview page, or NYCU-hosted
  demo preview is explicitly labeled as a temporary rehearsal surface.
- UI does not display diagnosis, treatment advice, final triage level, or
  production HIS / EMR writeback claim.

## Scope Controls

- Staff-review intake support.
- Human review workflow.
- Synthetic-data demo context.
- Interface-level API sharing.
- Separate validation path before clinical or production use.
