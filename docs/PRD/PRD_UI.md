# START MKTG 공통 UI 디자인 가이드라인

- 문서명: START MKTG 공통 UI 디자인 가이드라인
- 버전: v1.0
- 작성일: 2025-01-24
- 목적: START MKTG 프로젝트의 모든 페이지에서 일관된 UI/UX를 유지하기 위한 디자인 표준 정의

---

## 1. 디자인 철학

### 1.1 핵심 원칙
- **미니멀리즘**: 불필요한 장식 제거, 핵심 기능에 집중
- **일관성**: 모든 페이지에서 동일한 디자인 언어 사용
- **가독성**: 명확한 계층 구조와 충분한 여백
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

### 1.2 컬러 팔레트
- **배경**: `bg-white` (순수 흰색)
- **주요 텍스트**: `text-neutral-900` (거의 검은색)
- **보조 텍스트**: `text-neutral-500`, `text-neutral-600`, `text-neutral-700`
- **약한 텍스트**: `text-neutral-400`
- **테두리**: `border-neutral-200` (기본), `border-neutral-900` (강조/포커스)
- **배경 강조**: `bg-neutral-50` (에러/정보 박스)

---

## 2. 타이포그래피

### 2.1 페이지 제목 (H1)
```tsx
<h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] uppercase mb-3">
  페이지 제목
</h1>
<div className="h-px w-16 bg-neutral-300" />
```

**특징:**
- `font-light`: 얇은 폰트 두께
- `tracking-[-0.02em]`: 약간 좁은 자간
- `uppercase`: 대문자 변환
- 제목 아래 구분선: `h-px w-16 bg-neutral-300`

### 2.2 섹션 제목 (H2)
```tsx
<h2 className="text-2xl font-light tracking-[-0.02em] uppercase mb-6">
  섹션 제목
</h2>
```

### 2.3 본문 텍스트
- **일반 텍스트**: `text-sm text-neutral-900`
- **보조 텍스트**: `text-sm text-neutral-600`
- **약한 텍스트**: `text-xs text-neutral-500` 또는 `text-xs text-neutral-400`

### 2.4 라벨
```tsx
<label className="block text-sm font-medium text-neutral-900 mb-2">
  라벨명 <span className="text-neutral-500">*</span>
</label>
```

---

## 3. 레이아웃

### 3.1 페이지 컨테이너
```tsx
<div className="min-h-screen bg-white text-neutral-900">
  <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-20 sm:px-6">
    {/* 컨텐츠 */}
  </main>
</div>
```

**특징:**
- `max-w-4xl`: 넓은 컨텐츠 (테이블, 리스트 포함)
- `max-w-2xl`: 일반 폼 페이지
- `max-w-md`: 좁은 컨텐츠 (로그인 등)
- `px-4 py-20 sm:px-6`: 반응형 패딩

### 3.2 중앙 정렬 컨텐츠 (메인 페이지 등)
```tsx
<div className="flex-1 flex items-center justify-center px-4 py-20">
  <div className="flex flex-col items-center gap-16 max-w-2xl w-full">
    {/* 컨텐츠 */}
  </div>
</div>
```

---

## 4. 입력 필드

### 4.1 기본 입력 필드
```tsx
<input
  type="text"
  className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
/>
```

**특징:**
- `border-neutral-200`: 기본 테두리
- `focus:border-neutral-900`: 포커스 시 검은 테두리
- `focus:bg-neutral-50`: 포커스 시 배경색 변화
- `transition-all duration-300`: 부드러운 전환 효과
- `rounded-none`: 둥근 모서리 없음 (미니멀)

### 4.2 에러 메시지
```tsx
{errors.field && (
  <p className="mt-1 text-xs text-neutral-500">{errors.field}</p>
)}
```

### 4.3 필수 표시
```tsx
<label>
  필드명 <span className="text-neutral-500">*</span>
</label>
```

---

## 5. 버튼

### 5.1 주요 버튼 (Primary)
```tsx
<button
  type="submit"
  className="px-6 py-3 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
>
  버튼 텍스트
</button>
```

**특징:**
- 기본: 검은 배경, 흰 텍스트
- 호버: 흰 배경, 검은 텍스트 (역전 효과)
- `transition-all duration-300`: 부드러운 전환

### 5.2 보조 버튼 (Secondary)
```tsx
<button
  type="button"
  className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
>
  취소
</button>
```

### 5.3 링크 스타일 버튼 (메인 페이지)
```tsx
<Link
  href="/path"
  className="group relative w-full sm:w-auto min-w-[280px] px-10 py-4 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-none transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
>
  <span className="relative z-10 flex items-center justify-center gap-2">
    <span className="text-[10px] font-mono tracking-wider opacity-60 group-hover:opacity-100">
      01
    </span>
    <span className="h-3 w-px bg-neutral-300 group-hover:bg-white" />
    <span>버튼 텍스트</span>
  </span>
</Link>
```

---

## 6. 카드 및 박스

### 6.1 정보/에러 박스
```tsx
<div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-700">
  메시지 내용
</div>
```

### 6.2 미리보기 박스
```tsx
<div className="border border-neutral-200 bg-neutral-50 px-6 py-4">
  <p className="text-xs text-neutral-600 mb-1">라벨:</p>
  <p className="text-base font-mono font-medium text-neutral-900">
    미리보기 내용
  </p>
</div>
```

### 6.3 테이블 컨테이너
```tsx
<div className="border border-neutral-200">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b border-neutral-200 bg-neutral-50">
        <th className="text-left p-4 text-sm font-medium text-neutral-900">
          헤더
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-neutral-100 transition-colors hover:bg-neutral-50">
        <td className="p-4 text-sm text-neutral-700">데이터</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 7. 폼 레이아웃

### 7.1 기본 폼 구조
```tsx
<form onSubmit={handleSubmit} className="space-y-8">
  {/* 필드 그룹 */}
  <div>
    <label className="block text-sm font-medium text-neutral-900 mb-2">
      필드명 <span className="text-neutral-500">*</span>
    </label>
    <input
      type="text"
      className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
    />
    {errors.field && (
      <p className="mt-1 text-xs text-neutral-500">{errors.field}</p>
    )}
  </div>

  {/* 액션 버튼 */}
  <div className="flex items-center justify-end gap-4 pt-6">
    <button type="button" className="...">취소</button>
    <button type="submit" className="...">제출</button>
  </div>
</form>
```

### 7.2 인라인 입력 폼 (검색 등)
```tsx
<form className="flex w-full flex-col gap-4 sm:flex-row sm:items-stretch">
  <input
    type="text"
    className="flex-1 border border-neutral-200 bg-white px-6 py-4 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
  />
  <button
    type="submit"
    className="min-w-[140px] border border-neutral-900 bg-neutral-900 px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-white hover:text-neutral-900"
  >
    검색
  </button>
</form>
```

---

## 8. 리스트 및 아이템

### 8.1 간단한 리스트
```tsx
<ul className="space-y-2">
  <li className="flex items-center justify-between p-4 border-b border-neutral-100">
    <span className="text-sm font-medium text-neutral-900">항목</span>
    <span className="text-sm text-neutral-600">값</span>
  </li>
</ul>
```

### 8.2 구분선이 있는 리스트
```tsx
<div className="divide-y divide-neutral-100">
  <div className="flex items-start justify-between p-4">
    <span className="text-sm font-medium text-neutral-900 w-40">라벨:</span>
    <span className="text-sm text-neutral-700 flex-1 text-right">값</span>
  </div>
</div>
```

---

## 9. 모달

### 9.1 기본 모달
```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white p-8 max-w-md w-full mx-4 border border-neutral-200">
    <h2 className="text-2xl font-light mb-4">모달 제목</h2>
    {/* 컨텐츠 */}
    <div className="flex gap-3 mt-6">
      <button className="...">확인</button>
      <button className="...">취소</button>
    </div>
  </div>
</div>
```

---

## 10. Footer

### 10.1 기본 Footer
```tsx
<footer className="py-8 px-4 text-xs text-neutral-400 text-center tracking-wide">
  © {new Date().getFullYear()} Start Marketing
</footer>
```

---

## 11. 상태 표시

### 11.1 로딩 상태
```tsx
<div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
  <div className="text-sm text-neutral-500">로딩 중...</div>
</div>
```

### 11.2 빈 상태
```tsx
<div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-500 text-center">
  데이터가 없습니다.
</div>
```

---

## 12. 반응형 디자인

### 12.1 브레이크포인트
- `sm:` 640px 이상
- `md:` 768px 이상
- `lg:` 1024px 이상

### 12.2 반응형 패턴
```tsx
// 텍스트 크기
className="text-4xl sm:text-5xl"

// 패딩
className="px-4 py-20 sm:px-6"

// 레이아웃
className="flex flex-col sm:flex-row"

// 너비
className="w-full sm:w-auto"
```

---

## 13. 접근성

### 13.1 필수 요소
- 모든 입력 필드에 `<label>` 연결
- 포커스 가능한 요소에 `focus-visible:outline` 적용
- 버튼에 `disabled` 상태 스타일링
- 스크린 리더용 `sr-only` 클래스 사용

### 13.2 예시
```tsx
<label htmlFor="input-id" className="sr-only">
  숨겨진 라벨
</label>
<input id="input-id" ... />
```

---

## 14. 금지 사항

### 14.1 사용하지 말아야 할 것
- ❌ 둥근 모서리 (`rounded-md`, `rounded-lg` 등) - `rounded-none`만 사용
- ❌ 그림자 (`shadow`, `shadow-sm` 등) - 평면 디자인 유지
- ❌ 밝은 색상 (primary, secondary 등) - neutral 팔레트만 사용
- ❌ shadcn/ui 컴포넌트 직접 사용 - 커스텀 스타일 적용 필요
- ❌ 과도한 애니메이션 - `transition-all duration-300`만 사용

### 14.2 대체 방법
- shadcn/ui 컴포넌트 사용 시 스타일을 START MKTG 디자인에 맞게 오버라이드
- 또는 네이티브 HTML 요소 + Tailwind 클래스 직접 사용 권장

---

## 15. 코드 예시

### 15.1 완전한 페이지 예시
```tsx
export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-20 sm:px-6">
        {/* 헤더 */}
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] uppercase mb-3">
            페이지 제목
          </h1>
          <div className="h-px w-16 bg-neutral-300" />
        </header>

        {/* 컨텐츠 */}
        <div className="space-y-8">
          {/* 폼 필드 */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              필드명 <span className="text-neutral-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
            />
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900"
            >
              제출
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## 16. 체크리스트

새 페이지 개발 시 다음 사항을 확인하세요:

- [ ] 배경색: `bg-white text-neutral-900` 사용
- [ ] 제목: `font-light tracking-[-0.02em] uppercase` 적용
- [ ] 제목 아래 구분선: `h-px w-16 bg-neutral-300` 포함
- [ ] 입력 필드: `border-neutral-200`, `focus:border-neutral-900` 적용
- [ ] 버튼: 검은 배경, 호버 시 역전 효과
- [ ] 둥근 모서리 없음 (`rounded-none` 또는 미지정)
- [ ] 그림자 없음
- [ ] 반응형 디자인 적용 (`sm:`, `md:` 등)
- [ ] 접근성 고려 (label, focus-visible 등)
- [ ] Footer 포함 (필요한 경우)

---

## 17. 참고 파일

실제 구현 예시는 다음 파일들을 참고하세요:

- 메인 페이지: `src/app/page.tsx`
- 로그인 페이지: `src/app/login/page.tsx`
- UTM Checker: `src/app/utmchecker/page.tsx`
- Start Campaign: `src/app/start-campaign/page.tsx`

---

**마지막 업데이트**: 2025-01-24  
**유지보수**: 새로운 페이지 개발 시 이 문서를 참조하여 일관된 디자인을 유지하세요.

