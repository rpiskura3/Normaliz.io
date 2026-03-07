// Removes leading @ from social handles
// @john_doe → john_doe
export default function strip_at(value) {
  return value.replace(/^@/, "").trim();
}
