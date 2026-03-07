import { HANDLE_RULES } from "../rules/index.js";

export function normalizeHandle(platform, raw) {
  if (!raw) return null;

  const context = { platform };
  const universalRules = HANDLE_RULES["*"] || [];
  const platformRules  = HANDLE_RULES[platform.toLowerCase()] || [];

  // Run universal rules first, then platform-specific rules on top
  const rules = [...universalRules, ...platformRules];

  const canonical = rules.reduce((val, rule) => rule(val, context), raw);

  return {
    input: raw,
    canonical,
    rules_applied: rules.map((r) => r.name),
  };
}
