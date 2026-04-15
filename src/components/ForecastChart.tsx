"use client"

import { useMemo } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"
import type { ChartOptions } from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

ChartJS.defaults.color = "#8E8EA0"
ChartJS.defaults.borderColor = "#E5E7EB"
ChartJS.defaults.font.weight = 300

const MOIS = [
  "Mai", "Juin", "Juil", "Aout", "Sep", "Oct",
  "Nov", "Dec", "Jan", "Fev", "Mar", "Avr",
]

const revenueReel = [15.1, 15.5, 15.1, 14.0, 13.5, 14.3, 15.6, 16.2, 16.8, 17.4, null, null]
const mlClassique = [15.2, 15.8, 16.1, 16.4, 16.2, 15.9, 16.5, 17.0, 17.3, 17.8, 18.1, 18.5]
const omnicast = [15.2, 15.6, 15.3, 14.2, 13.8, 14.5, 15.8, 16.4, 17.0, 17.6, 18.0, 18.4]

const omnicastUpper = omnicast.map((v) => +(v * 1.08).toFixed(2))
const omnicastLower = omnicast.map((v) => +(v * 0.92).toFixed(2))

export function ForecastChart() {
  const data = useMemo(
    () => ({
      labels: MOIS,
      datasets: [
        {
          label: "Bande haute",
          data: omnicastUpper,
          borderColor: "transparent",
          backgroundColor: "rgba(37,99,235,.06)",
          fill: "+1",
          pointRadius: 0,
          borderWidth: 0,
        },
        {
          label: "Bande basse",
          data: omnicastLower,
          borderColor: "transparent",
          backgroundColor: "rgba(37,99,235,.06)",
          fill: false,
          pointRadius: 0,
          borderWidth: 0,
        },
        {
          label: "Revenue reel",
          data: revenueReel,
          borderColor: "#1a1a2e",
          backgroundColor: "#1a1a2e",
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: false,
          spanGaps: false,
        },
        {
          label: "ML classique",
          data: mlClassique,
          borderColor: "#DC2626",
          backgroundColor: "#DC2626",
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
          fill: false,
        },
        {
          label: "OmniCast",
          data: omnicast,
          borderColor: "#2563EB",
          backgroundColor: "rgba(37,99,235,.04)",
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    []
  )

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 24,
            font: { size: 12, weight: 300 },
            filter: (item) =>
              item.text !== "Bande haute" && item.text !== "Bande basse",
          },
        },
        tooltip: {
          backgroundColor: "#1a1a2e",
          titleFont: { size: 12, weight: 400 },
          bodyFont: { size: 12, weight: 300 },
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} M\u20AC`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: 300 } },
        },
        y: {
          min: 12,
          max: 20,
          title: {
            display: true,
            text: "Revenue (M\u20AC)",
            font: { size: 12, weight: 300 },
            color: "#8E8EA0",
          },
          grid: { color: "#F0F0F2" },
          ticks: {
            font: { size: 12, weight: 300 },
            callback: (value) => `${value}`,
          },
        },
      },
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
    }),
    []
  )

  return (
    <div className="w-full" style={{ height: 420 }}>
      <Line data={data} options={options} />
    </div>
  )
}
