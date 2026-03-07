// Removes +alias tags from email local part
// john.doe+sales@gmail.com → john.doe@gmail.com
export default function plus_remove(value) {
  const [local, domain] = value.split("@");
  if (!domain) return value;
  return `${local.split("+")[0]}@${domain}`;
}
