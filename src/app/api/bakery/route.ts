import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNo = searchParams.get("pageNo") || "1";
  const numOfRows = searchParams.get("numOfRows") || "12";
  const keyword = searchParams.get("keyword") || "";

  // GitHub / Vercel 환경 변수에서 안전하게 가져옴
  const serviceKey = process.env.PUBLIC_DATA_API_KEY; 
  
  // ※ 참고: 실제 공공데이터포털에서 제공하는 정확한 엔드포인트 URL로 교체해주세요.
  const baseUrl = "https://apis.data.go.kr/1130000/FoodService/getFoodList"; 

  const params = new URLSearchParams({
    serviceKey: serviceKey || "",
    pageNo,
    numOfRows,
    returnType: "json",
  });

  if (keyword) {
    params.append("cond[ROAD_NM_ADDR::LIKE]", keyword);
  }

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("베이커리 API 호출 에러:", error);
    return NextResponse.json({ error: "데이터를 불러오지 못했습니다." }, { status: 500 });
  }
}
