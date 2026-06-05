from __future__ import annotations

from pathlib import Path
from typing import Any

from .models import Question, QuestionOption


def _question(config: dict[str, Any]) -> Question:
    return Question(
        id=config["id"],
        phase="post_measurement_intake",
        type=config["type"],
        text=config["text"],
        options=[QuestionOption(option["id"], option["label"]) for option in config["options"]],
        max_selections=config["max_selections"],
        required=config.get("required", True) is not False,
        trigger_reason_codes=config["trigger_reason_codes"],
        source_refs=config["source_refs"],
        evidence_status=config["evidence_status"],
        summary_effect=config["summary_effect"],
        registry_refs=config["registry_refs"],
        none_option_id=config.get("none_option_id"),
        allow_not_sure=config.get("allow_not_sure", True) is not False,
        allow_skip=config.get("allow_skip") is True,
        evidence_refs=config.get("evidence_refs", ["DUOBAO-AFRVR-TACHY-QA-20260525", "LOCAL-PROTOCOL-TBD"]),
    )


def tachycardia_questions(project_root: Path) -> list[Question]:
    import json

    start = json.loads((project_root / "handoff/api-examples/2026-05-21-start-session-response-question.json").read_text(encoding="utf-8"))
    next_question = json.loads((project_root / "handoff/api-examples/2026-05-21-next-question-response-demo-tachycardia.json").read_text(encoding="utf-8"))
    post_vital = json.loads((project_root / "handoff/api-examples/2026-05-21-post-vital-question-response-demo-tachycardia.json").read_text(encoding="utf-8"))

    def from_dict(value: dict[str, Any]) -> Question:
        return Question(
            id=value["id"],
            phase="post_measurement_intake",
            type=value["type"],
            text=value["text"],
            options=[QuestionOption(option["id"], option["label"]) for option in value["options"]],
            max_selections=value["max_selections"],
            required=value.get("required", True),
            trigger_reason_codes=value.get("trigger_reason_codes", []),
            source_refs=value.get("source_refs", []),
            evidence_status=value.get("evidence_status", "clinical-review-needed"),
            summary_effect=value.get("summary_effect", ""),
            registry_refs=value.get("registry_refs", []),
            none_option_id=value.get("none_option_id"),
            allow_not_sure=value.get("allow_not_sure", True),
            allow_skip=value.get("allow_skip", False),
            evidence_refs=value.get("evidence_refs", ["DUOBAO-AFRVR-TACHY-QA-20260525", "LOCAL-PROTOCOL-TBD"]),
            demo_boundary=value.get("demo_boundary", "Synthetic-data demo question for staff-review intake support."),
        )

    return [
        from_dict(start["question"]),
        from_dict(next_question["question"]),
        _question({
            "id": "tachy-current-feeling",
            "registry_refs": ["TACHY-003"],
            "source_refs": ["AHA-TACHYCARDIA-FAST-HR", "AHA-HEART-ATTACK", "DUOBAO-DEMO-DESIGN-20260520", "DUOBAO-AFRVR-TACHY-QA-20260525"],
            "evidence_status": "source-backed",
            "type": "multi_choice",
            "text": "Which descriptions fit what you feel now?",
            "options": [
                {"id": "heart_racing", "label": "Heart racing or pounding"},
                {"id": "chest_heavy", "label": "Chest tightness or heaviness"},
                {"id": "chest_pressure_pain", "label": "Chest pressure or pain"},
                {"id": "burning_sharp_or_not_sure", "label": "Burning, sharp discomfort, or not sure"},
            ],
            "max_selections": 4,
            "trigger_reason_codes": ["reported_palpitations", "reported_chest_tightness"],
            "summary_effect": "Adds current palpitation and chest-tightness descriptors to the staff-review summary.",
        }),
        _question({
            "id": "tachy-associated-symptoms",
            "registry_refs": ["TACHY-004"],
            "source_refs": ["AHA-TACHYCARDIA-FAST-HR", "AHA-HEART-ATTACK", "MEDLINEPLUS-AFIB", "DUOBAO-AFRVR-TACHY-QA-20260525"],
            "evidence_status": "source-backed",
            "type": "multi_choice",
            "text": "Are any of these happening with it?",
            "options": [
                {"id": "short_breath", "label": "Shortness of breath"},
                {"id": "sweating_nausea_fatigue", "label": "Sweating, nausea, or unusual fatigue"},
                {"id": "dizzy_faint", "label": "Dizziness, lightheadedness, or fainting"},
                {"id": "none_of_these", "label": "None of these"},
            ],
            "none_option_id": "none_of_these",
            "max_selections": 4,
            "trigger_reason_codes": ["associated_warning_symptom_screen"],
            "summary_effect": "Adds associated warning-symptom positives or negatives to the staff-review summary.",
        }),
        from_dict(post_vital["question"]),
        _question({
            "id": "tachy-heart-history-meds",
            "registry_refs": ["TACHY-006"],
            "source_refs": ["MEDLINEPLUS-AFIB", "ENA-ESI-V5", "DUOBAO-AFRVR-TACHY-QA-20260525", "LOCAL-PROTOCOL-TBD"],
            "evidence_status": "source-family",
            "type": "multi_choice",
            "text": "Have you been told you have a heart rhythm problem, or do you take heart / blood-pressure medicine?",
            "options": [
                {"id": "known_rhythm_problem", "label": "Known rhythm problem"},
                {"id": "heart_bp_medicine", "label": "Heart or blood-pressure medicine"},
                {"id": "no_known", "label": "No known history / medicine"},
                {"id": "staff_confirm", "label": "Not sure, staff should confirm"},
            ],
            "max_selections": 4,
            "trigger_reason_codes": ["history_medication_context"],
            "summary_effect": "Adds rhythm-history and heart/blood-pressure medication context for staff confirmation.",
        }),
        _question({
            "id": "tachy-medication-allergy-confirm",
            "registry_refs": ["TACHY-007"],
            "source_refs": ["LOCAL-PROTOCOL-TBD", "DUOBAO-DEMO-DESIGN-20260520", "DUOBAO-AFRVR-TACHY-QA-20260525"],
            "evidence_status": "clinical-review-needed",
            "type": "multi_choice",
            "text": "Do you have medication allergies or medicines staff should confirm?",
            "options": [
                {"id": "med_allergy", "label": "Medication allergy"},
                {"id": "regular_medicines", "label": "Regular medicines"},
                {"id": "none_known", "label": "No known medication allergy"},
                {"id": "not_sure", "label": "Not sure"},
            ],
            "max_selections": 4,
            "trigger_reason_codes": ["medication_allergy_context"],
            "summary_effect": "Adds medication and allergy uncertainty to the staff-review summary.",
        }),
    ]

