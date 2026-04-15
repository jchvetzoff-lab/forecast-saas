export interface GdeltEvent {
  title: string
  url: string
  source: string
  date: string
  tone: number
  category: 'critical' | 'warning' | 'info'
}

export interface ForecastPoint {
  month: string
  mlClassic: number
  omnicast: number
  real: number | null
  upperBound: number
  lowerBound: number
}

export interface KpiData {
  label: string
  value: string
  delta: string
  deltaType: 'up' | 'down' | 'neutral'
  color: string
}

export interface AgentSimulation {
  name: string
  count: number
  sentiment: number
  description: string
  color: string
}

export interface RiskScore {
  value: number
  label: string
  level: 'low' | 'medium' | 'high' | 'critical'
}
