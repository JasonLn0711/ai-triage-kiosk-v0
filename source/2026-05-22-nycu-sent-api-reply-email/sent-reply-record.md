---
id: 2026-05-22-nycu-sent-api-reply-email-record
title: "Sent Reply Record - API Reply Email"
date: 2026-05-22
topic: ai-triage
type: source-transcription
status: active
source:
  - assets/Gmail - [20250521] AI Triage 進度討論.pdf
  - extracted/Gmail - [20250521] AI Triage 進度討論.txt
---

# Sent Reply Record - API Reply Email

## Metadata

- Thread subject: `[20250521] AI Triage 進度討論`
- From: Jason Lin `<cre062400@gmail.com>`
- Sent: Friday, `2026-05-22 12:17`
- To: Johnny Fang 方偉翰, imedtac Corp.
- Cc: 多寶 / 許醫師, Jason Miao 苗中聖, Ben Siu 蕭銳輝, Ken Yu 余金樹, Prof. Wu
- Attachments:
  - `2026-05-21-imedtac-two-endpoint-api-reply.md`
  - `iMVS__NYCU_AI_Triage_Demo_有關_Endpoint_API_回覆文件.pdf`

## Sent Email Body

Ben、Lauren、Johnny 大家好，

依照 5/21 會議後確認的方向，隨信附上 NYCU 端整理的 endpoint API 回覆文件與相關範例，供貴司工程團隊進行六月 demo 串接準備。

本版 demo contract 聚焦在最小可跑通流程：

1. iMVS 完成 vital-sign measurement 後，呼叫 NYCU start-session endpoint。
2. NYCU 回傳 `session_key` 與第一題 question object。
3. iMVS 透過 answer endpoint 回傳 `selected_option_ids`。
4. NYCU 回傳下一題，或最後回傳 `staff_review_summary` 供 staff / doctor / customer demo preview 使用。

針對使用者不確定或答不出來的情境，建議使用明確的 `not_sure` option id，而非 generic skip。這樣雙方在 API 與 summary 中都能保留可解讀的回答狀態。

為了讓雙方工程串接穩定，我們建議這份文件送出後作為六月 demo 的 API implementation baseline。若後續需要調整 endpoint、欄位名稱、required/optional、enum、answer behavior 或 UI constraints，再由雙方明確提出並確認 change request，避免工程端依據不同版本實作。

再麻煩貴司協助確認幾項串接資訊：

1. iMVS UI 對 question template、option 數量、label 長度與 no-scroll 顯示限制。
2. Demo 環境中的 API base URL、CORS / firewall / authentication 路徑。
3. `staff_review_summary` 在貴司 UI 中預計顯示的位置。

謝謝，

林家聖 (Jason Lin)

國立陽明交通大學

醫工學院 生醫光電研究所 博士班

Email: `cre062400@gmail.com`

## Baseline Rule Captured By This Email

Because this email and the attached API reply were sent externally, the June demo settings should now follow this baseline. Future changes to endpoint path, field names, required/optional status, enum values, answer behavior, UI constraints, or summary shape should be handled through a clearly recorded change request rather than silent edits.
