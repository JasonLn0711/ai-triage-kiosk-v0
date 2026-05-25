const {
  createSession,
  demoBearerAuthChallenge,
  errorResult,
  requireDemoBearerAuth,
  sendResult,
  setCorsHeaders
} = require("../lib/triage-demo-contract");

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    sendResult(res, errorResult(405, {}, "method_not_allowed", "Use POST /api/triage-demo/sessions.", { retryable: false }));
    return;
  }

  const authError = requireDemoBearerAuth(req);
  if (authError) {
    res.setHeader("WWW-Authenticate", demoBearerAuthChallenge());
    sendResult(res, authError);
    return;
  }

  try {
    sendResult(res, createSession(await readJsonBody(req)));
  } catch (error) {
    sendResult(res, errorResult(400, {}, "invalid_json", "Request body must be valid JSON.", { retryable: false }));
  }
};
