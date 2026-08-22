import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import Footer from './components/Footer';
import Header from './components/Header';
import AuthSessionProvider from './components/AuthSessionProvider';
import { DraftProvider } from './context/DraftContext';
import KakaoAdFitBanner from './components/KakaoAdFitBanner';
import AdPlaceholder from './components/AdPlaceholder'; // 광고 영역 감싸기용

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LoL 피어리스 밴픽 도구",
  description: "리그 오브 레전드 피어리스 드래프트 밴픽 시뮬레이터",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense Script - next/script로 최적화 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6831227862636699"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen bg-gray-900 text-white`}>
        <AuthSessionProvider>
          <DraftProvider>
            <Header />

            {/* 상단 728x90 메인 광고 구역 (CLS 방지: min-h-[90px]) */}
            <div className="flex justify-center items-center my-4 min-h-[90px] w-full px-4">
              <KakaoAdFitBanner adUnit="DAN-BKOeD7FOllmXhljU" width="728" height="90" />
            </div>

            {/* 메인 컨텐츠 및 양쪽 사이드바 광고 영역 */}
            <div className="flex-grow container mx-auto flex gap-4 px-4 pt-4">
              
              {/* Left Ad Banner (Sticky Sidebar / 데스크톱 전용) */}
              <aside className="hidden xl:block w-[160px] shrink-0">
                <div className="sticky top-20 min-h-[600px] flex items-center justify-center overflow-hidden">
                  <KakaoAdFitBanner adUnit="DAN-eK8ki90VYnVyIHCh" width="160" height="600" />
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-grow min-w-0">{children}</main>

              {/* Right Ad Banner (Sticky Sidebar / 데스크톱 전용) */}
              <aside className="hidden xl:block w-[160px] shrink-0">
                <div className="sticky top-20 min-h-[600px] flex items-center justify-center overflow-hidden">
                  <KakaoAdFitBanner adUnit="DAN-tQduvLZwjD4MPCkY" width="160" height="600" />
                </div>
              </aside>

            </div>

            <Footer />
          </DraftProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
