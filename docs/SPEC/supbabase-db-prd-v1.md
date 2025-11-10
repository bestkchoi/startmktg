supabase-db-prd-v1.md
0. 문서 목적

Start Marketing의 핵심 모듈들(UTM Checker, UTM Builder, Media Mix Planner)을 지원하는 Supabase PostgreSQL 스키마, 보안 정책, 마이그레이션 규칙을 정의한다. 이 문서는 Cursor가 Drizzle ORM 코드, SQL 마이그레이션, API 스키마를 생성할 때 기준이 된다.

1. 범위

테이블, 컬럼, 제약, 인덱스, FK 관계

RLS 정책의 목표 상태와 예시

Drizzle 스키마 스니펫, 샘플 SQL

기본 시드 데이터, 성능 한도, 버전 규칙

2. 용어

Workspace, 하나의 회사 혹은 팀 단위 컨테이너

Project, 워크스페이스 내 하위 단위, 보통 제품, 캠페인, 클라이언트별 분리

Policy, UTM 규칙과 네이밍 룰 JSON 스키마

Check, 검사 실행 요청의 마스터 엔티티

Check Item, 검사된 개별 URL 행

3. ER 개요

엔티티, 관계 요약

workspaces 1 — n workspace_members

workspaces 1 — n projects

workspaces 1 — n policies

projects 1 — n checks

checks 1 — n check_items

workspaces 1 — n audit_logs

users 1 — n workspace_members, 1 — n audit_logs

4. 테이블 정의
4.1 users

목적, Supabase Auth 유저 참조 메타

컬럼

id uuid pk Supabase auth.user.id와 동일

email text not null unique

name text

created_at timestamptz default now()

인덱스, users_email_idx

4.2 workspaces

목적, 과금과 권한 단위

컬럼

id uuid pk default gen_random_uuid()

name text not null

plan text not null default 'free' free, pro, enterprise

created_at timestamptz default now()

인덱스, workspaces_name_idx

4.3 workspace_members

목적, 사용자와 워크스페이스 매핑

컬럼

id uuid pk default gen_random_uuid()

workspace_id uuid not null fk -> workspaces.id

user_id uuid not null fk -> users.id

role text not null owner, admin, member, viewer

created_at timestamptz default now()

제약, unique(workspace_id, user_id)

인덱스, wm_ws_user_idx (workspace_id, user_id)

4.4 projects

목적, 검사 단위 그룹

컬럼

id uuid pk default gen_random_uuid()

workspace_id uuid not null fk -> workspaces.id

name text not null

key text 프로젝트 키, 영문 슬러그

created_at timestamptz default now()

인덱스, projects_ws_created_idx (workspace_id, created_at desc)

4.5 policies

목적, UTM 규칙 JSON 스키마 저장

컬럼

id uuid pk default gen_random_uuid()

workspace_id uuid not null fk -> workspaces.id

name text not null

json_schema jsonb not null

version int not null default 1

is_default boolean not null default false

created_at timestamptz default now()

인덱스, policies_ws_default_idx (workspace_id, is_default desc, created_at desc)

4.6 utm_templates

목적, 생성기에서 쓰는 프리셋

컬럼

id uuid pk default gen_random_uuid()

workspace_id uuid not null fk -> workspaces.id

name text not null

fields jsonb not null 예, 키 밸류 프리셋

created_at timestamptz default now()

4.7 checks

목적, 검사 실행 요청 마스터

컬럼

id uuid pk default gen_random_uuid()

project_id uuid not null fk -> projects.id

requested_by uuid not null fk -> users.id

mode text not null single, batch, file

status text not null queued, running, done, failed

created_at timestamptz default now()

인덱스, checks_project_created_idx (project_id, created_at desc)

4.8 check_items

목적, 개별 URL 검사 결과

컬럼

id uuid pk default gen_random_uuid()

check_id uuid not null fk -> checks.id

url text not null 최대 2048

result jsonb not null 규칙 위반 세부

grade text not null pass, warning, fail

fixed_url text 자동 수정 제안 결과

checked_at timestamptz default now()

인덱스, check_items_check_idx (check_id, checked_at desc)

4.9 audit_logs

목적, 중요 변경사항 감사 기록

컬럼

id uuid pk default gen_random_uuid()

workspace_id uuid not null fk -> workspaces.id

actor_id uuid fk -> users.id

action text not null create_policy, update_policy, run_check 등

entity text not null policy, project, check 등

payload jsonb

created_at timestamptz default now()

인덱스, audit_ws_created_idx (workspace_id, created_at desc)

5. 제약과 유효성

URL 길이, 최대 2048

파라미터 키, 최대 64

파라미터 값, 최대 512

policies.is_default, 워크스페이스당 최대 1개, 트리거로 보장

6. RLS 정책 목표와 예시

전제, Supabase Auth의 JWT, auth.uid() 사용

공통

enable row level security on all tables

접근 정책 요약

users, 자기 자신의 행만 select

workspaces, 멤버십 보유자만 select

workspace_members, 본인이 속한 워크스페이스만 select

projects, 해당 워크스페이스 멤버만 crud, viewer는 read

policies, 해당 워크스페이스 멤버만 crud, viewer는 read

checks, check_items, 프로젝트 소속 워크스페이스 멤버만 read, owner, admin, member는 create

audit_logs, 워크스페이스 멤버만 read

예시, projects select 정책

create policy "projects_select_members_only"
on public.projects
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = projects.workspace_id
      and wm.user_id = auth.uid()
  )
);


예시, checks insert 정책

create policy "checks_insert_members"
on public.checks
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects p
    join public.workspace_members wm on wm.workspace_id = p.workspace_id
    where p.id = checks.project_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner','admin','member')
  )
);

7. 인덱스, 성능, 한도

배치 검사 기본 20,000행까지, check_items(check_id, checked_at desc)로 페이지네이션

대용량 업로드는 스트리밍 파싱, 1,000행 단위 커밋

장문 URL은 text_pattern_ops 필요 없음, prefix 검색 시 별도 gin 인덱스 검토

JSONB 경로 조회가 잦으면 result -> 'issues' 키에 대해 표현식 인덱스 고려

8. 드리즐 스키마 스니펫
import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  plan: text('plan').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  key: text('key'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

9. 샘플 마이그레이션 체크리스트

테이블 생성 순서, users → workspaces → workspace_members → projects → policies → utm_templates → checks → check_items → audit_logs

필수 인덱스 생성

RLS 활성화, 최소 select 정책부터 적용

policies.is_default 유니크 트리거 적용

create unique index on public.policies (workspace_id) where is_default = true;


롤백 스크립트 포함

10. 시드 데이터

workspaces 1개, plan = 'free'

workspace_members, 테스트 사용자 1명, role = 'owner'

policies, 기본 규칙 1건

{
  "requiredParams": ["utm_source","utm_medium","utm_campaign"],
  "case": { "utm_source":"lower","utm_medium":"lower","utm_campaign":"lower" },
  "regexRules": [{ "key":"utm_medium", "pattern":"^(cpc|email|display|social|kakao|sms)$" }],
  "forbiddenChars":[" ",".."]
}

11. API 계약 포인터

POST /api/checks, 입력, projectId, urls[], options, 출력, checkId

GET /api/checks/:id, 요약, 페이징된 check_items

POST /api/policies, 생성, 검증 실패 시 400

모든 요청과 응답은 Zod 스키마로 검증

12. 품질 기준, 수용 조건

스키마 마이그레이션이 빈 DB에서 1회 실행으로 성공

RLS 활성 상태에서 비회원 접근이 모두 거부됨

1,000행 배치 검사에서 P95 DB 응답 100ms 이하

policies.is_default 중복 불가가 보장됨

13. 버전 관리

파일 헤더의 v1.x로 문서 버전 관리

스키마 변경은 semver 준수, 파괴적 변경 시 v2.0.0