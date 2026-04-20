export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const geminiKey = req.headers['x-gemini-key'];
  if (!geminiKey) return res.status(401).json({ error: 'Gemini API 키가 없습니다.' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: '프롬프트가 없습니다.' });

  // Imagen 4 Fast — 현재 사용 가능한 최신 모델
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${geminiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '1:1' }
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return res.status(500).json({ error: '이미지 데이터가 없습니다.' });

    return res.status(200).json({ image: b64, mimeType: 'image/png' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
