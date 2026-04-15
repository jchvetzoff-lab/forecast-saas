"use client"

import { useCallback } from "react"

interface CsvData {
  labels: string[]
  demand: number[]
}

export default function CsvUploader({
  onData,
}: {
  onData: (data: CsvData) => void
}) {
  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const lines = text.trim().split("\n")
        const sep = lines[0].includes(";") ? ";" : ","
        const header = lines[0].split(sep).map((s) => s.trim())

        // Detecter le format : vertical (date,demand) ou pivot M5 (item_id,dept_id,date1,date2,...)
        const isPivot = header.length > 10 && header[2]?.match(/^\d{4}-/)

        if (isPivot) {
          // Format M5 pivot : prendre la premiere ligne de donnees
          const firstRow = lines[1].split(sep).map((s) => s.trim())
          const dates = header.slice(2)
          const values = firstRow.slice(2).map((v) => parseFloat(v))

          // Agreger par mois
          const monthly: Record<string, number> = {}
          dates.forEach((dateStr, i) => {
            const month = dateStr.substring(0, 7) // "2011-01"
            if (!monthly[month]) monthly[month] = 0
            monthly[month] += isNaN(values[i]) ? 0 : values[i]
          })

          const sortedMonths = Object.keys(monthly).sort()
          const labels = sortedMonths
          const demand = sortedMonths.map((m) => monthly[m])

          if (demand.length >= 6) {
            onData({ labels, demand })
          } else {
            alert(`Format M5 detecte mais seulement ${demand.length} mois. Il en faut au moins 6.`)
          }
        } else {
          // Format vertical : date,demand
          const labels: string[] = []
          const demand: number[] = []

          for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(sep).map((s) => s.trim())
            if (parts.length >= 2) {
              labels.push(parts[0])
              const val = parseFloat(parts[1].replace(",", "."))
              if (!isNaN(val)) demand.push(val)
              else labels.pop()
            }
          }

          if (demand.length >= 6) {
            onData({ labels, demand })
          } else {
            alert(
              "Le CSV doit contenir au moins 6 periodes.\n\nFormats acceptes :\n1. date,demand (vertical)\n2. M5 Walmart (pivot, auto-detecte)"
            )
          }
        }
      }
      reader.readAsText(file)
    },
    [onData]
  )

  return (
    <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 text-center hover:border-[#2563EB]/30 transition-colors">
      <input
        type="file"
        accept=".csv,.tsv,.txt"
        onChange={handleFile}
        className="hidden"
        id="csv-upload"
      />
      <label
        htmlFor="csv-upload"
        className="cursor-pointer flex flex-col items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] text-xl">
          +
        </div>
        <div>
          <p className="text-sm font-medium">Uploader un CSV</p>
          <p className="text-xs text-[#8E8EA0] mt-1">
            Format vertical (date,demand) ou M5 Walmart (pivot, auto-detecte)
          </p>
        </div>
      </label>
    </div>
  )
}
