import Link from 'next/link';

const WosNoticesPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/wos" className="text-blue-400 hover:underline">
          &larr; WOS 메인으로 돌아가기
        </Link>
      </div>
      <h1 className="text-2xl font-bold">WOS 공지사항</h1>
      <p>WOS 공지사항 페이지입니다.</p>
    </div>
  );
};

export default WosNoticesPage;
