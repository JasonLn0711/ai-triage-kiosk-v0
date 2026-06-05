from __future__ import annotations

from typing import Any

from .constants import BRANCH_MODULES
from .models import AnswerRecord, FlowState, Question
from .question_registry import QuestionRegistry
from .vital_normalizer import normalize_vitals
from .vital_rules import evaluate_vitals


def has_flag(flow_state: FlowState, code: str) -> bool:
    return any(flag.code == code for flag in flow_state.flags)


def _requested_chief_concern(body: dict[str, Any]) -> str:
    context = body.get("patient_context") if isinstance(body.get("patient_context"), dict) else {}
    return str(body.get("chief_concern") or context.get("chief_concern") or "").strip().lower()


def choose_branch(body: dict[str, Any], flags: list) -> str:
    flag_codes = {flag.code for flag in flags}
    chief_concern = _requested_chief_concern(body)
    case_id = body.get("case_id")

    if case_id == "demo-v1-fever-001":
        return "fever"
    if case_id == "demo-v1-low-spo2-001":
        return "shortness_of_breath"
    if case_id == "demo-tachycardia-live-001" or "tachycardia_staff_review_demo" in flag_codes:
        return "palpitation"
    if any(term in chief_concern for term in ("palpitation", "heart racing", "tachycardia", "chest")):
        return "palpitation"
    if "low_spo2_review_demo" in flag_codes:
        return "shortness_of_breath"
    if "measured_fever_context_demo" in flag_codes:
        return "fever"
    if any(term in chief_concern for term in ("fever", "temperature", "chills")):
        return "fever"
    if any(term in chief_concern for term in ("breath", "spo2", "oxygen")):
        return "shortness_of_breath"
    return "palpitation"


def build_initial_flow(body: dict[str, Any], registry: QuestionRegistry, session_key: str, expires_at: str, fixture: dict[str, Any]) -> FlowState:
    raw_vitals = body.get("vitals") or fixture.get("vitals") or {}
    vitals = normalize_vitals(raw_vitals)
    flags = evaluate_vitals(vitals)
    branch = choose_branch(body, flags)
    if branch == "palpitation":
        questions = registry.questions_for_module("tachycardia_compatibility")
    else:
        questions = registry.questions_for_module(BRANCH_MODULES[branch]) + registry.universal_questions()
        for question in registry.universal_questions():
            registry.add(question, module_key=f"universal:{branch}")

    return FlowState(
        session_key=session_key,
        case_id=body.get("case_id") or fixture["case_id"],
        flow_version="rule-based-fixed-flow-v1-demo",
        current_phase=questions[0].phase if questions else "summary",
        question_plan=[question.id for question in questions],
        current_index=0,
        vitals=vitals,
        patient_context=body.get("patient_context") or fixture.get("profile") or {},
        answers=[],
        flags=flags,
        branch=branch,
        session_expires_at=expires_at,
        start_request=dict(body),
    )


def next_question(flow_state: FlowState, registry: QuestionRegistry) -> Question | None:
    if flow_state.current_index >= len(flow_state.question_plan):
        return None
    return registry.get(flow_state.question_plan[flow_state.current_index])


def selected_option_ids(body: dict[str, Any]) -> list[str]:
    answer = body.get("answer")
    selected = answer.get("selected_option_ids") if isinstance(answer, dict) else None
    return selected if isinstance(selected, list) else []


def validate_answer(question: Question, body: dict[str, Any]) -> str | None:
    if not body.get("question_id"):
        return "question_id is required"
    if body["question_id"] != question.id:
        return f"expected question_id {question.id}, received {body['question_id']}"
    selected = selected_option_ids(body)
    if not selected:
        return "answer.selected_option_ids must contain at least one option id"
    if len(selected) > question.max_selections:
        return f"selected_option_ids exceeds max_selections {question.max_selections}"
    allowed = {option.id for option in question.options}
    invalid = [option_id for option_id in selected if option_id not in allowed]
    if invalid:
        return f"unknown option id(s): {', '.join(invalid)}"
    return None


def record_answer(flow_state: FlowState, body: dict[str, Any], question: Question) -> None:
    flow_state.answers.append(AnswerRecord(
        question_id=question.id,
        selected_option_ids=selected_option_ids(body),
        request_id=body.get("request_id") or None,
        idempotency_key=body.get("idempotency_key") or None,
    ))
    flow_state.current_index += 1
    next_id = flow_state.question_plan[flow_state.current_index] if flow_state.current_index < len(flow_state.question_plan) else None
    flow_state.current_phase = "summary" if next_id is None else question.phase

