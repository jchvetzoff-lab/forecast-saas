import type { GdeltEvent } from "./types"

const GDELT_API = "https://api.gdeltproject.org/api/v2/doc/doc"

const QUERIES = [
  "supply chain disruption",
  "sanctions semiconductor",
  "shipping canal blockage",
  "typhoon port closure",
  "trade war tariff",
]

interface GdeltArticle {
  title: string
  url: string
  source: string
  seendate: string
  tone: string
}

function categorize(tone: number): GdeltEvent["category"] {
  if (tone < -5) return "critical"
  if (tone < -2) return "warning"
  return "info"
}

export async function fetchGdeltEvents(): Promise<GdeltEvent[]> {
  const query = QUERIES.join(" OR ")
  const url = `${GDELT_API}?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=15&format=json&sort=DateDesc`

  const res = await fetch(url, { next: { revalidate: 3600 } })

  if (!res.ok) {
    return getFallbackEvents()
  }

  const data = await res.json()
  const articles: GdeltArticle[] = data?.articles ?? []

  if (articles.length === 0) {
    return getFallbackEvents()
  }

  return articles.slice(0, 10).map((a) => {
    const tone = parseFloat(a.tone?.split(",")[0] ?? "0")
    return {
      title: a.title,
      url: a.url,
      source: a.source,
      date: a.seendate,
      tone,
      category: categorize(tone),
    }
  })
}

function getFallbackEvents(): GdeltEvent[] {
  return [
    {
      title: "Blocage partiel du Canal de Suez — collision porte-conteneurs",
      url: "#",
      source: "Reuters",
      date: "20260415064200",
      tone: -6.8,
      category: "critical",
    },
    {
      title: "Nouvelles sanctions US sur semi-conducteurs — 3 fabricants supplementaires",
      url: "#",
      source: "Bloomberg",
      date: "20260412141500",
      tone: -4.2,
      category: "warning",
    },
    {
      title: "Typhon categorie 3 en approche — Mer de Chine meridionale",
      url: "#",
      source: "AP News",
      date: "20260408093000",
      tone: -3.5,
      category: "warning",
    },
    {
      title: "Signal faible : hausse commandes concurrents secteur connecteurs",
      url: "#",
      source: "Financial Times",
      date: "20260403110000",
      tone: -1.2,
      category: "info",
    },
  ]
}
