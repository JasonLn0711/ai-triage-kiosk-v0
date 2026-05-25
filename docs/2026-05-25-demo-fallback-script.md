---
id: 2026-05-25-demo-fallback-script
title: "June Demo Fallback Script"
date: 2026-05-25
topic: ai-triage
type: presenter-runbook
status: active
source:
  - ../demo/fixtures/tachycardia-live-demo.json
  - ../handoff/2026-05-25-first-rehearsal-packet.md
  - ../handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md
---

# June Demo Fallback Script

## Recommendation

Run the customer demo with three explicit modes and label the active mode on
screen:

```text
live_measured -> synthetic_override -> local_scripted_demo
```

The product story is vital-aware intake support. It must not depend on network
availability, a live participant reaching HR 130, or an on-site operator making
the perfect choice under time pressure.

## Modes

| Mode | When to use | Presenter line | UI / API signal |
| --- | --- | --- | --- |
| `live_measured` | Voluntary live measurement is available and the device reading is suitable for rehearsal. | "This run uses the measured demo vital payload and keeps the output as staff-review support." | UI mode label `live measured`; request `demo_script.mode = live_measured`. |
| `synthetic_override` | The live device works, but the measured value does not show the tachycardia cue clearly enough for the product story. | "We are switching to the synthetic HR 130 fixture so the rehearsal stays deterministic." | UI mode label `synthetic override`; same tachycardia fixture and option ids. |
| `local_scripted_demo` | Network, hosted API, device, operator flow, or `idempotency_conflict` recovery makes the live session unsuitable to continue. | "This is the local scripted fallback using the same governed question set and staff-review summary." | UI mode label `local scripted demo`; no remote dependency. |

## Presenter Rules

- Do not ask anyone to exercise or intentionally raise heart rate for the demo.
- Use voluntary measurement only.
- Treat the HR 130 value as a synthetic/live demo cue, not a clinical threshold
  claim.
- If measurement quality is uncertain, keep `quality_flag = needs_review`.
- Keep the summary staff-only.
- Do not say the system diagnoses AfRVR, arrhythmia, ACS, or heart attack.
- Do not say the system orders ECG, treatment, triage level, or HIS / EMR /
  FHIR writeback.

## Rehearsal Sequence

1. Start in `live_measured` mode.
2. Confirm iMVS can send the measured or synthetic vital payload.
3. If the live heart-rate cue is not suitable, switch to `synthetic_override`
   before starting the question loop.
4. If the remote API is unavailable, switch to `local_scripted_demo`.
5. If NYCU returns `idempotency_conflict`, do not continue the current answer
   path. Restart the demo session or switch to `local_scripted_demo`.
6. Complete the seven tachycardia questions.
7. Show `status=summary` / `staff_review_summary`.
8. State the scope controls: staff-review intake support, human review workflow,
   synthetic-data demo context, and separate validation path.

## Fallback Acceptance Check

The fallback path is ready when:

- the UI visibly displays one of the three mode labels;
- presenter notes name the active mode;
- local scripted mode can complete without network access;
- `idempotency_conflict` recovery is restart demo session or clearly labeled
  fallback, not answer revision;
- the tachycardia fixture remains the same case id,
  `demo-tachycardia-live-001`;
- the staff summary still carries staff-only scope controls;
- no runtime or presenter line claims diagnosis, treatment, final triage level,
  ECG order, or production writeback.
