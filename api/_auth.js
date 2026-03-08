import { verifyKey } from "@unkey/api";

// Tier limits (matches what you configure in Unkey dashboard)
const PLAN_LIMITS = {
  free:   5_000,
  growth: 500_000,
  scale:  5_000_000,
};

/**
 * Verifies an API key via Unkey and enforces rate limits.
 *
 * Returns:
 *   { ok: true,  ownerId, plan, remaining }  — key is valid, proceed
 *   { ok: false, status, body }              — send this response immediately
 */
export async function authenticate(req) {
  // ── 1. Extract key from Authorization header ─────────────────────────────
  const authHeader = req.headers["authorization"] || "";
  const apiKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      body: {
        error:   "MISSING_API_KEY",
        message: "Include your API key as: Authorization: Bearer <key>",
        docs:    "https://normaliz.io/docs/authentication",
      },
    };
  }

  // ── 2. Verify with Unkey ─────────────────────────────────────────────────
  let result, unkeyError;
  try {
    const response = await verifyKey({
      apiId: process.env.UNKEY_API_ID,
      key:   apiKey,
    });
    result      = response.result;
    unkeyError  = response.error;
  } catch (err) {
    // Unkey is unreachable — fail open or closed depending on your risk tolerance.
    // Failing closed (block the request) is safer for a paid product.
    console.error("Unkey verification failed:", err.message);
    return {
      ok: false,
      status: 503,
      body: {
        error:   "AUTH_SERVICE_UNAVAILABLE",
        message: "Authentication service temporarily unavailable. Please retry.",
      },
    };
  }

  // ── 3. Handle Unkey errors ───────────────────────────────────────────────
  if (unkeyError) {
    return {
      ok: false,
      status: 401,
      body: {
        error:   "AUTH_ERROR",
        message: unkeyError.message,
      },
    };
  }

  // ── 4. Invalid key ───────────────────────────────────────────────────────
  if (!result.valid) {
    return {
      ok: false,
      status: 401,
      body: {
        error:   "INVALID_API_KEY",
        message: "API key is invalid, expired, or has been revoked.",
        docs:    "https://normaliz.io/dashboard",
      },
    };
  }

  // ── 5. Rate limit exceeded ───────────────────────────────────────────────
  if (result.remaining === 0) {
    const plan = result.meta?.plan || "free";
    return {
      ok: false,
      status: 429,
      body: {
        error:     "RATE_LIMIT_EXCEEDED",
        message:   `Monthly limit of ${PLAN_LIMITS[plan]?.toLocaleString() ?? "N/A"} calls reached.`,
        plan,
        reset_at:  result.reset,
        upgrade:   "https://normaliz.io/pricing",
      },
    };
  }

  // ── 6. All good ──────────────────────────────────────────────────────────
  return {
    ok:        true,
    ownerId:   result.ownerId,
    plan:      result.meta?.plan || "free",
    remaining: result.remaining,
    keyId:     result.keyId,
  };
}
