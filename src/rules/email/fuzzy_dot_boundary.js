// Removes invalid leading or trailing dots from the local part
// .john@gmail.com  → john@gmail.com
// john.@gmail.com  → john@gmail.com

export default function fuzzy_dot_boundary(value, context) {
  const atIdx = value.lastIndexOf("@");
  if (atIdx === -1) return value;

  const local  = value.slice(0, atIdx);
  const domain = value.slice(atIdx + 1);
  const cleaned = local.replace(/^\.+|\.+$/g, "");

  if (cleaned === local) return value;

  context.corrections = context.corrections || [];
  context.corrections.push({
    rule:   "fuzzy_dot_boundary",
    from:   `${local}@${domain}`,
    to:     `${cleaned}@${domain}`,
    weight: 0.99,
  });

  return `${cleaned}@${domain}`;
}
