const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const REQUIRED_FILES = [
  "package.json",
  "vercel.json",
  "scripts/build-vercel.js",
  "app/index.html",
  "app/triage-kiosk/index.html",
  "app/triage-kiosk/triage-kiosk.js",
  "app/shared/styles.css",
  "core/triage_engine/index.js",
  "api/lib/triage-demo-contract.js",
  "api/triage-demo/sessions.js",
  "api/triage-demo/sessions/[session_key]/answers.js",
  "tests/contract/triage-demo-api.test.js",
  "demo/fixtures/chest-pain-high-bp-low-spo2.json",
  "demo/fixtures/fever-urinary.json",
  "demo/fixtures/respiratory-low-spo2-early-handoff.json",
  "demo/fixtures/tachycardia-live-demo.json"
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const relativePath of REQUIRED_FILES) {
  assert(fs.existsSync(path.join(ROOT, relativePath)), `Missing required demo file: ${relativePath}`);
}

const html = read("app/triage-kiosk/index.html");
const script = read("app/triage-kiosk/triage-kiosk.js");
const packageJson = JSON.parse(read("package.json"));
const mockApiServer = read("scripts/mock-api-server.js");
const engine = require(path.join(ROOT, "core/triage_engine/index.js"));
const contract = require(path.join(ROOT, "api/lib/triage-demo-contract.js"));

assert(html.includes("AI Triage Kiosk Demo"), "Demo HTML should expose the English product title.");
assert(html.includes("../../core/triage_engine/index.js"), "Demo HTML should load the triage engine.");
assert(script.includes("AiTriageKioskEngine"), "Demo script should bind to the triage engine.");
assert(script.includes("Selected #"), "Multi-choice selections should show visible selection order.");
assert(script.includes("markVitalsReady"), "Demo script should expose the two-phase vitals-ready transition.");
assert(script.includes("loadTachycardia"), "Demo script should expose a tachycardia live-case load control.");
assert(script.includes("demoModeSelect"), "Demo script should expose the live/synthetic/local fallback mode control.");
assert(engine.CASES.length >= 3, "At least three synthetic cases are required.");
assert(engine.QUESTION_BANK.length >= 8, "The governed question bank is too small for the demo.");
assert(engine.CASES.every((demoCase) => demoCase.profile && demoCase.profile.age && demoCase.profile.sex), "Every case should include synthetic patient profile metadata.");
assert(engine.CASES.some((demoCase) => demoCase.id === "respiratory-low-spo2-early-handoff"), "Respiratory handoff case should be wired into the runtime.");
assert(engine.CASES.some((demoCase) => demoCase.id === "demo-tachycardia-live-001"), "Tachycardia live case should be wired into the runtime.");
assert(contract.expectedTotal === 7, "Contract API should expose the tachycardia expected_total denominator.");
assert(contract.questionSequence.some((question) => question.id === "tachy-post-vital-heart-rate-cue"), "Contract API should include the post-vital HR cue question.");
assert(packageJson.scripts["render:start"] === "node scripts/mock-api-server.js", "Render start script should launch the API server, not the static frontend.");
assert(packageJson.scripts["render:build"].includes("npm test"), "Render build script should run contract tests before deploy.");
assert(mockApiServer.includes('req.method === "GET" && req.url === "/healthz"'), "Render API server should expose GET /healthz for HTTP health checks.");
assert(mockApiServer.includes("process.env.PORT"), "Render API server should bind to the PORT environment variable.");
assert(engine.CASES.every((demoCase) => !demoCase.questionLimit || demoCase.questionLimit <= 7), "June demo cases should keep visible questions under 8.");
assert(!html.includes("<textarea"), "Demo runtime should stay choice-only and not expose free-text input.");
assert(engine.QUESTION_BANK.every((question) => question.type !== "text"), "Question bank should not include free-text questions.");
assert(engine.VERSION.boundary.includes("not diagnosis"), "Safety boundary must reject diagnosis claims.");

const vercelConfig = JSON.parse(read("vercel.json"));
assert(vercelConfig.outputDirectory === "dist", "Vercel should deploy only the sanitized dist directory.");

const serializedDemo = [html, script, read("core/triage_engine/index.js")].join("\n");
const forbiddenTerms = [
  "\u6ccc\u5c3f",
  "\u9810\u8a3a",
  "\u5c3f\u5c3f",
  "\u91ab\u5e2b",
  "\u75c5\u4eba",
  "\u8b77\u7406",
  ["Uro", "Previsit"].join("")
];
for (const term of forbiddenTerms) {
  assert(!serializedDemo.includes(term), `Demo runtime still contains urology/source-language term: ${term}`);
}

const expertForbiddenPhrases = [
  "plan_support",
  "AI diagnosis",
  "ESI level",
  "emergency severity",
  "likely pneumonia",
  "likely sepsis",
  "needs emergency treatment",
  "needs emergency care",
  "safe to go home",
  "safe to wait",
  "FDA-cleared",
  "FDA-ready",
  "510(k)-cleared",
  "510(k)-ready",
  "predicate-equivalent",
  "clinical-grade triage"
];
const runtimeAndApiExamples = [
  serializedDemo,
  ...fs.readdirSync(path.join(ROOT, "demo/fixtures")).filter((file) => file.endsWith(".json")).map((file) => read(path.join("demo/fixtures", file))),
  ...fs.readdirSync(path.join(ROOT, "handoff/api-examples")).filter((file) => file.endsWith(".json")).map((file) => read(path.join("handoff/api-examples", file)))
].join("\n");
for (const phrase of expertForbiddenPhrases) {
  assert(!runtimeAndApiExamples.includes(phrase), `Runtime/API examples contain expert-forbidden phrase: ${phrase}`);
}

console.log("AI triage kiosk demo smoke check passed.");
