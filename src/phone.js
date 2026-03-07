import { PHONE_RULES } from "../rules/index.js";

export function normalizePhone(raw) {
  if (!raw) return null;

  const context = {};
  const rules = PHONE_RULES["*"] || [];

  const normalized = rules.reduce((val, rule) => rule(val, context), raw);

  if (context.error) {
    return { input: raw, error: context.error, normalized: null };
  }

  return {
    input: raw,
    normalized,
    country: context.country || "UNKNOWN",
    type: context.type || "unknown",
    rules_applied: rules.map((r) => r.name),
  };
}
