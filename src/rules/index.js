import trim            from "./common/trim.js";
import lowercase       from "./common/lowercase.js";
import plus_remove     from "./email/plus_remove.js";
import dot_remove      from "./email/dot_remove.js";
import gmail_aliases   from "./email/gmail_aliases.js";
import domain_normalize from "./email/domain_normalize.js";
import e164            from "./phone/e164.js";
import country_detect  from "./phone/country_detect.js";
import type_detect     from "./phone/type_detect.js";
import strip_at        from "./handle/strip_at.js";

// ── Email rules ───────────────────────────────────────────────────────────────
// Rules under "*" run for every email domain.
// Rules under a specific domain run in addition to "*" rules.
// Add a new domain = one new key. Never touch the normalizer.

export const EMAIL_RULES = {
  "*":              [trim, domain_normalize, plus_remove, lowercase],
  "gmail.com":      [gmail_aliases, dot_remove],
  "googlemail.com": [gmail_aliases, dot_remove],
  "outlook.com":    [],
  "hotmail.com":    [],
  "yahoo.com":      [],
  "icloud.com":     [],
};

// Confidence scores per domain (how certain we are the canonical is correct)
export const EMAIL_CONFIDENCE = {
  "gmail.com":      0.98,
  "googlemail.com": 0.98,
  "outlook.com":    0.92,
  "hotmail.com":    0.92,
  "yahoo.com":      0.90,
  "icloud.com":     0.91,
  "*":              0.85,
};

// ── Phone rules ───────────────────────────────────────────────────────────────
export const PHONE_RULES = {
  "*": [e164, country_detect, type_detect],
};

// ── Handle rules ─────────────────────────────────────────────────────────────
export const HANDLE_RULES = {
  "*":         [trim, strip_at, lowercase],
  "twitter":   [trim, strip_at, lowercase],
  "instagram": [trim, strip_at, lowercase],
  "tiktok":    [trim, strip_at, lowercase],
  "linkedin":  [trim, strip_at, lowercase],
  "github":    [trim, strip_at, lowercase],
};
