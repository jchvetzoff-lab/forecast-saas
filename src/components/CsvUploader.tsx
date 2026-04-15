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
        try {
          const text = event.target?.result as string
          if (!text) { alert("Fichier vide"); return }

          // Gerer \r\n et \r en plus de \n
          const lines = text.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")
          const sep = lines[0].includes(";") ? ";" : ","
          const header = lines[0].split(sep).map((s) => s.trim())

          console.log("[CSV] Lignes:", lines.length, "Colonnes:", header.length, "Header[2]:", header[2]?.substring(0, 20))

          // Detecter le format pivot M5 : beaucoup de colonnes + dates dans le header
          const isPivot = header.length > 10 && /^\d{4}-/.test(header[2] || "")

          if (isPivot) {
            console.log("[CSV] Format pivot M5 detecte")
            const firstRow = lines[1]?.split(sep).map((s) => s.trim())
            if (!firstRow || firstRow.length < 3) { alert("Pas de donnees dans la deuxieme ligne"); return }

            const dates = header.slice(2)
            const values = firstRow.slice(2).map((v) => parseFloat(v))

            // Agreger par mois
            const monthly: Record<string, number> = {}
            dates.forEach((dateStr, i) => {
              const month = dateStr.substring(0, 7)
              if (!monthly[month]) monthly[month] = 0
              monthly[month] += isNaN(values[i]) ? 0 : values[i]
            })

            const sortedMonths = Object.keys(monthly).sort()
            console.log("[CSV] Mois:", sortedMonths.length, "Premier:", sortedMonths[0], "Dernier:", sortedMonths[sortedMonths.length - 1])

            if (sortedMonths.length >= 6) {
              onData({
                labels: sortedMonths,
                demand: sortedMonths.map((m) => monthly[m]),
              })
            } else {
              alert(`Format M5 detecte : ${sortedMonths.length} mois. Il en faut au moins 6.`)
            }
          } else {
            console.log("[CSV] Format vertical detecte")
            const labels: string[] = []
            const demand: number[] = []

            for (let i = 1; i < lines.length; i++) {
              const parts = lines[i].split(sep).map((s) => s.trim())
              if (parts.length >= 2) {
                const val = parseFloat(parts[1].replace(",", "."))
                if (!isNaN(val)) {
                  labels.push(parts[0])
                  demand.push(val)
                }
              }
            }

            console.log("[CSV] Periodes trouvees:", demand.length)

            if (demand.length >= 6) {
              onData({ labels, demand })
            } else {
              alert(
                `Seulement ${demand.length} periodes trouvees (minimum 6).\n\nFormats acceptes :\n1. date,demand (vertical)\n2. M5 Walmart (pivot, auto-detecte)`
              )
            }
          }
        } catch (err) {
          console.error("[CSV] Erreur parsing:", err)
          alert("Erreur lors du parsing du CSV. Verifiez le format.")
        }
      }
      reader.onerror = () => alert("Erreur lecture du fichier")
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
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-content text-[#2563EB] text-xl">
          +
        </div>
        <div>
          <p className="text-sm font-medium">Uploader un CSV</p>
          <p className="text-xs text-[#8E8EA0] mt-1">
            Format vertical (date,demand) ou M5 Walmart (pivot)
          </p>
        </div>
      </label>
    </div>
  )
}
