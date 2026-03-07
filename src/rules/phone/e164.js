// Converts any US phone format to E.164 (+1XXXXXXXXXX)
// (614) 555-1212 → +16145551212
export default function e164(value, context) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    context.e164 = `+1${digits}`;
    context.rawDigits = digits;
    return context.e164;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    context.e164 = `+${digits}`;
    context.rawDigits = digits.slice(1);
    return context.e164;
  }
  if (digits.length > 11) {
    context.e164 = `+${digits}`;
    context.rawDigits = digits;
    return context.e164;
  }
  context.error = "cannot parse to E.164";
  return value;
}
