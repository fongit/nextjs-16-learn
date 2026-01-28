import { NextResponse } from 'next/server';

export async function POST() {
	console.log('hello from router server');
	return NextResponse.json({ success: true });
}
