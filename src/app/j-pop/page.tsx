// src/app/j-pop/page.tsx
import { getJPopChart, Track } from '@/lib/music-api';
import JPopClientPage from './components/JPopClientPage';

const JPopPage = async () => {
  const tracks: Track[] = await getJPopChart();

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">J-Pop Chart & Playlist Builder</h1>
      <p className="text-center text-gray-400 mb-8">
        Explore the latest J-Pop hits. Drag and drop songs or use the add button to build your own playlist.
      </p>
      
      <JPopClientPage tracks={tracks} />

      <div className="mt-8 text-center bg-yellow-900/50 text-yellow-200 border border-yellow-700 p-4 rounded-lg">
        <h3 className="font-bold text-lg">개발자 참고</h3>
        <p className="text-sm">
          현재 표시되는 데이터는 실제 Spotify API에서 온 것이 아닌 임시 데이터(mock data)입니다.
          <br />
          실제 순위를 보려면 <code>.env.local</code> 파일에 Spotify API 키 (<code>SPOTIFY_CLIENT_ID</code>, <code>SPOTIFY_CLIENT_SECRET</code>)를 추가해야 합니다.
        </p>
      </div>
    </div>
  );
};

export default JPopPage;