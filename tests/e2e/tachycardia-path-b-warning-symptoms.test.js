const assert = require("node:assert/strict");
const test = require("node:test");

const contract = require("../../api/lib/triage-demo-contract");

function startBody() {
  return {
    request_id: "req-e2e-path-b-start",
    idempotency_key: "idem-e2e-path-b-start",
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

test("E2E Path B chest pressure plus shortness of breath and dizziness reaches warning staff summary", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody());
  const sessionKey = start.body.session_key;
  let body = start.body;

  const path = [
    ["chest_tightness"],
    ["half_day"],
    ["chest_heavy"],
    ["short_breath", "dizzy_faint"]
  ];

  for (const [index, selected] of path.entries()) {
    body = contract.submitAnswer(sessionKey, answer(body.question, selected, `idem-e2e-path-b-${index}`)).body;
  }

  assert.equal(body.question.id, "tachy-warning-symptom-review");
  body = contract.submitAnswer(sessionKey, answer(body.question, ["symptoms_still_present"], "idem-e2e-path-b-4")).body;
  body = contract.submitAnswer(sessionKey, answer(body.question, ["staff_confirm"], "idem-e2e-path-b-5")).body;
  body = contract.submitAnswer(sessionKey, answer(body.question, ["not_sure"], "idem-e2e-path-b-6")).body;

  assert.equal(body.status, "summary");
  assert.ok(body.handoff_reason_codes.includes("associated_warning_symptom_selected"));
  assert.match(body.staff_review_summary.subjective.join(" "), /shortness of breath/i);
  assert.match(body.staff_review_summary.subjective.join(" "), /dizziness/i);
});
