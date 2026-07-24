import assert from "node:assert/strict";
import test from "node:test";
import {
  buildImplementationBrief,
  validateBriefInput,
} from "../lib/brief.ts";

const starterRequest = {
  goal: "  Turn qualified website enquiries   into a follow-up task  ",
  trigger: "form",
  apps: ["website", "email"],
  dataSensitivity: "internal",
  deployment: "handoff",
};

test("validates and normalizes a focused request", () => {
  const result = validateBriefInput(starterRequest);
  assert.equal(result.ok, true);
  assert.equal(
    result.value.goal,
    "Turn qualified website enquiries into a follow-up task",
  );
  assert.deepEqual(result.value.apps, ["website", "email"]);
});

test("rejects invalid values, duplicate apps, and likely secrets", () => {
  const result = validateBriefInput({
    goal: "Connect using api_key=abcdefghijk12345 and send the result",
    trigger: "anything",
    apps: ["email", "email"],
    dataSensitivity: "unknown",
    deployment: "somewhere",
  });

  assert.equal(result.ok, false);
  const fields = result.issues.map((issue) => issue.field);
  assert.ok(fields.includes("goal"));
  assert.ok(fields.includes("trigger"));
  assert.ok(fields.includes("apps"));
  assert.ok(fields.includes("dataSensitivity"));
  assert.ok(fields.includes("deployment"));
});

test("returns identical briefs for identical normalized input", () => {
  const validation = validateBriefInput(starterRequest);
  assert.equal(validation.ok, true);

  const first = buildImplementationBrief(validation.value);
  const second = buildImplementationBrief(validation.value);
  assert.deepEqual(first, second);
});

test("labels a simple workflow as a starter fit", () => {
  const validation = validateBriefInput(starterRequest);
  assert.equal(validation.ok, true);

  const brief = buildImplementationBrief(validation.value);
  assert.equal(brief.complexity.band, "Starter fit");
  assert.equal(brief.complexity.offerFit, "Aligned with the $10 starter");
  assert.match(brief.privacyNote, /without login, upload, or persistence/);
  assert.ok(
    brief.implementationBrief.outOfScope.some((item) =>
      /usage charges/i.test(item),
    ),
  );
});

test("routes restricted multi-integration work to discovery", () => {
  const validation = validateBriefInput({
    goal: "Run a real-time approval and document workflow for customer records",
    trigger: "webhook",
    apps: ["website", "crm", "custom-api", "n8n", "slack"],
    dataSensitivity: "restricted",
    deployment: "local",
  });
  assert.equal(validation.ok, true);

  const brief = buildImplementationBrief(validation.value);
  assert.equal(brief.complexity.band, "Discovery-first");
  assert.equal(brief.complexity.offerFit, "Likely beyond the $10 starter");
  assert.ok(brief.risks.some((risk) => /security and compliance/i.test(risk)));
  assert.ok(brief.assumptions.some((item) => /restricted data/i.test(item)));
});
