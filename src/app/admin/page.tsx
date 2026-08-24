'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">관리자 통합 대시보드</h1>
        <p className="text-gray-400 mb-8">사이트 데이터 및 유동적 챔피언 포지션 통계를 관리합니다.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 챔피언 통계 및 포지션 관리 카드 */}
          <Link 
            href="/admin/stats" 
            className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 transition-all block"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-400">📊 챔피언 포지션 통계 관리</h2>
            <p className="text-gray-400 text-sm">
              유저 시뮬레이션을 통해 쌓인 챔피언별/포지션별 픽·밴 횟수를 확인하고 조정합니다.
            </p>
          </Link>

          {/* 밴픽 로그 관리 카드 */}
          <Link 
            href="/admin/drafts" 
            className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 transition-all block"
          >
            <h2 className="text-xl font-semibold mb-2 text-green-400">📝 밴픽 시뮬레이션 로그</h2>
            <p className="text-gray-400 text-sm">
              최근 진행된 밴픽 세션 기록을 모니터링하고 관리합니다.
            </p>
          </Link>

          {/* 사이트 설정 카드 (확장용) */}
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl opacity-60">
            <h2 className="text-xl font-semibold mb-2 text-purple-400">⚙️ 메타 설정 (준비중)</h2>
            <p className="text-gray-400 text-sm">
              글로벌 패치 버전 및 시스템 환경설정을 관리합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
