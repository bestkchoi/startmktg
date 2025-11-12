## 1. 개요

**서비스명:** Start Marketing

**목적:** 브랜드 첫인상 제공, UTM Checker로 이동 유도

**컨셉:** 초심플, 흰 배경, 블랙 폰트, 불필요한 장식 없음

---

## 2. 구성요소

| 구역 | 내용 |
| --- | --- |
| 브랜드명 | **START MKTG** (대문자, 중앙 정렬) |
| 메뉴 | `01. UTM Checker` (클릭 시 `/utmchecker` 이동) |
| 배경 | 흰색 |
| 폰트 | 기본 Sans-serif (예: Inter, Noto Sans) |
| 정렬 | 모든 요소 중앙 정렬, 여백 충분히 확보 |
| 반응형 | 모바일 기준 가운데 정렬 유지 |

---

## 3. 페이지 구조

```
Main Page
 ├── 중앙 정렬 컨테이너
 │    ├── Text: START MKTG
 │    └── Button: 01. UTM Checker
 └── Footer (선택사항): © Start Marketing

```

---

## 4. UX Flow

1. 사용자가 `/` 접속
2. 중앙에 **START MKTG** 문구 확인
3. 아래 **01. UTM Checker** 클릭
4. `/utmchecker`로 이동

---

## 5. 기술 메모

- Framework: Next.js 15
- Hosting: Vercel
- SEO: Title = "Start Marketing"
- URL 구조: `/` (메인), `/utmchecker` (서비스 페이지)