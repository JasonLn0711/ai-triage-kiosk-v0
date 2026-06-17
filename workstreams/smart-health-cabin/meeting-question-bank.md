---
id: smart-health-cabin-meeting-question-bank
title: "Smart Health Cabin Meeting Question Bank"
date: 2026-06-17
topic: ai-triage
type: meeting-prep
status: active
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
---

# Smart Health Cabin Meeting Question Bank

## Opening Questions

1. 這次北市聯醫案的第一版成功標準是 demo、pilot、院方驗收，還是正式上線？
2. 9 月初整合、9 月中驗收的範圍，是兩個模組全做，還是可以分 MVP 與後續 phase？
3. 這次希望 NYCU / 多寶 / Jason 先回覆的是 feasibility memo、正式 proposal、還是 rough quotation？
4. 6/23 現場是否可以拍照、錄影、記錄設備型號與操作流程？

## Questions For Johnny / Project Ownership

1. imedtac 希望 NYCU 主要承接哪一塊：UI/UX、前端、後端、CMS、資料格式、臨床流程、還是整體系統？
2. UI/UX Figma 是 imedtac 提供、NYCU 提供，還是共同產出？
3. CMS 文件中寫「此為 imedtac 執行，但部分資訊由陽交大提供」，這裡的分工是什麼？
4. 完整 source code 交付是指專案客製程式碼，還是包含可重用的 engine / framework？
5. 後續維運、bug fix、題庫更新、部署更新由誰負責？

## Questions For Equipment / Engineering

1. Touch screen 尺寸、解析度、瀏覽器、OS、kiosk mode 是什麼？
2. 前台能否直接呼叫外部 HTTPS API？
3. 是否有 CORS、proxy、VPN、防火牆或 allowlist 限制？
4. 是否有本地資料庫、local storage 或 kiosk storage 限制？
5. 音訊播放能否由瀏覽器控制？是否支援固定音量、頻率、左右聲道？
6. 是否有設備 API/SDK 文件可提供？
7. 是否要支援離線模式或網路中斷 fallback？

## Questions For Module A: Vision / Hearing

1. 視力測驗的目標是 preliminary screening 還是正式醫療量測？
2. 視力測驗距離是否固定？是否有站位或坐位標記？
3. 視力量表、色覺、散光、視野測驗的依據由誰提供或審核？
4. 固定喇叭不用耳機時，如何做到左右耳分別測試？
5. 隔音後 dB 數是否已有測量資料？
6. 聽力測試需要哪些頻率與 dB range？
7. 測驗失敗、不確定、環境太吵時，報告如何呈現？

## Questions For Module B: Questionnaire / Triage

1. 家庭醫學科全面性問卷由誰提供？
2. 科別建議與衛教內容由誰負責審核？
3. 問卷是否 patient-facing，還是 staff-review oriented？
4. 是否需要急症/紅旗 stop rule？
5. 是否只能單選/多選，還是需要數值、量尺、自由文字？
6. 題目是否需要多語系？
7. 是否要保存 branch path 與每次版本？

## Questions For Report / QR Code / Data

1. QR Code 連到什麼：網頁報告、PDF、手機頁面，還是院方系統？
2. QR report 是否需要登入、OTP、手機號、病歷號或匿名 token？
3. 報告有效期限與刪除政策是什麼？
4. 報告是否可被分享或轉傳？
5. HIS-ready 是否只需要 JSON schema，還是需要接真實 HIS test endpoint？
6. 目標資料標準是 custom JSON、HL7、FHIR，還是院方既有格式？

## Closeout Questions

1. 會後希望 NYCU 何時回覆 feasibility / schedule / budget？
2. 回覆文件要給誰看：imedtac 內部、北市聯醫、教授、還是工程團隊？
3. 是否需要分成一版 internal technical memo 與一版 stakeholder-facing proposal？
4. 下一次決策會議的 owner、日期、輸出物是什麼？
