'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import Footer from './components/Footer';
import AuthSessionProvider from './components/AuthSessionProvider';
import { DraftProvider } from './context/DraftContext';
import Header from './components/Header';
import KakaoAdFitBanner from "./components/KakaoAdFitBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isWosPage = pathname.startsWith('/wos');

  return (
    <html lang="ko">
      <head>
        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6831227862636699"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${inter.variable} antialiased flex flex-col min-h-screen bg-gray-900`}
      >
        <AuthSessionProvider>
          <DraftProvider>
            <Header />
            <div className="flex-grow container mx-auto flex">
              {/* Left Ad Banner */}
              {!isWosPage && (
                <aside className="w-48 hidden lg:block flex-shrink-0 mr-4">
                  <div className="sticky top-20">
                    <KakaoAdFitBanner />
                  </div>
                </aside>
              )}

              {/* Main Content */}
              <main className="flex-grow">{children}</main>

              {/* Right Ad Banner */}
              {!isWosPage && (
                <aside className="w-48 hidden lg:block flex-shrink-0 ml-4">
                  <div className="sticky top-20">
                    <KakaoAdFitBanner />
                  </div>
                </aside>
              )}
            </div>
            <Footer />
          </DraftProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}