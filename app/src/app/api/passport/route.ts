import { NextResponse } from 'next/server';
import { PassportScore } from '@/lib/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json(
                { error: 'Address parameter is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.PASSPORT_API_KEY;
        const scorerId = process.env.PASSPORT_SCORER_ID;

        if (!apiKey || !scorerId) {
            return NextResponse.json(
                { error: 'Passport API configuration is missing' },
                { status: 500 }
            );
        }

        const response = await fetch(
            `https://api.passport.xyz/v2/stamps/${scorerId}/score/${address}`,
            {
                headers: {
                    'X-API-KEY': apiKey,
                },
            }
        );

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: `Passport API error: ${error}` },
                { status: response.status }
            );
        }

        const data = await response.json() as PassportScore;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching Passport score:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 