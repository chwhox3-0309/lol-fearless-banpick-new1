import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get("pageNo") || "1";
  const numOfRows = searchParams.get("numOfRows") || "100"; // 명세서 기준 max: 100
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
  
  // 🔍 명세서 요청변수(Request Parameter) 규격에 맞게 파라미터 구성
  const queryParams: Record<string, string> = {
    serviceKey: decodedKey,
    pageNo: pageNo,
    numOfRows: numOfRows,
    returnType: "json" // 명세서상 returnType 사용
  };

  // 검색어가 있는 경우 명세서의 조건식 파라미터 적용 (상호명 또는 도로명주소 포함 검색)
  if (keyword) {
    queryParams["cond[BPLC_NM::LIKE]"] = keyword;
  }

  const targetUrl = `${baseUrl}?${new URLSearchParams(queryParams).toString()}`;

  try {
    const response = await fetch(targetUrl, {
      headers: { "Accept": "application/json, text/plain, */*" },
      cache: "no-store"
    });

    const textData = await response.text();

    if (textData.trim().startsWith("<")) {
      console.error("🚨 XML 응답 에러:", textData.substring(0, 200));
      return NextResponse.json({ items: [], error: "공공데이터 서버가 XML 포맷을 반환했습니다." });
    }

    const data = JSON.parse(textData);
    
    // 🔍 표준 응답 구조 탐색
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

    // 🔍 공공데이터 표준 필드명에 맞추어 정확하게 매핑 (상호명, 주소 밀림 현상 방지)
    const items = rawItems.map((item: any) => {
      return {
        bplcNm: String(
          item.BPLC_NM || item.bplcNm || item.upsoNm || "상호명 없음"
        ).trim(),
        
        rdnWhlAddr: String(
          item.ROAD_NM_ADDR || item.rdnWhlAddr || item.rdnmAdr || ""
        ).trim(),

        siteWhlAddr: String(
          item.SITE_WHL_ADDR || item.siteWhlAddr || item.locaddr || ""
        ).trim(),

        bplcInfoTelno: String(
          item.BPLC_INFO_TELNO || item.bplcInfoTelno || item.telNo || "번호 없음"
        ).trim(),

        dtlStateNm: String(
          item.DTL_STATE_NM || item.dtlStateNm || item.trdStateNm || "영업중"
        ).trim(),
      };
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("🚨 API Route Error:", error.message);
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }
}
