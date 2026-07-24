# porQpine Agent Workbench

A polished, single-page portfolio product for shaping a chatbot or n8n
automation idea into a clear implementation brief. The site points to the real
porQpine [$10 Freelancer service](https://www.freelancer.com/service/ai_chatbot_development/build-a-custom-ai-chatbot-or-nn-automation)
without implying that every project fits the starter price.

## What is included

- A responsive, keyboard-accessible service page with a dark technical visual
  system.
- An interactive brief builder for the workflow goal, trigger, apps, data
  sensitivity, and deployment preference.
- A live workflow diagram that updates as the form changes.
- A deterministic `POST /api/brief` endpoint with strict input validation.
- A structured response containing the implementation path, complexity band,
  offer fit, risks, assumptions, exclusions, and next steps.
- Unit and built-route integration tests.

## Privacy and cost boundaries

The brief endpoint evaluates a request in memory and returns a response. It has
no login, upload, database, analytics, external AI call, third-party API call,
or persistence. The UI tells visitors to use placeholders and the backend
rejects common credential patterns.

The $10 listing is presented as a starting scope. API usage, app subscriptions,
hosting, domains, model usage, regulated-data handling, ongoing maintenance,
and additional workflows are not represented as included by default.

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run build
npm test
npm run lint
```

No environment variables are required.

## API

`POST /api/brief` accepts `application/json`:

```json
{
  "goal": "Turn qualified website enquiries into a clear follow-up task",
  "trigger": "form",
  "apps": ["website", "email"],
  "dataSensitivity": "internal",
  "deployment": "handoff"
}
```

Supported values are intentionally bounded:

- `trigger`: `manual`, `schedule`, `form`, `new-record`,
  `inbound-message`, `webhook`
- `apps`: one to five of `website`, `email`, `slack`, `google-sheets`,
  `notion`, `crm`, `n8n`, `custom-api`
- `dataSensitivity`: `demo`, `internal`, `personal`, `restricted`
- `deployment`: `handoff`, `client-cloud`, `local`, `recommend`

Responses are deterministic for the same normalized input. The API sets
`Cache-Control: no-store` and does not log or save the request.

## Project shape

- `app/workbench.tsx` — interactive product UI
- `app/api/brief/route.ts` — HTTP boundary
- `lib/brief.ts` — validation, scoring, and brief generation
- `tests/` — deterministic logic and built-route integration checks
- `.openai/hosting.json` — explicitly declares no D1 or R2 resources

The app retains the Sites-compatible vinext and Cloudflare Worker build shape.
