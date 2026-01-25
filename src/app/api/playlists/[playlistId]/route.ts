// src/app/api/playlists/[playlistId]/route.ts
import { NextResponse } from 'next/server';

// This is a mock database. In a real application, you would query a database.
// To allow sharing the mock data between routes in a stateless environment,
// we are defining some sample data directly here.
const mockPlaylistDatabase: Record<string, any> = {
  "pl-sample1": {
    id: "pl-sample1",
    owner: "sample@example.com",
    createdAt: new Date().toISOString(),
    tracks: [
      { id: '1', name: 'アイドル', artist: 'YOASOBI', album: 'Single', albumArt: 'https://i.scdn.co/image/ab67616d0000b273b8a8b8a8b8a8b8a8b8a8b8a8' },
      { id: '2', name: 'Subtitle', artist: 'Official HIGE DANdism', album: 'Single', albumArt: 'https://i.scdn.co/image/ab67616d0000b273b8a8b8a8b8a8b8a8b8a8b8a8' },
    ]
  }
};


export async function GET(
  request: Request,
  { params }: { params: { playlistId: string } }
) {
  try {
    const playlistId = params.playlistId;

    // In a real DB, you'd perform a SELECT operation here.
    const playlist = mockPlaylistDatabase[playlistId];

    if (playlist) {
      return NextResponse.json(playlist);
    } else {
      return new NextResponse('Playlist not found', { status: 404 });
    }

  } catch (error) {
    console.error('Error fetching playlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
