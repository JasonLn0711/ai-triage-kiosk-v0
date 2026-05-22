---
id: 2026-05-22-nycu-sent-api-reply-email
title: "2026-05-22 NYCU Sent API Reply Email"
date: 2026-05-22
topic: ai-triage
type: source
status: active
source_note: user-provided Gmail PDF export after Jason sent the API reply email
assets:
  - assets/Gmail - [20250521] AI Triage 進度討論.pdf
  - extracted/Gmail - [20250521] AI Triage 進度討論.txt
related:
  - ../../handoff/2026-05-21-imedtac-two-endpoint-api-reply.md
  - ../../decisions/2026-05-22-api-contract-freeze-and-change-control.md
  - ./sent-reply-record.md
---

# 2026-05-22 NYCU Sent API Reply Email

## Source Boundary

This folder preserves the Gmail PDF `Gmail - [20250521] AI Triage 進度討論.pdf` provided by Jason after sending the NYCU API reply email on `2026-05-22 12:17`. This is the evidence that the API reply packet was sent to the imedtac thread.

The PDF contains both Johnny Fang's original `2026-05-21 13:35` progress-record email and Jason's `2026-05-22 12:17` reply. The earlier Johnny-only PDF is separately preserved in `source/2026-05-21-imedtac-post-meeting-progress-record/`.

The extracted text contains Gmail export layout artifacts and PDF text extraction glyph issues. Use `sent-reply-record.md` as the readable working transcription of Jason's sent reply, and use the PDF as the source artifact.

## Preserved Files

- Original PDF: `assets/Gmail - [20250521] AI Triage 進度討論.pdf`
- Extracted text: `extracted/Gmail - [20250521] AI Triage 進度討論.txt`
- Working transcription: `sent-reply-record.md`

## Evidence Summary

Email metadata from the PDF:

- Thread subject: `[20250521] AI Triage 進度討論`
- Sent reply from: Jason Lin `<cre062400@gmail.com>`
- Sent time: `2026-05-22 12:17`
- To: Johnny Fang
- Cc: 多寶 / 許醫師, Jason Miao, Ben Siu, Ken Yu, Prof. Wu

Attachments recorded in the PDF:

- `2026-05-21-imedtac-two-endpoint-api-reply.md`
- `iMVS__NYCU_AI_Triage_Demo_有關_Endpoint_API_回覆文件.pdf`

## Working Implication

The sent reply establishes that NYCU externally communicated a June demo API implementation baseline. Future engineering changes should follow `handoff/2026-05-21-imedtac-two-endpoint-api-reply.md` and the sent email's small-contract framing unless a later recorded change request explicitly updates the baseline.
