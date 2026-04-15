"use client"

import type { ForecastMetrics } from "@/lib/metrics"
import type { MethodName } from "@/lib/forecasting"

interface MethodMetrics {
  name: MethodName
  color: string
  metrics: ForecastMetrics
  shockMetrics?: ForecastMetrics
}

export default function MetricsTable({
  results,
  showShock = false,
}: {
  results: MethodMetrics[]
  showShock?: boolean
}) {
  // Trouver le meilleur MAPE
  const bestMape = Math.min(...results.map((r) => r.metrics.mape))
  const bestShockMape = showShock
    ? Math.min(...results.filter((r) => r.shockMetrics).map((r) => r.shockMetrics!.mape))
    : 0

  return (
    <div className="space-y-8">
      {/* Tableau principal */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-medium">Metriques sur toute la periode</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[1.5px] text-[#8E8EA0] font-medium">
                  Methode
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[1.5px] text-[#8E8EA0] font-medium">
                  Bias
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[1.5px] text-[#8E8EA0] font-medium">
                  Bias%
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[1.5px] text-[#8E8EA0] font-medium">
                  MAE
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[1.5px] text-[#8E8EA0] font-medium">
                  MAPE
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[1.5px] text-[#8E8EA0] font-medium">
                  RMSE
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const isBest = r.metrics.mape === bestMape
                return (
                  <tr
                    key={r.name}
                    className={`border-b border-[#E5E7EB] last:border-0 transition-colors ${
                      isBest ? "bg-[#ECFDF5]" : "hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <td className="px-6 py-3 font-medium flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: r.color }}
                      />
                      {r.name}
                      {isBest && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#059669] text-white font-medium">
                          MEILLEUR
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {r.metrics.bias > 0 ? "+" : ""}
                      {r.metrics.bias.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {r.metrics.biasPercent > 0 ? "+" : ""}
                      {r.metrics.biasPercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {r.metrics.mae.toFixed(1)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono text-xs font-semibold ${
                        isBest ? "text-[#059669]" : ""
                      }`}
                    >
                      {r.metrics.mape.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {r.metrics.rmse.toFixed(1)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tableau pendant le choc */}
      {showShock && (
        <div className="bg-white border border-[#FCA5A5] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#FCA5A5] bg-[#FEF2F2]">
            <h3 className="text-sm font-medium text-[#DC2626]">
              Metriques PENDANT la crise supply chain
            </h3>
            <p className="text-xs text-[#DC2626]/60 mt-0.5">
              C&apos;est ici que la difference se fait
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[1.5px] text-[#8E8EA0] font-medium">
                    Methode
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[1.5px] text-[#8E8EA0] font-medium">
                    MAE
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[1.5px] text-[#8E8EA0] font-medium">
                    MAPE
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[1.5px] text-[#8E8EA0] font-medium">
                    RMSE
                  </th>
                </tr>
              </thead>
              <tbody>
                {results
                  .filter((r) => r.shockMetrics)
                  .map((r) => {
                    const isBest = r.shockMetrics!.mape === bestShockMape
                    return (
                      <tr
                        key={r.name}
                        className={`border-b border-[#E5E7EB] last:border-0 ${
                          isBest ? "bg-[#ECFDF5]" : ""
                        }`}
                      >
                        <td className="px-6 py-3 font-medium flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: r.color }}
                          />
                          {r.name}
                          {isBest && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#059669] text-white font-medium">
                              MEILLEUR
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {r.shockMetrics!.mae.toFixed(1)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono text-xs font-semibold ${
                            isBest ? "text-[#059669]" : ""
                          }`}
                        >
                          {r.shockMetrics!.mape.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {r.shockMetrics!.rmse.toFixed(1)}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
