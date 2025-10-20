import React from 'react';
import Link from 'next/link';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-24 sm:pt-20">
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">이용약관</h1>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">서비스 이용</h2>
            <p className="text-gray-300 leading-relaxed">
              본 롤 밴픽 시뮬레이터는 리그 오브 레전드 플레이어들을 위한 무료 도구입니다. 회원가입 없이 누구나 자유롭게 이용할 수 있습니다.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">주요 기능</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>피어리스(Fearless) 밴픽 시뮬레이션:</strong> LCK와 같은 프로 리그에서 사용되는 피어리스 룰을 적용하여, 이전 세트에서 사용한 챔피언을 다시 선택할 수 없는 밴픽을 연습할 수 있습니다.</li>
              <li><strong>밴픽 저장 및 공유:</strong> 진행한 밴픽 기록은 자동으로 브라우저에 저장되어 언제든지 다시 확인할 수 있습니다.</li>
              <li><strong>챔피언 데이터 제공:</strong> 최신 게임 버전에 맞는 챔피언 목록을 제공하여 정확한 시뮬레이션이 가능합니다.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">책임의 한계</h2>
            <p className="text-gray-300 leading-relaxed">
              본 서비스는 팬에 의해 개발된 비공식 애플리케이션이며, 라이엇 게임즈(Riot Games)와는 관련이 없습니다. 서비스 이용으로 인해 발생하는 모든 문제에 대해 개발자는 책임을 지지 않습니다.
            </p>
          </section>
          <div className="text-center pt-4">
            <Link href="/" className="text-blue-400 hover:underline">
              메인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
