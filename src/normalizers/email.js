import { EMAIL_RULES, EMAIL_CONFIDENCE } from "../rules/index.js";

export function normalizeEmail(raw) {
  if (!raw) return null;

  // Detect domain before any transformation
  const atIdx = raw.lastIndexOf("@");
  if (atIdx === -1) return { input: raw, error: "missing @ symbol", confidence: 0 };

  const inputDomain = raw.slice(atIdx + 1).toLowerCase();
  const context = { domain: inputDomain, isAlias: raw.includes("+") };

  // Build rule chain: universal rules + domain-specific rules
  const universalRules = EMAIL_RULES["*"] || [];
  const domainRules = EMAIL_RULES[inputDomain] || [];
  const rules = [...universalRules, ...domainRules];

  // Run chain — each rule receives current value + shared context
  const canonical = rules.reduce((val, rule) => rule(val, context), raw);

  // Re-derive final domain after all transformations (e.g. googlemail → gmail)
  const finalDomain = canonical.split("@")[1] || inputDomain;
  const confidence = EMAIL_CONFIDENCE[finalDomain] ?? EMAIL_CONFIDENCE["*"];

  return {
    input: raw,
    canonical,
    domain: finalDomain,
    is_alias: context.isAlias,
    rules_applied: rules.map((r) => r.name),
    confidence,
  };
}
