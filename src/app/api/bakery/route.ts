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

  // 공공데이터포털 표준 제과점/식품위생업소 목록 조회 엔드포인트 표준
  const baseUrl = "https://apis.data.go.kr/1741000/bakeries/getBakeryList"; 
  const targetUrl = `${baseUrl}?serviceKey=${encodeURIComponent(decodedKey)}&pageNo=${pageNo}&numOfRows=${numOfRows}&type=json`;

  try {
    const response = await fetch(targetUrl);
    const textData = await response.text();

    // 응답이 JSON 형식이 아닐 경우 (에러 XML, 인증키 오류 등)
    if (!textData.trim().startsWith("{") && !textData.trim().startsWith("[")) {
      console.error("API 응답이 JSON이 아닙니다:", textData.substring(0, 200));
      return NextResponse.json({ items: [], error: "Invalid API Response Format" });
    }

    const data = JSON.parse(textData);
    
    // 공공데이터포털 다양한 응답 구조 대응 파싱
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

    // 서버 단에서 keyword가 포함된 데이터만 안전하게 필터링
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
