# 새 컴퓨터에서 프로젝트 설정하기

이 문서는 다른 컴퓨터에서 이 프로젝트를 이어서 작업하기 위한 설정 가이드입니다.

## 🚀 빠른 시작 요약

```bash
# 1. Git 저장소 클론
git clone git@github.com:bestkchoi/startmktg.git
cd startmktg

# 2. Cursor에서 프로젝트 열기
# File → Open Folder

# 3. 의존성 설치
npm install

# 4. 환경 변수 설정 (.env.local 파일 생성)
# 기존 컴퓨터의 .env.local 파일 내용 복사하거나
# Supabase Dashboard에서 값 확인

# 5. 개발 서버 실행
npm run dev
```

**필요한 정보:**
- ✅ Git 저장소 URL: `git@github.com:bestkchoi/startmktg.git`
- ✅ 환경 변수 값: 기존 컴퓨터의 `.env.local` 파일 또는 Supabase Dashboard에서 확인
- ✅ Cursor로 개발 (이미 설치되어 있다고 가정)

> 💡 **핵심**: 새 컴퓨터로 옮길 때는 **`.env.local` 파일만 복사**하면 됩니다! 나머지는 모두 Git에서 가져옵니다.

---

## 사전 준비사항

### 1. 필수 소프트웨어 설치

다음 소프트웨어가 설치되어 있어야 합니다:

- **Node.js** v20.18.0 (권장)
  - 설치 확인: `node --version`
  - 현재 프로젝트에서 사용 중인 버전: **v20.18.0**
  - [다운로드](https://nodejs.org/)
  - ⚠️ 다른 버전을 사용할 경우 호환성 문제가 발생할 수 있습니다

- **npm** v10.8.2 (Node.js와 함께 설치됨)
  - 설치 확인: `npm --version`
  - 현재 프로젝트에서 사용 중인 버전: **v10.8.2**

- **Git** v2.47.1 이상 (코드 버전 관리용)
  - 설치 확인: `git --version`
  - 현재 프로젝트에서 사용 중인 버전: **v2.47.1.windows.2**
  - [다운로드](https://git-scm.com/)

- **Cursor** (개발 에디터)
  - 이 프로젝트는 Cursor로 개발합니다
  - [다운로드](https://cursor.sh/)

### 2. 버전 확인하기

새 컴퓨터에서 다음 명령어로 설치된 버전을 확인하세요:

```bash
# Node.js 버전 확인 (v20.18.0 권장)
node --version

# npm 버전 확인 (v10.8.2 권장)
npm --version

# Git 버전 확인 (v2.47.1 이상 권장)
git --version
```

**권장 버전:**
- Node.js: **v20.18.0**
- npm: **v10.8.2**
- Git: **v2.47.1** 이상

> ⚠️ **주의**: 다른 버전을 사용할 경우 호환성 문제가 발생할 수 있습니다. 가능하면 위 버전과 동일하게 설치하는 것을 권장합니다.

### 3. 새 컴퓨터로 옮길 때 복사해야 할 항목

#### ✅ 반드시 복사해야 할 파일

**1. `.env.local` 파일 (필수)**
- 위치: 프로젝트 루트 폴더
- 내용: Supabase URL, API 키 등 환경 변수
- 복사 방법:
  - 기존 컴퓨터에서 `.env.local` 파일을 텍스트 에디터로 열기
  - 전체 내용을 복사
  - 새 컴퓨터에서 `.env.local` 파일을 생성하고 내용 붙여넣기
- ⚠️ **중요**: 이 파일은 Git에 커밋되지 않으므로 **반드시 수동으로 복사**해야 합니다

#### ❌ 복사하지 않아도 되는 항목 (Git에서 자동으로 가져옴)

다음 항목들은 Git 저장소에 포함되어 있어서 `git clone`으로 자동으로 가져옵니다:

- ✅ 모든 소스 코드 (`src/` 폴더)
- ✅ 설정 파일들 (`package.json`, `tsconfig.json`, `tailwind.config.ts` 등)
- ✅ 문서 파일들 (`docs/` 폴더)
- ✅ 마이그레이션 파일들 (`supabase/migrations/` 폴더)
- ✅ 기타 프로젝트 설정 파일들

#### ❌ 복사하지 말아야 할 항목

다음 항목들은 새 컴퓨터에서 다시 생성되므로 복사할 필요가 없습니다:

- ❌ `node_modules/` 폴더 (새 컴퓨터에서 `npm install`로 설치)
- ❌ `.next/` 폴더 (빌드 시 자동 생성)
- ❌ `package-lock.json` (새 컴퓨터에서 `npm install`로 생성)

#### 📋 복사 체크리스트

새 컴퓨터로 옮기기 전에 확인:

- [ ] `.env.local` 파일 내용 확인 (또는 텍스트로 복사)
- [ ] Git 저장소 URL 확인 (`git@github.com:bestkchoi/startmktg.git`)
- [ ] Supabase Dashboard 접속 가능한지 확인 (환경 변수 값 확인용)

### 4. 필요한 정보 확인하기

#### Git 저장소 URL 확인 방법

**방법 1: 기존 컴퓨터에서 확인**
```bash
# 프로젝트 폴더에서 실행
git remote -v
```

**방법 2: GitHub에서 확인**
- GitHub 저장소 페이지에서 확인
- 이 프로젝트의 저장소 URL: `git@github.com:bestkchoi/startmktg.git`
- 또는 HTTPS: `https://github.com/bestkchoi/startmktg.git`

#### 환경 변수 값 확인 방법

**기존 컴퓨터에서 `.env.local` 파일 확인**
- 프로젝트 루트에 있는 `.env.local` 파일을 열어서 값 복사
- ⚠️ 이 파일은 Git에 커밋되지 않으므로 직접 복사해야 합니다

**Supabase Dashboard에서 확인**
1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. **Settings** → **API** 메뉴 클릭
4. 다음 값 확인:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`에 사용
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용

**Google Analytics ID 확인** (선택사항)
- Google Analytics 4 대시보드에서 확인
- 형식: `G-XXXXXXXXXX`

## 설정 단계

### 1단계: 프로젝트 코드 가져오기

#### 방법 A: Git 저장소에서 클론 (권장)

```bash
# SSH 방식 (GitHub SSH 키 설정되어 있는 경우)
git clone git@github.com:bestkchoi/startmktg.git
cd startmktg

# 또는 HTTPS 방식
git clone https://github.com/bestkchoi/startmktg.git
cd startmktg
```

> 💡 **Git 저장소 URL 확인**: 기존 컴퓨터에서 `git remote -v` 명령어로 확인할 수 있습니다.

#### 방법 B: 기존 컴퓨터에서 코드 복사

1. 기존 컴퓨터에서 프로젝트 폴더 전체를 복사
2. 새 컴퓨터의 원하는 위치에 붙여넣기
3. Cursor에서 프로젝트 폴더 열기

### 2단계: 의존성 패키지 설치

```bash
npm install
```

이 명령어는 `package.json`에 정의된 모든 의존성을 설치합니다.

> ⚠️ **주의**: `node_modules` 폴더는 Git에 포함되지 않으므로 반드시 실행해야 합니다.

### 3단계: 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다.

**Cursor에서 생성하는 방법:**
1. Cursor에서 프로젝트 열기
2. 프로젝트 루트에 `.env.local` 파일 생성 (새 파일)
3. 아래 내용 입력

**터미널에서 생성하는 방법:**
```bash
# Windows (PowerShell)
New-Item -Path .env.local -ItemType File

# Windows (Git Bash) / Mac / Linux
touch .env.local
```

`.env.local` 파일에 다음 내용을 추가하세요:

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Analytics 4 (선택)
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX

# Tower 개발 모드 (선택, 개발/테스트용)
TOWER_DEV_MODE=true
```

**환경 변수 값 얻는 방법:**

1. **기존 컴퓨터에서 복사** (가장 쉬운 방법)
   - 기존 컴퓨터의 `.env.local` 파일 내용을 그대로 복사

2. **Supabase Dashboard에서 확인**
   - [Supabase Dashboard](https://app.supabase.com/) → 프로젝트 선택
   - **Settings** → **API** 메뉴
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`에 입력
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 입력

> ⚠️ **중요**: 
> - `.env.local` 파일은 Git에 커밋되지 않습니다 (보안상의 이유)
> - 환경 변수 값은 프로젝트마다 다를 수 있습니다
> - 환경 변수 설정 후 **반드시 서버를 재시작**해야 합니다

### 4단계: 데이터베이스 마이그레이션 확인

Supabase 데이터베이스가 이미 설정되어 있다면 이 단계는 건너뛸 수 있습니다.

새로운 Supabase 프로젝트를 사용하거나 마이그레이션이 필요하다면:

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택 → **SQL Editor** 클릭
3. `supabase/migrations/` 폴더의 SQL 파일들을 순서대로 실행:
   - `20250111_create_user_system.sql`
   - `20250111_create_campaign_system.sql`
   - `20250115_create_start_campaign_system.sql`
   - `20250116_create_tower_system.sql`
   - `20250124_create_utm_checker_logs.sql`
   - `20250125_add_domain_name_to_utm_checker_logs.sql`
   - `20250126_allow_null_brand_id_and_remove_auth_requirement.sql`
   - `20250127_allow_anon_campaign_channels.sql`
   - `20250128_add_meta_ad_names.sql`
   - `20250129_add_google_ad_names.sql`
   - `20250202_add_campaign_description.sql`

> 💡 **팁**: 각 마이그레이션 파일의 내용을 복사하여 SQL Editor에 붙여넣고 **Run** 버튼을 클릭하세요.

### 5단계: Cursor에서 프로젝트 열기

1. Cursor 실행
2. **File** → **Open Folder** (또는 `Ctrl+K Ctrl+O`)
3. 프로젝트 폴더 선택

### 6단계: 개발 서버 실행

**Cursor 터미널에서 실행:**
```bash
npm run dev
```

또는 Cursor의 터미널 패널(`Ctrl+``)에서 실행하세요.

서버가 시작되면 브라우저에서 `http://localhost:3000`으로 접속하여 확인할 수 있습니다.

## 확인 체크리스트

설정이 완료되었는지 다음을 확인하세요:

- [ ] 필수 소프트웨어 버전 확인 완료
  - [ ] Node.js v20.18.0 (또는 호환 버전)
  - [ ] npm v10.8.2 (또는 호환 버전)
  - [ ] Git v2.47.1 이상
- [ ] Git 저장소에서 프로젝트 클론 완료
- [ ] Cursor에서 프로젝트 폴더 열기 완료
- [ ] `npm install` 실행 완료 (에러 없음)
- [ ] `.env.local` 파일 생성 및 환경 변수 설정 완료
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정됨
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정됨
- [ ] `npm run dev` 실행 시 서버가 정상적으로 시작됨
- [ ] 브라우저에서 `http://localhost:3000` 접속 가능
- [ ] `/api/ping` 엔드포인트에서 Supabase 연결 확인 가능
  - 브라우저에서 `http://localhost:3000/api/ping` 접속하여 확인

## 문제 해결

### Node.js 버전이 다른 경우

현재 프로젝트는 Node.js v20.18.0에서 테스트되었습니다. 다른 버전을 사용할 경우:

1. **권장 버전 설치**
   - [Node.js 공식 사이트](https://nodejs.org/)에서 v20.18.0 LTS 버전 다운로드
   - 또는 [nvm](https://github.com/nvm-sh/nvm) (Mac/Linux) 또는 [nvm-windows](https://github.com/coreybutler/nvm-windows) 사용

2. **버전 확인**
   ```bash
   node --version  # v20.18.0이어야 함
   npm --version   # v10.8.2 이상이어야 함
   ```

3. **의존성 재설치**
   ```bash
   rm -rf node_modules package-lock.json  # 또는 Windows: rmdir /s node_modules
   npm install
   ```

### "Supabase 환경 변수가 설정되지 않았습니다" 에러

- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- 환경 변수 값에 따옴표나 공백이 없는지 확인
- 서버를 재시작해보세요 (`Ctrl+C`로 중지 후 `npm run dev` 다시 실행)
- Cursor를 재시작해보세요 (환경 변수 인식 문제일 수 있음)

### Git 저장소 URL을 모르는 경우

기존 컴퓨터에서 확인:
```bash
cd <프로젝트-폴더>
git remote -v
```

또는 GitHub에서 확인:
- GitHub에 로그인
- 저장소 목록에서 `startmktg` 찾기
- 저장소 페이지에서 **Code** 버튼 클릭하여 URL 확인

### "Cannot find module" 에러

- `node_modules` 폴더가 있는지 확인
- 없다면 `npm install` 다시 실행
- `package-lock.json` 파일이 있는지 확인

### 포트 3000이 이미 사용 중인 경우

다른 포트로 실행:

```bash
npm run dev -- -p 3001
```

또는 환경 변수로 설정:

```bash
PORT=3001 npm run dev
```

### 데이터베이스 연결 오류

- Supabase Dashboard에서 프로젝트가 활성화되어 있는지 확인
- `.env.local`의 Supabase URL과 Anon Key가 올바른지 확인
- Supabase 프로젝트의 네트워크 설정 확인 (IP 제한 등)

## 추가 리소스

- [README.md](../../README.md) - 프로젝트 개요 및 기본 사용법
- [Google OAuth 설정](./google_oauth_setup.md) - Google 로그인 설정 방법
- [Analytics 설정](../ANALYTICS_SETUP.md) - Google Analytics 설정 방법
- [Tower 설정 가이드](../TOWER_SETUP_INSTRUCTIONS.md) - Tower 기능 설정 방법

---

**작성일:** 2025-01-29  
**버전:** 1.0

