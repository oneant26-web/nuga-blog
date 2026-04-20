export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-claude-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const claudeKey = req.headers['x-claude-key'];
  if (!claudeKey || !claudeKey.startsWith('sk-ant-')) {
    return res.status(401).json({ error: 'Claude API 키가 없거나 올바르지 않습니다.' });
  }

  const { keyword, content, postType, postLen } = req.body;
  if (!keyword || !content) {
    return res.status(400).json({ error: '키워드와 내용을 입력해주세요.' });
  }

  const lenMap = {
    '짧게 (~800자)': '약 800자',
    '보통 (~1500자)': '약 1500자',
    '길게 (~2500자)': '약 2500자',
    '아주 길게 (~3500자)': '약 3500자',
  };

  const SYSTEM = `당신은 대구 누가한의원 원장의 블로그 어시스턴트입니다. 반드시 아래 규칙을 따르세요.

[문체 규칙]
- 도입부: 일상적 공감 소재(계절/날씨/음식/사회이슈)로 자연스럽게 시작
- ^^, ^^;; 이모티콘을 1~3회 자연스럽게 포함
- 질문 → 답 형식으로 독자와 대화하듯 진행
- 한의학 용어는 바로 쉽게 풀어서 설명
- 단정적 효과 표현 절대 금지 (의료법 준수)
- 본문 중간에 "지산동", "범물동" 지역명을 1~2회 자연스럽게 삽입
- 소제목마다 이모지 1개 붙이기 (🔍원인, 💡팁, 🏥치료, ⚠️주의 등)

[글 구조]
## 📌 제목
(제목) | 지산동 범물동 누가한의원

---

## 📝 본문
(도입부 + 소제목별 내용 + 마무리 내원 유도)

📍 누가한의원
대구광역시 수성구 용학로 294 동아백화점 뒷편 아리따움 2층
☎ 대표전화: 053-784-8240
🕐 진료시간
- 월·수·목·금: 오전 9시 ~ 오후 6시 30분 (점심시간 1시~2시)
- 화요일: 오후 2시 ~ 오후 8시 (야간진료)
- 토요일: 오전 9시 ~ 오후 1시
- 일요일·공휴일: 휴진
🅿️ 동아백화점 주차장 무료주차 가능

---

## 🏷️ 태그
#범물동한의원 #누가한의원 #지산동한의원 #침잘놓는한의원 (+ 주제 태그 6~8개)

[출력] 반드시 JSON으로만 응답 (마크다운 코드블록 없이):
{"title":"제목 | 지산동 범물동 누가한의원","body":"전체 본문 내용"}`;

  const userMsg = `글 유형: ${postType}\n핵심 키워드: ${keyword}\n포함할 내용: ${content}\n글 길이: ${lenMap[postLen] || '약 1500자'}\n\n위 정보로 블로그 글을 작성해주세요.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system: SYSTEM,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const raw = data.content?.[0]?.text?.trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    return res.status(200).json({ title: parsed.title, body: parsed.body });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
