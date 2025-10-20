import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { getBanRates } from '@/lib/fetch-ban-rates-util'; // Import the new utility

export async function GET() {
  try {
    // Fetch fresh data using the utility function
    const freshBanData = await getBanRates();

    // Path to the data file
    const jsonDirectory = path.join(process.cwd(), 'src', 'data');
    const outputPath = path.join(jsonDirectory, 'ban-rates.json');

    // Write the fresh data to the file
    await fs.writeFile(outputPath, JSON.stringify(freshBanData, null, 2), 'utf8');
    
    return NextResponse.json(freshBanData);
  } catch (error) {
    console.error('Failed to fetch or update ban rates data:', error);
    return NextResponse.json({ message: 'Error fetching or updating ban rates data.' }, { status: 500 });
  }
}
