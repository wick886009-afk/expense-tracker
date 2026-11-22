module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType } = req.body || {};
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'Image payload is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ parsed: null, mode: 'manual-preview', note: 'GEMINI_API_KEY not configured on Vercel.' });
  }

  const prompt = `You are a financial OCR parser for Indian receipts, paper bills, and UPI/bank transaction screenshots (GPay, PhonePe, Paytm, Cred, Kotak, HDFC, ICICI, SBI, Axis).
Extract exact transaction details from this image. Never invent missing values; return empty string "" if unreadable or absent.
Return ONLY valid JSON with keys:
amount (number or ""), merchant (string), date (YYYY-MM-DD or ""), time (HH:MM or ""),
type ("expense"|"income"|"refund"|"transfer"|"cash_withdrawal"|"cc_payment"|"bank_charges"|"failed"|"reversed"),
paymentMethod ("UPI"|"Debit Card"|"Credit Card"|"NEFT"|"IMPS"|"Net Banking"|"Cash"|"Auto-Debit"|""),
account (string), referenceId (string — UTR or UPI Ref No if shown),
category (one of: food, groceries, transport, fuel, rent, electricity, internet, healthcare, education, shopping, entertainment, subscriptions, travel, personal_care, fitness, hobbies, emi, loan, insurance, bank_charges, investments, savings, gifts, family, misc, salary, freelance, business, interest, other_income),
subcategory (string), notes (brief 1-line summary of bill items if visible).`;

  let models = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-2.5-flash-lite'];
  // Append any live Flash models available to this API key as automatic future-proof fallback
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const liveFlash = (listData.models || [])
        .filter(m => /flash/i.test(m.name) && !/tts|audio|live|image|embedding/i.test(m.name) && (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        .reverse();
      models = Array.from(new Set([...models, ...liveFlash])).slice(0, 6);
    }
  } catch (e) {}
  let lastErr = 'AI Vision request failed';
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } }
              ]
            }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
          })
        }
      );
      if (!response.ok) {
        const errTxt = await response.text();
        lastErr = `AI Vision (${model}) HTTP ${response.status}: ${errTxt.slice(0, 120)}`;
        continue;
      }
      const data = await response.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json({ parsed, mode: 'ai-vision', model });
    } catch (err) {
      lastErr = err?.message || 'Vision parse error';
    }
  }
  return res.status(200).json({ parsed: null, error: lastErr });
}
