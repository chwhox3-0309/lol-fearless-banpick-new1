// src/app/playlist/[playlistId]/page.tsx
import { Track } from '@/lib/spotify';
import { notFound } from 'next/navigation';

interface Playlist {
  id: string;
  owner: string;
  createdAt: string;
  tracks: Track[];
}

async function getPlaylist(playlistId: string): Promise<Playlist | null> {
  // In a real app, you'd fetch from your domain.
  // Using a placeholder for the base URL.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/playlists/${playlistId}`, {
      cache: 'no-store', // Fetch fresh data every time
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch playlist');
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching playlist:", error);
    // In a real app, you might want to handle this more gracefully
    return null; 
  }
}


export default async function SharedPlaylistPage({ params }: { params: { playlistId: string } }) {
  const playlist = await getPlaylist(params.playlistId);

  if (!playlist) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-2 text-center">Shared Playlist</h1>
      <p className="text-center text-gray-400 mb-8">
        Playlist created by {playlist.owner} on {new Date(playlist.createdAt).toLocaleDateString()}
      </p>

      <div className="max-w-2xl mx-auto">
        <ul>
          {playlist.tracks.map((track, index) => (
            <li key={track.id} className="flex items-center p-3 mb-3 bg-gray-800 rounded-lg">
              <span className="text-lg font-bold text-gray-400 w-8">{index + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={track.albumArt} alt={track.album} className="w-16 h-16 mx-4 rounded" />
              <div>
                <p className="font-semibold text-white text-lg">{track.name}</p>
                <p className="text-sm text-gray-300">{track.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
