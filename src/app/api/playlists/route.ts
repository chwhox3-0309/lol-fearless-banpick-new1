// src/app/api/playlists/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Track } from '@/lib/music-api';

// In a real application, you would use a database like PostgreSQL, MongoDB, etc.
// Since each serverless function is stateless, we cannot share memory.
// This POST endpoint will simulate a successful save and return a known ID that the GET endpoint can serve.

// POST a new playlist
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { tracks }: { tracks: Track[] } = await request.json();

    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return new NextResponse('Playlist tracks are required', { status: 400 });
    }

    // In a real DB, you'd perform an INSERT operation and get a new ID.
    // Here, we'll just return a static ID for demonstration purposes,
    // which corresponds to the mock data in the GET route.
    const playlistId = 'pl-sample1';

    console.log(`Simulating save for user ${session.user.email} with ${tracks.length} tracks.`);
    
    return NextResponse.json({ message: 'Playlist created successfully', playlistId }, { status: 201 });

  } catch (error) {
    console.error('Error creating playlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
