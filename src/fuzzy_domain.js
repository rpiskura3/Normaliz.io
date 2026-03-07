// Corrects common misspellings of well-known email providers
// gmal.com → gmail.com, hotamil.com → hotmail.com, etc.

const DOMAIN_CORRECTIONS = [
  // Gmail
  [/^gmal\.com$/i,      "gmail.com",   0.90],
  [/^gmial\.com$/i,     "gmail.com",   0.90],
  [/^gmali\.com$/i,     "gmail.com",   0.88],
  [/^gmaill\.com$/i,    "gmail.com",   0.92],
  [/^gemail\.com$/i,    "gmail.com",   0.85],
  [/^gmail\.co$/i,      "gmail.com",   0.88],
  [/^gnail\.com$/i,     "gmail.com",   0.87],

  // Yahoo
  [/^yaho\.com$/i,      "yahoo.com",   0.88],
  [/^yahooo\.com$/i,    "yahoo.com",   0.92],
  [/^yhoo\.com$/i,      "yahoo.com",   0.85],
  [/^yaho\.co$/i,       "yahoo.com",   0.83],

  // Hotmail
  [/^hotamil\.com$/i,   "hotmail.com", 0.90],
  [/^hotmial\.com$/i,   "hotmail.com", 0.90],
  [/^hotmaill\.com$/i,  "hotmail.com", 0.92],
  [/^hotmal\.com$/i,    "hotmail.com", 0.88],
  [/^hotmai\.com$/i,    "hotmail.com", 0.87],

  // Outlook
  [/^outloook\.com$/i,  "outlook.com", 0.92],
  [/^outlok\.com$/i,    "outlook.com", 0.88],
  [/^outllok\.com$/i,   "outlook.com", 0.87],

  // iCloud
  [/^icoud\.com$/i,     "icloud.com",  0.88],
  [/^iclod\.com$/i,     "icloud.com",  0.87],
];

export default function fuzzy_domain(value, context) {
  const atIdx = value.lastIndexOf("@");
  if (atIdx === -1) return value;

  const local  = value.slice(0, atIdx);
  const domain = value.slice(atIdx + 1);

  for (const [pattern, replacement, weight] of DOMAIN_CORRECTIONS) {
    if (pattern.test(domain)) {
      context.corrections = context.corrections || [];
      context.corrections.push({
        rule:   "fuzzy_domain",
        from:   domain,
        to:     replacement,
        weight,
      });
      return `${local}@${replacement}`;
    }
  }

  return value;
}
