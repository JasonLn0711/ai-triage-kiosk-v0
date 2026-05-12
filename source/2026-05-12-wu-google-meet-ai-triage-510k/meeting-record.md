---
id: 2026-05-12-wu-google-meet-ai-triage-510k-meeting-record
title: "2026-05-12 Meeting Record - Prof. Wu AI Triage 510K Direction"
date: 2026-05-12
time: "22:20"
type: meeting-record
source: transcript-full.md
participants:
  - 林家聖
  - 吳育德老師
---

# 2026-05-12 Meeting Record - Prof. Wu AI Triage 510K Direction

## One-Line Summary

Prof. Wu reframed the 慧誠 AI triage next step: before inventing clinical
question logic or signal rules, Jason should scan comparable FDA `510(k)`
products, extract their `indication for use` and functions, and use that as
the safest basis for the Friday discussion and the later 聯醫 deep-cultivation
plan.

## What Triggered The Meeting

Jason reported the company demo response:

- 慧誠 wants the demo in English.
- They want it to run on their all-in-one touch computer.
- The all-in-one device has no GPU.
- They asked how their device-generated signals, such as heart rate or SpO2,
  could affect the AI triage question flow.
- Jason could explain the software side, but could not responsibly answer
  medical-signal-to-question logic without clinical grounding.

## Product / Technical Facts Confirmed

- Device target: all-in-one touch computer, no GPU.
- Short-term compute strategy:
  - no full LLM on-device;
  - possible embedding model;
  - smaller ASR model may approach real-time, but accuracy still needs testing.
- Long-term signal integration is harder than the June demo:
  - vital signs / continuous signals should not be forced into question logic
    before signal format, clinical meaning, and interface are clear;
  - without GPU, complex model inference may create unacceptable waiting time.
- Fastest June demo route:
  - deploy the English triage demo on or alongside the company device;
  - do not integrate live device signals into the AI logic yet;
  - keep the signals and AI demo separated unless a safe API/mock path is
    explicitly agreed.

## Prof. Wu's Main Direction

Prof. Wu pushed against overthinking and gave a clear first step:

1. Ask 苗先生 whether the US partner/customer has `510(k)` information for the
   comparable product.
2. Search FDA `510(k)` summaries directly.
3. Extract:
   - `indication for use`;
   - predicate / comparable devices;
   - described functions;
   - product boundaries;
   - related papers when a `510(k)` summary is too short.
4. Use the comparable product's scope as the starting frame rather than
   inventing a triage feature set from first principles.

Prof. Wu's reasoning: if a product already has `510(k)`, the intended use and
function set have already been thought through enough to pass a regulatory
path. Imitating the simplest comparable product is faster and safer than
guessing the clinical workflow.

## Clinical Logic Boundary

Jason's difficulty was not just technical. The hard unknown is:

```text
Given vital signs such as HR, SpO2, BP, temperature, respiration, glucose, or
height/weight, what questions should the system ask, and what output wording is
clinically defensible?
```

The meeting clarified:

- FDA material is useful for intended-use and product-scope boundaries.
- `510(k)` summaries may not contain enough clinical implementation detail.
- Related papers or clinical guidance may be needed after the comparable
  product scope is known.
- Medical interpretation should be checked with 多寶, 冠廷, or a senior
  physician if GPT and documents remain unclear.

## Urology Reference Reframed

Jason noted that urology previsit workflows may not need real-time vital signs.
The urology path tends to use history, existing reports, exam results, and
structured symptoms rather than continuous device signals.

Implication:

- The urology demo remains useful as an adaptive-questioning / previsit
  interaction reference.
- It should not be treated as proof that vital-sign-driven urgent-care triage
  is ready.
- The 慧誠 lane needs its own `510(k)` / product-reference basis.

## Friday `2026-05-15` Meeting Implication

The Friday discussion should not promise a full clinical integration.

Minimum useful artifact:

- English demo direction.
- `510(k)` / comparable-product scan.
- One clear statement of likely intended-use options.
- A conservative architecture:
  - kiosk measurement first;
  - AI question flow as separate English demo;
  - optional future signal integration after product/interface/clinical review.
- Questions for 慧誠:
  - Which US product/customer has `510(k)`?
  - What is the exact intended use?
  - Which six vital fields are guaranteed?
  - What signal format does the device expose?
  - Is Friday asking for a product-scope answer, a live demo, or a clinical
    rule proposal?

## 聯醫 Deep-Cultivation Plan Context

Prof. Wu connected the work to next week's 聯醫 meeting and a deep-cultivation
plan. He said:

- The meeting is for writing a plan, likely not a huge document.
- If `510(k)` information is found, a short document under roughly `10` pages
  may be enough to frame the AI triage direction.
- The broader plan has multiple themes:
  - 連江縣 HIS replacement, separate from this lane;
  - occupational stress / fatigue / emotion screening, also separate;
  - a screening / community health direction where Prof. Wu wants to include
    冠廷 and possibly blood-test degeneration-speed analysis.
- The shared strategic value is landing AI products in real clinical/community
  sites, where repeated testing and user satisfaction determine whether a
  product is adopted.

## Staffing / Help Map

- 多寶:
  - useful for medical interpretation and LLM/clinical explanation support;
  - may join the Friday meeting if needed;
  - first person to ask when `510(k)` / medical wording remains unclear after
    GPT explanation.
- 冠廷:
  - useful for medical/signal discussion;
  - already briefly discussed continuous-signal uncertainty with Jason.
- 俊逸:
  - likely signal-processing owner if the project later needs signal work.
- 敬宗:
  - possible LLM helper, but may be busy.

## Decision Register

| Decision | Status | Rationale |
| --- | --- | --- |
| Do not build full signal-integrated triage for June demo | Active | Prof. Wu judged this as final-goal scope, not June-customer scope. |
| Use FDA `510(k)` summaries as first product reference | Active | Fastest way to avoid wrong intended-use direction. |
| Ask 苗先生 for US partner/customer `510(k)` references | Active | Company may know which comparable product/product line is already cleared. |
| Keep English demo on device as first visible step | Active | Computation and signal logic are not ready for real integration. |
| Use 多寶 / 冠廷 for clinical clarification | Active | Jason should not guess medical question logic alone. |

## Risks

- Product direction risk: 慧誠 has not clearly defined whether the product is
  urgent-care triage, ED triage, screening, care-level recommendation, or
  something else.
- Regulatory framing risk: a wrong `indication for use` could make the team
  build the wrong demo and overclaim.
- Technical risk: no-GPU device limits full LLM and may constrain ASR quality.
- Clinical risk: vital-sign thresholds and question routing cannot be invented
  by engineering.
- Meeting-risk: Friday expectations may mix English demo, signal integration,
  and clinical feasibility unless Jason forces the scope into separate layers.

## Action Items

- Jason:
  - search FDA `510(k)` summaries for comparable vital-sign / triage /
    screening products;
  - ask 苗先生 for the US partner/customer `510(k)` or product name;
  - identify `indication for use`, function list, and predicate devices;
  - ask GPT to explain candidate summaries, then ask 多寶 if still unclear;
  - prepare a Friday brief that separates English demo, `510(k)` reference,
    signal integration, and future clinical validation.
- Prof. Wu:
  - review `510(k)` findings after Jason sends them by LINE;
  - help identify senior physician support if 多寶 cannot answer.
- Possible collaborators:
  - 多寶 for clinical interpretation and Friday support;
  - 冠廷 for medical/signal interpretation;
  - 俊逸 for signal-side work later.

## Analysis

### 1. The project changed from "build triage AI" to "find the product claim"

The most important shift is that Prof. Wu placed `indication for use` before
implementation. This is correct. Without a defined intended use, every design
choice is unstable: questionnaire content, vital-sign use, output wording,
validation target, and demo story all drift.

### 2. The immediate demo should not depend on vital-sign intelligence

The company wants a June customer-facing artifact. Signal-integrated triage is
not ready because the team lacks the device signal format, clinical criteria,
and product claim. The safer demo is an English question-flow / summary demo
that can run on the kiosk hardware, with a future slot for vital-sign payloads.

### 3. FDA `510(k)` is not the medical truth source, but it is the right scope source

FDA `510(k)` summaries are useful for product category, predicate, intended
use, and boundaries. They usually do not give enough detailed medical logic to
write every question. The right sequence is:

```text
510(k) scope
-> product-function interpretation
-> related papers / guidelines / clinician review
-> demo-safe question and output design
```

### 4. The all-in-one no-GPU constraint favors retrieval, rules, and small ASR

The compute environment makes a full LLM-on-device story weak. The better
technical story is:

- small ASR or typed fallback;
- lightweight embedding / retrieval;
- deterministic question bank;
- transparent evidence labels;
- clinician-reviewed output.

### 5. The Friday artifact should be a decision brief, not a build demo only

The company may ask for "can you connect the signals?" The correct answer
should be layered:

- yes, technically we can ingest a payload shape;
- no, we should not claim clinical meaning until intended use and references
  are confirmed;
- for June, show English workflow and integration placeholder;
- for later, define the clinical/source/validation path.

### 6. 聯醫 is strategically important because it supplies field validation

Prof. Wu's comments show the larger value: landing fields are rare. The project
is not only a demo for 慧誠; it can become a field-tested screening/triage
system if the team keeps the claims modest and learns from real use.

## Updated Next Artifact Shape

The next artifact should be titled something like:

```text
AI Triage Kiosk Demo - 510(k) Product-Scope Scan And Friday Discussion Brief
```

Minimum sections:

1. What 慧誠 asked.
2. Why signal-integrated triage is future scope.
3. Comparable `510(k)` products and `indication for use`.
4. What can be safely shown in June.
5. What questions need company/clinical answers.
6. Proposed roles: Jason / 多寶 / 冠廷 / 俊逸.

