import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CutBase | Debate Evidence Evaluator",
  description: "An argument-quality engine for competitive debate evidence. Evaluate credibility, recency, specificity, quote integrity, and claim fit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]">
        {/* Navigation Header */}
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="font-mono text-lg font-bold tracking-tight select-none">
                // CUTBASE<span className="text-[var(--muted-foreground)]">_</span>
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium">
                <Link href="/" className="hover:text-[var(--foreground)] text-[var(--muted-foreground)] transition-colors">
                  Analyze
                </Link>
                <Link href="/history" className="hover:text-[var(--foreground)] text-[var(--muted-foreground)] transition-colors">
                  History
                </Link>
                <Link href="/compare" className="hover:text-[var(--foreground)] text-[var(--muted-foreground)] transition-colors">
                  Compare
                </Link>
                <Link href="/analytics" className="hover:text-[var(--foreground)] text-[var(--muted-foreground)] transition-colors">
                  Analytics
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
