const assert = require("node:assert/strict");
const test = require("node:test");

const contract = require("../../api/lib/triage-demo-contract");

function startBody(overrides = {}) {
  return {
    request_id: overrides.request_id || "req-contract-start-001",
    idempotency_key: overrides.idempotency_key || "idem-contract-start-001",
    case_id: "demo-tachycardia-live-001",
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    vitals: {
      heart_rate_bpm: {
        value: 130,
        unit: "bpm",
        measurement_status: "measured",
        quality_flag: "needs_review",
        missing_reason: null
      }
    },
    capabilities: {
      question_types: ["single_choice", "multi_choice"],
      max_questions: overrides.max_questions || 99,
      max_options_per_question: 9,
      variable_option_count: true,
      voice_input: false
    }
  };
}

function answerBody(question, selectedOptionIds, idempotencyKey) {
  return {
    request_id: `req-contract-answer-${question.id}`,
    idempotency_key: idempotencyKey,
    session_key: "filled-by-test",
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    question_id: question.id,
    answer: {
      selected_option_ids: selectedOptionIds,
      scale_value: null
    },
    client_event: {
      answered_at: "2026-05-25T10:02:00+08:00",
      input_mode: "touch"
    }
  };
}

function firstOptionIds(question) {
  return [question.options[0].id];
}

test("start session returns first question and progress.expected_total independent of max_questions", () => {
  contract.resetMockState();
  const result = contract.createSession(startBody({ max_questions: 99 }));

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.status, "question");
  assert.ok(result.body.session_key);
  assert.equal(result.body.progress.current, 1);
  assert.equal(result.body.progress.expected_total, 7);
  assert.equal(result.body.question.id, "tachy-chief-concern");
  assert.equal(result.body.question.rendering_constraints.max_visible_options_without_scroll, 9);
});

test("same answer idempotency key retry returns the same response without advancing flow", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody());
  const sessionKey = start.body.session_key;
  const firstQuestion = start.body.question;

  const firstAnswer = answerBody(firstQuestion, ["heart_racing"], "idem-contract-answer-001");
  const first = contract.submitAnswer(sessionKey, firstAnswer);
  const retry = contract.submitAnswer(sessionKey, {
    ...firstAnswer,
    request_id: "req-contract-answer-001-retry"
  });

  assert.equal(first.statusCode, 200);
  assert.equal(retry.statusCode, 200);
  assert.equal(retry.body.response_id, first.body.response_id);
  assert.equal(retry.body.progress.current, 2);
  assert.equal(retry.body.question.id, "tachy-onset");

  const second = contract.submitAnswer(sessionKey, answerBody(first.body.question, ["half_day"], "idem-contract-answer-002"));
  assert.equal(second.body.progress.current, 3);
  assert.equal(second.body.question.id, "tachy-current-feeling");
});

test("same idempotency key with different answer body returns idempotency_conflict", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody());
  const sessionKey = start.body.session_key;
  const firstQuestion = start.body.question;

  const first = contract.submitAnswer(sessionKey, answerBody(firstQuestion, ["heart_racing"], "idem-conflict-001"));
  const conflict = contract.submitAnswer(sessionKey, answerBody(firstQuestion, ["chest_tightness"], "idem-conflict-001"));

  assert.equal(first.statusCode, 200);
  assert.equal(conflict.statusCode, 409);
  assert.equal(conflict.body.status, "error");
  assert.equal(conflict.body.error.code, "idempotency_conflict");
  assert.equal(conflict.body.error.retryable, false);
  assert.equal(conflict.body.session_state, "active");
  assert.equal(conflict.body.recovery.safe_next_action, "restart_demo_session");
  assert.equal(conflict.body.recovery.ui_locking_required, true);
});

test("answering the final question returns status=summary with staff_review_summary", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody());
  const sessionKey = start.body.session_key;
  let currentQuestion = start.body.question;
  let result;

  for (let index = 0; index < contract.questionSequence.length; index += 1) {
    const selected = currentQuestion.none_option_id
      ? [currentQuestion.none_option_id]
      : firstOptionIds(currentQuestion);
    result = contract.submitAnswer(sessionKey, answerBody(currentQuestion, selected, `idem-summary-${index + 1}`));
    currentQuestion = result.body.question;
  }

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.status, "summary");
  assert.equal(result.body.session_state, "summary_ready");
  assert.equal(result.body.progress.current, 7);
  assert.equal(result.body.progress.expected_total, 7);
  assert.ok(result.body.staff_review_summary);
  assert.equal(result.body.summary_visibility, "staff_only");
});

test("invalid session returns a stable error response", () => {
  contract.resetMockState();
  const body = answerBody(contract.questionSequence[0], ["heart_racing"], "idem-invalid-session-001");
  const result = contract.submitAnswer("missing-session", body);

  assert.equal(result.statusCode, 404);
  assert.equal(result.body.status, "error");
  assert.equal(result.body.error.code, "invalid_session");
  assert.equal(result.body.error.retryable, false);
  assert.equal(result.body.session_key, "missing-session");
});
