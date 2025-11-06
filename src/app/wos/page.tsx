import Link from 'next/link';
import KakaoAdFitBanner from '@/app/components/KakaoAdFitBanner';

const WosPage = () => {
  return (
    <div>
      <nav className="bg-gray-800 p-4 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-center">
        <div className="flex flex-wrap justify-center sm:flex-nowrap sm:space-x-4 space-y-2 sm:space-y-0">
          <Link href="/wos/notices" className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-center">
            공지사항
          </Link>
          <Link href="/wos/calculator" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded text-center">
            병사 비율 계산기
          </Link>
        </div>
      </nav>
      <div className="container mx-auto p-4 text-white">
        <h1 className="text-3xl font-bold mb-4">화이트 아웃 서바이벌 (Whiteout Survival)</h1>
        <p className="mb-4">
          화이트 아웃 서바이벌은 혹독한 빙하기의 종말 이후를 배경으로 하는 생존 전략 게임입니다. 플레이어는 인류의 마지막 도시를 이끌고 극한의 환경과 자원 부족, 그리고 다른 생존자들과의 경쟁 속에서 살아남아야 합니다.
        </p>
        <p className="mb-4">
          게임의 핵심은 '용광로'를 중심으로 기지를 건설하고 확장하는 것입니다. 용광로는 생존에 필수적인 온기를 제공하며, 플레이어는 나무, 석탄, 식량, 철과 같은 자원을 관리하여 용광로를 가동하고 건물을 짓고 장비를 제작해야 합니다.
        </p>
        <p>
          예측할 수 없는 날씨 변화, 야수들의 공격, 그리고 다른 생존자들의 습격과 같은 다양한 위협에 맞서 전략적인 결정을 내려야 합니다. 영웅을 모집하고 팀을 구성하여 탐험과 전투를 통해 자원을 획득하고 생존을 위한 싸움을 계속해야 합니다.
        </p>
      </div>
      <KakaoAdFitBanner />
    </div>
  );
};

export default WosPage;
