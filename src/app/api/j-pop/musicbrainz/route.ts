import { NextRequest, NextResponse } from 'next/server';

const MUSICBRAINZ_API_BASE_URL = 'https://musicbrainz.org/ws/2/';
// MusicBrainz API requires a specific User-Agent format.
// Replace with a real contact if this project becomes public.
const USER_AGENT = 'lol-fearless-banpick/1.0.0 ( https://github.com/your-repo/ )';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const type = searchParams.get('type') || 'artist'; // 'artist' or 'release'

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  let entityType;
  if (type === 'artist') {
    entityType = 'artist';
  } else if (type === 'release') {
    entityType = 'release';
  } else {
    return NextResponse.json({ error: 'Invalid type parameter. Must be "artist" or "release"' }, { status: 400 });
  }

  try {
    const musicBrainzUrl = `${MUSICBRAINZ_API_BASE_URL}${entityType}/?query=${encodeURIComponent(query)}&fmt=json`;
    const response = await fetch(musicBrainzUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`MusicBrainz API error: ${response.status} - ${response.statusText}`);
      const errorData = await response.text(); // Get raw text to avoid JSON parse errors
      return NextResponse.json({ error: `Failed to fetch from MusicBrainz: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error fetching from MusicBrainz:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
