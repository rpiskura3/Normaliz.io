import { validateEmail } from "../src/validators/email.js";
import { authenticate }  from "./_auth.js";

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

  res.setHeader("X-RateLimit-Remaining", auth.remaining);
  res.setHeader("X-RateLimit-Plan",      auth.plan);

  // ── Validate ──────────────────────────────────────────────────────────────
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error:   "EMPTY_REQUEST",
        message: "Provide at least one of: email",
      });
    }

    const response = {
      _meta: {
        endpoint:  "/v1/validate",
        version:   "1",
        plan:      auth.plan,
        remaining: auth.remaining,
      },
    };

    if (email) {
      response.email = validateEmail(email);
    }

    return res.status(200).json(response);

  } catch (err) {
    console.error("validate error:", err.message);
    return res.status(400).json({
      error:   "INVALID_REQUEST",
      message: err.message,
    });
  }
}
