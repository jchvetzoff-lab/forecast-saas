"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import type { ForecastResult } from "@/lib/forecasting"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function BenchmarkChart({
  labels,
  demand,
  forecasts,
  shockStart,
  shockEnd,
}: {
  labels: string[]
  demand: number[]
  forecasts: ForecastResult[]
  shockStart?: number
  shockEnd?: number
}) {
  // Zone de choc en arriere-plan
  const shockPlugin = {
    id: "shockZone",
    beforeDraw(chart: ChartJS) {
      if (shockStart === undefined || shockEnd === undefined) return
      const { ctx } = chart
      const xAxis = chart.scales.x
      const yAxis = chart.scales.y
      const startX = xAxis.getPixelForValue(shockStart)
      const endX = xAxis.getPixelForValue(shockEnd)
      ctx.save()
      ctx.fillStyle = "rgba(220, 38, 38, 0.06)"
      ctx.fillRect(startX, yAxis.top, endX - startX, yAxis.bottom - yAxis.top)
      // Ligne verticale debut du choc
      ctx.strokeStyle = "rgba(220, 38, 38, 0.3)"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(startX, yAxis.top)
      ctx.lineTo(startX, yAxis.bottom)
      ctx.stroke()
      ctx.restore()
    },
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Demande reelle",
        data: demand,
        borderColor: "#1a1a2e",
        backgroundColor: "rgba(26,26,46,.05)",
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: "#1a1a2e",
        tension: 0.2,
        order: 0,
      },
      ...forecasts.map((f, i) => ({
        label: f.name,
        data: f.forecast,
        borderColor: f.color,
        borderWidth: f.borderWidth,
        borderDash: f.borderDash || [],
        pointRadius: 1.5,
        pointBackgroundColor: f.color,
        tension: 0.2,
        order: i + 1,
      })),
    ],
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium">
            Comparaison des methodes de forecasting
          </h3>
          <p className="text-xs text-[#8E8EA0] mt-0.5">
            Demande reelle vs 5 methodes — {labels.length} periodes
          </p>
        </div>
        {shockStart !== undefined && (
          <span className="text-[10px] px-3 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] font-medium">
            Zone rouge = periode de crise
          </span>
        )}
      </div>
      <Line
        data={data}
        plugins={[shockPlugin]}
        options={{
          responsive: true,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              position: "top",
              labels: {
                usePointStyle: true,
                padding: 16,
                font: { size: 11, weight: "300" },
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(0)} unites`,
              },
            },
          },
          scales: {
            y: {
              title: {
                display: true,
                text: "Demande (unites)",
                font: { weight: "300" },
              },
              grid: { color: "#F0F0F2" },
            },
            x: { grid: { display: false } },
          },
        }}
      />
    </div>
  )
}
