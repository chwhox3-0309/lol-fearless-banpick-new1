import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Footer from './components/Footer';
import Header from './components/Header';
import AuthSessionProvider from './components/AuthSessionProvider';
import { DraftProvider } from './context/DraftContext';
import KakaoAdFitBanner from './components/KakaoAdFitBanner';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// 💡 1. 검색엔진 최적화(SEO)를 위한 메타데이터 확장 설정
export const metadata: Metadata = {
  metadataBase: new URL("https://lol-fearless-banpick-new1.vercel.app"), // 본인의 실제 배포 도메인 주소로 수정해주세요
  title: {
    default: "Draft Lab - 리그 오브 레전드 피어리스 밴픽 시뮬레이터",
    template: "%s | Draft Lab",
  },
  description: "리그 오브 레전드(LoL) e스포츠 최신 메타인 피어리스 밴픽(Fearless Draft)을 직접 시뮬레이션하고 클라이언트 전적을 연동할 수 있는 밴픽 툴입니다.",
  keywords: ["리그 오브 레전드", "롤", "피어리스 밴픽", "밴픽 시뮬레이터", "Draft Lab", "LoL Draft", "내전 밴픽"],
  authors: [{ name: "Draft Lab" }],
  creator: "Draft Lab",
  publisher: "Draft Lab",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // 💡 소셜 미디어 공유 시 노출되는 오픈그래프(OG) 설정 (네이버, 카카오, 디스코드 등 유입 극대화)
  openGraph: {
    title: "Draft Lab - 리그 오브 레전드 피어리스 밴픽 시뮬레이터",
    description: "피어리스 룰을 적용한 롤 밴픽 시뮬레이션 및 전적 연동 시스템을 이용해보세요.",
    url: "/",
    siteName: "Draft Lab",
    locale: "ko_KR",
    type: "website",
  },
  // 💡 트위터 카드 설정
  twitter: {
    card: "summary_large_image",
    title: "Draft Lab - 리그 오브 레전드 피어리스 밴픽 시뮬레이터",
    description: "리그 오브 레전드 피어리스 드래프트 밴픽 시뮬레이터",
  },
  // 💡 검색엔진 로봇 수집 허용 설정
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
  verification: {
    google: "UZIYILxWNJsn2WsWqAnwmXU7___vcONlDefeZc9EDUw",
    // 네이버 서치어드바이저 소유권 확인용 HTML metaTag가 있다면 여기에 추가할 수 있습니다.
    // naver: "네이버에서 발급받은 인증 코드",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 💡 2. 검색엔진이 웹사이트의 성격을 명확히 이해하도록 돕는 구조화된 데이터 (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Draft Lab",
    "url": "https://lol-fearless-banpick-new1.vercel.app",
    "description": "리그 오브 레전드 피어리스 드래프트 밴픽 시뮬레이터",
    "inLanguage": "ko",
  };

  return (
    <html lang="ko">
      <head>
        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6831227862636699"
          crossOrigin="anonymous"
        ></script>
        
        {/* 네이버 서치 */>
        <meta name="naver-site-verification" content="de00eea3f80247e3989341df17f79d48111def10" />

        
        {/* 💡 구조화된 데이터 삽입 (구글 SEO 가독성 향상) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen bg-gray-900 text-white`}>
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
          </DraftProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
