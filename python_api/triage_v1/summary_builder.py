from __future__ import annotations

from .constants import SCOPE_CONTROLS
from .models import FlowState
from .question_registry import QuestionRegistry


def _vital_line(flow_state: FlowState) -> str:
    observed = []
    for vital in flow_state.vitals.values():
        if vital.value is not None:
            observed.append(f"{vital.name} {vital.value} {vital.unit}")
    return "Observed demo vitals: " + (", ".join(observed) if observed else "no measured vital values supplied")


def build_summary(flow_state: FlowState, registry: QuestionRegistry) -> dict:
    highlights = []
    for answer in flow_state.answers:
        question = registry.get(answer.question_id)
        labels = [option.label for option in question.options if option.id in answer.selected_option_ids]
        highlights.append({
            "question_id": answer.question_id,
            "question_text": question.text,
            "selected_options": labels,
        })

    flag_codes = [flag.code for flag in flow_state.flags]
    return {
        "summary_visibility": "staff_only",
        "handoff_required": bool(flag_codes),
        "handoff_reason_codes": flag_codes + ["staff_review_needed"],
        "staff_review_summary": {
            "format": "review_summary_demo_v1",
            "capability_statement": "This demo shows a synthetic-data vital-aware intake loop for staff-review summary generation.",
            "scope_controls": SCOPE_CONTROLS,
            "vitals_observed": [
                {
                    "name": vital.name,
                    "value": vital.value,
                    "unit": vital.unit,
                    "measurement_status": vital.measurement_status,
                    "quality_flag": vital.quality_flag,
                    "missing_reason": vital.missing_reason,
                }
                for vital in flow_state.vitals.values()
                if vital.value is not None
            ],
            "chief_concern": flow_state.branch,
            "symptom_answer_highlights": highlights,
            "history_medication_allergy_context": [
                item for item in highlights if "history" in item["question_id"] or "allergy" in item["question_id"]
            ],
            "staff_review_flags": [
                {
                    "code": flag.code,
                    "label": flag.label,
                    "summary_text": flag.summary_text,
                    "triggered_by": flag.triggered_by,
                }
                for flag in flow_state.flags
            ],
            "subjective": [
                f"Synthetic demo branch: {flow_state.branch}.",
                f"{len(flow_state.answers)} governed intake answer(s) recorded for staff review.",
            ],
            "objective": [_vital_line(flow_state)],
            "review_basis": [
                "Measured vitals and selected answers are organized for human review in this demo workflow."
            ],
            "review_action": [
                "Please review measured vital context, selected symptom answers, and medication/allergy context."
            ],
            "staff_handoff_note": "Review measured vital context and selected symptom answers.",
        },
        "evidence_refs": ["LOCAL-PROTOCOL-TBD"],
    }

