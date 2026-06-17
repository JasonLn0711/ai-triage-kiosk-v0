---
id: 2026-06-23-smart-health-cabin-onsite-discovery-plan
title: "2026-06-23 Smart Health Cabin Onsite Discovery Plan"
date: 2026-06-17
topic: ai-triage
type: meeting-prep
status: active
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ../../source/2026-06-16-imedtac-teams-question-option-adjustment/source.md
---

# 2026-06-23 Smart Health Cabin Onsite Discovery Plan

## Meeting Thesis

The `2026-06-23` onsite visit should produce enough shared facts for NYCU,
多寶, and 慧誠智醫（imedtac Co., Ltd.）to evaluate feasibility, first-release
scope, schedule assumptions, and budget assumptions for the Smart Health Cabin
software modules.

The meeting should cover both:

1. current AI Triage demo/device workflow alignment;
2. new Smart Health Cabin requirements for vision/hearing self-measurement and
   questionnaire-guided triage.

These are adjacent lanes. They should be discussed together for context but
recorded separately for execution control.

## What Johnny Likely Wants To Discuss

Johnny's email and Teams message point to three discussion layers.

### 1. Cooperation And Delivery Boundary

He likely wants to know which parts NYCU / 多寶 / Jason can execute, which parts
imedtac will keep, and what the first response can include:

- feasibility;
- initial schedule;
- preliminary cost;
- first-release scope;
- division of UI/UX, CMS, API, ERD, source code, deployment, and clinical
  content responsibility.

### 2. Technical Architecture

He likely expects technical architecture discussion, especially:

- how the Smart Health Cabin frontend runs on the existing touch-screen device;
- how vision/hearing/questionnaire/report data should be structured;
- whether the current AI Triage API and question-loop design can inform the
  questionnaire module;
- what CMS or content-management boundary is realistic;
- how QR Code report access and HIS-ready JSON should be shaped;
- what can be delivered by early September versus deferred.

### 3. Medical, Device, And Software Workflow Design

He likely also expects medical/device/software design discussion, especially:

- whether vision and hearing flows are screening support, reference self-tests,
  or stronger medical measurements;
- how no-headphone hearing testing can work inside a cabin with fixed speakers;
- what clinical owner reviews questionnaire triage, department guidance, and
  health education content;
- how report wording should support user understanding without becoming
  diagnosis or autonomous medical advice.

The meeting is therefore not only technical and not only medical. It is a
product discovery meeting at the boundary between medical workflow, device
constraints, software architecture, and project delivery.

## Agenda

| Segment | Timebox | Purpose | Output |
| --- | --- | --- | --- |
| Opening alignment | 10 min | Confirm the meeting goal: equipment review plus Smart Health Cabin scoping | Shared agenda |
| AI Triage device workflow | 15 min | Confirm where the existing AI Triage API/demo runs and what device constraints matter | Test owner and demo path |
| Equipment walkthrough | 30 min | Inspect touch screen, OS/browser, network, audio, cabin environment, and available measurement device details | Equipment fact list |
| Module A review | 25 min | Discuss vision/hearing self-measurement feasibility, calibration, claim boundary, and UI flow | Module A open questions |
| Module B review | 25 min | Discuss questionnaire triage, department guidance, health education, CMS, and content review | Module B open questions |
| Data/report/HIS review | 20 min | Discuss integrated report, QR Code, ERD, API/JSON, and future HIS-ready structure | Data boundary draft |
| Delivery boundary | 20 min | Clarify RACI, source code, maintenance, timeline, and budget-estimate assumptions | Feasibility response inputs |
| Closeout | 10 min | Confirm next deliverable, owner, and date | Follow-up action table |

## Preparation Checklist

- Read `email-requirements-brief.md`.
- Read both module discovery files.
- Bring `meeting-question-bank.md`.
- Keep current AI Triage rehearsal context ready:
  - API base URL;
  - two endpoint contract;
  - bearer token handling rule;
  - single-choice / multi-choice UI boundary;
  - measured-vital summary expectation.
- Prepare to ask for equipment facts rather than infer them.
- Confirm whether photos, videos, screenshots, or equipment spec captures are
  allowed during the visit.

## Expected Meeting Output

The useful output is not a final promise. It is an evidence-backed discovery
record with:

- equipment facts;
- scope map by module;
- open questions;
- first-release recommendation;
- RACI draft;
- feasibility response assumptions;
- estimate blockers;
- next decision request.

## Suggested Opening Statement

```text
今天我們希望先把兩件事分清楚但連在一起看：第一，確認目前 AI Triage demo 在設備與 API 上的展示路徑；第二，針對北市聯醫智慧健康倉的新需求，先建立可行性、時程與經費初評需要的前提。這樣會後我們可以回覆一份比較可靠的 scope、assumption、schedule、budget basis，而不是只憑文件推估。
```
