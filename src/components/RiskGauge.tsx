"use client"

import { useEffect, useState } from "react"

interface RiskGaugeProps {
  value: number
  label: string
}

const SVG_SIZE = 200
const STROKE_WIDTH = 12
const RADIUS = (SVG_SIZE - STROKE_WIDTH) / 2
const CENTER = SVG_SIZE / 2

// Demi-cercle : arc de 180 degres (PI radians)
const ARC_LENGTH = Math.PI * RADIUS

// Convertit un angle (0-180) en coordonnees sur le demi-cercle
function polarToCartesian(angleDeg: number): { x: number; y: number } {
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER - RADIUS * Math.cos(angleRad),
    y: CENTER - RADIUS * Math.sin(angleRad),
  }
}

export default function RiskGauge({ value, label }: RiskGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  // Clamp entre 0 et 100
  const clampedValue = Math.max(0, Math.min(100, value))

  useEffect(() => {
    // Animation progressive de l'aiguille
    const duration = 1200
    const startTime = performance.now()
    const startValue = animatedValue

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Easing ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (clampedValue - startValue) * eased
      setAnimatedValue(current)

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
    // On ne depend que de clampedValue pour relancer l'animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedValue])

  // Position de l'aiguille (0=gauche, 180=droite)
  const needleAngle = (animatedValue / 100) * 180
  const needleTip = polarToCartesian(needleAngle)

  // Arc path du demi-cercle (de gauche a droite, en haut)
  const arcPath = [
    `M ${CENTER - RADIUS} ${CENTER}`,
    `A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER + RADIUS} ${CENTER}`,
  ].join(" ")

  // Couleur de la valeur selon le niveau de risque
  function getValueColor(v: number): string {
    if (v <= 33) return "#059669"
    if (v <= 66) return "#F59E0B"
    return "#DC2626"
  }

  const gradientId = `gauge-gradient-${label.replace(/\s+/g, "-")}`

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: SVG_SIZE, height: CENTER + 16 }}>
        <svg
          width={SVG_SIZE}
          height={CENTER + 16}
          viewBox={`0 0 ${SVG_SIZE} ${CENTER + 16}`}
          fill="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>

          {/* Fond gris de l'arc */}
          <path
            d={arcPath}
            stroke="#E5E5E5"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />

          {/* Arc colore avec gradient */}
          <path
            d={arcPath}
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={ARC_LENGTH * (1 - animatedValue / 100)}
            style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
          />

          {/* Aiguille */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="#1A1A2E"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Point central */}
          <circle cx={CENTER} cy={CENTER} r={4} fill="#1A1A2E" />
        </svg>
      </div>

      {/* Valeur numerique */}
      <div
        style={{
          fontSize: "3rem",
          fontWeight: 200,
          lineHeight: 1,
          color: getValueColor(clampedValue),
          letterSpacing: "-0.02em",
          marginTop: "-8px",
        }}
      >
        {Math.round(animatedValue)}
      </div>

      {/* Label */}
      <div
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
    </div>
  )
}
