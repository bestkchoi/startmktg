import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  anonKey: string;
};

const resolveConfig = (config?: SupabaseConfig): SupabaseConfig => {
  if (config) {
    return config;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  return { url, anonKey };
};

export const createSupabaseServerClient = (
  config?: SupabaseConfig
): SupabaseClient => {
  const { url, anonKey } = resolveConfig(config);
  return createClient(url, anonKey);
};


