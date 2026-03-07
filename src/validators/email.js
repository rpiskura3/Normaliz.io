import rfc_violations    from "../rules/email/validate/rfc_violations.js";
import disposable_domain from "../rules/email/validate/disposable_domains.js";

// Risk level hierarchy
const RISK_ORDER = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };

function highestRisk(flags) {
  if (!flags || flags.length === 0) return "none";
  return flags.reduce((highest, flag) => {
    return RISK_ORDER[flag.risk] > RISK_ORDER[highest] ? flag.risk : highest;
  }, "none");
}

function computeConfidence(flags) {
  if (!flags || flags.length === 0) return 1.0;
  // Multiply all flag confidences inversely — more/worse flags = lower score
  const penalty = flags.reduce((acc, flag) => acc * (1 - flag.confidence * 0.5), 1.0);
  return Math.round(Math.max(0, penalty) * 1000) / 1000;
}

export function validateEmail(email) {
  if (!email) return { valid: false, confidence: 0, flags: [{ code: "MISSING_INPUT", message: "No email provided", risk: "critical", confidence: 1.0 }], risk: "critical" };

  const context = { flags: [] };

  // Run RFC structural checks first
  rfc_violations(email, context);

  // Only run domain checks if basic structure is valid
  const hasCritical = context.flags.some(f => f.risk === "critical");
  if (!hasCritical) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain) disposable_domain(domain, context);
  }

  const risk       = highestRisk(context.flags);
  const confidence = computeConfidence(context.flags);
  const valid      = risk !== "critical" && risk !== "high";

  return {
    valid,
    confidence,
    flags: context.flags.map(f => ({ code: f.code, message: f.message, risk: f.risk })),
    risk,
  };
}
