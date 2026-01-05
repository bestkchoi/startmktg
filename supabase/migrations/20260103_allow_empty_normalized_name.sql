-- campaigns 테이블의 normalized_name CHECK 제약조건 수정
-- 빈 문자열을 허용하도록 변경 (검색광고 선택 시 normalized_name이 없을 수 있음)

-- 기존 제약조건 삭제
ALTER TABLE public.campaigns 
DROP CONSTRAINT IF EXISTS campaigns_normalized_name_check;

-- 새로운 제약조건 추가: 빈 문자열이거나 소문자로 시작해야 함
ALTER TABLE public.campaigns 
ADD CONSTRAINT campaigns_normalized_name_check CHECK (
  normalized_name = '' OR normalized_name ~ '^[a-z]'
);


