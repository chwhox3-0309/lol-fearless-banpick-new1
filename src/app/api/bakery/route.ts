import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get("pageNo") || "1";
  // 한 번에 최대 1000개까지 요청하도록 넉넉하게 설정
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
  let targetUrl = `${baseUrl}?serviceKey=${encodeURIComponent(decodedKey)}&pageNo=${pageNo}&numOfRows=${numOfRows}&type=json`;

  if (keyword) {
    targetUrl += `&cond[ROAD_NM_ADDR::LIKE]=${encodeURIComponent(keyword)}`;
  }

  try {
    const response = await fetch(targetUrl);
    const textData = await response.text();

    if (!textData.trim().startsWith("{") && !textData.trim().startsWith("[")) {
      return NextResponse.json({ items: [] });
    }

    const data = JSON.parse(textData);
    
    let items = 
      data?.response?.body?.items?.item || 
      data?.response?.body?.items || 
      data?.body?.items || 
      data?.items || 
      [];

    if (items && !Array.isArray(items)) {
      items = [items];
    }

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }
}
