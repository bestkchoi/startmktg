"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok || !data.ok) {
          router.push("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
        <div className="text-sm text-neutral-500">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-20 sm:px-6">
        {/* 헤더 */}
        <header className="mb-16 flex items-center justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] uppercase mb-2">
              Dashboard
            </h1>
            <div className="h-px w-16 bg-neutral-300" />
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            로그아웃
          </button>
        </header>

        {/* 사용자 정보 */}
        <section className="mb-12 border border-neutral-200 bg-neutral-50 p-6">
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || user.email}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-medium">
                {user.name || "사용자"}
              </h2>
              <p className="text-sm text-neutral-500">{user.email}</p>
            </div>
          </div>
        </section>

        {/* 메뉴 */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-700 mb-4">서비스</h3>
          <Link
            href="/utmchecker"
            className="group block border border-neutral-200 bg-white px-6 py-4 text-sm font-medium text-neutral-900 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider opacity-60 group-hover:opacity-100">
                01
              </span>
              <span className="h-3 w-px bg-neutral-300 group-hover:bg-white" />
              <span>UTM Checker</span>
            </span>
          </Link>
        </section>

        {/* 워크스페이스 섹션 (향후 구현) */}
        <section className="mt-12">
          <h3 className="text-sm font-medium text-neutral-700 mb-4">
            워크스페이스
          </h3>
          <div className="border border-neutral-200 bg-neutral-50 px-6 py-8 text-center text-sm text-neutral-500">
            <p>워크스페이스 기능은 곧 제공될 예정입니다.</p>
            <p className="mt-2">
              회사 도메인 이메일 인증을 통해 워크스페이스에 접근할 수 있습니다.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

