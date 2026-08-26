import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get("pageNo") || "1";
  const numOfRows = searchParams.get("numOfRows") || "1000";
  const keyword = searchParams.get("keyword") || "";

  const rawServiceKey = process.env.DATA_API_KEY || "";
  
  if (!rawServiceKey) {
    return NextResponse.json({ items: [], error: "API Key is missing" }, { status: 500 });
  }

  let decodedKey = rawServiceKey;
  try {
    decodedKey = decodeURIComponent(rawServiceKey);
  } catch (e) {
    decodedKey = rawServiceKey;
  }

  const baseUrl = "https://apis.data.go.kr/1741000/bakeries/info"; 
  const params = new URLSearchParams({
    serviceKey: decodedKey,
    pageNo: pageNo,
    numOfRows: numOfRows,
    type: "json"
  });

  const targetUrl = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      headers: { "Accept": "application/json, text/plain, */*" },
      cache: "no-store"
    });

    const textData = await response.text();

    if (textData.trim().startsWith("<")) {
      return NextResponse.json({ items: [], error: "공공데이터 서버가 XML 포맷을 반환했습니다." });
    }

    const data = JSON.parse(textData);
    
    let rawItems = 
      data?.response?.body?.items?.item || 
      data?.response?.body?.items || 
      data?.body?.items?.item ||
      data?.body?.items || 
      data?.body ||
      data?.items || 
      [];

    if (rawItems && !Array.isArray(rawItems)) {
      rawItems = [rawItems];
    }

    // 🔍 데이터 정제: 상호명과 주소가 뒤바뀌거나 누락되지 않도록 필드 정규화
    const items = rawItems.map((item: any) => {
      // 가능한 모든 상호명 후보 키 탐색
      const name = 
        item.bplcNm || item.BPLC_NM || item.upsoNm || item.UPSO_NM || 
        item.bzplNm || item.BZPL_NM || item.title || item.name || "상호명 없음";

      // 가능한 모든 주소 후보 키 탐색 (도로명 우선, 지번 차선)
      const rdnAddr = 
        item.rdnWhlAddr || item.ROAD_NM_ADDR || item.rdnmAdr || 
        item.siteWhlAddr || item.SITE_WHL_ADDR || item.locaddr || "";

      const tel = 
        item.bplcInfoTelno || item.BPLC_INFO_TELNO || item.telNo || 
        item.TEL_NO || item.sntUptaeNm || "번호 없음";

      const state = 
        item.dtlStateNm || item.DTL_STATE_NM || item.trdStateNm || "영업중";

      return {
        bplcNm: String(name).trim(),
        rdnWhlAddr: String(rdnAddr).trim(),
        bplcInfoTelno: String(tel).trim(),
        dtlStateNm: String(state).trim(),
      };
    });

    // 검색어 필터링
    let filteredItems = items;
    if (keyword && items.length > 0) {
      const lowerKeyword = keyword.toLowerCase();
      filteredItems = items.filter((item: any) => {
        return (
          item.bplcNm.toLowerCase().includes(lowerKeyword) || 
          item.rdnWhlAddr.toLowerCase().includes(lowerKeyword)
        );
      });
    }

    return NextResponse.json({ items: filteredItems });
  } catch (error: any) {
    console.error("🚨 API Route Error:", error.message);
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }
}
