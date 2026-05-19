# Validation And Change Control

Status: required before expanding beyond two synthetic demo flows

## Validation Ladder

| Stage | Evidence | Exit criteria |
| --- | --- | --- |
| 0 - Source-governed demo | Synthetic fixtures, source registry, question registry, flow registry. | Stakeholders accept scope and wording. |
| 1 - Clinician tabletop | Clinician reviews each flow and question row. | Reviewer approves or edits purpose, wording, and output effect. |
| 2 - Retrospective simulation | De-identified or synthetic case set through fixed flows. | Unsafe wording and missed review prompts are tracked and corrected. |
| 3 - Supervised pilot | Staff uses system with human override and issue logging. | Workflow usefulness, safety issues, and override reasons reviewed. |
| 4 - Productization | Formal validation, privacy, cybersecurity, regulatory, quality controls. | Separate product go/no-go decision. |

## Change-Control Rule

For v0:

- freeze `source_registry.csv`;
- freeze `question_registry.csv`;
- freeze `flow_registry.csv`;
- freeze synthetic fixtures;
- freeze output wording;
- do not let LLM free-generate routing or escalation text;
- use deterministic flow logic only.

## Required Review For Any Change

| Change | Required reviewer |
| --- | --- |
| source URL or source status | research / clinical reviewer |
| patient-facing question text | clinical/company reviewer |
| trigger vital or trigger symptom | clinical reviewer |
| output wording | clinical/company reviewer |
| threshold | clinical reviewer |
| fixture value | product/clinical reviewer |
| integration mode | product/security reviewer |
| logging | privacy/security reviewer |
| prompt that affects routing | clinical/product reviewer |

## Versioning Convention

Use two levels of versioning:

1. Project/runtime SemVer, controlled by
   `data/version_manifest.json`, `package.json`, runtime `VERSION.versionLabel`,
   and `scripts/check_version_control.py`.
2. Per-flow clinical/governance versions in `data/flow_registry.csv`.

Project/runtime versions use:

```text
vMAJOR.MINOR.PATCH
```

Per-flow registry versions stay simple:

```text
FLOW-CHEST-PAIN-VITALS v0.1
FLOW-FEVER-URINARY v0.1
```

Increment the minor version when wording or fixture values change. Move to
`v1.0` only after reviewer approval.

Automation:

```bash
npm run version:check
python3 scripts/bump_version.py --set 1.2.5
```

Detailed policy: `docs/version-control-policy.md`.
