import { fetchGdeltEvents } from "@/lib/gdelt"

export async function GET() {
  const events = await fetchGdeltEvents()
  return Response.json(events)
}
