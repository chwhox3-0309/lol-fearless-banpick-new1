"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface DramaOstItem {
  id: number;
  title: string;
  category: string;
  broadcast: string;
  ost_title: string;
  artist: string;
  description: string;
  created_at: string;
}

export default function AdminJPopPage() {
  const [items, setItems] = useState<DramaOstItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 단건 등록 폼 상태
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [broadcast, setBroadcast] = useState("");
  const [ostTitle, setOstTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jpop_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("데이터 로드 실패:", error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  // 단건 등록 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !ostTitle) {
      alert("드라마 제목과 OST 곡명은 필수 입력 항목입니다.");
      return;
    }

    const { error } = await supabase.from("jpop_posts").insert([
      {
        title,
        category,
        broadcast,
        ost_title: ostTitle,
        artist,
        description,
      },
    ]);

    if (error) {
      alert("등록 실패: " + error.message);
    } else {
      alert("성공적으로 등록되었습니다!");
      setTitle("");
      setCategory("");
      setBroadcast("");
      setOstTitle("");
      setArtist("");
      setDescription("");
      fetchPosts();
    }
  };

  // 삭제 핸들러
  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 항목을 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("jpop_posts").delete().eq("id", id);
    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      fetchPosts();
    }
  };

  // 1. CSV 양식 다운로드 함수
  const downloadTemplate = () => {
    const csvContent = "title,category,broadcast,ost_title,artist,description\n" +
      "예시) 도쿄 메트로,2026년 - 3분기,TBS,아이노우,요네즈 켄시,청춘 로맨스물 드라마";
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "jpop_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. CSV 파일 업로드 및 일괄 등록 함수
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
        
        if (lines.length < 2) {
          alert("업로드한 파일에 유효한 데이터가 없습니다.");
          setUploading(false);
          return;
        }

        // 헤더 파싱
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        const rows = lines.slice(1);

        const newRecords = rows.map((row) => {
          // 간단한 CSV 파싱 (따옴표 처리 고려)
          const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) => v.trim().replace(/^"|"$/g, ""));
          
          return {
            title: values[0] || "",
            category: values[1] || "",
            broadcast: values[2] || "",
            ost_title: values[3] || "",
            artist: values[4] || "",
            description: values[5] || "",
          };
        }).filter(record => record.title && record.ost_title); // 필수값 누락된 행 제외

        if (newRecords.length === 0) {
          alert("등록할 수 있는 유효한 데이터 행이 없습니다.");
          setUploading(false);
          return;
        }

        // Supabase 대량 삽입
        const { error } = await supabase.from("jpop_posts").insert(newRecords);

        if (error) {
          alert("일괄 등록 중 오류가 발생했습니다: " + error.message);
        } else {
          alert(`성공적으로 ${newRecords.length}개의 항목이 일괄 등록되었습니다!`);
          fetchPosts();
        }
      } catch (err: any) {
        alert("파일 처리 중 오류가 발생했습니다: " + err.message);
      } finally {
        setUploading(false);
        e.target.value = ""; // 파일 입력 초기화
      }
    };
    reader.readAsText(file, "utf-8");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 상단 헤더 및 네비게이션 */}
        <div className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              ADMINISTRATION
            </span>
            <h1 className="text-2xl font-bold mt-2">🎵 J-Pop / 일드 OST 관리</h1>
          </div>
          <Link 
            href="/admin" 
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs transition-all border border-gray-700"
          >
            ← 관리자 홈으로
          </Link>
        </div>

        {/* 일괄 등록 및 폼 다운로드 섹션 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-purple-400">📦 파일 일괄 등록 (CSV)</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            엑셀이나 CSV 파일을 이용해 한 번에 여러 개의 드라마 OST 데이터를 등록할 수 있습니다. 
            먼저 폼 양식을 다운로드하여 양식에 맞춰 작성한 뒤 업로드해 주세요.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded-xl transition-all border border-gray-700 flex items-center gap-2"
            >
              📥 업로드 폼(CSV) 다운로드
            </button>

            <label className={`px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-xl transition-all shadow-lg shadow-purple-600/30 cursor-pointer flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>{uploading ? "업로드 처리 중..." : "📤 CSV 파일 일괄 업로드"}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 단건 등록 폼 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-indigo-400">✍️ 개별 항목 직접 등록</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">드라마 제목 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 도쿄 현바이브"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">분기 카테고리</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="예: 2026년 - 3분기"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">방송사</label>
              <input
                type="text"
                value={broadcast}
                onChange={(e) => setBroadcast(e.target.value)}
                placeholder="예: TBS"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">OST 곡명 *</label>
              <input
                type="text"
                value={ostTitle}
                onChange={(e) => setOstTitle(e.target.value)}
                placeholder="예: 아이노우"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">아티스트</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="예: 요네즈 켄시"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">설명 및 줄거리</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 청춘 로맨스물 드라마"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30"
              >
                단건 등록하기
              </button>
            </div>
          </form>
        </div>

        {/* 등록된 목록 관리 테이블 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">
            📋 등록된 목록 관리 <span className="text-purple-400 text-sm">({items.length}건)</span>
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm">목록을 불러오는 중...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">등록된 데이터가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-xs text-gray-400">
                    <th className="py-3 px-4">분기</th>
                    <th className="py-3 px-4">방송사</th>
                    <th className="py-3 px-4">드라마 제목</th>
                    <th className="py-3 px-4">OST / 아티스트</th>
                    <th className="py-3 px-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-xs">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 text-indigo-400 font-medium">{item.category || "-"}</td>
                      <td className="py-3 px-4 text-purple-400 font-medium">{item.broadcast || "-"}</td>
                      <td className="py-3 px-4 text-white font-semibold">{item.title}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {item.ost_title} <span className="text-gray-500">({item.artist})</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors border border-red-500/20"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
