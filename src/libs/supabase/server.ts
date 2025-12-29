import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

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

export const createSupabaseServerClient = async (
  config?: SupabaseConfig
) => {
  const { url, anonKey } = resolveConfig(config);
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      async get(name: string) {
        const store = await cookies();
        return store.get(name)?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        try {
          const store = await cookies();
          store.set({ name, value, ...options });
        } catch {
          // noop
        }
      },
      async remove(name: string, options: CookieOptions) {
        try {
          const store = await cookies();
          store.set({ name, value: "", ...options });
        } catch {
          // noop
        }
      },
    },
  });
};


