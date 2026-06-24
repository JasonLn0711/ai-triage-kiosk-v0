---
id: 2026-06-24-smart-health-cabin-monorepo-redpanda-routing-note
title: "2026-06-24 Smart Health Cabin Monorepo Redpanda Routing Note"
date: 2026-06-24
type: routing-note
status: active
---

# 2026-06-24 Smart Health Cabin Monorepo Redpanda Routing Note

`2026-06-24` 的 Smart Health Cabin MVP 架構討論已經紀錄在 Smart Health
Cabin workspace：

```text
../imedtac-smart-health-cabin-v0/workstreams/smart-health-cabin/2026-06-24-mvp-monorepo-redpanda-architecture-note.md
```

該 note 的核心建議是：MVP 階段採用一個 monorepo，內部用 modular
monolith backend、清楚的模組資料夾、穩定 event contract、PostgreSQL
保存 report/query state、Redpanda 作為 infra、一個 report worker，以及
Docker Compose 部署。

這個 AI Triage repo 仍然是另一條 English AI-assisted triage kiosk demo
與穩定 imedtac-facing API 歷史的 execution home。Smart Health Cabin note
可以參考這裡的模式：

- measured-context-first workflow framing;
- stable API and schema contract discipline;
- source-backed questionnaire/report wording;
- staff-review support boundary;
- change-control for externally communicated behavior.

這份 routing note 不改動 AI Triage demo API、六月 two-endpoint contract、
Render/FastAPI runtime，或 tachycardia demo implementation。
