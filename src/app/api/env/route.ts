import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ NODE_ENV: process.env.NODE_ENV });
}
