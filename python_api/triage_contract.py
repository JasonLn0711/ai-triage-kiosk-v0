from __future__ import annotations

import copy
import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable


PROJECT_ROOT = Path(__file__).resolve().parents[1]
JS_ROOT = PROJECT_ROOT / "JS"
DEMO_BOUNDARY = "Synthetic-data staff-review intake support with human-review workflow and separate production validation path."
ALLOWED_ORIGINS = {"http://localhost", "http://localhost:5174"}
SESSION_TTL_SECONDS = 30 * 60

_sessions: dict[str, dict[str, Any]] = {}
_idempotency_records: dict[str, dict[str, Any]] = {}
_response_counter = 0
_session_counter = 0


def _read_json(relative_path: str) -> Any:
    return json.loads((PROJECT_ROOT / relative_path).read_text(encoding="utf-8"))


def clone(value: Any) -> Any:
    return copy.deepcopy(value)


fixture = json.loads((JS_ROOT / "fixtures/tachycardia-live-demo.json").read_text(encoding="utf-8"))
start_question_example = _read_json("handoff/api-examples/2026-05-21-start-session-response-question.json")
next_question_example = _read_json("handoff/api-examples/2026-05-21-next-question-response-demo-tachycardia.json")
post_vital_question_example = _read_json("handoff/api-examples/2026-05-21-post-vital-question-response-demo-tachycardia.json")
summary_example = _read_json("handoff/api-examples/2026-05-21-summary-response-demo-tachycardia.json")


def _make_question(config: dict[str, Any]) -> dict[str, Any]:
    return {
        "registry_refs": config["registry_refs"],
        "source_refs": config["source_refs"],
        "evidence_status": config["evidence_status"],
        "review_owner": "clinical_reviewer_tbd",
        "type": config["type"],
        "ui_template": config["type"],
        "text": config["text"],
        "options": config["options"],
        "option_count": len(config["options"]),
        "none_option_id": config.get("none_option_id"),
        "required": config.get("required", True) is not False,
        "allow_not_sure": config.get("allow_not_sure", True) is not False,
        "allow_skip": config.get("allow_skip") is True,
        "max_selections": config["max_selections"],
        "trigger_reason_codes": config["trigger_reason_codes"],
        "summary_effect": config["summary_effect"],
        "rendering_constraints": {
            "requires_no_scroll": True,
            "max_visible_options_without_scroll": 9,
        },
        "evidence_refs": config.get("evidence_refs", ["DUOBAO-AFRVR-TACHY-QA-20260525", "LOCAL-PROTOCOL-TBD"]),
        "demo_boundary": config.get("demo_boundary", "Synthetic-data demo question for staff-review intake support."),
        "id": config["id"],
    }


question_sequence = [
    clone(start_question_example["question"]),
    clone(next_question_example["question"]),
    _make_question({
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
    _make_question({
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
    clone(post_vital_question_example["question"]),
    _make_question({
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
    _make_question({
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

expected_total = len(question_sequence)
contract_fields = {
    "api_version": start_question_example["api_version"],
    "schema_version": start_question_example["schema_version"],
    "flow_version": fixture["flow_version"],
    "case_id": fixture["case_id"],
    "case_version": fixture["case_version"],
    "fixture_version": fixture["fixture_version"],
    "question_set_version": fixture["question_set_version"],
    "wording_version": start_question_example["wording_version"],
}


def configured_demo_bearer_token() -> str | None:
    token = os.environ.get("DEMO_BEARER_TOKEN", "").strip()
    return token or None


def bearer_token_from_header(value: str | None) -> str | None:
    if not value:
        return None
    parts = value.strip().split(None, 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1].strip()
    return None


def demo_bearer_auth_challenge() -> str:
    return 'Bearer realm="nycu-imedtac-triage-demo"'


def require_demo_bearer_auth(headers: dict[str, str]) -> dict[str, Any] | None:
    expected_token = configured_demo_bearer_token()
    if not expected_token:
        return None

    received_token = bearer_token_from_header(headers.get("authorization") or headers.get("Authorization"))
    if received_token and hmac.compare_digest(received_token, expected_token):
        return None

    return error_result(401, {}, "demo_bearer_token_required", "A valid demo bearer token is required for this rehearsal API.", {
        "retryable": False,
        "details": {
            "required_header": "Authorization: Bearer <demo token>",
            "token_storage": "Set DEMO_BEARER_TOKEN in the deployment environment; do not store tokens in repo files.",
        },
    })


def _next_response_id(kind: str) -> str:
    global _response_counter
    _response_counter += 1
    return f"resp-demo-tachy-{kind}-{_response_counter:03d}"


def _next_session_key() -> str:
    global _session_counter
    _session_counter += 1
    return f"demo-session-tachy-{_session_counter:03d}"


def _expiry_from(now: datetime | None = None) -> str:
    current = now or datetime.now(timezone.utc)
    return (current + timedelta(seconds=SESSION_TTL_SECONDS)).isoformat().replace("+00:00", "Z")




def _base_response(body: dict[str, Any], session: dict[str, Any], kind: str) -> dict[str, Any]:
    return {
        **contract_fields,
        "request_id": body.get("request_id") or None,
        "response_id": _next_response_id(kind),
        "session_key": session["session_key"],
        "session_expires_at": session["session_expires_at"],
        "workflow_mode": "post_measurement_only",
        "measurement_state": "complete",
        "vitals_ready": True,
        "demo_boundary": DEMO_BOUNDARY,
    }


def _build_question_response(body: dict[str, Any], session: dict[str, Any], question_index: int, last_question_id: str | None, phase_reason: str) -> dict[str, Any]:
    return {
        **_base_response(body, session, f"question-{question_index + 1}"),
        "session_state": "active",
        "last_question_id": last_question_id,
        "status": "question",
        "question_phase": "post_measurement_intake",
        "phase_reason": phase_reason,
        "progress": {"current": question_index + 1, "expected_total": expected_total},
        "question": clone(question_sequence[question_index]),
    }


def _build_summary_response(body: dict[str, Any], session: dict[str, Any], last_question_id: str) -> dict[str, Any]:
    return {
        **clone(summary_example),
        **_base_response(body, session, "summary"),
        "session_state": "summary_ready",
        "last_question_id": last_question_id,
        "status": "summary",
        "question_phase": "summary",
        "progress": {"current": expected_total, "expected_total": expected_total},
    }


def error_result(status_code: int, body: dict[str, Any] | None, code: str, message: str, options: dict[str, Any] | None = None) -> dict[str, Any]:
    body = body or {}
    options = options or {}
    return {
        "statusCode": status_code,
        "body": {
            **contract_fields,
            "request_id": body.get("request_id") or None,
            "response_id": _next_response_id("error"),
            "session_key": options.get("session_key"),
            "session_expires_at": options.get("session_expires_at"),
            "status": "error",
            "session_state": options.get("session_state") or "error",
            "error": {
                "code": code,
                "message": message,
                "retryable": bool(options.get("retryable")),
                "details": options.get("details"),
            },
            "recovery": options.get("recovery"),
            "demo_boundary": DEMO_BOUNDARY,
        },
    }


def _stable_stringify(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _idempotency_comparable_body(body: dict[str, Any]) -> dict[str, Any]:
    comparable = clone(body or {})
    comparable.pop("request_id", None)
    return comparable


def _hash_body(body: dict[str, Any]) -> str:
    return hashlib.sha256(_stable_stringify(_idempotency_comparable_body(body)).encode("utf-8")).hexdigest()


def _idempotency_conflict_recovery() -> dict[str, Any]:
    return {
        "safe_next_action": "restart_demo_session",
        "owner": "imvs_ui_operator",
        "ui_locking_required": True,
        "instructions": [
            "Do not reuse this idempotency_key for a different answer.",
            "Do not auto-submit the changed answer with a new idempotency_key.",
            "Keep answer controls locked until the operator starts a new demo session or switches to labeled fallback.",
            "Start a new demo session through POST /api/triage-demo/sessions.",
        ],
    }


def _with_idempotency(scope: str, body: dict[str, Any], compute: Callable[[], dict[str, Any]], options: dict[str, Any] | None = None) -> dict[str, Any]:
    options = options or {}
    idempotency_key = body.get("idempotency_key")
    if not idempotency_key:
        return compute()

    record_key = f"{scope}:{idempotency_key}"
    body_hash = _hash_body(body)
    existing = _idempotency_records.get(record_key)
    if existing and existing["bodyHash"] != body_hash:
        return error_result(409, body, "idempotency_conflict", "The same idempotency_key was reused with a different request body.", {
            "retryable": False,
            "session_key": options.get("session_key"),
            "session_expires_at": options.get("session_expires_at"),
            "session_state": options.get("session_state") or "error",
            "details": {
                "idempotency_key": idempotency_key,
                "expected_body_hash": existing["bodyHash"],
                "received_body_hash": body_hash,
            },
            "recovery": _idempotency_conflict_recovery(),
        })
    if existing:
        return clone(existing["result"])

    result = compute()
    _idempotency_records[record_key] = {"bodyHash": body_hash, "result": clone(result)}
    return result


def _validate_case(body: dict[str, Any]) -> str | None:
    if body.get("case_id") and body["case_id"] != fixture["case_id"]:
        return f"unsupported case_id {body['case_id']}"
    if body.get("measurement_state") and body["measurement_state"] != "complete":
        return "measurement_state must be complete for the current post-measurement demo contract"
    if body.get("vitals_ready") is False:
        return "vitals_ready must be true for the current post-measurement demo contract"
    return None


def create_session(body: dict[str, Any] | None = None) -> dict[str, Any]:
    body = body or {}
    case_error = _validate_case(body)
    if case_error:
        return error_result(422, body, "invalid_start_session_request", case_error, {"retryable": False})

    def compute() -> dict[str, Any]:
        session = {
            "session_key": _next_session_key(),
            "session_expires_at": _expiry_from(),
            "state": "active",
            "answers": [],
            "start_request": clone(body),
            "vitals": clone(body.get("vitals") or fixture["vitals"]),
            "patient_context": clone(body.get("patient_context") or fixture["profile"]),
            "demo_script": clone(body.get("demo_script") or fixture["live_demo_controls"]),
        }
        _sessions[session["session_key"]] = session
        response = _build_question_response(
            body,
            session,
            0,
            None,
            "Measurement is complete and the demo heart-rate cue is available, so the tachycardia live intake question set can start.",
        )
        return {"statusCode": 200, "body": response}

    return _with_idempotency("sessions", body, compute)


def _selected_option_ids(body: dict[str, Any]) -> list[str]:
    answer = body.get("answer")
    selected = answer.get("selected_option_ids") if isinstance(answer, dict) else None
    return selected if isinstance(selected, list) else []


def _validate_answer(question: dict[str, Any], body: dict[str, Any]) -> str | None:
    if not body.get("question_id"):
        return "question_id is required"
    if body["question_id"] != question["id"]:
        return f"expected question_id {question['id']}, received {body['question_id']}"
    selected_ids = _selected_option_ids(body)
    if not selected_ids:
        return "answer.selected_option_ids must contain at least one option id"
    if len(selected_ids) > question["max_selections"]:
        return f"selected_option_ids exceeds max_selections {question['max_selections']}"
    allowed_option_ids = {option["id"] for option in question["options"]}
    invalid_ids = [option_id for option_id in selected_ids if option_id not in allowed_option_ids]
    if invalid_ids:
        return f"unknown option id(s): {', '.join(invalid_ids)}"
    return None


def submit_answer(session_key: str | None, body: dict[str, Any] | None = None) -> dict[str, Any]:
    body = body or {}
    session = _sessions.get(session_key or "")
    if not session:
        return error_result(404, body, "invalid_session", "The session_key was not found or is no longer available.", {
            "retryable": False,
            "session_key": session_key,
        })

    def compute() -> dict[str, Any]:
        if session["state"] == "summary_ready":
            return error_result(409, body, "session_summary_ready", "The session has already reached summary status; start a new session for another answer path.", {
                "retryable": False,
                "session_key": session["session_key"],
                "session_expires_at": session["session_expires_at"],
            })

        question = question_sequence[len(session["answers"])] if len(session["answers"]) < len(question_sequence) else None
        if not question:
            session["state"] = "summary_ready"
            return error_result(409, body, "session_summary_ready", "The session has no remaining questions.", {
                "retryable": False,
                "session_key": session["session_key"],
                "session_expires_at": session["session_expires_at"],
            })

        answer_error = _validate_answer(question, body)
        if answer_error:
            return error_result(422, body, "invalid_answer", answer_error, {
                "retryable": False,
                "session_key": session["session_key"],
                "session_expires_at": session["session_expires_at"],
            })

        session["answers"].append({
            "question_id": question["id"],
            "answer": clone(body.get("answer")),
            "request_id": body.get("request_id") or None,
            "idempotency_key": body.get("idempotency_key") or None,
        })

        next_index = len(session["answers"])
        if next_index >= expected_total:
            session["state"] = "summary_ready"
            return {"statusCode": 200, "body": _build_summary_response(body, session, question["id"])}

        return {
            "statusCode": 200,
            "body": _build_question_response(
                body,
                session,
                next_index,
                question["id"],
                f"{question['id']} was recorded; the next governed tachycardia demo question is ready.",
            ),
        }

    return _with_idempotency(
        f"answers:{session['session_key']}",
        body,
        compute,
        {
            "session_key": session["session_key"],
            "session_expires_at": session["session_expires_at"],
            "session_state": session["state"],
        },
    )


def reset_mock_state() -> None:
    global _response_counter, _session_counter
    _sessions.clear()
    _idempotency_records.clear()
    _response_counter = 0
    _session_counter = 0


def _stable_stringify(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _idempotency_comparable_body(body: dict[str, Any]) -> dict[str, Any]:
    comparable = clone(body or {})
    comparable.pop("request_id", None)
    return comparable


def _hash_body(body: dict[str, Any]) -> str:
    comparable = _idempotency_comparable_body(body)
    return hashlib.sha256(_stable_stringify(comparable).encode("utf-8")).hexdigest()


def _base_response(body: dict[str, Any], session: dict[str, Any], kind: str) -> dict[str, Any]:
    return {
        **contract_fields,
        "request_id": body.get("request_id") or None,
        "response_id": _next_response_id(kind),
        "session_key": session["session_key"],
        "session_expires_at": session["session_expires_at"],
        "workflow_mode": "post_measurement_only",
        "measurement_state": "complete",
        "vitals_ready": True,
        "demo_boundary": DEMO_BOUNDARY,
    }


def _build_question_response(
    body: dict[str, Any],
    session: dict[str, Any],
    question_index: int,
    last_question_id: str | None,
    phase_reason: str,
) -> dict[str, Any]:
    return {
        **_base_response(body, session, f"question-{question_index + 1}"),
        "session_state": "active",
        "last_question_id": last_question_id,
        "status": "question",
        "question_phase": "post_measurement_intake",
        "phase_reason": phase_reason,
        "progress": {
            "current": question_index + 1,
            "expected_total": expected_total,
        },
        "question": clone(question_sequence[question_index]),
    }


def _build_summary_response(body: dict[str, Any], session: dict[str, Any], last_question_id: str) -> dict[str, Any]:
    return {
        **clone(summary_example),
        **_base_response(body, session, "summary"),
        "session_state": "summary_ready",
        "last_question_id": last_question_id,
        "status": "summary",
        "question_phase": "summary",
        "progress": {
            "current": expected_total,
            "expected_total": expected_total,
        },
    }


def error_result(
    status_code: int,
    body: dict[str, Any] | None,
    code: str,
    message: str,
    options: dict[str, Any] | None = None,
) -> dict[str, Any]:
    body = body or {}
    options = options or {}
    return {
        "statusCode": status_code,
        "body": {
            **contract_fields,
            "request_id": body.get("request_id") or None,
            "response_id": _next_response_id("error"),
            "session_key": options.get("session_key"),
            "session_expires_at": options.get("session_expires_at"),
            "status": "error",
            "session_state": options.get("session_state") or "error",
            "error": {
                "code": code,
                "message": message,
                "retryable": bool(options.get("retryable")),
                "details": options.get("details"),
            },
            "recovery": options.get("recovery"),
            "demo_boundary": DEMO_BOUNDARY,
        },
    }


def _idempotency_conflict_recovery() -> dict[str, Any]:
    return {
        "safe_next_action": "restart_demo_session",
        "owner": "imvs_ui_operator",
        "ui_locking_required": True,
        "instructions": [
            "Do not reuse this idempotency_key for a different answer.",
            "Do not auto-submit the changed answer with a new idempotency_key.",
            "Keep answer controls locked until the operator starts a new demo session or switches to labeled fallback.",
            "Start a new demo session through POST /api/triage-demo/sessions.",
        ],
    }


def _with_idempotency(
    scope: str,
    body: dict[str, Any],
    compute: Callable[[], dict[str, Any]],
    options: dict[str, Any] | None = None,
) -> dict[str, Any]:
    options = options or {}
    idempotency_key = body.get("idempotency_key")
    if not idempotency_key:
        return compute()

    record_key = f"{scope}:{idempotency_key}"
    body_hash = _hash_body(body)
    existing = _idempotency_records.get(record_key)
    if existing and existing["bodyHash"] != body_hash:
        return error_result(409, body, "idempotency_conflict", "The same idempotency_key was reused with a different request body.", {
            "retryable": False,
            "session_key": options.get("session_key"),
            "session_expires_at": options.get("session_expires_at"),
            "session_state": options.get("session_state") or "error",
            "details": {
                "idempotency_key": idempotency_key,
                "expected_body_hash": existing["bodyHash"],
                "received_body_hash": body_hash,
            },
            "recovery": _idempotency_conflict_recovery(),
        })
    if existing:
        return clone(existing["result"])

    result = compute()
    _idempotency_records[record_key] = {"bodyHash": body_hash, "result": clone(result)}
    return result


def _validate_case(body: dict[str, Any]) -> str | None:
    if body.get("case_id") and body["case_id"] != fixture["case_id"]:
        return f"unsupported case_id {body['case_id']}"
    if body.get("measurement_state") and body["measurement_state"] != "complete":
        return "measurement_state must be complete for the current post-measurement demo contract"
    if body.get("vitals_ready") is False:
        return "vitals_ready must be true for the current post-measurement demo contract"
    return None


def create_session(body: dict[str, Any] | None = None) -> dict[str, Any]:
    body = body or {}
    case_error = _validate_case(body)
    if case_error:
        return error_result(422, body, "invalid_start_session_request", case_error, {"retryable": False})

    def compute() -> dict[str, Any]:
        session = {
            "session_key": _next_session_key(),
            "session_expires_at": _expiry_from(),
            "state": "active",
            "answers": [],
            "start_request": clone(body),
            "vitals": clone(body.get("vitals") or fixture["vitals"]),
            "patient_context": clone(body.get("patient_context") or fixture["profile"]),
            "demo_script": clone(body.get("demo_script") or fixture["live_demo_controls"]),
        }
        _sessions[session["session_key"]] = session
        response = _build_question_response(
            body,
            session,
            0,
            None,
            "Measurement is complete and the demo heart-rate cue is available, so the tachycardia live intake question set can start.",
        )
        return {"statusCode": 200, "body": response}

    return _with_idempotency("sessions", body, compute)


def _selected_option_ids(body: dict[str, Any]) -> list[str]:
    answer = body.get("answer")
    selected = answer.get("selected_option_ids") if isinstance(answer, dict) else None
    return selected if isinstance(selected, list) else []


def _validate_answer(question: dict[str, Any], body: dict[str, Any]) -> str | None:
    if not body.get("question_id"):
        return "question_id is required"
    if body["question_id"] != question["id"]:
        return f"expected question_id {question['id']}, received {body['question_id']}"
    selected_ids = _selected_option_ids(body)
    if not selected_ids:
        return "answer.selected_option_ids must contain at least one option id"
    if len(selected_ids) > question["max_selections"]:
        return f"selected_option_ids exceeds max_selections {question['max_selections']}"
    allowed_option_ids = {option["id"] for option in question["options"]}
    invalid_ids = [option_id for option_id in selected_ids if option_id not in allowed_option_ids]
    if invalid_ids:
        return f"unknown option id(s): {', '.join(invalid_ids)}"
    return None


def submit_answer(session_key: str | None, body: dict[str, Any] | None = None) -> dict[str, Any]:
    body = body or {}
    session = _sessions.get(session_key or "")
    if not session:
        return error_result(404, body, "invalid_session", "The session_key was not found or is no longer available.", {
            "retryable": False,
            "session_key": session_key,
        })

    def compute() -> dict[str, Any]:
        if session["state"] == "summary_ready":
            return error_result(409, body, "session_summary_ready", "The session has already reached summary status; start a new session for another answer path.", {
                "retryable": False,
                "session_key": session["session_key"],
                "session_expires_at": session["session_expires_at"],
            })

        question = question_sequence[len(session["answers"])] if len(session["answers"]) < len(question_sequence) else None
        if not question:
            session["state"] = "summary_ready"
            return error_result(409, body, "session_summary_ready", "The session has no remaining questions.", {
                "retryable": False,
                "session_key": session["session_key"],
                "session_expires_at": session["session_expires_at"],
            })

        answer_error = _validate_answer(question, body)
        if answer_error:
            return error_result(422, body, "invalid_answer", answer_error, {
                "retryable": False,
                "session_key": session["session_key"],
                "session_expires_at": session["session_expires_at"],
            })

        session["answers"].append({
            "question_id": question["id"],
            "answer": clone(body.get("answer")),
            "request_id": body.get("request_id") or None,
            "idempotency_key": body.get("idempotency_key") or None,
        })

        next_index = len(session["answers"])
        if next_index >= expected_total:
            session["state"] = "summary_ready"
            return {"statusCode": 200, "body": _build_summary_response(body, session, question["id"])}

        return {
            "statusCode": 200,
            "body": _build_question_response(
                body,
                session,
                next_index,
                question["id"],
                f"{question['id']} was recorded; the next governed tachycardia demo question is ready.",
            ),
        }

    return _with_idempotency(
        f"answers:{session['session_key']}",
        body,
        compute,
        {
            "session_key": session["session_key"],
            "session_expires_at": session["session_expires_at"],
            "session_state": session["state"],
        },
    )


def reset_mock_state() -> None:
    global _response_counter, _session_counter
    _sessions.clear()
    _idempotency_records.clear()
    _response_counter = 0
    _session_counter = 0
