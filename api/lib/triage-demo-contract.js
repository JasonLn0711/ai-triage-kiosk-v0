const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const DEMO_BOUNDARY = "Synthetic-data staff-review intake support with human-review workflow and separate production validation path.";
const ALLOWED_ORIGINS = new Set(["http://localhost", "http://localhost:5174"]);
const SESSION_TTL_MS = 30 * 60 * 1000;

const sessions = new Map();
const idempotencyRecords = new Map();
let responseCounter = 0;
let sessionCounter = 0;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

const fixture = readJson("demo/fixtures/tachycardia-live-demo.json");
const startQuestionExample = readJson("handoff/api-examples/2026-05-21-start-session-response-question.json");
const nextQuestionExample = readJson("handoff/api-examples/2026-05-21-next-question-response-demo-tachycardia.json");
const postVitalQuestionExample = readJson("handoff/api-examples/2026-05-21-post-vital-question-response-demo-tachycardia.json");
const summaryExample = readJson("handoff/api-examples/2026-05-21-summary-response-demo-tachycardia.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeQuestion(config) {
  return {
    registry_refs: config.registry_refs,
    source_refs: config.source_refs,
    evidence_status: config.evidence_status,
    review_owner: "clinical_reviewer_tbd",
    type: config.type,
    ui_template: config.type,
    text: config.text,
    options: config.options,
    option_count: config.options.length,
    none_option_id: config.none_option_id || null,
    required: config.required !== false,
    allow_not_sure: config.allow_not_sure !== false,
    allow_skip: config.allow_skip === true,
    max_selections: config.max_selections,
    trigger_reason_codes: config.trigger_reason_codes,
    summary_effect: config.summary_effect,
    rendering_constraints: {
      requires_no_scroll: true,
      max_visible_options_without_scroll: 9
    },
    evidence_refs: config.evidence_refs || ["DUOBAO-AFRVR-TACHY-QA-20260525", "LOCAL-PROTOCOL-TBD"],
    demo_boundary: config.demo_boundary || "Synthetic-data demo question for staff-review intake support.",
    id: config.id
  };
}

const questionSequence = [
  clone(startQuestionExample.question),
  clone(nextQuestionExample.question),
  makeQuestion({
    id: "tachy-current-feeling",
    registry_refs: ["TACHY-003"],
    source_refs: ["AHA-TACHYCARDIA-FAST-HR", "AHA-HEART-ATTACK", "DUOBAO-DEMO-DESIGN-20260520", "DUOBAO-AFRVR-TACHY-QA-20260525"],
    evidence_status: "source-backed",
    type: "multi_choice",
    text: "Which descriptions fit what you feel now?",
    options: [
      { id: "heart_racing", label: "Heart racing or pounding" },
      { id: "chest_heavy", label: "Chest tightness or heaviness" },
      { id: "chest_pressure_pain", label: "Chest pressure or pain" },
      { id: "burning_sharp_or_not_sure", label: "Burning, sharp discomfort, or not sure" }
    ],
    max_selections: 4,
    trigger_reason_codes: ["reported_palpitations", "reported_chest_tightness"],
    summary_effect: "Adds current palpitation and chest-tightness descriptors to the staff-review summary."
  }),
  makeQuestion({
    id: "tachy-associated-symptoms",
    registry_refs: ["TACHY-004"],
    source_refs: ["AHA-TACHYCARDIA-FAST-HR", "AHA-HEART-ATTACK", "MEDLINEPLUS-AFIB", "DUOBAO-AFRVR-TACHY-QA-20260525"],
    evidence_status: "source-backed",
    type: "multi_choice",
    text: "Are any of these happening with it?",
    options: [
      { id: "short_breath", label: "Shortness of breath" },
      { id: "sweating_nausea_fatigue", label: "Sweating, nausea, or unusual fatigue" },
      { id: "dizzy_faint", label: "Dizziness, lightheadedness, or fainting" },
      { id: "none_of_these", label: "None of these" }
    ],
    none_option_id: "none_of_these",
    max_selections: 4,
    trigger_reason_codes: ["associated_warning_symptom_screen"],
    summary_effect: "Adds associated warning-symptom positives or negatives to the staff-review summary."
  }),
  clone(postVitalQuestionExample.question),
  makeQuestion({
    id: "tachy-heart-history-meds",
    registry_refs: ["TACHY-006"],
    source_refs: ["MEDLINEPLUS-AFIB", "ENA-ESI-V5", "DUOBAO-AFRVR-TACHY-QA-20260525", "LOCAL-PROTOCOL-TBD"],
    evidence_status: "source-family",
    type: "multi_choice",
    text: "Have you been told you have a heart rhythm problem, or do you take heart / blood-pressure medicine?",
    options: [
      { id: "known_rhythm_problem", label: "Known rhythm problem" },
      { id: "heart_bp_medicine", label: "Heart or blood-pressure medicine" },
      { id: "no_known", label: "No known history / medicine" },
      { id: "staff_confirm", label: "Not sure, staff should confirm" }
    ],
    max_selections: 4,
    trigger_reason_codes: ["history_medication_context"],
    summary_effect: "Adds rhythm-history and heart/blood-pressure medication context for staff confirmation."
  }),
  makeQuestion({
    id: "tachy-medication-allergy-confirm",
    registry_refs: ["TACHY-007"],
    source_refs: ["LOCAL-PROTOCOL-TBD", "DUOBAO-DEMO-DESIGN-20260520", "DUOBAO-AFRVR-TACHY-QA-20260525"],
    evidence_status: "clinical-review-needed",
    type: "multi_choice",
    text: "Do you have medication allergies or medicines staff should confirm?",
    options: [
      { id: "med_allergy", label: "Medication allergy" },
      { id: "regular_medicines", label: "Regular medicines" },
      { id: "none_known", label: "No known medication allergy" },
      { id: "not_sure", label: "Not sure" }
    ],
    max_selections: 4,
    trigger_reason_codes: ["medication_allergy_context"],
    summary_effect: "Adds medication and allergy uncertainty to the staff-review summary."
  })
];

const expectedTotal = questionSequence.length;
const contractFields = {
  api_version: startQuestionExample.api_version,
  schema_version: startQuestionExample.schema_version,
  flow_version: fixture.flow_version,
  case_id: fixture.case_id,
  case_version: fixture.case_version,
  fixture_version: fixture.fixture_version,
  question_set_version: fixture.question_set_version,
  wording_version: startQuestionExample.wording_version
};

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function idempotencyComparableBody(body) {
  const comparable = clone(body || {});
  delete comparable.request_id;
  return comparable;
}

function hashBody(body) {
  return crypto.createHash("sha256").update(stableStringify(idempotencyComparableBody(body))).digest("hex");
}

function configuredDemoBearerToken() {
  const token = process.env.DEMO_BEARER_TOKEN;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

function headerValue(req, name) {
  const headers = (req && req.headers) || {};
  if (typeof headers.get === "function") return headers.get(name);

  const value = headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];
  return Array.isArray(value) ? value[0] : value;
}

function bearerTokenFromHeader(value) {
  if (!value) return null;
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function safeTokenEquals(receivedToken, expectedToken) {
  const received = Buffer.from(String(receivedToken || ""), "utf8");
  const expected = Buffer.from(String(expectedToken || ""), "utf8");
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(received, expected);
}

function demoBearerAuthChallenge() {
  return 'Bearer realm="nycu-imedtac-triage-demo"';
}

function requireDemoBearerAuth(req) {
  const expectedToken = configuredDemoBearerToken();
  if (!expectedToken) return null;

  const receivedToken = bearerTokenFromHeader(headerValue(req, "authorization"));
  if (receivedToken && safeTokenEquals(receivedToken, expectedToken)) return null;

  return errorResult(401, {}, "demo_bearer_token_required", "A valid demo bearer token is required for this rehearsal API.", {
    retryable: false,
    details: {
      required_header: "Authorization: Bearer <demo token>",
      token_storage: "Set DEMO_BEARER_TOKEN in the deployment environment; do not store tokens in repo files."
    }
  });
}

function nextResponseId(kind) {
  responseCounter += 1;
  return `resp-demo-tachy-${kind}-${String(responseCounter).padStart(3, "0")}`;
}

function nextSessionKey() {
  sessionCounter += 1;
  return `demo-session-tachy-${String(sessionCounter).padStart(3, "0")}`;
}

function expiryFrom(now = new Date()) {
  return new Date(now.getTime() + SESSION_TTL_MS).toISOString();
}

function baseResponse(body, session, kind) {
  return {
    ...contractFields,
    request_id: body.request_id || null,
    response_id: nextResponseId(kind),
    session_key: session.session_key,
    session_expires_at: session.session_expires_at,
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    demo_boundary: DEMO_BOUNDARY
  };
}

function buildQuestionResponse(body, session, questionIndex, lastQuestionId, phaseReason) {
  const question = clone(questionSequence[questionIndex]);
  return {
    ...baseResponse(body, session, `question-${questionIndex + 1}`),
    session_state: "active",
    last_question_id: lastQuestionId,
    status: "question",
    question_phase: "post_measurement_intake",
    phase_reason: phaseReason,
    progress: {
      current: questionIndex + 1,
      expected_total: expectedTotal
    },
    question
  };
}

function buildSummaryResponse(body, session, lastQuestionId) {
  const response = clone(summaryExample);
  return {
    ...response,
    ...baseResponse(body, session, "summary"),
    session_state: "summary_ready",
    last_question_id: lastQuestionId,
    status: "summary",
    question_phase: "summary",
    progress: {
      current: expectedTotal,
      expected_total: expectedTotal
    }
  };
}

function errorResult(statusCode, body, code, message, options = {}) {
  const session = {
    session_key: options.session_key || null,
    session_expires_at: options.session_expires_at || null
  };
  return {
    statusCode,
    body: {
      ...contractFields,
      request_id: body && body.request_id ? body.request_id : null,
      response_id: nextResponseId("error"),
      session_key: session.session_key,
      session_expires_at: session.session_expires_at,
      status: "error",
      session_state: options.session_state || "error",
      error: {
        code,
        message,
        retryable: Boolean(options.retryable),
        details: options.details || null
      },
      recovery: options.recovery || null,
      demo_boundary: DEMO_BOUNDARY
    }
  };
}

function idempotencyConflictRecovery() {
  return {
    safe_next_action: "restart_demo_session",
    owner: "imvs_ui_operator",
    ui_locking_required: true,
    instructions: [
      "Do not reuse this idempotency_key for a different answer.",
      "Do not auto-submit the changed answer with a new idempotency_key.",
      "Keep answer controls locked until the operator starts a new demo session or switches to labeled fallback.",
      "Start a new demo session through POST /api/triage-demo/sessions."
    ]
  };
}

function withIdempotency(scope, body, compute, options = {}) {
  const idempotencyKey = body && body.idempotency_key;
  if (!idempotencyKey) return compute();

  const recordKey = `${scope}:${idempotencyKey}`;
  const bodyHash = hashBody(body);
  const existing = idempotencyRecords.get(recordKey);
  if (existing && existing.bodyHash !== bodyHash) {
    return errorResult(409, body, "idempotency_conflict", "The same idempotency_key was reused with a different request body.", {
      retryable: false,
      session_key: options.session_key || null,
      session_expires_at: options.session_expires_at || null,
      session_state: options.session_state || "error",
      details: {
        idempotency_key: idempotencyKey,
        expected_body_hash: existing.bodyHash,
        received_body_hash: bodyHash
      },
      recovery: idempotencyConflictRecovery()
    });
  }
  if (existing) return clone(existing.result);

  const result = compute();
  idempotencyRecords.set(recordKey, { bodyHash, result: clone(result) });
  return result;
}

function validateCase(body) {
  if (body.case_id && body.case_id !== fixture.case_id) {
    return `unsupported case_id ${body.case_id}`;
  }
  if (body.measurement_state && body.measurement_state !== "complete") {
    return "measurement_state must be complete for the current post-measurement demo contract";
  }
  if (body.vitals_ready === false) {
    return "vitals_ready must be true for the current post-measurement demo contract";
  }
  return null;
}

function createSession(body = {}) {
  const caseError = validateCase(body);
  if (caseError) return errorResult(422, body, "invalid_start_session_request", caseError, { retryable: false });

  return withIdempotency("sessions", body, () => {
    const session = {
      session_key: nextSessionKey(),
      session_expires_at: expiryFrom(),
      state: "active",
      answers: [],
      start_request: clone(body),
      vitals: clone(body.vitals || fixture.vitals),
      patient_context: clone(body.patient_context || fixture.profile),
      demo_script: clone(body.demo_script || fixture.live_demo_controls)
    };
    sessions.set(session.session_key, session);

    const response = buildQuestionResponse(
      body,
      session,
      0,
      null,
      "Measurement is complete and the demo heart-rate cue is available, so the tachycardia live intake question set can start."
    );
    return { statusCode: 200, body: response };
  });
}

function selectedOptionIds(body) {
  return body && body.answer && Array.isArray(body.answer.selected_option_ids)
    ? body.answer.selected_option_ids
    : [];
}

function validateAnswer(question, body) {
  if (!body.question_id) return "question_id is required";
  if (body.question_id !== question.id) {
    return `expected question_id ${question.id}, received ${body.question_id}`;
  }
  const selectedIds = selectedOptionIds(body);
  if (selectedIds.length === 0) return "answer.selected_option_ids must contain at least one option id";
  if (selectedIds.length > question.max_selections) {
    return `selected_option_ids exceeds max_selections ${question.max_selections}`;
  }
  const allowedOptionIds = new Set(question.options.map((option) => option.id));
  const invalidIds = selectedIds.filter((optionId) => !allowedOptionIds.has(optionId));
  if (invalidIds.length) return `unknown option id(s): ${invalidIds.join(", ")}`;
  return null;
}

function submitAnswer(sessionKey, body = {}) {
  const session = sessions.get(sessionKey);
  if (!session) {
    return errorResult(404, body, "invalid_session", "The session_key was not found or is no longer available.", {
      retryable: false,
      session_key: sessionKey
    });
  }
  return withIdempotency(`answers:${session.session_key}`, body, () => {
    if (session.state === "summary_ready") {
      return errorResult(409, body, "session_summary_ready", "The session has already reached summary status; start a new session for another answer path.", {
        retryable: false,
        session_key: session.session_key,
        session_expires_at: session.session_expires_at
      });
    }

    const question = questionSequence[session.answers.length];
    if (!question) {
      session.state = "summary_ready";
      return errorResult(409, body, "session_summary_ready", "The session has no remaining questions.", {
        retryable: false,
        session_key: session.session_key,
        session_expires_at: session.session_expires_at
      });
    }

    const answerError = validateAnswer(question, body);
    if (answerError) {
      return errorResult(422, body, "invalid_answer", answerError, {
        retryable: false,
        session_key: session.session_key,
        session_expires_at: session.session_expires_at
      });
    }

    session.answers.push({
      question_id: question.id,
      answer: clone(body.answer),
      request_id: body.request_id || null,
      idempotency_key: body.idempotency_key || null
    });

    const nextIndex = session.answers.length;
    if (nextIndex >= expectedTotal) {
      session.state = "summary_ready";
      return { statusCode: 200, body: buildSummaryResponse(body, session, question.id) };
    }

    return {
      statusCode: 200,
      body: buildQuestionResponse(
        body,
        session,
        nextIndex,
        question.id,
        `${question.id} was recorded; the next governed tachycardia demo question is ready.`
      )
    };
  }, {
    session_key: session.session_key,
    session_expires_at: session.session_expires_at,
    session_state: session.state
  });
}

function setCorsHeaders(req, res) {
  const origin = req.headers && req.headers.origin;
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "600");
}

function sendResult(res, result) {
  res.statusCode = result.statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(result.body));
}

function resetMockState() {
  sessions.clear();
  idempotencyRecords.clear();
  responseCounter = 0;
  sessionCounter = 0;
}

module.exports = {
  ALLOWED_ORIGINS,
  DEMO_BOUNDARY,
  contractFields,
  demoBearerAuthChallenge,
  expectedTotal,
  fixture,
  questionSequence,
  createSession,
  requireDemoBearerAuth,
  submitAnswer,
  errorResult,
  setCorsHeaders,
  sendResult,
  resetMockState
};
