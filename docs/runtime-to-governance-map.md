# Runtime To Governance Map

Status: v0 runtime review map
Last updated: 2026-05-19

## Purpose

This map connects the clickable demo runtime to the governance registries in
`data/`.

The v0 runtime is intentionally narrower than the full registry. It uses
choice-only question groups to demonstrate the product workflow while keeping
the exact clinical wording and escalation behavior in reviewer-controlled
registries.

## FIRST PRINCIPLE

Scarce resource: clinical credibility.

Every visible runtime question should answer:

```text
Why are we asking this?
Which source family supports the question?
What does the answer affect?
Who still needs to review the wording?
```

## Runtime Case Map

| Runtime case | Fixture | Flow registry row | Profile shown | Boundary |
| --- | --- | --- | --- | --- |
| Chest pressure | `demo/fixtures/chest-pain-high-bp-low-spo2.json` | `FLOW-CHEST-PAIN-VITALS` | `DEMO-001`, age `58`, sex `Male` | Staff-review summary only; no condition identification, treatment, final acuity assignment, or emergency order. |
| Fever and urinary symptoms | `demo/fixtures/fever-urinary.json` | `FLOW-FEVER-URINARY` | `DEMO-002`, age `42`, sex `Female` | Staff-review summary only; no antibiotic recommendation, sepsis claim, condition identification, or final acuity assignment. |

## Runtime Question Map

| Runtime question id | Phase | Runtime wording | Registry coverage | Source families | Output effect |
| --- | --- | --- | --- | --- | --- |
| `chief-concern` | `pre_vital_intake` | What is the main reason you are using the kiosk today? | Anchors branch selection before registry-specific follow-up. Related rows: `CP-001`, `FEV-001`, `URI-001`. | AHA, CDC, AUA source families depending on selected concern. | Sets patient-reported chief concern for the staff-review summary. |
| `onset` | `pre_vital_intake` | When did this problem start? | Related rows: `CP-005`, `FEV-001`. | AHA / CDC source families, clinician workflow review needed. | Adds timing context without assigning acuity. |
| `severity` | `pre_vital_intake` | How severe does it feel right now? | Generic intake context; local protocol review needed before production use. | `LOCAL-PROTOCOL-TBD`. | Adds patient-reported severity; does not assign final acuity. |
| `breathing` | `pre_vital_intake` | Are you having trouble breathing right now? | `CP-003`, `FEV-002`. | `AHA-HEART-ATTACK`, `CDC-FLU-WARN`, `ENA-ESI-V5`. | Makes respiratory concern visible for staff review. |
| `chest-details` | `post_vital_followup` | For chest discomfort, which descriptions fit? | `CP-001`, `CP-002`, `CP-004`, `CP-005`. | `AHA-HEART-ATTACK`, `AHA-HBP-911-2025`, `ENA-ESI-V5`. | Adds chest-warning-sign descriptors to the staff-review summary. |
| `neurologic-symptoms` | `post_vital_followup` | Do you have any new neurologic symptoms? | `CP-004`. | `AHA-HBP-911-2025`, `AHA-HEART-ATTACK`, `ENA-ESI-V5`. | Adds neurologic descriptor positives / negatives for review. |
| `fever-details` | `post_vital_followup` | For fever or infection concern, which descriptions fit? | `FEV-001`, `FEV-002`, `FEV-003`, `URI-001`, `URI-002`. | `CDC-FLU-WARN`, `AUA-RUTI`. | Adds fever, respiratory, urinary, and systemic context for review. |
| `urinary-details` | `post_vital_followup` | For urinary symptoms, which descriptions fit? | `URI-001`, `URI-002`. | `AUA-RUTI`, `CDC-FLU-WARN`. | Adds urinary symptom context without condition identification. |
| `pregnancy-context` | `post_vital_followup` | Is pregnancy possible or currently known? | Local clinical review needed before production use. | `LOCAL-PROTOCOL-TBD`. | Keeps a key context field visible for staff confirmation. |
| `medication-allergy` | `pre_vital_intake` | Can you provide current medications or allergies? | General handoff field; local protocol review needed. | `LOCAL-PROTOCOL-TBD`. | Routes medication/allergy context to staff confirmation. |
| `support-needed` | `pre_vital_intake` | Do you need staff help before continuing? | Human-factors / handoff row; local product review needed. | `LOCAL-PROTOCOL-TBD`. | Supports kiosk usability and staff-assist workflow. |

## Known Gap

The runtime question ids are not yet generated directly from
`data/question_registry.csv`. For v0 this is acceptable because the demo is a
synthetic, deterministic capability demo, but the next engineering hardening
step should make the runtime consume a checked question manifest derived from
the registry.

## Next Hardening Step

Create a `core/triage_engine/question_manifest.js` file that records, for each
runtime question:

```js
{
  runtimeId: "chest-details",
  registryIds: ["CP-001", "CP-002", "CP-004", "CP-005"],
  sourceIds: ["AHA-HEART-ATTACK", "AHA-HBP-911-2025", "ENA-ESI-V5"],
  evidenceStatus: "source-backed",
  demoAllowed: "yes_demo_only"
}
```

The smoke check should then fail if any runtime question lacks registry
coverage.
