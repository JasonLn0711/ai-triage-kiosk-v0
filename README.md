# AI Triage Kiosk Demo

<p>
  <img src="http://estruyf-github.azurewebsites.net/api/VisitorHit?user=JasonLn0711&repo=ai-triage-kiosk-demo&countColor=%237B1E7B" alt="Visitor count"/>
  <img src="https://img.shields.io/github/last-commit/JasonLn0711/ai-triage-kiosk-demo?color=7B1E7B" alt="GitHub last commit"/>
  <img src="https://img.shields.io/github/repo-size/JasonLn0711/ai-triage-kiosk-demo?color=7B1E7B" alt="GitHub repo size"/>
  <img src="https://img.shields.io/github/languages/top/JasonLn0711/ai-triage-kiosk-demo?color=7B1E7B" alt="GitHub top language"/>
  <img src="https://img.shields.io/github/issues/JasonLn0711/ai-triage-kiosk-demo?color=7B1E7B" alt="GitHub issues"/>
  <img src="https://img.shields.io/badge/status-demo--only-7B1E7B" alt="Demo-only status"/>
  <img src="https://img.shields.io/badge/patient%20data-none-success" alt="No real patient data"/>
  <img src="https://img.shields.io/badge/source--governed-question%20routing-blue" alt="Source-governed question routing"/>
  <img src="https://img.shields.io/badge/registry-check%20script-success" alt="Registry check script"/>
</p>

This repo is the standalone execution home for the 慧誠智醫 / imedtac AI
triage kiosk demo lane.

## First Principle

- Scarce resource: demo execution bandwidth before the June US customer visit.
- First deliverable: an English AI triage market demo that can be embedded in or
  linked from 慧誠's existing Kiosk / web service flow.
- Product boundary: market demo / product capability demo, not production
  clinical triage, autonomous diagnosis, or a formal HIS / EMR integration.
- Planning home: `../planning-everything-track/data/projects/2026-05-huicheng-er-triage-ekg-asr.md`.

## Current Interpretation

慧誠智醫短期希望在六月前，基於現有 triage prototype，快速做出英文版
demo，能被放進既有 Kiosk / web service 產品流程中，展示「慧誠智醫 +
智德萬 / 吳老師團隊已具備 AI triage capability」。這個 demo 主要用途是
go-to-market 與美國客戶展示，還不是正式醫療決策產品。

## Repo Contents

| Path | Purpose |
| --- | --- |
| `source/2026-05-11-wu-huicheng-er-triage-ekg-asr/` | Prof. Wu kickoff source bundle copied from planning |
| `source/2026-05-12-huicheng-company-ai-triage-sync/` | Company sync source bundle, meeting record, cleaned transcript, and demo brief |
| `source/2026-05-12-wu-google-meet-ai-triage-510k/` | Prof. Wu 22:20 Google Meet transcript and analysis that reframed the Friday artifact around FDA 510(k), intended use, and conservative demo scope |
| `source/2026-05-15-huicheng-second-sync-and-duobao-followup/` | Second 慧誠 sync, raw transcripts, LINE context, company-provided minutes, 多寶 follow-up, and 多寶's first demo-case draft for the June urgent-care intake demo |
| `source/upstream-wu-context/` | Earlier Prof. Wu context copied from planning, including the 2026-04-16 Wu/Tomi meeting and 2026-04-20 CDE speech source |
| `docs/project-brief.md` | Working project brief and execution boundary |
| `docs/2026-05-12-huicheng-materials-analysis.md` | Detailed comparison of company follow-up minutes, iMVS product spec, and iMVS API attachment implications |
| `docs/architecture-insertion-and-clinical-grounding.md` | Core note on workflow insertion point, vital-aware dynamic triage, and clinical evidence mapping |
| `docs/literature-matrix-workflow.md` | Question-first literature matrix workflow for AI-triage papers, guidelines, source families, and reviewer-style synthesis |
| `docs/source-index.md` | Complete index of copied source bundles and upstream context |
| `docs/wu-instruction-register.md` | Consolidated Prof. Wu instructions and company-side clarifications |
| `docs/repo-organization.md` | Directory map and folder ownership |
| `docs/repo-relationships.md` | Ownership split between this repo, planning, and related repos |
| `planning-bridge/2026-05-huicheng-er-triage-ekg-asr.md` | Snapshot copy of the planning project locator at repo creation |
| `planning-bridge/project-locators/` | Snapshots of related planning project locators: 慧誠, urology, TFDA/FDA advisor, and medical cybersecurity |
| `workstreams/` | Active workstream notes for insertion point, clinical evidence governance, MVP boundary, and urology-reference reuse |
| `handoff/` | Future handoff drafts for Prof. Wu, 慧誠, or internal collaborators |
| `decisions/` | Dated repo/product decisions |

## Current System Frame

```mermaid
flowchart TD
  A[量測設備<br/>血壓/血氧/體溫/身高/體重] --> B[慧誠智醫 Gateway / Middleware]
  B --> C[Web Service UI]
  B --> D[RESTful API]
  D --> E[FHIR]
  E --> F[HIS / EMR]
  C --> G[病人端 Kiosk 操作流程]
```

## Target Demo Frame

```mermaid
flowchart LR
  A[Patient describes symptoms in English] --> B[ASR or typed input]
  B --> C[Symptom understanding]
  D[Vital signs<br/>BP/SpO2/Temp/BMI] --> C
  C --> E[Dynamic follow-up]
  E --> F[Triage support result]
  F --> G[Clinician / kiosk summary / future HIS or EMR handoff]
```

## Core Architecture Note

The most important current note is:

```text
docs/architecture-insertion-and-clinical-grounding.md
```

Read it before coding. The next hard problem is finding the insertion point in
慧誠's existing measurement workflow and building traceable clinical grounding
for vital-aware dynamic questioning.

Also read:

```text
docs/source-index.md
docs/wu-instruction-register.md
docs/repo-organization.md
```

## Safety Boundary

- Do not use real patient data unless a separate approval, consent, and data
  governance path exists.
- Do not invent clinical thresholds for vital-sign triage.
- Do not claim diagnosis, autonomous medical advice, emergency medical
  replacement, or production readiness.
- Do not connect to HIS / EMR / FHIR write paths without an explicit integration
  plan and company / clinical approval.
- Keep patent-sensitive ASR + LLM workflow details private unless Prof. Wu or
  the project owner explicitly approves disclosure.
- This repo now includes upstream private Prof. Wu context and a CDE source copy;
  keep the repo local-only unless the user explicitly asks to publish after a
  privacy review.

## Immediate Next Actions

1. Turn the `2026-05-15` second-sync decision into a June demo case pack:
   `3-5` synthetic urgent-care intake cases with vital signs, short question
   paths, and clinician-review summaries.
2. Implement the first case as a narrow demo path: vital payload -> guided
   questions -> staff-facing summary.
3. Ask 慧誠 for the smallest technical packet needed to wire the demo:
   kiosk UI insertion point, vital payload field names, demo room network,
   output display format, and software-team contact.
4. Keep the runtime pragmatic for June: networked / external compute is allowed
   for demo if local CPU-only ASR / LLM behavior is too slow or hot.
5. Use `docs/literature-matrix-workflow.md` for the next AI-triage paper /
   guideline sprint so literature work produces source-backed decisions and
   gaps, not isolated summaries.
6. Keep planning updated with status, blockers, and capacity impact only.
