# Data Registries

This directory contains governance registries for the AI triage kiosk demo.

These files are not clinical rules and are not validation evidence. They are
review scaffolds that keep any future demo source-governed and deterministic.

## Files

| File | Purpose |
| --- | --- |
| `source_registry.csv` | Source IDs, URLs, intended project use, allowed-use status, limits, and review owners. |
| `question_registry.csv` | Patient-facing question rows mapped to triggers, source IDs, clinical purpose, output effect, evidence status, and review owner. |
| `api_question_mapping.csv` | Runtime API question IDs mapped back to registry question IDs, source refs, evidence status, and review owners. |
| `flow_registry.csv` | Demo flow versions mapped to fixture files, question IDs, allowed outputs, forbidden outputs, and review owner. |
| `question_manifest.tachycardia.v0.3.json` | Runtime-reviewed tachycardia question manifest used by the backend dynamic engine. |
| `answer_effects.tachycardia.v0.3.json` | Option-to-effect and reason-code map used to update session flags and summary content. |
| `routing_policy.tachycardia.v0.3.json` | Deterministic backend routing policy for the v0.3 tachycardia dynamic branch. |
| `summary_templates.tachycardia.v0.3.json` | Approved staff-review phrase templates retrieved by the backend summary-template retriever and assembled into staff-review summaries. |
| `vector_index/tachycardia.v0.3.json` | Local question/option token index used by the demo retrieval/reranker wrapper. |

## Validation

Run:

```bash
python3 scripts/check_governance_registries.py
npm run dynamic:check
```

The check verifies source/question/API-mapping/flow references and confirms
fixture files are synthetic-demo-only.

## Rules

- Use synthetic data only unless a separate data-use decision is made.
- Do not treat these rows as approved clinical logic until a named reviewer
  signs off.
- Treat `IMEDTAC-IMVS-API-20260512` and
  `IMEDTAC-IMVS-PRODUCT-SPEC-20260512` as company-provided engineering and
  hardware baselines for adapter design. They define field/unit and hardware
  context; they do not define clinical thresholds or approved triage logic.
- Do not add diagnosis, treatment advice, final ESI level, autonomous emergency
  orders, or HIS/EMR writeback behavior to these registries.
- Version any change to question text, source IDs, thresholds, or output wording.
- Keep dynamic-engine manifest versions internal unless a recorded change request
  promotes the behavior into the externally committed imedtac API contract.
- Rebuild dynamic artifacts with `npm run dynamic:build` after changing registry
  or manifest content, then verify with `npm run dynamic:check`.
