# Prof. Wu Instruction Register

This register consolidates Prof. Wu-related instructions and context that affect
the 慧誠 AI triage kiosk demo lane.

## Direct 慧誠 / Triage Instructions

| Date | Instruction / signal | Implication |
| --- | --- | --- |
| `2026-05-11` | Prof. Wu introduced the 慧誠智醫 / imedtac collaboration to 林駿亦 and Jason. | Treat this as the active triage collaboration lane, not a generic idea. |
| `2026-05-11` | The project involves questionnaire answers, EKG, SpO2, and possibly other vital signs. | Keep architecture open to device data plus symptom intake. |
| `2026-05-11` | Hardware and data collection are company / clinical-side responsibilities. | Do not build hardware scope or assume data access. |
| `2026-05-11` | Clinical triage SOP / criteria should come from company / clinical side. | Do not invent medical rules; build evidence mapping and review gates. |
| `2026-05-11` | 林駿亦 may fit EKG normal/abnormal classification; Jason may fit questionnaire / ASR / LLM / interaction side. | Keep role split explicit. |
| `2026-05-11` | Case collection is the main bottleneck and may take at least about half a year after opening. | Do not promise trained clinical model immediately. |
| `2026-05-11` | Treat current boundary as triage support, not diagnosis. | Preserve output wording and safety boundary. |
| `2026-05-11` | Taiwan / Southeast Asia may come before the US because US cybersecurity expectations may be high. | Keep deployment assumptions market-specific. |
| `2026-05-12 22:20` | Do not start by inventing full AI triage. Find comparable FDA `510(k)` summaries first and identify `indication for use`, functions, and boundaries. | Friday artifact should start as product-scope / predicate-device research, not a full clinical design. |
| `2026-05-12 22:20` | For June, keep the demo simple: English demo on the all-in-one device first; do not integrate live vital-sign signals unless the workflow and data interface are clear. | Keep vital-sign integration as future scope or mocked/synthetic placeholder. |
| `2026-05-12 22:20` | Ask 苗先生 for the US partner/customer product or `510(k)` reference. Ask 多寶 / 冠廷 when clinical or signal interpretation is unclear. | Add concrete collaborator route before Friday. |

## Company-Side Clarifications From 2026-05-12

| Topic | Clarification | Implication |
| --- | --- | --- |
| Business need | June US customer visit creates pressure for a visible demo. | Build market-demo capability story before production system. |
| Existing system | Kiosk / web service UI already measures vital signs and creates summary flow. | Find insertion point inside existing workflow. |
| Integration | Backend has gateway, RESTful API, FHIR, HIS, and EMR context. | Define API boundary before coding. |
| Differentiator | External symptom systems often do not use vital signs. | Make v0 vital-aware, not generic chatbot. |
| Long-term target | English voice input, broad/all-specialty symptom triage, vital-sign-aware result. | Keep long-term path recorded but narrow v0. |
| Productization | They are testing product thinking, deployment, marketability, modularity, and integration. | Prioritize product architecture and evidence traceability. |

## Upstream Context From 2026-04-16

| Thread | Instruction / signal | Relationship to 慧誠 |
| --- | --- | --- |
| Urology smart-previsit | Attend discovery meeting, judge MVP feasibility, start with UI-guided previsit interview and optional voice. | Provides workflow reference for structured intake and clinician handoff, but should not be merged blindly. |
| Medical cybersecurity deck | TFDA-first / FDA-supporting, practical industry-facing service story. | Provides hospital-side cybersecurity and vendor/hospital evidence framing for future productization. |
| Journal / Rao guardrail | New work must not displace higher-priority manuscript obligations. | Planning must keep this repo's work bounded. |

## Adjacent CDE / Cybersecurity Context

| Date | Instruction / signal | Implication |
| --- | --- | --- |
| `2026-04-20` | Prof. Wu asked Jason and 陳靖中 to help make the CDE PPT while avoiding overlap with two earlier talks. | Hospital-side requirements and clinical deployment constraints are a recurring Prof. Wu priority. |
| `2026-04-20` | CDE talk should own the clinical-side perspective: procurement evidence, deployment constraints, HIS/EMR/PACS, patching, residual risk, incident handoff. | Any 慧誠 triage product should expect hospital-side cybersecurity and integration questions. |

## Current Synthesis

The key Prof. Wu-aligned direction is:

```text
medical workflow first
-> intended use / 510(k) product-scope scan
-> device data and clinical criteria
-> AI-assisted triage support
-> clinician review
-> evidence traceability
-> cautious productization
```

Do not reduce the project to a chatbot, a prompt, or an ML model.
