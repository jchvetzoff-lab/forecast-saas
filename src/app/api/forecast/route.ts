import { NextRequest } from "next/server"

const HF_API_URL =
  "https://api-inference.huggingface.co/models/amazon/chronos-t5-small"

/**
 * POST /api/forecast
 * Body : { demand: number[], horizon: number }
 * Appelle Chronos-T5 via HuggingFace Inference API
 * Retourne : { forecast: number[], model: string }
 */
export async function POST(req: NextRequest) {
  const token = process.env.HF_TOKEN
  if (!token) {
    return Response.json(
      { error: "HF_TOKEN manquant dans .env.local" },
      { status: 500 }
    )
  }

  const body = await req.json()
  const demand: number[] = body.demand
  const horizon: number = body.horizon ?? 6

  if (!demand || demand.length < 6) {
    return Response.json(
      { error: "Il faut au moins 6 periodes de donnees" },
      { status: 400 }
    )
  }

  try {
    // Chronos-T5 via HuggingFace Inference API
    // Le modele attend un payload specifique pour le time series forecasting
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          past_values: demand,
          past_time_features: demand.map((_, i) => [i]),
          future_length: horizon,
        },
        parameters: {
          prediction_length: horizon,
          num_samples: 20,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()

      // Si le modele n'est pas compatible avec cette API,
      // on essaie un format alternatif
      if (response.status === 400 || response.status === 422) {
        return await fallbackForecast(demand, horizon, token)
      }

      // Modele en cours de chargement
      if (response.status === 503) {
        return Response.json(
          {
            error: "Modele en cours de chargement, reessayez dans 30 secondes",
            loading: true,
          },
          { status: 503 }
        )
      }

      return Response.json(
        { error: `HuggingFace API: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const result = await response.json()

    // Extraire les predictions selon le format de reponse
    const forecast = extractForecast(result, horizon)

    return Response.json({
      forecast,
      model: "chronos-t5-small",
      source: "huggingface-inference-api",
    })
  } catch (err) {
    console.error("Erreur Chronos-2:", err)
    // Fallback : forecast statistique avance cote serveur
    return await statisticalFallback(demand, horizon)
  }
}

/**
 * Fallback avec un autre format d'appel HF
 */
async function fallbackForecast(
  demand: number[],
  horizon: number,
  token: string
) {
  // Essai avec le format texte simple
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: demand.join(", "),
      parameters: { num_return_sequences: 1 },
    }),
  })

  if (!response.ok) {
    return await statisticalFallback(demand, horizon)
  }

  const result = await response.json()
  const forecast = extractForecast(result, horizon)

  return Response.json({
    forecast,
    model: "chronos-t5-small",
    source: "huggingface-fallback",
  })
}

/**
 * Fallback statistique si HF ne repond pas :
 * Triple Exponential Smoothing (Holt-Winters) cote serveur
 * Plus avance que ce qui tourne cote client
 */
async function statisticalFallback(demand: number[], horizon: number) {
  const n = demand.length
  const period = 12 // Saisonnalite mensuelle

  // Holt-Winters additif
  const alpha = 0.3
  const beta = 0.1
  const gamma = 0.3

  // Initialisation saisonnalite
  const seasonal: number[] = []
  if (n >= period) {
    const firstYearAvg =
      demand.slice(0, period).reduce((a, b) => a + b, 0) / period
    for (let i = 0; i < period; i++) {
      seasonal.push(demand[i] - firstYearAvg)
    }
  } else {
    for (let i = 0; i < period; i++) seasonal.push(0)
  }

  // Initialisation level et trend
  let level = demand[0]
  let trend = n > 1 ? (demand[1] - demand[0]) : 0

  // Fitting
  const fitted: number[] = []
  for (let t = 0; t < n; t++) {
    const s = seasonal[t % period]
    const prevLevel = level
    level = alpha * (demand[t] - s) + (1 - alpha) * (level + trend)
    trend = beta * (level - prevLevel) + (1 - beta) * trend
    seasonal[t % period] =
      gamma * (demand[t] - level) + (1 - gamma) * s
    fitted.push(prevLevel + trend + s)
  }

  // Forecast
  const forecast: number[] = []
  for (let h = 1; h <= horizon; h++) {
    forecast.push(level + h * trend + seasonal[(n + h - 1) % period])
  }

  return Response.json({
    forecast,
    fitted,
    model: "holt-winters-additive",
    source: "statistical-fallback",
    note: "Chronos-2 indisponible, fallback Holt-Winters",
  })
}

/**
 * Extraire le forecast du format de reponse HuggingFace
 */
function extractForecast(result: unknown, horizon: number): number[] {
  // Format 1 : { predictions: [[...]] }
  if (
    typeof result === "object" &&
    result !== null &&
    "predictions" in result
  ) {
    const preds = (result as { predictions: number[][] }).predictions
    if (Array.isArray(preds) && preds.length > 0) {
      return preds[0].slice(0, horizon)
    }
  }

  // Format 2 : { mean: [...] }
  if (typeof result === "object" && result !== null && "mean" in result) {
    return ((result as { mean: number[] }).mean).slice(0, horizon)
  }

  // Format 3 : tableau direct
  if (Array.isArray(result)) {
    if (Array.isArray(result[0])) {
      return result[0].slice(0, horizon)
    }
    return result.slice(0, horizon)
  }

  // Format inconnu → fallback
  return []
}
