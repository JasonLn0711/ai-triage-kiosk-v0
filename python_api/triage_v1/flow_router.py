from __future__ import annotations

from typing import Any

from .constants import BRANCH_MODULES
from .models import AnswerRecord, FlowState, Patient, Question
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
    if not flags:
        return "initial_intake"
    if "tachycardia_staff_review_demo" in flag_codes:
        return "palpitation"
    if "low_spo2_review_demo" in flag_codes:
        return "shortness_of_breath"
    if "measured_fever_context_demo" in flag_codes:
        return "fever"
    if "measured_elevated_heart_rate_demo" in flag_codes:
        return "palpitation"
    if any(term in chief_concern for term in ("palpitation", "heart racing", "tachycardia", "chest")):
        return "palpitation"
    if any(term in chief_concern for term in ("fever", "temperature", "chills")):
        return "fever"
    if any(term in chief_concern for term in ("breath", "spo2", "oxygen")):
        return "shortness_of_breath"
    return "palpitation"


def build_initial_flow(body: dict[str, Any], registry: QuestionRegistry, session_key: str, expires_at: str) -> FlowState:
    raw_vitals = body.get("vitals") or {}
    vitals = normalize_vitals(raw_vitals)
    flags = evaluate_vitals(vitals)
    branch = choose_branch(body, flags)
    patient_context = body.get("patient_context") if isinstance(body.get("patient_context"), dict) else {}
    if branch == "initial_intake":
        questions = registry.initial_questions()
    elif branch == "palpitation":
        questions = registry.questions_for_module("tachycardia_compatibility")
    else:
        questions = registry.questions_for_module(BRANCH_MODULES[branch]) + registry.universal_questions()

    return FlowState(
        session_key=session_key,
        case_id=f"vital-routed-{branch}",
        flow_version="vital-rules-router-v1-demo",
        current_phase=questions[0].phase if questions else "summary",
        question_plan=[question.id for question in questions],
        current_index=0,
        vitals=vitals,
        patient_context=patient_context,
        patient=Patient.from_context(patient_context, vitals, branch),
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


def answer_value(body: dict[str, Any]) -> str | float | int | None:
    answer = body.get("answer")
    if not isinstance(answer, dict):
        return None
    numeric = answer.get("numeric_value")
    if numeric not in (None, "") and isinstance(numeric, int | float):
        return numeric
    text = answer.get("text_value")
    if text not in (None, ""):
        return str(text).strip()
    return None


def validate_answer(question: Question, body: dict[str, Any]) -> str | None:
    if not body.get("question_id"):
        return "question_id is required"
    if body["question_id"] != question.id:
        return f"expected question_id {question.id}, received {body['question_id']}"
    value = answer_value(body)
    if question.type == "number":
        if not isinstance(value, int | float):
            return "answer.numeric_value is required for number questions"
        return None
    if question.type in {"text", "time"}:
        if not value:
            return f"answer.text_value is required for {question.type} questions"
        return None
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


def _label_for_selected(question: Question, selected: list[str]) -> str:
    labels = [option.label for option in question.options if option.id in selected]
    return " ".join(labels).lower()


def _display_label_for_selected(question: Question, selected: list[str]) -> str:
    labels = [option.label for option in question.options if option.id in selected]
    return " ".join(labels).strip()


def _module_for_initial_answers(flow_state: FlowState, registry: QuestionRegistry) -> str:
    complaint_answer = next((answer for answer in flow_state.answers if answer.question_id == "INIT-3"), None)
    complaint = _label_for_selected(registry.get("INIT-3"), complaint_answer.selected_option_ids) if complaint_answer else ""
    if "chest pain" in complaint:
        return "Pain/chest_pain.md"
    if "shortness of breath" in complaint:
        return BRANCH_MODULES["shortness_of_breath"]
    if "palpitation" in complaint:
        return BRANCH_MODULES["palpitation"]
    if "fever" in complaint:
        return BRANCH_MODULES["fever"]
    if "headache" in complaint:
        return "Pain/Headache.md"
    if "abdominal pain" in complaint:
        return "Pain/abdominal_pain.md"
    if "dizziness" in complaint:
        return "Neuro/dizziness.md"
    if "fainting" in complaint:
        return "Neuro/syncope.md"
    if "urinary" in complaint:
        return "Renal&GU/urinary_symptoms.md"
    if "cough" in complaint or "cold" in complaint:
        return "Respiratory/upper_respiratory.md"
    if "diarrhea" in complaint:
        return "GI/diarrhea_constipation.md"
    if "back pain" in complaint:
        return "Pain/back_pain.md"
    if "eye problem" in complaint:
        return "Eye/eye.md"
    if "ear" in complaint or "nose" in complaint or "throat" in complaint or "sore throat" in complaint:
        return "ENT/ent.md"
    if "skin" in complaint or "allergy" in complaint:
        return "Skin/skin_infection.md"
    if "trauma" in complaint:
        return "Trauma/trauma.md"
    if "nausea" in complaint or "vomiting" in complaint:
        return "GI/nausea_vomiting.md"
    if "weakness" in complaint or "fatigue" in complaint:
        return "Neuro/weakness_fatigue.md"
    if "limb pain" in complaint or "swelling" in complaint:
        return "Pain/limb_pain_swelling.md"


def _maybe_expand_initial_intake(flow_state: FlowState, registry: QuestionRegistry) -> None:
    if flow_state.branch != "initial_intake":
        return
    initial_ids = [question.id for question in registry.initial_questions()]
    if flow_state.current_index < len(initial_ids):
        return
    module_key = _module_for_initial_answers(flow_state, registry)
    added_questions = registry.questions_for_module(module_key) + registry.universal_questions()
    flow_state.question_plan.extend(question.id for question in added_questions)
    flow_state.branch = module_key
    flow_state.case_id = f"vital-routed-{module_key.replace('/', '-').replace('.md', '')}"


def record_answer(flow_state: FlowState, body: dict[str, Any], question: Question, registry: QuestionRegistry | None = None) -> None:
    selected = selected_option_ids(body)
    value = answer_value(body)
    flow_state.answers.append(AnswerRecord(
        question_id=question.id,
        selected_option_ids=selected,
        numeric_value=value if isinstance(value, int | float) else None,
        text_value=value if isinstance(value, str) else None,
        request_id=body.get("request_id") or None,
        idempotency_key=body.get("idempotency_key") or None,
    ))
    flow_state.patient.record_answer(question, selected, value)
    if question.id == "INIT-1" and selected:
        sex = _display_label_for_selected(question, selected)
        if sex:
            flow_state.patient.sex = sex
            flow_state.patient_context["sex"] = sex
    if question.id == "INIT-2" and isinstance(value, int | float):
        flow_state.patient.age = value
        flow_state.patient_context["age"] = value
    if question.id == "INIT-3" and selected:
        chief_concern = _display_label_for_selected(question, selected)
        flow_state.patient.chief_concern = chief_concern
        flow_state.patient_context["chief_concern"] = chief_concern
    flow_state.current_index += 1
    if registry:
        _maybe_expand_initial_intake(flow_state, registry)
    next_id = flow_state.question_plan[flow_state.current_index] if flow_state.current_index < len(flow_state.question_plan) else None
    flow_state.current_phase = "summary" if next_id is None else registry.get(next_id).phase if registry else question.phase
