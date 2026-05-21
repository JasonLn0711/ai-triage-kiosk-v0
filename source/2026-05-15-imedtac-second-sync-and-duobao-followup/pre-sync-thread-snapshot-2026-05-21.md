---
id: 2026-05-21-imedtac-pre-sync-thread-snapshot
title: "2026-05-21 imedtac Pre-Sync Gmail Thread Snapshot"
date: 2026-05-21
time: "09:50 Asia/Taipei"
topic: ai-triage
type: source-thread-snapshot
source: gmail-thread-pdf-export
status: active
pdf_file: assets/2026-05-21-imedtac-meeting-minutes-thread-pre-sync.pdf
extracted_text_file: extracted/2026-05-21-imedtac-meeting-minutes-thread-pre-sync.txt
related_original_minutes: company-provided-meeting-minutes.md
related_pre_read: ../../handoff/2026-05-20-imedtac-pre-meeting-api-v02-pre-read.md
related_api_draft: ../../handoff/2026-05-21-imvs-nycu-api-design-v0.2-draft.md
---

# 2026-05-21 imedtac Pre-Sync Gmail Thread Snapshot

This note records the complete Gmail thread exported before the `2026-05-21`
imedtac engineering sync. The export extends the original `2026-05-15`
company-side meeting minutes with the NYCU pre-read response and Johnny's
engineering-loop reply.

Original files:

- PDF: `assets/2026-05-21-imedtac-meeting-minutes-thread-pre-sync.pdf`
- Searchable text: `extracted/2026-05-21-imedtac-meeting-minutes-thread-pre-sync.txt`
- SHA-256 PDF checksum:
  `9c2ce08a45bdb69091140c6061f9cd1377152c0776347174cb7ba40723fa562d`
- SHA-256 text checksum:
  `327a82f37a138aaa892cf483f4c508f06ec4894ca4299c10b150d97670d39a56`

## Thread Messages

| Time | Sender | Recipients / cc | Meaning for project |
| --- | --- | --- | --- |
| `2026-05-15 15:25` | Johnny Fang / imedtac | Jason Lin, Jason Miao; cc Ken Yu and Prof. Wu | Company-side minutes: foreign urgent-care target, June US-customer demo, `3-5` demo cases, touch / partial voice input, `8-10` questions, chief-complaint summary for doctors, imedtac workflow/spec and technical discussion, NYCU case study and architecture design. Johnny also invited adding 許醫師 to the email loop if needed. |
| `2026-05-20 22:21` | Jason Lin / NYCU | Johnny Fang; cc Jason Miao, Ken Yu, Prof. Wu, 許醫師 | NYCU sent the API v0.2 pre-read before the 5/21 sync. Core recommendation: fix the June demo as a synthetic-data vital-aware intake loop where iMVS sends a synthetic vital payload, NYCU returns typed question objects and `session_key`, iMVS sends structured answers, and NYCU returns `staff_review_summary` for staff / clinician review. |
| `2026-05-21 09:48` | Johnny Fang / imedtac | Jason Lin and Ben Siu; cc Jason Miao, Ken Yu, Prof. Wu, 許醫師 | Johnny added Ben Siu from the engineering team to the loop and stated that detailed points can be discussed in the meeting. This confirms the 5/21 sync is an engineering-facing API / integration discussion, not only a product-status update. |

## Complete Content Record

The first message is already analyzed in
`company-provided-meeting-minutes.md`. The thread export confirms that the
original 5/15 minutes stayed the anchor for the 5/21 discussion.

The 5/20 NYCU response recorded these concrete pre-sync commitments:

- NYCU recommends a June demo built around a synthetic-data vital-aware intake
  loop.
- iMVS provides a synthetic vital-sign payload.
- NYCU returns a structured question object and `session_key`.
- iMVS returns structured answers.
- NYCU returns `staff_review_summary` for staff / clinician review.
- The pre-read covers API v0.2 contract direction, vital payload fields, the
  first respiratory demo case, staff-review summary format, error fallback, and
  owner/date decisions for the 5/21 sync.
- The specific decisions requested from imedtac are actual field dictionary, UI
  insertion point, `session_key` ownership, Phase 1 during measurement
  feasibility, first respiratory case and safe summary wording, and confirmed
  API v0.2 delivery timing.

The 5/21 Johnny reply recorded one important status change:

- Ben Siu is now included as imedtac engineering representative for the
  detailed discussion.

## Progress Interpretation

This thread upgrades the 5/21 meeting from a general follow-up to a concrete
engineering sync. The active agenda should be:

1. Confirm actual iMVS field dictionary and units.
2. Confirm where the AI intake UI is inserted.
3. Decide whether NYCU or iMVS owns `session_key`.
4. Decide whether Phase 1 questions can run during measurement.
5. Confirm the first respiratory case and staff-review wording.
6. Assign owner/date for the confirmed API v0.2 handoff.

## Boundary

Keep this thread local. The export contains private email metadata and company
confidentiality language. It should support local execution planning and
meeting preparation, not public release.
