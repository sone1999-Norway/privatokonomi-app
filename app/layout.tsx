import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrivatOkonomi",
  description: "En enkel abonnementsbasert webapp for privatokonomi i Norge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="site-header-inner">
              <Link href="/" className="brand-mark">
                <span className="brand-title">PrivatOkonomi</span>
                <span className="brand-subtitle">Enklere oversikt i hverdagen</span>
              </Link>

              <SiteNav />

              <div className="site-actions">
                <Link href="/login" className="secondary-link nav-link">
                  Logg inn
                </Link>
                <Link href="/signup" className="primary-link nav-link">
                  Opprett konto
                </Link>
              </div>
            </div>
          </header>

          {children}

          <footer className="site-footer">
            <div className="site-footer-inner">
              <p className="site-footer-title">PrivatOkonomi</p>
              <p>
                En enkel webtjeneste for deg som vil ha bedre oversikt over inntekter,
                utgifter og hva du har igjen å bruke.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
