# LLM API

Local Hugging Face summary service for the AI triage kiosk demo.

## Configuration

Create `.env` in `LLM_api/` from the repo-root `.env.example`.

```text
HF_TOKEN=
LLM_MODEL_ID=google/medgemma-4b-it
LLM_HOST=127.0.0.1
LLM_PORT=8091
LLM_SUMMARY_URL=http://127.0.0.1:8091/api/llm-summary/subjective
```

`HF_TOKEN` is used for gated Hugging Face models. `LLM_MODEL_ID` can be changed
to another compatible Hugging Face instruction model.

## Run

```bash
uv run uvicorn main:app --host "${LLM_HOST:-127.0.0.1}" --port "${LLM_PORT:-8091}"
```

or from the repo root:

```bash
./Start_LLM_server.sh
```
