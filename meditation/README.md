# 묵상 노트

고민을 "줄기"로 이어 적고, 성경을 무작위로 펼쳐 받은 말씀을 배경부터 적용까지 함께 읽어 쌓아 두는 개인용 웹앱.

- Next.js 16 (App Router) + TypeScript, Vercel 배포 (Root Directory: `meditation`)
- DB: Neon Postgres (`postgres` 드라이버). 스키마는 `src/lib/schema.ts`, 서버가 처음 DB에 접속할 때 자동 적용
- 해석: Anthropic API `claude-sonnet-5-5`, 서버에서만 호출하고 스트리밍으로 표시
- 본문: 개역한글(1961, 저작권 만료). 빌드할 때 고정 커밋에서 받아 SHA-256 확인 후 `data/krv/`에 저장 (`scripts/fetch-krv.mjs`)
- 본문 선택은 코드의 난수(`crypto.randomInt`)로 한다: 66권 → 장 → 5~10절 (한 장 / 한 절, 구약 / 신약만 옵션)

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `APP_PASSWORD` | 로그인 비밀번호. 세션 쿠키 서명 키로도 쓰여서, 바꾸면 모든 기기가 로그아웃된다 |
| `DATABASE_URL` | Neon 연결 문자열 (Vercel Storage에서 Neon을 연결하면 자동 설정) |
| `ANTHROPIC_API_KEY` | 없으면 해석 없이 묵상만 저장할 수 있다 |

## 로컬 실행

```bash
cp .env.example .env.local   # 값 채우기
npm install
npm run dev
npm test                     # 랜덤 펼치기·참조 해석·해석 파싱 단위 테스트
```

## 해석이 받는 맥락

줄기 요약 + 그 줄기의 최근 묵상 3개(고민, 받은 본문, 붙잡은 문장, 나의 응답) + 오늘의 고민 + 오늘 본문.
전체 기록을 매번 보내지 않는다. 시스템 프롬프트는 `src/lib/interpret-core.ts`.
