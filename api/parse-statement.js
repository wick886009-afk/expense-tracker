module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Statement text required' });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).json({ transactions: [], note: 'GEMINI_API_KEY not set' });

  const prompt = `Extract all bank transactions from this Indian bank statement text. Ignore opening/closing balances and headers.
Return ONLY valid JSON: { "transactions": [ { "date": "YYYY-MM-DD", "merchant": "string", "amount": 123.45, "type": "expense"|"income"|"refund"|"transfer", "paymentMethod": "UPI"|"NEFT"|"IMPS"|"Debit Card"|"Credit Card"|"Auto-Debit"|"Net Banking"|"Cash", "referenceId": "string", "category": "food"|"groceries"|"transport"|"fuel"|"rent"|"electricity"|"internet"|"healthcare"|"education"|"shopping"|"entertainment"|"subscriptions"|"travel"|"emi"|"investments"|"savings"|"salary"|"other_income"|"misc", "subcategory": "string", "notes": "string" } ] }

STATEMENT TEXT:
${text.slice(0, 14000)}`;

  for (const model of ['gemini-2.5-flash', 'gemini-2.0-flash']) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
          })
        }
      );
      if (!response.ok) continue;
      const data = await response.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json({ transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [] });
    } catch (e) {}
  }
  return res.status(200).json({ transactions: [] });
};
