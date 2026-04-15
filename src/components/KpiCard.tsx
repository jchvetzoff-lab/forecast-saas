"use client"

interface KpiCardProps {
  value: string
  label: string
  delta: string
  deltaType: "up" | "down" | "neutral"
  color: string
}

const DELTA_COLORS: Record<KpiCardProps["deltaType"], string> = {
  up: "#059669",
  down: "#DC2626",
  neutral: "#8E8EA0",
}

const DELTA_ARROWS: Record<KpiCardProps["deltaType"], string> = {
  up: "\u2191",
  down: "\u2193",
  neutral: "\u2192",
}

export default function KpiCard({ value, label, delta, deltaType, color }: KpiCardProps) {
  return (
    <div
      className="rounded-2xl border p-6 bg-white"
      style={{
        borderColor: "#E5E5E5",
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      {/* Indicateur couleur */}
      <div
        className="w-2 h-2 rounded-full mb-4"
        style={{ backgroundColor: color }}
      />

      {/* Valeur */}
      <div
        className="mb-1"
        style={{
          fontSize: "2rem",
          fontWeight: 200,
          lineHeight: 1.1,
          color: "#1A1A2E",
          letterSpacing: "-0.02em",
        }}
      >
        {value.split(/(\d+[.,]?\d*%?)/).map((part, i) => {
          if (/\d/.test(part)) {
            return (
              <span key={i} style={{ fontWeight: 700 }}>
                {part}
              </span>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </div>

      {/* Label */}
      <div
        className="mb-3"
        style={{
          fontSize: ".65rem",
          fontWeight: 250,
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "#8E8EA0",
        }}
      >
        {label}
      </div>

      {/* Delta */}
      <div
        className="flex items-center gap-1"
        style={{
          fontSize: ".75rem",
          fontWeight: 500,
          color: DELTA_COLORS[deltaType],
        }}
      >
        <span>{DELTA_ARROWS[deltaType]}</span>
        <span>{delta}</span>
      </div>
    </div>
  )
}
