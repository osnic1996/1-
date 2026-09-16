# Meta(Instagram/Facebook) 연동 설정 가이드

이 앱의 코드는 Meta Graph API 연동을 전부 구현해뒀지만, 아래 단계는 본인의
Meta 계정으로 **직접** 진행해야 합니다 (Claude가 대신 앱을 만들거나 비밀키를
발급받을 수 없어요).

## 1. Meta 개발자 계정 & 앱 생성

1. https://developers.facebook.com 에서 개발자 계정 등록
2. "앱 만들기" → 유형 "비즈니스" 선택
3. 앱 대시보드 → **설정 > 기본 설정**에서 `앱 ID`, `앱 시크릿 코드` 확인
   → 이 값을 `.env.local`의 `META_APP_ID`, `META_APP_SECRET`에 입력

## 2. 필요한 제품 추가

앱 대시보드 좌측 메뉴에서 다음 제품을 추가합니다.

- **Facebook 로그인** (OAuth)
- **Webhooks**

## 3. 권한(Permissions)

개발 모드에서는 앱 관리자/개발자/테스터 역할을 가진 계정 소유의 페이지·
인스타그램 계정에 한해 아래 권한을 별도 심사 없이 테스트할 수 있습니다.
다른 사람의 페이지까지 연동하려면 **앱 검수(App Review)** 를 통과해야 합니다.

- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_engagement`
- `pages_manage_metadata`
- `instagram_basic`
- `instagram_manage_comments`

(코드의 `lib/meta/config.ts`의 `OAUTH_SCOPES`에 이미 반영되어 있습니다.)

## 4. 공개 URL 준비 (로컬 개발 시 필수)

Meta는 OAuth 리디렉션과 웹훅 콜백에 **HTTPS 공개 URL**을 요구합니다.
로컬(`localhost:3000`)은 그대로 쓸 수 없으므로 터널을 열어야 합니다.

```bash
# 예: ngrok 사용 시
npx ngrok http 3000
```

발급된 `https://xxxx.ngrok-free.app` 같은 주소를 `.env.local`의
`NEXT_PUBLIC_APP_URL`에 넣으세요. 실제 배포(예: Vercel) 시에는 배포 도메인을
그대로 사용하면 됩니다.

## 5. Facebook 로그인 설정

- **설정 > Facebook 로그인**에서 "클라이언트 OAuth 로그인" 활성화
- **유효한 OAuth 리디렉션 URI**에 다음을 추가:
  `${NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`

## 6. Webhooks 설정

- **Webhooks** 제품 → "Page" 객체 구독 추가
  - 콜백 URL: `${NEXT_PUBLIC_APP_URL}/api/webhooks/meta`
  - 검증 토큰: `.env.local`의 `META_WEBHOOK_VERIFY_TOKEN`과 동일한 값 (임의 문자열, 직접 정하면 됨)
  - 구독 필드: `feed` (페이지 댓글용)
- "Instagram" 객체도 동일한 콜백 URL로 추가하고 `comments` 필드 구독
- 연동 후 실제 페이지/인스타그램 계정을 앱에 "제품 > Webhooks > 페이지 구독"에서 선택해 구독을 활성화해야 실시간 알림이 옵니다.

## 7. 환경 변수 채우기

```bash
cp .env.local.example .env.local
```

`.env.local`을 열어 위에서 얻은 값들을 채웁니다.

## 8. 연동 흐름 사용하기

1. `npm run dev`로 앱 실행 (터널 사용 시 터널 주소로 접속)
2. 대시보드 우상단 "댓글 연결 설정" 클릭 → Facebook 로그인 창에서 페이지 접근 권한 승인
3. 승인이 끝나면 `/?connected=1`로 리디렉션되며, 연결된 페이지의 실제 댓글이
   `/api/comments`를 통해 대시보드에 표시됩니다.
4. 대시보드에서 댓글을 "AI 자동 제외"로 옮기면 실제 댓글이 숨김 처리되고,
   "삭제"를 실행하면 실제로 영구 삭제됩니다 (삭제는 확인창이 뜹니다).

## 참고 / 한계

- 토큰과 연결 정보는 `data/` 폴더에 암호화되지 않은 JSON 파일로 저장됩니다.
  로컬 개발/데모용이며, 실서비스에는 실제 DB + 비밀키 관리 서비스로 교체해야
  합니다.
- 댓글 조회는 최근 게시물 10개까지만 가져옵니다 (`lib/meta/comments.ts`의
  `postLimit`/`mediaLimit`). 더 많은 이력이 필요하면 커서 기반 페이지네이션을
  추가하세요.
- Graph API 필드명/정책은 Meta가 주기적으로 변경합니다. 오류가 나면
  `META_GRAPH_API_VERSION`을 최신 버전으로 올리고
  [Graph API 문서](https://developers.facebook.com/docs/graph-api)를 참고하세요.
