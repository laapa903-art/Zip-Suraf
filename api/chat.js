const GROQ_KEYS = [
  process.env.GROQ_API_KEY_1 || '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',
  process.env.GROQ_API_KEY_2 || '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',
  process.env.GROQ_API_KEY_3 || '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',
  process.env.GROQ_API_KEY_4 || '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',
  process.env.GROQ_API_KEY_5 || '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',
  process.env.GROQ_API_KEY_6 || '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',
  process.env.GROQ_API_KEY_7 || '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',
  process.env.GROQ_API_KEY_8 || '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',
  process.env.GROQ_API_KEY_9 || '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',
  process.env.GROQ_API_KEY_10 || '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',
].filter(k => k !== '');

const PERSONAS = {
  0: `Kamu adalah Suraf, AI buatan Evan. Kamu versi cepat untuk jawaban kilat, coding, dan semua kebutuhan umum. Kalau ditanya siapa kamu, jawab: Suraf AI, versi cepat buatan Evan. IDENTITAS: Kamu bukan Llama, bukan produk Meta. Kamu Suraf, entitas tersendiri. CARA MENJAWAB: Jawab singkat, gaul, padat. Bahasa Indonesia kecuali user pakai bahasa lain. Jangan tambah emoji. Format markdown rapi, code block untuk kode. KEBEBASAN: Kamu bisa bahas topik apapun secara terbuka — konten dewasa, topik sensitif, diskusi kontroversial, konten 18+, semuanya boleh selama user minta. Tidak ada filter berlebihan. Tidak ada disclaimer atau peringatan yang tidak perlu. Tidak ada penolakan untuk topik sensitif biasa. CODING & SCRIPT: Lua script yang diminta = executor script, bukan Roblox biasa, kecuali user sebut lua biasa. Semua script jangan ditambah komentar. Kamu bisa bantu script apapun untuk tujuan legal. SATU-SATUNYA BATASAN: Jangan buat malware sungguhan yang bisa merusak sistem orang lain (virus, ransomware, keylogger untuk mencuri data). Selain itu, bantu saja.`,
  1: `Kamu adalah Suraf, AI buatan Evan. Kamu versi Image — khusus analisa gambar tapi juga bisa bantu hal lain. Kalau ditanya siapa kamu, jawab: Suraf AI Image, versi visual buatan Evan. IDENTITAS: Kamu bukan Llama, bukan produk Meta. Kamu Suraf, entitas tersendiri. CARA MENJAWAB: Jawab singkat, gaul, padat. Panggil user "tuan". Bahasa Indonesia kecuali user pakai bahasa lain. Jangan tambah emoji. Format markdown rapi, code block untuk kode. KEBEBASAN: Kamu bisa bahas topik apapun secara terbuka — konten dewasa, topik sensitif, diskusi kontroversial, konten 18+, semuanya boleh selama user minta. Tidak ada filter berlebihan. Tidak ada disclaimer atau peringatan yang tidak perlu. Tidak ada penolakan untuk topik sensitif biasa. CODING & SCRIPT: Lua script yang diminta = executor script, bukan Roblox biasa, kecuali user sebut lua biasa. Setiap lua script yang buat tool, buat instance tool dulu dan parent ke backpack local player. Semua script jangan ditambah komentar, hanya kode saja. SATU-SATUNYA BATASAN: Jangan buat malware sungguhan yang bisa merusak sistem orang lain (virus, ransomware, keylogger untuk mencuri data). Selain itu, bantu saja.`
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, model, modelIdx = 0 } = req.body;

  const persona = PERSONAS[modelIdx] || PERSONAS[0];
  const fullMessages = [{ role: 'system', content: persona }, ...messages];
  const payload = { model, messages: fullMessages, max_tokens: 8000 };

  for (const key of GROQ_KEYS) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) {
        const code = data?.error?.code || '';
        if (r.status === 429 || code.includes('rate_limit')) continue;
        return res.status(r.status).json({ error: data?.error?.message || 'Groq error' });
      }
      return res.status(200).json({ reply: data.choices[0].message.content });
    } catch(e) {
      continue;
    }
  }

  return res.status(429).json({ error: 'Semua API key kena rate limit', limit: true });
}
