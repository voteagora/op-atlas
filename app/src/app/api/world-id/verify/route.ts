import { verifyCloudProof, IVerifyResponse } from '@worldcoin/idkit';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { proof, action } = await request.json();

        // TODO: Verify that the ation is valid
        // const action = process.env.NEXT_PUBLIC_WORLD_APP_ACTION;
        const app_id = process.env.NEXT_PUBLIC_WORLD_APP_ID;
        const api_key = process.env.WORLD_APP_API_KEY;

        if (!app_id || !api_key) {
            return NextResponse.json(
                { error: 'World ID configuration missing' },
                { status: 500 }
            );
        }

        const verifyRes = (await verifyCloudProof(proof, app_id as `app_${string}`, action)) as IVerifyResponse

        console.log('--------------------------------');
        console.log('verifyRes', verifyRes);
        console.log('--------------------------------');

        if (verifyRes.success) {

            return NextResponse.json(
                { status: 200, message: 'Proof verified' },
            );
        } else {

            // TODO: Handle errors from the World ID /verify endpoint. 
            return NextResponse.json(
                { status: 400, message: 'Proof not verified' },
            );
        }


    } catch (error) {
        console.error('Error verifying World ID proof:', error);
        return NextResponse.json(
            { error: 'Failed to verify proof' },
            { status: 500 }
        );
    }
} 