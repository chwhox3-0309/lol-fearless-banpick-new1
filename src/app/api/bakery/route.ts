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
    
    // 👉 공공데이터포털 응답 구조에서 아이템 배열을 찾는 가장 유연한 탐색 로직
    let items = [];
    
    // 일반적인 공공데이터 표준 구조 탐색
    if (data?.response?.body?.items?.item) {
      items = data.response.body.items.item;
    } else if (data?.response?.body?.items) {
      items = data.response.body.items;
    } else if (data?.body?.items?.item) {
      items = data.body.items.item;
    } else if (data?.body?.items) {
      items = data.body.items;
    } else if (Array.isArray(data?.body)) {
      items = data.body;
    } else if (Array.isArray(data?.items)) {
      items = data.items;
    } else {
      // 구조를 모를 경우 객체 내부에서 배열 타입인 값을 탐색
      const findArray = (obj: any): any[] | null => {
        if (!obj || typeof obj !== "object") return null;
        for (const key of Object.keys(obj)) {
          if (Array.isArray(obj[key])) return obj[key];
          if (typeof obj[key] === "object") {
            const res = findArray(obj[key]);
            if (res) return res;
          }
        }
        return null;
      };
      items = findArray(data) || [];
    }

    if (items && !Array.isArray(items)) {
      items = [items];
    }

    // 서버 단에서 keyword(지역명 또는 상호명) 필터링
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
    console.error("Bakery API Error:", error.message);
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }
}
