import { EMAIL_RULES, EMAIL_CONFIDENCE } from "../rules/index.js";

export function normalizeEmail(raw) {
  if (!raw) return null;

  const atIdx = raw.lastIndexOf("@");
  if (atIdx === -1) return { input: raw, error: "missing @ symbol", confidence: 0 };

  const inputDomain = raw.slice(atIdx + 1).toLowerCase();
  const context = {
    domain:      inputDomain,
    isAlias:     raw.includes("+"),
    corrections: [],
  };

  // Build rule chain: universal rules + domain-specific rules
  const universalRules = EMAIL_RULES["*"] || [];

  // Run universal rules first so fuzzy corrections fire before domain lookup
  let canonical = universalRules.reduce((val, rule) => rule(val, context), raw);

  // Re-derive domain after universal rules (fuzzy may have corrected it)
  const correctedDomain = canonical.split("@")[1] || inputDomain;

  // Now run domain-specific rules against the corrected domain
  const domainRules = EMAIL_RULES[correctedDomain] || [];
  canonical = domainRules.reduce((val, rule) => rule(val, context), canonical);

  const finalDomain = canonical.split("@")[1] || correctedDomain;

  // ── Confidence calculation ─────────────────────────────────────────────────
  // Start from domain baseline, then multiply by each correction's weight.
  // More fuzzy corrections applied = lower overall confidence.
  const baseConfidence = EMAIL_CONFIDENCE[finalDomain] ?? EMAIL_CONFIDENCE["*"];
  const confidence = context.corrections.reduce(
    (score, correction) => score * correction.weight,
    baseConfidence
  );

  return {
    input:         raw,
    canonical,
    domain:        finalDomain,
    is_alias:      context.isAlias,
    confidence:    Math.round(confidence * 1000) / 1000,
    corrections:   context.corrections,
    rules_applied: [...universalRules, ...domainRules].map((r) => r.name),
  };
}
