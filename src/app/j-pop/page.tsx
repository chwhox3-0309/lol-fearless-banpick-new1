"use client";

import { useState, useCallback } from "react";

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

interface JPopPageProps {
  params?: { [key: string]: string | string[] };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function JPopPage({ params, searchParams }: JPopPageProps) {
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
    <div className="container mx-auto p-4 max-w-4xl min-h-screen text-white">
      <h1 className="text-4xl font-bold text-center mb-8">
        J-Pop MusicBrainz 검색
      </h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="아티스트 또는 곡 이름 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <label className="flex items-center">
            <input
              type="radio"
              value="artist"
              checked={searchType === "artist"}
              onChange={() => setSearchType("artist")}
              className="form-radio text-indigo-500 bg-gray-700 border-gray-600 focus:ring-indigo-500"
            />
            <span className="ml-2">아티스트</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="release"
              checked={searchType === "release"}
              onChange={() => setSearchType("release")}
              className="form-radio text-indigo-500 bg-gray-700 border-gray-600 focus:ring-indigo-500"
            />
            <span className="ml-2">릴리스 (곡/앨범)</span>
          </label>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ml-auto"
            disabled={loading}
          >
            {loading ? "검색 중..." : "검색"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">검색 결과</h2>
            <ul className="space-y-4">
              {results.map((result) => (
                <li
                  key={result.id}
                  className="bg-gray-700 p-4 rounded-md shadow-sm"
                >
                  {"name" in result ? (
                    // Artist
                    <>
                      <p className="text-xl font-bold text-indigo-300">
                        {result.name} {result.disambiguation && `(${result.disambiguation})`}
                      </p>
                      <p className="text-gray-300">
                        {result.country && `국가: ${result.country}`}
                        {result["life-span"]?.begin && ` | 활동 시작: ${result["life-span"].begin}`}
                        {result["life-span"]?.end && ` | 활동 종료: ${result["life-span"].end}`}
                      </p>
                      {result.tags && result.tags.length > 0 && (
                        <p className="text-gray-400 text-sm mt-1">
                          태그: {result.tags.map(tag => tag.name).join(', ')}
                        </p>
                      )}
                    </>
                  ) : (
                    // Release
                    <>
                      <p className="text-xl font-bold text-teal-300">
                        {result.title}
                      </p>
                      <p className="text-gray-300">
                        아티스트: {result["artist-credit"]?.map(ac => ac.artist.name).join(', ')}
                      </p>
                      <p className="text-gray-400 text-sm">
                        발매일: {result.date}
                        {result["release-group"]?.["primary-type"] && ` | 타입: ${result["release-group"]["primary-type"]}`}
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
