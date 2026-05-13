# Decision - Guided ASR With Structured Questionnaire

Date: 2026-05-13  
Status: working product position; pending Prof. Wu / 慧誠 confirmation

## Decision

The first ASR-enabled version should not be a fully open-ended medical chat
system.

The recommended direction is:

```text
structured questionnaire first
-> guided voice as an input method
-> patient confirmation loop
-> deterministic question routing
-> clinician/staff-facing structured summary
```

ASR should support short patient input, option selection, and final free-note
capture. It should not become the primary clinical reasoning or free-form
triage engine in v0.

## First-Principles Rationale

The system goal is not to make the patient talk more. The system goal is to
help physicians, nurses, and urgent-care staff receive enough structured
information before formal diagnosis so they can reduce repetitive intake work
and enter the clinical judgment process faster.

Open-ended ASR creates a heavier chain:

```text
free patient speech
-> ASR transcript
-> segmentation
-> symptom extraction
-> medical term mapping
-> uncertainty and negation handling
-> next-question selection
-> summary generation
-> clinician review
```

That chain is hard to validate and expensive to run on an older CPU-only kiosk.
It also increases the risk that patient speech is misunderstood, omitted, or
over-interpreted.

Structured answers create direct clinical intake data:

```text
chief complaint
duration
severity
associated symptoms
red flags
vital-sign context
additional patient note
```

This is easier for clinicians to review, easier to trace to sources, and easier
to demonstrate safely before the June customer-facing milestone.

## Product Position

Use:

- single-choice questions;
- multiple-choice questions;
- yes / no / not sure questions;
- numeric scales such as pain 0-10;
- short ASR answers mapped to structured options;
- final optional ASR note for information the patient wants staff to know.

Avoid in v0:

- free-form chatbot-style triage;
- LLM-generated medical questions at runtime;
- free-text answers that directly control red-flag routing;
- final triage level or diagnosis;
- cloud or GPU-dependent inference as the required path.

## ASR Role Boundary

ASR can be valuable if it is treated as an input interface:

1. Chief complaint entry:
   - patient says a short phrase;
   - system maps it to a symptom module;
   - patient confirms the module.
2. Option selection:
   - patient says "yes", "no", "not sure", "three days", or "eight";
   - system maps speech to a fixed answer option;
   - patient confirms before the answer is saved.
3. Additional note:
   - patient speaks a brief optional note;
   - note appears in the clinician summary;
   - note does not directly determine triage logic in v0.

## Hardware And Deployment Implication

Given the current kiosk context of Windows-based all-in-one hardware, older CPU,
no onboard GPU, and a preference to avoid cloud LLM/GPU services, the v0 design
should be CPU-friendly:

```text
fixed question bank
structured answer schema
small ASR / optional ASR
keyword or lightweight intent mapping
rule-based safety filter
source IDs
summary template
```

This keeps the demo stable and reduces the chance that field conditions such as
noise, accent, microphone quality, or slow inference make the system look
unreliable.

## Meeting Position Sentence

Recommended wording:

> We can support voice, but the first product version should be guided voice
> intake, not open-ended ASR chat. Patients may answer by voice, but the system
> should map the answer into yes/no, single-choice, multiple-choice, numeric
> scale, or short confirmed text. This preserves the voice experience while
> keeping the clinical information structured, reviewable, and feasible on the
> target kiosk hardware.

