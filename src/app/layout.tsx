import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@/components/analytics/google-analytics";
import { PageViewTracker } from "@/components/analytics/page-view";

export const metadata: Metadata = {
  title: {
    default: "Start Marketing - UTM Tools & Campaign Management",
    template: "%s | Start Marketing",
  },
  description: "Free UTM parameter checker, campaign management tools, and marketing analytics platform.",
  keywords: ["UTM", "UTM checker", "marketing tools", "campaign management", "analytics"],
  authors: [{ name: "Start Marketing" }],
  creator: "Start Marketing",
  publisher: "Start Marketing",
  metadataBase: new URL("https://startmktg.com"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://startmktg.com",
    siteName: "Start Marketing",
    title: "Start Marketing - UTM Tools & Campaign Management",
    description: "Free UTM parameter checker, campaign management tools, and marketing analytics platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Start Marketing",
    description: "Free UTM parameter checker, campaign management tools, and marketing analytics platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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


