import {
  buildImplementationBrief,
  validateBriefInput,
} from "../../../lib/brief";

const MAX_BODY_BYTES = 12_000;

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json(
      {
        error: "Brief request is too large.",
        issues: [
          {
            field: "form",
            message: "Keep the brief under 12 KB and do not include files.",
          },
        ],
      },
      413,
    );
  }

  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  ) {
    return json(
      {
        error: "Expected JSON.",
        issues: [
          {
            field: "form",
            message: "Send the brief as application/json.",
          },
        ],
      },
      415,
    );
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json(
      {
        error: "Brief request is too large.",
        issues: [
          {
            field: "form",
            message: "Keep the brief under 12 KB and do not include files.",
          },
        ],
      },
      413,
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json(
      {
        error: "Invalid JSON.",
        issues: [
          {
            field: "form",
            message: "The brief contains invalid JSON.",
          },
        ],
      },
      400,
    );
  }

  const validation = validateBriefInput(payload);
  if (!validation.ok) {
    return json(
      {
        error: "Invalid brief request.",
        issues: validation.issues,
      },
      400,
    );
  }

  return json(buildImplementationBrief(validation.value));
}
