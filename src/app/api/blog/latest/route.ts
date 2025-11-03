import { NextResponse } from 'next/server';
import { getSortedPostsData } from '@/lib/posts';

// GET the latest post
export async function GET() {
    try {
        const allPosts = getSortedPostsData();
        const latestPost = allPosts.length > 0 ? allPosts[0] : null;
        
        if (!latestPost) {
            return new NextResponse('No posts found', { status: 404 });
        }

        return NextResponse.json(latestPost);
    } catch (error) {
        return new NextResponse('Error reading posts', { status: 500 });
    }
}
