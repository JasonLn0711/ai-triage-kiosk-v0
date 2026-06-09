const assert = require("node:assert/strict");
const test = require("node:test");

const contract = require("../../api/lib/triage-demo-contract");

function startBody() {
  return {
    request_id: "req-e2e-path-a-start",
    idempotency_key: "idem-e2e-path-a-start",
    case_id: "demo-tachycardia-live-001",
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    vitals: {
      heart_rate_bpm: 130,
      spo2_percent: 97,
      blood_pressure_systolic_mm_hg: 128,
      blood_pressure_diastolic_mm_hg: 82
    },
    capabilities: {
      question_types: ["single_choice", "multi_choice"],
      max_questions: 99,
      max_options_per_question: 9,
      variable_option_count: true,
      voice_input: false
    }
  };
}

function answer(question, selectedOptionIds, key) {
  return {
    request_id: `req-${key}`,
    idempotency_key: key,
    question_id: question.id,
    answer: { selected_option_ids: selectedOptionIds, scale_value: null }
  };
}

test("E2E Path A palpitations plus no associated symptoms reaches low-concern staff summary", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody());
  const sessionKey = start.body.session_key;
  let body = start.body;

  const path = [
    ["heart_racing"],
    ["half_day"],
    ["heart_racing"],
    ["none_of_these"],
    ["still_racing"],
    ["staff_confirm"],
    ["none_known"]
  ];

  for (const [index, selected] of path.entries()) {
    body = contract.submitAnswer(sessionKey, answer(body.question, selected, `idem-e2e-path-a-${index}`)).body;
  }

  assert.equal(body.status, "summary");
  assert.ok(body.handoff_reason_codes.includes("no_listed_associated_symptoms_selected"));
  assert.match(body.staff_review_summary.objective.join(" "), /HR 130 bpm/);
});
