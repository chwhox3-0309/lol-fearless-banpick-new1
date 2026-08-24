'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">관리자 통합 대시보드</h1>
            <p className="text-gray-400">사이트 데이터 및 유동적 챔피언 포지션 통계를 관리합니다.</p>
          </div>
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm transition-all"
          >
            ← 메인 사이트로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 챔피언 통계 및 포지션 관리 카드 */}
          <Link 
            href="/admin/stats" 
            className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 transition-all block group"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-400 group-hover:text-blue-300">
              📊 챔피언 포지션 통계 관리
            </h2>
            <p className="text-gray-400 text-sm">
              유저 시뮬레이션을 통해 쌓인 챔피언별/포지션별 픽·밴 횟수를 확인하고 관리합니다.
            </p>
          </Link>

          {/* 밴픽 로그 관리 카드 */}
          <Link 
            href="/admin/drafts" 
            className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 transition-all block group"
          >
            <h2 className="text-xl font-semibold mb-2 text-green-400 group-hover:text-green-300">
              📝 밴픽 시뮬레이션 로그
            </h2>
            <p className="text-gray-400 text-sm">
              최근 진행된 밴픽 세션 기록을 모니터링하고 관리합니다.
            </p>
          </Link>

          {/* 공지사항/개발일지 관리 카드 */}
          <Link 
            href="/admin/posts" 
            className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 transition-all block group"
          >
            <h2 className="text-xl font-semibold mb-2 text-yellow-400 group-hover:text-yellow-300">
              📢 공지사항 및 개발일지 관리
            </h2>
            <p className="text-gray-400 text-sm">
              사이트 공지와 업데이트 소식을 하나의 화면에서 작성하고 관리합니다.
            </p>
          </Link>
          
          {/* J-Pop / 일드 OST 관리 카드 (새로 추가됨) */}
          <Link 
            href="/admin/jpop" 
            className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-purple-500 transition-all block group"
          >
            <h2 className="text-xl font-semibold mb-2 text-purple-400 group-hover:text-purple-300">
              🎵 J-Pop / 일드 OST 관리
            </h2>
            <p className="text-gray-400 text-sm">
              분기별, 방송사별 일본 드라마 OST 아카이브 게시물을 등록, 수정 및 관리합니다.
            </p>
          </Link>

          {/* 사이트 설정 카드 (확장용) */}
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl opacity-60 cursor-not-allowed lg:col-span-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-400">⚙️ 메타 설정 (준비중)</h2>
            <p className="text-gray-400 text-sm">
              글로벌 패치 버전 및 시스템 환경설정을 관리합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
