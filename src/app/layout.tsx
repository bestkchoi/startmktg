import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@/components/analytics/google-analytics";
import { PageViewTracker } from "@/components/analytics/page-view";

export const metadata: Metadata = {
  title: "Start Marketing",
  description: "UTM Checker Base"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster />
        <Analytics />
        <PageViewTracker />
      </body>
    </html>
  );
}


