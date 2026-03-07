// Detects country from E.164 prefix
export default function country_detect(value, context) {
  if (value.startsWith("+1")) context.country = "US";
  else if (value.startsWith("+44")) context.country = "GB";
  else if (value.startsWith("+61")) context.country = "AU";
  else if (value.startsWith("+49")) context.country = "DE";
  else if (value.startsWith("+33")) context.country = "FR";
  else if (value.startsWith("+91")) context.country = "IN";
  else if (value.startsWith("+86")) context.country = "CN";
  else if (value.startsWith("+55")) context.country = "BR";
  else context.country = "INTL";
  return value;
}
