# Decision - Repo Structure And Canonical Home

Date: `2026-05-12`

## Decision

`imedtac-ai-triage-kiosk-demo` is the canonical execution home for the 慧誠智醫 AI
triage kiosk demo lane.

## Why

The lane now has enough source material, upstream Prof. Wu context, product
architecture questions, and future implementation risk that it should not live
only inside planning notes.

## Consequences

- Planning keeps status, capacity, and locators.
- This repo keeps copied source bundles, workstream notes, architecture notes,
  handoff drafts, and future implementation artifacts.
- Urology, TFDA/FDA advisor, and medical cybersecurity remain related but
  separate repos / project lanes.

## Boundary

The repo is local-first. Do not publish without explicit review because it now
contains private meeting notes and adjacent CDE-confidential context.
