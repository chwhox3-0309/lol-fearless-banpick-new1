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

            {/* [추가 권장] 하단 광고 영역 (푸터 바로 위, 다크 테마 박스로 감싸기) */}
          <section className="w-full max-w-[1280px] mx-auto px-4 my-8">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
              <div className="w-full flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                  <span>📢</span> 스폰서 광고
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">AD</span>
              </div>
              <div className="w-full flex justify-center overflow-hidden rounded-xl bg-white/5 p-2">
                {/* 구글 애드센스 등 하단 광고 유닛 삽입부 */}
              </div>
            </div>
          </section>

            
            <Footer />
          </DraftProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
