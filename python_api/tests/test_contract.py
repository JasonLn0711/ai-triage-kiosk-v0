from __future__ import annotations

import os

from fastapi.testclient import TestClient

from python_api import triage_contract as contract
from python_api.main import app


client = TestClient(app)


def start_body(**overrides):
    return {
        "request_id": overrides.get("request_id", "req-contract-start-001"),
        "idempotency_key": overrides.get("idempotency_key", "idem-contract-start-001"),
        "case_id": "demo-tachycardia-live-001",
        "workflow_mode": "post_measurement_only",
        "measurement_state": "complete",
        "vitals_ready": True,
        "vitals": {
            "heart_rate_bpm": {
                "value": 130,
                "unit": "bpm",
                "measurement_status": "measured",
                "quality_flag": "needs_review",
                "missing_reason": None,
            }
        },
        "capabilities": {
            "question_types": ["single_choice", "multi_choice"],
            "max_questions": overrides.get("max_questions", 99),
            "max_options_per_question": 9,
            "variable_option_count": True,
            "voice_input": False,
        },
    }


def answer_body(question, selected_option_ids, idempotency_key):
    return {
        "request_id": f"req-contract-answer-{question['id']}",
        "idempotency_key": idempotency_key,
        "session_key": "filled-by-test",
        "workflow_mode": "post_measurement_only",
        "measurement_state": "complete",
        "vitals_ready": True,
        "question_id": question["id"],
        "answer": {
            "selected_option_ids": selected_option_ids,
            "scale_value": None,
        },
        "client_event": {
            "answered_at": "2026-05-25T10:02:00+08:00",
            "input_mode": "touch",
        },
    }


def first_option_ids(question):
    return [question["options"][0]["id"]]


def setup_function():
    contract.reset_mock_state()
    os.environ.pop("DEMO_BEARER_TOKEN", None)


def test_demo_bearer_token_gate_is_disabled_until_configured():
    response = client.post("/api/triage-demo/sessions", json=start_body())
    assert response.status_code == 200


def test_demo_bearer_token_gate_accepts_only_configured_authorization_header():
    os.environ["DEMO_BEARER_TOKEN"] = "unit-test-demo-token"

    missing = client.post("/api/triage-demo/sessions", json=start_body(idempotency_key="idem-missing"))
    invalid = client.post(
        "/api/triage-demo/sessions",
        json=start_body(idempotency_key="idem-invalid"),
        headers={"Authorization": "Bearer wrong-token"},
    )
    valid = client.post(
        "/api/triage-demo/sessions",
        json=start_body(idempotency_key="idem-valid"),
        headers={"Authorization": "Bearer unit-test-demo-token"},
    )

    assert missing.status_code == 401
    assert missing.json()["status"] == "error"
    assert missing.json()["error"]["code"] == "demo_bearer_token_required"
    assert missing.json()["error"]["details"]["required_header"] == "Authorization: Bearer <demo token>"
    assert invalid.status_code == 401
    assert valid.status_code == 200


def test_start_session_returns_first_question_and_progress_expected_total():
    response = client.post("/api/triage-demo/sessions", json=start_body(max_questions=99))
    body = response.json()

    assert response.status_code == 200
    assert body["status"] == "question"
    assert body["session_key"]
    assert body["progress"]["current"] == 1
    assert body["progress"]["expected_total"] == 7
    assert body["question"]["id"] == "tachy-chief-concern"
    assert body["question"]["rendering_constraints"]["max_visible_options_without_scroll"] == 9


def test_same_answer_idempotency_key_retry_returns_same_response_without_advancing_flow():
    start = client.post("/api/triage-demo/sessions", json=start_body()).json()
    session_key = start["session_key"]
    first_question = start["question"]

    first_answer = answer_body(first_question, ["heart_racing"], "idem-contract-answer-001")
    first = client.post(f"/api/triage-demo/sessions/{session_key}/answers", json=first_answer)
    retry = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json={**first_answer, "request_id": "req-contract-answer-001-retry"},
    )

    assert first.status_code == 200
    assert retry.status_code == 200
    assert retry.json()["response_id"] == first.json()["response_id"]
    assert retry.json()["progress"]["current"] == 2
    assert retry.json()["question"]["id"] == "tachy-onset"

    second = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(first.json()["question"], ["half_day"], "idem-contract-answer-002"),
    )
    assert second.json()["progress"]["current"] == 3
    assert second.json()["question"]["id"] == "tachy-current-feeling"


def test_same_idempotency_key_with_different_answer_body_returns_conflict():
    start = client.post("/api/triage-demo/sessions", json=start_body()).json()
    session_key = start["session_key"]
    first_question = start["question"]

    first = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(first_question, ["heart_racing"], "idem-conflict-001"),
    )
    conflict = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(first_question, ["chest_tightness"], "idem-conflict-001"),
    )
    body = conflict.json()

    assert first.status_code == 200
    assert conflict.status_code == 409
    assert body["status"] == "error"
    assert body["error"]["code"] == "idempotency_conflict"
    assert body["error"]["retryable"] is False
    assert body["session_state"] == "active"
    assert body["recovery"]["safe_next_action"] == "restart_demo_session"
    assert body["recovery"]["ui_locking_required"] is True


def test_answering_final_question_returns_staff_review_summary():
    start = client.post("/api/triage-demo/sessions", json=start_body()).json()
    session_key = start["session_key"]
    current_question = start["question"]
    result = None

    for index in range(contract.expected_total):
        selected = [current_question["none_option_id"]] if current_question.get("none_option_id") else first_option_ids(current_question)
        result = client.post(
            f"/api/triage-demo/sessions/{session_key}/answers",
            json=answer_body(current_question, selected, f"idem-summary-{index + 1}"),
        )
        body = result.json()
        current_question = body.get("question")

    body = result.json()
    assert result.status_code == 200
    assert body["status"] == "summary"
    assert body["session_state"] == "summary_ready"
    assert body["progress"]["current"] == 7
    assert body["progress"]["expected_total"] == 7
    assert body["staff_review_summary"]
    assert body["summary_visibility"] == "staff_only"


def test_invalid_session_returns_stable_error_response():
    body = answer_body(contract.question_sequence[0], ["heart_racing"], "idem-invalid-session-001")
    response = client.post("/api/triage-demo/sessions/missing-session/answers", json=body)
    data = response.json()

    assert response.status_code == 404
    assert data["status"] == "error"
    assert data["error"]["code"] == "invalid_session"
    assert data["error"]["retryable"] is False
    assert data["session_key"] == "missing-session"


def test_options_preflight_returns_cors_headers():
    response = client.options(
        "/api/triage-demo/sessions",
        headers={"Origin": "http://localhost:5174"},
    )

    assert response.status_code == 204
    assert response.headers["Access-Control-Allow-Origin"] == "http://localhost:5174"
    assert response.headers["Access-Control-Allow-Methods"] == "POST, OPTIONS"

