// Fixes malformed @ usage in email addresses
// john@@gmail.com  → john@gmail.com   (double @)
// john @gmail.com  → john@gmail.com   (space around @)
// john@ gmail.com  → john@gmail.com

export default function fuzzy_at(value, context) {
  let result = value;
  let changed = false;

  // Remove spaces immediately around @
  if (/\s*@\s+|\s+@\s*/.test(result)) {
    result = result.replace(/\s*@\s*/g, "@");
    context.corrections = context.corrections || [];
    context.corrections.push({ rule: "fuzzy_at", from: value, to: result, weight: 0.93 });
    changed = true;
  }

  // Collapse multiple @@ → single @
  if (/@@+/.test(result)) {
    result = result.replace(/@@+/g, "@");
    context.corrections = context.corrections || [];
    context.corrections.push({ rule: "fuzzy_at", from: value, to: result, weight: 0.91 });
    changed = true;
  }

  return result;
}
