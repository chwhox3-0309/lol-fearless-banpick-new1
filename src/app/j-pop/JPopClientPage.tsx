"use client";

import { useState, useCallback } from "react";
import KakaoAdFitBanner from "../components/KakaoAdFitBanner";
import Link from "next/link";

interface Artist {
  id: string;
  name: string;
  "life-span": {
    begin: string;
    end: string | null;
    ended: boolean;
  };
  country: string;
  disambiguation?: string;
  tags?: Array<{ name: string }>;
}

interface Release {
  id: string;
  title: string;
  "release-group": {
    "primary-type": string;
  };
  date: string;
  "artist-credit": Array<{
    artist: {
      name: string;
    };
  }>;
}

type SearchResult = Artist | Release;

export default function JPopClientPage() {
  const [query, setQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<"artist" | "release">("artist");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setError("검색어를 입력해주세요.");
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(
        `/api/j-pop/musicbrainz?query=${encodeURIComponent(
          query
        )}&type=${searchType}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "검색에 실패했습니다.");
        return;
      }

      if (searchType === "artist") {
        setResults(data.artists || []);
      } else {
        setResults(data.releases || []);
      }
    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setError("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [query, searchType]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 상단 헤더 영역 (메인 페이지 스타일 통일) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                J-POP DATABASE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              J-Pop MusicBrainz 검색
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              원하시는 일본 아티스트와 앨범/곡 정보를 정밀하게 검색해보세요.
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors border border-gray-700 shrink-0"
          >
            ← 메인 (밴픽)으로
          </Link>
        </div>

        {/* 검색 박스 영역 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="아티스트 또는 곡 이름 검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="artist"
                  checked={searchType === "artist"}
                  onChange={() => setSearchType("artist")}
                  className="w-4 h-4 text-indigo-600 bg-gray-950 border-gray-700 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-300">아티스트</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="release"
                  checked={searchType === "release"}
                  onChange={() => setSearchType("release")}
                  className="w-4 h-4 text-indigo-600 bg-gray-950 border-gray-700 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-300">릴리스 (곡/앨범)</span>
              </label>
            </div>

            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "검색 중..." : "검색하기"}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
              {error}
            </div>
          )}
        </div>

        {/* 검색 결과 영역 */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-200">
              검색 결과 <span className="text-indigo-400 text-sm font-normal">({results.length}건)</span>
            </h2>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors space-y-2 shadow-md"
                >
                  {"name" in result ? (
                    // Artist
                    <>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          아티스트
                        </span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {result.name}{" "}
                        {result.disambiguation && (
                          <span className="text-xs font-normal text-gray-400">
                            ({result.disambiguation})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                        {result.country && <span>국가: {result.country}</span>}
                        {result["life-span"]?.begin && (
                          <span>활동 시작: {result["life-span"].begin}</span>
                        )}
                        {result["life-span"]?.end && (
                          <span>활동 종료: {result["life-span"].end}</span>
                        )}
                      </p>
                      {result.tags && result.tags.length > 0 && (
                        <p className="text-xs text-gray-500 pt-1">
                          태그: {result.tags.map((tag) => tag.name).join(", ")}
                        </p>
                      )}
                    </>
                  ) : (
                    // Release
                    <>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          릴리스
                        </span>
                      </div>
                      <p className="text-lg font-bold text-white">{result.title}</p>
                      <p className="text-xs text-gray-300">
                        아티스트:{" "}
                        {result["artist-credit"]
                          ?.map((ac) => ac.artist.name)
                          .join(", ")}
                      </p>
                      <p className="text-xs text-gray-400 flex flex-wrap gap-x-4">
                        {result.date && <span>발매일: {result.date}</span>}
                        {result["release-group"]?.["primary-type"] && (
                          <span>타입: {result["release-group"]["primary-type"]}</span>
                        )}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 광고 배너 영역 */}
        <div className="flex justify-center pt-4">
          <KakaoAdFitBanner adUnit="DAN-s7ZfoKBcZ1QEap9Y" width="300" height="250" />
        </div>

      </div>
    </div>
  );
}
