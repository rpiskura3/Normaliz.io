import { normalizeEmail }  from "../src/normalizers/email.js";
import { normalizePhone }  from "../src/normalizers/phone.js";
import { normalizeHandle } from "../src/normalizers/handle.js";
import { authenticate }    from "./_auth.js";

export default async function handler(req, res) {

  // ── CORS ──────────────────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  // ── Auth ──────────────────────────────────────────────────────────────────
  const auth = await authenticate(req);
  if (!auth.ok) return res.status(auth.status).json(auth.body);

  // Expose usage headers so clients can monitor their own limits
  res.setHeader("X-RateLimit-Remaining", auth.remaining);
  res.setHeader("X-RateLimit-Plan",      auth.plan);

  // ── Normalize ─────────────────────────────────────────────────────────────
  try {
    const { email, phone, handles } = req.body;

    if (!email && !phone && !handles) {
      return res.status(400).json({
        error:   "EMPTY_REQUEST",
        message: "Provide at least one of: email, phone, handles",
      });
    }

    const response = {
      _meta: {
        endpoint:  "/v1/normalize",
        version:   "1",
        plan:      auth.plan,
        remaining: auth.remaining,
      },
    };

    if (email) {
      const r = normalizeEmail(email);
      response.email = {
        canonical:  r.canonical,
        confidence: r.confidence,
        domain:     r.domain,
        is_alias:   r.is_alias,
        ...(r.corrections?.length > 0 && {
          corrections: r.corrections.map(c => ({
            rule: c.rule,
            from: c.from,
            to:   c.to,
          })),
        }),
      };
    }

    if (phone) {
      const r = normalizePhone(phone);
      response.phone = r.normalized
        ? { normalized: r.normalized, country: r.country, type: r.type, confidence: 1.0 }
        : { error: r.error, confidence: 0 };
    }

    if (handles) {
      response.handles = {};
      for (const [platform, handle] of Object.entries(handles)) {
        const r = normalizeHandle(platform, handle);
        response.handles[platform] = { canonical: r.canonical };
      }
    }

    return res.status(200).json(response);

  } catch (err) {
    console.error("normalize error:", err.message);
    return res.status(400).json({
      error:   "INVALID_REQUEST",
      message: err.message,
    });
  }
}
