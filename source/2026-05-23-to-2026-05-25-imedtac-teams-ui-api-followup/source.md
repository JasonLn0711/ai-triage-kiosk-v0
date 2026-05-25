---
id: 2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup
title: "imedtac Teams UI / API Follow-Up And Case Handoff"
date: 2026-05-25
topic: ai-triage
type: source
status: active
channel: Microsoft Teams
confidentiality: engineering-coordination-local-only
source_note: user-provided screenshots from Microsoft Teams
related:
  - ../2026-05-21-imedtac-teams-api-followup/source.md
  - ../2026-05-25-duobao-afrvr-tachycardia-case/source.md
  - ../../handoff/2026-05-21-imedtac-two-endpoint-api-reply.md
  - ../../handoff/2026-05-21-imedtac-engineering-open-issues-checklist.md
---

# imedtac Teams UI / API Follow-Up And Case Handoff

## Source Boundary

This note preserves the visible Microsoft Teams conversation screenshots
provided by Jason on `2026-05-25`. It covers the follow-up after the two-endpoint
API email, 多寶's Case Tachy handoff, Ben's API questions, Johnny / UI-team
signals on option capacity and skip behavior, Jason's `2026-05-25 20:09`
engineering reply in the Teams group, and Jason's `2026-05-25 20:13` private
bearer-token handoff to Ben.

Treat this as engineering coordination and task-routing evidence. It is not a
clinical source, regulatory source, production integration approval, real
patient-data approval, final clinical validation, or final API acceptance.

Credential boundary: the screenshots show that Jason privately shared an actual
demo bearer token with Ben. The token value is intentionally not transcribed in
this repository. Tracked files may record the fact of token handoff, the header
format, the recipient, and the change-control obligation, but must not record
the credential itself.

## Visible Conversation Transcript

The following transcript is reconstructed from the user-provided screenshots.
Line breaks preserve the visible meaning rather than Teams UI wrapping.

```text
[Earlier visible Teams context]

Johnny Fang 方偉翰, imedtac Corp.:
另外在設計上有想請教的，原先有設想到用戶如果答不出來可以略過，想問實務上可以嗎? 如果不行可以取消這個行為

Jason Lin:
以上兩個問題我們確認後回覆

Friday 12:24 PM

Jason Lin:
Dear all,
API 回覆文件我剛剛已經用 email 寄出，方便後續討論以及工程端串接。

關於前面的兩個問題：

1. 預設題目與選項範本，我們會先做第一版 preset questions/options，預計星期一提供。

2. 使用者答不出來的行為，我們建議這次 demo 不做 generic skip button。因為 skip 只代表使用者略過，但無法判斷是不理解問題、不知道怎麼回答，還是忘記答案。建議改成較明確的 `Not sure` 選項，iMVS 回傳對應的 option id，例如 `not_sure` 或 question-specific `*_not_sure`，這樣 summary 裡也能保留可解讀的回答狀態。

再麻煩大家查閱 email 附件，謝謝。

Saturday 11:26 AM

Johnny Fang 方偉翰, imedtac Corp.:
好的，收到，
skip button 的流程我們會討論後再調整 謝謝

Saturday 11:14 PM

Jason Miao 苗中聖, imedtac Corp.:
MedVisor | Devpost
https://share.google/[visible shared link]

Today 10:28 AM

多寶 許:
[quoting Johnny Fang, 5/21/2026, 6:07 PM]
另外想問明天或星期一可以拿到範本的內容嗎? 包含先預設的題目跟選項

https://drive.google.com/file/d/1AXdcuaGLCDPIOKiPCk-kQw0iLgw9DT0l/view?usp=sharing

這個是一個心跳快的Case

有任何問題可以再跟我說~

Ben Siu 蕭銳輝, imedtac Corp.:
Jason Lin 你好, 收到你上週五提供的文件，有幾個問題想跟你請教

1. request_id 以及 idempotency_key 的用法:
   1. request_id: 每次 request 都生成 unique id
   2. idempotency_key: 同一 session 內回答同一問題時使用相同 idempotency_key, 但回答不同問題時使用不同 idempotency_key

2. 請問 endpoint 1 request 裡的 capabilities.max_questions 是否必然是最終的題目數量，還是有機會少於這個數量?
   會這樣問的原因是我們目前的 UI 設計會顯示答題進度 (見下圖), 我想確認 "Question X of Y" 的 Y 能否直接使用 capabilities.max_questions, 還是你們會有其他建議?

[Ben shared a UI progress screenshot. The visible UI shows a multi-option screen and a bottom progress label such as "Question 8 of 8".]

另外文件中的問題 #1, #3 以及 skip button 的部分目前 Johnny 及 UI 團隊正在確認中

Demo environment 的部分，我們預計會在前端直接呼叫部署在你們環境的 API。Demo 的環境會有對外網路，你們可以使用你們方便的 base URL。CORS 的部分，我們的 origin 會有 `http://localhost` 以及 `http://localhost:5174` 兩種可能性，請開放這兩個 origin。Demo bearer token 的部分我們可以使用你們的做法。

感謝。

Johnny Fang 方偉翰, imedtac Corp.:
[replying to Ben's note on file questions #1, #3, and skip button]
Re:
先補充結論，以後補，預計27號提供

- 最多字數與選項數目會依據許醫師提供的範例去斟酌設計
- UI 會保留 I'm not sure 的按鈕，None of these 則會取消(選項內容皆依據AI傳回的選項來顯示)

多寶 許:
目前UI能夠容納的最多選項是大概多少個嗎？

Johnny Fang 方偉翰, imedtac Corp.:
原本暫排的可以到9個，使用上不會讓用戶scroll，目前看範例的選項的字數長度不會太長，所以可以維持
不過想問AI產出的問題選項有出現過內容很長的情況嗎?

多寶 許:
我們可能會設計的簡短一點

Johnny Fang 方偉翰, imedtac Corp.:
那看來可以維持最多9個的排法~~

Johnny Fang 方偉翰, imedtac Corp. [edited, @Jason Lin]:
想請教
回答完所有問題後，會回傳的 summary 目前你們有預覽的頁面嗎?
如果有的話，demo時可以直接展示結果，我們就不需要另外刻頁面

Today 5:27 PM

Jason Lin:
想請教
回答完所有問題後，會回傳的 summary 目前你們有預覽的頁面嗎?
如果有的話，demo時可以直接展示結果，我們就不需要另外刻頁面

Johnny Fang 方偉翰, imedtac Corp.:
[replying to Jason Lin's summary preview question]
嗨嗨，我們有現成可以用的預覽頁嗎?

Today 8:09 PM

Jason Lin:
Ben、Johnny、Lauren 大家好，整理幾個工程點對齊如下：

1. request_id / idempotency_key
request_id 建議每次 HTTP request 都產生新的 unique id，主要用於 trace 與雙方 log 核對。
idempotency_key 則用於同一個 logical operation 的 retry，同一 endpoint、同一 session/question context、同一 request body retry 時使用同一個 key，NYCU 會回同一個結果，避免 question flow 前進兩次。換言之，不同題目，或使用者明確送出新的答案嘗試時，請使用新的 idempotency_key。對於可能的例外情形，像是同一 idempotency_key 搭配不同 answer body，NYCU 會回 HTTP 409 / idempotency_conflict，且不推進 question flow；六月 demo 的 recovery 建議定調為 restart demo session（若有 idempotency conflict 的狀況，就直接 restart questionnaire），不做自動 answer revision。

此外，也想與貴公司討論，iMVS 前端實作 pending answer state：使用者按下 submit 後，立即 snapshot 當次 question_id、answer body 與 idempotency_key，並把當題所有答題相關 controls 設為 disabled / readonly，help、restart demo、operator fallback 這類與答題內容無關的控制可以保留。若 request timeout，需要 retry 時只 retry 同一份 answer body 與同一個 idempotency_key。等 NYCU 回覆下一題或 summary 後，再開啟下一個畫面的答題控制。若收到 idempotency_conflict，請不要自動換新的 idempotency_key 重送不同答案，這可避免使用者在 request pending 時改答案，降低 duplicate submit（idempotency_conflict）的風險。

2. capabilities.max_questions / Question X of Y
capabilities.max_questions 建議視為 iMVS 提供給 NYCU 後端伺服器的出題數量上限（也就是 NYCU 的題目不得超過 max_questions 的數量，但不是最後一定會問這麼多題）。UI 的 Y 建議使用 NYCU api response 裡的 progress.expected_total（因為 expected_total 的定義是 NYCU 後台設定「總共會提供的題目數量」）。六月 tachycardia demo lane 我們可以先讓 expected_total 在同一個 session 內維持穩定，讓進度顯示容易處理。

3. skip / I'm not sure / None of these
我們同意這次 demo 不做 generic silent skip。保留 I'm not sure 很ok，因為它容易被解讀。另外，None of these 則建議不需要做成 UI 固定按鈕；如果某題需要 none answer，我們會把它當成題 options 裡的一個 option id 回傳，iMVS 依 option id 回傳即可。

4. Option count / label length
選項數量的部分，我們會配合你們目前最多 9 個短選項、且不讓使用者 scroll 的排法。第一版 tachycardia preset 會盡量維持短選項與較少選項，只有必要時才接近上限。

5. Summary preview
回答完所有問題後，NYCU Endpoint 2 會回 status=summary 與 staff_review_summary。目前思考，最省工程量的方式可能是 iMVS 直接在既有 result / preview page 顯示這份 payload；如果你們想先快速驗證畫面，我們也可以提供一個 NYCU-hosted demo-only preview（mock page）。

6. Demo environment
了解你們會由前端直接呼叫 NYCU API。我們會提供固定的 NYCU-hosted Render rehearsal API base URL：
https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo

完整 endpoint 是：
POST https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions
POST https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions/{session_key}/answers

我們已把 http://localhost 與 http://localhost:5174 加入 CORS allowlist。Demo auth 採簡單 bearer-token gate，request header 格式如下：

Content-Type: application/json
Authorization: Bearer <demo token>

我們已把第一版 tachycardia preset questions 切齊許醫師今天提供的 case。

[Today after the 8:09 PM group reply; exact minute not visible in screenshot]

Jason Lin:
[replying to Johnny Fang's summary-preview question]
嗨 Johnny，考量畫面設計的美觀與一致性，不知道如果由我們這邊提供 ui，會不會影響設備操作的完整性，這可能要再討論一下

Today 8:13 PM

Jason Lin -> Ben Siu 蕭銳輝, imedtac Corp. [private chat]:
這份 DEMO_BEARER_TOKEN = [REDACTED]

Jason Lin -> Ben Siu 蕭銳輝, imedtac Corp. [private chat]:
demo bearer token 如上，經測試可正常呼叫。
```

## Working Extraction

### Confirmed / Actionable

- The two-endpoint API document has already been emailed and is now the basis
  for engineering discussion.
- 多寶 provided the heart-rate case file through Google Drive; the local archive
  is `../2026-05-25-duobao-afrvr-tachycardia-case/`.
- Ben's interpretation is directionally correct:
  - `request_id` should be unique for every request.
  - `idempotency_key` should remain stable for retrying the same logical
    operation; a different question answer should use a different key.
- `capabilities.max_questions` should be treated as the UI/request upper bound,
  not necessarily the final number of questions for `Question X of Y`.
- For UI progress, NYCU should return response-level progress metadata. The
  safest current field is `progress.expected_total`; for the current
  tachycardia lane, NYCU can keep this stable for the session.
- imedtac expects browser direct calls from the front end to the NYCU-hosted API.
- Demo network is expected to have external internet.
- CORS allowlist requested by imedtac:
  - `http://localhost`
  - `http://localhost:5174`
- Demo bearer token handling can follow NYCU's preferred approach.
- imedtac UI can maintain a current working layout of up to `9` short options
  without user scrolling.
- imedtac UI intends to keep an `I'm not sure` affordance.
- imedtac UI intends to remove a static / built-in `None of these` button; if a
  clinically meaningful "none of these" answer is needed, NYCU should return it
  as an explicit option in `question.options`, not rely on a generic UI control.
- Johnny asked whether NYCU already has a preview page for the returned summary
  after all questions are completed. If available, imedtac can show that result
  directly during the demo and avoid building a separate page.

### Still Pending / Needs Confirmation

- Johnny and the UI team are still confirming file questions `#1`, `#3`, and
  skip-button behavior; Johnny expects to provide more detail on `2026-05-27`.
- Maximum option label length is not final; the current working assumption is
  that options should stay short and no-scroll.
- The summary display location remains a live integration question: iMVS may
  render `staff_review_summary` inside its existing demo result / preview page,
  or NYCU may provide a lightweight demo-only preview page for rehearsal and
  debugging if imedtac wants a fast visual target.
- Jason later replied to Johnny's preview-page question that, although NYCU
  could discuss providing UI, visual consistency and completeness of the device
  operation may be affected. This means summary-preview UI ownership and any
  NYCU-hosted / NYCU-provided UI surface remain discussion items, not unilateral
  implementation changes.
- The exact API base URL is still NYCU-owned and must be provided before
  rehearsal.
- The demo bearer-token format, rotation path, and whether credentials are sent
  with CORS requests still need NYCU implementation decision.
- Jason's `2026-05-25 20:09` Teams reply externally committed NYCU to the
  listed engineering behaviors for the first rehearsal: idempotency conflict
  returns HTTP `409` and does not advance the question flow; June recovery is
  restart questionnaire / restart demo session, not automatic answer revision;
  UI progress should use `progress.expected_total`; generic silent skip is out;
  `I'm not sure` stays as interpretable answer state; static `None of these`
  is not required; option labels should stay short and within the current
  no-scroll working layout; Endpoint 2 returns `status=summary` and
  `staff_review_summary`; and the Render base URL / endpoint paths / CORS
  origins / bearer-token header format are the current integration contract.
- Jason's `2026-05-25 20:13` private message to Ben shared the actual
  `DEMO_BEARER_TOKEN` value and stated that testing confirmed successful calls
  with the token. The value is not stored here. Any future token rotation or
  authentication-rule change must be communicated to imedtac because Ben has
  already received a working credential.

## Engineering Interpretation

The next handoff should answer Ben's two API questions directly:

```text
request_id: unique per HTTP request, for tracing.
idempotency_key: stable per logical operation and retry. Same request body +
same endpoint + same session/question context should return the same result.
Different question, or a deliberate new answer attempt, should use a new key.
```

For progress:

```text
capabilities.max_questions is a cap, not the final Y for Question X of Y.
Use response.progress.expected_total for Y. For the June tachycardia rehearsal,
NYCU can keep expected_total stable for the session so the UI can display a
predictable progress bar.
```

For skip / unable-to-answer behavior:

```text
Use explicit answer semantics. Keep `I'm not sure` as a clear answer state.
Do not rely on a generic silent skip. Do not rely on a static None-of-these
button; if the clinical question needs a none answer, return it as an ordinary
option id in `question.options`.
```

For demo environment:

```text
NYCU should prepare an HTTPS base URL, allow CORS origins `http://localhost` and
`http://localhost:5174`, support JSON `Content-Type`, support `Authorization:
Bearer <demo token>` if enabled, and respond to browser preflight requests.
```

For summary preview:

```text
Endpoint 2 returns `status=summary` and `staff_review_summary` after the final
answer. The preferred rehearsal path is for iMVS to render that payload in its
existing result / preview surface. If imedtac needs a faster visual check before
its UI render is ready, NYCU can provide a lightweight NYCU-hosted demo preview
page that displays the same summary payload, clearly marked as staff-review /
demo-only.
```
