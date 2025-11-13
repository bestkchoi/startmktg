import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* 중앙 컨텐츠 영역 */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="flex flex-col items-center gap-16 max-w-2xl w-full">
          {/* 브랜드명 */}
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-[-0.02em] uppercase text-center leading-tight">
              START MKTG
            </h1>
            <div className="h-px w-16 bg-neutral-300" />
          </div>

               {/* 메뉴 */}
               <nav className="flex flex-col items-center gap-6 w-full">
                 <Link
                   href="/utmchecker"
                   className="group relative w-full sm:w-auto min-w-[280px] px-10 py-4 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-none transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                 >
                   <span className="relative z-10 flex items-center justify-center gap-2">
                     <span className="text-[10px] font-mono tracking-wider opacity-60 group-hover:opacity-100">
                       01
                     </span>
                     <span className="h-3 w-px bg-neutral-300 group-hover:bg-white" />
                     <span>UTM Checker</span>
                   </span>
                 </Link>
                 <Link
                   href="/login"
                   className="group relative w-full sm:w-auto min-w-[280px] px-10 py-4 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-none transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                 >
                   <span className="relative z-10 flex items-center justify-center gap-2">
                     <span className="text-[10px] font-mono tracking-wider opacity-60 group-hover:opacity-100">
                       02
                     </span>
                     <span className="h-3 w-px bg-neutral-300 group-hover:bg-white" />
                     <span>로그인</span>
                   </span>
                 </Link>
               </nav>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 text-xs text-neutral-400 text-center tracking-wide">
        © {new Date().getFullYear()} Start Marketing
      </footer>
    </main>
  );
}


