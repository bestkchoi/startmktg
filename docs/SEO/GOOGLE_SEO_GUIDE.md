# 구글 SEO 가이드

## 1. Google Search Console 등록

### 1단계: Google Search Console 접속
1. https://search.google.com/search-console 접속
2. Google 계정으로 로그인

### 2단계: 속성 추가
1. "속성 추가" 클릭
2. 속성 유형 선택:
   - **도메인**: `startmktg.com` (전체 도메인)
   - 또는 **URL 접두어**: `https://startmktg.com` (특정 프로토콜/경로)

### 3단계: 소유권 확인
**도메인 방식:**
- DNS 레코드 추가 (TXT 레코드)
- 도메인 관리자에서 DNS 설정에 Google이 제공한 TXT 레코드 추가
- 확인 완료까지 몇 분~24시간 소요

**URL 접두어 방식:**
- HTML 파일 다운로드 후 사이트 루트에 업로드
- 또는 HTML 태그를 `<head>`에 추가
- 또는 Google Analytics 연동
- 또는 Google Tag Manager 연동

### 4단계: 사이트맵 제출
1. Google Search Console → "색인 생성" → "Sitemaps"
2. 사이트맵 URL 입력:
   ```
   https://startmktg.com/sitemap.xml
   ```
3. "제출" 클릭

## 2. 사이트맵 확인

현재 구현된 사이트맵:
- `/sitemap.xml` - 메인 사이트맵 인덱스
- `/sitemap-ko.xml` - 한국어 페이지
- `/sitemap-en.xml` - 영어 페이지
- `/sitemap-jp.xml` - 일본어 페이지

각 사이트맵에 포함된 페이지:
- 홈페이지 (`/ko`, `/en`, `/jp`)
- UTM 체커 (`/ko/utm-checker`)
- 캠페인 목록 (`/ko/campaigns`)
- 대시보드 (`/ko/dashboard`)

## 3. robots.txt 확인

현재 robots.txt는 `/robots.txt` 경로에서 제공됩니다.
확인 방법: `https://startmktg.com/robots.txt`

## 4. SEO 최적화 체크리스트

### ✅ 이미 구현된 항목
- [x] 사이트맵 (sitemap.xml)
- [x] robots.txt
- [x] 메타 태그 (title, description)
- [x] Open Graph 태그
- [x] Twitter Card 태그
- [x] 구조화된 데이터 (JSON-LD)
- [x] 다국어 지원 (hreflang)
- [x] Canonical URL

### 🔄 개선 가능한 항목
- [ ] 동적 페이지를 사이트맵에 추가 (캠페인 상세 페이지 등)
- [ ] 페이지별 고유한 메타 설명
- [ ] 이미지 alt 텍스트 최적화
- [ ] 내부 링크 구조 개선
- [ ] 페이지 로딩 속도 최적화
- [ ] 모바일 친화성 확인

## 5. Google Search Console 주요 기능

### 색인 생성
- **URL 검사**: 특정 URL이 색인되었는지 확인
- **사이트맵**: 사이트맵 제출 및 상태 확인
- **제거**: 특정 URL을 검색 결과에서 제거

### 성능
- **검색 성능**: 검색 노출, 클릭 수, 평균 CTR, 평균 순위 확인
- **페이지 경험**: Core Web Vitals 점수 확인

### 개선사항
- **모바일 사용성**: 모바일 친화성 문제 확인
- **보안 문제**: 보안 이슈 알림

### 링크
- **외부 링크**: 다른 사이트에서의 링크 확인
- **내부 링크**: 사이트 내부 링크 구조 확인

## 6. 추가 SEO 팁

### 콘텐츠 최적화
1. **고품질 콘텐츠 작성**
   - 사용자에게 유용한 정보 제공
   - 정기적으로 콘텐츠 업데이트

2. **키워드 최적화**
   - 자연스러운 키워드 사용
   - 과도한 키워드 반복 피하기

3. **내부 링크**
   - 관련 페이지 간 링크 연결
   - 사용자 경로 개선

### 기술적 SEO
1. **페이지 속도**
   - 이미지 최적화
   - 코드 최소화
   - CDN 사용

2. **모바일 최적화**
   - 반응형 디자인
   - 모바일 페이지 속도 확인

3. **HTTPS**
   - SSL 인증서 설치 (Vercel에서 자동 제공)

## 7. 다음 단계

1. ✅ Google Search Console 등록
2. ✅ 사이트맵 제출
3. ✅ robots.txt 확인
4. 🔄 정기적으로 성능 모니터링
5. 🔄 콘텐츠 업데이트 및 최적화

## 참고 자료

- [Google Search Console 도움말](https://support.google.com/webmasters)
- [Google SEO 시작하기 가이드](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Next.js SEO 가이드](https://nextjs.org/learn/seo/introduction-to-seo)


