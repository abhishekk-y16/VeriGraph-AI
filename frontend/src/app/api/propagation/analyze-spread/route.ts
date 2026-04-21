import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const backendUrl = `http://localhost:8000/api/propagation/analyze-spread`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    let response: Response;
    try {
      response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorBody: { detail?: string; error?: string } | null = null;

      try {
        errorBody = errorText ? JSON.parse(errorText) : null;
      } catch {
        errorBody = null;
      }

      return NextResponse.json(
        {
          error:
            errorBody?.detail ||
            errorBody?.error ||
            errorText ||
            `Backend error: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Propagation analyze-spread API error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Propagation analysis timed out. Please try again.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
