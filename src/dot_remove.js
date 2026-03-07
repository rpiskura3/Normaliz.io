// Removes dots from local part (Gmail treats them as identical)
// john.doe@gmail.com → johndoe@gmail.com
export default function dot_remove(value) {
  const [local, domain] = value.split("@");
  if (!domain) return value;
  return `${local.replace(/\./g, "")}@${domain}`;
}
