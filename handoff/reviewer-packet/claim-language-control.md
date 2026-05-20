# Claim Language Control

Status: internal language guardrail for Friday / June discussion

## Approved Phrases

- vital-aware triage-support workflow
- source-governed follow-up questions
- clinician-review summary
- staff-review summary
- synthetic-data capability demo
- measured-vital context
- 510(k) product-scope scan
- comparable-product scan
- demo-only workflow feasibility
- not diagnosis or autonomous triage
- no real patient data in v0
- no HIS/EMR writeback in v0

## Writing Posture

All articles, handoff notes, briefs, pre-reads, meeting packets, and
company-facing material must use a confident and affirmative voice. This is a
repo-level writing rule, not a stylistic preference.

The project should be framed as a concrete product-capability demo with a clear
architecture and next decision, not as a defensive explanation of what it cannot
do. For 慧誠智醫-facing documents, lead with the recommendation and product
capability first, then state scope controls.

Write like this:

```text
This demo shows a synthetic-data vital-aware intake loop: iMVS sends measured
vital context, NYCU returns structured follow-up questions, and the workflow
produces a staff-review summary for human review.
```

Do not write like this:

```text
This small prototype may not be useful yet; we are not claiming anything and
are trying to see whether something is possible.
```

Boundary language should be short and controlled. Put the positive product
claim first, then state the boundary:

```text
The output is a staff-review summary for demo workflow review. It is not
diagnosis, treatment advice, final triage level, or production HIS/EMR content.
```

Avoid burying the main point under apologies, long disclaimers, repeated
hedging, or self-minimizing language. Use "synthetic-data capability demo" or
"pre-sync API v0.2 draft" instead of language that minimizes the work.

Canonical writing policy:

- `docs/writing-method-policy.md`

## Cautious Phrases

Use only with context:

| Phrase | Required context |
| --- | --- |
| AI triage | Say "triage support," not final triage. |
| all-specialty | Say "all-specialty-capable architecture," not clinically complete all-specialty triage. |
| ESI | Say source-family or framework reference, not assigned ESI level. |
| FDA | Say software boundary / CDS / transparency, not clearance or approval. |
| 510(k) | Say product-scope scan or comparator reference, not clearance for this demo. |
| predicate | Say potential comparator unless a regulatory owner approves predicate language. |
| clinical validation | Say future validation ladder, not completed validation. |
| integration | Say demo/link-out/read-only unless live integration is approved. |

## Forbidden Phrases

Do not use unless a separate regulatory/clinical decision explicitly clears it:

- diagnosis;
- AI diagnosis;
- ESI level;
- emergency severity;
- likely pneumonia;
- likely sepsis;
- needs emergency treatment;
- safe to go home;
- FDA-approved;
- FDA-cleared;
- 510(k)-cleared demo;
- 510(k)-ready;
- predicate-equivalent demo;
- clinical-grade triage;
- AI decides acuity;
- automatic emergency referral;
- automated ED referral;
- validated all-specialty triage;
- diagnosis engine;
- treatment recommendation;
- production HIS/EMR integration;
- real-time hospital triage;
- replaces nurse review;
- replaces physician judgment.

For respiratory or fever cases, diagnosis-shaped labels such as pneumonia,
COVID, sepsis, or ESI levels may be private design anchors only. They must not
appear as system conclusions, patient-facing copy, API output fields, or
customer-demo claims.

## One-Line Customer-Safe Position

```text
This is a synthetic-data capability demo showing how measured vital signs can
support source-governed follow-up questions and a clinician-review summary; it
is not diagnosis, treatment advice, or autonomous triage.
```
