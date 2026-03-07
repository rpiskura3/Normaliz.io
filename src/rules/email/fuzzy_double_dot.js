// Collapses consecutive dots in the local part (invalid per RFC 5321)
// john..doe@gmail.com  → john.doe@gmail.com
// j...doe@gmail.com    → j.doe@gmail.com

export default function fuzzy_double_dot(value, context) {
  const atIdx = value.lastIndexOf("@");
  if (atIdx === -1) return value;

  const local  = value.slice(0, atIdx);
  const domain = value.slice(atIdx + 1);
  const cleaned = local.replace(/\.{2,}/g, ".");

  if (cleaned === local) return value;

  context.corrections = context.corrections || [];
  context.corrections.push({
    rule:   "fuzzy_double_dot",
    from:   `${local}@${domain}`,
    to:     `${cleaned}@${domain}`,
    weight: 0.99,
  });

  return `${cleaned}@${domain}`;
}
