// Corrects common TLD typos using a weighted correction map.
// Each entry: [pattern, replacement, confidence_weight]
// Weight of 1.0 = certain, 0.8 = plausible but reduced confidence

const TLD_CORRECTIONS = [
  // .com typos
  [/\.con$/i,   ".com", 0.92],
  [/\.comm$/i,  ".com", 0.95],
  [/\.cmo$/i,   ".com", 0.88],
  [/\.ocm$/i,   ".com", 0.88],
  [/\.cpm$/i,   ".com", 0.85],
  [/\.vom$/i,   ".com", 0.87],
  [/\.xom$/i,   ".com", 0.87],
  [/\.coim$/i,  ".com", 0.82],
  [/\.dom$/i,   ".com", 0.80],

  // .org typos
  [/\.og$/i,    ".org", 0.85],
  [/\.orgg$/i,  ".org", 0.93],
  [/\.orrg$/i,  ".org", 0.90],

  // .net typos
  [/\.ney$/i,   ".net", 0.85],
  [/\.nett$/i,  ".net", 0.93],
  [/\.met$/i,   ".net", 0.80],

  // .io typos
  [/\.oi$/i,    ".io",  0.82],

  // .co typos
  [/\.cp$/i,    ".co",  0.80],
];

export default function fuzzy_tld(value, context) {
  const atIdx = value.lastIndexOf("@");
  if (atIdx === -1) return value;

  const local  = value.slice(0, atIdx);
  let   domain = value.slice(atIdx + 1);
  let   corrected = false;

  for (const [pattern, replacement, weight] of TLD_CORRECTIONS) {
    if (pattern.test(domain)) {
      const original = domain;
      domain = domain.replace(pattern, replacement);
      context.corrections = context.corrections || [];
      context.corrections.push({
        rule:       "fuzzy_tld",
        from:       original,
        to:         domain,
        weight,
      });
      corrected = true;
      break; // one TLD correction per pass
    }
  }

  return corrected ? `${local}@${domain}` : value;
}
