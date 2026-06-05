from __future__ import annotations

DEMO_BOUNDARY = "Synthetic-data staff-review intake support with human-review workflow and separate production validation path."
SESSION_TTL_SECONDS = 30 * 60
WORKFLOW_MODE = "post_measurement_only"
MEASUREMENT_STATE_COMPLETE = "complete"

SUPPORTED_CASE_IDS = {
    "demo-tachycardia-live-001",
    "demo-v1-fever-001",
    "demo-v1-low-spo2-001",
}

BRANCH_MODULES = {
    "palpitation": "Heart/palpitation.md",
    "fever": "Body_temperture/fever.md",
    "shortness_of_breath": "Respiratory/shortness_of_breath.md",
}

SCOPE_CONTROLS = [
    "Staff-review intake support",
    "Human review workflow",
    "Synthetic-data demo context",
    "Production integration managed through a separate validation path",
]

