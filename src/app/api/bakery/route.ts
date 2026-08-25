import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get("pageNo") || "1";
  const numOfRows = searchParams.get("numOfRows") || "12";
  const keyword = searchParams.get("keyword") || "";

  const serviceKey = process.env.PUBLIC_DATA_API_KEY; 
  const baseUrl = "https://apis.data.go.kr/1741000/bakeries"; // (※ 실제 엔드포인트 확인 필요)

  const params = new URLSearchParams({
    serviceKey: serviceKey || "",
    pageNo,
    numOfRows,
    returnType: "json",
  });

  if (keyword) {
    params.append("cond[ROAD_NM_ADDR::LIKE]", keyword);
  }

  const targetUrl = `${baseUrl}?${params.toString()}`;
  console.log("👉 요청할 공공데이터 URL:", targetUrl); // 터미널에서 주소 확인용

  try {
    const response = await fetch(targetUrl);
    const textData = await response.text(); // JSON이 아닐 수도 있으므로 텍스트로 먼저 받음

    console.log("👉 공공데이터 원본 응답:", textData.slice(0, 300)); // 앞부분 300자만 로그로 확인

    // JSON으로 파싱 시도
    const data = JSON.parse(textData);
    return NextResponse.json(data);
  } catch (error) {
    console.error("공공데이터 호출 또는 파싱 에러:", error);
    return NextResponse.json({ error: "데이터를 처리하지 못했습니다." }, { status: 500 });
  }
}
