#!/usr/bin/env node

const http = require("node:http");
const {
  createSession,
  demoBearerAuthChallenge,
  errorResult,
  requireDemoBearerAuth,
  sendResult,
  setCorsHeaders,
  submitAnswer
} = require("../api/lib/triage-demo-contract");

const PORT = Number(process.env.PORT || 4193);

function sendHealth(res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({
    status: "ok",
    service: "nycu-imedtac-triage-demo-api",
    mode: "synthetic-data-rehearsal-api"
  }));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === "GET" && req.url === "/healthz") {
    sendHealth(res);
    return;
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "POST" && req.url === "/api/triage-demo/sessions") {
      const authError = requireDemoBearerAuth(req);
      if (authError) {
        res.setHeader("WWW-Authenticate", demoBearerAuthChallenge());
        sendResult(res, authError);
        return;
      }
      sendResult(res, createSession(await readJsonBody(req)));
      return;
    }

    const answerMatch = String(req.url || "").match(/^\/api\/triage-demo\/sessions\/([^/?#]+)\/answers$/);
    if (req.method === "POST" && answerMatch) {
      const authError = requireDemoBearerAuth(req);
      if (authError) {
        res.setHeader("WWW-Authenticate", demoBearerAuthChallenge());
        sendResult(res, authError);
        return;
      }
      sendResult(res, submitAnswer(decodeURIComponent(answerMatch[1]), await readJsonBody(req)));
      return;
    }

    sendResult(res, errorResult(404, {}, "not_found", "Use POST /api/triage-demo/sessions or POST /api/triage-demo/sessions/{session_key}/answers.", { retryable: false }));
  } catch (error) {
    sendResult(res, errorResult(400, {}, "invalid_json", "Request body must be valid JSON.", { retryable: false }));
  }
});

server.listen(PORT, () => {
  console.log(`AI triage demo mock API listening on http://localhost:${PORT}`);
});
