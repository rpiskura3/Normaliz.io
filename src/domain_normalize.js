// Lowercases only the domain portion of the email
// John.Doe@GMAIL.COM → John.Doe@gmail.com
export default function domain_normalize(value) {
  const atIdx = value.lastIndexOf("@");
  if (atIdx === -1) return value;
  return value.slice(0, atIdx) + "@" + value.slice(atIdx + 1).toLowerCase();
}
