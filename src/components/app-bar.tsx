import Link from "next/link";

export function AppBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            U
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Start Marketing
            </span>
            <span className="text-base font-semibold text-foreground">
              UTM Checker
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="/"
            className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-border hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/utmchecker"
            className="rounded-full border border-border bg-primary px-3 py-1.5 text-primary-foreground transition hover:bg-primary/90"
          >
            UTM Lab
          </Link>
        </nav>
      </div>
    </header>
  );
}


