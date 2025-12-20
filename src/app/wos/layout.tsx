import Link from 'next/link';
import WosAdBanner from '../components/WosAdBanner';

export default function WosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav className="bg-gray-800 p-4 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-center">
        <div className="flex flex-wrap justify-center sm:flex-nowrap sm:space-x-4 space-y-2 sm:space-y-0">
          <Link href="/wos/notices" className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-center">
            공지사항
          </Link>
          <Link href="/wos/calculator" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded text-center">
            WOS 통합 계산기
          </Link>
        </div>
      </nav>
      {children}
      <WosAdBanner />
    </section>
  );
}
