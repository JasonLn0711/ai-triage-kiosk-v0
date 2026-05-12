# User-Provided Summary - 2026-05-12 Prof. Wu Google Meet

Source: user-provided interpretation after the Google Meet transcript.

## Core Conclusion

現在不要先做完整 AI triage，而是先用 FDA `510(k)` 找到「已被允許的產品型態」，再反推 demo 的 intended use、功能邊界與 Friday 會議說法。

## 會議重點整理

### 1. 近期目標：先做英文版 demo

慧誠智醫目前最急的是：

- 全部改成英文
- 放到他們的 All-in-One 觸控設備上
- 先讓美國客戶在六月前有情境可以看
- 週五可能需要再討論如何接上他們系統

判斷：短期不要先接 vital signs。

先做到：

```text
English AI pre-visit / triage reference demo running on their device.
```

### 2. 技術限制：沒有 GPU，不能幻想完整 LLM 上機

他們設備沒有 GPU，所以目前合理架構是：

- ASR 壓小
- embedding model 放本機
- LLM 不一定本機跑
- adaptive questioning 先用 embedding + rule + question bank
- vital sign integration 先留作 v2 / v3

### 3. 最大問題不是模型，而是 intended use

吳老師抓到真正核心：

```text
先搞清楚這個產品在 FDA 510(k) 裡面到底被允許做什麼。
```

目前對方也還沒定義清楚：

- 是急診檢傷？
- 是門診前問診？
- 是篩檢？
- 是健康風險分級？
- 是 clinical decision support？
- 是 administrative intake？

這些產品定位差很多。

### 4. 吳老師給的主線任務

第一件事：

```text
找 FDA 510(k) summary。
```

看裡面的：

- device name
- predicate device
- intended use
- indications for use
- system function
- input data
- output format
- clinical claim
- limitations
- cybersecurity / software description

然後反推 demo 可以怎麼包裝。

### 5. 不要自己從零設計

吳老師的意思：

```text
人家能拿到 510(k)，表示功能邊界已經被想過。先看人家怎麼寫，我們不要自己亂猜。
```

比較安全的產品定位可能是：

```text
AI-assisted pre-visit intake and screening support system for clinician review.
```

先避免寫成：

```text
AI determines triage urgency.
```

前者比較安全，後者風險高很多。

## 下一步判斷

### A. Friday meeting 前

準備一頁英文說法：

```text
Current phase: English reference demo on target device.
Vital sign integration will be evaluated after receiving device output format,
sample data, and intended clinical workflow.
```

### B. 510(k) research

搜尋方向：

- triage software 510(k)
- patient intake software 510(k)
- vital signs triage 510(k)
- clinical decision support 510(k)
- symptom checker 510(k)
- emergency department triage software 510(k)

### C. Demo scope

短期 demo 不要承諾：

- 自動診斷
- 自動分流
- 自動判斷急重症
- 根據 vital signs 直接產生臨床建議

可以承諾：

- collect patient answers
- summarize symptoms
- suggest next question from question bank
- flag missing information
- prepare structured report for clinician review

## 最重要結論

這場會議真正定調：

```text
你現在不是要把 AI triage 做大，而是要先把它做小、做準、做得像一個可以被法規接受的 medical workflow component。
```

下一步最值得做的是：

```text
510(k) competitor / predicate device table
```

這張表會直接決定週五怎麼講、demo 怎麼改、深耕計畫怎麼寫。
