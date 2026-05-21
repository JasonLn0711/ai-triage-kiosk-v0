---
id: 2026-05-21-imedtac-engineering-sync
title: "2026-05-21 imedtac Engineering Sync Source Bundle"
date: 2026-05-21
topic: ai-triage
type: source
status: active
source_owner: user-provided
meeting_time: "09:59 Asia/Taipei"
company: "慧誠智醫（imedtac Co., Ltd.）"
raw_files:
  - transcript-corrected-gpt.txt
  - user-provided-meeting-record.md
derived_analysis:
  - meeting-record.md
  - ../../handoff/2026-05-21-imedtac-engineering-sync-closeout.md
---

# 2026-05-21 imedtac Engineering Sync Source Bundle

This folder is the canonical execution-repo archive for the `2026-05-21`
慧誠智醫（imedtac Co., Ltd.） / NYCU AI triage engineering sync.

The source files were copied into this repo on `2026-05-21` and renamed for
durable routing:

| Local file | Original source path | SHA-256 |
| --- | --- | --- |
| `transcript-corrected-gpt.txt` | `/home/jnclaw/every_on_git_jnclaw/project_aura/260521_0959_imedtac_sync/2026-05-21-imedtac-sync-corrected-transcript_GPT.txt` | `9f42aae6b3af95c37f9cc0dc2630b1bdc94f6392e933376c943f7b386656770b` |
| `user-provided-meeting-record.md` | `/home/jnclaw/Downloads/799f7669-b59b-40de-ab89-b82f60abe69d_ExportBlock-3475145b-3471-471b-b414-7dd6f9f33196/ExportBlock-3475145b-3471-471b-b414-7dd6f9f33196-Part-1/AI-Triage 合作會議記錄（NYCU 吳老師團隊 × 慧誠智醫）260521.md` | `ec4ac2cb8236f8e56c7a929c846343a083a022a7feec0d7ee350ebe7d7e7281b` |

## Meeting Context

- Meeting topic: iMVS / NYCU AI triage demo engineering sync, API v0.2,
  UI insertion, and June customer-demo flow.
- Key participants: Johnny Fang, Ben / imedtac engineering, imedtac UI/design,
  Jason / NYCU, and 多寶 / 許醫師.
- Meeting result: the June demo moved from the pre-sync two-phase proposal to a
  conservative post-measurement workflow for the first integration pass.

## Working Interpretation

This source bundle should be read as the post-sync correction to the
`2026-05-20` API v0.2 pre-read.

The current June direction is:

```text
iMVS completes vital-sign measurement
-> iMVS sends the measured vital payload to NYCU
-> NYCU returns session_key + first structured question
-> iMVS submits answers in a short loop
-> NYCU returns staff_review_summary for staff / clinician / demo-customer review
```

The pre-sync two-phase flow remains a future optimized path, not the first June
integration default.

## Source Rules

- Do not edit `transcript-corrected-gpt.txt` as if it were a clean official
  transcript. It is a corrected ASR transcript with speaker uncertainty.
- Do not edit `user-provided-meeting-record.md` as the canonical derived record.
  It is the imported meeting note supplied by the user.
- Use `meeting-record.md` for the current repo-level interpretation, decisions,
  action matrix, and next-step routing.
