---
id: 2026-05-19-api-session-design-plain-explanation
title: "API Session Design Plain Explanation"
date: 2026-05-19
topic: ai-triage
type: explanation
status: draft
source:
  - ../handoff/2026-05-21-imvs-nycu-api-design-v0.1.md
  - ../handoff/2026-05-21-decision-defaults-and-owner-matrix.md
---

# API Session Design Plain Explanation

## FIRST PRINCIPLE

- Scarce resource: shared understanding between product, engineering, and
  clinical reviewers.
- Core job: turn the AI triage demo from a standalone screen into a workflow
  that 慧誠 engineers can connect to iMVS.
- Boundary: this is a demo integration contract, not a clinical product,
  diagnosis engine, or HIS writeback system.

## High-School Version

The API session design means:

> iMVS and the NYCU AI triage demo need a fixed way to talk to each other during
> one patient's demo intake.

Think of iMVS as the front desk and the NYCU AI triage service as a question
assistant.

First, iMVS says:

```text
This is demo patient DEMO-RESP-001.
Their temperature is 38.5 C, SpO2 is 92%, heart rate is 102.
Please start an intake session and tell me the first question.
```

NYCU replies:

```text
The session key is demo-session-resp-001.
Question 1 is: What is the main reason you are using the kiosk today?
Options are: shortness of breath, chest discomfort, fever, something else.
```

The patient taps "shortness of breath." iMVS then says:

```text
This is session demo-session-resp-001.
The patient answered breathing.
What should I ask next?
```

NYCU replies with the next question. This repeats until NYCU returns:

```text
staff_review_summary:
Patient reports shortness of breath.
Measured vitals include fever and lower SpO2.
Staff should review the respiratory complaint and measured vitals.
This demo does not diagnose, recommend treatment, assign final triage level,
or write to HIS/EMR.
```

## Why It Is Called A Session

This workflow is not one message. It is a short conversation:

1. start the session;
2. ask question 1;
3. receive answer 1;
4. ask question 2;
5. receive answer 2;
6. produce staff-review summary.

`session_key` is the ticket number for that conversation. Without it, NYCU
cannot know which answer belongs to which demo patient or which question should
come next.

## What This Commits Us To Build

This design does not require a full medical AI product. It requires a small,
testable integration layer.

Minimum programming work:

1. A mock API server.
2. `POST /api/triage-demo/sessions` to start one demo intake.
3. `POST /api/triage-demo/sessions/{session_key}/answers` to submit answers.
4. A session store that maps:
   - `session_key` to current question;
   - `session_key` to answers so far;
   - `session_key` to measured vitals;
   - `session_key` to the final summary.
5. A deterministic question router for the first case.
6. A staff-summary generator.
7. Validation for required fields, units, version, and illegal identifiers.
8. Error responses for invalid session, timeout, missing field, and unsupported
   question type.

## What We Should Not Build Yet

For the June demo, do not build:

- real diagnosis;
- final ESI / acuity assignment;
- treatment recommendation;
- real HIS / EMR / FHIR writeback;
- real patient identity handling;
- raw audio retention;
- all-specialty medical reasoning;
- a broad LLM chatbot.

## Engineering Shape

The smallest safe architecture is:

```text
iMVS mock payload
  -> session API
  -> deterministic question router
  -> answer state
  -> staff_review_summary
  -> safe fallback if anything fails
```

The runtime can be simple and deterministic first. If voice or LLM behavior is
added later, it should sit behind this already-safe session contract, not
replace it.

## Practical Done Definition

The first milestone is complete when one synthetic respiratory case can run:

```text
vital payload
  -> question 1
  -> answer 1
  -> question 2
  -> answer 2
  -> staff_review_summary
```

Acceptance conditions:

- visible progress;
- stable `session_key`;
- no real identifiers;
- no diagnosis / treatment / final triage wording;
- fallback response if the session is invalid;
- summary is staff-review-only.

