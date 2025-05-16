import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { proof, action, signal } = await request.json();

        const app_id = process.env.NEXT_PUBLIC_WORLD_APP_ID;
        const api_key = process.env.WORLD_APP_API_KEY;

        if (!app_id || !api_key) {
            return NextResponse.json(
                { error: 'World ID configuration missing' },
                { status: 500 }
            );
        }

        const response = await fetch('https://developer.worldcoin.org/api/v1/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_key}`,
            },
            body: JSON.stringify({
                proof,
                action,
                signal,
                app_id,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Invalid proof' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error verifying World ID proof:', error);
        return NextResponse.json(
            { error: 'Failed to verify proof' },
            { status: 500 }
        );
    }
} 