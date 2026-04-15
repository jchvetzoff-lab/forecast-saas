/**
 * Methodes de forecasting statistique
 * Formules identiques au cours SupChains
 */

/** Naive : f(t+1) = d(t) */
export function naive(demand: number[]): number[] {
  const forecast: number[] = [demand[0]]
  for (let t = 1; t < demand.length; t++) {
    forecast.push(demand[t - 1])
  }
  return forecast
}

/** Moving Average : f(t+1) = moyenne des k derniers */
export function movingAverage(demand: number[], k = 6): number[] {
  const forecast: number[] = []
  for (let t = 0; t < demand.length; t++) {
    if (t < k) {
      // Pas assez de donnees, on utilise la moyenne disponible
      const slice = demand.slice(0, t || 1)
      forecast.push(slice.reduce((a, b) => a + b, 0) / slice.length)
    } else {
      const slice = demand.slice(t - k, t)
      forecast.push(slice.reduce((a, b) => a + b, 0) / k)
    }
  }
  return forecast
}

/** Simple Exponential Smoothing : f(t) = alpha * d(t-1) + (1-alpha) * f(t-1) */
export function ses(demand: number[], alpha = 0.2): number[] {
  const forecast: number[] = [demand[0]]
  for (let t = 1; t < demand.length; t++) {
    forecast.push(alpha * demand[t - 1] + (1 - alpha) * forecast[t - 1])
  }
  return forecast
}

/** Double Exponential Smoothing (Holt) */
export function des(
  demand: number[],
  alpha = 0.3,
  beta = 0.1
): number[] {
  const n = demand.length
  const level: number[] = [demand[0]]
  const trend: number[] = [demand.length > 1 ? demand[1] - demand[0] : 0]
  const forecast: number[] = [demand[0]]

  for (let t = 1; t < n; t++) {
    const newLevel = alpha * demand[t] + (1 - alpha) * (level[t - 1] + trend[t - 1])
    const newTrend = beta * (newLevel - level[t - 1]) + (1 - beta) * trend[t - 1]
    level.push(newLevel)
    trend.push(newTrend)
    forecast.push(level[t - 1] + trend[t - 1])
  }
  return forecast
}

/**
 * OmniCast — simulation d'un modele avance
 * Combine DES + detection de choc + ajustement proactif
 * En production, ce serait Chronos-2 via HuggingFace
 */
export function omnicast(demand: number[]): number[] {
  const n = demand.length
  const desForecast = des(demand, 0.35, 0.15)
  const forecast: number[] = [...desForecast]

  for (let t = 6; t < n; t++) {
    // Detection de choc : variation > 15% par rapport a la moyenne recente
    const recentAvg = demand.slice(t - 6, t).reduce((a, b) => a + b, 0) / 6
    const variation = (demand[t] - recentAvg) / recentAvg

    if (Math.abs(variation) > 0.15) {
      // Ajustement proactif : on reagit plus vite que DES
      // Simule la detection anticipee via signaux externes (GDELT, etc.)
      const adjustment = variation * 0.6
      forecast[t] = desForecast[t] * (1 + adjustment * 0.3)

      // Correction anticipee sur les periodes suivantes
      if (t + 1 < n) {
        forecast[t + 1] = desForecast[t + 1] * (1 + adjustment * 0.15)
      }
    }
  }

  return forecast
}

export type MethodName = "Naive" | "MA(6)" | "SES (α=0.2)" | "DES (α=0.3)" | "OmniCast"

export interface ForecastResult {
  name: MethodName
  forecast: number[]
  color: string
  borderDash?: number[]
  borderWidth: number
}

export function runAllForecasts(demand: number[]): ForecastResult[] {
  return [
    {
      name: "Naive",
      forecast: naive(demand),
      color: "#DC2626",
      borderDash: [6, 4],
      borderWidth: 1.5,
    },
    {
      name: "MA(6)",
      forecast: movingAverage(demand, 6),
      color: "#D97706",
      borderDash: [4, 3],
      borderWidth: 1.5,
    },
    {
      name: "SES (α=0.2)",
      forecast: ses(demand, 0.2),
      color: "#7C3AED",
      borderWidth: 1.5,
    },
    {
      name: "DES (α=0.3)",
      forecast: des(demand, 0.3, 0.1),
      color: "#2563EB",
      borderWidth: 2,
    },
    {
      name: "OmniCast",
      forecast: omnicast(demand),
      color: "#059669",
      borderWidth: 2.5,
    },
  ]
}
