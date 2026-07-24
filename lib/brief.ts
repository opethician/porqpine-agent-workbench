export const TRIGGERS = {
  manual: "Manual request",
  schedule: "Scheduled event",
  form: "Form submission",
  "new-record": "New record",
  "inbound-message": "Inbound message",
  webhook: "Webhook event",
} as const;

export const APPS = {
  website: "Website",
  email: "Email",
  slack: "Slack",
  "google-sheets": "Google Sheets",
  notion: "Notion",
  crm: "CRM",
  n8n: "n8n",
  "custom-api": "Other API",
} as const;

export const DATA_SENSITIVITY = {
  demo: "Demo-only data",
  internal: "Internal business data",
  personal: "Personal or customer data",
  restricted: "Restricted or regulated data",
} as const;

export const DEPLOYMENTS = {
  handoff: "code and setup handoff",
  "client-cloud": "the client’s cloud or app accounts",
  local: "a local or self-hosted environment",
  recommend: "a deployment approach selected after discovery",
} as const;

export type Trigger = keyof typeof TRIGGERS;
export type App = keyof typeof APPS;
export type DataSensitivity = keyof typeof DATA_SENSITIVITY;
export type Deployment = keyof typeof DEPLOYMENTS;

export type BriefInput = {
  goal: string;
  trigger: Trigger;
  apps: App[];
  dataSensitivity: DataSensitivity;
  deployment: Deployment;
};

export type ValidationIssue = {
  field: keyof BriefInput | "form";
  message: string;
};

type ValidationResult =
  | { ok: true; value: BriefInput }
  | { ok: false; issues: ValidationIssue[] };

const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /\bsk-(?:proj-)?[a-z0-9_-]{12,}\b/i,
  /\b(?:api[_ -]?key|password|secret|access[_ -]?token)\s*[:=]\s*\S{8,}/i,
  /\bbearer\s+[a-z0-9._~+/=-]{16,}/i,
];

const COMPLEXITY_TERMS =
  /\b(?:approval|branch|multiple|multi-step|document|payment|scrape|voice|ocr|multi-agent|real-time)\b/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function hasOwn<T extends object>(object: T, key: PropertyKey): key is keyof T {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function normalizeGoal(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function joinLabels(labels: string[]) {
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

export function validateBriefInput(payload: unknown): ValidationResult {
  if (!isPlainObject(payload)) {
    return {
      ok: false,
      issues: [
        {
          field: "form",
          message: "Send the brief as a JSON object.",
        },
      ],
    };
  }

  const issues: ValidationIssue[] = [];
  const goal =
    typeof payload.goal === "string" ? normalizeGoal(payload.goal) : "";

  if (!goal) {
    issues.push({ field: "goal", message: "Describe the intended outcome." });
  } else if (goal.length < 15) {
    issues.push({
      field: "goal",
      message: "Describe the outcome in at least 15 characters.",
    });
  } else if (goal.length > 600) {
    issues.push({
      field: "goal",
      message: "Keep the outcome to 600 characters or fewer.",
    });
  } else if (SECRET_PATTERNS.some((pattern) => pattern.test(goal))) {
    issues.push({
      field: "goal",
      message:
        "Remove credentials or secret values and use a placeholder instead.",
    });
  }

  const trigger =
    typeof payload.trigger === "string" && hasOwn(TRIGGERS, payload.trigger)
      ? (payload.trigger as Trigger)
      : null;
  if (!trigger) {
    issues.push({
      field: "trigger",
      message: "Choose a supported workflow trigger.",
    });
  }

  const rawApps = Array.isArray(payload.apps) ? payload.apps : [];
  const validApps = rawApps.filter(
    (app): app is App => typeof app === "string" && hasOwn(APPS, app),
  );
  const uniqueApps = [...new Set(validApps)];
  if (rawApps.length === 0) {
    issues.push({
      field: "apps",
      message: "Choose at least one app or connection.",
    });
  } else if (rawApps.length > 5) {
    issues.push({
      field: "apps",
      message: "Choose no more than five apps for one scoped workflow.",
    });
  } else if (validApps.length !== rawApps.length) {
    issues.push({
      field: "apps",
      message: "One or more selected apps are not supported.",
    });
  } else if (uniqueApps.length !== rawApps.length) {
    issues.push({
      field: "apps",
      message: "Choose each app only once.",
    });
  }

  const dataSensitivity =
    typeof payload.dataSensitivity === "string" &&
    hasOwn(DATA_SENSITIVITY, payload.dataSensitivity)
      ? (payload.dataSensitivity as DataSensitivity)
      : null;
  if (!dataSensitivity) {
    issues.push({
      field: "dataSensitivity",
      message: "Choose a data sensitivity level.",
    });
  }

  const deployment =
    typeof payload.deployment === "string" &&
    hasOwn(DEPLOYMENTS, payload.deployment)
      ? (payload.deployment as Deployment)
      : null;
  if (!deployment) {
    issues.push({
      field: "deployment",
      message: "Choose a deployment preference.",
    });
  }

  if (issues.length || !trigger || !dataSensitivity || !deployment) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      goal,
      trigger,
      apps: uniqueApps,
      dataSensitivity,
      deployment,
    },
  };
}

function calculateComplexity(input: BriefInput) {
  let score = 1;
  const reasons: string[] = [];

  if (input.apps.length >= 3) {
    score += 1;
    reasons.push("multiple app connections");
  }
  if (input.apps.length === 5) {
    score += 1;
    reasons.push("the maximum connection count");
  }
  if (input.trigger === "webhook" || input.trigger === "inbound-message") {
    score += 1;
    reasons.push("an event-driven trigger");
  }
  if (input.apps.includes("crm")) {
    score += 1;
    reasons.push("CRM field and permission mapping");
  }
  if (input.apps.includes("custom-api")) {
    score += 2;
    reasons.push("an API that needs separate capability checks");
  }
  if (input.dataSensitivity === "personal") {
    score += 2;
    reasons.push("personal-data safeguards");
  }
  if (input.dataSensitivity === "restricted") {
    score += 4;
    reasons.push("restricted-data controls");
  }
  if (input.deployment === "client-cloud" || input.deployment === "local") {
    score += 1;
    reasons.push("environment-specific deployment");
  }
  if (COMPLEXITY_TERMS.test(input.goal)) {
    score += 1;
    reasons.push("multi-step behavior in the stated outcome");
  }

  if (score <= 3) {
    return {
      score,
      band: "Starter fit",
      offerFit: "Aligned with the $10 starter",
      explanation:
        reasons.length > 0
          ? `The shape is focused, with ${joinLabels(reasons)} to confirm before work starts.`
          : "The shape is focused: one outcome, a small connection set, and no advanced data constraints.",
    };
  }

  if (score <= 6) {
    return {
      score,
      band: "Configured build",
      offerFit: "Needs scope confirmation",
      explanation: `The workflow adds ${joinLabels(reasons)}. The $10 offer can start the conversation, but the final scope or price must be confirmed on Freelancer.`,
    };
  }

  return {
    score,
    band: "Discovery-first",
    offerFit: "Likely beyond the $10 starter",
    explanation: `The workflow includes ${joinLabels(reasons)}. A discovery step and custom scope are more responsible than treating this as a basic starter build.`,
  };
}

export function buildImplementationBrief(input: BriefInput) {
  const triggerLabel = TRIGGERS[input.trigger];
  const appLabels = input.apps.map((app) => APPS[app]);
  const appsText = joinLabels(appLabels);
  const deploymentText = DEPLOYMENTS[input.deployment];
  const sensitivityText = DATA_SENSITIVITY[input.dataSensitivity];
  const complexity = calculateComplexity(input);

  const risks = [
    "App permissions, API limits, and account-plan restrictions must be checked before implementation.",
  ];

  if (input.trigger === "webhook" || input.trigger === "inbound-message") {
    risks.push(
      "Event-driven flows need duplicate-event handling, authentication, and a visible failure path.",
    );
  }
  if (input.apps.includes("custom-api")) {
    risks.push(
      "The external API may require paid access, approval, or documentation that is not yet available.",
    );
  }
  if (input.dataSensitivity === "personal") {
    risks.push(
      "Personal data should be minimized, access-controlled, and tested with synthetic examples first.",
    );
  }
  if (input.dataSensitivity === "restricted") {
    risks.push(
      "Restricted data needs a separate security and compliance review before any real records are used.",
    );
  }
  if (input.deployment === "local") {
    risks.push(
      "Self-hosting makes runtime security, backups, uptime, and updates the client’s responsibility after handoff.",
    );
  }

  const assumptions = [
    "This is one primary trigger-to-outcome workflow, not a multi-workflow platform.",
    "The required app accounts already exist and can provide appropriate test access after scope approval.",
    "Sample data will use placeholders or synthetic records; no credentials are entered in this workbench.",
    "Third-party subscriptions, usage fees, hosting, and domains are paid by the client unless the order says otherwise.",
  ];

  if (input.dataSensitivity === "restricted") {
    assumptions.push(
      "No restricted data will be processed until security responsibilities are documented and approved.",
    );
  }

  return {
    implementationBrief: {
      title: `${triggerLabel} → ${appsText}`,
      objective: input.goal,
      workflow: [
        {
          stage: "Trigger",
          detail: `${triggerLabel} starts the workflow and creates one traceable run.`,
        },
        {
          stage: "Guard",
          detail: `Validate the incoming fields and apply controls appropriate for ${sensitivityText.toLowerCase()}.`,
        },
        {
          stage: "Route",
          detail: `Transform only the needed data and pass it through ${appsText}.`,
        },
        {
          stage: "Deliver",
          detail: `Return a clear success or failure state, prepared for ${deploymentText}.`,
        },
      ],
      inScope: [
        `One ${triggerLabel.toLowerCase()} trigger mapped to one primary outcome.`,
        `Connection plan for ${appsText}.`,
        `Input checks, a basic failure path, and ${sensitivityText.toLowerCase()} handling notes.`,
        `A practical ${deploymentText} plan and test checklist.`,
      ],
      outOfScope: [
        "Paid APIs, app plans, hosting, domains, phone/SMS, email, or model usage charges.",
        "Production credentials, file uploads, bulk data migration, or storage supplied through this workbench.",
        "Security audits, legal or compliance certification, and regulated-data approval.",
        "Ongoing monitoring, maintenance, additional workflows, or integrations not confirmed in the order.",
      ],
    },
    complexity,
    risks,
    assumptions,
    nextSteps: [
      "Replace any real names, records, or credentials with safe placeholders.",
      "Define one observable success condition and one failure condition.",
      "Confirm app access, API availability, hosting ownership, and third-party costs.",
      "Send this brief through the porQpine Freelancer listing to confirm the exact deliverable, price, and timing before work begins.",
    ],
    privacyNote:
      "The endpoint evaluates this request in memory and returns the result without login, upload, or persistence.",
    method:
      "The response is produced by fixed validation and scoring rules; no external AI or API is called.",
  };
}
