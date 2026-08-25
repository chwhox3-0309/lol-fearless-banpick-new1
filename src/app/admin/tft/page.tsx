"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface TftMetaItem {
  id: number;
  season: string;
  tier: string;
  comp_name: string;
  key_champions: string;
  items: string;
  description: string;
  created_at: string;
}

export default function AdminTftPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [items, setItems] = useState<TftMetaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 등록 / 수정 공용 폼 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [season, setSeason] = useState("");
  const [tier, setTier] = useState("");
  const [compName, setCompName] = useState("");
  const [keyChampions, setKeyChampions] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [description, setDescription] = useState("");

  // 일괄 삭제 선택 상태
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  // 관리자 권한 확인 및 데이터 로드
  const checkAdminAndFetch = async () => {
    setAuthLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // TODO: 본인의 관리자 이메일이나 관리자 권한 판별 조건으로 변경하세요.
    // 예: user?.email === "admin@example.com" 또는 user?.app_metadata?.role === "admin"
    if (!user) {
      alert("관리자 로그인 세션이 없습니다. 메인 페이지로 이동합니다.");
      window.location.href = "/";
      return;
    }

    // 임시로 로그인된 사용자면 허용 (필요시 특정 이메일 제한 조건 추가 가능)
    setIsAdmin(true);
    setAuthLoading(false);
    fetchPosts();
  };

  const fetchPosts = async () => {
    setLoading(true);
    setSelectedIds([]);
    const { data, error } = await supabase
      .from("tft_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("데이터 로드 실패:", error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!season || !compName) {
      alert("시즌 정보와 조합 이름은 필수 입력 항목입니다.");
      return;
    }

    if (editingId !== null) {
      const { error } = await supabase
        .from("tft_posts")
        .update({
          season: season.trim(),
          tier: tier.trim(),
          comp_name: compName.trim(),
          key_champions: keyChampions.trim(),
          items: itemsText.trim(),
          description: description.trim(),
        })
        .eq("id", editingId);

      if (error) {
        alert("수정 실패: " + error.message);
      } else {
        alert("성공적으로 수정되었습니다!");
        resetForm();
        fetchPosts();
      }
    } else {
      const { error } = await supabase.from("tft_posts").insert([
        {
          season: season.trim(),
          tier: tier.trim(),
          comp_name: compName.trim(),
          key_champions: keyChampions.trim(),
          items: itemsText.trim(),
          description: description.trim(),
        },
      ]);

      if (error) {
        alert("등록 실패: " + error.message);
      } else {
        alert("성공적으로 등록되었습니다!");
        resetForm();
        fetchPosts();
      }
    }
  };

  const handleEditClick = (item: TftMetaItem) => {
    setEditingId(item.id);
    setSeason(item.season || "");
    setTier(item.tier || "");
    setCompName(item.comp_name || "");
    setKeyChampions(item.key_champions || "");
    setItemsText(item.items || "");
    setDescription(item.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setSeason("");
    setTier("");
    setCompName("");
    setKeyChampions("");
    setItemsText("");
    setDescription("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 항목을 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("tft_posts").delete().eq("id", id);
    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      if (editingId === id) resetForm();
      fetchPosts();
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(items.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleCheckboxChange = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      alert("삭제할 항목을 먼저 선택해주세요.");
      return;
    }

    if (!confirm(`정말 선택한 ${selectedIds.length}개의 항목을 삭제하시겠습니까?`)) return;

    const { error } = await supabase
      .from("tft_posts")
      .delete()
      .in("id", selectedIds);

    if (error) {
      alert("일괄 삭제 실패: " + error.message);
    } else {
      alert(`선택하신 ${selectedIds.length}개의 항목이 성공적으로 삭제되었습니다.`);
      if (editingId && selectedIds.includes(editingId)) resetForm();
      fetchPosts();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-sm">
        권한 확인 중...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 상단 헤더 (관리자 홈으로 버튼 완전 제거) */}
        <div className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              SECURE ADMIN
            </span>
            <h1 className="text-2xl font-bold mt-2">⚔️ TFT 메타 조합 관리</h1>
          </div>
        </div>

        {/* 폼 영역 */}
        <div className={`bg-gray-900 border rounded-2xl p-6 shadow-xl space-y-4 ${editingId !== null ? 'border-amber-500/50 bg-amber-950/10' : 'border-gray-800'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-lg font-semibold ${editingId !== null ? 'text-amber-400' : 'text-indigo-400'}`}>
              {editingId !== null ? `✍️ 조합 수정 중 (ID: ${editingId})` : "✍️ 신규 TFT 덱 등록"}
            </h2>
            {editingId !== null && (
              <button type="button" onClick={resetForm} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs border border-gray-700">
                취소 ✕
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">시즌 *</label>
              <input type="text" value={season} onChange={(e) => setSeason(e.target.value)} placeholder="예: 시즌 12" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">티어</label>
              <input type="text" value={tier} onChange={(e) => setTier(e.target.value)} placeholder="예: S티어" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">조합 이름 *</label>
              <input type="text" value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="예: 미술가 리븐 덱" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">핵심 챔피언</label>
              <input type="text" value={keyChampions} onChange={(e) => setKeyChampions(e.target.value)} placeholder="예: 리븐, 조이, 아리" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">추천 아이템</label>
              <input type="text" value={itemsText} onChange={(e) => setItemsText(e.target.value)} placeholder="예: 피바라기, 거인의 결의" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">운영 팁 / 설명</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="예: 6레벨 리롤 중심" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500" />
            </div>

            <div className="md:col-span-2 pt-2">
              <button type="submit" className={`w-full py-3 font-semibold rounded-xl text-sm transition-all shadow-lg ${editingId !== null ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'}`}>
                {editingId !== null ? "수정 내용 저장하기" : "조합 등록하기"}
              </button>
            </div>
          </form>
        </div>

        {/* 목록 관리 테이블 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-200">
              📋 등록된 메타 덱 목록 <span className="text-purple-400 text-sm">({items.length}건)</span>
            </h2>
            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">선택됨: <strong className="text-white">{selectedIds.length}</strong>건</span>
                <button
                  onClick={handleBatchDelete}
                  disabled={selectedIds.length === 0}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border ${selectedIds.length > 0 ? 'bg-red-500/20 text-red-300 border-red-500/30 cursor-pointer' : 'bg-gray-800 text-gray-600 border-gray-800 cursor-not-allowed'}`}
                >
                  🗑️ 선택 항목 일괄 삭제
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm">로딩 중...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">등록된 조합 데이터가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-xs text-gray-400">
                    <th className="py-3 px-4 w-10 text-center">
                      <input type="checkbox" onChange={handleSelectAll} checked={items.length > 0 && selectedIds.length === items.length} className="cursor-pointer" />
                    </th>
                    <th className="py-3 px-4">시즌</th>
                    <th className="py-3 px-4">티어</th>
                    <th className="py-3 px-4">조합 이름</th>
                    <th className="py-3 px-4">핵심 챔피언 / 아이템</th>
                    <th className="py-3 px-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-xs">
                  {items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr key={item.id} className={`hover:bg-gray-800/40 ${isSelected ? 'bg-purple-950/15' : ''}`}>
                        <td className="py-3 px-4 text-center">
                          <input type="checkbox" checked={isSelected} onChange={() => handleCheckboxChange(item.id)} className="cursor-pointer" />
                        </td>
                        <td className="py-3 px-4 text-indigo-400">{item.season}</td>
                        <td className="py-3 px-4 text-purple-400 font-bold">{item.tier}</td>
                        <td className="py-3 px-4 text-white font-semibold">{item.comp_name}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {item.key_champions} <span className="text-gray-500">({item.items})</span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button onClick={() => handleEditClick(item)} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">수정</button>
                          <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">삭제</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
