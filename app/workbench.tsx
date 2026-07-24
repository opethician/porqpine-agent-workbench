"use client";

import {
  FormEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

const OFFER_URL =
  "https://www.freelancer.com/service/ai_chatbot_development/build-a-custom-ai-chatbot-or-nn-automation";

const triggerOptions = [
  { value: "manual", label: "Manual request" },
  { value: "schedule", label: "On a schedule" },
  { value: "form", label: "Form submitted" },
  { value: "new-record", label: "New record" },
  { value: "inbound-message", label: "Message received" },
  { value: "webhook", label: "Webhook / event" },
] as const;

const appOptions = [
  { value: "website", label: "Website" },
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
  { value: "google-sheets", label: "Google Sheets" },
  { value: "notion", label: "Notion" },
  { value: "crm", label: "CRM" },
  { value: "n8n", label: "n8n" },
  { value: "custom-api", label: "Other API" },
] as const;

const sensitivityOptions = [
  {
    value: "demo",
    label: "Demo only",
    description: "Synthetic or public examples",
  },
  {
    value: "internal",
    label: "Internal",
    description: "Ordinary business information",
  },
  {
    value: "personal",
    label: "Personal",
    description: "Customer or personal data",
  },
  {
    value: "restricted",
    label: "Restricted",
    description: "Regulated or highly sensitive",
  },
] as const;

const deploymentOptions = [
  { value: "handoff", label: "Code + setup handoff" },
  { value: "client-cloud", label: "My cloud / app accounts" },
  { value: "local", label: "Local or self-hosted" },
  { value: "recommend", label: "Recommend an approach" },
] as const;

type BriefResponse = {
  implementationBrief: {
    title: string;
    objective: string;
    workflow: Array<{ stage: string; detail: string }>;
    inScope: string[];
    outOfScope: string[];
  };
  complexity: {
    band: string;
    score: number;
    explanation: string;
    offerFit: string;
  };
  risks: string[];
  assumptions: string[];
  nextSteps: string[];
  privacyNote: string;
  method: string;
};

type Issue = {
  field: string;
  message: string;
};

function ArrowIcon() {
  return (
    <span aria-hidden="true" className="arrow-icon">
      ↗
    </span>
  );
}

function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <p className="section-label">
      <span>{index}</span>
      {children}
    </p>
  );
}

export function Workbench() {
  const goalId = useId();
  const triggerId = useId();
  const deploymentId = useId();
  const resultRef = useRef<HTMLElement>(null);
  const [goal, setGoal] = useState(
    "Turn qualified website enquiries into a clear follow-up task",
  );
  const [trigger, setTrigger] = useState("form");
  const [apps, setApps] = useState<string[]>(["website", "email"]);
  const [sensitivity, setSensitivity] = useState("internal");
  const [deployment, setDeployment] = useState("handoff");
  const [result, setResult] = useState<BriefResponse | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const triggerLabel =
    triggerOptions.find((option) => option.value === trigger)?.label ??
    "Choose a trigger";
  const deploymentLabel =
    deploymentOptions.find((option) => option.value === deployment)?.label ??
    "Choose delivery";
  const selectedAppLabels = useMemo(
    () =>
      apps.map(
        (app) =>
          appOptions.find((option) => option.value === app)?.label ?? app,
      ),
    [apps],
  );

  const workflowSummary = `${triggerLabel}. Route through ${
    selectedAppLabels.length
      ? selectedAppLabels.join(" and ")
      : "at least one selected app"
  }. Deliver as ${deploymentLabel}.`;

  function toggleApp(app: string) {
    setApps((current) =>
      current.includes(app)
        ? current.filter((item) => item !== app)
        : [...current, app],
    );
    setResult(null);
    setIssues([]);
    setStatus("idle");
  }

  async function submitBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIssues([]);
    setStatus("loading");

    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          trigger,
          apps,
          dataSensitivity: sensitivity,
          deployment,
        }),
      });
      const payload = (await response.json()) as
        | BriefResponse
        | { error?: string; issues?: Issue[] };

      if (!response.ok) {
        const nextIssues =
          "issues" in payload && payload.issues?.length
            ? payload.issues
            : [
                {
                  field: "form",
                  message:
                    ("error" in payload && payload.error) ||
                    "The brief could not be generated.",
                },
              ];
        setIssues(nextIssues);
        setStatus("error");
        return;
      }

      setResult(payload as BriefResponse);
      setStatus("success");
      window.setTimeout(() => resultRef.current?.focus(), 0);
    } catch {
      setIssues([
        {
          field: "form",
          message: "The workbench is unavailable. Please try again.",
        },
      ]);
      setStatus("error");
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="porQpine home">
          <span className="brand-mark" aria-hidden="true">
            pQ
          </span>
          <span className="brand-word">porQpine</span>
          <span className="brand-product">Agent Workbench</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#scope">Scope</a>
          <a href="#workbench">Workbench</a>
          <a href="#boundaries">Boundaries</a>
        </nav>
        <a
          className="header-cta"
          href={OFFER_URL}
          target="_blank"
          rel="noreferrer"
        >
          View $10 offer
          <ArrowIcon />
        </a>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="pulse-dot" aria-hidden="true" />
              Chatbot + n8n automation
              <span className="eyebrow-code">SERVICE / 01</span>
            </div>
            <h1 id="hero-title">
              Make your automation idea
              <span> buildable.</span>
            </h1>
            <p className="hero-lede">
              Map the trigger, tools, privacy level, and handoff before anyone
              builds. You will get a deterministic implementation brief you can
              take straight to the real porQpine Freelancer offer.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#workbench">
                Build my workflow brief
                <span aria-hidden="true">↓</span>
              </a>
              <a
                className="button button-secondary"
                href={OFFER_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open on Freelancer
                <ArrowIcon />
              </a>
            </div>
            <ul className="hero-proof" aria-label="Service principles">
              <li>Clear scope</li>
              <li>No inflated claims</li>
              <li>No form data retained</li>
            </ul>
          </div>

          <aside className="offer-card" aria-label="$10 starter offer">
            <div className="offer-card-top">
              <p>Starter offer</p>
              <span>Available on Freelancer</span>
            </div>
            <div className="price-lockup">
              <span className="currency">$</span>
              <strong>10</strong>
              <span className="price-note">starting scope</span>
            </div>
            <div className="terminal-line">
              <span>request</span>
              <code>chatbot_or_automation</code>
            </div>
            <div className="terminal-line">
              <span>output</span>
              <code>scoped_build</code>
            </div>
            <div className="terminal-line">
              <span>terms</span>
              <code>confirmed_before_start</code>
            </div>
            <p className="offer-caveat">
              $10 is the starter service price, not a promise that every
              integration fits that scope. Complexity, access, and paid tools
              are confirmed on Freelancer before work begins.
            </p>
            <a
              className="offer-link"
              href={OFFER_URL}
              target="_blank"
              rel="noreferrer"
            >
              See the actual listing
              <ArrowIcon />
            </a>
          </aside>
        </section>

        <section className="signal-strip" aria-label="What this site does">
          <span>IDEA</span>
          <i aria-hidden="true">→</i>
          <span>CONSTRAINTS</span>
          <i aria-hidden="true">→</i>
          <span>WORKFLOW MAP</span>
          <i aria-hidden="true">→</i>
          <span>BUILD BRIEF</span>
        </section>

        <section className="scope-section" id="scope">
          <div className="section-heading">
            <div>
              <SectionLabel index="01">Service scope</SectionLabel>
              <h2>Small, useful systems—properly defined.</h2>
            </div>
            <p>
              The workbench helps test whether an idea resembles a focused
              starter task or needs deeper discovery. Final inclusions are
              agreed through the Freelancer order.
            </p>
          </div>

          <div className="scope-grid">
            <article className="scope-card">
              <span className="scope-index">A</span>
              <div className="scope-icon" aria-hidden="true">
                [···]
              </div>
              <h3>Chatbot starter</h3>
              <p>
                Define the job, conversation entry point, source information,
                fallback behavior, and handoff.
              </p>
              <ul>
                <li>Focused use case</li>
                <li>Clear response boundaries</li>
                <li>Testable success condition</li>
              </ul>
            </article>

            <article className="scope-card scope-card-accent">
              <span className="scope-index">B</span>
              <div className="scope-icon" aria-hidden="true">
                {"{→}"}
              </div>
              <h3>n8n automation</h3>
              <p>
                Shape one primary trigger-to-action flow, including app
                connections, checks, and error visibility.
              </p>
              <ul>
                <li>Trigger and action map</li>
                <li>Data handling notes</li>
                <li>Deployment direction</li>
              </ul>
            </article>

            <article className="scope-card">
              <span className="scope-index">C</span>
              <div className="scope-icon" aria-hidden="true">
                &lt;/&gt;
              </div>
              <h3>Practical handoff</h3>
              <p>
                Leave with an agreed scope and the information needed to test,
                operate, or extend the starter build.
              </p>
              <ul>
                <li>Assumptions surfaced</li>
                <li>Risks called out</li>
                <li>Next step made explicit</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="workbench-section" id="workbench">
          <div className="section-heading workbench-heading">
            <div>
              <SectionLabel index="02">Interactive workbench</SectionLabel>
              <h2>Draft the system before the system drafts your budget.</h2>
            </div>
            <p>
              Use placeholders only. This tool calls a local deterministic
              endpoint—no external AI, account connection, file upload, or
              database.
            </p>
          </div>

          <div className="workbench-shell">
            <form className="brief-form" onSubmit={submitBrief} noValidate>
              <div className="panel-bar">
                <span>workflow.input</span>
                <span className="panel-state">
                  <i aria-hidden="true" />
                  transient
                </span>
              </div>

              <div className="field-block">
                <div className="field-heading">
                  <label htmlFor={goalId}>What should happen?</label>
                  <span>{goal.length}/600</span>
                </div>
                <textarea
                  id={goalId}
                  name="goal"
                  rows={3}
                  minLength={15}
                  maxLength={600}
                  value={goal}
                  aria-describedby={`${goalId}-hint`}
                  aria-invalid={issues.some((issue) => issue.field === "goal")}
                  onChange={(event) => {
                    setGoal(event.target.value);
                    setResult(null);
                    setIssues([]);
                    setStatus("idle");
                  }}
                />
                <p className="field-hint" id={`${goalId}-hint`}>
                  Describe the outcome, not credentials or real customer data.
                </p>
              </div>

              <div className="two-column-fields">
                <div className="field-block">
                  <label htmlFor={triggerId}>What starts it?</label>
                  <div className="select-wrap">
                    <select
                      id={triggerId}
                      name="trigger"
                      value={trigger}
                      onChange={(event) => {
                        setTrigger(event.target.value);
                        setResult(null);
                        setIssues([]);
                        setStatus("idle");
                      }}
                    >
                      {triggerOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-block">
                  <label htmlFor={deploymentId}>Where should it live?</label>
                  <div className="select-wrap">
                    <select
                      id={deploymentId}
                      name="deployment"
                      value={deployment}
                      onChange={(event) => {
                        setDeployment(event.target.value);
                        setResult(null);
                        setIssues([]);
                        setStatus("idle");
                      }}
                    >
                      {deploymentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <fieldset className="field-block">
                <legend>Which apps are involved?</legend>
                <div className="chip-grid">
                  {appOptions.map((app) => (
                    <label className="check-chip" key={app.value}>
                      <input
                        type="checkbox"
                        name="apps"
                        value={app.value}
                        checked={apps.includes(app.value)}
                        disabled={!apps.includes(app.value) && apps.length >= 5}
                        onChange={() => toggleApp(app.value)}
                      />
                      <span>{app.label}</span>
                    </label>
                  ))}
                </div>
                <p className="field-hint">Choose one to five connections.</p>
              </fieldset>

              <fieldset className="field-block">
                <legend>How sensitive is the data?</legend>
                <div className="sensitivity-grid">
                  {sensitivityOptions.map((option) => (
                    <label className="radio-card" key={option.value}>
                      <input
                        type="radio"
                        name="dataSensitivity"
                        value={option.value}
                        checked={sensitivity === option.value}
                        onChange={(event) => {
                          setSensitivity(event.target.value);
                          setResult(null);
                          setIssues([]);
                          setStatus("idle");
                        }}
                      />
                      <span className="radio-indicator" aria-hidden="true" />
                      <span>
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {issues.length > 0 && (
                <div className="form-errors" role="alert">
                  <strong>Check the brief:</strong>
                  <ul>
                    {issues.map((issue) => (
                      <li key={`${issue.field}-${issue.message}`}>
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="form-submit-row">
                <button
                  className="button button-primary submit-button"
                  type="submit"
                  disabled={status === "loading"}
                >
                  {status === "loading"
                    ? "Scoping workflow…"
                    : "Generate implementation brief"}
                  <span aria-hidden="true">→</span>
                </button>
                <p aria-live="polite" className="submit-status">
                  {status === "success"
                    ? "Brief ready below."
                    : "Nothing is saved after the response."}
                </p>
              </div>
            </form>

            <aside className="workflow-panel" aria-labelledby="workflow-title">
              <div className="panel-bar">
                <span id="workflow-title">workflow.map</span>
                <span>live preview</span>
              </div>

              <div
                className="workflow-canvas"
                role="img"
                aria-label={workflowSummary}
              >
                <div className="canvas-grid" aria-hidden="true" />
                <div className="workflow-node node-trigger">
                  <span>01 / TRIGGER</span>
                  <strong>{triggerLabel}</strong>
                  <small>Event enters the flow</small>
                </div>
                <div className="node-connector" aria-hidden="true">
                  <i />
                  <b>→</b>
                </div>
                <div className="workflow-node node-router">
                  <span>02 / ROUTE</span>
                  <strong>Validate + transform</strong>
                  <small>
                    {sensitivityOptions.find(
                      (option) => option.value === sensitivity,
                    )?.label ?? "Privacy"}{" "}
                    guardrails
                  </small>
                </div>
                <div className="node-connector" aria-hidden="true">
                  <i />
                  <b>→</b>
                </div>
                <div className="workflow-node node-action">
                  <span>03 / ACTION</span>
                  <strong>
                    {selectedAppLabels.length
                      ? selectedAppLabels.join(" + ")
                      : "Select an app"}
                  </strong>
                  <small>{deploymentLabel}</small>
                </div>
              </div>

              <div className="diagram-readout" aria-live="polite">
                <span>PATH</span>
                <p>{workflowSummary}</p>
              </div>

              <div className="goal-readout">
                <span>OUTCOME</span>
                <p>{goal.trim() || "Describe the outcome to complete the map."}</p>
              </div>
            </aside>
          </div>

          {result && (
            <section
              className="brief-result"
              ref={resultRef}
              tabIndex={-1}
              aria-labelledby="result-title"
            >
              <div className="result-header">
                <div>
                  <SectionLabel index="OUTPUT">Scoped brief</SectionLabel>
                  <h2 id="result-title">
                    {result.implementationBrief.title}
                  </h2>
                </div>
                <div className="complexity-badge">
                  <span>Complexity / {result.complexity.score}</span>
                  <strong>{result.complexity.band}</strong>
                </div>
              </div>

              <p className="result-objective">
                {result.implementationBrief.objective}
              </p>

              <div className="offer-fit">
                <span>STARTER OFFER FIT</span>
                <strong>{result.complexity.offerFit}</strong>
                <p>{result.complexity.explanation}</p>
              </div>

              <div className="result-grid">
                <article>
                  <h3>Implementation path</h3>
                  <ol className="implementation-path">
                    {result.implementationBrief.workflow.map((step) => (
                      <li key={step.stage}>
                        <span>{step.stage}</span>
                        <p>{step.detail}</p>
                      </li>
                    ))}
                  </ol>
                </article>

                <article>
                  <h3>In scope to discuss</h3>
                  <ul className="result-list positive-list">
                    {result.implementationBrief.inScope.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article>
                  <h3>Risks</h3>
                  <ul className="result-list risk-list">
                    {result.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article>
                  <h3>Assumptions</h3>
                  <ul className="result-list">
                    {result.assumptions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article>
                  <h3>Not included by default</h3>
                  <ul className="result-list muted-list">
                    {result.implementationBrief.outOfScope.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article>
                  <h3>Next steps</h3>
                  <ol className="next-steps">
                    {result.nextSteps.map((item, index) => (
                      <li key={item}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </article>
              </div>

              <div className="result-footer">
                <p>
                  <strong>Privacy note:</strong> {result.privacyNote}{" "}
                  {result.method}
                </p>
                <a
                  className="button button-primary"
                  href={OFFER_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Take this brief to Freelancer
                  <ArrowIcon />
                </a>
              </div>
            </section>
          )}
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <div className="section-heading">
            <div>
              <SectionLabel index="03">Working rhythm</SectionLabel>
              <h2 id="process-title">A direct path from message to handoff.</h2>
            </div>
          </div>
          <ol className="process-grid">
            <li>
              <span>01</span>
              <h3>Map</h3>
              <p>Describe one outcome, its trigger, apps, and constraints.</p>
            </li>
            <li>
              <span>02</span>
              <h3>Confirm</h3>
              <p>Share the brief on Freelancer and agree the exact starter scope.</p>
            </li>
            <li>
              <span>03</span>
              <h3>Build</h3>
              <p>Implement against the confirmed path and available app access.</p>
            </li>
            <li>
              <span>04</span>
              <h3>Handoff</h3>
              <p>Test the agreed flow and document the practical next step.</p>
            </li>
          </ol>
        </section>

        <section className="boundaries-section" id="boundaries">
          <div className="boundary-card privacy-card">
            <SectionLabel index="04">Privacy boundary</SectionLabel>
            <h2>Your secrets do not belong in a scoping form.</h2>
            <p>
              This workbench sends only the five brief fields to its own
              deterministic endpoint. It does not call an external AI service,
              store the request, connect an account, accept uploads, or ask for
              credentials.
            </p>
            <ul>
              <li>Use placeholders instead of names, emails, keys, or records.</li>
              <li>Share access only after scope is agreed, using the platform.</li>
              <li>Restricted data requires a separate security conversation.</li>
            </ul>
          </div>

          <div className="boundary-card exclusion-card">
            <SectionLabel index="05">Paid-service exclusions</SectionLabel>
            <h2>Third-party costs stay visible.</h2>
            <p>
              Unless explicitly included in the Freelancer order, the $10
              starter does not pay for or include:
            </p>
            <ul>
              <li>API usage, app subscriptions, or premium n8n nodes</li>
              <li>Hosting, domains, phone/SMS, email, or model usage fees</li>
              <li>Bulk data migration, regulated-data handling, or security audits</li>
              <li>Ongoing monitoring, maintenance, or additional workflows</li>
            </ul>
          </div>
        </section>

        <section className="final-cta" aria-labelledby="final-title">
          <span className="large-bracket" aria-hidden="true">
            [
          </span>
          <div>
            <p>One focused workflow. Clear constraints. Honest next step.</p>
            <h2 id="final-title">Ready to make the idea executable?</h2>
            <a
              className="button button-primary"
              href={OFFER_URL}
              target="_blank"
              rel="noreferrer"
            >
              View the $10 Freelancer offer
              <ArrowIcon />
            </a>
          </div>
          <span className="large-bracket" aria-hidden="true">
            ]
          </span>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            pQ
          </span>
          <span className="brand-word">porQpine</span>
        </a>
        <p>Agent Workbench · Honest scoping for chatbots and automation.</p>
        <a href="#top">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </footer>
    </>
  );
}
