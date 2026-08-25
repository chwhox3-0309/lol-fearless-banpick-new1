import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get("pageNo") || "1";
  const numOfRows = searchParams.get("numOfRows") || "12";
  const keyword = searchParams.get("keyword") || "";

  const serviceKey = process.env.PUBLIC_DATA_API_KEY; 
  const baseUrl = "https://apis.data.go.kr/1741000/bakeries/getBakeryList"; 

  const params = new URLSearchParams({
    serviceKey: serviceKey || "",
    pageNo,
    numOfRows,
    type: "json", // 명시적으로 JSON 요청
  });

  if (keyword) {
    params.append("cond[ROAD_NM_ADDR::LIKE]", keyword);
  }

  const targetUrl = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(targetUrl);
    const textData = await response.text();

    // 만약 공공데이터가 XML을 반환했거나 에러 페이지를 뱉은 경우
    if (!textData.trim().startsWith("{") && !textData.trim().startsWith("[")) {
      console.error("👉 [서버] 공공데이터가 JSON이 아닌 형식을 반환했습니다:", textData.slice(0, 200));
      return NextResponse.json(
        { error: "공공데이터 서버가 올바른 JSON 형식을 반환하지 않았습니다.", raw: textData.slice(0, 200) },
        { status: 500 }
      );
    }

    const data = JSON.parse(textData);
    return NextResponse.json(data);
  } catch (error) {
    console.error("👉 [서버] API 호출 에러:", error);
    return NextResponse.json({ error: "데이터를 처리하지 못했습니다." }, { status: 500 });
  }
}
