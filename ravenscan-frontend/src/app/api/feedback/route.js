
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { rating, query } = await request.json();
    
    // Stubbed feedback storage
    console.log('Feedback received:', { rating, query, timestamp: new Date().toISOString() });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}
