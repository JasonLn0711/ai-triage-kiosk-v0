---
id: 2026-05-21-to-2026-05-25-imedtac-response-plan
title: "imedtac Response Plan Through 2026-05-25"
date: 2026-05-21
topic: ai-triage
type: handoff
status: achieved-ready-for-next-step
audience: internal NYCU / Jason / 多寶 coordination
source:
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ../source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md
  - ../source/2026-05-25-duobao-afrvr-tachycardia-case/source.md
  - ../source/2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md
  - ./2026-05-21-imedtac-two-endpoint-api-reply.md
  - ./2026-05-21-duobao-style-tachycardia-live-demo-question-set.md
  - ./2026-05-21-imedtac-engineering-open-issues-checklist.md
  - ./2026-05-25-imedtac-integration-next-steps.md
---

# imedtac Response Plan Through 2026-05-25

## Answer

Yes. By Monday `2026-05-25`, NYCU can respond to imedtac's current engineering
needs if the scope is:

```text
two-endpoint API document
-> JSON examples
-> preset question / option template for the first demo lane
-> skip-behavior recommendation after 多寶 / 許醫師 discussion
-> clear list of remaining inputs needed from imedtac
```

Do not frame Monday as a frozen clinical triage product, final clinical
threshold package, production integration specification, or formal HIS / EMR
writeback design.

## 2026-05-25 Delivery Status

The `2026-05-25` delivery target is achieved for the current imedtac response
package.

多寶 has provided the Case 2 AfRVR-style tachycardia question-answer demo case.
It is archived as:

```text
source/2026-05-25-duobao-afrvr-tachycardia-case/
```

This closes the first-lane case input for the Monday package: NYCU now has the
two-endpoint API document, JSON examples, a tachycardia question / option
template aligned to 多寶's selected answers, and a skip-behavior position based
on explicit `Not sure`, `None of these`, or staff-confirmation options instead
of silent skip for required safety / handoff questions.

The package can move to the next step: send the consolidated response to
imedtac, request current field-dictionary and UI rendering-limit confirmation,
and rehearse the tachycardia lane through Endpoint 1 and Endpoint 2.

Teams `2026-05-25` adds the next engineering bridge: reply to Ben on
`request_id` / `idempotency_key`, clarify that `capabilities.max_questions` is
a cap while `progress.expected_total` should drive `Question X of Y`, align to
the imedtac UI working layout of up to `9` short options without scroll,
confirm whether summary display should use the existing iMVS result / preview
page or a temporary NYCU-hosted demo preview, and prepare CORS for
`http://localhost` and `http://localhost:5174`.

## Incoming Requests To Cover

### From Johnny's post-meeting Gmail record

imedtac recorded:

- US customer demo around `2026-06-10`.
- Demo flow: measure first, then ask questions.
- API: merge Endpoint 1 and Endpoint 3; after imedtac uploads measurement data,
  NYCU returns `Session Key` plus first question; later calls use Endpoint 2 for
  one-question / one-answer loop.
- UI: generated questions should be `single_choice` or `multi_choice`.
- UI: imedtac will add a demo preview button / page after the measurement report
  for the AI-organized summary / result.
- Voice is out of the current demo.
- Proposed live demo lane: tachycardia / arrhythmia / chest tightness because
  on-site staff can raise heart rate through exercise.
- NYCU action items: adjust API logic and provide the demo script, parameters,
  and expected AI output.

### From Johnny / Ben / Lauren's Microsoft Teams follow-up

imedtac asked:

- provide the two-endpoint API document;
- provide template contents by tomorrow or Monday, including preset questions
  and options;
- confirm whether a user may skip a question if they cannot answer.

## Delivery Plan

| Date | Deliverable | Owner | Status | Notes |
| --- | --- | --- | --- | --- |
| Thu `2026-05-21` night | Discuss Johnny's two Teams questions with 多寶. | Jason + 多寶 | achieved / recorded | 多寶's `2026-05-25` case closes the first-lane question-template input; skip behavior is handled through explicit answer options rather than silent skip for required questions. |
| Thu `2026-05-21` night or Fri `2026-05-22` morning | Send holding reply in Teams. | Jason | ready | Acknowledge two-endpoint API document; say question template and skip behavior will be confirmed after internal clinical review. |
| Fri `2026-05-22` | Send two-endpoint API document draft. | Jason / NYCU | ready as draft | Use `handoff/2026-05-21-imedtac-two-endpoint-api-reply.md`. |
| Fri `2026-05-22` | Track engineering open issues and change-control. | Jason | ready as checklist | Use `handoff/2026-05-21-imedtac-engineering-open-issues-checklist.md`; send selected P0/P1 asks to imedtac. |
| Fri `2026-05-22` | Draft preset question / option template. | Jason | achieved for first lane | Use `handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md` for the tachycardia live lane; 多寶's `2026-05-25` case confirms the selected answer path. Keep single-choice / multi-choice only and include `Not sure`, `None of these`, or staff-confirmation options where clinically safer than silent skip. |
| Fri `2026-05-22` | Ask imedtac for current field-dictionary deltas from the 5/12 iMVS V1.4 baseline and UI limits. | Jason | pending | Required to freeze exact payload names, optionality, missing/failure semantics, and rendering constraints. |
| Sat-Sun `2026-05-23` to `2026-05-24` | Refine tachycardia live-performance lane and respiratory synthetic fallback lane. | Jason + 多寶 / 許醫師 if available | achieved for tachycardia lane | 多寶's case confirms the tachycardia Q/A path; respiratory remains available as a synthetic fallback. Avoid diagnosis, final triage level, treatment, disposition, or department recommendation. |
| Mon `2026-05-25` | Send confirmed question / option template and skip-behavior answer. | Jason / NYCU | achieved; ready for next step | Include what is final for demo and what remains pending imedtac field-dictionary / UI confirmation. |

## Teams Reply Strategy For Tonight Or Tomorrow Morning

Do not answer the skip question as final before discussing with 多寶.

Safe holding reply:

```text
Ben、Lauren、Johnny 大家好，收到，謝謝。

我們會先依照今天會議確認的 post-measurement-only flow 整理兩個 endpoint 的 API 文件：

1. Start session with measured vitals：iMVS 完成量測後送 measured vital payload，NYCU 回 session_key 與第一題 question object。
2. Submit answer：iMVS 帶 session_key 回傳答案，NYCU 回下一題 question object 或 staff_review_summary。

題目與選項範本、以及「使用者答不出來是否可略過」這兩點，我們今晚或明早先跟多寶 / 臨床端確認後回覆。初步方向會以單選 / 複選、demo-safe wording、以及 staff-review summary boundary 為主。
```

## Recommended Position Before 多寶 Review

### Question / option template

Recommended structure:

- one row per question;
- `question_id`;
- `question.type`: `single_choice` or `multi_choice`;
- `question.text`;
- option ids and labels;
- required / optional status;
- whether `Not sure` or `Unable to answer` is included;
- clinical review owner;
- output effect in `staff_review_summary`;
- forbidden output language.

Current first-lane packet:

```text
handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md
```

This packet implements the post-meeting decision to lead with a live-performable
tachycardia / palpitation / chest-tightness lane while keeping respiratory
low-SpO2 as a synthetic fallback lane. It also records the API impact: endpoints
stay the same, but `flow_version`, `case_id`, `question_set_version`, and
question-object metadata must reflect the tachycardia lane.

### Skip behavior

Working recommendation:

- Do not use a generic silent skip for required safety questions.
- For user uncertainty, prefer explicit answer options:
  - `Not sure`
  - `Unable to answer`
  - `None of these`
- If a question is non-critical and imedtac needs a skip button, represent it
  explicitly in the API:

```json
{
  "answer": {
    "selected_option_ids": [],
    "scale_value": null,
    "skipped": true,
    "skip_reason": "user_unable_to_answer"
  }
}
```

- If required information is missing, `staff_review_summary` should say
  information is incomplete and staff should confirm, rather than inventing a
  clinical conclusion.

Teams `2026-05-25` refinement:

- imedtac UI plans to keep `I'm not sure`.
- imedtac UI does not plan to keep a static `None of these` button.
- If NYCU needs "none of these" for a specific question, return it as a normal
  option id in `question.options`.

Confirm with 多寶:

- Which first-lane questions are required?
- Which can include `Not sure`?
- Which can be optional?
- Whether a generic "skip" button is acceptable in the first customer demo.

## Monday Deliverable Boundary

Can deliver by Monday:

- two-endpoint API contract;
- JSON examples;
- API change-control note: question wording and option changes are versioned
  through `question_set_version` / `wording_version`, not endpoint churn;
- question template for first demo lane;
- skip-behavior policy;
- imedtac input checklist;
- demo-safe staff-review output wording draft.

Should not claim by Monday:

- final triage level;
- diagnosis;
- treatment recommendation;
- formal SOAP Assessment / Plan;
- production HIS / EMR writeback;
- clinical threshold validation;
- validated tachycardia/arrhythmia diagnostic logic.

## Open Inputs From imedtac

Need from imedtac to freeze engineering details:

- actual Vital Upload API field dictionary;
- example payload;
- session lifecycle expectations: expiry, refresh/recovery, abandoned sessions,
  and whether summary-ready sessions can accept more answers;
- timeout / retry / idempotency expectations, including the June rule that
  `idempotency_conflict` recovery is restart demo session and iMVS locks
  answer-related controls after submit until NYCU returns next question or
  summary;
- UI insertion point after measurement report;
- question template limits: current signal is up to `9` short options
  without user scroll; exact label-length guidance remains useful;
- whether `Not sure` / `Unable to answer` options are acceptable in UI;
- where `staff_review_summary` appears; current preferred path is iMVS-native
  rendering in the existing result / preview page, with NYCU-hosted preview only
  as a temporary rehearsal/debug surface if needed;
- demo environment, API base URL constraints, CORS / firewall constraints;
- whether a local scripted fallback is acceptable and how it should be labeled.

## Engineering Open Issues Tracker

Canonical tracker:

```text
handoff/2026-05-21-imedtac-engineering-open-issues-checklist.md
```

Use that file to keep the P0 / P1 / P2 issues separate from the external API
contract. The external API file should stay concise; the checklist owns
session lifecycle, fallback, mock server, observability, acceptance criteria,
and safety / product-boundary follow-up.
