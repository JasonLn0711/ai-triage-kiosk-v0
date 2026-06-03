const state = {
  sessionKey: null,
  currentQuestion: null,
  selectedOptionIds: []
};

const elements = {
  baseUrlInput: document.querySelector("#baseUrlInput"),
  tokenInput: document.querySelector("#tokenInput"),
  startButton: document.querySelector("#startButton"),
  resetButton: document.querySelector("#resetButton"),
  submitButton: document.querySelector("#submitButton"),
  sessionMeta: document.querySelector("#sessionMeta"),
  progressLabel: document.querySelector("#progressLabel"),
  questionText: document.querySelector("#questionText"),
  statusPill: document.querySelector("#statusPill"),
  optionsMount: document.querySelector("#optionsMount"),
  summaryMount: document.querySelector("#summaryMount"),
  rawOutput: document.querySelector("#rawOutput")
};

function apiBaseUrl() {
  return elements.baseUrlInput.value.trim() || window.location.origin;
}

function headers() {
  const token = elements.tokenInput.value.trim();
  const value = { "Content-Type": "application/json" };
  if (token) value.Authorization = `Bearer ${token}`;
  return value;
}

function startBody() {
  return {
    request_id: `req-fastapi-start-${Date.now()}`,
    idempotency_key: `idem-fastapi-start-${Date.now()}`,
    case_id: "demo-tachycardia-live-001",
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    client: {
      source: "fastapi-test-page",
      site: "local",
      locale: "en-US"
    },
    patient_context: {
      demo_patient_id: "DEMO-TACHY-001",
      age: 76,
      sex: "female",
      identity_mode: "demo"
    },
    vitals: {
      measurement_timestamp: "2026-05-21T10:01:00+08:00",
      device_id: "IMVS-DEMO-001",
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
      max_questions: 7,
      max_options_per_question: 9,
      max_option_label_length: 48,
      variable_option_count: true,
      voice_input: false
    }
  };
}

function answerBody() {
  return {
    request_id: `req-fastapi-answer-${Date.now()}`,
    idempotency_key: `idem-fastapi-answer-${state.currentQuestion.id}-${Date.now()}`,
    session_key: state.sessionKey,
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    question_phase: "post_measurement_intake",
    question_id: state.currentQuestion.id,
    answer: {
      selected_option_ids: state.selectedOptionIds,
      scale_value: null
    },
    client_event: {
      answered_at: new Date().toISOString(),
      input_mode: "touch"
    }
  };
}

async function postJson(path, body) {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body)
  });
  const data = await response.json();
  showRaw(data);
  if (!response.ok) {
    throw new Error(data.error ? data.error.message : `HTTP ${response.status}`);
  }
  return data;
}

function showRaw(data) {
  elements.rawOutput.textContent = JSON.stringify(data, null, 2);
}

function renderQuestion(data) {
  state.currentQuestion = data.question;
  state.selectedOptionIds = [];
  elements.statusPill.textContent = data.status;
  elements.progressLabel.textContent = `Question ${data.progress.current} of ${data.progress.expected_total}`;
  elements.questionText.textContent = data.question.text;
  elements.sessionMeta.textContent = `Session: ${data.session_key}`;
  elements.submitButton.disabled = true;
  elements.optionsMount.innerHTML = data.question.options.map((option) => `
    <button class="option" type="button" data-option-id="${option.id}">
      <strong>${escapeHtml(option.label)}</strong>
      <small>${escapeHtml(option.id)}</small>
    </button>
  `).join("");
  elements.optionsMount.querySelectorAll(".option").forEach((button) => {
    button.addEventListener("click", () => toggleOption(button));
  });
}

function renderSummary(data) {
  state.currentQuestion = null;
  state.selectedOptionIds = [];
  elements.statusPill.textContent = "summary";
  elements.progressLabel.textContent = `Question ${data.progress.current} of ${data.progress.expected_total}`;
  elements.questionText.textContent = "Staff-review summary is ready.";
  elements.optionsMount.innerHTML = "";
  elements.submitButton.disabled = true;

  const summary = data.staff_review_summary || {};
  const cards = Object.entries(summary).map(([key, value]) => `
    <div class="summary-card">
      <strong>${escapeHtml(key.replaceAll("_", " "))}</strong>
      <span>${escapeHtml(formatValue(value))}</span>
    </div>
  `);
  elements.summaryMount.innerHTML = cards.join("") || `<div class="empty">Summary response received.</div>`;
}

function toggleOption(button) {
  if (!state.currentQuestion) return;
  const optionId = button.dataset.optionId;
  const isSingle = state.currentQuestion.max_selections === 1;

  if (isSingle) {
    state.selectedOptionIds = [optionId];
    elements.optionsMount.querySelectorAll(".option").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  } else if (state.selectedOptionIds.includes(optionId)) {
    state.selectedOptionIds = state.selectedOptionIds.filter((id) => id !== optionId);
    button.classList.remove("selected");
  } else {
    state.selectedOptionIds.push(optionId);
    button.classList.add("selected");
  }

  elements.submitButton.disabled = state.selectedOptionIds.length === 0;
}

function formatValue(value) {
  if (Array.isArray(value)) return value.map(formatValue).join(" ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function startSession() {
  const data = await postJson("/api/triage-demo/sessions", startBody());
  state.sessionKey = data.session_key;
  renderQuestion(data);
}

async function submitAnswer() {
  if (!state.sessionKey || !state.currentQuestion || !state.selectedOptionIds.length) return;
  const data = await postJson(`/api/triage-demo/sessions/${encodeURIComponent(state.sessionKey)}/answers`, answerBody());
  if (data.status === "summary") {
    renderSummary(data);
  } else {
    renderQuestion(data);
  }
}

function reset() {
  state.sessionKey = null;
  state.currentQuestion = null;
  state.selectedOptionIds = [];
  elements.sessionMeta.textContent = "";
  elements.progressLabel.textContent = "Question";
  elements.questionText.textContent = "Start a session to load the first governed question.";
  elements.statusPill.textContent = "ready";
  elements.optionsMount.innerHTML = "";
  elements.summaryMount.innerHTML = "Summary appears after the final question.";
  elements.summaryMount.classList.add("empty");
  elements.submitButton.disabled = true;
  showRaw({});
}

elements.startButton.addEventListener("click", () => startSession().catch((error) => alert(error.message)));
elements.submitButton.addEventListener("click", () => submitAnswer().catch((error) => alert(error.message)));
elements.resetButton.addEventListener("click", reset);

