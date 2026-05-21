---
id: 2026-05-21-imedtac-engineering-sync-closeout
title: "imedtac Engineering Sync Closeout And Next Steps"
date: 2026-05-21
topic: ai-triage
type: handoff
status: active
audience: internal NYCU / imedtac coordination
source:
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-engineering-sync/transcript-corrected-gpt.txt
  - ../source/2026-05-21-imedtac-engineering-sync/user-provided-meeting-record.md
  - ../source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md
---

# imedtac Engineering Sync Closeout And Next Steps

## Recommendation

We recommend treating the June customer demo as a medical workflow integration
demo:

```text
iMVS measured vital payload
-> NYCU structured question loop
-> staff_review_summary
-> staff / clinician / customer preview
```

This demonstrates the product capability that matters for 慧誠智醫（imedtac
Co., Ltd.）: vital-sign kiosk data can drive a structured AI intake workflow
without claiming autonomous diagnosis, final triage, treatment advice, or
production HIS / EMR writeback.

## Post-Sync Defaults

| Decision | Post-sync default |
| --- | --- |
| June workflow | `post_measurement_only`: measure first, ask after vitals are ready. |
| API shape | Merge start-session and vital upload for June; keep answer loop as the second endpoint. |
| Session owner | NYCU generates `session_key`; iMVS echoes it with every answer. |
| Payload policy | NYCU adapts to imedtac's existing Vital Upload API format. |
| Question types | `single_choice` and `multi_choice`; `scale` only when needed. |
| Chief complaint | `single_choice` for demo control. |
| Voice | Out of June critical path. |
| Output | `staff_review_summary`, staff-only / doctor-preview / customer-preview. |
| Product wording | `vital-aware intake support` or `AI-assisted staff-review intake workflow`. |
| Fallback | Remote REST API Mode primary; Local Scripted Demo Mode as clearly labeled backup. |
| Case script | Prepare respiratory synthetic lane plus tachycardia live-performance lane; choose after iMVS machine review. |

## Post-Duobao Internal Sync Clarification

The `2026-05-21 10:57` Jason / 多寶 internal sync sharpened the clinical and
engineering boundary after the imedtac call:

- Do not make the June demo about AI assigning a formal five-level triage
  result. That is the clinical-risk zone.
- Put the AI value in vital-aware question selection and staff-review summary
  generation.
- Keep baseline questions fixed or rule-constrained; use vital context only to
  choose the next safe question from a reviewed set.
- Confirm that iMVS can render generic question templates instead of requiring
  one hand-coded screen per question.
- Inspect an actual iMVS machine with 多寶 / 許醫師 next week before freezing the
  customer-visible flow.

## What NYCU Should Do Next

1. Update API v0.2 by `2026-05-22`.
   - Mark `post_measurement_only` as the June default.
   - Keep the two-phase / vitals-ready endpoint as future optimized mode.
   - Merge Endpoint 1 and Endpoint 3 for the first June integration pass.
   - Explain `idempotency_key`, retry behavior, and error/fallback behavior in
     plain engineering language.

2. Request the imedtac field dictionary.
   - Field names, units, required/optional, missing/failed/quality flags.
   - Blood pressure structure.
   - Whether respiratory rate exists as measured, manually entered, or absent.
   - Example payload for one synthetic or demo patient.

3. Request the imedtac question-rendering template contract.
   - Supported `question.type` values: `single_choice`, `multi_choice`,
     numeric / scale, and any yes/no shortcut.
   - Maximum visible options without scrolling.
   - Maximum label length that fits the iMVS screen.
   - Whether option count can vary per question.
   - Whether the response can carry `ui_template`, `option_count`, progress,
     and answer constraints.

4. Prepare two case lanes.
   - Respiratory synthetic lane: best for vital-aware medical story.
   - Tachycardia live-performance lane: best for real-room customer theater.
   - Keep both under staff-review wording; do not output final triage level.

5. Build or preserve fallback.
   - Remote REST API Mode for normal demo.
   - Local Scripted Demo Mode for network/API failure.
   - Static Mock Mode only if both live and local scripted modes fail.
   - Label fallback mode clearly in internal runbooks.

6. Arrange iMVS machine review with 多寶 / 許醫師.
   - Observe screen order, measurement posture, option capacity, scrolling
     tolerance, result page, and operator script.

## What imedtac Should Provide

| Needed input | Why it matters |
| --- | --- |
| Vital Upload API field dictionary | NYCU cannot build the adapter safely from guessed field names. |
| Example payload | Confirms units, required fields, and null/failure semantics. |
| UI insertion point | Confirms the question loop appears after measurement and before report. |
| Generic question-template support | Confirms NYCU can return a reusable typed question object instead of imedtac hand-coding each question screen. |
| UI option limits | Controls question wording, option count, label length, and no-scroll design. |
| Network / firewall / browser constraints | Determines whether Remote REST API Mode is realistic. |
| Local fallback acceptance | Prevents customer-demo failure if the network path breaks. |
| Demo date and script owner | Lets NYCU freeze the exact case lane and result page. |
| Engineering communication channel | Keeps field-level issues out of product-only routing. |

## What 多寶 / 許醫師 Should Review

- first live case lane;
- question wording;
- stop-rule / early handoff condition;
- staff-review summary wording;
- forbidden wording;
- whether tachycardia is safer and more performable than respiratory low-SpO2
  for the first customer-facing run.

## Demo Runbook Skeleton

```text
Mode A: Remote REST API Mode
1. Operator completes iMVS login and vital measurement.
2. iMVS sends measured vital payload to NYCU.
3. NYCU returns session_key + first question.
4. Operator answers 5-7 structured questions.
5. NYCU returns staff_review_summary.
6. imedtac shows result preview to staff / doctor / customer.

Mode B: Local Scripted Demo Mode
1. Operator switches to the preloaded synthetic script.
2. The same question/result sequence is shown locally.
3. The runbook labels this as fallback, not live API.

Mode C: Static Mock Mode
1. If interactive modes fail, show the prepared flow and result page.
2. State that the live service is unavailable and no AI-generated clinical
   summary was produced in that run.
```

## Claim Boundary

Use this sentence as the stable company-facing boundary:

```text
This demo shows a synthetic-data vital-aware intake loop for staff-review
summary generation; final clinical judgment remains with staff or clinicians.
```

Do not use:

- `AI diagnosis`;
- `final triage level`;
- `safe to go home`;
- `treatment recommendation`;
- `FDA-ready` or `510(k)-ready`;
- `production HIS / EMR writeback`.

## Next Checkpoint Definition

The next checkpoint is complete when one case can run through:

```text
imedtac-shaped vital payload
-> NYCU session_key + first question
-> 5-7 answer submissions
-> staff_review_summary
-> clearly labeled fallback path
```

with no real identifiers, no raw audio, no diagnosis, no treatment advice, no
final triage level, and no production hospital writeback.
