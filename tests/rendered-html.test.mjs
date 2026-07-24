import assert from "node:assert/strict";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

const environment = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const context = {
  waitUntil() {},
  passThroughOnException() {},
};

test("server-renders the finished workbench", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    environment,
    context,
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);

  const html = await response.text();
  assert.match(html, /porQpine Agent Workbench/);
  assert.match(html, /Build my workflow brief/);
  assert.match(html, /Which apps are involved/);
  assert.match(html, /No form data retained/);
  assert.match(html, /freelancer\.com\/service\/ai_chatbot_development/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("built POST endpoint returns a deterministic scoped brief", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/brief", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        goal: "Turn qualified website enquiries into a clear follow-up task",
        trigger: "form",
        apps: ["website", "email"],
        dataSensitivity: "internal",
        deployment: "handoff",
      }),
    }),
    environment,
    context,
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const payload = await response.json();
  assert.equal(payload.complexity.band, "Starter fit");
  assert.equal(payload.complexity.offerFit, "Aligned with the $10 starter");
  assert.match(payload.implementationBrief.title, /Form submission/);
  assert.equal(payload.implementationBrief.workflow.length, 4);
  assert.match(payload.method, /no external AI or API/i);
});

test("built POST endpoint rejects malformed requests", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/brief", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        goal: "too short",
        trigger: "unknown",
        apps: [],
        dataSensitivity: "internal",
        deployment: "handoff",
      }),
    }),
    environment,
    context,
  );

  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.equal(payload.error, "Invalid brief request.");
  assert.ok(payload.issues.length >= 3);
});

test("built POST endpoint enforces media type and body limits", async () => {
  const worker = await loadWorker();
  const unsupported = await worker.fetch(
    new Request("http://localhost/api/brief", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "{}",
    }),
    environment,
    context,
  );
  assert.equal(unsupported.status, 415);

  const oversized = await worker.fetch(
    new Request("http://localhost/api/brief", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: `"${"x".repeat(12_001)}"`,
    }),
    environment,
    context,
  );
  assert.equal(oversized.status, 413);
});
