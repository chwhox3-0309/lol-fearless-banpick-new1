import { NextResponse } from 'next/server';
import { getBanRates } from '@/lib/fetch-ban-rates-util'; // Import the new utility

export const revalidate = 0; // Disable caching for this route

export async function GET() {
  try {
    // Fetch fresh data using the utility function
    const freshBanData = await getBanRates();
    return NextResponse.json(freshBanData);
  } catch (error) {
    console.error('Failed to fetch ban rates data:', error);
    // It's better to provide a more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Error fetching ban rates data: ${errorMessage}` }, { status: 500 });
  }
}