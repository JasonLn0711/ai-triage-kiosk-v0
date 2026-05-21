---
id: 2026-05-21-wu-line-ai-triage-patent-protection-thinking-and-schedule
title: "Thinking And Schedule - AI-Triage Patent Protection"
date: 2026-05-21
topic: ai-triage
type: planning-analysis
status: active
source:
  - line-thread.md
related:
  - ../../handoff/patent/2026-05-22-ai-triage-patent-disclosure-draft.md
---

# Thinking And Schedule - AI-Triage Patent Protection

## Core Interpretation

Prof. Wu's LINE message upgrades the AI-Triage patent draft from a background
documentation task into a cooperation-protection gate.

The working principle is:

```text
Share enough to keep imedtac integration moving.
Protect the reusable method before teaching the full system logic.
```

This is a cooperation posture, not an adversarial posture. Prof. Wu explicitly
said that long-term cooperation requires people to first clarify boundaries.

## Thinking Frame For Jason

### 1. Separate Three Layers

| Layer | What to share now | What to protect first |
| --- | --- | --- |
| Demo API | Request / response shape, session key, typed questions, fallback behavior. | Exact reusable routing logic, prioritization method, source-governance mechanism, patent claim structure. |
| Clinical workflow | Staff-review summary boundary, no formal triage level, safe wording. | Detailed invention framing around vital-sign-driven dynamic intake and controlled handoff. |
| Implementation | Mock payloads, example JSON, local scripted fallback. | Prompt chains, embedding strategy, scoring, model/process details, case-expansion method, trade-secret knobs. |

### 2. Patentable Center

The likely patent center is not "AI triage" as a generic phrase. It is the
workflow method:

```text
measured vital payload
-> vital-context adapter
-> controlled question bank / source-governed question router
-> dynamic next-question selection
-> staff-review summary
-> human final decision boundary
```

This aligns with the current patent-disclosure draft:

```text
基於量測生理訊號之動態問診與臨床審閱摘要產生系統及方法
```

### 3. Cooperation Boundary

Before the next detailed company handoff, prepare a small internal boundary
sheet for Prof. Wu / Tomi:

- what NYCU may disclose to imedtac now;
- what should stay in patent draft / trade secret until counsel review;
- what can be described as API integration without revealing the invention;
- what belongs in a cooperation memo, MOU, NDA, or patent ownership discussion;
- whether a provisional filing or invention disclosure should happen before
  deeper implementation transfer.

## Schedule

### Today - 2026-05-21

Objective: preserve source and align the patent task with today's imedtac sync.

- Record the LINE thread as source.
- Add this patent-protection signal to the AI triage patent draft.
- Mark the Friday AI triage patent packet as a protection gate, not just a
  writing task.
- Do not send deeper technical invention logic to imedtac tonight.

### Tomorrow - 2026-05-22

Objective: be ready to talk with Prof. Wu / Tomi while Jason is on campus.

- Prepare a 1-page patent-protection brief:
  - invention center;
  - what imedtac already knows;
  - what NYCU should protect before teaching;
  - what can still be shared for the June API demo.
- Bring / reference the existing Tomi / 德米 patent template.
- Ask Prof. Wu whether the next discussion should be:
  - quick campus discussion on `2026-05-22`;
  - scheduled Prof. Wu + Tomi meeting next week;
  - immediate Tomi review of the existing disclosure draft.
- Keep the API v0.2 handoff moving, but strip or withhold patent-sensitive
  implementation detail.

### Next Week

Objective: convert protection concern into explicit cooperation mechanics.

- Hold Prof. Wu + Tomi patent discussion.
- Decide whether to file an invention disclosure / provisional-style internal
  packet before teaching the full method.
- Pair the iMVS machine review with a disclosure-control mindset:
  observe workflow and UI limits, but do not reveal unprotected routing /
  scoring / source-governance details unless cleared.
- Draft a cooperation-boundary checklist for the next imedtac technical handoff.

## Decision Questions For Prof. Wu / Tomi

1. Should the AI-Triage patent disclosure be filed or internally registered
   before the next detailed imedtac technical handoff?
2. Who should be named as inventors or contributors at the draft stage?
3. What parts are patent claims versus trade secrets?
4. What can Jason safely send to imedtac before protection is in place?
5. Should the next imedtac discussion include an explicit cooperation / IP
   boundary statement?
6. Does the third-quarter US target change the urgency of filing, or only the
   urgency of documentation?

## Working Rule

Until Prof. Wu / Tomi decide otherwise:

```text
API contract and demo boundary can be shared.
Reusable invention logic should be summarized internally first.
```
