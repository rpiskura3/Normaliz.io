// Removes duplicated TLD caused by autofill misfires
// john@gmail.com.com  → john@gmail.com
// john@yahoo.com.net  → john@yahoo.com  (last TLD wins — the dupe is stripped)
// Handles any repeated identical TLD segment: .com.com, .net.net, .org.org

const KNOWN_TLDS = ["com", "net", "org", "io", "co", "edu", "gov", "info", "biz"];

export default function fuzzy_tld_dupe(value, context) {
  const atIdx = value.lastIndexOf("@");
  if (atIdx === -1) return value;

  const local  = value.slice(0, atIdx);
  const domain = value.slice(atIdx + 1);

  // Match pattern: something.tld.tld (same TLD repeated)
  const dupePattern = new RegExp(
    `^(.+\\.(${KNOWN_TLDS.join("|")}))\\.(${KNOWN_TLDS.join("|")})$`, "i"
  );

  const match = domain.match(dupePattern);
  if (!match) return value;

  // Only correct if the two TLDs are identical (e.g. .com.com not .com.net)
  const tld1 = domain.split(".").slice(-2)[0].toLowerCase();
  const tld2 = domain.split(".").slice(-1)[0].toLowerCase();
  if (tld1 !== tld2) return value;

  const cleaned = match[1]; // everything before the duplicated TLD

  context.corrections = context.corrections || [];
  context.corrections.push({
    rule:   "fuzzy_tld_dupe",
    from:   domain,
    to:     cleaned,
    weight: 0.97,
  });

  return `${local}@${cleaned}`;
}
