module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sms } = req.body || {};
  if (!sms || typeof sms !== 'string' || sms.trim().length < 6) {
    return res.status(400).json({ error: 'Valid SMS text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ parsed: null, mode: 'local-only', note: 'GEMINI_API_KEY not configured; local parser used.' });
  }

  const prompt = `Extract transaction details from this Indian bank SMS. Never invent missing values; return empty string "" if unknown.
Return ONLY valid JSON with keys:
amount (number or ""), merchant (string), date (YYYY-MM-DD or ""), time (HH:MM or ""),
type ("expense"|"income"|"refund"|"transfer"|"cash_withdrawal"|"cc_payment"|"bank_charges"|"failed"|"reversed"),
paymentMethod ("UPI"|"Debit Card"|"Credit Card"|"NEFT"|"IMPS"|"Net Banking"|"Cash"|"Auto-Debit"|""),
account (string), referenceId (string), category (one of: food, groceries, transport, fuel, rent, electricity, internet, healthcare, education, shopping, entertainment, subscriptions, travel, personal_care, fitness, hobbies, emi, loan, insurance, bank_charges, investments, savings, gifts, family, misc, salary, freelance, business, interest, other_income), subcategory (string).

SMS: ${sms.slice(0, 1200)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0, maxOutputTokens: 280 }
        })
      }
    );

    if (!response.ok) {
      return res.status(200).json({ parsed: null, error: 'AI upstream unavailable' });
    }

    const data = await response.json();
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(rawJson);
    return res.status(200).json({ parsed, mode: 'ai-enhanced' });
  } catch (err) {
    return res.status(200).json({ parsed: null, error: 'Fallback to local parser' });
  }
}
