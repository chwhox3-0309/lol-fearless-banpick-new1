import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get("pageNo") || "1";
  const numOfRows = searchParams.get("numOfRows") || "100";
  const keyword = searchParams.get("keyword") || "";

  const rawServiceKey = process.env.DATA_API_KEY || "";
  let decodedKey = rawServiceKey;
  try {
    decodedKey = decodeURIComponent(rawServiceKey);
  } catch (e) {
    decodedKey = rawServiceKey;
  }

  const baseUrl = "https://apis.data.go.kr/1741000/bakeries/info"; 
  const targetUrl = `${baseUrl}?serviceKey=${encodeURIComponent(decodedKey)}&pageNo=${pageNo}&numOfRows=${numOfRows}&type=json`;

  try {
    const response = await fetch(targetUrl);
    const textData = await response.text();

    // 🔍 1. 공공데이터 서버가 보내준 원본 응답을 터미널에 무조건 출력
    console.log("================ [API 원본 응답 시작] ================");
    console.log(textData.substring(0, 500)); // 앞부분 500자 출력
    console.log("================ [API 원본 응답 끝] ================");

    if (!textData.trim().startsWith("{") && !textData.trim().startsWith("[")) {
      return NextResponse.json({ items: [], error: "공공데이터포털이 JSON이 아닌 응답(에러 XML 등)을 반환했습니다. 인증키나 활용신청 상태를 확인하세요." });
    }

    const data = JSON.parse(textData);
    
    // 🔍 2. 파싱 시도
    let items = 
      data?.response?.body?.items?.item || 
      data?.response?.body?.items || 
      data?.body?.items?.item ||
      data?.body?.items || 
      data?.body ||
      data?.items || 
      [];

    if (items && !Array.isArray(items)) {
      items = [items];
    }

    console.log(`🔍 파싱된 최종 아이템 개수: ${items.length}개`);

    // 검색어 필터링
    let filteredItems = items;
    if (keyword && items.length > 0) {
      const lowerKeyword = keyword.toLowerCase();
      filteredItems = items.filter((item: any) => {
        const name = String(item.bplcNm || item.BPLC_NM || "").toLowerCase();
        const addr = String(item.rdnWhlAddr || item.ROAD_NM_ADDR || item.siteWhlAddr || item.SITE_WHL_ADDR || "").toLowerCase();
        return name.includes(lowerKeyword) || addr.includes(lowerKeyword);
      });
    }

    return NextResponse.json({ items: filteredItems });
  } catch (error: any) {
    console.error("Bakery API Server Error:", error.message);
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }
}
