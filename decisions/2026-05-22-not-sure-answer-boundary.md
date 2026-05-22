---
id: 2026-05-22-not-sure-answer-boundary
title: "Not Sure Answer Boundary"
date: 2026-05-22
topic: ai-triage
type: decision
status: active
source:
  - ../handoff/2026-05-21-imedtac-two-endpoint-api-reply.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
---

# Not Sure Answer Boundary

## Decision

For the June demo API reply, use explicit `not_sure`-style answer options instead of a generic skip interaction.

## First Principle

The scarce resource is interpretable answer state. A generic skip records only that the user moved past the question; it does not record whether the user did not understand the question, did not know how to answer, or understood the question but did not remember the answer.

The demo should therefore treat uncertainty as an answer state, not as a missing event. When a user cannot provide a confident answer, iMVS should submit a stable option id such as `not_sure` or a question-specific `*_not_sure` option id through `answer.selected_option_ids`.

## API Contract Implication

- Use `question.allow_not_sure` to indicate that the question provides an explicit uncertainty option.
- Use `question.not_sure_option_id` when a specific option id represents uncertainty.
- Do not use `question.allow_skip`, `answer.skipped`, or `skip_reason` in the June demo reply.
- Keep `selected_option_ids` as the answer contract for choice questions, including uncertainty options.

## Human Review Boundary

`not_sure` does not produce a clinical inference. It preserves uncertainty for staff-review workflow and allows the staff-review summary to state that specific details require confirmation.
