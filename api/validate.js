import { validateEmail } from "../src/validators/email.js";

export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email } = req.body;
    const response = {};

    if (email) {
      response.email = validateEmail(email);
    }

    return res.status(200).json(response);
  } catch (err) {
    return res.status(400).json({ error: "Invalid request body", details: err.message });
  }
}
