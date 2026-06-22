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
| `2026-05-12 22:20` | Do not start by inventing full AI triage. Find `3-5` comparable FDA `510(k)` cleared products first and extract intended use, indications for use, predicate/comparable device, input/output, patient-facing versus clinician-facing role, whether the product only collects/organizes information, whether it truly performs triage/recommendation, and how it avoids overclaiming. | Friday artifact should start as product-scope / predicate-device research, not a full clinical design. The direction has narrowed from "build AI triage" to "build a safe, explainable English intake demo for clinician review; vital signs stay contextual, not direct triage decisions." |
| `2026-05-12 22:20` | For June, keep the demo simple: English demo on the all-in-one device first; do not integrate live vital-sign signals unless the workflow and data interface are clear. | Keep vital-sign integration as future scope or mocked/synthetic placeholder. |
| `2026-05-12 22:20` | Ask 苗先生 for the US partner/customer product or `510(k)` reference. Ask 多寶 / 冠廷 when clinical or signal interpretation is unclear. | Add concrete collaborator route before Friday. |
| `2026-05-14 23:42` | Prof. Wu forwarded a GPT-generated DOCX titled `量測生命徵象＋問診與分流的產品設計.docx`. | Preserve as Prof. Wu context for product framing, especially the family medicine / general internal medicine direction, 10-question intake, rule-engine boundary, and draft threshold list; do not treat the GPT answer as validated clinical logic. |
| `2026-05-21 09:59` | The imedtac engineering sync resolved the June integration path as post-measurement-only: iMVS completes vital measurement, uploads the vital payload, receives `session_key` plus the first question, loops answers, then displays a staff-review summary. | Treat this as the current June engineering default. Keep the two-phase during-measurement design as a future optimized path, not the first customer-demo integration requirement. |
| `2026-05-21 09:59` | Ben / imedtac engineering accepted the merged start-session + vital-upload flow for June and asked NYCU to explain request fields such as `idempotency_key`. | Update API v0.2 around imedtac's actual Vital Upload API field dictionary and add plain field semantics before implementation. |
| `2026-05-21 09:59` | Johnny clarified the product-positioning risk: if the system outputs only facts, it is intake; if it outputs judgment, medical responsibility appears. | Use `vital-aware intake support` / `staff_review_summary` externally and avoid final triage level, diagnosis, treatment, or nurse-replacement claims. |
| `2026-05-21 09:59` | Voice input is out of the June demo critical path because the demo machine has no microphone and ASR adds latency, error, and privacy work. | Keep touch / choice-based interaction as the June path. Treat ASR as future capability after API and workflow are stable. |
| `2026-05-21 09:59` | Johnny emphasized live-demo performability: SpO2 is hard to control, heart rate and staged temperature are easier, and a healthy vs unhealthy contrast can make the AI capability legible. | Prepare both a respiratory synthetic lane and a tachycardia live-performance lane; choose after iMVS machine review and 多寶 wording review. |
| `2026-05-21 10:57` | 多寶 and Jason's internal post-meeting sync sharpened the clinical boundary: collecting facts and generating a staff-readable summary is acceptable demo territory, but five-level triage or recommended triage-level output is risky. | Keep June output as `staff_review_summary`; do not output formal triage level, recommended level, diagnosis, treatment, disposition, department, or order language. |
| `2026-05-21 10:57` | The most defensible AI surface is vital-aware question selection and concise summary generation, not open-ended question variation or arbitrary phrasing. | Split baseline `fixed question` from vital-aware `AI question`; keep the candidate question bank controlled and source/reviewer mapped. |
| `2026-05-21 10:57` | iMVS likely needs generic question templates; hand-coding every question screen would make a scalable AI question loop impractical. | Ask engineering to confirm `single_choice`, `multi_choice`, numeric/scale templates, variable option counts, max options, no-scroll limits, and payload shape. |
| `2026-05-21 10:57` | Jason and 多寶 concluded they should see or operate the actual iMVS machine instead of designing from imagined flow. | Schedule next-week iMVS machine review, preferably replacing the next weekly discussion with an on-site review plus demo/UI discussion. |
| `2026-05-21 11:53` | Prof. Wu said NYCU should have its own patent protection before deeper cooperation with 慧誠; even with friendly company relationships, public/private boundaries must be clear because imedtac may learn the method and later not acknowledge it. | Treat the AI-Triage patent disclosure as a cooperation-protection gate. Discuss with Prof. Wu and Tomi, separate API/demo sharing from patent-sensitive invention logic, and clarify cooperation/IP boundaries before teaching the full reusable method. |
| `2026-05-21 12:05` | Prof. Wu confirmed lab API mode is acceptable for demo and helps avoid giving imedtac all know-how. | Use Remote REST API Mode as both demo architecture and IP-control boundary; share API contract, not internal routing/scoring/source-governance details. |
| `2026-05-21 12:05` | Prof. Wu instructed Jason to mark idea origin in meeting records, including whether ideas came from Jason, 多寶, NYCU, or imedtac. | Add idea-attribution discipline to future imedtac meeting notes and review high-value existing notes where feasible. |
| `2026-05-21 12:05` | Prof. Wu said MOU is general and product development should eventually have a product co-development agreement covering development responsibility, overlap, profit split, and license/payment logic. | Prepare contract/IP questions for Prof. Wu / Tomi and avoid treating MOU as enough to protect reusable invention logic. |
| `2026-05-21 12:05` | Prof. Wu linked commissioned projects, product cash flow, BU/new-company possibility, and postdoc salary/personnel-cost runway. | Evaluate AI-Triage and adjacent projects as future funded product/service lanes; protect IP because it affects Jason's postdoc runway and leverage. |
| `2026-05-21 12:05` | Prof. Wu said deep-cultivation proposal work is for early June and can be drafted study-plan style: background pain point, methods, expected effects/KPI, and budget; AI-Triage can be one subproject and CRM can be a later-year extension. | Do not let deep-cultivation writing displace the 5/22 patent packets; park a June proposal frame with year-1 to year-3 structure. |
| `2026-06-19 21:29/21:30` | Prof. Wu / Tomi / 多寶 / Jason reframed the `2026-06-23` 慧誠 onsite visit as IP-aware discovery: collect device and workflow facts, listen to imedtac's desired approach, and do not proactively disclose the patent filing direction or internal claim framing. | Treat the onsite meeting as `IP-safe discovery`. Ask about equipment, workflow, ownership, and delivery needs; keep patent-sensitive method details internal until Prof. Wu / Tomi clear them. |
| `2026-06-19 21:29/21:30` | Tomi recommended prioritizing the Smart Health Cabin / AI Triage invention around multiple vital-sign acquisition followed by three-state handling: urgent, abnormal-but-follow-up, and normal/baseline, with human notification or follow-up questions rather than autonomous clinical action. | Before `2026-06-23`, prepare an internal 1-2 page patent profile and a high-level system block diagram: `multi-vital acquisition -> urgent / abnormal / normal classification -> human notification or targeted questions -> staff-review report`. |
| `2026-06-19 21:29/21:30` | Tomi distinguished Jason's software direction from the Smart Health Cabin device direction: Jason's stronger patent angle is specialty-configurable previsit questioning that flags patients for early clinician/nurse review or possible pre-visit examination handling. | Prepare a second internal block diagram for Jason's software lane: `specialty selection -> specialty watch items -> questionnaire -> clinician/nurse early-review notification -> visit summary`. Do not present this as an imedtac implementation promise before IP direction is settled. |
| `2026-06-19 21:29/21:30` | Vision/hearing may be patentable and useful, but the meeting favored staged handling because the mechanics, calibration, cabin design, and delivery timing remain unclear. | Keep Module A in discovery / screening-support language for the onsite visit. Prioritize Module B / measured-context workflow first; avoid committing to clinical-grade vision/hearing measurement before device facts and validation ownership are known. |

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
-> 3-5 comparable FDA 510(k) product-scope scan
-> intended use / indications / claim-boundary extraction
-> device data and clinical criteria
-> English intake demo for clinician review
-> clinician review
-> evidence traceability
-> cautious productization
```

Do not reduce the project to a chatbot, a prompt, or an ML model.
Do not start with "AI determines triage level"; start with comparable
product-scope evidence and safe intake / review language.

Post-`2026-05-21` engineering-sync execution reading:

```text
iMVS measurement first
-> measured vital payload to NYCU
-> structured question loop
-> staff_review_summary
-> human review
```

This is the June customer-demo integration path. The two-phase measurement-time
question flow stays available as an optimized future design after the first
post-measurement loop is stable.
