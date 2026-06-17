---
id: 2026-06-17-imedtac-python-mvp-test-note-draft
title: "imedtac Python MVP Test Note Draft"
date: 2026-06-17
topic: ai-triage
type: external-test-note-draft
status: draft-internal-review
related:
  - ../API.md
  - ./2026-06-17-python-mvp-contract-compatibility-note.md
  - ./2026-06-17-contract-compatible-python-mvp-goal-prompt.md
---

# imedtac Python MVP Test Note Draft

我們建議這次測試維持既有兩個 endpoint 與既有 question object 格式。後端已改為
Python/FastAPI runtime，但 iMVS 前端的呼叫方式不變：

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

本次 MVP 仍只回傳 `single_choice` / `multi_choice` 題型。時間長短類問題已先轉成
選項式回答，以符合目前 UI 不新增 numeric / time widget 的整合方向。最終
`staff_review_summary` 會使用本次 session 的量測生命徵象與使用者選項，供工作人員
review。

測試時希望請慧誠智醫（imedtac Co., Ltd.）協助確認：

- iMVS 前端是否能照既有兩個 endpoint 完成 start session 與 answer loop。
- 每題選項數與 label 長度是否能在目前 UI 中穩定呈現，尤其是不捲動的 `9` 個選項上限。
- duration bucket 題型是否符合目前單選 UI。
- 高心跳測試 payload 是否能清楚呈現不同量測資料帶出不同問題流程。
- `staff_review_summary` 是否能在既有 preview / report surface 中顯示量測生命徵象與選項摘要。

Bearer token 會透過私下通道提供，不寫入 repo、文件或截圖。

本測試定位為 synthetic-data staff-review intake support 與 human review workflow
驗證；production integration 與 clinical validation 會走獨立確認路徑。
