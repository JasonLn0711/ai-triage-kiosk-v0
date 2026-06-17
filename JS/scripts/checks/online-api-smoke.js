const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../../..");
const DEFAULT_BASE_URL = "https://nycu-imedtac-triage-demo-api.onrender.com";
const BASE_URL = normalizeBaseUrl(process.env.DEMO_API_BASE_URL || DEFAULT_BASE_URL);
const API_BASE_URL = `${BASE_URL}/api/triage-demo`;
const TEST_ORIGIN = process.env.DEMO_TEST_ORIGIN || "http://localhost:5174";
const UNKNOWN_ORIGIN = process.env.DEMO_UNKNOWN_ORIGIN || "https://unexpected-origin.example";
const TOKEN = process.env.DEMO_BEARER_TOKEN || "";

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

function authorizedHeaders(extra = {}) {
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

function freshStartBody() {
  const body = readJson("handoff/api-examples/2026-05-21-start-session-request-demo-tachycardia.json");
  const suffix = uniqueSuffix();
  body.request_id = `req-online-smoke-start-${suffix}`;
  body.idempotency_key = `idem-online-smoke-start-${suffix}`;
  return body;
}

function answerBody(question, sessionKey, counter) {
  const suffix = uniqueSuffix();
  return {
    api_version: "2026-05-22-demo-v0.2-draft",
    schema_version: "imvs-nycu-triage-demo-schema-v0.2-draft",
    flow_version: "tachycardia-live-demo-flow-v0.2-draft",
    case_id: "demo-tachycardia-live-001",
    request_id: `req-online-smoke-answer-${counter}-${suffix}`,
    idempotency_key: `idem-online-smoke-answer-${counter}-${suffix}`,
    session_key: sessionKey,
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    question_phase: "post_measurement_intake",
    question_id: question.id,
    answer: {
      selected_option_ids: [question.options[0].id],
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
  assert(body.workflow_mode === "post_measurement_only", "workflow_mode should stay post_measurement_only");
  assert(body.measurement_state === "complete", "measurement_state should stay complete");
  assert(body.vitals_ready === true, "vitals_ready should be true");
  assert(body.progress?.current >= 1, "progress.current should be present");
  assert(body.progress?.expected_total >= body.progress.current, "progress.expected_total should be present");
  assert(body.question?.id, "question.id should be present");
  assert(["single_choice", "multi_choice"].includes(body.question.type), "question.type should stay MVP-compatible");
  assert(Array.isArray(body.question.options), "question.options should be an array");
  assert(body.question.options.length >= 1, "question.options should not be empty");
  assert(body.question.options.length <= 9, "question.options should stay within no-scroll option limit");
}

function assertSummaryEnvelope(body) {
  assert(body.status === "summary", "terminal response should be summary");
  assert(body.session_state === "summary_ready", "summary response should set session_state summary_ready");
  assert(body.summary_visibility === "staff_only", "summary_visibility should stay staff_only");
  assert(body.staff_review_summary, "summary response should include staff_review_summary");
  assert(Array.isArray(body.staff_review_summary.scope_controls), "summary should include scope_controls");
  const serialized = JSON.stringify(body.staff_review_summary).toLowerCase();
  for (const phrase of ["diagnosis", "treatment", "esi level", "510(k)-ready"]) {
    assert(!serialized.includes(phrase), `summary should not include forbidden claim phrase: ${phrase}`);
  }
}

async function postJson(pathname, body, headers = authorizedHeaders()) {
  return request(pathname, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function main() {
  console.log(`Online API smoke target: ${BASE_URL}`);
  console.log(`CORS test origin: ${TEST_ORIGIN}`);
  console.log(`Bearer token provided: ${TOKEN ? "yes" : "no"}`);

  const health = await request("/healthz");
  assert(health.response.status === 200, "/healthz should return 200");
  assert(health.body?.status === "ok", "/healthz body should report status ok");

  await assertCorsPreflight("/api/triage-demo/sessions", TEST_ORIGIN, true);
  await assertCorsPreflight("/api/triage-demo/sessions/__cors_probe__/answers", TEST_ORIGIN, true);
  await assertCorsPreflight("/api/triage-demo/sessions", UNKNOWN_ORIGIN, false);

  const unauthenticated = await postJson(
    "/api/triage-demo/sessions",
    freshStartBody(),
    { "Content-Type": "application/json", Origin: TEST_ORIGIN },
  );
  if (TOKEN) {
    assert(unauthenticated.response.status === 401, "token-enabled rehearsal should reject no-token POST");
    assert(
      unauthenticated.body?.error?.code === "demo_bearer_token_required",
      "no-token POST should return demo_bearer_token_required",
    );
  }

  if (!TOKEN) {
    console.log("Skipped authenticated start-session and answer-loop checks because DEMO_BEARER_TOKEN is not set.");
    console.log("Online public smoke checks passed.");
    return;
  }

  const startBody = freshStartBody();
  const start = await postJson("/api/triage-demo/sessions", startBody);
  assert(start.response.status === 200, "authorized start-session should return 200");
  assertQuestionEnvelope(start.body);
  assert(start.body.question.id === "tachy-chief-concern", "tachycardia fixture should start with tachy-chief-concern");

  const startRetry = await postJson("/api/triage-demo/sessions", startBody);
  assert(startRetry.response.status === 200, "same start idempotency retry should return 200");
  assert(startRetry.body.session_key === start.body.session_key, "same start idempotency retry should return same session_key");

  const conflictBody = { ...startBody, request_id: `req-online-smoke-conflict-${uniqueSuffix()}` };
  conflictBody.patient_context = { ...conflictBody.patient_context, age: 77 };
  const conflict = await postJson("/api/triage-demo/sessions", conflictBody);
  assert(conflict.response.status === 409, "same idempotency key with changed body should return 409");
  assert(conflict.body?.error?.code === "idempotency_conflict", "changed body retry should return idempotency_conflict");

  let current = start.body;
  for (let counter = 1; counter <= 12; counter += 1) {
    const answer = answerBody(current.question, current.session_key, counter);
    const next = await postJson(`${API_BASE_URL.replace(BASE_URL, "")}/sessions/${current.session_key}/answers`, answer);
    assert(next.response.status === 200, `answer ${counter} should return 200`);
    if (next.body.status === "question") {
      assertQuestionEnvelope(next.body);
      current = next.body;
      continue;
    }
    assertSummaryEnvelope(next.body);
    console.log(`Completed authenticated answer loop in ${counter} answer request(s).`);
    console.log("Online authenticated smoke checks passed.");
    return;
  }

  throw new Error("answer loop did not reach summary within 12 answer requests");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
