# 📊 Google Analytics 4 (GA4) 설정 가이드

Start Marketing 서비스에 Google Analytics 4를 통합하여 웹사이트 방문자를 추적할 수 있습니다.

## 🎯 추적되는 데이터

### 자동 추적
- **페이지뷰**: 모든 페이지 방문 자동 추적
- **UTM 파라미터**: URL의 UTM 파라미터 자동 감지 및 추적

### 커스텀 이벤트
- **`utm_check`**: UTM Checker에서 URL 검사 시
  - `event_category`: "utm_checker"
  - `event_label`: "valid_utm" 또는 "invalid_utm"
  - `has_utm_source`, `has_utm_medium`, `has_utm_campaign`: boolean
  - `param_count`: 전체 파라미터 개수

- **`utm_check_error`**: UTM Checker에서 에러 발생 시
  - `event_category`: "utm_checker"
  - `event_label`: "url_parse_error"
  - `error_message`: 에러 메시지

- **`utm_detected`**: UTM 파라미터가 감지되었을 때
  - `source`, `medium`, `campaign`, `content`, `term`: UTM 파라미터 값

## 🚀 설정 방법

### 1단계: Google Analytics 4 계정 생성

1. [Google Analytics](https://analytics.google.com/) 접속
2. "측정 시작" 클릭
3. 계정 이름 입력 (예: "Start Marketing")
4. 속성 이름 입력 (예: "startmktg.com")
5. 보고 시간대 선택 (한국: GMT+9)
6. 통화 선택 (KRW)
7. "비즈니스 정보" 입력 (선택)
8. "만들기" 클릭

### 2단계: 측정 ID 확인

1. GA4 대시보드에서 **관리** (톱니바퀴 아이콘) 클릭
2. **속성** 열에서 **데이터 스트림** 클릭
3. 웹 스트림 클릭
4. **측정 ID** 복사 (형식: `G-XXXXXXXXXX`)

### 3단계: 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하거나 수정:

```bash
# Google Analytics 4 측정 ID
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

**중요**: 
- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함됨)
- Vercel 배포 시 환경 변수를 추가해야 합니다

### 4단계: Vercel 환경 변수 설정

1. [Vercel 대시보드](https://vercel.com) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭
4. 다음 변수 추가:
   - **Name**: `NEXT_PUBLIC_GA4_ID`
   - **Value**: `G-XXXXXXXXXX` (2단계에서 복사한 측정 ID)
   - **Environment**: Production, Preview, Development 모두 선택
5. **Save** 클릭
6. **Redeploy** 클릭하여 재배포

## ✅ 확인 방법

### 로컬 개발 환경

1. `.env.local` 파일에 `NEXT_PUBLIC_GA4_ID` 설정
2. `npm run dev` 실행
3. 브라우저 개발자 도구 → Network 탭
4. `gtag` 또는 `collect` 요청이 보이면 정상 작동

### GA4 실시간 보고서

1. [Google Analytics](https://analytics.google.com/) 접속
2. **보고서** → **실시간** 클릭
3. 웹사이트를 방문하면 실시간으로 방문자 수가 표시됨

### 이벤트 확인

1. GA4 대시보드 → **보고서** → **실시간**
2. **이벤트 수** 섹션에서 `utm_check`, `utm_check_error` 등 확인
3. 또는 **보고서** → **참여도** → **이벤트**에서 확인

## 🔧 커스텀 이벤트 추가하기

다른 페이지나 컴포넌트에서 이벤트를 추적하려면:

```typescript
import { trackEvent } from '@/lib/analytics';

// 버튼 클릭 추적
function handleButtonClick() {
  trackEvent('button_click', {
    event_category: 'engagement',
    event_label: 'cta_button',
    button_name: 'signup',
  });
}

// 폼 제출 추적
function handleFormSubmit() {
  trackEvent('form_submit', {
    event_category: 'conversion',
    event_label: 'contact_form',
    form_name: 'contact',
  });
}
```

## 📚 참고 자료

- [Google Analytics 4 공식 문서](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js Third-Party 패키지 문서](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries)
- [GA4 이벤트 가이드](https://developers.google.com/analytics/devguides/collection/ga4/events)

## ⚠️ 주의사항

1. **개인정보 보호**: GDPR, CCPA 등 개인정보 보호 규정을 준수하세요
2. **쿠키 동의**: EU 사용자의 경우 쿠키 동의를 받아야 할 수 있습니다
3. **개발 환경**: 로컬 개발 시에도 GA4 ID가 설정되어 있으면 데이터가 수집됩니다
4. **테스트**: 프로덕션 배포 전에 테스트 속성을 사용하여 검증하세요

