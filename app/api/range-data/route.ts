import { NextResponse } from 'next/server';

export async function POST(request) {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    };

    const response = await fetch('http://example.com/api/range-data', {
        method: 'POST',
        headers: headers,
        body: new URLSearchParams({
            // Your form data goes here
        })
    });

    const data = await response.json();
    return NextResponse.json(data);
}