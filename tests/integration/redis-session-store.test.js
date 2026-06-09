const assert = require("node:assert/strict");
const test = require("node:test");

const contract = require("../../api/lib/triage-demo-contract");
const { RedisSessionAdapter } = require("../../api/lib/session-store");

function startBody(idempotencyKey = "idem-redis-start") {
  return {
    request_id: `req-${idempotencyKey}`,
    idempotency_key: idempotencyKey,
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
      },
      spo2: {
        value: 97,
        unit: "%",
        measurement_status: "measured",
        quality_flag: "ok",
        missing_reason: null
      },
      blood_pressure: {
        value: "128/82",
        unit: "mmHg",
        measurement_status: "measured",
        quality_flag: "ok",
        missing_reason: null
      }
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

function answerBody(question, selectedOptionIds, idempotencyKey) {
  return {
    request_id: `req-${idempotencyKey}`,
    idempotency_key: idempotencyKey,
    question_id: question.id,
    answer: {
      selected_option_ids: selectedOptionIds,
      scale_value: null
    }
  };
}

function safeDefaultSelection(question) {
  if (question.none_option_id) return [question.none_option_id];
  return [question.options[0].id];
}

test("REDIS-SESSION-001 async session API can continue after memory reset when Redis is configured", {
  skip: process.env.DEMO_REDIS_URL ? false : "Set DEMO_REDIS_URL to run Redis session-store integration coverage."
}, async () => {
  const previousPrefix = process.env.DEMO_REDIS_KEY_PREFIX;
  const keyPrefix = `ai-triage-demo:test:${process.pid}:`;
  process.env.DEMO_REDIS_KEY_PREFIX = keyPrefix;

  const adapter = new RedisSessionAdapter({
    url: process.env.DEMO_REDIS_URL,
    keyPrefix
  });

  try {
    contract.resetMockState();
    const start = await contract.createSessionAsync(startBody("idem-redis-start"));
    const sessionKey = start.body.session_key;

    let body = start.body;
    for (let index = 0; index < contract.questionSequence.length; index += 1) {
      const result = await contract.submitAnswerAsync(
        sessionKey,
        answerBody(body.question, safeDefaultSelection(body.question), `idem-redis-answer-${index}`)
      );
      body = result.body;
    }

    assert.equal(body.status, "summary");

    contract.resetMockState();
    const summary = await contract.getSummaryAsync(sessionKey, { request_id: "req-redis-summary-after-reset" });

    assert.equal(summary.statusCode, 200);
    assert.equal(summary.body.status, "summary");
    assert.equal(summary.body.staff_review_summary.objective.join(" ").includes("HR 130 bpm"), true);

    await adapter.deleteSession(sessionKey);
  } finally {
    if (previousPrefix === undefined) delete process.env.DEMO_REDIS_KEY_PREFIX;
    else process.env.DEMO_REDIS_KEY_PREFIX = previousPrefix;
  }
});
