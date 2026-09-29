import type { Metadata } from "next";
import { Bricolage_Grotesque, Onest, Geist_Mono } from "next/font/google";

import { AccentProvider } from "@/components/theme/accent-provider";
import { AccentScript } from "@/components/theme/accent-script";
import "./globals.css";

/** Display face — headings, stats, the wordmark. 600–800, tight tracking. */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage-src",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

/** UI + body face. */
const onest = Onest({
  variable: "--font-onest-src",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Numbers, years, hours, overlines. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Savepoint",
  description: "A game backlog tracker built around what you own.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${onest.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <AccentScript />
      </head>
      <body className="flex min-h-full flex-col">
        <AccentProvider>{children}</AccentProvider>
      </body>
    </html>
  );
}
