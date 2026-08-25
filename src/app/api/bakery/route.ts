import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get("pageNo") || "1";
  const numOfRows = searchParams.get("numOfRows") || "12";
  const keyword = searchParams.get("keyword") || "";

  const serviceKey = process.env.PUBLIC_DATA_API_KEY; 
  
  // 알려주신 엔드포인트 뒤에 보통 오퍼레이션 명칭이 붙습니다. 
  // 만약 이 주소 그대로 안 된다면 공공데이터포털 상세페이지의 '오퍼레이션 명'을 확인해야 합니다.
  const baseUrl = "https://apis.data.go.kr/1741000/bakeries/getBakeryList"; 

  const params = new URLSearchParams({
    serviceKey: serviceKey || "",
    pageNo,
    numOfRows,
    type: "json", // 혹은 returnType: "json"
  });

  if (keyword) {
    params.append("cond[ROAD_NM_ADDR::LIKE]", keyword);
  }

  const targetUrl = `${baseUrl}?${params.toString()}`;
  console.log("=========================================");
  console.log("👉 [서버] 요청 URL:", targetUrl);
  console.log("👉 [서버] 사용 중인 API Key 존재 여부:", !!serviceKey);
  console.log("=========================================");

  try {
    const response = await fetch(targetUrl);
    const textData = await response.text();

    console.log("👉 [서버] 공공데이터 응답 상태코드:", response.status);
    console.log("👉 [서버] 공공데이터 응답 본문(앞부분):", textData.slice(0, 500));

    // 응답이 JSON이 아닐 경우(예: XML 에러 메시지) 대비
    if (!textData.trim().startsWith("{") && !textData.trim().startsWith("[")) {
      return NextResponse.json(
        { error: "공공데이터 서버가 JSON이 아닌 형식(XML 또는 에러)을 반환했습니다.", raw: textData.slice(0, 200) },
        { status: 500 }
      );
    }

    const data = JSON.parse(textData);
    return NextResponse.json(data);
  } catch (error) {
    console.error("👉 [서버] API 호출 중 예외 발생:", error);
    return NextResponse.json({ error: "데이터를 처리하지 못했습니다." }, { status: 500 });
  }
}
