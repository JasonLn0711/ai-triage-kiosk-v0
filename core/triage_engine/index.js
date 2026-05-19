(function attachTriageEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.AiTriageKioskEngine = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function triageEngineFactory() {
  const VERSION = {
    product: "AI Triage Kiosk Demo",
    versionLabel: "v0.2.0",
    boundary: "Demo-only workflow support; not diagnosis, treatment advice, final triage level, or HIS/EMR writeback."
  };

  const SAFETY_STATEMENTS = [
    "Synthetic demo data only.",
    "The output is a staff-review summary, not a diagnosis or final triage level.",
    "Vital-sign cues are displayed for review and must be validated against local clinical policy.",
    "No HIS, EMR, FHIR writeback, emergency order, or treatment recommendation is performed."
  ];

  const QUESTION_PHASES = {
    PRE_VITAL_INTAKE: "pre_vital_intake",
    POST_VITAL_FOLLOWUP: "post_vital_followup"
  };

  const MEASUREMENT_STATES = {
    IN_PROGRESS: "in_progress",
    COMPLETE: "complete",
    FAILED: "failed"
  };

  const CASES = [
    {
      id: "chest-pain-high-bp-low-spo2",
      label: "Chest pressure with high BP and low SpO2",
      shortLabel: "Chest pressure",
      fixturePath: "demo/fixtures/chest-pain-high-bp-low-spo2.json",
      opening: "I have chest pressure that started this morning.",
      profile: {
        demoId: "DEMO-001",
        age: "58",
        sex: "Male",
        language: "English",
        arrivalMode: "Walk-in kiosk",
        context: "Synthetic urgent-care visitor"
      },
      vitals: {
        bloodPressure: "188/122 mmHg",
        spo2: "91%",
        heartRate: "112 bpm",
        temperature: "36.8 C",
        bmiContext: "172 cm / 78 kg"
      },
      vitalCues: [
        "Blood pressure value is visibly high in the synthetic payload.",
        "SpO2 value is visibly low in the synthetic payload.",
        "Heart rate is elevated in the synthetic payload."
      ],
      sourceFamilies: ["AHA public education", "ENA ESI reference family", "local protocol placeholder"],
      allowedOutput: "Staff-review summary and source-family display only.",
      forbiddenOutput: "No final acuity assignment, condition identification, automatic emergency order, treatment advice, or HIS/EMR writeback."
    },
    {
      id: "fever-urinary",
      label: "Fever with painful urination",
      shortLabel: "Fever and urinary symptoms",
      fixturePath: "demo/fixtures/fever-urinary.json",
      opening: "I have had fever and painful urination for two days.",
      profile: {
        demoId: "DEMO-002",
        age: "42",
        sex: "Female",
        language: "English",
        arrivalMode: "Walk-in kiosk",
        context: "Synthetic urgent-care visitor"
      },
      vitals: {
        bloodPressure: "102/66 mmHg",
        spo2: "96%",
        heartRate: "108 bpm",
        temperature: "38.7 C",
        bmiContext: "Not provided"
      },
      vitalCues: [
        "Temperature is elevated in the synthetic payload.",
        "Heart rate is elevated in the synthetic payload."
      ],
      sourceFamilies: ["CDC fever warning reference family", "urology guideline reference family", "local protocol placeholder"],
      allowedOutput: "Staff-review summary and source-family display only.",
      forbiddenOutput: "No antibiotic recommendation, condition identification, final acuity assignment, emergency order, or HIS/EMR writeback."
    }
  ];

  const QUESTION_BANK = [
    {
      id: "chief-concern",
      field: "chiefConcern",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "What is the main reason you are using the kiosk today?",
      type: "single",
      value: "Starts with the patient's own concern before symptom-specific follow-up.",
      options: ["Chest pressure or chest pain", "Shortness of breath", "Fever or chills", "Painful urination", "Dizziness or weakness", "Other concern"]
    },
    {
      id: "onset",
      field: "onset",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "When did this problem start?",
      type: "single",
      value: "Adds timing for staff review.",
      options: ["Just now or within 1 hour", "Today", "1 to 2 days ago", "3 to 7 days ago", "More than 1 week ago", "Not sure"]
    },
    {
      id: "severity",
      field: "severity",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "How severe does it feel right now?",
      type: "single",
      value: "Captures patient-reported severity without assigning a triage level.",
      options: ["Mild", "Moderate", "Severe", "Worst I can imagine", "Not sure"]
    },
    {
      id: "breathing",
      field: "breathing",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "Are you having trouble breathing right now?",
      type: "single",
      value: "Makes a patient-reported breathing concern visible to staff.",
      options: ["No", "A little", "Yes", "I cannot speak full sentences", "Not sure"]
    },
    {
      id: "chest-details",
      field: "chestDetails",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "For chest discomfort, which descriptions fit?",
      type: "multi",
      value: "Collects structured chest-symptom descriptors for review.",
      options: ["Pressure or tightness", "Sharp pain", "Spreads to arm, jaw, back, or shoulder", "Sweating or nausea", "Worse with activity", "None of these"]
    },
    {
      id: "neurologic-symptoms",
      field: "neuroSymptoms",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "Do you have any new neurologic symptoms?",
      type: "multi",
      value: "Surfaces patient-reported neurologic symptoms without diagnosis.",
      options: ["New face droop", "New arm or leg weakness", "New speech trouble", "New confusion", "New severe headache", "None of these"]
    },
    {
      id: "fever-details",
      field: "feverDetails",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "For fever or infection concern, which descriptions fit?",
      type: "multi",
      value: "Collects fever context and visible review cues.",
      options: ["Measured fever", "Chills", "Cough or sore throat", "Painful urination", "Back or flank pain", "None of these"]
    },
    {
      id: "urinary-details",
      field: "urinaryDetails",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "For urinary symptoms, which descriptions fit?",
      type: "multi",
      value: "Collects urinary symptom context without diagnosing infection.",
      options: ["Pain or burning while urinating", "Urinating more often", "Urgent need to urinate", "Blood in urine", "Unable to urinate", "None of these"]
    },
    {
      id: "pregnancy-context",
      field: "pregnancyContext",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "Is pregnancy possible or currently known?",
      type: "single",
      value: "Keeps a key context field visible for staff review.",
      options: ["No", "Yes", "Possible", "Not applicable", "Prefer to discuss with staff"]
    },
    {
      id: "medication-allergy",
      field: "medicationAllergy",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "Can you provide current medications or allergies?",
      type: "multi",
      value: "Routes medication and allergy details to staff confirmation.",
      options: ["Medication list available", "Medication list not available", "Known drug allergy", "No known drug allergy", "Not sure"]
    },
    {
      id: "support-needed",
      field: "supportNeeded",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "Do you need staff help before continuing?",
      type: "multi",
      value: "Supports kiosk usability and handoff safety.",
      options: ["Need help reading", "Need help typing", "Need interpreter support", "Need wheelchair or mobility help", "No help needed"]
    },
  ];

  const FIELD_LABELS = Object.fromEntries(QUESTION_BANK.map((question) => [question.field, question.text]));

  function createInitialState(caseId = CASES[0].id, options = {}) {
    const selectedCase = findCase(caseId);
    return {
      caseId: selectedCase.id,
      turn: 0,
      measurementState: options.measurementState || MEASUREMENT_STATES.COMPLETE,
      answers: {},
      answeredQuestionIds: [],
      transcript: selectedCase.opening
    };
  }

  function findCase(caseId) {
    return CASES.find((item) => item.id === caseId) || CASES[0];
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase();
  }

  function answerText(value) {
    if (Array.isArray(value)) return value.join(" ");
    return String(value || "");
  }

  function fieldAnswered(state, field) {
    const value = state.answers[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && String(value).trim() !== "";
  }

  function measurementComplete(state) {
    return (state.measurementState || MEASUREMENT_STATES.COMPLETE) === MEASUREMENT_STATES.COMPLETE;
  }

  function markVitalsReady(state) {
    return {
      ...state,
      measurementState: MEASUREMENT_STATES.COMPLETE
    };
  }

  function inferConcernKeywords(state) {
    const selectedCase = findCase(state.caseId);
    const combined = normalizeText(`${selectedCase.opening} ${state.transcript} ${Object.values(state.answers).map(answerText).join(" ")}`);
    return {
      chest: /chest|pressure|tightness|heart|arm|jaw|shoulder/.test(combined),
      breathing: /breath|shortness|oxygen|spo2|speak full/.test(combined),
      fever: /fever|chill|temperature|infection|cough/.test(combined),
      urinary: /urinar|urinat|urine|pee|burn|flank|back pain/.test(combined),
      neuro: /weak|speech|face|confus|headache|dizz/.test(combined)
    };
  }

  function questionScore(question, state) {
    if (state.answeredQuestionIds.includes(question.id) || fieldAnswered(state, question.field)) {
      return null;
    }
    if (!measurementComplete(state) && question.phase === QUESTION_PHASES.POST_VITAL_FOLLOWUP) {
      return null;
    }

    const concern = inferConcernKeywords(state);
    const selectedCase = findCase(state.caseId);
    let score = 40;
    const reasons = [];

    if (!measurementComplete(state) && question.phase === QUESTION_PHASES.PRE_VITAL_INTAKE) {
      score += 22;
      reasons.push("safe during vital-sign measurement");
    }
    if (measurementComplete(state) && question.phase === QUESTION_PHASES.POST_VITAL_FOLLOWUP) {
      score += 10;
      reasons.push("post-vital follow-up");
    }

    if (question.id === "chief-concern") {
      score += state.turn === 0 ? 30 : 0;
      reasons.push("first kiosk anchor");
    }

    if (question.id === "onset" || question.id === "severity") {
      score += state.turn <= 2 ? 20 : 12;
      reasons.push("core review field");
    }

    if (question.id === "breathing" && (concern.breathing || selectedCase.vitals.spo2.includes("91"))) {
      score += 32;
      reasons.push("visible breathing or SpO2 context");
    }

    if (question.id === "chest-details" && concern.chest) {
      score += 34;
      reasons.push("matches chest-pressure case context");
    }

    if (question.id === "neurologic-symptoms" && (concern.neuro || selectedCase.id.includes("chest"))) {
      score += 16;
      reasons.push("screening context before staff review");
    }

    if (question.id === "fever-details" && (concern.fever || selectedCase.vitals.temperature.startsWith("38"))) {
      score += 34;
      reasons.push("matches fever or temperature context");
    }

    if (question.id === "urinary-details" && concern.urinary) {
      score += 34;
      reasons.push("matches urinary symptom context");
    }

    if (question.id === "pregnancy-context" && (concern.urinary || concern.fever)) {
      score += 14;
      reasons.push("context field for staff confirmation");
    }

    if (question.id === "medication-allergy") {
      score += state.turn >= 3 ? 12 : 4;
      reasons.push("handoff readiness");
    }

    if (question.id === "support-needed") {
      score += state.turn >= 4 ? 10 : 2;
      reasons.push("kiosk assistance check");
    }

    return {
      question,
      score,
      reasons: reasons.length ? reasons : ["available governed question"]
    };
  }

  function rankQuestions(state) {
    return QUESTION_BANK
      .map((question) => questionScore(question, state))
      .filter(Boolean)
      .sort((left, right) => right.score - left.score || left.question.id.localeCompare(right.question.id));
  }

  function selectNextQuestion(state) {
    const ranked = rankQuestions(state);
    return {
      selected: ranked[0] || null,
      ranked
    };
  }

  function recordAnswer(state, questionId, value) {
    const question = QUESTION_BANK.find((item) => item.id === questionId);
    if (!question) throw new Error(`Unknown question: ${questionId}`);
    const next = {
      ...state,
      turn: state.turn + 1,
      answers: { ...state.answers, [question.field]: value },
      answeredQuestionIds: [...state.answeredQuestionIds, question.id]
    };
    return next;
  }

  function buildStaffSummary(state) {
    const selectedCase = findCase(state.caseId);
    const answered = Object.entries(state.answers).map(([field, value]) => ({
      field,
      label: FIELD_LABELS[field] || field,
      value
    }));
    const missing = QUESTION_BANK
      .filter((question) => !fieldAnswered(state, question.field))
      .map((question) => ({ field: question.field, label: question.text }));
    const reviewCues = [...selectedCase.vitalCues];

    if (String(state.answers.breathing || "").includes("cannot speak")) {
      reviewCues.push("Patient selected inability to speak full sentences.");
    }
    if (Array.isArray(state.answers.chestDetails) && state.answers.chestDetails.some((item) => item.includes("Spreads"))) {
      reviewCues.push("Patient selected chest discomfort spreading to another area.");
    }
    if (Array.isArray(state.answers.neuroSymptoms) && !state.answers.neuroSymptoms.includes("None of these")) {
      reviewCues.push("Patient selected one or more neurologic symptom descriptors.");
    }
    if (Array.isArray(state.answers.urinaryDetails) && state.answers.urinaryDetails.includes("Unable to urinate")) {
      reviewCues.push("Patient selected inability to urinate.");
    }

    return {
      caseLabel: selectedCase.label,
      profileSummary: `${selectedCase.profile.age}-year-old ${selectedCase.profile.sex.toLowerCase()} synthetic visitor, ${selectedCase.profile.arrivalMode.toLowerCase()}.`,
      boundary: VERSION.boundary,
      vitalCues: reviewCues,
      answered,
      missing,
      sourceFamilies: selectedCase.sourceFamilies,
      allowedOutput: selectedCase.allowedOutput,
      forbiddenOutput: selectedCase.forbiddenOutput,
      requiresStaffReview: true,
      measurementState: state.measurementState || MEASUREMENT_STATES.COMPLETE,
      questionPhases: {
        preVitalIntakeAnswered: answered.filter((item) => {
          const question = QUESTION_BANK.find((candidate) => candidate.field === item.field);
          return question && question.phase === QUESTION_PHASES.PRE_VITAL_INTAKE;
        }).length,
        postVitalFollowupAnswered: answered.filter((item) => {
          const question = QUESTION_BANK.find((candidate) => candidate.field === item.field);
          return question && question.phase === QUESTION_PHASES.POST_VITAL_FOLLOWUP;
        }).length
      },
      safetyStatements: SAFETY_STATEMENTS
    };
  }

  return {
    VERSION,
    SAFETY_STATEMENTS,
    QUESTION_PHASES,
    MEASUREMENT_STATES,
    CASES,
    QUESTION_BANK,
    FIELD_LABELS,
    createInitialState,
    findCase,
    inferConcernKeywords,
    measurementComplete,
    markVitalsReady,
    rankQuestions,
    selectNextQuestion,
    recordAnswer,
    buildStaffSummary
  };
});
