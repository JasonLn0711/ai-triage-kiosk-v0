const assert = require("node:assert/strict");
const test = require("node:test");

const engine = require("../../core/triage_engine");

test("chest case ranks breathing or chest follow-up early", () => {
  const state = engine.createInitialState("chest-pain-high-bp-low-spo2");
  const ranked = engine.rankQuestions(state).slice(0, 4).map((item) => item.question.id);
  assert.ok(ranked.includes("breathing"));
  assert.ok(ranked.includes("chest-details"));
});

test("fever urinary case ranks fever and urinary context", () => {
  const state = engine.createInitialState("fever-urinary");
  const ranked = engine.rankQuestions(state).slice(0, 5).map((item) => item.question.id);
  assert.ok(ranked.includes("fever-details"));
  assert.ok(ranked.includes("urinary-details"));
});

test("staff summary preserves demo-only safety boundary", () => {
  let state = engine.createInitialState("chest-pain-high-bp-low-spo2");
  state = engine.recordAnswer(state, "breathing", "Yes");
  const summary = engine.buildStaffSummary(state);
  assert.equal(summary.requiresStaffReview, true);
  assert.match(summary.boundary, /not diagnosis/);
  assert.match(summary.forbiddenOutput, /No final acuity assignment/);
});

test("pre-vital intake excludes post-vital follow-up until measurement completes", () => {
  let state = engine.createInitialState("chest-pain-high-bp-low-spo2", {
    measurementState: engine.MEASUREMENT_STATES.IN_PROGRESS
  });
  let ranked = engine.rankQuestions(state);
  assert.ok(ranked.length > 0);
  assert.ok(ranked.every((item) => item.question.phase === engine.QUESTION_PHASES.PRE_VITAL_INTAKE));

  state = engine.markVitalsReady(state);
  ranked = engine.rankQuestions(state);
  assert.ok(ranked.some((item) => item.question.phase === engine.QUESTION_PHASES.POST_VITAL_FOLLOWUP));
});
