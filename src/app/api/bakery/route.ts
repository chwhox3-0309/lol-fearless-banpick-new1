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

    // 🔍 각 필드가 밀리지 않도록 고정 키값으로 정확히 매핑
    const items = rawItems.map((item: any) => {
      return {
        // 상호명 전용 필드들만 정확히 매칭
        bplcNm: String(
          item.bplcNm || item.BPLC_NM || item.upsoNm || item.UPSO_NM || item.bzplNm || "상호명 없음"
        ).trim(),
        
        // 도로명 주소 전용 필드들만 정확히 매칭
        rdnWhlAddr: String(
          item.rdnWhlAddr || item.ROAD_NM_ADDR || item.rdnmAdr || ""
        ).trim(),

        // 지번 주소 전용 필드
        siteWhlAddr: String(
          item.siteWhlAddr || item.SITE_WHL_ADDR || item.locaddr || ""
        ).trim(),

        // 전화번호 전용 필드
        bplcInfoTelno: String(
          item.bplcInfoTelno || item.BPLC_INFO_TELNO || item.telNo || item.TEL_NO || "번호 없음"
        ).trim(),

        // 영업 상태 전용 필드
        dtlStateNm: String(
          item.dtlStateNm || item.DTL_STATE_NM || item.trdStateNm || "영업중"
        ).trim(),
      };
    });

    // 검색어 필터링 (입력한 지역어나 상호명이 상호명 혹은 주소에 포함되는지 정확히 대조)
    let filteredItems = items;
    if (keyword && items.length > 0) {
      const lowerKeyword = keyword.toLowerCase();
      filteredItems = items.filter((item: any) => {
        return (
          item.bplcNm.toLowerCase().includes(lowerKeyword) || 
          item.rdnWhlAddr.toLowerCase().includes(lowerKeyword) ||
          item.siteWhlAddr.toLowerCase().includes(lowerKeyword)
        );
      });
    }

    return NextResponse.json({ items: filteredItems });
  } catch (error: any) {
    console.error("🚨 API Route Error:", error.message);
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }
}
