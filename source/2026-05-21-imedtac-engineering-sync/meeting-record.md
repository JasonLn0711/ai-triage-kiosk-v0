---
id: 2026-05-21-imedtac-engineering-sync-meeting-record
title: "2026-05-21 imedtac Engineering Sync Meeting Record"
date: 2026-05-21
topic: ai-triage
type: meeting-record
status: active
source:
  - transcript-corrected-gpt.txt
  - user-provided-meeting-record.md
---

# 2026-05-21 imedtac Engineering Sync Meeting Record

## Executive Conclusion

The `2026-05-21` sync converted the AI triage lane from a concept and pre-read
packet into a concrete June demo integration contract.

The agreed June path is a conservative, showable loop:

```text
iMVS vital-sign measurement
-> measured vital payload to NYCU
-> NYCU session_key + structured question
-> iMVS answer loop
-> staff_review_summary / demo result
-> staff, clinician, or demo-customer preview
```

This is not a diagnosis product, final triage system, treatment recommender,
or production HIS / EMR / FHIR integration. The product-minded label after the
meeting is:

```text
Vital-aware AI intake support for staff-review workflow
```

## What Changed In This Meeting

Before the meeting, NYCU recommended an optimized two-phase flow:

```text
Phase 1 during measurement: ask non-vital-dependent questions
Phase 2 after measurement: ask vital-aware follow-up
```

The meeting kept that design as a valid future workflow, but it is no longer the
June critical path. Johnny and Ben steered the June integration toward the
lowest-disruption iMVS workflow:

```text
measure first
-> ask questions after measured vitals are available
-> show report / demo result after the intake loop
```

The decisive reason is execution trust: the first customer demo must prove the
ability to connect iMVS vital data with AI intake without forcing imedtac to
rebuild the measurement experience before mid-June.

## Idea Attribution / Contribution Notes

Added after Prof. Wu's `2026-05-21 12:05` IP-protection call. These notes do
not decide legal ownership by themselves; they preserve the working record of
where each idea or constraint surfaced before deeper technical handoff.

| Idea / decision | Origin / attribution | Working note |
| --- | --- | --- |
| June `post_measurement_only` flow | imedtac / Johnny and Ben confirmed the lowest-disruption June path; NYCU accepted it as demo default. | Keeps the original two-phase NYCU design as a future workflow while reducing June integration risk. |
| Two-phase during-measurement then post-measurement flow | NYCU / Jason pre-sync API design, sharpened through 多寶 clinical workflow discussion. | Preserve as future optimized workflow; not June critical path. |
| `session_key` answer loop | NYCU / Jason API contract response to imedtac's need for a concrete integration shape. | Should stay at API-contract level in company handoff. |
| `idempotency_key` clarification | Ben / imedtac requested clearer request-field explanation. | Update API v0.2 documentation and examples. |
| Adapter around imedtac's existing Vital Upload API | Ben / imedtac engineering constraint; NYCU implementation response. | NYCU adapts to the actual field dictionary rather than forcing a new June payload. |
| Choice-first June UI | imedtac UI / engineering constraint, accepted by NYCU for demo stability. | Limits June to `single_choice`, `multi_choice`, and controlled `scale` only if needed. |
| Remote REST API Mode | NYCU / Jason proposed demo integration path; Prof. Wu later confirmed it also protects lab know-how. | Share endpoints, payload fields, and examples; keep internal routing, source-governance, scoring, and prompt logic private. |
| Local Scripted Demo fallback | NYCU / Jason demo-continuity design. | Must be labeled internally as fallback and never presented as live AI when the API is unavailable. |
| Staff-review summary boundary | NYCU safety boundary, reinforced by Johnny's product-positioning question and 多寶's later clinical caution. | Avoid diagnosis, final triage level, treatment advice, or patient-facing clinical recommendation. |
| Tachycardia / healthy-vs-unhealthy live case direction | Johnny / imedtac emphasized performability; NYCU and 多寶 to select the first safe lane. | Respiratory low-SpO2 remains a strong synthetic proof but is harder to perform live. |
| iMVS machine review | Jason raised the need to inspect actual iMVS workflow; Prof. Wu later agreed this helps assess imedtac capability. | Schedule Jason + 多寶 / 許醫師 review before over-designing from assumptions. |

## Meeting Outcomes

### 1. June Demo Flow

The June flow is `post_measurement_only`.

Confirmed sequence:

```text
user logs in
-> iMVS completes measurement
-> iMVS uploads vital payload
-> NYCU returns session_key + first question
-> iMVS renders single-choice / multi-choice questions
-> iMVS submits answer + session_key
-> NYCU returns next question or staff_review_summary
-> imedtac UI displays the demo result for staff / doctor / customer preview
```

The AI question flow is inserted after vital-sign measurement and before the
final measurement report / demo result screen.

### 2. API / Session Contract

The pre-sync API had three conceptual endpoints:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
POST /api/triage-demo/sessions/{session_key}/vitals
```

For June, Endpoint 1 and Endpoint 3 should be merged:

```text
POST /api/triage-demo/sessions
```

The first call should include the measured vital payload. NYCU then creates the
session and returns:

```text
session_key + first question
```

The answer loop remains:

```text
POST /api/triage-demo/sessions/{session_key}/answers
```

Ben confirmed the flow is workable and asked NYCU to add clearer request-field
explanations, especially for `idempotency_key`.

### 3. Vital Payload Adapter

NYCU should not force imedtac to adopt NYCU's proposed vital payload shape for
June. Ben said imedtac has an existing Vital Upload API / GitHub format.

The practical decision is:

```text
imedtac provides the actual field dictionary.
NYCU builds an adapter around imedtac's existing payload format.
```

Required imedtac field details:

- actual field names;
- units;
- required / optional status;
- missing, failed, and poor-quality value semantics;
- blood pressure structure, including whether systolic / diastolic are separate;
- actual keys for SpO2, temperature, heart rate, respiratory rate, height, and
  weight when available.

### 4. Question Types And UI Limits

June questions should be choice-first:

- `single_choice`;
- `multi_choice`;
- `scale` only if needed.

The chief complaint should also start as `single_choice` for demo stability.

imedtac UI/design asked that each question fit on one screen when possible.
NYCU question design must therefore control:

- number of options;
- option label length;
- multi-select maximum;
- mutually exclusive "none" behavior;
- visible progress;
- English wording clarity.

### 5. Voice Input

Voice is out of the June critical path.

Meeting reasons:

- the demo computer does not currently have a microphone;
- ASR adds hardware, latency, recognition-error, and privacy work;
- the June proof is vital payload + structured intake + staff summary;
- touch / choice-based flow is enough for the first market demo.

Voice / ASR should remain a future capability after the API loop is stable.

### 6. Remote API And Local Fallback

Primary mode:

```text
Remote REST API Mode
iMVS / demo UI -> NYCU lab backend -> AI intake engine -> response
```

Fallback mode:

```text
Local Scripted Demo Mode
prebuilt synthetic flow hosted or operated locally by imedtac if network/API fails
```

The fallback is a demo-continuity tool. It must be labeled internally and must
not be presented as a live AI result when the live API is unavailable.

### 7. Product Positioning

Johnny raised the core product question:

```text
If the output is only measured facts and patient-reported facts, where is triage?
```

The answer after the meeting is to avoid overclaiming. The June product story is
not "AI assigns final triage level." It is:

```text
measured vital signs + short structured intake -> staff-review summary
```

Recommended external wording:

- `vital-aware intake support`;
- `AI-assisted staff-review intake workflow`;
- `synthetic-data workflow demo`.

Avoid:

- `AI diagnosis`;
- `final triage level`;
- `AI replaces nurse triage`;
- `treatment recommendation`;
- `production HIS / EMR writeback`.

### 8. Staff Summary Visibility

The staff summary should not be treated as patient-facing clinical advice.

June display model:

```text
patient completes measurement and questions
-> staff / doctor / demo customer can preview summary
-> patient does not need to see staff_review_summary
```

This supports the demo-doctor-result page while preserving the staff-review
boundary.

### 9. Demo Case Strategy

The respiratory low-SpO2 case is clinically expressive but hard to perform live
with a real person because SpO2 is difficult to control.

Johnny recommended designing a live script around controllable differences:

- heart rate can be increased through running or squats;
- temperature can be staged with demo setup;
- blood pressure has limited controllability;
- SpO2 is not reliably controllable for a live participant.

The strongest script is a contrast:

```text
healthy/control participant
vs
unhealthy/demo participant
```

Recommended case lanes:

| Lane | Role | Why |
| --- | --- | --- |
| Respiratory synthetic lane | Keep as synthetic API / summary proof | Best vital-aware medical story, but less live-performable. |
| Tachycardia / palpitations live-performance lane | Prepare as live demo candidate | Heart rate can be affected in the room and feels real to customers. |
| Fever / URI light lane | Use as lower-acuity contrast | Helps show the system does not always produce the same summary. |
| Abdominal pain + fever lane | Future expansion | Useful broader symptom coverage after one loop works. |

### 10. Engineering Communication

Johnny agreed direct engineering communication is acceptable. A Teams or LINE
channel should be created so Jason / NYCU can ask Ben or the engineering owner
field-level questions without routing every detail through product coordination.

### 11. iMVS Machine Review

Jason and 許醫師 should arrange a short visit or review session to see the iMVS
machine and UI flow. This is necessary for question wording, option count,
screen fit, measurement posture, and live demo script design.

## Action Matrix

| Owner | Deliverable | Recommended due | Acceptance check |
| --- | --- | --- | --- |
| imedtac engineering / Ben | Actual Vital Upload API field dictionary. | `2026-05-22` | Names fields, units, required/optional status, missing/failed/quality semantics. |
| imedtac engineering / Ben | Confirm external connectivity and fallback constraints. | `2026-05-22` | States whether the demo can call external HTTPS / NYCU server, and whether local scripted fallback can be hosted or launched. |
| imedtac UI/design | Confirm AI question insertion point. | `2026-05-22` | AI flow appears after measurement and before final report / result page for June. |
| imedtac UI/design | Provide UI limits for choices. | `2026-05-22` | Maximum visible options, label length expectations, progress display, and whether scrolling is acceptable. |
| Johnny / product | Confirm June demo date, audience, and operating script. | `2026-05-22` | Names expected customer date, who operates, and whether healthy/unhealthy contrast is the preferred script. |
| Johnny / product | Confirm external language. | `2026-05-22` | Use `vital-aware intake support` / staff-review wording rather than final clinical triage claims. |
| Jason / NYCU | Update API v0.2 after sync. | `2026-05-22` | Marks `post_measurement_only` as June default, merges Endpoint 1/3 for June, explains `idempotency_key`, and keeps Endpoint 3 as future optimized mode. |
| Jason / NYCU | Prepare remote API and local scripted fallback plan. | `2026-05-25` | One synthetic flow can run in Remote REST API Mode and has a labeled Local Scripted Demo fallback. |
| Jason + 多寶 / 許醫師 | Choose first live-performable case lane. | `2026-05-22` | Decide whether June first shown case is respiratory synthetic, tachycardia live-performance, or a paired healthy/unhealthy script. |
| 多寶 / 許醫師 | Review safe question wording and summary wording. | `2026-05-22` | No diagnosis, treatment, final triage level, or patient-facing clinical advice. |
| Privacy/security owner | Confirm demo data boundary. | `2026-05-22` | No real identifiers, raw audio, production HIS/EMR endpoint, credentials, or live patient data in demo payloads/logs. |

## Immediate Next Sequence

### Today: 2026-05-21

1. Archive the transcript and meeting record in this repo.
2. Update source index, API handoff, owner matrix, workstream status, and
   planning locator.
3. Send or prepare a concise post-sync note to Johnny / Ben if needed:
   post-measurement flow, Endpoint 1/3 merge, field dictionary ask, no voice,
   fallback modes, and case-script decision.

### Friday: 2026-05-22

1. Produce the post-sync API v0.2 update.
2. Request imedtac field dictionary and UI limits.
3. Ask 多寶 / 許醫師 to approve the first case lane and staff-summary wording.
4. Decide whether the runnable respiratory case must be adapted to
   `post_measurement_only` before the next demo rehearsal.

### Monday: 2026-05-25

1. Rehearse one complete loop with sample payload, answer loop, and summary.
2. Prepare local scripted fallback with explicit fallback label.
3. Freeze the first customer-demo script: operator, case, vital values,
   expected answer choices, result page, and recovery plan.

## Open Questions

1. What is the actual mid-June customer date and audience composition?
2. Who is the named imedtac engineering owner after Ben's meeting participation?
3. What exact Vital Upload API shape should NYCU support first?
4. Does imedtac want the first customer-visible case to be respiratory synthetic
   or tachycardia live-performance?
5. What UI option count and label length can fit without scrolling?
6. What exact wording should appear on the summary / result preview page?
7. Where will the local scripted fallback run: imedtac UI, local browser page,
   laptop server, or static mock page?

## Safety And Claim Controls

The post-sync path preserves these controls:

- synthetic demo only;
- staff-review summary only;
- no diagnosis;
- no treatment advice;
- no final triage / acuity level;
- no production HIS / EMR / FHIR writeback;
- no real patient identifiers;
- no raw audio;
- no hidden fallback pretending to be live AI.

## Source Evidence Map

| Decision | Evidence location |
| --- | --- |
| Post-measurement June flow | `transcript-corrected-gpt.txt`, `00:16:58-00:23:11`; `user-provided-meeting-record.md`, sections 3-4. |
| Endpoint 1/3 merge | `transcript-corrected-gpt.txt`, `00:19:59-00:23:11`; `user-provided-meeting-record.md`, section 4. |
| Use imedtac Vital Upload API shape | `transcript-corrected-gpt.txt`, `00:23:13-00:26:21`; `user-provided-meeting-record.md`, section 5. |
| Choice-first UI | `transcript-corrected-gpt.txt`, `00:10:39-00:12:18` and `00:23:13-00:26:21`; `user-provided-meeting-record.md`, section 6. |
| Voice out for June | `transcript-corrected-gpt.txt`, `00:26:21-00:29:25`; `user-provided-meeting-record.md`, section 8. |
| Remote API plus local fallback | `transcript-corrected-gpt.txt`, `00:10:39-00:12:18` and `00:26:21-00:29:25`; `user-provided-meeting-record.md`, section 9. |
| Product positioning / triage boundary | `transcript-corrected-gpt.txt`, `00:33:03-00:39:09`; `user-provided-meeting-record.md`, sections 11-12. |
| Live case performability | `transcript-corrected-gpt.txt`, `00:45:45-00:50:30`; `user-provided-meeting-record.md`, section 10. |
