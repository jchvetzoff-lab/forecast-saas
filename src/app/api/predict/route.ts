import { NextRequest } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    const res = await fetch(`${BACKEND_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return Response.json(
        { error: `Backend: ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json(
      { error: "Backend Python indisponible. Lancez: cd backend && source venv/bin/activate && python -m uvicorn main:app --port 8000" },
      { status: 503 }
    )
  }
}
