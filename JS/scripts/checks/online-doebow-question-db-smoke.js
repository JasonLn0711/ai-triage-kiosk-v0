const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../../..");
const DEFAULT_BASE_URL = "https://nycu-imedtac-triage-demo-api.onrender.com";
const BASE_URL = normalizeBaseUrl(process.env.DEMO_API_BASE_URL || DEFAULT_BASE_URL);
const TEST_ORIGIN = process.env.DEMO_TEST_ORIGIN || "http://localhost:5174";
const UNKNOWN_ORIGIN = process.env.DEMO_UNKNOWN_ORIGIN || "https://unexpected-origin.example";
const TOKEN = process.env.DEMO_BEARER_TOKEN || "";
const REQUIRE_AUTHENTICATED =
  process.env.REQUIRE_AUTHENTICATED_ONLINE_SMOKE === "1" ||
  process.env.REQUIRE_DOEBOW_ONLINE_SMOKE === "1";

const EXPECTED_DOEBOW_ROUTE = [
  {
    id: "INIT-1",
    phase: "initial",
    sourceRef: "Case_Question_design.md",
    answerLabel: "Female",
  },
  {
    id: "INIT-2",
    phase: "initial",
    sourceRef: "Case_Question_design.md",
    answerLabel: "40-64",
    requiredLabels: ["Under 18", "18-39", "40-64", "65-79", "80 or older", "Not sure"],
  },
  {
    id: "INIT-3",
    phase: "initial",
    sourceRef: "Case_Question_design.md",
    answerLabel: "Chest / breathing / heartbeat",
  },
  {
    id: "INIT-4",
    phase: "initial",
    sourceRef: "Case_Question_design.md",
    answerLabel: "Today",
    requiredLabels: ["Today", "1-3 days", "4-7 days", "More than 1 week", "Long-term issue", "Not sure"],
  },
  {
    id: "PAL-1",
    phase: "symptom_specific",
    sourceRef: "Heart/palpitation.md",
    answerLabel: "Not sure",
  },
  {
    id: "PAL-2",
    phase: "symptom_specific",
    sourceRef: "Heart/palpitation.md",
    answerLabel: "Not sure",
  },
  {
    id: "PAL-6",
    phase: "symptom_specific",
    sourceRef: "Heart/palpitation.md",
    answerLabel: "None",
  },
  {
    id: "UNIV-1",
    phase: "universal",
    sourceRef: "Case_Question_design.md",
    answerLabel: "None",
  },
  {
    id: "UNIV-3",
    phase: "universal",
    sourceRef: "Case_Question_design.md",
    answerLabel: "No",
  },
  {
    id: "UNIV-4",
    phase: "universal",
    sourceRef: "Case_Question_design.md",
    answerLabel: "No known medicine allergy",
  },
];

function normalizeBaseUrl(value) {
  const withoutSlash = value.replace(/\/+$/, "");
  return withoutSlash.endsWith("/api/triage-demo")
    ? withoutSlash.slice(0, -"/api/triage-demo".length)
    : withoutSlash;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function apiPath(pathname) {
  return `/api/triage-demo${pathname}`;
}

async function request(pathOrUrl, options = {}) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { response, body, text };
}

async function assertCorsPreflight(pathname, origin, expectedEcho) {
  const { response } = await request(pathname, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type,authorization",
    },
  });

  assert(response.status === 204, `${pathname} preflight should return 204 for ${origin}`);
  assert(
    response.headers.get("access-control-allow-methods")?.includes("POST"),
    `${pathname} preflight should allow POST`,
  );
  assert(
    response.headers.get("access-control-allow-headers")?.includes("Authorization"),
    `${pathname} preflight should allow Authorization header`,
  );

  const echoedOrigin = response.headers.get("access-control-allow-origin");
  if (expectedEcho) {
    assert(echoedOrigin === origin, `${pathname} should echo allowed Origin ${origin}`);
  } else {
    assert(!echoedOrigin, `${pathname} should not echo unknown Origin ${origin}`);
  }
}

function headersWithOptionalAuth(extra = {}) {
  const headers = {
    "Content-Type": "application/json",
    Origin: TEST_ORIGIN,
    ...extra,
  };
  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }
  return headers;
}

function freshNormalVitalStartBody(label) {
  const body = readJson("handoff/api-examples/2026-05-21-start-session-request-demo-tachycardia.json");
  const suffix = uniqueSuffix();
  body.request_id = `req-online-doebow-${label}-${suffix}`;
  body.idempotency_key = `idem-online-doebow-${label}-${suffix}`;
  body.patient_context = {
    demo_patient_id: `DEMO-DOEBOW-${suffix}`,
    identity_mode: "demo",
  };
  body.vitals.temperature_c.value = 36.6;
  body.vitals.temperature_c.quality_flag = "ok";
  body.vitals.spo2_percent.value = 98;
  body.vitals.spo2_percent.quality_flag = "ok";
  body.vitals.heart_rate_bpm.value = 78;
  body.vitals.heart_rate_bpm.quality_flag = "ok";
  body.vitals.respiratory_rate_per_min.value = 16;
  body.vitals.respiratory_rate_per_min.quality_flag = "ok";
  body.vitals.blood_pressure_systolic_mm_hg.value = 118;
  body.vitals.blood_pressure_systolic_mm_hg.quality_flag = "ok";
  body.vitals.blood_pressure_diastolic_mm_hg.value = 76;
  body.vitals.blood_pressure_diastolic_mm_hg.quality_flag = "ok";
  body.capabilities.max_questions = 99;
  return body;
}

function findOptionIdByLabel(question, label) {
  const option = question.options.find((candidate) => candidate.label === label);
  assert(option, `${question.id} should contain option label ${label}`);
  return option.id;
}

function answerBody(question, sessionKey, answerLabel, counter) {
  const suffix = uniqueSuffix();
  return {
    api_version: "2026-05-22-demo-v0.2-draft",
    schema_version: "imvs-nycu-triage-demo-schema-v0.2-draft",
    flow_version: "tachycardia-live-demo-flow-v0.2-draft",
    case_id: "demo-tachycardia-live-001",
    request_id: `req-online-doebow-answer-${counter}-${suffix}`,
    idempotency_key: `idem-online-doebow-answer-${counter}-${suffix}`,
    session_key: sessionKey,
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    question_phase: "post_measurement_intake",
    question_id: question.id,
    answer: {
      selected_option_ids: [findOptionIdByLabel(question, answerLabel)],
      scale_value: null,
    },
    client_event: {
      answered_at: new Date().toISOString(),
      input_mode: "touch",
    },
  };
}

function assertQuestionEnvelope(body) {
  assert(body.status === "question", "response status should be question");
  assert(body.session_key, "question response should include session_key");
  assert(body.session_state === "active", "question response should keep session_state active");
  assert(body.workflow_mode === "post_measurement_only", "workflow_mode should stay post_measurement_only");
  assert(body.measurement_state === "complete", "measurement_state should stay complete");
  assert(body.vitals_ready === true, "vitals_ready should be true");
  assert(body.progress?.current >= 1, "progress.current should be present");
  assert(body.progress?.expected_total >= body.progress.current, "progress.expected_total should be present");
  assert(body.question?.id, "question.id should be present");
  assert(["single_choice", "multi_choice"].includes(body.question.type), "question.type should stay MVP-compatible");
  assert(body.question.ui_template === body.question.type, "ui_template should match MVP question type");
  assert(Array.isArray(body.question.options), "question.options should be an array");
  assert(body.question.options.length >= 1, "question.options should not be empty");
  assert(body.question.options.length <= 9, "question.options should stay within no-scroll option limit");
  assert(
    body.question.option_count === body.question.options.length,
    "question.option_count should match options length",
  );
  assert(
    body.question.rendering_constraints?.max_visible_options_without_scroll === 9,
    "question should preserve imedtac no-scroll option limit",
  );
}

function assertExpectedQuestion(body, expected) {
  assertQuestionEnvelope(body);
  assert(body.question.id === expected.id, `expected ${expected.id}, received ${body.question.id}`);
  assert(body.question_phase === expected.phase, `${expected.id} should use phase ${expected.phase}`);
  assert(
    Array.isArray(body.question.source_refs) && body.question.source_refs.includes(expected.sourceRef),
    `${expected.id} should include source ref ${expected.sourceRef}`,
  );
  assert(
    body.question.options.some((option) => option.label === expected.answerLabel),
    `${expected.id} should contain answer label ${expected.answerLabel}`,
  );
  for (const label of expected.requiredLabels || []) {
    assert(
      body.question.options.some((option) => option.label === label),
      `${expected.id} should contain bucket label ${label}`,
    );
  }
}

function assertSummaryEnvelope(body, observedQuestionIds) {
  assert(body.status === "summary", "terminal response should be summary");
  assert(body.session_state === "summary_ready", "summary response should set session_state summary_ready");
  assert(body.summary_visibility === "staff_only", "summary_visibility should stay staff_only");
  assert(body.staff_review_summary, "summary response should include staff_review_summary");
  assert(Array.isArray(body.staff_review_summary.scope_controls), "summary should include scope_controls");
  const summaryAnswers = body.staff_review_summary.patient_record?.answers || [];
  const answeredIds = new Set(summaryAnswers.map((answer) => answer.question_id));
  for (const questionId of observedQuestionIds) {
    assert(answeredIds.has(questionId), `summary patient_record should include answer ${questionId}`);
  }
  const serialized = JSON.stringify(body.staff_review_summary).toLowerCase();
  for (const phrase of ["diagnosis", "treatment", "esi level", "510(k)-ready"]) {
    assert(!serialized.includes(phrase), `summary should not include forbidden claim phrase: ${phrase}`);
  }
}

async function postJson(pathname, body, headers = headersWithOptionalAuth()) {
  return request(pathname, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function runAuthenticatedDoebowRoute(startBody, startResult) {
  const observedQuestionIds = [];
  let current = startResult.body;

  for (let index = 0; index < EXPECTED_DOEBOW_ROUTE.length; index += 1) {
    const expected = EXPECTED_DOEBOW_ROUTE[index];
    assertExpectedQuestion(current, expected);
    observedQuestionIds.push(current.question.id);

    const answer = answerBody(current.question, current.session_key, expected.answerLabel, index + 1);
    const next = await postJson(apiPath(`/sessions/${current.session_key}/answers`), answer);
    assert(next.response.status === 200, `${expected.id} answer should return 200`);

    if (index === EXPECTED_DOEBOW_ROUTE.length - 1) {
      assertSummaryEnvelope(next.body, observedQuestionIds);
      console.log(`Completed doebow online route: ${observedQuestionIds.join(" -> ")} -> summary`);
      console.log(`Start request id: ${startBody.request_id}`);
      console.log("Online doebow Question_DB authenticated smoke checks passed.");
      return;
    }

    assert(next.body.status === "question", `${expected.id} answer should return the next question`);
    current = next.body;
  }
}

async function main() {
  console.log(`Online doebow Question_DB smoke target: ${BASE_URL}`);
  console.log(`CORS test origin: ${TEST_ORIGIN}`);
  console.log(`Bearer token provided: ${TOKEN ? "yes" : "no"}`);

  const health = await request("/healthz");
  assert(health.response.status === 200, "/healthz should return 200");
  assert(health.body?.status === "ok", "/healthz body should report status ok");

  await assertCorsPreflight(apiPath("/sessions"), TEST_ORIGIN, true);
  await assertCorsPreflight(apiPath("/sessions/__doebow_probe__/answers"), TEST_ORIGIN, true);
  await assertCorsPreflight(apiPath("/sessions"), UNKNOWN_ORIGIN, false);

  const unauthenticated = await postJson(
    apiPath("/sessions"),
    freshNormalVitalStartBody("no-token"),
    { "Content-Type": "application/json", Origin: TEST_ORIGIN },
  );

  if (unauthenticated.response.status === 200 && !TOKEN) {
    await runAuthenticatedDoebowRoute(unauthenticated.body, unauthenticated);
    return;
  }

  assert(
    unauthenticated.response.status === 401,
    "token-enabled rehearsal should reject no-token doebow start-session POST",
  );
  assert(
    unauthenticated.body?.error?.code === "demo_bearer_token_required",
    "no-token doebow POST should return demo_bearer_token_required",
  );

  if (!TOKEN) {
    const message =
      "Skipped authenticated doebow Question_DB route because DEMO_BEARER_TOKEN is not set.";
    if (REQUIRE_AUTHENTICATED) {
      throw new Error(message);
    }
    console.log(message);
    console.log("Online doebow public reachability and bearer-gate checks passed.");
    return;
  }

  const startBody = freshNormalVitalStartBody("authorized");
  const start = await postJson(apiPath("/sessions"), startBody);
  assert(start.response.status === 200, "authorized doebow start-session should return 200");
  await runAuthenticatedDoebowRoute(startBody, start);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
