import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drwNo = searchParams.get('drwNo');

  if (!drwNo) {
    return NextResponse.json({ error: '회차 번호가 필요합니다.' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`External API failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.returnValue === 'success') {
      return NextResponse.json({
        drwNo: data.drwNo,
        drwNoDate: data.drwNoDate,
        numbers: [
          data.drwtNo1,
          data.drwtNo2,
          data.drwtNo3,
          data.drwtNo4,
          data.drwtNo5,
          data.drwtNo6,
        ],
        bonusNo: data.bnusNo,
      });
    } else {
      // 아직 추첨하지 않은 회차이거나 데이터가 없는 경우
      return NextResponse.json({ error: '해당 회차 데이터가 없습니다.' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Lotto API Error (drwNo: ${drwNo}):`, error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
