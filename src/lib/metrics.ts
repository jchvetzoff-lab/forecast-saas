/**
 * Metriques de forecasting — identiques au cours SupChains
 * Error: e(t) = f(t) - d(t)
 */

export interface ForecastMetrics {
  bias: number
  biasPercent: number
  mae: number
  mape: number
  rmse: number
}

export function computeMetrics(
  demand: number[],
  forecast: number[],
  startIndex = 1 // On ignore la premiere periode (pas de forecast)
): ForecastMetrics {
  const errors: number[] = []
  const absErrors: number[] = []
  const percentErrors: number[] = []
  const squaredErrors: number[] = []
  let sumDemand = 0

  for (let t = startIndex; t < demand.length; t++) {
    if (demand[t] === 0) continue // Eviter division par zero
    const error = forecast[t] - demand[t]
    errors.push(error)
    absErrors.push(Math.abs(error))
    percentErrors.push(Math.abs(error) / demand[t])
    squaredErrors.push(error * error)
    sumDemand += demand[t]
  }

  const n = errors.length
  if (n === 0) return { bias: 0, biasPercent: 0, mae: 0, mape: 0, rmse: 0 }

  const sumErrors = errors.reduce((a, b) => a + b, 0)

  return {
    bias: sumErrors / n,
    biasPercent: (sumErrors / sumDemand) * 100,
    mae: absErrors.reduce((a, b) => a + b, 0) / n,
    mape: (percentErrors.reduce((a, b) => a + b, 0) / n) * 100,
    rmse: Math.sqrt(squaredErrors.reduce((a, b) => a + b, 0) / n),
  }
}

/**
 * Calcule les metriques sur une sous-periode (ex: pendant un choc)
 */
export function computeMetricsForRange(
  demand: number[],
  forecast: number[],
  from: number,
  to: number
): ForecastMetrics {
  const subDemand = demand.slice(from, to)
  const subForecast = forecast.slice(from, to)
  return computeMetrics(subDemand, subForecast, 0)
}
