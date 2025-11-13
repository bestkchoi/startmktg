"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "gmail_only":
          setError("Gmail 계정만 회원가입할 수 있습니다.");
          break;
        case "missing_code":
          setError("인증 코드가 없습니다. 다시 시도해주세요.");
          break;
        case "auth_failed":
          setError("인증에 실패했습니다. 다시 시도해주세요.");
          break;
        case "oauth_failed":
          setError("OAuth 인증에 실패했습니다. 다시 시도해주세요.");
          break;
        default:
          setError("로그인 중 오류가 발생했습니다.");
      }
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      window.location.href = "/api/auth/google";
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* 중앙 컨텐츠 영역 */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="flex flex-col items-center gap-12 max-w-md w-full">
          {/* 브랜드명 */}
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-5xl sm:text-6xl font-light tracking-[-0.02em] uppercase text-center leading-tight">
              START MKTG
            </h1>
            <div className="h-px w-16 bg-neutral-300" />
          </div>

          {/* 로그인 폼 */}
          <div className="w-full flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-xl font-light mb-2">로그인</h2>
              <p className="text-sm text-neutral-500">
                Gmail 계정으로 로그인하세요
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                {error}
              </div>
            )}

            {/* Gmail 로그인 버튼 */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group relative w-full border border-neutral-900 bg-neutral-900 px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-white hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <span>로그인 중...</span>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Gmail로 로그인</span>
                  </>
                )}
              </span>
            </button>

            {/* 안내 문구 */}
            <div className="text-xs text-neutral-400 text-center">
              <p>Gmail 계정만 회원가입할 수 있습니다.</p>
              <p className="mt-1">
                로그인 시{" "}
                <Link
                  href="/terms"
                  className="underline hover:text-neutral-600"
                >
                  이용약관
                </Link>
                과{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-neutral-600"
                >
                  개인정보처리방침
                </Link>
                에 동의하게 됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 text-xs text-neutral-400 text-center tracking-wide">
        © {new Date().getFullYear()} Start Marketing
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
        <div className="text-sm text-neutral-500">로딩 중...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

