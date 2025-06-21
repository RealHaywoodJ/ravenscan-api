
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    api: {
      status: 'connected',
      url: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ravenscan-api.etmunson91.replit.app'
    }
  };

  return NextResponse.json(health);
}
