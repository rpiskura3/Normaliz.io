// Normalizes googlemail.com → gmail.com (they are the same inbox)
export default function gmail_aliases(value) {
  return value.replace(/@googlemail\.com$/i, "@gmail.com");
}
