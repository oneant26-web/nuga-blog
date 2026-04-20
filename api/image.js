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

  // gemini-2.0-flash-preview-image-generation — 무료 할당량 있음
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${geminiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
      })
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: `응답 파싱 실패: ${text.substring(0, 300)}` });
    }

    if (data.error) {
      return res.status(500).json({ error: data.error.message || JSON.stringify(data.error) });
    }

    const parts = data.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData);

    if (!imgPart) {
      return res.status(500).json({ error: `이미지 미생성. 전체응답: ${JSON.stringify(data).substring(0, 300)}` });
    }

    return res.status(200).json({
      image: imgPart.inlineData.data,
      mimeType: imgPart.inlineData.mimeType || 'image/png'
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
