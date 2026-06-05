from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class NormalizedVital:
    name: str
    value: float | int | None
    unit: str
    measurement_status: str
    quality_flag: str
    missing_reason: str | None = None


@dataclass(frozen=True)
class QuestionOption:
    id: str
    label: str


@dataclass(frozen=True)
class Question:
    id: str
    phase: str
    type: str
    text: str
    options: list[QuestionOption]
    max_selections: int
    required: bool = True
    trigger_reason_codes: list[str] = field(default_factory=list)
    source_refs: list[str] = field(default_factory=list)
    evidence_status: str = "clinical-review-needed"
    summary_effect: str = ""
    registry_refs: list[str] = field(default_factory=list)
    none_option_id: str | None = None
    allow_not_sure: bool = True
    allow_skip: bool = False
    evidence_refs: list[str] = field(default_factory=lambda: ["LOCAL-PROTOCOL-TBD"])
    demo_boundary: str = "Synthetic-data demo question for staff-review intake support."


@dataclass(frozen=True)
class AnswerRecord:
    question_id: str
    selected_option_ids: list[str]
    request_id: str | None = None
    idempotency_key: str | None = None


@dataclass(frozen=True)
class ReviewFlag:
    code: str
    label: str
    source: str
    summary_text: str
    triggered_by: list[str]


@dataclass
class FlowState:
    session_key: str
    case_id: str
    flow_version: str
    current_phase: str
    question_plan: list[str]
    current_index: int
    vitals: dict[str, NormalizedVital]
    patient_context: dict[str, Any]
    answers: list[AnswerRecord]
    flags: list[ReviewFlag]
    branch: str
    state: str = "active"
    session_expires_at: str = ""
    start_request: dict[str, Any] = field(default_factory=dict)

