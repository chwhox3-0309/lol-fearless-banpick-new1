import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const postsDirectory = path.join(process.cwd(), 'src', 'blog');

// GET a single post for editing
export async function GET(request: Request, { params }: { params: { slug: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const filePath = path.join(postsDirectory, `${params.slug}.md`);
        if (!fs.existsSync(filePath)) {
            return new NextResponse('Post not found', { status: 404 });
        }
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        return NextResponse.json({ title: data.title, content });
    } catch (error) {
        return new NextResponse('Error reading post', { status: 500 });
    }
}

// PUT (update) a post
export async function PUT(request: Request, { params }: { params: { slug: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { title, content } = await request.json();
        if (!title || !content) {
            return new NextResponse('Title and content are required', { status: 400 });
        }

        const filePath = path.join(postsDirectory, `${params.slug}.md`);
        if (!fs.existsSync(filePath)) {
            return new NextResponse('Post not found', { status: 404 });
        }

        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data: oldData } = matter(fileContents);

        const fileContent = `---
title: '${title}'
date: '${oldData.date || new Date().toISOString().split('T')[0]}'
---

${content}`;

        fs.writeFileSync(filePath, fileContent, 'utf8');

        return NextResponse.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// DELETE a post
export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const filePath = path.join(postsDirectory, `${params.slug}.md`);
        if (!fs.existsSync(filePath)) {
            return new NextResponse('Post not found', { status: 404 });
        }

        fs.unlinkSync(filePath);

        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
