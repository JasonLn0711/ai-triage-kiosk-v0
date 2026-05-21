---
id: 2026-05-21-duobao-post-imedtac-internal-sync
title: "2026-05-21 Duobao Post-imedtac Internal Sync Source Bundle"
date: 2026-05-21
topic: ai-triage
type: source
status: active
source_owner: user-provided
meeting_time: "10:57 Asia/Taipei"
participants:
  - Jason / NYCU
  - 多寶 / 許醫師
raw_files:
  - transcript-corrected-gpt-source.txt
  - transcript-gemini-reference.txt
derived_analysis:
  - transcript-corrected.md
  - meeting-record.md
related_source:
  - ../2026-05-21-imedtac-engineering-sync/meeting-record.md
---

# 2026-05-21 Duobao Post-imedtac Internal Sync Source Bundle

This folder is the canonical execution-repo archive for Jason and 多寶's
internal post-meeting discussion immediately after the `2026-05-21` 慧誠智醫
engineering sync.

The source files were copied into this repo on `2026-05-21` and renamed for
durable routing:

| Local file | Original source path | SHA-256 |
| --- | --- | --- |
| `transcript-corrected-gpt-source.txt` | `/home/jnclaw/every_on_git_jnclaw/project_aura/260521_1057_duobao/2026-05-21-duobao-post-meeting-corrected-transcript_GPT.txt` | `e05da1df9db7079d5bfeffcd8847efbe8b499447d789bf84fe47a26afc6ba1a6` |
| `transcript-gemini-reference.txt` | `/home/jnclaw/every_on_git_jnclaw/project_aura/260521_1057_duobao/transcript_260521_1057_duobao_final (gemini).txt` | `3f185437913d3e02ea234490e97d87b01c79b6aed65a7323eb12b763246550f7` |
| `transcript-corrected.md` | Derived from the GPT corrected transcript with additional header, source-routing notes, and project-context correction | `b531f9e893c273ea8c4b9d1acb2ec598040460b356857051c0b01c5f8f5b1447` |

## Source Relationship

This is not the official imedtac meeting record. It is an internal clinical /
engineering interpretation discussion after the company sync.

Use it to understand:

- why direct triage-level output is risky;
- where AI can be productively placed without overclaiming;
- why UI question templates are now an engineering requirement;
- why the post-measurement flow is realistic for the first June demo;
- why Jason and 多寶 should see the actual iMVS machine before finalizing the
  question flow.

## Working Interpretation

The discussion narrows the June plan:

```text
do not output final triage level
-> keep staff-review summary
-> use AI for vital-aware question selection or summary generation
-> require reusable iMVS UI question templates
-> inspect the actual machine before making more flow assumptions
```

This source strengthens the post-sync direction from
`source/2026-05-21-imedtac-engineering-sync/meeting-record.md`.

## Source Rules

- `transcript-corrected-gpt-source.txt` is preserved as the copied GPT artifact.
- `transcript-gemini-reference.txt` is preserved as a short reference / cross
  check, not the main transcript.
- `transcript-corrected.md` is the readable corrected transcript to use in this
  repo.
- `meeting-record.md` is the current decision and planning interpretation.
