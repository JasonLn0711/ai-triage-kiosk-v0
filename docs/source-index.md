# Source Index

This repo is now the complete local archive for the 慧誠智醫 AI triage kiosk
demo lane and its direct upstream Prof. Wu context.

## Core Triage Sources

| Date | Source | Why it matters |
| --- | --- | --- |
| `2026-05-11` | `source/2026-05-11-wu-huicheng-er-triage-ekg-asr/` | Prof. Wu introduced the 慧誠 / imedtac emergency-triage collaboration, role split, EKG / SpO2 / ASR / LLM questions, case-accrual dependency, and triage-not-diagnosis boundary. |
| `2026-05-12` | `source/2026-05-12-huicheng-company-ai-triage-sync/` | Company-side sync clarified the kiosk / web service / middleware / RESTful API / FHIR / HIS / EMR context, June US customer demo pressure, English-first voice-input long-term target, and vital-aware triage differentiator. |
| `2026-05-12 22:20` | `source/2026-05-12-wu-google-meet-ai-triage-510k/` | Prof. Wu reframed the next step after the company sync: first find comparable FDA `510(k)` summaries and `indication for use` boundaries before promising vital-sign-integrated AI triage. |
| `2026-05-13` | `source/2026-05-13-johnny-line-friday-huicheng-sync/` | Johnny Fang scheduled `AI triage 可行性討論` for Friday `2026-05-15 13:00-14:00` on Google Meet `cjk-iwzq-cmz` for physiological-data integration and all-specialty technical evaluation; invite 多寶 through a confirmed contact route. |
| `2026-05-13` | `source/2026-05-13-duobao-line-huicheng-vital-sign-triage/` | 多寶 provided clinical calibration: vital signs are strongest for emergency triage / internal-medicine-style review, unstable vitals can raise urgency, urology has more limited vital-sign impact, and a Thursday afternoon follow-up discussion is tentatively useful. |
| `2026-05-14` | `source/2026-05-14-wu-line-gpt-vital-sign-questionnaire-triage/` | Prof. Wu forwarded a GPT-generated DOCX proposing a vital-sign + questionnaire product design centered on family medicine / general internal medicine, a 10-question intake, rule-engine red flags, and draft adult numeric thresholds; treat as context-only until source-backed and clinically reviewed. |
| `2026-05-15` | `source/2026-05-15-huicheng-second-sync-and-duobao-followup/` | Second 慧誠智醫 sync plus 多寶 follow-up. This converted the Friday feasibility discussion into a June demo plan: US-style urgent care, `3-5` synthetic vital-sign-aligned cases, guided intake plus optional ASR, networked/external compute acceptable for demo, and clinician-review summary only. |
| `2026-05-15 15:25` | `source/2026-05-15-huicheng-second-sync-and-duobao-followup/company-provided-meeting-minutes.md` | Johnny Fang's company-side meeting minutes. Confirms urgent-care / June-demo / `3-5` cases / `8-10` questions / touch plus partial voice input, and creates confirmation needs around `AI 資料訓練 study`, output wording, case categories, external compute, and adding 許醫師 to the email loop. |
| `2026-05-15 16:42` | `source/2026-05-15-huicheng-second-sync-and-duobao-followup/duobao-demo-case-draft.md` | 多寶's first clinical case draft and LINE handoff. Provides four diagnosis-shaped design anchors: acute cholecystitis, AfRVR, pneumonia, and URI, to be converted into demo-safe clinician-review summaries rather than diagnosis outputs. |

The `2026-05-12` source folder now also contains Johnny Fang's company-side
follow-up package:

- `assets/2026-05-12-huicheng-ai-triage-followup-email.pdf`
- `assets/2026-05-12-imvs-product-spec-v2.0.4.docx`
- `assets/2026-05-12-imvs-api-v1.4-eng.pdf`
- `extracted/` searchable text outputs

Derived analysis:

- `docs/2026-05-12-huicheng-materials-analysis.md`
- `source/2026-05-12-huicheng-company-ai-triage-sync/meeting-record.md` is the complete structured afternoon meeting record for the 慧誠智醫 x NYCU AI-Triage cooperation discussion. It now uses the user-specified structure and captures system background, company expectations, Jason's urology demo, all-specialty modularity, symptom wording provenance, vital-sign decision mapping, June demo pressure, follow-up action items, and the workflow-integration interpretation.
- `workstreams/05-thursday-vital-sign-research-gate.md`
- `source/2026-05-12-wu-google-meet-ai-triage-510k/meeting-record.md`
- `source/2026-05-12-wu-google-meet-ai-triage-510k/user-provided-summary.md`
- `source/2026-05-12-wu-google-meet-ai-triage-510k/user-provided-extended-analysis.md`
- `source/2026-05-14-wu-line-gpt-vital-sign-questionnaire-triage/extracted/2026-05-14-wu-gpt-vital-sign-questionnaire-triage-product-design.txt`
- `source/2026-05-15-huicheng-second-sync-and-duobao-followup/meeting-record.md`
- `source/2026-05-15-huicheng-second-sync-and-duobao-followup/company-provided-meeting-minutes.md`
- `source/2026-05-15-huicheng-second-sync-and-duobao-followup/duobao-demo-case-draft.md`
- `workstreams/08-june-demo-case-and-integration-plan.md`
- `handoff/2026-05-15-june-demo-case-pack-v0.md`
- `docs/literature-matrix-workflow.md`

## Upstream Prof. Wu Context

| Date | Source | Relationship to this repo |
| --- | --- | --- |
| `2026-04-16` | `source/upstream-wu-context/2026-04-16-wu-yute-tomi-meeting/` | Upstream meeting that created the urology smart-previsit, medical cybersecurity, and patent/UI work threads. It is not the 慧誠 triage project itself, but it explains why urology previsit and medical-device integration became reusable context. |
| `2026-04-20` | `source/upstream-wu-context/2026-04-20-cde-prof-wu-clinical-medical-device-it-cybersecurity-speech/` | Prof. Wu / CDE medical-device cybersecurity speech context. It is adjacent because hospital-side cybersecurity, FDA/TFDA framing, HIS/EMR constraints, and vendor/hospital handoff are relevant to any future product claim. |

## Planning-Bridge Snapshots

| File | Purpose |
| --- | --- |
| `planning-bridge/2026-05-huicheng-er-triage-ekg-asr.md` | Full planning locator snapshot for this execution repo. |
| `planning-bridge/project-locators/2026-05-huicheng-er-triage-ekg-asr.md` | Same project locator kept with other related project snapshots. |
| `planning-bridge/project-locators/2026-04-urology-ai-previsit-interview.md` | Urology reference project snapshot, useful because the current triage demo may reuse structured previsit intake concepts. |
| `planning-bridge/project-locators/2026-04-tfda-fda-regulatory-advisor.md` | Regulatory memory-system snapshot. This is adjacent source-governance context, not triage logic. |
| `planning-bridge/project-locators/2026-04-medical-cybersecurity-tfda-fda-industry-deck.md` | Medical cybersecurity / CDE / TFDA-FDA deck snapshot. This preserves Prof. Wu handoff context and hospital-side cybersecurity frame. |

## Source Rules

- Treat `source/` files as copied evidence and meeting context.
- Do not rewrite transcripts.
- If a source contains confidential or private material, keep it local unless the
  project owner explicitly approves sharing.
- Use `docs/` and `workstreams/` for interpretation, planning, and derived
  architecture.
- Planning repo gets status and locator updates only.
