-- Tower Admin System 마이그레이션
-- Company, Role Tree, Membership, Platform Data, Monitoring 로그 관리

-- 0. updated_at 자동 업데이트 트리거 함수 (없는 경우 생성)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. users 테이블 확장 (Tower 요구사항에 맞게)
DO $$
BEGIN
  -- google_sub_id 컬럼 추가 (없는 경우만)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_sub_id') THEN
    ALTER TABLE public.users ADD COLUMN google_sub_id text UNIQUE;
    CREATE INDEX IF NOT EXISTS users_google_sub_id_idx ON public.users(google_sub_id) WHERE google_sub_id IS NOT NULL;
  END IF;
  
  -- photo_url 컬럼 추가 (없는 경우만, avatar_url이 있으면 그것을 사용)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'photo_url') THEN
    ALTER TABLE public.users ADD COLUMN photo_url text;
  END IF;
  
  -- is_tower_operator 컬럼 추가 (Tower Admin 접근 권한)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_tower_operator') THEN
    ALTER TABLE public.users ADD COLUMN is_tower_operator boolean DEFAULT false;
    CREATE INDEX IF NOT EXISTS users_is_tower_operator_idx ON public.users(is_tower_operator) WHERE is_tower_operator = true;
  END IF;
END $$;

-- 2. companies 테이블
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  country text NOT NULL,
  business_number text NOT NULL,
  domain text,
  industry text,
  request_note text,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(country, business_number)
);

CREATE INDEX IF NOT EXISTS companies_country_business_idx ON public.companies(country, business_number);
CREATE INDEX IF NOT EXISTS companies_created_by_idx ON public.companies(created_by);

-- 3. company_roles 테이블
CREATE TABLE IF NOT EXISTS public.company_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role_name text NOT NULL,
  display_name text NOT NULL,
  level integer NOT NULL CHECK (level >= 1 AND level <= 5),
  parent_role_id uuid REFERENCES public.company_roles(id) ON DELETE SET NULL,
  region text, -- KR, JP, VN 등
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, role_name)
);

CREATE INDEX IF NOT EXISTS company_roles_company_idx ON public.company_roles(company_id);
CREATE INDEX IF NOT EXISTS company_roles_parent_idx ON public.company_roles(parent_role_id);
CREATE INDEX IF NOT EXISTS company_roles_level_idx ON public.company_roles(level);
CREATE INDEX IF NOT EXISTS company_roles_active_idx ON public.company_roles(is_active) WHERE is_active = true;

-- 4. company_memberships 테이블
CREATE TABLE IF NOT EXISTS public.company_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.company_roles(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS company_memberships_company_idx ON public.company_memberships(company_id);
CREATE INDEX IF NOT EXISTS company_memberships_user_idx ON public.company_memberships(user_id);
CREATE INDEX IF NOT EXISTS company_memberships_role_idx ON public.company_memberships(role_id);
CREATE INDEX IF NOT EXISTS company_memberships_status_idx ON public.company_memberships(status);

-- 5. invitations 테이블
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invite_email text NOT NULL,
  role_id uuid NOT NULL REFERENCES public.company_roles(id) ON DELETE RESTRICT,
  region text,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  request_note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invitations_company_idx ON public.invitations(company_id);
CREATE INDEX IF NOT EXISTS invitations_token_idx ON public.invitations(token);
CREATE INDEX IF NOT EXISTS invitations_email_idx ON public.invitations(invite_email);
CREATE INDEX IF NOT EXISTS invitations_status_idx ON public.invitations(status);

-- 6. access_requests 테이블
CREATE TABLE IF NOT EXISTS public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  requested_role_id uuid NOT NULL REFERENCES public.company_roles(id) ON DELETE RESTRICT,
  region text,
  request_note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS access_requests_company_idx ON public.access_requests(company_id);
CREATE INDEX IF NOT EXISTS access_requests_user_idx ON public.access_requests(user_id);
CREATE INDEX IF NOT EXISTS access_requests_status_idx ON public.access_requests(status);

-- 7. Platform Data 테이블들

-- 7-1. landing_channels
CREATE TABLE IF NOT EXISTS public.landing_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  channel_name text NOT NULL,
  channel_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, channel_name)
);

CREATE INDEX IF NOT EXISTS landing_channels_company_idx ON public.landing_channels(company_id);
CREATE INDEX IF NOT EXISTS landing_channels_active_idx ON public.landing_channels(is_active) WHERE is_active = true;

-- 7-2. media
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  media_name text NOT NULL,
  media_type text, -- google, meta, tiktok 등
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, media_name)
);

CREATE INDEX IF NOT EXISTS media_company_idx ON public.media(company_id);
CREATE INDEX IF NOT EXISTS media_active_idx ON public.media(is_active) WHERE is_active = true;

-- 7-3. objectives
CREATE TABLE IF NOT EXISTS public.objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  objective_name text NOT NULL,
  objective_type text, -- conversions, traffic, awareness 등
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, media_id, objective_name)
);

CREATE INDEX IF NOT EXISTS objectives_company_idx ON public.objectives(company_id);
CREATE INDEX IF NOT EXISTS objectives_media_idx ON public.objectives(media_id);
CREATE INDEX IF NOT EXISTS objectives_active_idx ON public.objectives(is_active) WHERE is_active = true;

-- 7-4. utm_rules
CREATE TABLE IF NOT EXISTS public.utm_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rule_name text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_id text,
  layer_rule jsonb, -- 층위 규칙 관리
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, rule_name)
);

CREATE INDEX IF NOT EXISTS utm_rules_company_idx ON public.utm_rules(company_id);
CREATE INDEX IF NOT EXISTS utm_rules_active_idx ON public.utm_rules(is_active) WHERE is_active = true;

-- 7-5. custom_rules (Pro Account 전용)
CREATE TABLE IF NOT EXISTS public.custom_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rule_name text NOT NULL,
  rule_config jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, rule_name)
);

CREATE INDEX IF NOT EXISTS custom_rules_company_idx ON public.custom_rules(company_id);
CREATE INDEX IF NOT EXISTS custom_rules_active_idx ON public.custom_rules(is_active) WHERE is_active = true;

-- 8. Monitoring Logs 테이블들

-- 8-1. logs_campaign
CREATE TABLE IF NOT EXISTS public.logs_campaign (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL, -- created, updated, deleted
  campaign_id text,
  campaign_name text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS logs_campaign_company_idx ON public.logs_campaign(company_id);
CREATE INDEX IF NOT EXISTS logs_campaign_user_idx ON public.logs_campaign(user_id);
CREATE INDEX IF NOT EXISTS logs_campaign_created_idx ON public.logs_campaign(created_at DESC);

-- 8-2. logs_media
CREATE TABLE IF NOT EXISTS public.logs_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL, -- created, updated, deleted, deactivated
  entity_type text NOT NULL, -- media, objective, landing_channel, utm_rule, custom_rule
  entity_id uuid,
  entity_name text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS logs_media_company_idx ON public.logs_media(company_id);
CREATE INDEX IF NOT EXISTS logs_media_user_idx ON public.logs_media(user_id);
CREATE INDEX IF NOT EXISTS logs_media_created_idx ON public.logs_media(created_at DESC);

-- 8-3. logs_utm_generator
CREATE TABLE IF NOT EXISTS public.logs_utm_generator (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  base_url text NOT NULL,
  utm_params jsonb,
  generated_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS logs_utm_generator_company_idx ON public.logs_utm_generator(company_id);
CREATE INDEX IF NOT EXISTS logs_utm_generator_user_idx ON public.logs_utm_generator(user_id);
CREATE INDEX IF NOT EXISTS logs_utm_generator_created_idx ON public.logs_utm_generator(created_at DESC);

-- 8-4. logs_utm_checker
CREATE TABLE IF NOT EXISTS public.logs_utm_checker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  checked_url text NOT NULL,
  parsed_result jsonb,
  is_valid boolean,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS logs_utm_checker_company_idx ON public.logs_utm_checker(company_id);
CREATE INDEX IF NOT EXISTS logs_utm_checker_user_idx ON public.logs_utm_checker(user_id);
CREATE INDEX IF NOT EXISTS logs_utm_checker_created_idx ON public.logs_utm_checker(created_at DESC);

-- 8-5. logs_invitation
CREATE TABLE IF NOT EXISTS public.logs_invitation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invitation_id uuid REFERENCES public.invitations(id) ON DELETE SET NULL,
  action text NOT NULL, -- sent, accepted, expired, cancelled
  invite_email text NOT NULL,
  role_id uuid,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS logs_invitation_company_idx ON public.logs_invitation(company_id);
CREATE INDEX IF NOT EXISTS logs_invitation_created_idx ON public.logs_invitation(created_at DESC);

-- 8-6. logs_access_request
CREATE TABLE IF NOT EXISTS public.logs_access_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  access_request_id uuid REFERENCES public.access_requests(id) ON DELETE SET NULL,
  action text NOT NULL, -- requested, approved, rejected
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  requested_role_id uuid,
  reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS logs_access_request_company_idx ON public.logs_access_request(company_id);
CREATE INDEX IF NOT EXISTS logs_access_request_created_idx ON public.logs_access_request(created_at DESC);

-- 8-7. logs_error
CREATE TABLE IF NOT EXISTS public.logs_error (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  error_code text NOT NULL,
  message text NOT NULL,
  origin text, -- 어디서 발생했는지 (api, component, service 등)
  stack_trace text,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS logs_error_company_idx ON public.logs_error(company_id);
CREATE INDEX IF NOT EXISTS logs_error_code_idx ON public.logs_error(error_code);
CREATE INDEX IF NOT EXISTS logs_error_created_idx ON public.logs_error(created_at DESC);

-- 9. 트리거 함수들

-- updated_at 자동 업데이트 트리거 (기존 함수 재사용)
DO $$
BEGIN
  -- companies
  DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
  CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  
  -- company_roles
  DROP TRIGGER IF EXISTS update_company_roles_updated_at ON public.company_roles;
  CREATE TRIGGER update_company_roles_updated_at
    BEFORE UPDATE ON public.company_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  
  -- company_memberships
  DROP TRIGGER IF EXISTS update_company_memberships_updated_at ON public.company_memberships;
  CREATE TRIGGER update_company_memberships_updated_at
    BEFORE UPDATE ON public.company_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  
  -- invitations
  DROP TRIGGER IF EXISTS update_invitations_updated_at ON public.invitations;
  CREATE TRIGGER update_invitations_updated_at
    BEFORE UPDATE ON public.invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  
  -- access_requests
  DROP TRIGGER IF EXISTS update_access_requests_updated_at ON public.access_requests;
  CREATE TRIGGER update_access_requests_updated_at
    BEFORE UPDATE ON public.access_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  
  -- landing_channels
  DROP TRIGGER IF EXISTS update_landing_channels_updated_at ON public.landing_channels;
  CREATE TRIGGER update_landing_channels_updated_at
    BEFORE UPDATE ON public.landing_channels
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  
  -- media
  DROP TRIGGER IF EXISTS update_media_updated_at ON public.media;
  CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON public.media
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  
  -- objectives
  DROP TRIGGER IF EXISTS update_objectives_updated_at ON public.objectives;
  CREATE TRIGGER update_objectives_updated_at
    BEFORE UPDATE ON public.objectives
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  
  -- utm_rules
  DROP TRIGGER IF EXISTS update_utm_rules_updated_at ON public.utm_rules;
  CREATE TRIGGER update_utm_rules_updated_at
    BEFORE UPDATE ON public.utm_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  
  -- custom_rules
  DROP TRIGGER IF EXISTS update_custom_rules_updated_at ON public.custom_rules;
  CREATE TRIGGER update_custom_rules_updated_at
    BEFORE UPDATE ON public.custom_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
END $$;

-- 10. Role Tree 검증 함수
CREATE OR REPLACE FUNCTION public.validate_role_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  -- LV5는 parent_role_id가 없어야 함
  IF NEW.level = 5 AND NEW.parent_role_id IS NOT NULL THEN
    RAISE EXCEPTION 'LV5 역할은 parent_role_id를 가질 수 없습니다';
  END IF;
  
  -- parent가 있으면 parent의 level이 더 높아야 함
  IF NEW.parent_role_id IS NOT NULL THEN
    IF (SELECT level FROM public.company_roles WHERE id = NEW.parent_role_id) <= NEW.level THEN
      RAISE EXCEPTION '부모 역할의 레벨이 자식 역할보다 높아야 합니다';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- company_roles에 검증 트리거 추가
DROP TRIGGER IF EXISTS validate_role_hierarchy_trigger ON public.company_roles;
CREATE TRIGGER validate_role_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON public.company_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_hierarchy();

-- 11. 기본 Role Tree 생성 함수 (Company 생성 시 자동 호출)
CREATE OR REPLACE FUNCTION public.create_default_role_tree(p_company_id uuid, p_created_by uuid)
RETURNS void AS $$
DECLARE
  v_lv5_role_id uuid;
  v_lv4_role_id uuid;
BEGIN
  -- LV5 Global Master 생성 (Tower 소유)
  INSERT INTO public.company_roles (company_id, role_name, display_name, level, parent_role_id, is_active)
  VALUES (p_company_id, 'global_master', 'Global Master', 5, NULL, true)
  RETURNING id INTO v_lv5_role_id;
  
  -- LV4 HQ Admin 생성
  INSERT INTO public.company_roles (company_id, role_name, display_name, level, parent_role_id, is_active)
  VALUES (p_company_id, 'hq_admin', 'HQ Admin', 4, v_lv5_role_id, true)
  RETURNING id INTO v_lv4_role_id;
  
  -- 요청자가 있으면 LV4 권한 부여 (Direct Creation인 경우 p_created_by가 null일 수 있음)
  IF p_created_by IS NOT NULL THEN
    -- 기존 멤버십이 있는지 확인
    INSERT INTO public.company_memberships (company_id, user_id, role_id, status)
    VALUES (p_company_id, p_created_by, v_lv4_role_id, 'active')
    ON CONFLICT (company_id, user_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 12. 초대 토큰 생성 함수 (선택적 - 클라이언트 측에서도 생성 가능)
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 13. RLS (Row Level Security) 정책
-- Tower는 내부 운영자 전용이므로, 특별한 권한 관리가 필요합니다.
-- 여기서는 기본적인 RLS만 설정하고, 실제 권한은 애플리케이션 레벨에서 관리합니다.

-- companies: Tower Operator만 접근 가능 (애플리케이션 레벨에서 제어)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- company_roles: Company 멤버만 조회 가능
ALTER TABLE public.company_roles ENABLE ROW LEVEL SECURITY;

-- company_memberships: 자신의 멤버십만 조회 가능
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;

-- invitations: Company 멤버만 조회 가능
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- access_requests: 자신의 요청만 조회 가능
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- platform data: Company 멤버만 조회 가능
ALTER TABLE public.landing_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utm_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_rules ENABLE ROW LEVEL SECURITY;

-- logs: Company 멤버만 조회 가능
ALTER TABLE public.logs_campaign ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_utm_generator ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_utm_checker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_invitation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_access_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_error ENABLE ROW LEVEL SECURITY;

-- 참고: 실제 RLS 정책은 Tower Operator 권한에 따라 애플리케이션 레벨에서 구현됩니다.
-- 여기서는 기본 구조만 설정합니다.

