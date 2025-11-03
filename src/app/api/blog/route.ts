import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getSession } from 'next-auth/react'; // Incorrect import, should be from next-auth/next
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

const postsDirectory = path.join(process.cwd(), 'src', 'blog');

// Function to create a URL-friendly slug
function createSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .slice(0, 50); // truncate to 50 chars
}

// GET all posts (simplified for admin list, can be expanded)
export async function GET() {
    try {
        const fileNames = fs.readdirSync(postsDirectory);
        const posts = fileNames.map(fileName => {
            const id = fileName.replace(/\.md$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);
            return {
                id,
                title: matterResult.data.title,
                date: matterResult.data.date,
            };
        });
        return NextResponse.json(posts);
    } catch (error) {
        return new NextResponse('Error reading posts', { status: 500 });
    }
}


// POST a new blog post
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // TODO: Add proper admin role check here
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return new NextResponse('Title and content are required', { status: 400 });
    }

    const slug = createSlug(title);
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const filePath = path.join(postsDirectory, `${slug}.md`);

    if (fs.existsSync(filePath)) {
        return new NextResponse('A post with a similar title already exists.', { status: 409 });
    }

    const fileContent = `---
title: '${title}'
date: '${date}'
---

${content}`;

    fs.writeFileSync(filePath, fileContent, 'utf8');

    return NextResponse.json({ message: 'Post created successfully', slug }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
