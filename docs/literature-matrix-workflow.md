# Literature Matrix Workflow

This repo should read AI-triage literature as a structured comparison system,
not as isolated paper summaries.

Planning-side durable rule:

- `../planning-everything-track/data/knowledge/research-methods/publication/playbooks/structured-comparative-reading-matrix.md`
- `../planning-everything-track/templates/structured-comparative-reading-matrix.md`

## Core Rule

```text
Each paper is one row.
Each row answers the same core questions.
The output is synthesis and gaps, not a pile of summaries.
```

This matters because the June demo and later product/research direction need to
separate:

- real workflow evidence from demo claims;
- clinical-source support from product marketing language;
- human-review support from autonomous triage claims;
- vital-sign impact from generic symptom-chatbot behavior;
- regulatory intended-use boundaries from clinical question logic.

## Core Questions For This Lane

Use these questions before reading deeply:

1. Does the paper show reduced physician, nurse, or staff workload?
2. Does it fit urgent-care / kiosk / intake workflow, or only a different
   clinical setting?
3. Do vital signs change routing, follow-up questions, review signals, or only
   appear as passive inputs?
4. What is the role of ASR, LLM, rules, retrieval, or structured questionnaire
   logic?
5. How does the system prevent hallucination, unsupported advice, or source
   drift?
6. Where is the human-review boundary?
7. What evidence level is used: real deployment, prospective study,
   retrospective study, simulation, synthetic cases, benchmark, or concept
   paper?
8. What intended use or product claim is actually supported?

## Paper Row Schema

| Paper | Core question answered | Setting | Claim | Evidence direction | Evidence strength | Method / sample | Human review | Vital-sign role | ASR / LLM role | Boundary | Reviewer concern | Demo relevance |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
|  |  | urgent care / ED / clinic / other |  | supports / mixed / against / unclear | high / medium / low |  |  |  |  |  |  |  |

## Domain-Specific Tags

Use consistent tags so the rows can be compared:

- `source-backed`: exact source supports the statement.
- `source-family`: plausible source family, exact clause still missing.
- `clinician-signoff-needed`: must be reviewed by 多寶 / clinician / company.
- `demo-only`: safe for synthetic June demo, not production.
- `product-claim-risk`: wording could be read as diagnosis, treatment, final
  triage, or deployment readiness.
- `not-applicable`: paper answers a different clinical or product setting.

## Evidence Strength Labels

Use simple labels before scoring:

| Label | Meaning |
|---|---|
| `high` | Directly tests the target workflow or a close comparator with clear method and outcome. |
| `medium` | Relevant but indirect; setting, population, or workflow differs. |
| `low` | Conceptual, small, synthetic, anecdotal, or missing key validation. |
| `mixed` | Useful evidence exists, but method or boundary conflicts with the claim. |

## Expected Outputs

After each reading sprint, produce:

- one filled matrix;
- one reviewer heatmap by core question;
- one list of source-backed candidate questions or source families;
- one gap list that says what paper/source is needed next;
- one product-boundary note if any paper tempts the demo toward overclaim.

The useful synthesis sentence should look like:

```text
For question Q, papers A and B support X in setting S, paper C only supports a
weaker claim, and no paper yet supports product claim P for this demo boundary.
```

## Guardrails

- Do not use FDA as a symptom-questionnaire source. FDA is for intended use,
  risk, software, validation, labeling, and claim boundary unless exact source
  text says otherwise.
- Do not turn diagnosis-labeled demo cases into patient-facing diagnosis.
- Do not copy thresholds from a paper into the product without source status
  and clinician review.
- Do not let AI-generated paper summaries become evidence. Inspect the primary
  paper, guideline, or official source.
- Do not read "more papers" as progress unless the matrix changes a decision,
  exposes a gap, or upgrades a source registry row.
