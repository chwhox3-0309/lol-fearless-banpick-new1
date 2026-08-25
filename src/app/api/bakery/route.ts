import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get("pageNo") || "1";
  const numOfRows = searchParams.get("numOfRows") || "1000";
  const keyword = searchParams.get("keyword") || "";

  // Vercel에 등록한 키 이름 (DATA_API_KEY 기준)
  const rawServiceKey = process.env.DATA_API_KEY || "";
  
  if (!rawServiceKey) {
    console.error("❌ DATA_API_KEY 환경 변수가 설정되지 않았습니다.");
    return NextResponse.json({ items: [], error: "API Key is missing" }, { status: 500 });
  }

  // 공공데이터포털 키는 이미 인코딩되어 있는 경우가 많으므로, 
  // fetch 시 자동으로 이중 인코딩이 일어나지 않도록 디코딩 후 수동 조합하거나 그대로 사용
  let decodedKey = rawServiceKey;
  try {
    decodedKey = decodeURIComponent(rawServiceKey);
  } catch (e) {
    decodedKey = rawServiceKey;
  }

  const baseUrl = "https://apis.data.go.kr/1741000/bakeries/info"; 
  
  // URLSearchParams를 사용하면 공공데이터 서비스키의 특수문자(% 등)가 깨지는 것을 안전하게 방지할 수 있습니다.
  const params = new URLSearchParams({
    serviceKey: decodedKey,
    pageNo: pageNo,
    numOfRows: numOfRows,
    type: "json"
  });

  const targetUrl = `${baseUrl}?${params.toString()}`;

  try {
    console.log("🔗 요청 URL:", targetUrl.replace(decodedKey, "HIDDEN_KEY"));

    const response = await fetch(targetUrl, {
      headers: {
        "Accept": "application/json, text/plain, */*"
      },
      cache: "no-store"
    });

    const textData = await response.text();
    console.log("📥 응답 상태 코드:", response.status);
    console.log("📥 응답 데이터 일부:", textData.substring(0, 300));

    // 공공데이터포털이 에러를 XML이나 텍스트로 뱉었는지 확인
    if (!textData.trim().startsWith("{") && !textData.trim().startsWith("[")) {
      return NextResponse.json({ 
        items: [], 
        error: "공공데이터포털 서버가 JSON이 아닌 응답을 반환했습니다. 인증키를 확인해주세요." 
      });
    }

    const data = JSON.parse(textData);
    
    // 데이터 구조 탐색
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

    console.log(`📦 파싱된 제과점 데이터 총 개수: ${items.length}개`);

    // 검색어 필터링
    let filteredItems = items;
    if (keyword && items.length > 0) {
      const lowerKeyword = keyword.toLowerCase();
      filteredItems = items.filter((item: any) => {
        const name = String(item.bplcNm || item.BPLC_NM || "").toLowerCase();
        const addr = String(item.rdnWhlAddr || item.ROAD_NM_ADDR || item.siteWhlAddr || item.SITE_WHL_ADDR || "").toLowerCase();
        return name.includes(lowerKeyword) || addr.includes(lowerKeyword);
      });
      console.log(`🔍 검색어("${keyword}") 필터링 후 결과: ${filteredItems.length}개`);
    }

    return NextResponse.json({ items: filteredItems });
  } catch (error: any) {
    console.error("🚨 Bakery API Server Error:", error.message);
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }
}
