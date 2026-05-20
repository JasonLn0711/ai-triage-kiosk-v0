---
id: 2026-05-19-expert-review-scope-api-boundary-full-record
title: "Full User-Provided Expert Review Record"
date: 2026-05-20
topic: ai-triage
type: expert-review-full-record
status: archived
source: user-provided chat record
---

# Full User-Provided Expert Review Record

## Archive Note

This file preserves the complete user-provided record received on
`2026-05-20`, with Markdown formatting and line wrapping normalized for this
repository. Treat it as an expert / senior-review input for project planning,
handoff refinement, and source-governance routing.

The file references in the original prompt are preserved as user-provided
attachment references. They are not copied into this repository by this note.
The official URLs are expert-cited references and must still be checked against
the latest source text before external regulatory, clinical, or privacy claims
are made.

## User Request

老師/前輩您好，我想請您幫我判斷一個 AI triage kiosk demo 專案目前的做法是否妥適。

我們目前把六月 demo 切成：
iMVS vital-sign payload -> NYCU structured / choice-based dynamic intake -> staff_review_summary -> staff / clinician review。

我們刻意不做 diagnosis、不做 final triage level、不做 treatment advice、不做 production HIS/FHIR writeback，也不使用 real patient data。

我想請您幫我判斷：

1. 這個 scope cut 是否妥適？
2. API/session contract 是否合理？
3. clinical claim boundary 是否足夠？
4. voice input 和 HIS/FHIR writeback 是否應排除在六月 critical path？
5. 第一個 respiratory case 是否適合作為 demo case？
6. 我們還漏了哪些 clinical / engineering / privacy / regulatory risk？
7. Thursday sync 應該要求對方提供哪些 owner/date？

([Files][1])([Files][2])([Files][3])([Files][4])

## Expert Reply

判斷：**你現在的 scope cut 是妥適的，而且是六月 demo 最安全、最可交付的切法。**
真正要守住的是一句話：**這是 synthetic-data vital-aware intake + staff-review summary demo，不是 clinical triage product。**

我看了 packet 裡的 API v0.1、owner matrix、claim-language-control、data lifecycle policy。方向對。需要補強的是：**runtime enforcement、clinical stop rule、payload field dictionary、failure fallback、UI 文案鎖定。**

---

## 1. Scope cut 是否妥適？

**妥適。應維持。**

六月 demo 最小閉環應固定成：

```text
iMVS synthetic vital-sign payload
-> NYCU structured / choice-based dynamic intake
-> staff_review_summary
-> staff / clinician review
```

排除項目也正確：

```text
No diagnosis
No final triage / acuity level
No treatment advice
No emergency order
No production HIS / EMR / FHIR writeback
No real patient data
No raw ASR audio
```

FDA 對 clinical decision support 的關鍵點是：軟體一旦提供個人化醫療資訊來影響醫療判斷，就會進入 CDS / device boundary 的分析；若要降低風險，輸出必須讓 HCP 能獨立審查依據，避免主要依賴系統建議。你現在把輸出壓到 `staff_review_summary`，方向是對的。([U.S. Food and Drug Administration][5])

---

## 2. API / session contract 是否合理？

**合理，足以支撐六月 demo。**

目前兩個 endpoint 夠用：

```http
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

`session_key` 由 NYCU 產生、iMVS echo 回來，對六月 demo 合理，因為 state 先集中在 NYCU，整合風險較低。

但 v0.2 建議加這些欄位：

| 類別 | 建議補強 |
| --- | --- |
| session | `session_expires_at`, `session_state`, `last_question_id` |
| retry | `request_id`, `idempotency_key` |
| vital payload | `measurement_timestamp`, `device_id`, `measurement_status`, `quality_flag`, `missing_reason` |
| versioning | 保留 `api_version`, `schema_version`, `flow_version`, `case_id` |
| output control | `summary_visibility: "staff_only"` |
| safety | `handoff_required`, `handoff_reason_codes`, `not_claimed` |
| error | `status=error`, stable `error.code`, no fake summary |

另外，`plan_support` 這個欄位名稱有一點風險。SOAP 裡的 Plan 容易被理解成醫療處置。六月 demo 建議改成：

```json
"review_action": [
  "Staff or clinician review required."
]
```

或：

```json
"staff_handoff_note": "Please review measured vitals and reported symptoms."
```

---

## 3. Clinical claim boundary 是否足夠？

**文件層級足夠；UI/API/runtime 還要鎖。**

目前 claim boundary 寫得好，尤其是：

```text
staff_review_summary
synthetic-data capability demo
measured-vital context
clinician-review summary
no diagnosis
no final triage level
no treatment advice
no HIS/EMR writeback
```

但風險會從 UI 偷跑出來。你要禁止以下字樣出現在畫面、API field、簡報、口頭 demo：

```text
diagnosis
AI diagnosis
ESI level
emergency severity
likely pneumonia
likely sepsis
needs emergency treatment
safe to go home
FDA-cleared
510(k)-cleared
clinical-grade triage
```

510(k) 也要小心。FDA 對 510(k) 的核心是 substantial equivalence、same intended use、技術差異不得產生新的安全有效性問題；產品上市前也需要收到 FDA 的 SE order。六月 demo 只能說「comparable-product / 510(k) scope scan」，不能說 predicate-equivalent 或 510(k)-ready。([U.S. Food and Drug Administration][6])

---

## 4. Voice input 和 HIS/FHIR writeback 是否應排除 critical path？

**應排除。**

Voice 可以做成 optional stretch，不應放入六月主線。原因很直接：ASR 會引入 latency、口音錯誤、環境噪音、病人確認 UX、raw audio privacy、CPU/no GPU 負擔。若一定要展示 voice，最低條件是：

```text
voice -> transcript -> patient confirms -> structured choice answer
```

不可讓語音直接生成 summary。藥名、劑量、時間、數字、過敏史，要強制確認。

HIS/FHIR writeback 也應排除。六月最多做 doctor-view page 或 mock export。FHIR 不是「把 JSON 丟過去」而已；生命徵象若走 FHIR / TW Core，必須處理 Observation vital signs profile、欄位語意、單位、查詢與交換規範。這會吃掉 demo 時間。([twcore.mohw.gov.tw][7])

---

## 5. 第一個 respiratory case 是否適合？

**適合，但要設計成「早期 staff-review handoff case」。**

`fever + dyspnea + low SpO2` 很適合展示 vital signs 影響 follow-up questions。CDC 把成人 difficulty breathing / shortness of breath、胸腹持續疼痛或壓迫感、意識改變等列為 flu complication emergency warning signs；ESI handbook 也把 HR、RR、SpO2 放進高風險 vital signs 判斷，並強調 vital signs 必須放回病史、用藥、臨床表現脈絡中解讀。([CDC][8])

但 demo 不應讓系統繼續問滿 8 題才結束。建議流程：

```text
Q1 chief complaint
Q2 dyspnea duration / severity
Q3 chest pain / pressure
Q4 chronic lung disease / baseline oxygen / medication context
-> staff_review_summary
```

安全 wording：

```text
Synthetic demo case. Patient reports shortness of breath. Measured vitals include fever, increased respiratory rate, and lower oxygen saturation than expected for this demo scenario. Staff should review the respiratory complaint and measured vitals. This demo does not diagnose, assign final triage level, recommend treatment, or write to HIS/EMR.
```

不要寫：

```text
likely pneumonia
possible COVID
ESI level 2
needs emergency care
safe to wait
```

---

## 6. 還漏了哪些風險？

### 最大 clinical risk

沒有臨床 owner 核准 stop rule 和 summary wording。
這會讓 demo 看起來像自動檢傷，尤其 respiratory case 本身偏高風險。

### 最大 engineering risk

iMVS payload 欄位、單位、missing value、measurement failure 沒凍結。
沒有 field dictionary，就不能做穩定 adapter。

### 最大 privacy risk

一旦接 iMVS，真實姓名、MRN、身分證、電話、raw audio、log、截圖很容易混進來。台灣 PDPA 對 medical records、healthcare data、health examination data 都是高度敏感資料；美國場景也要面對 HIPAA de-identification 的 Safe Harbor / Expert Determination 之類問題。六月 demo 最乾淨做法就是 synthetic only。([pdpc.gov.tw][9])

### 最大 regulatory risk

對外講成「AI triage」。
可用語應改成：

```text
vital-aware intake support
clinician-review summary
synthetic-data workflow demo
```

### 最大 cybersecurity risk

外部 HTTPS endpoint、kiosk browser、local network、API token、logging 都還沒定。FDA medical device cybersecurity guidance 已經把 device cybersecurity design、labeling、premarket documentation 視為重要議題；六月雖然是 demo，也應至少有 demo-level threat boundary。([U.S. Food and Drug Administration][10])

---

## 7. Thursday sync 應要求哪些 owner/date？

會議不要只討論想法。要收斂成 owner/date。

| Owner | Thursday 必須拿到的東西 | 建議 due |
| --- | --- | --- |
| 慧誠 engineering | synthetic iMVS vital payload example + field dictionary | 2026-05-22 |
| 慧誠 engineering | 欄位單位、required/optional、missing/failure 表示法 | 2026-05-22 |
| 慧誠 engineering | UI insertion point：same app / iframe / external link / backend API / mock | 2026-05-22 |
| 慧誠 engineering | demo environment：internet、HTTPS、CORS、firewall、local fallback | 2026-05-22 |
| Johnny / product | customer demo 日期、受眾、demo 成功標準 | 會議中決定 |
| Johnny / product | single engineering POC + 溝通 channel | 會議中決定 |
| 多寶 / clinical | respiratory case 是否核准 | 2026-05-22 |
| 多寶 / clinical | stop rule + forbidden wording + safe summary wording | 2026-05-22 |
| Jason / NYCU | API v0.2 + sample JSON + error behavior | 2026-05-22 |
| Jason / NYCU | one-case mock adapter / static integration rehearsal | 2026-05-25 |
| Privacy/security owner | 確認 no real identifiers / no raw audio / no production endpoint | 2026-05-22 |

---

## 不應承諾的事項

```text
六月完成 production HIS/FHIR writeback
六月支援 real patient data
六月支援完整 multilingual ASR
六月支援全科 triage
六月支援 final acuity level
六月支援 diagnosis / treatment suggestion
六月支援 FDA / 510(k)-ready claim
六月支援沒有臨床審核的 red-flag wording
```

---

## 可以承諾的最小下一步

```text
在 5/22 前提供 API v0.2。
內容包含：
1. confirmed / placeholder vital payload fields
2. session_key flow
3. question object schema
4. answer submission schema
5. staff_review_summary schema
6. failure behavior
7. one synthetic respiratory case
8. explicit demo boundary
```

一句會議結尾可以這樣講：

```text
For June, we will deliver one synthetic vital-aware structured intake loop: iMVS sends a synthetic vital payload, NYCU returns structured questions with a session key, iMVS returns answers, and NYCU returns a staff_review_summary for staff or clinician review. Voice input and HIS/FHIR writeback are outside the critical path unless we create a separate approved decision. The output is not diagnosis, final triage level, treatment advice, or production EMR content.
```

[1]: file://my_files/file_00000000c3cc72078a97d62f78c7e984 "5cc7a0cc-f033-43cf-81bf-b5f63e01f8f5_AI-Triage_合作會議記錄（慧誠智醫__NYCU_吳老師團隊）.pdf"
[2]: file://my_files/file_00000000abb47209aacf1155641f378b "Gmail - [20260512] AI-Triage 討論會議記錄.pdf"
[3]: file://my_files/file_0000000066507209997813b3d19aa4a1 "AI SaMD Cybersecurity In Practice -v1.3.5.pdf"
[4]: file://my_files/file_0000000049547209b7f35cb6ee812f04 "Gmail - [20260512] AI-Triage 討論會議記錄.pdf"
[5]: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software "Clinical Decision Support Software | FDA"
[6]: https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/premarket-notification-510k "Premarket Notification 510(k) | FDA"
[7]: https://twcore.mohw.gov.tw/ig/twcore/0.3.2/StructureDefinition-Observation-vitalSigns-twcore.html "TW Core Observation Vital Signs - 臺灣核心實作指引(TW Core IG) v0.3.2"
[8]: https://www.cdc.gov/flu/signs-symptoms/index.html "Signs and Symptoms of Flu | Influenza (Flu) | CDC"
[9]: https://www.pdpc.gov.tw/en/News_Content/169/747/ "Preparatory Office of the Personal Data Protection Commission-Enforcement Rules-Personal Data Protection Act Article 6"
[10]: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-management-system-considerations-and-content-premarket "Cybersecurity in Medical Devices: Quality Management System Considerations and Content of Premarket Submissions | FDA"
