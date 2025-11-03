import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LoL Fearless Banpick Simulator",
  description: "A League of Legends fearless banpick simulator with multi-language support and AdSense integration.",
};

import Footer from './components/Footer';
import AuthSessionProvider from './components/AuthSessionProvider';
import { DraftProvider } from './context/DraftContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            <main className="flex-grow">{children}</main>
            <Footer />
          </DraftProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}