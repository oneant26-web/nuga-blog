# 누가한의원 블로그 스튜디오 v3

## 파일 구조
```
nugo-blog-studio/
├── index.html        ← 프론트엔드
├── api/
│   └── generate.js   ← Vercel 서버리스 함수 (Claude API 프록시)
├── vercel.json       ← Vercel 설정
└── README.md
```

## Vercel 배포 방법 (5분)

### 1. GitHub에 올리기
1. github.com 로그인
2. New repository → 이름 입력 (예: nugo-blog) → Create
3. 파일 업로드: index.html, vercel.json, README.md 업로드
4. api 폴더 생성 → generate.js 업로드

### 2. Vercel 연결
1. vercel.com → Continue with GitHub 로그인
2. New Project → 방금 만든 저장소 Import
3. Framework Preset: Other
4. Deploy 클릭
5. 완료! https://[프로젝트명].vercel.app 으로 접속

## API 키 안내

| API | 용도 | 발급처 |
|-----|------|--------|
| Claude API Key (sk-ant-...) | 블로그 글 생성 | console.anthropic.com |
| Gemini API Key (AIza...) | 이미지 생성 | aistudio.google.com |
| Notion Integration Token | DB 저장 | notion.so → Settings → Connections |

## 작동 구조
- 글 생성: 브라우저 → /api/generate (Vercel) → Claude API (CORS 해결!)
- 이미지: 브라우저 → Gemini Imagen 3 (직접 호출, CORS 허용)
- 노션 저장: 브라우저 → Notion API (직접 호출, CORS 허용)
