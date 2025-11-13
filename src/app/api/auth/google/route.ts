import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error?.message || "oauth_failed")}`,
        origin
      )
    );
  }

  return NextResponse.redirect(data.url);
}

