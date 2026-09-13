import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Footer from './components/Footer';
import Header from './components/Header';
import AuthSessionProvider from './components/AuthSessionProvider';
import { DraftProvider } from './context/DraftContext';
import KakaoAdFitBanner from './components/KakaoAdFitBanner';
import AdsenseBanner from './components/AdsenseBanner';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Draft Lab.",
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
        <meta name="google-site-verification" content="UZIYILxWNJsn2WsWqAnwmXU7___vcONlDefeZc9EDUw" />
        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6831227862636699"
          crossOrigin="anonymous"
        ></script>
        <meta name="naver-site-verification" content="de00eea3f80247e3989341df17f79d48111def10" />
      </head>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen bg-gray-900 text-white pb-20 relative`}>
        <AuthSessionProvider>
          <DraftProvider>
            <Header />

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

            {/* 🟢 UX 수익화 최적화: 하단 Sticky (Anchor) 광고 바 */}
            {/* z-index를 30으로 설정하여 모달(z-50)과 툴팁보다 낮추고 밴픽 컨트롤 요소와 겹치지 않게 배치 */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-950/90 backdrop-blur-md border-t border-indigo-500/30 flex flex-col items-center justify-center py-1 px-4 shadow-2xl min-h-[60px]">
              <span className="text-[9px] text-gray-500 mb-0.5 tracking-wider uppercase font-semibold">ADVERTISEMENT</span>
              
              {/* 구글 애드센스 사용 시: 아래 AdsenseBanner 컴포넌트의 슬롯 ID를 입력해 사용하세요 */}
              {/* <AdsenseBanner dataAdSlot="YOUR_STICKY_AD_SLOT_ID" dataAdFormat="horizontal" /> */}
              
              {/* Kakao AdFit 사용 시 예시 (320x50 또는 728x90) */}
              <div className="w-full flex justify-center items-center overflow-hidden">
                <KakaoAdFitBanner adUnit="DAN-BKOeD7FOllmXhljU" width="728" height="90" />
              </div>
            </div>

          </DraftProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
