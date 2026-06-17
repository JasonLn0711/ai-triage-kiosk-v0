FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

COPY python_api ./python_api
COPY Question_DB ./Question_DB
COPY handoff/api-examples ./handoff/api-examples

RUN pip install --no-cache-dir -r python_api/requirements.txt

EXPOSE 8000

CMD ["sh", "-c", "python -m uvicorn python_api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
