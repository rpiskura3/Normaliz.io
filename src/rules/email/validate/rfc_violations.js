// RFC 5321 / 5322 structural validation checks
// Each check pushes a flag into context.flags if violated

// Valid unquoted local part characters per RFC 5321
const VALID_LOCAL_CHARS = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/;

export default function rfc_violations(email, context) {
  context.flags = context.flags || [];

  const atIdx = email.lastIndexOf("@");

  // ── Missing @ ──────────────────────────────────────────────────────────────
  if (atIdx === -1) {
    context.flags.push({
      code:       "MISSING_AT_SYMBOL",
      message:    "Email address is missing @ symbol",
      confidence: 1.0,
      risk:       "critical",
    });
    return; // can't proceed without @
  }

  const local  = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);

  // ── Total length > 254 ────────────────────────────────────────────────────
  if (email.length > 254) {
    context.flags.push({
      code:       "EXCEEDS_MAX_LENGTH",
      message:    `Email length ${email.length} exceeds RFC maximum of 254 characters`,
      confidence: 1.0,
      risk:       "high",
    });
  }

  // ── Local part > 64 ───────────────────────────────────────────────────────
  if (local.length > 64) {
    context.flags.push({
      code:       "LOCAL_PART_TOO_LONG",
      message:    `Local part length ${local.length} exceeds RFC maximum of 64 characters`,
      confidence: 1.0,
      risk:       "high",
    });
  }

  // ── Empty local part ──────────────────────────────────────────────────────
  if (local.length === 0) {
    context.flags.push({
      code:       "EMPTY_LOCAL_PART",
      message:    "Email has no local part before @",
      confidence: 1.0,
      risk:       "critical",
    });
  }

  // ── Invalid characters in local part ─────────────────────────────────────
  if (local.length > 0 && !VALID_LOCAL_CHARS.test(local)) {
    const invalid = [...local].filter(c => !VALID_LOCAL_CHARS.test(c));
    context.flags.push({
      code:       "INVALID_LOCAL_CHARS",
      message:    `Local part contains invalid characters: ${[...new Set(invalid)].join(" ")}`,
      confidence: 0.97,
      risk:       "high",
    });
  }

  // ── Missing domain ────────────────────────────────────────────────────────
  if (!domain || domain.length === 0) {
    context.flags.push({
      code:       "MISSING_DOMAIN",
      message:    "Email has no domain after @",
      confidence: 1.0,
      risk:       "critical",
    });
    return;
  }

  // ── Domain has no dot (no TLD) ────────────────────────────────────────────
  if (!domain.includes(".")) {
    context.flags.push({
      code:       "MISSING_TLD",
      message:    `Domain "${domain}" has no TLD`,
      confidence: 0.99,
      risk:       "high",
    });
  }

  // ── Domain label length > 63 ──────────────────────────────────────────────
  const labels = domain.split(".");
  for (const label of labels) {
    if (label.length > 63) {
      context.flags.push({
        code:       "DOMAIN_LABEL_TOO_LONG",
        message:    `Domain label "${label}" exceeds RFC maximum of 63 characters`,
        confidence: 1.0,
        risk:       "high",
      });
    }
    if (label.length === 0) {
      context.flags.push({
        code:       "EMPTY_DOMAIN_LABEL",
        message:    "Domain contains consecutive dots or starts/ends with a dot",
        confidence: 1.0,
        risk:       "high",
      });
    }
  }

  // ── Numeric-only TLD ─────────────────────────────────────────────────────
  const tld = labels[labels.length - 1];
  if (tld && /^\d+$/.test(tld)) {
    context.flags.push({
      code:       "NUMERIC_TLD",
      message:    `TLD "${tld}" is numeric — likely an IP address or invalid domain`,
      confidence: 0.95,
      risk:       "medium",
    });
  }
}
