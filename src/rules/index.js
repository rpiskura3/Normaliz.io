import trim             from "./common/trim.js";
import lowercase        from "./common/lowercase.js";
import plus_remove      from "./email/plus_remove.js";
import dot_remove       from "./email/dot_remove.js";
import gmail_aliases    from "./email/gmail_aliases.js";
import domain_normalize from "./email/domain_normalize.js";
import fuzzy_at         from "./email/fuzzy_at.js";
import fuzzy_tld        from "./email/fuzzy_tld.js";
import fuzzy_domain     from "./email/fuzzy_domain.js";
import e164             from "./phone/e164.js";
import country_detect   from "./phone/country_detect.js";
import type_detect      from "./phone/type_detect.js";
import strip_at         from "./handle/strip_at.js";

// ── Email rules ───────────────────────────────────────────────────────────────
// Execution order matters:
//   1. Structural cleanup (trim, fix @, lowercase domain)
//   2. Fuzzy corrections (domain host, TLD) — before domain-specific rules
//      so that e.g. "gmal.com" becomes "gmail.com" before gmail rules fire
//   3. Domain-specific rules (dot_remove, alias normalization)

export const EMAIL_RULES = {
  "*": [
    trim,
    fuzzy_at,           // fix @@, spaces around @
    domain_normalize,   // lowercase domain
    fuzzy_domain,       // gmal.com → gmail.com
    fuzzy_tld,          // .con → .com
    plus_remove,        // strip +alias
    lowercase,          // lowercase full address
  ],

  // Domain-specific rules run AFTER universal rules.
  // By this point fuzzy corrections have already fired, so
  // "gmal.com" will have become "gmail.com" and these will match correctly.
  "gmail.com":      [gmail_aliases, dot_remove],
  "googlemail.com": [gmail_aliases, dot_remove],
  "outlook.com":    [],
  "hotmail.com":    [],
  "yahoo.com":      [],
  "icloud.com":     [],
};

// Base confidence per domain (before fuzzy corrections are applied)
export const EMAIL_CONFIDENCE = {
  "gmail.com":      0.98,
  "googlemail.com": 0.98,
  "outlook.com":    0.93,
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
  "twitter":   [],
  "instagram": [],
  "tiktok":    [],
  "linkedin":  [],
  "github":    [],
};
