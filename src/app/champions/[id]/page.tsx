// app/champions/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `${params.id} 피어리스 밴픽 분석 & 세트별 상성 | LoL Fearless`,
    description: `${params.id}의 피어리스 포맷 세트별 픽률, 라인 자원 고갈률 및 대체 챔피언 정보를 확인하세요.`,
    openGraph: {
      title: `${params.id} 피어리스 드래프트 가이드`,
      images: [`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${params.id}_0.jpg`],
    },
  };
}
