import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get("pageNo") || "1";
  const numOfRows = searchParams.get("numOfRows") || "1000";
  const keyword = searchParams.get("keyword") || "";

  const rawServiceKey = process.env.PUBLIC_DATA_API_KEY || "";
  let decodedKey = rawServiceKey;
  try {
    decodedKey = decodeURIComponent(rawServiceKey);
  } catch (e) {
    decodedKey = rawServiceKey;
  }

  // 👉 화면에 나온 상세기능 경로(/info)에 맞춘 올바른 엔드포인트
  const baseUrl = "https://apis.data.go.kr/1741000/bakeries/info"; 
  const targetUrl = `${baseUrl}?serviceKey=${encodeURIComponent(decodedKey)}&pageNo=${pageNo}&numOfRows=${numOfRows}&type=json`;

  try {
    const response = await fetch(targetUrl);
    const textData = await response.text();

    if (!textData.trim().startsWith("{") && !textData.trim().startsWith("[")) {
      console.error("API 응답이 JSON이 아닙니다:", textData.substring(0, 200));
      return NextResponse.json({ items: [], error: "Invalid API Response Format" });
    }

    const data = JSON.parse(textData);
    
    // 응답 데이터 파싱 구조 대응
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

    // 서버 단에서 keyword 필터링 수행
    let filteredItems = items;
    if (keyword && items.length > 0) {
      filteredItems = items.filter((item: any) => {
        const name = item.bplcNm || item.BPLC_NM || "";
        const addr = item.rdnWhlAddr || item.ROAD_NM_ADDR || item.siteWhlAddr || item.SITE_WHL_ADDR || "";
        return name.includes(keyword) || addr.includes(keyword);
      });
    }

    return NextResponse.json({ items: filteredItems });
  } catch (error: any) {
    console.error("Bakery API Error:", error.message);
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }
}
