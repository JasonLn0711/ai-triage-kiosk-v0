from __future__ import annotations

from .models import NormalizedVital, ReviewFlag


def _value(vitals: dict[str, NormalizedVital], name: str) -> float | int | None:
    vital = vitals.get(name)
    return vital.value if vital else None


def evaluate_vitals(vitals: dict[str, NormalizedVital]) -> list[ReviewFlag]:
    flags: list[ReviewFlag] = []
    heart_rate = _value(vitals, "heart_rate_bpm")
    spo2 = _value(vitals, "spo2_percent")
    temperature = _value(vitals, "temperature_c")
    systolic = _value(vitals, "blood_pressure_systolic_mm_hg")

    if heart_rate is not None and heart_rate >= 120:
        flags.append(ReviewFlag(
            "measured_elevated_heart_rate_demo",
            "Measured elevated heart rate demo cue",
            "demo-routing-rule-clinical-validation-pending",
            "Measured heart-rate context should be visible in staff review.",
            ["heart_rate_bpm"],
        ))
    if heart_rate is not None and heart_rate >= 130:
        flags.append(ReviewFlag(
            "tachycardia_staff_review_demo",
            "Tachycardia staff-review demo cue",
            "demo-routing-rule-clinical-validation-pending",
            "Measured heart rate meets the tachycardia demo staff-review cue.",
            ["heart_rate_bpm"],
        ))
    if spo2 is not None and spo2 < 94:
        flags.append(ReviewFlag(
            "low_spo2_review_demo",
            "Low SpO2 staff-review demo cue",
            "demo-routing-rule-clinical-validation-pending",
            "Measured SpO2 context should be confirmed by staff in this demo workflow.",
            ["spo2_percent"],
        ))
    if temperature is not None and temperature >= 37.5:
        flags.append(ReviewFlag(
            "measured_fever_context_demo",
            "Measured fever context demo cue",
            "demo-routing-rule-clinical-validation-pending",
            "Measured temperature context supports fever-focused intake in this demo workflow.",
            ["temperature_c"],
        ))
    if temperature is not None and temperature >= 39.0:
        flags.append(ReviewFlag(
            "high_fever_staff_review_demo",
            "High fever staff-review demo cue",
            "demo-routing-rule-clinical-validation-pending",
            "Measured high-fever context should be visible in staff review.",
            ["temperature_c"],
        ))
    if systolic is not None and systolic < 90:
        flags.append(ReviewFlag(
            "low_bp_review_demo",
            "Low blood-pressure staff-review demo cue",
            "demo-routing-rule-clinical-validation-pending",
            "Measured systolic blood pressure context should be visible in staff review.",
            ["blood_pressure_systolic_mm_hg"],
        ))
    if systolic is not None and systolic > 180:
        flags.append(ReviewFlag(
            "high_bp_review_demo",
            "High blood-pressure staff-review demo cue",
            "demo-routing-rule-clinical-validation-pending",
            "Measured systolic blood pressure context should be visible in staff review.",
            ["blood_pressure_systolic_mm_hg"],
        ))
    return flags

