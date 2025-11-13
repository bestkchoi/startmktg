-- 회원가입 시스템을 위한 데이터베이스 마이그레이션
-- users 테이블 확장 및 user_company_emails 테이블 생성

-- 1. users 테이블 확장 (avatar_url 추가)
-- 기존 users 테이블이 있다면 ALTER, 없으면 CREATE
DO $$
BEGIN
  -- users 테이블이 없으면 생성
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    CREATE TABLE public.users (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email text NOT NULL UNIQUE,
      name text,
      avatar_url text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    CREATE INDEX users_email_idx ON public.users(email);
  ELSE
    -- 기존 테이블에 컬럼 추가 (없는 경우만)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
      ALTER TABLE public.users ADD COLUMN avatar_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
      ALTER TABLE public.users ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
  END IF;
END $$;

-- 2. user_company_emails 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_company_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  company_email text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  verification_token text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, company_email),
  UNIQUE(workspace_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS user_company_emails_user_idx ON public.user_company_emails(user_id);
CREATE INDEX IF NOT EXISTS user_company_emails_workspace_idx ON public.user_company_emails(workspace_id);
CREATE INDEX IF NOT EXISTS user_company_emails_token_idx ON public.user_company_emails(verification_token) WHERE verification_token IS NOT NULL;

-- 3. updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 테이블 updated_at 트리거
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. RLS (Row Level Security) 정책

-- users 테이블 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 정보만 조회 가능
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 사용자는 자신의 정보만 업데이트 가능
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- user_company_emails 테이블 RLS
ALTER TABLE public.user_company_emails ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 회사 이메일 정보만 조회 가능
DROP POLICY IF EXISTS "user_company_emails_select_own" ON public.user_company_emails;
CREATE POLICY "user_company_emails_select_own"
  ON public.user_company_emails
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 회사 이메일을 생성 가능
DROP POLICY IF EXISTS "user_company_emails_insert_own" ON public.user_company_emails;
CREATE POLICY "user_company_emails_insert_own"
  ON public.user_company_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 회사 이메일을 업데이트 가능 (인증 토큰 업데이트 등)
DROP POLICY IF EXISTS "user_company_emails_update_own" ON public.user_company_emails;
CREATE POLICY "user_company_emails_update_own"
  ON public.user_company_emails
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Gmail 도메인 검증 함수 (애플리케이션 레벨에서도 사용)
CREATE OR REPLACE FUNCTION public.is_gmail_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '@gmail\.com$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. 인증 토큰 생성 함수
CREATE OR REPLACE FUNCTION public.generate_verification_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

