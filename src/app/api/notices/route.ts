import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
}

export async function GET() {
  try {
    // Find the absolute path to the project's root directory
    const jsonDirectory = path.join(process.cwd(), 'src', 'data');
    // Read the json file
    const fileContents = await fs.readFile(jsonDirectory + '/notices.json', 'utf8');
    // Parse the data as JSON
    const notices = JSON.parse(fileContents);

    return NextResponse.json({ notices });
  } catch (e: unknown) {
    console.error(e);
    let errorMessage = 'Failed to load notices';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.githubUsername !== 'chwhox3-0309') {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { title, content, date, category } = await request.json();

    if (!title || !content || !date || !category) {
      return new NextResponse(JSON.stringify({ error: 'Title, content, date, and category are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const jsonDirectory = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(jsonDirectory, 'notices.json');

    let notices = [];
    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      notices = JSON.parse(fileContents);
    } catch (readError: unknown) {
      if (readError instanceof Error && (readError as NodeJS.ErrnoException).code === 'ENOENT') {
        // File does not exist, start with an empty array
        notices = [];
      } else {
        throw readError; // Re-throw other read errors
      }
    }

    const newId = notices.length > 0 ? Math.max(...notices.map((n: Notice) => n.id)) + 1 : 1;
    const newNotice = { id: newId, title, content, date, category };

    notices.push(newNotice);

    await fs.writeFile(filePath, JSON.stringify(notices, null, 2), 'utf8');

    return NextResponse.json({ message: 'Notice added successfully', notice: newNotice });
  } catch (e: unknown) {
    console.error('Error adding notice:', e);
    let errorMessage = 'Failed to add notice';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.githubUsername !== 'chwhox3-0309') {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { id, title, content, date, category } = await request.json();

    if (!id || !title || !content || !date || !category) {
      return new NextResponse(JSON.stringify({ error: 'ID, title, content, date, and category are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const jsonDirectory = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(jsonDirectory, 'notices.json');

    let notices: Notice[] = [];
    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      notices = JSON.parse(fileContents);
    } catch (readError: unknown) {
      if (readError instanceof Error && (readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return new NextResponse(JSON.stringify({ error: 'Notices file not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        throw readError;
      }
    }

    const noticeIndex = notices.findIndex((n: Notice) => n.id === id);

    if (noticeIndex === -1) {
      return new NextResponse(JSON.stringify({ error: 'Notice not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    notices[noticeIndex] = { id, title, content, date, category };

    await fs.writeFile(filePath, JSON.stringify(notices, null, 2), 'utf8');

    return NextResponse.json({ message: 'Notice updated successfully', notice: notices[noticeIndex] });
  } catch (e: unknown) {
    console.error('Error updating notice:', e);
    let errorMessage = 'Failed to update notice';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.githubUsername !== 'chwhox3-0309') {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '', 10);

    if (isNaN(id)) {
      return new NextResponse(JSON.stringify({ error: 'Valid notice ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const jsonDirectory = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(jsonDirectory, 'notices.json');

    let notices: Notice[] = [];
    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      notices = JSON.parse(fileContents);
    } catch (readError: unknown) {
      if (readError instanceof Error && (readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return new NextResponse(JSON.stringify({ error: 'Notices file not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        throw readError;
      }
    }

    const initialLength = notices.length;
    notices = notices.filter((n: Notice) => n.id !== id);

    if (notices.length === initialLength) {
      return new NextResponse(JSON.stringify({ error: 'Notice not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await fs.writeFile(filePath, JSON.stringify(notices, null, 2), 'utf8');

    return NextResponse.json({ message: 'Notice deleted successfully', id });
  } catch (e: unknown) {
    console.error('Error deleting notice:', e);
    let errorMessage = 'Failed to delete notice';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
