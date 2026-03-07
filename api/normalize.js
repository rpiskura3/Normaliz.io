import { normalizeEmail }  from "../src/normalizers/email.js";
import { normalizePhone }  from "../src/normalizers/phone.js";
import { normalizeHandle } from "../src/normalizers/handle.js";

export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, phone, handles } = req.body;
    const response = {};

    if (email) {
      const result = normalizeEmail(email);
      response.email = {
        canonical:   result.canonical,
        confidence:  result.confidence,
        is_alias:    result.is_alias,
        domain:      result.domain,
        ...(result.corrections?.length > 0 && {
          corrections: result.corrections.map(c => ({ rule: c.rule, from: c.from, to: c.to })),
        }),
      };
    }

    if (phone) {
      const result = normalizePhone(phone);
      response.phone = result.normalized
        ? { normalized: result.normalized, country: result.country, type: result.type, confidence: 1.0 }
        : { error: result.error, confidence: 0 };
    }

    if (handles) {
      response.handles = {};
      for (const [platform, handle] of Object.entries(handles)) {
        const result = normalizeHandle(platform, handle);
        response.handles[platform] = { canonical: result.canonical };
      }
    }

    return res.status(200).json(response);
  } catch (err) {
    return res.status(400).json({ error: "Invalid request body", details: err.message });
  }
}
