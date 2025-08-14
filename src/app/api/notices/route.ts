import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    // Find the absolute path to the project's root directory
    const jsonDirectory = path.join(process.cwd(), 'src', 'data');
    // Read the json file
    const fileContents = await fs.readFile(jsonDirectory + '/notices.json', 'utf8');
    // Parse the data as JSON
    const notices = JSON.parse(fileContents);

    return NextResponse.json({ notices });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Failed to load notices' }), {
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
    const { title, content, date } = await request.json();

    if (!title || !content || !date) {
      return new NextResponse(JSON.stringify({ error: 'Title, content, and date are required' }), {
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
    } catch (readError: any) {
      if (readError.code === 'ENOENT') {
        // File does not exist, start with an empty array
        notices = [];
      } else {
        throw readError; // Re-throw other read errors
      }
    }

    const newId = notices.length > 0 ? Math.max(...notices.map((n: any) => n.id)) + 1 : 1;
    const newNotice = { id: newId, title, content, date };

    notices.push(newNotice);

    await fs.writeFile(filePath, JSON.stringify(notices, null, 2), 'utf8');

    return NextResponse.json({ message: 'Notice added successfully', notice: newNotice });
  } catch (error: any) {
    console.error('Error adding notice:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to add notice', details: error.message }), {
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
    const { id, title, content, date } = await request.json();

    if (!id || !title || !content || !date) {
      return new NextResponse(JSON.stringify({ error: 'ID, title, content, and date are required' }), {
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
    } catch (readError: any) {
      if (readError.code === 'ENOENT') {
        return new NextResponse(JSON.stringify({ error: 'Notices file not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        throw readError;
      }
    }

    const noticeIndex = notices.findIndex((n: any) => n.id === id);

    if (noticeIndex === -1) {
      return new NextResponse(JSON.stringify({ error: 'Notice not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    notices[noticeIndex] = { id, title, content, date };

    await fs.writeFile(filePath, JSON.stringify(notices, null, 2), 'utf8');

    return NextResponse.json({ message: 'Notice updated successfully', notice: notices[noticeIndex] });
  } catch (error: any) {
    console.error('Error updating notice:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update notice', details: error.message }), {
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

    let notices = [];
    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      notices = JSON.parse(fileContents);
    } catch (readError: any) {
      if (readError.code === 'ENOENT') {
        return new NextResponse(JSON.stringify({ error: 'Notices file not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        throw readError;
      }
    }

    const initialLength = notices.length;
    notices = notices.filter((n: any) => n.id !== id);

    if (notices.length === initialLength) {
      return new NextResponse(JSON.stringify({ error: 'Notice not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await fs.writeFile(filePath, JSON.stringify(notices, null, 2), 'utf8');

    return NextResponse.json({ message: 'Notice deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting notice:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete notice', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
